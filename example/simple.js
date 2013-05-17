var Deferred = require('..');

function Something () {
  var self = this;
  Deferred.install(self);

  self.loaded = false;

  setTimeout(function () {
    self.loaded = true;
    self._deferred.go();
  }, 500);
}

Something.prototype.doAThing = Deferred(function () {
  if (!this.loaded) throw new Error('oops');
  console.log('success');
});

console.log('wait for 500ms...');
var something = new Something();
something.doAThing();
