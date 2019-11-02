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
			systemTagsContent.innerText = __('settings.rfid.messages.noTags');
			return;
		}
		
		systemTagsContent.innerHTML = '';
		for (var i=0; i<tags.length; i++)
		{
			var tag = tags[i];

			var rows = new Array();

			//add id
			rows.push({
				label: __('settings.devices.table.deviceId'),
				value: tag.id
			});

			//add id
			rows.push({
				label: __('settings.devices.table.name'),
				value: tag.name
			});
/*
			//add last updated
			var date = new Date(device.lastUpdate);
			rows.push({
				label: __('settings.devices.table.lastUpdated'),
				value: date.toString()
			});
*/

			//add edit button
			var editButton = document.createElement("button");
			editButton.className = 'hy-nostyle full-width';
			editButton.innerText = __('settings.tags.table.edit');
			editButton.tag = tag;
			editButton.onclick = function() {
				app.page.open('rfid/tag.html', 'rfid/js/tag.js', {tag: this.tag});
			}

			systemTagsContent.appendChild(app.ui.createTable(rows, {editButton: editButton}));
		}
	}

	/**
	 * reload devices
	 */
	function loadDevices()
	{
		// get devices
		var devices = app.tagreaderRepository.getAllTagreaders();

		var systemDevicesContent = document.getElementById('systemDevices');
		
		if (devices.length === 0) {
			systemDevicesContent.innerText = __('settings.rfid.messages.noReaders');
			return;
		}

		systemDevicesContent.innerHTML = '';
		for (var i=0; i<devices.length; i++) {
			var device = devices[i];
			var rows = new Array();

			//add id
			rows.push({
				label: __('settings.devices.table.deviceId'),
				value: device.id
			});

			//add id
			rows.push({
				label: __('settings.devices.table.status'),
				value: device.state
			});

			//add last updated
			var date = new Date(device.lastUpdate);
			rows.push({
				label: __('settings.devices.table.lastUpdated'),
				value: date.toString()
			});

			systemDevicesContent.appendChild(app.ui.createTable(rows));
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
		return false;
	}	

	// bind global events
	app.event.on('repository.loaded', onRepositoryLoaded);

	//init
	loadDevices();
	loadTagStatus();
	loadTags();

	return {
		destroy: function() {
			app.event.off('repository.loaded', onRepositoryLoaded);
		}
	}
});