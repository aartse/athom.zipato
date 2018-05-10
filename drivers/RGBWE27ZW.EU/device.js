"use strict";

const ZwaveLightDevice = require('homey-meshdriver').ZwaveLightDevice;

class ZipatoDevice extends ZwaveLightDevice {

	async onMeshInit() {
		await super.onMeshInit();

		//this.enableDebug();
		//this.printNode();

		// Register debounced capabilities
		const groupedCapabilities = [];
		if (this.hasCapability('onoff')) {
			groupedCapabilities.push({
				capability: 'onoff',
				commandClass: 'SWITCH_MULTILEVEL'
			});
		}
		if (this.hasCapability('dim')) {
			groupedCapabilities.push({
				capability: 'dim',
				commandClass: 'SWITCH_MULTILEVEL'
			});
		}		
		if (this.hasCapability('light_hue')) {
			groupedCapabilities.push({
				capability: 'light_hue',
				commandClass: 'SWITCH_COLOR',
				opts: {
					setParser:this.switchColorSetParser
				}
			});
		}
		if (this.hasCapability('light_saturation')) {
			groupedCapabilities.push({
				capability: 'light_saturation',
				commandClass: 'SWITCH_COLOR',
				opts: {
					setParser:this.switchColorSetParser
				}
			});
		}
		if (this.hasCapability('light_temperature')) {
			groupedCapabilities.push({
				capability: 'light_temperature',
				commandClass: 'SWITCH_COLOR',
				opts: {
					setParser:this.switchColorSetParser
				}
			});
		}
		if (this.hasCapability('light_mode')) {
			groupedCapabilities.push({
				capability: 'light_mode',
				commandClass: 'SWITCH_COLOR',
				opts: {
					setParser:this.switchColorSetParser
				}
			});
		}
		this.registerGroupedCapabilities(groupedCapabilities);
	}
}

module.exports = ZipatoDevice;