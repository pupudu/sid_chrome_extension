document.addEventListener('DOMContentLoaded', function() {

	var btnSignin = document.getElementById('btnSignin');
	var btnRegister = document.getElementById('btnRegister');
	var usr = document.getElementById('usr');
	var pwd = document.getElementById('pwd');
  
	btnSignin.addEventListener('click', function() {
		$.post("https://localhost/api/authenticate",
		{
			username: usr.value,
			password: pwd.value
		},
		function(data, status){
			console.log(data,status);
			if(status=="success"){
				window.open('main.html','_self');
			}else{
			
			}
		});
	});
	
	btnRegister.addEventListener('click', function() {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.executeScript(tab.id,{
			code:'window.open("http://id.projects.mrt.ac.lk")'
			/*file:'inject.js'*/
			},function(){
				console.log("navigated to");
			});

    });
	});
	
}, false);
