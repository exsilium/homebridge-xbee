/* The XBee Switch accessory is meant as a simple On/Off switch to manipulate
   one of the many Digital Input/Output pins of a remote XBee radio. 
   
   On  = 4 (Digital output, low)
   Off = 5 (Digital output, high)
*/

/*jslint node: true */

'use strict';

function SwitchAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.buttonName = config["button_name"] || this.name; // fallback to "name" if you didn't specify an exact "button_name"
  this.bitaddress = config["64bitaddress"];
  this.bitnetwork = config["16bitnetwork"];
  this.dio = config["dio"] || "D1"; // fallback to "D1" if configuration doesn't have the DIO defined.
  this.binaryState = 0; // switch state, default is OFF
  this.log("Starting a homebridge-xbee device (Switch) with name '" + this.buttonName + "'...");
  this.switchService;
  this.timeout = 2; // Timeout in seconds
}

SwitchAccessory.prototype.getSwitchState = function(callback) {
  var powerOn = this.binaryState > 0;
  this.log("Switch state for the '%s' is %s", this.buttonName, this.binaryState);
  callback(null, powerOn);
}

SwitchAccessory.prototype.setSwitchState = function(powerOn, callback) {
  var self = this;
  this.binaryState = powerOn ? 1 : 0;
  this.log("Set switch state on the '%s' to %s", this.buttonName, this.binaryState);
  callback(null);

  xbee.dio(this.bitaddress, this.bitnetwork, this.dio, this.binaryState, null);
}

SwitchAccessory.prototype.getServices = function() {
    this.switchService = new Service.Switch(this.buttonName);

    this.switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getSwitchState.bind(this))
      .on('set', this.setSwitchState.bind(this));

    return [this.switchService];
}

module.exports = SwitchAccessory;