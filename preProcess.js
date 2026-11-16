function preProcess(segments) {
    let groups = createSegmentsOnLine(segments); // segments on the same line. groups is a Map

    debugLogPreProcess("Number of line equations:", groups.size);

    let overlapGroups = new Map();
    for (const [lineKey, segs] of groups) {
        debugLogPreProcess("Examining:", lineKey);

        let hasOverlap = false;
        for (let i = 0; i < segs.length; ++i) {
            for (let j = i + 1; j < segs.length; ++j) {
                if (doSegsOverlap(segs[i], segs[j])) {
                    hasOverlap = true;
                    debugLogPreProcess(`S${segs[i].id} overlaps S${segs[j].id}`);
                }
            }
        }
        if (hasOverlap) {
            overlapGroups.set(lineKey, segs);
        }
    }



    // ===========================
    // Process by continuous overlapping segments using sorting

    let nextSegId = 0; // new segments get 'n' prefix when pushed
    const newSegments = [];
    const segmentsToErase = [];

    // Iterate through each line
    for (const [lineKey, segs] of overlapGroups) {

        // Determine axis for sorting (y for vertical, x for horizontal/diagonal)
        const axis = (segs[0].p1.x === segs[0].p2.x) ? "y" : "x";

        // 1. Sort the segments along the line based on their minimum coordinate
        const sortedSegs = [...segs].sort((a, b) => {
            const minA = Math.min(a.p1[axis], a.p2[axis]);
            const minB = Math.min(b.p1[axis], b.p2[axis]);
            return minA - minB;
        });

        // 2. Group into continuous overlapping chains
        const chains = [];
        let currentChain = [];

        for (const seg of sortedSegs) {
            if (currentChain.length === 0) {
                currentChain.push(seg);
            } else {
                // Check if this segment overlaps ANY segment in the current chain
                // (We check the whole chain to handle segments fully nested inside others)
                const overlapsChain = currentChain.some(c => doSegsOverlap(c, seg));

                if (overlapsChain) {
                    currentChain.push(seg);
                } else {  // Gap found! Close the current chain and start a new one.                   
                    chains.push(currentChain);
                    currentChain = [seg];
                }
            }
        }
        if (currentChain.length > 0) chains.push(currentChain);
        debugLogPreProcess('chains:', chains);

        // 3. Process each chain independently
        for (const chain of chains) {

            if (chain.length < 2) continue;  //a true overlap is 2 or more.

            for (const s of chain) {     // Add originals to erase list
                segmentsToErase.push(s);
            }

            // Find all unique points in this chain (prior code for orderPoints())
            // but now the segments(chain) acutally overlap
            const byCoord = new Map();
            for (const s of chain) {
                for (const p of [s.p1, s.p2]) {
                    const key = `${p.x},${p.y}`;
                    const existing = byCoord.get(key);
                    if (existing === undefined || p.id < existing.id) {
                        byCoord.set(key, new Point(p.id, p.x, p.y));
                    }
                }
            }

            // Sort the points
            const pts = Array.from(byCoord.values());
            pts.sort((a, b) => {
                if (axis === "y") return b.y - a.y; // Highest to lowest
                return a.x - b.x;                   // Left to right
            });

            // Go thru the intervals and create new segments only where the chain covers them
            for (let i = 0; i < pts.length - 1; ++i) {
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const probe = new Segment(-1, p1, p2);

                // The chain logic guarantees this interval is covered.
                // The .some check is just a safety.
                const covered = chain.some(s => doSegsOverlap(probe, s));
                if (covered) {
                    newSegments.push(new Segment('n' + nextSegId++, p1, p2));
                }
            }
        }
    }

    // 3. Build the final array
    const eraseIds = new Set(segmentsToErase.map(s => s.id));
    debugLogPreProcess('eraseIds:', eraseIds);

   const finalSegments = [];
    for (const seg of segments) {
        if (!eraseIds.has(seg.id)) {
            finalSegments.push(seg);
        }
    }

    for (const seg of newSegments) {
        finalSegments.push(seg);
    }

    //renumber all segments.
    for (let i = 0; i < finalSegments.length; i++) {
    finalSegments[i].id = i;
}
    

    debugLogPreProcess("segmentsToErase:", segmentsToErase);
    debugLogPreProcess("newSegments:", newSegments);
    debugLogPreProcess("finalSegments (ready for drawing):", finalSegments);

    return finalSegments;
}  //end preProcess(segments);


//This makes a Map with a key that is the equation of a line
// The new Map is named 'groups'.  It is a Map of the segements that 
// lie on some straight line.  The value is an array of segment objects that lie on the line.
function createSegmentsOnLine(segments) {
    const groups = new Map();
    for (const segment of segments) {

        const kee = makeSegmentKey(segment);
        //PreProcess(kee);
        if (!groups.has(kee)) {
            groups.set(kee, []);
        }
        groups.get(kee).push(segment);
    }
    return groups;
}

function makeSegmentKey(segment) {  //key will be algebraic line equation
    let A = segment.p2.y - segment.p1.y;
    let B = segment.p1.x - segment.p2.x;
    let C = A * segment.p1.x + B * segment.p1.y;
    if (A < 0) {
        A = -A;
        B = -B;
        C = -C;
    } else {
        if (A == 0 && B < 0) {
            B = -B;
            C = -C;
        }
    }
    let GCD = gcd(A, gcd(B, C))
    let A1 = A / GCD;
    let B1 = B / GCD;
    let C1 = C / GCD;
    return `${A1}x + ${B1}y=${C1}`;
}


//Return true if the segments are colinear, false otherwise
function areColinear(seg1, seg2) {
    const u = seg1.directionVector;
    const v = seg2.directionVector;
    const cross1 = u[0] * v[1] - u[1] * v[0];

    const A = seg1.p1;
    const B = seg1.p2;
    const C = seg2.p1;
    const cross2 =
        (B.x - A.x) * (C.y - A.y) -
        (B.y - A.y) * (C.x - A.x);
    return cross1 === 0 && cross2 === 0;
}


//Return true if the segments are colinear and overlap, false otherwise
function doSegsOverlap(seg1, seg2) {
    // The segments must lie on the same line.
    if (!areColinear(seg1, seg2)) {
        return false;
    }
    // Use y-coordinates for vertical segments;
    // otherwise, use x-coordinates.
    const axis = (seg1.p1.x === seg1.p2.x) ? "y" : "x";
    // Find the interval covered by each segment.
    const a = [
        Math.min(seg1.p1[axis], seg1.p2[axis]),
        Math.max(seg1.p1[axis], seg1.p2[axis])
    ];
    const b = [
        Math.min(seg2.p1[axis], seg2.p2[axis]),
        Math.max(seg2.p1[axis], seg2.p2[axis])
    ];
    // The intervals overlap if their intersection is nonempty.
    return Math.max(a[0], b[0]) < Math.min(a[1], b[1]);
}
