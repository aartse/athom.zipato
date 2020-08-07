"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_contact capability with COMMAND_CLASS_ALARM
		this.registerCapability('alarm_contact', 'NOTIFICATION');
	}
}

module.exports = ZipatoDevice;