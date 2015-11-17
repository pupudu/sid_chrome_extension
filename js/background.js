/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/* globals chrome: false */

var count =0;

/** This will be fired whenever a tab changes. Runs only when this script file is active*/
chrome.tabs.onUpdated.addListener(function (tabId,obj,tab){
	count++;
	if(obj.status === "complete"){	//inject script only after update is complete
		setTimeout(function(){ 
			//alert("trying");
			inject(tabId,obj,tab);
		}, 500);	//delay was added to allow elements to load before the content script is injected
		
		setTimeout(function(){
			inject(tabId,obj,tab);
		}, 2500);	//retry in 2.5 seconds as backup
		
		setTimeout(function(){
			inject(tabId,obj,tab);
		}, 5000);	//retry in 5 seconds as backup
		
	}
});

function inject(tabId,obj,tab){
	if(tab.url.search("https://www.facebook.com")===0 || tab.url.search("https://web.facebook.com")===0){
		//alert("status "+obj.status+ " url "+count+" "+ tab.url);
		chrome.tabs.executeScript(tab.id,{
			file:'js/jquery-1.11.3.min.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/cookie.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/chart.min.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/notie.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/fbInject.js',	//Run this script if navigated to a fb origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
	}
	else if(tab.url.search("https://www.linkedin.com")===0){
		//alert("status "+obj.status+ " url "+count+" "+ tab.url);
		chrome.tabs.executeScript(tab.id,{
			file:'js/jquery-1.11.3.min.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/cookie.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/chart.min.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/notie.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/linkedinInject.js',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
	}
}

/** Used by content scripts to access local storage*/
/* This method is not yet called from anywhere. If needed, the message sender code should be written */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getStat"){
		sendResponse({Status: "stat"});
    }else{
		sendResponse({}); // snub them.
	}
});