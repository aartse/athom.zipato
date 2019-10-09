(function(app) {

	/**
	 * init users
	 */
	function loadUsers()
	{
		app.homey.get('userContainer', function(err, users) {

			// handle error
			if (err) {
			    app.message.show('error getting userContainer', err, 'danger');
				return;
			}

			var userList = document.getElementById('userList');
			
			// check if users is loaded
			if (typeof users === 'undefined' || users === null || users.length === 0) {
				userList.innerText = __('settings.rfid.messages.noUserssYet');
				return;
			}

			// clear log
			userList.innerHTML = '';

			// load log
			for (var i=0; i<users.length; i++) {
				var user = users[i];
				var rows = new Array();

				//add name
				rows.push({
					label: __('settings.systemEventLog.table.person'),
					value: __(user.name)
				});

				//add status
				rows.push({
					label: __('settings.users.table.status'),
					value: __('settings.systemEventLog.eventTypes.s' + user.statusCode)
				});

				userList.appendChild(app.createTable(rows));
			}
		});
	}

	// init load users
	loadUsers();

	return {};
});