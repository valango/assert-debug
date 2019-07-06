/**
 * index.js
 *
 * $
 *
 * Created: 2019-07-06
 * @author Villem Alango <villem.alango@gmail.com>
 * @license http://opensource.org/licenses/MIT
 */

const assert = require('./lib/assert')

const say = (msg) => process.stdout.write(msg + '\n')

//  Se up our own handler just for logging.
process.on(assert.eventType, (ev) => say('GOT: ' + ev.message))

assert.preventThrows = true
say('assertion throwing is disabled')

assert.strict.fail('failed, but ignored')

assert.preventThrows = false

assert.strict.fail('failed, and not intercepted')

say('you should never see this')
