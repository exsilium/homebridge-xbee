/*jslint node: true */

'use strict';

function PushButtonAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.buttonName = config["button_name"] || this.name; // fallback to "name" if you didn't specify an exact "button_name"
  this.bitaddress = config["64bitaddress"];
  this.bitnetwork = config["16bitnetwork"];
  this.binaryState = 0; // switch state, default is OFF
  this.log("Starting a homebridge-xbee device (PushButton) with name '" + this.buttonName + "'...");
  this.pushButtonService;
  this.timeout = 2; // Timeout in seconds
}

PushButtonAccessory.prototype.getPowerOn = function(callback) {
  var powerOn = this.binaryState > 0;
  this.log("Power state for the '%s' is %s", this.buttonName, this.binaryState);
  callback(null, powerOn);
}

PushButtonAccessory.prototype.setPowerOn = function(powerOn, callback) {
  var self = this;
  this.binaryState = powerOn ? 1 : 0;
  this.log("Set power state on the '%s' to %s", this.buttonName, this.binaryState);
  callback(null);

  if(powerOn) {
    xbee.trigger(this.bitaddress, this.bitnetwork);
    setTimeout(function() {
      self.log("BEEP! BOOP!");
      self.pushButtonService.getCharacteristic(Characteristic.On).setValue(0);
    }, this.timeout * 1000);
  }
}

PushButtonAccessory.prototype.getServices = function() {
    this.pushButtonService = new Service.Switch(this.name);

    this.pushButtonService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerOn.bind(this))
      .on('set', this.setPowerOn.bind(this));

    return [this.pushButtonService];
}

module.exports = PushButtonAccessory;