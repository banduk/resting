const koa = require('koa')
const config = require('config')

const bunyan = require('bunyan')
const bunyanLogstash = require('bunyan-logstash')

class App {
  constructor() {
    this.app = koa()
  }

  start() {
    this.app.listen(this.port, () => {
      this.log.info(`${this.name} listening on port ${this.port}`)
    })
  }

  configure() {
    this.port = config.get('app.port')
    this.name = config.get('app.name')
    this.log = this.configureLog()
  }

  configureLog() {
    const streams = []
    const conf = config.get('log')

    const stConf = conf.stdout
    if (stConf && (stConf.active || stConf.active === undefined)) {
      streams.push({
        stream: process.stdout,
        level: stConf.level !== undefined ? stConf.level : conf.level || 'info',
        src: stConf.src !== undefined ? stConf.src : conf.src || false,
      })
    }

    const fConf = conf.file
    if (fConf && (fConf.active || fConf.active === undefined)) {
      streams.push({
        path: fConf.path,
        level: fConf.level !== undefined ? fConf.level : conf.level || 'info',
        src: fConf.src !== undefined ? fConf.src : conf.src || false,
      })
    }

    const lsConf = conf.logstash
    if (lsConf && (lsConf.active || lsConf.active === undefined)) {
      streams.push({
        type: 'raw',
        level: lsConf.level !== undefined ? lsConf.level : conf.level || 'info',
        src: lsConf.src !== undefined ? lsConf.src : conf.src || false,
        stream: bunyanLogstash.createStream({
          host: lsConf.host,
          port: lsConf.port,
        }),
      })
    }

    return bunyan.createLogger({
      name: config.get('app.name'),
      environment: process.env.NODE_ENV,
      streams,
      serializers: { err: bunyan.stdSerializers.err },
    })

  }
}

module.exports = App
