console.log(getVieweeId());
var vieweeId = getVieweeId();
updateProfPic();

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


function getVieweeId(){
	return document.getElementsByClassName("profile-overview-content")[0].firstChild.id.replace("member-","");
}

function getQueryVariable(variable,string) {
    var qId = string.indexOf("?");
    var query = string.substring(qId+1);
    var vars = query.split('&');
	//console.log(vars);
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
		//console.log(pair);
		//console.log(decodeURIComponent(pair[0])+" "+variable);
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}