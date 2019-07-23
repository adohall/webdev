// ### present select options as a drop-down list ###
/*
 * Create a drop-down list with header and insert it in the select's parent (.ui-select)
 * hide the original select,
 * this enables us to apply a styling to the list items that would be ignored by the select options
 * highlight the selected list item,
 * amend the text for the list header (div[data-focus]),
 * enable show and hide of drop-down list
 * and submit the edited form, if form is marked for submit on change.
*/
function doDropdown(selectParent) {
	var select = selectParent.querySelector('select'),
		list,
		listHeader;
	// insert a list with header in the select parent, then hide the select
	selectParent.insertAdjacentHTML('beforeend', '<div data-focus="false">Last Online</div><ul aria-expanded="false" />');
	select.classList.add('d-n');
	// identify list and list header
	list = selectParent.querySelector('ul[aria-expanded]');
	listHeader = selectParent.querySelector('div[data-focus]');
	// for each option, create a list item based on the value of each of the select's options
	forEach(select.querySelectorAll('option'), function (el) {
		selectParent.querySelector('ul').insertAdjacentHTML('beforeend', '<li data-value="' + el.value + '" tabindex="10">' +  el.text + '</li>');
	});
	// for each list item,
	forEach(list.querySelectorAll('li'), function(el) {
		// if the select's value is the same as the list items' value
		if (select.value === el.getAttribute('data-value')) {
			// mark the list item as selected (it will be highlighted via CSS)
			el.setAttribute('data-selected', 'true');
			// show selected list item's text in the list header
			listHeader.textContent = el.textContent;
		}
		// on clicking the list item,
		el.addEventListener('click', function() {
			// remove current highlight and highlight the clicked list item
			selectParent.querySelector('[data-selected]').removeAttribute('data-selected');
			this.setAttribute('data-selected', 'true');
			// reset value of hidden select, and show clicked list item's text in the list header
			select.value = this.getAttribute('data-value');
			listHeader.textContent = this.textContent;
			// close the list immediately, even while user cursor is over the list,
			//	then re-enable list drop down on clicking list header:
			list.style.display = 'none';
			listHeader.setAttribute('data-focus', 'false');
			setTimeout(function () {
				list.removeAttribute('style');
			}, 300);
			// if the select parent is marked for form submission on change, submit ancestor form
			if (selectParent.hasAttribute('data-submitonchange')) {
				closest(selectParent, 'form').submit();
			}
		});
	});
	// enable list drop down on clicking the list header (note need to set context - within select parent)
	showMoreFor(listHeader, selectParent);
}

// as soon as this js file is loaded, run:
function initDropdown() {
	"use strict";
	// if a select's parent has been marked by utilities.js for immediate creation of a drop-down list, create and insert it:
	var initEls = document.querySelectorAll('[data-init=doDropdown]');
	if (initEls.length) {
		forEach(initEls, function(el) {
			doDropdown(el);
		});
	}
}

initDropdown();
