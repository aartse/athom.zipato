"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

//https://products.z-wavealliance.org/products/2421

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
        'onoff': {
            'command_class'				: 'COMMAND_CLASS_SWITCH_BINARY',
            'command_get'				: 'SWITCH_BINARY_GET',
            'command_set'				: 'SWITCH_BINARY_SET',
            'command_set_parser'		: (value, node) => {
                return {
                    'Switch Value': (value) ? 'on/enable' : 'off/disable'
                }
            },
            'command_report'			: 'SWITCH_BINARY_REPORT',
            'command_report_parser'		: report => {
                if (typeof report['Switch Value'] === 'string') {
                    return report['Switch Value'] === 'on/enable';
                } else {
                    return report['Value (Raw)'][0] > 0;
                }
            }
        },

        'measure_power': {
            command_class: 'COMMAND_CLASS_METER',
            command_get: 'METER_GET',
            command_get_parser: () => ({
                Properties1: {
                    Scale: 0
                },
            }),
            command_report: 'METER_REPORT',
            command_report_parser: report => {
        if (report.hasOwnProperty('Properties2') &&
            report.Properties2.hasOwnProperty('Scale bits 10') &&
            report.Properties2['Scale bits 10'] === 2) {
            return report['Meter Value (Parsed)'];
        }
        return null;
            },
        },

        'meter_power': {
            command_class: 'COMMAND_CLASS_METER',
            command_get: 'METER_GET',
            command_get_parser: () => ({
                Properties1: {
                    Scale: 0
                },
            }),
            command_report: 'METER_REPORT',
            command_report_parser: report => {
                if (report.hasOwnProperty('Properties2') &&
                    report.Properties2.hasOwnProperty('Scale bits 10') &&
                    report.Properties2['Scale bits 10'] === 0) {
                    return report['Meter Value (Parsed)'];
                }
                return null;
            },
        }
	},
    settings: {
        "config_param_1": {
            index: 1,
            size: 2,
            parser: value => new Buffer([value / 5])
        },
        "config_param_2": {
            index: 2,
            size: 2,
            parser: value => new Buffer([value / 10])
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
            size: 2
        },
        "config_param_7": {
            index: 7,
                size: 1
        },
        "config_param_8": {
            index: 8,
            size: 2
        },
        "config_param_9": {
            index: 9,
            size: 1
        },
        "config_param_10": {
            index: 10,
            size: 1
        }
    }
});
