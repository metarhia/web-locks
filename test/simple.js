'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

module.exports = async () => {
  let locked = false;
  let unlocked = false;
  await locks.request('A', async (lock) => {
    assert.ok(lock);
    locked = true;
    assert.strictEqual(unlocked, false);
  });
  unlocked = true;
  assert.strictEqual(locked, true);
  assert.strictEqual(unlocked, true);
};
