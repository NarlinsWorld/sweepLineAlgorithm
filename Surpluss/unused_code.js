//===============================================================================
// this function is invoked by a button press
function processEvent_old(event) {
    if (event == null) return;
    console.log('-------', event.toString()); //for debug only method is in SweepEvent

    if (event.type == "intersection") {

        let orderedSegments = sweepTree.getSegmentsInOrder(); //get complete BST ordering
        console.log("orderedSegments:", orderedSegments.map(s => `S${s.id}`));
        let iarr = event.segments;                          //select the segments intersection
        console.log('iarr before', iarr)
        iarr = reorderIarr(iarr, orderedSegments); //Put those segments into their current BST ordering
        //console.log('orderedSegments', orderedSegments);
        console.log('iarr after', iarr);

        //now reverse the order of objects in iarr
        const iarrBackwards = [...iarr].reverse();

        
    }

    let candidates = sendBackCandidates(event);
    sweepTree.printInOrder(sweepTree.root);
    for (let candy of candidates) {
        //console.log(`candidates:[S${candy[0].id}, S${candy[1].id}]`);
        //do these two segments intersect?
        p1x = candy[0].p1.x;
        p1y = candy[0].p1.y;
        p2x = candy[0].p2.x;
        p2y = candy[0].p2.y;
        p3x = candy[1].p1.x;
        p3y = candy[1].p1.y;
        p4x = candy[1].p2.x;
        p4y = candy[1].p2.y;
        intersectsTF = hasIntersect(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
        //console.log('intersects = ', intersectsTF);
        if (intersectsTF) {
            let [x, y] = intersectionPoint(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
            //console.log(`intersection= (${x}, ${y})`);

            let intersection = new Intersection(candy[0], candy[1], x, y);
            console.log(intersection.toString()); //in class Intersectin
            appendHTML("Div1", intersection.toString());
            intersections.push(intersection);
        }
    }

}

/*
One additional point: when we eventually process intersection events, 
this function will need additional logic because those events 
contain two or more segments. But for the endpoint events this is correct.
*/
// Return candidate segments.
function sendBackCandidates(event) {
    let p, s, candidates = [];
    let segment = event.segments[0];

    if (event.type == "insert") {
        sweepTree.insert(segment);
        p = sweepTree.predecessor(segment);
        s = sweepTree.successor(segment);

        if (p != null) candidates.push([p.segment, segment]);
        if (s != null) candidates.push([segment, s.segment]);
    }

    if (event.type == "delete") {
        p = sweepTree.predecessor(segment);
        s = sweepTree.successor(segment);
        sweepTree.delete(segment);

        if ((p != null) && (s != null))
            candidates.push([p.segment, s.segment]);
    }

    return candidates;
}


function getBlockNeighbors(L, arr) {
        // Find the start of the contiguous block
        let start = -1;
        for (let i = 0; i <= L.length - arr.length; i++) {
            if (arr.every((v, j) => L[i + j] === v)) { start = i; break; }
        }

        if (start === -1) return { leftPair: null, rightPair: null };

        const end = start + arr.length - 1;

        const leftPair = start > 0 ? [L[start - 1], L[start]] : null;
        const rightPair = end < L.length - 1 ? [L[end], L[end + 1]] : null;
        console.log('leftPair=', leftPair);
        console.log('rightPair=', rightPair);
        if (leftPair != null) candidates.push([leftPair[0], leftPair[1]])
        if (rightPair != null) candidates.push([[rightPair[0], rightPair[1]]])
        return;
    }

    function preProcess(segments) {
    let groups = createSegmentsOnLine(segments); //segments on the same line. groups is a Map

    console.log("Number of line equations:", groups.size);

    let overlapGroups = new Map();
    //The square brackets below destructure the map pair, 
    //assigning the key to lineKey and the value to segs on each iteration.
    for (const [lineKey, segs] of groups) {
        console.log("Examining:", lineKey);

        let hasOverlap = false;
        for (let i = 0; i < segs.length; ++i) {
            for (let j = i + 1; j < segs.length; ++j) {
                if (doSegsOverlap(segs[i], segs[j])) {
                    hasOverlap = true;

                    console.log(
                        `S${segs[i].id} overlaps S${segs[j].id}`
                    );
                }
            }
        }
        if (hasOverlap) {
            overlapGroups.set(lineKey, segs);
        }

    }
    // Collect the IDs of segments belonging to overlapping groups.
    const overlappingIds = new Set();

    //The Map.values() method returns a new Iterator object that 
    // contains the values for each element in the Map object in 
    // insertion order. You can use a for...of loop to iterate over 
    // these values.
    for (const segs of overlapGroups.values()) {
        for (const seg of segs) {
            overlappingIds.add(seg.id);
        }
    }

    let ptsInOrder = orderPoints(overlapGroups);
    console.log(`Each array is an overlapGroup's points are arranged in order
        so going from point to point is an interval. 
        There will be one less interval than points`);
    console.log(ptsInOrder);// But an interval might not be connected by a segment!

    //==========
    // Build newSegments=[] for each interval & covered segments only
    // Also build segmentsToErase=[].
    // Next id for new segments: one past the largest existing id.
    // =====================================================================
    // NEW LOGIC: Process by continuous overlapping chains, not whole lines
    // =====================================================================

    let nextSegId = 1000; // Start high so we know they are new
    const newSegments = [];
    const segmentsToErase = [];

    // Iterate through each line
    for (const [lineKey, segs] of overlapGroups) {

        // 1. Find all connected overlapping chains on this line
        const chains = [];
        const visited = new Set();

        for (const seg of segs) {
            if (visited.has(seg.id)) continue;

            // Start a new chain using Breadth-First Search
            const chain = [];
            const queue = [seg];
            visited.add(seg.id);

            while (queue.length > 0) {
                const current = queue.shift();
                chain.push(current);

                // Find all unvisited segments that overlap the current one
                for (const other of segs) {
                    if (!visited.has(other.id) && doSegsOverlap(current, other)) {
                        visited.add(other.id);
                        queue.push(other);
                    }
                }
            }
            chains.push(chain);
        }

        // 2. Process each chain independently
        for (const chain of chains) {

            // Only process chains with 2 or more segments (true overlaps)
            if (chain.length < 2) continue;

            // Put all original segments from this overlapping chain into the erase list
            for (const s of chain) {
                segmentsToErase.push(s);
            }

            // Get the ordered points for JUST this chain.
            // (We wrap it in a temporary Map so we can reuse your existing orderPoints function!)
            const tempMap = new Map();
            tempMap.set(lineKey, chain);
            const pts = orderPoints(tempMap)[0];

            // Walk the intervals and create new segments only where this chain covers them
            for (let i = 0; i < pts.length - 1; ++i) {
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const probe = new Segment(-1, p1, p2);

                const covered = chain.some(s => doSegsOverlap(probe, s));
                if (covered) {
                    newSegments.push(new Segment(nextSegId++, p1, p2));
                }
            }
        }
    }

    // 3. Build the final array
    const eraseIds = new Set(segmentsToErase.map(s => s.id));
    const finalSegments = [
        ...segments.filter(seg => !eraseIds.has(seg.id)),
        ...newSegments
    ];

    console.log("segmentsToErase:", segmentsToErase);
    console.log("newSegments:", newSegments);
    console.log("finalSegments (ready for drawing):", finalSegments);

} //end preProcessing

//Pick a group and then choose the leftmost (x) or highest (y) point.
function orderPoints(groups) {
    const outerArray = [];

    for (const [, segs] of groups) {              // iterate the Map's entries
        // Map coordKey -> point (newcopy); keep the one with lowest id if it matters
        // a brand-new empty Map created for every iteration.
        const byCoord = new Map();    // a temporary Map to remove duplicates. New every time.

        for (const seg of segs) {                   //iterate over segments within the group
            for (const p of [seg.p1, seg.p2]) {       // do for both endpoints
                if (!p) continue;                       // if endpoint should be missing!
                const coordKey = `${p.x},${p.y}`;       //format a key string (might requires type integer)
                const existing = byCoord.get(coordKey);
                if (existing === undefined || p.id < existing.id) { //add new point || Overwrite an existing entry with a lower id
                    // new copy so originals are untouched
                    byCoord.set(coordKey, new Point(p.id, p.x, p.y));
                }
            }
        }

        const points = Array.from(byCoord.values());  //Map -> array

        //sort the points in the inner array
        const isVertical = segs[0].p1.x === segs[0].p2.x;
        points.sort((a, b) => {
            if (isVertical) { return b.y - a.y; } // highest to lowest          
            return a.x - b.x;                   // left to right
        });

        outerArray.push(points);
    }

    return outerArray;
}

 let ptsInOrder = orderPoints(overlapGroups);
    console.log("Points in order across all overlap groups (Debug):");
    console.log(ptsInOrder); 


//  ======================   working before allowing horizontal segments =================================
//each point will become either an insert event or a delete event.
//each segment with 2 points will become 2 events.
// This function only makes segment end points into events.
function makeEvents() {
    let cnt = 0;
    for (let seg of segments) {
        if (seg.p1.x == seg.p2.x) { //meaning the segment is vertical
            events[cnt] = new SweepEvent(seg.p1.y, "insert", [seg], seg.p1.x);
            events[cnt + 1] = new SweepEvent(seg.p2.y, "delete", [seg], seg.p2.x);
        } else {             //meaning the segment is not vertical
            events[cnt] = new SweepEvent(seg.upperPoint().y, "insert", [seg], seg.upperPoint().x);
            events[cnt + 1] = new SweepEvent(seg.lowerPoint().y, "delete", [seg], seg.lowerPoint().x);
        }
        cnt = cnt + 2;
    }

    console.log("INSERT EVENTS:");
    for (const e of events) {
        if (e.type === "insert") {
            console.log(e.segments[0].id, e.y, e.x);
        }
    }
    sortEvents();
    //console.log(events.map((e, i) => `${i}: ${e.toString()}, x=${e.x}`));

}
function donotrun(){
   //Debug code
    const counts = new Map();

    for (const s of segments) {
        counts.set(s.id, (counts.get(s.id) || 0) + 1);
    }

    console.log(
        "Duplicate IDs:",
        [...counts].filter(([id, count]) => count > 1)
    );
    //end Debug code
}