var releaseTools = require('releasetools');
var Step = require('step');
var exec = require('child_process').exec;

releaseTools.setOptions({
  examplePaths: [
    'lib/prettyjson.js'
  ],
  siteAssetsPaths: [
    'site/images',
    'site/javascripts',
    'site/stylesheets'
  ]
});

// Test task
desc("execute tests");
task("test", function() {
  var spawn = require('child_process').spawn;
  var child = spawn('npm', ['test']);

  console.log('executing the tests...');

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
      console.log('Done!');
      complete();
    }
  });
}, true);


// Lint task
desc("execute JSHint checks");
task("jshint", function() {
  exec('node_modules/jshint/bin/jshint bin/ lib/ --config ".jshint"', function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      fail(err);
    }
    else {
      console.log('Done!');
      complete();
    }
  });
}, true);

// Auto tests task
desc("auto execute tests");
task("watch", function() {
  var spawn = require('child_process').spawn;
  var child = spawn('node_modules/mocha/bin/mocha', ['-w', '-G', '--reporter', 'spec']);

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
      console.log('Done!');
      complete();
    }
  });
}, true);

desc("create test coverage file");
task("test-cov", function() {
  console.log('Creating test coverage file...');

  Step(
    function() {
      exec('rm -fr lib-cov', this);
    },
    function(err, stdout, stderr) {
      if (err) throw err;
      exec('jscoverage lib lib-cov', this);
    },
    function(err, stdout, stderr) {
      if (err) throw err;
      exec('EXPRESS_COV=1 node_modules/mocha/bin/mocha -R html-cov > docs/coverage.html', this);
    },
    function(err, stdout, stderr) {
      if (err) fail(err);
      else {
        console.log('Done!');
        complete();
      }
    }
  );
}, true);

// Namespace with all the release related tasks
namespace('release', function() {

  // Build task
  desc('Modify the working copy with all the release information');
  task('build', ['test', 'test-cov', 'jshint'], function(releaseType) {
    Step(

      // Update Changelog
      function() {
        console.log('Updating History.md file...');
        releaseTools.updateChangelog(this);
      },
      // Update Contributors
      function(err) {
        if (err) throw err;
        console.log('Updating AUTHORS file...');
        releaseTools.updateAuthorsFile(this);
      },
      // Create Example HTML files
      function(err) {
        if (err) throw err;
        console.log('creating examples documentation...');
        releaseTools.createExamples(this);
      },
      function(err) {
        if (err) fail(err);
        else complete();
      }
    );
  }, true);

  // Create site task
  desc('Create the public site');
  task('site', function(releaseType) {
    console.log('Creating the public site page...');
    releaseTools.createSite(function(err) {
      if (err) fail();
      else complete();
    });
  }, true);

  // Publish task
  desc('Publish only the static site');
  task('publish-site', ['site'], function() {
    Step(
      // Update gh-pages branch
      function(err) {
        if (err) throw err;
        console.log('Merging changes into gh-pages branch...');
        releaseTools.updatePagesBranch(this);
      },
      // Push to GitHub
      function(err) {
        if (err) throw err;
        console.log('Pushing changes to GitHub...');
        releaseTools.pushToGit(this);
      },
      function(err){
        if (err) fail(err);
        else complete();
      }
    );  
  }, true);

  // Publish task
  desc('Publish to GitHub and NPM the new version');
  task('publish', ['test'] , function() {
    Step(
      // Check if the `History.md` is modified
      // (to ensure that the `release:build` task has been already executed)
      function() {
        releaseTools.isWorkingCopyClean('History.md', this);
      },

      // Commit to Git
      function(err, result) {
        if (err) throw('Error while checking if the git tree is clean: ' + err);
        if (result) throw('You must run jake release:build before publish');
        console.log('Bumping version and creating git tag...');
        releaseTools.commitToGit(this);
      },

      // Update gh-pages branch
      function(err) {
        if (err) throw err;
        console.log('Merging changes into gh-pages branch...');
        releaseTools.updatePagesBranch(this);
      },

      // Push to GitHub
      function(err) {
        if (err) throw err;
        console.log('Pushing changes to GitHub...');
        releaseTools.pushToGit(this);
      },

      // Publish to NPM
      function(err) {
        if (err) throw err;
        console.log('Publishing NPM package...');
        releaseTools.npmPublish(this);
      },
      function(err){
        if (err) fail(err);
        else complete();
      }
    );
  }, true);

  // Update package.json task
  desc('Bump version in package.json');
  task('bump', function(releaseType) {
    releaseType = releaseType || 'patch';
    console.log('Bumping version in package.json...');
    releaseTools.updateVersionInPackageJson(releaseType, function(err, oldVersion, newVersion) {
      if (err) {
        return fail('Error while updating version in package.json: ' + err);
      }
      console.log(oldVersion + ' --> ' + newVersion);
      console.log('Done!');
      complete();
    });
  }, true);
});

desc('Default task is test');
task('default', ['test'], function(){}, true);
