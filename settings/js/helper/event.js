var eventHelper = (function(homey) {
	var events = [];

	function triggerEvent(eventType, extraParameters)
	{
		for (var i = events.length - 1; i >= 0; i--) {
			if (events[i].eventType === eventType && typeof events[i].callback === 'function') {
				//@TODO: app variable controleren waar dat nodig is?????
				events[i].callback.apply(null, extraParameters);
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

	homey.on('settings.set', function(name) {
		triggerEvent('settings.set', [name]);
	});	

	return {
		on: onEvent,
		off: offEvent,
		trigger: triggerEvent		
	}
});