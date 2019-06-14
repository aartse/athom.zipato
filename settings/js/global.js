var pages = [];

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

			// when js is required, load external javascript file
			if (typeof page.js !== 'undefined' && page.js != '') {
				var newScript = document.createElement('script');
				newScript.setAttribute("type", "text/javascript");
				newScript.setAttribute("src", page.js);
				document.getElementsByTagName("head")[0].appendChild(newScript);	
			}

			// remove loading class to content
			document.getElementById('content').classList.remove("loading");
		});
	})
    .catch(function(err) {
        //error block
    });
}

function openPage(url, js)
{
	var page = {
		url: url,
		js: js
	};

	pages.push(page);

	loadPage(page);
}

function previousPage()
{
	if (pages.length > 1) {
		pages.pop();
		var page = pages[pages.length-1];
		loadPage(page);
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

function createTable(rows)
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

	return table;
}