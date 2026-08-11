# Web Locks API [![CI Status](https://github.com/metarhia/web-locks/workflows/Testing%20CI/badge.svg)](https://github.com/metarhia/web-locks/actions?query=workflow%3A%22Testing+CI%22+branch%3Amaster) [![npm version](https://img.shields.io/npm/v/web-locks.svg?style=flat)](https://www.npmjs.com/package/web-locks) [![npm downloads/month](https://img.shields.io/npm/dm/web-locks.svg)](https://www.npmjs.com/package/web-locks) [![npm downloads](https://img.shields.io/npm/dt/web-locks.svg)](https://www.npmjs.com/package/web-locks) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metarhia/web-locks/blob/master/LICENSE)

[Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Lock)
implementation for [Node.js](https://nodejs.org/en/) based on
[`worker_threads`](https://nodejs.org/api/worker_threads.html),
[`Atomics`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics),
[`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer),
[asynchronous functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function),
and [queue](<https://en.wikipedia.org/wiki/Queue_(abstract_data_type)>).

See specification: [wicg.github.io/web-locks/](https://wicg.github.io/web-locks/)
and documentation: [developer.mozilla.org/en-US/docs/Web/API/Lock](https://developer.mozilla.org/en-US/docs/Web/API/Lock)

This implementation is a part of [Metarhia](https://github.com/metarhia/)
technology stack, needed for the first pilot project of Node.js application
server based on parallel programming and workload micro-isolation. Web Locks
API is intended to be merged into Node.js in future.

## Features

- Simplest parallel programming primitive to solve a problem of data races and
  race conditions.
- Node.js and [`worker_threads`](https://nodejs.org/api/worker_threads.html)
  support.
- Unified API for single-threaded asynchronous locks and multi-threaded locks.
- Exclusive lock mode (default).
- `AbortSignal` support to cancel a lock request while waiting.
- TypeScript typings included.

## Installation

```bash
$ npm install web-locks
```

## Usage

```js
const { locks, AbortController } = require('web-locks');

// Exclusive lock (default)
await locks.request('Resource name', async (lock) => {
  // use named resource; it is released after the callback settles
});

// Cancel a waiting request with AbortSignal
const controller = new AbortController();
const pending = locks.request(
  'Resource name',
  { signal: controller.signal },
  async () => {
    // critical section
  },
);
controller.abort(); // rejects pending with AbortError
```

Attach workers so locks are coordinated across threads:

```js
const { Worker } = require('worker_threads');
const { locks } = require('web-locks');

const worker = new Worker('./worker.js');
locks.attach(worker);
```

## API

### `locks.request(name, handler): Promise<undefined>`

### `locks.request(name, options, handler): Promise<undefined>`

- `name: string` — resource name
- `options.mode?: 'exclusive'` — only `exclusive` is supported
- `options.signal?: AbortSignal` — abort waiting for the lock
- `handler: (lock: Lock) => void | Promise<void>` — runs while holding the lock

Already-aborted signals reject immediately. Aborting while waiting cancels the
queued request and rejects with `AbortError` (or `signal.reason` when set).

### `locks.query(): Promise<LockManagerSnapshot>`

- `held: Array<LockInfo>` — currently held locks
- `pending: Array<LockInfo>` — queued lock requests

### `locks.attach(worker): void`

Registers a `worker_threads.Worker` for cross-thread lock coordination.

### Exports

- `locks: LockManager`
- `AbortController`, `AbortSignal`, `AbortError` — native when available,
  otherwise a small polyfill

## License

This implementation of Web Locks API is [MIT licensed](./LICENSE).
