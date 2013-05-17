
# deferred-open

Make methods wait for async constructors.

For example, database libraries like
[LevelUp](https://github.com/rvagg/node-levelup) or
[node-redis](http://ghub.io/redis) expose an API that you can use immediately,
although the connection hasn't been established yet. This greatly helps reduce
callback depth.

In most cases you rather want this:

```js
var db = levelup('/db');
db.get('foo', function (err, val) {
  val == 'bar';
});
```

than this:

```js
levelup('/db', function (err, db) {
  if (err) throw err;
  db.get('foo', function (err, val) {
    val == 'bar';
  })
});
```

So, all calls to member functions have to be deffered until the
connection is up. This module helps by mixing in to an Object and deferring
operations until the constructor is done doing its async stuff.

## Usage

Install `Deferred` onto a function and make `doAThing` wait until the
constructor finished doing its async operations.

```js
var Deferred = require('deferred-open');

function Something () {
  var self = this;

  Deferred.install(self); // => self._deferred

  self.loaded = false; // fake internal state

  setTimeout(function () { // some async function
    self.loaded = true;
    self._ready();
  }, 500);
}

Something.prototype.doAThing = Deferred(function () {
  if (!this.loaded) throw new Error('oops');
  console.log('success');
});

```

And use it like this:

```js
var something = new Something();
something.doAThing(); // "success" after 500ms
```

## Non deferred open

If you want to support non deferred open too, use `Deferred#queue`:

```js
function Something (cb) {
  var self = this;

  if (!(self instanceof Something)) return new Something(cb);
  Deferred.install(self);

  if (cb) self._queue(cb); // allow async api too

  self.loaded = false;

  setTimeout(function () {
    self.loaded = true;
    self._ready();
  }, 500);
}
```

Now you can use it like this:

```js
// Deferred
var something = new Something();
something.doAThing();

// Or non deferred
Something(function (err, something) {
  something.doAThing();
});
```

## API

### Deferred.install(fn)

Call this in `fn`'s constructor in order to install the `_deferred` member
object.

### this._resolve([err])

Call this when you finished doing your async stuff.

If you pass something as the `err` parameter,

* a deferred call will throw
* a non deferred call will pass that as first argument to the callback

### this._queue(fn)

Call `fn` with `(err, this)` as soon as `this._deferred.resolve()` has been
called (with the optional error argument).

### Deferred(fn)

Returns a function that gets called only after this internal deffered object
has been signaled by `this._deferred.go()`.

## Installation

With [npm](http://npmjs.org) do

```bash
$ npm install deferred-open
```

## License

(MIT)

Copyright (c) 2013 Julian Gruber &lt;julian@juliangruber.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
