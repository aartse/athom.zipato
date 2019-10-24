(function(app) {

	/**
	 * init users
	 */
	function loadUsers()
	{
		var users = app.userRepository.findAll();

		// check if users is loaded
		if (users.length === 0) {
			document.getElementById('userList').innerText = __('settings.rfid.messages.noUserssYet');
			return;
		}

		// clear users
		document.getElementById('userList').innerHTML = '';

		// load users
		for (var i=0; i<users.length; i++) {
			var user = users[i];
			var rows = new Array();

			var tagNames = new Array();
			for (var i2=0; i2<tags.length; i2++) {
				
			}

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

			document.getElementById('userList').appendChild(app.createTable(rows, {editButton: editButton}));
		}
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
	app.event.on('settings.set', onSettingsSet);

	// init load users
	loadUsers();

	return {
		destroy: function() {
			app.event.off('settings.set', onSettingsSet);
		}
	};
});