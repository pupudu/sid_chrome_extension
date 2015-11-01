/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/** This will be fired whenever the current active tab changes. Runs only when this script file is active*/
chrome.webNavigation.onCompleted.addListener(function(obj){		
	console.log(obj);
	if(obj.url.search("https://www.facebook.com")===0 || obj.url.search("https://web.facebook.com")===0){
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.executeScript(tab.id,{
				file:'js/fbInject.js'	/*Run this script if navigated to a fb origined page*/
			},function(){
			/*Do Nothing*/
			});
		});
	}
});

/** Used by content scripts to access local storage*/
/* This method is not yet called from anywhere. If needed, the message sender code should be written */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getStat"){
		sendResponse({Status: "stat"});
    }else{
		sendResponse({}); // snub them.
	}
});