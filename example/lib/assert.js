//  A boilerplate to be require()-d instead of `assert-debug` directly
'use strict'

//  This is a local example - in real life, use `require('assert-debug')`!
exports = module.exports = require('../../index')

if (exports.eventType) {
  exports.preventThrows = false

  process.on(exports.eventType, (error, cancel) => {
    //  A nice place for debugger breakpoint!
    if (exports.preventThrows) cancel()
  })
}
