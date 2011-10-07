// Shortcut for Titanium and current window and main window
var T = Titanium,
    W = T.UI.getMainWindow(),
    w = T.UI.getCurrentWindow();

// Import here the main window libraries
var _ = W.getDOMWindow()._;


var startX, startY, dragging = false;
$(document).mousemove(function(e){
  if (!dragging) return;
  w.setX(w.getX() + e.clientX - startX);
  w.setY(w.getY() + e.clientY - startY);
}).mousedown(function(e){
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
}).mouseup(function(e){
  dragging = false;
});



var working = false;
var changed = false;

// Create and start a new worker
var worker = Titanium.Worker.createWorker('app://app/worker.score.js');
worker.start();

worker.onerror = function(e){

  alert(e);

  // Notify of a scan completed
  var not = T.Notification.createNotification({
    title: 'Error on worker',
    message: 'Error ' + e,
    timeout: 3
  });
  not.show();

  working = false;
};


function render(item, path){

  // From http://codeaid.net/javascript/convert-size-in-bytes-to-human-readable-format-(javascript)		
  function bytesToSize(bytes, precission) {
    var sizes = ['B', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (i == 0) { return (bytes / Math.pow(1024, i)) + sizes[i]; }
    return (bytes / Math.pow(1024, i)).toFixed(precission || 0) + sizes[i];
  }

  // https://github.com/jherdman/javascript-relative-time-helpers/blob/master/date.extensions.js
  function timeAgo(timestamp, now_threshold) {
    var delta = (new Date()).getTime() - timestamp;

    now_threshold = parseInt(now_threshold, 10);

    if (isNaN(now_threshold)) {
      now_threshold = 0;
    }

    if (delta <= now_threshold) {
      return 'Just now';
    }

    var units = null;
    var conversions = {
      millisecond: 1, // ms    -> ms
      second: 1000,   // ms    -> sec
      minute: 60,     // sec   -> min
      hour:   60,     // min   -> hour
      day:    24,     // hour  -> day
      month:  30,     // day   -> month (roughly)
      year:   12      // month -> year
    };

    for (var key in conversions) {
      if (delta < conversions[key]) {
        break;
      } else {
        units = key; // keeps track of the selected key over the iteration
        delta = delta / conversions[key];
      }
    }

    // pluralize a unit when the difference is greater than 1.
    delta = Math.floor(delta);
    if (delta !== 1) { units += "s"; }
    return [delta, units, "ago"].join(" ");
  };


  var d, html, 
      fname = item.value,
      fext = fname.replace(/^.+?(\.([^\/\.\\]+))?$/, '$2'),
      file = Titanium.Filesystem.getFile(path + Titanium.Filesystem.getSeparator() + fname),
      months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 
      modtime = Math.floor( file.modificationTimestamp() / 1000 );  // Micro to milli
   
  if ((new Date).getTime() - modtime > 1000 * 7 * 24 * 60 * 60 * 1000) {
    d = new Date(modtime);
    modtime = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } else {
    modtime = timeAgo(modtime, 60000);
    if (modtime === '1 day ago') modtime = 'yesterday';
    if (modtime === '1 week ago') modtime = 'last week';
    if (modtime === '1 month ago') modtime = 'last month';
    if (modtime === '1 year ago') modtime = 'last year';
  }


  // Apply visual hints for the matched chars
  var result = '', last = 0;
  for (var i=0; i<item.ranges.length; i++) {
    result += fname.substring(last, item.ranges[i]);
    result += '<strong>' + fname.substr(item.ranges[i], 1) + '</strong>';
    last = item.ranges[i] + 1;
  }
  result += fname.substr(last);


  html = [
    '<span class="fname">' + result + '</span>',
    '<span class="ftime">' + modtime + '</span>',
    '<span class="fsize">' + bytesToSize( file.size() ) + '</span>',
    '<span class="fext">'  + ( fext ? fext : '&nbsp;' ) + '</span>'
  ];

  return html.join('\n');
}


// Register what to do when receiving worker data
worker.onmessage = function(e){
try {

  var message = e.message, 
      path = message.path,
      items = message.items,
      $ul = $('#list'),
      ul = $ul.get(0),
      li, i, len;

  $ul.empty().hide();;

  var len = Math.min(50, items.length);
  for (i=0; i<len; i++) {
    li = document.createElement('LI');
    li.innerHTML = render(items[i], path);
    $ul.append(li);
  }

  $ul.children('li:first').addClass('selected');
  $ul.show();

  // Resize the list
  var h = $ul.children('li:first').outerHeight(true);
  h *= Math.min(9, items.length);
  $ul.height(h);

  // Resize the window
  h = $('#frame').outerHeight(true);
  if (w.getHeight() != h) {
    w.setHeight(h);
  }

  working = false;
  
} catch (e) { 
  Titanium.API.error(e); 
  working = false;
}

};


if (Titanium.platform === 'win32') {
  var path = 'z:\\www\\thesims\\modules\\gs-app-ria\\src';
  var path = 'c:\\tmp\\thesims';
//  var path = 'c:\\tmp\\uni code';
} else if (Titanium.platform === 'linux') {
  var path = '/home/drslump/';
} else {
  var path = '/Users/drslump/www/thesims/modules/gs-app-ria/src';
  var path = '/Users/drslump/tmp/manyfiles/Zend';
  var path = '/Users/drslump/tmp/manyfiles/thesims'
}

function openMacVim(){
  $('#frame').addClass('working');
  
  var scanner = new APP.PathScanner();

  scanner.ignore = XRegExp('\
    (^|\/|\\\\) ( \
        \.git | \.hg | \.svn | \.sass-cache | build | tmp | log | \
        vendor\/(rails|gems|plugins) | \
        tags | \.DS_Store \
    ) (\/|\\\\|$)', 'x'
  );

  scanner.scan(path, function(result){
    T.API.debug('List files: ' + result.length);

    var dotted = _(result.length).reverse();
    dotted = _(dotted).chop(3);
    dotted = _(dotted).map(function(itm){ return _(itm).reverse(); }).reverse().join('.');

    // Notify of a scan completed
    var not = T.Notification.createNotification({
      title: 'Path scan completed',
      message: 'Scanning job for path ' + path + ' has completed succesfully with ' + dotted + ' files found',
      timeout: 3
    });
    not.show();

    // Remove the working hint
    $('#frame').removeClass('working');
    
    // Initialize the matcher thread
    worker.postMessage({
      action: 'init', 
      path: path, 
      items: result, 
      options:{
        prefixes:{
          h: '\\.h$'
        }
      }
    });

    working = false;
  });
}

try {
  
// Maximize to fetch the screen size (Is it the only way?)
w.maximize();
var maxW = w.getWidth();
var maxH = w.getHeight();
w.unmaximize();

function centerWindow(width) {
  // TODO: Make the height dynamic based on the content
  var height = 600;
    
  // Position in the middle and at a 10% from the top
  w.setX( Math.floor((maxW / 2) - (width / 2)) );
  w.setY( Math.floor(maxH * 0.1) );	

  w.setWidth(width);
  w.setHeight(height);
}
  
    
$(function(){
  var width = 600;
  centerWindow(width);
      
  // Make sure the window is at the top
  w.setTopMost(true);

  // Show the application with a fade in			
  $(document.body).fadeIn(400);


  // Options: function(color, showOnMouseOver, visibleBar, visibleBg);
  //$('#list-wrapper').lionbars();//'dark', true, true, false);


  // Hook shortcut triggers
  shortcut.add('Esc', function(){

    if ($('#search').val().length > 0) {
      $('#search').val('');
      return;
    }

    // Show the application with a fade in
    $(document.body).fadeOut(150, function(){
      // HACK: To restore the previously active application we hide the
      //       current application using an applescript command
      var cmd = ['osascript', '-e', 'tell application "System Events" to keystroke "h" using command down'];
      cmd = T.Process.createProcess(cmd);
      cmd.launch();
    });
  });


  function adjustScroll($elem) {

    // Lionbars plugin adds a wrapper for the scroll
    //var $w = $('#list-wrapper .nWrap');
    var $w = $('#list-wrapper');

    var wHeight = $w.height();
    var wTop = $w.scrollTop();
    var wBottom = wTop + wHeight;

    var eHeight = $elem.height();
    var eTop = wTop + $elem.position().top;
    var eBottom = eTop + eHeight;

    if (eTop < wTop) {
      $w.scrollTop(eTop);
    } else if (eBottom > wBottom) {
      $w.scrollTop(eTop - wHeight + eHeight*2);
    }

    console.log('wT: %o wB: %o et: %o eb: %o', wTop, wBottom, eTop, eBottom);
  }



  // Show ⌘N when holding control or command keys
  var holdCmd = false;
  $(window).keydown(function(e){
    if (holdCmd && e.charCode) {
      clearTimeout(holdCmd);
      holdCmd = false;
      $('#list kbd').stop().fadeOut(200, function(){ $(this).remove(); });					
      return;
    }

    if (e.metaKey || e.ctrlKey) {
      var key = e.ctrlKey ? '⌃' : '⌘';					
      holdCmd = setTimeout(function(){
        var $lis = $('#list > li');
        $lis.each(function(idx){
          if (idx >= 9) return; 
          $(this).append('<kbd>' + key + (idx+1) + '</kbd>');		
          $(this).find('kbd').stop().fadeIn(100);
        });
      }, 400);
    }
  }).keyup(function(e){
    if (holdCmd && !e.metaKey && !e.ctrlKey) {
      clearTimeout(holdCmd);
      holdCmd = false;
      $('#list kbd').stop().fadeOut(200, function(){ $(this).remove(); });
    }
  });			



  var actions = {
    narrower: function(){
      width = Math.max(300, width-50);
      centerWindow(width);
    },
    wider: function(){
      // Fake a node to use jQuery animation framework
      var node = document.createElement('div');
      node.style.width = width + 'px';
      
      $(node).animate({ 
        width: Math.min(maxW, width+50)
      }, {
        duration: 200,
        queue: true,
        step: function(now, fx){
          T.API.debug(now);
          centerWindow(Math.round(now));
        },
        complete: function(){
          width = parseInt(this.style.width);
        }
      });
    },
    next: function(){
      var $ul = $('#list');
      var $selected = $ul.children('.selected');
      var $next = $selected.next();
      
      if ($selected.length === 0) {
        T.API.debug('Selecting first element');
        $selected = $ul.children('li:first').addClass('selected');
      } else if ($next.length > 0) {
        T.API.debug('Selecting next element');
        $selected.removeClass('selected');
        $selected = $next.addClass('selected');
      }
                adjustScroll($selected);
    },
    prev: function(){
      var $ul = $('#list');
      var $selected = $ul.children('.selected');
      var $prev = $selected.prev('li');

      if ($selected.length === 0) {
        T.API.debug('Selecting last element');
        $selected = $ul.children('li:last').addClass('selected');
      } else if ($prev.length > 0) {
        T.API.debug('Selecting previous element');
        $selected.removeClass('selected');
        $selected = $prev.addClass('selected');
      }
              adjustScroll($selected);	
    },
    check: function(n){
      var $el;
      if (typeof n === 'undefined') { 
        $el = $('#list > .selected');
      } else {
        $el = $('#list > li').eq(n);
      }
      
      $el.toggleClass('checked');
      return $el.length > 0;
    },
    checkAndNext: function(){
      actions.check();
      actions.next();
    },
    reload: function(){
      openMacVim();
    },
    launch: function(n){
      Titanium.API.debug('Launching ' + n);	
    }
  };

  var shortcuts = {
    'Meta+Left': actions.narrower,
    'Meta+Right': actions.wider,
    'Ctrl+Left': actions.narrower,
    'Ctrl+Right': actions.wider,
    'Down': actions.next,
    'Up': actions.prev,
    'Space': actions.checkAndNext,
    'Meta+R': actions.reload,
    'Ctrl+R': actions.reload,
    'Tab': function(){

      var val = $('#search').val();
      var prefixes = { h: '\\.h$', view: '/view/', contr: '/controller/' };

      // TODO: Cycle thru matching keys
      for (var k in prefixes) if (prefixes.hasOwnProperty(k)) {
        if (k.indexOf(val) === 0) {
          $('#search').val(k + ':');
          changed = true;
          break;
        }
      }
        
    },//actions.next,
    'Shift+Tab': actions.prev,
    // TODO: What happens on systems without meta keys?
    'Meta+1': function(){ actions.launch(0); },
    'Meta+2': function(){ actions.launch(1); },
    'Meta+3': function(){ actions.launch(2); },
    'Meta+4': function(){ actions.launch(3); },
    'Meta+5': function(){ actions.launch(4); },
    'Meta+6': function(){ actions.launch(5); },
    'Meta+7': function(){ actions.launch(6); },
    'Meta+8': function(){ actions.launch(7); },
    'Meta+9': function(){ actions.launch(8); },
    'Ctrl+1': function(){ actions.check(0); },
    'Ctrl+2': function(){ actions.check(1); },
    'Ctrl+3': function(){ actions.check(2); },
    'Ctrl+4': function(){ actions.check(3); },
    'Ctrl+5': function(){ actions.check(4); },
    'Ctrl+6': function(){ actions.check(5); },
    'Ctrl+7': function(){ actions.check(6); },
    'Ctrl+8': function(){ actions.check(7); },
    'Ctrl+9': function(){ actions.check(8); },

  };

  _(shortcuts).each(function(v,k){
    shortcut.add(k, v);
  });



  $('#list').click(function(e){
    $(this).children('li').removeClass('selected');
    $(e.target).closest('li').addClass('selected');
    if (e.ctrlKey || e.metaKey) {
      actions.check();
      return false;
    }

    // Unselect all
    $(this).children('li').removeClass('checked');
  });





  // Make sure we place the focus in the search input
  w.addEventListener(Titanium.FOCUSED, function(){
    $('#search').focus();
  });
  $('#search').blur(function(){ 
    var $me=$(this);
    // Delay the return of the focus so that the whole blur event buble has finished 
    setTimeout(function(){ $me.focus(); }, 10);
  });


  $(window).keydown(function(e){
      //T.API.debug('Down -> Meta: ' + e.metaKey + ' Key: ' + e.keyCode + ' Which: ' + e.which + ' Char: ' + String.fromCharCode(e.charCode));
  });
  $('#search').keyup(function(e){ 
      var nonChars = [9 /* Tag */, 32 /* space */, 37,38,39,40];
      T.API.debug('Up -> Abbr: ' + this.value + ' Meta: ' + e.metaKey + ' Key: ' + e.keyCode + ' Which: ' + e.which + ' Char: ' + String.fromCharCode(e.charCode));
      if (!e.metaKey && !e.ctrlKey && -1 === nonChars.indexOf(e.keyCode)) {
        changed = true;
      }
  });


  // Configure interval limits
  var MIN_DELAY = 40;
  var MAX_DELAY = 150;
  var delay = MAX_DELAY;

  // Change monitor
  function update(){
    try {
    if (changed) {
      changed = false;

      var abbr = $('#search').val();

      // Calculate the delay based on the abbr length. We assume that for a longer
      // abbreviation we'll get faster responses (ease in circ), specially with the cache		
      var step = abbr.length-1, stop = Math.max(step, 10);
      delay = -MAX_DELAY * (Math.sqrt(1 - (step/=stop)*step) - 1) + MIN_DELAY;
      delay = Math.max(MIN_DELAY, Math.min(MAX_DELAY, MAX_DELAY-delay));

      // Only launch a new search if it's not busy
      if (!working) {
        working = true;
        T.API.debug('Launching search for abbr: ' + abbr + ' delay: ' + delay);
        worker.postMessage({action:'search', abbr:abbr});
      } else { T.API.debug('Working'); }
    }

    setTimeout(update, delay);
    } catch(e){ T.API.error(e); }
  }
  
  // Launch the update monitor
  setTimeout(update, delay);
});


} catch (e) {
  alert(e);
}

