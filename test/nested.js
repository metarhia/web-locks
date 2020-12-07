'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

module.exports = async () => {
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
  assert.strictEqual(lockedA, true);
  assert.strictEqual(unlockedA, true);
  assert.strictEqual(lockedB, true);
  assert.strictEqual(unlockedB, true);
};
