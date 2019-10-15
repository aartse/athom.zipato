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
					value: user.name
				});

				//add status
				rows.push({
					label: __('settings.users.table.status'),
					value: __('settings.systemEventLog.eventTypes.s' + user.statusCode)
				});

				//add status
				rows.push({
					label: __('settings.users.table.tags'),
					value: user.tagIds.join(',')
				});

				//add edit button
				var editButton = document.createElement("button");
				editButton.className = 'hy-nostyle full-width';
				editButton.innerText = __('settings.users.table.edit');
				editButton.user = user;
				editButton.onclick = function() {
					app.page.open('rfid/user.html', 'rfid/js/user.js', {user: this.user});
				}

				userList.appendChild(app.createTable(rows, {editButton: editButton}));
			}
		});
	}

	/**
	 * handle settings save for this page
	 */
	function onSettingsSet(name)
	{
		if (name === 'userContainer') {
			loadUsers();
		}
	}

	//bind global events
	app.on('settings.set', onSettingsSet);

	// init load users
	loadUsers();

	return {
		destroy: function() {
			app.off('settings.set', onSettingsSet);
		}
	};
});