// Original version from https://github.com/dmachi/Titanium-CommonJS
(function(){
  var modules = {};
  var paths = [];

  // Add module's bundled lib to the path
  Titanium.API.getInstalledModules()
  .forEach(function(mod){
    if (mod.getName() === 'drcommonjs') {
      paths.unshift(mod.getPath() + "/lib");
    }
  });

  // Add application's ./Resources/CommonJS to the path
  paths.unshift(Titanium.Filesystem.getResourcesDirectory() + '/CommonJS');

  // Relative paths to search within packages
  var nestedPaths = ['engines/titanium/lib', 'engines/default/lib', 'lib'];


  /**
   * Find the actual file system path for the given module identifier
   *
   * @private
   * @param {String} id The module to resolve
   * @param {String} parentId The current module path for relative look up
   * @return {String} the module path
   */
  function resolveId(id, parentId){
    var parts = id.charAt(0) === '.' ? parentId.split('/') : [];

    // Remove relative look up
    id = id.replace(/^\.\//, '');

    // Remove parent levels
    id.replace('/^(\.\.\/)+/', function(m){
      parts.splice(0, -(m.length/3));
      return '';
    });

    parts.push(id);

    Titanium.API.debug('[CommonJS] Resolved to ' + parts.join('/'));
    return parts.join('/');
  }

  /**
   * Creates a new require function with the given root path
   *
   * @private
   * @param {String} parentId
   * @return {Function}
   */
  function makeRequire(parentId) {
    var require;

    /**
     * CommonJS compliant require function
     *
     * @param {String} id 
     * @return {Object}
     */
    require = function(id){
      Titanium.API.debug('[CommonJS] require(' + id + ') from ' + (parentId || 'root'));

      // Resolve the identifier
      id = resolveId(id, parentId);
      // If already loaded just return it
      if (modules[id]) {
        return modules[id];
      }


      // Create the exports variable
      var exports = modules[id] = {};

      // Try all the paths in order
      var file, found;
      found = paths.some(function(path){
        var parts = id.split('/'),
            pkg = parts.shift();

        if (path.indexOf('app://') === 0) {
          path = Titanium.App.appURLToPath(path);
        }

        if (!parts.length) {
          file = Titanium.Filesystem.getFile(path + '/' + pkg);
          if (file.isDirectory()) {
            // Use the package name as filename (ie: pkg/lib/pkg.js)
            parts.push(pkg);
          } else {
            // Optimization for simple modules, the pkg name is a .js file
            file = Titanium.Filesystem.getFile(path + '/' + pkg + '.js');
            if (file.isFile()) {
                return true;
            }
            return;
          }
        }

        // Search in nested paths
        return nestedPaths.some(function(nested) {
          nested = [path, pkg, nested].concat(parts).join('/') + '.js';

          Titanium.API.debug('[CommonJS] Searching for file: ' + nested);
          file = Titanium.Filesystem.getFile(nested);
          if (file.isFile()) {
            return true
          }
        });
      });

      if (found) { 
        Titanium.API.info('[CommonJS] Loading ' + id + ' from: ' + file.nativePath());
        var factory = eval("(function(require, exports, module){" + file.read() + "})"); 
        factory(makeRequire(id), exports, {id:id});
        return exports;
      } else {
        Titanium.API.error("[CommonJS] Unable to resolve require: " + id);
        throw new Error('Unable to resolve require for ' + id);
      }
    }

    // Bind the paths variable to the require function
    require.paths = paths;

    return require;
  }

  // Expose a root require function in the API
  Titanium.API.set('DrSlump.CommonJS.require', makeRequire(''));
})();
