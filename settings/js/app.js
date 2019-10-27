var app = (function(homey) {

	var appContainer = {};
	var pages = [];

	/**
	 * load page
	 */
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
		    		page.module = jsModule(appContainer, page.args);
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

	// load services into container
	appContainer.message = messageService();
	appContainer.event = eventService(homey);
	appContainer.userRepository = repositoryService(homey, appContainer.event, 'userContainer');
	appContainer.tagRepository = repositoryService(homey, appContainer.event, 'tagContainer');
	appContainer.ui = uiService();
	appContainer.page = {
		open: openPage,
		close: previousPage		
	};

	// open first page
	openPage('rfid/index.html', 'rfid/js/index.js');

	// homey is ready
	homey.ready();

	// return container with services
	return appContainer;

	/*
		homey: {
			getContainer: function(name, callback) {
				homey.get(name, function(err, value) {

					// handle error
					if (err) {
					    showMessage('error getting ' + name, err, 'danger');
						return;
					}

					// fix value
					if (typeof value === 'undefined' || value === null || value.length === 0) {
						value = new Array();
					}

					// call
					callback(value);
				});
			},
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
	*/
});