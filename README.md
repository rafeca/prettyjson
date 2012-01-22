# prettyjson [![Build Status](https://secure.travis-ci.org/rafeca/prettyjson.png)](http://travis-ci.org/rafeca/prettyjson)

Package for formatting JSON data in a coloured YAML-style, perfect for CLI output

## How to install

The easiest way is by installing it from the `npm` repository:
    
    $ npm install prettyjson

If you'd prefer to install the latest master version of `prettyjson`, you can clone the GitHub source repository
and then install it using `npm`:
    
    $ git clone "https://github.com/rafeca/prettyjson.git"
    
    $ npm install prettyjson/

## How to use it

It's pretty easy to use it... you just have to include it in your script and call the `render()` method:
    
    var prettyjson = require('prettyjson');
    
    var data = {
      username: 'rafeca',
      url: 'https://github.com/rafeca',
      twitter_account: 'https://twitter.com/rafeca',
      projects: ['prettyprint', 'connfu']
    };
    
    console.log(prettyjson.render(data));

And will output:
    
![Example 1](http://rafeca.com/prettyjson/images/example1.png)

You can also configure the colors of the hash keys and array dashes
(using [colors.js](https://github.com/Marak/colors.js) colors syntax):
    
    var prettyjson = require('prettyjson');

    var data = {
      username: 'rafeca',
      url: 'https://github.com/rafeca',
      twitter_account: 'https://twitter.com/rafeca',
      projects: ['prettyprint', 'connfu']
    };

    console.log(prettyjson.render(data, {
      keysColor: 'rainbow', 
      dashColor: 'magenta'
    }));

Will output something like:

![Example 2](http://rafeca.com/prettyjson/images/example2.png)

## Annotated source

You can check the [annotated source](http://rafeca.com/prettyjson/prettyjson.html) for more information about how it works

## Running Tests

To run the test suite first invoke the following command within the repo, installing the development dependencies:
    
    $ npm install --dev

then run the tests:
    
    $ npm test

