'use strict';

const { EventEmitter } = require('events');
const threads = require('worker_threads');
const { isMainThread, parentPort } = threads;
const isWorkerThread = !isMainThread;

const LOCKED = 0;
const UNLOCKED = 1;

let locks = null; // LockManager instance

class Lock {
  constructor(name, mode = 'exclusive', buffer = null) {
    this.name = name;
    this.mode = mode; // 'exclusive' or 'shared'
    this.queue = [];
    this.owner = false;
    this.trying = false;
    this.buffer = buffer ? buffer : new SharedArrayBuffer(4);
    this.flag = new Int32Array(this.buffer, 0, 1);
    if (!buffer) Atomics.store(this.flag, 0, UNLOCKED);
  }

  enter(handler) {
    return new Promise((resolve) => {
      this.queue.push({ handler, resolve });
      this.trying = true;
      setTimeout(() => {
        this.tryEnter();
      }, 0);
    });
  }

  tryEnter() {
    if (this.queue.length === 0) return;
    const prev = Atomics.exchange(this.flag, 0, LOCKED);
    if (prev === LOCKED) return;
    this.owner = true;
    this.trying = false;
    const { handler, resolve } = this.queue.shift();
    handler(this).finally(() => {
      this.leave();
      resolve();
    });
  }

  leave() {
    if (!this.owner) return;
    Atomics.store(this.flag, 0, UNLOCKED);
    this.owner = false;
    const message = { webLocks: true, kind: 'leave', name: this.name };
    locks.send(message);
    this.tryEnter();
  }
}

class LockManagerSnapshot {
  constructor(resources) {
    const held = [];
    const pending = [];
    this.held = held;
    this.pending = pending;

    for (const lock of resources) {
      if (lock.queue.length > 0) {
        pending.push(...lock.queue);
      }
      if (lock.owner) {
        held.push(lock);
      }
    }
  }
}

class LockManager {
  constructor() {
    this.collection = new Map();
    this.workers = new Set();
    if (isWorkerThread) {
      parentPort.on('message', (message) => {
        this.receive(message);
      });
    }
  }

  async request(name, options, handler) {
    if (typeof options === 'function') {
      handler = options;
      options = {};
    }
    const { mode = 'exclusive', signal = null } = options;

    let lock = this.collection.get(name);
    if (!lock) {
      lock = new Lock(name, mode);
      this.collection.set(name, lock);
      const { buffer } = lock;
      const message = { webLocks: true, kind: 'create', name, mode, buffer };
      locks.send(message);
    }

    const finished = lock.enter(handler);
    let aborted = null;
    if (signal) {
      aborted = new Promise((resolve, reject) => {
        signal.on('abort', reject);
      });
      await Promise.race([finished, aborted]);
    } else {
      await finished;
    }

    setTimeout(() => {
      lock.tryEnter();
    }, 0);

    return undefined;
  }

  query() {
    const snapshot = new LockManagerSnapshot();
    return Promise.resolve(snapshot);
  }

  attach(worker) {
    this.workers.add(worker);
    worker.on('message', (message) => {
      for (const peer of this.workers) {
        if (peer !== worker) {
          peer.postMessage(message);
        }
      }
      this.receive(message);
    });
  }

  send(message) {
    if (isWorkerThread) {
      parentPort.postMessage(message);
      return;
    }
    for (const worker of this.workers) {
      worker.postMessage(message);
    }
  }

  receive(message) {
    if (!message.webLocks) return;
    const { kind, name, mode, buffer } = message;
    if (kind === 'create') {
      const lock = new Lock(name, mode, buffer);
      this.collection.set(name, lock);
      return;
    }
    if (kind === 'leave') {
      for (const lock of this.collection.values()) {
        if (lock.name === name && lock.trying) {
          lock.tryEnter();
        }
      }
    }
  }
}

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

locks = new LockManager();

module.exports = { locks, AbortController };
