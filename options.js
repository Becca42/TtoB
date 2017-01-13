/* Code adapted from https://developer.chrome.com/extensions/options */

/* Saves options to storage, displays a temporary message when save button is clicked */
function save_options() {
	var selectedType;
	var radios = document.getElementsByName('imageTypes');
	for (var i = radios.length - 1; i >= 0; i--) {
		if (radios[i].checked)
		{
			selectedType = radios[i].id;
		}
	}

  chrome.storage.sync.set({
    imgType: selectedType,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 900);
  });
}

/* Restores select box and checkbox state using the preferences
 * stored in chrome.storage. */
function restore_options() {
  // Use default value imgType = 'BO'
  chrome.storage.sync.get({
    imgType: 'BO',
  }, function(items) {
	var radios = document.getElementsByName('imageTypes');
	for (var i = radios.length - 1; i >= 0; i--) {
		if (items.imgType == radios[i].id && items.imgType !== null)
		{
			console.log(radios[i]);
			document.getElementById(radios[i].id).setAttribute("checked", "true");
		}
	}
  });

  // add image srcs
  document.getElementById('BO_IMG').src = chrome.extension.getURL("/images/bo_images/Bo_1/1x1.jpg");
  document.getElementById('FLAG_IMG').src = chrome.extension.getURL("/images/flag_images/flag_01/1x1.jpg");
  document.getElementById('TROMP_IMG').src = chrome.extension.getURL("/images/trompet_images/trompet_1/1x1.jpg");
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);