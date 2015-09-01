/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/*TODO create a separate script file for background tasks*/

/** This will be fired whenever the current active tab changes. Runs only when this script file is active*/
chrome.tabs.onUpdated.addListener(function(id,obj,tab){		/* TODO: change listener to webNavigation.onComplete */
	if(tab.status == "complete" && tab.url.search("https://www.facebook.com")==0){
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
			setCookie("sidSession","false",3);
			window.open('popup.html','_self');
		});
	}catch(e){/*Do Nothing*/}
}, false);

/**Method to get a cookie*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

/**method to set a cookie*/
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}