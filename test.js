'use strict';

const tests = ['simple', 'nested', 'steps'];

(async () => {
  for (const name of tests) {
    const fileName = `./test/${name}.js`;
    const test = require(fileName);
    await test();
  }
})();
