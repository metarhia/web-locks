'use strict';

const threads = require('worker_threads');

const { locks } = require('..');

const sleep = msec =>
  new Promise(resolve => {
    setTimeout(resolve, msec);
  });

(async () => {
  await sleep(10);
  await locks.request('A', async () => {
    await sleep(10);
    console.log(`Locked A in ${threads.threadId}`);
  });
  console.log(`Unlocked A in ${threads.threadId}`);
  threads.parentPort.postMessage({ message: 'done' });
})();
