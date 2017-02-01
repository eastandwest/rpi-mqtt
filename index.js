"use strict";

const mqtt   = require('mqtt');
const os     = require('os');
const fs     = require('fs');
const TrafficMonitor = require('./libs/TrafficMonitor');
const CONF   = require('./conf/config.json');

const log4js = require('log4js');
const logger = log4js.getLogger('publisher.js');

logger.setLevel(process.env.NODE_ENV==="production" ? "INFO" : "ALL");

const INTERVAL = process.env.INTERVAL || 1000; // default interval is 10sec
const TEMP_FILE = '/sys/class/thermal/thermal_zone0/temp'; // sysytem temperature

const client = mqtt.connect(CONF["mqtt-broaker"]);

client.on('connect', function () {
  logger.info("connected to mqtt broaker");
});

setInterval((ev) => {
  const freemem  = os.freemem();
  const totalmem = os.totalmem();
  const loadavg  = os.loadavg();

  const mem_usage = JSON.stringify({
    "free": freemem,
    "total": totalmem,
    "used": totalmem - freemem
  })

  const cpu_usage = JSON.stringify({
    "1min": loadavg[0],
    "5min": loadavg[1],
    "15min": loadavg[2]
  })

  // publish usage of memory and cpu
  publish('memory', mem_usage );
  publish('cpu', cpu_usage );

  // publish system temperature
  fs.readFile(TEMP_FILE, (err, data) => {
    if(err) {
      logger.warn(err.toString());
    } else {
      const temperature = JSON.stringify({
        "cpu": parseInt(data) / 1000
      })
      publish('temperature', temperature );
    }
  });

}, INTERVAL);

// publish traffic
const monitor = new TrafficMonitor(CONF.monitor.ifnames);
monitor.on("traffic", res => {
  let _res = JSON.stringify(res);
  publish('traffic', _res);
});

const publish = (key, val) => {
  const topic = CONF['topics'][key]
  if(topic) {
    logger.debug('send mqtt: ', topic, val)
    client.publish(topic, val)
  } else {
    logger.warn('unknown key', key);
  }
}
