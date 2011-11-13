var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
  
desc("create examples");
task("examples",function() {
  console.log('\ncreating examples documentation...'.yellow);
  
  exec('docco lib/prettyjson.js', function(err, stdout, stderr) {
    process.stdout.write(stdout);          
    process.stderr.write(stderr);
    if (err !== null) {
      process.stderr.write('exec error: ' + err);
    }
    complete();
  });
}, true);

desc("create docs");
task("docs", ["examples"], function() {
  var command = '(markdown README.md && markdown History.md) | cat docs/_header.html - docs/_footer.html > docs/index.html';
  
  console.log('\nCreating index page based on README.md...'.yellow);
   
  console.log('executing command "' + command + '"');
  exec(command, function(err, stdout, stderr) {
    process.stdout.write(stdout);          
    process.stderr.write(stderr);
    if (err !== null) {
      process.stderr.write('exec error: ' + err);
    }
    console.log('Done!');
    complete();
  });
}, true);

desc("execute tests");
task("test",function() {
  var spawn = require('child_process').spawn;
  var child = spawn('npm', ['test']);
  
  console.log('\nexecuting the tests...'.yellow);
  
  child.stderr.on('data', function(stderr) {
    process.stderr.write(stderr);
  });
  child.stdout.on('data', function(stdout) {
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

namespace('release', function() { 
  var version;
  
  desc('Bump version in package.json');
  task('version', ['test'], function(releaseType) {
    RELEASE_TYPES = [
      'major',
      'minor',
      'patch'
    ];
    
    // Check if the working copy is not clean
    exec('git status --porcelain', function(err, stdout, stderr) {
      if (stdout) {
        fail('There are local changes in your git repository, please commit them');
      }

      var releaseIndex = RELEASE_TYPES.indexOf(releaseType);
      if (releaseIndex === -1) {
        releaseIndex = 2;
      }

      var jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), 'utf8'));
      version = jsonData.version.split('.');
      version[releaseIndex]++;
      version = version.join('.');

      console.log('Upgrading version in package.json to ' + version + ' ...');

      jsonData.version = version;
      fs.writeFileSync(
        path.join(__dirname, "package.json"),
        JSON.stringify(jsonData, null, 2),
        'utf8'
      );
      console.log('Done!');
      complete();
    });
  }, true);
  
  desc('Modify changelog with last commits');
  task('changelog', ['release:version'], function(releaseType) {

    var months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    var d = new Date();
    var header = '### ' + version + ' — *' + months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '*';
    
    console.log('Updating History.md file with git commit messages...');
    
    exec('git log `git tag | head -1`..HEAD --pretty=format:"  * %s"', function(err, stdout, stderr) {
      
      var changelog = ('\n' + stdout + '\n').split('\n');
      
      if (err) {
        fail("Error while getting the git commits: " + err);
      }

      // Read History.md
      var history = fs.readFileSync('History.md', 'utf8').split('\n');

      // Add contents of `git changelog` after the title
      var finalHistory = history.splice(0, 2).concat(header).concat(changelog).concat(history);

      // Write contents to `History.md` file again
      fs.writeFileSync('History.md', finalHistory.join('\n'), 'utf8');
      
      console.log('Done!');
      complete();
    });
  }, true);
  
  desc('Bumps the version and creates the tag in git');
  task('git', ['test', 'docs'] ,function() {
    exec('git status package.json --porcelain', function(err, stdout, stderr) {
      if (!stdout) {
        fail("You have to run 'jake release:changelog' first!");
      }
      
      version = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"), 'utf8')).version;
      
      console.log('Creating version tag ' + version + ' in git...');
      exec('git commit -a -m "Bump version to ' + version + '"', function(err, stdout, stderr) {
        if (err) {
          fail('Error while making git commit: ' + err);
        }
      
        exec('git tag ' + version, function(err, stdout, stderr) {
          if (err) {
            fail('Error while creating the tag in git: ' + err);
          }
          console.log('Done!');
          complete();
        })
      });
    });
  }, true);
  
  desc('Merge the master branch into the gh-pages branch');
  task('gh-pages', ['release:git'] ,function() {    
    
    console.log('Merging changes into gh-pages branch...');
    exec('git checkout gh-pages', function(err, stdout, stderr) {
      if (err) {
        fail('Error while checking out in the gh-pages branch: ' + err);
      }
      
      exec('git merge -s recursive -Xsubtree master', function(err, stdout, stderr) {
        if (err) {
          fail('Error while merging master changes into gh-pages branch: ' + err);
        }
        
        exec('git checkout master', function(err, stdout, stderr) {
          console.log('Done!');
          complete();
        });
      })
    });
  }, true);
  
  desc('Push code to GitHub and publishes the NPM package');
  task('publish', ['release:gh-pages'] ,function() {
    console.log('Pushing changes to GitHub and publishing NPM package...');
    exec('git push --all', function(err, stdout, stderr) {
      if (err) {
        fail('Error while pushing the code to GitHub repository: ' + err);
      }
      
      exec('npm publish', function(err, stdout, stderr) {
        if (err) {
          fail('Error while publishing the package to NPM repository: ' + err);
        }
        console.log('Done!');
        complete();
      })
    });
  }, true);
});


desc('build the complete package');
task('default', ['test', 'docs'], function(){}, true);
