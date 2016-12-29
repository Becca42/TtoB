chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("here");
    chrome.tabs.executeScript(null, {file: "sub.js"});
});