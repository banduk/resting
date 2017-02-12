const User = require('./user')

const validators = {
  user: new User(),
}

function* validator(next) {
  const params = this.params
  const body = this.request.body
  const query = this.request.query
  const routeName = this.matched[1].name
  const resource = routeName.split('.')[0]
  const action = routeName.split('.')[1]
  const [newBody, newParams, newQuery] = validators[resource].validate(action, body, params, query)
  this.params = newParams
  this.request.body = newBody
  this.request.query = newQuery
  yield next
}

module.exports = {
  validator,
  validators,
}
