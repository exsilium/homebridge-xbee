var accessories = require('./accessories');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerPlatform("homebridge-xbee", "XBee", XBeePlatform);
  xbee = require('./xbee');
}

function XBeePlatform(log, config) {
  // If parameters are not sent, just return the xbee object for interfacing
  if(log === undefined && config === undefined) {
    return xbee;
  }
  
  // Normal Platform initialization
  this.log = log;
  this.devices = config["devices"];
  
  log("Starting discovery...");
  xbee.init(log, config.port , config.baudrate, config.api_mode, config.timeout || 5000);
}

XBeePlatform.prototype = {
  accessories: function(callback) {
    var foundAccessories = [];
    var count = this.devices.length;
    
    for(index=0; index< count; ++index) {
      if(this.devices[index].accessory === "PushButton") {
		    var accessory = new accessories.PushButtonAccessory(this.log, this.devices[index]);
		    foundAccessories.push(accessory);
      }
      else if(this.devices[index].accessory === "Switch") {
        var accessory = new accessories.SwitchAccessory(this.log, this.devices[index]);
		    foundAccessories.push(accessory);
      }
	  }
	
	  callback(foundAccessories);
  }
}
