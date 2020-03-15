'use strict';

const tests = [
  'simple',
  'nested',
  'steps',
  'exclusive',
  'deadlock',
  'recursive-deadlock',
  'thread-main',
];

(async () => {
  for (const name of tests) {
    console.log(`Test: ${name}`);
    const fileName = `./test/${name}.js`;
    const test = require(fileName);
    await test();
  }
})();
