var repositoryService = (function(homey, event, containerName) {

	var data = null;

	/**
	 * reload data
	 */
	function reloadData()
	{
		homey.get(containerName, function(err, value) {
			data = value;
		});
	}

	function getDataAsArray()
	{
		if(typeof data === 'undefined' || data === null || data.length === 0) {
			return new Array();
		}

		return data;
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

	return {
		findById: function(id) {
			var search = getDataAsArray();
			for (var i=0; i<search.length; i++) {
				if (search[i].id == id) {
					return search[i];
				}
			}
			return null;
		},
		findAll: function() {
			return getDataAsArray();
		}
	}	
});