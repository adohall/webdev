// ### EMOTICONS ###
// allow emoticon ascii code to be inserted in a textarea when the user clicks on an image of the corresponding emoticon
// set the caret position in the textarea after the emoticon ascii code

// ### steps
// 1. wrap the specified textarea in a div
// 2. insert a launcher in the textarea wrapper
// 3. create html for all the emoticon images (with alt tags containing corresponding ascii code)
// 4. create a tooltip containing those images, via doToolTipFor(launcher, imgHtml)
// 5. on blur from the textarea, record the caret (text cursor) position in the textarea via a data- attribute
// 6. when user clicks an emoticon image, insert the emoticon ascii code at the recorded caret position
// 7. get the number of characters in the inserted emoticon ascii code
// 8. add the character num to the recorded caret position to get the new caret position
// 9. move the caret to the new caret position

var emojis = {
	Happy: [":-)", ":)", ":o)", "=]", "=)"],
	Sad: [":-(", "=(", ":[", ":'(", ":("],
	Wink: [";-)", ";)", ";]", "*)"],
	Cheeky: [":D", ":P", ":p" ],
	Cool: [":cool:", "8)", "8-)"],
	Laugh: [":laughing:"],
	Silly: [":silly:"],
	Love: [":love:"],
	NotTalking: [":nottalking:"],
	Nerd: [":nerd:"],
	Crying: ["+o("],
	Party: [":*party*:"],
	Angel: [":angel:"],
	Angry: [":angry:"],
	Shy: [":shy:"],
	Shush: [":shush:"],
	Loser: [":loser:"],
	Straightface: [":straightface:"],
	Vomit: [":vomit:"],
	Hug: [":hug:"],
	Lightbulb: [":lightbulb:"],
	Yawn: [":yawn:"],
	Sleep: [":sleep:", "l-)", "(S)"],
	Bye: [":bye:"],
	Heart: [":heart:"],
	BrokenHeart: [":brokenheart:"],
	Kiss: [":-*", "(K)"],
	Rose: ["(F)"],
	Cocktail: ["(D)", "(B)"]
};

// ### adapted from poller.js & editEmailFragment.js - modified here to use existing code which creates and positions a popup
// Note 1 - this is a leaner version of doEmoticonsFor(), which is called in chat bar and in contact history
// Note 2 - getCursorPosition() is no longer needed; we can just use el.selectionStart & el.setSelectionRange() with IE9+

function doEmoticons(textarea) {
	// 1. wrap the specified textarea in a div
	var wrapper = document.createElement('div');
	textarea.parentNode.insertBefore(wrapper, textarea);
	wrapper.className = 'ui-textarea EM';
	wrapper.appendChild(textarea);
	// 2. insert a launcher in the textarea wrapper; with basic styling & paired to emoticon tooltip
	var launcher = document.createElement('span');
	launcher.className = 'svg-aft smiley cr-p d-ib p-a';
	launcher.setAttribute('data-for', 'emoticons');
	wrapper.appendChild(launcher);
	// if emoticon tooltip doesn't exist yet, create it;
	if (!document.getElementById('emoticons')) {
		// 3. create html for all the emoticon images (with alt tags containing corresponding ascii code)
		var imgHtml = '';
		for (var item in emojis) {
			imgHtml += '<img src="images/emoticons-new20x20/' + item + '20x20px.png" alt="' + emojis[item][0] + '" />';
		}
		// 4a. insert emoticon images in a tooltip; style it & append to page
		var tooltip = document.createElement('span');
		tooltip.innerHTML = imgHtml;
		tooltip.className = 'box bg-w b-1-b';
		document.body.appendChild(tooltip);
		// enable tooltip to be shown on click (not mouseover), and to be closed on clicking outside:
		tooltip.setAttribute('data-popup', 'true');
		tooltip.classList.add('js-tip');
		// 4b. set id, to pair tooltip with launcher
		tooltip.id = 'emoticons';
	}
	// 4c. show/hide & position emoticon tooltip on clicking launcher
	doToolTipFor(launcher);
	// 5. on blur from the textarea, record the caret (text cursor) position in the textarea via a data- attribute
	//		note - 'blur' event fires each time user clicks the launcher; record caret pos initially as 0
	textarea.setAttribute('data-caretpos', '0');
	textarea.addEventListener('blur', function() {
		this.setAttribute('data-caretpos', this.selectionStart);
	});
	// 6. when user clicks an emoticon image, insert the corresponding emoticon ascii code at the recorded caret position
	forEach(document.querySelectorAll('#emoticons > img'), function (el, i) {
		el.addEventListener('click', function () {
			// 7 & 8. get the new caret pos; = current caret pos + number of characters in the emoticon ascii code
			var currCaretPos = parseInt(textarea.getAttribute('data-caretpos')),
				newText = el.getAttribute('alt'),
				// if text already entered, we need space either side of emoticon ascii code; otherwise - just space after
				newCaretPos = (currCaretPos === 0) ? newText.length + 1 : currCaretPos + newText.length + 2;
			// if text already entered, combine text before caret plus emoticon ascii code, with space either side, (plus text after caret):
			if (textarea.value.trim() !== '') {
				newText = textarea.value.slice(0, currCaretPos) + ' ' + newText + ' ' + textarea.value.slice(currCaretPos);
			}
			// replace existing content with existing content plus emoticon ascii code:
			textarea.value = newText;
			// 9. move caret to new caret position (directly after emoticon ascii code)
			textarea.focus();
			textarea.setSelectionRange(newCaretPos, newCaretPos);
			// close emoticon tooltip as soon as user mouses out of tooltip
			el.parentNode.style.display = 'none';
		});
	});
}

// as soon as this js file is loaded, run:
function initEmoticons() {
	"use strict";
	// if a textarea has been marked by utilities.js for immediate enabling of emoticons, enable emoticons for it:
	var initEl = document.querySelector('[data-init=doEmoticons]');
	if (initEl) {
		doEmoticons(initEl);
	}
}

initEmoticons();
