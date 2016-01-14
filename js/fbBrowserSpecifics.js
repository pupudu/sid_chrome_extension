
/*need separate implementation for firefox and chrome*/
function addSidAnalyticsMenu(){
	setTimeout(function(){
		var targetId = extractId(1);
		if(document.getElementById(fbstrings.sidDropdown) === null){
			$.get(chrome.extension.getURL("html/sidAnalytics.html"), function(html) {
				processAnalyticsHTML(html);
			});
		}
	},1000);
}

function addCommentSection(){
	setTimeout(function(){
		if(document.getElementById("viewAllComments") === null){
			$.get(chrome.extension.getURL("html/comment.html"), function(data) {
				processCommentsHTML(data);
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

/*need separate implementation for firefox and chrome*/
function getURL(type,item){
	//return chrome.extension.getURL(url);
	if(type === "image"){
		return chrome.extension.getURL("resources/images/"+item+".png");
	}else{
		return chrome.extension.getURL("resources/icons/"+type+item+".png");
	}
}

/*Try Http call from bd script if https request failed*/
function ajaxOverHttpFunc(type,url,data,postExecute){
	chrome.runtime.sendMessage({
		request: "ajax",
		type: type,
		url: url,
		data: data
	},function(res){
		postExecute(res.data);
	});
}