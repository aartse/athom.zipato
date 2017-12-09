"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_BINARY or COMMAND_CLASS_BASIC
		// @TODO: TEST!
		this.registerCapability('onoff', ['SWITCH_BINARY', 'BASIC']);

		// register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION or COMMAND_CLASS_SENSOR_BINARY
		// @TODO: TEST!
		this.registerCapability('alarm_tamper', ['NOTIFICATION', 'SENSOR_BINARY']);

		// register a settings parser
		// @TODO: TEST!
		this.registerSetting('config_param_31', value => {			
			return new Buffer([value / 30])
		});
	}
}

module.exports = ZipatoDevice;