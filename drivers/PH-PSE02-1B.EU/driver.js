"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

//https://products.z-wavealliance.org/products/2421

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {
        'alarm_tamper': [
            {
                'command_class'             : 'COMMAND_CLASS_NOTIFICATION',
                'command_report'            : 'NOTIFICATION_REPORT',
                'command_report_parser'     : function( report ){
                    return report['Event (Parsed)'] === 'Tampering, Product covering removed';
                }
            },
            {
                'command_class'             : 'COMMAND_CLASS_SENSOR_BINARY',
                'command_report'            : 'SENSOR_BINARY_REPORT',
                'command_report_parser'     : function( report ){

                    //default tamper notification
                    if (report['Sensor Type'] == 'Tamper') {
                        return (report['Sensor Value'] == 'detected an event');
                    }
                    //stop tamper when siren state report sends a stop alarm report
                    if ((report['Sensor Type'] == 'General Purpose' && report['Sensor Value'] == 'Stop play') ||
                        (report['Sensor Type'] == 'General' && report['Sensor Value'] == 'idle')) {
                        return false;
                    }
                    return null;
                }

            }
        ],
        'onoff': [
            {
                command_class: 'COMMAND_CLASS_SWITCH_BINARY',
                command_set: 'SWITCH_BINARY_SET',
                command_set_parser: value => {
                    return {
                        'Switch Value': (value) ? 255 : 0,
                    }
                },
                command_report: 'SWITCH_BINARY_REPORT',
                command_report_parser: report => {
                    return report['Value'] === 'on/enable'
                }
            },
            {
                command_class: 'COMMAND_CLASS_BASIC',
                command_report: 'BASIC_REPORT',
                command_report_parser: (report, node) => {
                    return report['Value'] === 255
                }
            }
        ],
	},
    settings: {
        "config_param_7": { //Customer Function
            index: 7,
            size: 1
        },
        "config_param_29": { //Disable Alarm
            index: 29,
            size: 1
        },
        "config_param_31": { //Alarm Duration
            index: 31,
            size: 1,
            parser: value => new Buffer([value / 30])
        }
    }
});

Homey.manager('flow').on('action.PH-PSE02-1B.EU-turn_alarm_on', (callback, args) => {
    const node = module.exports.nodes[args.device.token];
    if (node && node.hasOwnProperty('instance') && node.instance.hasOwnProperty('CommandClass') && node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY']) {
        node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY'].SWITCH_BINARY_SET({
            'Switch Value': 255
        }, (err, result) => callback(err, result));
    } else return callback('invalid_device_command_class');
});

Homey.manager('flow').on('action.PH-PSE02-1B.EU-turn_alarm_off', (callback, args) => {
    const node = module.exports.nodes[args.device.token];
    if (node && node.hasOwnProperty('instance') && node.instance.hasOwnProperty('CommandClass') && node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY']) {
        node.instance.CommandClass['COMMAND_CLASS_SWITCH_BINARY'].SWITCH_BINARY_SET({
            'Switch Value': 0
        }, (err, result) => callback(err, result));
    } else return callback('invalid_device_command_class');
});