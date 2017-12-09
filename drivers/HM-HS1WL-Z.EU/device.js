"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_water capability with COMMAND_CLASS_SENSOR_BINARY
		this.registerCapability('alarm_water', 'SENSOR_BINARY');

		// register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_tamper', 'NOTIFICATION');
	}
}

module.exports = ZipatoDevice;