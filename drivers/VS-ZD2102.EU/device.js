"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_contact capability with COMMAND_CLASS_ALARM
		this.registerCapability('alarm_contact', 'ALARM');

		// register the alarm_tamper capability with COMMAND_CLASS_ALARM
		this.registerCapability('alarm_tamper', 'ALARM');
	}
}

module.exports = ZipatoDevice;