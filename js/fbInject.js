/* globals chrome,Chart,getCookie,fbstrings,notie: false */
//TODO - Realtime update icons when rated a claim
console.log(fbstrings.dodan);

var timeLineCName = document.getElementById(fbstrings.profileName);		//element to identify fb profile
//var UpStatBtn = document.getElementsByClassName('uiIconText _51z7')[0];		//element to identify fb wall
//var membersBtn = document.getElementsByClassName('_2l5d')[1];				//element to identify fb group
var timeLineHLine = document.getElementById(fbstrings.fbTimelineHeadline);			//element to identify fb page

/*
$.get("https://www.facebook.com/Pupudu",function(data){
	var str;
	var profID;
	var strObj;
	var node=document.createElement("DIV");
	node.innerHTML=data;
	try{
		str = node.getElementsByClassName(fbstrings.timelineBoxes)[0].getAttribute("data-gt");
		console.log(node);
		strObj = JSON.parse(str);
		if(userType === 0){
			profID = strObj.viewerid;
		}else if(userType === 1){
			profID = strObj.profileownerid;
		}
	}catch(e){
		console.error(e);
		console.log(node);
		
	}
	console.log(profID);
});*/

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
			else if(subsection.innerText === "Overview"){
				manipulateOverview();
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
	
	$.post(fbstrings.sidServer+"/rate/facebook/getOverallProfileRating",
	{
		targetid: profID	
	},
	function(data/*, status*/){
		//alert(JSON.stringify(data))
		imgURL = chrome.extension.getURL("resources/icons/prof" + data.ratingLevel + ".png");
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
		$.post(fbstrings.sidServer+"/rate/facebook/getOverallProfileRating",
		{
			targetid: profID	
		},
		function(data){
			var imgURL = chrome.extension.getURL("resources/icons/prof" + data.ratingLevel + ".png");
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

function manipulateOverview(){
	console.log(".. .. updating overview");
	var claimAr = document.getElementsByClassName(fbstrings.lifeEventClaim);
	var claimCount = claimAr.length; /*Number of claims on about page*/
	
	for(var i=0;i<claimCount;i++){
		var claim = claimAr[i];
		scoreClaims(i,claim,"Overview"); /*TODO fix issue in icon positions of about page*/
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
	$.post(fbstrings.sidServer+"/rate/facebook/getAllRatingsCount",{
		targetid : profId
	},
	function(rating /*,status*/){
		console.log(rating);
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
	
	if(classOffset === "" || classOffset === "Overview"){
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
	
	var claimId = hex_md5(claim.getAttribute("data-html"));
	//alert(claimId)
	//console.log("............................."+ claim.getAttribute("data-html")+".......................")
	arrIndex+=23;
	//console.log(claim.getAttribute("data-html")+" "+profID+" "+claimId);
	try{
	$.post(fbstrings.sidServer+"/rate/facebook/getRating",{
		targetid : profID,
		claimid : claimId
	},
	function(data /*,status*/){
		console.log(JSON.stringify(data));
		claimScore = data.claimScore;
		var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+claimScore+".png");
		var icon = document.getElementById(iconID);
		if(icon!==null){
			icon.src = imgURL;
			popUpOnIconByID(claim,iconID,iconClass,classOffset,data.yes,data.no,data.notSure);
			console.log(data.yes+" "+data.no+" "+data.notSure);
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

function popUpOnIconByID(claim,iconId,iconClass,classOffset,yes,no,notSure){ //TODO

	//console.log(claim);
	
	var node = document.createElement("DIV");  
	var claimId = hex_md5(claim.getAttribute("data-html"));
	//console.log("Dodan Dodan"+ claim.getAttribute("data-html")+" " + claimId);
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
		document.getElementById(iconId).parentNode.appendChild(node);
		
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
		//clearIconsIfSkip(iconId);
		
		//console.log(claim);
		
		var verLink = claim.getElementsByClassName(fbstrings.btnVerifiedIcon)[0];
		var refLink = claim.getElementsByClassName(fbstrings.btnRefutedIcon)[0];
		var neuLink = claim.getElementsByClassName(fbstrings.btnNeutralIcon)[0];
		
		addEventToSendData(verLink,claimId,iconId,iconClass,targetId,myId,claim,1);
		addEventToSendData(refLink,claimId,iconId,iconClass,targetId,myId,claim,-1);
		addEventToSendData(neuLink,claimId,iconId,iconClass,targetId,myId,claim,0);
		
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

function addEventToSendData(obj,claimId,iconId,iconClass,targetId,myId,claim,rate){
	//console.log(".............................................................adding  event");
	
	
	//console.log(claim);
	//console.log(claimData);
	
	obj.addEventListener("click",function(){
		//alert("event added");
		notie.alert(4, 'Adding rating to siD system', 2);
		claimData = claim.getAttribute("data-html");
		//console.log(myId+" "+targetId+" "+claimId+" "+claimData+" "+rate);
		console.log(claim);
		console.log(claimData);
		
		
		//alert(claimId);
		$.post(fbstrings.sidServer+"/rate/facebook/addRating",{
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
				
				$.post(fbstrings.sidServer+"/rate/facebook/getRating",{
					targetid : targetId,
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
					
					var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+data.claimScore+".png");
					document.getElementById(iconId).src=imgURL;
					drawPieChart(chartData,chartConfigs,claim);
					addChartListener(chartData,chartConfigs,claim);
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
	var skipStringAr = ["Your friend since","Followed by","friends","Friends on","family members"];
	var nonSkipStringAr = ["Works","Lives in","From","Born on","Studies","Studied", "In a relationship"];
	var text = item.outerText;
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
		console.error(e)
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


/**Generate an Id given an string*/
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
	console.log("drawing chart" + chartData.yesCount);
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
			animationEasing: "easeInOutQuart"
			//add more chart configs here as needed
		});
	}catch(err){
		console.log(err);
	}
}



















/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
function hex_hmac_md5(k, d)
  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function b64_hmac_md5(k, d)
  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
function any_hmac_md5(k, d, e)
  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of a raw string
 */
function rstr_md5(s)
{
  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
}

/*
 * Calculate the HMAC-MD5, of a key and some data (raw strings)
 */
function rstr_hmac_md5(key, data)
{
  var bkey = rstr2binl(key);
  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input)
{
  try { hexcase } catch(e) { hexcase=0; }
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var output = "";
  var x;
  for(var i = 0; i < input.length; i++)
  {
    x = input.charCodeAt(i);
    output += hex_tab.charAt((x >>> 4) & 0x0F)
           +  hex_tab.charAt( x        & 0x0F);
  }
  return output;
}

/*
 * Convert a raw string to a base-64 string
 */
function rstr2b64(input)
{
  try { b64pad } catch(e) { b64pad=''; }
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var output = "";
  var len = input.length;
  for(var i = 0; i < len; i += 3)
  {
    var triplet = (input.charCodeAt(i) << 16)
                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
    }
  }
  return output;
}

/*
 * Convert a raw string to an arbitrary string encoding
 */
function rstr2any(input, encoding)
{
  var divisor = encoding.length;
  var i, j, q, x, quotient;

  /* Convert to an array of 16-bit big-endian values, forming the dividend */
  var dividend = Array(Math.ceil(input.length / 2));
  for(i = 0; i < dividend.length; i++)
  {
    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
  }

  /*
   * Repeatedly perform a long division. The binary array forms the dividend,
   * the length of the encoding is the divisor. Once computed, the quotient
   * forms the dividend for the next step. All remainders are stored for later
   * use.
   */
  var full_length = Math.ceil(input.length * 8 /
                                    (Math.log(encoding.length) / Math.log(2)));
  var remainders = Array(full_length);
  for(j = 0; j < full_length; j++)
  {
    quotient = Array();
    x = 0;
    for(i = 0; i < dividend.length; i++)
    {
      x = (x << 16) + dividend[i];
      q = Math.floor(x / divisor);
      x -= q * divisor;
      if(quotient.length > 0 || q > 0)
        quotient[quotient.length] = q;
    }
    remainders[j] = x;
    dividend = quotient;
  }

  /* Convert the remainders to the output string */
  var output = "";
  for(i = remainders.length - 1; i >= 0; i--)
    output += encoding.charAt(remainders[i]);

  return output;
}

/*
 * Encode a string as utf-8.
 * For efficiency, this assumes the input is valid utf-16.
 */
function str2rstr_utf8(input)
{
  var output = "";
  var i = -1;
  var x, y;

  while(++i < input.length)
  {
    /* Decode utf-16 surrogate pairs */
    x = input.charCodeAt(i);
    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
    {
      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
      i++;
    }

    /* Encode output as utf-8 */
    if(x <= 0x7F)
      output += String.fromCharCode(x);
    else if(x <= 0x7FF)
      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0xFFFF)
      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
    else if(x <= 0x1FFFFF)
      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                                    0x80 | ((x >>> 12) & 0x3F),
                                    0x80 | ((x >>> 6 ) & 0x3F),
                                    0x80 | ( x         & 0x3F));
  }
  return output;
}

/*
 * Encode a string as utf-16
 */
function str2rstr_utf16le(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                                  (input.charCodeAt(i) >>> 8) & 0xFF);
  return output;
}

function str2rstr_utf16be(input)
{
  var output = "";
  for(var i = 0; i < input.length; i++)
    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                                   input.charCodeAt(i)        & 0xFF);
  return output;
}

/*
 * Convert a raw string to an array of little-endian words
 * Characters >255 have their high-byte silently ignored.
 */
function rstr2binl(input)
{
  var output = Array(input.length >> 2);
  for(var i = 0; i < output.length; i++)
    output[i] = 0;
  for(var i = 0; i < input.length * 8; i += 8)
    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
  return output;
}

/*
 * Convert an array of little-endian words to a string
 */
function binl2rstr(input)
{
  var output = "";
  for(var i = 0; i < input.length * 32; i += 8)
    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
  return output;
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binl_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}