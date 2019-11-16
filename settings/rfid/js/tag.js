(function(app, args) {

	//load tag data for editing
	if (typeof args === 'undefined' || typeof args.tag === 'undefined') {
		app.message.show('', 'cannot manually add tags', 'error');
		app.page.close();
		return {};
	}

	var currentTag = args.tag;

	//fill form for editing tag
	document.getElementById('name').value = currentTag.name;

	//load users
	var checklistItems = new Array();
	var users = app.userRepository.getAllUsers();
	if(users.length > 0) {
		// convert users to checklistItems
		for (var i=0; i<users.length; i++) {
			checklistItems.push({
				id: users[i].id,
				label: (users[i].name != '' ? users[i].name : 'id ' + users[i].id),
				checked: (users[i].tagIds.indexOf(currentTag.id) !== -1)
			});
		}

		document.getElementById('userIds').innerHTML = '';
		document.getElementById('userIds').appendChild(app.ui.createChecklist('userIds', checklistItems));
	} else
		document.getElementById('userIds').innerHTML = __('settings.rfid.messages.noUsersYet');

	//bind delete button
	if (currentTag.id !== null) {
		document.getElementById('deleteButton').style.display = '';
		document.getElementById('deleteButton').onclick = function() {
			app.message.confirm(__('settings.rfid.messages.confirmDeteleTag'), 'warning', function(err, result) {
				if (err === true || result === true) {
					app.tagRepository.deleteTag(currentTag);
					app.message.show('', __('settings.rfid.messages.tagDeleted'), 'success');
					app.page.close();
				}
			});
		};
	}

	//bind save button
	document.getElementById('saveButton').onclick = function() {
		//update current user object
		currentTag.name = document.getElementById('name').value;

		//save tag
		app.tagRepository.saveTag(currentTag);

		//update tagIds for all users
		var users = app.userRepository.getAllUsers();
		for (var i=0; i<users.length; i++) {
			if (document.getElementById('userIds_' + users[i].id).checked) {
				if (users[i].tagIds.indexOf(currentTag.id) === -1) {
					users[i].tagIds.push(currentTag.id);
				}
			} else {
				if (users[i].tagIds.indexOf(currentTag.id) > -1) {
					users[i].tagIds.splice(users[i].tagIds.indexOf(currentTag.id), 1);
				}
			}
		}
		app.userRepository.saveUsers(users);

		//show success message and close page
		app.message.show('', __('settings.rfid.messages.tagSavedConfirmation'), 'success');
		app.page.close();
	}

	return {};
});