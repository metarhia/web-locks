'use strict';

const test = require('node:test');
const threads = require('node:worker_threads');

const { locks } = require('..');

const sleep = (msec) =>
  new Promise((resolve) => {
    setTimeout(resolve, msec);
  });

if (threads.isMainThread) {
  const workerFile = './test/threads.js';

  const worker1 = new threads.Worker(workerFile);
  const worker2 = new threads.Worker(workerFile);

  locks.attach(worker1);
  locks.attach(worker2);

  setTimeout(() => {
    worker1.terminate();
    worker2.terminate();
  }, 100);
} else {
  test('Worker threads', async () => {
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
    await sleep(10);
    process.exit(0);
  });
}
