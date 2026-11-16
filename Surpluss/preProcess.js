/* Look at the segments to see if there are any colinear overlaps.
If such exists, then break them into distinct segments whereever points
exist on the line.
*/

function preProcessSegments(segments) {
    // Group segments by their direction vector (normalized for comparison)
    const groups = new Map();
    
    for (const segment of segments) {
        // Create a normalized direction key (to handle collinearity)
        // We need to check if segments are on the same infinite line
        const key = getSegmentKey(segment);
        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(segment);
    }
    
    const result = [];
    
    for (const [key, groupSegments] of groups) {
        if (groupSegments.length === 1) {
            result.push(groupSegments[0]);
            continue;
        }
        
        // For each group of collinear segments, process them together
        const processed = processCollinearGroup(groupSegments);
        result.push(...processed);
    }
    
     // Renumber all segment IDs sequentially starting at 0
    for (let i = 0; i < result.length; i++) {
        result[i].id = i;
    }
    return result;
}

function getSegmentKey(segment) {
    let dx = segment.directionVector[0];
    let dy = segment.directionVector[1];
    
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return `point:${segment.p1.x},${segment.p1.y}`;
    
    dx /= len;
    dy /= len;
    
    if (dx < 0 || (dx === 0 && dy < 0)) {
        dx = -dx;
        dy = -dy;
    }
    
    dx = Math.round(dx * 1e10) / 1e10;
    dy = Math.round(dy * 1e10) / 1e10;
    
    // Use the normalized direction for the line constant
    const constant = dy * segment.p1.x - dx * segment.p1.y;  // <== my original
    
    return `dir:${dx},${dy}|const:${Math.round(constant * 1e6) / 1e6}`;
}

function getSegmentKey(segment) {
    let dx = segment.directionVector[0];
    let dy = segment.directionVector[1];

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) {
        return `point:${segment.p1.x},${segment.p1.y}`;
    }
    dx = dx/len;
    dy = dy/len;
    if (dx < 0 || (dx === 0 && dy < 0)) {
        dx = -dx;
        dy = -dy;
    }

    dx = Math.round(dx * 1e10) / 1e10;
    dy = Math.round(dy * 1e10) / 1e10;

    const constant = dx * segment.p1.y - dy * segment.p1.x;  //<== GPT says this!

    return `dir:${dx},${dy}|const:${Math.round(constant * 1e6) / 1e6}`;
}



function snapValue(v) {
    if (!isFinite(v)) return v;
    const tol = epsilon * Math.max(1, Math.abs(v));
    const rounded = Math.round(v);
    if (Math.abs(v - rounded) < tol) return rounded;
    const precision = Math.max(0, Math.floor(-Math.log10(epsilon)));
    const factor = Math.pow(10, precision);
    return Math.round(v * factor) / factor;
}

function processCollinearGroup(segments) {
    let dx = segments[0].directionVector[0];
    let dy = segments[0].directionVector[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    
    const project = (point) => point.x * dx + point.y * dy;
    
    const projections = new Set();
    for (const seg of segments) {
        projections.add(project(seg.p1));
        projections.add(project(seg.p2));
    }
    
    const sortedProjections = Array.from(projections).sort((a, b) => a - b);
    
    const result = [];
    let idCounter = 0;
    
    for (let i = 0; i < sortedProjections.length - 1; i++) {
        const t1 = sortedProjections[i];
        const t2 = sortedProjections[i + 1];
        
        if (t2 - t1 < epsilon) continue;
        
        const midT = (t1 + t2) / 2;
        
        let covered = false;
        for (const seg of segments) {
            const segT1 = project(seg.p1);
            const segT2 = project(seg.p2);
            const segMin = Math.min(segT1, segT2);
            const segMax = Math.max(segT1, segT2);
            if (midT > segMin - epsilon && midT < segMax + epsilon) {
                covered = true;
                break;
            }
        }
        
        if (covered) {
            const refSeg = segments[0];
            const refT = project(refSeg.p1);
            const refPoint = refSeg.p1;
            
            const newP1 = new Point(
                `new_${idCounter}_p1`,
                snapValue(refPoint.x + (t1 - refT) * dx),
                snapValue(refPoint.y + (t1 - refT) * dy)
            );
            const newP2 = new Point(
                `new_${idCounter}_p2`,
                snapValue(refPoint.x + (t2 - refT) * dx),
                snapValue(refPoint.y + (t2 - refT) * dy)
            );
            
            let templateSeg = null;
            for (const seg of segments) {
                const segT1 = project(seg.p1);
                const segT2 = project(seg.p2);
                const segMin = Math.min(segT1, segT2);
                const segMax = Math.max(segT1, segT2);
                if (midT > segMin - epsilon && midT < segMax + epsilon) {
                    templateSeg = seg;
                    break;
                }
            }
            
            const templateT1 = project(templateSeg.p1);
            const templateT2 = project(templateSeg.p2);
            
            let finalP1, finalP2;
            if (templateT1 <= templateT2) {
                finalP1 = newP1;
                finalP2 = newP2;
            } else {
                finalP1 = newP2;
                finalP2 = newP1;
            }
            
            result.push(new Segment(`new_${idCounter}`, finalP1, finalP2));
            idCounter++;
        }
    }
    
    return result;
}

// Helper function to run and display results for testing
function testPreProcess() {
    // Test Case 1
    const p1 = new Point('a', -150, -100);
    const p2 = new Point('b', 200, 100);
    const seg1 = new Segment('s1', p1, p2);
    
    const p3 = new Point('c', 25, 0);
    const p4 = new Point('d', 200, 100);
    const seg2 = new Segment('s2', p3, p4);
    
    console.log("Test Case 1:");
    console.log("Input:", [[-150,-100,200,100], [25,0,200,100]]);
    const result1 = preProcessSegments([seg1, seg2]);
    console.log("Output:", result1.map(s => [s.p1.x, s.p1.y, s.p2.x, s.p2.y]));
    console.log();
    
    // Test Case 2
    const q1 = new Point('e', -160, -40);
    const q2 = new Point('f', 120, -180);
    const seg3 = new Segment('s3', q1, q2);
    
    const q3 = new Point('g', 0, -120);
    const q4 = new Point('h', 80, -160);
    const seg4 = new Segment('s4', q3, q4);
    
    console.log("Test Case 2:");
    console.log("Input:", [[-160,-40,120,-180], [0,-120,80,-160]]);
    const result2 = preProcessSegments([seg3, seg4]);
    console.log("Output:", result2.map(s => [s.p1.x, s.p1.y, s.p2.x, s.p2.y]));
}

