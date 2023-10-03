'use strict';

const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const Queue = require('../lib/queue.js');

const simpleQueueBench = (QueueClass) => {
  const queue = new QueueClass();
  const iterations = 100000;
  let sum = 0;

  const timeStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    queue.push(() => i);
  }
  for (let i = 0; i < iterations; i++) {
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
