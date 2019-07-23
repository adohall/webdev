/* a compact set of utility javascript functions (or methods) used by several pages */

// IE8+; native JavaScript only; no jQuery (or any other framework) required:

/*===========================================================
 0 $data - most can be deleted
 =============================================================*/
var tomcatSessionArgs = "";
var isMember = true;
var userName = "williamauld";
var userId = "6500665";
var isUserMale = true;
var userCreated = "2019-01-16";
var subLevel = "plus";
var rsvpTag = "v~1551224296006";
var territory = "AU";
var baseDomain = "local.rsvphost.com.au";
var targLocn = ";locstate=nsw;locarea=SYDNEY_EASTERN_SUBURBS;pcode=2010";
var targAttr = ";a=4;as_a=0;by=1975;gen=m;as_gen=1;s=s;smoke=n;hc=89";
var fbAppId = 188386394533753;
var fbInterestsTimeout = 10000;
var vstamps = parseInt("22");
var userVisibility = "Priority";
var userSignedInStatus = "Premium Member";
var demographicLocation = "g=M:ar=36-45:loc=AU-NSW-Surry Hills:tn=1";
var fcnDomainName = "null";
var cloudfrontBeaconHost = "d3l3h8rwmf6gby.cloudfront.net";
var awsEnvironment = "devint";
var targetUserId = "null";
//keeping this for use when we use multiple splash images again in the future
var emailHash =
	"45fceea91b9c1f23ca74fdfbe81cb644d2c646f0ccd4e801eea0bacf73359172";
dataLayer = [
	{
		userId: "6500665",
		isExternalReferrer: "true",
		username: "williamauld",
		email: "adrian.hall+williamauld@rsvp.com.au",
		emailHash: emailHash,
		serverDomain: "local.rsvphost.com.au",
		v: "v~1551224296006",
		userVisibility: userVisibility,
		userSignedInStatus: userSignedInStatus,
		demographicLocation: demographicLocation,
		territory: territory,
		fcnDomainName: fcnDomainName,
		baseDomain: baseDomain
	}
];

/*===========================================================
 1 $detection - browser, device, feature
 =============================================================*/

// browser & device
var agt = navigator.userAgent.toLowerCase(),
	is_ie = (agt.indexOf('msie')!==-1), // note - excludes IE11 and Edge
	ieNum = is_ie ? parseInt(agt.split('msie')[1]) : -1,
	iphone = agt.match(/iphone/i) || agt.match(/ipod/i),
	ipad = navigator.userAgent.match(/\biPad\b/),
	isAndroid = agt.match(/android/i),
	isWinPhone = agt.match(/windows phone/i),
	smartphone = iphone || (isAndroid && window.outerWidth < 725) || isWinPhone,
	is_ie9d = is_ie && (ieNum <= 9),
	is_ie11 = !/x64|x32/ig.test(agt) && /Trident/ig.test(agt);

// determine whether browser supports a particular CSS property, e.g. 'textOverflow'; for example of usage, see 'columnCount' below;
var getStyleProperty = (function () {
	"use strict";
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'Ms'];
	function getStyleProperty(propName, element) {
		element = element || document.documentElement;
		var style = element.style,
			prefixed;
		// test standard property first
		if (typeof style[propName] === 'string') {
			return propName;
		}
		// capitalise
		propName = propName.charAt(0).toUpperCase() + propName.slice(1);
		// test vendor specific properties
		for (var i=0, l=prefixes.length; i<l; i++) {
			prefixed = prefixes[i] + propName;
			if (typeof style[prefixed] === 'string') {
				return prefixed;
			}
		}
	}
	return getStyleProperty;
})();

// enable columns for browsers which don't support 'columnCount' (e.g. IE9-, Firefox 34-, Safari 7.0-)
if (typeof getStyleProperty('columnCount') !== 'string') {
	callScript('js/columns.js');
}

// enable full support for classList in IE11-; note IE10&11 don't support multiple arguments for classList.add and .remove
if (is_ie || is_ie11) {
	callScript('js/classList.js');
}

// enable flex box & placeholder for IE9-
if (is_ie9d) {
	callScript('js/flexbox.js');
	callScript('js/placeholder.js');
}

// enable a different font width and letter spacing for Windows only (Helvetica Neue not available):
if (navigator.appVersion.indexOf("Win") !==-1) {
	// note - classList cannot be used immediately by IE9-; classList.js has not yet been loaded:
	document.body.className += ' win';
	callCSS('windows.css');
}

// allow styling to be targeted at Safari 5 (the highest version available in Windows)
if (agt.indexOf('safari') !== -1 && agt.indexOf('version/5') !== -1) {
	callCSS('safari5.css');
}

//Pollyfill for new Event as IE10 was borking (see CustomEvent below in showMoreFor())
(function () {
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent;
})();

/*===========================================================
 2 $helper functions
 =============================================================*/

// helper functions; some emulate jQuery methods; in alphabetical order:

// ### ANIMATE ### in and out; 2 interdependent functions; ### FADE or SLIDE or DROP ###
// modern browsers use a CSS transition;
// IE9- browsers which don't support 'transition', simply toggle classes 'in' & 'out' (display: 'none'/'block');
// NB - we can test if an element has been animated out via 'out' string in class list
// animation is a type - 'fade' (opacity), 'slide' (translate) or 'drop' (height); the properties animated are in brackets
// direction is either 'in' or 'out'; slide can also be 'right', 'top' or 'bot' (the starting point); these are expressed by modifying class names
// options for the animate() function include 'delay' (default is 330), 'hidden' (default is false), 'reverse' (enter & exit in same direction) & 'carousel'
// class name examples - ui-fade in, ui-fade out, ui-drop in, ui-slide in, ui-slide right in, ui-slide top in, ui-slide top out etc;
// all transitions need to be defined in modules.css, like so: .ui-fade {transition: opacity 330ms ease-in}
// example of function call with options: animate(el, {delay:1000, hidden:true});
// for a slower animation, pass a longer delay, e.g. - {delay:1000}; note - the default is 330ms
// to hide an element (display:none) when animation is complete, pass {hidden:true}
function animate(el, options) {
	"use strict";
	// if a delay option is passed, set an appropriate attribute to the element
	if (options && options.delay) {
		el.classList.add('delay-' + options.delay);
	}
	// no delay for IE9- since it does not animate (show & hide only):
	var shortDelay = is_ie9d ? 0 : 50;
	// if direction is currently 'out', add the 'in' class and remove the 'out' class,
	if (el.classList.contains('out')) {
		// if element is to be hidden when animation is complete, ensure the element is displayed
		if (options && options.hidden) {
			el.classList.remove('d-n');
			el.classList.add('d-b');
		}
		// delay swapping the animation classes slightly; 'in' animation won't work otherwise
		setTimeout(function () {
			el.classList.remove('out');
			el.classList.add('in');
			if (options && typeof options.callBack === 'function') {
				options.callBack();
			}
		}, shortDelay);
	} else {
		// if direction out is always the same as direction in, enable that
		if (options && options.reverse) {
			el.classList.add('reverse');
		}
		el.classList.remove('in');
		el.classList.add('out');
		// if options were passed,
		if (options) {
			// if a specific delay is passed, implement that, otherwise, set timeout to the default
			var longDelay = is_ie9d ? 0 : (options.delay ? options.delay + shortDelay : 380);
			setTimeout(function () {
				// if element is to be hidden when animation is complete, hide the element
				if (options.hidden) {
					el.classList.remove('d-b');
					el.classList.add('d-n');
				}
				// if direction out is always the same as direction in, ensure that element is repositioned for animation in
				if (options.reverse) {
					el.classList.remove('reverse');
				}
				if (options && typeof options.callBack === 'function') {
					options.callBack();
				}
			}, longDelay);
		}
	}
}

// create a CSS link element, set its href and append it to the doc head before 1st script (if the specified link isn't already there)
//  NB - in the next 2 functions, rsvpTag is inserted between folder and file name, so we need to isolate filename, and look for that only
//      the new rsvpTag system was set up by Arthur to bust cache; apparently the old system of rsvpTag at end of file name didn't always work
function callCSS(href) {
	"use strict";
	var head = document.getElementsByTagName('head')[0],
		cn = href.split('/'),
		fileName = cn[cn.length-1];
	if (!head.querySelector('link[href*="' + fileName + '"]')) {
		var link = document.createElement('link');
		link.setAttribute('href', href);
		link.setAttribute('type','text/css');
		link.setAttribute('rel','stylesheet');
		head.appendChild(link);
	}
}

// create a script element, set its src and append it to the doc head (if the specified script isn't already there)
// note - any function in that script file which needs to be called on DOM ready, can simply be called at the bottom of the file
// if a function in that script needs to run on particular element when the script loads, mark the element with data-init="functionName"
function callScript(src) {
	"use strict";
	var head = document.getElementsByTagName('head')[0],
		cn = src.split('/'),
		fileName = cn[cn.length-1];
	if (!head.querySelector('script[src*="' + fileName + '"]')) {
		var script = document.createElement('script');
		script.src = src;
		head.appendChild(script);
	}
}

// call the specified function, in the specified JavaScript file, on the specified element
// if the function is NOT recognised, call the specified script,
// mark the specified element as the object (parameter) of the specified function, when the script loads;
// but if the function IS recognised, run it immediately on the specified element
function callFunction(myFunction, myScript, el) {
	"use strict";
	if (typeof window[myFunction] !== 'function') {
		callScript('js/' + myScript + '.js');
		el.setAttribute('data-init', myFunction);
	} else {
		window[myFunction](el);
	}
}

// convert the first letter of a string to upper case ; e.g. captitalise('login')
function capitalise(string) {
	"use strict";
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// look for closest ancestor which matches the specified selector; returns ancestor node or null
function closest(el, selector) {
	"use strict";
	while (el !== null) {
		var parent = el.parentElement;
		if (parent !== null && matches(parent, selector)) {
			return parent;
		}
		el = parent;
	}
	return null;
}

// detect direction of swipe in specified element, then run callback function which uses the direction value
function detectSwipeFor(el, callback) {
	"use strict";
	el.addEventListener('touchstart', handleTouchStart, false);
	el.addEventListener('touchmove', handleTouchMove, false);
	var xDown = null,
		yDown = null,
		swipeDir;
	function handleTouchStart(e) {
		xDown = e.touches[0].clientX;
		yDown = e.touches[0].clientY;
		// prevent scrolling inside element; NB - e.preventDefault() disables child links
		el.setAttribute('data-overflow', 'hidden');
	}
	function handleTouchMove(e) {
		if (!xDown || !yDown) {
			return;
		}
		var xUp = e.touches[0].clientX,
			yUp = e.touches[0].clientY,
			xDiff = xDown - xUp,
			yDiff = yDown - yUp;
		// Math.abs returns the absolute value; so Math.abs(-7.25) returns 7.25
		// in left and right swipes, finger movement must be more horizontal than vertical,
		// but in up and down swipes, vice versa:
		if (Math.abs(xDiff) > Math.abs(yDiff)) {
			if (xDiff > 0) {
				swipeDir = 'left';
			} else {
				swipeDir = 'right';
			}
		} else {
			if (yDiff > 0) {
				swipeDir = 'up';
			} else {
				swipeDir = 'down';
			}
		}
		// send registered swipe direction to the callback function
		callback(swipeDir);
		// reset values
		xDown = null;
		yDown = null;
	}
}

/*// usage; possible values for swipeDir are 'left', 'right', 'up', 'down':
 detectSwipeFor(myElement, function(swipeDir) {
	 if (swipeDir === 'left') {
			console.log('left swipe');
			// do something with myElement...
	 }
 });*/

// create an iframe with specified src, width and height, then append to specified node; note - options is an array
// used by Google Tag Manager for i.a. rainbow strip
// to consider: rewrite with a single parameter - options
function doIframe(src, width, height, node, sibling, options) {
	"use strict";
	var frame = document.createElement('iframe');
	frame.setAttribute('src',src);
	frame.setAttribute('width',width);
	frame.setAttribute('height',height);
	frame.setAttribute('frameborder','0');
	frame.setAttribute('scrolling','no');
	if (options) {
		for (var n in options) {
			if (options.hasOwnProperty(n)) {
				frame.setAttribute(n, options[n]);
			}
		}
	}
	if (node) {
		if (sibling) {
			node.insertBefore(frame, sibling);
		} else {
			node.appendChild(frame);
		}
	} else {
		document.body.appendChild(frame);
	}
}

// 1. create a tooltip (or style an existing one) to appear on mousing over the specified trigger (for touch devices - on clicking);
// 2. insert specified content (if the tip box doesn't already exist)
// 3. attach a function to trigger so that on mouse over it shows tip to right of trigger (or above if space is lacking)
// 4. for touch devices, toggle tip on clicking the trigger
function doToolTipFor(myTrigger, myHTML) {
	// if html content is passed, create a tip box for it, otherwise, find tip box
	// NB - if tip box already exists, it must have class="js-tip" & id="X"; and trigger must have matching data-for="X"
	var tip = myHTML ? document.createElement('span') : document.getElementById(myTrigger.getAttribute('data-for'));
	// if html content is passed, insert it in tip box; and hide tip initially
	if (myHTML) {
		tip.innerHTML= myHTML;
		tip.style.display = 'none';
	}
	// if the tip has no 'bg-w' class, make it a dark box with white text:
	if (!tip.classList.contains('bg-w')) {
		tip.classList.add('box','X');
	}
	// ensure tip is appended to body, to enable positioning (crucial for most 'js-tip')
	document.body.appendChild(tip);
	// if not a touch device, and tip doesn't have attribute 'data-popup'
	if (!eventSupport('touchstart') && !tip.hasAttribute('data-popup')) {
		// show tip on mouse over; and hide it on mouse out
		myTrigger.addEventListener('mouseover', function () {
			positionTip(tip, myTrigger);
		});
		myTrigger.addEventListener('mouseout', function() {
			tip.style.display = 'none';
		});
	} else {
		// but if is a touch device, or tip has attribute 'data-popup', toggle the tip on clicking the trigger
		myTrigger.addEventListener('click', function () {
			if (tip.style.display === 'block') {
				tip.style.display = 'none';
			}
			else {
				// hide any tips that may be visible, then show current tip
				forEach(document.querySelectorAll('.js-tip'), function(el) {
					el.style.display = 'none';
				});
				positionTip(tip, myTrigger);
			}
		});
		// enable click on trigger to close tip, if it is showing
		myTrigger.classList.add('js-trigger');
	}
}

// on clicking any .modal, if click target is outside the child node(s),
//		i.e. on the mask, treat click as a click on the close span
function enableModalClose(el) {
	el.addEventListener('click', function(e) {
		if (!closest(e.target, '.modal') && el.querySelector('.close')) {
			el.querySelector('.close').click();
		}
	});
}

function escapeRegExp(string) {
	"use strict";
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// determine support for specified event (e.g. touchstart)
function eventSupport(eventName) {
	"use strict";
	var el = document.createElement('div');
	eventName = 'on' + eventName;
	var isSupported = (eventName in el);
	if (!isSupported) {
		el.setAttribute(eventName, 'return;');
		isSupported = typeof el[eventName] === 'function';
	}
	el = null;
	return isSupported;
}

// ### FADE ### in or out (depending on current state)
function fade(el, callBack) {
	"use strict";
	animate(el, {hidden:true, callBack: callBack});
}

// forEach() - loop through a node list & call a function on each item; replaces Array.prototype.forEach.call()
var forEach = function (array, callback, scope) {
	"use strict";
	for (var i = 0; i < array.length; i++) {
		callback.call(scope, array[i], i); // scope is optional
	}
};
// usage - for each element with selector:
// forEach(document.querySelectorAll(selector), function (el, i) {
//	... do something with el
//});

// get width of an element less any border and/or padding
function getInnerWidth(el) {
	"use strict";
	var s = getComputedStyle(el);
	return el.offsetWidth - (parseInt(s.paddingLeft) + parseInt(s.paddingRight) + parseInt(s.borderLeftWidth) + parseInt(s.borderRightWidth));
}

// get width of an element including any margin
function getOuterWidth(el) {
	"use strict";
	var s = getComputedStyle(el);
	return el.offsetWidth + parseInt(s.marginLeft) + parseInt(s.marginRight);
}

function getURLParam(name) {
	"use strict";
	try {
		name = escapeRegExp(name);
		var results = new RegExp("[\\?&]" + name + "=([^&#]*)").exec(window.location.href);
		if (results) {
			return decodeURIComponent(results[1]);
		}
	}
	catch (e) {
		// ignored
	}
	return false;
}

// check if the specified element has the specified attribute with the specified value
function is(el, attr, val) {
	"use strict";
	return el.hasAttribute(attr) && (el.getAttribute(attr) === val);
}

// determine whether the specified element matches the specified selector; returns true or false
var matches = function(el, selector) {
	"use strict";
	return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};
// usage: matches(el, '.my-class');

// position a tip relative to a target element, then make it visible
// used by [role=tooltip] and .js-tip
function positionTip(tip, targetEl) {
	// get the top and left position of the target element (relative to viewport)
	var rect = targetEl.getBoundingClientRect();
	// note - tip must have 'display:block' to calculate dimension; but hide it:
	tip.style.display = 'block';
	tip.style.visibility = 'hidden';
	tip.classList.add('p-a');

	// position tip on y axis (above or below)
	// if top pos of target element is greater than height of tip + pointer, place tip above target element:
	//  set top pos of tip to top pos of target element, less height of tip and pointer, plus scroll height;
	// otherwise, place tip below target element:
	//  set top pos of tip to bottom pos of target element, plus height of pointer, plus scroll height,
	//  and change direction of pointer
	// first, create a pointer if it doesn't already exist;
	//  note - a span element can be manipulated by JavaScript, unlike an :after pseudo-element:
	if (!tip.querySelector('.pointer')) {
		tip.insertAdjacentHTML('beforeend', '<span class="pointer"></span>');
	}
	var pointer = tip.querySelector('.pointer');
	// reset pointer direction to default (down):
	pointer.className = pointer.className.replace(' U', '');
	if (rect.top >= (tip.offsetHeight + 16)) {
		tip.style.top = rect.top - (tip.offsetHeight + 16) + window.pageYOffset + 'px';
	} else {
		tip.style.top = rect.bottom + 16 + window.pageYOffset + 'px';
		pointer.className += ' U';
	}

	// position tip and pointer on x axis (left or right):
	// place the tip 20px left of the target element
	//  but ensure that the tip remains in the viewport
	// place the pointer at the mid-point of the target element,
	//  but if target element is very wide, leave pointer left at 50px (default),

	// 1st, set left pos for the tip (relative to the target element and viewport):
	// if the target element is far enough left that the tip won't fit in the viewport,
	//  when aligned with the target element, then align tip with right edge of viewport;
	//  so, set the left pos of the tip to window width less tip width (allowing '20' for scrollbar):
	if ((rect.left + tip.offsetWidth) > window.innerWidth) {
		tip.style.left = (window.innerWidth - 20 - tip.offsetWidth) + 'px';
	} else {
		// otherwise, if there is room to align the tip with the target element,
		// get the distance for left shift of tip - the lesser of 20px and the target element's offset left
		var tipShiftLeft = (rect.left < 20) ? rect.left : 20;
		// then set tip left to the target element left less the left shift
		tip.style.left = (rect.left - tipShiftLeft) + 'px';
	}

	// 2nd, set left pos for the pointer (relative to the target element and then the tip)
	// if target element has width greater than 150px (e.g. a heading), it may have significant empty space;
	//  so, don't set a left pos; the default of 50px, as set in style sheet, will suffice
	if (targetEl.offsetWidth > 150) {
		pointer.removeAttribute('style');
	} else {
		// otherwise, set the left pos of the pointer to the mid-point of the target element;
		// so, the pointer's left pos will be half the target element width less half the pointer width,
		//  plus the difference between tip left and target element left
		pointer.style.left = (targetEl.offsetWidth/2 - 12) + (rect.left - tip.getBoundingClientRect().left) + 'px';
	}

	// then make the tip visible
	tip.style.visibility = 'visible';
}

// prevent double click on a form button
function preventDoubleClick(button, delay) {
	// check for presence of button; required i.a. for winks & conversation
	//	if a user cannot be contacted, only an error message appears in lightbox
	if (button) {
		button.addEventListener('click', function(e) {
			if (this.hasAttribute('data-ajax')) {
				return;
			}
			if (this.hasAttribute('data-clicked')) {
				e.preventDefault();
			} else {
				// NB - setting button to disabled prevents processing of wink/conversation
				//	then profile page loads without wink registered
				//	note: following value enables us to retrieve original text on unclick()
				this.setAttribute('data-clicked', this.textContent);
				this.textContent = 'Processing';
				this.insertAdjacentHTML('afterbegin', '<span class="ui-loading"><span></span><span></span><span></span><span></span></span>');
				if (delay) {
					// re-enable the button after specified delay
					unclick(button, delay);
				}
			}
		});
	}
}

// on clicking a link with attribute 'data-target', show the element with id corresponding to href
//      note - show/hide is animated; the type of animation is determined by the module class hard coded in the element
//      options relate to animate() (see above) - {hidden:true, delay:'1000'} etc; can be omitted
function showTarget(el, options) {
	"use strict";
	// get id of corresponding element by removing '#' from href of link
	var targetEl = document.getElementById(el.getAttribute('href').slice(1));
	// if the link is not the current link, mark it as current;
	if (!el.getAttribute('data-current')) {
		// if there is an existing a[data-target][data-current] in the same [data-cards] group as the clicked link, or failing that - in the document,
		// hide its corresponding element & remove 'data-current' attribute
		var ancestor = closest(el, '[data-cards]') || document;
		var currEl = ancestor.querySelector('a[data-target][data-current]');
		if (currEl) {
			var currTargetEl = document.getElementById(currEl.getAttribute('href').slice(1));
			animate(currTargetEl, options);
			currEl.removeAttribute('data-current');
		}
		// mark the clicked link as current
		el.setAttribute('data-current', 'true');
	} else {
		// otherwise, remove the current marker
		el.removeAttribute('data-current');
	}
	// show or hide the target element (depending on current visibility)
	animate(targetEl, options);
}

// re-enable a button after it has been clicked (and disabled)
//	to be used when a submit can't proceed because of missing input i.a.
function unclick(button, delay) {
	// wait for the specified time (delay),
	//	then remove spinner, 'waiting' text, and 'data-clicked' attribute
	setTimeout(function () {
		if (button.querySelector('.ui-loading') && button.hasAttribute('data-clicked')) {
			var spinner = button.querySelector('.ui-loading'),
				btnText = button.getAttribute('data-clicked');
			// NB: button is parent to spinner, but cButton.removeChild(spinner) causes error
			spinner.parentNode.removeChild(spinner);
			button.textContent = btnText;
			button.removeAttribute('data-clicked');
		}
	}, delay);
}

/*===========================================================
 3 $DOMContentLoaded (when DOM is loaded or ready)
 =============================================================*/

// ### SCROLLING ### (horizontal scrolling for thumbnail galleries, a block at a time)
// insert arrow; on click, call scrolling.js
function setScrollingFor(el) {
	"use strict";
	el.classList.add('JS','p-r');
	// mark list gallery in touch devices (to prevent hover)
	// NB - this code has to appear here rather than in scrolling.js,
	//		otherwise the summaries are hidden until the arrow is clicked for the first time
	if (eventSupport('touchstart') && (matches(el, 'ol') || matches(el, 'ul'))) {
		el.setAttribute('data-touch', 'true');
		// for each image, on click - hide the currently displayed summary and show the sibling summary
		forEach(el.querySelectorAll('img'), function(img) {
			img.addEventListener('click', function(e) {
				el.querySelector('[data-hidden]').style.display = 'none';
				el.querySelector('[data-hidden]').removeAttribute('data-hidden');
				this.nextElementSibling.style.display = 'flex';
				this.nextElementSibling.setAttribute('data-hidden', 'true');
			});
		});
	}
	// insert a right arrow which on click, calls the scrolling function,
	// but only proceed if combined width of child elements, less margin-right of first element, is less than available width
	var childrenWidth = (getOuterWidth(el.firstElementChild) * el.children.length) - parseInt(getComputedStyle(el.firstElementChild).marginRight);
	if (childrenWidth > getInnerWidth(el)) {
		var launcher = document.createElement('div');
		launcher.className = 'ui-arrow p-a';
		el.appendChild(launcher);
		launcher.onclick = function (e) {
			callFunction('setScrollWidget','scrolling',el);
		};
	}
}

// ### SHOW-MORE ### (shifted from show-more.js to prevent lag on main menu)
// on clicking any element with attribute 'data-focus', set value to either true or false
//	and set sibling's [aria-expanded] attribute to false:
// note that some touch devices may have a mouse attached, so 'touchstart' is problematic
function showMoreFor(el, context) {
	"use strict";
	el.setAttribute('data-hover', 'false');

	var dd = el.parentNode.querySelector('[aria-expanded]');

	var checkClose = function(e) {
		if (e.target !== e.currentTarget) {
			if (dd) {
				dd.dispatchEvent(CustomEvent('dropdown-hide'));
			}
			document.removeEventListener('click', checkClose, false);
		}
		e.stopPropagation();
	};

	el.addEventListener('click', function(e) {
		if (el.getAttribute('data-focus') === 'false') {
			var container = context || document,
				focusEl = container.querySelector('[data-focus=true]');
			if (focusEl) {
				focusEl.setAttribute('data-focus', 'false');
				if (focusEl.parentNode.querySelector('[aria-expanded]')) {
					focusEl.parentNode.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
				}
			}
			el.setAttribute('data-focus', 'true');
			if (el.parentNode.querySelector('[aria-expanded]')) {
				el.parentNode.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'true');
			}
			document.addEventListener('click', checkClose, false);
			if (dd) {
				dd.dispatchEvent(CustomEvent('dropdown-reveal'));
			}
		} else {
			el.setAttribute('data-focus', 'false');
			if (el.parentNode.querySelector('[aria-expanded]')) {
				el.parentNode.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
			}
			checkClose(e);
		}
		e.stopPropagation();
	});
}

// enable ### ACCORDION ### widget; called for all .accordion on DOM ready (below)
// within each child, clicking the first child toggles the class 'down', which will show the siblings
// NB a child without child nodes will be ignored (e.g. a heading child of .accordion)
function doAccordionFor(el) {
	"use strict";
	el.setAttribute('data-hover', 'false');
	forEach(el.children, function(child) {
		if (child.children.length) {
			var toggle = child.querySelector(':first-child');
			toggle.classList.add('ui-arrow');
			toggle.addEventListener('click', function (e) {
				this.classList.toggle('down');
			});
		}
	});
}

// Parse an ISO date string into Date object. Time format may be:
// 2016-09-02T13:46:51.123+1000 as in countDownTimer.js and editEmailFragment.js
// Other possible formats may include the UTC 'Z' in the time such as 2016-09-02T13:46:51.123Z
function iso8601(date) {
	var a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d*))?(Z|[+-]\d+)?$/.exec(date);
	if (a) {
		if (a[8] && a[8] !== 'Z') {
			// received date is in another timezone, but we're parsing it as UTC
			a[4] -= Math.floor(+a[8] / 100);
			a[5] -= +a[8] % 100;
		}
		return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6], a[7] | 0));
	}
}

// place all code to be called or executed when DOM is loaded, inside this function:
function initRSVP() {
	"use strict";
	// ### LIGHTBOX ### (see lightbox.js)
	// on clicking any link with attribute 'data-lightbox', load the hyperlinked page to a lightbox:
	forEach(document.querySelectorAll('[data-lightbox]'), function(el) {
		el.onclick = function (e) {
			callFunction('fetchToLightbox','lightbox',el);
			e.preventDefault();
		};
	});

	// if #login-submit exists, enable login validation via ajax for the login form:
	if (document.getElementById('login-submit')) {
		callFunction('setLoginValidation','login',document.getElementById('login-submit'));
	}

	// see showMoreFor() above
	forEach(document.querySelectorAll('[data-focus]'), function(el) {
		showMoreFor(el);
	});

	// enable simple Accordion for all .accordion; see doAccordionFor() above
	forEach(document.querySelectorAll('.accordion'), function(el) {
		doAccordionFor(el);
	});

	// on clicking outside [data-focus] and [aria-expanded], close all [aria-expanded], except siblings of [data-exclusive]
	document.body.addEventListener('click', function (e) {
		var t = e.target,
			focusEls = document.querySelectorAll('[data-focus=true]:not([data-exclusive])');
		// if not a data-focus or an aria-expanded, and not inside data-focus or aria-expanded, set all data-focus to false
		if (focusEls[0] && !t.hasAttribute('data-focus') && !t.hasAttribute('aria-expanded') && !closest(t, '[data-focus]') && !closest(t, '[aria-expanded]')) {
			forEach(focusEls, function (el) {
				el.setAttribute('data-focus', 'false');
				el.parentNode.querySelector('[aria-expanded]').setAttribute('aria-expanded', 'false');
			});
		}
		// similarly, if not a js-tip or a js-trigger, and not inside a js-tip or a js-trigger, hide all js-tip:
		if (!t.classList.contains('js-tip') && !t.classList.contains('js-trigger') && !closest(t, '.js-tip') && !closest(t, '.js-trigger')) {
			forEach(document.querySelectorAll('.js-tip'), function (el) {
				el.style.display = 'none';
			});
		}
	});

	// write the current value of a range input, to an output element
	forEach(document.querySelectorAll('[type=range]'), function(el) {
		var output = el.parentNode.querySelector('output');
		if (output) {
			var rangeEvent = is_ie11 ? 'change' : 'input';
			el.addEventListener(rangeEvent, function (e) {
				output.innerHTML = el.value;
			});
		}
	});

	// enable horizontal scrolling for thumbnail galleries, a block at a time:
	forEach(document.querySelectorAll('.scroll'), function(el) {
		setScrollingFor(el);
	});

	// 1. insert a question mark icon in front of each .js-tip
	// 2. call the doToolTipFor() function on that qMark icon
	forEach(document.querySelectorAll('.js-tip'), function(el, i) {
		el.setAttribute('id', 'tip-' + i);
		el.insertAdjacentHTML('beforebegin', '<span class="Q" data-for="tip-' + i + '"></span>');
		// NB - lack of 2nd parameter indicates that the tip exists and is the element which precedes the trigger
		doToolTipFor(el.previousElementSibling);
	});

	// show/hide log-in form (modal)
	//		bypass anchor links, to prevent unexpected results with back button
	var isMember = true;
	if (!isMember && !document.getElementById('root_index')) {
		// on clicking a registration or close link, ensure the log-in form is hidden
		forEach(document.querySelectorAll('a[href*="registration"], #login-form a[href*="viewport-top"]'), function (el) {
			el.addEventListener('click', function (e) {
				document.getElementById('login-form').removeAttribute('data-visible');
				e.preventDefault();
			});
		});
		// on clicking the log-in anchor links (more than 1 in profile page), show the log-in form
		forEach(document.querySelectorAll('a[href*="login-form"]'), function (el) {
			el.addEventListener('click', function (e) {
				document.getElementById('login-form').setAttribute('data-visible', 'true');
				e.preventDefault();
			});
		});
	}

	// enable click on a .modal mask, to close the .modal
	forEach(document.querySelectorAll('.modal'), function (el) {
		enableModalClose(el);
	});

	// for each select parent with class 'dropdown', hide the select and insert a drop-down list:
	forEach(document.querySelectorAll('.dropdown'), function(el) {
		callFunction('doDropdown','dropdown',el);
	});

	// for each container with role 'tablist', create and insert a tab panel which shows only one tab at a time:
	forEach(document.querySelectorAll('[role=tablist]'), function(el) {
		callFunction('doTabs','tabs',el);
	});

	// for each input with attribute 'data-alert' or textarea with attribute 'data-maxlength', monitor characters entered and alert if maximum exceeded:
	forEach(document.querySelectorAll('[data-alert], [data-maxlength]'), function(el) {
		callFunction('doCharcount','charcount',el);
	});

	// enable Facebook log-in
	if (document.getElementById('login-form')) {
		handleFacebook();
	}
}

if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', initRSVP);
}
