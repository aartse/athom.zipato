(function(app, args) {

	//load user data for editing
	var currentUser = null;
	if (typeof args !== 'undefined' && typeof args.user !== 'undefined') {
		currentUser = args.user;
	}

	//fill form for editing user
	if (currentUser !== null) {
		document.getElementById('name').value = currentUser.name;

		//init delete button
		document.getElementById('deleteButton').style.display = '';
		document.getElementById('deleteButton').onclick = function() {
			Homey.confirm(__('settings.users.messages.confirmDeteleUser'), 'warning', function(err, result) {
				if (err === true || result === true) {
					removeUser();
				}
			});
		};
	}

	//bind save event
	document.getElementById('saveButton').onclick = function() {
		saveUser();
	}

	/**
	 * remove current user
	 */
	function removeUser()
	{
		if (currentUser !== null) {
			app.homey.get('userContainer', function(err, users) {

				//update user container
				var userContainer = new Array();
				if (!(typeof users === 'undefined' || users === null || users.length === 0)) {
					for (var i=0; i<users.length; i++) {
						if (users[i].id != currentUser.id) {
							userContainer.push(users[i]);
						}
					}
				}

				//save new user container, close window
				app.homey.set('userContainer', userContainer);
				app.message.show('', __('settings.advanced.messages.userDeleted'), 'success');
				app.page.close();
			});
			return;
		}
		app.page.close();
	}

	/**
	 * add or edit current user
	 */
	function saveUser()
	{
		app.homey.get('userContainer', function(err, users) {

			//create new user object
			var user = currentUser || {id: null, statusCode:-1};
			user.name = document.getElementById('name').value;
			user.tagIds = new Array();

			//update existing user container
			var maxUserId = 0;
			var userContainer = new Array();
			if (!(typeof users === 'undefined' || users === null || users.length === 0)) {
				for (var i=0; i<users.length; i++) {
					if (user.id !== null && user.id === users[i].id) {
						userContainer.push(user);
					} else {
						userContainer.push(users[i]);
					}

					if (users[i].id > maxUserId) {
						maxUserId = users[i].id;
					}
				}
			}

			//add new user
			if (user.id === null) {
				user.id = maxUserId+1;
				userContainer.push(user);
			}

			//save new user container, close window
			app.homey.set('userContainer', userContainer);
			app.message.show('', __('settings.advanced.messages.usersSavedConfirmation'), 'success');
			app.page.close();
		});
	}

	return {};
});