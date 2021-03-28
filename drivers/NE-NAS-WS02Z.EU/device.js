'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

module.exports = class ZipatoDevice extends ZwaveDevice {

  async onNodeInit() {
    this.registerCapability('alarm_water', 'SENSOR_BINARY');
    this.registerCapability('measure_battery', 'BATTERY');
  }

};
