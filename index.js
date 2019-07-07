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

let assert = require('assert')
let strict = assert.strict

const E_RO = 'Property is read-only'

const AssertionError = assert.AssertionError
//  Some stuff works differently before v10.
const nodeMajor      = 1 * process.version.substring(1).split('.')[0]

//  Global event that will be emitted every time when assertion throws.
//  Parameters: errorInstance, cancelFunction.
let eventType

const inProduction = process.env.NODE_ENV === 'production'

if (!inProduction) {
  eventType = process.env.NODE_ASSERTION_EVENT === undefined
    ? 'BeforeAssertionIsThrown' : process.env.NODE_ASSERTION_EVENT

  const wrap = (obj, fn) => {
    return (...args) => {
      try {
        return fn.apply(obj, args)
      } catch (error) {
        if (eventType && (nodeMajor < 10 || error instanceof AssertionError)) {
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

  strict = strict && wrapAll(strict, strict)  //  NodeJs < v.9.x does not support `strict`.
  assert = wrapAll(assert, assert)
}

const addStaticsToAPI_ = (api) => {
  const dscr = Object.create(null)    //  Shield against prototype pollution.
  const ro   = () => ((strict || assert).fail(E_RO))

  dscr.enumerable = true
  dscr.get        = () => nodeMajor
  dscr.set        = ro
  Object.defineProperty(api, 'nodeMajor', dscr)

  dscr.get = () => eventType
  if (!inProduction) dscr.set = (v) => (eventType = v)
  Object.defineProperty(api, 'eventType', dscr)
}

addStaticsToAPI_(exports = module.exports = assert)

if (strict) {
  addStaticsToAPI_(strict)
}
exports.strict = strict || assert   //  Upwards compatibility.
