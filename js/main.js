/* globals setCookie,injectCookie: false */

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
		
		var connectFb = document.getElementById('connectFb');		//Log out button in login page
		
		connectFb.addEventListener('click', function() {
			setTimeout(function(){ alert("Hello"); }, 5000);
			chrome.tabs.getSelected(null, function(tab) {
				window.open("https://sid.projects.mrt.ac.lk:9000/rate/facebook/getID")
			});
			/*$.get("https://www.facebook.com/10205482016428688",function(data){
				//console.log(data)
				var str;
				var profID;
				var strObj;
				var node=document.createElement("DIV");
				node.innerHTML=data;
				try{
					alert(node.getElementsByTagName("meta")[4].getAttribute("content"));
				}catch(e){
					console.error(e);
					console.log(node);
					
				}
				console.log(profID);
			});*/
		});
	}catch(e){
		alert("dodan")
	/*Do Nothing*/}
}, false);


