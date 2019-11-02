var tagreaderRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'tagReaders');

	return {
		getAllTagreaders: repository.getAllItems
	}	
});