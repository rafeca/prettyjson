'use strict';

/**
 * Creates a string with the same length as `numSpaces` parameter
 **/
exports.indent = function indent(numSpaces) {
  return new Array(numSpaces+1).join(' ');
};

exports.removeTrailingComma = function removeTrailingComma(output) {
  var lastLine = (output.length - 1);

  output[lastLine] = output[lastLine].replace(/, *$/, '');
}

/**
 * Gets the string length of the longer index in a hash
 **/
exports.getMaxIndexLength = function(input) {
  var maxWidth = 0;

  Object.getOwnPropertyNames(input).forEach(function(key) {
    // Skip undefined values.
    if (input[key] === undefined) {
      return;
    }

    maxWidth = Math.max(maxWidth, key.length);
  });
  return maxWidth;
};
