var lastEventLogs = null;

function reloadEventLogs()
{
	Homey.get('systemEventLog', function(err, eventLogs) {

		// handle error
		if (err) {
		    showMessage('error getting systemEventLog', err, 'danger');
			return;
		}

		var systemEventLogContent = document.getElementById('systemEventLogs');
		
		// check if eventLogs is loaded
		if (typeof eventLogs === 'undefined' || eventLogs === null || eventLogs.length === 0) {
			systemEventLogContent.innerText = __('settings.systemEventLog.messages.noEventsYet');
			return;
		}

		// clear log
		systemEventLogContent.innerHTML = '';
		lastEventLogs = eventLogs;
		
		// load log
		for (var i=0; i<eventLogs.length; i++) {
			var eventLog = eventLogs[i];
			var rows = new Array();

			//add date
			var date = new Date(logEntry.time);
			rows.push({
				label: __('settings.systemEventLog.table.datetime'),
				value: date.toString()
			});

			//add event
			rows.push({
				label: __('settings.systemEventLog.table.event'),
				value: __('settings.systemEventLog.eventTypes.s' + logEntry.statusCode)
			});

			//add device
			if (logEntry.deviceId !== null || logEntry.deviceName !== null) {
				rows.push({
					label: __('settings.systemEventLog.table.device'),
					value: (logEntry.deviceName !== null ? logEntry.deviceName : logEntry.deviceId)
				});
			}

			//add tag
			rows.push({
				label: __('settings.systemEventLog.table.tagOrCode'),
				value: logEntry.tagId
			});

			//add user
			if (logEntry.userName !== null) {
				rows.push({
					label: __('settings.systemEventLog.table.person'),
					value: logEntry.userName + ' (' + logEntry.userId + ')'
				});
			}

			systemEventLogContent.appendChild(createTable(rows));
		}
	});
}

function clearEventLog()
{
	Homey.confirm(__('settings.advanced.messages.confirmClearEventLog'), 'warning', function(err, result) {
		if (result === true) {
			document.getElementById('systemEventLogs').innerText = __('settings.loading');
			
			if (lastEventLogs === null) {
				showMessage('', __('settings.advanced.messages.eventLogClearedConfirmation'), 'success');
				previousPage();
			}

			Homey.set('systemEventLog', new Array(), function(err) {
				if (err) {
					showMessage('Error clearing event log', err, 'danger');	
				} else {
					showMessage('', __('settings.advanced.messages.eventLogClearedConfirmation'), 'success');
				}
				
				// Current page is nothing left todo, so close page
				previousPage();
			});
		}
	});

	// Always return false to cancel the bubbling click events.
	return false;
}

// init load event logs
reloadEventLogs();