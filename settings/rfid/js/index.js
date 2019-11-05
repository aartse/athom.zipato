(function(app) {

	/**
	 * init users
	 */
	function loadUsers()
	{
		// get users
		var users = app.userRepository.getAllUsers();

		// check if users is loaded
		if (users.length === 0) {
			document.getElementById('userList').innerText = __('settings.rfid.messages.noUsersYet');
			return;
		}

		// clear previous users
		document.getElementById('userList').innerHTML = '';

		// load users
		for (var i=0; i<users.length; i++) {
			var user = users[i];
			var rows = new Array();

			//add name
			rows.push({
				label: __('settings.rfid.labels.userName'),
				value: user.name
			});

			//add status
			rows.push({
				label: __('settings.rfid.labels.status'),
				value: __('settings.rfid.statusCodes.s' + user.statusCode)
			});

			//add status
			rows.push({
				label: __('settings.rfid.labels.tags'),
				value: app.tagRepository.getTagNames(user.tagIds).join(', ')
			});

			//add edit button
			var editButton = document.createElement("button");
			editButton.className = 'hy-nostyle full-width';
			editButton.innerText = __('settings.rfid.buttons.editUser');
			editButton.user = user;
			editButton.onclick = function() {
				app.page.open('rfid/user.html', 'rfid/js/user.js', {user: this.user});
			}

			document.getElementById('userList').appendChild(app.ui.createTable(rows, {editButton: editButton}));
		}
	}

	function onRepositoryLoaded(name) {
		if (name == 'userContainer' || name == 'tagContainer') {
			loadUsers();
		}
	}

	// bind global events
	app.event.on('repository.loaded', onRepositoryLoaded);

	document.getElementById('addUserButton').onclick = function() {
		app.page.open('rfid/user.html', 'rfid/js/user.js');
	};

	document.getElementById('tagsButton').onclick = function() {
		app.page.open('rfid/tags.html', 'rfid/js/tags.js');
	};

	document.getElementById('logsButton').onclick = function() {
		app.page.open('rfid/logs.html', 'rfid/js/logs.js');
	};

	// init load users
	loadUsers();

	return {
		destroy: function() {
			app.event.off('repository.loaded', onRepositoryLoaded);
		}
	};
});