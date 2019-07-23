// insert ### USERNAME EXAMPLES ### on clicking 'See examples' link
// NB - there may be more than one signup form in the page; so - all objects must be defined relative to the clicked link

function giveExamplesFor(el) {
	"use strict";
	var field = el.parentNode.parentNode.parentNode;
	// if field doesn't already have a container for username examples, create one and insert after the field
	var ajaxDiv = field.querySelector('[data-ajax]');
	if (!ajaxDiv) {
		ajaxDiv = document.createElement('div');
		ajaxDiv.setAttribute('data-ajax', 'true');
		ajaxDiv.className = 'box D ui-fade out';
		field.appendChild(ajaxDiv);
	}
	var load = function () {
		// ensure ajax div is showing; in case internet connection is slow, write a temporary message to the ajax div
		ajaxDiv.innerHTML = '<p><div class="ui-loading BK"><span></span><span></span><span></span><span></span></div>loading...</p>';
		// if ajax div is hidden, fade it in (note - on clicking the 'more' link, this div will be visible)
		if (ajaxDiv.className.match(/\bout\b/)) {
			fade(ajaxDiv);
		}
		// request username examples page via ajax, stripped of header and footer
		var request = new XMLHttpRequest();
		request.open('GET', el.getAttribute('href') + tomcatSessionArgs + '?doNotWrapBody=true', true);
		request.onreadystatechange = function () {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					// Success! - load requested page to a temp div and extract the article's content
					var tempDiv = document.createElement('div');
					tempDiv.innerHTML = this.responseText;
					var article = tempDiv.querySelector('article');
					// remove 'back' link and main heading
					article.removeChild(article.querySelector('h1'));
					article.removeChild(article.querySelector('a[href*="signUp"]'));
					// replace content of ajax div with the article's remaining content
					ajaxDiv.innerHTML = article.innerHTML;
					// on clicking 'more' link, run the load function
					var moreLink = ajaxDiv.querySelector('a[href*="usernameExamples"]');
					moreLink.onclick = function (e) {
						load();
						e.preventDefault();
					};
					// add a 'close' span;  on clicking it, close ajax div
					var closer = document.createElement('span'),
						closeText = document.createTextNode('Close');
					closer.appendChild(closeText);
					closer.className = 'ui-link close f-r';
					closer.textContent = 'close';
					ajaxDiv.insertBefore(closer, moreLink);
					closer.onclick = function () {
						fade(ajaxDiv);
					};
				} else {
					// Error :( - go to username examples page
					location.href = el.getAttribute('href');
				}
			}
		};
		request.send();
		request = null;
	};
	load();
}

function initExamples() {
	"use strict";
	// if a link has been marked for listing username examples, as soon as this script is loaded, enable that:
	var initEl = document.querySelector('[data-init=giveExamplesFor]');
	if (initEl) {
		giveExamplesFor(initEl);
	}
	// 'username-examples.js' may have been called without reference to a particular link;
	//      so, for any link to username examples, give examples on click:
	forEach(document.querySelectorAll('a[href*="usernameExamples"]'), function (el) {
		el.onclick = function (e) {
			giveExamplesFor(this);
			e.preventDefault();
		};
	});
}

initExamples();
