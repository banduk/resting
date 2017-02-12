const errors = require('boom')
const User = require('./user')
const errorUtils = require('./../utils/error')
const serializers = {
  user: new User(),
}

function* serializer(next) {
  try {
    yield next
    const routeName = this.matched[1].name
    const resource = routeName.split('.')[0]
    const action = routeName.split('.')[1]
    const serialized = serializers[resource][action](this.responseData)
    this.body = serialized.body
    this.status = serialized.status
  } catch (err) {
    if (!err.isBoom) {
      err = errors.badImplementation('Internal Server Error', {
        original: err,
        stack: errorUtils.errorSummary(err)
      })
    }
    this.body = err.output.payload
    this.status = err.output.statusCode
    this.app.log.debug({ error: err }, 'Error')
  }
}

module.exports = {
  serializer,
  serializers,
}
