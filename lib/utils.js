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

  for (key in input) {
    if (key.length > maxWidth) {
      maxWidth = key.length;
    }
  }
  return maxWidth;
};