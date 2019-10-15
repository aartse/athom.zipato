var app = (function() {
	var homey;
	var pages = [];
	var events = [];

	function onHomeyReady(h)
	{
		homey = h;
		homey.ready();

		homey.on('settings.set', function(name) {
			triggerEvent('settings.set', [name]);
		});	

		//load homepage
		openPage('home.html');

		//load rfid device
		//openPage('rfid/index.html', 'rfid/js/index.js');
	}

	function triggerEvent(eventType, extraParameters)
	{
		for (var i = events.length - 1; i >= 0; i--) {
			if (events[i].eventType === eventType && typeof events[i].callback === 'function') {
				events[i].callback.apply(app, extraParameters);
			}
		}
	}

	function onEvent(eventType, callback)
	{
		events.push({
			eventType: eventType,
			callback: callback
		});
	}

	function offEvent(eventType, callback)
	{
		var newEvents = [];
		for (var i = events.length - 1; i >= 0; i--) {
			if (events[i].eventType !== eventType && events[i].callback !== callback) {
				newEvents.push(events[i]);
			}
		}
		events = newEvents;
	}

	function loadPage(page)
	{
		// add loading class to content
		document.getElementById('content').classList.add("loading");

		fetch(page.url, {
	        method: 'get'
	    })
	    .then(function (data) {

			// load content
			data.text().then(function(response) {

				// load content from response into element
				var loadedPage = document.createElement('div');
				loadedPage.innerHTML = response;
				
				// load body into content div
				document.getElementById('content').innerHTML = '';
				document.getElementById('content').appendChild(loadedPage);
		
				// re-translate content
				translateElement(document.getElementById('content'));

				// when js is required, load external javascript file as module
				if (typeof page.js !== 'undefined' && page.js != '') {
					loadJsModule(page);
				}

				// remove loading class to content
				document.getElementById('content').classList.remove("loading");
			});
		})
	    .catch(function(err) {
	        //error block
	    });
	}

	/**
	 * Load js module
	 */
	function loadJsModule(page)
	{
		fetch(page.js, {
	        method: 'get'
	    })
	    .then(function (data) {
			data.text().then(function(response) {
		    	var jsModule = eval(response);
		    	if (typeof jsModule === 'function') {
		    		page.module = jsModule(app, page.args);
		    	}
		    });
	    })
	    .catch(function(err) {
	        //error block
	    });
	}

	/**
	 * Open new page
	 */
	function openPage(url, js, args)
	{
		//destroy current page
		if (pages.length > 1) {
			var oldPage = pages[pages.length-1];
			if (typeof oldPage.module === 'object' && typeof oldPage.module.destroy === 'function') {
				oldPage.module.destroy();
			}
		}

		//save page to pages stack
		var page = {
			url: url,
			js: js,
			args: args
		};
		pages.push(page);

		//load page
		loadPage(page);
	}

	/**
	 * Open previous page
	 */
	function previousPage()
	{
		if (pages.length > 1) {
			//destroy old page
			var oldPage = pages.pop();
			if (typeof oldPage.module === 'object' && typeof oldPage.module.destroy === 'function') {
				oldPage.module.destroy();
			}

			//load previous page
			loadPage(pages[pages.length-1]);
		}
	}

	/**
	 * Displays message on settings page
	 * Style can be "danger" or "success" or "info"
	 */
	function showMessage(title, messageText, style)
	{
		// create message
		var message = '';
		if(title !== null && title !== '') {
			message += '<strong>' + title + '</strong><br />';
		}
		message += messageText;

		// default style is info
		if (typeof style === 'undefined') {
			style = 'info';
		}

		// show message
		document.getElementById('message').innerHTML = '<span>' + message + '</span>';
		document.getElementById('message').setAttribute('class', 'alert alert-' + style);

		// auto hide message
		setTimeout(hideMessage, 3000);
	}

	/**
	 * hide message
	 */
	function hideMessage()
	{
		document.getElementById('message').setAttribute('class', '');
	}

	function createTable(rows, args)
	{
		var table = document.createElement("table");
		table.setAttribute('class', 'decorated');

		for (var i=0; i<rows.length; i++) {
			var row = rows[i];

			var tableRow = document.createElement("tr");
			table.appendChild(tableRow);

			var tableLabel = document.createElement("th");
			tableLabel.innerText = row.label;
			tableRow.appendChild(tableLabel);

			var tableValue = document.createElement("td");
			tableValue.innerText = row.value;
			tableRow.appendChild(tableValue);
		}

		if (typeof args !== 'undefined') {
			if (typeof args.editButton !== 'undefined') {
				var tableRow = document.createElement("tr");
				table.appendChild(tableRow);

				var tableValue = document.createElement("td");
				tableValue.colSpan=2;
				tableValue.appendChild(args.editButton);
				tableRow.appendChild(tableValue);
			}
		}

		return table;
	}

	function createChecklist(items)
	{
		var checklist = document.createElement("div");
		checklist.className = 'decorated';

		for (var i=0; i<items.length; i++) {
			var item = items[i];

			var checklistItem = document.createElement("div");
			checklistItem.className = 'field row';
			checklist.appendChild(checklistItem);

			var input = document.createElement("input");
			input.type = 'checkbox';
			input.value = item.id;
			checklist.appendChild(input);

			var label = document.createElement("label");
			label.innerText = item.label;
			checklist.appendChild(label);
		}

		return checklist;
	}

	return {
		onHomeyReady: onHomeyReady,
		page: {
			open: openPage,
			close: previousPage
		},
		message: {
			show: showMessage,
			hide: hideMessage,
		},
		createTable: createTable,
		createChecklist: createChecklist,
		homey: {
			get: function(name, callback) {
				return homey.get(name, callback);
			},
			set: function(name, value) {
				return homey.set(name, value);
			},
			confirm: function(message, icon, callback) {
				return homey.confirm(message, icon, callback);
			},
			alert: function(message, icon) {
				return homey.alert(message, icon);
			}
		},
		on: onEvent,
		off: offEvent,
		trigger: triggerEvent
	}
})();