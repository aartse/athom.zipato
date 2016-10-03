"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

const tinycolor 	= require("tinycolor2");

// http://www.pepper1.net/zwavedb/device/587
// http://www.smarthome.com.au/media/manuals/Aeotec_Z-Wave_LED_Bulb_Product_Manual.pdf


module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: true,
	capabilities: {

		'onoff': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			'command_get'				: 'SWITCH_MULTILEVEL_GET',
			'command_set'				: 'SWITCH_MULTILEVEL_SET',
			'command_set_parser'		: value => {
				return {
					'Value': (value) ? 'on/enable' : 'off/disable',
					'Dimming Duration': 'Factory default'
				}
			},
			'command_report'			: 'SWITCH_MULTILEVEL_REPORT',
			'command_report_parser'		: report => {
				if (typeof report['Value'] === 'string') {
					return report['Value'] === 'on/enable';
				} else {
					return report['Value (Raw)'][0] > 0;
				}
			}
		},

		'dim': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			'command_get'				: 'SWITCH_MULTILEVEL_GET',
			'command_set'				: 'SWITCH_MULTILEVEL_SET',
			'command_set_parser'		: value => {
				return {
					'Value': value * 100,
					'Dimming Duration': 'Factory default'
				}
			},
			'command_report'			: 'SWITCH_MULTILEVEL_REPORT',
			'command_report_parser'		: report => {
				if (typeof report['Value'] === 'string') {
					return ( report['Value'] === 'on/enable' ) ? 1.0 : 0.0;
				} else {
					return report['Value (Raw)'][0] / 100;
				}
			}
		}
	}
});