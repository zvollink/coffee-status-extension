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

// Chrome notification options.
var fullMessage = {
  type: "basic",
  title: "Coffee has been made",
  message: "Get it while it's hot!",
  iconUrl: "images/coffee-icon128.png"
};

var emptyMessage = {
  type: "basic",
  title: "The pot has been kicked",
  message: "EoM",
  iconUrl: "images/coffee-icon128.png"
};

function creationCallback(notificationId){};

// This can be whatever you want it to be. For example, I decided to
// just call it 'bitsbox-coffee-alert', because that's what it does.
var notificationId = 'bitsbox-coffee-alert';
var justInstalled = true;


/**
 * Listens for a change in the document housing the coffeeData object.
 * If the object gets updated, send out a chrome notification letting
 * everyone know the new status of the coffee.
 */
function realTimeCoffeeStatus() {
  docRef.onSnapshot(function(doc) {
    if (doc && doc.exists && !justInstalled) {
      var data = doc.data();
      var options;
      if (data.coffeeData.isReady) {
        options = fullMessage;
      } else {
        options = emptyMessage;
      }
      chrome.notifications.create(notificationId, options,
                                    creationCallback);
    }
    justInstalled = false;
  }, function(error) {
    console.error('onSnapshot error: ', error);
  });
};

realTimeCoffeeStatus();

// If the user reloads or reinstalls the chrome extension,
// their name will reset so they can choose another one.
// TODO(Zach): Give them the option to change it within
// the extension itself.
chrome.storage.sync.set({made_coffee_name: false});

// Check if the user has given us a name so we know which
// popup to show them.
chrome.storage.sync.get('made_coffee_name', function(data) {
  if (data.made_coffee_name) {
    chrome.browserAction.setPopup({popup: 'main.html'});
  } else {
    chrome.browserAction.setPopup({popup: 'get-name.html'});
  }
});