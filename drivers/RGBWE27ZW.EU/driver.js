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
		},

		'light_hue': {
			'command_class'				: 'COMMAND_CLASS_SWITCH_COLOR',
			'command_get'				: 'SWITCH_COLOR_GET',
			'command_get_parser'		: () => {
				return {
					'Color Component ID': 2
				}
			},
			'command_set'				: 'SWITCH_COLOR_SET',
			'command_set_parser'		: (value, node) => {
				
				// Convert updated hue to rgb
				const rgb = hueCommandSetParser(value, node);

				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'Variant Group': [
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
			},
			'command_report'			: 'SWITCH_COLOR_REPORT',
			'command_report_parser'		: function( report, node ){
				Homey.log(report);
				Homey.log(node);
				return report["Value"];
			}
		},
		light_saturation: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_get: 'SWITCH_COLOR_GET',
			command_get_parser: () => {

				// TODO
				return {
					'Color Component ID': 2
				}
			},
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {

				// Convert updated saturation to rgb
				const rgb = saturationCommandSetParser(value, node);

				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'Variant Group': [
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
			},
			command_report: 'SWITCH_COLOR_REPORT',
			command_report_parser: report => {
				// TODO
			}
		},
		light_temperature: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_get: 'SWITCH_COLOR_GET',
			command_get_parser: () => {

				// TODO
				return {
					'Color Component ID': 2
				}
			},
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {
				console.log(value);

				// If value above 0.5 construct warm white value
				const ww = (value >= 0.5) ? map(0.5, 1, 0, 255, value) : 0;

				// If value below 0.5 construct cool white value
				const cw = (value < 0.5) ? map(0, 0.5, 0, 255, value) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: ( node.state.light_hue || 1) * 100,
					s: ( node.state.light_saturation || 1 ) * 100,
					v: ( node.state.dim || 1 ) * 100
				}).toRgb();

				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'Variant Group': [
						{
							'Color Component ID': 0, // WW
							'Value': ww
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw
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
			},
			command_report: 'SWITCH_COLOR_REPORT',
			command_report_parser: report => {
				// TODO
			}
		},
		light_mode: {
			command_class: 'COMMAND_CLASS_SWITCH_COLOR',
			command_get: 'SWITCH_COLOR_GET',
			command_get_parser: () => {

				// TODO
				return {
					'Color Component ID': 2
				}
			},
			command_set: 'SWITCH_COLOR_SET',
			command_set_parser: (value, node) => {
				console.log(value);

				// If value above 0.5 construct warm white value
				const ww = (value >= 0.5) ? map(0.5, 1, 0, 255, value) : 0;

				// If value below 0.5 construct cool white value
				const cw = (value < 0.5) ? map(0, 0.5, 0, 255, value) : 0;

				// Get rgb object from node state
				const rgb = tinycolor({
					h: ( node.state.light_hue || 1) * 100,
					s: ( node.state.light_saturation || 1 ) * 100,
					v: ( node.state.dim || 1 ) * 100
				}).toRgb();

				return {
					'Properties1': {
						'Color Component Count': 5
					},
					'Variant Group': [
						{
							'Color Component ID': 0, // WW
							'Value': ww
						},
						{
							'Color Component ID': 1, // CW
							'Value': cw
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
			},
			command_report: 'SWITCH_COLOR_REPORT',
			command_report_parser: report => {
				// TODO
			}
		}		
	}
})

function hueCommandSetParser(value, node) {
	return tinycolor({
		h: value * 360,
		s: ( node.state.light_saturation || 1 ) * 100,
		v: ( node.state.dim || 1 ) * 100
	}).toRgb();
}

var colorCache = {};
function saturationCommandSetParser(value, node) {
	return tinycolor({
		h: ( node.state.light_hue || 0 ) * 360,
		s: value * 100,
		v: ( node.state.dim || 1 ) * 100
	}).toRgb();
}
function colorCommandSetParser(color, value, node) {
	var rgb = tinycolor({
		h: value * 360,
		s: ( node.state.light_satuaration || 1 ) * 100,
		v: ( node.state.light_dim || 1 ) * 100
	}).toRgb();

	return {
		'Value': Math.round(( rgb[color] / 255 ) * 99)
	}
}

function colorCommandReportParser(color, report, node) {

	if (typeof report['Value'] === 'string') {
		var value = ( value === 'on/enable' ) ? 1 : 0;
	} else {
		var value = report['Value (Raw)'][0] / 99;
	}

	colorCache[node.randomId] = colorCache[node.randomId] || {};
	colorCache[node.randomId][color] = value * 255;

	var hsv = tinycolor({
		r: colorCache[node.randomId].r || 0,
		g: colorCache[node.randomId].g || 0,
		b: colorCache[node.randomId].b || 0
	}).toHsv();

	return hsv.h / 360;

}

function map(input_start, input_end, output_start, output_end, input) {
	return output_start + ((output_end - output_start) / (input_end - input_start)) * (input - input_start);
}