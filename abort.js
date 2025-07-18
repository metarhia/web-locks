'use strict';

const { EventEmitter } = require('events');

class AbortError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AbortError';
  }
}

class AbortSignal extends EventEmitter {
  constructor() {
    super();
    this.aborted = false;
    this.on('abort', () => {
      this.aborted = true;
    });
  }
}

class AbortController {
  constructor() {
    this.signal = new AbortSignal();
  }

  abort() {
    const error = new AbortError('The request was aborted');
    this.signal.emit('abort', error);
  }
}

module.exports = { AbortController, AbortSignal, AbortError };
