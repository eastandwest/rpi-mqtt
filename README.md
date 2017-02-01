# mqtt-test

## publisher

### topic

* mem_usage

```
@return {json}
@param {integer} free
@param {integer} total
@param {integer} used
```

sample

```json
{
  "free":467496960,
  "total":903958528,
  "used":436461568
}
```

* cpu_usage

```
@return {json}
@param {float} 1min
@param {float} 5min
@param {float} 15min
```

sample

```json
{
  "1min":0.27197265625,
  "5min":0.25830078125,
  "15min":0.27099609375
}
```

* temperature

```
@return {json}
@param {float} cpu
```

sample

```json
{
  "cpu":52.078
}
```

* traffic

```
@return json
@param {integer} timestamp
@param {string} interface
@param {float} bps_in
@param {float} bps_out
```

sample

```json
{
  "timestamp":1481050230,
  "interface":"wlan0",
  "bps_out":156197.61,
  "bps_in":1435.13
}
```
