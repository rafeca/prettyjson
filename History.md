### 0.8.1 — *March 11, 2013*

  * Add compatibility for Node.js 0.10.0
  * Update dependencies

### 0.8.0 — *February 23, 2013*

  * Fix: ENV vars were not being used correctly
  * Add an option to change the color of the strings
  * Minor codestyle improvements

### 0.7.1 — *October 29, 2012*

  * Fix bug in 0.7.0 when input is an array

### 0.7.0 — *October 25, 2012*

  * Allow having non-JSON characters at the beginning of the input string (ideal for curl -i)
  * Add a renderString() method to be used by the CLI
  * Change test reporter style to spec
  * Upgrade dependencies to the last versions

### 0.6.0 — *June 29, 2012*

  * Update dependencies to support Node.js v0.8
  * Adding ability to use environmental variables

### 0.5.0 — *June 24, 2012*

  * Updated dependencies, added support for Node.js up to 0.7.12
  * Minor improvements in README file
  * Add JSHint to the build process
  * Add jake task to execute tests automatically
  * Add test coverage info

### 0.4.0 — *February 24, 2012*

  * Now prettyjson uses Mocha test framework instead of jasmine-node
  * Fixed leak in a "key" variable

### 0.3.1 — *February 15, 2012*

  * Modified website design
  * Modify webpage link in package.json

### 0.3.0 — *January 24, 2012*

  * Added CLI interface
  * Now prettyjson package requires Nodejs 0.6.x

### 0.2.1 — *January 23, 2012*

  * Fix: Bug when the JSON has attributes with booleans, integers or null values

### 0.2.0 — *January 22, 2012*

  * Now using node-releasetools for the release process
  * Disabled Node.js 0.6 from Travis CI temporally
  * Minor copy in Readme.md

### 0.1.4 — *December 1, 2011*

  * Added contributors to the Readme file

### 0.1.3 — *November 17, 2011*

  * Fixed the GitHub publishing of tags in the jake task
  * Updated package.json to make it compatible with Node.js 0.6.x
  * Updated travis YAML file to use the new Node.js support on Travis

### 0.1.2 — *November 14, 2011*

  * Updated Jakefile with tasks to automate publishing new versions

### 0.1.1 — *October 11, 2011*

  * Added changelog jake task to add changelog automatically
  * The library version is retrieved from `package.json` file

### 0.1.0 — *October 10, 2011*

  * Initial release
