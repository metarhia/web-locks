'use strict';

const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const Queue = require('../lib/queue');

const simpleQueueBench = (queueClass) => {
  const queue = new queueClass();
  let sum = 0;

  const timeStart = performance.now();
  for (let i = 0; i < 100_000; i++) {
    queue.push(() => i);
  }
  for (let i = 0; i < 100_000; i++) {
    sum += queue.shift()();
  }
  const timeEnd = performance.now();

  const execTime = timeEnd - timeStart;
  return { sum, execTime };
};

module.exports = async () => {
  const testedClasses = [Array, Queue];

  const [arrayResult, queueResult] = testedClasses.map(simpleQueueBench);
  const { sum: arraySum, execTime: arrayExecTime } = arrayResult;
  const { sum: queueSum, execTime: queueExecTime } = queueResult;

  const isQueueFaster = arrayExecTime > queueExecTime;

  assert.strictEqual(queueSum, arraySum);
  assert.strictEqual(isQueueFaster, true);
};
