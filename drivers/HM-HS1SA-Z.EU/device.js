"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_smoke capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_smoke', 'NOTIFICATION');
	}
}

module.exports = ZipatoDevice;