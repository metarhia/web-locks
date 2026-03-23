'use strict';

const init = require('eslint-config-metarhia');

const config = [...init];
config[0].rules = { ...config[0].rules, 'class-methods-use-this': 'off' };

module.exports = config;
