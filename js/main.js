

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
