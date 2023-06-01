'use strict';

const assert = require('assert').strict;

const { locks, AbortController } = require('..');

const TIMEOUT = 100;

module.exports = async () => {
  const abortController = new AbortController();
  await locks.request('DEFAULT', async lock => {
    assert.strictEqual(lock.mode, 'exclusive');
  });

  await locks.request('EXCLUSIVE', { mode: 'exclusive' }, async lock => {
    assert.strictEqual(lock.mode, 'exclusive');
  });

  await locks.request('SHARED', { mode: 'shared' }, async lock => {
    assert.strictEqual(lock.mode, 'shared');
  });

  await locks.request(
    'WITH_ABORT',
    () =>
      new Promise(resolve => {
        setTimeout(() => resolve(), TIMEOUT);
      })
  );

  locks
    .request('WITH_ABORT', { signal: abortController.signal }, async () => {})
    .catch(error => {
      assert.strictEqual(error.message, 'The request was aborted');
    });

  abortController.abort();
};
