var repositoryHelper = (function(homey, event, containerName) {

	var data = null;

	/**
	 * reload data
	 */
	function reloadData()
	{
		homey.get(containerName, function(err, value) {
			data = value;
			event.trigger('repository.loaded', [containerName]);
		});
	}

	/**
	* return data as array
	*/
	function getDataAsArray()
	{
		if(typeof data === 'undefined' || data === null || data.length === 0) {
			return new Array();
		}

		return data;
	}

	/**
	 * save data
	 */
	function saveData(value)
	{
		homey.set(containerName, value);
	}

	/**
	 * handle settings save for this page
	 */
	function onSettingsSet(name)
	{
		if (name === containerName) {
			reloadData();
		}
	}

	//bind global events
	event.on('settings.set', onSettingsSet);

	//load data
	reloadData();

	return {
		findItemById: function(id) {
			var items = getDataAsArray();
			for (var i=0; i<items.length; i++) {
				if (items[i].id == id) {
					return items[i];
				}
			}
			return null;
		},
		getData: function() {
			return data;
		},
		getAllItems: function() {
			return getDataAsArray();
		},
		saveItem: function(item) {
			var items = getDataAsArray();

			if (item.id === null) {
				var newId = 0;

				for (var i=0; i<items.length; i++) {
					if (items[i].id > newId) {
						newId = items[i].id;
					}
				}

				item.id = newId+1
				items.push(item);
			} else {
				for (var i=0; i<items.length; i++) {
					if (items[i].id == item.id) {
						items[i] = item;
					}
				}
			}

			saveData(items);
		},
		saveData: function(data) {
			saveData(data);
		},
		deleteItem: function(item) {
			var items = getDataAsArray();

			if (item.id !== null) {
				for (var i=0; i<items.length; i++) {
					if (items[i].id == item.id) {
						items.splice(i, 1);
						break;
					}
				}
			}
			saveData(items);
		}
	}	
});