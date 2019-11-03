(function(app) {

	/**
	 * reload event logs
	 */
	function loadEventLogs()
	{
		var eventLogs = app.logRepository.getAllLogs();

		var systemEventLogContent = document.getElementById('systemEventLogs');
		
		// check if eventLogs is loaded
		if (eventLogs.length === 0) {
			systemEventLogContent.innerText = __('settings.rfid.messages.noEventsYet');
			return;
		}

		// clear log
		systemEventLogContent.innerHTML = '';
		
		// load log in reverse order
		for (var i=eventLogs.length-1; i>=0; i--) {
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
			if (eventLog.deviceId !== null) {
				rows.push({
					label: __('settings.systemEventLog.table.device'),
					value: eventLog.deviceId
				});
			}

			//add tag
			if (eventLog.tagId !== null) {
				rows.push({
					label: __('settings.systemEventLog.table.tagOrCode'),
					value: eventLog.tagId
				});
			}
			
			//add users
			if (eventLog.userName !== null && eventLog.userName !== '') {
				rows.push({
					label: __('settings.systemEventLog.table.person'),
					value: eventLog.userName
				});
			}

			systemEventLogContent.appendChild(app.ui.createTable(rows));
		}
	}

	/**
	 * clear current event log
	 */
	function clearEventLog()
	{
		app.message.confirm(__('settings.rfid.messages.confirmClearEventLog'), 'warning', function(err, result) {
			if (result === true) {

				// reset systemEventLog
				document.getElementById('systemEventLogs').innerText = __('settings.loading');
				app.logRepository.clearLogs();
				loadEventLogs();
				app.message.show('', __('settings.rfid.messages.eventLogClearedConfirmation'), 'success');
			}
		});

		// Always return false to cancel the bubbling click events.
		return false;
	}

	function onRepositoryLoaded(name) {
		if (name == 'systemEventLog') {
			loadEventLogs();
		}
	}

	// bind global events
	app.event.on('repository.loaded', onRepositoryLoaded);

	//bind events
	document.getElementById('btnClearEventLog').onclick = function() {
		clearEventLog();
		return false;
	}	

	// init load event logs
	loadEventLogs();

	return {
		destroy: function() {
			app.event.off('repository.loaded', onRepositoryLoaded);
		}		
	}
});