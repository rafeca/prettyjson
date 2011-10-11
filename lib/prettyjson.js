// Package for formatting JSON data in a coloured 
// YAML-style, perfect for CLI output

// ### Export package
module.exports = exports;


// ### Module dependencies
var colors = require('colors');
var Utils  = require('./utils');
var fs = require('fs');

// ### Package version
exports.version = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version;

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
//       defaultIndentation: 4     // Indentation on nested objects
//     }
exports.render = function render(data, options, indentation) {
  // Default value for the indentation param
  indentation = indentation || 0;
  
  // Default values for the options
  options = options || {};
  options.emptyArrayMsg = options.emptyArrayMsg || '(empty array)';
  options.keysColor = options.keysColor || "green";
  options.dashColor = options.dashColor || "green";
  options.defaultIndentation = options.defaultIndentation || 2;
  
  // Initialize the output (it's an array of lines)
  var output = [];
  
  
  // Render a string exactly equal
  if (typeof data === 'string') {
    output.push(Utils.indent(indentation) + data);
  }
  
  else if (Array.isArray(data)) {
    // If the array is empty, render the `emptyArrayMsg`
    if (data.length === 0) {
      output.push(Utils.indent(indentation) + options.emptyArrayMsg);
    } else {
      data.forEach(function(element) {
        // Prepend the dash at the begining of each array's element line
        var line = Utils.indent(indentation) + ('- ')[options.dashColor];
      
        // If the element of the array is a string, render it in the same line
        if (typeof element === 'string') {
          line += exports.render(element, options);
          output.push(line);

        // If the element of the array is an array or object, render it in next line
        } else {
          output.push(line);
          output.push(
            exports.render(element, options, indentation + options.defaultIndentation)
          );
        }
      });
    }
  }
  else if (typeof data === 'object') {
    // Get the size of the longest index to render all the values on the same column
    var maxIndexLength = Utils.getMaxIndexLength(data);

    for(var i in data) {
      // Prepend the index at the beginning of the line
      var key = Utils.indent(indentation) + (i + ': ')[options.keysColor];

      // If the value is a string, render it in the same line
      if (typeof data[i] === 'string') {
        key += exports.render(data[i], options, maxIndexLength - i.length);
        output.push(key);

      // If the index is an array or object, render it in next line
      } else {
        output.push(key);
        output.push(
          exports.render(data[i], options, indentation + options.defaultIndentation)
        );
      }
    }
  }
  // Return all the lines as a string
  return output.join('\n');
};