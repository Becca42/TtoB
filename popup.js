
/* Options Code */
function imgSelect(r) {
  // if checked
  if (r.checked)
  {
    chrome.tabs.query({
      "active": true,
      "currentWindow": true
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        "functiontoInvoke": "changeImageType",
        "imgType" : r.id
      });
    });
  }
  else
  {
    // chrome.tabs.query({
    //   "active": true,
    //   "currentWindow": true
    // }, function (tabs) {
    //   chrome.tabs.sendMessage(tabs[0].id, {
    //     "functiontoInvoke": "changeImageType",
    //     "imgType" : "fu"
    //   });
    // });
  }
}

/* returns string that is website/domain of given url */
function getWebsite(url)
{
  var webRegex = new RegExp("(https?:\/\/(\\w+)(\\.\\w{2,})+\/?)");
  return url.match(webRegex)[0];
}

function pause() {
  // get old blocking list
  var blockList;
  chrome.storage.sync.get("blocking", function(item) {
    blockList = item.blocking;
  
    // get current page url
    var url;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      url = getWebsite(tabs[0].url);
    
      // set current url to blocked in list
      blockList[url] = "blocked";
      // save options to storage
      chrome.storage.sync.set({
        "blocking": blockList,
      }, function() {
        // show switching text
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
          // change buttons
          document.getElementById('start').setAttribute('style', "display: block");
          document.getElementById('pause').setAttribute('style', "display: none");
        }, 900);
      });
    });
  });
}

function start() {
  // get old blocking list
  var blockList;
  chrome.storage.sync.get("blocking", function(item) {
    blockList = item.blocking;
  
    // get current page url
    var url;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      url = getWebsite(tabs[0].url);
    
      // remove url from blocking list
      delete blockList[url];
      // save options to storage
      chrome.storage.sync.set({
        "blocking": blockList,
      }, function() {
        // show switching text
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
          // change buttons
          document.getElementById('start').setAttribute('style', "display: none");
          document.getElementById('pause').setAttribute('style', "display: block");
        }, 900);
      });
    });
  });
}
/* run blocking script on icon-click */
function runScript() {
  // show text to make it seem like something is happening
  var runText = document.getElementById('run-text');
  runText.textContent = 'Removing Trumps.';
  setTimeout(function() {
    runText.textContent = '';
  }, 900);
  chrome.tabs.executeScript(null, {file: "sub.js"});
}

document.addEventListener('DOMContentLoaded', function () {
  // get current page url
  var url;
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    url = getWebsite(tabs[0].url);
  
    // restore settings for this page
    chrome.storage.sync.get(function(item) {
      if (! item.blocking)
      {
        // init blocking if empty
        chrome.storage.sync.set({
        "blocking": {"init": "blank"},
      }, function() {
        document.getElementById('start').setAttribute('style', "display: none");
        document.getElementById('pause').setAttribute('style', "display: block");
      });
      }
      else if (!(url in item.blocking))
      {
        document.getElementById('start').setAttribute('style', "display: none");
        document.getElementById('pause').setAttribute('style', "display: block");
      }
      else if (item.blocking[url] == "blocked")
      {
        document.getElementById('start').setAttribute('style', "display: block");
        document.getElementById('pause').setAttribute('style', "display: none");
      }
      else
      {
        document.getElementById('start').setAttribute('style', "display: none");
        document.getElementById('pause').setAttribute('style', "display: block");
      }
    });
    // load image
    document.getElementById('icon').src = chrome.extension.getURL("/icons/icon-large.png");
    // add listeners for button clicks
    document.getElementById('pauseB').addEventListener('click', pause);
    document.getElementById('startB').addEventListener('click', start);

    //set link for options
    var optURL = chrome.extension.getURL("options.html");
    document.getElementById("options").href = optURL;

    // TODO onclick listener for run sub.js
    document.getElementById('runB').addEventListener('click', runScript);
  });
  // TODO load display div by storage options
});


