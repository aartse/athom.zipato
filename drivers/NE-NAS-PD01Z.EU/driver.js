"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
		'alarm_motion': {
			'command_class'				: 'COMMAND_CLASS_SENSOR_BINARY',
			'command_report'			: 'SENSOR_BINARY_REPORT',
			'command_report_parser'		: function( report ){

				if (report['Sensor Type'] === "Motion" && report['Sensor Value'] === 'detected an event') {
					return true;
				}
				
				if (report['Sensor Type'] === "Motion" && report['Sensor Value'] === 'idle') {
					return false;
				}
				
				return null;
			}
		}, 

		'measure_luminance': {
			command_class: 'COMMAND_CLASS_SENSOR_MULTILEVEL',
			command_report: 'SENSOR_MULTILEVEL_REPORT',
			command_report_parser: report => {
				console.log(report);
				if (report.hasOwnProperty('Sensor Type') && report.hasOwnProperty('Sensor Value (Parsed)')) {
					if (report['Sensor Type'] === 'Luminance (version 1)') return report['Sensor Value (Parsed)'];
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
			},
			getOnWakeUp: true
		}	
	},
    settings: {
        "config_param_1": {
            index: 1,
            size: 1
        },
        "config_param_2": {
            index: 2,
            size: 2
        },
        "config_param_3": {
            index: 3,
            size: 1
        },
        "config_param_4": {
            index: 4,
            size: 1
        },
        "config_param_5": {
            index: 5,
            size: 2
        },
        "config_param_6": {
            index: 6,
            size: 1
        },
        "config_param_7": {
            index: 7,
            size: 2
        },
        "config_param_8": {
            index: 8,
            size: 1
        },
        "config_param_9": {
            index: 9,
            size: 2
        },
    }
})
