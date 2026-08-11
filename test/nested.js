'use strict';

const test = require('node:test');

const assert = require('assert').strict;
const { locks } = require('..');

test('Exclusive lock', async () => {
  let lockedA = false;
  let unlockedA = false;
  let lockedB = false;
  let unlockedB = false;
  await locks.request('A', async (lockA) => {
    lockedA = true;
    assert.ok(lockA);
    await locks.request('B', async (lockB) => {
      lockedB = true;
      assert.ok(lockB);
    });
    unlockedB = true;
  });
  unlockedA = true;
  assert.strictEqual(lockedA, true);
  assert.strictEqual(unlockedA, true);
  assert.strictEqual(lockedB, true);
  assert.strictEqual(unlockedB, true);
});
