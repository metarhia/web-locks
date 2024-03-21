'use strict';

const path = require('path');
const threads = require('worker_threads');
const { locks } = require('../..');

const startWork = () =>
  new Promise(resolve => {
    const workerFile = path.resolve(__dirname, 'thread-worker.js');

    const resource = new SharedArrayBuffer(8);

    const worker1 = new threads.Worker(workerFile, { workerData: resource });
    const worker2 = new threads.Worker(workerFile, { workerData: resource });
    const worker3 = new threads.Worker(workerFile, { workerData: resource });

    locks.attach(worker1);
    locks.attach(worker2);
    locks.attach(worker3);

    let counter = 0;
    const done = message => {
      if (message.status === 'done') {
        counter++;
        if (counter === 3) {
          console.log('After processing:', resource);

          resolve();
        }
      }
    };

    worker1.on('message', done);
    worker2.on('message', done);
    worker3.on('message', done);

    locks.request('resource', async () => {
      worker1.postMessage({ isMyProgram: true, task: 'someWorkWithData' });
      worker2.postMessage({ isMyProgram: true, task: 'someWorkWithData' });
      worker3.postMessage({ isMyProgram: true, task: 'someWorkWithData' });
    });
  });

startWork();
