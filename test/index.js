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
const assert     = require('../index')
const E          = assert.AssertionError
const COUNT      = 9      //  Number of cases in all()

// const FIELDS = 'message generatedMessage operator actual expected'.split(' ')

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
      if (error instanceof E) return errors.push(error)
      throw error
    }
  }
  //  We omit deprecated API here, as well as async functions.
  // See: https://nodejs.org/dist/latest-v10.x/docs/api/assert.html
  run('self', 1 === 2)
  run('fail')
  run('ifError', 0)
  run('ok', 1 === 2)
  run('strictEqual', 1, 2)
  run('notStrictEqual', o1, o1)
  run('deepStrictEqual', o1, o2)
  run('notDeepStrictEqual', o1, o1)
  run('throws', () => 0)
  return errors.length
}

describe('_lib/debug/assert', () => {
  it('should export eventType', () => {
    expect(event && typeof event).to.equal('string')
  })

  it('should work in default mode', () => {
    expect(all(assert.strict, 'strict')).to.equal(COUNT)
    expect(all(assert, 'assert')).to.equal(COUNT)
    expect(trapped.length).to.equal(0)
  })

  describe('interception', () => {
    before(() => process.on(event, handler))
    after(() => process.off(event, handler))
    beforeEach(() => (trapped = []))

    it('should intercept', () => {
      expect(all(assert.strict, 'strict')).to.equal(COUNT)
      expect(all(assert, 'assert')).to.equal(COUNT)
      expect(trapped.length).to.equal(2 * COUNT)
    })

    it('should ignore', () => {
      ignore = true
      expect(all(assert.strict, 'strict')).to.equal(0)
      expect(all(assert, 'assert')).to.equal(0)
      expect(trapped.length).to.equal(2 * COUNT)
    })
  })
})
