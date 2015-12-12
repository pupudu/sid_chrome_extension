/* globals chrome,Chart,getCookie,fbstrings,notie: false */
console.log(fbstrings.dodan);

var timeLineCName = document.getElementById(fbstrings.profileName);		//element to identify fb profile
//var UpStatBtn = document.getElementsByClassName('uiIconText _51z7')[0];		//element to identify fb wall
//var membersBtn = document.getElementsByClassName('_2l5d')[1];				//element to identify fb group
var timeLineHLine = document.getElementById(fbstrings.fbTimelineHeadline);			//element to identify fb page

/*(function() {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        console.log('request started!');
        this.addEventListener('load', function() {
            console.log('request completed!');
            console.log(this.readyState); //will always be 4 (ajax is completed successfully)
            console.log(this.responseText); //whatever the response was
			alert("dodan ajax");
        });
        origOpen.apply(this, arguments);
    };
})();*/

//if(getCookie("sidSession")!=="true"){	/*check whether user is logged in*/
	identify();	
//}else{
//	chrome.runtime.sendMessage("cookie mismatch");
//	console.log("Cookie mismatch. Need to log in again");
//}

/**identify web page and take required actions*/
function identify(){
	console.log(".. Identifying Web Page");
	if(timeLineCName!==null && timeLineHLine!==null){
		var selectedTab = document.getElementsByClassName(fbstrings.selectedTab)[0].innerText;
		console.log(".. .. selected tab is: " + selectedTab);
		
		updateProfPic();
		addSidAnalyticsMenu();
		
		if(selectedTab === "About") {
			var subsection = document.getElementsByClassName(fbstrings.subSection)[0];
			if(subsection.innerText === "Work and Education"){
				manipulateAboutWork();		/*if an fb about work page, and haven't modified before, then add sid elements*/
			}
									/**TODO add similar functionality to places lived, Basic info, family, and life events*/
									
			else if(subsection.innerText === "Life Events"){
				manipulateLifeEvents();		/*if an fb about work page, and haven't modified before, then add sid elements*/
			}
			
		}else if (selectedTab === "Timeline"){
			manipulateTimeLine();	/*if an fb profile timeline, and haven't modified before, then add sid elements*/
			updFrndsProfInTimeLine();
		}
	}
}

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(){
	if(document.getElementById(fbstrings.sidSign)!==null){
		if(document.getElementById(fbstrings.sidSign).src.length>10){
			console.log(".. .. Profile pic already updated");
			return;
		}
	}
	console.log(".. .. updating profile pic");
	var profPic = document.getElementsByClassName(fbstrings.photoContainer)[0];
	var icon = document.createElement("DIV");
	var imgURL;
	var profID = extract_TargetId();
	icon.innerHTML = "<img id ="+fbstrings.sidSign+" class = 'profIcon'>";
	profPic.appendChild(icon);
	
	$.post(fbstrings.sidServer+"/profRating",
	{
		targetUser: profID	
	},
	function(data/*, status*/){
		imgURL = chrome.extension.getURL("resources/icons/prof" + data.rating + ".png");
		if(document.getElementById(fbstrings.sidSign) !== null){
			document.getElementById(fbstrings.sidSign).src = imgURL;
		}
		$("#"+fbstrings.sidSign).fadeIn(2000);
	});
}

/** Appends sid-rating state over fb profile picture*/
function updFrndsProfInTimeLine(){
	/**updating friends profile pics*/
	var timelineRecent = document.getElementById(fbstrings.timelineRecent);
	var friendAr = timelineRecent.getElementsByClassName(fbstrings.friendProfiles);

	for(var i=0;i<friendAr.length;i++){
		var profID = extractFriendId(friendAr[i]);
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
	try{
		$.post(fbstrings.sidServer+"/profRating",
		{
			targetUser: profID	
		},
		function(data){
			var imgURL = chrome.extension.getURL("resources/icons/prof" + data.rating + ".png");
			document.getElementById(friendStr).src = imgURL;
		});
	}catch(e){
		//console.error(e);
		var imgURL = chrome.extension.getURL("resources/icons/profN.png");
		document.getElementById(friendStr).src = imgURL;
	}
}

function manipulateAboutWork(){
	console.log(".. .. updating about work page");
	var claimAr = document.getElementsByClassName(fbstrings.workClaim);
	var claimCount = claimAr.length; /*Number of claims on about page*/
	
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i];
		scoreClaims(i,claim,"Work"); /*TODO fix issue in icon positions of about page*/
	}
}

function manipulateLifeEvents(){
	console.log(".. .. updating life events");
	var claimAr = document.getElementsByClassName(fbstrings.lifeEventClaim);
	var claimCount = claimAr.length; /*Number of claims on about page*/
	
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i];
		scoreClaims(i,claim,"Events"); /*TODO fix issue in icon positions of about page*/
	}
}

function manipulateTimeLine(){
	var claimContainerAr = document.getElementsByClassName(fbstrings.timelineClaimContainer);
	var claimCount = claimContainerAr.length; /*Number of claims on timeline*/
	//console.log(".. .. updating fb time line" + claimAr.length);
	
	/**Scoring claim summary*/
	for(var i=0;i<claimCount;i++){
		var claim = claimContainerAr[i].getElementsByClassName(fbstrings.timelineClaim)[0];
		scoreClaims(i,claim,"");
	}
}

function addSidAnalyticsMenu(){
	if(document.getElementById(fbstrings.sidDropdown) === null){
		console.log(".. .. .. added sid analytics pop up memu");
		var profId = extract_TargetId();
		var node = document.createElement("DIV");  
		
		var headerURL = chrome.extension.getURL("resources/images/analytics_header.png");
		var legendURL = chrome.extension.getURL("resources/images/legend.png");
		
		$.get(chrome.extension.getURL("html/sidAnalytics.html"), function(data) {
			node.innerHTML = data;
			document.getElementById("analytics_header").src = headerURL;
			document.getElementById("analytics_legend").src = legendURL;
			
			commitDropdownChart(profId,node);
			
			try{
				$.post(fbstrings.sidServer+"/test/getLinkedinURL",{
					uid : profID
				},
				function(data){
					document.getElementById("li_nav").href=data.url;
				});
			}catch(e){
				document.getElementById("li_nav").addEventListener('click',function(){
					notie.alert(3, 'Linked In profile not connected', 3);
				});
			}
		});
		document.getElementsByClassName(fbstrings.fbMenubar)[0].appendChild(node);
	}
}

function commitDropdownChart(profId,node){
	$.post(fbstrings.sidServer+"/test/allCounts",{
				uid : profId
	},
	function(rating /*,status*/){
		console.log("code test");
		var chartData = {};
		chartData.yesCount = rating.yes;
		chartData.noCount = rating.no;
		chartData.notSureCount = rating.notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = true;
		chartConfigs.type = "drop";
		chartConfigs.base = "_9ry _p";
		
		addChartListener(chartData,chartConfigs,node);
	});
}

function scoreClaims(arrIndex, claim, classOffset){
	//console.log(".. .. scoring claims on time line" + claim.innerHTML);
	var profID = extract_TargetId();
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
	if(claim.getAttribute("data-html")===null){
		claim.setAttribute("data-html",claim.innerHTML);
	}
	if(claim.getElementsByClassName(fbstrings.rateIconContainer).length === 0){
		rateIcon.className = "rateIconContainer "+ classOffset;
		rateIcon.innerHTML = "<img id = '" + iconID + "' class = '" + iconClass + classOffset + "' >";
		claim.appendChild(rateIcon);
	}
	if(claim.getElementsByClassName(fbstrings.rateIconContainer)[0].childElementCount>1){
		return;
	}
	
	var claimId = hashId(claim.getAttribute("data-html"));
	arrIndex+=23;
	
	try{
	$.post(fbstrings.sidServer+"/test/ratedByOthersCounts",{
		uid : profID,
		claimid : claimId
	},
	function(data /*,status*/){
		claimScore = data.rating;
		var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+claimScore+".png");
		var icon = document.getElementById(iconID);
		if(icon!==null){
			icon.src = imgURL;
			popUpOnIconByID(claim,iconID,iconClass,classOffset,data.yes,data.no,data.notSure);
		}
		else{
			console.log("info .. .. .. Icons already added");
		}
	});
	}catch(e){
		//console.error(e);
		var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+"N.png");
		var icon = document.getElementById(iconID);
		if(icon!==null){
			icon.src = imgURL;
			popUpOnIconByID(claim,iconID,iconClass,classOffset,1,1,1);
		}
	}
}

function popUpOnIconByID(claim,iconID,iconClass,classOffset,yes,no,notSure){ //TODO
	
	var node = document.createElement("DIV");  
	var claimId = hashId(claim.getAttribute("data-html"));
	//console.log(claim.innerHTML);
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
		
		var verified = node.getElementsByClassName(fbstrings.popVerifiedIcon);
		var neutral = node.getElementsByClassName(fbstrings.popNeutralIcon);
		var refuted = node.getElementsByClassName(fbstrings.popRefutedIcon);
		var popupBase = node.getElementsByClassName(fbstrings.popupbase);
		
		var verImgUrl = chrome.extension.getURL("resources/icons/claimT.png");
		var neuImgUrl = chrome.extension.getURL("resources/icons/claimC.png");
		var refImgUrl = chrome.extension.getURL("resources/icons/claimR.png");
		var baseImgUrl = chrome.extension.getURL("resources/icons/popupBase.png");
		
		verified[0].src = verImgUrl;
		neutral[0].src = neuImgUrl;
		refuted[0].src = refImgUrl;
		popupBase[0].src = baseImgUrl;
		//clearIconsIfSkip(iconID);
		var verLink = claim.getElementsByClassName(fbstrings.btnVerifiedIcon)[0];
		var refLink = claim.getElementsByClassName(fbstrings.btnRefutedIcon)[0];
		var neuLink = claim.getElementsByClassName(fbstrings.btnNeutralIcon)[0];
		
		addEventToSendData(verLink,claimId,targetId,myId,claim,1);
		addEventToSendData(refLink,claimId,targetId,myId,claim,-1);
		addEventToSendData(neuLink,claimId,targetId,myId,claim,0);
		
		console.log("try");
		var profId = extract_TargetId();
		//console.log(data.yes+" "+data.no+" "+data.notSure)
		
		var chartData = {};
		chartData.yesCount = yes;
		chartData.noCount = no;
		chartData.notSureCount = notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = false;
		chartConfigs.type = "mini";
		chartConfigs.base = "popupbase"
		
		addChartListener(chartData,chartConfigs,claim);
	});
}

function addEventToSendData(obj,claimId,targetId,myId,claim,rate){
	//console.log(".............................................................adding  event");
	claimData = claim.getAttribute("data-html");
	obj.addEventListener("click",function(){
		//alert("event added");
		notie.alert(4, 'Adding rating to siD system', 2);
		$.post(fbstrings.sidServer+"/test/addRating",{
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
				
				$.post(fbstrings.sidServer+"/test/ratedByOthersCounts",{
					uid : targetId,
					claimid : claimId
				},function(data){
					var chartData = {};
					chartData.yesCount = data.yes;
					chartData.noCount = data.no;
					chartData.notSureCount = data.notSure;
					
					var chartConfigs = {};
					chartConfigs.animation = true;
					chartConfigs.type = "mini";
					chartConfigs.base = "popupbase"
					
					drawPieChart(chartData,chartConfigs,claim);
				});
				
				var dropdown = document.getElementsByClassName("sid_dropdown")[0];
				commitDropdownChart(targetId,dropdown);
			}
		});
	});
}

function clearIconsIfSkip(item){
	if(clearIconIfSkipUsingString(item)){return true;}
	if(clearEmptyIcons(item)){return true;}
	return false;
}

function clearIconIfSkipUsingString(item){
	//console.log(item);
	var skipStringAr = ["Your friend since","Followed by","friends","Friends on"];
	var nonSkipStringAr = ["Works","Lives in","From","Born on","Studies","Studied", "In a relationship"];
	var text = item.parentNode.innerText;
	if(text.length <= 2){
		text = item.parentNode.innerHTML.toString();
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
	if(item.parentNode.parentNode.firstChild.firstChild.nodeName === "BUTTON"){
		return true;
	}
	return false;
}


/**Returns user id of timeline owner as a string*/
function extract_TargetId(){
	var str;
	var profID;
	var strObj;
	try{
		str = document.getElementById(fbstrings.timelineMain).getAttribute("data-gt");
		strObj = JSON.parse(str);
		profID = strObj.profile_owner;
	}catch(e){
		console.log(".. .. Synchronization Issue. Page will be reloded");
		window.location.reload();
	}
	return profID;
}

/**Returns user id of viewer(0) or profile owner(1) as a string*/
function extractId(userType){
	var str;
	var profID;
	var strObj;
	try{
		str = document.getElementsByClassName(fbstrings.timelineBoxes)[0].getAttribute("data-gt");
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

/*
function commitChart(profId,chartId){
	var sidDropdown = document.getElementById(chartId);
	sidDropdown.addEventListener('mouseover', function() {
		drawPieChart(profId);
	});
}

TODO Move post request to solve loading time issues
function drawPieChart(profId){
	console.log("drawing chart");
	var verified =50;
	var rejected =50;
	var uncertain=50;
	$.post(fbstrings.sidServer+"/test/allCounts",{
		uid : profId
	},
	function(data ,status){
		verified = data.yes;
		rejected = data.no;
		uncertain = data.notSure;
		
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
		
		var chartHolder = document.getElementById(fbstrings.chartHolder)
		chartHolder.firstChild.remove();
		chartHolder.innerHTML = '<canvas class="sid_chart" id="myChart"></canvas>';

		var ctx = document.getElementById(fbstrings.analyticsChart).getContext("2d");
		try{
			var myPie;
			myPie = new Chart(ctx).Pie(pieData,{
				animation: true,
				animationEasing: "easeInOutQuart"
				//add more chart configs here as needed
			});
		}catch(err){
			console.log(err);
		}
		//ctx.clearRect(0,0,1000,1000);
	});
}
*/

/**Generate an Id given an string*/
function hashId(str){
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
	//console.log(hash +" "+ str);
    return hash;
}

function addChartListener(chartData,chartConfigs,parent){
	var sidDropdown = parent.getElementsByClassName(chartConfigs.base)[0];
	console.log(chartConfigs.base+".............."+sidDropdown);
	sidDropdown.addEventListener('mouseover', function() {
		drawPieChart(chartData,chartConfigs,parent);
	});
}

function drawPieChart(chartData,chartConfigs,parent){
	console.log("drawing chart");
	var verified =chartData.yesCount;
	var rejected =chartData.noCount;
	var uncertain=chartData.notSureCount;

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
	
	var chartHolder = parent.getElementsByClassName("chartHolder")[0];
	chartHolder.firstChild.remove();
	chartHolder.innerHTML = '<canvas class='+chartConfigs.type+'_chart'+'></canvas>';

	var ctx = parent.getElementsByClassName(chartConfigs.type+'_chart')[0].getContext("2d");
	try{
		var myPie;
		myPie = new Chart(ctx).Pie(pieData,{
			animation: chartConfigs.animation,
			animationEasing: "easeInOutSine"
			//add more chart configs here as needed
		});
	}catch(err){
		console.log(err);
	}
}