# assert-debug [![Build Status](https://travis-ci.org/valango/assert-debug.svg?branch=master)](https://travis-ci.org/valango/assert-debug) [![Code coverage](https://codecov.io/gh/valango/assert-debug/branch/master/graph/badge.svg)](https://codecov.io/gh/valango/assert-debug)

**`assert-debug`** helps to trace down the actual cause behind seemingly random assertion failures.

## When might you need it?
Your code may interact with different databases and even with some resources you can't control.

You think you're ready to deploy, and suddenly there is a weird assertion error.
Sure you'll get the stack trace and even what exactly went wrong - in a style like:
```
// + expected - actual
//   {
// -   a: 1
// +   a: 2
//   }

```
That's great, but... the cause still remains unclear. And dynamic context is all gone -
you can't inspect the local variables. You have no idea of how to repeat this failure.
You can expect a long night full of relentless experimenting ahead of you.

## What it does?
**`assert-debug`** module exports all the stuff from original Node.js `assert`
built-in package, with all assertion methods wrapped into _`try-catch`_ blocks.
A global event will fire, before any assertion actually _throws_.

An event handler will receive `AssertionError` instance
before it is actually thrown. You can even prevent it from being thrown.
But most importantly, by having a **_debugger breakpoint_** set inside handler function,
you will get access to all dynamic context that led to this assertion!

## Usage
### Installation
   `npm i -S assert-debug`
   
   or
   
   `yarn add -S assert-debug`

### Example
```javascript
//  In the beginning
const assert = require('assert-debug')
const trap = (error, cancel) => {
  //  Set up debugger breakpoint inside the code here.
}

process.on(assert.eventType, trap)

//  Anywhere in your app...
assert.ok(someCondition)  //  ...or whatever standard assertion method.

```
To get better idea, see [`example/`](https://github.com/valango/assert-debug/tree/master/example) directory.
### API
**`assert-debug`** module exports exactly the same API as
[original `assert`](https://nodejs.org/dist/latest-v10.x/docs/api/assert.html), plus:

* **`nodeMajor`**`: number` - Node.js semver major number as integer.
* **`eventType`**`: string` - originally set to **`"BeforeAssertionIsThrown"`**.
You can assign a different value to change the event to be used. Setting it to _falsey_ value
disables the whole trapping altogether. The change affects all assertions happening after it.

Such a super-smart fiddling is hardly ever needed and if you really want a different event type,
you can set it by **`NODE_ASSERTION_EVENT`** environment variable.

There is an **_upwards-compatibility bonus_**: current Node.js documentation promotes using `assert.strict`,
which was still missing in Node.js v8 - but _`assert-debug`_ always exports `strict`, so your v10 code won't
crash on v8 because of the _strict_ thing.

### Code pattern
I suggest you put the following code snippet into `lib/assert.js` or alike in your project and _`require`_ this
instead of `assert-debug` directly:

```javascript
exports = module.exports = require('assert-debug')

if (exports.eventType) {  //  Not present in production mode.
  exports.preventThrows = false

  process.on(exports.eventType, (error, cancel) => {
    //  A nice place for debugger breakpoint!
    if (exports.preventThrows) cancel()
  })
}
```

## Changes
### v1.1
1. In **_production mode_**, `assert-debug` does not change native assert behavior,
but it still adds _`nodeMajor`_ and _`strict`_ (if needed).
1. _`eventType`_ is not exported in **_production mode_**.
1. _`eventType`_ default is changed from `"TrappedAssertion"` to `"BeforeAssertionIsThrown"`.
1. Test are refactored to work correctly with Node.js v8.

## Feedback
Send bug reports and feature requests to [here](https://github.com/valango/assert-debug/issues), please.
Your thoughts and criticism will be greatly appreciated.
