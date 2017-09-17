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
        }
	},
    settings: {
        "config_param_4": {
            index: 4,
            size: 1
        }
    }
});
