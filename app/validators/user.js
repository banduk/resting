const Validator = require('./validator')
const Joi = require('joi')
const _ = require('lodash')

class User extends Validator {
  getValidators() {
    return {
      authenticate: {
        body: Joi.object().keys({
          user: Joi.object().keys({
            id: Joi.string().guid({ version: ['uuidv4'] }).required(),
          }).required(),
        }).required(),
      },
    }
  }
}

module.exports = User
