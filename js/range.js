/* a set of JavaScript functions (or methods) to convert a text input to a range input  */

// IE8+; native JavaScript only; no jQuery (or any other framework) required:

// convert cm to feet and inches
function imperial(cm) {
	"use strict";
	var rawFeet = cm * 0.032808399;
	var feet = Math.floor(rawFeet);
	var inches = Math.round((rawFeet - feet) * 12);
	// if inches are rounded up to 12, convert that to 1 foot
	if (inches === 12) {
		feet ++;
		inches = 0;
	}
	var inchTxt = (inches === 0) ? '' : inches + '"';
	return feet + '\'' + inchTxt;
}

// do initial set-up for a pair of range inputs
function initAdjustRangesFor(input) {
	"use strict";
	var gp = input.parentNode.parentNode,
		range1 = gp.querySelectorAll('input')[0],
		range2 = gp.querySelectorAll('input')[1];
	// write style block and output element for both range 1 and range 2 (if they haven't already been written)
	if (!range1.parentNode.querySelector('output')) {
		writeOutputFor(range1);
	}
	if (!range2.parentNode.querySelector('output')) {
		writeOutputFor(range2);
	}
	// range 1 will have a fixed width, courtesy of adjustRangesFor()
	range1.parentNode.classList.remove('flex-1');
	// now do initial adjustment of ranges for both range 1 and range 2
	adjustRangesFor(range1);
	adjustRangesFor(range2);
	// update these settings whenever the thumb is moved; note - IE11 is out of step with other modern browsers
	// note also that 'msie' doesn't appear in user agent of IE11+
	var rangeEvent = is_ie11 ? 'change' : 'input';
	input.addEventListener(rangeEvent, function () {
		adjustRangesFor(this);
	});
}

// adjust settings (range widths) for a pair of range inputs
function adjustRangesFor(input) {
	"use strict";
	// ensure that:
	//      1. the value of the 1st range input is always at least 5 less than the value of the 2nd range input
	//      2. the value of the 2nd range input is always at least 5 more than the value of the 1st range input
	//      3. the max value of the 1st range input is always 1 less than the min value of the 2nd range input
	//      4. the min value of the 2nd range input is always 1 more than the max value of the 1st range input
	//      5. the width of each range input is proportional to its percentage of the total range
	var gp = input.parentNode.parentNode,
		range1 = gp.querySelectorAll('input')[0],
		range2 = gp.querySelectorAll('input')[1],
		gpWidth = gp.offsetWidth;
	if (input === range1) {
		// difference between 1st & 2nd range inputs, must be at least 5
		// so, reset 2nd range value to 1st range value + 5, if 1st range value is greater than that
		// but ensure that range 2 value will not exceed range 2 max
		if (parseInt(input.value) > (parseInt(range2.value) - 5)) {
			if (parseInt(input.value) < (parseInt(range2.max) - 5)) {
				range2.value = (parseInt(input.value) + 5);
			} else {
				input.value = (parseInt(range2.value) - 5);
			}
		}
		// increase range 1 max: if range 1 max is less than or equal to range 1 value, reset it and 2nd range min
		if (parseInt(input.max) <= parseInt(input.value)) {
			input.max = (parseInt(input.value) + 1);
			range2.min = (parseInt(input.max) + 1);
		}
		// increase range 2 val: if range 2 value is less than or equal to range 2 min, reset it
		if (parseInt(range2.value) <= parseInt(range2.min)) {
			range2.value = (parseInt(range2.min) + 1);
		}
	} else {
		// difference between 1st & 2nd range inputs, must be at least 5
		// so, reset 1st range value to 2nd range value - 5, if 1st range value is less than that
		// but ensure that range 1 value will not drop below range 1 min
		if (parseInt(input.value) < (parseInt(range1.value) + 5)) {
			if (parseInt(input.value) > (parseInt(range1.min) + 5)) {
				range1.value = (parseInt(input.value) - 5);
			} else {
				input.value = (parseInt(range1.value) + 5);
			}
		}
		// if range 2 min is greater than or equal to range 2 value, reset it and 1st range max
		if (parseInt(input.min) >= parseInt(input.value)) {
			input.min = (parseInt(input.value) - 1);
			range1.max = (parseInt(input.min) - 1);
		}
		// if range 1 value is greater than or equal to range 1 max, reset it
		if (parseInt(range1.value) >= parseInt(range1.max)) {
			range1.value = (parseInt(range1.max) - 1);
		}
	}
	// set the width of range 1 to the appropriate portion of the total range; range 2 will fill the remainder (via flex)
	range1.parentNode.style.width = (((parseInt(range1.max) - parseInt(range1.min))/(parseInt(range2.max) - parseInt(range1.min))) * gpWidth) + 'px';
	// Firefox can't handle range widths less than 33px (width of thumb) very well; thumb becomes immovable:
	if (agt.indexOf('firefox') && (parseInt(range1.parentNode.style.width) < 33)) {
		range1.parentNode.style.width = '33px';
	}
	// now update the content of the outputs for range 1 and range 2
	updateOutputFor(range1);
	updateOutputFor(range2);
}

// write the current value of a range input, to an output element
//   with special treatment for the range input which deals with height
function updateOutputFor(input) {
	"use strict";
	var output = input.parentNode.querySelector('output'),
		// identify the style element corresponding to the input (written by JavaScript):
		styleEl = document.querySelector('#for_' + input.id),
		val = input.value,
		txt = '',
		unit = '%',
		min = input.min || 0, max = input.max || 100,
		// determine the percentage corresponding to the input's value:
		fraction = (val - min)/(max - min),
		percent = fraction * 100;

	// determine appropriate units, then write input value to output element;
	if (input.id.indexOf('height') !== -1) {
		unit = 'cm';
		// note different treatment for min and max values (currently 151 & 191)
		if (val === min) {
			txt = '<span>&lt;</span>';
			val = parseInt(val) + 1;
		} else if (val === max) {
			txt = '<span>&gt;</span>';
			val = val - 1;
		}
		// convert cm to feet and inches, and
		// separate feet & inches via 'small' tag, for styling purposes
		output.innerHTML = txt + val + '<span>' + unit + '</span>' + ' <small>' + imperial(val) + '</small>';
	} else {
		if (input.id.indexOf('age') !== -1) {
			unit = 'yrs';
		}
		output.innerHTML = val + '<span>' + unit + '</span>';
	}
	// position the output, relative to the thumb of the range input:
	// get the width of the track to the left of the thumb less half of the width of the output box;
	// this will be the left pos of the output, centred above the thumb;
	// but ensure that the output doesn't sit left or right of the track (may be off screen)
	var outputLeft = (input.offsetWidth * fraction) - (output.offsetWidth/2),
		maxLeft = input.offsetWidth - output.offsetWidth;
	if (outputLeft > 0) {
		output.style.left = outputLeft < maxLeft ? outputLeft + 'px' : maxLeft + 'px';
	} else {
		output.style.left = 0;
	}

	// the track of the range input:
	// for Chrome & Safari - an :after pseudo element with green background will cover the track on the left of the thumb;
	//      note - will be ignored by Firefox and IE10+, which have pseudo-elements -moz-range-progress pseudo-element and -ms-fill-lower respectively;
	// these lines update the percentage of the breakpoint between colours in the track's gradient background, by rewriting the content of the style element
	// percentage will correspond to the position of the thumb and the value in the output (see above)
	// note that the colours are reversed for the first in a pair of range inputs
	var parent = input.parentNode,
		is_1stOfPair = parent.parentNode.hasAttribute('data-pair') && parent.nextElementSibling,
		colour1 = is_1stOfPair ? '#e4e4e4 ' : '#40c5a4 ',
		colour2 = is_1stOfPair ? '#40c5a4 ' : '#e4e4e4 ';
	styleEl.textContent = '.ui-range > #' + input.id + '::-webkit-slider-runnable-track {background:-webkit-linear-gradient(left, ' + colour1 + percent + '%, ' + colour2 + percent + '%, ' + colour2 + '100%)}';
}

// write style block and output element
function writeOutputFor(input) {
	"use strict";
	// write a style element specific to the range input (to style the :after pseudo element of the track)
	var styleEl = document.createElement('style');
	styleEl.id = 'for_' + input.id;
	document.body.appendChild(styleEl);
	// reset type (note - initially set to "text" because a range input is almost useless without dynamically updated output)
	input.setAttribute('type', 'range');
	// insert output
	input.insertAdjacentHTML('afterend', '<output for="' + input.id + '" class="point">' + input.value + '</output>');
}

// for a single range input:
function setRangeFor(input) {
	"use strict";
	// insert output element and style block,
	// then set the initial text of the output and the width of the track's :after pseudo-element
	writeOutputFor(input);
	updateOutputFor(input);
	// update these settings whenever the thumb is moved; note - IE11 is out of step with other modern browsers
	// note also that 'msie' doesn't appear in user agent of IE11+
	var rangeEvent = is_ie11 ? 'change' : 'input';
	input.addEventListener(rangeEvent, function () {
		updateOutputFor(this);
	});
}

function initRange() {
	"use strict";
	// 'range.js' is called on DOM ready for all [data-type=range], not when interacting with each;
	// the transformation to range input must be immediate for all [data-type=range]
	forEach(document.querySelectorAll('[data-type=range]'), function (el) {
		// the code is more complex (2 additional functions) for twin range inputs :
		if (el.parentNode.parentNode.getAttribute('data-pair')) {
			initAdjustRangesFor(el);
		} else {
			setRangeFor(el);
		}
	});
}

initRange();
