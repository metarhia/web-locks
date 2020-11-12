# Web Locks API [![CI Status](https://github.com/metarhia/web-locks/workflows/Testing%20CI/badge.svg)](https://github.com/metarhia/web-locks/actions?query=workflow%3A%22Testing+CI%22+branch%3Amaster) [![npm version](https://img.shields.io/npm/v/web-locks.svg?style=flat)](https://www.npmjs.com/package/web-locks) [![npm downloads/month](https://img.shields.io/npm/dm/web-locks.svg)](https://www.npmjs.com/package/web-locks) [![npm downloads](https://img.shields.io/npm/dt/web-locks.svg)](https://www.npmjs.com/package/web-locks) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/metarhia/web-locks/blob/master/LICENSE)

[Web Locks API](https://developer.mozilla.org/en-US/docs/Web/API/Lock)
implementation for [Node.js](https://nodejs.org/en/) based on
[`worker_threads`](https://nodejs.org/api/worker_threads.html),
[`Atomics`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics),
[`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer),
[asynchronous functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function),
and [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)).

See specification: [wicg.github.io/web-locks/](https://wicg.github.io/web-locks/)
and documentation: [developer.mozilla.org/en-US/docs/Web/API/Lock](https://developer.mozilla.org/en-US/docs/Web/API/Lock)

This implementation is a part of [Metarhia](https://github.com/metarhia/)
technology stack, needed for the first pilot project of Node.js application
server based on parallel programming and workload micro-isolation. Web Locks
API is intended to be merged into Node.js in future.

## Features

* Simplest parallel programming primitive to solve a problem of data races and
race conditions.
* Node.js and [`worker_threads`](https://nodejs.org/api/worker_threads.html)
support.
* Different optimized implementations for certain cases: single-threaded
asynchronous locks, multi-threaded locks with a single unifyed API.

## Installation

```bash
$ npm install web-locks
```

## Usage

```js
await locks.request('Resource name', async lock => {
  // use named resource and release it after return
});
```

## License

This implementation of Web Locks API is [MIT licensed](./LICENSE).
