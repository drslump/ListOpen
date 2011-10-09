// Each "path" has one of these workers
// It offers onmessage for init, search and update items
// Searches can be limited (only return top N items) to reduce serialization/communication time 
// The matcher and sorters are configurable via the init message (use importScritps)
// 
// Note: Fetching file size, modified time, ... should be done in the UI thread just for
//       the items being shown.
//

// Load dependencies
var require = Titanium.DrSlump.CommonJS.require;
var Bits = require('Bits').Bits;

importScripts('app/Search.js');


var search;

onmessage = function(event){
  try {
    var data = event.message;

    switch (data.action){

    // Initialize the search system
    // {path: string, items: string[]}
    case 'init':
      Titanium.API.debug('Search object initialized for path ' + data.path + ' with ' + data.items.length + ' elements');
      search = new Search(data.path, data.items, data.options);
      break;

    // Perform a search from the given abbreviation
    // {abbr: string}
    case 'search':
      if (!search) {
        Titanium.API.error('Score worker not initiliazed!');
        return;
      }

      var message = {
        path  : search.path,
        abbr  : data.abbr,
        items : search.score(data.abbr)
      };

      // TODO: In Linux passing consecutive postMessage freezes the main thread!
      postMessage(message);

      break;
    }

  } catch (e) {
    Titanium.API.error(e); 
  }
};
