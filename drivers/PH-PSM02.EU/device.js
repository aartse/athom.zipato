'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

//https://www.zipato.com/wp-content/uploads/2015/09/ph-psm02-Zipato-Multisensor-Quad-User-Manual-v1.4.pdf

//https://products.z-wavealliance.org/products/2433?selectedFrequencyId=-1 (ph-psm02.eu)
//https://products.z-wavealliance.org/products/1449?selectedFrequencyId=-1 (PST02-1A)
//https://products.z-wavealliance.org/products/1090?selectedFrequencyId=-1 (PST02-1B)
//https://products.z-wavealliance.org/products/1092?selectedFrequencyId=-1 (PST02-1C)

class ZipatoDevice extends ZwaveDevice {

	async onNodeInit() {

		this.enableDebug();
		this.printNode();

		this.registerCapability('alarm_motion', 'NOTIFICATION', {
			reportParser: report => {
				if (
					report
					&& report['Notification Type'] === 'Home Security'
					&& report.hasOwnProperty('Event (Parsed)')
					) {
					if (
						report['Event (Parsed)'] === 'Motion Detection'
						|| report['Event (Parsed)'] === 'Motion Detection, Unknown Location'
					) {
						return true;
					}
				
					// this device sends event 254 when motion is off
					if (
						(report['Event (Parsed)'] === 'Event inactive' || report['Event'] === 254)
						&& (!report.hasOwnProperty('Event Parameter')
						|| typeof report['Event Parameter'][0] === 'undefined'
						|| report['Event Parameter'][0] === 7
						|| report['Event Parameter'][0] === 8)
					) {
						return false;
					}
					}
					return null;
			}
		});
		this.registerCapability('alarm_motion', 'SENSOR_BINARY');
		this.registerCapability('alarm_contact', 'NOTIFICATION');
		this.registerCapability('alarm_contact', 'SENSOR_BINARY');
		this.registerCapability('alarm_tamper', 'NOTIFICATION');
		this.registerCapability('alarm_tamper', 'SENSOR_BINARY');

		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_battery', 'BATTERY');

		//turn tamper alarm off
		this.homey.flow.getActionCard('PH-PSM02.EU-turn_alarm_tamper_off')
		  .registerRunListener(( args, state ) => {
			this.setCapabilityValue('alarm_tamper', false);
		  });
	}

	async onSettings({oldSettings, newSettings, changedKeys}) {

		// settings operation mode (NO. 5)
		if (changedKeys.includes('run_mode') || changedKeys.includes('test_mode')
		  || changedKeys.includes('disable_door_function') || changedKeys.includes('temperature_scale')
		  || changedKeys.includes('disable_illumination_report_after_trigger') || changedKeys.includes('disable_temperature_report_after_trigger')
		  || changedKeys.includes('disable_back_key_test_mode')) {
		  let parsedValue = 0;
		  if (newSettings.run_mode === '1') parsedValue += 1;
		  if (newSettings.test_mode) parsedValue += 2;
		  if (newSettings.disable_door_function) parsedValue += 4;
		  if (newSettings.temperature_scale === '1') parsedValue += 8;
		  if (newSettings.disable_illumination_report_after_trigger) parsedValue += 16;
		  if (newSettings.disable_temperature_report_after_trigger) parsedValue += 32;
		  if (newSettings.disable_back_key_test_mode) parsedValue += 128;
	
		  await this.configurationSet({
			"index": 5,
			"size": 1,
			"signed": false
		  }, parsedValue);
	
		  changedKeys = changedKeys.filter(changedKey => ![
			  'run_mode',
			  'test_mode',
			  'disable_door_function',
			  'temperature_scale',
			  'disable_illumination_report_after_trigger',
			  'disable_temperature_report_after_trigger',
			  'disable_back_key_test_mode'
			].includes(changedKey));
		}

		// settings operation mode (NO. 6)
		if (changedKeys.includes('disable_magnetic_integrate_illumination') || changedKeys.includes('disable_pir_integrate_illumination')
		  || changedKeys.includes('disable_magnetic_integrate_pir') || changedKeys.includes('device_and_lighting_same_room')
		  || changedKeys.includes('disable_delay_to_turn_off_lights') || changedKeys.includes('disable_auto_turn_off_the_light')) {
		  let parsedValue = 0;
		  if (newSettings.disable_magnetic_integrate_illumination) parsedValue += 1;
		  if (newSettings.disable_pir_integrate_illumination) parsedValue += 2;
		  if (newSettings.disable_magnetic_integrate_pir) parsedValue += 4;
		  if (newSettings.device_and_lighting_same_room) parsedValue += 8;
		  if (newSettings.disable_delay_to_turn_off_lights) parsedValue += 16;
		  if (newSettings.disable_auto_turn_off_the_light) parsedValue += 32;
	
		  await this.configurationSet({
			"index": 6,
			"size": 1,
			"signed": false
		  }, parsedValue);
	
		  changedKeys = changedKeys.filter(changedKey => ![
			  'disable_magnetic_integrate_illumination',
			  'disable_pir_integrate_illumination',
			  'disable_magnetic_integrate_pir',
			  'device_and_lighting_same_room',
			  'disable_delay_to_turn_off_lights',
			  'disable_auto_turn_off_the_light'
			].includes(changedKey));
		}

		// settings operation mode (NO. 7)
		if (changedKeys.includes('enable_sending_motion_off_report') || changedKeys.includes('enable_pir_super_sensitivity_mode')
		  || changedKeys.includes('disable_send_basic_off_after_door_closed') || changedKeys.includes('notification_type')
		  || changedKeys.includes('disable_multi_cc_in_auto_report') || changedKeys.includes('disable_battery_report_on_trigger')) {
		  let parsedValue = 0;
		  if (newSettings.enable_sending_motion_off_report) parsedValue += 2;
		  if (newSettings.enable_pir_super_sensitivity_mode) parsedValue += 4;
		  if (newSettings.disable_send_basic_off_after_door_closed) parsedValue += 8;
		  if (newSettings.notification_type === '1') parsedValue += 16;
		  if (newSettings.disable_multi_cc_in_auto_report) parsedValue += 32;
		  if (newSettings.disable_battery_report_on_trigger) parsedValue += 64;
	
		  await this.configurationSet({
			"index": 7,
			"size": 1,
			"signed": false
		  }, parsedValue);
	
		  changedKeys = changedKeys.filter(changedKey => ![
			  'enable_sending_motion_off_report',
			  'enable_pir_super_sensitivity_mode',
			  'disable_send_basic_off_after_door_closed',
			  'notification_type',
			  'disable_multi_cc_in_auto_report',
			  'disable_battery_report_on_trigger'
			].includes(changedKey));
		}
	
		return super.onSettings({oldSettings, newSettings, changedKeys});
	  }
}

module.exports = ZipatoDevice;
