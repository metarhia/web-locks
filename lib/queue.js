'use strict';

class Queue {
  constructor() {
    this.elements = [];
    this.offset = 0;
  }

  push(...element) {
    this.elements.push(...element);
    return this;
  }

  shift() {
    if (this.length === 0) return null;
    const first = this.elements[this.offset];
    this.offset++;

    if (this.offset * 2 < this.elements.length) return first;

    this.elements = this.elements.slice(this.offset);
    this.offset = 0;
    return first;
  }

  get length() {
    return this.elements.length - this.offset;
  }
}

module.exports = Queue;
