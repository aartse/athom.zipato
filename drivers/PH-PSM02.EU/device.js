'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		this.registerCapability('alarm_motion', 'SENSOR_BINARY');
		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_battery', 'BATTERY');
	}
}

module.exports = ZipatoDevice;
