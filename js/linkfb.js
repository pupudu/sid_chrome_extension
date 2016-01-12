
notie.confirm('"+message.message+"', 'Take me there', 'No', function() {
	chrome.runtime.sendMessage("connectFb");
});

