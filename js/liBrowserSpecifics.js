/*need separate implementation for firefox and chrome*/
function getURL(type,item){
	//return chrome.extension.getURL(url);
	if(type === "image"){
		return chrome.extension.getURL("resources/images/"+item+".png");
	}else{
		return chrome.extension.getURL("resources/icons/"+type+item+".png");
	}
}

/*need separate implementation for firefox and chrome*/
function addSidAnalyticsMenu(){
	setTimeout(function(){
		if(document.getElementById(fbstrings.sidDropdown) === null){
			$.get(chrome.extension.getURL("html/sidAnalytics_li.html"), function(data) {
				processAnalyticsHTML(data);
			});
		}
	},1000);
}

/*needs a separate implementations for firefox and chrome*/
function popUpOnIconByID(popupData){ 

	var node = document.createElement("DIV");  
	
	popupData.classOffset = popupData.classOffset+"_d";
	if(popupData.claim.getElementsByClassName(popupData.iconClass+popupData.classOffset).length > 0){
		return;
	}

	$.get(chrome.extension.getURL("html/ratePopup.html"), function(data) {
		node.innerHTML = data;
		node.className=popupData.iconClass+popupData.classOffset;
		document.getElementById(popupData.iconId).parentNode.appendChild(node);
		
		processRatepopup(node,popupData.myRating);
		configureListners(node,popupData);
		popupComment(node,popupData);
	});
}

function addCommentSection(type){
	setTimeout(function(){
		if(document.getElementById("viewAllComments") === null){
			$.get(chrome.extension.getURL("html/comment_li.html"), function(data) {
				processCommentsHTML(data,type);
			});
		}
	},1000);
}

/*Try Http call from bd script if https request failed*/
function sendAjaxOverHttp(type,url,data,postExecute){
	chrome.runtime.sendMessage({
		request: "ajax",
		type: type,
		url: url,
		data: data
	},function(res){
		postExecute(res.data);
	});
}

function getMyId(){
	chrome.storage.sync.get("email",function(items){
		var email = items.email;
		sendAjax("POST","/rate/linkedin/getUrl",{email:email},function(data){
			//console.log(data);
			var id = data.url;
			myId = id;
			manipulate();
		});
	});
	//myId = LI.TREASURY_CONF.sessionId;
	//setTimeout(function(){myId = LI.TREASURY_CONF.sessionId;},5000);
	/*var sid = document.createElement('div');
	sid.className = "identity";
	sid.id = "sid";
	document.body.appendChild(sid);
	
	var script = document.createElement('script');
	var text = "var myId = LI.TREASURY_CONF.sessionId;\
				document.getElementById('sid').setAttribute('data-id',myId)";
	script.appendChild(document.createTextNode(text));
	document.body.appendChild(script);
	
	myId = document.getElementById('sid').getAttribute('data-id');*/
}

startScript();