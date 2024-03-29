var APP = APP || {};

APP.PathScanner = function(){
  this.ignore = null;
};

APP.PathScanner.prototype = {

  // ls -A (all except . and ..) -L (follow symlinks) -p (add slash if directory) -R (recursive) -w (force non-printable)
  //    file1
  //    file2
  //    dir1/
  //
  //    dir1:
  //    file1
  //
  // * Linux  --color=never -N (force non-printable) -U (do not sort)
  //
  // * Windows  -LRANp --fast --color=never --streams=n
  findByLs: function(path, cb){
    var me = this,
        rootLen = path.length + 1,
        items = [],
        cmd, sep;

    switch (Titanium.platform) {
    case 'osx':
      cmd = ['/bin/ls', '-LRApw', path];
      sep = '/';
      break;
    case 'linux':
      cmd = ['/bin/ls', '-LRANUp', '--color=never', path];
      sep = '/';
      break;
    case 'win32':
      // Win32 has trouble reading non utf8 output from the command so weneed to use a batch file
      // to redirect the output of ls.exe to iconv for converting it.

      // Find the location of cmd.exe
      var env = Titanium.API.getEnvironment();
      if (!env['COMSPEC']) {
        env['COMSPEC'] = 'c:\\windows\\system32\\cmd.exe';
      }

      cmd = [env['COMSPEC'], '/C', Titanium.App.appURLToPath('extra/win32/ls.bat'), path];
      sep = '\\';
      break;
    }


    // Create a new process
    cmd = Titanium.Process.createProcess({ 
      args: cmd
    });

    // Process each line
    cmd.setOnReadLine(function(ln){
      // Empty line means a new path is comming
      if (!ln.length) { path = null; return; }
      // If no path is set means this line is one (remove colon)
      if (path === null) { path = ln.substr(0, ln.length-1); return; }
      // If filename ends in slash it is a directory
      if (ln.charAt(ln.length-1) == sep) return;

      // Check for errors (permission denied?)
      if (-1 !== ln.indexOf(': ')) return;

      // Convert path to relative
      if (path.length > rootLen) {
        ln = path.substr(rootLen) + sep + ln;
      }

      // Check if we have to ignore it
      if (!me.ignore || !me.ignore.test(ln)) {
        items.push(ln);
      }
    });

    // Get the result
    cmd.setOnExit(function(e){
      cb( cmd.getExitCode() === 0 ? items : false );
    });

    // Run the command
    cmd.launch();
  },

  // DEPRECATED: Win32 uses a bundled port of the ls command
  //
  // dir /S (recurse) /B (bare format)
  //    file1
  //    dir1
  //    file2
  //    dir1/file1
  findByDir: function(path, cb){
    var me = this,
        rootLen = path.length + 1,
        items = [],
        cmd = ['C:\\Windows\\System32\\cmd.exe', '/C', 'dir', '/S', '/B', path];

    // Create a new process
    cmd = Titanium.Process.createProcess({args: cmd});

    // Process each line
    // TODO: Check Unicode
    cmd.setOnReadLine(function(ln){
      // Note that we work with the given Bytes string to make all this somewhat faster

      // Empty line means a new path is comming
      if (!ln.length) return;

      // Try to guess if it's a directory
      if (ln.lastIndexOf('\\') >= ln.lastIndexOf('.')) {
        try {
          if (Titanium.Filesystem.getFile(ln).isDirectory()) {
            return;
          }
        } catch (e) {}
      }

      // Convert path to relative
      ln = ln.substr(rootLen);

      // Check if we have to ignore it
      if (!me.ignore || !me.ignore.test(ln)) {
        items.push(ln);
      }
    });

    // Get the result
    cmd.setOnExit(function(data){
      // TODO: Check for errors
      cb(items);
    });

    // Run the command
    cmd.launch();
  },

  // This is extremelly slow specially on Windows
  findByApi: function(path, cb){
    var me = this,
        rootLen = path.length + 1,
        items = [],
        file;

    try {
      file = Titanium.Filesystem.getFile(path);

      (function recurse(file){ 
        var i, ln, 
            files = file.getDirectoryListing(),
            len = files.length;

        for (i=0; i<len; i++) {
          try {
            // Remove root path
            ln = files[i].toString().substr(rootLen);
          } catch (e) { 
            continue; 
          }

          if (me.ignore && me.ignore.test(ln)) {
            continue;
          }

          if (files[i].isDirectory()) {
            recurse(files[i]);
            continue;
          }
       
          items.push(ln);
        }
      })(file);

    } catch (e) { 
      Titanium.API.warn('Exception trying to inspect path ' + path + ' (' + e.message + ')'); 
    }

    cb(items);
  },


  scan: function(path, cb){

    var me = this,
        start = (new Date).getTime();

    function fallback(items){
      // Fallback to Api method (slower)
      if (false === items) {
        Titanium.API.warn('Falling back to API based path scanner');
        me.findByApi(path, cb);
        return;
      }

      var diff = (new Date).getTime() - start;
      Titanium.API.info('Path scanning took ' + (diff/1000) + ' seconds and found ' + items.length + ' files');

      cb(items);
    }


    // Convert to absolute path
    path = Titanium.Filesystem.getFile(path);
    // TODO: Check it's actually a directory
    path = path.nativePath();

    // Try to obtain the dirs using ls/dir commands (faster)
    if (Titanium.platform === 'win32') {
      this.findByLs(path, fallback);
    } else {
      this.findByLs(path, fallback);
    }
  }
};
