class Intersection {
    constructor(segment1, segment2, x, y) {
        this.segment1 = segment1;
        this.segment2 = segment2;
        this.x = x;
        this.y = y;
    }

    toString() {
        return `Intersection: S${this.segment1.id} - S${this.segment2.id} at (${parseFloat(this.x.toFixed(4))}, ${parseFloat(this.y.toFixed(4))})`;
    }
}