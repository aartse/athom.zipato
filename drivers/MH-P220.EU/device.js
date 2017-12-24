"use strict";

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_MULTILEVEL
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL');

		// register the dim capability with COMMAND_CLASS_SWITCH_MULTILEVEL
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		// settings parser for "Single dimming step time in ms (manual)"
		this.registerSetting('config_param_7', value => {			
			const buf = Buffer.alloc(2);
			buf.writeUIntBE(parseInt(value/10), 0, 2);
			return buf;
		});

		// settings parser for "Single dimming step time in ms (auto)"
		this.registerSetting('config_param_9', value => {			
			const buf = Buffer.alloc(2);
			buf.writeUIntBE(parseInt(value/10), 0, 2);
			return buf;
		});

		// ----------------------------------------
		// START QUICK FIX: custom settings parser because ZwaveDevice cannot handle unsigned values yet

		this.registerSetting('config_param_4', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_15', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_17', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_18', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_19', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_20', value => {			
			return Buffer.alloc(1,parseInt(value));
		});
		this.registerSetting('config_param_21', value => {			
			return Buffer.alloc(1,parseInt(value));
		});

		// END QUICK FIX
		// ----------------------------------------
	}
}

module.exports = ZipatoDevice;