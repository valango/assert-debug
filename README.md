# assert-debug [![travis](https://img.shields.io/travis/assert-debug/master.svg)](https://travis-ci.org/assert-debug) [![Coverage Status](https://coveralls.io/repos/valango/assert-debug/badge.svg?branch=master&service=github)](https://coveralls.io/github/valango/assert-debug?branch=master)


**`assert-debug`** helps to trace down the actual cause behind seemingly random assertion.

## When might you need it?
Your code may interact with different databases and even with some resources you can't control.

You think, you're ready to deploy, and suddenly there is a weird assertion error.
Sure you'll get the stack trace and even what exactly went wrong - in style like:
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
**`assert-debug`** module exports all the stuff from original NodeJS `assert`
built-in package, with all assertion methods wrapped into _`try-catch`_ blocks.
Before any assertion actually _throw_, a global event is fired.

By setting up an event handler, yo will receive the AssertionError object
before it is actually thrown. You can even prevent it from being thrown.
But most importantly, by setting up a debugger breakpoint inside your handler,
you will get access to all dynamic context that led to this assertion!

## Usage
### Installation
   `npm i -S assert-debug`
   or
   `yarn add -S assert-debug`
   
Use of -S or -D option depends on your [intentions and personal style](#style).
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
To get better idea, see `examples/` directory.
### API
**`assert-debug`** module exports exactly the same API as
[original `assert`](https://nodejs.org/dist/latest-v10.x/docs/api/assert.html), plus:

* **`nodeMajor`**`: number` - NodeJs semver major number as integer.
* **`eventType`**`: string` - originally set to **`"BeforeAssertionIsThrown"`**.
You can assign a different value to change the event to be used. Setting it to _falsey_ value
disables the whole trapping altogether. The change affects all assertions happening after it.

Such a super-smart fiddling is rarely needed and if you really want a different event type,
you can declare **`NODE_ASSERTION_EVENT`** environment variable.

There is an _upwards-compatibility **bonus**_: new nodeJs documentation promotes using this package,
but it was still missing in node v8 - but _`assert.strict`_ exports strict too, so your v10 code won't
crash on v8 because of the _strict_ thing.

### Code patterns
<a name="style">Depending on your **personal style**</a>, you can share `assert-debug` between code modules
by just requiring it instead of `assert` or via dependency injection, via global namespace or some other way.
Maybe you want to use native `assert` in production code - or maybe not.

I suggest to put the following code snippet into `lib/assert.js` or alike in your project and _require_ this
instead of requiring `assert-debug` directly:

```javascript
exports = module.exports = require('assert-debug')

if (exports.eventType) {
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
1. Test are refactored to work correctly with NodeJs v8.

## Feedback
You are more than welcome to share your thoughts and criticism.
Bugs and wishes [here](https://github.com/valango/assert-debug/issues), please.
