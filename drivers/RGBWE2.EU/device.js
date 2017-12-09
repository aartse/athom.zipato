"use strict";

const util = require('homey-meshdriver').Util;
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const tinycolor 	= require("tinycolor2");

function map(inputStart, inputEnd, outputStart, outputEnd, input) {
	return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
}

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		//this.enableDebug();
		//this.printNode();

		// register the onoff capability with SWITCH_MULTILEVEL
		// override default setParser functions to prevent sending double on commands on flow
		this.registerCapability('onoff', 'SWITCH_MULTILEVEL', {
			setParser(value) {
                // prevent sending double on commands
                // Because setting a color in the flow will not work properly when sending 2 on/enable commands
                if (this.getCapabilityValue('onoff') && value) {
                    return;
                }

				return {
					Value: (value) ? 'on/enable' : 'off/disable',					
				}
			},
			setParserV2(value, options) {
                // prevent sending double on commands
                // Because setting a color in the flow will not work properly when sending 2 on/enable commands
                if (this.getCapabilityValue('onoff') && value) {
                    return;
                }

				const duration = (options.hasOwnProperty('duration') ? util.calculateZwaveDimDuration(options.duration) : 'Factory default');
				return {
					Value: (value) ? 'on/enable' : 'off/disable',
					'Dimming Duration': duration,
				};
			}
		});

		// register the dim capability with SWITCH_MULTILEVEL
		this.registerCapability('dim', 'SWITCH_MULTILEVEL');

		// register the light_hue, light_saturation, light_temperature capability with SWITCH_COLOR
		this.registerCapability('light_hue', 'SWITCH_COLOR');
		this.registerCapability('light_saturation', 'SWITCH_COLOR');
		this.registerCapability('light_temperature', 'SWITCH_COLOR');

		//this._initColors();
	}

	/**
	 * @private
	 */
	_initColors() {
		// Get WW
		const wwPromise = new Promise(resolve => {
			this.getCommandClass('SWITCH_COLOR').SWITCH_COLOR_GET({
				'Color Component ID': 0
			}, (err, result) => {
				if (result) return resolve(result['Value'] || 0);
				return resolve(0);
			});
		});

		// get CW
		const cwPromise = new Promise(resolve => {
			this.getCommandClass('SWITCH_COLOR').SWITCH_COLOR_GET({
				'Color Component ID': 1
			}, (err, result) => {
				if (result) return resolve(result['Value'] || 0);
				return resolve(0);
			});
		});

		// Wait for all white values to arrive
		Promise.all([wwPromise, cwPromise]).then(results => {

			// Determine light_temperature
			if (results[0] !== 0) {
				this.setCapabilityValue('light_temperature', map(10, 255, 0.5, 1, results[0]));
			} else {
				this.setCapabilityValue('light_temperature', map(255, 10, 0, 0.5, results[1]));
			}
		}).catch(err => {
			this.log(err.message);
		});

		// Get R
		const rPromise = new Promise(resolve => {
			this.getCommandClass('SWITCH_COLOR').SWITCH_COLOR_GET({
				'Color Component ID': 2
			}, (err, result) => {
				if (result) return resolve(result['Value'] || 0);
				return resolve(0);
			});
		});

		// Get G
		const gPromise = new Promise(resolve => {
			this.getCommandClass('SWITCH_COLOR').SWITCH_COLOR_GET({
				'Color Component ID': 3
			}, (err, result) => {
				if (result) return resolve(result['Value'] || 0);
				return resolve(0);
			});
		});

		// Get B
		const bPromise = new Promise(resolve => {
			this.getCommandClass('SWITCH_COLOR').SWITCH_COLOR_GET({
				'Color Component ID': 4
			}, (err, result) => {
				if (result) return resolve(result['Value'] || 0);
				return resolve(0);
			});
		});

		// Wait for all RGB values to arrive
		Promise.all([rPromise, gPromise, bPromise]).then(results => {

			let hsv = util.convertRGBToHSV({
				red: results[0] || 0,
				green: results[1] || 0,
				blue: results[2] || 0
			});

			this.setCapabilityValue('light_hue', hsv.hue);
			this.setCapabilityValue('light_saturation', hsv.saturation);
		}).catch(err => {
			this.log(err.message);
		});
	}
}

module.exports = ZipatoDevice;