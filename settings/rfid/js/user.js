(function(app, args) {

	//load user data for editing
	var currentUser = {};
	if (typeof args !== 'undefined' && typeof args.user !== 'undefined') {
		currentUser = args.user;
	}

	//load initial data for (new)user
	if (typeof currentUser.id === 'undefined') {
		currentUser.id = null;
	}

	//load initial data for (new)user
	if (typeof currentUser.name === 'undefined') {
		currentUser.name = null;
	}

	//load initial data for (new)user
	if (typeof currentUser.statusCode === 'undefined') {
		currentUser.statusCode = -1;
	}

	//load initial data for (new)user
	if (typeof currentUser.tagIds === 'undefined') {
		currentUser.tagIds = new Array();
	}

	//fill form for editing user
	document.getElementById('name').value = currentUser.name;

	//load tags
	var checklistItems = new Array();
	app.homey.get('tagContainer', function(err, tags) {

		// handle when no tags are found
		if(typeof tags === 'undefined' || tags === null || tags.length === 0) {
			document.getElementById('tagIds').innerHTML = __('settings.rfid.messages.noTags');
			return;
		}

		// convert tags to checklistItems
		for (var i=0; i<tags.length; i++) {
			checklistItems.push({
				id: tags[i].tagId,
				label: tags[i].tagId,
				checked: (currentUser.tagIds.indexOf(tags[i].tagId) !== -1)
			});
		}

		document.getElementById('tagIds').innerHTML = '';
		document.getElementById('tagIds').appendChild(app.createChecklist('tagIds', checklistItems));
	});

	if (currentUser.id !== null) {
		//init delete button
		document.getElementById('deleteButton').style.display = '';
		document.getElementById('deleteButton').onclick = function() {
			app.homey.confirm(__('settings.users.messages.confirmDeteleUser'), 'warning', function(err, result) {
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
		if (currentUser.id !== null) {
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

			//update current user object
			currentUser.name = document.getElementById('name').value;
			currentUser.tagIds = new Array();
			for (var i=0; i<checklistItems.length; i++) {
				if (document.getElementById('tagIds_' + checklistItems[i].id).checked) {
					currentUser.tagIds.push(checklistItems[i].id);
				}
			}

			//update existing user container
			var maxUserId = 0;
			var userContainer = new Array();
			if (!(typeof users === 'undefined' || users === null || users.length === 0)) {
				for (var i=0; i<users.length; i++) {
					if (currentUser.id !== null && currentUser.id === users[i].id) {
						userContainer.push(currentUser);
					} else {
						userContainer.push(users[i]);
					}

					if (users[i].id > maxUserId) {
						maxUserId = users[i].id;
					}
				}
			}

			//add new user
			if (currentUser.id === null) {
				currentUser.id = maxUserId+1;
				userContainer.push(currentUser);
			}

			//save new user container, close window
			app.homey.set('userContainer', userContainer);
			app.message.show('', __('settings.advanced.messages.usersSavedConfirmation'), 'success');
			app.page.close();
		});
	}

	return {};
});