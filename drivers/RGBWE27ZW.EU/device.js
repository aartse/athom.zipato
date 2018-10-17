"use strict";

//Athom includes
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	onMeshInit() {
		
		//this.enableDebug();
		//this.printNode();

    /*
    ================================================================
    Registering on/off and dim
    ================================================================
    */		
    this.registerCapability('onoff', 'SWITCH_MULTILEVEL');
    this.registerCapability('dim', 'SWITCH_MULTILEVEL');

/*
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
		*/
	}
}

module.exports = ZipatoDevice;