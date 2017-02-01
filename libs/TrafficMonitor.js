"use strict";

const spawn = require('child_process').spawn;
const log4js = require('log4js');
const EventEmitter = require('events');

const logger = log4js.getLogger('TrafficMonitor');
const bwm = require('bwm-ng');

logger.setLevel(process.env.NODE_ENV==="production" ? "INFO" : "ALL");

class TrafficMonitor extends EventEmitter {
  constructor(ifnames){
    super();
    this.ifnames = ifnames;

    this.start();
  }

  start() {
    // to flush each line of stream, we use stdbuf
    // stdbuf -oL bwm-ng --output csv
    this.bwm = spawn('stdbuf', ['-oL', 'bwm-ng', '--output', 'csv']);
    logger.debug('bwm-ng started');

    this.bwm.stdout.on('data', data => {
      let arr = data.toString().split("\n");
      arr.forEach( line => {
        this.ifnames.forEach( ifname  => {
          if(line.indexOf(ifname) !== -1) {
            let _arr = line.split(";");
            let res = {
              timestamp: Date.now(),
              interface: _arr[1],
              bps_out:   parseFloat(_arr[2]),
              bps_in:    parseFloat(_arr[3])
            };
            this.emit("traffic", res);
          }
        });
      });
    });
    this.bwm.stderr.on('data', data => {
      logger.warn(data.toString());
    });
    this.bwm.on('close', code => {
      logger.info("bwm-ng exited with code ${code}");
      logger.info("restart bwm-ng");

      this.start();
    });
  }
}

// test code
if(false) {
  let monitor = new TrafficMonitor(['wlan0']);
  monitor.on("traffic", (data) => {
    logger.debug(data);
  });
}

module.exports = TrafficMonitor;
