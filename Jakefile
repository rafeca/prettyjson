var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
  
desc("create examples");
task("examples",function(){
  console.log('\ncreating examples documentation...'.yellow);
  
  exec('docco lib/prettyjson.js', function(err, stdout, stderr){
    process.stdout.write(stdout);          
    process.stderr.write(stderr);
    if (err !== null) {
      process.stderr.write('exec error: ' + err);
    }
    complete();
  });
}, true);

desc("create docs");
task("docs",function(){
  var command = '(markdown README.md && markdown History.md) | cat docs/_header.html - docs/_footer.html > docs/index.html';
  
  console.log('\nCreating index page based on README.md...'.yellow);
   
  console.log('executing command "' + command + '"');
  exec(command, function(err, stdout, stderr){
    process.stdout.write(stdout);          
    process.stderr.write(stderr);
    if (err !== null) {
      process.stderr.write('exec error: ' + err);
    }
    complete();
  });
}, true);

desc("execute tests");
task("test",function(){
  var spawn = require('child_process').spawn;
  var child = spawn('npm', ['test']);
  
  console.log('\nexecuting the tests...'.yellow);
  
  child.stderr.on('data', function(stderr){
    process.stderr.write(stderr);
  });
  child.stdout.on('data', function(stdout){
    process.stdout.write(stdout);
  });
  child.on('exit', function(code) {
    if (code !== 0) {
      fail(code);
    } else {
      complete();
    }
  });
}, true);


desc("Modify changelog with last commits");
task("changelog", function(version){

  exec('git changelog --list', function(err, stdout, stderr) {
    if (stdout.split("\n").length === 0) {
      fail('No commits since last release');
    }
    
    // Bump version in package.json
    console.log('Upgrading version in package.json ...');
    var data = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), 'utf8'));
    
    if (!version) {
      version = data.version.split('.');
      version[2]++;
      version = version.join('.');
    }
    data.version = version;
    fs.writeFileSync(
      path.join(__dirname, "package.json"),
      JSON.stringify(data, null, 2),
      'utf8'
    );
    
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June",
      "July", "August", "September",
      "October", "November", "December"
    ];
    var d = new Date();
    var currentHistory = [
      '### ' + version + ' — *' + monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '*',
      ''
    ].concat(stdout.split('\n'), ['']);
  
    // Read History.md
    console.log('Adding commit messages to History.md...');
    var history = fs.readFileSync('History.md', 'utf8').split('\n');
  
    // Add contents of `git changelog` after the title
    var args = [2, 0].concat(currentHistory);
  
    history.splice.apply(history, args);
  
    // Write contents to `History.md` file again
    fs.writeFileSync('History.md', history.join('\n'), 'utf8');
    
    // Invoke the default task (to rebuild documentation & stuff)
    jake.Task['default'].invoke();
  });
}, true);

desc('build the complete package');
task('default', ['test', 'examples', 'docs'], function(){}, true);
