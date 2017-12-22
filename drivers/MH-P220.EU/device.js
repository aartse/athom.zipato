"use strict";

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_MULTILEVEL
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL');

		// register the onoff capability with COMMAND_CLASS_SWITCH_MULTILEVEL
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');
	}
}

module.exports = ZipatoDevice;