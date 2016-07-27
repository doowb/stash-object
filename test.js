'use strict';

require('mocha');
var assert = require('assert');
var stash = require('./');

describe('stash-object', function() {
  it('should export a function', function() {
    assert.equal(typeof stash, 'function');
  });

  it('should throw an error when invalid args are passed', function(cb) {
    try {
      stash();
      cb(new Error('expected an error'));
    } catch (err) {
      assert(err);
      assert.equal(err.message, 'expected "obj" to be an object');
      cb();
    }
  });

  it('should create a stash obj for an object', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});
  });

  it('should stash the entire object on the default stack', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash();
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { default: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });
  });

  it('should restore the entire object from the default stash', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash();
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { default: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });

    options.foo = 'foo';
    assert.deepEqual(optionsStash.obj, {foo: 'foo', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.stack, { default: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });

    options = optionsStash.restore();
    assert.deepEqual(options, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.stack, { default: { root: [] } });
  });

  it('should stash the entire object on a named stack', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });
  });

  it('should restore the entire object from a named stash', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });

    options.foo = 'foo';
    assert.deepEqual(optionsStash.obj, {foo: 'foo', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.stack, { foo: { root: [{foo: 'FOO', bar: {baz: 'BAZ'}}] } });

    options = optionsStash.restore('foo');
    assert.deepEqual(options, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.stack, { foo: { root: [] } });
  });

  it('should stash a property from the object on a named stack', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo', 'bar');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { 'bar': [{baz: 'BAZ'}] } });
  });

  it('should restore a property from the object from a named stash', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: 'BAZ'}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo', 'bar');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { bar: [{baz: 'BAZ'}] } });

    options.bar.baz = 'baz';
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: 'baz'}});
    assert.deepEqual(optionsStash.stack, { foo: { bar: [{baz: 'BAZ'}] } });

    options = optionsStash.restore('foo', 'bar');
    assert.deepEqual(options, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: 'BAZ'}});
    assert.deepEqual(optionsStash.stack, { foo: { bar: [] } });
  });

  it('should stash a property path from the object on a named stack', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: {beep: 'BOOP'}}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo', 'bar.baz');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { 'bar.baz': [{beep: 'BOOP'}] } });
  });

  it('should restore a property path from the object from a named stash', function() {
    var options = {
      foo: 'FOO',
      bar: {baz: {beep: 'BOOP'}}
    };

    var optionsStash = stash(options);
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, {});

    optionsStash.stash('foo', 'bar.baz');
    assert.deepEqual(optionsStash.obj, options);
    assert.deepEqual(optionsStash.stack, { foo: { 'bar.baz': [{beep: 'BOOP'}] } });

    options.bar.baz.beep = 'boop';
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: {beep: 'boop'}}});
    assert.deepEqual(optionsStash.stack, { foo: { 'bar.baz': [{beep: 'BOOP'}] } });

    options = optionsStash.restore('foo', 'bar.baz');
    assert.deepEqual(options, {foo: 'FOO', bar: {baz: {beep: 'BOOP'}}});
    assert.deepEqual(optionsStash.obj, {foo: 'FOO', bar: {baz: {beep: 'BOOP'}}});
    assert.deepEqual(optionsStash.stack, { foo: { 'bar.baz': [] } });
  });
});
