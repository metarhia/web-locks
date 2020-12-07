'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

const TEST_TIMEOUT = 100;

module.exports = async () =>
  new Promise((resolve) => {
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

    (async () => {
      setTimeout(() => {
        assert.strictEqual(flag1, true);
        assert.strictEqual(flag2, false);
        assert.strictEqual(flag3, true);
        assert.strictEqual(flag4, false);
        resolve();
      }, TEST_TIMEOUT);
    })();
  });
