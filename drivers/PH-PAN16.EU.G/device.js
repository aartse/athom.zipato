"use strict";

// @TODO: TEST!

const { ZwaveDevice } = require('homey-zwavedriver');

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_BINARY
		this.registerCapability('onoff', 'SWITCH_BINARY');

		// register the measure_power capability with COMMAND_CLASS_METER
		this.registerCapability('measure_power', 'METER');

		// register the meter_power capability with COMMAND_CLASS_METER
		this.registerCapability('meter_power', 'METER');
	}
}

module.exports = ZipatoDevice;