(function(app) {
	var tagStatus = null;

	/**
	 * reload tags
	 */
	function loadTags()
	{
		app.homey.get('tagContainer', function(err, tags)
		{
			if(err) {
				app.message.show('error getting tagContainer', err, 'danger');
				return;
			}

			var systemTagsContent = document.getElementById('systemTags');

			if(typeof tags === 'undefined' || tags === null || tags.length === 0) {
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
					value: tag.tagId
				});
	/*
				//add last updated
				var date = new Date(device.lastUpdate);
				rows.push({
					label: __('settings.devices.table.lastUpdated'),
					value: date.toString()
				});
	*/
				systemTagsContent.appendChild(app.createTable(rows));
			}
		});
	}

	/**
	 * reload devices
	 */
	function loadDevices()
	{
		app.homey.get('tagReaders', function(err, devices)
		{
			if(err) {
				showMessage('error getting tagReaders', err, 'danger');
				return;
			}

			var systemDevicesContent = document.getElementById('systemDevices');
			
			if(typeof devices === 'undefined' || devices === null || devices.length === 0) {
				systemDevicesContent.innerText = __('settings.rfid.messages.noReaders');
				return;
			}

			systemDevicesContent.innerHTML = '';
			for (var i=0; i<devices.length; i++)
			{
				var device = devices[i];
				var rows = new Array();

				//add id
				rows.push({
					label: __('settings.devices.table.deviceId'),
					value: device.id
				});

				//add last updated
				var date = new Date(device.lastUpdate);
				rows.push({
					label: __('settings.devices.table.lastUpdated'),
					value: date.toString()
				});

				systemDevicesContent.appendChild(app.createTable(rows));
			}
		});
	}

	/**
	 * reload tag status
	 */
	function loadTagStatus()
	{
		app.homey.get('tagStatus', function(err, status)
		{
			if(err) {
				app.message.show('error getting tagStatus', err, 'danger');
				return
			}

			// save status
			tagStatus = (status === true);
			if(tagStatus === true) {
				document.getElementById('currentTagStatus').innerHTML = __('settings.rfid.descriptions.allowTags');
			} else {
				document.getElementById('currentTagStatus').innerHTML = __('settings.rfid.descriptions.denyTags');
			}
		});
	}

	/**
	 * clear tags
	 */
	function clearTags()
	{
		app.homey.confirm(__('settings.rfid.messages.confirmClearTags'), 'warning', function(err, result) {
			if (result === true) {
				app.homey.set('tagContainer', new Array());
				app.message.show('', __('settings.rfid.messages.tagsClearedConfirmation'), 'success');
			}
		});
	}

	/**
	 * toggle current tag status
	 */
	function toggleTagStatus()
	{
		app.homey.set('tagStatus', (tagStatus === false));
	}

	/**
	 * handle settings save for this page
	 */
	function onSettingsSet(name)
	{
		if (name === 'tagContainer') {
			loadTags();
		}

		if (name === 'tagStatus') {
			app.message.show('', __('settings.rfid.messages.toggleTagStatusConfirmed'), 'success');
			loadTagStatus();
		}
	}

	//bind events
	document.getElementById('btnClearTags').onclick = function() {
		clearTags();
		return false;
	}

	//bind events
	document.getElementById('btnToggleStatus').onclick = function() {
		toggleTagStatus();
		return false;
	}	

	//bind global events
	app.on('settings.set', onSettingsSet);

	//init
	loadDevices();
	loadTagStatus();
	loadTags();

	return {
		destroy: function() {
			app.off('settings.set', onSettingsSet);
		}
	}
});