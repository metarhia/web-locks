'use strict';

const sleep = msec =>
  new Promise(resolve => {
    setTimeout(resolve, msec);
  });

module.exports = {
  sleep,
};
