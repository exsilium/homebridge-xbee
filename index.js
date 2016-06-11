var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-pushbutton", "PushButton", PushButtonAccessory);
}

function PushButtonAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.buttonName = config["button_name"] || this.name; // fallback to "name" if you didn't specify an exact "button_name"
  this.binaryState = 0; // bulb state, default is OFF
  this.log("Starting a PushButton device with name '" + this.buttonName + "'...");
//  this.search();
}

PushButtonAccessory.prototype.getPowerOn = function(callback) {
  var powerOn = this.binaryState > 0;
  this.log("Power state for the '%s' is %s", this.buttonName, this.binaryState);
  callback(null, powerOn);
}

PushButtonAccessory.prototype.setPowerOn = function(powerOn, callback) {
  this.binaryState = powerOn ? 1 : 0; // wemo langauge
  this.log("Set power state on the '%s' to %s", this.buttonName, this.binaryState);
  callback(null);
}

PushButtonAccessory.prototype.getServices = function() {
    var pushButtonService = new Service.Lightbulb(this.name);
    
    pushButtonService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getPowerOn.bind(this))
      .on('set', this.setPowerOn.bind(this));
    
    return [pushButtonService];
}


