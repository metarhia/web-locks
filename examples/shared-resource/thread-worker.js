'use strict';

const threads = require('worker_threads');
const { locks } = require('../../');

const SLEEPING_TIME_MS = 1000;

const sleep = () =>
  new Promise(resolve => {
    setTimeout(resolve, SLEEPING_TIME_MS);
  });

const someWorkWithData = async () => {
  await locks.request('resource', {}, async () => {
    await sleep();
    const view = new Int8Array(threads.workerData);
    for (let i = 0; i < view.length; i++) {
      view[i] *= threads.threadId;
      view[i] += threads.threadId;
    }

    console.log('info', threads.threadId, view);
  });
  threads.parentPort.postMessage({ status: 'done' });
  process.exit(0);
};

const worksMapper = {
  someWorkWithData,
};

threads.parentPort.on('message', async message => {
  if (!message.isMyProgram) {
    return;
  }

  await worksMapper[message.task]();
});
