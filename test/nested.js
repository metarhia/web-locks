'use strict';

const test = require('node:test');
const assert = require('assert').strict;

const { locks } = require('..');

test('Exclusive lock', async () => {
  let lockedA = false;
  let unlockedA = false;
  let lockedB = false;
  let unlockedB = false;
  await locks.request('A', async (lock) => {
    lockedA = true;
    assert.ok(lock);
    await locks.request('B', async (lock) => {
      lockedB = true;
      assert.ok(lock);
    });
    unlockedB = true;
  });
  unlockedA = true;
  assert.equal(lockedA, true);
  assert.equal(unlockedA, true);
  assert.equal(lockedB, true);
  assert.equal(unlockedB, true);
});
