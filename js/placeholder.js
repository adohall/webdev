// placeholder polyfill for IE8 & IE9

// change type of specified password input to text, then revert on focus:
function disguisePasswordFor(el) {
	"use strict";
	el.setAttribute('type', 'text');
	// on focusing in password input, if placeholder value is showing, set value to blank and type to password
	el.onfocus = function () {
		if (this.value === this.getAttribute('placeholder')) {
			this.value = '';
			this.setAttribute('type', 'password');
		}
	};
	// on focusing outside password input, if no text has been entered, show placeholder again
	el.onblur = function () {
		if (this.value === null || this.value.trim() === '') {
			this.setAttribute('type', 'text');
			this.value = this.getAttribute('placeholder');
		}
	};
}

// within specified element, set the initial value of any input with a placeholder to the placeholder value:
function enablePlaceholderFor(el) {
	"use strict";
	// loop through all inputs with placeholder attribute
	var pInputs = el.querySelectorAll('[placeholder]');
	for (var i=0, y=pInputs.length; i<y; i++) {
		var pInput = pInputs[i];
		// if no value has been set for the input,
		if (pInput.value === null || pInput.value.trim() === '') {
			// set input value to placeholder value
			var pString = pInput.getAttribute('placeholder');
			pInput.value = pString;
			// for passwords, initially set type to text
			if (pInput.getAttribute('type') === 'password') {
				disguisePasswordFor(pInput);
			}
		}
	}
}

// call immediately, since this script is appended to header from bottom of body, i.e. - after DOM is created
enablePlaceholderFor(document);