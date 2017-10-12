"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
        'alarm_co': {
			'command_class'				: 'COMMAND_CLASS_NOTIFICATION',
			//'command_get'				: 'NOTIFICATION_GET',
			'command_get_parser'		: function(){
				return {
					"V1 Alarm Type" : 0,
					"Notification Type" : "Access Control",
					"Event" : 0,
				}
			},
			'command_report'			: 'NOTIFICATION_REPORT',
			'command_report_parser'		: function( report ){
				console.log(report);
				if (report['Notification Type'] === 'CO' && report['Event'] === 2) {
					return true;
				}
				
				if (report['Notification Type'] === 'CO' && report['Event'] === 0) {
					return false;
				}
				
				return null;
			}

        },
        'measure_battery': {
			'command_class'				: 'COMMAND_CLASS_BATTERY',
			'command_get'				: 'BATTERY_GET',
			'command_report'			: 'BATTERY_REPORT',
			'command_report_parser'		: function( report ) {
				if( report['Battery Level'] === "battery low warning" ) return 1;
				return report['Battery Level (Raw)'][0];
			}
        }
    }

});