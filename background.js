chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("here");
    chrome.tabs.executeScript(null, {file: "sub.js"});
});

function deTrump(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

    chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			"functiontoInvoke": "replaceSrcContext",
			"info" : info,
		});
    });
}

function revertImage(info, tab)
{
	chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			"functiontoInvoke": "revertImage",
			"info" : info,
		});
	});
}

/* Create a context menu with "de-trump" and "revert" options
 */
var imageParent = chrome.contextMenus.create({
	"title": "Change Image",
	"type": "normal",
	"contexts": ["link", "image"]
});
var imageChild1 = chrome.contextMenus.create({
	"title": "Replace Image",
	"parentId": imageParent,
	"type": "normal",
	"contexts": ["link", "image"],
	"onclick": deTrump
});
var imageChild12 = chrome.contextMenus.create({
	"title": "Restore Original Image",
	"parentId": imageParent,
	"type": "normal",
	"contexts": ["link", "image"],
	"onclick": revertImage
});

