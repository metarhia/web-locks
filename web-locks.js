'use strict';

const threads = require('worker_threads');
const { isMainThread, parentPort } = threads;
const isWorkerThread = !isMainThread;

const abort = global.AbortController ? global : require('./abort.js');
const { AbortController, AbortSignal, AbortError } = abort;

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
    this.buffer = buffer ?? new SharedArrayBuffer(4);
    this.flag = new Int32Array(this.buffer, 0, 1);
    if (!buffer) Atomics.store(this.flag, 0, UNLOCKED);
  }

  enter(handler) {
    return new Promise((resolve, reject) => {
      const entry = { handler, resolve, reject, cancelled: false };
      this.queue.push(entry);
      this.trying = true;
      setTimeout(() => this.tryEnter(), 0);
    });
  }

  cancel(handler) {
    const index = this.queue.findIndex((entry) => entry.handler === handler);
    if (index === -1) return false;
    const entry = this.queue.splice(index, 1)[0];
    entry.cancelled = true;
    if (this.queue.length === 0) this.trying = false;
    return true;
  }

  tryEnter() {
    if (this.queue.length === 0) return;
    const prev = Atomics.exchange(this.flag, 0, LOCKED);
    if (prev === LOCKED) return;
    this.owner = true;
    this.trying = false;
    const { handler, resolve, reject, cancelled } = this.queue.shift();
    if (cancelled) return void this.leave();
    handler(this)
      .then(() => {
        this.leave();
        resolve();
      })
      .catch((error) => {
        this.leave();
        reject(error);
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
      if (lock.queue.length > 0) pending.push(...lock.queue);
      if (lock.owner) held.push(lock);
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
    if (mode !== 'exclusive') {
      throw new TypeError(`Unsupported lock mode: ${mode}`);
    }
    if (signal?.aborted) {
      const reason = signal.reason ?? new AbortError('The request was aborted');
      throw reason;
    }
    let lock = this.collection.get(name);
    if (!lock) {
      lock = new Lock(name, mode);
      this.collection.set(name, lock);
      const { buffer } = lock;
      const message = { webLocks: true, kind: 'create', name, mode, buffer };
      locks.send(message);
    }
    const finished = lock.enter(handler);
    if (!signal) {
      await finished;
      setTimeout(() => lock.tryEnter(), 0);
      return undefined;
    }
    let onAbort = null;
    const aborted = new Promise((_, reject) => {
      onAbort = () => {
        const reason =
          signal.reason ?? new AbortError('The request was aborted');
        reject(reason);
      };
      if (typeof signal.addEventListener === 'function') {
        signal.addEventListener('abort', onAbort, { once: true });
      } else if (typeof signal.on === 'function') {
        signal.once('abort', onAbort);
      }
    });
    try {
      await Promise.race([finished, aborted]);
    } catch (error) {
      lock.cancel(handler);
      throw error;
    } finally {
      if (onAbort) {
        if (typeof signal.removeEventListener === 'function') {
          signal.removeEventListener('abort', onAbort);
        } else if (typeof signal.off === 'function') {
          signal.off('abort', onAbort);
        }
      }
    }
    setTimeout(() => lock.tryEnter(), 0);
    return undefined;
  }

  query() {
    const snapshot = new LockManagerSnapshot(this.collection.values());
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
      const existing = this.collection.get(name);
      if (existing) {
        if (!existing.owner && existing.queue.length === 0 && buffer) {
          existing.buffer = buffer;
          existing.flag = new Int32Array(buffer, 0, 1);
        }
        return;
      }
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

locks = new LockManager();

module.exports = { locks, AbortController, AbortSignal, AbortError };
