"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');
const tinycolor 	= require("tinycolor2");

// http://www.pepper1.net/zwavedb/device/587
// http://www.smarthome.com.au/media/manuals/Aeotec_Z-Wave_LED_Bulb_Product_Manual.pdf
// https://github.com/athombv/com.aeotec/blob/master/drivers/ZW098/driver.js

// http://www.cd-jackson.com/index.php/zwave/zwave-device-database/zwave-device-list/devicesummary/619

module.exports = new ZwaveDriver( path.basename(__dirname), {
	debug: false,
	capabilities: {

		'onoff': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_MULTILEVEL',
			'command_get'				: 'SWITCH_MULTILEVEL_GET',
			'command_set'				: 'SWITCH_MULTILEVEL_SET',
            'before_command_set_parser' : (value, node) => {
                // prevent sending double on commands
                // Because otherwise setting a color in the flow will not work properly.
                if (node.state.onoff && value) {
                    return false;
                }
                return true;
            },
			'command_set_parser'		: (value, node) => {
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
		},
		
		'light_hue': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_COLOR',
			'command_set'				: 'SWITCH_COLOR_SET',
			'command_set_parser'		: (value, node) => {

				// Update immediately
				node.state.light_hue = value;

				// Convert updated hue to rgb
				const rgb = hueCommandSetParser(value, node);
				
				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': 0
						},
						{
							'Color Component ID': 1, // CW
							'Value': 0
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r']
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g']
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b']
						}
					]
				}
			}
		},
		light_saturation: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				// Update immediately
				node.state.light_saturation = value;

				// Convert updated saturation to rgb
				const rgb = saturationCommandSetParser(value, node);				

				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': 0
						},
						{
							'Color Component ID': 1, // CW
							'Value': 0
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb["r"]
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb["g"]
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb["b"]
						}
					]
				}
			}
		},
		light_temperature: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				// Update immediately
				node.state.light_temperature = value;

				// If value above 0.5 construct warm white value
				const ww = (value >= 0.5) ? map(0.5, 1, 10, 255, value) : 0;

				// If value below 0.5 construct cool white value
				const cw = (value < 0.5) ? map(0, 0.5, 255, 10, value) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: (node.state.light_hue || 1) * 360,
					s: (node.state.light_saturation || 1) * 100,
					v: (node.state.dim || 1) * 100,
				}).toRgb();

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': ww,
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			}
		},
		light_mode: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				if (typeof node.state.light_temperature === 'undefined') node.state.light_temperature = 0.5;

				// Update immediately
				node.state.light_mode = value;

				// If value above 0.5 construct warm white value
				let ww = (node.state.light_temperature >= 0.5) ? Math.round(map(0.5, 1, 10, 255, node.state.light_temperature)) : 0;

				// If value below 0.5 construct cool white value (from 255 - 0 for slider)
				let cw = (node.state.light_temperature < 0.5) ? Math.round(map(0, 0.5, 255, 10, node.state.light_temperature)) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: (node.state.light_hue || 1) * 360,
					s: (node.state.light_saturation || 1) * 100,
					v: (node.state.dim || 1) * 100,
				}).toRgb();

				// If new mode is color set ww and cw to zero
				if (value === 'color') {
					ww = 0;
					cw = 0;
				} else {

					// New mode is temperature set rgb to zero
					rgb['r'] = 0;
					rgb['g'] = 0;
					rgb['b'] = 0;
				}

				return {
					'Properties1': {
						'Color Component Count': 5,
					},
					'vg1': [
						{
							'Color Component ID': 0, // WW
							'Value': ww,
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw,
						},
						{
							'Color Component ID': 2, // R
							'Value': rgb['r'],
						},
						{
							'Color Component ID': 3, // G
							'Value': rgb['g'],
						},
						{
							'Color Component ID': 4, // B
							'Value': rgb['b'],
						},
					],
				};
			}
		}		
	},
	beforeInit: (token, callback) => {
		const node = module.exports.nodes[token];
		if (node) {
			// Get WW
			const wwPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 0
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// get CW
			const cwPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 1
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Wait for all white values to arrive
			Promise.all([wwPromise, cwPromise]).then(results => {

				// Determine light_mode
				if (results[0] === 0 && results[1] === 0) {
					node.state.light_mode = 'color';
				} else {
					node.state.light_mode = 'temperature';
				}

				// Determine light_temperature
				if (results[0] !== 0) {
					node.state.light_temperature = map(10, 255, 0.5, 1, results[0]);
				} else {
					node.state.light_temperature = map(255, 10, 0, 0.5, results[1]);
				}
			});

			// Get R
			const rPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 2
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Get G
			const gPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 3
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Get B
			const bPromise = new Promise(resolve => {
				node.instance.CommandClass['COMMAND_CLASS_SWITCH_COLOR'].SWITCH_COLOR_GET({
					'Color Component ID': 4
				}, (err, result) => {
					if (result) return resolve(result['Value'] || 0);
					return resolve(0);
				});
			});

			// Wait for all RGB values to arrive
			Promise.all([rPromise, gPromise, bPromise]).then(results => {

				const hsv = tinycolor({
					r: results[0] || 0,
					g: results[1] || 0,
					b: results[2] || 0
				}).toHsv();

				node.state.light_hue = hsv.h / 360;
				node.state.light_saturation = hsv.s;

				// Continue initializing the device
				callback();
			});
		}
	}
});

function hueCommandSetParser(value, node) {
	return tinycolor({
		h: value * 360,
		s: (node.state.light_saturation || 1) * 100,
		v: (node.state.dim || 1) * 100,
	}).toRgb();
}

function saturationCommandSetParser(value, node) {
	return tinycolor({
		h: (node.state.light_hue || 0) * 360,
		s: value * 100,
		v: (node.state.dim || 1) * 100,
	}).toRgb();
}

function map(inputStart, inputEnd, outputStart, outputEnd, input) {
	return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
}