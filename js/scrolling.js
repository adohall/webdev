/**
 * Created by ahall on 19/09/2014; modified for
 */

/* set up a ### SCROLL WIDGET ### for the specified element */

/* requirements -
 # width and margin of child nodes must be uniform;
 # the width of child nodes must be set in the CSS (or in the tag, if an image);
 # if the arrows are to sit within the bounding box of the element, and the outer div starts after the left arrow and finishes before the right arrow, then the element must have a padding left and right equal to the width of the arrows;
 # but if the bounding box of the outer div is the same as the bounding box of the element, and the arrows are overlaid, the element will have no left or right padding;
 */

/* a function which turns an element into a scrolling widget  (A.N. Hall 10/02/14; modified 25/09/14; modified 23/08/16);
 - within the specified element,
 - create an outer div which will act as a clip region, hiding anything which extends beyond its boundaries (overflow:hidden)
 - create an inner div which is as wide as all its child elements combined, and fits all its child elements in a single row
 - create a left and right arrow, and on clicking these, shift the inner div right or left, relative to the outer div, to display a new set of items
 - the steps required:
 1. wrap children of the element in outer and inner divs
 2. get width of each child, including margin-right or -left, if it exists
 3. set width of inner to combined width of children
 4. insert left and right arrows in the element
 5. on clicking either arrow, calculate width of outer div
 6. slide in inner div a distance which equals (outerWidth / itemWidth) * itemwidth; note - must be a multiple of itemWidth
 7. but, keep track of left position of inner;
 8. when the difference between innerWidth and currLeft is less than outerWidth, hide the right arrow after shifting inner div
 [user is looking at last group of images]
 9. if current left is 0, hide the left arrow; [user is looking at lst group of images]
 */

function setScrollWidget(el) {
	"use strict";
	// if .ui-outer already exists in the element, do not proceed
	if (el.querySelector('.ui-outer')) {
		return;
	}
	// remove the launcher arrow (which is no longer needed; we no longer want to call setScrollWidget on clicking an arrow in the widget)
	el.removeChild(el.querySelector('.ui-arrow'));
	// get the number of child nodes and the width of each (including margin)
	var items = el.children, // note - in IE8, this includes comments
		style = getComputedStyle(items[0]),
		itemWidth = items[0].offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight),
		num = items.length,
		innerWidth = itemWidth*num,
		innerClass = el.classList.contains('ui-members') ? 'ui-members ' : '',
		outer = document.createElement('div'),
		inner = document.createElement('div'),
		leftArrow = document.createElement('div'),
		rightArrow = document.createElement('div'),
		currLeft = 0;
	// wrap children of the element in outer and inner divs
	outer.className = 'ui-outer p-r';
	inner.className = innerClass + 'ui-slide p-a';
	inner.innerHTML = el.innerHTML;
	el.innerHTML = '';
	el.appendChild(outer);
	outer.appendChild(inner);
	// apply combined width of all items to inner div
	inner.style.width = innerWidth + 'px';
	// insert left and right arrows
	leftArrow.className = 'ui-arrow left p-a';
	rightArrow.className = 'ui-arrow p-a';
	el.appendChild(leftArrow);
	el.appendChild(rightArrow);
	leftArrow.setAttribute('disabled', 'true');

	// if inner div fits entirely within outer div (i.e. all thumbnails are visible), disable the right arrow
	if (innerWidth <= outer.offsetWidth) {
		rightArrow.setAttribute('disabled', 'true');
	}

	// if the element has one or more callbacks specified in a 'data-callback' attribute, call those functions now
	if (el.hasAttribute('data-callback')) {
		var callbacks = el.getAttribute('data-callback').split(',');
		for (var i = 0; i < callbacks.length; i++) {
			// trim trailing white space from text value of each callback, then call it
			var callback = window[callbacks[i].trim()];
			callback(el);
		}
	}

	// on clicking either arrow, calculate width of outer div (note that viewport may have been resized)
	// and find the slide distance
	// this will be the whole number of items which will fit in the outer div
	// on clicking right arrow, decrease current left by the slide distance (effectively moving the inner div left)
	// on clicking left arrow, increase current left by the slide distance (effectively moving the inner div right)

	function slideInner(arrow) {
		// if the clicked arrow is not disabled, reset inner's left value to the slide distance (determined above)
		if (!arrow.getAttribute('disabled')) { // matches(arrow, '[disabled]')
			var slideDistance = Math.floor(outer.offsetWidth / itemWidth) * itemWidth;
			// if outer width is >= 600px, make the last visible item in a group the first visible item in the next group:
			// slideDistance = (Math.floor(outer.offsetWidth / itemWidth) - 1) * itemWidth;
			if (arrow === rightArrow) {
				currLeft -= slideDistance;
			} else {
				currLeft += slideDistance;
			}
			// use 'transform' property & 'translateX' to move inner; but for IE9-, use 'left' instead
			if (is_ie9d) {
				inner.style.left = currLeft + 'px';
			} else {
				inner.style.transform = 'translateX(' + currLeft + 'px)';
			}
			// if difference between inner div width and current left is less than or = outer div width, disable right arrow; otherwise enable it
			if ((innerWidth + currLeft) <= outer.offsetWidth) {
				rightArrow.setAttribute('disabled', 'true');
			} else {
				rightArrow.removeAttribute('disabled');
			}
			// if current left is greater than or equal to 0, disable the left arrow; otherwise, enable it
			if (currLeft >= 0) {
				leftArrow.setAttribute('disabled', 'true');
			} else {
				leftArrow.removeAttribute('disabled');
			}
		}
	}

	forEach(el.querySelectorAll('.ui-arrow'), function(arrow) {
		arrow.onclick = function () {
			slideInner(this);
		};
	});

	// initial slide:
	slideInner(rightArrow);
}

// run as soon as this script file is called:
function initScrollWidget() {
	"use strict";
	// if an element has been marked for immediate setting of scroll widget, set scroll widget for it:
	var initEl = document.querySelector('[data-init=setScrollWidget]');
	if (initEl) {
		setScrollWidget(initEl);
	}
}

initScrollWidget();
