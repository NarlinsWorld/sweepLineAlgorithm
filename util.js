/* utility function to add text(and latex) content to a named div.  Name and locate the div
in index.html.  For example <div id="Div1"></div>  or <div id="Div2"></div>
Each time the function is called, the stuffToAdd is appended to whatever is alread in the div.
example call:
appendHTML("Div1",`I have much text and some $\\LaTeX$ and a number ${varName}`)
Only difference between this and index.html latex, is the double \\
*/

function appendHTML(myDiv, stuffToAdd) {
  const ele = document.getElementById(myDiv);
  const newDiv = document.createElement("div");
  newDiv.innerHTML = stuffToAdd;
  ele.appendChild(newDiv);
  //document.getElementById("Div1").scrollIntoView({ behavior: "smooth" });
}

//clear all divs
document.getElementById("clearr").addEventListener("click", () => {
  document.getElementById('Div1').innerHTML = "";
  document.getElementById('Div2').innerHTML = "";
  document.getElementById("Div3").innerHTML = "";

});

//event for the slider
// document.getElementById("sweep").addEventListener("input", () => {
//   sweepY = parseInt(document.getElementById("sweep").value);
//   document.getElementById("swee").value = sweepY;
//   if (!animate) {
//     displaySweepY = sweepY;
//   }
//   redraw();
// });

//event for the sweepY value input box
// document.getElementById("swee").addEventListener("change", () => {
//   sweepY = parseInt(document.getElementById("swee").value);
//   if (!animate) {
//     displaySweepY = sweepY;
//   }
//   redraw();
// });


function showEvents() {
  document.getElementById("Div3").innerHTML = "";
  let index = 0
  for (let event of events) {

    appendHTML("Div3", `${index}, ${event.toString()}`);
    ++index;

  }
  //   debugLog(events);
}

document.getElementById("intersectionList").addEventListener("click", () => {
  appendHTML("Div2", '----- uniqueIntersections.values -----');
  for (let item of uniqueIntersections.values()) {
    let segmentNames = item.segments
      .map(s => `S${s.id}`)
      .join(", ");

    appendHTML(
      "Div2",
      `(${item.x.toFixed(3)}, ${item.y.toFixed(3)}) : ${segmentNames}`
    );
  }
});

document.getElementById("animateButton").addEventListener("click", function () {
  animate = !animate;

  this.textContent = animate ? "AnimateON" : "AnimateOFF";
  this.className = animate ? "animateOn" : "animateOff";

  if (animate) {
    animationTarget = null;
    pauseUntil = 0;
    loop();
  } else {
    animationTarget = null;
    noLoop();
  }
});

/*  O L D
function recordUniqueIntersection(x, y, segments) {
  let key = `${x}, ${y}`;

  // Does this intersection already exist?
  if (!uniqueIntersections.has(key)) {
    uniqueIntersections.set(key, {
      x: x,
      y: y,
      segments: []
    });
  }

  // Get the existing intersection object.
  let item = uniqueIntersections.get(key);

  // Add participating segments, but don't add duplicates.
  for (let segment of segments) {
    if (!item.segments.some(s => s.id === segment.id)) {
      item.segments.push(segment);
    }
  }
}
  */

function recordUniqueIntersection(x, y, segments) {
  const rx = roundCoord(x);
  const ry = roundCoord(y);
  const key = `${rx}, ${ry}`;

  if (!uniqueIntersections.has(key)) {
    uniqueIntersections.set(key, {
      x: rx,
      y: ry,
      segments: []
    });
  }

  const item = uniqueIntersections.get(key);

  for (const segment of segments) {
    if (!item.segments.some(s => s.id === segment.id)) {
      item.segments.push(segment);
    }
  }
}



function sortEvents() {
  const eventPriority = {
    delete: 0,
    intersection: 1,
    horizontal: 2,
    insert: 3
  };

  //   const eventPriority = {
  //     insert: 0,
  //     intersection: 1,
  //     horizontal: 2,
  //     delete: 3
  // };

  events.sort((a, b) =>
    (b.y - a.y) ||
    (a.x - b.x) ||
    (eventPriority[a.type] - eventPriority[b.type])
  );
}

// document.getElementById("processEvent").addEventListener("click", () => {
//   const nextEvent = events.find(e => !processedEvents.has(e));
//   if (!nextEvent) return;
//   processedEvents.add(nextEvent);
//   processEvent(nextEvent);
// });

document.getElementById("processEvent").addEventListener("click", () => {
  // Manual processing is only available when animation is OFF.
  if (animate) return;
  const nextEvent = events.find(e => !processedEvents.has(e));
  if (!nextEvent) return;
  processedEvents.add(nextEvent);
  animationTarget = null;
  processEvent(nextEvent);
  redraw();
});

// document.getElementById("printTree").addEventListener("click", () => {
//   sweepTree.printTree(sweepTree.root);
// });

// document.getElementById("treeOrder").addEventListener("click", () => {
//   sweepTree.printInOrder(sweepTree.root) //BST root = sweepTree.root
// });

//event for the listSegs button
document.getElementById("listSegs").addEventListener("click", () => {
  listSegs(segments);
});

//input box for the animation event Pause Time.
document.getElementById("pauseTime").addEventListener("change", () => {
  eventPause = Number(document.getElementById("pauseTime").value);
});

//input box for the animation SweepSpeed
document.getElementById("sweepSpeed").addEventListener("change", () => {
  sweepSpeed = Number(document.getElementById("sweepSpeed").value);
})

//input box for the maximum length of a segment
document.getElementById("maxLen").addEventListener("change", () => {
  maxLen = Number(document.getElementById("maxLen").value);
})

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function sameIntersection(a, b) {
  return Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon;
}

function intersectionPoint(P1x, P1y, P2x, P2y, Q1x, Q1y, Q2x, Q2y) {
  let Px = P1x;
  let Py = P1y;
  let Qx = Q1x;
  let Qy = Q1y;
  let ux = P2x - P1x;
  let uy = P2y - P1y;
  let vx = Q2x - Q1x;
  let vy = Q2y - Q1y;

  let num = (Px - Qx) * -uy + (Py - Qy) * ux;
  let den = vx * -uy + vy * ux;
  let x = Qx + (num / den) * vx;
  let y = Qy + (num / den) * vy;
  return [x, y];
}

function hasIntersect(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
  //indicate if the lines intersect
  let ans = false;
  let dM = det3x3(1, p1x, p1y, 1, p2x, p2y, 1, p3x, p3y);
  let dN = det3x3(1, p1x, p1y, 1, p2x, p2y, 1, p4x, p4y);
  let dO = det3x3(1, p3x, p3y, 1, p4x, p4y, 1, p1x, p1y);
  let dP = det3x3(1, p3x, p3y, 1, p4x, p4y, 1, p2x, p2y);
  if (Math.sign(dM) != Math.sign(dN) && Math.sign(dO) != Math.sign(dP)) { ans = true; }
  return ans;
}

function det3x3(a, b, c, d, e, f, g, h, i) {
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

// const gcd = (a, b) => {
//   a = Math.abs(a);
//   b = Math.abs(b);
//   if (a == 0) { return b }
//   return gcd(b % a, a);
// }

const gcd = (a, b) => {

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error(`Invalid GCD arguments: ${a}, ${b}`);
  }

  a = Math.abs(a);
  b = Math.abs(b);

  while (a !== 0) {
    let remainder = b % a;
    b = a;
    a = remainder;
  }

  return b;
};



function processHorizontalEvent(event) {
  let horizontalSegment = event.segments[0];

  for (let segment of segments) {
    // Skip horizontal segments.
    if (segment.p1.y === segment.p2.y) continue;

    // Skip the horizontal segment itself.
    if (segment.id === horizontalSegment.id) continue;

    // Test for an intersection.
    if (hasIntersect(
      horizontalSegment.p1.x, horizontalSegment.p1.y,
      horizontalSegment.p2.x, horizontalSegment.p2.y,
      segment.p1.x, segment.p1.y,
      segment.p2.x, segment.p2.y
    )) {
      let [x, y] = intersectionPoint(
        horizontalSegment.p1.x, horizontalSegment.p1.y,
        horizontalSegment.p2.x, horizontalSegment.p2.y,
        segment.p1.x, segment.p1.y,
        segment.p2.x, segment.p2.y
      );

      // 
      recordUniqueIntersection(x, y, [horizontalSegment, segment]);
    }
  }
}

//count the number of intersections without finding them. time complexity n^2
//this count includes duplicate intersections, so it is an over count.
function countIntersections() {
  let cnt = 0;
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      if (hasIntersect(
        segments[i].p1.x, segments[i].p1.y,
        segments[i].p2.x, segments[i].p2.y,
        segments[j].p1.x, segments[j].p1.y,
        segments[j].p2.x, segments[j].p2.y
      )) {
        //console.log(`segments Intersect: S${segments[i].id}, S${segments[j].id}`)
        cnt = cnt + 1;
      }
    }
  }
  return cnt;
}

//called by function repeatableSetup
function findStandardIntersections() {
  let cnt = 0;
  let ix, iy;
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const si = segments[i];
      const sj = segments[j];
      if (hasIntersect(si.p1.x, si.p1.y, si.p2.x, si.p2.y,
        sj.p1.x, sj.p1.y, sj.p2.x, sj.p2.y)) {
        [ix, iy] = intersectionPoint(si.p1.x, si.p1.y, si.p2.x, si.p2.y,
          sj.p1.x, sj.p1.y, sj.p2.x, sj.p2.y);
        recordStdIntersection(ix, iy, [si, sj]);   // <-- THIS
        cnt++;
      }
    }
  }
  return cnt;
}

function roundCoord(v) {
  return Math.round(v * 1e6) / 1e6;
}

//build the key from rounded values
function recordStdIntersection(x, y, segments) {
  const rx = roundCoord(x);
  const ry = roundCoord(y);
  const key = `${rx}, ${ry}`;

  if (!stdIntersections.has(key)) {
    stdIntersections.set(key, {
      x: rx,
      y: ry,
      segments: []
    });
  }

  const item = stdIntersections.get(key);
  for (const segment of segments) {
    if (!item.segments.some(s => s.id === segment.id)) {
      item.segments.push(segment);
    }
  }
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

function debugLog(...args) {
  if (debug) {
    console.log(...args);
  }
}

function debugLogPreProcess(...args) {
  if (debugPreProcess) {
    console.log(...args);
  }
}
