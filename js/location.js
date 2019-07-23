/* ### LOCATION AUTO-COMPLETE ### */

// this is an adaptation with minor refactoring, of the location autocompletion functions in global.js
// note - this widget is 11kb, whereas the jQuery UI file which includes their autocomplete widget and required menu module, is 209kb;
// also note that refactoring the following code as a separate datalist polyfill and separate location-specific code is not practical,
// because the datalist tag has built-in auto-complete and would require an ajax fetch of all locations

// ### summary of function: ###
// 1. after user types in 2 characters or more in a location input field, fetch a list of locations that matches those characters
// 2. display those locations in a list under the input field
// 3. on selecting a location in that list, insert the selected location in the input field

// for the specified input, create a list of suggested locations & insert the list below the input
function doAutocompleteLocationsFor(locInput) {
	"use strict";

	// initiate some variables
	var locations = null;
	var locationsSeq = 0;
	var locationsTimeout = 0;
	var locationRequestInput = 0;
	var type = 'all';
	var separator = '; ';
	var startPoint = 0;
	var locList;
	var currLoc;

	// (re)start location look-up, to get location suggestions
	// ignore any previous location look-ups (by setting a new sequence number)
	// as soon as user has typed in 2 characters, start a new location look-up
	// but if there are fewer than 2 characters in text input, hide the suggestion list
	function startLocationLookup() {
		// if the location timeout has been set, clear it
		if (locationsTimeout !== null) {
			window.clearTimeout(locationsTimeout);
			locationsTimeout = null;
		}
		// increment the sequence number, so we will no longer process outstanding responses
		// note - this is passed as a parameter to the URL in the ajax call
		// in other words, old calls will be dropped
		locationsSeq++;
		// trim leading and trailing white space from location text input
		var text = locInput.value.trim();
		// note - we're looking for '; ' because we allow users to search in multiple areas, separated by '; '
		// look for last occurrence of '; ' in text input; gives a position number in string
		var input;
		var pos = text.lastIndexOf(separator);
		// if there is no '; ', starting point is beginning of string, and var input is whole text input
		// otherwise, starting point is just after last '; ' and var input is the text input after last '; '
		if (pos === -1) {
			startPoint = 0;
			input = text;
			type = 'all';
		} else {
			startPoint = pos + separator.length;
			input = text.substring(startPoint);
		}
		// if text is longer than 2 characters, call 'getLocationList' after brief delay
		// otherwise, clear all list items from the location drop-down and fade it out
		if (text.length >= 2) {
			locationRequestInput = input;
			locationsTimeout = window.setTimeout(getLocationList, 300);
		}
	}

	// get the relevant locations, which match the characters in location input field, via ajax as a JSON object
	function getLocationList() {
		// get the location type from the data attribute
		if (locInput.getAttribute('data-loctype') === "suburb-postcode") {
			type = 'suburb_or_postcode';
		} else if (locInput.getAttribute('data-loctype') === "suburb-nonAU") {
			type = 'suburb_or_nonAU';
		}
		var request = new XMLHttpRequest();
		var data = '?maxNum=25&seq=' + locationsSeq + '&type=' + type + '&input=' + locationRequestInput;
		request.open('GET', '/location/locationSelection.action' + data, true);
		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					// Success!
					var jsonObj = JSON.parse(this.responseText);
					showLocationList(jsonObj);
				}
			}
		};
		request.send();
		request = null;
	}

	// the ajax response has 2 properties - a sequence number and an array of locations
	// each location is itself an array with items
	// for example: 0: "suburb" 1: "105656" 2: "Brisk Bay" 3: "4805"
	// or if not a suburb - 0: "area" 1: "1051" 2: "Brisbane Inner South, QLD" 3: ""
	// so locations[0] is location type, locations[2] is location name, and locations[3] is postcode;
	function showLocationList(ajaxResponse) {
		var returnedLocations = ajaxResponse.locations;
		var returnedSeq = ajaxResponse.seq;
		// only proceed if there's at least 1 location suggested, and the sequence number is the current one
		if (returnedLocations.length > 0 && returnedSeq === locationsSeq) {
			// adopt these locations...
			locations = returnedLocations;
			// empty the list of location suggestions
			locList.innerHTML = '';
			// append the new location suggestions to the list
			// note - we don't need id; we can get same value from tabindex
			// also - hover effect can be set via CSS
			locations.forEach(function(item, i) {
				var li = document.createElement('li');
				li.textContent = item[2] + ' ' + item[3];
				li.setAttribute('tabindex', i);
				li.onclick = function () {
					// insert selected location suggestion to the text input
					insertSelected(this);
					// shift focus to the location input, so that tab key will take user to next form element
					locInput.focus();
				};
				locList.appendChild(li);
			});
			// if locations list is hidden, position it, then show it
			if (locList.classList.contains('d-n')) {
				// NB - offset is relative to parent, so parent must have 'position:relative'
				locInput.parentNode.className += ' p-r';
				locList.style.top = locInput.offsetTop + locInput.offsetHeight + 'px';
				locList.style.left = locInput.offsetLeft + 'px';
				// make locations drop-down at least as wide as corresponding input
				locList.style.minWidth = locInput.offsetWidth + 'px';
				fade(locList);
			}
		}
	}

	// insert selected location suggestion in text input
	// note - pre BE redesign, was clicked() - without parameter
	// note - we only allow 1 suburb, but we allow more than 1 area
	function insertSelected(item) {
		// get the item in the locations array, which corresponds to the tabindex value of the specified list item
		var num = item.getAttribute('tabindex');
		var location = locations[num];
		type = location[0];
		var display;
		// for suburbs, add postcode; for areas add separator - '; '
		if (type === 'suburb') {
			display = location[2] + ' ' + location[3];
			locInput.value = display;
		} else {
			display = location[2];
			locInput.value = locInput.value.substring(0, startPoint) + display + separator;
		}
		// if location input has a sibling select (distance), adjust its selected option and disabled attribute
		var distSelect = locInput.parentNode.querySelector('select');
		if (distSelect) {
			if (type === 'suburb') {
				distSelect.disabled = false;
				// note - first option (0) is blank
				if (distSelect.selectedIndex <= 0) {
					distSelect.selectedIndex = 4; // 25 Kms if nothing already selected
				}
			} else {
				distSelect.selectedIndex = 0; // blank selection
				distSelect.disabled = true;
			}
		}
		// find the location hint - a hidden input, and set its value to 'country' or 'suburb' as appropriate
		// do we want/need to do this? note - some location inputs have no location hint
		// or have a location hint without the data attribute or the #locale ancestor
		//var hiddenHint = $('#locale :hidden').length ? $('#locale :hidden').eq(0) : locInput.closest('form').find(':hidden[data-type="location-hint"]').eq(0);
		var form = closest(locInput, 'form');
		if (form) {
			var hiddenHint = form.querySelector('input[type=hidden][data-type="location-hint"]');
			if (hiddenHint) {
				hiddenHint.value = type;
			}
		}
		fade(locList);
		currLoc = null;
	}

	// turn off browser autocomplete for the location input
	locInput.setAttribute('autocomplete', 'off');

	// enable/disable the sibling select (distance)
	var distField = locInput.parentNode.querySelector('select');
	if (distField) {
		// check the value of the input; if contains 4 digits, then it could be a postcode or a suburb with a postcode, so enable the select
		var isPostcode = /[0-9]{3,4}/.test(locInput.value);
		if (!isPostcode) {
			// select the 1st option, which is blank
			distField.selectedIndex = 0; // 1st options, which is blank
		}
		// disabled is false if there is a postcode, true otherwise
		distField.disabled = !isPostcode;
	}

	// create and append a list, to house the suggested locations; hide it initially
	locInput.insertAdjacentHTML('afterend', '<ul class="locations ui-fade out d-n bg-w b-1 p-a z-5"></ul>');
	locList = locInput.nextElementSibling;

	// on key down in location list, take appropriate action, depending on key
	// 'down' arrow will focus on next list item; 'up' arrow will focus on previous list item
	// 'spacebar', 'tab' or 'enter' will insert the current location (i.e. the list item which has focus), in the text input
	// note - there is some difference between browsers re key strokes in auto-suggest dropdowns (attached to text inputs)
	//  and some difference between Windows and Mac re key strokes in select dropdowns
	locList.onkeydown = function (e) {
		if (currLoc) {
			if ((e.keyCode === 38) || (e.keyCode === 40)) { // down & up arrow keys
				if (e.keyCode === 40) { // down arrow
					currLoc = matches(currLoc, ':last-child') ? currLoc : currLoc.nextElementSibling;
				} else if (e.keyCode === 38) { // up arrow
					currLoc = matches(currLoc, ':first-child') ? currLoc : currLoc.previousElementSibling;
				}
				currLoc.focus();
				// prevent window from scrolling while using arrow keys in locations list
				e.preventDefault();
			} else if ((e.keyCode === 32) || (e.keyCode === 9) || (e.keyCode === 13)) { // spacebar, tab or enter keys
				insertSelected(currLoc);
				// shift focus to the location input, so that tab key will take user to next form element
				locInput.focus();
				// prevent form submission in IE via enter[, or shift to next form field via 'tab]
				e.preventDefault();
			}
		}
	};

	// on key down in location input field, take appropriate action, depending on key
	locInput.onkeydown = function(e) {
		if (e.keyCode === 9) { // 'tab' - hide location list
			fade(locList);
			currLoc = null;
		} else if (e.keyCode === 40) { // down arrow key - prevent widow from scrolling
			currLoc = locList.querySelector('li:first-child');
			currLoc.focus();
			e.preventDefault();
		} else {
			//clear the error list if it exists; note - it will be 1st child
			// may not be necessary; but I think this can cause positioning issues with the locations list
			var errorList = locInput.parentNode.querySelector('ul:first-child');
			if (errorList) {
				locInput.parentNode.removeChild(errorList);
			}
		}
	};

	// hide the list of location suggestions when clicking outside it
	document.body.addEventListener('click', function(e) {
		if (e.target !== locList && e.target.parentNode !== locList) {
			if (locList.className.match(/\bin\b/)) {
				fade(locList);
			}
			currLoc = null;
		}
	});

	// on ### key up ### in location input field, ### start the location look-up process ###
	locInput.onkeyup= startLocationLookup;
}

// for any input with attribute 'data-loctype', create a list of suggested locations & append below
// provided that list doesn't already exist
function initLocation() {
	"use strict";
	forEach(document.querySelectorAll('input[data-loctype]'), function(el) {
		if (el.parentNode.querySelector('.locations')) {
			return;
		}
		doAutocompleteLocationsFor(el);
	});
}

initLocation();
