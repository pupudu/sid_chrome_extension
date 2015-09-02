/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/*TODO create a separate script file for background tasks*/

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

/**Log into the sid, if cookie says "yes"*/
document.addEventListener('DOMContentLoaded', function() {
	try{
		var btnLogout = document.getElementById('btnLogout');		//Log out button in login page
		
		btnLogout.addEventListener('click', function() {
			/*TODO Add code to logout from server*/
			setCookie("sidSession","true",-1);
			injectCookie("sidSession","true",-1);
			window.open('popup.html','_self');
		});
	}catch(e){/*Do Nothing*/}
}, false);
