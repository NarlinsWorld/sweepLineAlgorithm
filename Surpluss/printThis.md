# Removing a BST Node with Two Children (and a Parent)

When the node to delete has **two children**, you can't simply splice it out — you must replace its key/segment with either its **in-order predecessor** or **in-order successor**, then delete that replacement node from its original position. The replacement node is guaranteed to have **at most one child**, which makes the physical removal easy.

## The Standard Recipe

Let `z` be the node to delete, `p = z.parent`.

1. **Find the in-order predecessor** `y` of `z` (rightmost node in `z.left`).  
   *(Equivalently, you could use the successor: leftmost node in `z.right`.)*

2. **Copy `y.segment` into `z`** (i.e. `z.segment = y.segment`).  
   Now the logical deletion is done — `z` holds the predecessor's data.

3. **Physically remove `y`**, which has no right child. Let `x = y.left` (possibly `null`) be its only child, and let `q = y.parent`.

   - **Case 3a — `y` is the left child of `q`:**  
     `q.left = x`  
   - **Case 3b — `y` is the right child of `q`:**  
     `q.right = x`

   - If `x != null`, set `x.parent = q` (if you maintain parent pointers).

4. **Special sub-case to watch for:** `y` is `z.left` itself (i.e. `z.left` has no right child).  
   Then `q === z`, and after step 3a we have `z.left = y.left`. That's correct — but note we must **not** use `q` in a way that assumes `q != z`. The code below handles it naturally.

## Important Detail About Your Original `z.parent`

- If `z` is the root (`p === null`), `z` stays as the root — you don't re-link it. You just overwrite its segment and remove `y`.
- If `z` is not the root, you **do not touch `p`** at all in the two-children case, because `z` itself remains in the tree (only its contents changed). This is the key difference from the 0/1-child cases.

## Reference Implementation (with parent pointers)

```javascript
remove(segment) {
    let [z, path] = this.findNode(segment);
    if (z == null) return;

    // ---------- Case A: two children ----------
    if (z.left != null && z.right != null) {
        // find in-order predecessor y = rightmost of z.left
        let y = z.left;
        while (y.right != null) y = y.right;

        // overwrite z's payload
        z.segment = y.segment;

        // now physically remove y (y has no right child)
        // y.parent is well-defined because y != z (y is in z.left subtree)
        let q = y.parent;
        let x = y.left;          // y has no right child

        if (q.left === y) q.left = x;
        else              q.right = x;

        if (x != null) x.parent = q;
        return;
    }

    // ---------- Case B: zero or one child ----------
    let child = (z.left != null) ? z.left : z.right;
    let p = z.parent;

    if (p == null) {
        // z is root
        this.root = child;
    } else if (p.left === z) {
        p.left = child;
    } else {
        p.right = child;
    }
    if (child != null) child.parent = p;
}
```

## If You Don't Have Parent Pointers

You need the path from the root down to `z` (the stack returned by the modified `findNode`). Then:

- **To find `y`'s parent `q`:** walk down from `z` toward the predecessor. Start `q = z`, `y = z.left`; while `y.right != null` set `q = y; y = y.right`. Now `q` is `y.parent`.
- **To update `p` (only needed for the 0/1-child case):** `p = path[path.length - 1]`, or `null` if `path` is empty.
- In the two-children case you still **don't modify `p`**, exactly as before.

## Summary of the Three Deletion Cases

| Children of `z` | Action | Parent `p` touched? |
|---|---|---|
| 0 (leaf) | `p`'s pointer → `null` | Yes (or root ← `null`) |
| 1 | `p`'s pointer → `z`'s only child | Yes (or root ← child) |
| 2 | Copy predecessor `y` into `z`; splice `y` out using `y.parent` | **No** — `z` stays put |

The one thing students most often get wrong: in the two-children case they try to relink `p` to something. Don't — `z` remains the node in the tree; only its payload changes, and the *predecessor's* parent gets relinked instead.

## Why Predecessor (vs Successor)?

Either works. Predecessor is the rightmost node of the left subtree, so it has **no right child** — meaning after copying, you only ever have to splice a (possibly null) **left** child. Successor (leftmost of the right subtree) has no left child, so you'd splice a right child. Pick one convention and stay consistent.