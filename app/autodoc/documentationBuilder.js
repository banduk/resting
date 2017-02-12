const joiToJsonSchema = require('joi-to-json-schema')
const validators = require('./../validators').validators

class DocumentationBuilder {
  constructor(router) {
    this.routesStack = router.stack.slice(1, router.stack.length) // remove koa route stack
  }

  build() {
    return this.routesStack.map(rs => {
      const [resource, method] = DocumentationBuilder.getResourceAndMethod(rs)

      const validator = validators[resource].validators[method]
      const input = {
        body: validator.body ? joiToJsonSchema(validator.body) : null,
        params: validator.params ? joiToJsonSchema(validator.params) : null,
        query: validator.query ? joiToJsonSchema(validator.query) : null,
      }
      return {
        resource,
        method,
        verb: rs.methods[0],
        path: rs.path,
        input,
        responses: {
          error: [],
          success: [],
        },
      }
    })
  }

  static getResourceAndMethod(rs) {
    const routeName = rs.name.split('.')
    return routeName
  }
}

module.exports = DocumentationBuilder
