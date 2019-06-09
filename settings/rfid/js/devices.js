var tagsLoaded = false;
var tagSelect = document.createElement('select');
tagSelect.setAttribute('multiple', 'multiple');
tagSelect.setAttribute('data-id', -1);
tagSelect.setAttribute('id', 'tagSelect_-1');

Homey.get('tagContainer', function(err, tags)
{
	if(err)
	{
		showMessage('error getting tagContainer', err, 'danger');
		return console.error(err);
	}

	if(typeof tags === 'undefined' || tags === null)
	{
		return;
	}
	
	for (var i = 0; i < tags.length; i++)
	{
		var tag = tags[i];
		var optionValue = document.createElement("option");
		optionValue.setAttribute('value', tag.tagId);
		optionValue.innerHTML = tag.tagId + ' (ID)'; //tag.tagValue + ' (' + tag.tagId + ')';
		tagSelect.appendChild(optionValue);
	}
	
	tagsLoaded = true;
	
	// If rows are already in place, add the tags to the rows (replace them, makes reload in future possible).
	if(document.getElementById("systemUserBody").getElementsByTagName("tr").length > 0)
	{
		// Add tags to document rows
		loadTagsForUsers();
	}
});

Homey.get('tagReaders', function(err, devices)
{
	if(err)
	{
		showMessage('error getting tagReaders', err, 'danger');
		return console.error(err);
	}
	
	if(typeof devices === 'undefined' || devices === null || devices.length <= 0)
	{
		document.getElementById('systemDevicesBody').innerHTML = '<tr><td colspan="5">' + __('settings.devices.messages.noDevicesYet') + '</td></tr>';
		return;
	}
	
	for (var i = 0; i < devices.length; i++)
	{
		var deviceEntry = devices[i];
		addDevicesRow(deviceEntry);
	}
});

Homey.get('tagStatus', function(err, tagStatus)
{
	if(err)
	{
		showMessage('error getting tagStatus', err, 'danger');
		return console.error(err);
	}
	
	if(tagStatus === true)
	{
		document.getElementById('currentTagStatus').innerHTML = __('settings.advanced.messages.allowTags');
	}
	else
	{
		document.getElementById('currentTagStatus').innerHTML = __('settings.advanced.messages.denyTags');
	}		
});

Homey.get('userContainer', function (err, users)
{
	if(err) {
		showMessage('error getting userContainer', err, 'danger');
		return console.error(err);
	}
	
	if(typeof users === 'undefined' || users === null || users.length <= 0)
	{
		document.getElementById('systemUserBody').innerHTML = '<tr data-type="emptyMessage"><td colspan="5">' + __('settings.users.messages.noUsersYet') + '</td></tr>';
		return;
	}
	
	for (var i = 0; i < users.length; i++)
	{
		var userEntry = users[i];
		addUserRow(userEntry);
	}
});
			
function addDevicesRow(deviceEntry)
{
	// Remove 'empty message' if there is any.
	removeEmptyMessageFromTable('systemDevicesBody');

	var tableRow = document.createElement("tr");
											
	tableRow.innerHTML += '<td>' + deviceEntry.id + '</td>';
	tableRow.innerHTML += '<td>' + deviceEntry.state + '</td>';
	tableRow.innerHTML += '<td>' + deviceEntry.lastUpdate + '</td>';
	
	var tableBody = document.getElementById('systemDevicesBody');
	tableBody.appendChild(tableRow);
}

function addUserRow(userEntry)
{
	// Remove 'empty message' if there is any.
	removeEmptyMessageFromTable('systemUserBody');

	var tableRow = document.createElement("tr");
	tableRow.setAttribute('id', 'userRow_' + userEntry.id);
	tableRow.setAttribute('data-id', userEntry.id);
	
	tableRow.innerHTML += '<td>' + userEntry.id + '</td>';
	tableRow.innerHTML += '<td><input type="text" name="username_'+userEntry.id+'" id="username_'+userEntry.id+'" value="' + userEntry.name + '"></input></td>';
	tableRow.innerHTML += '<td id="tagDataColumn_' + userEntry.id + '"></td>';
	tableRow.innerHTML += '<td>' + __('settings.systemEventLog.eventTypes.s' + userEntry.statusCode) + '</td>';
	tableRow.innerHTML += '<td onclick="return removeUserRow(' + userEntry.id + ');"><a href="javascript:void(0);">X</a></td>';
	
	var tableBody = document.getElementById('systemUserBody');
	tableBody.appendChild(tableRow);
	addTagElement(userEntry);
}

function addTagElement(userEntry)
{
	var tagElement = null;
	if(tagsLoaded)
	{
		tagElement = tagSelect.cloneNode(true);
		tagElement.setAttribute('data-id', userEntry.id);
		tagElement.setAttribute('id', 'tagSelect_'+userEntry.id);
		
		// Set selected tags as selected values in tagElement
		setSelectValues(tagElement, userEntry.tagIds);
	}

	if(tagElement !== null)
	{
		var tagColumn = document.getElementById('tagDataColumn_'+ userEntry.id);
		tagColumn.innerHTML = "";
		tagColumn.appendChild(tagElement);
	}
}

function addNewUserRow()
{
	// Get highest id...
	var highestId = 0;
	var rows = document.getElementById('systemUserBody').getElementsByTagName('tr');
	
	try {
		for(var i = 0; i<rows.length; i++)
		{
			var id = parseInt(rows[i].getAttribute('data-id'));
			if(id > highestId)
			{
				highestId = id;
			}
		}
	} catch(e) { 
		showMessage('error looping users', err, 'danger');
		console.error(e);
	}
	
	// Add the row
	var userEntry = { 'id': highestId+1, 'name': '', 'statusCode': -1, 'tagIds': null };
	addUserRow(userEntry);
}

function removeUserRow(userId)
{
	Homey.confirm(__('settings.users.messages.confirmDeteleUser'), 'warning', function(err, result) {
		if (err === true || result === true) {
			// http://stackoverflow.com/questions/3387427/remove-element-by-id
			var element = document.getElementById('userRow_' + userId);
			element.parentNode.removeChild(element);

			showMessage('', __('settings.advanced.messages.userDeleted'), 'success');
		}
	});

	// Always return false to cancel the bubbling click events.
	return false;
}

function saveUsers()
{
	var rows = document.getElementById('systemUserBody').getElementsByTagName('tr');
	var userIds = [];
	var allUsersToSave = [];
	try {
		for(var i = 0; i<rows.length; i++)
		{
			var id = parseInt(rows[i].getAttribute('data-id'));
			userIds.push(id);
		}
	} catch(e) {
		showMessage('error looping users', err, 'danger');
		console.error(e);
	}
	
	// Get user settings from Homey and update users with the new values
	Homey.get('userContainer', function (err, users)
	{
		if(err) {
		    showMessage('error getting userContainer', err, 'danger');
			return console.error(err);
		}
		
		if(typeof users !== 'undefined' && users !== null && users.length > 0)
		{
			for (var i = 0; i < users.length; i++)
			{
				// Update 
				var userName = document.getElementById('username_' + users[i].id);
				var tags = document.getElementById('tagSelect_' + users[i].id);
				
				if(typeof userName !== 'undefined' && userName !== null)
				{
					users[i].name = userName.value;
				}
				
				if(typeof tags !== 'undefined' && tags !== null)
				{
					users[i].tagIds = getSelectValues(tags);
				}
				
				// Remove element from rows list
				var index = userIds.indexOf(users[i].id);
				if (index > -1) {
					userIds.splice(index, 1);
				
					// Push users to all users to save. If user ID is not in the userIds list, it is assumed that the user is removed with the 'x'.
					allUsersToSave.push(users[i]);
				}
			}
		}

		// Now we only need to add the new users left in 'rows' variable.
		for(var i = 0; i < userIds.length; i++)
		{
			// contains objects: { "name": "bla", "id": -1, "statusCode": 0 (0 = away, 1 = home), "tagIds": { 1, 3 } };
			var newUser = { "name": null, "id": userIds[i], "statusCode": -1, "tagIds": {} };
			var userName = document.getElementById('username_' + userIds[i]);
			var tags = document.getElementById('tagSelect_' + userIds[i]);
			
			if(typeof userName !== 'undefined' && userName !== null)
			{
				newUser.name = userName.value;
			}
			
			if(typeof tags !== 'undefined' && tags !== null)
			{
				newUser.tagIds = getSelectValues(tags);
			}
			
			allUsersToSave.push(newUser);
		}
		
		// Save allUsersToSave ! :)
		Homey.set('userContainer', allUsersToSave, function(err, result) {
			if (err) {
				showMessage(__('settings.advanced.messages.usersSavedErrorTitle'), err, 'danger');
			} else {
				showMessage('', __('settings.advanced.messages.usersSavedConfirmation'), 'success');
			}
		});
		showMessage('', __('settings.advanced.messages.usersSavedConfirmation'), 'success');
		
		// TODO :: GIVE FEEDBACK REGARDING ACTION
	});	
}

function removeEmptyMessageFromTable(tableBodyId)
{
	// http://stackoverflow.com/questions/3387427/remove-element-by-id
	var element = document.getElementById(tableBodyId).querySelector('[data-type="emptyMessage"]');
	if(typeof element === 'undefined' || element === null)
	{
		return;
	}
	element.parentNode.removeChild(element);
}

function getSelectValues(select)
{
	var result = [];
	var options = select && select.options;

	for (var i=0, iLen=options.length; i<iLen; i++) {
		var opt = options[i];
		if (opt.selected) {
			result.push(parseInt(opt.value) || opt.text);
		}
	}
	return result;
}

function setSelectValues(select, values)
{
	var options = select && select.options;
	
	if(typeof values === 'undefined' || values === null || !Array.isArray(values) || values.length <= 0)
	{
		return select;
	}

	for (var i=0, iLen=options.length; i<iLen; i++) {
		var opt = options[i];
		
		var value = parseInt(opt.value) || opt.text;
		var index = values.indexOf(value);
		if(index > -1)
		{	
			options[i].selected = true;
		}
	}
	
	//select.options = options;
	return select;
}

function clearTags()
{
	Homey.confirm(__('settings.advanced.messages.confirmClearTags'), 'warning', function(err, result) {
		if (err === true || result === true) {
			Homey.set('tagContainer', new Array());
			showMessage('', __('settings.advanced.messages.tagsClearedConfirmation'), 'success');
		}
	});
	
	// Always return false to cancel the bubbling click events.
	return false;
}

function toggleTagStatus()
{
	Homey.get('tagStatus', function(err, tagStatus)
	{
		if(err)
		{
		    showMessage('error getting toggleTagStatus', err, 'danger');
			return console.error(err);
		}
		
		if(tagStatus === true)
		{
			Homey.set('tagStatus', false);
			document.getElementById('currentTagStatus').innerHTML = __('settings.advanced.messages.denyTags');
			showMessage(__('settings.advanced.messages.toggleTagStatusConfirmedTitle'), __('settings.advanced.messages.denyTags'), 'success');
		}
		else
		{
			Homey.set('tagStatus', true);
			document.getElementById('currentTagStatus').innerHTML = __('settings.advanced.messages.allowTags');
			showMessage(__('settings.advanced.messages.toggleTagStatusConfirmedTitle'), __('settings.advanced.messages.allowTags'), 'success');					
		}		
	});
}

function loadTagsForUsers()
{
	Homey.get('userContainer', function (err, users)
	{
		if(err)
		{
			showMessage('error getting userContainer', err, 'danger');
			return console.error(err);
		}
		
		if(typeof users === 'undefined' || users === null || users.length <= 0)
		{
			return;
		}
		
		for (var i = 0; i < users.length; i++)
		{
			// NOTICE: ONLY UPDATE TAG ELEMENT, THIS PREVENTS MULTIPLE DATA LOSS
			var userEntry = users[i];
			addTagElement(userEntry);
		}
	});
}

/**
* Displays message on settings page
* Style can be "danger" or "success" or "info"
*/
function showMessage(title, messageText, style)
{
	var message = '';
	if(title !== null && title !== '')
	{
		message += '<strong>' + title + '</strong>';
	}
	
	message += messageText;

	document.getElementById('messageId').innerHTML = message;
	document.getElementById('messageId').setAttribute('class', 'alert alert-' + style);
	document.getElementById('messageId').style = 'display: block;';
}
