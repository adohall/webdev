/* a set of utility javascript functions (or methods) used by several pages to create lightboxes and  */

// IE8+; native JavaScript only; no jQuery (or any other framework) required:

// get a uniform url reference - strip url of protocol, server name and parameters;
// note 1 - links to the same page may have had different parameters added (e.g. by GA tracking)
// note 2 - sign up and log in links in top strip in internal pages have protocol and server name; not so for guest home
// note 3 - jsession may also be attached to url in some cases (;jsession=xyz)
function stripUrl(url) {
	"use strict";
	if (url.indexOf('?') !== -1 || url.indexOf('//') !== -1 || url.indexOf(';') !== -1) {
		// remove parameters
		if (url.indexOf('?') !== -1) {
			url = url.split('?')[0];
		}
		if (url.indexOf(';') !== -1) {
			url = url.split(';')[0];
		}
		// remove protocol & host (server) name
		if (url.indexOf('//') !== -1) {
			url = url.replace(location.protocol + '//' + location.host, '').trim();
		}
	}
	return url;
}

// write a close span to the specified lightbox
//  on clicking the close span, fade out the mask & the visible lightbox
function writeCloserFor(lightbox) {
	"use strict";
	var closer = document.createElement('span'),
		closeText = document.createTextNode('Close');
	closer.appendChild(closeText);
	closer.className = 'close';
	//closer.textContent = '\u00d7';
	lightbox.appendChild(closer);
	closer.onclick = hideLightbox;
}

// following function is called on lightbox creation and on window resize
// centre lightbox in viewport - reset properties: position, margin-left, margin-top, left and top
function setPosition(lightbox) {
	"use strict";
	var w = window.innerWidth,
		boxHeight = lightbox.getAttribute('data-height') || '200',
		boxWidth = lightbox.getAttribute('data-width') || '400',
		h = (boxHeight === 'auto') ? lightbox.offsetHeight : boxHeight,
	// set a minimum gap above and below the lightbox; but set to 0 for narrow devices, to maximise use of limited space
		gap = (w < 480) ? 0 : 10;
	// reset margin-left and -top to '0' (note: set at -200px and -100px respectively, in CSS)
	lightbox.style.marginLeft = '0';
	lightbox.style.marginTop = '0';
	// reset position to 'absolute' (note: set at 'fixed' in CSS)
	// so if screen is small, or if lightbox is expanded by error fields or name availability notices,
	//  and light box extends beyond bottom of viewport, user can scroll to bottom of light box
	lightbox.style.position = 'absolute';
	if (h > (window.innerHeight - gap*2)) {
		lightbox.style.top = window.pageYOffset + gap + 'px';
	} else {
		lightbox.style.top = (window.innerHeight - h)/2  + window.pageYOffset + 'px';
	}
	// recalculate left pos of lightbox; notes:
	// 1. every lightbox has width: 100%; left: 50%; - set in CSS
	// 2. individual light boxes also have a max-width - taken from data-lightbox
	// 3. max-width is applied in createLightbox()
	// 4. when box width (max-width) is wider than viewport, left is 0 (note - width is 100%)
	// 5. otherwise, left is half of viewport width less half of box width
	if (boxWidth >= w) {
		lightbox.style.left = '0';
	} else {
		lightbox.style.left = w/2 - boxWidth/2 + 'px';
	}
}

// note that with multiple lightboxes, the reference to 'lightbox' (see above) will vary; we need to fade out the visible lightbox only
function hideLightbox () {
	"use strict";
	fade(document.querySelector('.mask:not(.JQ)'));
	forEach(document.querySelectorAll('.lightbox:not(.JQ)'), function(el) {
		var removeLB = el.getAttribute('data-remove');

		if (el.className.match(/\bin\b/)) {
			fade(el, function () {
				if (removeLB) { el.parentNode.removeChild(el); }
			});
		}
	});
}

function showLightbox(lightbox, link) {
	// NB - commence fade-in before positioning; otherwise height may be 0; display is initially 'none'
	//  also - we don't want to fade out lightbox if it is currently showing; e.g when reloading form pt 1 with errors
	if (lightbox.classList.contains('out')) {
		fade(lightbox);
	}
	// ensure that user can see whole of lightbox:
	setPosition(lightbox);
	// focus in 1st text input (if one exists)
	var inputs = lightbox.querySelectorAll('input[type=text]');
	if (inputs.length) {
		inputs[0].focus();
	}

	// add an event listener for cancel/close button added in jspf file
	forEach(lightbox.querySelectorAll('.hide-LB'), function(cancelBtn) {
		cancelBtn.addEventListener('click', hideLightbox);
	});

	if (lightbox.querySelectorAll('a[href^="/user/updateVisibleState"]')[0]) {
		callFunction('goReactivate', 'reactivate-from-lightbox', link);
	}
}

function completeLightbox(lightbox,link) {
	// remove all classes from containers in lightbox (either main or article or nav); will strip out .flex and .container
	// we don't want the padding or 2-column layout of .container
	forEach(lightbox.querySelectorAll('.container'), function(el) {
		el.removeAttribute('class');
	});
	// write a close span to the lightbox, then append lightbox to body (before mask, so that we can style mask depending on lightbox)
	// NB - closer must be appended after content; if appended before, innerHTML += will remove function attached to click event
	writeCloserFor(lightbox);
	var mask = document.querySelector('.mask:not(.JQ)');
	document.body.insertBefore(lightbox, mask);
	// on clicking mask, fade out the mask & the visible lightbox
	mask.addEventListener('click', hideLightbox);
	// fade in mask if it is faded out; NB - we don't want to fade out mask when switching between log-in and sign-up forms
	if (mask.classList.contains('out')) {
		fade(mask);
	}
	// set position of lightbox, fade it in (if hidden), and focus in first input
	showLightbox(lightbox, link);
	// remove loading indicator, if it
	if (link && link.parentNode.querySelector('.ui-loading')) {
		var spinner = link.parentNode.querySelector('.ui-loading');
		spinner.parentNode.removeChild(spinner);
	}
}

// for the specified link (or button),
// load the linked page (or section within same page) to a lightbox, with options - width, height and callback function
// options are set in link (or button) tag like so: data-lightbox="660,auto,signup" (or simply data-lightbox="true")
// NB - callback value 'mystring' must have corresponding callback function 'doMystringLightbox'
//  centre lightbox in page over a transparent mask;
function fetchToLightbox(link) {
	"use strict";
	var boxData = link.getAttribute('data-lightbox'),
		removeLB = link.getAttribute('data-remove');

	// don't load log-in or sign-up lightbox for mobile devices
	if (smartphone) {
		if (boxData.indexOf('signup') !== -1 || boxData.indexOf('login') !== -1) {
			// get the link's href; get the splash code from the page's URL
			var href = link.getAttribute('href'),
				splash = getURLParam('splash'),
				c = href.indexOf('?') !== -1 ? '&' : '?';
			// add "ignore referrer" param for redirect to work
			href += c + 'ir=true';
			//pass through the splash code to link's href
			if (splash) {
				href += '&splash=' + splash;
			}
			// now follow modified href
			location.href = href;
			return false;
		}
	}
	// get the array of lightbox options passed in the link's 'data-lightbox' attribute - [width, height, callback]
	var options = boxData.split(',');
	// trim trailing white space from the text value of each option
	for (var i = 0; i < options.length; i++) {
		options[i] = options[i].trim();
	}
	// get the url of the page (or section within the page) to be fetched (from the launcher's href or data-boxid attribute)
	// add parameter to remove header and footer; note: list any pages here, e.g. signup & login, which have an iframe version (further reduced)
	// if the launcher has a data-boxid attribute, set that as the data-url of the lightbox (a js identifier);
	// otherwise, create a data-url from the link's url, by stripping it of parameters;
	//  note: links to the same page may have had different parameters added (e.g. by GA tracking)
	// if the link has an anchor (href="#sectionid") or the launcher has no href, lightbox content is in same page
	// otherwise, the launcher is a link which requires ajax to load another page to lightbox (i.e. is_external)
	var noHeadParam, url, dataUrl,
		is_external = link.hasAttribute('href') && (link.getAttribute('href').charAt(0) !== '#');
	if (is_external) {
		noHeadParam = (options[2] && (options[2] === 'signup' || options[2] === 'login')) ? 'iframe=true' : 'doNotWrapBody=true',
		url = link.getAttribute('href') + (link.getAttribute('href').indexOf('?') >= 0 ? '&' : '?') + noHeadParam,
		dataUrl = link.hasAttribute('data-boxid') ? link.getAttribute('data-boxid') : stripUrl(url);
	} else {
		dataUrl = link.getAttribute('href') ? link.getAttribute('href').slice(1) : link.getAttribute('data-boxid');
	}
	var lightbox = document.querySelector('[data-url="' + dataUrl + '"]'),
		mask = document.querySelector('.mask:not(.JQ)');

	// create a lightbox with specified data-url value and specified content
	var createLightbox = function(dataUrl, content) {
		// if there's no mask, create it
		if (!document.querySelector('.mask:not(.JQ)')) {
			var div = document.createElement('div');
			div.className = 'mask ui-fade out d-n';
			document.body.appendChild(div);
			mask = document.querySelector('.mask:not(.JQ)');
		}
		var box = document.createElement('div');
		// set their classes and attributes
		box.className = 'lightbox ui-fade out d-n';
		// if data-remove is true, the lightbox will be removed from the dom (in the hideLightbox function)
		if (removeLB) {
			box.setAttribute('data-remove', 'true');
		}
		// NB - strip url of parameters; links to the same page may have had different parameters added (e.g. by GA tracking)
		box.setAttribute('data-url', dataUrl);
		// set maxWidth and height of lightbox, if they are passed as options (i.e. data-lightbox is not simply 'true')
		// note -  maxWidth can be passed without height
		if (options[0] !== 'true') {
			box.setAttribute('data-width', parseInt(options[0]));
			box.style.maxWidth = parseInt(options[0]) + 'px';
			if (options[1]) {
				var boxHeight = (options[1] === 'auto') ? 'auto' : parseInt(options[1]);
				box.setAttribute('data-height', boxHeight);
				box.style.height = (boxHeight === 'auto') ? 'auto' : boxHeight + 'px';
			}
		}
		box.innerHTML = content;
		// run the callback function, if it exists; this will manipulate the response text (either in the lightbox or in a temp div)
		// note: the lightbox, and optionally - the clicked link, can be passed in the callback function
		// if there is no callback, complete lightbox: write close span, fade in mask and lightbox, and remove spinner
		if (options[2]) {
			var callback = window['do' + capitalise(options[2]) + 'Lightbox'];
			callback(box,link);
		} else {
			completeLightbox(box,link);
		}
	}

	// if lightbox with the specified url already exists, and link is not marked as exclusive, just show it;
	// otherwise, create lightbox, then show it
	if (lightbox && !link.hasAttribute('data-exclusive')) {
		// if mask is faded out, fade it in
		if (mask.classList.contains('out')) {
			fade(mask);
		}
		showLightbox(lightbox, link);
	} else if (is_external) {
		// content is another page and has to be fetched by Ajax
		// if a spinner (loading indicator) doesn't already exist, insert it in front of link,
		// but if a child element of link is marked as the spinner host, insert spinner there
		// or if the link itself is marked as the spinner host, insert spinner inside it
		var spinnerHtml = '<span class="ui-loading"><span></span><span></span><span></span><span></span></span>';
		if (link.hasAttribute('data-spinner') && !link.querySelector('.ui-loading')) {
			link.insertAdjacentHTML('afterbegin', spinnerHtml);
		} else if (link.querySelector('[data-spinner]') && !link.querySelector('.ui-loading')) {
			link.querySelector('[data-spinner]').insertAdjacentHTML('afterbegin', spinnerHtml);
		} else if (!link.parentNode.querySelector('.ui-loading')) {
			link.insertAdjacentHTML('afterbegin', spinnerHtml);
		}
		// if link is marked as exclusive, remove any lightbox with same data-url
		// this enables us to avoid duplicate ids in form elements which would prevent user from using radios and checkboxes
		if (link.hasAttribute('data-exclusive')) {
			var duplicate = document.querySelector('[data-url="' + dataUrl + '"]');
			if (duplicate) {
				duplicate.parentNode.removeChild(duplicate);
			}
		}
		// request page via ajax:
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					// Success; insert the requested page in a lightbox with specified options
					// note - the options array can have up to 3 items - [width, height, callback]
					// note also, that with a slow connection, if user clicks twice, there is a risk of creating 2 versions of the same lightbox
					//  so check again here for existence of lightbox
					if (!document.querySelector('[data-url="' + dataUrl + '"]')) {
						createLightbox(dataUrl, this.responseText);
						// insert response text in lightbox; note - response text is a string, so can't be appended;
						// run the callback function, if it exists; this will manipulate the response text (either in the lightbox or in a temp div)
						// note: the lightbox, and optionally - the clicked link, can be passed in the callback function
						// if there is no callback, complete lightbox: write close span, fade in mask and lightbox, and remove spinner
					}
				} else {
					// Error; page may no longer exist - e.g. terminated member in stale elastic search result
					// alert user and ask them to try later
					alert("We're sorry. That resource is temporarily unavailable. Please try again later. Note - if you were attempting to contact a member, they may have recently terminated their membership.");
				}
			}
		};
		request.send();
		request = null;
	} else {
		// button either has no 'href' or href is an anchor starting with '#'
		// so, target section is within page; section's id matches link's href (-#) or button's data-boxid attribute
		var section = document.getElementById(dataUrl);
		createLightbox(dataUrl, section.innerHTML);
	}
}

// on resizing browser window, ensure the lightbox is positioned appropriately:
window.addEventListener('resize', function () {
	"use strict";
	forEach(document.querySelectorAll('.lightbox:not(.JQ)'), function(el) {
		setPosition(el);
	});
});

/* ----------------------------------
	#### SIGN UP form ###
-------------------------------------*/

// set value of hidden target input in login or signup form, to initial href of clicked link
// note - link has been diverted to login or signup form
function setTarget(form, target) {
	"use strict";
	var input = form.querySelector('input[name=' + target + ']'),
		link = document.querySelector('[data-currClick]');
	if (input && link) {
		// set value of input with name which matches target, to value of link's target attribute (either loginTarget or regoTarget)
		input.value = link.hasAttribute('loginTarget') ? link.getAttribute('loginTarget') : link.getAttribute('regoTarget');
	}
}

// callback function for signup lightbox
function doSignupLightbox(lightbox, link) {
	"use strict";
	// insert link to login, at top of signup form
	var signupForm = lightbox.querySelector('form[id="join-step1"], form[id="location-form"]');
	// copy value of select form shorter sign-up form to longer sign-up form:
	// enable sign-up form to find targeted profile display page, when sign-up is complete:
	if (lightbox.querySelector('form[id="join-step1"]')) {
		setTarget(signupForm, 'regoTarget');
	}
	// if the link is not a facebook button, unhide the 'facebook join' div in lightbox
	if (link) {
		if (!link.classList.contains('facebook') && lightbox.querySelector('.facebook-join')) {
			lightbox.querySelector('.facebook-join').classList.remove('js-h');
		}
	}
	// style signup form
	callCSS('signup-lightbox.css');
	// complete and show lightbox
	completeLightbox(lightbox,link);
	// enable various functions in sign-up form
	if (typeof initSignup === 'function') {
		initSignup();
	} else {
		callScript('js/signup.js');
	}
}
/* ----------------------------------
 #### END - SIGN UP and LOG IN forms ###
 -------------------------------------*/

// callback function for 'send wink' lightbox
function doKissLightbox(lightbox, link) {
	"use strict";
	// on clicking 'start conversation' link (inside 'send wink' lightbox), fade out visible lightbox (note - leaving mask)
	// then open 'start conversation' lightbox (referred to in 'data-lightbox' attribute of 'start conversation' link)
	var converseLink = lightbox.querySelector('a[href*="Conversation"]');
	if (converseLink) {
		converseLink.addEventListener('click', function (e) {
			e.preventDefault();
			fade(lightbox);
			fetchToLightbox(this);
		});
	}
	preventDoubleClick(lightbox.querySelector('button'), 2000);
	// complete and show 'send wink' lightbox
	completeLightbox(lightbox,link);
}

// callback function for 'start conversation' lightbox
function doConverseLightbox(lightbox, link) {
	"use strict";
	if (lightbox.querySelector('textarea')) {
		callFunction('doEmoticons', 'emoticons', lightbox.querySelector('textarea'));
		callFunction('checkForm', 'start-conversation', lightbox);
	}
	// indicate to user that 'buy' link is "processing" (if it exists)
	var buyLink = lightbox.querySelector('a[href*=products]');
	if (buyLink) {
		preventDoubleClick(buyLink, 2000);
	}
	// complete and show 'start conversation' lightbox
	completeLightbox(lightbox,link);
}

// callback function for 'interested' lightbox
function doInterestLightbox(lightbox, link) {
	"use strict";
	if (lightbox.querySelector('textarea')) {
		callFunction('doEmoticons', 'emoticons', lightbox.querySelector('textarea'));
		showMoreFor(lightbox.querySelector('[data-focus]'));
	}
	forEach(lightbox.querySelectorAll('button'), function (el, i) {
		preventDoubleClick(el, 2000);
	});
	// complete and show 'start conversation' lightbox
	completeLightbox(lightbox,link);
}

// callback function for 'interested' lightbox
function doNoInterestLightbox(lightbox, link) {
	"use strict";
	preventDoubleClick(lightbox.querySelector('button'), 2000);
	// complete and show 'start conversation' lightbox
	completeLightbox(lightbox,link);
}

// callback for edit photos upload lightboxes
function doPhotoLightbox(lightbox, link) {
	"use strict";
	lightbox.setAttribute('data-upload-type', link.getAttribute('data-upload-type'));
	completeLightbox(lightbox, link);
	callFunction('initUploadPhoto', 'photo-upload', lightbox);
}

function initLightbox() {
	"use strict";
	// if a link has been marked by utilities.js for immediate lightbox creation, create the lightbox:
	var initEl = document.querySelector('[data-init=fetchToLightbox]');
	if (initEl) {
		fetchToLightbox(initEl);
	}
	// if a section has been marked (in a section js file) for immediate conversion to lightbox, convert it:
	var initElS = document.querySelector('[data-init=shiftToLightbox]');
	if (initElS) {
		shiftToLightbox(initElS.getAttribute('id'));
	}
}

// callback function for create-profile lightbox
function doCreateprofileLightbox(lightbox, link) {
	"use strict";
	// complete and show lightbox
	lightbox.innerHTML = lightbox.querySelector('#join-step2').outerHTML;
	completeLightbox(lightbox, link);
	// enable various functions in create profile form
	callScript('js/serialize.js');
	callScript('js/create-profile.js');
	callCSS('signup-lightbox.css');
}

initLightbox();
