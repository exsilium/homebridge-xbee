// xbee.js
// Load dependencies
var SP = require('serialport');
var xbee_api = require('xbee-api');
var util = require('util');

var C = xbee_api.constants;

// xbee.js scoped variables
var xbeeAPI
    , serialPort
    , discoveryTimer
    , logOutput;

// Open serial and query the Network Discovery BackOff timer (NT) and
// fire off a Network Discovery (ND)
var xbeeInit = function (log, port, baudrate, api_mode) {
  logOutput = log;
  xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: api_mode
  });
  
  serialPort = new SP(port, {
    baudrate: baudrate,
    parser: xbeeAPI.rawParser()
  });
  
  serialPort.on("open", function() {
    log("Serial port open...");
    var sendFrame = {
      type: C.FRAME_TYPE.AT_COMMAND,
      command: "NT",
      commandParameter: []
    };

    setTimeout(function(frame) {
      serialPort.write(xbeeAPI.buildFrame(frame), function(err) {
        if (err) throw (err);
      });
    }, 400, sendFrame);
  });
    
  xbeeAPI.on("frame_object", listenerNT);
}

var listenerNT = function(frame) {
  if(frame.type == 0x88 && frame.command == 'NT' && frame.commandStatus == 0) {
    // NT valid value range is 0x20 - 0xFF * 100ms, 0x3c being default
    discoveryTimer = (frame.commandData[1] & 0xff) * 100 + 1000;
    logOutput("Discovery timer set to: " + discoveryTimer);
    xbeeAPI.removeListener("frame_object", listenerNT);
    xbeeDiscover();
  }
}

var listenerND = function(frame) {
  if(frame.type == 0x88 && frame.command == 'ND' && frame.commandStatus == 0) {
    logOutput("Discovered device: " + frame.nodeIdentification.remote64 + " (" + frame.nodeIdentification.remote16 + ") (" + frame.nodeIdentification.nodeIdentifier + ")");
  }
}

var xbeeDiscover = function(log) {
  if(xbeeAPI && serialPort) {
      var sendFrame = { type: C.FRAME_TYPE.AT_COMMAND, command: "ND", commandParameter: [] };
      serialPort.write(xbeeAPI.buildFrame(sendFrame), function(err) { if (err) throw (err); });
      
      xbeeAPI.on("frame_object", listenerND);
      setTimeout(function() { 
        xbeeAPI.removeListener("frame_object", listenerND);
      }, discoveryTimer);
  } 
  else {
    log("ERROR: XBee init has failed?");
  }
}

var xbeeListenersCount = function() {
  return xbeeAPI.listeners("frame_object").length;
}

var xbeeTrigger = function(destination64, destination16) {
  if(xbeeAPI && serialPort) {
    // We send the trigger frame
    var dataArray = new Uint8Array(100);
    dataArray[0] = 0x03;

    var frame_obj = {
      type: C.FRAME_TYPE.EXPLICIT_ADDRESSING_ZIGBEE_COMMAND_FRAME,
      destination64: destination64,
      destination16: destination16,
      sourceEndpoint: 0xE8,
      destinationEndpoint: 0xEA,
      clusterId: 0x0006,
      profileId: 0xEAA4,
      data: dataArray
    };
    serialPort.write(xbeeAPI.buildFrame(frame_obj));
  }
}

module.exports = {
  init: function (log, port, baudrate, api_mode) { xbeeInit(log, port, baudrate, api_mode); },
  listenersCount: function() { return xbeeListenersCount(); },
  trigger: function (destination64, destination16) { xbeeTrigger(destination64, destination16); }
};
