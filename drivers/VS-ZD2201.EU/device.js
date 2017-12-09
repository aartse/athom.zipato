"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_contact capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_contact', 'NOTIFICATION');

		// register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_tamper', 'NOTIFICATION');

		// register the measure_temperature capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');

		// register the measure_humidity capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL');

		// register the measure_luminance capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
	}
}

module.exports = ZipatoDevice;