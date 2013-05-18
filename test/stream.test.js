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
  stream.readable = true;
  setTimeout(function () {
    stream.emit('data', 'hey');
  });
  return stream;
});

test('stream', function (t) {
  var something = new Something();
  var stream = something.createStream();

  var start = +new Date();
  stream.on('data', function (data) {
    var delay = +new Date() - start;
    t.assert(delay > 400, 'delay ok');
    t.assert(delay < 600, 'delay ok');

    t.equals(data, 'hey');
    t.end();
  });
});

