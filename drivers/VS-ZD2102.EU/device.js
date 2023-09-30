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
		this.registerCapability('alarm_contact', 'BASIC');
		this.registerCapability('alarm_contact', 'ALARM', {
			report: "ALARM_REPORT",
			reportParser: report => {
			  if (
				report
				&& report.hasOwnProperty('ZWave Alarm Type')
				&& report['ZWave Alarm Type'] === 'Burglar'
				&& report.hasOwnProperty('ZWave Alarm Event')
				&& report['ZWave Alarm Event'] === 254
				&& report.hasOwnProperty('Alarm Level')
			  ) {
				return (report['Alarm Level'] === 255);
			  }
			  return null;
			}
		});

		this.registerCapability('alarm_tamper', 'NOTIFICATION');
		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');
	}
}

module.exports = ZipatoDevice;