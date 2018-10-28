"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const Homey = require('homey');

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the onoff capability with COMMAND_CLASS_SWITCH_BINARY or COMMAND_CLASS_BASIC
		this.registerCapability('onoff', 'SWITCH_BINARY');
		this.registerCapability('onoff', 'BASIC');

		// register the alarm_tamper capability with COMMAND_CLASS_NOTIFICATION or COMMAND_CLASS_SENSOR_BINARY
		this.registerCapability('alarm_tamper', 'NOTIFICATION');
		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');

		let turnAlarmOnFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-turn_alarm_on');
		turnAlarmOnFlow
		    .register()
		    .registerRunListener(( args, state ) => {
		    	return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
				    'Switch Value': 255
				});
		    });

		let turnAlarmOffFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-turn_alarm_off');
		turnAlarmOffFlow
		    .register()
		    .registerRunListener(( args, state ) => {
		    	return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
				    'Switch Value': 0
				});
		    });	

		let PlaySoundFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-play_sound');
		PlaySoundFlow
		    .register()
		    .registerRunListener(( args, state ) => {
		    	return args.device.getCommandClass("SWITCH_MULTILEVEL").SWITCH_MULTILEVEL_SET({
				    Value: args.sound
				});
		    });		
	}
}

module.exports = ZipatoDevice;