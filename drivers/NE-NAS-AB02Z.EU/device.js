'use strict';

const TAMPER_TIMEOUT = 30 * 1000;

const { ZwaveDevice } = require('homey-zwavedriver');

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
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-turn_alarm_on')
      .registerRunListener(( args, state ) => {
        return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
          'Switch Value': 255
        });
      });

    //turn alarm off
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-turn_alarm_off')
      .registerRunListener(( args, state ) => {
        return args.device.getCommandClass("SWITCH_BINARY").SWITCH_BINARY_SET({
          'Switch Value': 0
        });
      });

    //set alarm sound
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-alarm_sound')
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 5,
          size: 1,
        }, args.sound);
      });

    //set doorbell sound
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-doorbell_sound')
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 6,
          size: 1,
        }, args.sound);
      });

    //alarm_duration
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-alarm_duration')
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 2,
          size: 1,
        }, args.duration);
      });

    //doorbell_duration
    this.homey.flow.getActionCard('NE-NAS-AB02Z.EU-doorbell_duration')
      .registerRunListener((args, state) => {
        return this.configurationSet({
          index: 3,
          size: 1,
        }, args.duration);
      });
  }
}

module.exports = ZipatoDevice;