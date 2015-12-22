var vieweeId = getVieweeId();

updateProfPic();
addSidAnalyticsMenu();

/** Returs the id of the profile being viewed*/
function getVieweeId(){
	return document.getElementsByClassName("profile-overview-content")[0].firstChild.id.replace("member-","");
}

/** Appends sid-rating state over fb profile picture*/
function updateProfPic(){
	if(document.getElementById("verif")!==null){
		if(document.getElementById("verif").src.length>10){
			console.log(".. .. Profile pic already updated");
			return;
		}
	}
	var profPic = document.getElementsByClassName("profile-picture")[0];
	var icon = document.createElement("DIV");
	var accType="free";

	if(document.getElementsByClassName("premiumicon").length>0){
		accType="premium";
	}
	icon.innerHTML = "<img id ='verif' class = 'profIcon "+accType+"'>";
	profPic.appendChild(icon);
	
	$.post("https://sid.projects.mrt.ac.lk:9000/rate/linkedin/getOverallProfileRating",
	{
		targetid: vieweeId	
	},
	function(data/*, status*/){
		if(data.rating === undefined){
			data.rating = "N";
			console.error("Overall Profile Rating undefined, replaced with N");
		}
		var imgURL = chrome.extension.getURL("resources/icons/prof_li_" + data.rating + ".png");
		if(document.getElementById('verif') !== null){
			document.getElementById('verif').src = imgURL;
		}
		$("#verif").fadeIn(2000);
	});
}

/**Adds the sid anaytics dropdown menu to linked in menu bar*/
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
				$.post("https://sid.projects.mrt.ac.lk:9000/test/getLinkedinURL",{
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
		document.getElementsByClassName("nav main-nav nav-bar")[0].appendChild(node);
	}
}

function commitDropdownChart(profId,node){
	$.post("https://sid.projects.mrt.ac.lk:9000/rate/linkedin/getAllRatingsCount",{
		targetid : profId
	},
	function(rating /*,status*/){
		console.log(rating);
		var chartData = {};
		chartData.yesCount = 5;//rating.yes;
		chartData.noCount = 5;//rating.no;
		chartData.notSureCount = 5;//rating.notSure;
		
		var chartConfigs = {};
		chartConfigs.animation = true;
		chartConfigs.type = "drop";
		chartConfigs.base = "chartBase";
		
		addChartListener(chartData,chartConfigs,node);
	});
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

