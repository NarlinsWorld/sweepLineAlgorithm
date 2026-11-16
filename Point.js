class Point {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  draw() {
    circle(this.x, this.y, 8);
  }

  // ------------------------------------------------------------
  // Write the point's ID beside the point.
  //
  // The coordinate system is y-up, but text normally needs
  // to be drawn in the normal screen orientation.
  // ------------------------------------------------------------
  writeIndexNumber() {
    push();

    fill(0);
    noStroke();

    translate(this.x + 5, this.y + 5);

    rotate(radians(180));
    scale(-1, 1);

    text(this.id, 0, 0);

    pop();
  }

}
