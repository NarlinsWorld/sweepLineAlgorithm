class SweepEvent {
    constructor(y, type, segments, x = null) {
        this.y = y;
        this.x = x;
        this.type = type;
        this.segments = segments;
    }

    toString() {
        let segmentList = this.segments.map(s => `S${s.id}`).join(", ");
        let y = parseFloat(this.y.toFixed(4));
        let x = this.x === null ? "null" : parseFloat(this.x.toFixed(4));

        return `Event: y=${y},x=${x}, type=${this.type}, segments=${segmentList}`;
    }
}