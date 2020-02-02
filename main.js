// Initialize Cloud Firestore through Firebase.
firebase.initializeApp({
  apiKey: "API-KEY-GOES-HERE",
  authDomain: "AUTH-DOMAIN.firebaseapp.com",
  databaseURL: "https://DATABASE-URL.firebaseio.com",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE-BUCKET.appspot.com",
  messagingSenderId: "SENDER-ID",
  appId: "APP-ID"
});

var firestore = firebase.firestore();
var docRef = firestore.doc('PATH/TO/DOCUMENT');

// References to elements in document.
var username = document.getElementById('username');
var coffeeStatusText = document.getElementById('coffee-status-text');
var body = document.body;
var closeBtn = document.getElementById('close-btn');

// Setup event listener on closeBtn to close popup.
closeBtn.addEventListener('click', function() {
	if (parent.document.body.className.indexOf('iframe') > -1) {
		parent.window.close();
	} else {
		window.close();
	}
});


/**
 * Changes coffee status to handed in boolean.
 * @param {Boolean} coffeeStatus Whether there's coffee.
 * @param {String} buttonId The id of the button calling this function.
 */
function changeCoffeeStatus(coffeeStatus, buttonId) {
	var now = new Date();
	var options = {};
	if (coffeeStatus) {
		options = {
		  "coffeeData.isReady": coffeeStatus,
		  "coffeeData.madeBy": username.innerText,
		  "coffeeData.madeAt": now
		};
	} else {
		options = {
			"coffeeData.isReady": coffeeStatus
		}
	}
  docRef.update(options);

  var buttonToHide = document.getElementById(buttonId);
  var statusText = document.getElementById('status-updated');
  buttonToHide.classList.add('hidden');
  statusText.classList.remove('hidden');
  if (buttonId === 'kicked-button') {
  	statusText.style.marginBottom = '3px';
  }
}


/**
 * Creates a coffee is kicked button and adds it to
 * the document.
 */
function setUpMadeButton() {
	var madeBtn = document.createElement('button');
	madeBtn.id = 'made-button';
	madeBtn.classList.add('action-button');
	madeBtn.innerText = 'Made coffee?';
	madeBtn.title = 'Let others know';
	body.appendChild(madeBtn);

	// Now that we have a button, set up click event on it.
	madeBtn.addEventListener('click', changeCoffeeStatus.bind(this, true,
	    madeBtn.id));
}


/**
 * Creates a coffee is kicked button and adds it to
 * the document.
 */
function setUpKickedButton() {
	var kickedBtn = document.createElement('button');
	kickedBtn.id = 'kicked-button';
	kickedBtn.classList.add('action-button');
	kickedBtn.innerText = 'Coffee gone?';
	kickedBtn.title = 'Let others know';
	body.appendChild(kickedBtn);

	// Now that we have a button, set up click event on it.
	kickedBtn.addEventListener('click', changeCoffeeStatus.bind(this, false,
		  kickedBtn.id));
}


// Get name from chrome sync storage.
chrome.storage.sync.get('made_coffee_name', function(data) {
	if (data.made_coffee_name) {
	  username.innerText = data.made_coffee_name;
	} else {
	  username.innerText = 'again';
	}
});

var overTwoHours = false;

// Update coffee status text based on what's in Firestore.
// TODO(Zach): This could probably be done better.
docRef.get().then(function(doc) {
if (doc && doc.exists) {
  var data = doc.data();
  if (data.coffeeData.isReady) {
  	var coffeeMaker;
  	if (username.innerText === data.coffeeData.madeBy) {
  		coffeeMaker = 'you';
  	} else {
  	  coffeeMaker = data.coffeeData.madeBy;
  	}
  	var coffeeLastMade = data.coffeeData.madeAt.toMillis();
  	var timeDiff = new Date() - coffeeLastMade;
  	var coffeeLifetime, time, unit;
  	if ((timeDiff / 1000) < 60) {
  		unit = ' seconds';
  		time = parseInt(timeDiff / 1000);
  		if (time === 1) {
  			unit = ' second';
  		}
  		coffeeLifetime = time + unit;
  	} else if ((timeDiff / 1000 / 60) < 60) {
  		unit = ' minutes';
  		time = parseInt(timeDiff / 1000 / 60);
  		if (time === 1) {
  			unit = ' minute';
  		}
  		coffeeLifetime = time + unit;
  	} else {
  		time = timeDiff / 1000 / 60;

  		// If the time is equal to or over 2 hours, just specify hours.
  		if (time >= 120) {
  		  coffeeLifetime = parseInt(time / 60) + ' hours';

  		  // The coffee maker only stays on for 2 hours and then
  		  // automatically shuts off. Alert people to this.
        overTwoHours = true;
  		  var hotPlateAlert = document.createElement('p');
  		  hotPlateAlert.innerText = '**The coffee warming plate shuts off after ' +
  		      'two hours. Any leftover coffee may still be hot for a few minutes ' +
  		      'after.';
  		} else {
  		  var leftOverMin = time - 60;
  		  unit = ' minutes';
  		  if (parseInt(leftOverMin) === 1) {
  		  	unit = ' minute';
  		  }
  		  coffeeLifetime = '1 hour and ' + parseInt(leftOverMin) + unit;
  		}
  	}
    coffeeStatusText.innerText = 'Go pour yourself some joe!' +
        '\n\n Looks like ' + coffeeMaker +' made coffee ' +
        coffeeLifetime +' ago.';
     setUpKickedButton();

     if (overTwoHours) {
       body.appendChild(hotPlateAlert);
     }
  } else {
    coffeeStatusText.innerText = 'It doesn\'t look like there\'s ' +
        'any coffee at the moment.';
      setUpMadeButton();
  }
}
}).catch(function(err) {
console.log('We got an error: ',err);
});