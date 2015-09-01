console.log("Content Script loaded");
document.addEventListener('DOMContentLoaded', function() {
	console.log("content loaded triggered");
	if(getCookie("sidSession")=="true"){	/*TODO Manipulate Cookies with a better approach*/
		//(document.getElementById('fb-timeline-cover-name').innerText.length > 0)
		if(isProfile()){
			alert("Profile");
		}	
	}
});

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