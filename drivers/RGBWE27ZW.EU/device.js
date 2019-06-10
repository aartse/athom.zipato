"use strict";

//Athom includes
const ZwaveLightDevice = require('homey-meshdriver').ZwaveLightDevice;
const util = require('homey-meshdriver').Util;

class ZipatoDevice extends ZwaveLightDevice {

  async onMeshInit() {
    
    //this.enableDebug();
    //this.printNode();

    await super.onMeshInit();
  }
}

module.exports = ZipatoDevice;