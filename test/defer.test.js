var test = require('tape');
var Deferred = require('..');
var noop = function(){};

function Something () {
  var self = this;
  Deferred.install(self);

  self.loaded = false;

  setTimeout(function () {
    self.loaded = true;
    self._ready();
  }, 500);
}

Something.prototype.doAThing = Deferred(function (cb) {
  if (!this.loaded) cb(new Error('oops'));
  cb();
  return this;
});

test('defer', function (t) {
  var something = new Something();

  t.equal(something.doAThing(noop), something);

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

