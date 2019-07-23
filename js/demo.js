/* javascript used by 'demo' pages only */

// enable location auto-complete:
callScript('js/location.js');

// enable toggling of animations (fade and slide)
function toggleAnimation(trigger, el, options) {
	// determine the link/button text when animation is complete
	var directionTxt = el.className.match(/\bout\b/) ? 'out' : 'in';
	// do the animation
	animate(el, options);
	// change the text and background of the button, after an appropriate delay
	var delay = (options && options.delay) ? options.delay + 50 : 380;
	setTimeout(function () {
		if (directionTxt === 'out') {
			trigger.textContent = trigger.textContent.replace(' in', ' out');
			trigger.classList.remove('G');
			trigger.classList.add('O');
		} else {
			trigger.textContent = trigger.textContent.replace(' out', ' in');
			trigger.classList.remove('O');
			trigger.classList.add('G');
		}
	}, delay);
}

// enable ### 'READ MORE' toggles ### for truncated text within a specified section/container
// any element with a data-linelimit attribute, is truncated at the height set in the attribute's value, via CSS
// for any element in which the content overflows (although hidden), insert a 'Read more' toggle
// on clicking toggle, insert 'data-expanded' attr and change text of toggle to 'Read less' - this will expand the text;
// on clicking toggle when text is expanded, remove the 'data-expanded' attr and change the toggle's text to 'Read more';
// in last [data-linelimit] - insert 'data-expanded' attr and set text of toggle to 'Read less', initially;
// TODO - simplify insertReadMore() to use aria-expanded="false" widget
function insertReadMore(myElement, myCallBack) {
	forEach(myElement.querySelectorAll('[data-linelimit]'), function (el, i) {
		// if there is more than 1 child element, wrap the children in a single div
		if (el.children.length > 1) {
			var div = document.createElement('div');
			forEach(el.children, function (elChild, j) {
				div.appendChild(elChild);
			});
			el.appendChild(div);
		}
		var inner = el.children[0];
		// remove data-expanded attribute and toggle, if they exist; need to start afresh after resizing
		el.removeAttribute('data-expanded');
		if (el.nextElementSibling.classList.contains('toggle')) {
			el.parentNode.removeChild(el.nextElementSibling);
		}
		// if the outer height of the text wrapper is greater than the outer height of the expandable element,
		var needsExpander = inner.offsetHeight > el.offsetHeight;

		// mark the expandable element as collapsed
		el.setAttribute('data-expanded', 'false');
		// and insert a toggle after the expandable element
		el.insertAdjacentHTML('afterend', '<div class="toggle ui-link a-r mb-10">... Read more &raquo;</div>');
		var toggleEl = el.nextElementSibling;
		// on clicking toggle, expand and collapse the text content
		// set value of 'data-expanded' attr and amend the toggle text, according to current expanded state
		toggleEl.addEventListener('click', function () {
			var is_expanded = el.hasAttribute('data-expanded') && el.getAttribute('data-expanded') === 'true';
			var newState = is_expanded ? 'false' : 'true';
			var newText = is_expanded ? '... Read more &raquo;' : '&laquo; Show less';
			el.setAttribute('data-expanded', newState);
			this.innerHTML = newText;
			console.log(this.innerHTML);
		});

		if (!needsExpander) {
			toggleEl.classList.add('d-n');
		}
	});
	// if a call-back function is passed as an argument, call it now
	if (myCallBack) {
		myCallBack(myElement);
	}
}

// ### CAROUSEL ### (slideshow) - fade in children of specified element with specified delay, at specified interval (in seconds)
function doCarousel(el, delay, interval) {
	forEach(el.children, function (elChild, i) {
		// stack all child nodes on top of each other
		elChild.classList.add('p-a');
		// shift first child to the top of stack, then fade it in; fade out all other children
		// note - we can't rely on .in as  a marker of curr div; exchange of 'in' and 'out' are not precisely synchronised
		// so, mark curr div separately via attribute 'aria-current'
		if (i === 0) {
			elChild.classList.add('z-1', 'ui-fade', 'in');
			elChild.setAttribute('aria-current', 'true');
		} else {
			elChild.classList.add('ui-fade', 'out');
		}
	});
	// set specified interval (in seconds)
	var carouselInterval = setInterval(function() {
		// clear interval and do not proceed if data-stop attribute has been set (to true)
		if (el.hasAttribute('data-stop')) {
			clearInterval(carouselInterval);
			return;
		}
		// set [aria-current] as current div and its next sibling as next div; go back to 1st child when last is reached //.in
		var currDiv = el.querySelector('[aria-current]'),
			nextDiv = currDiv.nextElementSibling ? currDiv.nextElementSibling : el.children[0];
		// if cross-fading, prepare next div; allow it to be displayed when current div fades out
		if (el.classList.contains('cross-fade')) {
			nextDiv.classList.remove('out');
			nextDiv.classList.add('in');
		}
		// fade out the current div, then shift the next div to the top of the stack, and fade it in (if not cross-fading)
		animate(currDiv, {delay: delay*1000});
		var carouselTimeout = setTimeout(function() {
			if (el.hasAttribute('data-stop')) {
				clearInterval(carouselTimeout);
				return;
			}
			currDiv.classList.remove('z-1');
			currDiv.removeAttribute('aria-current');
			nextDiv.classList.add('z-1');
			nextDiv.setAttribute('aria-current', 'true');
			if (!el.classList.contains('cross-fade')) {
				animate(nextDiv, {delay: delay*1000});
			}
		}, delay*1000);
	}, interval*1000);
}


function initStyleguide() {
	"use strict";
	// replace the 1st link to the menu page with the 1st nav in the menu page;
	// replace the 2nd link to the menu page with the 1st list in the menu page;
	// replace the link to the top with the footer in the menu page:
	var request = new XMLHttpRequest();
	var url = 'menu.html';
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400){
			// Success! - append response text to a temp div
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = request.responseText;
			// get the content to include and the elements they will replace; then append and remove
			var includes = tempDiv.querySelectorAll('.include'),
				header = document.querySelector('header'),
				aside = document.querySelector('aside'),
				topLink = header.querySelector('a[href*="menu"]'),
				botLink = document.querySelector('body > a:last-of-type');
			document.body.insertBefore(includes[0], header.nextElementSibling);
			topLink.parentNode.removeChild(topLink);
			if (aside) {
				var menuLink = aside.querySelector('a[href*="menu"]');
				aside.insertBefore(includes[1], menuLink);
				aside.removeChild(menuLink);
				aside.insertAdjacentHTML('afterbegin', '<h2>Menu for Style Guide</h2>');
			}
			document.body.removeChild(botLink);
			document.body.appendChild(includes[2]);
			// enable show/hide for the user thumbnail and dropdown list
			showMoreFor(document.querySelector('.topnav .ui-member'));
		} else {
			// We reached our target server, but it returned an error
			location.href = url;
		}
	};
	request.onerror = function() {
		// There was a connection error of some sort
		location.href = url;
	};
	request.send();

	// truncate text
	// TODO - simplify insertReadMore() to use aria-expanded="false" widget
	if (document.getElementById('read-more-js')) {
		insertReadMore(document.getElementById('read-more-js'));
	}

	// create a cross-fade image carousel for #photo-samples
	if (document.getElementById('photo-samples')) {
		doCarousel(document.getElementById('photo-samples'), 2, 5);
	}

	// change z-index of overlapping profile photos so the first image (on very left) sits on top, through to last image (on very right) sitting on bottom
	forEach(document.querySelectorAll('.scroll.BE > li'), function (el, i) {
		el.style.zIndex = 10 - i;
	});

	if (document.querySelector('[data-expiry]')) {
		// add special offer countdown timer
		//callScript('/js/countDownTimer.js');
	}

	// enable output of range input (slider); i.e. show the current value above the slider:
	if (document.querySelector('[data-type=range]')) {
		callScript('js/range.js');
	}

	// enable conversion of select options to a scrollable list (picker):
	if (document.querySelector('.picker') && !is_ie9d) {
		callScript('js/picker.js');
	}

	// enable a textarea to be displayed as plain text, until focused:
	// 	'el' is the container of the textarea;
	//	NB - if required elsewhere, shift to utilities.js
	forEach(document.querySelectorAll('[data-type=textarea]'), function (el, i) {
		// prevent display of textarea from changing on hover
		el.classList.remove('ui-text');
		el.setAttribute('data-display','text');
		// on focus in the textarea,
		el.querySelector('textarea').addEventListener('focus', function () {
			// display any editable elements as text:
			forEach(document.querySelectorAll('[data-display=editable]'), function(ed) {
				ed.setAttribute('data-display', 'text');
			});
			// but make the current textarea look editable:
			el.setAttribute('data-display','editable');
			// if the container is marked for insertion of a close span, and there is no close span, create one:
			if (el.hasAttribute('data-close') && !el.querySelector('.close')) {
				var closer = document.createElement('span'),
					closeText = document.createTextNode('Close');
				closer.appendChild(closeText);
				closer.className = 'close ti-9 p-a';
				el.appendChild(closer);
			}
			// on clicking any button or close span in the container, display textarea as plain text
			forEach(document.querySelectorAll('button, input[type=submit], input[type=reset], .close'), function (btn, i) {
				btn.addEventListener('click', function () {
					el.setAttribute('data-display','text');
				});
			});
		});
	});

	// to any element with attribute 'data-customtip', apply a positioned tooltip to a custom icon
	forEach(document.querySelectorAll('[data-customtip]'), function (el, i) {
	// create the tooltip text and the trigger
		var tipTxt = 'They meet <em>your</em> ideal partner criteria',
			// NB - need to create a DOM node for 'doToolTipFor' function:
			trigger = document.createElement('span');
		// set icon for the trigger
		trigger.className = 'cr-p f-l mr-5 ui-spr ui-tick-g-s';
		// prepend the trigger to the element
		el.parentNode.insertBefore(trigger, el);
		// enable a tooltip for the trigger span created above, using the content created above - see utilities.js
		doToolTipFor(trigger, tipTxt);
	});

	// enable toggling of animations on clicking certain buttons:
	if (document.querySelector('#fade')) {
		// enable basic fade animation
		document.querySelector('#fade > button').onclick =  function () {
			toggleAnimation(this, this.nextElementSibling);
		};
		// enable basic slide animation
		document.querySelector('#slide > button').onclick =  function () {
			toggleAnimation(this, this.parentNode.getElementsByTagName('ul')[0]);
		};
		// enable slow fade animation
		document.querySelector('#slow-animation > button').onclick =  function () {
			toggleAnimation(this, this.nextElementSibling, {delay: 1000});
		};
		// enable fade animation with 'display:none' before and after
		document.querySelector('#nodisplay-animation > button').onclick =  function () {
			toggleAnimation(this, this.nextElementSibling, {hidden: true});
		};
		// enable slide animation from top down
		document.querySelector('#slide-fromtop > button').onclick =  function () {
			toggleAnimation(this, this.parentNode.getElementsByTagName('ul')[0]);
		};
		// enable slide animation from right to left
		document.querySelector('#slide-fromright > button').onclick =  function () {
			toggleAnimation(this, this.parentNode.getElementsByTagName('ul')[0]);
		};
	}

	// enable card transitions
	forEach(document.querySelectorAll('[data-target]'), function(el) {
		el.addEventListener('click', function (e) {
			if (!el.hasAttribute('data-current')) {
				var tabGroup = closest(el, '[data-cards]');
				if (tabGroup && tabGroup.getAttribute('data-cards') === 'carousel') {
					// get the incoming panel and look for 'left' or 'right' in class name
					// if it has 'right', it's sliding in from right and outgoing panel must slide out left
					// if it has 'left', vice versa
					// note - get ids of panels by removing '#' from href of corresponding link
					var inCard = document.getElementById(el.getAttribute('href').slice(1)),
						currEl = tabGroup.querySelector('[data-current]'),
						outCard = document.getElementById(currEl.getAttribute('href').slice(1));
					// NB - assumes that first incoming panel will slide in from right and initially visible panel will exit left
					// so, if incoming panel has no class, outgoing card must get "left" class
					if (inCard.classList.contains('left')) {
						outCard.classList.add('right');
						outCard.classList.remove('left');
					} else {
						outCard.classList.add('left');
						outCard.classList.remove('right');
					}
					showTarget(el, {hidden: true});
				} else {
					showTarget(el);
				}
			}
			e.preventDefault();
		});
	});

	// enable emoticons
	if (document.getElementById('conversation-form')) {
		callFunction('doEmoticons', 'emoticons', document.querySelector('#conversation-form > textarea'));
	}

	// for radio groups which initially show the first radio and hide the nested
	forEach(document.querySelectorAll('.has-nested'), function(el) {
		var fieldset = closest(el, 'fieldset'),
			label = el.querySelector('label'),
			radio = el.querySelector('[type=radio]');
		// when mousing up from the first label within each radio group, show the corresponding nested
		// deregister the current checked group (if it exists), in the same fieldset
		// and register the current group as checked
		label.addEventListener('mouseup', function() {
			if (fieldset.querySelector('.checked-group')) {
				fieldset.querySelector('.checked-group').classList.remove('checked-group');
			}
			radio.classList.add('checked-group');
		});
		// NB - keyboard users focus in and move between radio inputs, not labels; so -
		// show a hidden field when its main radio is checked; then leave it open
		// user may move back up into the top hidden field from the bottom
		radio.addEventListener('keyup', function() {
			this.classList.add('checked-group');
		});
		// if a nested radio (in div.hiddenFields) is checked when page loads, show that nested div
		if (el.querySelector('.hidden-fields [type=radio]:checked')) {
			radio.classList.add('checked-group');
		}
	});

	var howToRate = document.getElementById('how-to-rate');
	if (howToRate) {
		var p = howToRate.querySelector('p');
		p.textContent = p.textContent.replace('radio button to the left of the number', 'number of stars');
		forEach(howToRate.querySelectorAll('dt'), function(dt, i) {
			var num = parseInt(dt.textContent);
			dt.textContent = '';
			for (var i = 0; i < (6 - num); i++) {
				dt.insertAdjacentHTML('afterbegin', '&#9734;'); /*<span class="star rate inactive"></span>*/
			}
			for (var i = 0; i < num; i++) {
				dt.insertAdjacentHTML('afterbegin', '&#9733;'); /*<span class="star rate"></span>*/
			}
		});
	}

	// set up and start carousel for children of any element with class .carousel, with 1 second fade, at 7 second interval
	forEach(document.querySelectorAll('.carousel'), function(el) {
		doCarousel(el, 1, 7);
	});
	// enable user to stop auto carousel for success stories and to click through stories manually
	var stories = document.getElementById('success-stories');
	if (stories) {
		// insert next and previous links
		if (!stories.querySelector('.ui-arrow')) {
			var links = document.createElement('span');
			links.className = 'pos-br mr-5 mb-5';
			stories.classList.add('p-r');
			stories.appendChild(links);
			links.insertAdjacentHTML('afterbegin', '<span class="ui-arrow left X mr-10">Previous</span><span class="ui-arrow right X">Next</span>');
		}
		forEach(stories.querySelectorAll('.ui-arrow'), function(el) {
			el.addEventListener('click', function() {
				// clear any existing timeout; prevent shift to next story if click comes before end of timeout (330ms)
				clearTimeout(manualFadeTimeout);
				// if this is the first arrow click, 
				if (!stories.querySelector('[data-stop]')) {
					// stop the automatic carousel; this will clear existing fade time-out and carousel interval
					stories.querySelector('.carousel').setAttribute('data-stop','true');
					// remove all 1 second delays from current and next/prev story (will now be quicker)
					forEach(stories.querySelectorAll('.delay-1000'), function(story) {
						story.classList.remove('delay-1000');
					});
				}
				// identify current story and next story
				var currStory = stories.querySelector('[aria-current]'),
					nextStory;
				// if clicked arrow is left, next story will be previous sibling; otherwise - next sibling;
				// go to last story after reaching first, and vice versa:
				if (el.classList.contains('left')) {
					nextStory = currStory.previousElementSibling ? currStory.previousElementSibling : currStory.parentNode.lastElementChild;
				} else {
					nextStory = currStory.nextElementSibling ? currStory.nextElementSibling : currStory.parentNode.firstElementChild;
				}
				// ensure 'in' for current story, and 'out for all other stories
				// note - there would otherwise be inconsistencies if user clicks twice or more during a time-out
				var handleRapidFireClicks = function() {
					forEach(stories.querySelector('.carousel').children, function(story) {
						if (story.hasAttribute('aria-current') && story.classList.contains('out')) {
							story.classList.add('in');
							story.classList.remove('out');
						} else if (!story.hasAttribute('aria-current') && story.classList.contains('in')) {
							story.classList.add('out');
							story.classList.remove('in');
						}
					});
				}
				handleRapidFireClicks();
				// then fade out current story
				animate(currStory);
				// and fade in next/prev story
				// when current story fade is complete, change stacking order, fade in next story and shift 'aria-current' attribute
				var manualFadeTimeout = setTimeout(function() {
					currStory.classList.remove('z-1');
					currStory.removeAttribute('aria-current');
					nextStory.classList.add('z-1');
					nextStory.setAttribute('aria-current', 'true');
					animate(nextStory);
					handleRapidFireClicks();
				}, 330);
			});
		});
	}

	/*// TODO - data-carousel="3,10"; separate js file - carousel.js 
	// var delay = el.hasAttribute('data-carousel') ? parseInt(el.getAttribute('data-carousel').split(',')[0]) : 2;
	// var interval = el.hasAttribute('data-carousel') ? parseInt(el.getAttribute('data-carousel').split(',')[1]) : 7;
	var delay, interval;
	if (el.hasAttribute('data-carousel')) {
		delay = parseInt(el.getAttribute('data-carousel').split(',')[0]);
		interval = parseInt(el.getAttribute('data-carousel').split(',')[1]);
	} else if (el.classList.contains('cross-fade')) {
		delay = 2;
		interval = 5;
	} else {
		delay = 1;
		interval = 7;
	}*/
}

document.addEventListener('DOMContentLoaded', initStyleguide);
