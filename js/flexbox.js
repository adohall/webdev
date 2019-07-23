// flexbox polyfill for IE8 & IE9

// this will create a horizontal column layout for any combination of flexible and fixed-width boxes
// the polyfill calculates the appropriate width for flexible boxes and also matches the height of the children of a .flex container
// NB - the only classes which must be hard-coded are: 'flex' for the wrapper and 'flex-x' (e.g. flex-1, flex-2) for the children

// remove hidden nodes (and text nodes) from a node collection; return an array
function trimArray(nodeList) {
	var newArray = [];
	for (var l = nodeList.length; l--;) {
		var child = nodeList[l];
		// for IE8, if child is a text node, skip iteration
		if ((is_ie && (ieNum <= 8)) && (child.nodeType === 8)) {
			continue;
		}
		// otherwise, if child is not .ui-access (hidden)
		if (child.className.indexOf('ui-access') === -1) {
			// add it to new array (at the beginning)
			newArray.unshift(child);
		}
	}
	return newArray;
}

// do flex layout for the specified element
function doFlexLayoutFor(flexbox) {
	"use strict";
	var totalWidth = getInnerWidth(flexbox);
	// if flexbox is hidden, its width is 0; don't proceed in that case; child widths and heights would be set to 0;
	// note - the non-flex layout will still be reasonable, since in IE9 all children of .flex are floated;
	// note 2 - if required, call doFlexLayoutFor on the flex node, when it is displayed, after a brief Timeout
	if (totalWidth > 0) {

		var fixedWidth = 0, // combined width of fixed-width children
			denominator = 0, // combined flex values of flexible-width children
			flexChildren = [], // array of flexible-width children
			flexValues = [], // and their corresponding flex values
			cols = trimArray(flexbox.children), // array of all children (columns) excluding hidden elements
			z = cols.length;

		// now loop through each of the unhidden child nodes (columns) and:
		// 1. aggregate the width of each fixed-width child to get their combined width;
		// 2. aggregate the flex values of all flex children to get the denominator;
		for (var j = 0; j < z; j++) {
			var col = cols[j];
			// if the column has no 'flex-' class name, it is fixed-width,
			if (col.className.indexOf('flex-') === -1) {
				// so add its width to the current aggregate width of fixed-width children
				fixedWidth += col.offsetWidth;
			} else {
				// otherwise, get the flex value - the character which follows 'flex-' (a number)
				var num = parseInt(col.className.split('flex-')[1].substring(0,1));
				// add its flex value to the current aggregate denominator
				denominator += num;
				// push the column to the array of flexible children and its flex value to the array of flex values
				flexChildren.push(col);
				flexValues.push(num);
			}
		}

		// get the remaining width - i.e. the container's available width after fixed widths are subtracted
		var remainingWidth = totalWidth - fixedWidth;

		// now loop through the flexible-width children, to set the width of each
		for (var k = 0, x = flexChildren.length; k < x; k++) {
			var flexChild = flexChildren[k];
			// for each, get the corresponding flex value
			var numerator = flexValues[k];
			// multiply the remaining width by the numerator, and divide by the denominator,
			// then set the result as the width of the child;
			flexChild.style.width = ((remainingWidth * numerator) / denominator) + 'px';
		}

		// now loop through each of the unhidden child nodes (columns) again, to get height of tallest column
		// NB - match column height to siblings' rather than parent's height, to avoid issues with margins
		var maxHeight = 0;
		for (var m = 0; m < z; m++) {
			// remove any height previously set for the column by JavaScript
			cols[m].style.height = 'auto';
			// get the actual height of the column
			var colHeight = cols[m].offsetHeight;
			// if the column's height exceeds maxHeight, reset value of maxHeight
			if (colHeight > maxHeight) {
				maxHeight = colHeight;
			}
		}

		// now loop through each of the unhidden child nodes (columns) again,
		// to set the height of each column to the height of the tallest column
		// this will ensure that background colours cover the entire column area
		for (var n = 0; n < z; n++) {
			cols[n].style.height = maxHeight + 'px';
		}
	}
}

// do flex layout for all elements with .flex class
function enableFlexbox() {
	"use strict";
	// loop through all column wrappers (flex boxes)
	var flexboxes = document.querySelectorAll('.flex');
	for (var i = 0, y = flexboxes.length; i < y; i++) {
		// ignore flexbox if the arrangement is a vertical column rather than a horizontal row,
		// or if its elements are to wrap
		if ((flexboxes[i].className.indexOf('fd-c') !== -1) || (flexboxes[i].className.indexOf('fw-w') !== -1)) {
			// skip this iteration and continue with the next iteration in the loop:
			continue;
		}
		doFlexLayoutFor(flexboxes[i]);
	}
}

// call function enableFlexbox() on resize
if (document.addEventListener) {
	window.addEventListener('resize', enableFlexbox, false);
} else { // IE8
	window.attachEvent('onresize', enableFlexbox);
}

// call immediately, since this script is appended to header from bottom of body, i.e. - after DOM is created
enableFlexbox();
