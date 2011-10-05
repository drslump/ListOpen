
onmessage = function(event){

	Titanium.API.debug('Path: ' + event.message.path + ' Abbr: ' + event.message.abbr);
	
	var path = event.message.path,
		abbr = event.message.abbr,
		items = event.message.items;
	

		
	//return;
	
	} catch (e) { Titanium.API.debug(e); }
	
	
	postMessage({path:path, items:result});
};
