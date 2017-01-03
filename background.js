chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("here");
    chrome.tabs.executeScript(null, {file: "sub.js"});
});

function deTrump(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

    //Add all you functional Logic here
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
var parent1 = chrome.contextMenus.create({
	"title": "Change Image",
	"type": "normal",
	"contexts": ["image"]
});
var child1 = chrome.contextMenus.create({
	"title": "De-Trump",
	"parentId": parent1,
	"type": "normal",
	"contexts": ["image"],
	"onclick": deTrump
});
var child2 = chrome.contextMenus.create({
	"title": "Revert Image",
	"parentId": parent1,
	"type": "normal",
	"contexts": ["image"],
	"onclick": revertImage
});
