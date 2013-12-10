"use strict";

/**
 * Creates a string with the same length as `numSpaces` parameter
 **/
exports.indent = function indent(numSpaces) {
  return new Array(numSpaces+1).join(' ');
};

/**
 * Gets the string length of the longer index in a hash
 **/
exports.getMaxIndexLength = function(input) {
  var maxWidth = 0;
  var key;

  Object.getOwnPropertyNames(input).forEach(function(key) {
    maxWidth = Math.max(maxWidth, key.length);
  });
  return maxWidth;
};
