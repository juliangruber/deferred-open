var test = require('tape');
var Deferred = require('..');

function Something () {
  var self = this;
  Deferred.install.call(self);

  self.loaded = false;

  setTimeout(function () {
    self.loaded = true;
    self._deferred.resolve();
  }, 500);
}

Something.prototype.doAThing = Deferred(function (cb) {
  if (!this.loaded) cb(new Error('oops'));
  cb();
});

test('defer', function (t) {
  var something = new Something();
  var start = +new Date();
  something.doAThing(function (err) {
    var delay = +new Date() - start;

    t.error(err, 'loaded');
    t.assert(delay > 400, 'delay ok');
    t.assert(delay < 600, 'delay ok');

    start = +new Date();
    something.doAThing(function (err) {
      delay = +new Date() - start;

      t.error(err, 'still loaded');
      t.assert(delay < 100, 'no delay');
      t.end();
    });
  });
});

