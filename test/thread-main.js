'use strict';

const threads = require('worker_threads');

module.exports = () =>
  new Promise(resolve => {
    const workerFile = './test/thread-worker.js';
    const worker1 = new threads.Worker(workerFile);
    const worker2 = new threads.Worker(workerFile);

    let counter = 0;
    const done = message => {
      console.log({ message });
      counter++;
      if (counter === 2) {
        console.log('All workers done');
        resolve();
      }
    };

    worker1.on('message', done);
    worker2.on('message', done);
  });
