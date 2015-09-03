/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/** This will be fired whenever the current active tab changes. Runs only when this script file is active*/
chrome.webNavigation.onCompleted.addListener(function(obj){		
	console.log(obj);
	if(obj.url.search("https://www.facebook.com")==0){
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
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "verIco")
		//var profilePic = document.getElementsByClassName("profilePicThumb")[0];
		//var icon = document.createElement("DIV");
		//icon.innerHTML = "<img src='resources/icons/Verified.png' width='50' height='50' style='position:absolute;left:0px;top:0px;z-index:+1;'>"
		sendResponse({ico: "dd"});
    else
		sendResponse({}); // snub them.
});