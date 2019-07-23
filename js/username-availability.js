// ### USERNAME AVAILABILITY ###

// on blur from input[data-check=availability], check availability of username entered (if it differs from previously entered name)
// request 'checkusernameAvailability.jsp' via ajax, sending various parameters such as location, DOB and username entered
// if the username entered is not available, the returned content will be a warning and a list of suggested names
// if the username entered  is available, display a success message
// on clicking a suggested name, assign the list item's text to the value of the name input and remove the warning & list
// called form 2 locations currently - /registration/signUpFieldsets.jspf and /user/updateMyDetails.jsp

// form serialisation is required below
callScript('js/serialize.js');

// initialise a global variable for the check availability function
var rsvp = {
	currUsername : ''
};

function checkAvailabilityFor(nameInput) {
	"use strict";
	// identify the ancestor form of the name input (the input that fired the blur event)
	var form = closest(nameInput, 'form');
	// NB - we ony want to send the ajax call if the user has changed his/her username
	// if a name has been entered, and it differs from the previously entered name,
	if ((nameInput.value !== '') && (nameInput.value !== rsvp.currUsername)) {
		// if a container for the username availabilty content doesn't already exist, create one and append
		var ajaxDiv = nameInput.parentNode.querySelector('[data-ajax]');
		if (!ajaxDiv) {
			ajaxDiv = document.createElement('div');
			ajaxDiv.setAttribute('data-ajax', 'true');
			ajaxDiv.className = 'box D a-l ui-fade out d-n';
			nameInput.parentNode.appendChild(ajaxDiv);
		}
		// request 'checkusernameAvailability.jsp' via ajax, sending all values from current form as parameters
		var request = new XMLHttpRequest();
		request.open('GET', '/common/checkUsernameAvailability.jsp' + tomcatSessionArgs + '?' + serialize(form), true);
		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					// Success!
					// if the entered name is available, the response text will be empty; so hide the ajax div (or leave it hidden),
					// otherwise, the response text will be a warning and list of suggested names;
					// in which case - write the response text and show the ajax div
					if (this.responseText.trim().length === 0) {
						if (ajaxDiv.className.match(/\bin\b/)) {
							fade(ajaxDiv);
						}
					} else {
						ajaxDiv.innerHTML = this.responseText;
						if (ajaxDiv.className.match(/\bout\b/)) {
							fade(ajaxDiv);
						}
						// on clicking a suggested name, assign the list item's text to the value of the name input,
						// reset value of the currently entered username, and fade out the ajax div (i.e. warning notice plus list)
						forEach(ajaxDiv.querySelectorAll('li > a'), function (el) {
							el.onclick = function (e) {
								e.preventDefault();
								nameInput.value = this.textContent;
								rsvp.currUsername = nameInput.value;
								fade(ajaxDiv);
							};
						});
					}
				} else {
					// Error :(
					ajaxDiv.innerHTML = 'The server isn\'t responding. We\'ll check the availability of that name a little later, when you submit this form.';
					// ensure ajax div is showing
					if (ajaxDiv.className.match(/\bout\b/)) {
						fade(ajaxDiv);
					}
					// then fade it out again after 3 seconds
					setTimeout(function () {
						if (ajaxDiv.className.match(/\bin\b/)) {
							fade(ajaxDiv);
						}
					}, 3000);
				}
			}
		};
		request.send();
		request = null;
	}
}

function initAvailability() {
	"use strict";
	// if an input has been marked for checking of availability of username entered, as soon as this script is loaded, enable that:
	// NB in this case, 'serialize.js' must be called on blur, in the originating js file
	var initEl = document.querySelector('[data-init=checkAvailabilityFor]');
	if (initEl) {
		checkAvailabilityFor(initEl);
	}
	// 'username-availability.js' may have been called without reference to a particular input field;
	//      so, for any element with attribute 'data-check=availability', check availability on blur:
	forEach(document.querySelectorAll('[data-check=availability]'), function (el) {
		el.onblur = function () {
			checkAvailabilityFor(this);
		};
	});
}

initAvailability();
