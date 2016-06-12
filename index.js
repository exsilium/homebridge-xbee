var Service, Characteristic, uuid;

var inherits = require('util').inherits;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  uuid = homebridge.hap.uuid;

  fixInheritance(PBPlatform.PushButton, Characteristic);
  fixInheritance(PBPlatform.PushButtonService, Service);

  homebridge.registerAccessory("homebridge-pushbutton", "PushButton", PushButtonAccessory);
  homebridge.registerPlatform("homebridge-pushbutton", "PushButton", PBPlatform);
}

function fixInheritance(subclass, superclass) {
    var proto = subclass.prototype;
    inherits(subclass, superclass);
    subclass.prototype.parent = superclass.prototype;
    for (var mn in proto) {
        subclass.prototype[mn] = proto[mn];
    }
}

function PBPlatform(log, config) {
  this.log = log;
  this.config = config;
}

function PushButtonAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.buttonName = config["button_name"] || this.name;
  this.log("Starting a PushButton device with name '" + this.buttonName + "'...");
}

PushButtonAccessory.prototype.Activate = function(activation, callback) {
  this.log("Received signal on '%s' = %s", this.buttonName, activation);
  callback(null);
}

PushButtonAccessory.prototype.getServices = function() {
    var pushButtonService = new PBPlatform.PushButtonService(this.name);

    pushButtonService
      .getCharacteristic(PBPlatform.PushButton)
      .on('set', this.Activate.bind(this));

    return [pushButtonService];
}

//

PBPlatform.PushButton = function() {
  var charUUID = uuid.generate('PBPlatform:customchar:PushButton');
  Characteristic.call(this, 'Activate', charUUID);
  this.setProps({
    format: Characteristic.Formats.BOOL,
    perms: [Characteristic.Perms.WRITE]
  });
  this.value = this.getDefaultValue();
};

PBPlatform.PushButtonService = function(displayName, subtype) {
  var serviceUUID = uuid.generate('PBPlatform:customservice:PushButtonService')
  Service.call(this, displayName, serviceUUID, subtype);

  // Required Characteristics
  this.addCharacteristic(PBPlatform.PushButton);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.Name);
};

//
