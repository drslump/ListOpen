  function old(){
    var PATH = '/Users/drslump/www/thesims/modules/gs-app-ria/src';
    //traverseApi(PATH);
    traverseLs(PATH);
    //return;
    
    
    var search = document.getElementById('search').value;

    //var program = ['open', '-a', 'MacVim.app', '--args', '/tmp/lst.txt'];
    // Ack expects the filenames from stdin when running the process :(
    var program = ['/usr/local/bin/ack', '--nopager', '--nocolor', '--noenv', search, '/Users/drslump/www/thesims/modules/gs-app-ria/src'];
    //var program = ['/bin/cat', '/tmp/lst.txt'];
    
    // This works but does not open the file in Vim?
    var stdout = T.Process.createPipe();
    var cmd = T.Process.createProcess({
        args: program
    });
    
    cmd.setOnReadLine(function(data){
        document.getElementById('output').innerHTML += data.toString() + '\n';
    });
    
    cmd.launch();
    
    return;
    
    // Create a temporary shell script to use the argument
    var tmpf = Titanium.Filesystem.createTempFile();
    //tmpf.setExecutable();
    alert(tmpf.nativePath());
    
    var tmps = tmpf.open(Titanium.Filesystem.MODE_WRITE);
    tmps.write('#!/bin/sh\n/Applications/MacVim.app/Contents/MacOS/Vim -g ~/tmp/phpcs.txt');
    tmps.close();

    // THIS FAILS!
    tmpf.setExecutable();

    Titanium.Platform.openApplication(tmpf.nativePath());

    //Titanium.Platform.openApplication('"/Applications/MacVim.app/Contents/MacOS/Vim -g ~/tmp/phpcs.txt"');
  }


try {

  var tray = new APP.Tray(function(){
    // OSX triggers this when hiding the menu
    // Windows when left-clicking it
  });
  tray.setList('Opentel');
  tray.update();


  var w = Titanium.UI.createWindow({
      id		: 'ui',
      url 	: 'app://assets/ui.html',
      title : 'UI',
      x 		: 100, // TODO: Calc. middle
      y 		: 50,  // TODO: Calc.
      width   : 500,
      height  : 400,
      topMost : false, //true,
      visible : false,
      usingChrome: false,
      transparentBackground: true,
      toolWindow: true
  });
  w.open();	

  // Wait until the window is ready to initialize
  w.addEventListener(Titanium.PAGE_LOADED, function(){
    var dom = w.getDOMWindow();
    Titanium.API.debug('Path: ' + dom.path);
    w.show();
  });

  // We have nothing to show on the main window
  var W = Titanium.UI.getMainWindow();
  W.hide();
  
  
  if (typeof Titanium.DrSlump !== 'undefined') {
    Titanium.API.addEventListener(Titanium.DrSlump.HANDLER_URL, function(e){
      Titanium.API.info('DRSLUMP_HANDLER_URL');
      Titanium.API.info(e.url);
    });
    if (Titanium.DrSlump.handlerUrl) {
      alert('URL: ' + Titanium.DrSlump.handlerUrl);	    	
    }
  }


  

  Titanium.API.addEventListener(Titanium.UNFOCUSED, function(){
      Titanium.API.debug('MAIN UNFOCUS EVENT');
  });		

  Titanium.API.addEventListener(Titanium.FOCUSED, function(){
      Titanium.API.debug('MAIN FOCUS EVENT');
  });		
  


  var server = Titanium.Network.createTCPServerSocket(function(conn){
      Titanium.API.debug(conn);
      conn.onRead(function(bytes){
          Titanium.API.debug(bytes.toString());	
      });
  });
  server.listen(43210);


} catch (e) {
    alert(e);
}

