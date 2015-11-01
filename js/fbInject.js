var timeLineCName = document.getElementById('fb-timeline-cover-name');		//element to identify fb profile
var UpStatBtn = document.getElementsByClassName('uiIconText _51z7')[0];		//element to identify fb wall
var membersBtn = document.getElementsByClassName('_2l5d')[1];				//element to identify fb group
var timeLineHLine = document.getElementById('fbTimelineHeadline');			//element to identify fb page
var sidId = document.getElementById('sidId');
console.log("Content Script loaded");

if(getCookie("sidSession")==="true"){	/*check whether user is logged in*/
	identify();	/*identify web page*/
}else{
	console.log("Cookie mismatch. Need to log in again");
}

function identify(){
	console.log("Action listen");
	if(timeLineCName!=null && timeLineHLine!=null){
	
		var isAbout = (document.getElementById("medley_header_about") != null);
		if(sidId === null){
			updateProfPic();
			overrideOverflowProperty();
			if(isAbout) {
				manipulateAbout();
			} else{
				manipulateTimeLine();	/*if an fb profile, and haven't modified before, then add sid elements*/
			}
		}else{
			/*if(isAbout && sidId.innerText != "0") {
				overrideOverflowProperty();
				setVisitStatus(0);
				manipulateAbout();
			} else if(sidId.innerText != "1"){
				setVisitStatus(1);
				manipulateTimeLine();
			}*/
		}
		//addIconsToPopupMenus();
	}
}

function manipulateAbout(){
	var claimCount = document.getElementsByClassName("_2lzr _50f5 _50f7").length;
	if(claimCount >0){
		setVisitStatus(0);
	}
	for(var i=0;i<claimCount;i++){
		var claim = document.getElementsByClassName("_2lzr _50f5 _50f7")[i];
		scoreClaimsOnTimeLine(i,claim,"About");
		popUpOnIcons('claim',i,claimCount);
	}
}

function manipulateTimeLine(){
	var claimCount = document.getElementsByClassName("_1zw6 _md0 _5vb9").length;
	if(claimCount >0){
		setVisitStatus(1);
	}
	for(var i=0;i<claimCount;i++){
		var claim = document.getElementsByClassName("_1zw6 _md0 _5vb9")[i].getElementsByClassName("_50f3")[0];
		scoreClaimsOnTimeLine(i,claim,"");
		popUpOnIcons('claim',i,claimCount);
	}
}

function setVisitStatus(page){
	if(sidId != null){
		sidId.innerText = page;
		return;
	}
	sidId = document.createElement("DIV"); 
	sidId.innerHTML = "<p id='sidId' style = 'display:none'>"+page+"</p>";
	document.getElementsByClassName('photoContainer')[0].appendChild(sidId);
	console.log("visit status"+sidId);
	addSidAnalyticsMenu();
}

function addSidAnalyticsMenu(){
	//timeLineCName.innerHTML += '<span class="_5rqt"><span class="_5rqu"><span data-hover="tooltip" data-tooltip-position="right" class="_56_f _5dzy _5d-1 _5d-3" id="u_jsonp_2_7" aria-label="sID Verified User"></span></span></span>'
	var node = document.createElement("DIV");  
//	node.innerHTML=('<div class="_6a uiPopover _6-6 _9rx _5v-0" id="u_0_p"><a class="_9ry _p" href="#" aria-haspopup="true" aria-expanded="false" rel="toggle" role="button" id="u_0_q1" aria-owns="u_a_0">sID Analytics<i class="_bxy img sp_qk8sNUxukfD sx_1586e3"></i></a></div>');
//	node.innerHTML=('<div class="_6a uiPopover dropdown _6-6 _9rx _5v-0" id="u_0_p1"><a class="_9ry _p" id="u_0_q1" aria-owns="u_a_0">sID Analytics</a></div>');
//	node.innerHTML = '<ul class="_6a dropdown _6-6 _9rx _5v-0 "><li><a href="…">Page 1</a><ul><li><a href="…">Sub-page 1.1</a></li><li><a href="…">Sub-page 1.2</a></li></ul></li></ul>';
//node.innerHTML = '<div id = "test" class="dropdown"><button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">sid Analytics<span class="caret"></span></button><ul class="dropdown-menu"><li><a href="#">HTML</a></li><li><a href="#">CSS</a></li><li><a href="#">JavaScript</a></li></ul></div>';	
	$.get(chrome.extension.getURL("html/sidAnalytics.html"), function(data) {
		//$(data).appendTo('body');
		// Or if you're using jQuery 1.8+:
		// $($.parseHTML(data)).appendTo('body');
		//console.log(data);
		node.innerHTML = data;
		commitChart();
	});
	document.getElementsByClassName('_6_7 clearfix')[0].appendChild(node);
}

function clearSkipIcons(){
	var skipList = ["sx_548137","sx_a8fd72"];
	for(var i = 0; i<skipList.length; i++){
		var itemAr = document.getElementsByClassName(skipList[i]);
		if(itemAr.length === 0){
			continue;
		}
		for(var j=0;j<itemAr.length;j++){
			var text = itemAr[j].parentNode.getElementsByClassName("_50f3")[0].innerText;
			if(text.indexOf("from")!=-1){
				continue;
			}
			//console.log(text.indexOf("from")!=-1);
			itemAr[j].parentNode.getElementsByClassName("rateIconContainer")[0].remove();
		}
	}
}

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(){
	var profPic = document.getElementsByClassName("photoContainer")[0];
	var icon = document.createElement("DIV");
	var imgURL;var profID = extract_UserID();
	icon.innerHTML = "<img id ='verif' class = 'profIcon'>"
	profPic.appendChild(icon);
	
	$.post("https://id.projects.mrt.ac.lk:9000/profRating",
	{
		targetUser: profID	
	},
	function(data, status){
		imgURL = chrome.extension.getURL("resources/icons/prof" + data.rating + ".png");
		document.getElementById('verif').src = imgURL;
		$("#verif").fadeIn(2000);
	});
}

function scoreClaimsOnTimeLine(arrIndex, cla, classOffset){
	var profID = extract_UserID();
	//var cla = document.getElementsByClassName("_1zw6 _md0 _5vb9")[arrIndex].getElementsByClassName("_50f3")[0];
	var claim = document.createElement("DIV");
	var iconID = 'claimR'+arrIndex;
	var iconClass = 'claim';
	var claimScore = 'T';
	
	claim.className = "rateIconContainer";
	claim.innerHTML = "<img id = '" + iconID + "' class = '" + iconClass + classOffset + "' >";
	
	cla.appendChild(claim);
	arrIndex+=23;
	
	//console.log(arrIndex);
	
	$.post("https://id.projects.mrt.ac.lk:9000/claimScore",{
		targetUser : profID,
		claimID : arrIndex
	},
	function(data,status){
		claimScore = data.rating;
		var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+claimScore+".png");
		var icon = document.getElementById(iconID)
		if(icon!=null){
			icon.src = imgURL;
		}
	});
}

function popUpOnIcons(iconClass,i,max){ //TODO
	//console.log("Dodan"+i);
	var node = document.createElement("DIV");  
	$.get(chrome.extension.getURL("html/ratePopup.html"), function(data) {
		//$(data).appendTo('body');
		// Or if you're using jQuery 1.8+:
		// $($.parseHTML(data)).appendTo('body');
		//console.log(data);
		node.innerHTML = data;
		document.getElementsByClassName('rateIconContainer')[i].appendChild(node);
		//commitChart();
		if(i==max-1){
			addIconsToPopupMenus();
			clearSkipIcons();
		}
	});
	
}

/**Returns logged in user id as a string*/
function extract_UserID(){
	var str;
	var profID;
	try{
		str = document.getElementById("pagelet_timeline_main_column").getAttribute("data-gt");
		var a = str.indexOf('{');
		var b = str.indexOf('}');
		var profElementStr = str.substring(++a, b).split(',')[0].split(':')[1];
		profID = profElementStr.substring(1,profElementStr.length-1);
	}catch(e){
		console.log("Synchronization Issue. Page will be reloded");
		window.location.reload();
	}
	return profID;
	
}

/**Get a cookie from main browser*/
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1);
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
}

/*TODO Move post request to solve loading time issues*/
function drawPieChart(){
	var verified =50;
	var rejected =50;
	var uncertain=50;
	$.post("https://id.projects.mrt.ac.lk:9000/claimRating",{
		sender : 12,
		target : 12,
		cClass : 12,
		claimId :12
	},
	function(data,status){
		verified = data.positive;
		rejected = data.negative;
		uncertin = data.uncertain;
		
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
function commitChart(){
	var sidDropdown = document.getElementById('sidDropdown');
	sidDropdown.addEventListener('mouseover', function() {
		drawPieChart();
	});
}

function commitPopup(itemId){
	var item = document.getElementById(itemId);
	item.addEventListener('mouseover', function() {
		showRatingPopupMenu(itemId);
	});
}



function overrideOverflowProperty(){
	var containerArray = document.getElementsByClassName('_42ef');
	for(var i=0;i<containerArray.length;i++){
		var container = document.getElementsByClassName('_42ef')[i];
		if(container.classList.length===1){
		   container.setAttribute("style","overflow:visible");
		}
	}
}

function addIconsToPopupMenus(){
	var verified = document.getElementsByClassName("popVerifiedIcon");
	var neutral = document.getElementsByClassName("popNeutralIcon");
	var refuted = document.getElementsByClassName("popRefutedIcon");
	
	verImgUrl = chrome.extension.getURL("resources/icons/claimT.png");
	neuImgUrl = chrome.extension.getURL("resources/icons/claimC.png");
	refImgUrl = chrome.extension.getURL("resources/icons/claimR.png");
	
	for(var i=0;i<verified.length;i++){
		verified[i].src = verImgUrl;
		neutral[i].src = neuImgUrl;
		refuted[i].src = refImgUrl;
	}
}
