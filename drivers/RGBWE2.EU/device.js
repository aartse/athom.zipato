"use strict";

//Athom includes
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;
const util = require('homey-meshdriver').Util;
const Homey = require('homey');

class ZipatoDevice extends ZwaveDevice {

  onMeshInit() {
    
    this.enableDebug();
    this.printNode();
    
    /*
    ================================================================
    Registering on/off and dim
    ================================================================
    */
    this.registerCapability('onoff', 'SWITCH_MULTILEVEL');
    this.registerCapability('dim', 'SWITCH_MULTILEVEL');

    /*
    ================================================================
    Registering multiple capability listener for debounced values
    ================================================================
    */
    this.registerMultipleCapabilityListener(['onoff', 'dim', 'light_saturation', 'light_hue', 'light_temperature', 'light_mode'], async (valueObj, optsObj) => {
      
      try {
        //send SWITCH_MULTILEVEL command for onoff 
        if (valueObj.hasOwnProperty('onoff') && (valueObj.onoff === false || Object.keys(valueObj).length === 1)) {
          await this._sendSwitchMultilevel('onoff', valueObj.onoff, optsObj);
        } else {

          //send SWITCH_MULTILEVEL command for dim
          if (valueObj.hasOwnProperty('dim')) {
            await this._sendSwitchMultilevel('dim', valueObj.dim, optsObj);
          }
              
          //send SWITCH_COLOR command when a light property is set
          if (valueObj.hasOwnProperty('light_saturation') ||
              valueObj.hasOwnProperty('light_hue') ||
              valueObj.hasOwnProperty('light_temperature') ||
              valueObj.hasOwnProperty('light_mode')
              ) {
            await this._sendSwitchColor(valueObj);
          }
        }
      } catch (err) {
        this.log(err);
        return Promise.reject(err);
      }
  
      return Promise.resolve();
    });

    this.registerCapabilityListener('button.factory_reset', async () => {
      return this.configurationSet({
        index: 255,
        size: 4,
        signed: false
      }, 2290649224);
    });    

    /*
    ================================================================
    Triggers
    ================================================================
    */
    let strobeOnFlow = new Homey.FlowCardAction('RGBWE2.EU-strobe_on');
    strobeOnFlow
        .register()
        .registerRunListener(( args, state ) => {

          let oldSettings = {};
          let newSettings = {};
          let changedKeysArr = [];

          args.device.configurationGet({
            index: 2
          }).then(result => {
            console.log(result);
          });

          args.device.configurationGet({
            index: 3
          }).then(result => {
            console.log(result);
          });

          args.device.configurationGet({
            index: 4
          }).then(result => {
            console.log(result);
          });

          var promises = [];

          //Speed of strobes
          if (args.hasOwnProperty('speed') && args.speed !== '') {
            promises.push(args.device.configurationSet({
              index: 2,
              size: 1
            }, args.speed));
          }

          //Random color
          if (args.hasOwnProperty('random_color') && args.random_color !== '') {
            promises.push(args.device.configurationSet({
              index: 4,
              size: 1
            }, args.random_color));
          }

          //Number of strobes
          if (args.hasOwnProperty('count') && args.count !== '') {
            promises.push(args.device.configurationSet({
              index: 3,
              size: 1
            }, args.count));
          }

          return Promise.all(promises);
        });

    let strobeOffFlow = new Homey.FlowCardAction('RGBWE2.EU-strobe_off');
    strobeOffFlow
        .register()
        .registerRunListener(( args, state ) => {
          return args.device.onSettings({config_param_3:127},{config_param_3:0},['config_param_3'])
        });
  }
  
  async _sendSwitchMultilevel(capability, value, opts) {
    const capabilitySetObj = this._getCapabilityObj("set", capability, "SWITCH_MULTILEVEL");
    if (capabilitySetObj instanceof Error) return capabilitySetObj;

    const parsedPayload = capabilitySetObj.parser.call(this, value, opts);
    if (parsedPayload instanceof Error) return Promise.reject(parsedPayload);

    const commandClass = capabilitySetObj.node.CommandClass[`COMMAND_CLASS_${capabilitySetObj.commandClassId}`];
    const command = commandClass[capabilitySetObj.commandId];
    return await command.call(command, parsedPayload);
  }
  
  /**
   * 
   */
  async _sendSwitchColor(values) {

    //array for all light capabilities
    var lightCapabilities = [];

    //add default light capabilities
    ['light_hue','light_saturation','light_temperature','light_mode'].forEach(capability => {
      if (this.hasCapability(capability)) {
        lightCapabilities[capability] = (values.hasOwnProperty(capability) ? values[capability] : this.getCapabilityValue(capability));
      }

    },this);

    //default values
    let rgb = {
      red: 0,
      green: 0,
      blue: 0
    };
    let white = {
      ww: 0,
      cw: 0
    };

    //set RGB when light_mode is not set or is set to color
    //use convertHSVToRGB to calculate rgb value. Unknown or not used lightcapabilities are also handled by this method
    if (lightCapabilities.hasOwnProperty("light_mode") == false || lightCapabilities.light_mode === "color" || lightCapabilities.light_mode === null) {
      rgb = util.convertHSVToRGB({
        hue: lightCapabilities.light_hue,
        saturation: lightCapabilities.light_saturation,
        value: lightCapabilities.dim
      });
    }

    //set white when capability light_mode is not available and light temperature is set
    //or light temperature is known and light mode is set to temperature
    //light_mode is used for devices which cannot handle white and rgb colors at the same time
    if ((values.hasOwnProperty("light_temperature") && lightCapabilities.hasOwnProperty("light_mode") == false) || (lightCapabilities.hasOwnProperty("light_temperature") && lightCapabilities.light_mode === "temperature")) {
      white.ww = (lightCapabilities.light_temperature >= 0.5) ? this._map(0.5, 1, 10, 255, lightCapabilities.light_temperature) : 0;
      white.cw = (lightCapabilities.light_temperature < 0.5) ? this._map(0, 0.5, 255, 10, lightCapabilities.light_temperature) : 0;
    }
    
    return await this.getCommandClass("SWITCH_COLOR").SWITCH_COLOR_SET({
      'Properties1': {
        'Color Component Count': 5
      },
      'vg1': [
        {
          'Color Component ID': 0,
          'Value': white.ww
        },
        {
          'Color Component ID': 1,
          'Value': white.cw
        },
        {
          'Color Component ID': 2,
          'Value': rgb.red
        },
        {
          'Color Component ID': 3,
          'Value': rgb.green
        },
        {
          'Color Component ID': 4,
          'Value': rgb.blue
        }
      ]
    });
  }
  
  /**
   * map function for calculating the right white value
   * @param inputStart
   * @param inputEnd
   * @param outputStart
   * @param outputEnd
   * @param input
   * @private
   */
  _map(inputStart, inputEnd, outputStart, outputEnd, input) {
    return outputStart + ((outputEnd - outputStart) / (inputEnd - inputStart)) * (input - inputStart);
  }
  
}

module.exports = ZipatoDevice;