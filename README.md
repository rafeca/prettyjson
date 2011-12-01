# prettyjson [![Build Status](https://secure.travis-ci.org/rafeca/prettyjson.png)](http://travis-ci.org/rafeca/prettyjson)

Package for formatting JSON data in a coloured YAML-style, perfect for CLI output

## How to install

The easiest way is by installing it from the `npm` repository:
    
    $ npm install prettyjson

If you'd prefer to install the latest master version of `prettyjson`, you can clone the GitHub source repository
and then install it using `npm`:
    
    $ git clone "https://github.com/rafeca/prettyjson.git"
    
    $ npm install -g prettyjson/

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


## Contributors

* Rafael de Oleza &lt;rafeca at gmail dot com&gt;
* Francisco Perez Lopez &lt;francis at tid dot es&gt;

## License

(The MIT License)

Copyright (c) 2011 Rafael de Oleza &lt;rafeca@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
