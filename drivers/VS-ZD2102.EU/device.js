"use strict";

// @TODO: TEST!

const { ZwaveDevice } = require('homey-zwavedriver');

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_contact capability with COMMAND_CLASS_ALARM or COMMAND_CLASS_SENSOR_BINARY
		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
		this.registerCapability('alarm_contact', 'ALARM', {
			get: 'ALARM_GET',
			report: 'ALARM_REPORT',
			reportParser: report => {
				this.log(report);
			    return null;
			}
		  });

		// register the alarm_tamper capability with COMMAND_CLASS_ALARM or COMMAND_CLASS_SENSOR_BINARY
		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'ALARM', {
			get: 'ALARM_GET',
			report: 'ALARM_REPORT',
			reportParser: report => {
				this.log(report);
			    return null;
			}
		  });
	}
}

module.exports = ZipatoDevice;