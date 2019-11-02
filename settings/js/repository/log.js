var logRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'systemEventLog');

	return {
		getAllLogs: repository.getAllItems,
		clearLogs: repository.deleteAll
	}
});