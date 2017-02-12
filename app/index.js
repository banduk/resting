const koa = require('koa')
const router = require('koa-router')
const config = require('config')
const bunyan = require('bunyan')
const bunyanLogstash = require('bunyan-logstash')
const bodyParser = require('koa-bodyparser')
const errors = require('boom')

const routes = require('./routes')
const controllers = require('./controllers')
const validators = require('./validators')
const serializers = require('./serializers')
const autoDoc = require('./autodoc')

class App {
  constructor() {
    this.app = koa()
    this.router = router()
    this.routes = routes
  }

  start() {
    this.app.listen(this.port, () => {
      this.app.log.info(`${this.name} listening on port ${this.port}`)
    })
  }

  configure() {
    this.app.config = config
    this.port = config.get('app.port')
    this.name = config.get('app.name')
    this.app.log = this.configureLog()
    this.configureRoutes()
    this.configureMiddlewares()
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
      environment: this.app.env,
      streams,
      serializers: { err: bunyan.stdSerializers.err },
    })
  }

  configureMiddlewares() {
    this.app.use(bodyParser({
      extendTypes: {
        json: ['*/*', '*'] // handle everythong as json
      },
      enableTypes: ['json'],
      onerror(err) {
        throw errors.badData('Only json is accepted')
      },
    }))
    this.app.use(autoDoc(this.app, this.router))

    this.router.use(
      serializers.serializer,
      validators.validator
    )

    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods({
      throw: true,
      notImplemented: errors.notImplemented(),
      methodNotAllowed: errors.methodNotAllowed(),
    }))
  }

  configureRoutes() {
    Object.keys(this.routes).forEach(resource => {
      Object.keys(this.routes[resource]).forEach(action => {
        const method = this.routes[resource][action][0].toLowerCase()
        const route = this.routes[resource][action][1]
        this.router[method](`${resource}.${action}`, route, controllers[resource][action])
      })
    })
  }
}

module.exports = App
