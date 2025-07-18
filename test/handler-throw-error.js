'use strict';

const assert = require('assert').strict;

const { locks } = require('..');

module.exports = async () => {
  assert.rejects(
    async () => {
      await locks.request('A', async () => {
        throw new Error('test');
      });
    },
    { message: 'test' },
  );
};
