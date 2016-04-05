/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ZetaPush = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  CallbackPollingTransport: require('./lib/CallbackPollingTransport'),
  CometD: require('./lib/CometD'),
  LongPollingTransport: require('./lib/LongPollingTransport'),
  RequestTransport: require('./lib/RequestTransport'),
  Transport: require('./lib/Transport'),
  TransportRegistry: require('./lib/TransportRegistry'),
  Utils: require('./lib/Utils'),
  WebSocketTransport: require('./lib/WebSocketTransport')
}

},{"./lib/CallbackPollingTransport":2,"./lib/CometD":3,"./lib/LongPollingTransport":4,"./lib/RequestTransport":5,"./lib/Transport":6,"./lib/TransportRegistry":7,"./lib/Utils":8,"./lib/WebSocketTransport":9}],2:[function(require,module,exports){
var Transport = require('./Transport');
var RequestTransport = require('./RequestTransport');

module.exports = function CallbackPollingTransport() {
    var _super = new RequestTransport();
    var _self = Transport.derive(_super);

    _self.accept = function(version, crossDomain, url) {
        return true;
    };

    _self.jsonpSend = function(packet) {
        throw 'Abstract';
    };

    function _failTransportFn(envelope, request, x) {
        var self = this;
        return function() {
            self.transportFailure(envelope, request, 'error', x);
        };
    }

    _self.transportSend = function(envelope, request) {
        var self = this;

        // Microsoft Internet Explorer has a 2083 URL max length
        // We must ensure that we stay within that length
        var start = 0;
        var length = envelope.messages.length;
        var lengths = [];
        while (length > 0) {
            // Encode the messages because all brackets, quotes, commas, colons, etc
            // present in the JSON will be URL encoded, taking many more characters
            var json = JSON.stringify(envelope.messages.slice(start, start + length));
            var urlLength = envelope.url.length + encodeURI(json).length;

            var maxLength = this.getConfiguration().maxURILength;
            if (urlLength > maxLength) {
                if (length === 1) {
                    var x = 'Bayeux message too big (' + urlLength + ' bytes, max is ' + maxLength + ') ' +
                        'for transport ' + this.getType();
                    // Keep the semantic of calling response callbacks asynchronously after the request
                    this.setTimeout(_failTransportFn.call(this, envelope, request, x), 0);
                    return;
                }

                --length;
                continue;
            }

            lengths.push(length);
            start += length;
            length = envelope.messages.length - start;
        }

        // Here we are sure that the messages can be sent within the URL limit

        var envelopeToSend = envelope;
        if (lengths.length > 1) {
            var begin = 0;
            var end = lengths[0];
            this._debug('Transport', this.getType(), 'split', envelope.messages.length, 'messages into', lengths.join(' + '));
            envelopeToSend = this._mixin(false, {}, envelope);
            envelopeToSend.messages = envelope.messages.slice(begin, end);
            envelopeToSend.onSuccess = envelope.onSuccess;
            envelopeToSend.onFailure = envelope.onFailure;

            for (var i = 1; i < lengths.length; ++i) {
                var nextEnvelope = this._mixin(false, {}, envelope);
                begin = end;
                end += lengths[i];
                nextEnvelope.messages = envelope.messages.slice(begin, end);
                nextEnvelope.onSuccess = envelope.onSuccess;
                nextEnvelope.onFailure = envelope.onFailure;
                this.send(nextEnvelope, request.metaConnect);
            }
        }

        this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelopeToSend);

        try {
            var sameStack = true;
            this.jsonpSend({
                transport: this,
                url: envelopeToSend.url,
                sync: envelopeToSend.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(envelopeToSend.messages),
                onSuccess: function(responses) {
                    var success = false;
                    try {
                        var received = self.convertToMessages(responses);
                        if (received.length === 0) {
                            self.transportFailure(envelopeToSend, request, {
                                httpCode: 204
                            });
                        } else {
                            success = true;
                            self.transportSuccess(envelopeToSend, request, received);
                        }
                    } catch (x) {
                        self._debug(x);
                        if (!success) {
                            self.transportFailure(envelopeToSend, request, {
                                exception: x
                            });
                        }
                    }
                },
                onError: function(reason, exception) {
                    var failure = {
                        reason: reason,
                        exception: exception
                    };
                    if (sameStack) {
                        // Keep the semantic of calling response callbacks asynchronously after the request
                        self.setTimeout(function() {
                            self.transportFailure(envelopeToSend, request, failure);
                        }, 0);
                    } else {
                        self.transportFailure(envelopeToSend, request, failure);
                    }
                }
            });
            sameStack = false;
        } catch (xx) {
            // Keep the semantic of calling response callbacks asynchronously after the request
            this.setTimeout(function() {
                self.transportFailure(envelopeToSend, request, {
                    exception: xx
                });
            }, 0);
        }
    };

    return _self;
};

},{"./RequestTransport":5,"./Transport":6}],3:[function(require,module,exports){
var TransportRegistry = require('./TransportRegistry')
var Utils = require('./Utils')
/**
 * The constructor for a CometD object, identified by an optional name.
 * The default name is the string 'default'.
 * In the rare case a page needs more than one Bayeux conversation,
 * a new instance can be created via:
 * <pre>
 * var bayeuxUrl2 = ...;
 *
 * // Dojo style
 * var cometd2 = new dojox.CometD('another_optional_name');
 *
 * // jQuery style
 * var cometd2 = new $.CometD('another_optional_name');
 *
 * cometd2.init({url: bayeuxUrl2});
 * </pre>
 * @param name the optional name of this cometd object
 */
module.exports = function CometD(name) {
    var _cometd = this;
    var _name = name || 'default';
    var _crossDomain = false;
    var _transports = new TransportRegistry();
    var _transport;
    var _status = 'disconnected';
    var _messageId = 0;
    var _clientId = null;
    var _batch = 0;
    var _messageQueue = [];
    var _internalBatch = false;
    var _listeners = {};
    var _backoff = 0;
    var _scheduledSend = null;
    var _extensions = [];
    var _advice = {};
    var _handshakeProps;
    var _handshakeCallback;
    var _callbacks = {};
    var _remoteCalls = {};
    var _reestablish = false;
    var _connected = false;
    var _unconnectTime = 0;
    var _handshakeMessages = 0;
    var _config = {
        protocol: null,
        stickyReconnect: true,
        connectTimeout: 0,
        maxConnections: 2,
        backoffIncrement: 1000,
        maxBackoff: 60000,
        logLevel: 'info',
        reverseIncomingExtensions: true,
        maxNetworkDelay: 10000,
        requestHeaders: {},
        appendMessageTypeToURL: true,
        autoBatch: false,
        urls: {},
        maxURILength: 2000,
        advice: {
            timeout: 60000,
            interval: 0,
            reconnect: undefined,
            maxInterval: 0
        }
    };

    function _fieldValue(object, name) {
        try {
            return object[name];
        } catch (x) {
            return undefined;
        }
    }

    /**
     * Mixes in the given objects into the target object by copying the properties.
     * @param deep if the copy must be deep
     * @param target the target object
     * @param objects the objects whose properties are copied into the target
     */
    this._mixin = function(deep, target, objects) {
        var result = target || {};

        // Skip first 2 parameters (deep and target), and loop over the others
        for (var i = 2; i < arguments.length; ++i) {
            var object = arguments[i];

            if (object === undefined || object === null) {
                continue;
            }

            for (var propName in object) {
                if (object.hasOwnProperty(propName)) {
                    var prop = _fieldValue(object, propName);
                    var targ = _fieldValue(result, propName);

                    // Avoid infinite loops
                    if (prop === target) {
                        continue;
                    }
                    // Do not mixin undefined values
                    if (prop === undefined) {
                        continue;
                    }

                    if (deep && typeof prop === 'object' && prop !== null) {
                        if (prop instanceof Array) {
                            result[propName] = this._mixin(deep, targ instanceof Array ? targ : [], prop);
                        } else {
                            var source = typeof targ === 'object' && !(targ instanceof Array) ? targ : {};
                            result[propName] = this._mixin(deep, source, prop);
                        }
                    } else {
                        result[propName] = prop;
                    }
                }
            }
        }

        return result;
    };

    function _isString(value) {
        return Utils.isString(value);
    }

    function _isFunction(value) {
        if (value === undefined || value === null) {
            return false;
        }
        return typeof value === 'function';
    }

    function _zeroPad(value, length) {
        var result = '';
        while (--length > 0) {
            if (value >= Math.pow(10, length)) {
                break;
            }
            result += '0';
        }
        result += value;
        return result;
    }

    function _log(level, args) {
        if ('undefined' !== typeof console) {
            var logger = console[level];
            if (_isFunction(logger)) {
                var now = new Date();
                [].splice.call(args, 0, 0, _zeroPad(now.getHours(), 2) + ':' + _zeroPad(now.getMinutes(), 2) + ':' +
                        _zeroPad(now.getSeconds(), 2) + '.' + _zeroPad(now.getMilliseconds(), 3));
                logger.apply(console, args);
            }
        }
    }

    this._warn = function() {
        _log('warn', arguments);
    };

    this._info = function() {
        if (_config.logLevel !== 'warn') {
            _log('info', arguments);
        }
    };

    this._debug = function() {
        if (_config.logLevel === 'debug') {
            _log('debug', arguments);
        }
    };

    function _splitURL(url) {
        // [1] = protocol://,
        // [2] = host:port,
        // [3] = host,
        // [4] = IPv6_host,
        // [5] = IPv4_host,
        // [6] = :port,
        // [7] = port,
        // [8] = uri,
        // [9] = rest (query / fragment)
        return /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(url);
    }

    /**
     * Returns whether the given hostAndPort is cross domain.
     * The default implementation checks against window.location.host
     * but this function can be overridden to make it work in non-browser
     * environments.
     *
     * @param hostAndPort the host and port in format host:port
     * @return whether the given hostAndPort is cross domain
     */
    this._isCrossDomain = function(hostAndPort) {
        return hostAndPort && hostAndPort !== window.location.host;
    };

    function _configure(configuration) {
        _cometd._debug('Configuring cometd object with', configuration);
        // Support old style param, where only the Bayeux server URL was passed
        if (_isString(configuration)) {
            configuration = { url: configuration };
        }
        if (!configuration) {
            configuration = {};
        }

        _config = _cometd._mixin(false, _config, configuration);

        var url = _cometd.getURL();
        if (!url) {
            throw 'Missing required configuration parameter \'url\' specifying the Bayeux server URL';
        }

        // Check if we're cross domain.
        var urlParts = _splitURL(url);
        var hostAndPort = urlParts[2];
        var uri = urlParts[8];
        var afterURI = urlParts[9];
        _crossDomain = _cometd._isCrossDomain(hostAndPort);

        // Check if appending extra path is supported
        if (_config.appendMessageTypeToURL) {
            if (afterURI !== undefined && afterURI.length > 0) {
                _cometd._info('Appending message type to URI ' + uri + afterURI + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
                _config.appendMessageTypeToURL = false;
            } else {
                var uriSegments = uri.split('/');
                var lastSegmentIndex = uriSegments.length - 1;
                if (uri.match(/\/$/)) {
                    lastSegmentIndex -= 1;
                }
                if (uriSegments[lastSegmentIndex].indexOf('.') >= 0) {
                    // Very likely the CometD servlet's URL pattern is mapped to an extension, such as *.cometd
                    // It will be difficult to add the extra path in this case
                    _cometd._info('Appending message type to URI ' + uri + ' is not supported, disabling \'appendMessageTypeToURL\' configuration');
                    _config.appendMessageTypeToURL = false;
                }
            }
        }
    }

    function _removeListener(subscription) {
        if (subscription) {
            var subscriptions = _listeners[subscription.channel];
            if (subscriptions && subscriptions[subscription.id]) {
                delete subscriptions[subscription.id];
                _cometd._debug('Removed', subscription.listener ? 'listener' : 'subscription', subscription);
            }
        }
    }

    function _removeSubscription(subscription) {
        if (subscription && !subscription.listener) {
            _removeListener(subscription);
        }
    }

    function _clearSubscriptions() {
        for (var channel in _listeners) {
            if (_listeners.hasOwnProperty(channel)) {
                var subscriptions = _listeners[channel];
                if (subscriptions) {
                    for (var i = 0; i < subscriptions.length; ++i) {
                        _removeSubscription(subscriptions[i]);
                    }
                }
            }
        }
    }

    function _setStatus(newStatus) {
        if (_status !== newStatus) {
            _cometd._debug('Status', _status, '->', newStatus);
            _status = newStatus;
        }
    }

    function _isDisconnected() {
        return _status === 'disconnecting' || _status === 'disconnected';
    }

    function _nextMessageId() {
        var result = ++_messageId;
        return '' + result;
    }

    function _applyExtension(scope, callback, name, message, outgoing) {
        try {
            return callback.call(scope, message);
        } catch (x) {
            var handler = _cometd.onExtensionException;
            if (_isFunction(handler)) {
                _cometd._debug('Invoking extension exception handler', name, x);
                try {
                    handler.call(_cometd, x, name, outgoing, message);
                } catch (xx) {
                    _cometd._info('Exception during execution of extension exception handler', name, xx);
                }
            } else {
                _cometd._info('Exception during execution of extension', name, x);
            }
            return message;
        }
    }

    function _applyIncomingExtensions(message) {
        for (var i = 0; i < _extensions.length; ++i) {
            if (message === undefined || message === null) {
                break;
            }

            var index = _config.reverseIncomingExtensions ? _extensions.length - 1 - i : i;
            var extension = _extensions[index];
            var callback = extension.extension.incoming;
            if (_isFunction(callback)) {
                var result = _applyExtension(extension.extension, callback, extension.name, message, false);
                message = result === undefined ? message : result;
            }
        }
        return message;
    }

    function _applyOutgoingExtensions(message) {
        for (var i = 0; i < _extensions.length; ++i) {
            if (message === undefined || message === null) {
                break;
            }

            var extension = _extensions[i];
            var callback = extension.extension.outgoing;
            if (_isFunction(callback)) {
                var result = _applyExtension(extension.extension, callback, extension.name, message, true);
                message = result === undefined ? message : result;
            }
        }
        return message;
    }

    function _notify(channel, message) {
        var subscriptions = _listeners[channel];
        if (subscriptions && subscriptions.length > 0) {
            for (var i = 0; i < subscriptions.length; ++i) {
                var subscription = subscriptions[i];
                // Subscriptions may come and go, so the array may have 'holes'
                if (subscription) {
                    try {
                        subscription.callback.call(subscription.scope, message);
                    } catch (x) {
                        var handler = _cometd.onListenerException;
                        if (_isFunction(handler)) {
                            _cometd._debug('Invoking listener exception handler', subscription, x);
                            try {
                                handler.call(_cometd, x, subscription, subscription.listener, message);
                            } catch (xx) {
                                _cometd._info('Exception during execution of listener exception handler', subscription, xx);
                            }
                        } else {
                            _cometd._info('Exception during execution of listener', subscription, message, x);
                        }
                    }
                }
            }
        }
    }

    function _notifyListeners(channel, message) {
        // Notify direct listeners
        _notify(channel, message);

        // Notify the globbing listeners
        var channelParts = channel.split('/');
        var last = channelParts.length - 1;
        for (var i = last; i > 0; --i) {
            var channelPart = channelParts.slice(0, i).join('/') + '/*';
            // We don't want to notify /foo/* if the channel is /foo/bar/baz,
            // so we stop at the first non recursive globbing
            if (i === last) {
                _notify(channelPart, message);
            }
            // Add the recursive globber and notify
            channelPart += '*';
            _notify(channelPart, message);
        }
    }

    function _cancelDelayedSend() {
        if (_scheduledSend !== null) {
            Utils.clearTimeout(_scheduledSend);
        }
        _scheduledSend = null;
    }

    function _delayedSend(operation, delay) {
        _cancelDelayedSend();
        var time = _advice.interval + delay;
        _cometd._debug('Function scheduled in', time, 'ms, interval =', _advice.interval, 'backoff =', _backoff, operation);
        _scheduledSend = Utils.setTimeout(_cometd, operation, time);
    }

    // Needed to break cyclic dependencies between function definitions
    var _handleMessages;
    var _handleFailure;

    /**
     * Delivers the messages to the CometD server
     * @param sync whether the send is synchronous
     * @param messages the array of messages to send
     * @param metaConnect true if this send is on /meta/connect
     * @param extraPath an extra path to append to the Bayeux server URL
     */
    function _send(sync, messages, metaConnect, extraPath) {
        // We must be sure that the messages have a clientId.
        // This is not guaranteed since the handshake may take time to return
        // (and hence the clientId is not known yet) and the application
        // may create other messages.
        for (var i = 0; i < messages.length; ++i) {
            var message = messages[i];
            var messageId = message.id;

            if (_clientId) {
                message.clientId = _clientId;
            }

            message = _applyOutgoingExtensions(message);
            if (message !== undefined && message !== null) {
                // Extensions may have modified the message id, but we need to own it.
                message.id = messageId;
                messages[i] = message;
            } else {
                delete _callbacks[messageId];
                messages.splice(i--, 1);
            }
        }

        if (messages.length === 0) {
            return;
        }

        var url = _cometd.getURL();
        if (_config.appendMessageTypeToURL) {
            // If url does not end with '/', then append it
            if (!url.match(/\/$/)) {
                url = url + '/';
            }
            if (extraPath) {
                url = url + extraPath;
            }
        }

        var envelope = {
            url: url,
            sync: sync,
            messages: messages,
            onSuccess: function(rcvdMessages) {
                try {
                    _handleMessages.call(_cometd, rcvdMessages);
                } catch (x) {
                    _cometd._info('Exception during handling of messages', x);
                }
            },
            onFailure: function(conduit, messages, failure) {
                try {
                    var transport = _cometd.getTransport();
                    failure.connectionType = transport ? transport.getType() : "unknown";
                    _handleFailure.call(_cometd, conduit, messages, failure);
                } catch (x) {
                    _cometd._info('Exception during handling of failure', x);
                }
            }
        };
        _cometd._debug('Send', envelope);
        _transport.send(envelope, metaConnect);
    }

    function _queueSend(message) {
        if (_batch > 0 || _internalBatch === true) {
            _messageQueue.push(message);
        } else {
            _send(false, [message], false);
        }
    }

    /**
     * Sends a complete bayeux message.
     * This method is exposed as a public so that extensions may use it
     * to send bayeux message directly, for example in case of re-sending
     * messages that have already been sent but that for some reason must
     * be resent.
     */
    this.send = _queueSend;

    function _resetBackoff() {
        _backoff = 0;
    }

    function _increaseBackoff() {
        if (_backoff < _config.maxBackoff) {
            _backoff += _config.backoffIncrement;
        }
        return _backoff;
    }

    /**
     * Starts a the batch of messages to be sent in a single request.
     * @see #_endBatch(sendMessages)
     */
    function _startBatch() {
        ++_batch;
        _cometd._debug('Starting batch, depth', _batch);
    }

    function _flushBatch() {
        var messages = _messageQueue;
        _messageQueue = [];
        if (messages.length > 0) {
            _send(false, messages, false);
        }
    }

    /**
     * Ends the batch of messages to be sent in a single request,
     * optionally sending messages present in the message queue depending
     * on the given argument.
     * @see #_startBatch()
     */
    function _endBatch() {
        --_batch;
        _cometd._debug('Ending batch, depth', _batch);
        if (_batch < 0) {
            throw 'Calls to startBatch() and endBatch() are not paired';
        }

        if (_batch === 0 && !_isDisconnected() && !_internalBatch) {
            _flushBatch();
        }
    }

    /**
     * Sends the connect message
     */
    function _connect() {
        if (!_isDisconnected()) {
            var bayeuxMessage = {
                id: _nextMessageId(),
                channel: '/meta/connect',
                connectionType: _transport.getType()
            };

            // In case of reload or temporary loss of connection
            // we want the next successful connect to return immediately
            // instead of being held by the server, so that connect listeners
            // can be notified that the connection has been re-established
            if (!_connected) {
                bayeuxMessage.advice = { timeout: 0 };
            }

            _setStatus('connecting');
            _cometd._debug('Connect sent', bayeuxMessage);
            _send(false, [bayeuxMessage], true, 'connect');
            _setStatus('connected');
        }
    }

    function _delayedConnect(delay) {
        _setStatus('connecting');
        _delayedSend(function() {
            _connect();
        }, delay);
    }

    function _updateAdvice(newAdvice) {
        if (newAdvice) {
            _advice = _cometd._mixin(false, {}, _config.advice, newAdvice);
            _cometd._debug('New advice', _advice);
        }
    }

    function _disconnect(abort) {
        _cancelDelayedSend();
        if (abort && _transport) {
            _transport.abort();
        }
        _clientId = null;
        _setStatus('disconnected');
        _batch = 0;
        _resetBackoff();
        _transport = null;

        // Fail any existing queued message
        if (_messageQueue.length > 0) {
            var messages = _messageQueue;
            _messageQueue = [];
            _handleFailure.call(_cometd, undefined, messages, {
                reason: 'Disconnected'
            });
        }
    }

    function _notifyTransportException(oldTransport, newTransport, failure) {
        var handler = _cometd.onTransportException;
        if (_isFunction(handler)) {
            _cometd._debug('Invoking transport exception handler', oldTransport, newTransport, failure);
            try {
                handler.call(_cometd, failure, oldTransport, newTransport);
            } catch (x) {
                _cometd._info('Exception during execution of transport exception handler', x);
            }
        }
    }

    /**
     * Sends the initial handshake message
     */
    function _handshake(handshakeProps, handshakeCallback) {
        if (_isFunction(handshakeProps)) {
            handshakeCallback = handshakeProps;
            handshakeProps = undefined;
        }

        _clientId = null;

        _clearSubscriptions();

        // Reset the transports if we're not retrying the handshake
        if (_isDisconnected()) {
            _transports.reset(true);
            _updateAdvice(_config.advice);
        }

        _batch = 0;

        // Mark the start of an internal batch.
        // This is needed because handshake and connect are async.
        // It may happen that the application calls init() then subscribe()
        // and the subscribe message is sent before the connect message, if
        // the subscribe message is not held until the connect message is sent.
        // So here we start a batch to hold temporarily any message until
        // the connection is fully established.
        _internalBatch = true;

        // Save the properties provided by the user, so that
        // we can reuse them during automatic re-handshake
        _handshakeProps = handshakeProps;
        _handshakeCallback = handshakeCallback;

        var version = '1.0';

        // Figure out the transports to send to the server
        var url = _cometd.getURL();
        var transportTypes = _transports.findTransportTypes(version, _crossDomain, url);

        var bayeuxMessage = {
            id: _nextMessageId(),
            version: version,
            minimumVersion: version,
            channel: '/meta/handshake',
            supportedConnectionTypes: transportTypes,
            advice: {
                timeout: _advice.timeout,
                interval: _advice.interval
            }
        };
        // Do not allow the user to override important fields.
        var message = _cometd._mixin(false, {}, _handshakeProps, bayeuxMessage);

        // Save the callback.
        _cometd._putCallback(message.id, handshakeCallback);

        // Pick up the first available transport as initial transport
        // since we don't know if the server supports it
        if (!_transport) {
            _transport = _transports.negotiateTransport(transportTypes, version, _crossDomain, url);
            if (!_transport) {
                var failure = 'Could not find initial transport among: ' + _transports.getTransportTypes();
                _cometd._warn(failure);
                throw failure;
            }
        }

        _cometd._debug('Initial transport is', _transport.getType());

        // We started a batch to hold the application messages,
        // so here we must bypass it and send immediately.
        _setStatus('handshaking');
        _cometd._debug('Handshake sent', message);
        _send(false, [message], false, 'handshake');
    }

    function _delayedHandshake(delay) {
        _setStatus('handshaking');

        // We will call _handshake() which will reset _clientId, but we want to avoid
        // that between the end of this method and the call to _handshake() someone may
        // call publish() (or other methods that call _queueSend()).
        _internalBatch = true;

        _delayedSend(function() {
            _handshake(_handshakeProps, _handshakeCallback);
        }, delay);
    }

    function _notifyCallback(callback, message) {
        try {
            callback.call(_cometd, message);
        } catch (x) {
            var handler = _cometd.onCallbackException;
            if (_isFunction(handler)) {
                _cometd._debug('Invoking callback exception handler', x);
                try {
                    handler.call(_cometd, x, message);
                } catch (xx) {
                    _cometd._info('Exception during execution of callback exception handler', xx);
                }
            } else {
                _cometd._info('Exception during execution of message callback', x);
            }
        }
    }

    this._getCallback = function(messageId) {
        return _callbacks[messageId];
    };

    this._putCallback = function(messageId, callback) {
        var result = this._getCallback(messageId);
        if (_isFunction(callback)) {
            _callbacks[messageId] = callback;
        }
        return result;
    };

    function _handleCallback(message) {
        var callback = _cometd._getCallback([message.id]);
        if (_isFunction(callback)) {
            delete _callbacks[message.id];
            _notifyCallback(callback, message);
        }
    }

    function _handleRemoteCall(message) {
        var context = _remoteCalls[message.id];
        delete _remoteCalls[message.id];
        if (context) {
            _cometd._debug('Handling remote call response for', message, 'with context', context);

            // Clear the timeout, if present.
            var timeout = context.timeout;
            if (timeout) {
                Utils.clearTimeout(timeout);
            }

            var callback = context.callback;
            if (_isFunction(callback)) {
                _notifyCallback(callback, message);
                return true;
            }
        }
        return false;
    }

    this.onTransportFailure = function(message, failureInfo, failureHandler) {
        this._debug('Transport failure', failureInfo, 'for', message);

        var transports = this.getTransportRegistry();
        var url = this.getURL();
        var crossDomain = this._isCrossDomain(_splitURL(url)[2]);
        var version = '1.0';
        var transportTypes = transports.findTransportTypes(version, crossDomain, url);

        if (failureInfo.action === 'none') {
            if (message.channel === '/meta/handshake') {
                if (!failureInfo.transport) {
                    var failure = 'Could not negotiate transport, client=[' + transportTypes + '], server=[' + message.supportedConnectionTypes + ']';
                    this._warn(failure);
                    _notifyTransportException(_transport.getType(), null, {
                        reason: failure,
                        connectionType: _transport.getType(),
                        transport: _transport
                    });
                }
            }
        } else {
            failureInfo.delay = this.getBackoffPeriod();
            // Different logic depending on whether we are handshaking or connecting.
            if (message.channel === '/meta/handshake') {
                if (!failureInfo.transport) {
                    // The transport is invalid, try to negotiate again.
                    var newTransport = transports.negotiateTransport(transportTypes, version, crossDomain, url);
                    if (!newTransport) {
                        this._warn('Could not negotiate transport, client=[' + transportTypes + ']');
                        _notifyTransportException(_transport.getType(), null, message.failure);
                        failureInfo.action = 'none';
                    } else {
                        this._debug('Transport', _transport.getType(), '->', newTransport.getType());
                        _notifyTransportException(_transport.getType(), newTransport.getType(), message.failure);
                        failureInfo.action = 'handshake';
                        failureInfo.transport = newTransport;
                    }
                }

                if (failureInfo.action !== 'none') {
                    this.increaseBackoffPeriod();
                }
            } else {
                var now = new Date().getTime();

                if (_unconnectTime === 0) {
                    _unconnectTime = now;
                }

                if (failureInfo.action === 'retry') {
                    failureInfo.delay = this.increaseBackoffPeriod();
                    // Check whether we may switch to handshaking.
                    var maxInterval = _advice.maxInterval;
                    if (maxInterval > 0) {
                        var expiration = _advice.timeout + _advice.interval + maxInterval;
                        var unconnected = now - _unconnectTime;
                        if (unconnected + _backoff > expiration) {
                            failureInfo.action = 'handshake';
                        }
                    }
                }

                if (failureInfo.action === 'handshake') {
                    failureInfo.delay = 0;
                    transports.reset(false);
                    this.resetBackoffPeriod();
                }
            }
        }

        failureHandler.call(_cometd, failureInfo);
    };

    function _handleTransportFailure(failureInfo) {
        _cometd._debug('Transport failure handling', failureInfo);

        if (failureInfo.transport) {
            _transport = failureInfo.transport;
        }

        if (failureInfo.url) {
            _transport.setURL(failureInfo.url);
        }

        var action = failureInfo.action;
        var delay = failureInfo.delay || 0;
        switch (action) {
            case 'handshake':
                _delayedHandshake(delay);
                break;
            case 'retry':
                _delayedConnect(delay);
                break;
            case 'none':
                _disconnect(true);
                break;
            default:
                throw 'Unknown action ' + action;
        }
    }

    function _failHandshake(message, failureInfo) {
        _handleCallback(message);
        _notifyListeners('/meta/handshake', message);
        _notifyListeners('/meta/unsuccessful', message);

        // The listeners may have disconnected.
        if (_isDisconnected()) {
            failureInfo.action = 'none';
        }

        _cometd.onTransportFailure.call(_cometd, message, failureInfo, _handleTransportFailure);
    }

    function _handshakeResponse(message) {
        var url = _cometd.getURL();
        if (message.successful) {
            var crossDomain = _cometd._isCrossDomain(_splitURL(url)[2]);
            var newTransport = _transports.negotiateTransport(message.supportedConnectionTypes, message.version, crossDomain, url);
            if (newTransport === null) {
                message.successful = false;
                _failHandshake(message, {
                    cause: 'negotiation',
                    action: 'none',
                    transport: null
                });
                return;
            } else if (_transport !== newTransport) {
                _cometd._debug('Transport', _transport.getType(), '->', newTransport.getType());
                _transport = newTransport;
            }

            _clientId = message.clientId;

            // End the internal batch and allow held messages from the application
            // to go to the server (see _handshake() where we start the internal batch).
            _internalBatch = false;
            _flushBatch();

            // Here the new transport is in place, as well as the clientId, so
            // the listeners can perform a publish() if they want.
            // Notify the listeners before the connect below.
            message.reestablish = _reestablish;
            _reestablish = true;

            _handleCallback(message);
            _notifyListeners('/meta/handshake', message);

            _handshakeMessages = message['x-messages'] || 0;

            var action = _isDisconnected() ? 'none' : _advice.reconnect || 'retry';
            switch (action) {
                case 'retry':
                    _resetBackoff();
                    if (_handshakeMessages === 0) {
                        _delayedConnect(0);
                    } else {
                        _cometd._debug('Processing', _handshakeMessages, 'handshake-delivered messages');
                    }
                    break;
                case 'none':
                    _disconnect(true);
                    break;
                default:
                    throw 'Unrecognized advice action ' + action;
            }
        } else {
            _failHandshake(message, {
                cause: 'unsuccessful',
                action: _advice.reconnect || 'handshake',
                transport: _transport
            });
        }
    }

    function _handshakeFailure(message) {
        _failHandshake(message, {
            cause: 'failure',
            action: 'handshake',
            transport: null
        });
    }

    function _failConnect(message, failureInfo) {
        // Notify the listeners after the status change but before the next action.
        _notifyListeners('/meta/connect', message);
        _notifyListeners('/meta/unsuccessful', message);

        // The listeners may have disconnected.
        if (_isDisconnected()) {
            failureInfo.action = 'none';
        }

        _cometd.onTransportFailure.call(_cometd, message, failureInfo, _handleTransportFailure);
    }

    function _connectResponse(message) {
        _connected = message.successful;

        if (_connected) {
            _notifyListeners('/meta/connect', message);

            // Normally, the advice will say "reconnect: 'retry', interval: 0"
            // and the server will hold the request, so when a response returns
            // we immediately call the server again (long polling).
            // Listeners can call disconnect(), so check the state after they run.
            var action = _isDisconnected() ? 'none' : _advice.reconnect || 'retry';
            switch (action) {
                case 'retry':
                    _resetBackoff();
                    _delayedConnect(_backoff);
                    break;
                case 'none':
                    _disconnect(false);
                    break;
                default:
                    throw 'Unrecognized advice action ' + action;
            }
        } else {
            _failConnect(message, {
                cause: 'unsuccessful',
                action: _advice.reconnect || 'retry',
                transport: _transport
            });
        }
    }

    function _connectFailure(message) {
        _connected = false;

        _failConnect(message, {
            cause: 'failure',
            action: 'retry',
            transport: null
        });
    }

    function _failDisconnect(message) {
        _disconnect(true);
        _handleCallback(message);
        _notifyListeners('/meta/disconnect', message);
        _notifyListeners('/meta/unsuccessful', message);
    }

    function _disconnectResponse(message) {
        if (message.successful) {
            // Wait for the /meta/connect to arrive.
            _disconnect(false);
            _handleCallback(message);
            _notifyListeners('/meta/disconnect', message);
        } else {
            _failDisconnect(message);
        }
    }

    function _disconnectFailure(message) {
        _failDisconnect(message);
    }

    function _failSubscribe(message) {
        var subscriptions = _listeners[message.subscription];
        if (subscriptions) {
            for (var i = subscriptions.length - 1; i >= 0; --i) {
                var subscription = subscriptions[i];
                if (subscription && !subscription.listener) {
                    delete subscriptions[i];
                    _cometd._debug('Removed failed subscription', subscription);
                    break;
                }
            }
        }
        _handleCallback(message);
        _notifyListeners('/meta/subscribe', message);
        _notifyListeners('/meta/unsuccessful', message);
    }

    function _subscribeResponse(message) {
        if (message.successful) {
            _handleCallback(message);
            _notifyListeners('/meta/subscribe', message);
        } else {
            _failSubscribe(message);
        }
    }

    function _subscribeFailure(message) {
        _failSubscribe(message);
    }

    function _failUnsubscribe(message) {
        _handleCallback(message);
        _notifyListeners('/meta/unsubscribe', message);
        _notifyListeners('/meta/unsuccessful', message);
    }

    function _unsubscribeResponse(message) {
        if (message.successful) {
            _handleCallback(message);
            _notifyListeners('/meta/unsubscribe', message);
        } else {
            _failUnsubscribe(message);
        }
    }

    function _unsubscribeFailure(message) {
        _failUnsubscribe(message);
    }

    function _failMessage(message) {
        if (!_handleRemoteCall(message)) {
            _handleCallback(message);
            _notifyListeners('/meta/publish', message);
            _notifyListeners('/meta/unsuccessful', message);
        }
    }

    function _messageResponse(message) {
        if (message.data !== undefined) {
            if (!_handleRemoteCall(message)) {
                _notifyListeners(message.channel, message);
                if (_handshakeMessages > 0) {
                    --_handshakeMessages;
                    if (_handshakeMessages === 0) {
                        _cometd._debug('Processed last handshake-delivered message');
                        _delayedConnect(0);
                    }
                }
            }
        } else {
            if (message.successful === undefined) {
                _cometd._warn('Unknown Bayeux Message', message);
            } else {
                if (message.successful) {
                    _handleCallback(message);
                    _notifyListeners('/meta/publish', message);
                } else {
                    _failMessage(message);
                }
            }
        }
    }

    function _messageFailure(failure) {
        _failMessage(failure);
    }

    function _receive(message) {
        _unconnectTime = 0;

        message = _applyIncomingExtensions(message);
        if (message === undefined || message === null) {
            return;
        }

        _updateAdvice(message.advice);

        var channel = message.channel;
        switch (channel) {
            case '/meta/handshake':
                _handshakeResponse(message);
                break;
            case '/meta/connect':
                _connectResponse(message);
                break;
            case '/meta/disconnect':
                _disconnectResponse(message);
                break;
            case '/meta/subscribe':
                _subscribeResponse(message);
                break;
            case '/meta/unsubscribe':
                _unsubscribeResponse(message);
                break;
            default:
                _messageResponse(message);
                break;
        }
    }

    /**
     * Receives a message.
     * This method is exposed as a public so that extensions may inject
     * messages simulating that they had been received.
     */
    this.receive = _receive;

    _handleMessages = function(rcvdMessages) {
        _cometd._debug('Received', rcvdMessages);

        for (var i = 0; i < rcvdMessages.length; ++i) {
            var message = rcvdMessages[i];
            _receive(message);
        }
    };

    _handleFailure = function(conduit, messages, failure) {
        _cometd._debug('handleFailure', conduit, messages, failure);

        failure.transport = conduit;
        for (var i = 0; i < messages.length; ++i) {
            var message = messages[i];
            var failureMessage = {
                id: message.id,
                successful: false,
                channel: message.channel,
                failure: failure
            };
            failure.message = message;
            switch (message.channel) {
                case '/meta/handshake':
                    _handshakeFailure(failureMessage);
                    break;
                case '/meta/connect':
                    _connectFailure(failureMessage);
                    break;
                case '/meta/disconnect':
                    _disconnectFailure(failureMessage);
                    break;
                case '/meta/subscribe':
                    failureMessage.subscription = message.subscription;
                    _subscribeFailure(failureMessage);
                    break;
                case '/meta/unsubscribe':
                    failureMessage.subscription = message.subscription;
                    _unsubscribeFailure(failureMessage);
                    break;
                default:
                    _messageFailure(failureMessage);
                    break;
            }
        }
    };

    function _hasSubscriptions(channel) {
        var subscriptions = _listeners[channel];
        if (subscriptions) {
            for (var i = 0; i < subscriptions.length; ++i) {
                if (subscriptions[i]) {
                    return true;
                }
            }
        }
        return false;
    }

    function _resolveScopedCallback(scope, callback) {
        var delegate = {
            scope: scope,
            method: callback
        };
        if (_isFunction(scope)) {
            delegate.scope = undefined;
            delegate.method = scope;
        } else {
            if (_isString(callback)) {
                if (!scope) {
                    throw 'Invalid scope ' + scope;
                }
                delegate.method = scope[callback];
                if (!_isFunction(delegate.method)) {
                    throw 'Invalid callback ' + callback + ' for scope ' + scope;
                }
            } else if (!_isFunction(callback)) {
                throw 'Invalid callback ' + callback;
            }
        }
        return delegate;
    }

    function _addListener(channel, scope, callback, isListener) {
        // The data structure is a map<channel, subscription[]>, where each subscription
        // holds the callback to be called and its scope.

        var delegate = _resolveScopedCallback(scope, callback);
        _cometd._debug('Adding', isListener ? 'listener' : 'subscription', 'on', channel, 'with scope', delegate.scope, 'and callback', delegate.method);

        var subscription = {
            channel: channel,
            scope: delegate.scope,
            callback: delegate.method,
            listener: isListener
        };

        var subscriptions = _listeners[channel];
        if (!subscriptions) {
            subscriptions = [];
            _listeners[channel] = subscriptions;
        }

        // Pushing onto an array appends at the end and returns the id associated with the element increased by 1.
        // Note that if:
        // a.push('a'); var hb=a.push('b'); delete a[hb-1]; var hc=a.push('c');
        // then:
        // hc==3, a.join()=='a',,'c', a.length==3
        subscription.id = subscriptions.push(subscription) - 1;

        _cometd._debug('Added', isListener ? 'listener' : 'subscription', subscription);

        // For backward compatibility: we used to return [channel, subscription.id]
        subscription[0] = channel;
        subscription[1] = subscription.id;

        return subscription;
    }

    //
    // PUBLIC API
    //

    /**
     * Registers the given transport under the given transport type.
     * The optional index parameter specifies the "priority" at which the
     * transport is registered (where 0 is the max priority).
     * If a transport with the same type is already registered, this function
     * does nothing and returns false.
     * @param type the transport type
     * @param transport the transport object
     * @param index the index at which this transport is to be registered
     * @return true if the transport has been registered, false otherwise
     * @see #unregisterTransport(type)
     */
    this.registerTransport = function(type, transport, index) {
        var result = _transports.add(type, transport, index);
        if (result) {
            this._debug('Registered transport', type);

            if (_isFunction(transport.registered)) {
                transport.registered(type, this);
            }
        }
        return result;
    };

    /**
     * Unregisters the transport with the given transport type.
     * @param type the transport type to unregister
     * @return the transport that has been unregistered,
     * or null if no transport was previously registered under the given transport type
     */
    this.unregisterTransport = function(type) {
        var transport = _transports.remove(type);
        if (transport !== null) {
            this._debug('Unregistered transport', type);

            if (_isFunction(transport.unregistered)) {
                transport.unregistered();
            }
        }
        return transport;
    };

    this.unregisterTransports = function() {
        _transports.clear();
    };

    /**
     * @return an array of all registered transport types
     */
    this.getTransportTypes = function() {
        return _transports.getTransportTypes();
    };

    this.findTransport = function(name) {
        return _transports.find(name);
    };

    /**
     * @returns the TransportRegistry object
     */
    this.getTransportRegistry = function() {
        return _transports;
    };

    /**
     * Configures the initial Bayeux communication with the Bayeux server.
     * Configuration is passed via an object that must contain a mandatory field <code>url</code>
     * of type string containing the URL of the Bayeux server.
     * @param configuration the configuration object
     */
    this.configure = function(configuration) {
        _configure.call(this, configuration);
    };

    /**
     * Configures and establishes the Bayeux communication with the Bayeux server
     * via a handshake and a subsequent connect.
     * @param configuration the configuration object
     * @param handshakeProps an object to be merged with the handshake message
     * @see #configure(configuration)
     * @see #handshake(handshakeProps)
     */
    this.init = function(configuration, handshakeProps) {
        this.configure(configuration);
        this.handshake(handshakeProps);
    };

    /**
     * Establishes the Bayeux communication with the Bayeux server
     * via a handshake and a subsequent connect.
     * @param handshakeProps an object to be merged with the handshake message
     * @param handshakeCallback a function to be invoked when the handshake is acknowledged
     */
    this.handshake = function(handshakeProps, handshakeCallback) {
        _setStatus('disconnected');
        _reestablish = false;
        _handshake(handshakeProps, handshakeCallback);
    };

    /**
     * Disconnects from the Bayeux server.
     * It is possible to suggest to attempt a synchronous disconnect, but this feature
     * may only be available in certain transports (for example, long-polling may support
     * it, callback-polling certainly does not).
     * @param sync whether attempt to perform a synchronous disconnect
     * @param disconnectProps an object to be merged with the disconnect message
     * @param disconnectCallback a function to be invoked when the disconnect is acknowledged
     */
    this.disconnect = function(sync, disconnectProps, disconnectCallback) {
        if (_isDisconnected()) {
            return;
        }

        if (typeof sync !== 'boolean') {
            disconnectCallback = disconnectProps;
            disconnectProps = sync;
            sync = false;
        }
        if (_isFunction(disconnectProps)) {
            disconnectCallback = disconnectProps;
            disconnectProps = undefined;
        }

        var bayeuxMessage = {
            id: _nextMessageId(),
            channel: '/meta/disconnect'
        };
        // Do not allow the user to override important fields.
        var message = this._mixin(false, {}, disconnectProps, bayeuxMessage);

        // Save the callback.
        _cometd._putCallback(message.id, disconnectCallback);

        _setStatus('disconnecting');
        _send(sync === true, [message], false, 'disconnect');
    };

    /**
     * Marks the start of a batch of application messages to be sent to the server
     * in a single request, obtaining a single response containing (possibly) many
     * application reply messages.
     * Messages are held in a queue and not sent until {@link #endBatch()} is called.
     * If startBatch() is called multiple times, then an equal number of endBatch()
     * calls must be made to close and send the batch of messages.
     * @see #endBatch()
     */
    this.startBatch = function() {
        _startBatch();
    };

    /**
     * Marks the end of a batch of application messages to be sent to the server
     * in a single request.
     * @see #startBatch()
     */
    this.endBatch = function() {
        _endBatch();
    };

    /**
     * Executes the given callback in the given scope, surrounded by a {@link #startBatch()}
     * and {@link #endBatch()} calls.
     * @param scope the scope of the callback, may be omitted
     * @param callback the callback to be executed within {@link #startBatch()} and {@link #endBatch()} calls
     */
    this.batch = function(scope, callback) {
        var delegate = _resolveScopedCallback(scope, callback);
        this.startBatch();
        try {
            delegate.method.call(delegate.scope);
            this.endBatch();
        } catch (x) {
            this._info('Exception during execution of batch', x);
            this.endBatch();
            throw x;
        }
    };

    /**
     * Adds a listener for bayeux messages, performing the given callback in the given scope
     * when a message for the given channel arrives.
     * @param channel the channel the listener is interested to
     * @param scope the scope of the callback, may be omitted
     * @param callback the callback to call when a message is sent to the channel
     * @returns the subscription handle to be passed to {@link #removeListener(object)}
     * @see #removeListener(subscription)
     */
    this.addListener = function(channel, scope, callback) {
        if (arguments.length < 2) {
            throw 'Illegal arguments number: required 2, got ' + arguments.length;
        }
        if (!_isString(channel)) {
            throw 'Illegal argument type: channel must be a string';
        }

        return _addListener(channel, scope, callback, true);
    };

    /**
     * Removes the subscription obtained with a call to {@link #addListener(string, object, function)}.
     * @param subscription the subscription to unsubscribe.
     * @see #addListener(channel, scope, callback)
     */
    this.removeListener = function(subscription) {
        // Beware of subscription.id == 0, which is falsy => cannot use !subscription.id
        if (!subscription || !subscription.channel || !("id" in subscription)) {
            throw 'Invalid argument: expected subscription, not ' + subscription;
        }

        _removeListener(subscription);
    };

    /**
     * Removes all listeners registered with {@link #addListener(channel, scope, callback)} or
     * {@link #subscribe(channel, scope, callback)}.
     */
    this.clearListeners = function() {
        _listeners = {};
    };

    /**
     * Subscribes to the given channel, performing the given callback in the given scope
     * when a message for the channel arrives.
     * @param channel the channel to subscribe to
     * @param scope the scope of the callback, may be omitted
     * @param callback the callback to call when a message is sent to the channel
     * @param subscribeProps an object to be merged with the subscribe message
     * @param subscribeCallback a function to be invoked when the subscription is acknowledged
     * @return the subscription handle to be passed to {@link #unsubscribe(object)}
     */
    this.subscribe = function(channel, scope, callback, subscribeProps, subscribeCallback) {
        if (arguments.length < 2) {
            throw 'Illegal arguments number: required 2, got ' + arguments.length;
        }
        if (!_isString(channel)) {
            throw 'Illegal argument type: channel must be a string';
        }
        if (_isDisconnected()) {
            throw 'Illegal state: already disconnected';
        }

        // Normalize arguments
        if (_isFunction(scope)) {
            subscribeCallback = subscribeProps;
            subscribeProps = callback;
            callback = scope;
            scope = undefined;
        }
        if (_isFunction(subscribeProps)) {
            subscribeCallback = subscribeProps;
            subscribeProps = undefined;
        }

        // Only send the message to the server if this client has not yet subscribed to the channel
        var send = !_hasSubscriptions(channel);

        var subscription = _addListener(channel, scope, callback, false);

        if (send) {
            // Send the subscription message after the subscription registration to avoid
            // races where the server would send a message to the subscribers, but here
            // on the client the subscription has not been added yet to the data structures
            var bayeuxMessage = {
                id: _nextMessageId(),
                channel: '/meta/subscribe',
                subscription: channel
            };
            // Do not allow the user to override important fields.
            var message = this._mixin(false, {}, subscribeProps, bayeuxMessage);

            // Save the callback.
            _cometd._putCallback(message.id, subscribeCallback);

            _queueSend(message);
        }

        return subscription;
    };

    /**
     * Unsubscribes the subscription obtained with a call to {@link #subscribe(string, object, function)}.
     * @param subscription the subscription to unsubscribe.
     * @param unsubscribeProps an object to be merged with the unsubscribe message
     * @param unsubscribeCallback a function to be invoked when the unsubscription is acknowledged
     */
    this.unsubscribe = function(subscription, unsubscribeProps, unsubscribeCallback) {
        if (arguments.length < 1) {
            throw 'Illegal arguments number: required 1, got ' + arguments.length;
        }
        if (_isDisconnected()) {
            throw 'Illegal state: already disconnected';
        }

        if (_isFunction(unsubscribeProps)) {
            unsubscribeCallback = unsubscribeProps;
            unsubscribeProps = undefined;
        }

        // Remove the local listener before sending the message
        // This ensures that if the server fails, this client does not get notifications
        this.removeListener(subscription);

        var channel = subscription.channel;
        // Only send the message to the server if this client unsubscribes the last subscription
        if (!_hasSubscriptions(channel)) {
            var bayeuxMessage = {
                id: _nextMessageId(),
                channel: '/meta/unsubscribe',
                subscription: channel
            };
            // Do not allow the user to override important fields.
            var message = this._mixin(false, {}, unsubscribeProps, bayeuxMessage);

            // Save the callback.
            _cometd._putCallback(message.id, unsubscribeCallback);

            _queueSend(message);
        }
    };

    this.resubscribe = function(subscription, subscribeProps) {
        _removeSubscription(subscription);
        if (subscription) {
            return this.subscribe(subscription.channel, subscription.scope, subscription.callback, subscribeProps);
        }
        return undefined;
    };

    /**
     * Removes all subscriptions added via {@link #subscribe(channel, scope, callback, subscribeProps)},
     * but does not remove the listeners added via {@link addListener(channel, scope, callback)}.
     */
    this.clearSubscriptions = function() {
        _clearSubscriptions();
    };

    /**
     * Publishes a message on the given channel, containing the given content.
     * @param channel the channel to publish the message to
     * @param content the content of the message
     * @param publishProps an object to be merged with the publish message
     * @param publishCallback a function to be invoked when the publish is acknowledged by the server
     */
    this.publish = function(channel, content, publishProps, publishCallback) {
        if (arguments.length < 1) {
            throw 'Illegal arguments number: required 1, got ' + arguments.length;
        }
        if (!_isString(channel)) {
            throw 'Illegal argument type: channel must be a string';
        }
        if (/^\/meta\//.test(channel)) {
            throw 'Illegal argument: cannot publish to meta channels';
        }
        if (_isDisconnected()) {
            throw 'Illegal state: already disconnected';
        }

        if (_isFunction(content)) {
            publishCallback = content;
            content = publishProps = {};
        } else if (_isFunction(publishProps)) {
            publishCallback = publishProps;
            publishProps = {};
        }

        var bayeuxMessage = {
            id: _nextMessageId(),
            channel: channel,
            data: content
        };
        // Do not allow the user to override important fields.
        var message = this._mixin(false, {}, publishProps, bayeuxMessage);

        // Save the callback.
        _cometd._putCallback(message.id, publishCallback);

        _queueSend(message);
    };

    this.remoteCall = function(target, content, timeout, callback) {
        if (arguments.length < 1) {
            throw 'Illegal arguments number: required 1, got ' + arguments.length;
        }
        if (!_isString(target)) {
            throw 'Illegal argument type: target must be a string';
        }
        if (_isDisconnected()) {
            throw 'Illegal state: already disconnected';
        }

        if (_isFunction(content)) {
            callback = content;
            content = {};
            timeout = _config.maxNetworkDelay;
        } else if (_isFunction(timeout)) {
            callback = timeout;
            timeout = _config.maxNetworkDelay;
        }

        if (typeof timeout !== 'number') {
            throw 'Illegal argument type: timeout must be a number';
        }

        if (!target.match(/^\//)) {
            target = '/' + target;
        }
        var channel = '/service' + target;

        var bayeuxMessage = {
            id: _nextMessageId(),
            channel: channel,
            data: content
        };

        var context = {
            callback: callback
        };
        if (timeout > 0) {
            context.timeout = Utils.setTimeout(_cometd, function() {
                _cometd._debug('Timing out remote call', bayeuxMessage, 'after', timeout, 'ms');
                _failMessage({
                    id: bayeuxMessage.id,
                    error: '406::timeout',
                    successful: false,
                    failure: {
                        message : bayeuxMessage,
                        reason: 'Remote Call Timeout'
                    }
                });
            }, timeout);
            _cometd._debug('Scheduled remote call timeout', bayeuxMessage, 'in', timeout, 'ms');
        }
        _remoteCalls[bayeuxMessage.id] = context;

        _queueSend(bayeuxMessage);
    };

    /**
     * Returns a string representing the status of the bayeux communication with the Bayeux server.
     */
    this.getStatus = function() {
        return _status;
    };

    /**
     * Returns whether this instance has been disconnected.
     */
    this.isDisconnected = _isDisconnected;

    /**
     * Sets the backoff period used to increase the backoff time when retrying an unsuccessful or failed message.
     * Default value is 1 second, which means if there is a persistent failure the retries will happen
     * after 1 second, then after 2 seconds, then after 3 seconds, etc. So for example with 15 seconds of
     * elapsed time, there will be 5 retries (at 1, 3, 6, 10 and 15 seconds elapsed).
     * @param period the backoff period to set
     * @see #getBackoffIncrement()
     */
    this.setBackoffIncrement = function(period) {
        _config.backoffIncrement = period;
    };

    /**
     * Returns the backoff period used to increase the backoff time when retrying an unsuccessful or failed message.
     * @see #setBackoffIncrement(period)
     */
    this.getBackoffIncrement = function() {
        return _config.backoffIncrement;
    };

    /**
     * Returns the backoff period to wait before retrying an unsuccessful or failed message.
     */
    this.getBackoffPeriod = function() {
        return _backoff;
    };

    /**
     * Increases the backoff period up to the maximum value configured.
     * @returns the backoff period after increment
     * @see getBackoffIncrement
     */
    this.increaseBackoffPeriod = function() {
        return _increaseBackoff();
    };

    /**
     * Resets the backoff period to zero.
     */
    this.resetBackoffPeriod = function() {
        _resetBackoff();
    };

    /**
     * Sets the log level for console logging.
     * Valid values are the strings 'error', 'warn', 'info' and 'debug', from
     * less verbose to more verbose.
     * @param level the log level string
     */
    this.setLogLevel = function(level) {
        _config.logLevel = level;
    };

    /**
     * Registers an extension whose callbacks are called for every incoming message
     * (that comes from the server to this client implementation) and for every
     * outgoing message (that originates from this client implementation for the
     * server).
     * The format of the extension object is the following:
     * <pre>
     * {
     *     incoming: function(message) { ... },
     *     outgoing: function(message) { ... }
     * }
     * </pre>
     * Both properties are optional, but if they are present they will be called
     * respectively for each incoming message and for each outgoing message.
     * @param name the name of the extension
     * @param extension the extension to register
     * @return true if the extension was registered, false otherwise
     * @see #unregisterExtension(name)
     */
    this.registerExtension = function(name, extension) {
        if (arguments.length < 2) {
            throw 'Illegal arguments number: required 2, got ' + arguments.length;
        }
        if (!_isString(name)) {
            throw 'Illegal argument type: extension name must be a string';
        }

        var existing = false;
        for (var i = 0; i < _extensions.length; ++i) {
            var existingExtension = _extensions[i];
            if (existingExtension.name === name) {
                existing = true;
                break;
            }
        }
        if (!existing) {
            _extensions.push({
                name: name,
                extension: extension
            });
            this._debug('Registered extension', name);

            // Callback for extensions
            if (_isFunction(extension.registered)) {
                extension.registered(name, this);
            }

            return true;
        } else {
            this._info('Could not register extension with name', name, 'since another extension with the same name already exists');
            return false;
        }
    };

    /**
     * Unregister an extension previously registered with
     * {@link #registerExtension(name, extension)}.
     * @param name the name of the extension to unregister.
     * @return true if the extension was unregistered, false otherwise
     */
    this.unregisterExtension = function(name) {
        if (!_isString(name)) {
            throw 'Illegal argument type: extension name must be a string';
        }

        var unregistered = false;
        for (var i = 0; i < _extensions.length; ++i) {
            var extension = _extensions[i];
            if (extension.name === name) {
                _extensions.splice(i, 1);
                unregistered = true;
                this._debug('Unregistered extension', name);

                // Callback for extensions
                var ext = extension.extension;
                if (_isFunction(ext.unregistered)) {
                    ext.unregistered();
                }

                break;
            }
        }
        return unregistered;
    };

    /**
     * Find the extension registered with the given name.
     * @param name the name of the extension to find
     * @return the extension found or null if no extension with the given name has been registered
     */
    this.getExtension = function(name) {
        for (var i = 0; i < _extensions.length; ++i) {
            var extension = _extensions[i];
            if (extension.name === name) {
                return extension.extension;
            }
        }
        return null;
    };

    /**
     * Returns the name assigned to this CometD object, or the string 'default'
     * if no name has been explicitly passed as parameter to the constructor.
     */
    this.getName = function() {
        return _name;
    };

    /**
     * Returns the clientId assigned by the Bayeux server during handshake.
     */
    this.getClientId = function() {
        return _clientId;
    };

    /**
     * Returns the URL of the Bayeux server.
     */
    this.getURL = function() {
        if (_transport) {
            var url = _transport.getURL();
            if (url) {
                return url;
            }
            url = _config.urls[_transport.getType()];
            if (url) {
                return url;
            }
        }
        return _config.url;
    };

    this.getTransport = function() {
        return _transport;
    };

    this.getConfiguration = function() {
        return this._mixin(true, {}, _config);
    };

    this.getAdvice = function() {
        return this._mixin(true, {}, _advice);
    };
};

},{"./TransportRegistry":7,"./Utils":8}],4:[function(require,module,exports){
var Transport = require('./Transport');
var RequestTransport = require('./RequestTransport');

module.exports = function LongPollingTransport() {
    var _super = new RequestTransport();
    var _self = Transport.derive(_super);
    // By default, support cross domain
    var _supportsCrossDomain = true;

    _self.accept = function(version, crossDomain, url) {
        return _supportsCrossDomain || !crossDomain;
    };

    _self.xhrSend = function(packet) {
        throw 'Abstract';
    };

    _self.transportSend = function(envelope, request) {
        this._debug('Transport', this.getType(), 'sending request', request.id, 'envelope', envelope);

        var self = this;
        try {
            var sameStack = true;
            request.xhr = this.xhrSend({
                transport: this,
                url: envelope.url,
                sync: envelope.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(envelope.messages),
                onSuccess: function(response) {
                    self._debug('Transport', self.getType(), 'received response', response);
                    var success = false;
                    try {
                        var received = self.convertToMessages(response);
                        if (received.length === 0) {
                            _supportsCrossDomain = false;
                            self.transportFailure(envelope, request, {
                                httpCode: 204
                            });
                        } else {
                            success = true;
                            self.transportSuccess(envelope, request, received);
                        }
                    } catch (x) {
                        self._debug(x);
                        if (!success) {
                            _supportsCrossDomain = false;
                            var failure = {
                                exception: x
                            };
                            failure.httpCode = self.xhrStatus(request.xhr);
                            self.transportFailure(envelope, request, failure);
                        }
                    }
                },
                onError: function(reason, exception) {
                    self._debug('Transport', self.getType(), 'received error', reason, exception);
                    _supportsCrossDomain = false;
                    var failure = {
                        reason: reason,
                        exception: exception
                    };
                    failure.httpCode = self.xhrStatus(request.xhr);
                    if (sameStack) {
                        // Keep the semantic of calling response callbacks asynchronously after the request
                        self.setTimeout(function() {
                            self.transportFailure(envelope, request, failure);
                        }, 0);
                    } else {
                        self.transportFailure(envelope, request, failure);
                    }
                }
            });
            sameStack = false;
        } catch (x) {
            _supportsCrossDomain = false;
            // Keep the semantic of calling response callbacks asynchronously after the request
            this.setTimeout(function() {
                self.transportFailure(envelope, request, {
                    exception: x
                });
            }, 0);
        }
    };

    _self.reset = function(init) {
        _super.reset(init);
        _supportsCrossDomain = true;
    };

    return _self;
};

},{"./RequestTransport":5,"./Transport":6}],5:[function(require,module,exports){
var Transport = require('./Transport')
var Utils = require('./Utils')

/**
 * Base object with the common functionality for transports based on requests.
 * The key responsibility is to allow at most 2 outstanding requests to the server,
 * to avoid that requests are sent behind a long poll.
 * To achieve this, we have one reserved request for the long poll, and all other
 * requests are serialized one after the other.
 */
module.exports = function RequestTransport() {
    var _super = new Transport();
    var _self = Transport.derive(_super);
    var _requestIds = 0;
    var _metaConnectRequest = null;
    var _requests = [];
    var _envelopes = [];

    function _coalesceEnvelopes(envelope) {
        while (_envelopes.length > 0) {
            var envelopeAndRequest = _envelopes[0];
            var newEnvelope = envelopeAndRequest[0];
            var newRequest = envelopeAndRequest[1];
            if (newEnvelope.url === envelope.url &&
                newEnvelope.sync === envelope.sync) {
                _envelopes.shift();
                envelope.messages = envelope.messages.concat(newEnvelope.messages);
                this._debug('Coalesced', newEnvelope.messages.length, 'messages from request', newRequest.id);
                continue;
            }
            break;
        }
    }

    function _transportSend(envelope, request) {
        this.transportSend(envelope, request);
        request.expired = false;

        if (!envelope.sync) {
            var maxDelay = this.getConfiguration().maxNetworkDelay;
            var delay = maxDelay;
            if (request.metaConnect === true) {
                delay += this.getAdvice().timeout;
            }

            this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for the response, maxNetworkDelay', maxDelay);

            var self = this;
            request.timeout = this.setTimeout(function() {
                request.expired = true;
                var errorMessage = 'Request ' + request.id + ' of transport ' + self.getType() + ' exceeded ' + delay + ' ms max network delay';
                var failure = {
                    reason: errorMessage
                };
                var xhr = request.xhr;
                failure.httpCode = self.xhrStatus(xhr);
                self.abortXHR(xhr);
                self._debug(errorMessage);
                self.complete(request, false, request.metaConnect);
                envelope.onFailure(xhr, envelope.messages, failure);
            }, delay);
        }
    }

    function _queueSend(envelope) {
        var requestId = ++_requestIds;
        var request = {
            id: requestId,
            metaConnect: false,
            envelope: envelope
        };

        // Consider the metaConnect requests which should always be present
        if (_requests.length < this.getConfiguration().maxConnections - 1) {
            _requests.push(request);
            _transportSend.call(this, envelope, request);
        } else {
            this._debug('Transport', this.getType(), 'queueing request', requestId, 'envelope', envelope);
            _envelopes.push([envelope, request]);
        }
    }

    function _metaConnectComplete(request) {
        var requestId = request.id;
        this._debug('Transport', this.getType(), 'metaConnect complete, request', requestId);
        if (_metaConnectRequest !== null && _metaConnectRequest.id !== requestId) {
            throw 'Longpoll request mismatch, completing request ' + requestId;
        }

        // Reset metaConnect request
        _metaConnectRequest = null;
    }

    function _complete(request, success) {
        var index = Utils.inArray(request, _requests);
        // The index can be negative if the request has been aborted
        if (index >= 0) {
            _requests.splice(index, 1);
        }

        if (_envelopes.length > 0) {
            var envelopeAndRequest = _envelopes.shift();
            var nextEnvelope = envelopeAndRequest[0];
            var nextRequest = envelopeAndRequest[1];
            this._debug('Transport dequeued request', nextRequest.id);
            if (success) {
                if (this.getConfiguration().autoBatch) {
                    _coalesceEnvelopes.call(this, nextEnvelope);
                }
                _queueSend.call(this, nextEnvelope);
                this._debug('Transport completed request', request.id, nextEnvelope);
            } else {
                // Keep the semantic of calling response callbacks asynchronously after the request
                var self = this;
                this.setTimeout(function() {
                    self.complete(nextRequest, false, nextRequest.metaConnect);
                    var failure = {
                        reason: 'Previous request failed'
                    };
                    var xhr = nextRequest.xhr;
                    failure.httpCode = self.xhrStatus(xhr);
                    nextEnvelope.onFailure(xhr, nextEnvelope.messages, failure);
                }, 0);
            }
        }
    }

    _self.complete = function(request, success, metaConnect) {
        if (metaConnect) {
            _metaConnectComplete.call(this, request);
        } else {
            _complete.call(this, request, success);
        }
    };

    /**
     * Performs the actual send depending on the transport type details.
     * @param envelope the envelope to send
     * @param request the request information
     */
    _self.transportSend = function(envelope, request) {
        throw 'Abstract';
    };

    _self.transportSuccess = function(envelope, request, responses) {
        if (!request.expired) {
            this.clearTimeout(request.timeout);
            this.complete(request, true, request.metaConnect);
            if (responses && responses.length > 0) {
                envelope.onSuccess(responses);
            } else {
                envelope.onFailure(request.xhr, envelope.messages, {
                    httpCode: 204
                });
            }
        }
    };

    _self.transportFailure = function(envelope, request, failure) {
        if (!request.expired) {
            this.clearTimeout(request.timeout);
            this.complete(request, false, request.metaConnect);
            envelope.onFailure(request.xhr, envelope.messages, failure);
        }
    };

    function _metaConnectSend(envelope) {
        if (_metaConnectRequest !== null) {
            throw 'Concurrent metaConnect requests not allowed, request id=' + _metaConnectRequest.id + ' not yet completed';
        }

        var requestId = ++_requestIds;
        this._debug('Transport', this.getType(), 'metaConnect send, request', requestId, 'envelope', envelope);
        var request = {
            id: requestId,
            metaConnect: true,
            envelope: envelope
        };
        _transportSend.call(this, envelope, request);
        _metaConnectRequest = request;
    }

    _self.send = function(envelope, metaConnect) {
        if (metaConnect) {
            _metaConnectSend.call(this, envelope);
        } else {
            _queueSend.call(this, envelope);
        }
    };

    _self.abort = function() {
        _super.abort();
        for (var i = 0; i < _requests.length; ++i) {
            var request = _requests[i];
            if (request) {
                this._debug('Aborting request', request);
                if (!this.abortXHR(request.xhr)) {
                    this.transportFailure(request.envelope, request, {reason: 'abort'});
                }
            }
        }
        if (_metaConnectRequest) {
            this._debug('Aborting metaConnect request', _metaConnectRequest);
            if (!this.abortXHR(_metaConnectRequest.xhr)) {
                this.transportFailure(_metaConnectRequest.envelope, _metaConnectRequest, {reason: 'abort'});
            }
        }
        this.reset(true);
    };

    _self.reset = function(init) {
        _super.reset(init);
        _metaConnectRequest = null;
        _requests = [];
        _envelopes = [];
    };

    _self.abortXHR = function(xhr) {
        if (xhr) {
            try {
                var state = xhr.readyState;
                xhr.abort();
                return state !== XMLHttpRequest.UNSENT;
            } catch (x) {
                this._debug(x);
            }
        }
        return false;
    };

    _self.xhrStatus = function(xhr) {
        if (xhr) {
            try {
                return xhr.status;
            } catch (x) {
                this._debug(x);
            }
        }
        return -1;
    };

    return _self;
};

},{"./Transport":6,"./Utils":8}],6:[function(require,module,exports){
var Utils = require('./Utils')

/**
 * Base object with the common functionality for transports.
 */
module.exports = function Transport() {
    var _type;
    var _cometd;
    var _url;

    /**
     * Function invoked just after a transport has been successfully registered.
     * @param type the type of transport (for example 'long-polling')
     * @param cometd the cometd object this transport has been registered to
     * @see #unregistered()
     */
    this.registered = function(type, cometd) {
        _type = type;
        _cometd = cometd;
    };

    /**
     * Function invoked just after a transport has been successfully unregistered.
     * @see #registered(type, cometd)
     */
    this.unregistered = function() {
        _type = null;
        _cometd = null;
    };

    this._debug = function() {
        _cometd._debug.apply(_cometd, arguments);
    };

    this._mixin = function() {
        return _cometd._mixin.apply(_cometd, arguments);
    };

    this.getConfiguration = function() {
        return _cometd.getConfiguration();
    };

    this.getAdvice = function() {
        return _cometd.getAdvice();
    };

    this.setTimeout = function(funktion, delay) {
        return Utils.setTimeout(_cometd, funktion, delay);
    };

    this.clearTimeout = function(handle) {
        Utils.clearTimeout(handle);
    };

    /**
     * Converts the given response into an array of bayeux messages
     * @param response the response to convert
     * @return an array of bayeux messages obtained by converting the response
     */
    this.convertToMessages = function(response) {
        if (Utils.isString(response)) {
            try {
                return JSON.parse(response);
            } catch (x) {
                this._debug('Could not convert to JSON the following string', '"' + response + '"');
                throw x;
            }
        }
        if (Utils.isArray(response)) {
            return response;
        }
        if (response === undefined || response === null) {
            return [];
        }
        if (response instanceof Object) {
            return [response];
        }
        throw 'Conversion Error ' + response + ', typeof ' + (typeof response);
    };

    /**
     * Returns whether this transport can work for the given version and cross domain communication case.
     * @param version a string indicating the transport version
     * @param crossDomain a boolean indicating whether the communication is cross domain
     * @param url the URL to connect to
     * @return true if this transport can work for the given version and cross domain communication case,
     * false otherwise
     */
    this.accept = function(version, crossDomain, url) {
        throw 'Abstract';
    };

    /**
     * Returns the type of this transport.
     * @see #registered(type, cometd)
     */
    this.getType = function() {
        return _type;
    };

    this.getURL = function() {
        return _url;
    };

    this.setURL = function(url) {
        _url = url;
    };

    this.send = function(envelope, metaConnect) {
        throw 'Abstract';
    };

    this.reset = function(init) {
        this._debug('Transport', _type, 'reset', init ? 'initial' : 'retry');
    };

    this.abort = function() {
        this._debug('Transport', _type, 'aborted');
    };

    this.toString = function() {
        return this.getType();
    };
};

module.exports.derive = function(baseObject) {
    function F() {
    }

    F.prototype = baseObject;
    return new F();
};

},{"./Utils":8}],7:[function(require,module,exports){
/**
 * A registry for transports used by the CometD object.
 */
module.exports = function TransportRegistry() {
    var _types = [];
    var _transports = {};

    this.getTransportTypes = function() {
        return _types.slice(0);
    };

    this.findTransportTypes = function(version, crossDomain, url) {
        var result = [];
        for (var i = 0; i < _types.length; ++i) {
            var type = _types[i];
            if (_transports[type].accept(version, crossDomain, url) === true) {
                result.push(type);
            }
        }
        return result;
    };

    this.negotiateTransport = function(types, version, crossDomain, url) {
        for (var i = 0; i < _types.length; ++i) {
            var type = _types[i];
            for (var j = 0; j < types.length; ++j) {
                if (type === types[j]) {
                    var transport = _transports[type];
                    if (transport.accept(version, crossDomain, url) === true) {
                        return transport;
                    }
                }
            }
        }
        return null;
    };

    this.add = function(type, transport, index) {
        var existing = false;
        for (var i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                existing = true;
                break;
            }
        }

        if (!existing) {
            if (typeof index !== 'number') {
                _types.push(type);
            } else {
                _types.splice(index, 0, type);
            }
            _transports[type] = transport;
        }

        return !existing;
    };

    this.find = function(type) {
        for (var i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                return _transports[type];
            }
        }
        return null;
    };

    this.remove = function(type) {
        for (var i = 0; i < _types.length; ++i) {
            if (_types[i] === type) {
                _types.splice(i, 1);
                var transport = _transports[type];
                delete _transports[type];
                return transport;
            }
        }
        return null;
    };

    this.clear = function() {
        _types = [];
        _transports = {};
    };

    this.reset = function(init) {
        for (var i = 0; i < _types.length; ++i) {
            _transports[_types[i]].reset(init);
        }
    };
};

},{}],8:[function(require,module,exports){
exports.isString = function (value) {
    if (value === undefined || value === null) {
        return false;
    }
    return typeof value === 'string' || value instanceof String;
};

exports.isArray = function (value) {
    if (value === undefined || value === null) {
        return false;
    }
    return value instanceof Array;
};

/**
 * Returns whether the given element is contained into the given array.
 * @param element the element to check presence for
 * @param array the array to check for the element presence
 * @return the index of the element, if present, or a negative index if the element is not present
 */
exports.inArray = function (element, array) {
    for (var i = 0; i < array.length; ++i) {
        if (element === array[i]) {
            return i;
        }
    }
    return -1;
};

exports.setTimeout = function (cometd, funktion, delay) {
    return setTimeout(function() {
        try {
            cometd._debug('Invoking timed function', funktion);
            funktion();
        } catch (x) {
            cometd._debug('Exception invoking timed function', funktion, x);
        }
    }, delay);
};

exports.clearTimeout = function (timeoutHandle) {
    clearTimeout(timeoutHandle);
};

},{}],9:[function(require,module,exports){
var Transport = require('./Transport')
var Utils = require('./Utils')

module.exports = function WebSocketTransport() {
    var _super = new Transport();
    var _self = Transport.derive(_super);
    var _cometd;
    // By default WebSocket is supported
    var _webSocketSupported = true;
    // Whether we were able to establish a WebSocket connection
    var _webSocketConnected = false;
    var _stickyReconnect = true;
    // The context contains the envelopes that have been sent
    // and the timeouts for the messages that have been sent.
    var _context = null;
    var _connecting = null;
    var _connected = false;
    var _successCallback = null;

    _self.reset = function(init) {
        _super.reset(init);
        _webSocketSupported = true;
        if (init) {
            _webSocketConnected = false;
        }
        _stickyReconnect = true;
        _context = null;
        _connecting = null;
        _connected = false;
    };

    function _forceClose(context, event) {
        if (context) {
            this.webSocketClose(context, event.code, event.reason);
            // Force immediate failure of pending messages to trigger reconnect.
            // This is needed because the server may not reply to our close()
            // and therefore the onclose function is never called.
            this.onClose(context, event);
        }
    }

    function _sameContext(context) {
        return context === _connecting || context === _context;
    }

    function _storeEnvelope(context, envelope, metaConnect) {
        var messageIds = [];
        for (var i = 0; i < envelope.messages.length; ++i) {
            var message = envelope.messages[i];
            if (message.id) {
                messageIds.push(message.id);
            }
        }
        context.envelopes[messageIds.join(',')] = [envelope, metaConnect];
        this._debug('Transport', this.getType(), 'stored envelope, envelopes', context.envelopes);
    }

    function _websocketConnect(context) {
        // We may have multiple attempts to open a WebSocket
        // connection, for example a /meta/connect request that
        // may take time, along with a user-triggered publish.
        // Early return if we are already connecting.
        if (_connecting) {
            return;
        }

        // Mangle the URL, changing the scheme from 'http' to 'ws'.
        var url = _cometd.getURL().replace(/^http/, 'ws');
        this._debug('Transport', this.getType(), 'connecting to URL', url);

        try {
            var protocol = _cometd.getConfiguration().protocol;
            context.webSocket = protocol ? new WebSocket(url, protocol) : new WebSocket(url);
            _connecting = context;
        } catch (x) {
            _webSocketSupported = false;
            this._debug('Exception while creating WebSocket object', x);
            throw x;
        }

        // By default use sticky reconnects.
        _stickyReconnect = _cometd.getConfiguration().stickyReconnect !== false;

        var self = this;
        var connectTimeout = _cometd.getConfiguration().connectTimeout;
        if (connectTimeout > 0) {
            context.connectTimer = this.setTimeout(function() {
                _cometd._debug('Transport', self.getType(), 'timed out while connecting to URL', url, ':', connectTimeout, 'ms');
                // The connection was not opened, close anyway.
                _forceClose.call(self, context, {code: 1000, reason: 'Connect Timeout'});
            }, connectTimeout);
        }

        var onopen = function() {
            _cometd._debug('WebSocket onopen', context);
            if (context.connectTimer) {
                self.clearTimeout(context.connectTimer);
            }

            if (_sameContext(context)) {
                _connecting = null;
                _context = context;
                _webSocketConnected = true;
                self.onOpen(context);
            } else {
                // We have a valid connection already, close this one.
                _cometd._warn('Closing extra WebSocket connection', this, 'active connection', _context);
                _forceClose.call(self, context, {code: 1000, reason: 'Extra Connection'});
            }
        };

        // This callback is invoked when the server sends the close frame.
        // The close frame for a connection may arrive *after* another
        // connection has been opened, so we must make sure that actions
        // are performed only if it's the same connection.
        var onclose = function(event) {
            event = event || {code: 1000};
            _cometd._debug('WebSocket onclose', context, event, 'connecting', _connecting, 'current', _context);

            if (context.connectTimer) {
                self.clearTimeout(context.connectTimer);
            }

            self.onClose(context, event);
        };

        var onmessage = function(wsMessage) {
            _cometd._debug('WebSocket onmessage', wsMessage, context);
            self.onMessage(context, wsMessage);
        };

        context.webSocket.onopen = onopen;
        context.webSocket.onclose = onclose;
        context.webSocket.onerror = function() {
            // Clients should call onclose(), but if they do not we do it here for safety.
            onclose({code: 1000, reason: 'Error'});
        };
        context.webSocket.onmessage = onmessage;

        this._debug('Transport', this.getType(), 'configured callbacks on', context);
    }

    function _webSocketSend(context, envelope, metaConnect) {
        var json = JSON.stringify(envelope.messages);
        context.webSocket.send(json);
        this._debug('Transport', this.getType(), 'sent', envelope, 'metaConnect =', metaConnect);

        // Manage the timeout waiting for the response.
        var maxDelay = this.getConfiguration().maxNetworkDelay;
        var delay = maxDelay;
        if (metaConnect) {
            delay += this.getAdvice().timeout;
            _connected = true;
        }

        var self = this;
        var messageIds = [];
        for (var i = 0; i < envelope.messages.length; ++i) {
            (function() {
                var message = envelope.messages[i];
                if (message.id) {
                    messageIds.push(message.id);
                    context.timeouts[message.id] = this.setTimeout(function() {
                        _cometd._debug('Transport', self.getType(), 'timing out message', message.id, 'after', delay, 'on', context);
                        _forceClose.call(self, context, {code: 1000, reason: 'Message Timeout'});
                    }, delay);
                }
            })();
        }

        this._debug('Transport', this.getType(), 'waiting at most', delay, 'ms for messages', messageIds, 'maxNetworkDelay', maxDelay, ', timeouts:', context.timeouts);
    }

    _self._notifySuccess = function(fn, messages) {
        fn.call(this, messages);
    };

    _self._notifyFailure = function(fn, context, messages, failure) {
        fn.call(this, context, messages, failure);
    };

    function _send(context, envelope, metaConnect) {
        try {
            if (context === null) {
                context = _connecting || {
                        envelopes: {},
                        timeouts: {}
                    };
                _storeEnvelope.call(this, context, envelope, metaConnect);
                _websocketConnect.call(this, context);
            } else {
                _storeEnvelope.call(this, context, envelope, metaConnect);
                _webSocketSend.call(this, context, envelope, metaConnect);
            }
        } catch (x) {
            // Keep the semantic of calling response callbacks asynchronously after the request.
            var self = this;
            this.setTimeout(function() {
                _forceClose.call(self, context, {
                    code: 1000,
                    reason: 'Exception',
                    exception: x
                });
            }, 0);
        }
    }

    _self.onOpen = function(context) {
        var envelopes = context.envelopes;
        this._debug('Transport', this.getType(), 'opened', context, 'pending messages', envelopes);
        for (var key in envelopes) {
            if (envelopes.hasOwnProperty(key)) {
                var element = envelopes[key];
                var envelope = element[0];
                var metaConnect = element[1];
                // Store the success callback, which is independent from the envelope,
                // so that it can be used to notify arrival of messages.
                _successCallback = envelope.onSuccess;
                _webSocketSend.call(this, context, envelope, metaConnect);
            }
        }
    };

    _self.onMessage = function(context, wsMessage) {
        this._debug('Transport', this.getType(), 'received websocket message', wsMessage, context);

        var close = false;
        var messages = this.convertToMessages(wsMessage.data);
        var messageIds = [];
        for (var i = 0; i < messages.length; ++i) {
            var message = messages[i];

            // Detect if the message is a response to a request we made.
            // If it's a meta message, for sure it's a response; otherwise it's
            // a publish message and publish responses don't have the data field.
            if (/^\/meta\//.test(message.channel) || message.data === undefined) {
                if (message.id) {
                    messageIds.push(message.id);

                    var timeout = context.timeouts[message.id];
                    if (timeout) {
                        this.clearTimeout(timeout);
                        delete context.timeouts[message.id];
                        this._debug('Transport', this.getType(), 'removed timeout for message', message.id, ', timeouts', context.timeouts);
                    }
                }
            }

            if ('/meta/connect' === message.channel) {
                _connected = false;
            }
            if ('/meta/disconnect' === message.channel && !_connected) {
                close = true;
            }
        }

        // Remove the envelope corresponding to the messages.
        var removed = false;
        var envelopes = context.envelopes;
        for (var j = 0; j < messageIds.length; ++j) {
            var id = messageIds[j];
            for (var key in envelopes) {
                if (envelopes.hasOwnProperty(key)) {
                    var ids = key.split(',');
                    var index = Utils.inArray(id, ids);
                    if (index >= 0) {
                        removed = true;
                        ids.splice(index, 1);
                        var envelope = envelopes[key][0];
                        var metaConnect = envelopes[key][1];
                        delete envelopes[key];
                        if (ids.length > 0) {
                            envelopes[ids.join(',')] = [envelope, metaConnect];
                        }
                        break;
                    }
                }
            }
        }
        if (removed) {
            this._debug('Transport', this.getType(), 'removed envelope, envelopes', envelopes);
        }

        this._notifySuccess(_successCallback, messages);

        if (close) {
            this.webSocketClose(context, 1000, 'Disconnect');
        }
    };

    _self.onClose = function(context, event) {
        this._debug('Transport', this.getType(), 'closed', context, event);

        if (_sameContext(context)) {
            // Remember if we were able to connect.
            // This close event could be due to server shutdown,
            // and if it restarts we want to try websocket again.
            _webSocketSupported = _stickyReconnect && _webSocketConnected;
            _connecting = null;
            _context = null;
        }

        var timeouts = context.timeouts;
        context.timeouts = {};
        for (var id in timeouts) {
            if (timeouts.hasOwnProperty(id)) {
                this.clearTimeout(timeouts[id]);
            }
        }

        var envelopes = context.envelopes;
        context.envelopes = {};
        for (var key in envelopes) {
            if (envelopes.hasOwnProperty(key)) {
                var envelope = envelopes[key][0];
                var metaConnect = envelopes[key][1];
                if (metaConnect) {
                    _connected = false;
                }
                var failure = {
                    websocketCode: event.code,
                    reason: event.reason
                };
                if (event.exception) {
                    failure.exception = event.exception;
                }
                this._notifyFailure(envelope.onFailure, context, envelope.messages, failure);
            }
        }
    };

    _self.registered = function(type, cometd) {
        _super.registered(type, cometd);
        _cometd = cometd;
    };

    _self.accept = function(version, crossDomain, url) {
        this._debug('Transport', this.getType(), 'accept, supported:', _webSocketSupported);
        // Using !! to return a boolean (and not the WebSocket object).
        return _webSocketSupported && !('undefined' === typeof WebSocket) && _cometd.websocketEnabled !== false;
    };

    _self.send = function(envelope, metaConnect) {
        this._debug('Transport', this.getType(), 'sending', envelope, 'metaConnect =', metaConnect);
        _send.call(this, _context, envelope, metaConnect);
    };

    _self.webSocketClose = function(context, code, reason) {
        try {
            if (context.webSocket) {
                context.webSocket.close(code, reason);
            }
        } catch (x) {
            this._debug(x);
        }
    };

    _self.abort = function() {
        _super.abort();
        _forceClose.call(this, _context, {code: 1000, reason: 'Abort'});
        this.reset(true);
    };

    return _self;
};

},{"./Transport":6,"./Utils":8}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientHelper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _zetapushCometd = require('zetapush-cometd');

var _cometd = require('./cometd');

var _utils = require('./utils');

var _connectionStatus = require('./connection-status');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @desc CometD Messages enumeration
 */
var Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
};

/**
 * @desc CometD Transports enumeration
 */
var Transport = {
  LONG_POLLING: 'long-polling',
  WEBSOCKET: 'websocket'
};

/**
 * @desc Provide utilities and abstraction on CometD Transport layer
 * @access private
 */

var ClientHelper = exports.ClientHelper = function () {
  /**
   *
   */

  function ClientHelper(_ref) {
    var _this = this;

    var apiUrl = _ref.apiUrl;
    var businessId = _ref.businessId;
    var handshakeStrategy = _ref.handshakeStrategy;
    var resource = _ref.resource;

    _classCallCheck(this, ClientHelper);

    /**
     * @access private
     * @type {string}
     */
    this.businessId = businessId;
    /**
     * @access private
     * @type {function():AbstractHandshakeManager}
     */
    this.handshakeStrategy = handshakeStrategy;
    /**
     * @access private
     * @type {string}
     */
    this.resource = resource;
    /**
     * @access private
     * @type {Promise}
     */
    this.servers = (0, _utils.getServers)('' + apiUrl + businessId);
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.connectionListeners = [];
    /**
     * @access private
     * @type {boolean}
     */
    this.connected = false;
    /**
     * @access private
     * @type {boolean}
     */
    this.wasConnected = false;
    /**
     * @access private
     * @type {string}
     */
    this.serverUrl = null;
    /**
     * @access private
     * @type {Array<Object>}
     */
    this.subscribeQueue = [];
    /**
     * @access private
     * @type {CometD}
     */
    this.cometd = new _zetapushCometd.CometD();
    this.cometd.registerTransport(Transport.WEBSOCKET, new _zetapushCometd.WebSocketTransport());
    this.cometd.registerTransport(Transport.LONG_POLLING, new _cometd.FetchLongPollingTransport());
    this.cometd.onTransportException = function (cometd, transport) {
      if (Transport.LONG_POLLING === transport) {
        // Try to find an other available server
        // Remove the current one from the _serverList array
        _this.updateServerUrl();
      }
    };
    this.cometd.addListener('/meta/handshake', function (_ref2) {
      var ext = _ref2.ext;
      var successful = _ref2.successful;
      var advice = _ref2.advice;
      var error = _ref2.error;

      console.debug('ClientHelper::/meta/handshake', { ext: ext, successful: successful, advice: advice, error: error });
      if (successful) {
        var _ext$authentication = ext.authentication;
        var authentication = _ext$authentication === undefined ? null : _ext$authentication;

        _this.initialized(authentication);
      } else {
        // this.handshakeFailure(error)
      }
    });

    this.cometd.addListener('/meta/handshake', function (_ref3) {
      var advice = _ref3.advice;
      var error = _ref3.error;
      var ext = _ref3.ext;
      var successful = _ref3.successful;

      console.debug('ClientHelper::/meta/handshake', { ext: ext, successful: successful, advice: advice, error: error });
      // AuthNegotiation
      if (!successful) {
        if (advice === null) {
          return;
        }
        if (Message.RECONNECT_NONE_VALUE === advice.reconnect) {
          _this.authenticationFailed(error);
        } else if (Message.RECONNECT_HANDSHAKE_VALUE === advice.reconnect) {
          _this.negotiate(ext);
        }
      }
    });

    this.cometd.addListener('/meta/connect', function (_ref4) {
      var advice = _ref4.advice;
      var channel = _ref4.channel;
      var successful = _ref4.successful;

      console.debug('ClientHelper::/meta/connect', { advice: advice, channel: channel, successful: successful });
      // ConnectionListener
      if (_this.cometd.isDisconnected()) {
        _this.connected = false;
        // Notify connection is closed
        _this.connectionClosed();
      } else {
        _this.wasConnected = _this.connected;
        _this.connected = successful;
        if (!_this.wasConnected && _this.connected) {
          _this.cometd.batch(_this, function () {
            // Unqueue subscriptions
            _this.subscribeQueue.forEach(function (_ref5) {
              var prefix = _ref5.prefix;
              var serviceListener = _ref5.serviceListener;
              var subscriptions = _ref5.subscriptions;

              _this.subscribe(prefix, serviceListener, subscriptions);
            });
            _this.subscribeQueue = [];
          });
          // Notify connection is established
          _this.connectionEstablished();
        } else if (_this.wasConnected && !_this.connected) {
          // Notify connection is broken
          _this.connectionBroken();
        }
      }
    });
  }
  /**
   * @desc Connect client using CometD Transport
   */


  _createClass(ClientHelper, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      this.servers.then(function (servers) {
        _this2.serverUrl = (0, _utils.shuffle)(servers);

        _this2.cometd.configure({
          url: _this2.serverUrl + '/strd',
          backoffIncrement: 1000,
          maxBackoff: 60000,
          appendMessageTypeToURL: false
        });

        _this2.cometd.handshake(_this2.getHandshakeFields());
      });
    }
    /**
     * @desc Notify listeners when connection is established
     */

  }, {
    key: 'connectionEstablished',
    value: function connectionEstablished() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionEstablished();
      });
    }
    /**
     * @desc Notify listeners when connection is broken
     */

  }, {
    key: 'connectionBroken',
    value: function connectionBroken() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionBroken();
      });
    }
    /**
     * @desc Notify listeners when a message is lost
     */

  }, {
    key: 'messageLost',
    value: function messageLost(channel, data) {
      this.connectionListeners.forEach(function (listener) {
        listener.onMessageLost(channel, data);
      });
    }
    /**
     * @desc Notify listeners when connection is closed
     */

  }, {
    key: 'connectionClosed',
    value: function connectionClosed() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionClosed();
      });
    }
    /**
     * @desc Notify listeners when connection is established
     */

  }, {
    key: 'initialized',
    value: function initialized(authentication) {
      if (authentication) {
        this.userId = authentication.userId;
      }
      this.connectionListeners.forEach(function (listener) {
        listener.onSuccessfulHandshake(authentication);
      });
    }
    /**
     * @desc Notify listeners when handshake step succeed
     */

  }, {
    key: 'authenticationFailed',
    value: function authenticationFailed(error) {
      this.connectionListeners.forEach(function (listener) {
        listener.onFailedHandshake(error);
      });
    }
    /**
     *
     */

  }, {
    key: 'handshakeFailure',
    value: function handshakeFailure() {}
    /**
    * @desc Remove current server url from the server list and shuffle for another one
    */

  }, {
    key: 'updateServerUrl',
    value: function updateServerUrl() {
      var _this3 = this;

      this.servers.then(function (servers) {
        var index = servers.indexOf(_this3.serverUrl);
        if (index > -1) {
          servers.splice(index, 1);
        }
        if (servers.length === 0) {
          // No more server available
        } else {
            _this3.serverUrl = (0, _utils.shuffle)(servers);
            _this3.cometd.configure({
              url: _this3.serverUrl + '/strd'
            });
            setTimeout(function () {
              _this3.cometd.handshake(_this3.getHandshakeFields());
            }, 250);
          }
      });
    }
    /**
     *
     */

  }, {
    key: 'negotiate',
    value: function negotiate(ext) {
      console.debug('ClientHelper::negotiate', ext);
    }
    /**
     * @desc Disconnect CometD client
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.cometd.disconnect();
    }
    /**
     * @desc Get CometD handshake parameters
     * @return {Object}
     */

  }, {
    key: 'getHandshakeFields',
    value: function getHandshakeFields() {
      var handshake = this.handshakeStrategy();
      return handshake.getHandshakeFields(this);
    }
    /**
     * @desc Set a new handshake factory methods
     * @param {function():AbstractHandshakeManager} handshakeStrategy
     */

  }, {
    key: 'setHandshakeStrategy',
    value: function setHandshakeStrategy(handshakeStrategy) {
      this.handshakeStrategy = handshakeStrategy;
    }
    /**
     * @desc Get business id
     * @return {string}
     */

  }, {
    key: 'getBusinessId',
    value: function getBusinessId() {
      return this.businessId;
    }
    /**
     * @desc Get session id
     * @return {string}
     */

  }, {
    key: 'getSessionId',
    value: function getSessionId() {
      throw NotYetImplementedError();
    }
    /**
     * @desc Get resource
     * @return {string}
     */

  }, {
    key: 'getResource',
    value: function getResource() {
      return this.resource;
    }
    /**
     * @desc Subribe all methods defined in the serviceListener for the given prefixed channel
     * @param {string} prefix - Channel prefix
     * @param {Object} serviceListener
     * @param {Object} subscriptions
     * @return {Object} subscriptions
     */

  }, {
    key: 'subscribe',
    value: function subscribe(prefix, serviceListener) {
      var subscriptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (this.cometd.isDisconnected()) {
        this.subscribeQueue.push({ prefix: prefix, serviceListener: serviceListener, subscriptions: subscriptions });
      } else {
        for (var method in serviceListener) {
          if (serviceListener.hasOwnProperty(method)) {
            var channel = prefix + '/' + method;
            subscriptions[method] = this.cometd.subscribe(channel, serviceListener[method]);
          }
        }
      }
      return subscriptions;
    }
    /**
     * @desc Get a publisher
     * @param {string} prefix - Channel prefix
     * @param {Object} publisherDefinition
     * @return {Object} servicePublisher
     */

  }, {
    key: 'createServicePublisher',
    value: function createServicePublisher(prefix, publisherDefinition) {
      var _this4 = this;

      var servicePublisher = {};
      for (var method in publisherDefinition) {
        if (publisher.hasOwnProperty(method)) {
          (function () {
            var channel = prefix + '/' + method;
            servicePublisher[method] = function () {
              var parameters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

              _this4.cometd.publish(channel, parameters);
            };
          })();
        }
      }
      return servicePublisher;
    }
    /**
     * @desc Unsubcribe all subscriptions defined in given subscriptions object
     * @param {Object} subscriptions
     */

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(subscriptions) {
      for (var method in subscriptions) {
        if (subscriptions.hasOwnProperty(method)) {
          this.cometd.unsubscribe(subscriptions[method]);
        }
      }
    }
    /**
     * @desc Add a connection listener to handle life cycle connection events
     * @param {ConnectionStatusListener} listener
     */

  }, {
    key: 'addConnectionStatusListener',
    value: function addConnectionStatusListener(listener) {
      var connectionListener = Object.assign(new _connectionStatus.ConnectionStatusListener(), listener);
      this.connectionListeners.push(connectionListener);
    }
  }]);

  return ClientHelper;
}();

},{"./cometd":12,"./connection-status":13,"./utils":18,"zetapush-cometd":1}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = exports.API_URL = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _clientHelper = require('./client-helper');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @access public
 * @desc Default ZetaPush API URL
 */
var API_URL = exports.API_URL = 'https://api.zpush.io/';

/**
 * @access public
 * @desc ZetaPush Client to connect
 * @example
 * const client = new Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   handshakeStrategy() {
 *     return AuthentFactory.createWeakHandshake({
 *       token: null,
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 */

var Client = exports.Client = function () {
  /**
   *
   */

  function Client(_ref) {
    var _ref$apiUrl = _ref.apiUrl;
    var apiUrl = _ref$apiUrl === undefined ? API_URL : _ref$apiUrl;
    var businessId = _ref.businessId;
    var handshakeStrategy = _ref.handshakeStrategy;
    var _ref$resource = _ref.resource;
    var resource = _ref$resource === undefined ? null : _ref$resource;

    _classCallCheck(this, Client);

    /**
     * @access private
     * @type {ClientHelper}
     */
    this.client = new _clientHelper.ClientHelper({
      apiUrl: apiUrl,
      businessId: businessId,
      handshakeStrategy: handshakeStrategy,
      resource: resource
    });
  }
  /**
   * @desc Connect client to ZetaPush
   */


  _createClass(Client, [{
    key: 'connect',
    value: function connect() {
      this.client.connect();
    }
    /**
     * @desc Disonnect client from ZetaPush
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.client.disconnect();
    }
    /**
     * @desc Create a service publisher based on publisher definition for the given deployment id
     * @experimental
     * @return {Object}
     */

  }, {
    key: 'createServicePublisher',
    value: function createServicePublisher(_ref2) {
      var deploymentId = _ref2.deploymentId;
      var publisherDefinition = _ref2.publisherDefinition;

      return this.client.createServicePublisher('/service/' + this.getBusinessId() + '/' + deploymentId, publisherDefinition);
    }
    /**
     * @desc Get the client business id
     * @return {string}
     */

  }, {
    key: 'getBusinessId',
    value: function getBusinessId() {
      return this.client.getBusinessId();
    }
    /**
     * @desc Get the client resource
     * @return {string}
     */

  }, {
    key: 'getResource',
    value: function getResource() {
      return this.client.getResource();
    }
    /**
     * @desc Get the client user id
     * @return {string}
     */

  }, {
    key: 'getUserId',
    value: function getUserId() {
      return this.client.getUserId();
    }
    /**
     * @desc Get the client session id
     * @return {string}
     */

  }, {
    key: 'getSessionId',
    value: function getSessionId() {
      return this.client.getSessionId();
    }
    /**
     * @desc Subscribe all methods described in the serviceListener for the given deploymentId
     * @return {Object} subscription
     * @example
     * const stackServiceListener = {
     *   list() {},
     *   push() {},
     *   update() {}
     * }
     * client.subscribeListener({
     *   deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>',
     *   serviceListener
     * })
     */

  }, {
    key: 'subscribeListener',
    value: function subscribeListener(_ref3) {
      var deploymentId = _ref3.deploymentId;
      var serviceListener = _ref3.serviceListener;

      return this.client.subscribe('/service/' + this.getBusinessId() + '/' + deploymentId, serviceListener);
    }
    /**
    * @desc Create a publish/subscribe
    * @experimental
    * @return {Object}
     */

  }, {
    key: 'createPubSub',
    value: function createPubSub(_ref4) {
      var deploymentId = _ref4.deploymentId;
      var serviceListener = _ref4.serviceListener;
      var publisher = _ref4.publisher;

      throw new _utils.NotYetImplementedError('createPubSub');
    }
    /**
     * @desc Set new client resource value
     */

  }, {
    key: 'setResource',
    value: function setResource(resource) {
      this.client.setResource(resource);
    }
    /**
     * @desc Add a connection listener to handle life cycle connection events
     * @param {ConnectionStatusListener} listener
     */

  }, {
    key: 'addConnectionStatusListener',
    value: function addConnectionStatusListener(listener) {
      return this.client.addConnectionStatusListener(listener);
    }
    /**
     * @desc Force disconnect/connect with new handshake factory
     * @param {function():AbstractHandshakeManager} handshakeStrategy
     */

  }, {
    key: 'handshake',
    value: function handshake(handshakeStrategy) {
      this.disconnect();
      if (handshakeStrategy) {
        this.client.setHandshakeStrategy(handshakeStrategy);
      }
      this.connect();
    }
  }]);

  return Client;
}();

},{"./client-helper":10,"./utils":18}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchLongPollingTransport = FetchLongPollingTransport;

var _zetapushCometd = require('zetapush-cometd');

/**
 * @access private
 * @desc Implements LongPollingTransport using borwser fetch() API
 * @return {FetchLongPollingTransport}
 */
function FetchLongPollingTransport() {
  var _super = new _zetapushCometd.LongPollingTransport();
  var that = _zetapushCometd.Transport.derive(_super);

  /**
   * @desc Implements transport via fetch() API
   * @param {Object} packet
   */
  that.xhrSend = function (packet) {
    fetch(packet.url, {
      method: 'post',
      body: packet.body,
      headers: Object.assign(packet.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      })
    }).then(function (response) {
      return response.json();
    }).then(packet.onSuccess).catch(packet.onError);
  };

  return that;
}

},{"zetapush-cometd":1}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @access public
 * @desc Define life cycle connection methods 
 */

var ConnectionStatusListener = exports.ConnectionStatusListener = function () {
  function ConnectionStatusListener() {
    _classCallCheck(this, ConnectionStatusListener);
  }

  _createClass(ConnectionStatusListener, [{
    key: "onConnectionBroken",

    /**
     * @desc Callback fired when connection is broken
     */
    value: function onConnectionBroken() {}
    /**
     * @desc Callback fired when connection is closed
     */

  }, {
    key: "onConnectionClosed",
    value: function onConnectionClosed() {}
    /**
     * @desc Callback fired when is established
     */

  }, {
    key: "onConnectionEstablished",
    value: function onConnectionEstablished() {}
    /**
     * @desc Callback fired when an error occurs in handshake step
     * @param {Object} error
     */

  }, {
    key: "onFailedHandshake",
    value: function onFailedHandshake(error) {}
    /**
     * @desc Callback fired when a message is lost
     */

  }, {
    key: "onMessageLost",
    value: function onMessageLost() {}
    /**
     * @desc Callback fired when handshake step succeed
     * @param {Object} authentication
     */

  }, {
    key: "onSuccessfulHandshake",
    value: function onSuccessfulHandshake(authentication) {}
  }]);

  return ConnectionStatusListener;
}();

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * ZetaPush deployables names
 */
var DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating'
};

/**
 * @access protected
 */

var AbstractHandshakeManager = exports.AbstractHandshakeManager = function () {
  /**
   *
   */

  function AbstractHandshakeManager(_ref) {
    var authType = _ref.authType;
    var businessId = _ref.businessId;
    var deploymentId = _ref.deploymentId;

    _classCallCheck(this, AbstractHandshakeManager);

    this.authType = authType;
    this.businessId = businessId;
    this.deploymentId = deploymentId;
  }
  /**
   * @param {ClientHelper} client
   * @return {Object}
   */


  _createClass(AbstractHandshakeManager, [{
    key: 'getHandshakeFields',
    value: function getHandshakeFields(client) {
      var authentication = {
        data: this.authData,
        type: client.getBusinessId() + '.' + this.deploymentId + '.' + this.authType,
        version: this.authVersion
      };
      if (client.getResource()) {
        authentication.resource = client.getResource();
      }
      return {
        ext: {
          authentication: authentication
        }
      };
    }
    /**
     * Get auth version
     * @return {string}
     */

  }, {
    key: 'authVersion',
    get: function get() {
      return 'none';
    }
  }]);

  return AbstractHandshakeManager;
}();

/**
 * @access public
 * @extends {AbstractHandshakeManager}
 */


var TokenHandshakeManager = exports.TokenHandshakeManager = function (_AbstractHandshakeMan) {
  _inherits(TokenHandshakeManager, _AbstractHandshakeMan);

  /**
   *
   */

  function TokenHandshakeManager(_ref2) {
    var authType = _ref2.authType;
    var deploymentId = _ref2.deploymentId;
    var token = _ref2.token;

    _classCallCheck(this, TokenHandshakeManager);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TokenHandshakeManager).call(this, { deploymentId: deploymentId, authType: authType }));

    _this.token = token;
    return _this;
  }
  /**
   * @return {token: string}
   */


  _createClass(TokenHandshakeManager, [{
    key: 'authData',
    get: function get() {
      var token = this.token;

      return {
        token: token
      };
    }
  }]);

  return TokenHandshakeManager;
}(AbstractHandshakeManager);

/**
 * @access public
 * @extends {AbstractHandshakeManager}
 */


var DefaultZetapushHandshakeManager = exports.DefaultZetapushHandshakeManager = function (_AbstractHandshakeMan2) {
  _inherits(DefaultZetapushHandshakeManager, _AbstractHandshakeMan2);

  /**
   *
   */

  function DefaultZetapushHandshakeManager(_ref3) {
    var authType = _ref3.authType;
    var deploymentId = _ref3.deploymentId;
    var login = _ref3.login;
    var password = _ref3.password;

    _classCallCheck(this, DefaultZetapushHandshakeManager);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(DefaultZetapushHandshakeManager).call(this, { authType: authType, deploymentId: deploymentId }));

    _this2.login = login;
    _this2.password = password;
    return _this2;
  }
  /**
   * @desc Get auth data
   * @return {login: string, password: string}
   */


  _createClass(DefaultZetapushHandshakeManager, [{
    key: 'authData',
    get: function get() {
      var login = this.login;
      var password = this.password;

      return {
        login: login, password: password
      };
    }
  }]);

  return DefaultZetapushHandshakeManager;
}(AbstractHandshakeManager);

/**
 * @access public
 */


var AuthentFactory = exports.AuthentFactory = function () {
  function AuthentFactory() {
    _classCallCheck(this, AuthentFactory);
  }

  _createClass(AuthentFactory, null, [{
    key: 'createSimpleHandshake',

    /**
     * @return {DefaultZetapushHandshakeManager}
     */
    value: function createSimpleHandshake(_ref4) {
      var deploymentId = _ref4.deploymentId;
      var login = _ref4.login;
      var password = _ref4.password;

      return AuthentFactory.createHandshake({
        authType: DeployableNames.AUTH_SIMPLE,
        deploymentId: deploymentId,
        login: login,
        password: password
      });
    }
    /**
     * @return {TokenHandshakeManager}
     */

  }, {
    key: 'createWeakHandshake',
    value: function createWeakHandshake(_ref5) {
      var deploymentId = _ref5.deploymentId;
      var token = _ref5.token;

      return AuthentFactory.createHandshake({
        authType: DeployableNames.AUTH_WEAK,
        deploymentId: deploymentId,
        login: token,
        password: null
      });
    }
    /**
     * @return {TokenHandshakeManager}
     */

  }, {
    key: 'createDelegatingHandshake',
    value: function createDelegatingHandshake(_ref6) {
      var deploymentId = _ref6.deploymentId;
      var token = _ref6.token;

      return AuthentFactory.createHandshake({
        authType: DeployableNames.AUTH_DELEGATING,
        deploymentId: deploymentId,
        login: token,
        password: null
      });
    }
    /**
     * @return {TokenHandshakeManager|DefaultZetapushHandshakeManager}
     */

  }, {
    key: 'createHandshake',
    value: function createHandshake(_ref7) {
      var authType = _ref7.authType;
      var deploymentId = _ref7.deploymentId;
      var login = _ref7.login;
      var password = _ref7.password;

      if (null === password) {
        return new TokenHandshakeManager({ authType: authType, deploymentId: deploymentId, token: login });
      }
      return new DefaultZetapushHandshakeManager({ authType: authType, deploymentId: deploymentId, login: login, password: password });
    }
  }]);

  return AuthentFactory;
}();

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _handshake = require('./handshake');

Object.defineProperty(exports, 'AuthentFactory', {
  enumerable: true,
  get: function get() {
    return _handshake.AuthentFactory;
  }
});

var _client = require('./client');

Object.defineProperty(exports, 'API_URL', {
  enumerable: true,
  get: function get() {
    return _client.API_URL;
  }
});
Object.defineProperty(exports, 'Client', {
  enumerable: true,
  get: function get() {
    return _client.Client;
  }
});

var _smartClient = require('./smart-client');

Object.defineProperty(exports, 'SmartClient', {
  enumerable: true,
  get: function get() {
    return _smartClient.SmartClient;
  }
});

var _tokenPersistence = require('./token-persistence');

Object.defineProperty(exports, 'AbstractTokenPersistenceStrategy', {
  enumerable: true,
  get: function get() {
    return _tokenPersistence.AbstractTokenPersistenceStrategy;
  }
});
Object.defineProperty(exports, 'LocalStorageTokenPersistenceStrategy', {
  enumerable: true,
  get: function get() {
    return _tokenPersistence.LocalStorageTokenPersistenceStrategy;
  }
});

},{"./client":11,"./handshake":14,"./smart-client":16,"./token-persistence":17}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmartClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

var _handshake = require('./handshake');

var _tokenPersistence = require('./token-persistence');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @access protected
 * @extends {Client}
 */

var SmartClient = exports.SmartClient = function (_Client) {
  _inherits(SmartClient, _Client);

  /**
   *
   */

  function SmartClient(_ref) {
    var apiUrl = _ref.apiUrl;
    var authenticationDeploymentId = _ref.authenticationDeploymentId;
    var businessId = _ref.businessId;
    var _ref$resource = _ref.resource;
    var resource = _ref$resource === undefined ? null : _ref$resource;
    var _ref$TokenPersistence = _ref.TokenPersistenceStrategy;
    var TokenPersistenceStrategy = _ref$TokenPersistence === undefined ? _tokenPersistence.LocalStorageTokenPersistenceStrategy : _ref$TokenPersistence;

    _classCallCheck(this, SmartClient);

    var handshakeStrategy = function handshakeStrategy() {
      var token = _this.getToken();
      var handshake = _handshake.AuthentFactory.createWeakHandshake({
        deploymentId: authenticationDeploymentId,
        token: token
      });
      return handshake;
    };
    /**
     *
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SmartClient).call(this, { apiUrl: apiUrl, businessId: businessId, handshakeStrategy: handshakeStrategy, resource: resource }));

    var onSuccessfulHandshake = function onSuccessfulHandshake(_ref2) {
      var publicToken = _ref2.publicToken;
      var userId = _ref2.userId;
      var token = _ref2.token;

      console.debug('SmartClient::onSuccessfulHandshake', { publicToken: publicToken, userId: userId, token: token });

      if (token) {
        _this.strategy.set({ token: token });
      }
    };
    var onFailedHandshake = function onFailedHandshake(error) {
      console.debug('SmartClient::onFailedHandshake', error);
    };
    _this.addConnectionStatusListener({ onFailedHandshake: onFailedHandshake, onSuccessfulHandshake: onSuccessfulHandshake });
    /**
     * @access private
     * @type {TokenPersistenceStrategy}
     */
    _this.strategy = new TokenPersistenceStrategy();
    return _this;
  }
  /**
   * @return {string} The stored token
   */


  _createClass(SmartClient, [{
    key: 'getToken',
    value: function getToken() {
      return this.strategy.get();
    }
  }]);

  return SmartClient;
}(_client.Client);

},{"./client":11,"./handshake":14,"./token-persistence":17}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @type {string}
 */
var ZETAPUSH_TOKEN_KEY = 'zetapush.token';

/**
 * @access protected
 * @desc Provide abstraction for token persistence
 */

var AbstractTokenPersistenceStrategy = exports.AbstractTokenPersistenceStrategy = function () {
  /**
   *
   */

  function AbstractTokenPersistenceStrategy() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var _ref$key = _ref.key;
    var key = _ref$key === undefined ? ZETAPUSH_TOKEN_KEY : _ref$key;

    _classCallCheck(this, AbstractTokenPersistenceStrategy);

    /**
     * @access private
     * @type {string}
     */
    this.key = key;
  }
  /**
   * @abstract
   * @return {string} The stored token
   */


  _createClass(AbstractTokenPersistenceStrategy, [{
    key: 'get',
    value: function get() {}
    /**
     * @abstract
     */

  }, {
    key: 'set',
    value: function set(_ref2) {
      var token = _ref2.token;
    }
  }]);

  return AbstractTokenPersistenceStrategy;
}();

/**
 * @access protected
 * @extends {AbstractTokenPersistenceStrategy}
 */


var LocalStorageTokenPersistenceStrategy = exports.LocalStorageTokenPersistenceStrategy = function (_AbstractTokenPersist) {
  _inherits(LocalStorageTokenPersistenceStrategy, _AbstractTokenPersist);

  function LocalStorageTokenPersistenceStrategy() {
    _classCallCheck(this, LocalStorageTokenPersistenceStrategy);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(LocalStorageTokenPersistenceStrategy).apply(this, arguments));
  }

  _createClass(LocalStorageTokenPersistenceStrategy, [{
    key: 'get',

    /**
     * @override
     * @return {string} The stored token
     */
    value: function get() {
      return localStorage.getItem(this.key);
    }
    /**
     * @override
     */

  }, {
    key: 'set',
    value: function set(_ref3) {
      var token = _ref3.token;

      localStorage.setItem(this.key, token);
    }
  }]);

  return LocalStorageTokenPersistenceStrategy;
}(AbstractTokenPersistenceStrategy);

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @access private
 * @param {Array<Object>} list
 * @return {Object}
 */
var shuffle = exports.shuffle = function shuffle(list) {
  var index = Math.floor(Math.random() * list.length);
  return list[index];
};

/**
 * @access private
 * @param {string} url
 * @return {Promise}
 */
var getServers = exports.getServers = function getServers(url) {
  return fetch(url).then(function (response) {
    return response.json();
  }).then(function (_ref) {
    var servers = _ref.servers;

    return servers;
  });
};

/**
 * @access private
 * @extends {Error}
 */

var NotYetImplementedError = exports.NotYetImplementedError = function (_Error) {
  _inherits(NotYetImplementedError, _Error);

  /**
   * @param {string} message
   */

  function NotYetImplementedError() {
    var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    _classCallCheck(this, NotYetImplementedError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NotYetImplementedError).call(this, message));

    _this.name = 'NotImplementedError';
    return _this;
  }

  return NotYetImplementedError;
}(Error);

},{}]},{},[15])(15)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ29tZXRELmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvTG9uZ1BvbGxpbmdUcmFuc3BvcnQuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9SZXF1ZXN0VHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0UmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9VdGlscy5qcyIsIm5vZGVfbW9kdWxlcy96ZXRhcHVzaC1jb21ldGQvbGliL1dlYlNvY2tldFRyYW5zcG9ydC5qcyIsInNyYy9jbGllbnQtaGVscGVyLmpzIiwic3JjL2NsaWVudC5qcyIsInNyYy9jb21ldGQuanMiLCJzcmMvY29ubmVjdGlvbi1zdGF0dXMuanMiLCJzcmMvaGFuZHNoYWtlLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NtYXJ0LWNsaWVudC5qcyIsInNyYy90b2tlbi1wZXJzaXN0ZW5jZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2o0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDN1dBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7O0FBS0EsSUFBTSxVQUFVO0FBQ2QsNkJBQTJCLFdBQTNCO0FBQ0Esd0JBQXNCLE1BQXRCO0FBQ0EseUJBQXVCLE9BQXZCO0NBSEk7Ozs7O0FBU04sSUFBTSxZQUFZO0FBQ2hCLGdCQUFjLGNBQWQ7QUFDQSxhQUFXLFdBQVg7Q0FGSTs7Ozs7OztJQVNPOzs7OztBQUlYLFdBSlcsWUFJWCxPQUFpRTs7O1FBQW5ELHFCQUFtRDtRQUEzQyw2QkFBMkM7UUFBL0IsMkNBQStCO1FBQVoseUJBQVk7OzBCQUp0RCxjQUlzRDs7Ozs7O0FBSy9ELFNBQUssVUFBTCxHQUFrQixVQUFsQjs7Ozs7QUFMK0QsUUFVL0QsQ0FBSyxpQkFBTCxHQUF5QixpQkFBekI7Ozs7O0FBVitELFFBZS9ELENBQUssUUFBTCxHQUFnQixRQUFoQjs7Ozs7QUFmK0QsUUFvQi9ELENBQUssT0FBTCxHQUFlLDRCQUFjLFNBQVMsVUFBdkIsQ0FBZjs7Ozs7QUFwQitELFFBeUIvRCxDQUFLLG1CQUFMLEdBQTJCLEVBQTNCOzs7OztBQXpCK0QsUUE4Qi9ELENBQUssU0FBTCxHQUFpQixLQUFqQjs7Ozs7QUE5QitELFFBbUMvRCxDQUFLLFlBQUwsR0FBb0IsS0FBcEI7Ozs7O0FBbkMrRCxRQXdDL0QsQ0FBSyxTQUFMLEdBQWlCLElBQWpCOzs7OztBQXhDK0QsUUE2Qy9ELENBQUssY0FBTCxHQUFzQixFQUF0Qjs7Ozs7QUE3QytELFFBa0QvRCxDQUFLLE1BQUwsR0FBYyw0QkFBZCxDQWxEK0Q7QUFtRC9ELFNBQUssTUFBTCxDQUFZLGlCQUFaLENBQThCLFVBQVUsU0FBVixFQUFxQix3Q0FBbkQsRUFuRCtEO0FBb0QvRCxTQUFLLE1BQUwsQ0FBWSxpQkFBWixDQUE4QixVQUFVLFlBQVYsRUFBd0IsdUNBQXRELEVBcEQrRDtBQXFEL0QsU0FBSyxNQUFMLENBQVksb0JBQVosR0FBbUMsVUFBQyxNQUFELEVBQVMsU0FBVCxFQUF1QjtBQUN4RCxVQUFJLFVBQVUsWUFBVixLQUEyQixTQUEzQixFQUFzQzs7O0FBR3hDLGNBQUssZUFBTCxHQUh3QztPQUExQztLQURpQyxDQXJENEI7QUE0RC9ELFNBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsaUJBQXhCLEVBQTJDLGlCQUF3QztVQUFyQyxnQkFBcUM7VUFBaEMsOEJBQWdDO1VBQXBCLHNCQUFvQjtVQUFaLG9CQUFZOztBQUNqRixjQUFRLEtBQVIsQ0FBYywrQkFBZCxFQUErQyxFQUFFLFFBQUYsRUFBTyxzQkFBUCxFQUFtQixjQUFuQixFQUEyQixZQUEzQixFQUEvQyxFQURpRjtBQUVqRixVQUFJLFVBQUosRUFBZ0I7a0NBQ29CLElBQTFCLGVBRE07WUFDTixxREFBaUIsMkJBRFg7O0FBRWQsY0FBSyxXQUFMLENBQWlCLGNBQWpCLEVBRmM7T0FBaEIsTUFJSzs7T0FKTDtLQUZ5QyxDQUEzQyxDQTVEK0Q7O0FBdUUvRCxTQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLGlCQUF4QixFQUEyQyxpQkFBd0M7VUFBckMsc0JBQXFDO1VBQTdCLG9CQUE2QjtVQUF0QixnQkFBc0I7VUFBakIsOEJBQWlCOztBQUNqRixjQUFRLEtBQVIsQ0FBYywrQkFBZCxFQUErQyxFQUFFLFFBQUYsRUFBTyxzQkFBUCxFQUFtQixjQUFuQixFQUEyQixZQUEzQixFQUEvQzs7QUFEaUYsVUFHN0UsQ0FBQyxVQUFELEVBQWE7QUFDZixZQUFJLFdBQVcsSUFBWCxFQUFpQjtBQUNuQixpQkFEbUI7U0FBckI7QUFHQSxZQUFJLFFBQVEsb0JBQVIsS0FBaUMsT0FBTyxTQUFQLEVBQWtCO0FBQ3JELGdCQUFLLG9CQUFMLENBQTBCLEtBQTFCLEVBRHFEO1NBQXZELE1BR0ssSUFBSSxRQUFRLHlCQUFSLEtBQXNDLE9BQU8sU0FBUCxFQUFrQjtBQUMvRCxnQkFBSyxTQUFMLENBQWUsR0FBZixFQUQrRDtTQUE1RDtPQVBQO0tBSHlDLENBQTNDLENBdkUrRDs7QUF1Ri9ELFNBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsZUFBeEIsRUFBeUMsaUJBQXFDO1VBQWxDLHNCQUFrQztVQUExQix3QkFBMEI7VUFBakIsOEJBQWlCOztBQUM1RSxjQUFRLEtBQVIsQ0FBYyw2QkFBZCxFQUE2QyxFQUFFLGNBQUYsRUFBVSxnQkFBVixFQUFtQixzQkFBbkIsRUFBN0M7O0FBRDRFLFVBR3hFLE1BQUssTUFBTCxDQUFZLGNBQVosRUFBSixFQUFrQztBQUNoQyxjQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRGdDLGFBR2hDLENBQUssZ0JBQUwsR0FIZ0M7T0FBbEMsTUFJTztBQUNMLGNBQUssWUFBTCxHQUFvQixNQUFLLFNBQUwsQ0FEZjtBQUVMLGNBQUssU0FBTCxHQUFpQixVQUFqQixDQUZLO0FBR0wsWUFBSSxDQUFDLE1BQUssWUFBTCxJQUFxQixNQUFLLFNBQUwsRUFBZ0I7QUFDeEMsZ0JBQUssTUFBTCxDQUFZLEtBQVosUUFBd0IsWUFBTTs7QUFFNUIsa0JBQUssY0FBTCxDQUFvQixPQUFwQixDQUE0QixpQkFBZ0Q7a0JBQTdDLHNCQUE2QztrQkFBckMsd0NBQXFDO2tCQUFwQixvQ0FBb0I7O0FBQzFFLG9CQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLGVBQXZCLEVBQXdDLGFBQXhDLEVBRDBFO2FBQWhELENBQTVCLENBRjRCO0FBSzVCLGtCQUFLLGNBQUwsR0FBc0IsRUFBdEIsQ0FMNEI7V0FBTixDQUF4Qjs7QUFEd0MsZUFTeEMsQ0FBSyxxQkFBTCxHQVR3QztTQUExQyxNQVdLLElBQUksTUFBSyxZQUFMLElBQXFCLENBQUMsTUFBSyxTQUFMLEVBQWdCOztBQUU3QyxnQkFBSyxnQkFBTCxHQUY2QztTQUExQztPQWxCUDtLQUh1QyxDQUF6QyxDQXZGK0Q7R0FBakU7Ozs7OztlQUpXOzs4QkEwSEQ7OztBQUNSLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsVUFBQyxPQUFELEVBQWE7QUFDN0IsZUFBSyxTQUFMLEdBQWlCLG9CQUFRLE9BQVIsQ0FBakIsQ0FENkI7O0FBRzdCLGVBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0I7QUFDcEIsZUFBUSxPQUFLLFNBQUwsVUFBUjtBQUNBLDRCQUFrQixJQUFsQjtBQUNBLHNCQUFZLEtBQVo7QUFDQSxrQ0FBd0IsS0FBeEI7U0FKRixFQUg2Qjs7QUFVN0IsZUFBSyxNQUFMLENBQVksU0FBWixDQUFzQixPQUFLLGtCQUFMLEVBQXRCLEVBVjZCO09BQWIsQ0FBbEIsQ0FEUTs7Ozs7Ozs7NENBaUJjO0FBQ3RCLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMsdUJBQVQsR0FENkM7T0FBZCxDQUFqQyxDQURzQjs7Ozs7Ozs7dUNBUUw7QUFDakIsV0FBSyxtQkFBTCxDQUF5QixPQUF6QixDQUFpQyxVQUFDLFFBQUQsRUFBYztBQUM3QyxpQkFBUyxrQkFBVCxHQUQ2QztPQUFkLENBQWpDLENBRGlCOzs7Ozs7OztnQ0FRUCxTQUFTLE1BQU07QUFDekIsV0FBSyxtQkFBTCxDQUF5QixPQUF6QixDQUFpQyxVQUFDLFFBQUQsRUFBYztBQUM3QyxpQkFBUyxhQUFULENBQXVCLE9BQXZCLEVBQWdDLElBQWhDLEVBRDZDO09BQWQsQ0FBakMsQ0FEeUI7Ozs7Ozs7O3VDQVFSO0FBQ2pCLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMsa0JBQVQsR0FENkM7T0FBZCxDQUFqQyxDQURpQjs7Ozs7Ozs7Z0NBUVAsZ0JBQWdCO0FBQzFCLFVBQUksY0FBSixFQUFvQjtBQUNsQixhQUFLLE1BQUwsR0FBYyxlQUFlLE1BQWYsQ0FESTtPQUFwQjtBQUdBLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMscUJBQVQsQ0FBK0IsY0FBL0IsRUFENkM7T0FBZCxDQUFqQyxDQUowQjs7Ozs7Ozs7eUNBV1AsT0FBTztBQUMxQixXQUFLLG1CQUFMLENBQXlCLE9BQXpCLENBQWlDLFVBQUMsUUFBRCxFQUFjO0FBQzdDLGlCQUFTLGlCQUFULENBQTJCLEtBQTNCLEVBRDZDO09BQWQsQ0FBakMsQ0FEMEI7Ozs7Ozs7O3VDQVFUOzs7Ozs7O3NDQU1EOzs7QUFDaEIsV0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixVQUFDLE9BQUQsRUFBYTtBQUM3QixZQUFNLFFBQVEsUUFBUSxPQUFSLENBQWdCLE9BQUssU0FBTCxDQUF4QixDQUR1QjtBQUU3QixZQUFJLFFBQVEsQ0FBQyxDQUFELEVBQUk7QUFDZCxrQkFBUSxNQUFSLENBQWUsS0FBZixFQUFzQixDQUF0QixFQURjO1NBQWhCO0FBR0EsWUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBbkIsRUFBc0I7O1NBQTFCLE1BR0s7QUFDSCxtQkFBSyxTQUFMLEdBQWlCLG9CQUFRLE9BQVIsQ0FBakIsQ0FERztBQUVILG1CQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCO0FBQ3BCLG1CQUFRLE9BQUssU0FBTCxVQUFSO2FBREYsRUFGRztBQUtILHVCQUFXLFlBQU07QUFDZixxQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixPQUFLLGtCQUFMLEVBQXRCLEVBRGU7YUFBTixFQUVSLEdBRkgsRUFMRztXQUhMO09BTGdCLENBQWxCLENBRGdCOzs7Ozs7Ozs4QkF1QlIsS0FBSztBQUNiLGNBQVEsS0FBUixDQUFjLHlCQUFkLEVBQXlDLEdBQXpDLEVBRGE7Ozs7Ozs7O2lDQU1GO0FBQ1gsV0FBSyxNQUFMLENBQVksVUFBWixHQURXOzs7Ozs7Ozs7eUNBT1E7QUFDbkIsVUFBTSxZQUFZLEtBQUssaUJBQUwsRUFBWixDQURhO0FBRW5CLGFBQU8sVUFBVSxrQkFBVixDQUE2QixJQUE3QixDQUFQLENBRm1COzs7Ozs7Ozs7eUNBUUEsbUJBQW1CO0FBQ3RDLFdBQUssaUJBQUwsR0FBeUIsaUJBQXpCLENBRHNDOzs7Ozs7Ozs7b0NBT3hCO0FBQ2QsYUFBTyxLQUFLLFVBQUwsQ0FETzs7Ozs7Ozs7O21DQU9EO0FBQ2IsWUFBTSx3QkFBTixDQURhOzs7Ozs7Ozs7a0NBT0Q7QUFDWixhQUFPLEtBQUssUUFBTCxDQURLOzs7Ozs7Ozs7Ozs7OEJBVUosUUFBUSxpQkFBcUM7VUFBcEIsc0VBQWdCLGtCQUFJOztBQUNyRCxVQUFJLEtBQUssTUFBTCxDQUFZLGNBQVosRUFBSixFQUFrQztBQUNoQyxhQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsRUFBRSxjQUFGLEVBQVUsZ0NBQVYsRUFBMkIsNEJBQTNCLEVBQXpCLEVBRGdDO09BQWxDLE1BRU87QUFDTCxhQUFLLElBQU0sTUFBTixJQUFnQixlQUFyQixFQUFzQztBQUNwQyxjQUFJLGdCQUFnQixjQUFoQixDQUErQixNQUEvQixDQUFKLEVBQTRDO0FBQzFDLGdCQUFNLFVBQWEsZUFBVSxNQUF2QixDQURvQztBQUUxQywwQkFBYyxNQUFkLElBQXdCLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0IsT0FBdEIsRUFBK0IsZ0JBQWdCLE1BQWhCLENBQS9CLENBQXhCLENBRjBDO1dBQTVDO1NBREY7T0FIRjtBQVVBLGFBQU8sYUFBUCxDQVhxRDs7Ozs7Ozs7Ozs7MkNBbUJoQyxRQUFRLHFCQUFxQjs7O0FBQ2xELFVBQU0sbUJBQW1CLEVBQW5CLENBRDRDO0FBRWxELFdBQUssSUFBTSxNQUFOLElBQWdCLG1CQUFyQixFQUEwQztBQUN4QyxZQUFJLFVBQVUsY0FBVixDQUF5QixNQUF6QixDQUFKLEVBQXNDOztBQUNwQyxnQkFBTSxVQUFhLGVBQVUsTUFBdkI7QUFDTiw2QkFBaUIsTUFBakIsSUFBMkIsWUFBcUI7a0JBQXBCLG1FQUFhLGtCQUFPOztBQUM5QyxxQkFBSyxNQUFMLENBQVksT0FBWixDQUFvQixPQUFwQixFQUE2QixVQUE3QixFQUQ4QzthQUFyQjtlQUZTO1NBQXRDO09BREY7QUFRQSxhQUFPLGdCQUFQLENBVmtEOzs7Ozs7Ozs7Z0NBZ0J4QyxlQUFlO0FBQ3pCLFdBQUssSUFBTSxNQUFOLElBQWdCLGFBQXJCLEVBQW9DO0FBQ2xDLFlBQUksY0FBYyxjQUFkLENBQTZCLE1BQTdCLENBQUosRUFBMEM7QUFDeEMsZUFBSyxNQUFMLENBQVksV0FBWixDQUF3QixjQUFjLE1BQWQsQ0FBeEIsRUFEd0M7U0FBMUM7T0FERjs7Ozs7Ozs7O2dEQVUwQixVQUFVO0FBQ3BDLFVBQU0scUJBQXFCLE9BQU8sTUFBUCxDQUFjLGdEQUFkLEVBQThDLFFBQTlDLENBQXJCLENBRDhCO0FBRXBDLFdBQUssbUJBQUwsQ0FBeUIsSUFBekIsQ0FBOEIsa0JBQTlCLEVBRm9DOzs7O1NBN1QzQjs7Ozs7Ozs7Ozs7OztBQzFCYjs7QUFFQTs7Ozs7Ozs7QUFNTyxJQUFNLDRCQUFVLHVCQUFWOzs7Ozs7Ozs7Ozs7Ozs7OztJQWdCQTs7Ozs7QUFJWCxXQUpXLE1BSVgsT0FBa0Y7MkJBQXBFLE9BQW9FO1FBQXBFLHFDQUFTLHNCQUEyRDtRQUFsRCw2QkFBa0Q7UUFBdEMsMkNBQXNDOzZCQUFuQixTQUFtQjtRQUFuQix5Q0FBVyxxQkFBUTs7MEJBSnZFLFFBSXVFOzs7Ozs7QUFLaEYsU0FBSyxNQUFMLEdBQWMsK0JBQWlCO0FBQzdCLG9CQUQ2QjtBQUU3Qiw0QkFGNkI7QUFHN0IsMENBSDZCO0FBSTdCLHdCQUo2QjtLQUFqQixDQUFkLENBTGdGO0dBQWxGOzs7Ozs7ZUFKVzs7OEJBbUJEO0FBQ1IsV0FBSyxNQUFMLENBQVksT0FBWixHQURROzs7Ozs7OztpQ0FNRztBQUNYLFdBQUssTUFBTCxDQUFZLFVBQVosR0FEVzs7Ozs7Ozs7OztrREFRaUQ7VUFBckMsa0NBQXFDO1VBQXZCLGdEQUF1Qjs7QUFDNUQsYUFBTyxLQUFLLE1BQUwsQ0FBWSxzQkFBWixlQUErQyxLQUFLLGFBQUwsV0FBd0IsWUFBdkUsRUFBdUYsbUJBQXZGLENBQVAsQ0FENEQ7Ozs7Ozs7OztvQ0FPOUM7QUFDZCxhQUFPLEtBQUssTUFBTCxDQUFZLGFBQVosRUFBUCxDQURjOzs7Ozs7Ozs7a0NBT0Y7QUFDWixhQUFPLEtBQUssTUFBTCxDQUFZLFdBQVosRUFBUCxDQURZOzs7Ozs7Ozs7Z0NBT0Y7QUFDVixhQUFPLEtBQUssTUFBTCxDQUFZLFNBQVosRUFBUCxDQURVOzs7Ozs7Ozs7bUNBT0c7QUFDYixhQUFPLEtBQUssTUFBTCxDQUFZLFlBQVosRUFBUCxDQURhOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzZDQWlCc0M7VUFBakMsa0NBQWlDO1VBQW5CLHdDQUFtQjs7QUFDbkQsYUFBTyxLQUFLLE1BQUwsQ0FBWSxTQUFaLGVBQWtDLEtBQUssYUFBTCxXQUF3QixZQUExRCxFQUEwRSxlQUExRSxDQUFQLENBRG1EOzs7Ozs7Ozs7O3dDQVFNO1VBQTVDLGtDQUE0QztVQUE5Qix3Q0FBOEI7VUFBYiw0QkFBYTs7QUFDekQsWUFBTSxrQ0FBMkIsY0FBM0IsQ0FBTixDQUR5RDs7Ozs7Ozs7Z0NBTS9DLFVBQVU7QUFDcEIsV0FBSyxNQUFMLENBQVksV0FBWixDQUF3QixRQUF4QixFQURvQjs7Ozs7Ozs7O2dEQU9NLFVBQVU7QUFDcEMsYUFBTyxLQUFLLE1BQUwsQ0FBWSwyQkFBWixDQUF3QyxRQUF4QyxDQUFQLENBRG9DOzs7Ozs7Ozs7OEJBTzVCLG1CQUFtQjtBQUMzQixXQUFLLFVBQUwsR0FEMkI7QUFFM0IsVUFBSSxpQkFBSixFQUF1QjtBQUNyQixhQUFLLE1BQUwsQ0FBWSxvQkFBWixDQUFpQyxpQkFBakMsRUFEcUI7T0FBdkI7QUFHQSxXQUFLLE9BQUwsR0FMMkI7Ozs7U0ExR2xCOzs7Ozs7Ozs7UUNqQkc7O0FBUGhCOzs7Ozs7O0FBT08sU0FBUyx5QkFBVCxHQUFxQztBQUMxQyxNQUFJLFNBQVMsMENBQVQsQ0FEc0M7QUFFMUMsTUFBSSxPQUFPLDBCQUFVLE1BQVYsQ0FBaUIsTUFBakIsQ0FBUDs7Ozs7O0FBRnNDLE1BUTFDLENBQUssT0FBTCxHQUFlLFVBQVMsTUFBVCxFQUFpQjtBQUM5QixVQUFNLE9BQU8sR0FBUCxFQUFZO0FBQ2hCLGNBQVEsTUFBUjtBQUNBLFlBQU0sT0FBTyxJQUFQO0FBQ04sZUFBUyxPQUFPLE1BQVAsQ0FBYyxPQUFPLE9BQVAsRUFBZ0I7QUFDckMsd0JBQWdCLGdDQUFoQjtPQURPLENBQVQ7S0FIRixFQU9DLElBUEQsQ0FPTSxVQUFDLFFBQUQsRUFBYztBQUNsQixhQUFPLFNBQVMsSUFBVCxFQUFQLENBRGtCO0tBQWQsQ0FQTixDQVVDLElBVkQsQ0FVTSxPQUFPLFNBQVAsQ0FWTixDQVdDLEtBWEQsQ0FXTyxPQUFPLE9BQVAsQ0FYUCxDQUQ4QjtHQUFqQixDQVIyQjs7QUF1QjFDLFNBQU8sSUFBUCxDQXZCMEM7Q0FBckM7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ0hNOzs7Ozs7Ozs7Ozt5Q0FJVTs7Ozs7Ozt5Q0FJQTs7Ozs7Ozs4Q0FJSzs7Ozs7Ozs7c0NBS1IsT0FBTzs7Ozs7OztvQ0FJVDs7Ozs7Ozs7MENBS00sZ0JBQWdCOzs7U0ExQjNCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNEYixJQUFNLGtCQUFrQjtBQUN0QixlQUFhLFFBQWI7QUFDQSxhQUFXLE1BQVg7QUFDQSxtQkFBaUIsWUFBakI7Q0FISTs7Ozs7O0lBU087Ozs7O0FBSVgsV0FKVyx3QkFJWCxPQUFvRDtRQUF0Qyx5QkFBc0M7UUFBNUIsNkJBQTRCO1FBQWhCLGlDQUFnQjs7MEJBSnpDLDBCQUl5Qzs7QUFDbEQsU0FBSyxRQUFMLEdBQWdCLFFBQWhCLENBRGtEO0FBRWxELFNBQUssVUFBTCxHQUFrQixVQUFsQixDQUZrRDtBQUdsRCxTQUFLLFlBQUwsR0FBb0IsWUFBcEIsQ0FIa0Q7R0FBcEQ7Ozs7Ozs7ZUFKVzs7dUNBYVEsUUFBUTtBQUN6QixVQUFNLGlCQUFpQjtBQUNyQixjQUFNLEtBQUssUUFBTDtBQUNOLGNBQVMsT0FBTyxhQUFQLFdBQTBCLEtBQUssWUFBTCxTQUFxQixLQUFLLFFBQUw7QUFDeEQsaUJBQVMsS0FBSyxXQUFMO09BSEwsQ0FEbUI7QUFNekIsVUFBSSxPQUFPLFdBQVAsRUFBSixFQUEwQjtBQUN4Qix1QkFBZSxRQUFmLEdBQTBCLE9BQU8sV0FBUCxFQUExQixDQUR3QjtPQUExQjtBQUdBLGFBQU87QUFDTCxhQUFLO0FBQ0gsd0NBREc7U0FBTDtPQURGLENBVHlCOzs7Ozs7Ozs7d0JBbUJUO0FBQ2hCLGFBQU8sTUFBUCxDQURnQjs7OztTQWhDUDs7Ozs7Ozs7O0lBMENBOzs7Ozs7O0FBSVgsV0FKVyxxQkFJWCxRQUErQztRQUFqQywwQkFBaUM7UUFBdkIsa0NBQXVCO1FBQVQsb0JBQVM7OzBCQUpwQyx1QkFJb0M7O3VFQUpwQyxrQ0FLSCxFQUFFLDBCQUFGLEVBQWdCLGtCQUFoQixLQUR1Qzs7QUFFN0MsVUFBSyxLQUFMLEdBQWEsS0FBYixDQUY2Qzs7R0FBL0M7Ozs7OztlQUpXOzt3QkFXSTtVQUNMLFFBQVUsS0FBVixNQURLOztBQUViLGFBQU87QUFDTCxvQkFESztPQUFQLENBRmE7Ozs7U0FYSjtFQUE4Qjs7Ozs7Ozs7SUF3QjlCOzs7Ozs7O0FBS1gsV0FMVywrQkFLWCxRQUF5RDtRQUEzQywwQkFBMkM7UUFBakMsa0NBQWlDO1FBQW5CLG9CQUFtQjtRQUFaLDBCQUFZOzswQkFMOUMsaUNBSzhDOzt3RUFMOUMsNENBTUgsRUFBRSxrQkFBRixFQUFZLDBCQUFaLEtBRGlEOztBQUV2RCxXQUFLLEtBQUwsR0FBYSxLQUFiLENBRnVEO0FBR3ZELFdBQUssUUFBTCxHQUFnQixRQUFoQixDQUh1RDs7R0FBekQ7Ozs7Ozs7ZUFMVzs7d0JBY0k7VUFDTCxRQUFvQixLQUFwQixNQURLO1VBQ0UsV0FBYSxLQUFiLFNBREY7O0FBRWIsYUFBTztBQUNMLG9CQURLLEVBQ0Usa0JBREY7T0FBUCxDQUZhOzs7O1NBZEo7RUFBd0M7Ozs7Ozs7SUEwQnhDOzs7Ozs7Ozs7OztpREFJcUQ7VUFBakMsa0NBQWlDO1VBQW5CLG9CQUFtQjtVQUFaLDBCQUFZOztBQUM5RCxhQUFPLGVBQWUsZUFBZixDQUErQjtBQUNwQyxrQkFBVSxnQkFBZ0IsV0FBaEI7QUFDVixrQ0FGb0M7QUFHcEMsb0JBSG9DO0FBSXBDLDBCQUpvQztPQUEvQixDQUFQLENBRDhEOzs7Ozs7OzsrQ0FXWjtVQUF2QixrQ0FBdUI7VUFBVCxvQkFBUzs7QUFDbEQsYUFBTyxlQUFlLGVBQWYsQ0FBK0I7QUFDcEMsa0JBQVUsZ0JBQWdCLFNBQWhCO0FBQ1Ysa0NBRm9DO0FBR3BDLGVBQU8sS0FBUDtBQUNBLGtCQUFVLElBQVY7T0FKSyxDQUFQLENBRGtEOzs7Ozs7OztxREFXTTtVQUF2QixrQ0FBdUI7VUFBVCxvQkFBUzs7QUFDeEQsYUFBTyxlQUFlLGVBQWYsQ0FBK0I7QUFDcEMsa0JBQVUsZ0JBQWdCLGVBQWhCO0FBQ1Ysa0NBRm9DO0FBR3BDLGVBQU8sS0FBUDtBQUNBLGtCQUFVLElBQVY7T0FKSyxDQUFQLENBRHdEOzs7Ozs7OzsyQ0FXVTtVQUEzQywwQkFBMkM7VUFBakMsa0NBQWlDO1VBQW5CLG9CQUFtQjtVQUFaLDBCQUFZOztBQUNsRSxVQUFJLFNBQVMsUUFBVCxFQUFtQjtBQUNyQixlQUFPLElBQUkscUJBQUosQ0FBMEIsRUFBRSxrQkFBRixFQUFZLDBCQUFaLEVBQTBCLE9BQU8sS0FBUCxFQUFwRCxDQUFQLENBRHFCO09BQXZCO0FBR0EsYUFBTyxJQUFJLCtCQUFKLENBQW9DLEVBQUUsa0JBQUYsRUFBWSwwQkFBWixFQUEwQixZQUExQixFQUFpQyxrQkFBakMsRUFBcEMsQ0FBUCxDQUprRTs7OztTQXJDekQ7Ozs7Ozs7Ozs7Ozs7OztzQkN4R0o7Ozs7Ozs7OzttQkFDQTs7Ozs7O21CQUFTOzs7Ozs7Ozs7d0JBQ1Q7Ozs7Ozs7Ozs2QkFDQTs7Ozs7OzZCQUFrQzs7Ozs7Ozs7Ozs7Ozs7QUNIM0M7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7SUFNYTs7Ozs7OztBQUlYLFdBSlcsV0FJWCxPQUFrSjtRQUFwSSxxQkFBb0k7UUFBNUgsNkRBQTRIO1FBQWhHLDZCQUFnRzs2QkFBcEYsU0FBb0Y7UUFBcEYseUNBQVcscUJBQXlFO3FDQUFuRSx5QkFBbUU7UUFBbkUsZ0pBQW1FOzswQkFKdkksYUFJdUk7O0FBQ2hKLFFBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixHQUFNO0FBQzlCLFVBQU0sUUFBUSxNQUFLLFFBQUwsRUFBUixDQUR3QjtBQUU5QixVQUFNLFlBQVksMEJBQWUsbUJBQWYsQ0FBbUM7QUFDbkQsc0JBQWMsMEJBQWQ7QUFDQSxvQkFGbUQ7T0FBbkMsQ0FBWixDQUZ3QjtBQU05QixhQUFPLFNBQVAsQ0FOOEI7S0FBTjs7OztBQURzSDt1RUFKdkksd0JBZ0JILEVBQUUsY0FBRixFQUFXLHNCQUFYLEVBQXVCLG9DQUF2QixFQUEwQyxrQkFBMUMsS0FaMEk7O0FBYWhKLFFBQU0sd0JBQXdCLFNBQXhCLHFCQUF3QixRQUFvQztVQUFqQyxnQ0FBaUM7VUFBcEIsc0JBQW9CO1VBQVosb0JBQVk7O0FBQ2hFLGNBQVEsS0FBUixDQUFjLG9DQUFkLEVBQW9ELEVBQUUsd0JBQUYsRUFBZSxjQUFmLEVBQXVCLFlBQXZCLEVBQXBELEVBRGdFOztBQUdoRSxVQUFJLEtBQUosRUFBVztBQUNULGNBQUssUUFBTCxDQUFjLEdBQWQsQ0FBa0IsRUFBRSxZQUFGLEVBQWxCLEVBRFM7T0FBWDtLQUg0QixDQWJrSDtBQW9CaEosUUFBTSxvQkFBb0IsU0FBcEIsaUJBQW9CLENBQUMsS0FBRCxFQUFXO0FBQ25DLGNBQVEsS0FBUixDQUFjLGdDQUFkLEVBQWdELEtBQWhELEVBRG1DO0tBQVgsQ0FwQnNIO0FBdUJoSixVQUFLLDJCQUFMLENBQWlDLEVBQUUsb0NBQUYsRUFBcUIsNENBQXJCLEVBQWpDOzs7OztBQXZCZ0osU0E0QmhKLENBQUssUUFBTCxHQUFnQixJQUFJLHdCQUFKLEVBQWhCLENBNUJnSjs7R0FBbEo7Ozs7OztlQUpXOzsrQkFxQ0E7QUFDVCxhQUFPLEtBQUssUUFBTCxDQUFjLEdBQWQsRUFBUCxDQURTOzs7O1NBckNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMYixJQUFNLHFCQUFxQixnQkFBckI7Ozs7Ozs7SUFNTzs7Ozs7QUFJWCxXQUpXLGdDQUlYLEdBQStDO3FFQUFKLGtCQUFJOzt3QkFBakMsSUFBaUM7UUFBakMsK0JBQU0sOEJBQTJCOzswQkFKcEMsa0NBSW9DOzs7Ozs7QUFLN0MsU0FBSyxHQUFMLEdBQVcsR0FBWCxDQUw2QztHQUEvQzs7Ozs7OztlQUpXOzswQkFlTDs7Ozs7OzsrQkFJUztVQUFULG9CQUFTOzs7O1NBbkJKOzs7Ozs7Ozs7SUEwQkE7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBS0w7QUFDSixhQUFPLGFBQWEsT0FBYixDQUFxQixLQUFLLEdBQUwsQ0FBNUIsQ0FESTs7Ozs7Ozs7K0JBTVM7VUFBVCxvQkFBUzs7QUFDYixtQkFBYSxPQUFiLENBQXFCLEtBQUssR0FBTCxFQUFVLEtBQS9CLEVBRGE7Ozs7U0FYSjtFQUE2Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5Qm5ELElBQU0sNEJBQVUsU0FBVixPQUFVLENBQUMsSUFBRCxFQUFVO0FBQy9CLE1BQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsS0FBZ0IsS0FBSyxNQUFMLENBQW5DLENBRHlCO0FBRS9CLFNBQU8sS0FBSyxLQUFMLENBQVAsQ0FGK0I7Q0FBVjs7Ozs7OztBQVVoQixJQUFNLGtDQUFhLFNBQWIsVUFBYSxDQUFDLEdBQUQsRUFBUztBQUNqQyxTQUFPLE1BQU0sR0FBTixFQUNKLElBREksQ0FDQyxVQUFDLFFBQUQsRUFBYztBQUNsQixXQUFPLFNBQVMsSUFBVCxFQUFQLENBRGtCO0dBQWQsQ0FERCxDQUlKLElBSkksQ0FJQyxnQkFBaUI7UUFBZCx1QkFBYzs7QUFDckIsV0FBTyxPQUFQLENBRHFCO0dBQWpCLENBSlIsQ0FEaUM7Q0FBVDs7Ozs7OztJQWNiOzs7Ozs7O0FBSVgsV0FKVyxzQkFJWCxHQUEwQjtRQUFkLGdFQUFVLGtCQUFJOzswQkFKZix3QkFJZTs7dUVBSmYsbUNBS0gsVUFEa0I7O0FBRXhCLFVBQUssSUFBTCxHQUFZLHFCQUFaLENBRndCOztHQUExQjs7U0FKVztFQUErQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9DYWxsYmFja1BvbGxpbmdUcmFuc3BvcnQnKSxcbiAgQ29tZXREOiByZXF1aXJlKCcuL2xpYi9Db21ldEQnKSxcbiAgTG9uZ1BvbGxpbmdUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL0xvbmdQb2xsaW5nVHJhbnNwb3J0JyksXG4gIFJlcXVlc3RUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL1JlcXVlc3RUcmFuc3BvcnQnKSxcbiAgVHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9UcmFuc3BvcnQnKSxcbiAgVHJhbnNwb3J0UmVnaXN0cnk6IHJlcXVpcmUoJy4vbGliL1RyYW5zcG9ydFJlZ2lzdHJ5JyksXG4gIFV0aWxzOiByZXF1aXJlKCcuL2xpYi9VdGlscycpLFxuICBXZWJTb2NrZXRUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL1dlYlNvY2tldFRyYW5zcG9ydCcpXG59XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKTtcbnZhciBSZXF1ZXN0VHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9SZXF1ZXN0VHJhbnNwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgUmVxdWVzdFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIF9zZWxmLmpzb25wU2VuZCA9IGZ1bmN0aW9uKHBhY2tldCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmFpbFRyYW5zcG9ydEZuKGVudmVsb3BlLCByZXF1ZXN0LCB4KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCAnZXJyb3InLCB4KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIE1pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlciBoYXMgYSAyMDgzIFVSTCBtYXggbGVuZ3RoXG4gICAgICAgIC8vIFdlIG11c3QgZW5zdXJlIHRoYXQgd2Ugc3RheSB3aXRoaW4gdGhhdCBsZW5ndGhcbiAgICAgICAgdmFyIHN0YXJ0ID0gMDtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aDtcbiAgICAgICAgdmFyIGxlbmd0aHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIEVuY29kZSB0aGUgbWVzc2FnZXMgYmVjYXVzZSBhbGwgYnJhY2tldHMsIHF1b3RlcywgY29tbWFzLCBjb2xvbnMsIGV0Y1xuICAgICAgICAgICAgLy8gcHJlc2VudCBpbiB0aGUgSlNPTiB3aWxsIGJlIFVSTCBlbmNvZGVkLCB0YWtpbmcgbWFueSBtb3JlIGNoYXJhY3RlcnNcbiAgICAgICAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoZW52ZWxvcGUubWVzc2FnZXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgbGVuZ3RoKSk7XG4gICAgICAgICAgICB2YXIgdXJsTGVuZ3RoID0gZW52ZWxvcGUudXJsLmxlbmd0aCArIGVuY29kZVVSSShqc29uKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIHZhciBtYXhMZW5ndGggPSB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhVUklMZW5ndGg7XG4gICAgICAgICAgICBpZiAodXJsTGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9ICdCYXlldXggbWVzc2FnZSB0b28gYmlnICgnICsgdXJsTGVuZ3RoICsgJyBieXRlcywgbWF4IGlzICcgKyBtYXhMZW5ndGggKyAnKSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdmb3IgdHJhbnNwb3J0ICcgKyB0aGlzLmdldFR5cGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KF9mYWlsVHJhbnNwb3J0Rm4uY2FsbCh0aGlzLCBlbnZlbG9wZSwgcmVxdWVzdCwgeCksIDApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLS1sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxlbmd0aHMucHVzaChsZW5ndGgpO1xuICAgICAgICAgICAgc3RhcnQgKz0gbGVuZ3RoO1xuICAgICAgICAgICAgbGVuZ3RoID0gZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoIC0gc3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIZXJlIHdlIGFyZSBzdXJlIHRoYXQgdGhlIG1lc3NhZ2VzIGNhbiBiZSBzZW50IHdpdGhpbiB0aGUgVVJMIGxpbWl0XG5cbiAgICAgICAgdmFyIGVudmVsb3BlVG9TZW5kID0gZW52ZWxvcGU7XG4gICAgICAgIGlmIChsZW5ndGhzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhciBiZWdpbiA9IDA7XG4gICAgICAgICAgICB2YXIgZW5kID0gbGVuZ3Roc1swXTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NwbGl0JywgZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoLCAnbWVzc2FnZXMgaW50bycsIGxlbmd0aHMuam9pbignICsgJykpO1xuICAgICAgICAgICAgZW52ZWxvcGVUb1NlbmQgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIGVudmVsb3BlKTtcbiAgICAgICAgICAgIGVudmVsb3BlVG9TZW5kLm1lc3NhZ2VzID0gZW52ZWxvcGUubWVzc2FnZXMuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZC5vblN1Y2Nlc3MgPSBlbnZlbG9wZS5vblN1Y2Nlc3M7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZC5vbkZhaWx1cmUgPSBlbnZlbG9wZS5vbkZhaWx1cmU7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuZ3Rocy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0RW52ZWxvcGUgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIGVudmVsb3BlKTtcbiAgICAgICAgICAgICAgICBiZWdpbiA9IGVuZDtcbiAgICAgICAgICAgICAgICBlbmQgKz0gbGVuZ3Roc1tpXTtcbiAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUubWVzc2FnZXMgPSBlbnZlbG9wZS5tZXNzYWdlcy5zbGljZShiZWdpbiwgZW5kKTtcbiAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUub25TdWNjZXNzID0gZW52ZWxvcGUub25TdWNjZXNzO1xuICAgICAgICAgICAgICAgIG5leHRFbnZlbG9wZS5vbkZhaWx1cmUgPSBlbnZlbG9wZS5vbkZhaWx1cmU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKG5leHRFbnZlbG9wZSwgcmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzZW5kaW5nIHJlcXVlc3QnLCByZXF1ZXN0LmlkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZVRvU2VuZCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBzYW1lU3RhY2sgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qc29ucFNlbmQoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogdGhpcyxcbiAgICAgICAgICAgICAgICB1cmw6IGVudmVsb3BlVG9TZW5kLnVybCxcbiAgICAgICAgICAgICAgICBzeW5jOiBlbnZlbG9wZVRvU2VuZC5zeW5jLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLnJlcXVlc3RIZWFkZXJzLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlVG9TZW5kLm1lc3NhZ2VzKSxcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVkID0gc2VsZi5jb252ZXJ0VG9NZXNzYWdlcyhyZXNwb25zZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwQ29kZTogMjA0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0U3VjY2VzcyhlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwgcmVjZWl2ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1Zyh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24ocmVhc29uLCBleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogZXhjZXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1lU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2FtZVN0YWNrID0gZmFsc2U7XG4gICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHh4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwidmFyIFRyYW5zcG9ydFJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnRSZWdpc3RyeScpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJylcbi8qKlxuICogVGhlIGNvbnN0cnVjdG9yIGZvciBhIENvbWV0RCBvYmplY3QsIGlkZW50aWZpZWQgYnkgYW4gb3B0aW9uYWwgbmFtZS5cbiAqIFRoZSBkZWZhdWx0IG5hbWUgaXMgdGhlIHN0cmluZyAnZGVmYXVsdCcuXG4gKiBJbiB0aGUgcmFyZSBjYXNlIGEgcGFnZSBuZWVkcyBtb3JlIHRoYW4gb25lIEJheWV1eCBjb252ZXJzYXRpb24sXG4gKiBhIG5ldyBpbnN0YW5jZSBjYW4gYmUgY3JlYXRlZCB2aWE6XG4gKiA8cHJlPlxuICogdmFyIGJheWV1eFVybDIgPSAuLi47XG4gKlxuICogLy8gRG9qbyBzdHlsZVxuICogdmFyIGNvbWV0ZDIgPSBuZXcgZG9qb3guQ29tZXREKCdhbm90aGVyX29wdGlvbmFsX25hbWUnKTtcbiAqXG4gKiAvLyBqUXVlcnkgc3R5bGVcbiAqIHZhciBjb21ldGQyID0gbmV3ICQuQ29tZXREKCdhbm90aGVyX29wdGlvbmFsX25hbWUnKTtcbiAqXG4gKiBjb21ldGQyLmluaXQoe3VybDogYmF5ZXV4VXJsMn0pO1xuICogPC9wcmU+XG4gKiBAcGFyYW0gbmFtZSB0aGUgb3B0aW9uYWwgbmFtZSBvZiB0aGlzIGNvbWV0ZCBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDb21ldEQobmFtZSkge1xuICAgIHZhciBfY29tZXRkID0gdGhpcztcbiAgICB2YXIgX25hbWUgPSBuYW1lIHx8ICdkZWZhdWx0JztcbiAgICB2YXIgX2Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgdmFyIF90cmFuc3BvcnRzID0gbmV3IFRyYW5zcG9ydFJlZ2lzdHJ5KCk7XG4gICAgdmFyIF90cmFuc3BvcnQ7XG4gICAgdmFyIF9zdGF0dXMgPSAnZGlzY29ubmVjdGVkJztcbiAgICB2YXIgX21lc3NhZ2VJZCA9IDA7XG4gICAgdmFyIF9jbGllbnRJZCA9IG51bGw7XG4gICAgdmFyIF9iYXRjaCA9IDA7XG4gICAgdmFyIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICB2YXIgX2ludGVybmFsQmF0Y2ggPSBmYWxzZTtcbiAgICB2YXIgX2xpc3RlbmVycyA9IHt9O1xuICAgIHZhciBfYmFja29mZiA9IDA7XG4gICAgdmFyIF9zY2hlZHVsZWRTZW5kID0gbnVsbDtcbiAgICB2YXIgX2V4dGVuc2lvbnMgPSBbXTtcbiAgICB2YXIgX2FkdmljZSA9IHt9O1xuICAgIHZhciBfaGFuZHNoYWtlUHJvcHM7XG4gICAgdmFyIF9oYW5kc2hha2VDYWxsYmFjaztcbiAgICB2YXIgX2NhbGxiYWNrcyA9IHt9O1xuICAgIHZhciBfcmVtb3RlQ2FsbHMgPSB7fTtcbiAgICB2YXIgX3JlZXN0YWJsaXNoID0gZmFsc2U7XG4gICAgdmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB2YXIgX3VuY29ubmVjdFRpbWUgPSAwO1xuICAgIHZhciBfaGFuZHNoYWtlTWVzc2FnZXMgPSAwO1xuICAgIHZhciBfY29uZmlnID0ge1xuICAgICAgICBwcm90b2NvbDogbnVsbCxcbiAgICAgICAgc3RpY2t5UmVjb25uZWN0OiB0cnVlLFxuICAgICAgICBjb25uZWN0VGltZW91dDogMCxcbiAgICAgICAgbWF4Q29ubmVjdGlvbnM6IDIsXG4gICAgICAgIGJhY2tvZmZJbmNyZW1lbnQ6IDEwMDAsXG4gICAgICAgIG1heEJhY2tvZmY6IDYwMDAwLFxuICAgICAgICBsb2dMZXZlbDogJ2luZm8nLFxuICAgICAgICByZXZlcnNlSW5jb21pbmdFeHRlbnNpb25zOiB0cnVlLFxuICAgICAgICBtYXhOZXR3b3JrRGVsYXk6IDEwMDAwLFxuICAgICAgICByZXF1ZXN0SGVhZGVyczoge30sXG4gICAgICAgIGFwcGVuZE1lc3NhZ2VUeXBlVG9VUkw6IHRydWUsXG4gICAgICAgIGF1dG9CYXRjaDogZmFsc2UsXG4gICAgICAgIHVybHM6IHt9LFxuICAgICAgICBtYXhVUklMZW5ndGg6IDIwMDAsXG4gICAgICAgIGFkdmljZToge1xuICAgICAgICAgICAgdGltZW91dDogNjAwMDAsXG4gICAgICAgICAgICBpbnRlcnZhbDogMCxcbiAgICAgICAgICAgIHJlY29ubmVjdDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWF4SW50ZXJ2YWw6IDBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmllbGRWYWx1ZShvYmplY3QsIG5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3RbbmFtZV07XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNaXhlcyBpbiB0aGUgZ2l2ZW4gb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXQgb2JqZWN0IGJ5IGNvcHlpbmcgdGhlIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIGRlZXAgaWYgdGhlIGNvcHkgbXVzdCBiZSBkZWVwXG4gICAgICogQHBhcmFtIHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdFxuICAgICAqIEBwYXJhbSBvYmplY3RzIHRoZSBvYmplY3RzIHdob3NlIHByb3BlcnRpZXMgYXJlIGNvcGllZCBpbnRvIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICB0aGlzLl9taXhpbiA9IGZ1bmN0aW9uKGRlZXAsIHRhcmdldCwgb2JqZWN0cykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGFyZ2V0IHx8IHt9O1xuXG4gICAgICAgIC8vIFNraXAgZmlyc3QgMiBwYXJhbWV0ZXJzIChkZWVwIGFuZCB0YXJnZXQpLCBhbmQgbG9vcCBvdmVyIHRoZSBvdGhlcnNcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICAgIGlmIChvYmplY3QgPT09IHVuZGVmaW5lZCB8fCBvYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSBfZmllbGRWYWx1ZShvYmplY3QsIHByb3BOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmcgPSBfZmllbGRWYWx1ZShyZXN1bHQsIHByb3BOYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBpbmZpbml0ZSBsb29wc1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3QgbWl4aW4gdW5kZWZpbmVkIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwICYmIHR5cGVvZiBwcm9wID09PSAnb2JqZWN0JyAmJiBwcm9wICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BOYW1lXSA9IHRoaXMuX21peGluKGRlZXAsIHRhcmcgaW5zdGFuY2VvZiBBcnJheSA/IHRhcmcgOiBbXSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2UgPSB0eXBlb2YgdGFyZyA9PT0gJ29iamVjdCcgJiYgISh0YXJnIGluc3RhbmNlb2YgQXJyYXkpID8gdGFyZyA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtwcm9wTmFtZV0gPSB0aGlzLl9taXhpbihkZWVwLCBzb3VyY2UsIHByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BOYW1lXSA9IHByb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNTdHJpbmcodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmlzU3RyaW5nKHZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3plcm9QYWQodmFsdWUsIGxlbmd0aCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgICAgIHdoaWxlICgtLWxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSBNYXRoLnBvdygxMCwgbGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ICs9ICcwJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gdmFsdWU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2xvZyhsZXZlbCwgYXJncykge1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBjb25zb2xlKSB7XG4gICAgICAgICAgICB2YXIgbG9nZ2VyID0gY29uc29sZVtsZXZlbF07XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24obG9nZ2VyKSkge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIFtdLnNwbGljZS5jYWxsKGFyZ3MsIDAsIDAsIF96ZXJvUGFkKG5vdy5nZXRIb3VycygpLCAyKSArICc6JyArIF96ZXJvUGFkKG5vdy5nZXRNaW51dGVzKCksIDIpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIF96ZXJvUGFkKG5vdy5nZXRTZWNvbmRzKCksIDIpICsgJy4nICsgX3plcm9QYWQobm93LmdldE1pbGxpc2Vjb25kcygpLCAzKSk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fd2FybiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfbG9nKCd3YXJuJywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5faW5mbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2NvbmZpZy5sb2dMZXZlbCAhPT0gJ3dhcm4nKSB7XG4gICAgICAgICAgICBfbG9nKCdpbmZvJywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2NvbmZpZy5sb2dMZXZlbCA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgICAgX2xvZygnZGVidWcnLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9zcGxpdFVSTCh1cmwpIHtcbiAgICAgICAgLy8gWzFdID0gcHJvdG9jb2w6Ly8sXG4gICAgICAgIC8vIFsyXSA9IGhvc3Q6cG9ydCxcbiAgICAgICAgLy8gWzNdID0gaG9zdCxcbiAgICAgICAgLy8gWzRdID0gSVB2Nl9ob3N0LFxuICAgICAgICAvLyBbNV0gPSBJUHY0X2hvc3QsXG4gICAgICAgIC8vIFs2XSA9IDpwb3J0LFxuICAgICAgICAvLyBbN10gPSBwb3J0LFxuICAgICAgICAvLyBbOF0gPSB1cmksXG4gICAgICAgIC8vIFs5XSA9IHJlc3QgKHF1ZXJ5IC8gZnJhZ21lbnQpXG4gICAgICAgIHJldHVybiAvKF5odHRwcz86XFwvXFwvKT8oKChcXFtbXlxcXV0rXFxdKXwoW146XFwvXFw/I10rKSkoOihcXGQrKSk/KT8oW15cXD8jXSopKC4qKT8vLmV4ZWModXJsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGhvc3RBbmRQb3J0IGlzIGNyb3NzIGRvbWFpbi5cbiAgICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBjaGVja3MgYWdhaW5zdCB3aW5kb3cubG9jYXRpb24uaG9zdFxuICAgICAqIGJ1dCB0aGlzIGZ1bmN0aW9uIGNhbiBiZSBvdmVycmlkZGVuIHRvIG1ha2UgaXQgd29yayBpbiBub24tYnJvd3NlclxuICAgICAqIGVudmlyb25tZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBob3N0QW5kUG9ydCB0aGUgaG9zdCBhbmQgcG9ydCBpbiBmb3JtYXQgaG9zdDpwb3J0XG4gICAgICogQHJldHVybiB3aGV0aGVyIHRoZSBnaXZlbiBob3N0QW5kUG9ydCBpcyBjcm9zcyBkb21haW5cbiAgICAgKi9cbiAgICB0aGlzLl9pc0Nyb3NzRG9tYWluID0gZnVuY3Rpb24oaG9zdEFuZFBvcnQpIHtcbiAgICAgICAgcmV0dXJuIGhvc3RBbmRQb3J0ICYmIGhvc3RBbmRQb3J0ICE9PSB3aW5kb3cubG9jYXRpb24uaG9zdDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbmZpZ3VyZShjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdDb25maWd1cmluZyBjb21ldGQgb2JqZWN0IHdpdGgnLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgLy8gU3VwcG9ydCBvbGQgc3R5bGUgcGFyYW0sIHdoZXJlIG9ubHkgdGhlIEJheWV1eCBzZXJ2ZXIgVVJMIHdhcyBwYXNzZWRcbiAgICAgICAgaWYgKF9pc1N0cmluZyhjb25maWd1cmF0aW9uKSkge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IHsgdXJsOiBjb25maWd1cmF0aW9uIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBfY29uZmlnID0gX2NvbWV0ZC5fbWl4aW4oZmFsc2UsIF9jb25maWcsIGNvbmZpZ3VyYXRpb24pO1xuXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgdGhyb3cgJ01pc3NpbmcgcmVxdWlyZWQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgXFwndXJsXFwnIHNwZWNpZnlpbmcgdGhlIEJheWV1eCBzZXJ2ZXIgVVJMJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIGNyb3NzIGRvbWFpbi5cbiAgICAgICAgdmFyIHVybFBhcnRzID0gX3NwbGl0VVJMKHVybCk7XG4gICAgICAgIHZhciBob3N0QW5kUG9ydCA9IHVybFBhcnRzWzJdO1xuICAgICAgICB2YXIgdXJpID0gdXJsUGFydHNbOF07XG4gICAgICAgIHZhciBhZnRlclVSSSA9IHVybFBhcnRzWzldO1xuICAgICAgICBfY3Jvc3NEb21haW4gPSBfY29tZXRkLl9pc0Nyb3NzRG9tYWluKGhvc3RBbmRQb3J0KTtcblxuICAgICAgICAvLyBDaGVjayBpZiBhcHBlbmRpbmcgZXh0cmEgcGF0aCBpcyBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCkge1xuICAgICAgICAgICAgaWYgKGFmdGVyVVJJICE9PSB1bmRlZmluZWQgJiYgYWZ0ZXJVUkkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0FwcGVuZGluZyBtZXNzYWdlIHR5cGUgdG8gVVJJICcgKyB1cmkgKyBhZnRlclVSSSArICcgaXMgbm90IHN1cHBvcnRlZCwgZGlzYWJsaW5nIFxcJ2FwcGVuZE1lc3NhZ2VUeXBlVG9VUkxcXCcgY29uZmlndXJhdGlvbicpO1xuICAgICAgICAgICAgICAgIF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJpU2VnbWVudHMgPSB1cmkuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFNlZ21lbnRJbmRleCA9IHVyaVNlZ21lbnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHVyaS5tYXRjaCgvXFwvJC8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50SW5kZXggLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVyaVNlZ21lbnRzW2xhc3RTZWdtZW50SW5kZXhdLmluZGV4T2YoJy4nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnkgbGlrZWx5IHRoZSBDb21ldEQgc2VydmxldCdzIFVSTCBwYXR0ZXJuIGlzIG1hcHBlZCB0byBhbiBleHRlbnNpb24sIHN1Y2ggYXMgKi5jb21ldGRcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQgd2lsbCBiZSBkaWZmaWN1bHQgdG8gYWRkIHRoZSBleHRyYSBwYXRoIGluIHRoaXMgY2FzZVxuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdBcHBlbmRpbmcgbWVzc2FnZSB0eXBlIHRvIFVSSSAnICsgdXJpICsgJyBpcyBub3Qgc3VwcG9ydGVkLCBkaXNhYmxpbmcgXFwnYXBwZW5kTWVzc2FnZVR5cGVUb1VSTFxcJyBjb25maWd1cmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW3N1YnNjcmlwdGlvbi5jaGFubmVsXTtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zICYmIHN1YnNjcmlwdGlvbnNbc3Vic2NyaXB0aW9uLmlkXSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbi5pZF07XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlbW92ZWQnLCBzdWJzY3JpcHRpb24ubGlzdGVuZXIgPyAnbGlzdGVuZXInIDogJ3N1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uICYmICFzdWJzY3JpcHRpb24ubGlzdGVuZXIpIHtcbiAgICAgICAgICAgIF9yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NsZWFyU3Vic2NyaXB0aW9ucygpIHtcbiAgICAgICAgZm9yICh2YXIgY2hhbm5lbCBpbiBfbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAoX2xpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShjaGFubmVsKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tjaGFubmVsXTtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZW1vdmVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc2V0U3RhdHVzKG5ld1N0YXR1cykge1xuICAgICAgICBpZiAoX3N0YXR1cyAhPT0gbmV3U3RhdHVzKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU3RhdHVzJywgX3N0YXR1cywgJy0+JywgbmV3U3RhdHVzKTtcbiAgICAgICAgICAgIF9zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaXNEaXNjb25uZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiBfc3RhdHVzID09PSAnZGlzY29ubmVjdGluZycgfHwgX3N0YXR1cyA9PT0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25leHRNZXNzYWdlSWQoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSArK19tZXNzYWdlSWQ7XG4gICAgICAgIHJldHVybiAnJyArIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFeHRlbnNpb24oc2NvcGUsIGNhbGxiYWNrLCBuYW1lLCBtZXNzYWdlLCBvdXRnb2luZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoc2NvcGUsIG1lc3NhZ2UpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25FeHRlbnNpb25FeGNlcHRpb247XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgZXh0ZW5zaW9uIGV4Y2VwdGlvbiBoYW5kbGVyJywgbmFtZSwgeCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIHgsIG5hbWUsIG91dGdvaW5nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICh4eCkge1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBleHRlbnNpb24gZXhjZXB0aW9uIGhhbmRsZXInLCBuYW1lLCB4eCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBleHRlbnNpb24nLCBuYW1lLCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FwcGx5SW5jb21pbmdFeHRlbnNpb25zKG1lc3NhZ2UpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IF9jb25maWcucmV2ZXJzZUluY29taW5nRXh0ZW5zaW9ucyA/IF9leHRlbnNpb25zLmxlbmd0aCAtIDEgLSBpIDogaTtcbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpbmRleF07XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBleHRlbnNpb24uZXh0ZW5zaW9uLmluY29taW5nO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBfYXBwbHlFeHRlbnNpb24oZXh0ZW5zaW9uLmV4dGVuc2lvbiwgY2FsbGJhY2ssIGV4dGVuc2lvbi5uYW1lLCBtZXNzYWdlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gbWVzc2FnZSA6IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlPdXRnb2luZ0V4dGVuc2lvbnMobWVzc2FnZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZXh0ZW5zaW9uLmV4dGVuc2lvbi5vdXRnb2luZztcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gX2FwcGx5RXh0ZW5zaW9uKGV4dGVuc2lvbi5leHRlbnNpb24sIGNhbGxiYWNrLCBleHRlbnNpb24ubmFtZSwgbWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gbWVzc2FnZSA6IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5KGNoYW5uZWwsIG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW2NoYW5uZWxdO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucyAmJiBzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIC8vIFN1YnNjcmlwdGlvbnMgbWF5IGNvbWUgYW5kIGdvLCBzbyB0aGUgYXJyYXkgbWF5IGhhdmUgJ2hvbGVzJ1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5jYWxsYmFjay5jYWxsKHN1YnNjcmlwdGlvbi5zY29wZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vbkxpc3RlbmVyRXhjZXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIGxpc3RlbmVyIGV4Y2VwdGlvbiBoYW5kbGVyJywgc3Vic2NyaXB0aW9uLCB4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoX2NvbWV0ZCwgeCwgc3Vic2NyaXB0aW9uLCBzdWJzY3JpcHRpb24ubGlzdGVuZXIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGxpc3RlbmVyIGV4Y2VwdGlvbiBoYW5kbGVyJywgc3Vic2NyaXB0aW9uLCB4eCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBsaXN0ZW5lcicsIHN1YnNjcmlwdGlvbiwgbWVzc2FnZSwgeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5TGlzdGVuZXJzKGNoYW5uZWwsIG1lc3NhZ2UpIHtcbiAgICAgICAgLy8gTm90aWZ5IGRpcmVjdCBsaXN0ZW5lcnNcbiAgICAgICAgX25vdGlmeShjaGFubmVsLCBtZXNzYWdlKTtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIGdsb2JiaW5nIGxpc3RlbmVyc1xuICAgICAgICB2YXIgY2hhbm5lbFBhcnRzID0gY2hhbm5lbC5zcGxpdCgnLycpO1xuICAgICAgICB2YXIgbGFzdCA9IGNoYW5uZWxQYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gbGFzdDsgaSA+IDA7IC0taSkge1xuICAgICAgICAgICAgdmFyIGNoYW5uZWxQYXJ0ID0gY2hhbm5lbFBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJy8nKSArICcvKic7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIG5vdGlmeSAvZm9vLyogaWYgdGhlIGNoYW5uZWwgaXMgL2Zvby9iYXIvYmF6LFxuICAgICAgICAgICAgLy8gc28gd2Ugc3RvcCBhdCB0aGUgZmlyc3Qgbm9uIHJlY3Vyc2l2ZSBnbG9iYmluZ1xuICAgICAgICAgICAgaWYgKGkgPT09IGxhc3QpIHtcbiAgICAgICAgICAgICAgICBfbm90aWZ5KGNoYW5uZWxQYXJ0LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgcmVjdXJzaXZlIGdsb2JiZXIgYW5kIG5vdGlmeVxuICAgICAgICAgICAgY2hhbm5lbFBhcnQgKz0gJyonO1xuICAgICAgICAgICAgX25vdGlmeShjaGFubmVsUGFydCwgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY2FuY2VsRGVsYXllZFNlbmQoKSB7XG4gICAgICAgIGlmIChfc2NoZWR1bGVkU2VuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KF9zY2hlZHVsZWRTZW5kKTtcbiAgICAgICAgfVxuICAgICAgICBfc2NoZWR1bGVkU2VuZCA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2RlbGF5ZWRTZW5kKG9wZXJhdGlvbiwgZGVsYXkpIHtcbiAgICAgICAgX2NhbmNlbERlbGF5ZWRTZW5kKCk7XG4gICAgICAgIHZhciB0aW1lID0gX2FkdmljZS5pbnRlcnZhbCArIGRlbGF5O1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnRnVuY3Rpb24gc2NoZWR1bGVkIGluJywgdGltZSwgJ21zLCBpbnRlcnZhbCA9JywgX2FkdmljZS5pbnRlcnZhbCwgJ2JhY2tvZmYgPScsIF9iYWNrb2ZmLCBvcGVyYXRpb24pO1xuICAgICAgICBfc2NoZWR1bGVkU2VuZCA9IFV0aWxzLnNldFRpbWVvdXQoX2NvbWV0ZCwgb3BlcmF0aW9uLCB0aW1lKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkZWQgdG8gYnJlYWsgY3ljbGljIGRlcGVuZGVuY2llcyBiZXR3ZWVuIGZ1bmN0aW9uIGRlZmluaXRpb25zXG4gICAgdmFyIF9oYW5kbGVNZXNzYWdlcztcbiAgICB2YXIgX2hhbmRsZUZhaWx1cmU7XG5cbiAgICAvKipcbiAgICAgKiBEZWxpdmVycyB0aGUgbWVzc2FnZXMgdG8gdGhlIENvbWV0RCBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gc3luYyB3aGV0aGVyIHRoZSBzZW5kIGlzIHN5bmNocm9ub3VzXG4gICAgICogQHBhcmFtIG1lc3NhZ2VzIHRoZSBhcnJheSBvZiBtZXNzYWdlcyB0byBzZW5kXG4gICAgICogQHBhcmFtIG1ldGFDb25uZWN0IHRydWUgaWYgdGhpcyBzZW5kIGlzIG9uIC9tZXRhL2Nvbm5lY3RcbiAgICAgKiBAcGFyYW0gZXh0cmFQYXRoIGFuIGV4dHJhIHBhdGggdG8gYXBwZW5kIHRvIHRoZSBCYXlldXggc2VydmVyIFVSTFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9zZW5kKHN5bmMsIG1lc3NhZ2VzLCBtZXRhQ29ubmVjdCwgZXh0cmFQYXRoKSB7XG4gICAgICAgIC8vIFdlIG11c3QgYmUgc3VyZSB0aGF0IHRoZSBtZXNzYWdlcyBoYXZlIGEgY2xpZW50SWQuXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IGd1YXJhbnRlZWQgc2luY2UgdGhlIGhhbmRzaGFrZSBtYXkgdGFrZSB0aW1lIHRvIHJldHVyblxuICAgICAgICAvLyAoYW5kIGhlbmNlIHRoZSBjbGllbnRJZCBpcyBub3Qga25vd24geWV0KSBhbmQgdGhlIGFwcGxpY2F0aW9uXG4gICAgICAgIC8vIG1heSBjcmVhdGUgb3RoZXIgbWVzc2FnZXMuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICB2YXIgbWVzc2FnZUlkID0gbWVzc2FnZS5pZDtcblxuICAgICAgICAgICAgaWYgKF9jbGllbnRJZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuY2xpZW50SWQgPSBfY2xpZW50SWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfYXBwbHlPdXRnb2luZ0V4dGVuc2lvbnMobWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkICYmIG1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBFeHRlbnNpb25zIG1heSBoYXZlIG1vZGlmaWVkIHRoZSBtZXNzYWdlIGlkLCBidXQgd2UgbmVlZCB0byBvd24gaXQuXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5pZCA9IG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1tpXSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfY2FsbGJhY2tzW21lc3NhZ2VJZF07XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKTtcbiAgICAgICAgaWYgKF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCkge1xuICAgICAgICAgICAgLy8gSWYgdXJsIGRvZXMgbm90IGVuZCB3aXRoICcvJywgdGhlbiBhcHBlbmQgaXRcbiAgICAgICAgICAgIGlmICghdXJsLm1hdGNoKC9cXC8kLykpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXh0cmFQYXRoKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsICsgZXh0cmFQYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVudmVsb3BlID0ge1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBzeW5jOiBzeW5jLFxuICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbihyY3ZkTWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBfaGFuZGxlTWVzc2FnZXMuY2FsbChfY29tZXRkLCByY3ZkTWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBoYW5kbGluZyBvZiBtZXNzYWdlcycsIHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkZhaWx1cmU6IGZ1bmN0aW9uKGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF9jb21ldGQuZ2V0VHJhbnNwb3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuY29ubmVjdGlvblR5cGUgPSB0cmFuc3BvcnQgPyB0cmFuc3BvcnQuZ2V0VHlwZSgpIDogXCJ1bmtub3duXCI7XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kbGVGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBoYW5kbGluZyBvZiBmYWlsdXJlJywgeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU2VuZCcsIGVudmVsb3BlKTtcbiAgICAgICAgX3RyYW5zcG9ydC5zZW5kKGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3F1ZXVlU2VuZChtZXNzYWdlKSB7XG4gICAgICAgIGlmIChfYmF0Y2ggPiAwIHx8IF9pbnRlcm5hbEJhdGNoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfbWVzc2FnZVF1ZXVlLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfc2VuZChmYWxzZSwgW21lc3NhZ2VdLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhIGNvbXBsZXRlIGJheWV1eCBtZXNzYWdlLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGV4cG9zZWQgYXMgYSBwdWJsaWMgc28gdGhhdCBleHRlbnNpb25zIG1heSB1c2UgaXRcbiAgICAgKiB0byBzZW5kIGJheWV1eCBtZXNzYWdlIGRpcmVjdGx5LCBmb3IgZXhhbXBsZSBpbiBjYXNlIG9mIHJlLXNlbmRpbmdcbiAgICAgKiBtZXNzYWdlcyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIHNlbnQgYnV0IHRoYXQgZm9yIHNvbWUgcmVhc29uIG11c3RcbiAgICAgKiBiZSByZXNlbnQuXG4gICAgICovXG4gICAgdGhpcy5zZW5kID0gX3F1ZXVlU2VuZDtcblxuICAgIGZ1bmN0aW9uIF9yZXNldEJhY2tvZmYoKSB7XG4gICAgICAgIF9iYWNrb2ZmID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5jcmVhc2VCYWNrb2ZmKCkge1xuICAgICAgICBpZiAoX2JhY2tvZmYgPCBfY29uZmlnLm1heEJhY2tvZmYpIHtcbiAgICAgICAgICAgIF9iYWNrb2ZmICs9IF9jb25maWcuYmFja29mZkluY3JlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2JhY2tvZmY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGEgdGhlIGJhdGNoIG9mIG1lc3NhZ2VzIHRvIGJlIHNlbnQgaW4gYSBzaW5nbGUgcmVxdWVzdC5cbiAgICAgKiBAc2VlICNfZW5kQmF0Y2goc2VuZE1lc3NhZ2VzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9zdGFydEJhdGNoKCkge1xuICAgICAgICArK19iYXRjaDtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1N0YXJ0aW5nIGJhdGNoLCBkZXB0aCcsIF9iYXRjaCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZsdXNoQmF0Y2goKSB7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IF9tZXNzYWdlUXVldWU7XG4gICAgICAgIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF9zZW5kKGZhbHNlLCBtZXNzYWdlcywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgYmF0Y2ggb2YgbWVzc2FnZXMgdG8gYmUgc2VudCBpbiBhIHNpbmdsZSByZXF1ZXN0LFxuICAgICAqIG9wdGlvbmFsbHkgc2VuZGluZyBtZXNzYWdlcyBwcmVzZW50IGluIHRoZSBtZXNzYWdlIHF1ZXVlIGRlcGVuZGluZ1xuICAgICAqIG9uIHRoZSBnaXZlbiBhcmd1bWVudC5cbiAgICAgKiBAc2VlICNfc3RhcnRCYXRjaCgpXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2VuZEJhdGNoKCkge1xuICAgICAgICAtLV9iYXRjaDtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0VuZGluZyBiYXRjaCwgZGVwdGgnLCBfYmF0Y2gpO1xuICAgICAgICBpZiAoX2JhdGNoIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgJ0NhbGxzIHRvIHN0YXJ0QmF0Y2goKSBhbmQgZW5kQmF0Y2goKSBhcmUgbm90IHBhaXJlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2JhdGNoID09PSAwICYmICFfaXNEaXNjb25uZWN0ZWQoKSAmJiAhX2ludGVybmFsQmF0Y2gpIHtcbiAgICAgICAgICAgIF9mbHVzaEJhdGNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyB0aGUgY29ubmVjdCBtZXNzYWdlXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3QoKSB7XG4gICAgICAgIGlmICghX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS9jb25uZWN0JyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogX3RyYW5zcG9ydC5nZXRUeXBlKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEluIGNhc2Ugb2YgcmVsb2FkIG9yIHRlbXBvcmFyeSBsb3NzIG9mIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIC8vIHdlIHdhbnQgdGhlIG5leHQgc3VjY2Vzc2Z1bCBjb25uZWN0IHRvIHJldHVybiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBiZWluZyBoZWxkIGJ5IHRoZSBzZXJ2ZXIsIHNvIHRoYXQgY29ubmVjdCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIC8vIGNhbiBiZSBub3RpZmllZCB0aGF0IHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIHJlLWVzdGFibGlzaGVkXG4gICAgICAgICAgICBpZiAoIV9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBiYXlldXhNZXNzYWdlLmFkdmljZSA9IHsgdGltZW91dDogMCB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfc2V0U3RhdHVzKCdjb25uZWN0aW5nJyk7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQ29ubmVjdCBzZW50JywgYmF5ZXV4TWVzc2FnZSk7XG4gICAgICAgICAgICBfc2VuZChmYWxzZSwgW2JheWV1eE1lc3NhZ2VdLCB0cnVlLCAnY29ubmVjdCcpO1xuICAgICAgICAgICAgX3NldFN0YXR1cygnY29ubmVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGVsYXllZENvbm5lY3QoZGVsYXkpIHtcbiAgICAgICAgX3NldFN0YXR1cygnY29ubmVjdGluZycpO1xuICAgICAgICBfZGVsYXllZFNlbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfY29ubmVjdCgpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3VwZGF0ZUFkdmljZShuZXdBZHZpY2UpIHtcbiAgICAgICAgaWYgKG5ld0FkdmljZSkge1xuICAgICAgICAgICAgX2FkdmljZSA9IF9jb21ldGQuX21peGluKGZhbHNlLCB7fSwgX2NvbmZpZy5hZHZpY2UsIG5ld0FkdmljZSk7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnTmV3IGFkdmljZScsIF9hZHZpY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc2Nvbm5lY3QoYWJvcnQpIHtcbiAgICAgICAgX2NhbmNlbERlbGF5ZWRTZW5kKCk7XG4gICAgICAgIGlmIChhYm9ydCAmJiBfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0LmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgICAgX2NsaWVudElkID0gbnVsbDtcbiAgICAgICAgX3NldFN0YXR1cygnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIF9iYXRjaCA9IDA7XG4gICAgICAgIF9yZXNldEJhY2tvZmYoKTtcbiAgICAgICAgX3RyYW5zcG9ydCA9IG51bGw7XG5cbiAgICAgICAgLy8gRmFpbCBhbnkgZXhpc3RpbmcgcXVldWVkIG1lc3NhZ2VcbiAgICAgICAgaWYgKF9tZXNzYWdlUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX21lc3NhZ2VRdWV1ZTtcbiAgICAgICAgICAgIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICAgICAgICAgIF9oYW5kbGVGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgdW5kZWZpbmVkLCBtZXNzYWdlcywge1xuICAgICAgICAgICAgICAgIHJlYXNvbjogJ0Rpc2Nvbm5lY3RlZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihvbGRUcmFuc3BvcnQsIG5ld1RyYW5zcG9ydCwgZmFpbHVyZSkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25UcmFuc3BvcnRFeGNlcHRpb247XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIHRyYW5zcG9ydCBleGNlcHRpb24gaGFuZGxlcicsIG9sZFRyYW5zcG9ydCwgbmV3VHJhbnNwb3J0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIGZhaWx1cmUsIG9sZFRyYW5zcG9ydCwgbmV3VHJhbnNwb3J0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiB0cmFuc3BvcnQgZXhjZXB0aW9uIGhhbmRsZXInLCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIHRoZSBpbml0aWFsIGhhbmRzaGFrZSBtZXNzYWdlXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2hhbmRzaGFrZShoYW5kc2hha2VQcm9wcywgaGFuZHNoYWtlQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRzaGFrZVByb3BzKSkge1xuICAgICAgICAgICAgaGFuZHNoYWtlQ2FsbGJhY2sgPSBoYW5kc2hha2VQcm9wcztcbiAgICAgICAgICAgIGhhbmRzaGFrZVByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NsaWVudElkID0gbnVsbDtcblxuICAgICAgICBfY2xlYXJTdWJzY3JpcHRpb25zKCk7XG5cbiAgICAgICAgLy8gUmVzZXQgdGhlIHRyYW5zcG9ydHMgaWYgd2UncmUgbm90IHJldHJ5aW5nIHRoZSBoYW5kc2hha2VcbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0cy5yZXNldCh0cnVlKTtcbiAgICAgICAgICAgIF91cGRhdGVBZHZpY2UoX2NvbmZpZy5hZHZpY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgX2JhdGNoID0gMDtcblxuICAgICAgICAvLyBNYXJrIHRoZSBzdGFydCBvZiBhbiBpbnRlcm5hbCBiYXRjaC5cbiAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBoYW5kc2hha2UgYW5kIGNvbm5lY3QgYXJlIGFzeW5jLlxuICAgICAgICAvLyBJdCBtYXkgaGFwcGVuIHRoYXQgdGhlIGFwcGxpY2F0aW9uIGNhbGxzIGluaXQoKSB0aGVuIHN1YnNjcmliZSgpXG4gICAgICAgIC8vIGFuZCB0aGUgc3Vic2NyaWJlIG1lc3NhZ2UgaXMgc2VudCBiZWZvcmUgdGhlIGNvbm5lY3QgbWVzc2FnZSwgaWZcbiAgICAgICAgLy8gdGhlIHN1YnNjcmliZSBtZXNzYWdlIGlzIG5vdCBoZWxkIHVudGlsIHRoZSBjb25uZWN0IG1lc3NhZ2UgaXMgc2VudC5cbiAgICAgICAgLy8gU28gaGVyZSB3ZSBzdGFydCBhIGJhdGNoIHRvIGhvbGQgdGVtcG9yYXJpbHkgYW55IG1lc3NhZ2UgdW50aWxcbiAgICAgICAgLy8gdGhlIGNvbm5lY3Rpb24gaXMgZnVsbHkgZXN0YWJsaXNoZWQuXG4gICAgICAgIF9pbnRlcm5hbEJhdGNoID0gdHJ1ZTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBwcm9wZXJ0aWVzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyLCBzbyB0aGF0XG4gICAgICAgIC8vIHdlIGNhbiByZXVzZSB0aGVtIGR1cmluZyBhdXRvbWF0aWMgcmUtaGFuZHNoYWtlXG4gICAgICAgIF9oYW5kc2hha2VQcm9wcyA9IGhhbmRzaGFrZVByb3BzO1xuICAgICAgICBfaGFuZHNoYWtlQ2FsbGJhY2sgPSBoYW5kc2hha2VDYWxsYmFjaztcblxuICAgICAgICB2YXIgdmVyc2lvbiA9ICcxLjAnO1xuXG4gICAgICAgIC8vIEZpZ3VyZSBvdXQgdGhlIHRyYW5zcG9ydHMgdG8gc2VuZCB0byB0aGUgc2VydmVyXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICB2YXIgdHJhbnNwb3J0VHlwZXMgPSBfdHJhbnNwb3J0cy5maW5kVHJhbnNwb3J0VHlwZXModmVyc2lvbiwgX2Nyb3NzRG9tYWluLCB1cmwpO1xuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgbWluaW11bVZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvaGFuZHNoYWtlJyxcbiAgICAgICAgICAgIHN1cHBvcnRlZENvbm5lY3Rpb25UeXBlczogdHJhbnNwb3J0VHlwZXMsXG4gICAgICAgICAgICBhZHZpY2U6IHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBfYWR2aWNlLnRpbWVvdXQsXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IF9hZHZpY2UuaW50ZXJ2YWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgIHZhciBtZXNzYWdlID0gX2NvbWV0ZC5fbWl4aW4oZmFsc2UsIHt9LCBfaGFuZHNoYWtlUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBoYW5kc2hha2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gUGljayB1cCB0aGUgZmlyc3QgYXZhaWxhYmxlIHRyYW5zcG9ydCBhcyBpbml0aWFsIHRyYW5zcG9ydFxuICAgICAgICAvLyBzaW5jZSB3ZSBkb24ndCBrbm93IGlmIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgaXRcbiAgICAgICAgaWYgKCFfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHMubmVnb3RpYXRlVHJhbnNwb3J0KHRyYW5zcG9ydFR5cGVzLCB2ZXJzaW9uLCBfY3Jvc3NEb21haW4sIHVybCk7XG4gICAgICAgICAgICBpZiAoIV90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9ICdDb3VsZCBub3QgZmluZCBpbml0aWFsIHRyYW5zcG9ydCBhbW9uZzogJyArIF90cmFuc3BvcnRzLmdldFRyYW5zcG9ydFR5cGVzKCk7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fd2FybihmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBmYWlsdXJlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0luaXRpYWwgdHJhbnNwb3J0IGlzJywgX3RyYW5zcG9ydC5nZXRUeXBlKCkpO1xuXG4gICAgICAgIC8vIFdlIHN0YXJ0ZWQgYSBiYXRjaCB0byBob2xkIHRoZSBhcHBsaWNhdGlvbiBtZXNzYWdlcyxcbiAgICAgICAgLy8gc28gaGVyZSB3ZSBtdXN0IGJ5cGFzcyBpdCBhbmQgc2VuZCBpbW1lZGlhdGVseS5cbiAgICAgICAgX3NldFN0YXR1cygnaGFuZHNoYWtpbmcnKTtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0hhbmRzaGFrZSBzZW50JywgbWVzc2FnZSk7XG4gICAgICAgIF9zZW5kKGZhbHNlLCBbbWVzc2FnZV0sIGZhbHNlLCAnaGFuZHNoYWtlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2RlbGF5ZWRIYW5kc2hha2UoZGVsYXkpIHtcbiAgICAgICAgX3NldFN0YXR1cygnaGFuZHNoYWtpbmcnKTtcblxuICAgICAgICAvLyBXZSB3aWxsIGNhbGwgX2hhbmRzaGFrZSgpIHdoaWNoIHdpbGwgcmVzZXQgX2NsaWVudElkLCBidXQgd2Ugd2FudCB0byBhdm9pZFxuICAgICAgICAvLyB0aGF0IGJldHdlZW4gdGhlIGVuZCBvZiB0aGlzIG1ldGhvZCBhbmQgdGhlIGNhbGwgdG8gX2hhbmRzaGFrZSgpIHNvbWVvbmUgbWF5XG4gICAgICAgIC8vIGNhbGwgcHVibGlzaCgpIChvciBvdGhlciBtZXRob2RzIHRoYXQgY2FsbCBfcXVldWVTZW5kKCkpLlxuICAgICAgICBfaW50ZXJuYWxCYXRjaCA9IHRydWU7XG5cbiAgICAgICAgX2RlbGF5ZWRTZW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX2hhbmRzaGFrZShfaGFuZHNoYWtlUHJvcHMsIF9oYW5kc2hha2VDYWxsYmFjayk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5Q2FsbGJhY2soY2FsbGJhY2ssIG1lc3NhZ2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoX2NvbWV0ZCwgbWVzc2FnZSk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vbkNhbGxiYWNrRXhjZXB0aW9uO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIGNhbGxiYWNrIGV4Y2VwdGlvbiBoYW5kbGVyJywgeCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIHgsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGNhbGxiYWNrIGV4Y2VwdGlvbiBoYW5kbGVyJywgeHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgbWVzc2FnZSBjYWxsYmFjaycsIHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZ2V0Q2FsbGJhY2sgPSBmdW5jdGlvbihtZXNzYWdlSWQpIHtcbiAgICAgICAgcmV0dXJuIF9jYWxsYmFja3NbbWVzc2FnZUlkXTtcbiAgICB9O1xuXG4gICAgdGhpcy5fcHV0Q2FsbGJhY2sgPSBmdW5jdGlvbihtZXNzYWdlSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9nZXRDYWxsYmFjayhtZXNzYWdlSWQpO1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICBfY2FsbGJhY2tzW21lc3NhZ2VJZF0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBfY29tZXRkLl9nZXRDYWxsYmFjayhbbWVzc2FnZS5pZF0pO1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICBkZWxldGUgX2NhbGxiYWNrc1ttZXNzYWdlLmlkXTtcbiAgICAgICAgICAgIF9ub3RpZnlDYWxsYmFjayhjYWxsYmFjaywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaGFuZGxlUmVtb3RlQ2FsbChtZXNzYWdlKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gX3JlbW90ZUNhbGxzW21lc3NhZ2UuaWRdO1xuICAgICAgICBkZWxldGUgX3JlbW90ZUNhbGxzW21lc3NhZ2UuaWRdO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0hhbmRsaW5nIHJlbW90ZSBjYWxsIHJlc3BvbnNlIGZvcicsIG1lc3NhZ2UsICd3aXRoIGNvbnRleHQnLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHRpbWVvdXQsIGlmIHByZXNlbnQuXG4gICAgICAgICAgICB2YXIgdGltZW91dCA9IGNvbnRleHQudGltZW91dDtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250ZXh0LmNhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIF9ub3RpZnlDYWxsYmFjayhjYWxsYmFjaywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMub25UcmFuc3BvcnRGYWlsdXJlID0gZnVuY3Rpb24obWVzc2FnZSwgZmFpbHVyZUluZm8sIGZhaWx1cmVIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQgZmFpbHVyZScsIGZhaWx1cmVJbmZvLCAnZm9yJywgbWVzc2FnZSk7XG5cbiAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSB0aGlzLmdldFRyYW5zcG9ydFJlZ2lzdHJ5KCk7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFVSTCgpO1xuICAgICAgICB2YXIgY3Jvc3NEb21haW4gPSB0aGlzLl9pc0Nyb3NzRG9tYWluKF9zcGxpdFVSTCh1cmwpWzJdKTtcbiAgICAgICAgdmFyIHZlcnNpb24gPSAnMS4wJztcbiAgICAgICAgdmFyIHRyYW5zcG9ydFR5cGVzID0gdHJhbnNwb3J0cy5maW5kVHJhbnNwb3J0VHlwZXModmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCk7XG5cbiAgICAgICAgaWYgKGZhaWx1cmVJbmZvLmFjdGlvbiA9PT0gJ25vbmUnKSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvaGFuZHNoYWtlJykge1xuICAgICAgICAgICAgICAgIGlmICghZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0gJ0NvdWxkIG5vdCBuZWdvdGlhdGUgdHJhbnNwb3J0LCBjbGllbnQ9WycgKyB0cmFuc3BvcnRUeXBlcyArICddLCBzZXJ2ZXI9WycgKyBtZXNzYWdlLnN1cHBvcnRlZENvbm5lY3Rpb25UeXBlcyArICddJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2FybihmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihfdHJhbnNwb3J0LmdldFR5cGUoKSwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBmYWlsdXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvblR5cGU6IF90cmFuc3BvcnQuZ2V0VHlwZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0OiBfdHJhbnNwb3J0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZhaWx1cmVJbmZvLmRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAvLyBEaWZmZXJlbnQgbG9naWMgZGVwZW5kaW5nIG9uIHdoZXRoZXIgd2UgYXJlIGhhbmRzaGFraW5nIG9yIGNvbm5lY3RpbmcuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvaGFuZHNoYWtlJykge1xuICAgICAgICAgICAgICAgIGlmICghZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0cmFuc3BvcnQgaXMgaW52YWxpZCwgdHJ5IHRvIG5lZ290aWF0ZSBhZ2Fpbi5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1RyYW5zcG9ydCA9IHRyYW5zcG9ydHMubmVnb3RpYXRlVHJhbnNwb3J0KHRyYW5zcG9ydFR5cGVzLCB2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXdUcmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dhcm4oJ0NvdWxkIG5vdCBuZWdvdGlhdGUgdHJhbnNwb3J0LCBjbGllbnQ9WycgKyB0cmFuc3BvcnRUeXBlcyArICddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfbm90aWZ5VHJhbnNwb3J0RXhjZXB0aW9uKF90cmFuc3BvcnQuZ2V0VHlwZSgpLCBudWxsLCBtZXNzYWdlLmZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIF90cmFuc3BvcnQuZ2V0VHlwZSgpLCAnLT4nLCBuZXdUcmFuc3BvcnQuZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9ub3RpZnlUcmFuc3BvcnRFeGNlcHRpb24oX3RyYW5zcG9ydC5nZXRUeXBlKCksIG5ld1RyYW5zcG9ydC5nZXRUeXBlKCksIG1lc3NhZ2UuZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnaGFuZHNoYWtlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLnRyYW5zcG9ydCA9IG5ld1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF91bmNvbm5lY3RUaW1lID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIF91bmNvbm5lY3RUaW1lID0gbm93O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gPT09ICdyZXRyeScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uZGVsYXkgPSB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHdlIG1heSBzd2l0Y2ggdG8gaGFuZHNoYWtpbmcuXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhJbnRlcnZhbCA9IF9hZHZpY2UubWF4SW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXhJbnRlcnZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHBpcmF0aW9uID0gX2FkdmljZS50aW1lb3V0ICsgX2FkdmljZS5pbnRlcnZhbCArIG1heEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVuY29ubmVjdGVkID0gbm93IC0gX3VuY29ubmVjdFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5jb25uZWN0ZWQgKyBfYmFja29mZiA+IGV4cGlyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnaGFuZHNoYWtlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gPT09ICdoYW5kc2hha2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmRlbGF5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5yZXNldChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmFpbHVyZUhhbmRsZXIuY2FsbChfY29tZXRkLCBmYWlsdXJlSW5mbyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9oYW5kbGVUcmFuc3BvcnRGYWlsdXJlKGZhaWx1cmVJbmZvKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQgZmFpbHVyZSBoYW5kbGluZycsIGZhaWx1cmVJbmZvKTtcblxuICAgICAgICBpZiAoZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0ID0gZmFpbHVyZUluZm8udHJhbnNwb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZhaWx1cmVJbmZvLnVybCkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydC5zZXRVUkwoZmFpbHVyZUluZm8udXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3Rpb24gPSBmYWlsdXJlSW5mby5hY3Rpb247XG4gICAgICAgIHZhciBkZWxheSA9IGZhaWx1cmVJbmZvLmRlbGF5IHx8IDA7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdoYW5kc2hha2UnOlxuICAgICAgICAgICAgICAgIF9kZWxheWVkSGFuZHNoYWtlKGRlbGF5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoZGVsYXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93ICdVbmtub3duIGFjdGlvbiAnICsgYWN0aW9uO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwgZmFpbHVyZUluZm8pIHtcbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9oYW5kc2hha2UnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG5cbiAgICAgICAgLy8gVGhlIGxpc3RlbmVycyBtYXkgaGF2ZSBkaXNjb25uZWN0ZWQuXG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NvbWV0ZC5vblRyYW5zcG9ydEZhaWx1cmUuY2FsbChfY29tZXRkLCBtZXNzYWdlLCBmYWlsdXJlSW5mbywgX2hhbmRsZVRyYW5zcG9ydEZhaWx1cmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oYW5kc2hha2VSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICB2YXIgY3Jvc3NEb21haW4gPSBfY29tZXRkLl9pc0Nyb3NzRG9tYWluKF9zcGxpdFVSTCh1cmwpWzJdKTtcbiAgICAgICAgICAgIHZhciBuZXdUcmFuc3BvcnQgPSBfdHJhbnNwb3J0cy5uZWdvdGlhdGVUcmFuc3BvcnQobWVzc2FnZS5zdXBwb3J0ZWRDb25uZWN0aW9uVHlwZXMsIG1lc3NhZ2UudmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCk7XG4gICAgICAgICAgICBpZiAobmV3VHJhbnNwb3J0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zdWNjZXNzZnVsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwge1xuICAgICAgICAgICAgICAgICAgICBjYXVzZTogJ25lZ290aWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogbnVsbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RyYW5zcG9ydCAhPT0gbmV3VHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCcsIF90cmFuc3BvcnQuZ2V0VHlwZSgpLCAnLT4nLCBuZXdUcmFuc3BvcnQuZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgICAgICBfdHJhbnNwb3J0ID0gbmV3VHJhbnNwb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfY2xpZW50SWQgPSBtZXNzYWdlLmNsaWVudElkO1xuXG4gICAgICAgICAgICAvLyBFbmQgdGhlIGludGVybmFsIGJhdGNoIGFuZCBhbGxvdyBoZWxkIG1lc3NhZ2VzIGZyb20gdGhlIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAvLyB0byBnbyB0byB0aGUgc2VydmVyIChzZWUgX2hhbmRzaGFrZSgpIHdoZXJlIHdlIHN0YXJ0IHRoZSBpbnRlcm5hbCBiYXRjaCkuXG4gICAgICAgICAgICBfaW50ZXJuYWxCYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgX2ZsdXNoQmF0Y2goKTtcblxuICAgICAgICAgICAgLy8gSGVyZSB0aGUgbmV3IHRyYW5zcG9ydCBpcyBpbiBwbGFjZSwgYXMgd2VsbCBhcyB0aGUgY2xpZW50SWQsIHNvXG4gICAgICAgICAgICAvLyB0aGUgbGlzdGVuZXJzIGNhbiBwZXJmb3JtIGEgcHVibGlzaCgpIGlmIHRoZXkgd2FudC5cbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgbGlzdGVuZXJzIGJlZm9yZSB0aGUgY29ubmVjdCBiZWxvdy5cbiAgICAgICAgICAgIG1lc3NhZ2UucmVlc3RhYmxpc2ggPSBfcmVlc3RhYmxpc2g7XG4gICAgICAgICAgICBfcmVlc3RhYmxpc2ggPSB0cnVlO1xuXG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9oYW5kc2hha2UnLCBtZXNzYWdlKTtcblxuICAgICAgICAgICAgX2hhbmRzaGFrZU1lc3NhZ2VzID0gbWVzc2FnZVsneC1tZXNzYWdlcyddIHx8IDA7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfaXNEaXNjb25uZWN0ZWQoKSA/ICdub25lJyA6IF9hZHZpY2UucmVjb25uZWN0IHx8ICdyZXRyeSc7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2hhbmRzaGFrZU1lc3NhZ2VzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUHJvY2Vzc2luZycsIF9oYW5kc2hha2VNZXNzYWdlcywgJ2hhbmRzaGFrZS1kZWxpdmVyZWQgbWVzc2FnZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdVbnJlY29nbml6ZWQgYWR2aWNlIGFjdGlvbiAnICsgYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwge1xuICAgICAgICAgICAgICAgIGNhdXNlOiAndW5zdWNjZXNzZnVsJyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IF9hZHZpY2UucmVjb25uZWN0IHx8ICdoYW5kc2hha2UnLFxuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogX3RyYW5zcG9ydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaGFuZHNoYWtlRmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsSGFuZHNoYWtlKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgIGNhdXNlOiAnZmFpbHVyZScsXG4gICAgICAgICAgICBhY3Rpb246ICdoYW5kc2hha2UnLFxuICAgICAgICAgICAgdHJhbnNwb3J0OiBudWxsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsQ29ubmVjdChtZXNzYWdlLCBmYWlsdXJlSW5mbykge1xuICAgICAgICAvLyBOb3RpZnkgdGhlIGxpc3RlbmVycyBhZnRlciB0aGUgc3RhdHVzIGNoYW5nZSBidXQgYmVmb3JlIHRoZSBuZXh0IGFjdGlvbi5cbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvY29ubmVjdCcsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcblxuICAgICAgICAvLyBUaGUgbGlzdGVuZXJzIG1heSBoYXZlIGRpc2Nvbm5lY3RlZC5cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICBfY29tZXRkLm9uVHJhbnNwb3J0RmFpbHVyZS5jYWxsKF9jb21ldGQsIG1lc3NhZ2UsIGZhaWx1cmVJbmZvLCBfaGFuZGxlVHJhbnNwb3J0RmFpbHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIF9jb25uZWN0ZWQgPSBtZXNzYWdlLnN1Y2Nlc3NmdWw7XG5cbiAgICAgICAgaWYgKF9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Nvbm5lY3QnLCBtZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gTm9ybWFsbHksIHRoZSBhZHZpY2Ugd2lsbCBzYXkgXCJyZWNvbm5lY3Q6ICdyZXRyeScsIGludGVydmFsOiAwXCJcbiAgICAgICAgICAgIC8vIGFuZCB0aGUgc2VydmVyIHdpbGwgaG9sZCB0aGUgcmVxdWVzdCwgc28gd2hlbiBhIHJlc3BvbnNlIHJldHVybnNcbiAgICAgICAgICAgIC8vIHdlIGltbWVkaWF0ZWx5IGNhbGwgdGhlIHNlcnZlciBhZ2FpbiAobG9uZyBwb2xsaW5nKS5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyBjYW4gY2FsbCBkaXNjb25uZWN0KCksIHNvIGNoZWNrIHRoZSBzdGF0ZSBhZnRlciB0aGV5IHJ1bi5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfaXNEaXNjb25uZWN0ZWQoKSA/ICdub25lJyA6IF9hZHZpY2UucmVjb25uZWN0IHx8ICdyZXRyeSc7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoX2JhY2tvZmYpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVW5yZWNvZ25pemVkIGFkdmljZSBhY3Rpb24gJyArIGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsQ29ubmVjdChtZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgY2F1c2U6ICd1bnN1Y2Nlc3NmdWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogX2FkdmljZS5yZWNvbm5lY3QgfHwgJ3JldHJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IF90cmFuc3BvcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3RGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIF9mYWlsQ29ubmVjdChtZXNzYWdlLCB7XG4gICAgICAgICAgICBjYXVzZTogJ2ZhaWx1cmUnLFxuICAgICAgICAgICAgYWN0aW9uOiAncmV0cnknLFxuICAgICAgICAgICAgdHJhbnNwb3J0OiBudWxsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKSB7XG4gICAgICAgIF9kaXNjb25uZWN0KHRydWUpO1xuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Rpc2Nvbm5lY3QnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSAvbWV0YS9jb25uZWN0IHRvIGFycml2ZS5cbiAgICAgICAgICAgIF9kaXNjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Rpc2Nvbm5lY3QnLCBtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kaXNjb25uZWN0RmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbFN1YnNjcmliZShtZXNzYWdlKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1ttZXNzYWdlLnN1YnNjcmlwdGlvbl07XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3Vic2NyaXB0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24gJiYgIXN1YnNjcmlwdGlvbi5saXN0ZW5lcikge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgc3Vic2NyaXB0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlbW92ZWQgZmFpbGVkIHN1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3N1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc3Vic2NyaWJlUmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9zdWJzY3JpYmUnLCBtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsU3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N1YnNjcmliZUZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfZmFpbFN1YnNjcmliZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbFVuc3Vic2NyaWJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdW5zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3Vic2NyaWJlJywgbWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbFVuc3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Vuc3Vic2NyaWJlRmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsVW5zdWJzY3JpYmUobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFfaGFuZGxlUmVtb3RlQ2FsbChtZXNzYWdlKSkge1xuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvcHVibGlzaCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWVzc2FnZVJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIV9oYW5kbGVSZW1vdGVDYWxsKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycyhtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGlmIChfaGFuZHNoYWtlTWVzc2FnZXMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC0tX2hhbmRzaGFrZU1lc3NhZ2VzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2hhbmRzaGFrZU1lc3NhZ2VzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUHJvY2Vzc2VkIGxhc3QgaGFuZHNoYWtlLWRlbGl2ZXJlZCBtZXNzYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl93YXJuKCdVbmtub3duIEJheWV1eCBNZXNzYWdlJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9wdWJsaXNoJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX2ZhaWxNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tZXNzYWdlRmFpbHVyZShmYWlsdXJlKSB7XG4gICAgICAgIF9mYWlsTWVzc2FnZShmYWlsdXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVjZWl2ZShtZXNzYWdlKSB7XG4gICAgICAgIF91bmNvbm5lY3RUaW1lID0gMDtcblxuICAgICAgICBtZXNzYWdlID0gX2FwcGx5SW5jb21pbmdFeHRlbnNpb25zKG1lc3NhZ2UpO1xuICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF91cGRhdGVBZHZpY2UobWVzc2FnZS5hZHZpY2UpO1xuXG4gICAgICAgIHZhciBjaGFubmVsID0gbWVzc2FnZS5jaGFubmVsO1xuICAgICAgICBzd2l0Y2ggKGNoYW5uZWwpIHtcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL2hhbmRzaGFrZSc6XG4gICAgICAgICAgICAgICAgX2hhbmRzaGFrZVJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgX2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Rpc2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0UmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS9zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgIF9zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL3Vuc3Vic2NyaWJlJzpcbiAgICAgICAgICAgICAgICBfdW5zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgX21lc3NhZ2VSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgbWVzc2FnZS5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIGFzIGEgcHVibGljIHNvIHRoYXQgZXh0ZW5zaW9ucyBtYXkgaW5qZWN0XG4gICAgICogbWVzc2FnZXMgc2ltdWxhdGluZyB0aGF0IHRoZXkgaGFkIGJlZW4gcmVjZWl2ZWQuXG4gICAgICovXG4gICAgdGhpcy5yZWNlaXZlID0gX3JlY2VpdmU7XG5cbiAgICBfaGFuZGxlTWVzc2FnZXMgPSBmdW5jdGlvbihyY3ZkTWVzc2FnZXMpIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlY2VpdmVkJywgcmN2ZE1lc3NhZ2VzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJjdmRNZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSByY3ZkTWVzc2FnZXNbaV07XG4gICAgICAgICAgICBfcmVjZWl2ZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfaGFuZGxlRmFpbHVyZSA9IGZ1bmN0aW9uKGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdoYW5kbGVGYWlsdXJlJywgY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpO1xuXG4gICAgICAgIGZhaWx1cmUudHJhbnNwb3J0ID0gY29uZHVpdDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIHZhciBmYWlsdXJlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogbWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiBtZXNzYWdlLmNoYW5uZWwsXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogZmFpbHVyZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZhaWx1cmUubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL2hhbmRzaGFrZSc6XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kc2hha2VGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgICAgIF9jb25uZWN0RmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Rpc2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgICAgICBfZGlzY29ubmVjdEZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS9zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlTWVzc2FnZS5zdWJzY3JpcHRpb24gPSBtZXNzYWdlLnN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmliZUZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS91bnN1YnNjcmliZSc6XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVNZXNzYWdlLnN1YnNjcmlwdGlvbiA9IG1lc3NhZ2Uuc3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICBfdW5zdWJzY3JpYmVGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgX21lc3NhZ2VGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2hhc1N1YnNjcmlwdGlvbnMoY2hhbm5lbCkge1xuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZXNvbHZlU2NvcGVkQ2FsbGJhY2soc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IHtcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgIG1ldGhvZDogY2FsbGJhY2tcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHNjb3BlKSkge1xuICAgICAgICAgICAgZGVsZWdhdGUuc2NvcGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkZWxlZ2F0ZS5tZXRob2QgPSBzY29wZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChfaXNTdHJpbmcoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBzY29wZSAnICsgc2NvcGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGVnYXRlLm1ldGhvZCA9IHNjb3BlW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBpZiAoIV9pc0Z1bmN0aW9uKGRlbGVnYXRlLm1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgY2FsbGJhY2sgJyArIGNhbGxiYWNrICsgJyBmb3Igc2NvcGUgJyArIHNjb3BlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIV9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGNhbGxiYWNrICcgKyBjYWxsYmFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVsZWdhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgaXNMaXN0ZW5lcikge1xuICAgICAgICAvLyBUaGUgZGF0YSBzdHJ1Y3R1cmUgaXMgYSBtYXA8Y2hhbm5lbCwgc3Vic2NyaXB0aW9uW10+LCB3aGVyZSBlYWNoIHN1YnNjcmlwdGlvblxuICAgICAgICAvLyBob2xkcyB0aGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFuZCBpdHMgc2NvcGUuXG5cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gX3Jlc29sdmVTY29wZWRDYWxsYmFjayhzY29wZSwgY2FsbGJhY2spO1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQWRkaW5nJywgaXNMaXN0ZW5lciA/ICdsaXN0ZW5lcicgOiAnc3Vic2NyaXB0aW9uJywgJ29uJywgY2hhbm5lbCwgJ3dpdGggc2NvcGUnLCBkZWxlZ2F0ZS5zY29wZSwgJ2FuZCBjYWxsYmFjaycsIGRlbGVnYXRlLm1ldGhvZCk7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXG4gICAgICAgICAgICBzY29wZTogZGVsZWdhdGUuc2NvcGUsXG4gICAgICAgICAgICBjYWxsYmFjazogZGVsZWdhdGUubWV0aG9kLFxuICAgICAgICAgICAgbGlzdGVuZXI6IGlzTGlzdGVuZXJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgIGlmICghc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgICAgICAgX2xpc3RlbmVyc1tjaGFubmVsXSA9IHN1YnNjcmlwdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoaW5nIG9udG8gYW4gYXJyYXkgYXBwZW5kcyBhdCB0aGUgZW5kIGFuZCByZXR1cm5zIHRoZSBpZCBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQgaW5jcmVhc2VkIGJ5IDEuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBpZjpcbiAgICAgICAgLy8gYS5wdXNoKCdhJyk7IHZhciBoYj1hLnB1c2goJ2InKTsgZGVsZXRlIGFbaGItMV07IHZhciBoYz1hLnB1c2goJ2MnKTtcbiAgICAgICAgLy8gdGhlbjpcbiAgICAgICAgLy8gaGM9PTMsIGEuam9pbigpPT0nYScsLCdjJywgYS5sZW5ndGg9PTNcbiAgICAgICAgc3Vic2NyaXB0aW9uLmlkID0gc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnNjcmlwdGlvbikgLSAxO1xuXG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdBZGRlZCcsIGlzTGlzdGVuZXIgPyAnbGlzdGVuZXInIDogJ3N1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG5cbiAgICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IHdlIHVzZWQgdG8gcmV0dXJuIFtjaGFubmVsLCBzdWJzY3JpcHRpb24uaWRdXG4gICAgICAgIHN1YnNjcmlwdGlvblswXSA9IGNoYW5uZWw7XG4gICAgICAgIHN1YnNjcmlwdGlvblsxXSA9IHN1YnNjcmlwdGlvbi5pZDtcblxuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gUFVCTElDIEFQSVxuICAgIC8vXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgdGhlIGdpdmVuIHRyYW5zcG9ydCB1bmRlciB0aGUgZ2l2ZW4gdHJhbnNwb3J0IHR5cGUuXG4gICAgICogVGhlIG9wdGlvbmFsIGluZGV4IHBhcmFtZXRlciBzcGVjaWZpZXMgdGhlIFwicHJpb3JpdHlcIiBhdCB3aGljaCB0aGVcbiAgICAgKiB0cmFuc3BvcnQgaXMgcmVnaXN0ZXJlZCAod2hlcmUgMCBpcyB0aGUgbWF4IHByaW9yaXR5KS5cbiAgICAgKiBJZiBhIHRyYW5zcG9ydCB3aXRoIHRoZSBzYW1lIHR5cGUgaXMgYWxyZWFkeSByZWdpc3RlcmVkLCB0aGlzIGZ1bmN0aW9uXG4gICAgICogZG9lcyBub3RoaW5nIGFuZCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEBwYXJhbSB0eXBlIHRoZSB0cmFuc3BvcnQgdHlwZVxuICAgICAqIEBwYXJhbSB0cmFuc3BvcnQgdGhlIHRyYW5zcG9ydCBvYmplY3RcbiAgICAgKiBAcGFyYW0gaW5kZXggdGhlIGluZGV4IGF0IHdoaWNoIHRoaXMgdHJhbnNwb3J0IGlzIHRvIGJlIHJlZ2lzdGVyZWRcbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIHRyYW5zcG9ydCBoYXMgYmVlbiByZWdpc3RlcmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAc2VlICN1bnJlZ2lzdGVyVHJhbnNwb3J0KHR5cGUpXG4gICAgICovXG4gICAgdGhpcy5yZWdpc3RlclRyYW5zcG9ydCA9IGZ1bmN0aW9uKHR5cGUsIHRyYW5zcG9ydCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IF90cmFuc3BvcnRzLmFkZCh0eXBlLCB0cmFuc3BvcnQsIGluZGV4KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1JlZ2lzdGVyZWQgdHJhbnNwb3J0JywgdHlwZSk7XG5cbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbih0cmFuc3BvcnQucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQucmVnaXN0ZXJlZCh0eXBlLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbnJlZ2lzdGVycyB0aGUgdHJhbnNwb3J0IHdpdGggdGhlIGdpdmVuIHRyYW5zcG9ydCB0eXBlLlxuICAgICAqIEBwYXJhbSB0eXBlIHRoZSB0cmFuc3BvcnQgdHlwZSB0byB1bnJlZ2lzdGVyXG4gICAgICogQHJldHVybiB0aGUgdHJhbnNwb3J0IHRoYXQgaGFzIGJlZW4gdW5yZWdpc3RlcmVkLFxuICAgICAqIG9yIG51bGwgaWYgbm8gdHJhbnNwb3J0IHdhcyBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgdW5kZXIgdGhlIGdpdmVuIHRyYW5zcG9ydCB0eXBlXG4gICAgICovXG4gICAgdGhpcy51bnJlZ2lzdGVyVHJhbnNwb3J0ID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHMucmVtb3ZlKHR5cGUpO1xuICAgICAgICBpZiAodHJhbnNwb3J0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVW5yZWdpc3RlcmVkIHRyYW5zcG9ydCcsIHR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24odHJhbnNwb3J0LnVucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQudW5yZWdpc3RlcmVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICB9O1xuXG4gICAgdGhpcy51bnJlZ2lzdGVyVHJhbnNwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdHJhbnNwb3J0cy5jbGVhcigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGFuIGFycmF5IG9mIGFsbCByZWdpc3RlcmVkIHRyYW5zcG9ydCB0eXBlc1xuICAgICAqL1xuICAgIHRoaXMuZ2V0VHJhbnNwb3J0VHlwZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzLmdldFRyYW5zcG9ydFR5cGVzKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZmluZFRyYW5zcG9ydCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzLmZpbmQobmFtZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRoZSBUcmFuc3BvcnRSZWdpc3RyeSBvYmplY3RcbiAgICAgKi9cbiAgICB0aGlzLmdldFRyYW5zcG9ydFJlZ2lzdHJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHJhbnNwb3J0cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlcyB0aGUgaW5pdGlhbCBCYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqIENvbmZpZ3VyYXRpb24gaXMgcGFzc2VkIHZpYSBhbiBvYmplY3QgdGhhdCBtdXN0IGNvbnRhaW4gYSBtYW5kYXRvcnkgZmllbGQgPGNvZGU+dXJsPC9jb2RlPlxuICAgICAqIG9mIHR5cGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCBvZiB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgKi9cbiAgICB0aGlzLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgX2NvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmZpZ3VyYXRpb24pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmVzIGFuZCBlc3RhYmxpc2hlcyB0aGUgQmF5ZXV4IGNvbW11bmljYXRpb24gd2l0aCB0aGUgQmF5ZXV4IHNlcnZlclxuICAgICAqIHZpYSBhIGhhbmRzaGFrZSBhbmQgYSBzdWJzZXF1ZW50IGNvbm5lY3QuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICogQHBhcmFtIGhhbmRzaGFrZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgaGFuZHNoYWtlIG1lc3NhZ2VcbiAgICAgKiBAc2VlICNjb25maWd1cmUoY29uZmlndXJhdGlvbilcbiAgICAgKiBAc2VlICNoYW5kc2hha2UoaGFuZHNoYWtlUHJvcHMpXG4gICAgICovXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oY29uZmlndXJhdGlvbiwgaGFuZHNoYWtlUHJvcHMpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmUoY29uZmlndXJhdGlvbik7XG4gICAgICAgIHRoaXMuaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXN0YWJsaXNoZXMgdGhlIEJheWV1eCBjb21tdW5pY2F0aW9uIHdpdGggdGhlIEJheWV1eCBzZXJ2ZXJcbiAgICAgKiB2aWEgYSBoYW5kc2hha2UgYW5kIGEgc3Vic2VxdWVudCBjb25uZWN0LlxuICAgICAqIEBwYXJhbSBoYW5kc2hha2VQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGhhbmRzaGFrZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGhhbmRzaGFrZUNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBoYW5kc2hha2UgaXMgYWNrbm93bGVkZ2VkXG4gICAgICovXG4gICAgdGhpcy5oYW5kc2hha2UgPSBmdW5jdGlvbihoYW5kc2hha2VQcm9wcywgaGFuZHNoYWtlQ2FsbGJhY2spIHtcbiAgICAgICAgX3NldFN0YXR1cygnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIF9yZWVzdGFibGlzaCA9IGZhbHNlO1xuICAgICAgICBfaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzLCBoYW5kc2hha2VDYWxsYmFjayk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3RzIGZyb20gdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICogSXQgaXMgcG9zc2libGUgdG8gc3VnZ2VzdCB0byBhdHRlbXB0IGEgc3luY2hyb25vdXMgZGlzY29ubmVjdCwgYnV0IHRoaXMgZmVhdHVyZVxuICAgICAqIG1heSBvbmx5IGJlIGF2YWlsYWJsZSBpbiBjZXJ0YWluIHRyYW5zcG9ydHMgKGZvciBleGFtcGxlLCBsb25nLXBvbGxpbmcgbWF5IHN1cHBvcnRcbiAgICAgKiBpdCwgY2FsbGJhY2stcG9sbGluZyBjZXJ0YWlubHkgZG9lcyBub3QpLlxuICAgICAqIEBwYXJhbSBzeW5jIHdoZXRoZXIgYXR0ZW1wdCB0byBwZXJmb3JtIGEgc3luY2hyb25vdXMgZGlzY29ubmVjdFxuICAgICAqIEBwYXJhbSBkaXNjb25uZWN0UHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBkaXNjb25uZWN0IG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gZGlzY29ubmVjdENhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBkaXNjb25uZWN0IGlzIGFja25vd2xlZGdlZFxuICAgICAqL1xuICAgIHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKHN5bmMsIGRpc2Nvbm5lY3RQcm9wcywgZGlzY29ubmVjdENhbGxiYWNrKSB7XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzeW5jICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RDYWxsYmFjayA9IGRpc2Nvbm5lY3RQcm9wcztcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RQcm9wcyA9IHN5bmM7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGRpc2Nvbm5lY3RQcm9wcykpIHtcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RDYWxsYmFjayA9IGRpc2Nvbm5lY3RQcm9wcztcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvZGlzY29ubmVjdCdcbiAgICAgICAgfTtcbiAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBkaXNjb25uZWN0UHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBkaXNjb25uZWN0Q2FsbGJhY2spO1xuXG4gICAgICAgIF9zZXRTdGF0dXMoJ2Rpc2Nvbm5lY3RpbmcnKTtcbiAgICAgICAgX3NlbmQoc3luYyA9PT0gdHJ1ZSwgW21lc3NhZ2VdLCBmYWxzZSwgJ2Rpc2Nvbm5lY3QnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIHN0YXJ0IG9mIGEgYmF0Y2ggb2YgYXBwbGljYXRpb24gbWVzc2FnZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICogaW4gYSBzaW5nbGUgcmVxdWVzdCwgb2J0YWluaW5nIGEgc2luZ2xlIHJlc3BvbnNlIGNvbnRhaW5pbmcgKHBvc3NpYmx5KSBtYW55XG4gICAgICogYXBwbGljYXRpb24gcmVwbHkgbWVzc2FnZXMuXG4gICAgICogTWVzc2FnZXMgYXJlIGhlbGQgaW4gYSBxdWV1ZSBhbmQgbm90IHNlbnQgdW50aWwge0BsaW5rICNlbmRCYXRjaCgpfSBpcyBjYWxsZWQuXG4gICAgICogSWYgc3RhcnRCYXRjaCgpIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcywgdGhlbiBhbiBlcXVhbCBudW1iZXIgb2YgZW5kQmF0Y2goKVxuICAgICAqIGNhbGxzIG11c3QgYmUgbWFkZSB0byBjbG9zZSBhbmQgc2VuZCB0aGUgYmF0Y2ggb2YgbWVzc2FnZXMuXG4gICAgICogQHNlZSAjZW5kQmF0Y2goKVxuICAgICAqL1xuICAgIHRoaXMuc3RhcnRCYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfc3RhcnRCYXRjaCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyB0aGUgZW5kIG9mIGEgYmF0Y2ggb2YgYXBwbGljYXRpb24gbWVzc2FnZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICogaW4gYSBzaW5nbGUgcmVxdWVzdC5cbiAgICAgKiBAc2VlICNzdGFydEJhdGNoKClcbiAgICAgKi9cbiAgICB0aGlzLmVuZEJhdGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9lbmRCYXRjaCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gY2FsbGJhY2sgaW4gdGhlIGdpdmVuIHNjb3BlLCBzdXJyb3VuZGVkIGJ5IGEge0BsaW5rICNzdGFydEJhdGNoKCl9XG4gICAgICogYW5kIHtAbGluayAjZW5kQmF0Y2goKX0gY2FsbHMuXG4gICAgICogQHBhcmFtIHNjb3BlIHRoZSBzY29wZSBvZiB0aGUgY2FsbGJhY2ssIG1heSBiZSBvbWl0dGVkXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aXRoaW4ge0BsaW5rICNzdGFydEJhdGNoKCl9IGFuZCB7QGxpbmsgI2VuZEJhdGNoKCl9IGNhbGxzXG4gICAgICovXG4gICAgdGhpcy5iYXRjaCA9IGZ1bmN0aW9uKHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBfcmVzb2x2ZVNjb3BlZENhbGxiYWNrKHNjb3BlLCBjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc3RhcnRCYXRjaCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVsZWdhdGUubWV0aG9kLmNhbGwoZGVsZWdhdGUuc2NvcGUpO1xuICAgICAgICAgICAgdGhpcy5lbmRCYXRjaCgpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB0aGlzLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBiYXRjaCcsIHgpO1xuICAgICAgICAgICAgdGhpcy5lbmRCYXRjaCgpO1xuICAgICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIGJheWV1eCBtZXNzYWdlcywgcGVyZm9ybWluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgaW4gdGhlIGdpdmVuIHNjb3BlXG4gICAgICogd2hlbiBhIG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBjaGFubmVsIGFycml2ZXMuXG4gICAgICogQHBhcmFtIGNoYW5uZWwgdGhlIGNoYW5uZWwgdGhlIGxpc3RlbmVyIGlzIGludGVyZXN0ZWQgdG9cbiAgICAgKiBAcGFyYW0gc2NvcGUgdGhlIHNjb3BlIG9mIHRoZSBjYWxsYmFjaywgbWF5IGJlIG9taXR0ZWRcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgY2hhbm5lbFxuICAgICAqIEByZXR1cm5zIHRoZSBzdWJzY3JpcHRpb24gaGFuZGxlIHRvIGJlIHBhc3NlZCB0byB7QGxpbmsgI3JlbW92ZUxpc3RlbmVyKG9iamVjdCl9XG4gICAgICogQHNlZSAjcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKVxuICAgICAqL1xuICAgIHRoaXMuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAyLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGNoYW5uZWwgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIHN1YnNjcmlwdGlvbiBvYnRhaW5lZCB3aXRoIGEgY2FsbCB0byB7QGxpbmsgI2FkZExpc3RlbmVyKHN0cmluZywgb2JqZWN0LCBmdW5jdGlvbil9LlxuICAgICAqIEBwYXJhbSBzdWJzY3JpcHRpb24gdGhlIHN1YnNjcmlwdGlvbiB0byB1bnN1YnNjcmliZS5cbiAgICAgKiBAc2VlICNhZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spXG4gICAgICovXG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAvLyBCZXdhcmUgb2Ygc3Vic2NyaXB0aW9uLmlkID09IDAsIHdoaWNoIGlzIGZhbHN5ID0+IGNhbm5vdCB1c2UgIXN1YnNjcmlwdGlvbi5pZFxuICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbiB8fCAhc3Vic2NyaXB0aW9uLmNoYW5uZWwgfHwgIShcImlkXCIgaW4gc3Vic2NyaXB0aW9uKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgYXJndW1lbnQ6IGV4cGVjdGVkIHN1YnNjcmlwdGlvbiwgbm90ICcgKyBzdWJzY3JpcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBfcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgd2l0aCB7QGxpbmsgI2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjayl9IG9yXG4gICAgICoge0BsaW5rICNzdWJzY3JpYmUoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKX0uXG4gICAgICovXG4gICAgdGhpcy5jbGVhckxpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfbGlzdGVuZXJzID0ge307XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZXMgdG8gdGhlIGdpdmVuIGNoYW5uZWwsIHBlcmZvcm1pbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGluIHRoZSBnaXZlbiBzY29wZVxuICAgICAqIHdoZW4gYSBtZXNzYWdlIGZvciB0aGUgY2hhbm5lbCBhcnJpdmVzLlxuICAgICAqIEBwYXJhbSBjaGFubmVsIHRoZSBjaGFubmVsIHRvIHN1YnNjcmliZSB0b1xuICAgICAqIEBwYXJhbSBzY29wZSB0aGUgc2NvcGUgb2YgdGhlIGNhbGxiYWNrLCBtYXkgYmUgb21pdHRlZFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBjaGFubmVsXG4gICAgICogQHBhcmFtIHN1YnNjcmliZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgc3Vic2NyaWJlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gc3Vic2NyaWJlQ2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHN1YnNjcmlwdGlvbiBpcyBhY2tub3dsZWRnZWRcbiAgICAgKiBAcmV0dXJuIHRoZSBzdWJzY3JpcHRpb24gaGFuZGxlIHRvIGJlIHBhc3NlZCB0byB7QGxpbmsgI3Vuc3Vic2NyaWJlKG9iamVjdCl9XG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpYmUgPSBmdW5jdGlvbihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzLCBzdWJzY3JpYmVDYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDIsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogY2hhbm5lbCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3JtYWxpemUgYXJndW1lbnRzXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihzY29wZSkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZUNhbGxiYWNrID0gc3Vic2NyaWJlUHJvcHM7XG4gICAgICAgICAgICBzdWJzY3JpYmVQcm9wcyA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBzY29wZTtcbiAgICAgICAgICAgIHNjb3BlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihzdWJzY3JpYmVQcm9wcykpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZUNhbGxiYWNrID0gc3Vic2NyaWJlUHJvcHM7XG4gICAgICAgICAgICBzdWJzY3JpYmVQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgc2VuZCB0aGUgbWVzc2FnZSB0byB0aGUgc2VydmVyIGlmIHRoaXMgY2xpZW50IGhhcyBub3QgeWV0IHN1YnNjcmliZWQgdG8gdGhlIGNoYW5uZWxcbiAgICAgICAgdmFyIHNlbmQgPSAhX2hhc1N1YnNjcmlwdGlvbnMoY2hhbm5lbCk7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IF9hZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIGZhbHNlKTtcblxuICAgICAgICBpZiAoc2VuZCkge1xuICAgICAgICAgICAgLy8gU2VuZCB0aGUgc3Vic2NyaXB0aW9uIG1lc3NhZ2UgYWZ0ZXIgdGhlIHN1YnNjcmlwdGlvbiByZWdpc3RyYXRpb24gdG8gYXZvaWRcbiAgICAgICAgICAgIC8vIHJhY2VzIHdoZXJlIHRoZSBzZXJ2ZXIgd291bGQgc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHN1YnNjcmliZXJzLCBidXQgaGVyZVxuICAgICAgICAgICAgLy8gb24gdGhlIGNsaWVudCB0aGUgc3Vic2NyaXB0aW9uIGhhcyBub3QgYmVlbiBhZGRlZCB5ZXQgdG8gdGhlIGRhdGEgc3RydWN0dXJlc1xuICAgICAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL3N1YnNjcmliZScsXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uOiBjaGFubmVsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgc3Vic2NyaWJlUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIHN1YnNjcmliZUNhbGxiYWNrKTtcblxuICAgICAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVuc3Vic2NyaWJlcyB0aGUgc3Vic2NyaXB0aW9uIG9idGFpbmVkIHdpdGggYSBjYWxsIHRvIHtAbGluayAjc3Vic2NyaWJlKHN0cmluZywgb2JqZWN0LCBmdW5jdGlvbil9LlxuICAgICAqIEBwYXJhbSBzdWJzY3JpcHRpb24gdGhlIHN1YnNjcmlwdGlvbiB0byB1bnN1YnNjcmliZS5cbiAgICAgKiBAcGFyYW0gdW5zdWJzY3JpYmVQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIHVuc3Vic2NyaWJlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gdW5zdWJzY3JpYmVDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgdW5zdWJzY3JpcHRpb24gaXMgYWNrbm93bGVkZ2VkXG4gICAgICovXG4gICAgdGhpcy51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbiwgdW5zdWJzY3JpYmVQcm9wcywgdW5zdWJzY3JpYmVDYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDEsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24odW5zdWJzY3JpYmVQcm9wcykpIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlQ2FsbGJhY2sgPSB1bnN1YnNjcmliZVByb3BzO1xuICAgICAgICAgICAgdW5zdWJzY3JpYmVQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbG9jYWwgbGlzdGVuZXIgYmVmb3JlIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgaWYgdGhlIHNlcnZlciBmYWlscywgdGhpcyBjbGllbnQgZG9lcyBub3QgZ2V0IG5vdGlmaWNhdGlvbnNcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pO1xuXG4gICAgICAgIHZhciBjaGFubmVsID0gc3Vic2NyaXB0aW9uLmNoYW5uZWw7XG4gICAgICAgIC8vIE9ubHkgc2VuZCB0aGUgbWVzc2FnZSB0byB0aGUgc2VydmVyIGlmIHRoaXMgY2xpZW50IHVuc3Vic2NyaWJlcyB0aGUgbGFzdCBzdWJzY3JpcHRpb25cbiAgICAgICAgaWYgKCFfaGFzU3Vic2NyaXB0aW9ucyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL3Vuc3Vic2NyaWJlJyxcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb246IGNoYW5uZWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCB1bnN1YnNjcmliZVByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCB1bnN1YnNjcmliZUNhbGxiYWNrKTtcblxuICAgICAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlc3Vic2NyaWJlID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uLCBzdWJzY3JpYmVQcm9wcykge1xuICAgICAgICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbik7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZShzdWJzY3JpcHRpb24uY2hhbm5lbCwgc3Vic2NyaXB0aW9uLnNjb3BlLCBzdWJzY3JpcHRpb24uY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGFkZGVkIHZpYSB7QGxpbmsgI3N1YnNjcmliZShjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzKX0sXG4gICAgICogYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgbGlzdGVuZXJzIGFkZGVkIHZpYSB7QGxpbmsgYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKX0uXG4gICAgICovXG4gICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2NsZWFyU3Vic2NyaXB0aW9ucygpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgYSBtZXNzYWdlIG9uIHRoZSBnaXZlbiBjaGFubmVsLCBjb250YWluaW5nIHRoZSBnaXZlbiBjb250ZW50LlxuICAgICAqIEBwYXJhbSBjaGFubmVsIHRoZSBjaGFubmVsIHRvIHB1Ymxpc2ggdGhlIG1lc3NhZ2UgdG9cbiAgICAgKiBAcGFyYW0gY29udGVudCB0aGUgY29udGVudCBvZiB0aGUgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBwdWJsaXNoUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBwdWJsaXNoIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gcHVibGlzaENhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBwdWJsaXNoIGlzIGFja25vd2xlZGdlZCBieSB0aGUgc2VydmVyXG4gICAgICovXG4gICAgdGhpcy5wdWJsaXNoID0gZnVuY3Rpb24oY2hhbm5lbCwgY29udGVudCwgcHVibGlzaFByb3BzLCBwdWJsaXNoQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAxLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGNoYW5uZWwgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9eXFwvbWV0YVxcLy8udGVzdChjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQ6IGNhbm5vdCBwdWJsaXNoIHRvIG1ldGEgY2hhbm5lbHMnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgc3RhdGU6IGFscmVhZHkgZGlzY29ubmVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjb250ZW50KSkge1xuICAgICAgICAgICAgcHVibGlzaENhbGxiYWNrID0gY29udGVudDtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBwdWJsaXNoUHJvcHMgPSB7fTtcbiAgICAgICAgfSBlbHNlIGlmIChfaXNGdW5jdGlvbihwdWJsaXNoUHJvcHMpKSB7XG4gICAgICAgICAgICBwdWJsaXNoQ2FsbGJhY2sgPSBwdWJsaXNoUHJvcHM7XG4gICAgICAgICAgICBwdWJsaXNoUHJvcHMgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgZGF0YTogY29udGVudFxuICAgICAgICB9O1xuICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIHB1Ymxpc2hQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIHB1Ymxpc2hDYWxsYmFjayk7XG5cbiAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW1vdGVDYWxsID0gZnVuY3Rpb24odGFyZ2V0LCBjb250ZW50LCB0aW1lb3V0LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDEsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiB0YXJnZXQgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBzdGF0ZTogYWxyZWFkeSBkaXNjb25uZWN0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNvbnRlbnQpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNvbnRlbnQ7XG4gICAgICAgICAgICBjb250ZW50ID0ge307XG4gICAgICAgICAgICB0aW1lb3V0ID0gX2NvbmZpZy5tYXhOZXR3b3JrRGVsYXk7XG4gICAgICAgIH0gZWxzZSBpZiAoX2lzRnVuY3Rpb24odGltZW91dCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGltZW91dDtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBfY29uZmlnLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdGltZW91dCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IHRpbWVvdXQgbXVzdCBiZSBhIG51bWJlcic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhcmdldC5tYXRjaCgvXlxcLy8pKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSAnLycgKyB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYW5uZWwgPSAnL3NlcnZpY2UnICsgdGFyZ2V0O1xuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgZGF0YTogY29udGVudFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBjb250ZXh0ID0ge1xuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgY29udGV4dC50aW1lb3V0ID0gVXRpbHMuc2V0VGltZW91dChfY29tZXRkLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVGltaW5nIG91dCByZW1vdGUgY2FsbCcsIGJheWV1eE1lc3NhZ2UsICdhZnRlcicsIHRpbWVvdXQsICdtcycpO1xuICAgICAgICAgICAgICAgIF9mYWlsTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBiYXlldXhNZXNzYWdlLmlkLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJzQwNjo6dGltZW91dCcsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlIDogYmF5ZXV4TWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ1JlbW90ZSBDYWxsIFRpbWVvdXQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1NjaGVkdWxlZCByZW1vdGUgY2FsbCB0aW1lb3V0JywgYmF5ZXV4TWVzc2FnZSwgJ2luJywgdGltZW91dCwgJ21zJyk7XG4gICAgICAgIH1cbiAgICAgICAgX3JlbW90ZUNhbGxzW2JheWV1eE1lc3NhZ2UuaWRdID0gY29udGV4dDtcblxuICAgICAgICBfcXVldWVTZW5kKGJheWV1eE1lc3NhZ2UpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc3RhdHVzIG9mIHRoZSBiYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfc3RhdHVzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBpbnN0YW5jZSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuXG4gICAgICovXG4gICAgdGhpcy5pc0Rpc2Nvbm5lY3RlZCA9IF9pc0Rpc2Nvbm5lY3RlZDtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGJhY2tvZmYgcGVyaW9kIHVzZWQgdG8gaW5jcmVhc2UgdGhlIGJhY2tvZmYgdGltZSB3aGVuIHJldHJ5aW5nIGFuIHVuc3VjY2Vzc2Z1bCBvciBmYWlsZWQgbWVzc2FnZS5cbiAgICAgKiBEZWZhdWx0IHZhbHVlIGlzIDEgc2Vjb25kLCB3aGljaCBtZWFucyBpZiB0aGVyZSBpcyBhIHBlcnNpc3RlbnQgZmFpbHVyZSB0aGUgcmV0cmllcyB3aWxsIGhhcHBlblxuICAgICAqIGFmdGVyIDEgc2Vjb25kLCB0aGVuIGFmdGVyIDIgc2Vjb25kcywgdGhlbiBhZnRlciAzIHNlY29uZHMsIGV0Yy4gU28gZm9yIGV4YW1wbGUgd2l0aCAxNSBzZWNvbmRzIG9mXG4gICAgICogZWxhcHNlZCB0aW1lLCB0aGVyZSB3aWxsIGJlIDUgcmV0cmllcyAoYXQgMSwgMywgNiwgMTAgYW5kIDE1IHNlY29uZHMgZWxhcHNlZCkuXG4gICAgICogQHBhcmFtIHBlcmlvZCB0aGUgYmFja29mZiBwZXJpb2QgdG8gc2V0XG4gICAgICogQHNlZSAjZ2V0QmFja29mZkluY3JlbWVudCgpXG4gICAgICovXG4gICAgdGhpcy5zZXRCYWNrb2ZmSW5jcmVtZW50ID0gZnVuY3Rpb24ocGVyaW9kKSB7XG4gICAgICAgIF9jb25maWcuYmFja29mZkluY3JlbWVudCA9IHBlcmlvZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYmFja29mZiBwZXJpb2QgdXNlZCB0byBpbmNyZWFzZSB0aGUgYmFja29mZiB0aW1lIHdoZW4gcmV0cnlpbmcgYW4gdW5zdWNjZXNzZnVsIG9yIGZhaWxlZCBtZXNzYWdlLlxuICAgICAqIEBzZWUgI3NldEJhY2tvZmZJbmNyZW1lbnQocGVyaW9kKVxuICAgICAqL1xuICAgIHRoaXMuZ2V0QmFja29mZkluY3JlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbmZpZy5iYWNrb2ZmSW5jcmVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYWNrb2ZmIHBlcmlvZCB0byB3YWl0IGJlZm9yZSByZXRyeWluZyBhbiB1bnN1Y2Nlc3NmdWwgb3IgZmFpbGVkIG1lc3NhZ2UuXG4gICAgICovXG4gICAgdGhpcy5nZXRCYWNrb2ZmUGVyaW9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfYmFja29mZjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2VzIHRoZSBiYWNrb2ZmIHBlcmlvZCB1cCB0byB0aGUgbWF4aW11bSB2YWx1ZSBjb25maWd1cmVkLlxuICAgICAqIEByZXR1cm5zIHRoZSBiYWNrb2ZmIHBlcmlvZCBhZnRlciBpbmNyZW1lbnRcbiAgICAgKiBAc2VlIGdldEJhY2tvZmZJbmNyZW1lbnRcbiAgICAgKi9cbiAgICB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2luY3JlYXNlQmFja29mZigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGJhY2tvZmYgcGVyaW9kIHRvIHplcm8uXG4gICAgICovXG4gICAgdGhpcy5yZXNldEJhY2tvZmZQZXJpb2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBsb2cgbGV2ZWwgZm9yIGNvbnNvbGUgbG9nZ2luZy5cbiAgICAgKiBWYWxpZCB2YWx1ZXMgYXJlIHRoZSBzdHJpbmdzICdlcnJvcicsICd3YXJuJywgJ2luZm8nIGFuZCAnZGVidWcnLCBmcm9tXG4gICAgICogbGVzcyB2ZXJib3NlIHRvIG1vcmUgdmVyYm9zZS5cbiAgICAgKiBAcGFyYW0gbGV2ZWwgdGhlIGxvZyBsZXZlbCBzdHJpbmdcbiAgICAgKi9cbiAgICB0aGlzLnNldExvZ0xldmVsID0gZnVuY3Rpb24obGV2ZWwpIHtcbiAgICAgICAgX2NvbmZpZy5sb2dMZXZlbCA9IGxldmVsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYW4gZXh0ZW5zaW9uIHdob3NlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGZvciBldmVyeSBpbmNvbWluZyBtZXNzYWdlXG4gICAgICogKHRoYXQgY29tZXMgZnJvbSB0aGUgc2VydmVyIHRvIHRoaXMgY2xpZW50IGltcGxlbWVudGF0aW9uKSBhbmQgZm9yIGV2ZXJ5XG4gICAgICogb3V0Z29pbmcgbWVzc2FnZSAodGhhdCBvcmlnaW5hdGVzIGZyb20gdGhpcyBjbGllbnQgaW1wbGVtZW50YXRpb24gZm9yIHRoZVxuICAgICAqIHNlcnZlcikuXG4gICAgICogVGhlIGZvcm1hdCBvZiB0aGUgZXh0ZW5zaW9uIG9iamVjdCBpcyB0aGUgZm9sbG93aW5nOlxuICAgICAqIDxwcmU+XG4gICAgICoge1xuICAgICAqICAgICBpbmNvbWluZzogZnVuY3Rpb24obWVzc2FnZSkgeyAuLi4gfSxcbiAgICAgKiAgICAgb3V0Z29pbmc6IGZ1bmN0aW9uKG1lc3NhZ2UpIHsgLi4uIH1cbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQm90aCBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCwgYnV0IGlmIHRoZXkgYXJlIHByZXNlbnQgdGhleSB3aWxsIGJlIGNhbGxlZFxuICAgICAqIHJlc3BlY3RpdmVseSBmb3IgZWFjaCBpbmNvbWluZyBtZXNzYWdlIGFuZCBmb3IgZWFjaCBvdXRnb2luZyBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb25cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9uIHRoZSBleHRlbnNpb24gdG8gcmVnaXN0ZXJcbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGV4dGVuc2lvbiB3YXMgcmVnaXN0ZXJlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICogQHNlZSAjdW5yZWdpc3RlckV4dGVuc2lvbihuYW1lKVxuICAgICAqL1xuICAgIHRoaXMucmVnaXN0ZXJFeHRlbnNpb24gPSBmdW5jdGlvbihuYW1lLCBleHRlbnNpb24pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAyLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGV4dGVuc2lvbiBuYW1lIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4aXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZ0V4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nRXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFleGlzdGluZykge1xuICAgICAgICAgICAgX2V4dGVuc2lvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICBleHRlbnNpb246IGV4dGVuc2lvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnUmVnaXN0ZXJlZCBleHRlbnNpb24nLCBuYW1lKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGV4dGVuc2lvbnNcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihleHRlbnNpb24ucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb24ucmVnaXN0ZXJlZChuYW1lLCB0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pbmZvKCdDb3VsZCBub3QgcmVnaXN0ZXIgZXh0ZW5zaW9uIHdpdGggbmFtZScsIG5hbWUsICdzaW5jZSBhbm90aGVyIGV4dGVuc2lvbiB3aXRoIHRoZSBzYW1lIG5hbWUgYWxyZWFkeSBleGlzdHMnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbnJlZ2lzdGVyIGFuIGV4dGVuc2lvbiBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgd2l0aFxuICAgICAqIHtAbGluayAjcmVnaXN0ZXJFeHRlbnNpb24obmFtZSwgZXh0ZW5zaW9uKX0uXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbiB0byB1bnJlZ2lzdGVyLlxuICAgICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgZXh0ZW5zaW9uIHdhcyB1bnJlZ2lzdGVyZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHRoaXMudW5yZWdpc3RlckV4dGVuc2lvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKCFfaXNTdHJpbmcobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGV4dGVuc2lvbiBuYW1lIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVucmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICBfZXh0ZW5zaW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgdW5yZWdpc3RlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVW5yZWdpc3RlcmVkIGV4dGVuc2lvbicsIG5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gZXh0ZW5zaW9uLmV4dGVuc2lvbjtcbiAgICAgICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oZXh0LnVucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0LnVucmVnaXN0ZXJlZCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bnJlZ2lzdGVyZWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIGV4dGVuc2lvbiByZWdpc3RlcmVkIHdpdGggdGhlIGdpdmVuIG5hbWUuXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbiB0byBmaW5kXG4gICAgICogQHJldHVybiB0aGUgZXh0ZW5zaW9uIGZvdW5kIG9yIG51bGwgaWYgbm8gZXh0ZW5zaW9uIHdpdGggdGhlIGdpdmVuIG5hbWUgaGFzIGJlZW4gcmVnaXN0ZXJlZFxuICAgICAqL1xuICAgIHRoaXMuZ2V0RXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZW5zaW9uLmV4dGVuc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmFtZSBhc3NpZ25lZCB0byB0aGlzIENvbWV0RCBvYmplY3QsIG9yIHRoZSBzdHJpbmcgJ2RlZmF1bHQnXG4gICAgICogaWYgbm8gbmFtZSBoYXMgYmVlbiBleHBsaWNpdGx5IHBhc3NlZCBhcyBwYXJhbWV0ZXIgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0TmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX25hbWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNsaWVudElkIGFzc2lnbmVkIGJ5IHRoZSBCYXlldXggc2VydmVyIGR1cmluZyBoYW5kc2hha2UuXG4gICAgICovXG4gICAgdGhpcy5nZXRDbGllbnRJZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NsaWVudElkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICovXG4gICAgdGhpcy5nZXRVUkwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfdHJhbnNwb3J0LmdldFVSTCgpO1xuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cmwgPSBfY29uZmlnLnVybHNbX3RyYW5zcG9ydC5nZXRUeXBlKCldO1xuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9jb25maWcudXJsO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyYW5zcG9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RyYW5zcG9ydDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taXhpbih0cnVlLCB7fSwgX2NvbmZpZyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0QWR2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taXhpbih0cnVlLCB7fSwgX2FkdmljZSk7XG4gICAgfTtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKTtcbnZhciBSZXF1ZXN0VHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9SZXF1ZXN0VHJhbnNwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF9zdXBlciA9IG5ldyBSZXF1ZXN0VHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuICAgIC8vIEJ5IGRlZmF1bHQsIHN1cHBvcnQgY3Jvc3MgZG9tYWluXG4gICAgdmFyIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gdHJ1ZTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBwb3J0c0Nyb3NzRG9tYWluIHx8ICFjcm9zc0RvbWFpbjtcbiAgICB9O1xuXG4gICAgX3NlbGYueGhyU2VuZCA9IGZ1bmN0aW9uKHBhY2tldCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc2VuZGluZyByZXF1ZXN0JywgcmVxdWVzdC5pZCwgJ2VudmVsb3BlJywgZW52ZWxvcGUpO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBzYW1lU3RhY2sgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdC54aHIgPSB0aGlzLnhoclNlbmQoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogdGhpcyxcbiAgICAgICAgICAgICAgICB1cmw6IGVudmVsb3BlLnVybCxcbiAgICAgICAgICAgICAgICBzeW5jOiBlbnZlbG9wZS5zeW5jLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLnJlcXVlc3RIZWFkZXJzLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlLm1lc3NhZ2VzKSxcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3JlY2VpdmVkIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVkID0gc2VsZi5jb252ZXJ0VG9NZXNzYWdlcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjZWl2ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cENvZGU6IDIwNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydFN1Y2Nlc3MoZW52ZWxvcGUsIHJlcXVlc3QsIHJlY2VpdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyhyZXF1ZXN0Lnhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24ocmVhc29uLCBleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAncmVjZWl2ZWQgZXJyb3InLCByZWFzb24sIGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMocmVxdWVzdC54aHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtZVN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNhbWVTdGFjayA9IGZhbHNlO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgX3N1cGVyLnJlc2V0KGluaXQpO1xuICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IHRydWU7XG4gICAgfTtcblxuICAgIHJldHVybiBfc2VsZjtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbi8qKlxuICogQmFzZSBvYmplY3Qgd2l0aCB0aGUgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIHRyYW5zcG9ydHMgYmFzZWQgb24gcmVxdWVzdHMuXG4gKiBUaGUga2V5IHJlc3BvbnNpYmlsaXR5IGlzIHRvIGFsbG93IGF0IG1vc3QgMiBvdXRzdGFuZGluZyByZXF1ZXN0cyB0byB0aGUgc2VydmVyLFxuICogdG8gYXZvaWQgdGhhdCByZXF1ZXN0cyBhcmUgc2VudCBiZWhpbmQgYSBsb25nIHBvbGwuXG4gKiBUbyBhY2hpZXZlIHRoaXMsIHdlIGhhdmUgb25lIHJlc2VydmVkIHJlcXVlc3QgZm9yIHRoZSBsb25nIHBvbGwsIGFuZCBhbGwgb3RoZXJcbiAqIHJlcXVlc3RzIGFyZSBzZXJpYWxpemVkIG9uZSBhZnRlciB0aGUgb3RoZXIuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVxdWVzdFRyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3N1cGVyID0gbmV3IFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcbiAgICB2YXIgX3JlcXVlc3RJZHMgPSAwO1xuICAgIHZhciBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gbnVsbDtcbiAgICB2YXIgX3JlcXVlc3RzID0gW107XG4gICAgdmFyIF9lbnZlbG9wZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIF9jb2FsZXNjZUVudmVsb3BlcyhlbnZlbG9wZSkge1xuICAgICAgICB3aGlsZSAoX2VudmVsb3Blcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZW52ZWxvcGVBbmRSZXF1ZXN0ID0gX2VudmVsb3Blc1swXTtcbiAgICAgICAgICAgIHZhciBuZXdFbnZlbG9wZSA9IGVudmVsb3BlQW5kUmVxdWVzdFswXTtcbiAgICAgICAgICAgIHZhciBuZXdSZXF1ZXN0ID0gZW52ZWxvcGVBbmRSZXF1ZXN0WzFdO1xuICAgICAgICAgICAgaWYgKG5ld0VudmVsb3BlLnVybCA9PT0gZW52ZWxvcGUudXJsICYmXG4gICAgICAgICAgICAgICAgbmV3RW52ZWxvcGUuc3luYyA9PT0gZW52ZWxvcGUuc3luYykge1xuICAgICAgICAgICAgICAgIF9lbnZlbG9wZXMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5tZXNzYWdlcyA9IGVudmVsb3BlLm1lc3NhZ2VzLmNvbmNhdChuZXdFbnZlbG9wZS5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0NvYWxlc2NlZCcsIG5ld0VudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aCwgJ21lc3NhZ2VzIGZyb20gcmVxdWVzdCcsIG5ld1JlcXVlc3QuaWQpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdHJhbnNwb3J0U2VuZChlbnZlbG9wZSwgcmVxdWVzdCkge1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFNlbmQoZW52ZWxvcGUsIHJlcXVlc3QpO1xuICAgICAgICByZXF1ZXN0LmV4cGlyZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWVudmVsb3BlLnN5bmMpIHtcbiAgICAgICAgICAgIHZhciBtYXhEZWxheSA9IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgICAgIHZhciBkZWxheSA9IG1heERlbGF5O1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QubWV0YUNvbm5lY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkZWxheSArPSB0aGlzLmdldEFkdmljZSgpLnRpbWVvdXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3dhaXRpbmcgYXQgbW9zdCcsIGRlbGF5LCAnbXMgZm9yIHRoZSByZXNwb25zZSwgbWF4TmV0d29ya0RlbGF5JywgbWF4RGVsYXkpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICByZXF1ZXN0LnRpbWVvdXQgPSB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5leHBpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gJ1JlcXVlc3QgJyArIHJlcXVlc3QuaWQgKyAnIG9mIHRyYW5zcG9ydCAnICsgc2VsZi5nZXRUeXBlKCkgKyAnIGV4Y2VlZGVkICcgKyBkZWxheSArICcgbXMgbWF4IG5ldHdvcmsgZGVsYXknO1xuICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICByZWFzb246IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHhociA9IHJlcXVlc3QueGhyO1xuICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyh4aHIpO1xuICAgICAgICAgICAgICAgIHNlbGYuYWJvcnRYSFIoeGhyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1ZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuY29tcGxldGUocmVxdWVzdCwgZmFsc2UsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm9uRmFpbHVyZSh4aHIsIGVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9xdWV1ZVNlbmQoZW52ZWxvcGUpIHtcbiAgICAgICAgdmFyIHJlcXVlc3RJZCA9ICsrX3JlcXVlc3RJZHM7XG4gICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgaWQ6IHJlcXVlc3RJZCxcbiAgICAgICAgICAgIG1ldGFDb25uZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGVudmVsb3BlOiBlbnZlbG9wZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbnNpZGVyIHRoZSBtZXRhQ29ubmVjdCByZXF1ZXN0cyB3aGljaCBzaG91bGQgYWx3YXlzIGJlIHByZXNlbnRcbiAgICAgICAgaWYgKF9yZXF1ZXN0cy5sZW5ndGggPCB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhDb25uZWN0aW9ucyAtIDEpIHtcbiAgICAgICAgICAgIF9yZXF1ZXN0cy5wdXNoKHJlcXVlc3QpO1xuICAgICAgICAgICAgX3RyYW5zcG9ydFNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSwgcmVxdWVzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdxdWV1ZWluZyByZXF1ZXN0JywgcmVxdWVzdElkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZSk7XG4gICAgICAgICAgICBfZW52ZWxvcGVzLnB1c2goW2VudmVsb3BlLCByZXF1ZXN0XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWV0YUNvbm5lY3RDb21wbGV0ZShyZXF1ZXN0KSB7XG4gICAgICAgIHZhciByZXF1ZXN0SWQgPSByZXF1ZXN0LmlkO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdtZXRhQ29ubmVjdCBjb21wbGV0ZSwgcmVxdWVzdCcsIHJlcXVlc3RJZCk7XG4gICAgICAgIGlmIChfbWV0YUNvbm5lY3RSZXF1ZXN0ICE9PSBudWxsICYmIF9tZXRhQ29ubmVjdFJlcXVlc3QuaWQgIT09IHJlcXVlc3RJZCkge1xuICAgICAgICAgICAgdGhyb3cgJ0xvbmdwb2xsIHJlcXVlc3QgbWlzbWF0Y2gsIGNvbXBsZXRpbmcgcmVxdWVzdCAnICsgcmVxdWVzdElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzZXQgbWV0YUNvbm5lY3QgcmVxdWVzdFxuICAgICAgICBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29tcGxldGUocmVxdWVzdCwgc3VjY2Vzcykge1xuICAgICAgICB2YXIgaW5kZXggPSBVdGlscy5pbkFycmF5KHJlcXVlc3QsIF9yZXF1ZXN0cyk7XG4gICAgICAgIC8vIFRoZSBpbmRleCBjYW4gYmUgbmVnYXRpdmUgaWYgdGhlIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZFxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgX3JlcXVlc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2VudmVsb3Blcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZW52ZWxvcGVBbmRSZXF1ZXN0ID0gX2VudmVsb3Blcy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIG5leHRFbnZlbG9wZSA9IGVudmVsb3BlQW5kUmVxdWVzdFswXTtcbiAgICAgICAgICAgIHZhciBuZXh0UmVxdWVzdCA9IGVudmVsb3BlQW5kUmVxdWVzdFsxXTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQgZGVxdWV1ZWQgcmVxdWVzdCcsIG5leHRSZXF1ZXN0LmlkKTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLmF1dG9CYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBfY29hbGVzY2VFbnZlbG9wZXMuY2FsbCh0aGlzLCBuZXh0RW52ZWxvcGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcXVldWVTZW5kLmNhbGwodGhpcywgbmV4dEVudmVsb3BlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0IGNvbXBsZXRlZCByZXF1ZXN0JywgcmVxdWVzdC5pZCwgbmV4dEVudmVsb3BlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbXBsZXRlKG5leHRSZXF1ZXN0LCBmYWxzZSwgbmV4dFJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ1ByZXZpb3VzIHJlcXVlc3QgZmFpbGVkJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgeGhyID0gbmV4dFJlcXVlc3QueGhyO1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVudmVsb3BlLm9uRmFpbHVyZSh4aHIsIG5leHRFbnZlbG9wZS5tZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfc2VsZi5jb21wbGV0ZSA9IGZ1bmN0aW9uKHJlcXVlc3QsIHN1Y2Nlc3MsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgX21ldGFDb25uZWN0Q29tcGxldGUuY2FsbCh0aGlzLCByZXF1ZXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9jb21wbGV0ZS5jYWxsKHRoaXMsIHJlcXVlc3QsIHN1Y2Nlc3MpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgc2VuZCBkZXBlbmRpbmcgb24gdGhlIHRyYW5zcG9ydCB0eXBlIGRldGFpbHMuXG4gICAgICogQHBhcmFtIGVudmVsb3BlIHRoZSBlbnZlbG9wZSB0byBzZW5kXG4gICAgICogQHBhcmFtIHJlcXVlc3QgdGhlIHJlcXVlc3QgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgX3NlbGYudHJhbnNwb3J0U3VjY2VzcyA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0LCByZXNwb25zZXMpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmV4cGlyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlKHJlcXVlc3QsIHRydWUsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlcyAmJiByZXNwb25zZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm9uU3VjY2VzcyhyZXNwb25zZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5vbkZhaWx1cmUocmVxdWVzdC54aHIsIGVudmVsb3BlLm1lc3NhZ2VzLCB7XG4gICAgICAgICAgICAgICAgICAgIGh0dHBDb2RlOiAyMDRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi50cmFuc3BvcnRGYWlsdXJlID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QsIGZhaWx1cmUpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmV4cGlyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlKHJlcXVlc3QsIGZhbHNlLCByZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIGVudmVsb3BlLm9uRmFpbHVyZShyZXF1ZXN0LnhociwgZW52ZWxvcGUubWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9tZXRhQ29ubmVjdFNlbmQoZW52ZWxvcGUpIHtcbiAgICAgICAgaWYgKF9tZXRhQ29ubmVjdFJlcXVlc3QgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93ICdDb25jdXJyZW50IG1ldGFDb25uZWN0IHJlcXVlc3RzIG5vdCBhbGxvd2VkLCByZXF1ZXN0IGlkPScgKyBfbWV0YUNvbm5lY3RSZXF1ZXN0LmlkICsgJyBub3QgeWV0IGNvbXBsZXRlZCc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVxdWVzdElkID0gKytfcmVxdWVzdElkcztcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnbWV0YUNvbm5lY3Qgc2VuZCwgcmVxdWVzdCcsIHJlcXVlc3RJZCwgJ2VudmVsb3BlJywgZW52ZWxvcGUpO1xuICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIGlkOiByZXF1ZXN0SWQsXG4gICAgICAgICAgICBtZXRhQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIGVudmVsb3BlOiBlbnZlbG9wZVxuICAgICAgICB9O1xuICAgICAgICBfdHJhbnNwb3J0U2VuZC5jYWxsKHRoaXMsIGVudmVsb3BlLCByZXF1ZXN0KTtcbiAgICAgICAgX21ldGFDb25uZWN0UmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgfVxuXG4gICAgX3NlbGYuc2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICBpZiAobWV0YUNvbm5lY3QpIHtcbiAgICAgICAgICAgIF9tZXRhQ29ubmVjdFNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcXVldWVTZW5kLmNhbGwodGhpcywgZW52ZWxvcGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9zdXBlci5hYm9ydCgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9yZXF1ZXN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBfcmVxdWVzdHNbaV07XG4gICAgICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdBYm9ydGluZyByZXF1ZXN0JywgcmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmFib3J0WEhSKHJlcXVlc3QueGhyKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydEZhaWx1cmUocmVxdWVzdC5lbnZlbG9wZSwgcmVxdWVzdCwge3JlYXNvbjogJ2Fib3J0J30pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoX21ldGFDb25uZWN0UmVxdWVzdCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0Fib3J0aW5nIG1ldGFDb25uZWN0IHJlcXVlc3QnLCBfbWV0YUNvbm5lY3RSZXF1ZXN0KTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hYm9ydFhIUihfbWV0YUNvbm5lY3RSZXF1ZXN0LnhocikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydEZhaWx1cmUoX21ldGFDb25uZWN0UmVxdWVzdC5lbnZlbG9wZSwgX21ldGFDb25uZWN0UmVxdWVzdCwge3JlYXNvbjogJ2Fib3J0J30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gICAgfTtcblxuICAgIF9zZWxmLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBfc3VwZXIucmVzZXQoaW5pdCk7XG4gICAgICAgIF9tZXRhQ29ubmVjdFJlcXVlc3QgPSBudWxsO1xuICAgICAgICBfcmVxdWVzdHMgPSBbXTtcbiAgICAgICAgX2VudmVsb3BlcyA9IFtdO1xuICAgIH07XG5cbiAgICBfc2VsZi5hYm9ydFhIUiA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICBpZiAoeGhyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHhoci5yZWFkeVN0YXRlO1xuICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZSAhPT0gWE1MSHR0cFJlcXVlc3QuVU5TRU5UO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgX3NlbGYueGhyU3RhdHVzID0gZnVuY3Rpb24oeGhyKSB7XG4gICAgICAgIGlmICh4aHIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhoci5zdGF0dXM7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbi8qKlxuICogQmFzZSBvYmplY3Qgd2l0aCB0aGUgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIHRyYW5zcG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVHJhbnNwb3J0KCkge1xuICAgIHZhciBfdHlwZTtcbiAgICB2YXIgX2NvbWV0ZDtcbiAgICB2YXIgX3VybDtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIGludm9rZWQganVzdCBhZnRlciBhIHRyYW5zcG9ydCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZC5cbiAgICAgKiBAcGFyYW0gdHlwZSB0aGUgdHlwZSBvZiB0cmFuc3BvcnQgKGZvciBleGFtcGxlICdsb25nLXBvbGxpbmcnKVxuICAgICAqIEBwYXJhbSBjb21ldGQgdGhlIGNvbWV0ZCBvYmplY3QgdGhpcyB0cmFuc3BvcnQgaGFzIGJlZW4gcmVnaXN0ZXJlZCB0b1xuICAgICAqIEBzZWUgI3VucmVnaXN0ZXJlZCgpXG4gICAgICovXG4gICAgdGhpcy5yZWdpc3RlcmVkID0gZnVuY3Rpb24odHlwZSwgY29tZXRkKSB7XG4gICAgICAgIF90eXBlID0gdHlwZTtcbiAgICAgICAgX2NvbWV0ZCA9IGNvbWV0ZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gaW52b2tlZCBqdXN0IGFmdGVyIGEgdHJhbnNwb3J0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB1bnJlZ2lzdGVyZWQuXG4gICAgICogQHNlZSAjcmVnaXN0ZXJlZCh0eXBlLCBjb21ldGQpXG4gICAgICovXG4gICAgdGhpcy51bnJlZ2lzdGVyZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3R5cGUgPSBudWxsO1xuICAgICAgICBfY29tZXRkID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcuYXBwbHkoX2NvbWV0ZCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fbWl4aW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jb21ldGQuX21peGluLmFwcGx5KF9jb21ldGQsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0QWR2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY29tZXRkLmdldEFkdmljZSgpO1xuICAgIH07XG5cbiAgICB0aGlzLnNldFRpbWVvdXQgPSBmdW5jdGlvbihmdW5rdGlvbiwgZGVsYXkpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLnNldFRpbWVvdXQoX2NvbWV0ZCwgZnVua3Rpb24sIGRlbGF5KTtcbiAgICB9O1xuXG4gICAgdGhpcy5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBnaXZlbiByZXNwb25zZSBpbnRvIGFuIGFycmF5IG9mIGJheWV1eCBtZXNzYWdlc1xuICAgICAqIEBwYXJhbSByZXNwb25zZSB0aGUgcmVzcG9uc2UgdG8gY29udmVydFxuICAgICAqIEByZXR1cm4gYW4gYXJyYXkgb2YgYmF5ZXV4IG1lc3NhZ2VzIG9idGFpbmVkIGJ5IGNvbnZlcnRpbmcgdGhlIHJlc3BvbnNlXG4gICAgICovXG4gICAgdGhpcy5jb252ZXJ0VG9NZXNzYWdlcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChVdGlscy5pc1N0cmluZyhyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdDb3VsZCBub3QgY29udmVydCB0byBKU09OIHRoZSBmb2xsb3dpbmcgc3RyaW5nJywgJ1wiJyArIHJlc3BvbnNlICsgJ1wiJyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoVXRpbHMuaXNBcnJheShyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzcG9uc2UgPT09IHVuZGVmaW5lZCB8fCByZXNwb25zZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNwb25zZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtyZXNwb25zZV07XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgJ0NvbnZlcnNpb24gRXJyb3IgJyArIHJlc3BvbnNlICsgJywgdHlwZW9mICcgKyAodHlwZW9mIHJlc3BvbnNlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgdHJhbnNwb3J0IGNhbiB3b3JrIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbiBhbmQgY3Jvc3MgZG9tYWluIGNvbW11bmljYXRpb24gY2FzZS5cbiAgICAgKiBAcGFyYW0gdmVyc2lvbiBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSB0cmFuc3BvcnQgdmVyc2lvblxuICAgICAqIEBwYXJhbSBjcm9zc0RvbWFpbiBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb21tdW5pY2F0aW9uIGlzIGNyb3NzIGRvbWFpblxuICAgICAqIEBwYXJhbSB1cmwgdGhlIFVSTCB0byBjb25uZWN0IHRvXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoaXMgdHJhbnNwb3J0IGNhbiB3b3JrIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbiBhbmQgY3Jvc3MgZG9tYWluIGNvbW11bmljYXRpb24gY2FzZSxcbiAgICAgKiBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICB0aGlzLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zcG9ydC5cbiAgICAgKiBAc2VlICNyZWdpc3RlcmVkKHR5cGUsIGNvbWV0ZClcbiAgICAgKi9cbiAgICB0aGlzLmdldFR5cGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90eXBlO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3VybDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRVUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgX3VybCA9IHVybDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHlwZSwgJ3Jlc2V0JywgaW5pdCA/ICdpbml0aWFsJyA6ICdyZXRyeScpO1xuICAgIH07XG5cbiAgICB0aGlzLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHlwZSwgJ2Fib3J0ZWQnKTtcbiAgICB9O1xuXG4gICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlKCk7XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmRlcml2ZSA9IGZ1bmN0aW9uKGJhc2VPYmplY3QpIHtcbiAgICBmdW5jdGlvbiBGKCkge1xuICAgIH1cblxuICAgIEYucHJvdG90eXBlID0gYmFzZU9iamVjdDtcbiAgICByZXR1cm4gbmV3IEYoKTtcbn07XG4iLCIvKipcbiAqIEEgcmVnaXN0cnkgZm9yIHRyYW5zcG9ydHMgdXNlZCBieSB0aGUgQ29tZXREIG9iamVjdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBUcmFuc3BvcnRSZWdpc3RyeSgpIHtcbiAgICB2YXIgX3R5cGVzID0gW107XG4gICAgdmFyIF90cmFuc3BvcnRzID0ge307XG5cbiAgICB0aGlzLmdldFRyYW5zcG9ydFR5cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHlwZXMuc2xpY2UoMCk7XG4gICAgfTtcblxuICAgIHRoaXMuZmluZFRyYW5zcG9ydFR5cGVzID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IF90eXBlc1tpXTtcbiAgICAgICAgICAgIGlmIChfdHJhbnNwb3J0c1t0eXBlXS5hY2NlcHQodmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aGlzLm5lZ290aWF0ZVRyYW5zcG9ydCA9IGZ1bmN0aW9uKHR5cGVzLCB2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IF90eXBlc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdHlwZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gdHlwZXNbal0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNwb3J0LmFjY2VwdCh2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGQgPSBmdW5jdGlvbih0eXBlLCB0cmFuc3BvcnQsIGluZGV4KSB7XG4gICAgICAgIHZhciBleGlzdGluZyA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKF90eXBlc1tpXSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgX3R5cGVzLnB1c2godHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90eXBlcy5zcGxpY2UoaW5kZXgsIDAsIHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RyYW5zcG9ydHNbdHlwZV0gPSB0cmFuc3BvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIWV4aXN0aW5nO1xuICAgIH07XG5cbiAgICB0aGlzLmZpbmQgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoX3R5cGVzW2ldID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChfdHlwZXNbaV0gPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBfdHlwZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHZhciB0cmFuc3BvcnQgPSBfdHJhbnNwb3J0c1t0eXBlXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgX3RyYW5zcG9ydHNbdHlwZV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdHlwZXMgPSBbXTtcbiAgICAgICAgX3RyYW5zcG9ydHMgPSB7fTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnRzW190eXBlc1tpXV0ucmVzZXQoaW5pdCk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImV4cG9ydHMuaXNTdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufTtcblxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBBcnJheTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNvbnRhaW5lZCBpbnRvIHRoZSBnaXZlbiBhcnJheS5cbiAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGNoZWNrIHByZXNlbmNlIGZvclxuICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSB0byBjaGVjayBmb3IgdGhlIGVsZW1lbnQgcHJlc2VuY2VcbiAqIEByZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBlbGVtZW50LCBpZiBwcmVzZW50LCBvciBhIG5lZ2F0aXZlIGluZGV4IGlmIHRoZSBlbGVtZW50IGlzIG5vdCBwcmVzZW50XG4gKi9cbmV4cG9ydHMuaW5BcnJheSA9IGZ1bmN0aW9uIChlbGVtZW50LCBhcnJheSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IGFycmF5W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoY29tZXRkLCBmdW5rdGlvbiwgZGVsYXkpIHtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbWV0ZC5fZGVidWcoJ0ludm9raW5nIHRpbWVkIGZ1bmN0aW9uJywgZnVua3Rpb24pO1xuICAgICAgICAgICAgZnVua3Rpb24oKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgY29tZXRkLl9kZWJ1ZygnRXhjZXB0aW9uIGludm9raW5nIHRpbWVkIGZ1bmN0aW9uJywgZnVua3Rpb24sIHgpO1xuICAgICAgICB9XG4gICAgfSwgZGVsYXkpO1xufTtcblxuZXhwb3J0cy5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAodGltZW91dEhhbmRsZSkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKTtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViU29ja2V0VHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgVHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuICAgIHZhciBfY29tZXRkO1xuICAgIC8vIEJ5IGRlZmF1bHQgV2ViU29ja2V0IGlzIHN1cHBvcnRlZFxuICAgIHZhciBfd2ViU29ja2V0U3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAvLyBXaGV0aGVyIHdlIHdlcmUgYWJsZSB0byBlc3RhYmxpc2ggYSBXZWJTb2NrZXQgY29ubmVjdGlvblxuICAgIHZhciBfd2ViU29ja2V0Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgdmFyIF9zdGlja3lSZWNvbm5lY3QgPSB0cnVlO1xuICAgIC8vIFRoZSBjb250ZXh0IGNvbnRhaW5zIHRoZSBlbnZlbG9wZXMgdGhhdCBoYXZlIGJlZW4gc2VudFxuICAgIC8vIGFuZCB0aGUgdGltZW91dHMgZm9yIHRoZSBtZXNzYWdlcyB0aGF0IGhhdmUgYmVlbiBzZW50LlxuICAgIHZhciBfY29udGV4dCA9IG51bGw7XG4gICAgdmFyIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICB2YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHZhciBfc3VjY2Vzc0NhbGxiYWNrID0gbnVsbDtcblxuICAgIF9zZWxmLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBfc3VwZXIucmVzZXQoaW5pdCk7XG4gICAgICAgIF93ZWJTb2NrZXRTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoaW5pdCkge1xuICAgICAgICAgICAgX3dlYlNvY2tldENvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIF9zdGlja3lSZWNvbm5lY3QgPSB0cnVlO1xuICAgICAgICBfY29udGV4dCA9IG51bGw7XG4gICAgICAgIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZm9yY2VDbG9zZShjb250ZXh0LCBldmVudCkge1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy53ZWJTb2NrZXRDbG9zZShjb250ZXh0LCBldmVudC5jb2RlLCBldmVudC5yZWFzb24pO1xuICAgICAgICAgICAgLy8gRm9yY2UgaW1tZWRpYXRlIGZhaWx1cmUgb2YgcGVuZGluZyBtZXNzYWdlcyB0byB0cmlnZ2VyIHJlY29ubmVjdC5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIHNlcnZlciBtYXkgbm90IHJlcGx5IHRvIG91ciBjbG9zZSgpXG4gICAgICAgICAgICAvLyBhbmQgdGhlcmVmb3JlIHRoZSBvbmNsb3NlIGZ1bmN0aW9uIGlzIG5ldmVyIGNhbGxlZC5cbiAgICAgICAgICAgIHRoaXMub25DbG9zZShjb250ZXh0LCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc2FtZUNvbnRleHQoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gY29udGV4dCA9PT0gX2Nvbm5lY3RpbmcgfHwgY29udGV4dCA9PT0gX2NvbnRleHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N0b3JlRW52ZWxvcGUoY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHZhciBtZXNzYWdlSWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZW52ZWxvcGUubWVzc2FnZXNbaV07XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmVudmVsb3Blc1ttZXNzYWdlSWRzLmpvaW4oJywnKV0gPSBbZW52ZWxvcGUsIG1ldGFDb25uZWN0XTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc3RvcmVkIGVudmVsb3BlLCBlbnZlbG9wZXMnLCBjb250ZXh0LmVudmVsb3Blcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3dlYnNvY2tldENvbm5lY3QoY29udGV4dCkge1xuICAgICAgICAvLyBXZSBtYXkgaGF2ZSBtdWx0aXBsZSBhdHRlbXB0cyB0byBvcGVuIGEgV2ViU29ja2V0XG4gICAgICAgIC8vIGNvbm5lY3Rpb24sIGZvciBleGFtcGxlIGEgL21ldGEvY29ubmVjdCByZXF1ZXN0IHRoYXRcbiAgICAgICAgLy8gbWF5IHRha2UgdGltZSwgYWxvbmcgd2l0aCBhIHVzZXItdHJpZ2dlcmVkIHB1Ymxpc2guXG4gICAgICAgIC8vIEVhcmx5IHJldHVybiBpZiB3ZSBhcmUgYWxyZWFkeSBjb25uZWN0aW5nLlxuICAgICAgICBpZiAoX2Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hbmdsZSB0aGUgVVJMLCBjaGFuZ2luZyB0aGUgc2NoZW1lIGZyb20gJ2h0dHAnIHRvICd3cycuXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpLnJlcGxhY2UoL15odHRwLywgJ3dzJyk7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2Nvbm5lY3RpbmcgdG8gVVJMJywgdXJsKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCkucHJvdG9jb2w7XG4gICAgICAgICAgICBjb250ZXh0LndlYlNvY2tldCA9IHByb3RvY29sID8gbmV3IFdlYlNvY2tldCh1cmwsIHByb3RvY29sKSA6IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIF9jb25uZWN0aW5nID0gY29udGV4dDtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgX3dlYlNvY2tldFN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0V4Y2VwdGlvbiB3aGlsZSBjcmVhdGluZyBXZWJTb2NrZXQgb2JqZWN0JywgeCk7XG4gICAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgZGVmYXVsdCB1c2Ugc3RpY2t5IHJlY29ubmVjdHMuXG4gICAgICAgIF9zdGlja3lSZWNvbm5lY3QgPSBfY29tZXRkLmdldENvbmZpZ3VyYXRpb24oKS5zdGlja3lSZWNvbm5lY3QgIT09IGZhbHNlO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbm5lY3RUaW1lb3V0ID0gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCkuY29ubmVjdFRpbWVvdXQ7XG4gICAgICAgIGlmIChjb25uZWN0VGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRleHQuY29ubmVjdFRpbWVyID0gdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3RpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nIHRvIFVSTCcsIHVybCwgJzonLCBjb25uZWN0VGltZW91dCwgJ21zJyk7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gd2FzIG5vdCBvcGVuZWQsIGNsb3NlIGFueXdheS5cbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdDb25uZWN0IFRpbWVvdXQnfSk7XG4gICAgICAgICAgICB9LCBjb25uZWN0VGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb25vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnV2ViU29ja2V0IG9ub3BlbicsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuY29ubmVjdFRpbWVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVvdXQoY29udGV4dC5jb25uZWN0VGltZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3NhbWVDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIF9jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgICAgICBfd2ViU29ja2V0Q29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLm9uT3Blbihjb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHZhbGlkIGNvbm5lY3Rpb24gYWxyZWFkeSwgY2xvc2UgdGhpcyBvbmUuXG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fd2FybignQ2xvc2luZyBleHRyYSBXZWJTb2NrZXQgY29ubmVjdGlvbicsIHRoaXMsICdhY3RpdmUgY29ubmVjdGlvbicsIF9jb250ZXh0KTtcbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdFeHRyYSBDb25uZWN0aW9uJ30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoaXMgY2FsbGJhY2sgaXMgaW52b2tlZCB3aGVuIHRoZSBzZXJ2ZXIgc2VuZHMgdGhlIGNsb3NlIGZyYW1lLlxuICAgICAgICAvLyBUaGUgY2xvc2UgZnJhbWUgZm9yIGEgY29ubmVjdGlvbiBtYXkgYXJyaXZlICphZnRlciogYW5vdGhlclxuICAgICAgICAvLyBjb25uZWN0aW9uIGhhcyBiZWVuIG9wZW5lZCwgc28gd2UgbXVzdCBtYWtlIHN1cmUgdGhhdCBhY3Rpb25zXG4gICAgICAgIC8vIGFyZSBwZXJmb3JtZWQgb25seSBpZiBpdCdzIHRoZSBzYW1lIGNvbm5lY3Rpb24uXG4gICAgICAgIHZhciBvbmNsb3NlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50ID0gZXZlbnQgfHwge2NvZGU6IDEwMDB9O1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1dlYlNvY2tldCBvbmNsb3NlJywgY29udGV4dCwgZXZlbnQsICdjb25uZWN0aW5nJywgX2Nvbm5lY3RpbmcsICdjdXJyZW50JywgX2NvbnRleHQpO1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dC5jb25uZWN0VGltZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyVGltZW91dChjb250ZXh0LmNvbm5lY3RUaW1lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYub25DbG9zZShjb250ZXh0LCBldmVudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9ubWVzc2FnZSA9IGZ1bmN0aW9uKHdzTWVzc2FnZSkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1dlYlNvY2tldCBvbm1lc3NhZ2UnLCB3c01lc3NhZ2UsIGNvbnRleHQpO1xuICAgICAgICAgICAgc2VsZi5vbk1lc3NhZ2UoY29udGV4dCwgd3NNZXNzYWdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbm9wZW4gPSBvbm9wZW47XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0Lm9uY2xvc2UgPSBvbmNsb3NlO1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBDbGllbnRzIHNob3VsZCBjYWxsIG9uY2xvc2UoKSwgYnV0IGlmIHRoZXkgZG8gbm90IHdlIGRvIGl0IGhlcmUgZm9yIHNhZmV0eS5cbiAgICAgICAgICAgIG9uY2xvc2Uoe2NvZGU6IDEwMDAsIHJlYXNvbjogJ0Vycm9yJ30pO1xuICAgICAgICB9O1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XG5cbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnY29uZmlndXJlZCBjYWxsYmFja3Mgb24nLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2ViU29ja2V0U2VuZChjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShlbnZlbG9wZS5tZXNzYWdlcyk7XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0LnNlbmQoanNvbik7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbnQnLCBlbnZlbG9wZSwgJ21ldGFDb25uZWN0ID0nLCBtZXRhQ29ubmVjdCk7XG5cbiAgICAgICAgLy8gTWFuYWdlIHRoZSB0aW1lb3V0IHdhaXRpbmcgZm9yIHRoZSByZXNwb25zZS5cbiAgICAgICAgdmFyIG1heERlbGF5ID0gdGhpcy5nZXRDb25maWd1cmF0aW9uKCkubWF4TmV0d29ya0RlbGF5O1xuICAgICAgICB2YXIgZGVsYXkgPSBtYXhEZWxheTtcbiAgICAgICAgaWYgKG1ldGFDb25uZWN0KSB7XG4gICAgICAgICAgICBkZWxheSArPSB0aGlzLmdldEFkdmljZSgpLnRpbWVvdXQ7XG4gICAgICAgICAgICBfY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG1lc3NhZ2VJZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZW52ZWxvcGUubWVzc2FnZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnRpbWVvdXRzW21lc3NhZ2UuaWRdID0gdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAndGltaW5nIG91dCBtZXNzYWdlJywgbWVzc2FnZS5pZCwgJ2FmdGVyJywgZGVsYXksICdvbicsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbChzZWxmLCBjb250ZXh0LCB7Y29kZTogMTAwMCwgcmVhc29uOiAnTWVzc2FnZSBUaW1lb3V0J30pO1xuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3dhaXRpbmcgYXQgbW9zdCcsIGRlbGF5LCAnbXMgZm9yIG1lc3NhZ2VzJywgbWVzc2FnZUlkcywgJ21heE5ldHdvcmtEZWxheScsIG1heERlbGF5LCAnLCB0aW1lb3V0czonLCBjb250ZXh0LnRpbWVvdXRzKTtcbiAgICB9XG5cbiAgICBfc2VsZi5fbm90aWZ5U3VjY2VzcyA9IGZ1bmN0aW9uKGZuLCBtZXNzYWdlcykge1xuICAgICAgICBmbi5jYWxsKHRoaXMsIG1lc3NhZ2VzKTtcbiAgICB9O1xuXG4gICAgX3NlbGYuX25vdGlmeUZhaWx1cmUgPSBmdW5jdGlvbihmbiwgY29udGV4dCwgbWVzc2FnZXMsIGZhaWx1cmUpIHtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCBjb250ZXh0LCBtZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9zZW5kKGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gX2Nvbm5lY3RpbmcgfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW52ZWxvcGVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRzOiB7fVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIF9zdG9yZUVudmVsb3BlLmNhbGwodGhpcywgY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgICAgICBfd2Vic29ja2V0Q29ubmVjdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfc3RvcmVFbnZlbG9wZS5jYWxsKHRoaXMsIGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICAgICAgX3dlYlNvY2tldFNlbmQuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdC5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uOiAnRXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZWxmLm9uT3BlbiA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGVudmVsb3BlcyA9IGNvbnRleHQuZW52ZWxvcGVzO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdvcGVuZWQnLCBjb250ZXh0LCAncGVuZGluZyBtZXNzYWdlcycsIGVudmVsb3Blcyk7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgIGlmIChlbnZlbG9wZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZW52ZWxvcGVzW2tleV07XG4gICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YUNvbm5lY3QgPSBlbGVtZW50WzFdO1xuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBzdWNjZXNzIGNhbGxiYWNrLCB3aGljaCBpcyBpbmRlcGVuZGVudCBmcm9tIHRoZSBlbnZlbG9wZSxcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIHRvIG5vdGlmeSBhcnJpdmFsIG9mIG1lc3NhZ2VzLlxuICAgICAgICAgICAgICAgIF9zdWNjZXNzQ2FsbGJhY2sgPSBlbnZlbG9wZS5vblN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgX3dlYlNvY2tldFNlbmQuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLm9uTWVzc2FnZSA9IGZ1bmN0aW9uKGNvbnRleHQsIHdzTWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZWNlaXZlZCB3ZWJzb2NrZXQgbWVzc2FnZScsIHdzTWVzc2FnZSwgY29udGV4dCk7XG5cbiAgICAgICAgdmFyIGNsb3NlID0gZmFsc2U7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMuY29udmVydFRvTWVzc2FnZXMod3NNZXNzYWdlLmRhdGEpO1xuICAgICAgICB2YXIgbWVzc2FnZUlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldO1xuXG4gICAgICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIG1lc3NhZ2UgaXMgYSByZXNwb25zZSB0byBhIHJlcXVlc3Qgd2UgbWFkZS5cbiAgICAgICAgICAgIC8vIElmIGl0J3MgYSBtZXRhIG1lc3NhZ2UsIGZvciBzdXJlIGl0J3MgYSByZXNwb25zZTsgb3RoZXJ3aXNlIGl0J3NcbiAgICAgICAgICAgIC8vIGEgcHVibGlzaCBtZXNzYWdlIGFuZCBwdWJsaXNoIHJlc3BvbnNlcyBkb24ndCBoYXZlIHRoZSBkYXRhIGZpZWxkLlxuICAgICAgICAgICAgaWYgKC9eXFwvbWV0YVxcLy8udGVzdChtZXNzYWdlLmNoYW5uZWwpIHx8IG1lc3NhZ2UuZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gY29udGV4dC50aW1lb3V0c1ttZXNzYWdlLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQudGltZW91dHNbbWVzc2FnZS5pZF07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZW1vdmVkIHRpbWVvdXQgZm9yIG1lc3NhZ2UnLCBtZXNzYWdlLmlkLCAnLCB0aW1lb3V0cycsIGNvbnRleHQudGltZW91dHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJy9tZXRhL2Nvbm5lY3QnID09PSBtZXNzYWdlLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJy9tZXRhL2Rpc2Nvbm5lY3QnID09PSBtZXNzYWdlLmNoYW5uZWwgJiYgIV9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGVudmVsb3BlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG1lc3NhZ2VzLlxuICAgICAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZW52ZWxvcGVzID0gY29udGV4dC5lbnZlbG9wZXM7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWVzc2FnZUlkcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgdmFyIGlkID0gbWVzc2FnZUlkc1tqXTtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW52ZWxvcGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkcyA9IGtleS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBVdGlscy5pbkFycmF5KGlkLCBpZHMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IGVudmVsb3Blc1trZXldWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGFDb25uZWN0ID0gZW52ZWxvcGVzW2tleV1bMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZW52ZWxvcGVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZXNbaWRzLmpvaW4oJywnKV0gPSBbZW52ZWxvcGUsIG1ldGFDb25uZWN0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZW1vdmVkIGVudmVsb3BlLCBlbnZlbG9wZXMnLCBlbnZlbG9wZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5U3VjY2Vzcyhfc3VjY2Vzc0NhbGxiYWNrLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgaWYgKGNsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLndlYlNvY2tldENsb3NlKGNvbnRleHQsIDEwMDAsICdEaXNjb25uZWN0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYub25DbG9zZSA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2Nsb3NlZCcsIGNvbnRleHQsIGV2ZW50KTtcblxuICAgICAgICBpZiAoX3NhbWVDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgICAgICAvLyBSZW1lbWJlciBpZiB3ZSB3ZXJlIGFibGUgdG8gY29ubmVjdC5cbiAgICAgICAgICAgIC8vIFRoaXMgY2xvc2UgZXZlbnQgY291bGQgYmUgZHVlIHRvIHNlcnZlciBzaHV0ZG93bixcbiAgICAgICAgICAgIC8vIGFuZCBpZiBpdCByZXN0YXJ0cyB3ZSB3YW50IHRvIHRyeSB3ZWJzb2NrZXQgYWdhaW4uXG4gICAgICAgICAgICBfd2ViU29ja2V0U3VwcG9ydGVkID0gX3N0aWNreVJlY29ubmVjdCAmJiBfd2ViU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICAgICAgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgICAgICAgICAgX2NvbnRleHQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRpbWVvdXRzID0gY29udGV4dC50aW1lb3V0cztcbiAgICAgICAgY29udGV4dC50aW1lb3V0cyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpZCBpbiB0aW1lb3V0cykge1xuICAgICAgICAgICAgaWYgKHRpbWVvdXRzLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHRpbWVvdXRzW2lkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW52ZWxvcGVzID0gY29udGV4dC5lbnZlbG9wZXM7XG4gICAgICAgIGNvbnRleHQuZW52ZWxvcGVzID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgIGlmIChlbnZlbG9wZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IGVudmVsb3Blc1trZXldWzBdO1xuICAgICAgICAgICAgICAgIHZhciBtZXRhQ29ubmVjdCA9IGVudmVsb3Blc1trZXldWzFdO1xuICAgICAgICAgICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICB3ZWJzb2NrZXRDb2RlOiBldmVudC5jb2RlLFxuICAgICAgICAgICAgICAgICAgICByZWFzb246IGV2ZW50LnJlYXNvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmV4Y2VwdGlvbiA9IGV2ZW50LmV4Y2VwdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5RmFpbHVyZShlbnZlbG9wZS5vbkZhaWx1cmUsIGNvbnRleHQsIGVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5yZWdpc3RlcmVkID0gZnVuY3Rpb24odHlwZSwgY29tZXRkKSB7XG4gICAgICAgIF9zdXBlci5yZWdpc3RlcmVkKHR5cGUsIGNvbWV0ZCk7XG4gICAgICAgIF9jb21ldGQgPSBjb21ldGQ7XG4gICAgfTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnYWNjZXB0LCBzdXBwb3J0ZWQ6JywgX3dlYlNvY2tldFN1cHBvcnRlZCk7XG4gICAgICAgIC8vIFVzaW5nICEhIHRvIHJldHVybiBhIGJvb2xlYW4gKGFuZCBub3QgdGhlIFdlYlNvY2tldCBvYmplY3QpLlxuICAgICAgICByZXR1cm4gX3dlYlNvY2tldFN1cHBvcnRlZCAmJiAhKCd1bmRlZmluZWQnID09PSB0eXBlb2YgV2ViU29ja2V0KSAmJiBfY29tZXRkLndlYnNvY2tldEVuYWJsZWQgIT09IGZhbHNlO1xuICAgIH07XG5cbiAgICBfc2VsZi5zZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbmRpbmcnLCBlbnZlbG9wZSwgJ21ldGFDb25uZWN0ID0nLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgIF9zZW5kLmNhbGwodGhpcywgX2NvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgfTtcblxuICAgIF9zZWxmLndlYlNvY2tldENsb3NlID0gZnVuY3Rpb24oY29udGV4dCwgY29kZSwgcmVhc29uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC53ZWJTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LndlYlNvY2tldC5jbG9zZShjb2RlLCByZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1Zyh4KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfc3VwZXIuYWJvcnQoKTtcbiAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbCh0aGlzLCBfY29udGV4dCwge2NvZGU6IDEwMDAsIHJlYXNvbjogJ0Fib3J0J30pO1xuICAgICAgICB0aGlzLnJlc2V0KHRydWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwiaW1wb3J0IHsgQ29tZXRELCBXZWJTb2NrZXRUcmFuc3BvcnQgfSBmcm9tICd6ZXRhcHVzaC1jb21ldGQnXG5pbXBvcnQgeyBGZXRjaExvbmdQb2xsaW5nVHJhbnNwb3J0IH0gZnJvbSAnLi9jb21ldGQnXG5pbXBvcnQgeyBnZXRTZXJ2ZXJzLCBzaHVmZmxlIH0gZnJvbSAnLi91dGlscydcbmltcG9ydCB7IENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lciB9IGZyb20gJy4vY29ubmVjdGlvbi1zdGF0dXMnXG5cbi8qKlxuICogQGRlc2MgQ29tZXREIE1lc3NhZ2VzIGVudW1lcmF0aW9uXG4gKi9cbmNvbnN0IE1lc3NhZ2UgPSB7XG4gIFJFQ09OTkVDVF9IQU5EU0hBS0VfVkFMVUU6ICdoYW5kc2hha2UnLFxuICBSRUNPTk5FQ1RfTk9ORV9WQUxVRTogJ25vbmUnLFxuICBSRUNPTk5FQ1RfUkVUUllfVkFMVUU6ICdyZXRyeSdcbn1cblxuLyoqXG4gKiBAZGVzYyBDb21ldEQgVHJhbnNwb3J0cyBlbnVtZXJhdGlvblxuICovXG5jb25zdCBUcmFuc3BvcnQgPSB7XG4gIExPTkdfUE9MTElORzogJ2xvbmctcG9sbGluZycsXG4gIFdFQlNPQ0tFVDogJ3dlYnNvY2tldCdcbn1cblxuLyoqXG4gKiBAZGVzYyBQcm92aWRlIHV0aWxpdGllcyBhbmQgYWJzdHJhY3Rpb24gb24gQ29tZXREIFRyYW5zcG9ydCBsYXllclxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnRIZWxwZXIge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXBpVXJsLCBidXNpbmVzc0lkLCBoYW5kc2hha2VTdHJhdGVneSwgcmVzb3VyY2UgfSkge1xuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5idXNpbmVzc0lkID0gYnVzaW5lc3NJZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbigpOkFic3RyYWN0SGFuZHNoYWtlTWFuYWdlcn1cbiAgICAgKi9cbiAgICB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5ID0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmVzb3VyY2UgPSByZXNvdXJjZVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHRoaXMuc2VydmVycyA9IGdldFNlcnZlcnMoYCR7YXBpVXJsfSR7YnVzaW5lc3NJZH1gKVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAqL1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycyA9IFtdXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMud2FzQ29ubmVjdGVkID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuc2VydmVyVXJsID0gbnVsbFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtBcnJheTxPYmplY3Q+fVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaWJlUXVldWUgPSBbXVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtDb21ldER9XG4gICAgICovXG4gICAgdGhpcy5jb21ldGQgPSBuZXcgQ29tZXREKClcbiAgICB0aGlzLmNvbWV0ZC5yZWdpc3RlclRyYW5zcG9ydChUcmFuc3BvcnQuV0VCU09DS0VULCBuZXcgV2ViU29ja2V0VHJhbnNwb3J0KCkpXG4gICAgdGhpcy5jb21ldGQucmVnaXN0ZXJUcmFuc3BvcnQoVHJhbnNwb3J0LkxPTkdfUE9MTElORywgbmV3IEZldGNoTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKSlcbiAgICB0aGlzLmNvbWV0ZC5vblRyYW5zcG9ydEV4Y2VwdGlvbiA9IChjb21ldGQsIHRyYW5zcG9ydCkgPT4ge1xuICAgICAgaWYgKFRyYW5zcG9ydC5MT05HX1BPTExJTkcgPT09IHRyYW5zcG9ydCkge1xuICAgICAgICAvLyBUcnkgdG8gZmluZCBhbiBvdGhlciBhdmFpbGFibGUgc2VydmVyXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgY3VycmVudCBvbmUgZnJvbSB0aGUgX3NlcnZlckxpc3QgYXJyYXlcbiAgICAgICAgdGhpcy51cGRhdGVTZXJ2ZXJVcmwoKVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNvbWV0ZC5hZGRMaXN0ZW5lcignL21ldGEvaGFuZHNoYWtlJywgKHsgZXh0LCBzdWNjZXNzZnVsLCBhZHZpY2UsIGVycm9yIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6L21ldGEvaGFuZHNoYWtlJywgeyBleHQsIHN1Y2Nlc3NmdWwsIGFkdmljZSwgZXJyb3IgfSlcbiAgICAgIGlmIChzdWNjZXNzZnVsKSB7XG4gICAgICAgIGNvbnN0IHsgYXV0aGVudGljYXRpb24gPSBudWxsIH0gPSBleHRcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZChhdXRoZW50aWNhdGlvbilcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyB0aGlzLmhhbmRzaGFrZUZhaWx1cmUoZXJyb3IpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9oYW5kc2hha2UnLCAoeyBhZHZpY2UsIGVycm9yLCBleHQsIHN1Y2Nlc3NmdWwgfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ2xpZW50SGVscGVyOjovbWV0YS9oYW5kc2hha2UnLCB7IGV4dCwgc3VjY2Vzc2Z1bCwgYWR2aWNlLCBlcnJvciB9KVxuICAgICAgLy8gQXV0aE5lZ290aWF0aW9uXG4gICAgICBpZiAoIXN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgaWYgKGFkdmljZSA9PT0gbnVsbCkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChNZXNzYWdlLlJFQ09OTkVDVF9OT05FX1ZBTFVFID09PSBhZHZpY2UucmVjb25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5hdXRoZW50aWNhdGlvbkZhaWxlZChlcnJvcilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChNZXNzYWdlLlJFQ09OTkVDVF9IQU5EU0hBS0VfVkFMVUUgPT09IGFkdmljZS5yZWNvbm5lY3QpIHtcbiAgICAgICAgICB0aGlzLm5lZ290aWF0ZShleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5jb21ldGQuYWRkTGlzdGVuZXIoJy9tZXRhL2Nvbm5lY3QnLCAoeyBhZHZpY2UsIGNoYW5uZWwsIHN1Y2Nlc3NmdWwgfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ2xpZW50SGVscGVyOjovbWV0YS9jb25uZWN0JywgeyBhZHZpY2UsIGNoYW5uZWwsIHN1Y2Nlc3NmdWwgfSlcbiAgICAgIC8vIENvbm5lY3Rpb25MaXN0ZW5lclxuICAgICAgaWYgKHRoaXMuY29tZXRkLmlzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBmYWxzZVxuICAgICAgICAvLyBOb3RpZnkgY29ubmVjdGlvbiBpcyBjbG9zZWRcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uQ2xvc2VkKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMud2FzQ29ubmVjdGVkID0gdGhpcy5jb25uZWN0ZWRcbiAgICAgICAgdGhpcy5jb25uZWN0ZWQgPSBzdWNjZXNzZnVsXG4gICAgICAgIGlmICghdGhpcy53YXNDb25uZWN0ZWQgJiYgdGhpcy5jb25uZWN0ZWQpIHtcbiAgICAgICAgICB0aGlzLmNvbWV0ZC5iYXRjaCh0aGlzLCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBVbnF1ZXVlIHN1YnNjcmlwdGlvbnNcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlUXVldWUuZm9yRWFjaCgoeyBwcmVmaXgsIHNlcnZpY2VMaXN0ZW5lciwgc3Vic2NyaXB0aW9ucyB9KSA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlKHByZWZpeCwgc2VydmljZUxpc3RlbmVyLCBzdWJzY3JpcHRpb25zKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlUXVldWUgPSBbXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy53YXNDb25uZWN0ZWQgJiYgIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgYnJva2VuXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uQnJva2VuKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIENvbm5lY3QgY2xpZW50IHVzaW5nIENvbWV0RCBUcmFuc3BvcnRcbiAgICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIHRoaXMuc2VydmVyVXJsID0gc2h1ZmZsZShzZXJ2ZXJzKVxuXG4gICAgICB0aGlzLmNvbWV0ZC5jb25maWd1cmUoe1xuICAgICAgICB1cmw6IGAke3RoaXMuc2VydmVyVXJsfS9zdHJkYCxcbiAgICAgICAgYmFja29mZkluY3JlbWVudDogMTAwMCxcbiAgICAgICAgbWF4QmFja29mZjogNjAwMDAsXG4gICAgICAgIGFwcGVuZE1lc3NhZ2VUeXBlVG9VUkw6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNvbWV0ZC5oYW5kc2hha2UodGhpcy5nZXRIYW5kc2hha2VGaWVsZHMoKSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgY29ubmVjdGlvbkVzdGFibGlzaGVkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uRXN0YWJsaXNoZWQoKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgKi9cbiAgY29ubmVjdGlvbkJyb2tlbigpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uQ29ubmVjdGlvbkJyb2tlbigpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQGRlc2MgTm90aWZ5IGxpc3RlbmVycyB3aGVuIGEgbWVzc2FnZSBpcyBsb3N0XG4gICAqL1xuICBtZXNzYWdlTG9zdChjaGFubmVsLCBkYXRhKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lci5vbk1lc3NhZ2VMb3N0KGNoYW5uZWwsIGRhdGEpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQGRlc2MgTm90aWZ5IGxpc3RlbmVycyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBjb25uZWN0aW9uQ2xvc2VkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uQ2xvc2VkKClcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgaW5pdGlhbGl6ZWQoYXV0aGVudGljYXRpb24pIHtcbiAgICBpZiAoYXV0aGVudGljYXRpb24pIHtcbiAgICAgIHRoaXMudXNlcklkID0gYXV0aGVudGljYXRpb24udXNlcklkXG4gICAgfVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25TdWNjZXNzZnVsSGFuZHNoYWtlKGF1dGhlbnRpY2F0aW9uKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBoYW5kc2hha2Ugc3RlcCBzdWNjZWVkXG4gICAqL1xuICBhdXRoZW50aWNhdGlvbkZhaWxlZChlcnJvcikge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25GYWlsZWRIYW5kc2hha2UoZXJyb3IpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICpcbiAgICovXG4gIGhhbmRzaGFrZUZhaWx1cmUoKSB7XG5cbiAgfVxuICAvKipcbiAgKiBAZGVzYyBSZW1vdmUgY3VycmVudCBzZXJ2ZXIgdXJsIGZyb20gdGhlIHNlcnZlciBsaXN0IGFuZCBzaHVmZmxlIGZvciBhbm90aGVyIG9uZVxuICAqL1xuICB1cGRhdGVTZXJ2ZXJVcmwoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2VydmVycy5pbmRleE9mKHRoaXMuc2VydmVyVXJsKVxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgc2VydmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgICBpZiAoc2VydmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbW9yZSBzZXJ2ZXIgYXZhaWxhYmxlXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSBzaHVmZmxlKHNlcnZlcnMpXG4gICAgICAgIHRoaXMuY29tZXRkLmNvbmZpZ3VyZSh7XG4gICAgICAgICAgdXJsOiBgJHt0aGlzLnNlcnZlclVybH0vc3RyZGBcbiAgICAgICAgfSlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21ldGQuaGFuZHNoYWtlKHRoaXMuZ2V0SGFuZHNoYWtlRmllbGRzKCkpXG4gICAgICAgIH0sIDI1MClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKlxuICAgKi9cbiAgbmVnb3RpYXRlKGV4dCkge1xuICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6bmVnb3RpYXRlJywgZXh0KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBEaXNjb25uZWN0IENvbWV0RCBjbGllbnRcbiAgICovXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgdGhpcy5jb21ldGQuZGlzY29ubmVjdCgpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCBDb21ldEQgaGFuZHNoYWtlIHBhcmFtZXRlcnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgZ2V0SGFuZHNoYWtlRmllbGRzKCkge1xuICAgIGNvbnN0IGhhbmRzaGFrZSA9IHRoaXMuaGFuZHNoYWtlU3RyYXRlZ3koKVxuICAgIHJldHVybiBoYW5kc2hha2UuZ2V0SGFuZHNoYWtlRmllbGRzKHRoaXMpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIFNldCBhIG5ldyBoYW5kc2hha2UgZmFjdG9yeSBtZXRob2RzXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9IGhhbmRzaGFrZVN0cmF0ZWd5XG4gICAqL1xuICBzZXRIYW5kc2hha2VTdHJhdGVneShoYW5kc2hha2VTdHJhdGVneSkge1xuICAgIHRoaXMuaGFuZHNoYWtlU3RyYXRlZ3kgPSBoYW5kc2hha2VTdHJhdGVneVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgYnVzaW5lc3MgaWRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0QnVzaW5lc3NJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5idXNpbmVzc0lkXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCBzZXNzaW9uIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFNlc3Npb25JZCgpIHtcbiAgICB0aHJvdyBOb3RZZXRJbXBsZW1lbnRlZEVycm9yKClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgR2V0IHJlc291cmNlXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFJlc291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLnJlc291cmNlXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIFN1YnJpYmUgYWxsIG1ldGhvZHMgZGVmaW5lZCBpbiB0aGUgc2VydmljZUxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gcHJlZml4ZWQgY2hhbm5lbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gQ2hhbm5lbCBwcmVmaXhcbiAgICogQHBhcmFtIHtPYmplY3R9IHNlcnZpY2VMaXN0ZW5lclxuICAgKiBAcGFyYW0ge09iamVjdH0gc3Vic2NyaXB0aW9uc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IHN1YnNjcmlwdGlvbnNcbiAgICovXG4gIHN1YnNjcmliZShwcmVmaXgsIHNlcnZpY2VMaXN0ZW5lciwgc3Vic2NyaXB0aW9ucyA9IHt9KSB7XG4gICAgaWYgKHRoaXMuY29tZXRkLmlzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgIHRoaXMuc3Vic2NyaWJlUXVldWUucHVzaCh7IHByZWZpeCwgc2VydmljZUxpc3RlbmVyLCBzdWJzY3JpcHRpb25zIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgbWV0aG9kIGluIHNlcnZpY2VMaXN0ZW5lcikge1xuICAgICAgICBpZiAoc2VydmljZUxpc3RlbmVyLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgICAgc3Vic2NyaXB0aW9uc1ttZXRob2RdID0gdGhpcy5jb21ldGQuc3Vic2NyaWJlKGNoYW5uZWwsIHNlcnZpY2VMaXN0ZW5lclttZXRob2RdKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdWJzY3JpcHRpb25zXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCBhIHB1Ymxpc2hlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gQ2hhbm5lbCBwcmVmaXhcbiAgICogQHBhcmFtIHtPYmplY3R9IHB1Ymxpc2hlckRlZmluaXRpb25cbiAgICogQHJldHVybiB7T2JqZWN0fSBzZXJ2aWNlUHVibGlzaGVyXG4gICAqL1xuICBjcmVhdGVTZXJ2aWNlUHVibGlzaGVyKHByZWZpeCwgcHVibGlzaGVyRGVmaW5pdGlvbikge1xuICAgIGNvbnN0IHNlcnZpY2VQdWJsaXNoZXIgPSB7fVxuICAgIGZvciAoY29uc3QgbWV0aG9kIGluIHB1Ymxpc2hlckRlZmluaXRpb24pIHtcbiAgICAgIGlmIChwdWJsaXNoZXIuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgIHNlcnZpY2VQdWJsaXNoZXJbbWV0aG9kXSA9IChwYXJhbWV0ZXJzID0ge30pID0+IHtcbiAgICAgICAgICB0aGlzLmNvbWV0ZC5wdWJsaXNoKGNoYW5uZWwsIHBhcmFtZXRlcnMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlcnZpY2VQdWJsaXNoZXJcbiAgfVxuICAvKipcbiAgICogQGRlc2MgVW5zdWJjcmliZSBhbGwgc3Vic2NyaXB0aW9ucyBkZWZpbmVkIGluIGdpdmVuIHN1YnNjcmlwdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqL1xuICB1bnN1YnNjcmliZShzdWJzY3JpcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gc3Vic2NyaXB0aW9ucykge1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzLmNvbWV0ZC51bnN1YnNjcmliZShzdWJzY3JpcHRpb25zW21ldGhvZF0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBBZGQgYSBjb25uZWN0aW9uIGxpc3RlbmVyIHRvIGhhbmRsZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gZXZlbnRzXG4gICAqIEBwYXJhbSB7Q29ubmVjdGlvblN0YXR1c0xpc3RlbmVyfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxpc3RlbmVyID0gT2JqZWN0LmFzc2lnbihuZXcgQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKCksIGxpc3RlbmVyKVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5wdXNoKGNvbm5lY3Rpb25MaXN0ZW5lcilcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBDbGllbnRIZWxwZXIgfSBmcm9tICcuL2NsaWVudC1oZWxwZXInXG5cbmltcG9ydCB7IE5vdFlldEltcGxlbWVudGVkRXJyb3IgfSBmcm9tICcuL3V0aWxzJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZGVzYyBEZWZhdWx0IFpldGFQdXNoIEFQSSBVUkxcbiAqL1xuZXhwb3J0IGNvbnN0IEFQSV9VUkwgPSAnaHR0cHM6Ly9hcGkuenB1c2guaW8vJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZGVzYyBaZXRhUHVzaCBDbGllbnQgdG8gY29ubmVjdFxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICogICBidXNpbmVzc0lkOiAnPFlPVVItQlVTSU5FU1MtSUQ+JyxcbiAqICAgaGFuZHNoYWtlU3RyYXRlZ3koKSB7XG4gKiAgICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZVdlYWtIYW5kc2hha2Uoe1xuICogICAgICAgdG9rZW46IG51bGwsXG4gKiAgICAgICBkZXBsb3ltZW50SWQ6ICc8WU9VUi1ERVBMT1lNRU5ULUlEPidcbiAgKiAgICB9KVxuICogICB9XG4gKiB9KVxuICovXG5leHBvcnQgY2xhc3MgQ2xpZW50IHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGFwaVVybCA9IEFQSV9VUkwsIGJ1c2luZXNzSWQsIGhhbmRzaGFrZVN0cmF0ZWd5LCByZXNvdXJjZSA9IG51bGwgfSkge1xuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtDbGllbnRIZWxwZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGllbnQgPSBuZXcgQ2xpZW50SGVscGVyKHtcbiAgICAgIGFwaVVybCxcbiAgICAgIGJ1c2luZXNzSWQsXG4gICAgICBoYW5kc2hha2VTdHJhdGVneSxcbiAgICAgIHJlc291cmNlXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQGRlc2MgQ29ubmVjdCBjbGllbnQgdG8gWmV0YVB1c2hcbiAgICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5jbGllbnQuY29ubmVjdCgpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIERpc29ubmVjdCBjbGllbnQgZnJvbSBaZXRhUHVzaFxuICAgKi9cbiAgZGlzY29ubmVjdCgpIHtcbiAgICB0aGlzLmNsaWVudC5kaXNjb25uZWN0KClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgQ3JlYXRlIGEgc2VydmljZSBwdWJsaXNoZXIgYmFzZWQgb24gcHVibGlzaGVyIGRlZmluaXRpb24gZm9yIHRoZSBnaXZlbiBkZXBsb3ltZW50IGlkXG4gICAqIEBleHBlcmltZW50YWxcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlU2VydmljZVB1Ymxpc2hlcih7IGRlcGxveW1lbnRJZCwgcHVibGlzaGVyRGVmaW5pdGlvbiB9KSB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmNyZWF0ZVNlcnZpY2VQdWJsaXNoZXIoYC9zZXJ2aWNlLyR7dGhpcy5nZXRCdXNpbmVzc0lkKCl9LyR7ZGVwbG95bWVudElkfWAsIHB1Ymxpc2hlckRlZmluaXRpb24pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCB0aGUgY2xpZW50IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmdldEJ1c2luZXNzSWQoKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgdGhlIGNsaWVudCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuZ2V0UmVzb3VyY2UoKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgdGhlIGNsaWVudCB1c2VyIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFVzZXJJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuZ2V0VXNlcklkKClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgR2V0IHRoZSBjbGllbnQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmdldFNlc3Npb25JZCgpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIFN1YnNjcmliZSBhbGwgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIHNlcnZpY2VMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIGRlcGxveW1lbnRJZFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHN1YnNjcmlwdGlvblxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBzdGFja1NlcnZpY2VMaXN0ZW5lciA9IHtcbiAgICogICBsaXN0KCkge30sXG4gICAqICAgcHVzaCgpIHt9LFxuICAgKiAgIHVwZGF0ZSgpIHt9XG4gICAqIH1cbiAgICogY2xpZW50LnN1YnNjcmliZUxpc3RlbmVyKHtcbiAgICogICBkZXBsb3ltZW50SWQ6ICc8WU9VUi1TVEFDSy1ERVBMT1lNRU5ULUlEPicsXG4gICAqICAgc2VydmljZUxpc3RlbmVyXG4gICAqIH0pXG4gICAqL1xuICBzdWJzY3JpYmVMaXN0ZW5lcih7IGRlcGxveW1lbnRJZCwgc2VydmljZUxpc3RlbmVyIH0pIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuc3Vic2NyaWJlKGAvc2VydmljZS8ke3RoaXMuZ2V0QnVzaW5lc3NJZCgpfS8ke2RlcGxveW1lbnRJZH1gLCBzZXJ2aWNlTGlzdGVuZXIpXG4gIH1cbiAgLyoqXG4gICogQGRlc2MgQ3JlYXRlIGEgcHVibGlzaC9zdWJzY3JpYmVcbiAgKiBAZXhwZXJpbWVudGFsXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlUHViU3ViKHsgZGVwbG95bWVudElkLCBzZXJ2aWNlTGlzdGVuZXIsIHB1Ymxpc2hlciB9KSB7XG4gICAgdGhyb3cgbmV3IE5vdFlldEltcGxlbWVudGVkRXJyb3IoJ2NyZWF0ZVB1YlN1YicpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIFNldCBuZXcgY2xpZW50IHJlc291cmNlIHZhbHVlXG4gICAqL1xuICBzZXRSZXNvdXJjZShyZXNvdXJjZSkge1xuICAgIHRoaXMuY2xpZW50LnNldFJlc291cmNlKHJlc291cmNlKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBBZGQgYSBjb25uZWN0aW9uIGxpc3RlbmVyIHRvIGhhbmRsZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gZXZlbnRzXG4gICAqIEBwYXJhbSB7Q29ubmVjdGlvblN0YXR1c0xpc3RlbmVyfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmFkZENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcihsaXN0ZW5lcilcbiAgfVxuICAvKipcbiAgICogQGRlc2MgRm9yY2UgZGlzY29ubmVjdC9jb25uZWN0IHdpdGggbmV3IGhhbmRzaGFrZSBmYWN0b3J5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9IGhhbmRzaGFrZVN0cmF0ZWd5XG4gICAqL1xuICBoYW5kc2hha2UoaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICB0aGlzLmRpc2Nvbm5lY3QoKVxuICAgIGlmIChoYW5kc2hha2VTdHJhdGVneSkge1xuICAgICAgdGhpcy5jbGllbnQuc2V0SGFuZHNoYWtlU3RyYXRlZ3koaGFuZHNoYWtlU3RyYXRlZ3kpXG4gICAgfVxuICAgIHRoaXMuY29ubmVjdCgpXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgVHJhbnNwb3J0LCBMb25nUG9sbGluZ1RyYW5zcG9ydCB9IGZyb20gJ3pldGFwdXNoLWNvbWV0ZCdcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBkZXNjIEltcGxlbWVudHMgTG9uZ1BvbGxpbmdUcmFuc3BvcnQgdXNpbmcgYm9yd3NlciBmZXRjaCgpIEFQSVxuICogQHJldHVybiB7RmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZldGNoTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKSB7XG4gIHZhciBfc3VwZXIgPSBuZXcgTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKVxuICB2YXIgdGhhdCA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKVxuXG4gIC8qKlxuICAgKiBAZGVzYyBJbXBsZW1lbnRzIHRyYW5zcG9ydCB2aWEgZmV0Y2goKSBBUElcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICAgKi9cbiAgdGhhdC54aHJTZW5kID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgZmV0Y2gocGFja2V0LnVybCwge1xuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBib2R5OiBwYWNrZXQuYm9keSxcbiAgICAgIGhlYWRlcnM6IE9iamVjdC5hc3NpZ24ocGFja2V0LmhlYWRlcnMsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnXG4gICAgICB9KVxuICAgIH0pXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG4gICAgfSlcbiAgICAudGhlbihwYWNrZXQub25TdWNjZXNzKVxuICAgIC5jYXRjaChwYWNrZXQub25FcnJvcilcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG4iLCIvKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZGVzYyBEZWZpbmUgbGlmZSBjeWNsZSBjb25uZWN0aW9uIG1ldGhvZHMgXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIge1xuICAvKipcbiAgICogQGRlc2MgQ2FsbGJhY2sgZmlyZWQgd2hlbiBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgKi9cbiAgb25Db25uZWN0aW9uQnJva2VuKCkge31cbiAgLyoqXG4gICAqIEBkZXNjIENhbGxiYWNrIGZpcmVkIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWRcbiAgICovXG4gIG9uQ29ubmVjdGlvbkNsb3NlZCgpIHt9XG4gIC8qKlxuICAgKiBAZGVzYyBDYWxsYmFjayBmaXJlZCB3aGVuIGlzIGVzdGFibGlzaGVkXG4gICAqL1xuICBvbkNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpIHt9XG4gIC8qKlxuICAgKiBAZGVzYyBDYWxsYmFjayBmaXJlZCB3aGVuIGFuIGVycm9yIG9jY3VycyBpbiBoYW5kc2hha2Ugc3RlcFxuICAgKiBAcGFyYW0ge09iamVjdH0gZXJyb3JcbiAgICovXG4gIG9uRmFpbGVkSGFuZHNoYWtlKGVycm9yKSB7fVxuICAvKipcbiAgICogQGRlc2MgQ2FsbGJhY2sgZmlyZWQgd2hlbiBhIG1lc3NhZ2UgaXMgbG9zdFxuICAgKi9cbiAgb25NZXNzYWdlTG9zdCgpIHt9XG4gIC8qKlxuICAgKiBAZGVzYyBDYWxsYmFjayBmaXJlZCB3aGVuIGhhbmRzaGFrZSBzdGVwIHN1Y2NlZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IGF1dGhlbnRpY2F0aW9uXG4gICAqL1xuICBvblN1Y2Nlc3NmdWxIYW5kc2hha2UoYXV0aGVudGljYXRpb24pIHt9XG59XG4iLCIvKipcbiAqIFpldGFQdXNoIGRlcGxveWFibGVzIG5hbWVzXG4gKi9cbmNvbnN0IERlcGxveWFibGVOYW1lcyA9IHtcbiAgQVVUSF9TSU1QTEU6ICdzaW1wbGUnLFxuICBBVVRIX1dFQUs6ICd3ZWFrJyxcbiAgQVVUSF9ERUxFR0FUSU5HOiAnZGVsZWdhdGluZydcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByb3RlY3RlZFxuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBidXNpbmVzc0lkLCBkZXBsb3ltZW50SWQgfSkge1xuICAgIHRoaXMuYXV0aFR5cGUgPSBhdXRoVHlwZVxuICAgIHRoaXMuYnVzaW5lc3NJZCA9IGJ1c2luZXNzSWRcbiAgICB0aGlzLmRlcGxveW1lbnRJZCA9IGRlcGxveW1lbnRJZFxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge0NsaWVudEhlbHBlcn0gY2xpZW50XG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcyhjbGllbnQpIHtcbiAgICBjb25zdCBhdXRoZW50aWNhdGlvbiA9IHtcbiAgICAgIGRhdGE6IHRoaXMuYXV0aERhdGEsXG4gICAgICB0eXBlOiBgJHtjbGllbnQuZ2V0QnVzaW5lc3NJZCgpfS4ke3RoaXMuZGVwbG95bWVudElkfS4ke3RoaXMuYXV0aFR5cGV9YCxcbiAgICAgIHZlcnNpb246IHRoaXMuYXV0aFZlcnNpb25cbiAgICB9XG4gICAgaWYgKGNsaWVudC5nZXRSZXNvdXJjZSgpKSB7XG4gICAgICBhdXRoZW50aWNhdGlvbi5yZXNvdXJjZSA9IGNsaWVudC5nZXRSZXNvdXJjZSgpXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBleHQ6IHtcbiAgICAgICAgYXV0aGVudGljYXRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdldCBhdXRoIHZlcnNpb25cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhWZXJzaW9uKCkge1xuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuXG59XG5cbi8qKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBleHRlbmRzIHtBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBUb2tlbkhhbmRzaGFrZU1hbmFnZXIgZXh0ZW5kcyBBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXIge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgdG9rZW4gfSkge1xuICAgIHN1cGVyKHsgZGVwbG95bWVudElkLCBhdXRoVHlwZSB9KVxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHt0b2tlbjogc3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhEYXRhKCkge1xuICAgIGNvbnN0IHsgdG9rZW4gfSA9IHRoaXNcbiAgICByZXR1cm4ge1xuICAgICAgdG9rZW5cbiAgICB9XG4gIH1cblxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZXh0ZW5kcyB7QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfVxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFpldGFwdXNoSGFuZHNoYWtlTWFuYWdlciBleHRlbmRzIEFic3RyYWN0SGFuZHNoYWtlTWFuYWdlciB7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIGxvZ2luLCBwYXNzd29yZCB9KSB7XG4gICAgc3VwZXIoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkIH0pXG4gICAgdGhpcy5sb2dpbiA9IGxvZ2luXG4gICAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCBhdXRoIGRhdGFcbiAgICogQHJldHVybiB7bG9naW46IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZ31cbiAgICovXG4gIGdldCBhdXRoRGF0YSgpIHtcbiAgICBjb25zdCB7IGxvZ2luLCBwYXNzd29yZCB9ID0gdGhpc1xuICAgIHJldHVybiB7XG4gICAgICBsb2dpbiwgcGFzc3dvcmRcbiAgICB9XG4gIH1cblxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50RmFjdG9yeSB7XG4gIC8qKlxuICAgKiBAcmV0dXJuIHtEZWZhdWx0WmV0YXB1c2hIYW5kc2hha2VNYW5hZ2VyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZVNpbXBsZUhhbmRzaGFrZSh7IGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkIH0pIHtcbiAgICByZXR1cm4gQXV0aGVudEZhY3RvcnkuY3JlYXRlSGFuZHNoYWtlKHtcbiAgICAgIGF1dGhUeXBlOiBEZXBsb3lhYmxlTmFtZXMuQVVUSF9TSU1QTEUsXG4gICAgICBkZXBsb3ltZW50SWQsXG4gICAgICBsb2dpbixcbiAgICAgIHBhc3N3b3JkXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7VG9rZW5IYW5kc2hha2VNYW5hZ2VyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZVdlYWtIYW5kc2hha2UoeyBkZXBsb3ltZW50SWQsIHRva2VuIH0pIHtcbiAgICByZXR1cm4gQXV0aGVudEZhY3RvcnkuY3JlYXRlSGFuZHNoYWtlKHtcbiAgICAgIGF1dGhUeXBlOiBEZXBsb3lhYmxlTmFtZXMuQVVUSF9XRUFLLFxuICAgICAgZGVwbG95bWVudElkLFxuICAgICAgbG9naW46IHRva2VuLFxuICAgICAgcGFzc3dvcmQ6IG51bGxcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUb2tlbkhhbmRzaGFrZU1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlRGVsZWdhdGluZ0hhbmRzaGFrZSh7IGRlcGxveW1lbnRJZCwgdG9rZW4gfSkge1xuICAgIHJldHVybiBBdXRoZW50RmFjdG9yeS5jcmVhdGVIYW5kc2hha2Uoe1xuICAgICAgYXV0aFR5cGU6IERlcGxveWFibGVOYW1lcy5BVVRIX0RFTEVHQVRJTkcsXG4gICAgICBkZXBsb3ltZW50SWQsXG4gICAgICBsb2dpbjogdG9rZW4sXG4gICAgICBwYXNzd29yZDogbnVsbFxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcnxEZWZhdWx0WmV0YXB1c2hIYW5kc2hha2VNYW5hZ2VyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZUhhbmRzaGFrZSh7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIGxvZ2luLCBwYXNzd29yZCB9KSB7XG4gICAgaWYgKG51bGwgPT09IHBhc3N3b3JkKSB7XG4gICAgICByZXR1cm4gbmV3IFRva2VuSGFuZHNoYWtlTWFuYWdlcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIHRva2VuOiBsb2dpbiB9KVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERlZmF1bHRaZXRhcHVzaEhhbmRzaGFrZU1hbmFnZXIoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkLCBsb2dpbiwgcGFzc3dvcmQgIH0pXG4gIH1cblxufVxuIiwiZXhwb3J0IHsgQXV0aGVudEZhY3RvcnkgfSBmcm9tICcuL2hhbmRzaGFrZSdcbmV4cG9ydCB7IEFQSV9VUkwsIENsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuZXhwb3J0IHsgU21hcnRDbGllbnQgfSBmcm9tICcuL3NtYXJ0LWNsaWVudCdcbmV4cG9ydCB7IEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5LCBMb2NhbFN0b3JhZ2VUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kgfSBmcm9tICcuL3Rva2VuLXBlcnNpc3RlbmNlJ1xuIiwiaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnXG5pbXBvcnQgeyBBdXRoZW50RmFjdG9yeSB9IGZyb20gJy4vaGFuZHNoYWtlJ1xuaW1wb3J0IHsgTG9jYWxTdG9yYWdlVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IH0gZnJvbSAnLi90b2tlbi1wZXJzaXN0ZW5jZSdcblxuLyoqXG4gKiBAYWNjZXNzIHByb3RlY3RlZFxuICogQGV4dGVuZHMge0NsaWVudH1cbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0Q2xpZW50IGV4dGVuZHMgQ2xpZW50IHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGFwaVVybCwgYXV0aGVudGljYXRpb25EZXBsb3ltZW50SWQsIGJ1c2luZXNzSWQsIHJlc291cmNlID0gbnVsbCwgVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5ID0gTG9jYWxTdG9yYWdlVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IH0pIHtcbiAgICBjb25zdCBoYW5kc2hha2VTdHJhdGVneSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRva2VuID0gdGhpcy5nZXRUb2tlbigpXG4gICAgICBjb25zdCBoYW5kc2hha2UgPSBBdXRoZW50RmFjdG9yeS5jcmVhdGVXZWFrSGFuZHNoYWtlKHtcbiAgICAgICAgZGVwbG95bWVudElkOiBhdXRoZW50aWNhdGlvbkRlcGxveW1lbnRJZCxcbiAgICAgICAgdG9rZW5cbiAgICAgIH0pXG4gICAgICByZXR1cm4gaGFuZHNoYWtlXG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICovXG4gICAgc3VwZXIoeyBhcGlVcmwgLCBidXNpbmVzc0lkLCBoYW5kc2hha2VTdHJhdGVneSwgcmVzb3VyY2UgfSlcbiAgICBjb25zdCBvblN1Y2Nlc3NmdWxIYW5kc2hha2UgPSAoeyBwdWJsaWNUb2tlbiwgdXNlcklkLCB0b2tlbiB9KSA9PiB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdTbWFydENsaWVudDo6b25TdWNjZXNzZnVsSGFuZHNoYWtlJywgeyBwdWJsaWNUb2tlbiwgdXNlcklkLCB0b2tlbiB9KVxuXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgdGhpcy5zdHJhdGVneS5zZXQoeyB0b2tlbiB9KVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBvbkZhaWxlZEhhbmRzaGFrZSA9IChlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnU21hcnRDbGllbnQ6Om9uRmFpbGVkSGFuZHNoYWtlJywgZXJyb3IpXG4gICAgfVxuICAgIHRoaXMuYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKHsgb25GYWlsZWRIYW5kc2hha2UsIG9uU3VjY2Vzc2Z1bEhhbmRzaGFrZSB9KVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3l9XG4gICAgICovXG4gICAgdGhpcy5zdHJhdGVneSA9IG5ldyBUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3koKVxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdG9yZWQgdG9rZW5cbiAgICovXG4gIGdldFRva2VuKCkge1xuICAgIHJldHVybiB0aGlzLnN0cmF0ZWd5LmdldCgpXG4gIH1cbn1cbiIsIi8qKlxuICogQHR5cGUge3N0cmluZ31cbiAqL1xuY29uc3QgWkVUQVBVU0hfVE9LRU5fS0VZID0gJ3pldGFwdXNoLnRva2VuJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJvdGVjdGVkXG4gKiBAZGVzYyBQcm92aWRlIGFic3RyYWN0aW9uIGZvciB0b2tlbiBwZXJzaXN0ZW5jZVxuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsga2V5ID0gWkVUQVBVU0hfVE9LRU5fS0VZIH0gPSB7fSkge1xuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5rZXkgPSBrZXlcbiAgfVxuICAvKipcbiAgICogQGFic3RyYWN0XG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0b3JlZCB0b2tlblxuICAgKi9cbiAgZ2V0KCkge31cbiAgLyoqXG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgc2V0KHsgdG9rZW4gfSkge31cbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByb3RlY3RlZFxuICogQGV4dGVuZHMge0Fic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5fVxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxTdG9yYWdlVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IGV4dGVuZHMgQWJzdHJhY3RUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kge1xuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0b3JlZCB0b2tlblxuICAgKi9cbiAgZ2V0KCkge1xuICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmtleSlcbiAgfVxuICAvKipcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBzZXQoeyB0b2tlbiB9KSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5rZXksIHRva2VuKVxuICB9XG59XG4iLCIvKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSBsaXN0XG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmV4cG9ydCBjb25zdCBzaHVmZmxlID0gKGxpc3QpID0+IHtcbiAgY29uc3QgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsaXN0Lmxlbmd0aClcbiAgcmV0dXJuIGxpc3RbaW5kZXhdXG59XG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtQcm9taXNlfVxuICovXG5leHBvcnQgY29uc3QgZ2V0U2VydmVycyA9ICh1cmwpID0+IHtcbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgICB9KVxuICAgIC50aGVuKCh7IHNlcnZlcnMgfSkgPT4ge1xuICAgICAgcmV0dXJuIHNlcnZlcnNcbiAgICB9KVxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQGV4dGVuZHMge0Vycm9yfVxuICovXG5leHBvcnQgY2xhc3MgTm90WWV0SW1wbGVtZW50ZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlID0gJycpIHtcbiAgICBzdXBlcihtZXNzYWdlKVxuICAgIHRoaXMubmFtZSA9ICdOb3RJbXBsZW1lbnRlZEVycm9yJ1xuICB9XG5cbn1cbiJdfQ==
