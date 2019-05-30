function loadPage(url, js)
{
	fetch(url, {
        method: 'get'
    })
    .then(function (data) {

		// load content
		data.text().then(function(page) {

			// copy page content to element
			var loadedPage = document.createElement('div');
			loadedPage.innerHTML = page;
			
			// load body into content div
			document.getElementById('content').innerHTML = '';
			document.getElementById('content').appendChild(loadedPage);
	
			// re-translate content
			translateElement(document.getElementById('content'));

			// when js is required, load external javascript file
			if (js != '') {
				var newScript = document.createElement('script');
				newScript.setAttribute("type", "text/javascript");
				newScript.setAttribute("src", js);
				document.getElementsByTagName("head")[0].appendChild(newScript);	
			}
		});
	})
    .catch(function(err) {
        //error block
    });
}