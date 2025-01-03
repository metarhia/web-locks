'use strict';

const test = require('node:test');
const assert = require('assert').strict;

const { locks } = require('..');

test('Exclusive lock', async () => {
  let locked = false;
  let unlocked = false;
  await locks.request('A', async (lock) => {
    assert.ok(lock);
    locked = true;
    assert.equal(unlocked, false);
  });
  unlocked = true;
  assert.equal(locked, true);
  assert.equal(unlocked, true);
});
