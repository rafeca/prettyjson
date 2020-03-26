'use strict';

// ### Module dependencies
var colors = require('colors/safe');
var Utils = require('./utils');
var Pathify = require('path-ify');

exports.version = require('../package.json').version;

// Helper function to detect if an object can be directly serializable
var isSerializable = function(input, onlyPrimitives, options) {
  if (
    typeof input === 'boolean' ||
    typeof input === 'number' ||
    typeof input === 'function' ||
    input === null ||
    input instanceof Date
  ) {
    return true;
  }
  if (typeof input === 'string' && input.indexOf('\n') === -1) {
    return true;
  }

  if (options.inlineArrays && !onlyPrimitives) {
    if (Array.isArray(input) && isSerializable(input[0], true, options)) {
      return true;
    }
  }

  return false;
};

var addColorToData = function(input, options) {
  if (options.noColor) {
    return input;
  }

  if (typeof input === 'string') {
    // Print strings in regular terminal color
    return options.stringColor ? colors[options.stringColor](input) : input;
  }

  var sInput = input + '';

  if (input === true) {
    return colors.green(sInput);
  }
  if (input === false) {
    return colors.red(sInput);
  }
  if (input === null) {
    return colors.grey(sInput);
  }
  if (typeof input === 'number') {
    return colors[options.numberColor](sInput);
  }
  if (typeof input === 'function') {
    return 'function() {}';
  }

  if (Array.isArray(input)) {
    return input.join(', ');
  }

  return sInput;
};

var colorMultilineString = function(options, line) {
    if (options.multilineStringColor === null || options.noColor) {
        return line;
    } else {
        return colors[options.multilineStringColor](line);
    }
};

var indentLines = function(string, spaces, options){
  var lines = string.split('\n');
  lines = lines.map(function(line){
    return Utils.indent(spaces) + colorMultilineString(options, line);
  });
  return lines.join('\n');
};

var includeTokens = function(token, options) {
  if (options.format === 'simple') {
    return '';
  }

  if (options.noColor) {
    return token;

  }

  return colors.grey(token);
  // return colors.red(token);
};

var printData = function(indentation, data, options, omitLastComma) {
  if (typeof data === 'function' || typeof data === 'string') {
    return [
      Utils.indent(indentation) +
      includeTokens('"', options) +
      addColorToData(data, options) +
      includeTokens('"', options) +
      ( omitLastComma ? '' :  includeTokens(',', options))
    ];
  }

  if (omitLastComma) {
    return [Utils.indent(indentation) + addColorToData(data, options)];
  }

  return [
    Utils.indent(indentation) +
    addColorToData(data, options) +
    includeTokens(',', options)
  ];
};


var renderToArray = function(data, options, indentation, elementLength) {
  var closingTag;
  if (isSerializable(data, false, options)) {
    return printData(indentation, data, options, (elementLength <= 0));
  }

  // Unserializable string means it's multiline
  if (typeof data === 'string') {
    return [
      Utils.indent(indentation) + colorMultilineString(options, '"""'),
      indentLines(data, indentation + options.defaultIndentation, options),
      Utils.indent(indentation) + colorMultilineString(options, '"""')
    ];
  }


  if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0 && options.format === 'simple') {
      return [Utils.indent(indentation) + options.emptyArrayMsg];
    }

    var outputArray = [];

    data.forEach(function(element) {
      // Prepend the dash at the beginning of each array's element line
      var line = (options.format !== 'simple' ? ' ' : '- ');
      var size;
      if (!options.noColor) {
        line = colors[options.dashColor](line);
      }
      line = Utils.indent(indentation) + line;

      // If the element of the array is a string, bool, number, or null
      // render it in the same line
      if (isSerializable(element, false, options)) {
        line += renderToArray(element, options, 0, --elementLength)[0];
        outputArray.push(line);

      // If the element is an array or object, render it in next line
      } else {
        if (typeof element === 'object' && options.format !== 'simple') {
          size = (Array.isArray(element)
            ? element.length
            : Object.keys(element).length
          );
          line += includeTokens((size === 0
            ? (elementLength > 1 ? '{},' : '{}')
            : '{'
          ), options);
          closingTag = (elementLength > 1) ? '},' : '}';
        }

        outputArray.push(line);
        outputArray.push.apply(
          outputArray,
          renderToArray(
            element,
            options,
            indentation + options.defaultIndentation,
            --elementLength
          )
        );


        if (typeof element === 'object'
        && options.format !== 'simple'
        && size > 0) {
          outputArray.push(
            Utils.indent(indentation)
            + includeTokens(closingTag, options)
          );
        }
      }
    });

    return outputArray;
  }

  if (data instanceof Error) {
    return renderToArray(
      {
        message: data.message,
        stack: data.stack.split('\n')
      },
      options,
      indentation,
      --elementLength
    );
  }

  // If values alignment is enabled, get the size of the longest index
  // to align all the values
  var maxIndexLength = options.noAlign ? 0 : Utils.getMaxIndexLength(data);
  var key;
  var preToken;
  var postToken;
  var size;
  var reverseIndex;
  var output = [];
  var propertyNames = Object.getOwnPropertyNames(data);
  var propertyNamesLength = Object.getOwnPropertyNames(data).length - 1;

  propertyNames.forEach(function(i, ix) {
    reverseIndex = propertyNamesLength - ix;
    // Prepend the index at the beginning of the line
    key = includeTokens('"', options) + i + includeTokens('"', options);
    key = (key + ': ');
    if (!options.noColor) {
      key = colors[options.keysColor](key);
    }
    key = Utils.indent(indentation) + key;

    // Skip `undefined`, it's not a valid JSON value.
    if (data[i] === undefined) {
      return;
    }

    // If the value is serializable, render it in the same line
    if (isSerializable(data[i], false, options)) {
      var nextIndentation = options.noAlign ? 0 : maxIndexLength - i.length;
      key += renderToArray(
        data[i],
        options,
        nextIndentation,
        reverseIndex
      )[0];
      output.push(key);

      // If the index is an array or object, render it in next line
    } else {
      if (Array.isArray(data[i])) {
        size = data[i].length;
        preToken = (size === 0 ? '[]' : '[');
        postToken = ']';
      } else { // is object
        size = Object.keys(data[i]).length;
        preToken = (size === 0 ? '{}' : '{');
        postToken = '}';
      }

      if (elementLength > 1 && reverseIndex > 0) {
        postToken+= includeTokens(',', options);
      }

      output.push(key + includeTokens(preToken, options)); // Opening tag [
      output.push.apply(
        output,
        renderToArray(
          data[i],
          options,
          indentation + options.defaultIndentation,
          size
        )
      );
      if (options.format !== 'simple' && size > 0) {
        output.push(
          Utils.indent(indentation) + includeTokens(postToken, options)
        ); // Closing tag ]
      }
    }
  });
  return output;
};

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
//       emptyArrayMsg: '(empty)',    // Rendered message on empty strings
//       keysColor: 'blue',           // Color for keys in hashes
//       dashColor: 'red',            // Color for the dashes in arrays
//       stringColor: 'grey',         // Color for strings
//       multilineStringColor: 'cyan' // Color for multiline strings
//       defaultIndentation: 2        // Indentation on nested objects
//       format: 'simple'          // How to print the output data
//     }
exports.render = function render(data, options, indentation) {
  var result, dataLength, openingTag, closingTag;
  var isArrayOrObject = typeof data === 'object' && data !== null;
  // Default values
  indentation = indentation || 0;
  options = options || {};
  options.emptyArrayMsg = options.emptyArrayMsg || '(empty array)';
  options.keysColor = options.keysColor || 'green';
  options.dashColor = options.dashColor || 'green';
  options.numberColor = options.numberColor || 'blue';
  options.defaultIndentation = options.defaultIndentation || 2;
  options.noColor = !!options.noColor;
  options.format = options.format || 'simple';
  options.noAlign = !!options.noAlign;

  options.stringColor = options.stringColor || null;
  options.multilineStringColor = options.multilineStringColor || null;

  if (isArrayOrObject) {
    dataLength = (Array.isArray(data) ? data.length : Object.keys(data).length);
  } else {
    dataLength = 0;
  }

  // If options to print as path then
  if (options.format === 'path') {
    data = Pathify.toPath(data);
  }

  result = renderToArray(
    data,
    options,
    (options.format === 'copyable' && isArrayOrObject
      ? indentation + 2
      : indentation
    ),
    dataLength
  );

  if (typeof data === 'object' && options.format !== 'simple') {
    if (Array.isArray(data)) {
      openingTag = '[';
      closingTag = ']';
    } else {
      openingTag = '{';
      closingTag = '}';
    }

    return includeTokens(openingTag, options) + includeTokens('\n', options)
      + result.join('\n')
      + includeTokens('\n', options) + includeTokens(closingTag, options)
    ;
  }

  return result.join('\n');
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
    return colors.red('Error:') + ' Not valid JSON!';
  }
  // Call the real render() method
  output += exports.render(parsedData, options, indentation);
  return output;
};
