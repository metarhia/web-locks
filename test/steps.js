'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

const sleep = msec =>
  new Promise(resolve => {
    setTimeout(resolve, msec);
  });

let counter = 0;

const step = current => {
  assert.strictEqual(counter, current);
  counter++;
};

(async () => {
  step(0);
  await locks.request('A', async () => {
    step(1);
    await sleep(20);
    step(3);
  });
  step(4);
})();

(async () => {
  await sleep(10);
  step(2);
  await locks.request('A', async () => {
    step(5);
    await sleep(10);
    step(6);
  });
  step(7);
})();
