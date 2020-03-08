'use strict';

const { locks } = require('.');

(async () => {
  console.log('Going to lock resource A');
  await locks.request('A', async lock => {
    console.log('Locked resource A');
    console.log({ lock });
    console.log('Going to lock resource B');
    await locks.request('B', async lock => {
      console.log('Locked resource B');
      console.log({ lock });
      console.log('Going to unlock resource B');
    });
    console.log('Unlocked resource B');
    console.log('Going to unlock resource A');
  });
  console.log('Unlocked resource A');
})();
