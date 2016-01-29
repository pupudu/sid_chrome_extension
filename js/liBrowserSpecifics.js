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
		//console.log(email);
		$.post(commonstrings.sidServer+"/rate/linkedin/getUrl",{email:email},function(data){
			var url = data.url;
			var id = getQueryVariable("id",url);
			myId = id;
		});
	});
}

startScript();