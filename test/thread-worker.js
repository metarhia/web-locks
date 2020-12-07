'use strict';

const threads = require('worker_threads');

const { locks } = require('..');

const sleep = (msec) =>
  new Promise((resolve) => {
    setTimeout(resolve, msec);
  });

(async () => {
  if (threads.threadId === 2) {
    await sleep(10);
  }
  await locks.request('A', async () => {
    if (threads.threadId === 1) {
      await sleep(50);
    } else {
      await sleep(10);
    }
  });
  threads.parentPort.postMessage({ status: 'done' });
  await sleep(10);
  process.exit(0);
})();
