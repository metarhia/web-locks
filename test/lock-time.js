'use strict';

const assert = require('assert').strict;
const { locks } = require('..');
const { sleep } = require('./test-utils');

const TIME_TO_PROCESS = 2000;
const TIME_TO_LOCK = 100;

module.exports = async () => {
  const startTs = Date.now();

  await locks.request('LockTime', { timeout: TIME_TO_LOCK }, async () => {
    await sleep(TIME_TO_PROCESS);
  });

  assert.strictEqual(Date.now() - startTs < TIME_TO_PROCESS, true);
};
