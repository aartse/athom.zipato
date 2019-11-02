var tagRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'tagContainer');

	function getTagNames(ids)
	{
		//search for tag names
		var names = new Array();
		for (var i=0; i<ids.length; i++) {
			var tag = repository.findItemById(ids[i]);
			names.push(tag !== null ? tag.name : ids[i]);
		}
		return names;
	}

	return {
		getTagById: repository.findItemById,
		getAllTags: repository.getAllItems,
		saveTag: repository.saveItem,
		deleteTag: repository.deleteItem,
		clearTags: repository.deleteAll,
		getTagNames: getTagNames
	}	
});