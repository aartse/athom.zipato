"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: true,

	capabilities: {
		'alarm_generic': {
			'command_class'				: 'COMMAND_CLASS_ALARM',
			'command_get'				: 'ALARM_GET',
			'command_get_parser'		: function(){
				return {
					"Alarm Type" : 0
				}
			},			
			'command_report'			: 'ALARM_REPORT',
			'command_report_parser'		: function( report ){
				console.log(report);
				return (report['Alarm Level'] === 1 || report['Alarm Level'] === 255);
			}
		}
    }

});