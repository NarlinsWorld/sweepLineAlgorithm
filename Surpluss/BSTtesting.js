 //=====================================================

    //2nd arg is case number of testing the comment name
    BST_testing(sweepStatus, 1); //predecessor
    BST_testing(sweepStatus, 2); //successor
    //BST_testing(sweepStatus,3); //findNode
    //BST_testing(sweepStatus,4); //printInOrder(sweepTree.root) left2right on sweepline
    BST_testing(sweepStatus, 5); //printTree(node)
    BST_testing(sweepStatus, 6); //delete(segment)
    //BST_testing(sweepStatus, 7); //showNodeParentsChildren(segment)
    

    //matchSegmentIndexWithSegmentID(sweepStatus) //match segment index with activeSegment.id

    function BST_testing(activeSegments, testNum, segNum = null) {
    //activeSegments is already sorted so don't do it again

    // Test predecessor testNum=1
    switch (testNum) {
        case 1:
            console.log(`Testing Predecessor`)
            for (let seg of activeSegments) {
                let me = sweepTree.predecessor(seg)
                if (me == null) {
                    console.log(`S${seg.id} has no predecessor`);
                } else {
                    console.log(`The predecessor of S${seg.id} is S${me.segment.id}`);
                }
            }
            break;

        //Test successor testNum=2
        case 2:
            console.log(`----------`)
            console.log(`Testing Successor`)
            for (let seg of activeSegments) {
                let me = sweepTree.successor(seg)
                if (me == null) {
                    console.log(`S${seg.id} has no successor`);
                } else {
                    console.log(`The successor of S${seg.id} is S${me.segment.id}`);
                }
            }
            break;

        //Test findNode(segment[]). testNum=3
        // It returns [current,parent]
        // [current,null] and [null,null] are possible return types
        case 3:
            for (let i = 0; i < activeSegments.length; ++i) {

                let [current, parent] = sweepTree.findNode(activeSegments[i]);

                if (current == null) {
                    console.log(`S${activeSegments[i].id} was NOT found`);
                }
                else if (parent == null) {
                    console.log(`S${current.segment.id} is the ROOT`);
                }
                else {
                    console.log(
                        `S${current.segment.id}, parent = S${parent.segment.id}`
                    );
                }
            }
            break;

        //Test printInOrder(sweepTree.root) TestNum=4
        case 4:
            sweepTree.printInOrder(sweepTree.root); //prints to the console
            console.log("Root is S" + sweepTree.root.segment.id);
            break;

        //Test printTree(node) TestNum=5
        case 5:
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            break;


        //testDelete(activeSegments){ testNum=6
        case 6:
            console.log("---------");
            console.log('Testing Delete Single Leaf on Left S5')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[5]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[5]); //return the segment to the tree
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);

            console.log("---------");
            console.log('Testing Delete Single Leaf on Right S6')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[6]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[6]); //return the segment to the tree
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);

            console.log("---------");
            console.log('Testing Delete Leaf with Two childs and deletion is root S2')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[2]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[2]); //return the segment to the tree
            console.log('------------');
            console.log('Now we have a new Tree Structure')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);


            console.log("---------");
            console.log('Testing Delete leaf (S1) which is predecessor of root')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[1]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[1]); //return the segment to the tree
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);

             console.log("---------");
            console.log('Testing Delete S5, node with 1 child on left')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[5]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[5]); //return the segment to the tree
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);

            console.log("---------");
            console.log('Testing Delete S5, node with 1 child on left')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[5]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            sweepTree.insert(segments[5]); //return the segment to the tree
            console.log('------------');
            console.log('Testing printTree')
            sweepTree.printTree(sweepTree.root);
            console.log("Root is S" + sweepTree.root.segment.id);

            console.log("---------");
            console.log('Testing Delete S5,twice with out insert')
            console.log('Before:')
            sweepTree.printInOrder(sweepTree.root); //before deletion
            sweepTree.remove(segments[5]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion
            console.log('and delete it again')
            sweepTree.remove(segments[5]);
            console.log('After:')
            sweepTree.printInOrder(sweepTree.root); //after deletion

            break;


        //test showNodeParentsChildren(segment)
        case 7:
            sweepTree.printTree(sweepTree.root);
            console.log('----');
            for (let seg of activeSegments) {
                sweepTree.showNodeParentsChildren(seg);
                console.log('next -----');
            }

    }


}
