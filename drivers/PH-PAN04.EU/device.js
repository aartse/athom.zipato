"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_BINARY
		// @TODO: TEST!
		this.registerCapability('onoff', 'SWITCH_BINARY');

		// register the measure_power capability with COMMAND_CLASS_METER
		// @TODO: TEST!
		this.registerCapability('measure_power', 'METER');

		// register the meter_power capability with COMMAND_CLASS_METER
		// @TODO: TEST!
		this.registerCapability('meter_power', 'METER');

		// settings parser for "Watt meter report period (in seconds)"
		// @TODO: TEST!
		this.registerSetting('config_param_1', value => {
			console.log(value);
			return new Buffer([value / 5]);
		});

		// settings parser for "KWh meter report period (in minutes)"
		// @TODO: TEST!
		this.registerSetting('config_param_2', value => {
			console.log(value);
			return new Buffer([value / 10]);
		});
	}
}

module.exports = ZipatoDevice;