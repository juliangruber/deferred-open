var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var tmpStream = require('tmp-stream');

module.exports = defer;
module.exports.stream = stream;
module.exports.install = install;

function defer (fn) {
  return function () {
    var self = this;
    if (self._ready.ready) return fn.apply(self, arguments);
 
    var args = [].slice.call(arguments);
    self._ready.on('go', function (err) {
      if (err) throw err;
      fn.apply(self, args);
    });

    return self;
  };
}

function stream (fn, opts) {
  if (!opts) opts = {};
  return function () {
    var self = this;
    if (self._ready.ready) return fn.apply(self, arguments);

    var tmp = tmpStream();
    if (typeof opts.readable != 'undefined') tmp.readable = opts.readable;
    if (typeof opts.writable != 'undefined') tmp.writable = opts.writable;

    var args = [].slice.call(arguments);

    self._ready.on('go', function (err) {
      if (err) return tmp.emit('error', err);
      tmp.replace(fn.apply(self, args));
    });

    return tmp;
  };
}

function install (obj) {
  var ee = new Emitter;
  ee.setMaxListeners(Infinity);

  function ready (err) {
    ready.ready = true;
    ee.emit('go', err);
  }

  ready.ready = false;
  ready.on = bind(ee, 'on');
  ready.emit = bind(ee, 'emit');

  function queue (fn) {
    ee.on('go', function (err) {
      fn(err, obj);
    });
  }

  obj._ready = ready;
  obj._queue = queue;
}

function bind(obj, method) {
  return function() {
    obj[method].apply(obj, arguments);
  }
}
