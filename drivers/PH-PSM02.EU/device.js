'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

//https://www.zipato.com/wp-content/uploads/2015/09/ph-psm02-Zipato-Multisensor-Quad-User-Manual-v1.4.pdf

//https://products.z-wavealliance.org/products/2433?selectedFrequencyId=-1 (ph-psm02.eu)
//https://products.z-wavealliance.org/products/1449?selectedFrequencyId=-1 (PST02-1A)
//https://products.z-wavealliance.org/products/1090?selectedFrequencyId=-1 (PST02-1B)
//https://products.z-wavealliance.org/products/1092?selectedFrequencyId=-1 (PST02-1C)

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		this.registerCapability('alarm_motion', 'NOTIFICATION');
		this.registerCapability('alarm_contact', 'NOTIFICATION');
		this.registerCapability('alarm_tamper', 'NOTIFICATION');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_battery', 'BATTERY');
	}
}

module.exports = ZipatoDevice;
