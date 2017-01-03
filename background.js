chrome.browserAction.onClicked.addListener(function(tab) {
	console.log("here");
    chrome.tabs.executeScript(null, {file: "sub.js"});
});

/* Code from https://developer.chrome.com/extensions/samples#search:contextmenus
 * Returns a handler which will open a new window when activated.
 */
function getClickHandler() {
  return function(info, tab) {

    // The srcUrl property is only available for image elements.
    var url = 'info.html#' + info.srcUrl;

    // Create a new window to the info page.
    chrome.windows.create({ url: url, width: 520, height: 660 });
  };
}

function imageOnClick(info, tab) {
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

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  "title" : "De-Trump Image",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : imageOnClick
});