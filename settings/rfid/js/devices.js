var tagStatus = null;

function loadTags()
{
	Homey.get('tagContainer', function(err, tags)
	{
		if(err) {
			showMessage('error getting tagContainer', err, 'danger');
			return;
		}

		var systemTagsContent = document.getElementById('systemTags');

		if(typeof tags === 'undefined' || tags === null || tags) {
			systemTagsContent.innerText = __('settings.rfid.messages.noTags');
			return;
		}
		
		systemTagsContent.innerHTML = '';
		for (var i=0; i<tags.length; i++)
		{
			var tag = tags[i];
			console.log(tag);

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
			systemTagsContent.appendChild(createTable(rows));
		}
	});
}

function loadDevices()
{
	Homey.get('tagReaders', function(err, devices)
	{
		if(err) {
			showMessage('error getting tagReaders', err, 'danger');
			return;
		}

		var systemDevicesContent = document.getElementById('systemDevices');
		
		if(typeof devices === 'undefined' || devices === null || devices.length == 0) {
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

			systemDevicesContent.appendChild(createTable(rows));
		}
	});
}

function loadTagStatus()
{
	Homey.get('tagStatus', function(err, status)
	{
		if(err) {
			showMessage('error getting tagStatus', err, 'danger');
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
	Homey.confirm(__('settings.rfid.messages.confirmClearTags'), 'warning', function(err, result) {
		if (result === true) {
			Homey.set('tagContainer', new Array());
			showMessage('', __('settings.rfid.messages.tagsClearedConfirmation'), 'success');
		}
	});
	
	// Always return false to cancel the bubbling click events.
	return false;
}

/**
 * toggle current tag status
 */
function toggleTagStatus()
{
	Homey.set('tagStatus', (tagStatus === false), function() {
		showMessage('', __('settings.rfid.messages.toggleTagStatusConfirmed'), 'success');
		loadTagStatus();
	});
}

loadDevices();
loadTagStatus();
loadTags();