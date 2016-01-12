notie.confirm('"+message.message+"', 'Take me there', 'No', function() {
	var sid = window.open("http://sid.projects.mrt.ac.lk");
	$.post("http://sid.projects.mrt.ac.lk/login",{
		email: "nandunibw@gmail.com",
		password:"1"
	},function(data){
		console.log(data);
	});
	notie.alert(1, 'Try!', 3);
});