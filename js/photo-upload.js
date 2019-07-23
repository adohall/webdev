function initUploadPhoto() {
	"use strict";

	var lightbox = document.querySelector('[data-url="photo-from-computer-facebook"]'),
		fromComputer = lightbox.querySelector('a[href*=upload-from-computer]'),
		origImgWidth, origImgHeight, dragDropZone, dragDropLightbox, fileSelect, fileInfo,
		uploadingMsg = 'Uploading image, please wait...',
		photoSizeLimit = 10 * 1024 * 1024,
		fbPicNum = lightbox.querySelector('#facebook-form').querySelector('[name=picNum]'),
		uploadType = lightbox.getAttribute('data-upload-type');

	if (uploadType === 'primary') {
		fbPicNum.setAttribute('value', '1');
	}

	// fade out the first lightbox (leaving the mask), then show the drag/drop lightbox
	fromComputer.addEventListener('click', function () {
		var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

		fade(lightbox);
		lightbox.remove();

		document.querySelector('a[href*=upload-from-computer]').click();
		dragDropLightbox = document.querySelector('[data-url=upload-from-computer]');
		dragDropZone = dragDropLightbox.querySelector('#upload-media-form');
		fileSelect = dragDropLightbox.querySelector('#upfile');
		dragDropLightbox.setAttribute('data-upload-type', uploadType);

		// we don't want to submit the image form until after we've validated the image (check file type, size in MB and dimensions)
		// the following "onchange" allows the function handleDroppedFile to run when user clicks "browse" to select an image instead of dragging/dropping
		fileSelect.onchange = function (e) {
			handleDroppedFile(e);
		};

		if (!is_ie) { dragDropZone.addEventListener('click', handleDropZoneClick, false); }

		fileInfo = dragDropLightbox.querySelector('div.ui-fileinfo');
		
		if (isFirefox) {
			fileInfo.classList.add('g', 'st');
			fileInfo.textContent = 'Choose File';
		} else if (is_ie) {
			dragDropZone.classList.remove('cr-p');
			fileInfo.classList.add('h0');
			fileSelect.parentNode.classList.remove('h0');
		} else {
			dragDropZone.addEventListener('dragover', handleDragOver, false);
			dragDropZone.addEventListener('dragleave', handleDragLeave, false);
			dragDropZone.addEventListener('drop', handleDroppedFile, false);
		}

		// set picNum value to 1 when 'add primary photo' is clicked
		if (uploadType === 'primary') {
			var picNum = dragDropZone.querySelector('[name=picNum]');
			picNum.setAttribute('value', '1');
		}
	});

	// enable drag and drop of profile image
	function handleDroppedFile(e) {
		e.stopPropagation();
		e.preventDefault();
		// identify the FileList object, i.e. the file(s) that was (were) dropped or chosen
		var files = e.type === 'drop' ? e.dataTransfer.files : e.target.files,
			isTooSmall = false;

		dragDropLightbox = document.querySelector('[data-url=upload-from-computer]');
		fileInfo = dragDropLightbox.querySelector('div.ui-fileinfo');
		dragDropZone.setAttribute('aria-dropactive', 'false');
		fileInfo.textContent = uploadingMsg;
		// force user to try again if more than 1 image was dropped
		if (files.length > 1) {
			fileInfo.textContent = 'Only 1 file is allowed. \r\n\r\n Please try again.';
			return;
		} else if (files.length === 1 && files[0].size >= photoSizeLimit) {
			fileInfo.textContent = 'This image exceeds our 10MB file size limit. \r\n\r\n File size must be less than 10MB \r\n and larger than 470 x 470 pixels. \r\n\r\n Please try again using a smaller image.';
			return;
		}
		// check that the file dropped or chosen is an image
		// note - we don't really need the loop since only 1 file is allowed (see above),
		//			however, loop has been left in case the alert (and condition) above is removed;
		var photo = null;
		for (var i = 0, y = files.length; i < y; i++) {
			if (files[i].type.match('image.*')) {
				photo = files[i];
				break;
			}
		}
		// set a flag for acceptable image size, and define acceptable file formats
		var isToosmall = false,
			acceptedFormat = ['.jpg', '.jpeg', '.gif', '.png', '.bmp'];

		// check the file is an acceptable format
		function hasExtension(exts) {
			var theFile = files[0],
				fileName = theFile.name;
		    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName.toLowerCase());
		}

		// if the file is not an accepted format show the "minimum photo requirements" message
		if (!hasExtension(acceptedFormat)) {
			fileInfo.textContent = 'Image format must be in JPG, PNG, GIF or BMP. \r\n\r\n Image size must be less than 10MB \r\n and larger than 470 x 470 pixels. \r\n\r\n Please try again.'
		} else if (photo !== null) {
			// if there is at least 1 image dropped or chosen, and it's in the required format update file info
			var reader = new FileReader(),
				urlCreator = window.URL || window.webkitURL,
				imgSrc = urlCreator.createObjectURL(files[0]),
				imgSelected = document.createElement('img');

			reader.readAsDataURL(photo);
			imgSelected.setAttribute('src', imgSrc);
			imgSelected.setAttribute('class', 'd-n');
			dragDropZone.setAttribute('aria-dropactive', 'false');

			// if there's already an image in drop zone, remove it:
			var prevImg = dragDropZone.querySelector('img');
			if (prevImg) {
				dragDropZone.removeChild(prevImg);
			}
			// add the image (which is hidden) to the lightbox so we can get it's natural width and height
			dragDropZone.appendChild(imgSelected);

			imgSelected.onload = function () {
				// now that img src is set, we can get it's natural width and height
				origImgWidth = imgSelected.naturalWidth;
				origImgHeight = imgSelected.naturalHeight;

				// if imgSelected is too small, advise user and remove image
				if (origImgWidth && origImgHeight && origImgWidth < 470 || origImgHeight < 470) {
					fileInfo.textContent = 'Selected photo is less then 470x470 pixels. \r\n\r\n File size must be less than 10MB \r\n and larger than 470 x 470 pixels. \r\n\r\n Please try again with a larger image.';
					isTooSmall = true;
				} else {
					// let the user know the image is being uploaded
					fileInfo.textContent = uploadingMsg;

					// and submit the image
					dragDropZone.submit();
				}
			};
			// and set the files property of the file input to the dropped image
			if (e.type === 'drop' && !isToosmall) {
				fileSelect.files = files;
			}
		}
	}

	// on mousing over the ui-dropzone, show that the dragged image is a copy, via the copy (add) cursor
	// note: we also change ui-dropzone's dashed border to solid with css (aria-dropactive=true in _photo.scss)
	function handleDragOver(e) {
		dragDropZone.setAttribute('aria-dropactive', 'true');
		e.preventDefault();
		e.dataTransfer.effectAllowed = 'copy';
		e.dataTransfer.dropEffect = 'copy';
	}

	// remove the aria-dropactive attribute which changes ui-dropzone's border from solid back to dashed (is solid when dragging over ui-dropzone, otherwise dashed)
	function handleDragLeave() {
		dragDropZone.setAttribute('aria-dropactive', 'false');
	}

	// launch the file search dialog box when user clicks ui-dropzone
	function handleDropZoneClick() {
		fileSelect.click();
	}
	addPhotoFromFacebook();
}

function addPhotoFromFacebook() {
	if (fbAppId && $('[data-url=photo-from-computer-facebook] #fb-root').length) {
		$.getScript("https://connect.facebook.net/en_US/sdk.js", function () {

			if (typeof FB !== 'undefined') {
				FB.init({
					appId: fbAppId,
					status: true,
					cookie: true,
					version: facebookGraphApiVersion
				});

				var fbDiv = $('[data-url=photo-from-computer-facebook] #fb-root'),
					fForm = $(fbDiv).next('form');

				// identify 'import' button; then enable photo import from Facebook
				facebook.connect = $('[data-url=photo-from-computer-facebook] span[data-source=facebook]');

				facebook.connect.click(function() {

					$(this).attr('disabled', true);
					FB.login(function(response) {
						if (response.authResponse) {
							FB.getLoginStatus(function(response) {
								if (response.status === 'connected') {
									fForm.submit();
								}
							});
						} else {
							$(facebook.connect).removeAttr('disabled');
						}
					}, {scope: fbPermissions, auth_type: 'rerequest'});
					return false;
				});

				//show the facebook connect button in the lightbox
				fForm.removeClass('fb-disable');
			}
		});
	}
}

initUploadPhoto();
