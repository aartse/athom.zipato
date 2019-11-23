"use strict";

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_motion capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_motion', 'NOTIFICATION');

		// register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION
		this.registerCapability('alarm_tamper', 'NOTIFICATION');

		// register alternative commandclass when notification is not avaible
		if (typeof this.node.CommandClass['COMMAND_CLASS_NOTIFICATION'] === 'undefined') {
			this.registerCapability('alarm_motion', 'SENSOR_BINARY');
			this.registerCapability('alarm_tamper', 'ALARM');
		}

		// register the measure_temperature capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {getOpts: {getOnStart: false}});

		// set motion status
    	let setMotionFlow = new Homey.FlowCardAction('ZP3102.EU-set_motion');
    	setMotionFlow
        	.register()
        	.registerRunListener(( args, state ) => {
				return args.device.setCapabilityValue('alarm_motion', (args.motion == "1"))
        	});
	}
}

module.exports = ZipatoDevice;