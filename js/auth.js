//window.open('main.html','_self');//TODO for testing purposes only, when server is down. remove imediately after server starts

/* globals chrome,getCookie,setCookie,injectCookie: false */

if(getCookie("sidSession")==="true"){	/*TODO Manipulate Cookies with a better approach*/
	chrome.runtime.sendMessage("inject");
	window.open('main.html','_self');
}

document.addEventListener('DOMContentLoaded', function() {
	try{
		var btnSignin = document.getElementById('btnSignin');		//Sign in button in login page
		var usr = document.getElementById('usr');	//input text field in login page
		var pwd = document.getElementById('pwd');	//input text field in login page
		
		btnSignin.addEventListener('click', function() {
			if(usr.value==="" || pwd.value ===""){
				displayError("Please fill your details");
				return;
			}
			
			var postExecute = function(data, status){
				console.log(data,status);
				if(status==="success"){
					if(data.success){
						console.log("Authentication success");
						
						chrome.storage.sync.set({
							email: usr.value
						});
						
						if(data.isFacebookLinked===true){
							if(data.fbid===undefined || data.fbid === ""){
								if(data.fbappid!==undefined){
									chrome.runtime.sendMessage({request:"notie",type:"try",message:"Linking Facebook Account to Sid Account"});
									try{
										$.ajax({
											type: 'GET',
											url: "https://www.facebook.com/"+data.fbappid,
											success: function(data, textStatus ){
											    var str;
												var profID;
												var strObj;
												var node=document.createElement("DIV");
												node.innerHTML=data;
												try{
													var fbid = node.getElementsByTagName("meta")[4].getAttribute("content").substring(13);
													$.post(commonstrings.sidServerHttp+"/rate/facebook/setID",
													{
														email: usr.value,	
														uid: fbid		
													},
													function(data, status){
														setCookie("sidSession","true",3);
														chrome.runtime.sendMessage({request:"notie",type:"success",message:"Account Link and login Success"});
														chrome.runtime.sendMessage("inject");
														window.open('main.html','_self');
													});	
												}catch(e){
													chrome.runtime.sendMessage({request:"notie",type:"fail",message:"Account Link Failed"});
													console.log(e);
												}
											},
											error: function(xhr, textStatus, errorThrown){
												chrome.runtime.sendMessage({request:"notie",type:"fail",message:"Failed to get data using fb App Specific Id"});
												
											}
										});
									}catch(e){
										chrome.runtime.sendMessage({request:"notie",type:"fail",message:"Failed to get data using fb App Specific Id"});
										console.log(e);
									}
								}else{
									chrome.runtime.sendMessage({request:"notie",type:"fail",message:"Fb App Id undefined"});
									console.log("error");
								}
							}else{
								setCookie("sidSession","true",3);
								chrome.runtime.sendMessage({request:"notie",type:"success",message:"Login Success"});
								chrome.runtime.sendMessage("inject");
								window.open('main.html','_self');
							}
						}else{
							//TODO: Handle issue
							chrome.runtime.sendMessage({
								request:"notie",
								type:"confirm",
								message:"Facebook Account not linked. Would you like to link the loggedin account with sid?",
								email:usr.value,
								password:pwd.value
							});
							console.log("account not linked");
						}
						
					}else{
						displayError("Invalid Username or Password");
					}
				}else{
					chrome.runtime.sendMessage({request:"notie",type:"fail",message:"Failed to call authenticate route"});
					console.log("Error: Post request failed");
				}
			}
			
			$.ajax(commonstrings.sidServerHttp+"/authenticate",{
				type: 'POST',
				data: {
					username: usr.value,	//get value from input text field
					password: pwd.value		//get value from input text field
				},
				success: function(data, status){
					postExecute(data, status);
				}
			});
			
		});
		
	}catch(e){
		console.error(e);
	}
	
	try{
		var btnRegister = document.getElementById('btnRegister');	//Register button in login page
		
		btnRegister.addEventListener('click', function() {
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.executeScript(tab.id,{
				code:'window.open("http://sid.projects.mrt.ac.lk")'
				},function(){
					console.log("Redirect to Sid|Main Web Page");
				});
			});
		});
	}catch(e){
		
	}
	
}, false);

function displayError(message){
	$("#usr").css("border-color","red");
	$("#pwd").css("border-color","red");
	document.getElementById("loginError").innerText = message;
	$("#failureMsg").fadeIn(1000);
}
