/**
 * assert-debug/index.js
 *
 * License: ISC
 *
 * Created: 2019-07-06
 * @author Villem Alango <villem.alango@gmail.com>
 * @license http://opensource.org/licenses/MIT
 */
'use strict'

const original = require('assert')

//  Global event that will be emitted every time when assertion throws.
//  Parameters: errorInstance, cancelFunction.
const eventType = process.env.NODE_ASSERTION_EVENT === undefined
  ? 'TrappedAssertion' : process.env.NODE_ASSERTION_EVENT

const wrap = (obj, fn) => {
  return (...args) => {
    try {
      return fn.apply(obj, args)
    } catch (error) {
      if (eventType && error instanceof original.AssertionError) {
        let isCanceled = false
        process.emit(assert.eventType, error, () => (isCanceled = true))
        if (isCanceled) return
      }
      throw error
    }
  }
}

const wrapAll = (obj, method) => {
  const wrappedFn = wrap(obj, method)

  for (const key of Object.keys(obj)) {
    let v = obj[key]

    if (v instanceof Function && key !== 'strict' && key !== 'AssertionError') {
      v = key === 'ok' ? wrappedFn : wrap(obj, v)
    }
    wrappedFn[key] = v
  }
  return wrappedFn
}

const strict     = wrapAll(original.strict, original.strict)
const assert     = wrapAll(original, original)
assert.strict    = strict

//  Clearing this property will disable event trapping.
assert.eventType = eventType

module.exports = assert
