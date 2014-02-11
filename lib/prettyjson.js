'use strict';

// ### Module dependencies
require('colors');
var Utils = require('./utils');

exports.version = require('../package.json').version;

// ### Render function
// *Parameters:*
//
// * **`data`**: Data to render
// * **`options`**: Hash with different options to configure the parser
// * **`indentation`**: Base indentation of the parsed output
//
// *Example of options hash:*
//
//     {
//       emptyArrayMsg: '(empty)', // Rendered message on empty strings
//       keysColor: 'blue',        // Color for keys in hashes
//       dashColor: 'red',         // Color for the dashes in arrays
//       stringColor: 'grey',      // Color for strings
//       defaultIndentation: 2     // Indentation on nested objects
//     }
exports.render = function render(data, options, indentation) {

  // Default values
  indentation = indentation || 0;
  options = options || {};
  options.emptyArrayMsg = options.emptyArrayMsg || '(empty array)';
  options.keysColor = options.keysColor || 'green';
  options.dashColor = options.dashColor || 'green';
  options.numberColor = options.numberColor || 'blue';
  options.defaultIndentation = options.defaultIndentation || 2;

  options.stringColor = options.stringColor || null;

  var output = [];

  // Helper function to detect if an object can be directly serializable
  var isSerializable = function(input) {
    if (typeof input === 'string' || typeof input === 'boolean' ||
        typeof input === 'number' || input === null) {
      return true;
    }
    return false;
  };

  var addColorToData = function(input) {
    if (typeof input === 'string') {
      // Print strings in regular terminal color
      return options.stringColor ? input[options.stringColor] : input;
    }

    if (input === true) {
      return (input+'').green;
    }
    if (input === false) {
      return (input+'').red;
    }
    if (input === null) {
      return (input+'').grey;
    }
    if (typeof input === 'number') {
      return (input+'')[options.numberColor];
    }
    return (input+'');
  };

  // Render a string exactly equal
  if (isSerializable(data)) {
    output.push(Utils.indent(indentation) + addColorToData(data));
  }
  else if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0) {
      output.push(Utils.indent(indentation) + options.emptyArrayMsg);
    } else {
      data.forEach(function(element) {
        // Prepend the dash at the begining of each array's element line
        var line = Utils.indent(indentation) + ('- ')[options.dashColor];

        // If the element of the array is a string, bool, number, or null
        // render it in the same line
        if (isSerializable(element)) {
          line += exports.render(element, options);
          output.push(line);

        // If the element is an array or object, render it in next line
        } else {
          output.push(line);
          output.push(exports.render(
            element, options, indentation + options.defaultIndentation
          ));
        }
      });
    }
  }
  else if (typeof data === 'object') {
    // Get the size of the longest index to align all the values
    var maxIndexLength = Utils.getMaxIndexLength(data);
    var key;
    var isError = data instanceof Error;

    Object.getOwnPropertyNames(data).forEach(function(i) {
      // Prepend the index at the beginning of the line
      key = Utils.indent(indentation) + (i + ': ')[options.keysColor];

      // Skip `undefined`, it's not a valid JSON value.
      if (data[i] === undefined) {
        return;
      }

      // If the value is serializable, render it in the same line
      if (isSerializable(data[i]) && (!isError || i !== 'stack')) {
        key += exports.render(data[i], options, maxIndexLength - i.length);
        output.push(key);

        // If the index is an array or object, render it in next line
      } else {
        output.push(key);
        output.push(
          exports.render(
            isError && i === 'stack' ? data[i].split('\n') : data[i],
            options,
            indentation + options.defaultIndentation
          )
        );
      }
    });
  }
  // Return all the lines as a string
  return output.join('\n');
};

// ### Render from string function
// *Parameters:*
//
// * **`data`**: Data to render as a string
// * **`options`**: Hash with different options to configure the parser
// * **`indentation`**: Base indentation of the parsed output
//
// *Example of options hash:*
//
//     {
//       emptyArrayMsg: '(empty)', // Rendered message on empty strings
//       keysColor: 'blue',        // Color for keys in hashes
//       dashColor: 'red',         // Color for the dashes in arrays
//       defaultIndentation: 2     // Indentation on nested objects
//     }
exports.renderString = function renderString(data, options, indentation) {

  var output = '';
  var parsedData;
  // If the input is not a string or if it's empty, just return an empty string
  if (typeof data !== 'string' || data === '') {
    return '';
  }

  // Remove non-JSON characters from the beginning string
  if (data[0] !== '{' && data[0] !== '[') {
    var beginingOfJson;
    if (data.indexOf('{') === -1) {
      beginingOfJson = data.indexOf('[');
    } else if (data.indexOf('[') === -1) {
      beginingOfJson = data.indexOf('{');
    } else if (data.indexOf('{') < data.indexOf('[')) {
      beginingOfJson = data.indexOf('{');
    } else {
      beginingOfJson = data.indexOf('[');
    }
    output += data.substr(0, beginingOfJson) + '\n';
    data = data.substr(beginingOfJson);
  }

  try {
    parsedData = JSON.parse(data);
  } catch (e) {
    // Return an error in case of an invalid JSON
    return 'Error:'.red + ' Not valid JSON!';
  }

  // Call the real render() method
  output += exports.render(parsedData, options, indentation);
  return output;
};
