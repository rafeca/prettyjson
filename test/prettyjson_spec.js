var prettyjson = process.env.EXPRESS_COV ? require('../lib-cov/prettyjson') : require('../lib/prettyjson');
var should = require('should');

describe('prettyjson general tests', function() {

  it("should output a string exactly equal as the input", function() {

    var input = 'This is a string';
    var output = prettyjson.render(input);

    output.should.equal(input);
  });

  it("should output a string with indentation", function() {

    var input = 'This is a string';
    var output = prettyjson.render(input, {}, 4);

    output.should.equal('    ' + input);
  });

  it("should output an array of strings", function() {

    var input = ['first string', 'second string'];
    var output = prettyjson.render(input);

    output.should.equal([
      '- '.green + input[0],
      '- '.green + input[1]
    ].join('\n'));
  });

  it("should output an array of arrays", function() {

    var input = ['first string', ['nested 1', 'nested 2'], 'second string'];
    var output = prettyjson.render(input);

    output.should.equal([
      '- '.green + input[0],
      '- '.green,
      '  ' + '- '.green + input[1][0],
      '  ' + '- '.green + input[1][1],
      '- '.green + input[2]
    ].join('\n'));
  });

  it("should output a hash of strings", function() {

    var input = {param1: 'first string', param2: 'second string'};
    var output = prettyjson.render(input);

    output.should.equal([
      'param1: '.green + 'first string',
      'param2: '.green + 'second string'
    ].join('\n'));
  });

  it("should output a hash of hashes", function() {

    var input = {first_param: {subparam: 'first string', subparam2: 'another string'}, second_param: 'second string'};
    var output = prettyjson.render(input);

    output.should.equal([
      'first_param: '.green,
      '  ' + 'subparam: '.green + ' first string',
      '  ' + 'subparam2: '.green + 'another string',
      'second_param: '.green + 'second string'
    ].join('\n'));
  });

  it("should indent correctly the hashes keys", function() {

    var input = {very_large_param: 'first string', param: 'second string'};
    var output = prettyjson.render(input);

    output.should.equal([
      'very_large_param: '.green + 'first string',
      'param: '.green + '           second string'
    ].join('\n'));
  });

  it("should output a really nested object", function() {

    var input = {
      first_param: {
        subparam: 'first string',
        subparam2: 'another string',
        subparam3: ["different", "values", "in an array"]
      },
      second_param: 'second string',
      an_array: [{
        param3: 'value',
        param10: 'other value'
      }],
      empty_array: []
    };

    var output = prettyjson.render(input);

    output.should.equal([
      'first_param: '.green,
      '  ' + 'subparam: '.green + ' first string',
      '  ' + 'subparam2: '.green + 'another string',
      '  ' + 'subparam3: '.green,
      '    ' + '- '.green + 'different',
      '    ' + '- '.green + 'values',
      '    ' + '- '.green + 'in an array',
      'second_param: '.green + 'second string',
      'an_array: '.green,
      '  ' + '- '.green,
      '    ' + 'param3: '.green + ' value',
      '    ' + 'param10: '.green + 'other value',
      'empty_array: '.green,
      '  (empty array)'
    ].join('\n'));
  });

  it("should allow to configure colors for hash keys", function() {
    var input = {param1: 'first string', param2: 'second string'};
    var output = prettyjson.render(input, {keysColor: 'blue'});

    output.should.equal([
      'param1: '.blue + 'first string',
      'param2: '.blue + 'second string'
    ].join('\n'));
  });

  it("should allow to configure rainbow as color", function() {
    var input = {param_long: 'first string', param2: 'second string'};
    var output = prettyjson.render(input, {keysColor: 'rainbow'});

    output.should.equal([
      'param_long: '.rainbow + 'first string',
      'param2: '.rainbow + '    second string'
    ].join('\n'));
  });

  it("should allow to configure the default indentation", function() {
    var input = {param: ['first string', "second string"]};
    var output = prettyjson.render(input, {defaultIndentation: 4});

    output.should.equal([
      'param: '.green,
      '    ' + '- '.green + 'first string',
      '    ' + '- '.green + 'second string'
    ].join('\n'));
  });

  it("should allow to configure the empty message for arrays", function() {
    var input = [];
    var output = prettyjson.render(input, {emptyArrayMsg: '(empty)'});

    output.should.equal([
      '(empty)'
    ].join('\n'));
  });

  it("should allow to configure colors for strings", function() {
    var input = {param1: 'first string', param2: 'second string'};
    var output = prettyjson.render(input, {keysColor: 'blue', stringColor: 'red'});

    output.should.equal([
      'param1: '.blue + 'first string'.red,
      'param2: '.blue + 'second string'.red
    ].join('\n'));
  });
});

describe('Printing numbers, booleans and other objects', function() {
  it("should print numbers correctly ", function() {
    var input = 12345;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal('    ' + '12345'.blue);
  });

  it("should print booleans correctly ", function() {
    var input = true;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal('    ' + 'true'.green);

    input = false;
    output = prettyjson.render(input, {}, 4);

    output.should.equal('    ' + 'false'.red);
  });

  it("should print a null object correctly ", function() {
    var input = null;
    var output = prettyjson.render(input, {}, 4);

    output.should.equal('    ' + 'null'.grey);
  });
});

describe('prettyjson.renderString() method', function(){
  it('should return an empty string if input is empty', function(){
    var input = '';

    var output = prettyjson.renderString(input);

    output.should.equal('');
  });

  it('should return an empty string if input is not a string', function(){
    var output = prettyjson.renderString({});
    output.should.equal('');
  });

  it('should return an error message if the input is an invalid JSON string', function(){
    var output = prettyjson.renderString('not valid!!');
    output.should.equal('Error:'.red + ' Not valid JSON!');
  });

  it('should return the prettyfied string if it is a valid JSON string', function(){
    var output = prettyjson.renderString('{"test": "OK"}');
    output.should.equal('test: '.green + 'OK');
  });

  it('should dismiss trailing characters which are not JSON', function(){
    var output = prettyjson.renderString('characters that are not JSON at all... {"test": "OK"}');
    output.should.equal("characters that are not JSON at all... \n" + 'test: '.green + 'OK');
  });

  it('should dismiss trailing characters which are not JSON with an array', function(){
    var output = prettyjson.renderString('characters that are not JSON at all... ["test"]');
    output.should.equal("characters that are not JSON at all... \n" + '- '.green + 'test');
  });

  it('should be able to accept the options parameter', function(){
    var output = prettyjson.renderString('{"test": "OK"}', {stringColor: 'red'});
    output.should.equal('test: '.green + 'OK'.red);
  });
});