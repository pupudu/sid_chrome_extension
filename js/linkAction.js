$.post("http://sid.projects.mrt.ac.lk/login",{
	email: "nandunibw@gmail.com",
	password:"1"
},function(data){
	$.get("http://sid.projects.mrt.ac.lk/connect/facebook",function(data){
		notie.alert(1, 'Account Linked Successfully', 3);
		setTimeout(function(){
			close();
		},4000);
	});
});
