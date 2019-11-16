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
	appContainer.message = messageHelper(homey);
	appContainer.event = eventHelper(homey);
	appContainer.logRepository = logRepository(homey, appContainer.event);
	appContainer.tagRepository = tagRepository(homey, appContainer.event);
	appContainer.tagstatusRepository = tagstatusRepository(homey, appContainer.event);
	appContainer.systemarmedRepository = systemarmedRepository(homey, appContainer.event);
	appContainer.userRepository = userRepository(homey, appContainer.event);
	appContainer.ui = uiHelper();
	appContainer.page = {
		open: openPage,
		close: previousPage
	};

	document.getElementById('backButton').onclick = function() {
		previousPage();
	};

	

	// open first page
	openPage('home.html', 'js/home.js');
	//openPage('rfid/index.html', 'rfid/js/index.js');

	// homey is ready
	homey.ready();

	// return container with services
	return appContainer;
});