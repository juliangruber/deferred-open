var test = require('tape');
var Deferred = require('..');

function Safe (cb) {
  var self = this;
  if (!(self instanceof Safe)) return new Safe(cb);

  Deferred.install(self);

  if (typeof cb === 'function') self._deferred.queue(cb);

  self.secret = false;

  setTimeout(function () {
    self.secret = 'foobar';
    self._deferred.resolve();
  }, 500);
}

Safe.prototype.getSecret = Deferred(function (cb) {
  cb(null, this.secret);
});

test('nondeferred', function (t) {
  var start = +new Date();

  Safe(function (err, safe) {

    var delay = +new Date() - start;
    t.assert(delay > 400 && delay < 600, 'deferred');

    start = +new Date();

    safe.getSecret(function (err, secret) {

      delay = +new Date() - start;
      t.assert(delay < 100, 'not deferred');
      t.equals(secret, 'foobar');

      t.end();
    });
  });
});
