//  A boilerplate to be require()-d instead of `assert-debug` directly
'use strict'

if (process.env.NODE_ENV !== 'production') {
  //  This is a local example - in real life, use `require('assert-debug')`!
  exports = module.exports = require('../../index')

  exports.preventThrows = false

  process.on(exports.eventType, (error, cancel) => {
    if (exports.preventThrows) cancel()     //  A nice place for debugger breakpoint!
  })
} else {
  module.exports = require('assert')
}
