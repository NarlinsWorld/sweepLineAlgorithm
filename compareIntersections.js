
document.getElementById("compareInts").addEventListener("click", () => {
const missing = [];

for (const [key, item] of stdIntersections) {
    if (!uniqueIntersections.has(key)) {
        missing.push({
            key: key,
            segments: item.segments.map(s => s.id)
        });
    }
}

console.log("Missing intersection locations:", missing.length);

console.log(
    "First 20 missing:",
    JSON.stringify(missing.slice(0, 20), null, 2)
);


const missingBySegment = new Map();

for (const item of missing) {
    for (const id of item.segments) {
        missingBySegment.set(
            id,
            (missingBySegment.get(id) || 0) + 1
        );
    }
}

console.log(
    "Missing intersections by segment:",
    [...missingBySegment.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
);
});


/*
document.getElementById("compareInts").addEventListener("click", () => {
    const pointKey = (x, y) => `${roundCoord(x)}, ${roundCoord(y)}`;

    const uniqueKeys = new Set(
        [...uniqueIntersections.values()].map(i => pointKey(i.x, i.y))
    );

    const missing = [...stdIntersections.values()]
        .filter(i => !uniqueKeys.has(pointKey(i.x, i.y)));

    console.log('differences =', missing.length);   // expect 75
    missing.forEach(i =>
        console.log(i.x, i.y, 'segments:', i.segments.map(s => s.id))
    );
});
*/

/*
document.getElementById("intersectionList").addEventListener("click", () => {
  appendHTML("Div2", '--------------------');
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
*/

// document.getElementById("compareInts").addEventListener("click", () => {
    
//     let cnt = 0;
//     for (let item of stdIntersections.values()) {

//         for (let itm of uniqueIntersections.values()) {
//             const rx = roundCoord(itm.x);
//             const ry = roundCoord(itm.y)
//             if (rx == item.x && ry == item.y) {
//                 console.log(rx, ry);
//                 cnt += 1;
//             }
//         }
//     }
//     console.log('matches =', cnt);
// })