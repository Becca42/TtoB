
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

function pause() {
  // get old blocking list
  var blockList;
  chrome.storage.sync.get("blocking", function(item) {
    blockList = item.blocking;
  
    // get current page url
    var url;
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
      url = tabs[0].url;
    
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
      url = tabs[0].url;
    
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

document.addEventListener('DOMContentLoaded', function () {
  // get current page url
  var url;
  chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    url = tabs[0].url;
  });
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

  // TODO load display div by storage options
});
