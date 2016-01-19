/** 
This script runs as a backround script. To stop, change the manifest.json
*/

/* globals chrome: false */
//count = 0;

chrome.runtime.onMessage.addListener(function (message,sender,sendResponse){
	console.log(sender);
	if(message === "wake up"){
		console.log("Background page woke up from content script");
		return true;
	}else if(message === "cookie mismatch"){
		count = (count+1)%3;
		if(count === 1){
			chrome.tabs.executeScript({
				code:"notie.alert(3, 'Sid could not load. Please login again', 4);"
			},function(){});
		}
	}else if(message.request === "ajax"){
		$.ajax({
			method: message.type,
			url: message.url,
			data: message.data,
			async: false,
			success: function(data){
				sendResponse({data: data});
				return true;
			},
			error: function(xhr,textStatus,error){
				if(message.data.errorFunc){
					message.data.errorFunc();
				}
			}
		});
	}else if(message === "login check"){
		
	}else if(message === "inject"){
		chrome.tabs.query({url:"https://*.facebook.com/*"},function(tabAr){
			for(var i=0;i<tabAr.length;i++){
				inject(tabAr[i]);
			}
		});
	}else if(message.request === "connectFb"){
		$.post("http://sid.projects.mrt.ac.lk/login",{
			email: message.email,
			password:message.password
		},function(data){
			$.get("http://sid.projects.mrt.ac.lk/connect/facebook",function(data){
				console.log(data);
				chrome.tabs.executeScript({
					code:"notie.alert(1, 'Account Linked Successfully', 3);"
				},function(){});
				setCookie("sidSession","true",3);
			});
		});
	}else if(message.request === "notie"){
		console.log(JSON.stringify(message));
		var type=1;
		if(message.type === "confirm"){
			chrome.tabs.executeScript({
				file:"js/notie.js"
			},function(){
				var code = "notie.confirm('"+message.message+"', 'Take me there', 'No', function() {\
								chrome.runtime.sendMessage({request:'connectFb',email:'"+message.email+"',password:'"+message.password+"'});\
							});";
				chrome.tabs.executeScript({
					code:code
				},function(){});
			});
			return;
		}
		if(message.type === "success"){
			type = 1;
		}else if(message.type === "fail"){
			type = 3;
		}else{
			type = 4;
		}
		chrome.tabs.executeScript({
			file:"js/notie.js"
		},function(){});
		chrome.tabs.executeScript({
			code:"notie.alert("+type+", '"+message.message+"', 3);"
		},function(){});
	}
	else{
		//alert(JSON.stringify(message));
	}
});

var count =0;

/** This will be fired whenever a tab changes. Runs only when this script file is active*/
chrome.tabs.onUpdated.addListener(function (tabId,obj,tab){
	if(getCookie("sidSession")!=="true"){
		console.log("cookie mismatch");
		return;
	}
	count++;
	if(obj.status === "complete"){	//inject script only after update is complete
		setTimeout(function(){ 
			//alert("trying");
			inject(tab);
		}, 500);	//delay was added to allow elements to load before the content script is injected
		
		setTimeout(function(){
			inject(tab);
		}, 2500);	//retry in 2.5 seconds as backup
		
		setTimeout(function(){
			inject(tab);
		}, 5000);	//retry in 5 seconds as backup
	}
});

function inject(tab){
	if(tab.url.search("https://www.facebook.com")===0 || tab.url.search("https://web.facebook.com")===0){
		//alert("status "+obj.status+ " url "+count+" "+ tab.url);
		chrome.tabs.executeScript(tab.id,{
			file:'js/configs.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/jquery-1.11.3.min.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/cookie.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/chart.min.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/notie.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/hash.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/z-modal.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/slick.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/fbBrowserSpecifics.js',	//Run this script if navigated to a fb origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/fbInject.js',	//Run this script if navigated to a fb origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.insertCSS(tab.id,{
			file:'css/fbInject.css',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.insertCSS(tab.id,{
			file:'css/z-modal.css',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.insertCSS(tab.id,{
			file:'css/slick.css',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.insertCSS(tab.id,{
			file:'css/slick-theme.css',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
	}
	else if(tab.url.search("https://www.linkedin.com")===0){
		//alert("status "+obj.status+ " url "+count+" "+ tab.url);
		chrome.tabs.executeScript(tab.id,{
			file:'js/configs.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/hash.js'	//Run this script if navigated to a fb origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/liBrowserSpecifics.js',	//Run this script if navigated to a fb origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/jquery-1.11.3.min.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/cookie.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/chart.min.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/notie.js'	//Run this script if navigated to a linkedin origined page
		},function(){
			//Do Nothing
		});
		chrome.tabs.executeScript(tab.id,{
			file:'js/liInject.js',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
		
		chrome.tabs.insertCSS(tab.id,{
			file:'css/liInject.css',	//Run this script if navigated to a linkedin origined page
			runAt: "document_end"
		},function(){
			//Do Nothing
		});
	}
}

/** Used by content scripts to access local storage*/
/* This method is not yet called from anywhere. If needed, the message sender code should be written */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method === "getStat"){
		sendResponse({Status: "stat"});
    }else{
		sendResponse({}); // snub them.
	}
});