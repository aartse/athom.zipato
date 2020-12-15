'use strict';

const TAMPER_TIMEOUT = 30 * 1000;

const { ZwaveDevice } = require('homey-zwavedriver');

const Homey = require('homey');

class ZipatoDevice extends ZwaveDevice {

  async onNodeInit() {

    this.enableDebug();
    this.printNode();

    this.registerCapability('onoff', 'SWITCH_BINARY');
    this.registerCapability('onoff', 'BASIC');

    // This device does not send a timeout when the tamper period is over. Use a timeout to reset the capability
    this.registerReportListener('SENSOR_BINARY', 'SENSOR_BINARY_REPORT', report => {
      if (!report || !report.hasOwnProperty('Sensor Value') || !report.hasOwnProperty('Sensor Type')) return null;

      if (report['Sensor Type'] === 'Tamper' && report['Sensor Value'] === 'detected an event') {
        this.setCapabilityValue('alarm_tamper', true);
        this.tamperTimeOut = setTimeout(() => {
          this.setCapabilityValue('alarm_tamper', false);
        }, TAMPER_TIMEOUT);
      }
    });

    //turn alarm on
    let turnAlarmOnFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-turn_alarm_on');
    turnAlarmOnFlow
      .register()
      .registerRunListener(( args, state ) => {
        return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
          'Switch Value': 255
        });
      });

    //turn alarm off
    let turnAlarmOffFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-turn_alarm_off');
    turnAlarmOffFlow
      .register()
      .registerRunListener(( args, state ) => {
        return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
          'Switch Value': 0
        });
      });

    //set alarm sound
    let playSoundFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-alarm_sound');
    playSoundFlow
      .register()
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 5,
          size: 1,
        }, args.sound);
      });

    //set doorbell sound
    let playAlarmSoundFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-doorbell_sound');
    playAlarmSoundFlow
      .register()
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 6,
          size: 1,
        }, args.sound);
      });

    //alarm_duration
    let disableSirenFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-alarm_duration')
    disableSirenFlow
      .register()
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 2,
          size: 1,
        }, args.duration);
      });

    //doorbell_duration
    let enableSirenFlow = new Homey.FlowCardAction('NE-NAS-AB02Z.EU-doorbell_duration');
    enableSirenFlow
      .register()
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 3,
          size: 1,
        }, args.duration);
      });
  }
}

module.exports = ZipatoDevice;