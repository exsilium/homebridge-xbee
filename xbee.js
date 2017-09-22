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
    , logOutput
    , localTimeout
    , listenerNTTimeout;

// Open serial and query the Network Discovery BackOff timer (NT) and
// fire off a Network Discovery (ND)
var xbeeInit = function (log, port, baudrate, api_mode, timeout) {
  logOutput = log;
  localTimeout = timeout;
  xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: api_mode
  });

  if(port === "") {
    // Fall back to a virtual port
    SP = require('virtual-serialport');
  }
  
  serialPort = new SP(port, {
    baudrate: baudrate,
    parser: xbeeAPI.rawParser()
  });
  
  if(port === "") {
    serialPort.on("data", function(data) {
      console.log("Computer received: " + data);
    });

    var raw_frame = new Buffer([
    0x7E, 0x00, 0x13, 0x97, 0x55, 0x00, 0x13, 0xA2, 0x00, 0x40, 0x52, 0x2B,
    0xAA, 0x7D, 0x84, 0x53, 0x4C, 0x00, 0x40, 0x52, 0x2B, 0xAA, 0xF0]);
    
    serialPort.on("dataToDevice", function(data) {
      logOutput("Mock NT command received:")
      logOutput(data);
      serialPort.writeToComputer("BLEEP!");
  });
  }
  
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
    
  listenerNTTimeout = setTimeout(function() { 
    xbeeAPI.removeListener("frame_object", listenerNT);
    logOutput.error("Unable to retrieve NT value from XBee radio, XBee Platform init failed!");
  }, localTimeout);
  xbeeAPI.on("frame_object", listenerNT);
}

var listenerNT = function(frame) {
  if(frame.type == 0x88 && frame.command == 'NT' && frame.commandStatus == 0) {
    // NT valid value range is 0x20 - 0xFF * 100ms, 0x3c being default
    discoveryTimer = (frame.commandData[1] & 0xff) * 100 + 1000;
    logOutput("Discovery timer set to: " + discoveryTimer);
    xbeeAPI.removeListener("frame_object", listenerNT);
    clearTimeout(listenerNTTimeout);
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
        logOutput("Device discovery completed!");
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
    var dataArray = new Uint8Array(3);
    dataArray[0] = 0x01;
    dataArray[1] = 0xAB;
    dataArray[2] = 0x01;

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
  init: function (log, port, baudrate, api_mode, timeout) { xbeeInit(log, port, baudrate, api_mode, timeout); },
  listenersCount: function() { return xbeeListenersCount(); },
  trigger: function (destination64, destination16) { xbeeTrigger(destination64, destination16); }
};
