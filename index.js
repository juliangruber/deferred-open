var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var bind = require('bind-component');
var through = require('through');

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
  };
}

function stream (fn) {
  return function () {
    var self = this;
    if (self._ready.ready) return fn.apply(self, arguments);

    var tr = through().pause();
    var args = [].slice.call(arguments);

    self._ready.on('go', function (err) {
      if (err) return tr.emit('error', err);

      var st = fn.apply(self, args);
      if (st.writable) tr.pipe(st);
      if (st.readable) st.pipe(tr);

      tr.resume();
    });

    return tr;
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
