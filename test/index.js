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
const IS_RO      = 'Property is read-only'
const COUNT      = 9      //  Number of cases in all()

const targetPath = path.join(__dirname, '../index.js')
//  Some stuff works differently before v10.
const nodeMajor  = 1 * process.version.substring(1).split('.')[0]
const event      = assert.eventType

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

const tStat_ = (ns, withEvents) => {
  const o = ns ? assert[ns] : assert, et = o.eventType

  expect(typeof o.AssertionError).to.equal('function', ns + '.AssertionError')
  expect(o.strict instanceof Function).to.equal(true, ns + '.strict')
  expect(o.nodeMajor).to.equal(nodeMajor, ns + '.nodeMajor')
  expect(() => (o.nodeMajor += 1)).to.throw(IS_RO, ns + '.nodeMajor')
  if (withEvents) {
    expect(et && typeof et).to.equal('string', ns + '.eventType')
  } else {
    expect(et).to.equal(undefined, ns + '.eventType')
    expect(() => (o.eventType = '').to.throw(IS_RO, ns + '.eventType'))
  }
}

const testStatics_ = (withEvents) => {
  tStat_('', withEvents)
  tStat_('strict', withEvents)
}

describe('_lib/debug/assert', () => {
  it('should export statics', () => testStatics_(true))

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

    it('should set eventType', () => {
      assert.eventType = 'a'
      expect(assert.strict.eventType).to.equal('a')
      assert.strict.eventType = ''
      expect(assert.eventType).to.equal('')
      expect(() => assert.fail()).to.throw()
    })
  })

  describe('in production mode', () => {
    before(() => {
      delete require.cache[targetPath]
      process.env.NODE_ENV = 'production'

      assert = require('../index')
    })

    it('should export statics', () => testStatics_(false))

    it('should throw', () => {
      ignore  = true
      trapped = []
      expect(all(assert.strict, 'strict')).to.equal(COUNT,
        'errors.length in strict')
      expect(all(assert, 'assert')).to.equal(COUNT, 'errors.length')
      expect(trapped.length).to.equal(0, 'trapped.length')
    })
  })
})
