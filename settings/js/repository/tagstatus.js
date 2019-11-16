var tagstatusRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'tagStatus');

	return {
		getTagStatus: function() {
			return (repository.getData() === true);
		},
		toggleTagStatus: function() {
			repository.saveData(repository.getData() === false);	
		}
	}	
});