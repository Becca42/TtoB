/* Options Code */
function imgSelect(e) {
	console.log("help");
  chrome.tabs.query({
        "active": true,
        "currentWindow": true
    }, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			"functiontoInvoke": "TODO",
			"imgType" : this.id,
		});
    });
}

/* Context Menu Code */

function deTrump(info, tab) {
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
	"title": "You're Fired (Replace Image)",
	"parentId": imageParent,
	"type": "normal",
	"contexts": ["link", "image"],
	"onclick": deTrump
});
var imageChild12 = chrome.contextMenus.create({
	"title": "Re-hired (Restore Original)",
	"parentId": imageParent,
	"type": "normal",
	"contexts": ["link", "image"],
	"onclick": revertImage
});

