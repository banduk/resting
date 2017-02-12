const fs = require('fs')
const DocumentationBuilder = require('./documentationBuilder')
const DocumentationWriter = require('./documentationWriter')
const errorUtils = require('./../utils/error')

// Keep routes documentation
let routesDoc = null

// Document routes basic info
function documentRoutes(router) {
  const documentationBuilder = new DocumentationBuilder(router)
  routesDoc = documentationBuilder.build()
}

// Get request data and add into routes docs
function documentRequest(ctx) {
  const [resource, method] = DocumentationBuilder.getResourceAndMethod(ctx.matched[1])
  const docObj = routesDoc.filter(rd => rd.resource === resource && rd.method === method)[0]
  if (ctx.status > 399) {
    docObj.responses.error.push({
      body: ctx.request.body,
      response: ctx.response,
      status: ctx.status,
      url: ctx.request.url,
    })
  } else {
    docObj.responses.success.push({
      body: ctx.request.body,
      response: ctx.response,
      status: ctx.status,
      url: ctx.request.url,
    })
  }
  return docObj
}

function writeToFile(file, str) {
  fs.writeFileSync(file, str)
}

function appendToFile(file, str) {
  fs.writeFileSync(file, str)
}

module.exports = function (app, router) {
  return function* doc(next) {
    try {
      yield next
      if (!['production', 'stagong'].includes(app.env)) {
        if (!routesDoc) {
          documentRoutes(router)
          writeToFile(app.config.get('doc.outputFile'), '')
        }

        documentRequest(this, router)

        const documentationWriter = new DocumentationWriter(app, routesDoc)
        const document = documentationWriter.getDoc()
        appendToFile(app.config.get('doc.outputFile'), document)
      }
    } catch (e) {
      const errorSummary = errorUtils.errorSummary(e)
      console.log(errorSummary)
      yield next
    }
  }
}
