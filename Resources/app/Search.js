// To speed up sorting perhaps it could be splitted in two steps:
//  - First sort based on a less granular score (2 digits?)
//  - Fetch the items with scores within the first N items
//  - Apply advanced sorting comparison on that later list
//  * If the sorting does not depend on 'variables' like the modtime then excluded items can be 
//    removed from the cache


function Search(path, items, options){

  this.path = path;
  this.items = items;
  this.options = options;
  
  var prefixes;
  if (options.prefixes) {
    prefixes = options.prefixes;
  }

  // TODO: Make this more solid (case insensitive?)
  for (var k in prefixes) if (prefixes.hasOwnProperty(k)) {
    prefixes[k] = new RegExp(prefixes[k]);
    Titanium.API.debug('REGEX: ' + prefixes[k]);
  }
  
  var caches = {};
  
  function findCache(abbr){
    var len = abbr.length;
    while (len--) {
      if (caches[abbr]) return caches[abbr];
      abbr = abbr.substr(0, len);
    }
    return null;
  }

  this.score = function(abbr){	
    var i,j,k,
      len, len2, ch, ranges, str, found, lastIdx,
      result = [],
      d1, d2;

    d1 = (new Date).getTime();

    var cache, newCache;

    // Caches store files NOT-FOUND, otherwise the stop-at-limit won't work since
    // we don't do a full scan if we reach a max. number of matched items 
    cache = findCache(abbr);
    // TODO: Do not create new cache if abbr.length is longer than X
    if (cache !== caches[abbr]) {
      // If previous cache was found clone its contents!!!!
      newCache = caches[abbr] = cache ? cache.clone() : (new Bits(items.length));
    }

    // Extract prefix from abbr if pressent
    var prefixRe, ofs = abbr.indexOf(':');
    if (-1 < ofs) {
      prefixRe = abbr.substr(0, ofs);
      if (prefixes[prefixRe]) {
        abbr = abbr.substr(ofs+1);
        prefixRe = prefixes[prefixRe];
      } else {
        prefixRe = null;
      }
    }

    // Build a regexp to match the abbreviation
    var ch, re = '', chars = abbr.toLowerCase().split('');
    for (i=0; i<abbr.length; i++) {
      ch = abbr.charAt(i).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      re += '[^' + ch + ']*' + ch;
    }
    if (re) {
      re = new RegExp('^' + re, 'i');
    }


    var skipped = skippedRE = 0;
    for (i=0, len=items.length; i<len; i++) {

      if (cache && cache.test(i)) {
        skipped++;
        continue;
      }

      str = items[i];

      // At this point we need to check if it needs path expansion
      if (str.charAt(0) === '^') {
        // Look back in the list to find the previous item with a path
        // TODO: Improve this by caching the last found path
        for (j=i-1; j>=0; j--) {
          if (items[j].charAt(0) !== '^') {
            str = items[j].substr(0, items[j].lastIndexOf('/')) + str.substr(1);
            break;
          }
        }
      }


      // Comparing against regexp is actually much faster than doing it with indexOf
      // We use it just to tell if all the abbr letters are present
      if (re && !re.test(items[i])) {
        skippedRE++;
        newCache && newCache.set(i);
        continue;
      }

      // If a prefix was used filter it			
      if (prefixRe && !prefixRe.test(items[i])) {
        newCache && newCache.set(i);
        continue;
      }

      ranges = [];
      str = items[i].toLowerCase();
      found = true;
      lastIdx = -1;
      for (j=0, len2=abbr.length; j<len2; j++) {
        ch = abbr.charAt(j);
    
        // SLOW DOWN to test a more realistic matcher
        for (var k=0; k<10; k++) {
          str.toLowerCase().indexOf(ch, lastIdx+1);
        }
        
        lastIdx = str.indexOf(ch, lastIdx+1);
        
        if (-1 === lastIdx) {
          found = false;
          break;
        }
        ranges.push(lastIdx);
      }
      
      if (found) {
        result.push({
          value: items[i],
          ranges: ranges
        });

        // Fetch at most 1000 items
        // TODO: Should be configurable with an option to disable it
        // TODO: Breaking without doing a full scan means that the cache is not complete!!!
        if (result.length >= 1000) break;
      } else {
        if (newCache) {
          newCache.set(i);
        } else {
          // Update an incomplete cache
          cache.set(i);
        }
      }
    }

    d2 = (new Date).getTime();	
    Titanium.API.debug('SCORE JOB: ' + ((d2-d1)/1000).toFixed(4) + 's Items: ' + result.length + ' Skipped: ' + skipped + ' / ' + skippedRE);	
    return result;
  };
}


