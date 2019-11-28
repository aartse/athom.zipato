'use strict';


const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const Homey = require('homey');

const TAMPER_TIMEOUT = 30 * 1000;

class ZipatoDevice extends ZwaveDevice {
  async onMeshInit() {
    this.setCapabilityValue('alarm_tamper', false);

    // this.enableDebug();
    // this.printNode();

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


    this.PlaySoundFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-play_sound').register().registerRunListener((args, state) => {
      return this.node.CommandClass.COMMAND_CLASS_BASIC.BASIC_SET({
        Value: Math.round(args.sound * 1),
      });
      return Promise.reject('Device has no valid command class to play sound');
    });
    this.DisableSirenFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-disable_siren').register().registerRunListener((args, state) => {
      return this.configurationSet({
        index: 29,
        size: 1,
      }, 1);
    });
    this.EnableSirenFlow = new Homey.FlowCardAction('PH-PSE02-1B.EU-enable_siren').register().registerRunListener((args, state) => {
      return this.configurationSet({
        index: 29,
        size: 1,
      }, 0);
    });
  }
}

module.exports = ZipatoDevice;