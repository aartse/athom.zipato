"use strict";

//Athom includes
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class ZipatoDevice extends ZwaveDevice {

  onMeshInit() {
    
    //this.enableDebug();
    //this.printNode();
    
    /*
    ================================================================
    Registering on/off and dim
    ================================================================
    */
    
    this.registerCapability('onoff', 'SWITCH_MULTILEVEL');
    this.registerCapability('dim', 'SWITCH_MULTILEVEL');
    
    this.registerMultipleCapabilityListener(['light_saturation', 'light_hue', 'light_temperature', 'light_mode'], async (newValue, opts) => {
      
      this.log(newValue);
      
    });
  }
}

module.exports = ZipatoDevice;