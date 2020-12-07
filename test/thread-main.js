'use strict';

const threads = require('worker_threads');
const { locks } = require('..');

const TEST_TIMEOUT = 1000;

module.exports = () =>
  new Promise((resolve) => {
    const workerFile = './test/thread-worker.js';

    const worker1 = new threads.Worker(workerFile);
    const worker2 = new threads.Worker(workerFile);

    locks.attach(worker1);
    locks.attach(worker2);

    let counter = 0;
    const done = (message) => {
      if (message.status === 'done') {
        counter++;
        if (counter === 2) resolve();
      }
    };

    worker1.on('message', done);
    worker2.on('message', done);

    setTimeout(() => {
      worker1.terminate();
      worker2.terminate();
      resolve();
    }, TEST_TIMEOUT);
  });
