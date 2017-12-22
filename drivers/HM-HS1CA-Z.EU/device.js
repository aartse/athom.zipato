"use strict";

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register the alarm_co capability with COMMAND_CLASS_NOTIFICATION or SENSOR_BINARY 
		this.registerCapability('alarm_co', 'NOTIFICATION');
		this.registerCapability('alarm_co', 'SENSOR_BINARY');

	}
}

module.exports = ZipatoDevice;

/*

notification class not working yet. debug data:

2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] - CommandClass: COMMAND_CLASS_NOTIFICATION
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] -- Version: 4
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] -- Commands:
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- NOTIFICATION_GET
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- NOTIFICATION_REPORT
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- NOTIFICATION_SET
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- NOTIFICATION_SUPPORTED_GET
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- NOTIFICATION_SUPPORTED_REPORT
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- EVENT_SUPPORTED_GET
2017-12-22 21:31:50 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] --- EVENT_SUPPORTED_REPORT


ALARM AAN:

2017-12-22 21:32:10 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] node.CommandClass['COMMAND_CLASS_NOTIFICATION'].on('report') arguments: { '0': { value: 5, name: 'NOTIFICATION_REPORT' },
  '1': 
   { 'V1 Alarm Type (Raw)': <Buffer 00>,
     'V1 Alarm Type': 0,
     'V1 Alarm Level (Raw)': <Buffer 00>,
     'V1 Alarm Level': 0,
     'Reserved (Raw)': <Buffer 00>,
     'Notification Status (Raw)': <Buffer ff>,
     'Notification Status': 'On',
     'Notification Type (Raw)': <Buffer 02>,
     'Notification Type': 'CO',
     'Event (Raw)': <Buffer 02>,
     Event: 2,
     'Properties1 (Raw)': <Buffer 00>,
     Properties1: { 'Event Parameters Length': 0, Sequence: false } },
  '2': null }


ALARM UIT:

2017-12-22 21:32:13 [log] [ManagerDrivers] [HM-HS1CA-Z.EU] [0] node.CommandClass['COMMAND_CLASS_NOTIFICATION'].on('report') arguments: { '0': { value: 5, name: 'NOTIFICATION_REPORT' },
  '1': 
   { 'V1 Alarm Type (Raw)': <Buffer 00>,
     'V1 Alarm Type': 0,
     'V1 Alarm Level (Raw)': <Buffer 00>,
     'V1 Alarm Level': 0,
     'Reserved (Raw)': <Buffer 00>,
     'Notification Status (Raw)': <Buffer ff>,
     'Notification Status': 'On',
     'Notification Type (Raw)': <Buffer 02>,
     'Notification Type': 'CO',
     'Event (Raw)': <Buffer 00>,
     Event: 0,
     'Properties1 (Raw)': <Buffer 01>,
     Properties1: { 'Event Parameters Length': 1, Sequence: false },
     'Event Parameter': <Buffer 02> },
  '2': null }

*/