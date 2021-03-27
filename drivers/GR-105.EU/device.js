'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

module.exports = class ZipatoDevice extends ZwaveDevice {

  async onNodeInit() {
    this.registerCapability('onoff', 'SWITCH_MULTILEVEL');
  }

};
