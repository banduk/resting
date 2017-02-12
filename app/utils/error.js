function errorSummary(err) {
  return err.stack.split('\n').filter(es => !es.includes('node_modules')).join('\n')
}


module.exports = {
  errorSummary,
}
