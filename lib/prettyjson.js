'use strict';

// ### Module dependencies
var chalk = require('chalk');
var Utils = require('./utils');

var conflictChars = /[^\w\s\n\r\v\t\.,]/i;

exports.version = require('../package.json').version;

// Helper function to detect if an object should be printed or ignored
var isPrintable = function (input, options) {
  return input !== undefined || options.renderUndefined;
};

// Helper function to detect if an object can be directly serializable
var isSerializable = function (input, onlyPrimitives, options) {
  if (
    typeof input === 'boolean' ||
    typeof input === 'number' ||
    typeof input === 'function' ||
    input === null ||
    input === undefined ||
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

var supportedColorStyleRenderers = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'cyan',
  'magenta',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'cyanBright',
  'magentaBright',
  'whiteBright',
  'bgBlack',
  'bgRed',
  'bgGreen',
  'bgYellow',
  'bgBlue',
  'bgCyan',
  'bgMagenta',
  'bgWhite',
  'bgGray',
  'bgGrey',
  'bgBlackBright',
  'bgRedBright',
  'bgGreenBright',
  'bgYellowBright',
  'bgBlueBright',
  'bgCyanBright',
  'bgMagentaBright',
  'bgWhiteBright'
];

/**
 *
 * @param {string} colorString
 * @param {PrettyJSONOptions} options
 */
var lookupColorRenderer = function (colorString, options) {
  if (options.noColor) {
    return chalk;
  }

  if (supportedColorStyleRenderers.indexOf(colorString) === -1) {
    if (options.unknownColorHandler === 'hex') {
      return chalk.hex(colorString);
    } else if (typeof options.unknownColorHandler === 'function') {
      return options.unknownColorHandler;
    } else if ('ignore' === options.unknownColorHandler) {
      return chalk;
    } else if ('warn' === options.unknownColorHandler) {
      console.warn(
        'Unknown color style: ',
        colorString,
        'Use one of the following: ',
        supportedColorStyleRenderers.join(', ') +
          '\nor set options.unknownColorHandler to "hex"',
        'or a function (to provide a custom color renderer)'
      );

      return chalk;
    }
  }
  return chalk[colorString] || chalk;
};

var addColorToData = function (input, options) {
  if (options.noColor) {
    return input;
  }

  if (typeof input === 'string') {
    // Print strings in regular terminal color
    return lookupColorRenderer(options.stringColor, options)(input);
  }

  var sInput = input + '';

  if (input === true) {
    return lookupColorRenderer(options.trueColor, options)(sInput);
  }
  if (input === false) {
    return lookupColorRenderer(options.falseColor, options)(sInput);
  }
  if (input === null || input === undefined) {
    return lookupColorRenderer(options.nullUndefinedColor, options)(sInput);
  }
  if (typeof input === 'number') {
    if (input >= 0) {
      return lookupColorRenderer(options.positiveNumberColor, options)(sInput);
    } else {
      return lookupColorRenderer(options.negativeNumberColor, options)(sInput);
    }
  }
  if (typeof input === 'function') {
    return 'function() {}';
  }

  if (Array.isArray(input)) {
    return input.join(', ');
  }

  return sInput;
};

var colorMultilineString = function (options, line) {
  return lookupColorRenderer(options.multilineStringColor, options)(line);
};

var indentLines = function (string, spaces, options) {
  var lines = string.split('\n');
  lines = lines.map(function (line) {
    return Utils.indent(spaces) + colorMultilineString(options, line);
  });
  return lines.join('\n');
};

var renderToArray = function (data, options, indentation) {
  if (typeof data === 'string' && data.match(conflictChars) && options.escape) {
    data = JSON.stringify(data);
  }

  if (!isPrintable(data, options)) {
    return [];
  }

  if (isSerializable(data, false, options)) {
    return [Utils.indent(indentation) + addColorToData(data, options)];
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
    if (data.length === 0) {
      return [Utils.indent(indentation) + options.emptyArrayMsg];
    }

    var outputArray = [];

    data.forEach(function (element) {
      if (!isPrintable(element, options)) {
        return;
      }

      // Prepend the dash at the beginning of each array's element line
      var line = '- ';
      line = lookupColorRenderer(options.dashColor, options)(line);
      line = Utils.indent(indentation) + line;

      // If the element of the array is a string, bool, number, or null
      // render it in the same line
      if (isSerializable(element, false, options)) {
        line += renderToArray(element, options, 0)[0];
        outputArray.push(line);

        // If the element is an array or object, render it in next line
      } else {
        outputArray.push(line);
        outputArray.push.apply(
          outputArray,
          renderToArray(
            element,
            options,
            indentation + options.defaultIndentation
          )
        );
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
      indentation
    );
  }

  // If values alignment is enabled, get the size of the longest index
  // to align all the values
  var maxIndexLength = options.noAlign ? 0 : Utils.getMaxIndexLength(data);
  var key;
  var output = [];

  Object.getOwnPropertyNames(data).forEach(function (i) {
    if (!isPrintable(data[i], options)) {
      return;
    }

    // Prepend the index at the beginning of the line
    key = i + ': ';
    key = lookupColorRenderer(options.keysColor, options)(key);
    key = Utils.indent(indentation) + key;

    // If the value is serializable, render it in the same line
    if (isSerializable(data[i], false, options)) {
      var nextIndentation = options.noAlign ? 0 : maxIndexLength - i.length;
      key += renderToArray(data[i], options, nextIndentation)[0];
      output.push(key);

      // If the index is an array or object, render it in next line
    } else {
      output.push(key);
      output.push.apply(
        output,
        renderToArray(
          data[i],
          options,
          indentation + options.defaultIndentation
        )
      );
    }
  });
  return output;
};
/**
 * @typedef {Object} PrettyJSONOptions
 * @property {string} [stringColor=null] Color for strings
 * @property {string} [multilineStringColor=null] Color for multiline strings
 * @property {string} [keysColor="green"] Color for keys in hashes
 * @property {string} [dashColor="green"] Color for dashes in arrays
 * @property {string} [numberColor="blue"] Default color for numbers
 * @property {string} [positiveNumberColor=numberColor|"blue"]
 * @property {string} [negativeNumberColor=numberColor|"blue"]
 * @property {string} [trueColor="green"] Color for === true
 * @property {string} [falseColor="red"] Color for === false
 * @property {string} [nullUndefinedColor="grey"] Color for null || undefined
 * @property {"ignore"|"warn"|"hex"|Function} [unknownColorHandler="warn"]
 *            If an unknown color is encountered, this handler will be called
 *            with the color name and it should return a function that renders
 *            the content.
 *
 * @property {number} [defaultIndentation=2] Indentation spaces per object level
 * @property {string} [emptyArrayMsg="(empty array)"] Replace empty strings with
 * @property {boolean} [noColor] Flag to disable colors
 * @property {boolean} [noAlign] Flag to disable alignment
 * @property {boolean} [escape] Flag to escape printed content
 * @property {boolean} [noColor] Flag to disable colors
 */
/**
 * Mutating function that ensures we have a valid options object
 * @param {PrettyJSONOptions} options
 * @returns PrettyJSONOptions
 */
var validateOptionsAndSetDefaults = function (options) {
  options = options || {};
  options.emptyArrayMsg = options.emptyArrayMsg || '(empty array)';
  options.keysColor = options.keysColor || 'green';
  options.dashColor = options.dashColor || 'green';
  options.trueColor = options.trueColor || 'green';
  options.falseColor = options.falseColor || 'red';
  options.nullUndefinedColor = options.nullUndefinedColor || 'grey';
  options.numberColor = options.numberColor || 'blue';
  options.positiveNumberColor =
    options.positiveNumberColor || options.numberColor;
  options.negativeNumberColor =
    options.negativeNumberColor || options.numberColor;
  options.defaultIndentation = options.defaultIndentation || 2;
  options.noColor = !!options.noColor;
  options.noAlign = !!options.noAlign;
  options.escape = !!options.escape;
  options.renderUndefined = !!options.renderUndefined;

  options.stringColor = options.stringColor || null;
  options.multilineStringColor =
    options.multilineStringColor || options.stringColor || null;

  options.unknownColorHandler = options.unknownColorHandler || 'warn';
  if (typeof options.unknownColorHandler === 'string') {
    if (['warn', 'hex', 'ignore'].indexOf(options.unknownColorHandler) === -1) {
      throw new Error('Unknown color handler: ' + options.unknownColorHandler);
    }
  } else if (typeof options.unknownColorHandler !== 'function') {
    throw new Error(
      'Invalid options.unknownColorHandler: ' + options.unknownColorHandler
    );
  }

  return options;
};
/**
 * ### Render function
 * *Parameters:*
 *
 * @param {*} data: Data to render
 * @param {PrettyJSONOptions} options: Hash of different options
 * @param {*} indentation **`indentation`**: Base indentation of the output
 *
 * *Example of options hash:*
 *
 *     {
 *       emptyArrayMsg: '(empty)',    // Rendered message on empty strings
 *       keysColor: 'blue',           // Color for keys in hashes
 *       dashColor: 'red',            // Color for the dashes in arrays
 *       stringColor: 'grey',         // Color for strings
 *       multilineStringColor: 'cyan' // Color for multiline strings
 *       defaultIndentation: 2        // Indentation on nested objects
 *     }
 * @returns string with the rendered data
 */
exports.render = function render(data, options, indentation) {
  // Default values
  indentation = indentation || 0;
  options = validateOptionsAndSetDefaults(options);

  return renderToArray(data, options, indentation).join('\n');
};

/**
 * ### Render from string function
 * *Parameters:*
 *
 * @param {*} data: Data to render
 * @param {PrettyJSONOptions} options: Hash of different options
 * @param {*} indentation **`indentation`**: Base indentation of the output
 *
 * *Example of options hash:*
 *
 *     {
 *       emptyArrayMsg: '(empty)', // Rendered message on empty strings
 *       keysColor: 'blue',        // Color for keys in hashes
 *       dashColor: 'red',         // Color for the dashes in arrays
 *       defaultIndentation: 2     // Indentation on nested objects
 *     }
 */
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
    return chalk.red('Error:') + ' Not valid JSON!';
  }

  // Call the real render() method
  output += exports.render(parsedData, options, indentation);
  return output;
};
