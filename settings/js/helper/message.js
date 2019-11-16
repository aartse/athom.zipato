var messageHelper = (function(homey) {

	var autoHideMessageTimer = null;

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

		if (autoHideMessageTimer !== null) {
			clearTimeout(autoHideMessageTimer);
		}

		// auto hide message
		autoHideMessageTimer = setTimeout(hideMessage, 3000);
	}

	/**
	 * hide message
	 */
	function hideMessage()
	{
		autoHideMessageTimer = null;
		document.getElementById('message').setAttribute('class', '');
	}

	/**
	 * confirm message
	 */
	function confirmMessage(message, icon, callback)
	{
		return homey.confirm(message, icon, callback);
	}

	return {
		show: showMessage,
		hide: hideMessage,
		confirm: confirmMessage
	}	
});