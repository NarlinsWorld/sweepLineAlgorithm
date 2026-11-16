class Segment {
    constructor(id, p1, p2) {
        this.id = id;
        this.p1 = p1;
        this.p2 = p2;
        this.directionVector = [p2.x - p1.x, p2.y - p1.y];
    }

    draw() {
        push();
        stroke("gray");
        strokeWeight(.5);
        line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
        pop();
    }

    // ------------------------------------------------------------
    // Return the x coordinate where this segment crosses the
    // horizontal line y.
    // ------------------------------------------------------------
    xAt(y) {
        if ((this.p2.y - this.p1.y) == 0) {
            return this.lowerPoint().x
        } else {
            return this.p1.x + (y - this.p1.y) * (this.p2.x - this.p1.x) / (this.p2.y - this.p1.y);
        }
    }

    // Return the leftmost endpoint of the segment
    leftEndPoint() {
        if (this.p1.x < this.p2.x) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    rightEndPoint() {
        if (this.p1.x > this.p2.x) {
            return this.p1;
        } else {
            return this.p2;
        }
    }

    // ------------------------------------------------------------
    // Return the upper endpoint of the segment.
    // ------------------------------------------------------------
    upperPoint() {
        if (this.p1.y > this.p2.y) {
            return this.p1;
        }
        else {
            return this.p2;
        }
    }

    // ------------------------------------------------------------
    // Return the lower endpoint of the segment.
    // ------------------------------------------------------------
    lowerPoint() {
        if (this.p1.y < this.p2.y) {
            return this.p1;
        }
        else {
            return this.p2;
        }
    }

    // ------------------------------------------------------------
    // Is the horizontal line y actually passing through this
    // segment?
    // ------------------------------------------------------------
    isActive(y) { //returns true or false

        let upper = this.upperPoint();
        let lower = this.lowerPoint();

        return y <= upper.y && y >= lower.y;

    }

    writeIndexNumber() {

        let p = this.upperPoint();

        //let screenX = width / 2 + p.x + 20;
        //let screenY = height / 2 - p.y - 15;
        let screenX = width / 2 + p.x;
        let screenY = height / 2 - p.y;

        fill("#ff00ff");
        noStroke();

        text(this.id, screenX, screenY);
        stroke()
        noFill();
    }




}