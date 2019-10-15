(function(app) {

	/**
	 * reload event logs
	 */
	function loadEventLogs()
	{
		app.homey.get('systemEventLog', function(err, eventLogs) {

			// handle error
			if (err) {
			    app.message.show('error getting systemEventLog', err, 'danger');
				return;
			}

			var systemEventLogContent = document.getElementById('systemEventLogs');
			
			// check if eventLogs is loaded
			if (typeof eventLogs === 'undefined' || eventLogs === null || eventLogs.length === 0) {
				systemEventLogContent.innerText = __('settings.rfid.messages.noEventsYet');
				return;
			}

			// clear log
			systemEventLogContent.innerHTML = '';
			
			// load log in reverse order
			for (var i=eventLogs.length-1; i>0; i--) {
				var eventLog = eventLogs[i];
				var rows = new Array();

				//add date
				var date = new Date(eventLog.time);
				rows.push({
					label: __('settings.systemEventLog.table.datetime'),
					value: date.toString()
				});

				//add event
				rows.push({
					label: __('settings.systemEventLog.table.event'),
					value: __('settings.systemEventLog.eventTypes.s' + eventLog.statusCode)
				});

				//add device
				if (eventLog.deviceId !== null || eventLog.deviceName !== null) {
					rows.push({
						label: __('settings.systemEventLog.table.device'),
						value: (eventLog.deviceName !== null ? eventLog.deviceName : eventLog.deviceId)
					});
				}

				//add tag
				rows.push({
					label: __('settings.systemEventLog.table.tagOrCode'),
					value: eventLog.tagId
				});

				//add users
				//@TODO: what about multiple users?
				if (eventLog.userName !== null && eventLog.userName !== '') {
					rows.push({
						label: __('settings.systemEventLog.table.person'),
						value: eventLog.userName
					});
				}

				systemEventLogContent.appendChild(createTable(rows));
			}
		});
	}

	/**
	 * clear current event log
	 */
	function clearEventLog()
	{
		app.homey.confirm(__('settings.rfid.messages.confirmClearEventLog'), 'warning', function(err, result) {
			if (result === true) {

				// reset logs
				document.getElementById('systemEventLogs').innerText = __('settings.loading');
				
				// reset systemEventLog
				app.homey.set('systemEventLog', new Array());
				app.message.show('', __('settings.rfid.messages.eventLogClearedConfirmation'), 'success');

				// Current page is nothing left todo, so close page and load previous page
				app.page.close();
			}
		});

		// Always return false to cancel the bubbling click events.
		return false;
	}

	/**
	 * handle settings save for this page
	 */
	function onSettingsSet(name)
	{
		if (name === 'systemEventLog') {
			loadEventLogs();
		}
	}

	//bind global events
	app.on('settings.set', onSettingsSet);

	//bind events
	document.getElementById('btnClearEventLog').onclick = function() {
		clearEventLog();
		return false;
	}	

	// init load event logs
	loadEventLogs();

	return {
		destroy: function() {
			app.off('settings.set', onSettingsSet);
		}		
	}
});