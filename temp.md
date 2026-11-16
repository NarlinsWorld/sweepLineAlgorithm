Clear now — and good, let's go with **rule (I)**, the tidy version. Here's the finalized spec as I'll implement it:

## Finalized spec (rule I)

For each line in `overlapGroups` (in iteration order):

1. Ordered points `P0 < P1 < … < Pn` from `ptsInOrder[gi]`.
2. For each consecutive pair `(Pi, Pi+1)`, build a temporary segment `tmp = new Segment(-1, Pi, Pi+1)` (id `-1` is a throwaway; never stored) and test coverage with `segs.some(s => doSegsOverlap(tmp, s))`.
3. **If covered** → emit `new Segment(nextId++, Pi, Pi+1)` into `newSegments`.
4. **If not covered** → emit nothing (gap preserved).
5. **`segmentsToErase`** = every original segment on every `overlapGroups` line (rule I: all originals on overlap lines are superseded by the per-interval decomposition). A lone `(P4,P5)` segment that doesn't overlap anything: note it is *itself* an original on an overlap line, so under rule (I) it **does** go into `segmentsToErase`, and a new `P4–P5` **is** emitted into `newSegments`. That's the "tidy" behavior you agreed to. (We can revisit if it feels noisy in practice.)

No original `segments`, `groups`, `overlapGroups`, or `Point` objects are modified. New segments **reuse** the existing `Point` instances from `ptsInOrder`. IDs start at `maxExistingId + 1`.

## The code

```javascript
    let ptsInOrder = orderPoints(overlapGroups);
    debugLog(`Each array is an overlapGroup's points are arranged in order
        so going from point to point is an interval. 
        There is one less interval than there are points`);
    debugLog(ptsInOrder);

    // =====================================================================
    // Build newSegments (per-interval, covered only) and segmentsToErase.
    // Neither original `segments` nor the maps/points are modified.
    // =====================================================================

    // Next id for new segments: one past the largest existing id.
    let nextSegId = 0;
    for (const s of segments) {
        if (s.id >= nextSegId) nextSegId = s.id + 1;
    }

    const newSegments = [];
    const segmentsToErase = [];

    // orderPoints iterated overlapGroups in insertion order, so we re-iterate
    // the same way to keep index gi aligned with ptsInOrder[gi].
    const overlapEntries = Array.from(overlapGroups.entries());

    for (let gi = 0; gi < overlapEntries.length; gi++) {
        const [, segs] = overlapEntries[gi];
        const pts = ptsInOrder[gi];

        // Rule (I): every original on an overlap line is superseded.
        for (const s of segs) {
            segmentsToErase.push(s);
        }

        // Per-interval emission: only where some original covers the interval.
        for (let i = 0; i < pts.length - 1; i++) {
            const p1 = pts[i];
            const p2 = pts[i + 1];
            // Temporary probe segment; id -1 is never stored anywhere.
            const probe = new Segment(-1, p1, p2);

            const covered = segs.some(s => doSegsOverlap(probe, s));
            if (covered) {
                newSegments.push(new Segment(nextSegId++, p1, p2));
            }
        }
    }

    debugLog("newSegments:", newSegments);
    debugLog("segmentsToErase:", segmentsToErase);
```

### Notes

- **Why `probe` with id `-1`:** `doSegsOverlap` only looks at coordinates (`areColinear`, axis min/max), never at `id`, so a throwaway id is safe and keeps the probe from ever being confused with a real segment. It's garbage-collected immediately.
- **Integer coordinates / no float issues:** confirmed — `doSegsOverlap` uses exact min/max on integers, so coverage is exact. The probe's `directionVector` computation is also exact for integers.
- **Alignment of `ptsInOrder` and `overlapGroups`:** relies on `overlapGroups` being unchanged between the `orderPoints` call and this block. It is, in your current flow. If you ever call something that mutates `overlapGroups` in between, we should switch to a keyed structure (e.g., have `orderPoints` return a `Map<lineKey, Point[]>`). Flagging so it's on your radar.
- **`segmentsToErase` may contain duplicates?** No — each original segment belongs to exactly one line key (its `makeSegmentKey`), and each `overlapGroups` entry is visited once. So no duplicates.
- **Empty `pts` (length < 2):** the interval loop simply doesn't run; nothing emitted. (An overlap line always has ≥ 2 segments, so this shouldn't occur, but it's safe.)
- **Order within `newSegments`:** grouped by line (in `overlapGroups` insertion order), then by interval order along the line. That should make it easy to eyeball against `ptsInOrder`.

### Sanity check on your Q1 example

Line with S0 = [P0,P2], S1 = [P1,P3], and lone S2 = [P4,P5], ordered points P0 < P1 < P2 < P3 < … < P4 < P5 (with a gap between P3 and P4):

- Intervals covered: (P0,P1) ✓, (P1,P2) ✓, (P2,P3) ✓, (P3,P4) ✗ gap, (P4,P5) ✓ (covered by S2).
- `newSegments`: P0–P1, P1–P2, P2–P3, P4–P5. **No** P3–P4. ✓ matches your intended example.
- `segmentsToErase`: S0, S1, S2 (all originals on the line, rule I). ✓

Go ahead and wire it in and try it on real data. When you're ready for the swap step (delete `segmentsToErase` from `segments`, insert `newSegments`), or if the rule-I churn on lone segments bothers you, come back and we'll adjust.
