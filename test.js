'use strict';

const tests = ['steps'];

for (const name of tests) {
  const fileName = `./test/${name}.js`;
  require(fileName);
}
