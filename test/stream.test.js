var test = require('tape');
var Deferred = require('..');
var Stream = require('stream');

function Something () {
  var self = this;
  Deferred.install(self);

  setTimeout(function () {
    self._ready();
  }, 500);
}

Something.prototype.createStream = Deferred.stream(function () {
  var stream = new Stream();
  stream.readable = stream.writable = true;
  stream.write = function (d) {
    stream.emit('data', d.toUpperCase());
  };
  setTimeout(function () {
    stream.emit('data', 'hey');
  });
  return stream;
});

test('stream', function (t) {
  var something = new Something();
  var stream = something.createStream();

  stream.once('data', function (data) {
    t.equals(data, 'WIN');

    stream.once('data', function (data) {
      t.equals(data, 'hey');
      t.end();
    });
  });

  stream.write('win');
});

