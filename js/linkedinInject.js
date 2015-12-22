console.log(getVieweeId());

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