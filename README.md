# Web Locks API

[![TravisCI](https://travis-ci.org/metarhia/web-locks.svg?branch=master)](https://travis-ci.org/metarhia/)
[![NPM Version](https://badge.fury.io/js/web-locks.svg)](https://badge.fury.io/js/web-locks)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/web-locks.svg)](https://www.npmjs.com/package/web-locks)
[![NPM Downloads](https://img.shields.io/npm/dt/web-locks.svg)](https://www.npmjs.com/package/web-locks)

Web Locks API implementation for Node.js based on `worker_threads`, `Atomics`,
`SharedArrayBuffer`, asynchronous functions, and queue.

See specification: https://wicg.github.io/web-locks/
and documentation: https://developer.mozilla.org/en-US/docs/Web/API/Lock

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
