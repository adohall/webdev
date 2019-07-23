// ### TABs ### - show/hide content
// ### above each tab list, create and insert a tab panel which shows only one tab at a time ###
/*
 * tablist is a group of tabs (sections), only one of which is shown at a time
 * tabpanel is a group of nav items which enables the user to choose which tab to reveal
*/

// targeted TAB step 1: is there a page anchor in the URL? and if so, what is it?
var h = location.hash,
	targetId = (h !== '')&&(h !== null) ? (h.indexOf('?')!=-1 ? h.split('?')[0] : h) : null;

function doTabs(tablist) {
	// wrap v4 tablist block in a box with border
	if (tablist.hasAttribute('data-tabclass') && tablist.getAttribute('data-tabclass') === 'v4') {
		var tab4wrap = document.createElement('div');
		tab4wrap.className = 'b-1 p-10 pb-0 mb-15 c-aft';
		tablist.parentNode.insertBefore(tab4wrap, tablist);
		tab4wrap.appendChild(tablist);
	}
	// insert a new ul[role=tabpanel] before [role=tablist],
	var tabpanel = document.createElement('ul');
	tabpanel.setAttribute('role', 'tabpanel');
	tablist.parentNode.insertBefore(tabpanel, tablist);
	// provide same padding as in list items with nested links (which are missing here):
	tabpanel.classList.add('JS');
	// if tablist has a tabclass attribute,
	// apply the value through a class attribute to the tabs, e.g. - v2, v3, v4, G
	if (tablist.hasAttribute('data-tabclass')) {
		var classArr = tablist.getAttribute('data-tabclass').split(" ");
		classArr.forEach(function(item) {
			tabpanel.classList.add(item);
		});
	}
	// then for each tab (child node of tablist),
	forEach(tablist.children, function(tab, i) {
		// give it a wai-aria tab role (to improve accessibility)
		tab.setAttribute('role', 'tab');
		// get its heading (if it has one) and hide it
		var heading = tab.querySelectorAll('h2, h3, h4')[0];
		if (heading) {
			heading.classList.add('ui-access');
		}
		// create a list item with the heading's text (or 'tab x'); insert item in tab panel
		var li = document.createElement('li');
		li.innerHTML = heading ? heading.textContent : 'tab ' + (i + 1);
		tabpanel.appendChild(li);
		// then on clicking the item,
		li.addEventListener('click', function() {
			// if clicked item is not marked as current
			if (!this.hasAttribute('aria-current')) {
				// remove 'aria-current' attribute from item marked as current
				tabpanel.querySelector('[aria-current]').removeAttribute('aria-current');
				// add the 'aria-current' attribute to clicked item
				this.setAttribute('aria-current', i);
				// hide any tab which is showing
				if (tablist.querySelector('[aria-selected]')) {
					tablist.querySelector('[aria-selected]').removeAttribute('aria-selected');
				}
				// show tab correspnding to clicked tab panel item
				tablist.children[i].setAttribute('aria-selected', 'true');
			}
		});
		// if the tab has the attribute 'aria-selected',  or
		// if a page anchor in the URL (hash) corresponds to the id of the tab (or one if its descendents),
		// then mark the corresponding tabpanel li as 'current'
		if (tab.hasAttribute('aria-selected') || (targetId && (tab.id === targetId) || document.getElementById(targetId))) {
			li.setAttribute('aria-current', i);
			// if tabpanel (nav group) is the first sibling after the h1, scroll to the top of the page
			if (tabpanel.previousElementSibling.toLowerCase() === 'h1') {
				window.scrollTo(0, 0);
			}
			// show the current tab (needed if targetId rather than 'aria-selected', is being used to show this particular tab):
			tab.setAttribute('aria-selected', 'true');
		} else {
			// otherwise, hide the tab
			tab.removeAttribute('aria-selected');
		}
	});
	// if no tabpanel nav item is marked as current, make the first tabpanel item current, and show the first tab
	if (!tabpanel.querySelector('[aria-current]')) {
		tabpanel.querySelector('li').setAttribute('aria-current', 0);
		tablist.children[0].setAttribute('aria-selected', 'true');
	}
}

// as soon as this js file is loaded, run:
function initTabs() {
	"use strict";
	// if one or more tab lists have been marked by utilities.js for immediate creation of a tab panel, 
	// create and insert the tab panel (above each tab list):
	var initEls = document.querySelectorAll('[data-init=doTabs]');
	if (initEls.length) {
		forEach(initEls, function(el) {
			doTabs(el);
		});
	}
}

initTabs();
