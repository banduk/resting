class DocumentationWriter {
  constructor(app, jsonDoc) {
    this.app = app
    this.jsonDoc = jsonDoc
    this.identationSize = 2
  }

  getTitle(str) {
    return `${str}\n${'='.repeat(str.length)}\n\n`
  }

  getIdentation(level) {
    return ' '.repeat(this.identationSize * level)
  }

  jsonString(json) {
    return JSON.stringify(json, null, 2)
  }

  getHeader(level, str) {
    return `${'#'.repeat(level)} ${str}\n\n`
  }

  getItem(str) {
    return `* ${str}\n`
  }

  getCode(str) {
    return `\`\`\`\n${str}\n\`\`\`\n`
  }

  getRoute(verb, path) {
    return `${verb} ${path}\n`
  }

  getParams(params) {
    const properties = params.properties
    const required = params.required
    Object.keys(properties).map(prop => {
      const type = properties[prop].type
      const req = required.includes(prop)
      return `${prop} - ${type}${req ? ' *' : ''}`
    }).join('\n')
  }

  getQuery(query) {
    const properties = query.properties
    const required = query.required
    Object.keys(properties).map(prop => {
      const type = properties[prop].type
      const req = required.includes(prop)
      return `${prop} - ${type}${req ? ' *' : ''}`
    }).join('\n')
  }


  getBody(body) {
    const properties = body.properties
    const required = body.required
    if (!properties) {
      return {}
    }

    const allProps = Object.keys(properties).map(prop => {
      const type = properties[prop].type
      const req = required.includes(prop)
      const propName = req ? `*${prop}` : prop

      if (type === 'object') {
        return { [propName]: this.getBody(properties[prop], prop) }
      } else if (type === 'array') {
        return { [propName]: properties[prop].items.map(item => this.getBody(item, prop)) }
      }
      return { [propName]: `[${type}]` }
    })

    return Object.assign({}, ...allProps)
  }

  breakLine(quantity) {
    return '\n'.repeat(quantity)
  }

  addToBuffer(str) {
    this.buffer = this.buffer || ''
    this.buffer += str
  }

  groupByResource() {
    return this.jsonDoc.reduce((grouped, route) => {
      grouped[route.resource] = grouped[route.resource] || {}
      grouped[route.resource][route.method] = grouped[route.resource][route.method] || {}
      grouped[route.resource][route.method][route.verb] = route
      return grouped
    }, {})
  }

  getResponse(response) {
    let localBuffer = ''
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    localBuffer = `${localBuffer}* URL: `
    localBuffer = `${localBuffer}${response.url}`
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    localBuffer = `${localBuffer}* Status: `
    localBuffer = `${localBuffer}${response.status}`
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    localBuffer = `${localBuffer}* Body`
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    localBuffer = `${localBuffer}${this.getCode(this.jsonString(response.body))}`
    localBuffer = `${localBuffer}${this.breakLine(1)}`


    localBuffer = `${localBuffer}* Response`
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    localBuffer = `${localBuffer}${this.getCode(this.jsonString(response.response.body))}`
    localBuffer = `${localBuffer}${this.breakLine(1)}`

    return localBuffer
  }

  getDoc() {
    const title = this.getTitle(this.app.config.get('app.name'))
    this.addToBuffer(title)

    const grouped = this.groupByResource()
    let level = 2
    Object.keys(grouped).forEach(resource => {
      this.addToBuffer(this.getHeader(level, resource))
      level++

      const _resource = grouped[resource]
      Object.keys(_resource).forEach(method => {
        this.addToBuffer(this.getHeader(level, method))

        const _method = _resource[method]
        Object.keys(_method).forEach(verb => {
          const _verb = _method[verb]
          this.addToBuffer(this.getRoute(verb, _verb.path))
          this.addToBuffer(this.breakLine(2))

          const input = _verb.input
          if (input.params) {
            this.addToBuffer('Params schema')
            this.addToBuffer(this.breakLine(1))
            this.addToBuffer(this.getParams(input.params))
            this.addToBuffer(this.breakLine(1))
          }

          if (input.query) {
            this.addToBuffer('Query string schema')
            this.addToBuffer(this.breakLine(1))
            this.addToBuffer(this.getQuery(input.query))
            this.addToBuffer(this.breakLine(1))
          }

          if (input.body) {
            this.addToBuffer('Body schema')
            this.addToBuffer(this.breakLine(1))
            const body = this.getBody(input.body)
            this.addToBuffer(this.getCode(this.jsonString(body)))
            this.addToBuffer(this.breakLine(1))
          }

          if (_verb.responses.success.length > 0 || _verb.responses.error.length > 0) {
            this.addToBuffer('Examples')
            this.addToBuffer(this.breakLine(1))
            if (_verb.responses.success.length > 0) {
              _verb.responses.success.forEach(r => {
                this.addToBuffer(this.getResponse(r))
              })
            }

            if (_verb.responses.error.length > 0) {
              _verb.responses.error.forEach(r => {
                this.addToBuffer(this.getResponse(r))
              })
            }
          }

          // console.log(_verb.responses)
        })
        this.addToBuffer(this.breakLine(2))
      })
    })

    return this.buffer
  }
}

// fs.writeFileSync(docFile, docHeader)
//
// Object.keys(groupedByServerHandlerMethod).forEach(server => {
//   if (blacklist.server.indexOf(server) >= 0) return
//   writeHeader(0, 2, server)
//   Object.keys(groupedByServerHandlerMethod[server]).forEach(handler => {
//     if (blacklist.handler.indexOf(handler) >= 0) return
//     writeHeader(1, 3, handler)
//     Object.keys(groupedByServerHandlerMethod[server][handler]).forEach(method => {
//       if (blacklist.method.indexOf(method) >= 0) return
//       writeHeader(1, 4, method)
//       const testCases = groupedByServerHandlerMethod[server][handler][method]
//       writeItem(1, testCases[0].msg.__route__)
//       testCases.forEach(testCase => {
//         blacklist.msg.forEach(blm =>
//           delete testCase.msg[blm] // eslint-disable-line no-param-reassign
//         )
//         blacklist.resp.forEach(blr =>
//           delete testCase.resp[blr] // eslint-disable-line no-param-reassign
//         )
//         const body = [
//           item(2, 'Message:'),
//           code(3, stringifyJson(testCase.msg)),
//           item(2, 'Response:'),
//           code(3, stringifyJson(testCase.resp)),
//         ].join('\n')
//
//         write(body)
//       })
//     })
//   })
// })

module.exports = DocumentationWriter
