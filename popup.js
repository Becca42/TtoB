
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

document.addEventListener('DOMContentLoaded', function () {
  var radios = document.getElementsByName('imageTypes');
  for (var i = 0; i < radios.length; i++) {
    radios[i].addEventListener('click', imgSelect(radios[i]), false);
  }
});