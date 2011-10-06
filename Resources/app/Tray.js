var APP = APP || {};

APP.Tray = function(callback){

  var icon = _('assets/icon_16x16_%s.png').sprintf(Titanium.platform);
  this.tray = Titanium.UI.addTray(icon, callback);
  this.tray.setHint( Titanium.App.getName() + ' ' + Titanium.App.getVersion() );

  this.menu = Titanium.UI.createMenu();
  this.tray.setMenu(this.menu);

  this.editor = this.list = this.skin = null;

  this.editors = [ 'MacVim', 'TextMate', 'Notepad++' ];
  this.lists = [ 'Opentel', 'TheSims' ];
  this.skins = [ 'Light', 'Dark', 'Purple' ];

};

APP.Tray.prototype.setList = function(list){
  this.list = list;
};

APP.Tray.prototype.addList = function(list){
  this.lists.push(list);
};

APP.Tray.prototype.clearLists = function(){
  this.lists = [];
};

APP.Tray.prototype.setEditor = function(editor){
  this.editor = editor;
}

APP.Tray.prototype.addEditor = function(editor){
  this.editors.push(editor);
};

APP.Tray.prototype.clearEditors = function(){
  this.editors = [];
};

APP.Tray.prototype.setSkin = function(skin){
  this.skin = skin;
}

APP.Tray.prototype.addSkin = function(skin){
  this.skins.push(skin);
};

APP.Tray.prototype.clearSkins = function(){
  this.skins = [];
};



/**
 * Updates the menu based on the current configuration
 */
APP.Tray.prototype.update = function(){

  var me = this;

  // Empty the menu to recreate it
  this.menu.clear();

  if (this.list) {
    this.menu.addItem('~/www/thesims/modules/gs-app-ria/src').disable();
    this.menu.addItem('Last scan 13 minutes ago').disable();
  } else {
    this.menu.addItem('No list active').disable();
  }
  this.menu.addSeparatorItem();

  var mnuEditors = Titanium.UI.createMenuItem('Editors');
  this.editors.forEach(function(itm){
    var mnu = mnuEditors.addCheckItem(itm, function(){ 
      me.setEditor(itm); 
      me.update();
    });
    if (itm === me.editor) mnu.setState(true);
  });
  this.menu.appendItem(mnuEditors);

  var mnuLists = Titanium.UI.createMenuItem('Lists');
  this.lists.forEach(function(itm){
    var mnu = mnuLists.addCheckItem(itm, function(){ 
      me.setList(itm); 
      me.update();
    });
    if (itm === me.list) mnu.setState(true);
  });
  this.menu.appendItem(mnuLists);

  var mnuSkins = Titanium.UI.createMenuItem('Skins');
  this.skins.forEach(function(itm){
    var mnu = mnuSkins.addCheckItem(itm, function(){ 
      me.setSkin(itm); 
      me.update();
    });
    if (itm === me.skin) mnu.setState(true);
  });
  this.menu.appendItem(mnuSkins);

  this.menu.addSeparatorItem();
  this.menu.addItem('Reload config', function(){
    Titanium.App.restart();
  });
  this.menu.addItem('Edit config...', function(){
    var f = Titanium.Filesystem.getFile(Titanium.Filesystem.getApplicationDataDirectory() + '/config.ini');
    if (!f.exists()) {
      // TODO: Copy template from extra/config.ini
      f.touch();
    }
    Titanium.Platform.openApplication(f.nativePath());
  });


  this.menu.addSeparatorItem();
  
  this.menu.addItem('About ' + Titanium.App.getName() + ' ' + Titanium.App.getVersion(), function(){
    var w = Titanium.UI.createWindow({
      id      : 'ui',
      url     : 'app://assets/about.html',
      title   : 'About',
      width   : 300,
      height  : 400,
      topMost : false,
      visible : true,
      usingChrome : true,
      toolWindow  : true,
      minimizable : false,
      maximizable : false
    });
    w.open();
  });
  
  this.menu.addItem('Help', function(){ 
    Titanium.Platform.openURL('http://pollinimini.net'); 
  });

  this.menu.addItem('Release notes', function(){
    var w = Titanium.UI.createWindow({
      id      : 'notes', 
      url     : 'app://assets/reader.html',
      title   : 'Release notes',
      width   : 500,
      height  : 500,
      visible : false,
      toolWindow  : true,
      minimizable : false,
      maximizable : false
    });

    w.addEventListener(Titanium.PAGE_LOADED, function(){
      var fpath = Titanium.Filesystem.getApplicationDirectory() + '/CHANGELOG.txt',
          f = Titanium.Filesystem.getFile(fpath),
          content = f.read().toString();

      w.getDOMWindow().render(content);
      w.show();
    });

    w.open();
  });

  this.menu.addItem('File a bug...', function(){
    Titanium.Platform.openURL('http://github.com/drslump');
  });
  
  this.menu.addSeparatorItem();
  this.menu.addItem('Quit', function(){
    Titanium.App.exit();
  });

};

