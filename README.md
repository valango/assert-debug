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
### API
**`assert-debug`** module exports exactly the same API as
[original `assert`](https://nodejs.org/dist/latest-v10.x/docs/api/assert.html).
Additionally, it exports eventType property which is originally set to **`"TrappedAssertion"`**.
You can assign a different value to change the event to be used. Setting it to falsey value
disables the whole trapping altogether. The change affects all assertions happening after it.

Such a super-smart fiddling is rarely needed and if you really want a different event type,
you can declare **`NODE_ASSERTION_EVENT`** environment variable.

<a name="style">Depending on your **personal style**</a>, you can share `assert-debug` between code modules
via dependency injection, via global namespace or some other way. Maybe you want to use
native `assert` in production code - maybe not.

### Feedback
You are more than welcome to share your thoughts and criticism.
Bugs and wishes [here](https://github.com/valango/assert-debug/issues), please.
