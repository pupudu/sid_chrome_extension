document.addEventListener('DOMContentLoaded', function() {

	var btnSignin = document.getElementById('btnSignin');
	var btnRegister = document.getElementById('btnRegister');
	var usr = document.getElementById('usr');
	var pwd = document.getElementById('pwd');
  
	try{
		btnSignin.addEventListener('click', function() {
			$.post("https://id.projects.mrt.ac.lk:9000/authenticate",
			{
				username: usr.value,	//get value from input text field
				password: pwd.value		//get value from input text field
			},
			function(data, status){
				console.log(data,status);
				if(status=="success"){
					if(data.success){
						console.log("Authentication success");
						window.open('main.html','_self');
					}
				}else{
					console.log("Error: Post request failed");
				}
			});
		});
	}catch(e){/*Do nothing*/}
	
	try{
		btnRegister.addEventListener('click', function() {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.executeScript(tab.id,{
				code:'window.open("http://id.projects.mrt.ac.lk")'
				},function(){
					/*Log Navigation*/
					console.log("Redirect to Sid|Main Web Page");
				});
			});
		});
	}catch(e){/*Do nothing*/}
	
}, false);
