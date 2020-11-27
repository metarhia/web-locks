'use strict';

const assert = require('assert').strict;
const { locks } = require('..');
const { sleep } = require('./test-utils.js');
const { TimeoutError } = require('../errors.js');

module.exports = async () => {
  await (async () => {
    const caseName = 'Should release a resource after timeout deadline';
    const startTs = Date.now();

    await locks
      .request('LockTime', { timeout: 100 }, async () => {
        await sleep(200);
      })
      .catch(() => {});

    const isCaseSuccess = Date.now() - startTs < 200;
    assert.strictEqual(isCaseSuccess, true, caseName);
  })();

  await (async () => {
    const caseName = 'Should release a resource and throw the TimeoutError';
    let error;

    await locks
      .request('LockTime', { timeout: 100 }, async () => {
        await sleep(200);
      })
      .catch(err => (error = err));

    const isCaseSuccess = error instanceof TimeoutError;
    assert.strictEqual(isCaseSuccess, true, caseName);
  })();

  await (async () => {
    const caseName = 'Should release a resource after handler complete a task';
    const startTs = Date.now();

    await locks.request('LockTime', { timeout: 200 }, async () => {
      await sleep(100);
    });

    const isCaseSuccess = Date.now() - startTs < 200;
    assert.strictEqual(isCaseSuccess, true, caseName);
  })();
};
