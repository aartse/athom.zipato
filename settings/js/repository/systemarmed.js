var systemarmedRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'systemArmed');

	return {
		setSystemArmed: repository.saveData
	}	
});