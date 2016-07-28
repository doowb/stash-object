'use strict';

var define = require('define-property');
var get = require('get-value');
var set = require('set-value');
var clone = require('clone-deep');

/**
 * Create a new stash for an object.
 * This will return an object with [.stash](#stash-1) and [.restore](#restore) methods used
 * for stashing and restoring states of the original object.
 *
 * ```js
 * var options = {};
 * var optionStash = stash(options);
 * ```
 * @param  {Object} `obj` Object to use for original state.
 * @return {Object} New instance used for stashing and restoring object state.
 * @api public
 */

module.exports = function stash(obj) {
  if (typeof obj !== 'object') {
    throw new TypeError('expected "obj" to be an object');
  }

  return new Stash(obj);
};

function Stash(obj) {
  define(this, 'obj', obj);
  define(this, 'stack', {});
}

/**
 * Stash the current object state on a named stack.
 * Pass a property path as the second argument to only stash part of the object.
 *
 * ```js
 * optionStash.stash('foo');
 * optionStash.stash('foo', 'bar.baz');
 * ```
 * @param  {String} `name` Name of the stack to push the object state onto.
 * @param  {String|Array} `prop` Optional property path to stash
 * @return {Object} `this` for chaining
 * @api public
 */

Stash.prototype.stash = function(name, prop) {
  name = name || 'default';
  if (!prop || prop.length === 0) {
    createStack(this.stack, name, 'root');
    this.stack[name].root.push(clone(this.obj));
    return this;
  }
  var key = Array.isArray(prop) ? prop.join('.') : prop;
  createStack(this.stack, name, key);

  var val = get(this.obj, prop);
  if (typeof val === 'object' && !Array.isArray(val)) {
    val = clone(val);
  }
  this.stack[name][key].push(val);
  return this;
};

/**
 * Restore a stashed object from the stack.
 * Pass a property path as the second argument to only restore part of the object.
 *
 * ```js
 * var obj = optionsStash.restore('foo');
 * var obj = optionsStash.restore('foo', 'bar.baz');
 * ```
 * @param  {String} `name` Name of the stack to retore the object state from.
 * @param  {String|Array} `prop` Optional property path to restore
 * @return {Object} Restored object. This is returned in case the original object reference needs to be reset.
 * @api public
 */

Stash.prototype.restore = function(name, prop) {
  name = name || 'default';
  if (!prop || prop.length === 0) {
    createStack(this.stack, name, 'root');
    if (this.stack[name].root.length === 0) {
      return this.obj;
    }
    this.obj = this.stack[name].root.pop();
    return this.obj;
  }

  var key = Array.isArray(prop) ? prop.join('.') : prop;
  createStack(this.stack, name, key);

  if (this.stack[name][key].length === 0) {
    return this.obj;
  }

  var val = this.stack[name][key].pop();
  set(this.obj, prop, val);
  return this.obj;
};

function createStack(obj, name, key) {
  obj[name] = obj[name] || {};
  obj[name][key] = obj[name][key] || [];
}
