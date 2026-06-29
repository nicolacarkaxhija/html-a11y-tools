'use strict';

const path = require('path');

/** Returns the file path relative to cwd, with forward slashes. */
function relPath(filePath) {
  return path.relative(process.cwd(), filePath).replace(/\\/g, '/');
}

/** Escapes special XML/HTML characters for use in attribute values and text content. */
function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { relPath, escXml };
