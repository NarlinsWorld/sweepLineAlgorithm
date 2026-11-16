class BST {

    constructor() {
        this.root = null;
    }

    findNodeOld(segment) {
        let parent = null;
        let current = this.root;
        while (current != null) {
            if (current.segment == segment) {
                return [current, parent];
            }
            parent = current;
            if (segment.xAt(sweepY) < current.segment.xAt(sweepY)) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return [null, null];
    }

    remove(segment) { //this shoud be the same as delete below)
        let z = this.findNode(segment);
        if (z == null) return;

        //case A: Two children
        if (z.left != null && z.right != null) {
            // find in-order predecessor y = rightmost of z.left
            let y = z.left;
            while (y.right != null) y = y.right;
            z.segment = y.segment; // overwrite z.segment

            // now physically remove y (y has no right child)
            // y.parent is well-defined because y != z (y is in z.left subtree)
            let q = y.parent;
            let x = y.left;          // y has no right child

            if (q.left === y) q.left = x;
            else q.right = x;

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

    predecessorOld(segment) {
        // First find the node containing 'segment'
        let current = this.findNode(segment)
        // -------------------------------------------------
        // Now find the predecessor of 'current'
        // -------------------------------------------------

        // Case 1:
        // The node has a left subtree.
        // The predecessor is the RIGHTMOST node in that subtree.
        if (current.left != null) {
            let predecessor = current.left;
            while (predecessor.right != null) {
                predecessor = predecessor.right;
            }
            return predecessor;
        }

        // Case 2: No left subtree? — climb until we came from the right
        let predecessor = parent;
        let child = current;
        while (predecessor != null && child == predecessor.left) {
            child = predecessor;
            predecessor = predecessor.parent;
        }
        return predecessor;  // null means no predecessor
    }


    successorOld(segment) {
        let current = this.findNode(segment)
        //Case 1: The node has a right subtree
        // The successor is the LEFTMOST node in the right subtree.
        if (current.right != null) {
            let successor = current.right;
            while (successor.left != null) {
                successor = successor.left;
            }
            return successor;
        }

        //Case 2: No right subtree? - climb until we came from the left
        let successor = parent;
        let child = current;
        while (successor != null && child == successor.right) { //true? keep going
            child = successor;
            successor = successor.parent;
        }
        return successor; //null means no successor
    }



    findNode(segment) {
        let parent = null;
        let current = this.root;
        while (current != null) {
            if (current.segment == segment) {
                return [current, parent];    // <== the useful return
            }
            parent = current;
            if (segment.xAt(sweepY) < current.segment.xAt(sweepY)) {
                current = current.left;
            }
            else {
                current = current.right;
            }
        }
        return [null, null];
    }

    remove(segment) {
        let z = this.findNode(segment);
        if (z == null) return;

        //case A: Two children
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

            if (q.left === y ? q.left = x : q.right = x);
            if (x != null) x.parent = q;
            return;
        }

        // ---------- Case B: zero or one child ----------
        let child = (z.left != null) ? z.left : z.right;
        let p = z.parent;
        if (p == null) { this.root = child; }           // z is root
        else if (p.left === z) { p.left = child; }
        else { p.right = child; }
        if (child != null) child.parent = p;
    }
}

//This is a function  and not a method in BST because it is not about the current tree, 
//but rather about the segments array content.
function matchSegmentIndexWithSegmentID(activeSegments) {
    console.log("segments =", segments)
    console.log("activeSegments = ", activeSegments)
    console.log(segments[0].xAt(sweepY), activeSegments[1].xAt(sweepY))
    for (let i = 0; i < segments.length; i++) {
        for (let j = 0; j < activeSegments.length; j++) {
            if (segments[i].xAt(sweepY) == activeSegments[j].xAt(sweepY)) {
                console.log(`segment[${i}] is activeSegment.id S${activeSegments[j].id}]`)
            }
        }
    }
}

//You can only remove a segment that is in the tree
//err=true, means verbose mode and crash the program on err
function deleteOld(segment, err = false) {
    let [current, parent] = this.findNode(segment);
    if (current == null && err) {
        console.log('Segment S' + segment.id + " is not in the tree!");
        return;
    }

    //The leaf case,  no children
    if (current.left == null && current.right == null) {
        // Is the leaf the root?
        if (parent == null) {
            this.root = null; //effectively deletes the tree.
        }
        // Otherwise its parent must point to it.
        else if (parent.left == current) {
            parent.left = null;
        }
        else {
            parent.right = null;
        }
        return;
    }


    // if we got here, it is not a leaf case.

    // One child
    // Identify that there is one child only 

    let A = current.left;
    let B = current.right;
    if ((A === null && B !== null) || (A !== null && B === null)) {
        let child;
        //and which one
        if (current.left != null) {
            child = current.left;
        } else {
            child = current.right;
        }


        if (current == this.root) {
            this.root = child;
            return;
        }

        if (parent.left == current) {
            parent.left = child;
        } else {
            parent.right = child;
        }
        return;
    }


    //if we get here, current has two children
    // a successor must exist else there could not be 2 children
    let successor = this.successor(current);
    // replace current's segment with successor's segment
    current.segment = successor.segment; //their exist successor.parent

    // need to disconnect successor from the tree.
    //does successor have a right child?
    if (successor.right == null) { //this is for the answer "no".  no right child.
        if (successor.parent.left == successor) {
            successor.parent.left = null;
        } else {
            successorParent.right = null;
        }
    }
    if (successor.right != null) {  // yes there is a right child
        if (successorParent.left == successor) {
            successorParent.left = successor.right;
        } else {
            successorParent.right = successor.right;
        }
    }
    return;
}

//original findNode.  This method searches down the BST by comparing the segments' horizontal positions:
    //It is efficient because it follows the tree's left and right branches instead of examining every node.
    //But at an intersection, two segments can have the same xAt(sweepY). 
    // The comparison no longer tells the search which branch contains the segment you're looking for.
    /*
    findNode(segment) {
        let z = this.root;
        while (z != null) {
            if (z.segment == segment) return z;
            z = segment.xAt(sweepY) < z.segment.xAt(sweepY) ? z = z.left : z = z.right;
        }
        re
        */

    /*slower findNode, but does not use xAt(sweepY)
    // This method uses the segment object's identity instead:
    //It can find the segment regardless of its position in the tree, 
    // but it may have to examine every node.
    2. The catch: the problem isn't confined to intersection events
Suppose an intersection occurs at y=10, and two segments exchange their left-to-right order there.
After you reverse their order in the tree, you process another event at the same height, perhaps an endpoint event at a different \(x\)-coordinate.
If that endpoint event calls predecessor(), successor(), or delete(), those methods call findNode() too. The tree may still contain segments whose xAt(sweepY) values are equal, or whose ordering no longer agrees with the original search assumptions.
In other words, the difficulty is not simply which event type is being processed. It's whether the ordinary BST search assumptions hold at that moment.
That means switching to identity search only inside the intersection handler might work for your current tests, but it would leave a potential failure elsewhere.

Here is test code, that would log the problem:
if (
  segment !== z.segment &&
  Math.abs(segment.xAt(sweepY) - z.segment.xAt(sweepY)) < epsilon
) {
  console.log(
    "findNode tie:",
    `S${segment.id}`,
    `S${z.segment.id}`,
    `y=${sweepY}`
  );
}
*/
