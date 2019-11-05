(function(app) {

	document.getElementById('rfidButton').onclick = function() {
		app.page.open('rfid/index.html', 'rfid/js/index.js');
	};

	return {};
});