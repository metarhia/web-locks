'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

const TEST_TIMEOUT = 100;

module.exports = async () =>
  new Promise((resolve) => {
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

    (async () => {
      setTimeout(() => {
        assert.strictEqual(flag1, true);
        assert.strictEqual(flag2, false);
        resolve();
      }, TEST_TIMEOUT);
    })();
  });
