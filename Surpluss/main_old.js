//Arbitrary. Probably comes from geogebra or js code random generation.
//[x1,y1,x2,y2]
//Use these for createSegmentsStatic(segmentsArray)

segmentsArray = [
    [-150, -50, 150, 50],
    [-150, 0, -100, -100],
    [-100, 100, 50, -100],
    [-150, 115, 100, -50],
    [-50, -50, 50, -150],
    [50, 50, 20, -88],
    [100, 100, 150, -100]
]




let segments = [];
let sweepTree; // initialize varaible for Binary Search Tree
sweepY = parseInt(document.getElementById("sweep").value);
let animate = false; //who knows. maybe someday

function setup() {

    let canvas = createCanvas(400, 400);
    canvas.parent("cvs");

    //createSegmentsStatic(segmentsArray); //hand crafted testing segments
    createRandomSegments(8);

    //sweepTree = new BST(); //initialize a binary search tree





    // sweepTree.insert(segments[2]);
    // sweepTree.insert(segments[3]);
    // sweepTree.insert(segments[1]);
    // sweepTree.insert(segments[5]);
    // sweepTree.insert(segments[0]);
    // sweepTree.insert(segments[6]);


    //sweepTree.printInOrder(sweepTree.root);
    //console.log(segments[0].isActive(sweepY))
}



// ============================================================
// draw()
// ============================================================

function draw() {

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
    fill("#ff00ff");
    for (let segment of segments) {
        segment.draw();                  //method to draw the line segment
        if (segment.isActive(sweepY)) {
            let x = segment.xAt(sweepY); //x value at sweepY
            circle(x, sweepY, 8); //draw Magenta intersect of sweepline and segments 
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
    document.getElementById('Div1').innerHTML = "";
    appendHTML('Div1', `sweepY = ${sweepY}, sweepStatus = ${statusStr}`);

    sweepTree = new BST();

    for (let segment of sweepStatus) {
        sweepTree.insert(segment);
    }

    //sweepTree.printTree(sweepTree.root);
    //sweepTree.printInOrder(sweepTree.root);

    // Draw the endpoints.
    for (let segment of segments) {
        segment.p1.draw();
        segment.p2.draw();
    }

    // Draw the point IDs.
    for (let segment of segments) {
        segment.p1.writeIndexNumber();
        segment.p2.writeIndexNumber();
    }
    pop();
    // Number the segments
    for (let segment of segments) {
        segment.writeIndexNumber();
    }

    drawSweepLine();
    if (animate) { sweepY -= 0.1; }
    noLoop();
}


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
    stroke("red");
    strokeWeight(2);
    translate(width / 2, height / 2);
    scale(1, -1);
    line(-width / 2, sweepY, width / 2, sweepY);
    stroke("black");
    pop();
}

function createSegmentsStatic(segArr) {
    // ----------------------------------------------------------
    // Create segments.
    //
    // Coordinates use the usual Cartesian system:
    //     x positive to the right
    //     y positive upward
    //
    // Each endpoint is a Point with a unique ID.
    // ----------------------------------------------------------

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
}

function createRandomSegments(n) {
    segments = [];
    let cnt = 0;
    for (let i = 0; i < n; i++) {
        let x1 = randomIntFromInterval(-180,180);
        let y1 = randomIntFromInterval(-180,180);
        let x2 = randomIntFromInterval(-180,180);
        let y2 = randomIntFromInterval(-180,180);
        // Don't allow horizontal segments for now.
        if (y1 == y2) {
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
    orientSegments();
    makeEvents();
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

function makeEvents(){
    for (seg of segments){

    }
}

function listSegs(segments){
        let str = "";
        for(let i=0; i<segments.length; ++i){
            str = segments[i].id + ". ("+segments[i].p1.x + ", " +segments[i].p1.y +"), ("+ segments[i].p2.x + ", " +segments[i].p2.y +")";
            appendHTML("Div2",str);
        }
    }