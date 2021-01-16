"use strict";

const { ZwaveDevice } = require('homey-zwavedriver');

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		if (typeof this.node.CommandClass['COMMAND_CLASS_NOTIFICATION'] !== 'undefined') {
			// register the capabilities with COMMAND_CLASS_NOTIFICATION
			this.registerCapability('alarm_motion', 'NOTIFICATION');
			this.registerCapability('alarm_tamper', 'NOTIFICATION');
		} else {
			if (typeof this.node.CommandClass['COMMAND_CLASS_SENSOR_BINARY'] !== 'undefined') {
				// fallback for alarm_motion with SENSOR_BINARY
				this.registerCapability('alarm_motion', 'SENSOR_BINARY');
			} else {
				// fallback for alarm_motion with BASIC
				this.registerCapability('alarm_motion', 'BASIC', {
					report: 'BASIC_SET',
					reportParser: report => {
						if (report && report.hasOwnProperty('Value')) {
							return report.Value === 255;
						}
						return null;
					},
				});
			}

			this.registerCapability('alarm_tamper', 'SENSOR_ALARM');
		}

		// register the measure_temperature capability with SENSOR_MULTILEVEL
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {getOpts: {getOnStart: false}});

		// set motion status
    	this.homey.flow.getActionCard('ZP3102.EU-set_motion')
        	.registerRunListener(( args, state ) => {
				return args.device.setCapabilityValue('alarm_motion', (args.motion == "1"))
        	});
	}
}

module.exports = ZipatoDevice;