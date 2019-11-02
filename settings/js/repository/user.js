var userRepository = (function(homey, event) {
	var repository = repositoryHelper(homey, event, 'userContainer');

	return {
		getUserById: repository.findItemById,
		getAllUsers: repository.getAllItems,
		saveUser: repository.saveItem,
		saveUsers: repository.saveItems,
		deleteUser: repository.deleteItem
	}
});