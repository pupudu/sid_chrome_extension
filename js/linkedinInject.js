
console.log(getId(1));
console.log(getId(0));

function getMyId(){
	var url = document.getElementsByClassName("act-set-name")[0].getElementsByTagName("a")[0].href;
	return getQueryVariable("id",url)
}

function getId(viewerType){
	if(viewerType === 0){
		var url = document.getElementsByClassName("act-set-name")[0].getElementsByTagName("a")[0].href;
	}else if(viewerType === 1){
		var url = window.location.search;
	}
	return getQueryVariable("id",url);
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