"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,

	capabilities: {
		'alarm_water': {
			'command_class'				: 'COMMAND_CLASS_SENSOR_BINARY',
			'command_report'			: 'SENSOR_BINARY_REPORT',
			'command_report_parser'		: function( report ){

				if (report['Sensor Type'] === "Water" && report['Sensor Value'] === 'detected an event') {
					return true;
				}
				
				if (report['Sensor Type'] === "Water" && report['Sensor Value'] === 'idle') {
					return false;
				}
				
				return null;
			}
		},
		'alarm_tamper': {
			getOnWakeUp: true,
			'command_class'				: 'COMMAND_CLASS_NOTIFICATION',
			'command_get_parser'		: function(){
				return {
					"V1 Alarm Type" : 0,
					"Notification Type" : "Access Control",
					"Event" : 0,
				}
			},
			'command_report'			: 'NOTIFICATION_REPORT',
			'command_report_parser'		: function( report ){
				return report['Event (Parsed)'] === 'Tampering, Product covering removed';
			}
		},
	    'measure_battery': {
			getOnWakeUp: true,
			'command_class' : 'COMMAND_CLASS_BATTERY',
			'command_get' : 'BATTERY_GET',
			'command_report' : 'BATTERY_REPORT',
			'command_report_parser'		: function( report ) {
				if( report['Battery Level'] === "battery low warning" ) {
					return 1;
				}

				if (report.hasOwnProperty('Battery Level (Raw)')) {
					return report['Battery Level (Raw)'][0];
				}

				return null;
			}
	    }
    }

});