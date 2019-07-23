/* monitor the number of chracters in specified input or textarea; 
		write current character count for textarea; alert if max number is exceeded for input */

function doCharcount(node) {
	// get maxlength  - will be value of either 'maxlength' or 'data-maxlength' attribute
	var maxlength = node.hasAttribute('data-maxlength') ? node.getAttribute('data-maxlength') : node.getAttribute('maxlength');
	// if the node is a textarea or .ui-textarea, and there is no sibling span[data-count]
	if (node.hasAttribute('data-maxlength') && !node.parentNode.querySelector('[data-count]')) {
		// create one and insert after textarea
		node.insertAdjacentHTML('afterend', '<span data-count="true"></span>');
	}
	// set a timeout for the change function which will be fired on keypress
	var timeout = null;
	var advise = function (e) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(function () {
			// if the element is an input, and the maxlength has been reached
			if (node.hasAttribute('maxlength') && node.value.length >= maxlength) {
				// alert user when max is reached
				alert('Your text has reached the ' + maxlength + ' character limit.');
			}
			// if the node is a textarea or ui-textarea,
			if (node.hasAttribute('data-maxlength')) {
				// get the current character count, and
				var currlength = node.value.length;
				// if it exceeds maxlength, cut the excess characters
				if (currlength > maxlength) {
					node.value = node.value.substring(0, maxlength);
					currlength = maxlength;
				}
				// update '[data-count]' - advise number of characters remaining (and the min num)
				var minlength = node.hasAttribute('data-minlength') ? node.getAttribute('data-minlength') : null;
				var mintext = '';
				if (minlength) {
					mintext = " (min " + minlength + ")";
				}
				node.parentNode.querySelector('[data-count]').textContent = (maxlength - currlength) + " characters left" + mintext;
			}
		}, 500);
	};
	// on pasting text, keydown (delete/backspace) and keypress (enter/return & text input), call advise():
	node.addEventListener('paste', advise);
	node.addEventListener('keydown', advise);
	node.addEventListener('keypress', advise);
	// call advise() when doCharcount() first runs:
	advise();
}


// as soon as this js file is loaded, run:
function initCharcount() {
	"use strict";
	// if one or more inputs or textareas have been marked by utilities.js for immediate character count and alert, do that for each:
	var initEls = document.querySelectorAll('[data-init=doCharcount]');
	if (initEls.length) {
		forEach(initEls, function(el) {
			doCharcount(el);
		});
	}
}

initCharcount();