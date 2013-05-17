var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = defer;
module.exports.install = install;

function defer (fn) {
  return function () {
    var self = this;
    if (self._deferred.ready) return fn.apply(this, arguments);
 
    var args = [].slice.call(arguments);
    self._deferred.on('go', function (err) {
      if (err) throw err;
      fn.apply(self, args);
    });
  };
}

function install () {
  this._deferred = new Deferred(this);
}

function Deferred (fn) {
  Emitter.call(this);
  this.ready = false;
  this.fn = fn;
}

inherits(Deferred, Emitter);

Deferred.prototype.resolve = function (err) {
  this.ready = true;
  this.emit('go', err);
};

Deferred.prototype.queue = function (cb) {
  this.on('go', function (err) {
    cb(err, this.fn);
  });
};
