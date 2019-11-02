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
		data = value;
		homey.set(containerName, value);
	}

	/**
	 * save multiple items
	 */
	function saveItems(itemsToSave)
	{
		var items = getDataAsArray();

		for (var i=0; i<itemsToSave.length; i++) {
			var item = itemsToSave[i];
			if (item.id === null) {
				var newId = 0;

				for (var i2=0; i2<items.length; i2++) {
					if (items[i2].id > newId) {
						newId = items[i2].id;
					}
				}

				item.id = newId+1
				items.push(item);
			} else {
				for (var i2=0; i2<items.length; i2++) {
					if (items[i2].id == item.id) {
						items[i2] = item;
					}
				}
			}
		}

		saveData(items);		
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
		saveItems: function(items) {
			saveItems(items);
		},
		saveItem: function(item) {
			saveItems([item]);
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
		},
		deleteAll: function() {
			saveData(new Array());
		}
	}	
});