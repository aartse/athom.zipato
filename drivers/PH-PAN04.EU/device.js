"use strict";

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_BINARY
		this.registerCapability('onoff', 'SWITCH_BINARY');

		// register the measure_power capability with COMMAND_CLASS_METER
		this.registerCapability('measure_power', 'METER');

		// register the meter_power capability with COMMAND_CLASS_METER
		this.registerCapability('meter_power', 'METER');

		// settings parser for "Watt meter report period (in seconds)"
		this.registerSetting('config_param_1', value => {
			const buf = Buffer.alloc(2);
			buf.writeUIntBE(parseInt(value / 5), 0, 2);
			return buf;
		});

		// settings parser for "KWh meter report period (in minutes)"
		this.registerSetting('config_param_2', value => {
			const buf = Buffer.alloc(2);
			buf.writeUIntBE(parseInt(value / 10), 0, 2);
			return buf;
		});
	}
}

module.exports = ZipatoDevice;