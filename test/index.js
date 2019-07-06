/**
 * assert-debug/test/index.js
 *
 * License: ISC
 *
 * Created: 2019-07-06
 * @author Villem Alango <villem.alango@gmail.com>
 * @license http://opensource.org/licenses/MIT
 */
'use strict'

const { expect } = require('chai')
let assert       = require('../index')
const path       = require('path')
const E          = assert.AssertionError
const COUNT      = 9      //  Number of cases in all()

const targetPath = path.join(__dirname, '../index.js')
//  Some stuff works differently before v10.
const nodeMajor  = 1 * process.version.substring(1).split('.')[0]
const event = assert.eventType

let errors, trapped = [], ignore = false

const handler = (error, cancel) => {
  trapped.push(error)
  if (ignore) cancel()
}

const o1 = { a: { b: 1 } }, o2 = { a: { b: 2 } }

const all = (what, label) => {
  errors    = []
  const run = (name, ...args) => {
    const fn = name === 'self' ? what : what[name]
    try {
      fn.apply(what, args.concat([label + '.' + name]))
    } catch (error) {
      if (nodeMajor >= 10 && !(error instanceof E)) throw error
      errors.push(error)
    }
  }
  //  We omit deprecated API here, as well as async functions.
  // See: https://nodejs.org/dist/latest-v10.x/docs/api/assert.html
  run('self', 1 === 2)
  run('fail')
  run('ifError', nodeMajor < 10 ? 1 : 0)
  run('ok', 1 === 2)
  run('strictEqual', 1, 2)
  run('notStrictEqual', o1, o1)
  run('deepStrictEqual', o1, o2)
  run('notDeepStrictEqual', o1, o1)
  run('throws', () => 0)
  return errors.length
}

describe('_lib/debug/assert', () => {
  it('should export statics', () => {
    expect(typeof assert.AssertionError).to.equal('function')
    expect(assert.strict instanceof Function).to.equal(true)
    expect(typeof assert.strict.AssertionError).to.equal('function')
    expect(event && typeof event).to.equal('string')
    expect(assert.nodeMajor).to.equal(nodeMajor)
  })

  it('should work in default mode', () => {
    expect(all(assert.strict, 'strict')).to.equal(COUNT,
      'errors.length in strict')
    expect(all(assert, 'assert')).to.equal(COUNT, 'errors.length')
    expect(trapped.length).to.equal(0, 'trapped.length')
  })

  describe('interception', () => {
    before(() => process.on(event, handler))
    after(() => process.removeListener(event, handler)) // .off() since v10
    beforeEach(() => (trapped = []))

    it('should intercept', () => {
      expect(all(assert.strict, 'strict')).to.equal(COUNT,
        'errors.length in strict')
      expect(all(assert, 'assert')).to.equal(COUNT, 'errors.length')
      expect(trapped.length).to.equal(2 * COUNT, 'trapped.length')
    })

    it('should ignore', () => {
      ignore = true
      expect(all(assert.strict, 'strict')).to.equal(0,
        'errors.length in strict')
      expect(all(assert, 'assert')).to.equal(0, 'errors.length')
      expect(trapped.length).to.equal(2 * COUNT, 'trapped.length')
    })
  })

  describe('in production mode', () => {
    before(() => {
      delete require.cache[targetPath]
      process.env.NODE_ENV = 'production'

      assert = require('../index')
    })

    it('should export statics', () => {
      expect(typeof assert.AssertionError).to.equal('function')
      expect(assert.strict instanceof Function).to.equal(true)
      expect(typeof assert.strict.AssertionError).to.equal('function')
      expect(assert.eventType).to.equal(undefined)
      expect(assert.nodeMajor).to.equal(nodeMajor)
    })

    it('should throw', () => {
      ignore = true
      trapped = []
      expect(all(assert.strict, 'strict')).to.equal(COUNT,
        'errors.length in strict')
      expect(all(assert, 'assert')).to.equal(COUNT, 'errors.length')
      expect(trapped.length).to.equal(0, 'trapped.length')
    })
  })
})
