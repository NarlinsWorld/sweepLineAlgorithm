class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    constructor(p, q) {
        this.p = p;
        this.q = q;
    }
}

function doIntersect(l1, l2) {
    console.log(l1,l2);
   let result =  direction(l1,l2);
   console.log(result);
   return false;
}

function computeIntersection(l1, l2) {
    const x1 = l1.p.x, y1 = l1.p.y;
    const x2 = l1.q.x, y2 = l1.q.y;
    const x3 = l2.p.x, y3 = l2.p.y;
    const x4 = l2.q.x, y4 = l2.q.y;

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    const num1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    const num2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

    if (denom === 0) {
        // Lines are parallel
        return new Point(Infinity, Infinity);
    }

    const ua = num1 / denom;
    const ub = num2 / denom;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        // Intersection point lies on both line segments
        const x = x1 + ua * (x2 - x1);
        const y = y1 + ua * (y2 - y1);
        return new Point(x, y);
    }

    // Lines do not intersect
    return new Point(Infinity, Infinity);
}

//==========================
//These are from my p5 folder named SegmentIntersection


function direction(l1,l2) {
    let pt=[];
    pt.push([l1.p.x,l1.p.y],[l1.q.x,l1.q.y],[l2.p.x,l2.p.y],[l2.q.x,l2.q.y]);
    console.log('pt=',[pt[0], pt[1],pt[2],pt[3]])
  let intersect = false; let parallel = false;
  let d1 = subdirection(pt[2], pt[3], pt[0]);
  let d2 = subdirection(pt[2], pt[3], pt[1]);
  let d3 = subdirection(pt[0], pt[1], pt[2]);
  let d4 = subdirection(pt[0], pt[1], pt[3]);

  if (crossOf2Segments(pt[0], pt[1], pt[2], pt[3]) == 0) { parallel = true; }
  console.log("parallel ? ",parallel);
  console.log("d1=", Math.sign(d1), " d2=", Math.sign(d2), " d3=", Math.sign(d3), " d4=", Math.sign(d4));
  if ((((d1 > 0) && (d2 < 0)) ^ ((d1 < 0) && (d2 > 0))) && (((d3 > 0) && (d4 < 0)) ^ ((d3 < 0) && (d4 > 0)))) {
    intersect = true;
  } else if (d1 == 0 && onSegment(pt[2], pt[3], pt[0])) { intersect = true; }
  else if (d2 == 0 && onSegment(pt[2], pt[3], pt[1])) { intersect = true; }
  else if (d3 == 0 && onSegment(pt[0], pt[1], pt[2])) { intersect = true; }
  else if (d4 == 0 && onSegment(pt[0], pt[1], pt[3])) { intersect = true; }
  else { intersect = false; }

  if (parallel && intersect) {
    let match = 0;
    console.log("both || and X"); //Do they intersect in only 1 point
    //first. Are only 2 of the 4 points the same.
    let a0, a1, a2, a3 = false;
    let P0 = pt[0].toString();
    let P1 = pt[1].toString();
    let Q0 = pt[2].toString();
    let Q1 = pt[3].toString();
    if (P0 == Q0) { a0 = true; match += 1; console.log("P0=" + P0+" Q0="+ Q0) }
    if (P0 == Q1) { a1 = true; match += 1; console.log("P0=" + P0+" Q1="+ Q1)}
    if (P1 == Q0) { a2 = true; match += 1; console.log("P1=" + P1+" Q0="+ Q0)}
    if (P1 == Q1) { a3 = true; match += 1; console.log("P1=" + P1+" Q1="+ Q1)}

    //Now if match==1, then is that point between the other 2?
    console.log("match=", match);

    if (match == 1) {
      let EP=[]; let EQ=[];
      if (a0) { testPoint = pt[0]; EP = pt[1]; EQ = pt[3]; }
      if (a1) { testPoint = pt[0]; EP = pt[1]; EQ = pt[2]; }
      if (a2) { testPoint = pt[1]; EP = pt[0]; EQ = pt[3]; }
      if (a3) { testPoint = pt[1]; EP = pt[0]; EQ = pt[2]; }
      console.log("testPoint=", testPoint);
      let v1 = [EQ[0] - EP[0], EQ[1] - EP[1]];
      let v2 = [testPoint[0] - EP[0], testPoint[1] - EP[1]];
      let v3 = [testPoint[0] - EQ[0], testPoint[1] - EQ[1]];
      if (dotProd(v2, v1) > 0 && dotProd(v3, v1) < 0) { console.log("is between"); intersect=true; //testPoint is the intersection point
        document.getElementById("intersectionAnswer").innerHTML = "The intersection is, (" + testPoint +")";
       } else {
        document.getElementById("intersectionAnswer").innerHTML = "There is overlap of the segments."
       }
    } else {
      //overlapping
      document.getElementById("intersectionAnswer").innerHTML = "The segments share multiple points."
    }
  }
    if (intersect && !parallel) {
      //prepare to find the intersection point
      let P = pt[0];
      let Q = pt[2];
      let u = [pt[1][0] - pt[0][0], pt[1][1] - pt[0][1]];
      let v = [pt[3][0] - pt[2][0], pt[3][1] - pt[2][1]];
      //let answer = intersectionPoint(P, u, Q, v);
      let answer = computeIntersection(l1, l2);
      console.log('anser=',answer)
    //   let str1 = document.getElementById("intersectionAnswer").innerHTML;
    //   let ans = [Math.floor(answer[0]*100)/100,Math.floor(answer[1]*100)/100]
    //  document.getElementById("intersectionAnswer").innerHTML = "&nbsp;&nbsp;Intersection = "+str1 +" (" + ans[0]+", " + ans[1] + ")";
    }

    
    if (intersect == false) {
      console.log("no intersection");
      document.getElementById("intersectionAnswer").innerHTML = "NO Segment Intersection";
    }

  
}

function subdirection(pi, pj, pk) { //2d cross product of segment pj,pk and point pi
  //console.log("pi=", pi, "pj=", pj, "pk=", pk);
  let u = [(pk[0] - pi[0]), pk[1] - pi[1]];
  let v = [(pj[0] - pi[0]), pj[1] - pi[1]];
  return u[0] * v[1] - v[0] * u[1]; //  //cross u x v
}

function onSegment(pi, pj, pk) {
  let xi = pi[0]; let xj = pj[0]; let xk = pk[0];
  let yi = pi[1]; let yj = pj[1]; let yk = pk[1];
  if ((min(xi, xj) <= xk) && (xk <= max(xi, xj)) && (min(yi, yj) <= yk) && (yk <= max(yi, yj))) { return true };
  return false;
}

function crossOf2Segments(P, Q, R, S) { //P & Q are endpoints of 1 segment. R & S endpoints of the other
  let u = [Q[0] - P[0], Q[1] - P[1]];
  let v = [S[0] - R[0], S[1] - R[1]];
  return u[0] * v[1] - v[0] * u[1];

}

function dotProd(P, Q) { //
  return P[0] * Q[0] + P[1] * Q[1];
}
