/* globals Chart,fbstrings,commonstrings,notie,fbSkipStrings,addSidAnalyticsMenu,fbNonSkipStrings,getURL,hex_md5,popUpOnIconByID,addCommentSection,sendAjaxOverHttp,ZMODAL: false */
/* exported processAnalyticsHTML,configureListners,processCommentsHTML */

var timeLineCName = document.getElementById(fbstrings.profileName);		//element to identify fb profile
var timeLineHLine = document.getElementById(fbstrings.fbTimelineHeadline);			//element to identify fb page

removeAds();
identify();	

function removeAds(){
	if(document.getElementsByClassName("ego_section").length>0){
		document.getElementsByClassName("ego_section")[0].remove();
	}
}

/**identify web page and take required actions*/
function identify(){
	console.log(".. Identifying Web Page");
	if(timeLineCName!==null && timeLineHLine!==null){
		var selectedTab = document.getElementsByClassName(fbstrings.selectedTab)[0].innerHTML;
		console.log(".. .. selected tab is: " + selectedTab);
		
		updateProfPic(false);
		addSidAnalyticsMenu();
		addCommentSection("getComments");
		
		if(selectedTab.indexOf("About") === 0) {
			var subSectionHolder = document.getElementsByClassName(fbstrings.subSection)[0];
			if(subSectionHolder){
				var subsection = subSectionHolder.innerHTML;
				if(subsection.indexOf("Work and Education") ===0 ){
					//manipulateAboutWork();		
					manipulateAbout(fbstrings.workClaim,"Work");
				}				
				else if(subsection.indexOf("Life Events") ===0 ){
					//manipulateLifeEvents();		
					manipulateAbout(fbstrings.lifeEventClaim,"Events");
				}
				else if(subsection.indexOf("Overview") ===0 ){
					//manipulateOverview();
					manipulateAbout(fbstrings.lifeEventClaim,"Overview");
				}
			}else{
				console.log("Unable to access About subsection");
			}
		}else if (selectedTab.indexOf("Timeline") === 0){
			console.log("selectedTab: "+ selectedTab);
			manipulateTimeLine();	
			updFrndsProfInTimeLine();
		}
	}else{
		console.log("timeline if condition false");
	}
}

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(manual){
	if(document.getElementById(fbstrings.sidSign)!==null && !manual){
		if(document.getElementById(fbstrings.sidSign).src.length>10){
			console.log(".. .. Profile pic already updated");
			return;
		}
	}
	var profID = extractId(1);
	
	var postExecute = function (data){
		var imgURL = getURL("prof",data.ratingLevel);
		var icon = document.createElement("DIV");
		var profPic = document.getElementsByClassName(fbstrings.photoContainer)[0];
		icon.innerHTML = "<img id ="+fbstrings.sidSign+" class = 'profIcon'>";
		profPic.appendChild(icon);
		
		if(document.getElementById(fbstrings.sidSign) !== null){
			document.getElementById(fbstrings.sidSign).src = imgURL;
		}
		$("#"+fbstrings.sidSign).fadeIn(2000);
	};
	
	sendAjax("POST","/rate/facebook/getOverallProfileRating",{targetid: profID},postExecute);
}

/**updating friends profile pics*/
function updFrndsProfInTimeLine(){
	var timelineRecent = document.getElementById(fbstrings.timelineRecent);
	var friendAr = timelineRecent.getElementsByClassName(fbstrings.friendProfiles);
	var altAr = document.getElementsByClassName("_3s6w");
	
	for(var i=0;i<friendAr.length;i++){
		var profID = extractFriendId(friendAr[i],altAr[i]);
		var friendStr = "friend"+i;
		var icon = document.createElement("DIV");
		
		if(document.getElementById(friendStr) === null){ 
			icon.innerHTML = "<img id='friend"+i+"' class = 'friendProfIcon' >";
			friendAr[i].parentNode.appendChild(icon);
			if(document.getElementById(friendStr) !== null){ 
				if(document.getElementById(friendStr).src === null ){ return; } 
			}
			addIconToFriendProf(profID,friendStr);
		}
	}
}

function addIconToFriendProf(profID, friendStr){
	var postExecute = function(data){
		var imgURL = getURL("prof",data.ratingLevel);
		document.getElementById(friendStr).src = imgURL;
	};
	try{
		sendAjax("POST","/rate/facebook/getOverallProfileRating",{targetid: profID},postExecute);
	}catch(e){
		var imgURL = getURL("prof","N");
		document.getElementById(friendStr).src = imgURL;
	}
}

function manipulateAbout(claimType,style){
	var claimAr = document.getElementsByClassName(claimType);
	var claimCount = claimAr.length; //Number of claims on about page
	
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i];
		scoreClaims(i,claim,style); 
	}
}

function manipulateTimeLine(){
	var claimContainerAr = document.getElementsByClassName(fbstrings.timelineClaimContainer);
	var claimCount = claimContainerAr.length; //Number of claims on timeline
	
	/**Scoring claim summary*/
	for(var i=0;i<claimCount;i++){
		var claim = claimContainerAr[i].getElementsByClassName(fbstrings.timelineClaim)[0];
		scoreClaims(i,claim,"");
	}
}

function processAnalyticsHTML(html){
	console.log(".. .. .. adding sid analytics pop up menu");
	var node = document.createElement("DIV");  
	node.innerHTML = html;
	document.getElementsByClassName(fbstrings.fbMenubar)[0].appendChild(node);
	
	var targetId = extractId(1);
	var myId = extractId(0);
	var headerURL = getURL("image","analytics_header");
	var legendURL = getURL("image","legend");
	
	document.getElementById("analytics_header").src = headerURL;
	document.getElementById("analytics_legend").src = legendURL;
	
	var postExecute = function (data){
		var organizations;
		var suppCount = 0;
		if(data){
			organizations = data.organizations;
		}
		if(organizations){
			suppCount = organizations.length;
		}

		if(suppCount === 0){
			var orgNode = document.createElement("img");
			orgNode.className = "emptyCarousal";
			orgNode.src = getURL("image","notMember");
			document.getElementsByClassName("orgSlick")[0].appendChild(orgNode);
		}else if(suppCount<4){
			organizations.forEach(function(org){
				var orgNode = document.createElement("img");
				orgNode.style.left = 25*(4-suppCount) + "px";
				orgNode.className = "carousElementMan";
				orgNode.src = commonstrings.sidServerHttp+"/organizations/"+org+".png";
				orgNode.addEventListener('click',function(){
					window.open(commonstrings.sidServerHttp+"/organizations/"+org);
				});
				document.getElementsByClassName("orgSlick")[0].appendChild(orgNode);
			});
		}else{
			organizations.forEach(function(org){
				var orgNode = document.createElement("img");
				orgNode.className = "carousElement";
				orgNode.src = commonstrings.sidServerHttp+"/organizations/"+org+".png";
				document.getElementsByClassName("orgSlick")[0].className += " orgSlickAct";
				orgNode.addEventListener('click',function(){
					window.open(commonstrings.sidServerHttp+"/organizations/"+org);
				});
				document.getElementsByClassName("orgSlick")[0].appendChild(orgNode);
			});
			$('.orgSlick').slick({
				infinite: true,
				slidesToShow: 2,
				slidesToScroll: 1,
				autoplay: true,
				centerMode:true
			});
			var rArrow = document.createElement("img");
			var lArrow = document.createElement("img");
			rArrow.className = "slickArrowR";
			lArrow.className = "slickArrowL";
			rArrow.src = getURL("image","right");
			lArrow.src = getURL("image","left");
			document.getElementsByClassName("slick-next")[0].appendChild(rArrow);
			document.getElementsByClassName("slick-prev")[0].appendChild(lArrow);
		}
	};
	
	sendAjax("POST","/rate/facebook/getMyOrganizations",{myid: targetId},postExecute);
	commitDropdownChart(targetId,node);
	
	try{
	    $.post(commonstrings.sidServer+"/facebook/rate/getLinkedinURL",{
			uid : targetId
		},
		function(data){
			document.getElementById("li_nav").href=data.url;
		});
	}catch(e){
		document.getElementById("li_nav").addEventListener('click',function(){
			notie.alert(3, 'Linked In profile not connected', 3);
		});
	}
	try{
		processCommentPopup(targetId,myId,undefined,"getComments");
	}catch(e){
		console.error(e);
	}
}

function processCommentsHTML(html,type){
	
	var targetId = extractId(1);
	var myId = extractId(0);
	var timeline = document.getElementsByClassName("fbTimelineCapsule clearfix")[0];
	if(!timeline){
		return;
	}
	var firstChild = timeline.firstChild;
	var node = document.createElement("div");
	
	timeline.insertBefore(node,firstChild);
	node.outerHTML = html;
	
	document.getElementById("commentIcon").src = getURL("image","comment");
	
	document.getElementById("sidCommentCloseButton").addEventListener("click",function(){
		document.getElementById("viewAllComments").remove();
	});
	
	processCommentPopup(targetId,myId,"selectedComment",type);
}

function processCommentPopup(targetId,myId,btnOptional,type,popupData){
	console.log("vieweing comments");
	var claimId;
	if(popupData){
		claimId = hex_md5(popupData.claim.getAttribute("data-html").toLowerCase());
	}	
	var emptyComment = "No profile comments available. Be the first to comment on this profile";
	var postExecute = function(data){
		if(document.getElementById("sidComment")){
			emptyComment = "No profile comments available. Be the first to comment on this profile";
			options.title = "Profile Reviews";
			var comment;
			if(data.comments[data.comments.length -1]){
				comment = data.comments[data.comments.length -1].comment;
			}else{
				comment = emptyComment;
			}
			if(comment.length > 72){
				comment = comment.substring(0,70) + " (...)";
			}
			document.getElementById("sidComment").innerText = comment;
		}
	};
	sendAjax("POST","/rate/facebook/getComments",{targetid : targetId,myid: myId},postExecute);
	
	var options = {
		title: "sid Comments",
		content: emptyComment,
		input:true,
		buttons: [
			{
				label: "Close",
				id:"closeModal",
				func:"close",
				half: true
			},
			{
				label: "Add Comment",
				id:"addCommentBtn",
				func:"addComment",
				half: true,
				type: type,
				network: "facebook",
				claimid: claimId,
				myId: myId,
				targetId: targetId,
				popupData: popupData
			}
		],
		autoload: false
	};
	var btn = document.getElementById("view-comment-btn");
	if(btnOptional){
		btn = document.getElementById(btnOptional);
	}
	
	var new_element = btn.cloneNode(true);
	btn.parentNode.replaceChild(new_element, btn);
	
	btn = document.getElementById("view-comment-btn");
	if(btnOptional){
		btn = document.getElementById(btnOptional);
	}
	
	btn.addEventListener('click', function(){
		var postExecute = function(data){
			var content="";
			console.log(data);
			for(var i=0;i<data.comments.length;i++){
				content = content+"Comment "+i+": "+data.comments[i].comment+"<br>";
				if(data.comments[i].mysid === myId){
					options.buttons[1].label = "Update Comment";
				}
			}
			if(type === "getClaimComments"){
				emptyComment = "No claim comments available. Be the first to comment on this claim";
				options.title = "Claim: " + popupData.claim.getAttribute("data-html");
			}
			if(content === ""){
				content = emptyComment;
			}
			options.content = content;
			var modal = new ZMODAL(options);
			modal.open();
		};
		sendAjax("POST","/rate/facebook/"+type,{targetid : targetId,myid: myId, claimid: claimId},postExecute);
	});
}


function commitDropdownChart(profId,node){
	var postExecute = function (data){
		var chartData = {};
		chartData.yesCount = data.yes;
		chartData.noCount = data.no;
		chartData.notSureCount = data.notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = true;
		chartConfigs.type = "drop";
		chartConfigs.base = "_9ry _p";
		
		addChartListener(chartData,chartConfigs,node);
	};
	sendAjax("POST","/rate/facebook/getAllRatingsCount",{targetid : profId},postExecute);
}



function scoreClaims(arrIndex, claim, classOffset){

	var rateIcon = document.createElement("DIV");
	var iconId = 'claim'+classOffset+arrIndex;
	var iconClass = 'claim';

	if(clearIconsIfSkip(claim)){
		return;
	}
	
	/*Avoid adding icons again if already added*/
	if(claim.getAttribute("data-html")===null){
		var html = claim.innerHTML.replace(/web./g,"www.");
		html = html.replace("Also ","");
		html = html.substr(0,1).toUpperCase() + html.substr(1);
		claim.setAttribute("data-html",html);
	}
	if(claim.getElementsByClassName(commonstrings.rateIconContainer).length === 0){
		rateIcon.className = "rateIconContainer "+ classOffset;
		rateIcon.innerHTML = "<img id = '" + iconId + "' class = '" + iconClass + classOffset + "' >";
		claim.appendChild(rateIcon);
	}
	if(claim.getElementsByClassName(commonstrings.rateIconContainer)[0].childElementCount>1){
		return;
	}
	
	var claimId = hex_md5(claim.getAttribute("data-html").toLowerCase());
	
	performScoring(iconId,iconClass,claimId,claim,classOffset);		
	
}

function performScoring(iconId,iconClass,claimId,claim,classOffset){
	var targetId = extractId(1);
	var myId = extractId(0);
	var popupData={};
	
	popupData.claim = claim;
	popupData.iconId = iconId;
	popupData.iconClass = iconClass;
	popupData.classOffset = classOffset;
	popupData.yes = 1;
	popupData.no = 1;
	popupData.notSure = 1;
	popupData.myRating = -10;
	
	var postExecute = function (data){
		var imgURL = getURL(iconClass,data.claimScore);
		var icon = document.getElementById(iconId);
		if(icon!==null){
			icon.src = imgURL;
			popupData.yes = data.yes;
			popupData.no = data.no;
			popupData.notSure = data.notSure;
			popupData.myRating = data.myrating;
			
			popUpOnIconByID(popupData);
		}
		else{
			console.log("info .. .. .. Icons already added");
		}
	};
	
	try{
		sendAjax("POST","/rate/facebook/getRating",{targetid : targetId, claimid : claimId,	myid : myId	},postExecute);
	}catch(e){
		var imgURL = getURL(iconClass,"N");
		var icon = document.getElementById(iconId);
		if(icon!==null){
			icon.src = imgURL;
			popUpOnIconByID(popupData);
		}
	}
}

function processRatepopup(node,myRating){
	var verified = node.getElementsByClassName(commonstrings.popVerifiedIcon);
	var neutral = node.getElementsByClassName(commonstrings.popNeutralIcon);
	var refuted = node.getElementsByClassName(commonstrings.popRefutedIcon);
	var popupBase = node.getElementsByClassName(commonstrings.popupbase);
	
	var score = {"-1": "R", 1: "T" , 0: "C"};
	var texts = {"-1": "I Reject", 1: "I Approve" , 0: "No Idea"};
	var updates = {"-1": "I Rejected", 1: "I Approved" , 0: "No Idea"};
	
	score[myRating] = score[myRating] + "_my";
	texts[myRating] = updates[myRating];
	
	node.getElementsByClassName("refA")[0].textContent = texts["-1"];
	node.getElementsByClassName("verA")[0].textContent = texts[1];
	node.getElementsByClassName("neuA")[0].textContent = texts[0];
	
	var verImgUrl = getURL("claim",score[1]);
	var neuImgUrl = getURL("claim",score[0]);
	var refImgUrl = getURL("claim",score["-1"]);
	var baseImgUrl = getURL("image","popupBase");
	
	verified[0].src = verImgUrl;
	neutral[0].src = neuImgUrl;
	refuted[0].src = refImgUrl;
	popupBase[0].src = baseImgUrl;
}

function configureListners(node,popupData){
	
	addEventToSendData(node,commonstrings.btnVerifiedIcon,popupData,1);
	addEventToSendData(node,commonstrings.btnRefutedIcon,popupData,-1);
	addEventToSendData(node,commonstrings.btnNeutralIcon,popupData,0);
	addEventToShowComments(popupData);
	
	var chartData = {};
	chartData.yesCount = popupData.yes;
	chartData.noCount = popupData.no;
	chartData.notSureCount = popupData.notSure;
	
	var chartConfigs = {};
	chartConfigs.animation = false;
	chartConfigs.type = "mini";
	chartConfigs.base = "popupbase";
	
	addChartListener(chartData,chartConfigs,popupData.claim);
}

function addEventToShowComments(popupData){
	var reviewBtn = popupData.claim.getElementsByClassName("reviewElement")[0];
	var targetId = extractId(1);
	var myId = extractId(0);
	var claimId = hex_md5(popupData.claim.getAttribute("data-html").toLowerCase());
	reviewBtn.id = "claimComment" + claimId;
	processCommentPopup(targetId,myId,reviewBtn.id,"getClaimComments",popupData);
	//reviewBtn.click();
}

function addEventToSendData(node,menuItemName,popupData,rate){
	
	var claimId = hex_md5(popupData.claim.getAttribute("data-html").toLowerCase());
	var menuItem =  popupData.claim.getElementsByClassName(menuItemName)[0];
	var targetId = extractId(1);
	var myId = extractId(0);
	
	menuItem.addEventListener("click",function(){

		notie.alert(4, 'Adding rating to siD system', 2);
		var claimData = popupData.claim.getAttribute("data-html");
		
		var postExecute = function(data){
			if(data.success !== true){
				setTimeout(function(){
					notie.alert(3, 'An unexpected error occured! Please Try Again', 3);
					console.log("An unexpected error occured! Please Try Again");
				},1000);
			}else{
				setTimeout(function(){
					notie.alert(1, 'Rating added successfully!', 3);
					console.log("Rating added successfully");
					updateProfPic(true);
				},1000);
				
				var postExecute = function(data){
					//console.log(data);
					processRatepopup(node,data.myrating);
					
					/*
					var reviewLink = popupData.claim.getElementsByClassName("reviewLink")[0];
					reviewLink.innerText = "Tell us why You think so...";
					reviewLink.style.color = "#f77";
					var reviewBtn = popupData.claim.getElementsByClassName("reviewElement")[0];
					reviewBtn.className += " tellUs"; 
					*/
					
					var inputHolder = popupData.claim.getElementsByClassName("hiddenInput")[0];
					if(!inputHolder){
						inputHolder = popupData.claim.getElementsByClassName("shownInput")[0];
					}else{
						inputHolder.className = "shownInput";
					}
					var input = popupData.claim.getElementsByClassName("comment")[0];
					if(input){
						$(input).keyup(function (e) {
							if (e.keyCode == 13) {
								var comment = input.value;
								var commentId = hex_md5(comment);
								sendAjax("POST","/rate/facebook/addComment",{
									targetid:targetId,
									myid:myId,
									commentid:commentId,
									comment:comment,
									claimid:claimId
								},function(){
									notie.alert(1, 'Comment added successfully!', 3);
									inputHolder.className = "hiddenInput";
								});
							}
						});
					}
					
					var chartData = {};
					chartData.yesCount = data.yes;
					chartData.noCount = data.no;
					chartData.notSureCount = data.notSure;
					
					var chartConfigs = {};
					chartConfigs.animation = true;
					chartConfigs.type = "mini";
					chartConfigs.base = "popupbase";
					
					var imgURL = getURL(popupData.iconClass,data.claimScore);
					document.getElementById(popupData.iconId).src=imgURL;
					drawPieChart(chartData,chartConfigs,popupData.claim);
					addChartListener(chartData,chartConfigs,popupData.claim);
				};
				
				sendAjax("POST","/rate/facebook/getRating",{targetid : targetId, claimid : claimId,	myid : myId	},postExecute);
				
				var dropdown = document.getElementsByClassName("sid_dropdown")[0];
				commitDropdownChart(targetId,dropdown);
			}
		};
		sendAjax("POST","/rate/facebook/addRating",{targetid : targetId, claimid : claimId,	myid : myId, claim: claimData, rating: rate	},postExecute);
	});
}

function clearIconsIfSkip(item){
	if(clearIconIfSkipUsingString(item)){return true;}
	if(clearEmptyIcons(item)){return true;}
	return false;
}

function clearIconIfSkipUsingString(item){
	
	var skipStringAr = fbSkipStrings;
	var nonSkipStringAr = fbNonSkipStrings;
	var text = item.textContent;
	if(text.length <= 2){
		text = item.outerHTML.toString();
	}
	for(var j=0;j<skipStringAr.length;j++){
		if(text.indexOf(skipStringAr[j])>=0){
			console.log(".. .. .. .. Will clear "+ item+ " due to "+ skipStringAr[j]);
			var skipClear = false;
			for(var k=0;k<nonSkipStringAr.length;k++){
				if(text.indexOf(nonSkipStringAr[k])>=0){
					console.log(".. .. .. .. will not clear" + item+ " due to "+ nonSkipStringAr[k]);
					skipClear = true;
					break;
				}
			}
			if(skipClear){
				continue;
			}
			return true;
		}
	}
	return false;
}

function clearEmptyIcons(item){
	if(item.parentNode.parentNode.firstChild.firstChild){
		if(item.parentNode.parentNode.firstChild.firstChild.nodeName === "BUTTON"){
			return true;
		}
	}
	return false;
}

/**Returns user id of viewer(0) or profile owner(1) as a string*/
function extractId(userType){
	if(userType === 0){
		return document.getElementsByClassName(fbstrings.myPicHeader)[0].id.substring(19);
	}else{
		var str;
		var profID;
		var strObj;
		try{
			str = document.getElementById(fbstrings.timelineMain).getAttribute("data-gt");
			strObj = JSON.parse(str);
			if(userType === 1){
				profID = strObj.profile_owner;
			}
		}catch(e){
			console.error(e);
			console.log(userType);
		}
		return profID;
	}
}

/**Returns user id of a person in timeline friendlist as a string*/
function extractFriendId(node,alt){
	var str;
	var profId;
	var strObj;
	try{
		str = node.parentNode.getAtrribute("data-hovercard");
		profId = getQueryVariable("id",str);
	}catch(e1){
		try{
			str = alt.firstChild.getAttribute("data-hovercard");
			profId = getQueryVariable("id",str);
		}catch(e3){
			try{
				str = node.parentNode.getAttribute("data-gt");
				strObj = JSON.parse(str);
				profId = strObj.engagement.eng_tid;
			}catch(e2){
				console.error(e1);
				console.error(e2);
				console.error(e3);
			}
		}
	}
	return profId;
}

/**Generate an Id given an string
function hashIds(str){
    var hash = 0;
    if (str.length <= 2){ 
		return hash;
	}
	str = str.trim();
    for (var i = 0; i < str.length; i++) {
        var character = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}*/

function addChartListener(chartData,chartConfigs,parent){
	var sidDropdown = parent.getElementsByClassName(chartConfigs.base)[0];
	console.log(chartConfigs.base+".............."+sidDropdown);
	drawPieChart(chartData,chartConfigs,parent);
	sidDropdown.addEventListener('mouseover', function() {
		if(document.getElementsByClassName("ego_section").length>0){
			document.getElementsByClassName("ego_section")[0].remove();
		}
		drawPieChart(chartData,chartConfigs,parent);
	});
}

function drawPieChart(chartData,chartConfigs,parent){
	console.log("drawing chart" + chartData.yesCount);
	var verified =chartData.yesCount;
	var rejected =chartData.noCount;
	var uncertain=chartData.notSureCount;
	var total = verified + rejected + uncertain;
	
	var pieData = [
		{
			value: rejected,
			color:"#F7464A",
			highlight: "#FF5A5E",
			label: "Rejected"
		},
		{
			value: verified,
			color: "#46BF7D",
			highlight: "#5AD391",
			label: "Approved"
		},
		{
			value: uncertain,
			color: "#FDB45C",
			highlight: "#FFC870",
			label: "Not Sure"
		}
	];
	
	var chartHolder = parent.getElementsByClassName("chartHolder")[0];
	chartHolder.firstChild.remove();
	chartHolder.innerHTML = '<canvas class='+chartConfigs.type+'_chart'+'></canvas>';

	try{
		var ctx = parent.getElementsByClassName(chartConfigs.type+'_chart')[0].getContext("2d");
		if(total>0){
			try{
				var myPie;
				myPie = new Chart(ctx).Pie(pieData,{
					animation: chartConfigs.animation,
					animationEasing: "easeInOutQuart",
					segmentStrokeColor : "#ffffff"
					//add more chart configs here as needed
				});
			}catch(err){
				console.log("sid error: "+err);
			}
		}else{
			try{
				var imgUrl = getURL("image","notRatedInfo");
				//var imgUrl = commonstrings.sidServer+"/organizations/uni_sl_uom.png";
				var base_image = new Image();
				base_image.src = imgUrl;
				ctx.drawImage(base_image,0,0,300,150);
			}catch(err){
				console.log("sid error: "+err);
			}
		}
	}catch(err){
		console.log("sid error: "+err);
	}
		
}

function getQueryVariable(variable,string) {
    var qId = string.indexOf("?");
    var query = string.substring(qId+1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function sendAjax(type,url,data,postExecute,onError){
	$.ajax(commonstrings.sidServer+url,{
		method: type,
		data: data,
		success: function(data){
			postExecute(data);
		},
		error: function(){
			if(onError){
				onError();
			}else{
				sendAjaxOverHttp('POST',commonstrings.sidServerHttp+url,data,postExecute);
			}
		}
	});
}