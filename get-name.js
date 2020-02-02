var nameField = document.getElementById('name');
var submitButton = document.getElementById('submit-name');


/**
 * This gets called once we're given a name. Now we can
 * set the default popup to the main html document.
 */
function switchToMainHTML() {
	chrome.browserAction.setPopup({popup: 'main.html'}, function() {

		// Chrome only allows you to set the popup, rather than display
		// it dynamically, so we're taking care of it ourselves.
	  var body = document.body;
	  var iframe = document.createElement('iframe');
	  iframe.src = 'main.html';
	  body.innerHTML = '';
	  body.classList.add('displaying-iframe');
	  body.appendChild(iframe);
	  iframe.onload = function() {
	    body.style.height = iframe.clientHeight + 20 + 'px';
	  }
	});
}


/**
 * Get name and save to chrome sync storage so we
 * know who is using the extension and making coffee.
 */
function saveName() {
  var name = nameField.value;
  chrome.storage.sync.set({made_coffee_name: name}, function() {
    switchToMainHTML();
  });
}

// On submit, get and set name.
submitButton.addEventListener('click', saveName);

// Submit on enter.
nameField.addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		submitButton.click();
	}
});