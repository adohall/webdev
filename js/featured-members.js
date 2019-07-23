/**
 * Created by ahall on 19/09/2014.
 */

// on clicking a link in featured members tab menu - ('#featured-members > [role=tabpanel] > li a'),
// hide other tabs and show the corresponding tab
// if there tab corresponding to the link, create the tab
// if there is no content in the corresponding tab, call that content via ajax
// note -
// change the text and href of the final link in the 'more' link

// call the content from the href of the specified link, via ajax

// display the tab corresponding to the clicked link
function switchFeaturedMembers(link) {
	"use strict";
	// get the id of the tab (section) to be displayed, via either the data-section attribute or the text of the clicked link
	// for text of the clicked link, replace all spaces with a hyphen, and lower the case
	var featured = document.getElementById('featured-members');
	var tabId = link.hasAttribute('data-section') ? link.getAttribute('data-section') : link.textContent.replace(/(\s)/g,'-').toLowerCase();
	var tab = document.getElementById(tabId);
	// if the tab doesn't exist, create it and insert it after #new-members
	if (!tab) {
		tab = document.createElement('section');
		tab.setAttribute('id', tabId);
		tab.className = 'container';
		featured.insertBefore(tab, document.getElementById('new-members').nextElementSibling);
	}
	// hide the currently displayed tab and show the targeted tab
	// mark and style the corresponding item in the tab menu
	var currItem = featured.querySelector('[data-current]');
	currItem.removeAttribute('data-current');
	currItem.className = currItem.className.replace('ui-current', '');
	var currTab = featured.querySelector('[data-open]');
	currTab.removeAttribute('data-open');
	currTab.style.display = 'none';
	link.parentNode.setAttribute('data-current', 'true');
	link.parentNode.className += ' ui-current';
	tab.setAttribute('data-open', 'true');
	tab.style.display = 'block';
	// get the value of the data-rv attribute of the 1st list item link in #new members (either 'true' or 'false')
	var forcelogin = document.querySelector('#new-members > ol > li:first-child > a').getAttribute('data-rv');
	// if the tab has no list, call that content via ajax
	if (!tab.querySelector('ol')) {
		tab.innerHTML = '<p class="ui-spinner">Loading... ' + link.textContent + '</p>';
		var request = new XMLHttpRequest();
		var url = link.getAttribute('href');
		// add value of #location field as a parameter to url
		var meetMembersList = document.querySelector('#new-members > ol');
		var location = meetMembersList && (meetMembersList.dataset ? meetMembersList.dataset.location : meetMembersList.getAttribute('data-location'));
		var ajaxUrl = url + (url.indexOf("?") >= 0 ? "&" : "?")  + 'fragment=true&count=18&pc=' + encodeURIComponent(location);
		request.open('GET', ajaxUrl, true);
		request.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status >= 200 && this.status < 400) {
					// Success; insert the requested content in the tab
					tab.innerHTML = this.responseText;
					// restyle the list
					var list = tab.querySelector('ol');
					// set class name, with variation for touch devices
					var interactCls = eventSupport('touchstart') ? 'touch' : 'mouse';
					list.className += 'ui-members ui-' + interactCls +' a-c mb-10 c-aft';
					// for each image in the tab
					forEach(tab.querySelectorAll('img'), function(el) {
						// increase size of the image
						el.src = el.src.replace('2.jpg', '0.jpg');
						// reorganise the accompanying profile summary:
						var a = el.parentNode;
						var li = a.parentNode;
						// shift image up a level as a sibling to the link
						li.insertBefore(el,a);
						// add tab index to list item; and remove class attribute
						li.setAttribute('tabindex','50');
						li.removeAttribute('class');
						// restyle link
						a.className = 'ui-summary';
						// restyle details
						var details = a.nextElementSibling;
						details.className = 'fs-n';
						// refactor status div as a 'View Profile' div
						var div = details.nextElementSibling;
						div.className = 'ui-link w';
						div.innerHTML = 'View Profile &raquo;';
						// append details and 'View Profile' div to link
						a.appendChild(details);
						a.appendChild(div);
						// RSVP-5112: force user to either log in or sign up before proceeding; forcelogin will be either 'true' or 'false'
						//      but not if user has created an account via sign-up form in lightbox
						a.setAttribute('data-rv', forcelogin);
						a.onclick = function (e) {
							if (!document.body.hasAttribute('data-account')) {
								forceLoginOrRego(a);
								e.preventDefault();
							}
						};
					});
					// clone the 'more' link at end of #new-members, append it to end of tab, and change its href and text
					var p = document.querySelector('#new-members > p:last-child').cloneNode(true);
					tab.appendChild(p);
					p.firstChild.setAttribute('href', url);
					p.firstChild.innerHTML = 'view more ' + link.textContent + ' &raquo;';
					//RSVP-5112: force user to login/rego before doing anything
					p.firstChild.onclick = function (e) {
						forceLoginOrRego(p.firstChild);
						e.preventDefault();
					};
					// set up scrolling for list, in devices smaller than a tablet
					if (window.innerWidth <= 767) {
						// append a launcher (which looks like a slide arrow), then on clicking it,
						var launcher = document.createElement('div');
						launcher.className = 'ui-arrow bg-g cr-p p-a';
						list.appendChild(launcher);
						list.className += ' scroll JS p-r';
						launcher.onclick = function (e) {
							// if setScrollWidget() isn't recognised, call scrolling.js,
							// mark the element for setting of the scroll widget, when the script loads;
							// but if setScrollWidget() is recognised, set the scroll widget immediately
							if (typeof setScrollWidget !== 'function') {
								callScript('js/scrolling.js');
								list.setAttribute('data-init', 'setScrollWidget');
							} else {
								setScrollWidget(list);
							}
						};
					}
				} else {
					// Error; go to hyperlinked page instead
					location.href= url;
				}
			}
		};
		request.send();
		request = null;
	}
}

// run as soon as this script file is called:
function initFeaturedMembers() {
	"use strict";
	// on clicking any link in the featured members tab menu, switch to the corresponding tab
	forEach(document.querySelectorAll('#featured-members > ul > li a'), function (el) {
		el.onclick = function (e) {
			e.preventDefault();
			switchFeaturedMembers(el);
		};
	});

	// if a link has been marked by root-index.js for immediate tab switch, switch tabs to it:
	var initEl = document.querySelector('[data-init=switchFeaturedMembers]');
	if (initEl) {
		switchFeaturedMembers(initEl);
	}
}

initFeaturedMembers();

/*
// 1. add location data to URL or top 100 links in the tab menu;
// 2. rewrite in native JavaScript

 // then load the appropriate content via Ajax to target div
 var ajaxURL = this.href + (this.href.indexOf("?") >= 0 ? "&" : "?")  + 'fragment=true&count=18&pc=' + encodeURIComponent($('#search-form [data-loctype]').val());
 */
