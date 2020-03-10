'use strict';

const tests = ['nested', 'simple'];

for (const name of tests) {
  const fileName = `./test/${name}.js`;
  require(fileName);
}
