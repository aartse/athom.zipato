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
	var tags = app.tagRepository.getAllTags();
	if(tags.length > 0) {
		// convert tags to checklistItems
		for (var i=0; i<tags.length; i++) {
			checklistItems.push({
				id: tags[i].id,
				label: (tags[i].name != '' ? tags[i].name : 'id ' + tags[i].id),
				checked: (currentUser.tagIds.indexOf(tags[i].id) !== -1)
			});
		}

		document.getElementById('tagIds').innerHTML = '';
		document.getElementById('tagIds').appendChild(app.ui.createChecklist('tagIds', checklistItems));
	} else
		document.getElementById('tagIds').innerHTML = __('settings.rfid.messages.noTagsYet');

	//bind delete button
	if (currentUser.id !== null) {
		document.getElementById('deleteButton').style.display = '';
		document.getElementById('deleteButton').onclick = function() {
			app.message.confirm(__('settings.rfid.messages.confirmDeteleUser'), 'warning', function(err, result) {
				if (err === true || result === true) {
					app.userRepository.deleteUser(currentUser);
					app.message.show('', __('settings.rfid.messages.userDeleted'), 'success');
					app.page.close();
				}
			});
		};
	}

	//bind save button
	document.getElementById('saveButton').onclick = function() {
		//update current user object
		currentUser.name = document.getElementById('name').value;
		currentUser.tagIds = new Array();
		for (var i=0; i<checklistItems.length; i++) {
			if (document.getElementById('tagIds_' + checklistItems[i].id).checked) {
				currentUser.tagIds.push(checklistItems[i].id);
			}
		}

		//save user, show success message and close page
		app.userRepository.saveUser(currentUser);
		app.message.show('', __('settings.rfid.messages.userSavedConfirmation'), 'success');
		app.page.close();
	}

	return {};
});