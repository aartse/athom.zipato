"use strict";

// @TODO: TEST!

const { ZwaveDevice } = require('homey-zwavedriver');

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_motion capability with COMMAND_CLASS_SENSOR_BINARY
		this.registerCapability('alarm_motion', 'SENSOR_BINARY');

		// register the measure_luminance capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
	}
}

module.exports = ZipatoDevice;