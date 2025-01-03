'use strict';

const test = require('node:test');
const assert = require('assert').strict;

const { locks } = require('..');

test('Deadlock', async () => {
  let flag1 = false;
  let flag2 = false;
  let flag3 = false;
  let flag4 = false;

  (async () => {
    await locks.request('C', async () => {
      flag1 = true;
      await locks.request('D', async () => {
        flag2 = true;
      });
    });
  })();

  (async () => {
    await locks.request('D', async () => {
      flag3 = true;
      await locks.request('C', async () => {
        flag4 = true;
      });
    });
  })();

  let resolve = null;
  const promise = new Promise((r) => {
    resolve = r;
  });
  setTimeout(() => {
    assert.equal(flag1, true);
    assert.equal(flag2, false);
    assert.equal(flag3, true);
    assert.equal(flag4, false);
    resolve();
  }, 100);

  return promise;
});

test('Recursive deadlock', async () => {
  let flag1 = false;
  let flag2 = false;

  (async () => {
    await locks.request('E', async () => {
      flag1 = true;
      await locks.request('E', async () => {
        flag2 = true;
      });
    });
  })();

  let resolve = null;
  const promise = new Promise((r) => {
    resolve = r;
  });
  setTimeout(() => {
    assert.equal(flag1, true);
    assert.equal(flag2, false);
    resolve();
  }, 100);

  return promise;
});
