var checkCounter = 0;
var vieweeId;
var myId;

function startScript(){
	vieweeId = getVieweeId();
	getMyId();
	if(document.getElementsByClassName("preview-profile button-primary").length===0){
		check();
	}
}

function check(){
	checkCounter++;
	if(checkCounter > 20){
		console.log("Error getting linked ID. Make sure that you have connected your linkedin profile using the sid Website and try again.(This message will be shown 3 times)");
		return;
	}
	setTimeout(function(){
		if(!myId){
			check();
		}else{
			manipulate();
		}
	},500);
}

function manipulate(){
	console.log(myId);
	updateProfPic();
	addSidAnalyticsMenu();
	manipulateProfile();
	addCommentSection("getComments");
}

/** Returs the id of the profile being viewed*/
function getVieweeId(){
	return document.getElementsByClassName("profile-overview-content")[0].firstChild.id.replace("member-","");
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

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(){
	if(document.getElementById("verif")!==null){
		if(document.getElementById("verif").src.length>10){
			console.log(".. .. Profile pic already updated");
			return;
		}
	}
	var profPic = document.getElementsByClassName(listrings.profPic)[0];
	var icon = document.createElement("DIV");
	var accType="free";

	if(document.getElementsByClassName("premiumicon").length>0){
		accType="premium";
	}
	icon.innerHTML = "<img id ='verif' class = 'profIcon "+accType+"'>";
	profPic.appendChild(icon);
	
	$.post(commonstrings.sidServer+"/rate/linkedin/getOverallProfileRating",
	{
		targetid: vieweeId	
	},
	function(data/*, status*/){
		if(data.rating === undefined){
			data.rating = "N";
			console.error("Overall Profile Rating undefined, replaced with N");
		}
		var imgURL = getURL("prof_li_",data.rating);
		if(document.getElementById('verif') !== null){
			document.getElementById('verif').src = imgURL;
		}
		$("#verif").fadeIn(2000);
	});
}

/**Adds the sid anaytics dropdown menu to linked in menu bar
function addSidAnalyticsMenu(){
	if(document.getElementById("sidDropdown") === null){
		
		var node = document.createElement("DIV");  
		var headerURL = chrome.extension.getURL("resources/images/analytics_header.png");
		var legendURL = chrome.extension.getURL("resources/images/legend.png");
		
		$.get(chrome.extension.getURL("html/sidAnalytics_li.html"), function(data) {
			node.outerHTML = data;
			document.getElementById("analytics_header").src = headerURL;
			document.getElementById("analytics_legend").src = legendURL;
		
			commitDropdownChart(vieweeId,document);
			
			try{
				$.post("https://sid.projects.mrt.ac.lk:9000/rate/linkedin/getFbURL",{
					uid : profID
				},
				function(data){
					document.getElementById("li_nav").href=data.url;
				});
			}catch(e){
				document.getElementById("li_nav").addEventListener('click',function(){
					notie.alert(3, 'Facebook profile not connected', 3);
				});
			}
		});
		document.getElementsByClassName("nav main-nav nav-bar")[0].appendChild(node);
	}
}*/

function processAnalyticsHTML(data){
	console.log(".. .. .. adding sid analytics pop up menu");
	var node = document.createElement("DIV");  
	document.getElementsByClassName(listrings.mainNavBar)[0].appendChild(node);
	node.outerHTML = data;
	
	var headerURL = getURL("image","analytics_header");
	var legendURL = getURL("image","legend");
	
	document.getElementById("analytics_header").src = headerURL;
	document.getElementById("analytics_legend").src = legendURL;
	
	commitDropdownChart(vieweeId,document);
	
	try{
		$.post(commonstrings.sidServer+"/rate/linkedin/getFbURL",{
			uid : vieweeId
		},
		function(data){
			document.getElementById("li_nav").href=data.url;
		});
	}catch(e){
		document.getElementById("li_nav").addEventListener('click',function(){
			notie.alert(3, 'Facebook profile not connected', 3);
		});
	}
}

function processCommentsHTML(html,type){
	
	var targetId;
	var myId;
	
	var profile = document.getElementById("profile");
	var background = document.getElementById("background");
	if(!background){
		return;
	}
	var node = document.createElement("div");
	
	profile.insertBefore(node,background);
	node.outerHTML = html;
	
	//processCommentPopup(targetId,myId,"selectedComment",type);
}

function commitDropdownChart(profId,node){
	$.post(commonstrings.sidServer+"/rate/linkedin/getAllRatingsCount",{
		targetid : profId
	},
	function(rating){
		var chartData = {};
		chartData.yesCount = rating.yes;
		chartData.noCount = rating.no;
		chartData.notSureCount = rating.notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = true;
		chartConfigs.type = "drop";
		chartConfigs.base = "chartBase";
		chartConfigs.border = "#333333";
		
		addChartListener(chartData,chartConfigs,node);
	});
}


function addChartListener(chartData,chartConfigs,parent){
	console.log(parent);
	var sidDropdown = parent.getElementsByClassName(chartConfigs.base)[0];
	//console.log(chartConfigs.base+".............."+sidDropdown);
	sidDropdown.addEventListener('mouseover', function() {
		drawPieChart(chartData,chartConfigs,parent);
	});
}

function drawPieChart(chartData,chartConfigs,parent){
	//console.log("drawing chart" + chartData.yesCount);
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
	if(total>0){
		try{
			var myPie;
			myPie = new Chart(ctx).Pie(pieData,{
				animation: chartConfigs.animation,
				animationEasing: "easeInOutQuart",
				segmentStrokeColor : chartConfigs.border
				//add more chart configs here as needed
			});
		}catch(err){
			console.log(err);
		}
	}else{
		var imgUrl = getURL("image","notRatedInfo");
		base_image = new Image();
		base_image.src = imgUrl;
		ctx.drawImage(base_image,0,0,300,150);
	}
}

function manipulateProfile(){
	var bgSectionAr = document.getElementsByClassName("background-section");
	for(var j=0;j<bgSectionAr.length;j++){
		if(bgSectionAr[j].id === "background-languages-container"){
			continue;
		}
		if(bgSectionAr[j].id === "background-additional-info-container"){
			continue;
		}
		var claimAr = bgSectionAr[j].getElementsByClassName("section-item");
		var claimCount = claimAr.length; 
		
		for(var i=0;i<claimCount;i++){
			var claim = claimAr[i].getElementsByTagName("h4")[0];
			scoreClaims(j,i,claim,"Main"); 
		}
	}
}

function scoreClaims(secIndex, arrIndex, claim, classOffset, isOffset){
	//console.log(".. .. scoring claims on time line" + claim.innerHTML);
	if(claim == undefined){return;}
	arrIndex = 100*secIndex + arrIndex;

	var rateIcon = document.createElement("DIV");
	var iconId = 'claimR'+classOffset+arrIndex;
	var iconClass = 'claim';
	var claimScore = 'T';
	
	if(classOffset === ""){
		if(clearIconsIfSkip(claim)){
			return;
		}
	}
	/*Avoid adding icons again if already added*/
	if(claim.getAttribute("data-html")===null){
		var html = claim.innerHTML.replace(/web./g,"www.");
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
	
	var claimId = hex_md5(claim.getAttribute("data-html"));
	
	try{
	$.post(commonstrings.sidServer+"/rate/linkedin/getRating",{
		targetid : vieweeId,
		claimid : claimId,
		myid : myId
	},
	function(data){
		
		claimScore = data.claimScore;
		var imgURL = getURL(iconClass,claimScore);
		var icon = document.getElementById(iconId);
		if(icon!==null){
			icon.src = imgURL;
			
			var popupData={};
			popupData.claim = claim;
			popupData.iconId = iconId;
			popupData.iconClass = iconClass;
			popupData.classOffset = classOffset;
			popupData.yes = data.yes;
			popupData.no = data.no;
			popupData.notSure = data.notSure;
			popupData.myRating = data.myrating;
			
			popUpOnIconByID(popupData);
		}
		else{
			console.log("info .. .. .. Icons already added");
		}
	});
	}catch(e){
		
		var imgURL = getURL(iconClass,"N");
		var icon = document.getElementById(iconId);
		if(icon!==null){
			icon.src = imgURL;
			
			var popupData={};
			popupData.claim = claim;
			popupData.iconId = iconId;
			popupData.iconClass = iconClass;
			popupData.classOffset = classOffset;
			popupData.yes = 1;
			popupData.no = 1;
			popupData.notSure = 1;
			popupData.myRating = -10;
			
			popUpOnIconByID(popupData);
		}
	}
}
/*
function popUpOnIconByID(claim,iconId,iconClass,classOffset,yes,no,notSure){ //TODO

	var node = document.createElement("DIV");  
	var claimId = hashId(claim.getAttribute("data-html"));
	var targetId = vieweeId;
	
	classOffset = classOffset+"_d";
	if(claim.getElementsByClassName(iconClass+classOffset).length > 0){
		return;
	}
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
		var baseImgUrl = chrome.extension.getURL("resources/images/popupBase.png");
		
		verified[0].src = verImgUrl;
		neutral[0].src = neuImgUrl;
		refuted[0].src = refImgUrl;
		popupBase[0].src = baseImgUrl;
		
		var verLink = claim.getElementsByClassName(fbstrings.btnVerifiedIcon)[0];
		var refLink = claim.getElementsByClassName(fbstrings.btnRefutedIcon)[0];
		var neuLink = claim.getElementsByClassName(fbstrings.btnNeutralIcon)[0];
		
		addEventToSendData(verLink,claimId,iconId,iconClass,targetId,myId,claim,1);
		addEventToSendData(refLink,claimId,iconId,iconClass,targetId,myId,claim,-1);
		addEventToSendData(neuLink,claimId,iconId,iconClass,targetId,myId,claim,0);
		
		var chartData = {};
		chartData.yesCount = yes;
		chartData.noCount = no;
		chartData.notSureCount = notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = false;
		chartConfigs.type = "mini";
		chartConfigs.base = "popupbase"
		chartConfigs.border = "#ffffff";
		
		addChartListener(chartData,chartConfigs,claim);
	});
}*/


function processRatepopup(node,myRating){
	var verified = node.getElementsByClassName(commonstrings.popVerifiedIcon);
	var neutral = node.getElementsByClassName(commonstrings.popNeutralIcon);
	var refuted = node.getElementsByClassName(commonstrings.popRefutedIcon);
	var popupBase = node.getElementsByClassName(commonstrings.popupbase);
	
	var R = "R";
	var C = "C";
	var T = "T";
	switch(myRating){
		case -1:
			R = R + "_my";
			break;
		case 0:
			C = C + "_my";
			break;
		case 1:
			T = T + "_my";
			break;
		case -10:
			//console.error("claim not rated by me");
			break;
		default:
			//console.error("Unexpected my rating value" + myRating);
			break;
	}
	
	var verImgUrl = getURL("claim",T);
	var neuImgUrl = getURL("claim",C);
	var refImgUrl = getURL("claim",R);
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
	
	var chartData = {};
	chartData.yesCount = popupData.yes;
	chartData.noCount = popupData.no;
	chartData.notSureCount = popupData.notSure;
	
	var chartConfigs = {};
	chartConfigs.animation = false;
	chartConfigs.type = "mini";
	chartConfigs.base = "popupbase";
	chartConfigs.border = "#ffffff";
	
	addChartListener(chartData,chartConfigs,popupData.claim);
}
/*
function addEventToSendData(obj,claimId,iconId,iconClass,targetId,myId,claim,rate){

	obj.addEventListener("click",function(){
		notie.alert(4, 'Adding rating to siD system', 2);
		claimData = claim.getAttribute("data-html");
		
		//console.log(myId+" "+targetId+" "+claimId+" "+claimData+" "+rate);
		$.post(fbstrings.sidServer+"/rate/linkedin/addRating",{
			myid: myId,
			targetid: targetId,
			claimid: claimId,
			claim: claimData,
			rating: rate
		},
		function(data){
			console.log(data);
			if(data.success !== true){
				setTimeout(function(){
					notie.alert(3, 'An unexpected error occured! Please Try Again', 3);
					console.log("An unexpected error occured! Please Try Again")
				},1000)
			}else{
				setTimeout(function(){
					notie.alert(1, 'Rating added successfully!', 3);
					console.log("Rating added successfully!")
				},1000)
				$.post(fbstrings.sidServer+"/rate/linkedin/getRating",{
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
					chartConfigs.border = "#ffffff";
					
					var imgURL = chrome.extension.getURL("resources/icons/"+iconClass+data.claimScore+".png");
					document.getElementById(iconId).src=imgURL;
					drawPieChart(chartData,chartConfigs,claim);
					addChartListener(chartData,chartConfigs,claim);
				});
				
				var dropdown = document.getElementsByClassName("sid_dropdown")[0];
				commitDropdownChart(targetId,document);
			}
		});
	});
}*/


function addEventToSendData(node,menuItemName,popupData,rate){
	
	var claimId = hex_md5(popupData.claim.getAttribute("data-html"));
	var menuItem =  popupData.claim.getElementsByClassName(menuItemName)[0];
	var targetId = vieweeId;
	
	menuItem.addEventListener("click",function(){

		notie.alert(4, 'Adding rating to siD system', 2);
		claimData = popupData.claim.getAttribute("data-html");
		$.post(commonstrings.sidServer+"/rate/linkedin/addRating",{
			myid: myId,
			targetid: targetId,
			claimid: claimId,
			claim: claimData,
			rating: rate
		},
		function(data){
			
			if(data.success !== true){
				setTimeout(function(){
					notie.alert(3, 'An unexpected error occured! Please Try Again', 3);
					console.log("An unexpected error occured! Please Try Again")
				},1000)
			}else{
				setTimeout(function(){
					notie.alert(1, 'Rating added successfully!', 3);
					console.log("Rating added successfully");
					updateProfPic(true);
				},1000)
				$.post(commonstrings.sidServer+"/rate/linkedin/getRating",{
					targetid : targetId,
					myid: myId,
					claimid : claimId
				},function(data){
					console.log(data);
					processRatepopup(node,data.myrating);
					var chartData = {};
					chartData.yesCount = data.yes;
					chartData.noCount = data.no;
					chartData.notSureCount = data.notSure;
					
					var chartConfigs = {};
					chartConfigs.animation = true;
					chartConfigs.type = "mini";
					chartConfigs.base = "popupbase";
					chartConfigs.border = "#ffffff";
					
					var imgURL = getURL(popupData.iconClass,data.claimScore);
					document.getElementById(popupData.iconId).src=imgURL;
					drawPieChart(chartData,chartConfigs,popupData.claim);
					addChartListener(chartData,chartConfigs,popupData.claim);
				});
				
				var dropdown = document.getElementsByClassName("sid_dropdown")[0];
				commitDropdownChart(targetId,document);
			}
		});
	});
}

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
