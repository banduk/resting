const defer = require('config/defer').deferConfig;

module.exports = {
  app: {
    name: 'Resting',
    port: 3000,
  },
  log: {
    level: 'debug',
    src: false,
    stdout: {
      level: 'info'
    },
    logstash: {
      host: '127.0.0.1',
      port: 9090,
    },
    file: {
      path: defer((cfg) => `/tmp/${cfg.app.name}-${process.env.NODE_ENV}.log`),
      src: true,
    }
  },
  doc: {
    outputFile: './doc/api.md',
  }
}
