var prettyjson = require('../lib/prettyjson');

describe('prettyjson general tests', function(){

  it("should output a string exactly equal as the input", function(){
    
    var input = 'This is a string'
    var output = prettyjson.render(input);

    expect(output).toEqual(input);
  });

  it("should output a string with indentation", function(){
    
    var input = 'This is a string'
    var output = prettyjson.render(input, {}, 4);

    expect(output).toEqual('    ' + input);
  });
  
  it("should output an array of strings", function(){
    
    var input = ['first string', 'second string'];
    var output = prettyjson.render(input);

    expect(output).toEqual([
      '- '.green + input[0],
      '- '.green + input[1]
    ].join('\n'));
  });
  
  it("should output an array of arrays", function(){
    
    var input = ['first string', ['nested 1', 'nested 2'], 'second string'];
    var output = prettyjson.render(input);

    expect(output).toEqual([
      '- '.green + input[0],
      '- '.green,
      '  ' + '- '.green + input[1][0],
      '  ' + '- '.green + input[1][1],
      '- '.green + input[2],
    ].join('\n'));
  });
  
  it("should output a hash of strings", function(){
    
    var input = {param1: 'first string', param2: 'second string'};
    var output = prettyjson.render(input);

    expect(output).toEqual([
      'param1: '.green + 'first string',
      'param2: '.green + 'second string',
    ].join('\n'));
  });
  
  it("should output a hash of hashes", function(){
    
    var input = {first_param: {subparam: 'first string', subparam2: 'another string'}, second_param: 'second string'};
    var output = prettyjson.render(input);

    expect(output).toEqual([
      'first_param: '.green,
      '  ' + 'subparam: '.green + ' first string',
      '  ' + 'subparam2: '.green + 'another string',
      'second_param: '.green + 'second string',
    ].join('\n'));
  });

  it("should indent correctly the hashes keys", function(){
    
    var input = {very_large_param: 'first string', param: 'second string'};
    var output = prettyjson.render(input);

    expect(output).toEqual([
      'very_large_param: '.green + 'first string',
      'param: '.green + '           second string',
    ].join('\n'));
  });
  
  it("should output a really nested object", function(){
    
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

    expect(output).toEqual([
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
  
  it("should allow to configure colors for hash keys", function(){
    var input = {param1: 'first string', param2: 'second string'};
    var output = prettyjson.render(input, {keysColor: 'blue'});

    expect(output).toEqual([
      'param1: '.blue + 'first string',
      'param2: '.blue + 'second string',
    ].join('\n'));
  });
  
  it("should allow to configure rainbow as color", function(){
    var input = {param_long: 'first string', param2: 'second string'};
    var output = prettyjson.render(input, {keysColor: 'rainbow'});

    expect(output).toEqual([
      'param_long: '.rainbow + 'first string',
      'param2: '.rainbow + '    second string',
    ].join('\n'));
  });
  
  it("should allow to configure the default indentation", function(){
    var input = {param: ['first string', "second string"]};
    var output = prettyjson.render(input, {defaultIndentation: 4});

    expect(output).toEqual([
      'param: '.green,
      '    ' + '- '.green + 'first string',
      '    ' + '- '.green + 'second string',
    ].join('\n'));
  });
  
  it("should allow to configure the empty message for arrays", function(){
    var input = [];
    var output = prettyjson.render(input, {emptyArrayMsg: '(empty)'});

    expect(output).toEqual([
      '(empty)'
    ].join('\n'));
  });
});


describe('Printing numbers, booleans and other objects', function(){
  it("should print numbers correctly ", function(){
    var input = 12345;
    var output = prettyjson.render(input, {}, 4);

    expect(output).toEqual('    ' + '12345'.blue);
  });

  it("should print booleans correctly ", function(){
    var input = true;
    var output = prettyjson.render(input, {}, 4);

    expect(output).toEqual('    ' + 'true'.green);

    input = false;
    output = prettyjson.render(input, {}, 4);

    expect(output).toEqual('    ' + 'false'.red);
  });

  it("should print a null object correctly ", function(){
    var input = null;
    var output = prettyjson.render(input, {}, 4);

    expect(output).toEqual('    ' + 'null'.grey);
  });
});