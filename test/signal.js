'use strict';

const assert = require('assert').strict;
const { locks, AbortController } = require('..');

const sleep = msec =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, msec);
  });

module.exports = async () => {
  const startTs = Date.now();

  const abortController = new AbortController();
  const options = { mode: 'exclusive', signal: abortController.signal };
  let hasErrorOccurred = false;

  setTimeout(() => abortController.abort(), 500);

  await locks
    .request('A', options, async () => {
      await sleep(1000);
    })
    .catch(() => {
      hasErrorOccurred = true;
    });

  const endTs = Date.now();
  assert.strictEqual(endTs - startTs < 1000, true, 'Lock should be aborted');
  assert.strictEqual(hasErrorOccurred, true, 'Error should  occur');
};
