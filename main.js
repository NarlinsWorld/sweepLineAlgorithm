
let debugPreProcess = false;
let debug = false;  //true to see console output
let intersections = [];
let estimated; //number of estimated intersections
let segments = [];
let scheduledIntersections = new Set();
let sweepTree; // initialize varaible for Binary Search Tree
// let sweepY = parseInt(document.getElementById("sweep").value);
let ym =Number(document.getElementById("segRange").value); //height to start sweepY
let sweepY = ym;
let displaySweepY = sweepY;
let animate = false; //who knows. maybe someday
let events = []; // <= global
let epsilon = 1e-6;  //10 ** (-10);
let recordedIntersectionPairs = new Set();
let shared;
let uniqueIntersections = new Map();
let intersectionCnt = 0;
let segNumber = document.getElementById("segNumber").value;
let processedEvents = new Set();
let processedEventCount = 0;
let eventPause = Number(document.getElementById("pauseTime").value);
//let eventPause = 10; // milliseconds
let sweepSpeed = Number(document.getElementById("sweepSpeed").value);
//let sweepSpeed = 1;       // coordinate units per frame
let animationTarget = null;
let pauseUntil = 0;
let minY = Infinity; //used to compute progress bar
let maxY = -Infinity; //used to compute progress bar
let stdIntersections = new Map;
let maxLen = Number(document.getElementById("maxLen").value);

// Global, starts true, button starts green
var doThis = false;
const btn = document.getElementById('t');
function render() {
    btn.style.background = doThis ? 'green' : 'red';
}
btn.onclick = () => {
    doThis = !doThis;   // toggle the boolean
    render();           // reflect it in the button color
};
//render();  // paint it green on startup


// Global, starts true green. to use if( doRandom) whatever();
var doRandom = true;                 // Change this line to swap the start state
const btn1 = document.getElementById('dataMode');
function render1() {
    btn1.style.background = doRandom ? 'green' : 'red';
    btn1.textContent = doRandom ? 'Random' : 'Fixed';
}
btn1.onclick = () => {
    doRandom = !doRandom;   // toggle the boolean
    render1();           // update color + label
};
render1();  // startup: green, "Random"


//================================================================
function setup() {
    let canvas = createCanvas(400, 400);
    canvas.parent("cvs");
    animate = false;
    noLoop();
    repeatableSetUp(false); //false means get new segments
}

// called by repeatableSetUp() and by runASAPChunk
function resetVariables(reuseSegments) { // <= indirectly fills the Map stdIntersections
    intersections = [];
    if (!reuseSegments) {
        segments = []; // reuseSegments=No means get new segments
    }
    scheduledIntersections = new Set();
    sweepTree = null; // initialize varaible for Binary Search Tree
    // sweepY = parseInt(document.getElementById("sweep").value);
    sweepY = ym;
    displaySweepY = sweepY;
    animate = false; //who knows. maybe someday
    events = []; // <= global
    recordedIntersectionPairs.clear();
    shared = null;
    uniqueIntersections.clear();
    segNumber = document.getElementById("segNumber").value;
    processedEvents = new Set();
    processedEventCount = 0;
    //eventProgress = 0;
    intersectionCnt = 0;
    stdIntersections.clear(); //clears this Map?

    //clear the html Box.
    document.getElementById('Div2').innerHTML = "";
    if (!reuseSegments) {
        if (doRandom) {
            console.log(`Begin Random Segment Generation`)
            createRandomSegments(segNumber, maxLen);
            console.log(`End Random Segment Generation`)
            shared = sharedPoints(segments);
        } else {
            createSegmentsStatic(segmentsArray); //hand crafted testing segments
            shared = sharedPoints(segments);
        }

    } else {
        makeEvents()
        sortEvents();
        shared = sharedPoints(segments);
    }


} //End resetVariables

function repeatableSetUp(reuseSegments) { 
    //console.log(`repeabableSetUp reuseSegments is ${reuseSegments}`);
    //use the standard method to find intersections
    //estimated = countIntersections(); //it counts only.
    // time and average the performance
    let summ = 0;
    let iter = 100;

    resetVariables(reuseSegments);  // <= do not time this data reset
    for (let i = 0; i < iter; i++) {
        let beginStd = performance.now();

        findStandardIntersections();
        // Include intersections at shared endpoints
        for (const [key, segs] of shared) {
            const [x, y] = key.split(",").map(Number);
            recordStdIntersection(x, y, segs);
        }
        let endStd = performance.now();
        summ = (endStd - beginStd) + summ;
    }
    console.log(`Time to get std intersections = ${summ / iter}ms`);
    estimated = stdIntersections.size;
    //console.log(stdIntersections)
    document.getElementById("estimate").innerHTML = "Intersections Estimated = " + estimated;



    //make intersection events from segments that overlap at a single point only.

    for (const [key, segs] of shared) {
        const [x, y] = key.split(",").map(Number); //assigns the event point to x and y as numbers
        events.push(new SweepEvent(y, "intersection", segs, x));
        recordUniqueIntersection(x, y, segs);
    }
    sortEvents();


    recordSharedEndpointIntersections(shared);
    if (shared.size > 0) {
        printSharedPoints(shared);       //for use in code development
        //debugLog('shared', shared);   //for use in code development
    }

    sweepTree = new BST();

   // redraw();  //draw the newly initialized data
    //debugLog('sweepY = ', sweepY);
} //END repeatableSetUp
//=============================================================================



function printSharedPoints(shared) {
    for (const [key, segs] of shared) {
        const labels = segs.map(seg => "S" + seg.id).join(", ");
        debugLog(`(${key}): ${labels}`);
    }
}

/* Build an endPoint map
    Each key (type string) is a distinct point in the dataset.
    Each value (type array) is a segment containing that point.
*/
function buildEndpointMap(segments) {
    const m = new Map();
    const addEndpoint = (point, segmentObj) => {
        const ky = `${point.x},${point.y}`;
        if (!m.has(ky)) {
            m.set(ky, []);
        }
        m.get(ky).push(segmentObj);
    };
    //for all segments, add 2 endpoints per segment
    for (const seg of segments) {
        addEndpoint(seg.p1, seg);
        addEndpoint(seg.p2, seg);
    }
    return m;
}

function sharedPoints(segments) {
    const endpointMap = buildEndpointMap(segments);
    //debugLog(endpointMap);
    const result = new Map();
    for (const [key, segs] of endpointMap) {
        if (segs.length > 1) { //the 1 just means more than 1 point occurs at that coordinate
            result.set(key, segs);
        }
    }
    return result;
}

function recordSharedEndpointIntersections(shared) {
    for (const [key, segs] of shared) {
        /*
        key is a string like "3,7" (a coordinate pair encoded as text).
        .split(",") turns it into ["3", "7"].
        .map(Number) turns it into [3, 7] (real numbers).
        Destructuring assigns x = 3, y = 7.
        So the next line is a compact way of parsing string "x,y" into two numeric coordinates.
        */
        const [x, y] = key.split(",").map(Number);

        // Every distinct pair of segments sharing this point.
        for (let i = 0; i < segs.length; i++) {
            for (let j = i + 1; j < segs.length; j++) {
                const s1 = segs[i];
                const s2 = segs[j];
                const pair = pairKey(s1, s2);

                if (recordedIntersectionPairs.has(pair)) {
                    continue;
                }

                recordedIntersectionPairs.add(pair);
                intersections.push(new Intersection(s1, s2, x, y));
            }
        }
    }
}

function pairKey(s1, s2) {
    return s1.id < s2.id
        ? `${s1.id},${s2.id}`
        : `${s2.id},${s1.id}`;
}

function draw() {
    /*
        debugLog ("in draw loop")
        if(doThis){
            debugLog("doThis=",doThis, "So, if Random is selected, then nearby points are combined.");
        }else{
            debugLog("doThis=",doThis, "So nearby points are not combined.");
        }
    if(doRandom){
            debugLog("doRandom=",doRandom, "So, use createRandomSegments(segNumber))");
        }else{
            debugLog("doRandom=",doRandom, "So, use createSegmentsStatic(segArr");
        }
*/
    if (animate) {
        advanceAnimation();
    }
    //debugLog("")
    background(245);
    // Draw the coordinate axes.
    drawAxes();

    // ----------------------------------------------------------
    // Everything below is drawn using our Cartesian coordinate
    // system:
    //
    //       origin = center of canvas
    //       +x     = right
    //       +y     = up
    // ----------------------------------------------------------

    push();

    translate(width / 2, height / 2);
    scale(1, -1);

    /*  ************ BST has to be up to date ************************8 */
    // Draw the segments.
    let sweepStatus = [];
    noStroke();
    fill("#2a8418");
    for (let segment of segments) {
        segment.draw();                  //method to draw the line segment
        if (segment.isActive(sweepY)) {
            let x = segment.xAt(sweepY); //x value at 
            circle(x, sweepY, 4); //draw Magenta intersect of sweepline and segments 
            sweepStatus.push(segment);
        }
    }
    noFill();
    stroke('blue');

    //*********** Real Time html update status *************** */
    // sort the active segments by their x coordinate at the sweepline level.
    sweepStatus.sort(function (a, b) {
        return a.xAt(sweepY) - b.xAt(sweepY);
    });
    let statusStr = "";
    for (let i = 0; i < sweepStatus.length; i++) {
        statusStr = statusStr + sweepStatus[i].id + "  ";
    }
    // document.getElementById('Div1').innerHTML = "";
    // appendHTML('Div1', `sweepY = ${sweepY}, sweepStatus = ${statusStr}`);


    // Draw the endpoints.
    // for (let segment of segments) {
    //     segment.p1.draw();
    //     segment.p2.draw();
    // }

    // Draw the point IDs.
    /*
    for (let segment of segments) {
        segment.p1.writeIndexNumber();
        segment.p2.writeIndexNumber();
    }
        */

    // Draw all recorded intersections.
    fill("red");
    noStroke();
    intersectionCnt = 0;
    for (const intersection of uniqueIntersections.values()) {
        if (segments.length <= 100) {
            circle(intersection.x, intersection.y, 5);
            intersectionCnt += 1;
        } else {
            circle(intersection.x, intersection.y, 3);
            intersectionCnt += 1;
        }

    }
    document.getElementById("intersectionCount").innerHTML = "Intersections Detected = " + intersectionCnt;




    pop();
    // Number the segments
    if (segments.length < 12) {
        for (let segment of segments) {
            segment.writeIndexNumber();
        }
    }

    drawSweepLine();
    //displaySweepY -= 0.5;
    // if (animate) { sweepY -= 0.1; }
    // noLoop();
} //END Draw.


// ============================================================
// Draw coordinate axes.
// ============================================================

function drawAxes() {
    push();
    stroke("blue");
    translate(width / 2, height / 2);
    scale(1, -1);
    line(-width, 0, width, 0);
    line(0, -height, 0, height);
    pop();
}

function drawSweepLine() {
    push();
    strokeWeight(1);
    stroke("red");
    translate(width / 2, height / 2);
    scale(1, -1);
    stroke("green");
    line(-width / 2, displaySweepY, width / 2, displaySweepY);

    stroke("black");
    pop();
}


// ----------------------------------------------------------
// Create segments.
//
// Coordinates use the usual Cartesian system:
//     x positive to the right
//     y positive upward
//
// Each endpoint is a Point with a unique ID.
// ----------------------------------------------------------
function createSegmentsStatic(segArr) {
    let cnt = 0; //new Point count
    for (let i = 0; i < segArr.length; ++i) {
        let x1 = segArr[i][0];
        let y1 = segArr[i][1];
        let x2 = segArr[i][2];
        let y2 = segArr[i][3];
        segments.push(new Segment(
            i,                          //id
            new Point(cnt, x1, y1),
            new Point(cnt + 1, x2, y2)
        ));
        cnt = cnt + 2
    }
    segments = preProcess(segments); //assure no overlapping segments

    orientSegments();
    makeEvents();
    //console.log('minY = ', minY, ' maxY = ', maxY); //helps calculate the progress bar
    sortEvents();
}

/* //original createRandomSegments(n)
function createRandomSegments(n) {
    segments = [];
    let cnt = 0;
    for (let i = 0; i < n; i++) {
        let x1 = randomIntFromInterval(-180, 180);
        let y1 = randomIntFromInterval(-180, 180);
        let x2 = randomIntFromInterval(-180, 180);
        let y2 = randomIntFromInterval(-180, 180);
        // Don't allow horizontal segments for now.
        // if (y1 == y2) {
        //     i--;
        //     continue;
        // }
        // Don't allow degenerate segments ever
        if (x1 == x2 && y1 == y2) {
            i--;
            continue;
        }

        segments.push(
            new Segment(
                i,
                new Point(cnt, x1, y1),
                new Point(cnt + 1, x2, y2)
            )
        );
        cnt += 2;
    }
    debugLog('doThis', doThis, "Combining some nearby points");
    if (doThis) combineCloseByPoints();  //not efficient.  Use for making test data only.
    segments = preProcess(segments);
    orientSegments();
    makeEvents();
    debugLog('minY = ', minY, ' maxY = ', maxY); //used to calculate progress bar

    sortEvents();

}
*/ //end original createRandomSegments

//modified to get short segments from maxLen
function createRandomSegments(n, maxLen = 400) {
    segments = [];
    let cnt = 0;
    const H = maxLen / 2;

    for (let i = 0; i < n; i++) {
       
        const x1 = randomIntFromInterval(-ym, ym); //ym is a ymax global and is the beginning of sweepY too.
        const y1 = randomIntFromInterval(-ym, ym);

        // Clip the sampling box to the domain, THEN sample uniformly inside it.
        // This keeps p2 uniform in the valid region — no pile-up at the walls.
        const xLo = Math.max(-ym, x1 - H);
        const xHi = Math.min(ym, x1 + H);
        const yLo = Math.max(-ym, y1 - H);
        const yHi = Math.min(ym, y1 + H);

        const x2 = randomIntFromInterval(xLo, xHi);
        const y2 = randomIntFromInterval(yLo, yHi);

        if (x1 === x2 && y1 === y2) {   // degenerate — retry
            i--;
            continue;
        }
        segments.push(
            new Segment(i,
                new Point(cnt, x1, y1),
                new Point(cnt + 1, x2, y2))
        );
        cnt += 2;
    }

    if (doThis) combineCloseByPoints();  //not efficient.  Use for making test data only.
    segments = preProcess(segments);
    orientSegments();
    makeEvents();
    debugLog('minY = ', minY, ' maxY = ', maxY); //used to calculate progress bar
    sortEvents();
}


function combineCloseByPoints() {
    let pOne = []; let pTwo = [];
    for (let i = 0; i < segments.length; ++i) {
        pOne[i] = segments[i].p1
        for (let j = 0; j < segments.length; ++j) {

            pTwo[j] = segments[j].p1;
            if (i == j) continue;
            let distance = dist(pOne[i].x, pOne[i].y, pTwo[j].x, pTwo[j].y);
            if (distance < 30) {
                debugLog(`i,j = ${i},${j}`, 'pOne = ', pOne[i]);
                debugLog('pTwo = ', pTwo[j]);
                debugLog('dist=', distance)
                segments[j].p1 = segments[i].p1
            }
        }
    }
}


function orientSegments() {
    for (let segment of segments) {
        let p1 = segment.p1;
        let p2 = segment.p2;
        // Vertical segment
        if (p1.x == p2.x) {
            if (p1.y < p2.y) {
                segment.p1 = p2;
                segment.p2 = p1;
            }
        }
        // Non-vertical segment
        else {
            if (p1.x > p2.x) {
                segment.p1 = p2;
                segment.p2 = p1;
            }
        }
    }
}


function trackY(y) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
}

//each ordinary point will become either an insert event or a delete event.
//each segment with 2 ordinary points is therefore 2 events.
// Horizontal segments are identified and designated "horizontal"
function makeEvents() {
    let cnt = 0;
    minY = Infinity; // Reset in case makeEvents is called more than once
    maxY = -Infinity;

    for (let seg of segments) {
        // Track both endpoints once — covers every case below
        trackY(seg.p1.y);
        trackY(seg.p2.y);

        if (seg.p1.y === seg.p2.y) {  // Horizontal segment: one event only.  
            events[cnt] = new SweepEvent(
                seg.p1.y,
                "horizontal",
                [seg],
                Math.min(seg.p1.x, seg.p2.x) //x value is leftmost point of segment
            );

        } else if (seg.p1.x === seg.p2.x) {  // Vertical segment.          
            events[cnt] = new SweepEvent(
                seg.p1.y, "insert", [seg], seg.p1.x
            );
            events[cnt + 1] = new SweepEvent(
                seg.p2.y, "delete", [seg], seg.p2.x
            );
            cnt += 1;

        } else {
            // Ordinary nonhorizontal segment.
            events[cnt] = new SweepEvent(
                seg.upperPoint().y, "insert", [seg], seg.upperPoint().x
            );
            events[cnt + 1] = new SweepEvent(
                seg.lowerPoint().y, "delete", [seg], seg.lowerPoint().x
            );
            cnt += 1;
        }

        cnt += 1;
    }

    //debugLog("INSERT EVENTS:");
    // for (const e of events) {
    //     debugLog(e.segments[0].id, e.y, e.x, e.type);
    // }

    sortEvents();
}


// this function is invoked by a button press and two other ways
function processEvent(event, refresh = true) {
    if (event == null) return;

    sweepY = event.y;        // Update the height used by the BST
    displaySweepY = event.y; // Update the displayed sweep line

    debugLog(`------ Event ${processedEventCount++}:`, event.toString()); //for debug only method is in SweepEvent
    let cnt = 0; //count the number of intersections added just for this event
    let candidates = [];
    let p; //predecessor
    let s; //successor

    switch (event.type) {

        case "insert":
            //debugLog("ABOUT TO INSERT:", event.segments[0].id);
            sweepTree.insert(event.segments[0]); //an "insert" event has only 1 segment
            // debugLog(
            //     "BST AFTER INSERT:",
            //     sweepTree.getSegmentsInOrder().map(s => "S" + s.id)
            // );
            candidates = returnAdjacencies();
            // if (candidates.length > 0) {
            //     debugLog('candidates:', candidates.map(c => `S${c[0].id}, S${c[1].id}`));
            // }
            if (candidates.length > 0) {
                //temp will be an array where each element is an intersection object.
                let temp = createNewIntersection(candidates, event.y); //object(s) of class Intersection 
                addIntersectionEvents(temp, event);
                //track unique intersections 
                for (let item of temp) {
                    recordUniqueIntersection(
                        item.x,
                        item.y,
                        [item.segment1, item.segment2]
                    );
                }
            }
            //sweepTree.printInOrder(sweepTree.root) //BST root = sweepTree.root
            break;

        case "delete":
            p = sweepTree.predecessor(event.segments[0]); //a "delete" event has only 1 segment
            s = sweepTree.successor(event.segments[0]);
            sweepTree.delete(event.segments[0]);
            if ((p != null) && (s != null)) {
                candidates.push([p.segment, s.segment]);
                //debugLog('p=', p, ' s=', s);
                let temp = createNewIntersection(candidates, event.y); //object of class Intersection
                addIntersectionEvents(temp, event);

                for (let item of temp) {
                    recordUniqueIntersection(
                        item.x,
                        item.y,
                        [item.segment1, item.segment2]
                    );
                }
            }
            //sweepTree.printInOrder(sweepTree.root) //BST root = sweepTree.root
            break;




        case "intersection":
            let orderedSegments = sweepTree.getSegmentsInOrder();

            const activeSegments = event.segments.filter(segment =>
                orderedSegments.includes(segment)
            );

            debugLog(
                "Intersection event:",
                `(${event.x}, ${event.y})`,
                "Participants:",
                activeSegments.map(s => `S${s.id}`)
            );

            // Nothing to reorder unless at least two segments are active.
            if (activeSegments.length < 2) {
                debugLog("Fewer than two active participants. Skipping.");
                break;
            }

            // Put the participating segments in their current BST order.
            const orderedParticipants = reorderIarr(
                activeSegments,
                orderedSegments
            );

            // Reverse their order as they cross.
            const reversedParticipants = [...orderedParticipants].reverse();

            // Find the first participant in the in-order list.
            const start = orderedSegments.indexOf(orderedParticipants[0]);

            debugLog("Start:", start);
            debugLog(
                "Participating:",
                orderedParticipants.map(s => `S${s.id}`)
            );


            //debug lines

            //end debug lines

            //debug lines
            const positions = orderedParticipants.map(s =>
                orderedSegments.indexOf(s)
            );

            const consecutive = positions.every(
                (pos, i) => i === 0 || pos === positions[i - 1] + 1
            );

            if (!consecutive) {
                console.log("NONCONSECUTIVE PARTICIPANTS!");
                console.log("Intersection:", event.x, event.y);
                console.log("Segments:", orderedParticipants.map(s => s.id));
                console.log("Positions:", positions);
                console.log("Complete BST order:", orderedSegments.map(s => s.id));
            }
            //end debug lines

            //debug lines
            if (!consecutive) {
                console.log("Intersection event:", event.x, event.y);
                console.log(
                    "Participants:",
                    orderedParticipants.map(s => s.id)
                );
                console.log(
                    "Local BST neighborhood:\n" +
                    orderedSegments
                        .slice(positions[0] - 3, positions[1] + 4)
                        .map(s => `S${s.id}: x=${s.xAt(sweepY - epsilon)}`)
                        .join("\n")
                );
            }
            //end debug lines

            // Replace the participants with their reversed order.
            orderedSegments.splice(
                start,
                orderedParticipants.length,
                ...reversedParticipants
            );

            // Rebuild the BST using the new ordering.
            sweepTree.buildBalanced(orderedSegments);

            // Find the two new neighboring pairs.
            const predecessor = sweepTree.predecessor(
                reversedParticipants[0]
            );

            if (predecessor !== null) {
                candidates.push([
                    predecessor.segment,
                    reversedParticipants[0]
                ]);
            }

            const successor = sweepTree.successor(
                reversedParticipants[reversedParticipants.length - 1]
            );

            if (successor !== null) {
                candidates.push([
                    reversedParticipants[reversedParticipants.length - 1],
                    successor.segment
                ]);
            }

            // Check the new neighboring pairs for intersections.
            if (candidates.length > 0) {
                debugLog(
                    "Intersection event candidates:",
                    candidates.map(c => `S${c[0].id}, S${c[1].id}`)
                );

                const newIntersections = createNewIntersection(
                    candidates,
                    event.y
                );

                addIntersectionEvents(newIntersections, event);

                for (const item of newIntersections) {
                    recordUniqueIntersection(
                        item.x,
                        item.y,
                        [item.segment1, item.segment2]
                    );
                }
            }

            break;


        case "horizontal":
            processHorizontalEvent(event);
            break;
    }


    //checkSharedPointGroup(event); //are we at end of a shared Group in the events queue?
    //This function is not called!  I think it is not needed.
    function checkSharedPointGroup(event) {

        const index = events.indexOf(event);

        if (index === -1) return;

        const priorEvent = index > 0 ? events[index - 1] : null;
        const nextEvent = events[index + 1] ?? null;

        const samePoint = (a, b) =>
            a !== null &&
            b !== null &&
            Math.abs(a.x - b.x) < epsilon &&
            Math.abs(a.y - b.y) < epsilon;

        const isGroup =
            samePoint(priorEvent, event) ||
            samePoint(event, nextEvent);

        const groupFinished =
            nextEvent === null ||
            !samePoint(event, nextEvent);

        if (isGroup && groupFinished) {
            debugLog(
                "Finished shared-point group at",
                event.x,
                event.y
            );

            // Re-establish the BST order below this point.
            let orderedSegments = sweepTree.getSegmentsInOrder(); //get complete BST ordering

            const yBelow = event.y - epsilon;

            //debug lines
            if (
                Math.abs(event.x) < epsilon &&
                Math.abs(event.y) < epsilon
            ) {
                console.log(
                    "AT SHARED POINT (0,0), BEFORE SORT:",
                    orderedSegments.map(s => s.id)
                );

                console.log(
                    "S0/S1 positions:",
                    orderedSegments.findIndex(s => s.id === 0),
                    orderedSegments.findIndex(s => s.id === 1)
                );
            }
            //end debug lines

            // orderedSegments.sort(
            //     (a, b) => a.xAt(yBelow) - b.xAt(yBelow)
            // );
            // sweepTree.buildBalanced(orderedSegments);

            //debug lines
            if (
                Math.abs(event.x) < epsilon &&
                Math.abs(event.y) < epsilon
            ) {
                const order = sweepTree.getSegmentsInOrder();

                console.log(
                    "AT SHARED POINT (0,0), AFTER SORT:",
                    order.map(s => s.id)
                );

                console.log(
                    "S0/S1 positions:",
                    order.findIndex(s => s.id === 0),
                    order.findIndex(s => s.id === 1)
                );
            }
            //end debug lines

            //sweepTree.printInOrder(sweepTree.root) //BST root = sweepTree.root
        }

    } //End of checkSharedPointGroup


    //redraw();


    function returnAdjacencies() { //returns an array with exactly 2 segments, or else none.
        let p, s; //predecessor and successor
        let segment = event.segments[0];
        p = sweepTree.predecessor(segment);
        s = sweepTree.successor(segment);
        if (p != null) candidates.push([p.segment, segment]);
        if (s != null) candidates.push([segment, s.segment]);
        return candidates;
    }


    function addIntersectionEvents(newIntersections, currentEvent) {
        let eventAdded = false;
        for (let item of newIntersections) {

            let key = pairKey(item.segment1, item.segment2);

            if (scheduledIntersections.has(key)) {

                continue;
            }

            scheduledIntersections.add(key);

            intersections.push(item);

            let existingEvent = events.find(e =>
                e.type === "intersection" && sameIntersection(item, e)
            );

            if (existingEvent) {
                // Add each participating segment only once.
                // console.log(
                //     "MERGE EVENT:",
                //     item.x, item.y,
                //     "Already processed:",
                //     processedEvents.has(existingEvent),
                //     "Existing segments:",
                //     existingEvent.segments.map(s => s.id)
                // );
                for (let segment of [item.segment1, item.segment2]) {
                    if (!existingEvent.segments.some(s => s.id === segment.id)) {
                        existingEvent.segments.push(segment);
                    }
                }
                debugLog(
                    `Merged intersection at (${item.x}, ${item.y}); ` +
                    `segments: ${existingEvent.segments.map(s => `S${s.id}`).join(", ")}`
                );

            } else if (sameIntersection(item, currentEvent)) {

                // Record the intersection, but don't schedule a swap event.
                debugLog("Intersection at current event:", item.x, item.y);

            } else {

                events.push(
                    new SweepEvent(
                        item.y,
                        "intersection",
                        [item.segment1, item.segment2],
                        item.x
                    )
                );
                eventAdded = true;
                debugLog(
                    `Intersection event added: S${item.segment1.id}, S${item.segment2.id} (${item.x}, ${item.y})`
                );
            }
        }
        if (eventAdded) sortEvents();
    }

    // code before debug on 14 Nov AM
    function createNewIntersection(candidates, iamy) {
        let foundIntersections = [];
        for (let candy of candidates) {
            //debugLog(`candidates:[S${candy[0].id}, S${candy[1].id}]`);
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
            debugLog('intersects = ', intersectsTF);
            if (intersectsTF) {
                let [x, y] = intersectionPoint(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);
                if (y <= iamy + epsilon) foundIntersections.push(new Intersection(candy[0], candy[1], x, y)); //if not, it's redundant
                //debugLog(`(x,y)= (${x},${y}), iamy=${iamy}, sweepY=${sweepY}`)
            }
        }
        return foundIntersections; //an array object of intersections
    }


    // function createNewIntersection(candidates, iamy) {
    //     let foundIntersections = [];
    //     for (let candy of candidates) {
    //         // do these two segments intersect?
    //         p1x = candy[0].p1.x;
    //         p1y = candy[0].p1.y;
    //         p2x = candy[0].p2.x;
    //         p2y = candy[0].p2.y;
    //         p3x = candy[1].p1.x;
    //         p3y = candy[1].p1.y;
    //         p4x = candy[1].p2.x;
    //         p4y = candy[1].p2.y;

    //         intersectsTF = hasIntersect(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);


    //         if (intersectsTF) {
    //             let [x, y] = intersectionPoint(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y);

    //             if (y <= iamy + epsilon) {
    //                 foundIntersections.push(
    //                     new Intersection(candy[0], candy[1], x, y)
    //                 );
    //             }
    //         }
    //     }

    //     return foundIntersections;
    // }

    //Given the complete BST ordering and the segments participating 
    //in this event, return those participating segments in their
    // current BST order.
    function reorderIarr(iarr, orderedSegments) {
        // Build a map from id -> position in orderedSegments
        const orderMap = new Map();
        for (let i = 0; i < orderedSegments.length; ++i) {
            let seg = orderedSegments[i];
            orderMap.set(seg.id, i);
        }
        // Sort iarr by the position of its id in orderedSegments
        return iarr.slice().sort((a, b) => {
            const posA = orderMap.has(a.id) ? orderMap.get(a.id) : Infinity; //Infinity will push an errant id to the very end.
            const posB = orderMap.has(b.id) ? orderMap.get(b.id) : Infinity;
            return posA - posB;
        });
    }

    if (refresh) {
        redraw();
        updateProgress();
    }
}  // END processEvent(event, refresh = true)







function listSegs(segments) {
    let str = "";
    for (let i = 0; i < segments.length; ++i) {
        str = "  [" + segments[i].p1.x
            + ", "
            + segments[i].p1.y
            + ", " + segments[i].p2.x
            + ", " + segments[i].p2.y
            + "]," + " &nbsp;&nbsp;&nbsp;//S"
            + segments[i].id
            + " &nbsp;&nbsp;&nbsp; "
            + segments[i].directionVector;
        ;
        appendHTML("Div1", str);
    }
}



//  ================== Animation Code  ==================
function advanceAnimation() {
    // Are we still pausing at the previous event?
    if (millis() < pauseUntil) return;
    // Find the next event that hasn't been processed.
    if (animationTarget === null) {
        animationTarget = events.find(e => !processedEvents.has(e));
        // No more events: turn animation off.
        if (animationTarget === undefined) {
            animationTarget = null;
            stopAnimation();
            return;
        }
    }

    // Move the displayed line downward toward the event.
    if (displaySweepY > animationTarget.y) {
        displaySweepY -= sweepSpeed;
    }

    // Have we reached the event?
    if (displaySweepY <= animationTarget.y) {
        displaySweepY = animationTarget.y;
        processedEvents.add(animationTarget);
        processEvent(animationTarget);
        // Pause before moving to the next event.
        pauseUntil = millis() + eventPause;
        animationTarget = null;
    }
}


function stopAnimation() {
    animate = false;
    let button = document.getElementById("animateButton");
    button.textContent = "AnimateOFF";
    button.className = "animateOff";
    noLoop();
}


async function runASAP() {
    if (animate) return;
    let avgTime = [];
    processedEvents.clear();
    initialEventCount = events.length;
 
    //keep running until consistency
    for (let i = 0; i < 10; i++) {
        groupInstanceTime = await runASAPChunk(33, keep = true);
        avgTime.push(groupInstanceTime);
        if (i >= 3 && areWithin3Percent(avgTime[i - 1], avgTime[i])) break;       
    }
    console.log(`last two times: ${avgTime[avgTime.length - 2]}, ${avgTime[avgTime.length - 1]}`);
    
    return (avgTime[avgTime.length - 1]);

    function areWithin3Percent(a, b) {
        // Avoid division by zero
        if (a === 0 && b === 0) return true;
        // Calculate relative percentage difference
        const diff = Math.abs(a - b) / ((a + b) / 2);
        return diff <= 0.03; // 3% threshold
    }
}

async function runASAPChunk(repeats, keep) {
    let sum = 0;

    for (let i = 0; i < repeats; i++) {
        resetVariables(true);
        batchSize = 100000;
        let count = 0;
        let nextEvent;

        for (const [key, segs] of shared) {
            const [x, y] = key.split(",").map(Number);
            events.push(new SweepEvent(y, "intersection", segs, x));
            recordUniqueIntersection(x, y, segs);
        }
        sortEvents();
        recordSharedEndpointIntersections(shared);

        sweepTree = new BST();

        const beginTime = performance.now();
        while (count < batchSize && (nextEvent = events.find(e => !processedEvents.has(e)))) {
            processedEvents.add(nextEvent);
            processEvent(nextEvent, false);
            count++;
        }
        sum += performance.now() - beginTime;

        // Yield to the UI between chunks so the browser can paint / stay responsive
        await new Promise(r => setTimeout(r, 0));
    }

    updateProgress();

    // Keep draining in further chunk groups until everything is processed
    if (events.some(e => !processedEvents.has(e))) {
        sum += await runASAPChunk(repeats, keep); // recurse and await
    } else {
        document.getElementById('intersectionList').click();
        redraw();
    }

    return sum / repeats;
}

function updateProgress() {
    //let total = events.length;
    let total = estimated;
    //let completed = processedEvents.size;

    let maxDist = Math.sqrt((minY - maxY) ** 2);

    let sweepYdist = Math.sqrt((sweepY - minY) ** 2);
    let completed = sweepYdist;
    percent = (100 / maxDist) * (maxDist - sweepYdist);
    //debugLog(`sweepYdist: ${sweepYdist.toFixed(1)}  maxDist: ${maxDist} % =${percent}`);



    //let percent = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById("eventProgress").value = percent;
    document.getElementById("eventProgress").max = 100;

    document.getElementById("progressText").textContent =
        `${completed.toFixed(0)} / ${total} possible (${percent.toFixed(1)}%)`;
}

