'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

//https://www.zipato.com/wp-content/uploads/2015/09/ph-psm02-Zipato-Multisensor-Quad-User-Manual-v1.4.pdf

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		this.registerCapability('alarm_motion', 'SENSOR_BINARY');
		this.registerCapability('alarm_motion', 'NOTIFICATION');

		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
		this.registerCapability('alarm_contact', 'NOTIFICATION');

		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'NOTIFICATION');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_battery', 'BATTERY');
	}
}

module.exports = ZipatoDevice;
