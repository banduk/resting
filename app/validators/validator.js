const errors = require('boom')

class Validator {
  constructor() {
    this.validators = this.getValidators()
    this.errors = errors
  }

  validate(action, body, params, query) {
    delete params['0']

    // Validate body
    if (!!this.validators[action].body) {
      body = this.validators[action].body.validate(body)
      if (body.error) {
        const errMessage = body.error.details.map(e => e.message).join(' AND ')
        throw errors.badData(errMessage, body.error)
      }
    }

    // Validate params
    if (!!this.validators[action].params) {
      params = this.validators[action].params.validate(params)
      if (params.error) {
        const errMessage = params.error.details.map(e => e.message).join(' AND ')
        throw errors.badData(errMessage, params.error)
      }
    }

    // Validate query string
    if (!!this.validators[action].query) {
      query = this.validators[action].query.validate(query)
      if (query.error) {
        const errMessage = query.error.details.map(e => e.message).join(' AND ')
        throw errors.badData(errMessage, query.error)
      }
    }

    return [body.value, params.value, query.value]
  }
}

module.exports = Validator
