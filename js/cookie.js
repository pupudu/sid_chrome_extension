
/**Method to get a cookie*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1);
        if (c.indexOf(name) === 0){
			return c.substring(name.length,c.length);
		}
    }
    return "";
}

/**method to set a cookie*/
function setCookie(cname, cvalue, exdays) {
    var cookieStr = formatCookie(cname, cvalue, exdays)
    document.cookie = cookieStr;
}

/** Inject cookie to main browser*/
function injectCookie(cname, cvalue, exdays){
    var strInject = 'document.cookie =' +"'" + formatCookie(cname, cvalue, exdays) +';'+"'";
	console.log(strInject);
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.executeScript(tab.id,{
			code:strInject
		},function(){
		/*Do Nothing*/
		});
	});
}

/** Returns a formatted cookie from given params*/
function formatCookie(cname, cvalue, exdays){
	var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    var formattedCookie = cname + "=" + cvalue + "; " + expires;
	return formattedCookie;
}

