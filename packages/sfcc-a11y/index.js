'use strict';

/**
 * Programmatic API for sfcc-a11y.
 * Pass file paths, directory paths, or glob patterns.
 */
const { lint } = require('./lib/linter.js');

module.exports = { lint };
