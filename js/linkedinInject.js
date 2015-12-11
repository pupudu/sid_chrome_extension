/*TODO**
* Profile icon issue with premium users
*/ 

/* globals chrome,Chart,getCookie: false */
console.log("Content Script loaded");

var profile = document.getElementsByClassName("view-public-profile")[0];

identify();	

/**identify web page and take required actions*/
function identify(){
	console.log(".. Identifying LI Page");
	if(profile!==null){
		updateProfPic();
		//addSidAnalyticsMenu();
		manipulateProfile();
	}
}

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(){
	if(document.getElementById("verif")!==null){
		if(document.getElementById("verif").src.length>10){
			console.log(".. .. Profile pic already updated");
			return;
		}
	}
	console.log(".. .. updating profile pic");
	var profPic = document.getElementsByClassName("profile-picture")[0];
	var icon = document.createElement("DIV");
	var imgURL;
	//var profID = hashId(profile.innerText.substring(24));
	var url = document.getElementsByName("currenturl")[0].getAttribute("value").toString();
	//alert(url);
	var profID = getQueryVariable("id",url);
	//alert(profID);
	icon.innerHTML = "<img id ='verif' class = 'profIcon'>";
	profPic.appendChild(icon);
	
	$.post("https://id.projects.mrt.ac.lk:9000/profRating",
	{
		targetUser: profID	
	},
	function(data/*, status*/){
		imgURL = chrome.extension.getURL("resources/icons/prof_li_" + data.rating + ".png");
		if(document.getElementById('verif') !== null){
			document.getElementById('verif').src = imgURL;
		}
		$("#verif").fadeIn(2000);
	});
}

function manipulateProfile(){
	console.log(".. .. updating sections");
	var bgSectionAr = document.getElementsByClassName("background-section");
	
	for(var j=0;j<bgSectionAr.length;j++){
	
		if(bgSectionAr[j].id === "background-languages-container"){
			continue;
		}
		if(bgSectionAr[j].id === "background-additional-info-container"){
			continue;
		}
		var claimAr = bgSectionAr[j].getElementsByClassName("section-item");
		var claimCount = claimAr.length; /*Number of claims on about page*/
		
		for(var i=0;i<claimCount;i++){
			var claim = claimAr[i];
			scoreClaims(j,i,claim,"Events"); /*TODO fix issue in icon positions of about page*/
		}
	}
}


function getQueryVariable(variable,string) {
    var qId = string.indexOf("?");
    var query = string.substring(qId+1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}












function addSidAnalyticsMenu(){
	if(document.getElementById("sidDropdown") === null){
		console.log(".. .. .. added sid analytics pop up memu");
		var node = document.createElement("DIV");  
		$.get(chrome.extension.getURL("html/sidAnalytics.html"), function(data) {
			node.innerHTML = data;
			commitChart();
		});
		document.getElementsByClassName('_6_7 clearfix')[0].appendChild(node);
	}
}


function scoreClaims(secIndex, arrIndex, claim, classOffset, isOffset){
	//console.log(".. .. scoring claims on time line" + claim.innerHTML);
	
	var offsetTop = claim.offsetTop;
	
	//if(isOffset){
		//offsetTop -= arrIndex*17;
	//}
	
	arrIndex = 100*secIndex + arrIndex;
	
	var profID = hashId(profile.innerText.substring(24));
	var rateIcon = document.createElement("DIV");
	var iconID = 'claimR'+classOffset+arrIndex;
	var iconClass = 'claim';
	var claimScore = 'T';
	
	if(classOffset === ""){
		if(clearIconsIfSkip(claim)){
			return;
		}
	}
	/*Avoid adding icons again if already added*/
	if(claim.getElementsByClassName("rateIconContainer").length === 0){
		rateIcon.className = "rateIconContainer "+ classOffset;
		rateIcon.style.top = offsetTop+"px";
		rateIcon.innerHTML = "<img id = '" + iconID + "' class = '" + iconClass + classOffset + "' >";
		claim.appendChild(rateIcon);
	}
	if(claim.getElementsByClassName("rateIconContainer")[0].childElementCount>1){
		return;
	}
	
	arrIndex+=23;
	
	$.post("https://id.projects.mrt.ac.lk:9000/claimScore",{
		targetUser : profID,
		claimID : arrIndex
	},
	function(data /*,status*/){
		//console.log(".. .. .. Adding graphic icons to rating icon holders" + iconID);
		claimScore = data.rating;
		var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+claimScore+".png");
		var icon = document.getElementById(iconID);
		if(icon!==null){
			icon.src = imgURL;
			popUpOnIconByID(claim,iconID,iconClass,classOffset);
		}
		else{
			console.log("info .. .. .. Icons already added");
		}
	});
}

function popUpOnIconByID(claim,iconID,iconClass,classOffset){ //TODO
	
	var node = document.createElement("DIV");  
	var claimId = hashId(claim.innerHTML.toString());
	var targetId = extractId(1);
	var myId = extractId(0);
	
	classOffset = classOffset+"_d";
	if(claim.getElementsByClassName(iconClass+classOffset).length > 0){
		return;
	}
	
	//console.log(claimId+" "+ claim.innerText.trim()+" "+targetId+" "+myId);
	
	$.get(chrome.extension.getURL("html/ratePopup.html"), function(data) {
		node.innerHTML = data;
		node.className=iconClass+classOffset;
		document.getElementById(iconID).parentNode.appendChild(node);
		
		var verified = node.getElementsByClassName("popVerifiedIcon");
		var neutral = node.getElementsByClassName("popNeutralIcon");
		var refuted = node.getElementsByClassName("popRefutedIcon");
		var popupBase = node.getElementsByClassName("popupbase");
		
		var verImgUrl = chrome.extension.getURL("resources/icons/claimT.png");
		var neuImgUrl = chrome.extension.getURL("resources/icons/claimC.png");
		var refImgUrl = chrome.extension.getURL("resources/icons/claimR.png");
		var baseImgUrl = chrome.extension.getURL("resources/icons/popupBase.png");
		
		verified[0].src = verImgUrl;
		neutral[0].src = neuImgUrl;
		refuted[0].src = refImgUrl;
		popupBase[0].src = baseImgUrl;
		popupBase[0].style.top = "-27px";
		//clearIconsIfSkip(iconID);
		var verLink = claim.getElementsByClassName("verA")[0];
		var refLink = claim.getElementsByClassName("refA")[0];
		var neuLink = claim.getElementsByClassName("neuA")[0];
		
		addEventToSendData(verLink,claimId,targetId,myId,claim.innerHTML.toString(),1);
		addEventToSendData(refLink,claimId,targetId,myId,claim.innerHTML.toString(),-1);
		addEventToSendData(neuLink,claimId,targetId,myId,claim.innerHTML.toString(),0);
	});
}

function addEventToSendData(obj,claimId,targetId,myId,claimData,rate){
	//console.log(".............................................................adding  event");
	obj.addEventListener("click",function(){
		//alert("event added");
		notie.alert(4, 'Adding rating to siD system', 2);
		$.post("https://id.projects.mrt.ac.lk:9000/test/addRating",{
			myid: myId,
			targetid: targetId,
			claimid: claimId,
			claim: claimData,
			rating: rate
		},
		function(data){
			console.log(data);
			if(data !== "OK"){
				notie.alert(3, 'An unexpected error occured! Please Try Again', 3);
			}else{
				notie.alert(1, 'Rating added successfully!', 3);
			}
		});
	});
}



/**Returns user id of timeline owner as a string*/
function extract_TargetId(){
	var str;
	var profID;
	var strObj;
	try{
		str = document.getElementById("pagelet_timeline_main_column").getAttribute("data-gt");
		strObj = JSON.parse(str);
		profID = strObj.profile_owner;
	}catch(e){
		console.log(".. .. Synchronization Issue. Page will be reloded");
		//window.location.reload();
	}
	return profID;
}

/**Returns user id of viewer(0) or profile owner(1) as a string*/
function extractId(userType){
	var str;
	var profID;
	var strObj;
	try{
		str = document.getElementsByClassName("timelineReportContainer")[0].getAttribute("data-gt");
		strObj = JSON.parse(str);
		if(userType === 0){
			profID = strObj.viewerid;
		}else if(userType === 1){
			profID = strObj.profileownerid;
		}
	}catch(e){
	}
	return profID;
}

/**Returns user id of a person in timeline friendlist as a string*/
function extractFriendId(node){
	var str;
	var profID;
	var strObj;
	try{
		str = node.parentNode.getAttribute("data-gt");
		strObj = JSON.parse(str);
		profID = strObj.engagement.eng_tid;
	}catch(e){
		console.error(".. .. Synchronization Issue. Page will be reloded");
	}
	return profID;
}

function commitChart(){
	var sidDropdown = document.getElementById('sidDropdown');
	sidDropdown.addEventListener('mouseover', function() {
		drawPieChart();
	});
}

/*TODO Move post request to solve loading time issues*/
function drawPieChart(){
	console.log("drawing chart");
	var verified =50;
	var rejected =50;
	var uncertain=50;
	$.post("https://id.projects.mrt.ac.lk:9000/claimRating",{
		sender : 12,
		target : 12,
		cClass : 12,
		claimId :12
	},
	function(data /*,status*/){
		verified = data.positive;
		rejected = data.negative;
		uncertain = data.uncertain;
		
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
				label: "Verified"
			},
			{
				value: uncertain,
				color: "#FDB45C",
				highlight: "#FFC870",
				label: "Uncertain"
			}
		];
		
		var ctx = document.getElementById("myChart").getContext("2d");
		try{
			window.myPie = new Chart(ctx).Pie(pieData,{
				animation: true,
				animationEasing: "easeInOutQuart"
				//add more chart configs here as needed
			});
		}catch(err){
			console.log(err);
		}
	});
}

/**Generate an Id given an string*/
function hashId(str){
    var hash = 0;
    if (str.length <= 2) return hash;
	str = str.trim();
    for (var i = 0; i < str.length; i++) {
        var character = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
	//console.log(hash +" "+ str);
	if(hash<0){
		hash*=-1;
	}
    return hash;
}
