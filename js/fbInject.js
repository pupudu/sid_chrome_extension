/* globals chrome,Chart: false */

var timeLineCName = document.getElementById('fb-timeline-cover-name');		//element to identify fb profile
//var UpStatBtn = document.getElementsByClassName('uiIconText _51z7')[0];		//element to identify fb wall
//var membersBtn = document.getElementsByClassName('_2l5d')[1];				//element to identify fb group
var timeLineHLine = document.getElementById('fbTimelineHeadline');			//element to identify fb page
var sidId = document.getElementById('sidId');
console.log("Content Script loaded");

if(getCookie("sidSession")==="true"){	/*check whether user is logged in*/
	identify();	
}else{
	console.log("Cookie mismatch. Need to log in again");
}

/**identify web page and take required actions*/
function identify(){
	console.log(".. Identifying Web Page");
	if(timeLineCName!==null && timeLineHLine!==null){
		//var isAbout = (document.getElementById("medley_header_about") !== null);	 //Did not work when came back to timeline from about
		
		var selectedTab = document.getElementsByClassName("_6-6 _6-7")[0].innerText;
		console.log(".. .. selected tab is: " + selectedTab);
		
		//if(sidId === null || isManual){
			updateProfPic();
			//addEventToMainMenus();
			//overrideOverflowProperty(); /*TODO Confirm the non-requirement of this*/
			if(selectedTab === "About") {
				//addEventToAboutSubMenus();
				manipulateAbout();		/*if an fb about work page, and haven't modified before, then add sid elements*/
										/**TODO add similar functionality to places lived, Basic info, family, and life events*/
			}else if (selectedTab === "Timeline"){
				manipulateTimeLine();	/*if an fb profile timeline, and haven't modified before, then add sid elements*/
			}
		//}else{
		//	console.log(".. .. page already modified");
		/**TODO Handle event capture issue*/
		//}
		//addIconsToPopupMenus();
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
	var profPic = document.getElementsByClassName("photoContainer")[0];
	var icon = document.createElement("DIV");
	var imgURL;var profID = extract_UserID();
	icon.innerHTML = "<img id ='verif' class = 'profIcon'>";
	profPic.appendChild(icon);
	
	$.post("https://id.projects.mrt.ac.lk:9000/profRating",
	{
		targetUser: profID	
	},
	function(data/*, status*/){
		imgURL = chrome.extension.getURL("resources/icons/prof" + data.rating + ".png");
		document.getElementById('verif').src = imgURL;
		$("#verif").fadeIn(2000);
	});
}


function manipulateAbout(){
	console.log(".. .. updating about work page");
	var claimAr = document.getElementsByClassName("_2lzr _50f5 _50f7");
	var claimCount = claimAr.length; /*Number of claims on about page*/
	if(claimCount >0){
	//	setVisitStatus(0);	/*Mark about work page as visited*/
	}
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i];
		//scoreClaimsOnTimeLine(i,claim,"About"); /*TODO fix issue in icon positions of about page*/
		//popUpOnIcons('claim',i,claimCount);
	}
}

function manipulateTimeLine(){
	var claimAr = document.getElementsByClassName("_1zw6 _md0 _5vb9");
	var claimCount = claimAr.length; /*Number of claims on timeline*/
	if(claimCount >0){
	//	setVisitStatus(1);	/*Mark timeline as visited*/
	}
	
	console.log(".. .. updating fb time line" + claimAr.length);
	
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i].getElementsByClassName("_50f3")[0];
		scoreClaimsOnTimeLine(i,claim,"");
		//popUpOnIcons('claim',i,claimCount);
	}
}

function setVisitStatus(page){
	if(sidId !== null){
		sidId.innerText = page;
		return;
	}
	console.log(".. .. .. setting visit status: " + page);
	sidId = document.createElement("DIV"); 
	sidId.innerHTML = "<p id='sidId' style = 'display:none'>"+page+"</p>";
	document.getElementsByClassName('photoContainer')[0].appendChild(sidId);
	if(document.getElementById("sidDropdown") === null){
		addSidAnalyticsMenu();
	}
}

function addSidAnalyticsMenu(){
	console.log(".. .. .. added sid analytics pop up memu");
	var node = document.createElement("DIV");  
	$.get(chrome.extension.getURL("html/sidAnalytics.html"), function(data) {
		node.innerHTML = data;
		commitChart();
	});
	document.getElementsByClassName('_6_7 clearfix')[0].appendChild(node);
}


function scoreClaimsOnTimeLine(arrIndex, claim, classOffset){
	console.log(".. .. scoring claims on time line" + claim.innerHTML);
	var profID = extract_UserID();
	var rateIcon = document.createElement("DIV");
	var iconID = 'claimR'+classOffset+arrIndex;
	var iconClass = 'claim';
	var claimScore = 'T';
	
	if(clearIconsIfSkip(claim)){
		return;
	}
	
	/*Avoid adding icons again if already added*/
	if(claim.getElementsByClassName("rateIconContainer").length === 0){
		rateIcon.className = "rateIconContainer";
		rateIcon.innerHTML = "<img id = '" + iconID + "' class = '" + iconClass + classOffset + "' >";
		claim.appendChild(rateIcon);
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
			//console.log(imgURL + " added to " + iconID)
			icon.src = imgURL;
			popUpOnIconByID(iconID);
		}
		else{
			//console.log("info .. .. .. Icons already added");
		}
	});
}

function popUpOnIcons(iconClass,i,max){ //TODO
	var node = document.createElement("DIV");  
	$.get(chrome.extension.getURL("html/ratePopup.html"), function(data) {
		node.innerHTML = data;
		node.className="claim";
		document.getElementsByClassName('rateIconContainer')[i].appendChild(node);
		if(i===max-1){
			addIconsToPopupMenus();
			clearSkipIcons();
		}
	});
}

function popUpOnIconByID(iconID){ //TODO
	var node = document.createElement("DIV");  
	$.get(chrome.extension.getURL("html/ratePopup.html"), function(data) {
		node.innerHTML = data;
		node.className="claim";
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
		//clearIconsIfSkip(iconID);
	});
}

function clearIconsIfSkip(item){
	var skip = false;
	if(clearIconIfSkipUsingString(item)){return true;}
	if(clearEmptyIcons(item)){return true;}
	return false;
}

function clearIconIfSkipUsingString(item){
	console.log(item);
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

/** Inject png images as src of icons in popup menus of claim score icons
function addIconsToPopupMenus(){
	console.log(".. .. .. injecting icons to pop up menus");
	var verified = document.getElementsByClassName("popVerifiedIcon");
	var neutral = document.getElementsByClassName("popNeutralIcon");
	var refuted = document.getElementsByClassName("popRefutedIcon");
	var popupBase = document.getElementsByClassName("popupbase");
	
	var verImgUrl = chrome.extension.getURL("resources/icons/claimT.png");
	var neuImgUrl = chrome.extension.getURL("resources/icons/claimC.png");
	var refImgUrl = chrome.extension.getURL("resources/icons/claimR.png");
	var baseImgUrl = chrome.extension.getURL("resources/icons/popupBase.png");
	
	for(var i=0;i<verified.length;i++){
		verified[i].src = verImgUrl;
		neutral[i].src = neuImgUrl;
		refuted[i].src = refImgUrl;
		popupBase[i].src = baseImgUrl;
	}
}

function clearSkipIconsUsingStrings(){
	console.log(".. .. .. clearing icons using string comparison");
	var itemAr = document.getElementsByClassName("_2m_3 _3-91 _8o _8s lfloat _ohe img sp_shwI5B09H5u");
	var skipStringAr = ["Your friend since","Followed by","friends","Friends on"];
	var nonSkipStringAr = ["Works","Lives in","From","Born on","Studies","Studied", "In a relationship"];
	for(var i=0;i<itemAr.length;i++){
		var text = itemAr[i].parentNode.getElementsByClassName("_50f3")[0].innerText;
		if(text.length === 2){
			text = itemAr[i].parentNode.getElementsByClassName("_50f3")[0].innerHTML.toString();
		}
		for(var j=0;j<skipStringAr.length;j++){
			if(text.indexOf(skipStringAr[j])>=0){
				console.log(".. .. .. .. Will clear "+ itemAr[i]+ " due to "+ skipStringAr[j]);
				var skipClear = false;
				for(var k=0;k<nonSkipStringAr.length;k++){
					if(text.indexOf(nonSkipStringAr[k])>=0){
						console.log(".. .. .. .. will not clear" + itemAr[i]+ " due to "+ nonSkipStringAr[k]);
						skipClear = true;
						break;
					}
				}
				if(skipClear){
					continue;
				}
				var parent = itemAr[i].parentNode;
				var icon = parent.getElementsByClassName("rateIconContainer")[0];
				if(icon !== undefined){
					icon.remove();
				}
			}
		}
	}
}

function clearSkipIconsUsingIcon(){
	console.log(".. .. .. clearing icons using list icon class");
	var skipList = ["sx_548137","sx_a8fd72","sx_2b5d8b","sx_5d6323","sx_6ec049","sx_f0a7ca"];
	for(var i = 0; i<skipList.length; i++){
		var itemAr = document.getElementsByClassName(skipList[i]);
		if(itemAr.length === 0){
			continue;
		}
		for(var j=0;j<itemAr.length;j++){
			var text = itemAr[j].parentNode.getElementsByClassName("_50f3")[0].innerText;
			if(text.indexOf("from")!==-1){
				continue;
			}
			//console.log(text.indexOf("from")!=-1);
			itemAr[j].parentNode.getElementsByClassName("rateIconContainer")[0].remove();
		}
	}
}
*/


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
		console.log(".. .. Synchronization Issue. Page will be reloded");
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
        while (c.charAt(0)===' ') {c = c.substring(1);}
        if (c.indexOf(name) === 0) { return c.substring(name.length,c.length);}
    }
    return "";
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

function commitPopup(itemId){ /* Method not in use at the moment*/
	var item = document.getElementById(itemId);
	item.addEventListener('mouseover', function() {
		//showRatingPopupMenu(itemId);
	});
}


/** Allow overflowing divs over the base div of claims*/
function overrideOverflowProperty(){
	var containerArray = document.getElementsByClassName('_42ef');
	for(var i=0;i<containerArray.length;i++){
		var container = document.getElementsByClassName('_42ef')[i];
		if(container.classList.length===1){
		   container.setAttribute("style","overflow:visible");
		}
	}
}

function addEventToMainMenus(){
	console.log("Adding event listners to menu items");
	var menuItemAr = document.getElementsByClassName("_6-6");
	
	if(menuItemAr[0].innerText === "Timeline"){	addEventToReload(menuItemAr[0]);}
	if(menuItemAr[1].innerText === "About"){
		addEventToReload(menuItemAr[1]);
		menuItemAr[1].addEventListener('onload', function(){
			alert("dodan");
		});
	}
}

function addEventToAboutSubMenus(){
	console.log("Adding event listners to sub menus of About page");
	var selected = document.getElementsByClassName("_6-6 _6-7")[0];
	var subMenuItemAr = document.getElementsByClassName("_5pwr");
	console.log(subMenuItemAr);
	
	window.onload = function () { alert("It's loaded!") }
	
	if(selected.innerText === "Abouti"){
		if(subMenuItemAr[0].innerText === "Work and Education"){ addEventToReload(subMenuItemAr[0]);}
		if(subMenuItemAr[1].innerText === "Places He's Lived"){ addEventToReload(subMenuItemAr[1]);}
		if(subMenuItemAr[2].innerText === "Contact and Basic Info"){ addEventToReload(subMenuItemAr[2]);}
		if(subMenuItemAr[3].innerText === "Family and Relationships"){ addEventToReload(subMenuItemAr[3]);}
		if(subMenuItemAr[5].innerText === "Life Events"){ addEventToReload(subMenuItemAr[5]);}	
	}
}

function addEventToReload(item){
	item.addEventListener('click', function(){
		if(document.getElementById('sidId') !== null){
			document.getElementById('sidId').remove();
		}
		identify(true);
	});
}


