# homebridge-xbee

Homebridge-xbee is a prototype phase platform plugin for [Homebridge](https://github.com/nfarina/homebridge). Originally developed in chorus with [pxbee-trigger](https://github.com/exsilium/pxbee-trigger) for swing and slide gate automation triggering.

## Prerequisites

* A working XBee device network with access to one of the nodes via serial port
* API mode operation

## Installation

1. Install the npm module globally: `npm install -g homebridge-xbee`
2. Configure your Homebridge config.json file
3. (Re)launch Homebridge

## Configuration

Please see `config-sample.json` for plugin specific configuration sample.

## Use

Currently included `PushButtonAccessory` is an impulse-type switch which when set to "On" state will send a trigger signal to the address defined in plugin configuration. After 1 second, the accessory will go back to "Off" state, no signals are sent during that phase. This can be desired state when automating older equipment which only act on impulse, e.g. automatic door openers.

![Example screenshot](doc/screenshot01.png)

## Trigger signal

Currently, the trigger signal is hard-coded with the following parameters:

```
sourceEndpoint: 0xE8,
destinationEndpoint: 0xEA,
clusterId: 0x0006,
profileId: 0x0104,
data: 0x01 0xAB 0x01
```

This reflects the signal expected by pxbee-trigger project. In the future, homebridge-xbee will have more options to configure the frames depending on the accessory device.

# Contributing

Intrigued? Have some XBees doing nothing? Love HomeKit and Homebridge? - Feel free to contribute by sending pull requests to get this project going in a more generic direction. Or just open an issue if you have more questions or ideas.

# License

Copyright (c) 2016 - 2017, Sten Feldman
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.