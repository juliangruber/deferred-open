var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;

module.exports = defer;
module.exports.install = install;

function defer (fn) {
  return function () {
    var self = this;
    if (self._deferred.ready) return fn.apply(this, arguments);
 
    var args = [].slice.call(arguments);
    self._deferred.on('go', function () {
      fn.apply(self, args);
    });
  };
}

function install (obj) {
  obj._deferred = new Deferred();
}

function Deferred () {
  Emitter.call(this);
  this.ready = false;
}

inherits(Deferred, Emitter);

Deferred.prototype.go = function () {
  this.ready = true;
  this.emit('go');
};
