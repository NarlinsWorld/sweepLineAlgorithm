class BST {

    constructor() {
        this.root = null;
    }

    // ------------------------------------------------------------
    // Return the in-order predecessor of the node containing
    // 'segment', or null if it has none.
    // Uses TreeNode.parent (already present).
    // All key comparisons use the current global sweepY.
    // ------------------------------------------------------------
    predecessor(segment) {
        let z = this.findNode(segment);
        if (z == null) return null;

        // Case 1: z has a left subtree:  RIGHTMOST node of the left subtree.
        if (z.left != null) {
            let y = z.left; //y be predecessor
            while (y.right != null) y = y.right;
            return y;
        }
        // Case 2: no left subtree: Climb till we come from the right.
        let y = z;
        let p = y.parent;
        while (p != null && y === p.left) {
            y = p;
            p = p.parent;
        }
        return p;   // null means z has no predecessor
    }

    successor(segment) {
        let z = this.findNode(segment);
        if (z == null) return null;

        // Case 1: right subtree — leftmost node in it
        if (z.right != null) {
            let y = z.right; //y be successor
            while (y.left != null) y = y.left;
            return y;
        }
        // Case 2: climb till we came up from the LEFT 
        let y = z;
        let p = y.parent;
        while (p != null && y === p.right) {
            y = p;
            p = p.parent;
        }
        return p; //null means no successor
    }






    insert(segment) {
        // Create a TreeNode containing the Segment.
        let newNode = new TreeNode(segment);
        // --------------------------------------------------------
        // Case 1: The tree is empty.
        if (this.root == null) {
            this.root = newNode;
            return;
        }

        let current = this.root; //Tree not empty, so start at root

        // --------------------------------------------------------
        // Keep moving down the tree until we find an empty
        // left or right child.
        // --------------------------------------------------------
        while (true) {
            // ----------------------------------------------------
            // Is the new segment to the LEFT of current?
            // ----------------------------------------------------

            let xNew = segment.xAt(sweepY - epsilon);
            let xCurrent = current.segment.xAt(sweepY - epsilon);
            //temp debug
            // debugLog(
            //     `Comparing S${segment.id} with S${current.segment.id}:`,
            //     "sweepY =", sweepY,
            //     "epsilon =", epsilon,
            //     "xNew =", xNew,
            //     "xCurrent =", xCurrent,
            //     "difference =", xNew - xCurrent
            // );
            //end temp debug
            if (xNew < xCurrent) {
                // Is there an empty spot on the left?
                if (current.left == null) {
                    current.left = newNode;
                    newNode.parent = current;
                    return;
                }
                // Otherwise continue down the left side.
                current = current.left;
            }

            // ----------------------------------------------------
            // Otherwise the new segment goes to the RIGHT.
            // ----------------------------------------------------
            else {
                // Is there an empty spot on the right?
                if (current.right == null) {
                    current.right = newNode;
                    newNode.parent = current;
                    return;
                }
                // Otherwise continue down the right side.
                current = current.right;
            }
        }
    }

    buildFromArray(arr) { //right leaning tree - a linked list
        this.root = null;
        if (arr.length === 0) return null;

        this.root = new TreeNode(arr[0]);

        let z = this.root;
        for (let i = 1; i < arr.length; i++) {
            const node = new TreeNode(arr[i]);
            node.parent = z;
            z.right = node;
            z = node;
        }
    }

    buildBalanced(arr) {
        this.root = this.balancer(arr, 0, arr.length - 1, null);
        return this.root;
    }

    balancer(arr, start, end, parent) {
        if (start > end) return null;

        const mid = Math.floor((start + end) / 2);
        const node = new TreeNode(arr[mid]);
        node.parent = parent;

        node.left = this.balancer(arr, start, mid - 1, node);
        node.right = this.balancer(arr, mid + 1, end, node);

        return node;
    }


    showNodeParentsChildren(segment) {
        let [current, parent] = this.findNode(segment);
        debugLog('Current node is S', current.segment.id);
        debugLog("Its parent is "
            + (current.parent ? "S" + current.parent.segment.id : "null")
        );
        if (parent != current.parent) { 'Got a problem Bob.' }
        debugLog(
            "Node S" + current.segment.id + " children",
            " left = " + (current.left ? "S" + current.left.segment.id : "null"),
            " right = " + (current.right ? "S" + current.right.segment.id : "null")
        );
    }

    

    
    findNode(segment) {
        if (this.root == null) return null;

        let stack = [this.root];

        while (stack.length > 0) {
            let z = stack.pop();

            if (z.segment === segment) return z;

            if (z.left != null) stack.push(z.left);
            if (z.right != null) stack.push(z.right);
        }

        return null;
    }




    


    delete(segment) {
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

    /*
        printInOrder(node) { //node should be the BST root = sweepTree.root
            if (node == null) {
                return;
            }
            this.printInOrder(node.left);
            debugLog("S" + node.segment.id);
            this.printInOrder(node.right);
        }
        */

    printInOrder(node) { // node should be the BST root = sweepTree.root
        const ids = [];
        this.collectInOrder(node, ids);
    //    debugLog('TreeOrder:', ids.map(id => "S" + id).join(" "));
    }

    collectInOrder(node, ids) {
        if (node == null) {
            return;
        }
        this.collectInOrder(node.left, ids);
        ids.push(node.segment.id);
        this.collectInOrder(node.right, ids);
    }

    getSegmentsInOrder() {
        const result = [];
        this.collectSegmentsInOrder(this.root, result);
        return result;
    }

    collectSegmentsInOrder(node, result) {
        if (node == null) {
            return;
        }

        this.collectSegmentsInOrder(node.left, result);
        result.push(node.segment);
        this.collectSegmentsInOrder(node.right, result);
    }

    printTree(node) { //node should be the BST root = sweepTree.root
        if (node == null) {
            return;
        }

        debugLog(
            "Node S" + node.segment.id,
            " left = " + (node.left ? "S" + node.left.segment.id : "null"),
            " right = " + (node.right ? "S" + node.right.segment.id : "null")
        );

        this.printTree(node.left);
        this.printTree(node.right);
    }
}
