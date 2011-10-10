var colors = require('colors');

desc("create examples");
task("examples",function(){
    var exec = require('child_process').exec;
    
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
    var exec = require('child_process').exec;
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

desc('build the complete package');
task('default', ['test', 'examples', 'docs'], function(){});
