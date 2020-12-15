"use strict";

//includes
const { ZwaveLightDevice } = require('homey-zwavedriver');

class ZipatoDevice extends ZwaveLightDevice {

  async onNodeInit() {

    //this.enableDebug();
    //this.printNode();

    await super.onNodeInit({ node });
  }
}

module.exports = ZipatoDevice;