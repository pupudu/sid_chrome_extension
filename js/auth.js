document.addEventListener('DOMContentLoaded', function() {
	var btnSignin = document.getElementById('btnSignin');
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
}, false);
