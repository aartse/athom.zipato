(function(app) {

	/**
	 * reload tags
	 */
	function loadTags()
	{
		// get users
		var tags = app.tagRepository.getAllTags();

		var systemTagsContent = document.getElementById('systemTags');

		if(tags.length === 0) {
			systemTagsContent.innerText = __('settings.rfid.messages.noTagsYet');
			return;
		}
		
		systemTagsContent.innerHTML = '';
		for (var i=0; i<tags.length; i++)
		{
			var tag = tags[i];

			var rows = new Array();

			//add id
			rows.push({
				label: __('settings.rfid.labels.tagId'),
				value: tag.id
			});

			//add name
			rows.push({
				label: __('settings.rfid.labels.tagName'),
				value: tag.name
			});

			//add edit button
			var editButton = document.createElement("button");
			editButton.className = 'hy-nostyle full-width';
			editButton.innerText = __('settings.rfid.buttons.editTag');
			editButton.tag = tag;
			editButton.onclick = function() {
				app.page.open('rfid/tag.html', 'rfid/js/tag.js', {tag: this.tag});
			}

			systemTagsContent.appendChild(app.ui.createTable(rows, {editButton: editButton}));
		}
	}

	/**
	 * reload tag status
	 */
	function loadTagStatus()
	{
		if(app.tagstatusRepository.getTagStatus()) {
			document.getElementById('currentTagStatus').innerHTML = __('settings.rfid.descriptions.allowTags');
		} else {
			document.getElementById('currentTagStatus').innerHTML = __('settings.rfid.descriptions.denyTags');
		}
	}

	function onRepositoryLoaded(name) {
		if (name == 'tagContainer') {
			loadTags();
		}

		if (name == 'tagStatus') {
			app.message.show('', __('settings.rfid.messages.toggleTagStatusConfirmed'), 'success');
			loadTagStatus();
		}
	}

	//toggle tag status button
	document.getElementById('btnToggleStatus').onclick = function() {
		app.tagstatusRepository.toggleTagStatus();

		//when tags adding is allowed, set system armed to false in case of repairing the reader in system armed state
		if (app.tagstatusRepository.getTagStatus()) {
			app.systemarmedRepository.setSystemArmed(false);
		}
		return false;
	}	

	// bind global events
	app.event.on('repository.loaded', onRepositoryLoaded);

	//init
	loadTagStatus();
	loadTags();

	return {
		destroy: function() {
			app.event.off('repository.loaded', onRepositoryLoaded);
		}
	}
});