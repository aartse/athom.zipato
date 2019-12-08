"use strict";

const Homey = require('homey');

// @TODO: TEST!

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

	async onMeshInit() {

		this.enableDebug();
		this.printNode();

		// register the measure_battery capability with COMMAND_CLASS_BATTERY
		this.registerCapability('measure_battery', 'BATTERY');

		// register notification report for alarm
		this.registerReportListener('NOTIFICATION', 'NOTIFICATION_REPORT', (rawReport) => {
			if (rawReport['Notification Type'] === 'Emergency' && rawReport['Event (Parsed)'] === 'Contact Medical Service') {
				this.emergencyAlarmTrigger.trigger(this, {}, {}, (err, result) => {
					if (err) {
						this.log(err);
						return Homey.error(err);
					}
				});
			};
		});
		this.emergencyAlarmTrigger = new Homey.FlowCardTriggerDevice('PH.PSR03-1B.EU-emergency_alarm').register();

		// register simple av controle for handling buttons
		this.registerReportListener('SIMPLE_AV_CONTROL', 'SIMPLE_AV_CONTROL_SET', (rawReport) => {

			console.log(rawReport);

			//check for mandatory params
			if (typeof rawReport['Variant Group'] === 'undefined' || rawReport['Variant Group'].length === 0 || typeof rawReport['Variant Group'][0]['Command'] === 'undefined') {
				return;
			}

			let pressedGroup = null;
			let pressedButtonNumber = null;
			let pressedButtonLocation = null;

			switch (rawReport['Variant Group'][0]['Command']) {

				//Group-Button 1
				case 3: // 1 - Top-left (Volume Up)
					pressedGroup = 1;
					pressedButtonNumber = 1;
					pressedButtonLocation = 'top-left';
				break;

				case 2: // 3 - Bottom-left (Volume Down)
					pressedGroup = 1;
					pressedButtonNumber = 3;
					pressedButtonLocation = 'bottom-left';
				break;

				case 4: // 2 -Top-right (Channel Up)
					pressedGroup = 1;
					pressedButtonNumber = 2;
					pressedButtonLocation = 'top-right';
				break;

				case 5: // 4 - Bottom-right (Channel Down)
					pressedGroup = 1;
					pressedButtonNumber = 4;
					pressedButtonLocation = 'bottom-right';
				break;

				//Group-Button 2
				case 19: // 5 - Top-left (Play)
					pressedGroup = 2
					pressedButtonNumber = 5;
					pressedButtonLocation = 'top-left';
				break;

				case 20: // 7 - Bottom-left (Stop)
					pressedGroup = 2;
					pressedButtonNumber = 7;
					pressedButtonLocation = 'bottom-left';
				break;

				case 22: // 6 - Top-right (Fast Forward)
					pressedGroup = 2;
					pressedButtonNumber = 6;
					pressedButtonLocation = 'top-right';
				break;

				case 23: // 8 - Bottom-right (Rewind)
					pressedGroup = 2;
					pressedButtonNumber = 8;
					pressedButtonLocation = 'bottom-right';
				break;
			}

			const state = {
				button_number: pressedButtonNumber
			};

			const tokens = {
				button_group: pressedGroup,
				button_number: pressedButtonNumber,
				button_location: pressedButtonLocation,
			}

			let trigger = 'pressed';
			if (typeof rawReport['Properties1'] !== 'undefined' && typeof rawReport['Properties1']['Key Attributes'] !== 'undefined') {
				if (rawReport['Properties1']['Key Attributes'] === 2) {
					trigger = 'long_started';
				}
				if (rawReport['Properties1']['Key Attributes'] === 1) {
					trigger = 'long_ended';
				}
			}

			//trigger
			this.buttonTriggers[trigger].trigger(this, tokens, state, (err, result) => {
				if (err) {
					this.log(err);
					return Homey.error(err);
				}
			});
		});

		this.buttonTriggers = {
			'pressed': this.createButtonTrigger('pressed'),
			'long_started': this.createButtonTrigger('long_started'),
			'long_ended': this.createButtonTrigger('long_ended')
		}
	}

	createButtonTrigger(name)
	{
		let trigger = new Homey.FlowCardTriggerDevice('PH.PSR03-1B.EU-' + name);
		trigger.registerRunListener(( args, state ) => {

		    // If true, this flow should run
		    return Promise.resolve( args.button_number === '0' || args.button_number === state.button_number.toString() );
		})
		.register();

		return trigger;
	}
}

module.exports = ZipatoDevice;