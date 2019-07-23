/* a set of JavaScript functions (or methods) to convert select options to a scrollable list (picker)  */

// IE10+ (requires translateY) ; native JavaScript only; no jQuery (or any other framework) required;
// IE9- will retain the .ui-select.L classes (and their styling)

// replace the specified select with a list;
// add two arrows which shift that list up and down, on click; note - only three items will be visible at a time;
// write the text of each select option, to an item within that scrollable list
function setPickerFor(el) {
	"use strict";
	// identify picker (select parent), select, options collection and current selected index (a number);
	// create a list and 2 arrows and a style block
	// NB - in our struts config, is "picker" is assigned to the select (while the parent receives 'ui-select' class)?
	var picker = el.tagName.toLowerCase() === 'select' ? el.parentNode : el,
		select = picker.querySelector('select'),
		opts = select.querySelectorAll('option'),
		currNum = select.selectedIndex, // 0; select.options[select.selectedIndex]
		ul = document.createElement('ul'),
		arr1 = document.createElement('span'),
		arr2 = document.createElement('span'),
		styleEl = document.createElement('style');

	// replace .ui-select class with .JS (styles set to .picker.JS)
	picker.classList.remove('ui-select');
	picker.classList.add('JS');

	// hide select, then append new scrollable list and arrows to picker, to replace it
	select.classList.add('ui-access');
	picker.appendChild(ul);
	picker.appendChild(arr1);
	picker.appendChild(arr2);
	// insert arrow characters
	arr1.textContent = '\u003C';
	arr2.textContent = '\u003E';
	// loop through the options and write their text to a list item; append that item to the new list
	forEach(opts, function (el, i) {
		var li = document.createElement('li');
		li.textContent = el.textContent;
		ul.className = 'l-n a-c';
		ul.appendChild(li);
	});

	// mark the style block as specific to the select, then append it to the document
	// this style block will contain a rule for the currently displayed item within the scrollable list
	styleEl.id = 'for_' + select.id;
	document.body.appendChild(styleEl);

	// write a series of CSS declarations with same property and value, but incorporating browser-specific prefix:
	function declareWithPrefixes(property,value) {
		var prefixes = ['webkit','o','ms'],
			cssTxt = '';
		prefixes.forEach(function(item) {
			cssTxt += '-' + item + '-' + property + ':' + value + '; ';
		});
		return cssTxt + property + ':' + value;
	}

	// update the selected index & ensure the correct list item is displayed in the scrollable list
	function setAndShowSelected(num) {
		select.selectedIndex = num;
		picker.setAttribute('data-selected', num);
		// write a rule for the list corresponding to selectedIndex; note - this will replace the current rule in new style sheet
		var yVal = num === 0 ? '0' : '-' + (num * 1.5) + 'em';
		styleEl.textContent = '.picker.JS[data-selected="' + num + '"] > ul {' + declareWithPrefixes('transform','translateY(' + yVal + ')') + '}';
	}

	// on clicking 1st arrow, shift list down by a  multiple of 1.5em; that multiple will be currNum - 1
	arr1.addEventListener('click', function () {
		if (currNum > 0) {
			currNum = currNum - 1;
			setAndShowSelected(currNum);
		}
	});
	// on clicking 2nd arrow, shift list up by a  multiple of 1.5em; that multiple will be currNum + 1
	arr2.addEventListener('click', function () {
		if (currNum < (opts.length - 1)) {
			currNum += 1;
			setAndShowSelected(currNum);
		}
	});

	// ensure the correct list item is displayed in the scrollable list, on DOM ready
	setAndShowSelected(currNum);
}

function initPicker() {
	"use strict";
	// 'picker.js' is called on DOM ready for all .picker, not when interacting with each;
	// the transformation to picker must be immediate for all .picker
	forEach(document.querySelectorAll('.picker'), function (el) {
		setPickerFor(el);
	});
}

initPicker();