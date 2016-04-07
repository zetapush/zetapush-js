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
        if (publisherDefinition.hasOwnProperty(method)) {
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

    /**
     * @desc Get a service lister from methods list with a default handler
     * @return {Object} listener
     * @example
     * const getStackServiceListener = () => {
     *   return Client.getServiceListener({
     *     methods: ['getListeners', 'list', 'purge', 'push', 'remove', 'setListeners', 'update', 'error'],
     *     handler: ({ channel, data }) => {
     *       console.debug(`Stack::${method}`, { channel, data })
     *       document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
     *     }
     *   })
     * }
     */

  }], [{
    key: 'getServiceListener',
    value: function getServiceListener(_ref5) {
      var _ref5$methods = _ref5.methods;
      var methods = _ref5$methods === undefined ? [] : _ref5$methods;
      var _ref5$handler = _ref5.handler;
      var handler = _ref5$handler === undefined ? function () {} : _ref5$handler;

      return methods.reduce(function (listener, method) {
        listener[method] = function (_ref6) {
          var channel = _ref6.channel;
          var data = _ref6.data;
          return handler({ channel: channel, data: data, method: method });
        };
        return listener;
      }, {});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ29tZXRELmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvTG9uZ1BvbGxpbmdUcmFuc3BvcnQuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9SZXF1ZXN0VHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0UmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9VdGlscy5qcyIsIm5vZGVfbW9kdWxlcy96ZXRhcHVzaC1jb21ldGQvbGliL1dlYlNvY2tldFRyYW5zcG9ydC5qcyIsInNyYy9jbGllbnQtaGVscGVyLmpzIiwic3JjL2NsaWVudC5qcyIsInNyYy9jb21ldGQuanMiLCJzcmMvY29ubmVjdGlvbi1zdGF0dXMuanMiLCJzcmMvaGFuZHNoYWtlLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NtYXJ0LWNsaWVudC5qcyIsInNyYy90b2tlbi1wZXJzaXN0ZW5jZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2o0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDN1dBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7O0FBS0EsSUFBTSxVQUFVO0FBQ2QsNkJBQTJCLFdBQTNCO0FBQ0Esd0JBQXNCLE1BQXRCO0FBQ0EseUJBQXVCLE9BQXZCO0NBSEk7Ozs7O0FBU04sSUFBTSxZQUFZO0FBQ2hCLGdCQUFjLGNBQWQ7QUFDQSxhQUFXLFdBQVg7Q0FGSTs7Ozs7OztJQVNPOzs7OztBQUlYLFdBSlcsWUFJWCxPQUFpRTs7O1FBQW5ELHFCQUFtRDtRQUEzQyw2QkFBMkM7UUFBL0IsMkNBQStCO1FBQVoseUJBQVk7OzBCQUp0RCxjQUlzRDs7Ozs7O0FBSy9ELFNBQUssVUFBTCxHQUFrQixVQUFsQjs7Ozs7QUFMK0QsUUFVL0QsQ0FBSyxpQkFBTCxHQUF5QixpQkFBekI7Ozs7O0FBVitELFFBZS9ELENBQUssUUFBTCxHQUFnQixRQUFoQjs7Ozs7QUFmK0QsUUFvQi9ELENBQUssT0FBTCxHQUFlLDRCQUFjLFNBQVMsVUFBdkIsQ0FBZjs7Ozs7QUFwQitELFFBeUIvRCxDQUFLLG1CQUFMLEdBQTJCLEVBQTNCOzs7OztBQXpCK0QsUUE4Qi9ELENBQUssU0FBTCxHQUFpQixLQUFqQjs7Ozs7QUE5QitELFFBbUMvRCxDQUFLLFlBQUwsR0FBb0IsS0FBcEI7Ozs7O0FBbkMrRCxRQXdDL0QsQ0FBSyxTQUFMLEdBQWlCLElBQWpCOzs7OztBQXhDK0QsUUE2Qy9ELENBQUssY0FBTCxHQUFzQixFQUF0Qjs7Ozs7QUE3QytELFFBa0QvRCxDQUFLLE1BQUwsR0FBYyw0QkFBZCxDQWxEK0Q7QUFtRC9ELFNBQUssTUFBTCxDQUFZLGlCQUFaLENBQThCLFVBQVUsU0FBVixFQUFxQix3Q0FBbkQsRUFuRCtEO0FBb0QvRCxTQUFLLE1BQUwsQ0FBWSxpQkFBWixDQUE4QixVQUFVLFlBQVYsRUFBd0IsdUNBQXRELEVBcEQrRDtBQXFEL0QsU0FBSyxNQUFMLENBQVksb0JBQVosR0FBbUMsVUFBQyxNQUFELEVBQVMsU0FBVCxFQUF1QjtBQUN4RCxVQUFJLFVBQVUsWUFBVixLQUEyQixTQUEzQixFQUFzQzs7O0FBR3hDLGNBQUssZUFBTCxHQUh3QztPQUExQztLQURpQyxDQXJENEI7QUE0RC9ELFNBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsaUJBQXhCLEVBQTJDLGlCQUF3QztVQUFyQyxnQkFBcUM7VUFBaEMsOEJBQWdDO1VBQXBCLHNCQUFvQjtVQUFaLG9CQUFZOztBQUNqRixjQUFRLEtBQVIsQ0FBYywrQkFBZCxFQUErQyxFQUFFLFFBQUYsRUFBTyxzQkFBUCxFQUFtQixjQUFuQixFQUEyQixZQUEzQixFQUEvQyxFQURpRjtBQUVqRixVQUFJLFVBQUosRUFBZ0I7a0NBQ29CLElBQTFCLGVBRE07WUFDTixxREFBaUIsMkJBRFg7O0FBRWQsY0FBSyxXQUFMLENBQWlCLGNBQWpCLEVBRmM7T0FBaEIsTUFJSzs7T0FKTDtLQUZ5QyxDQUEzQyxDQTVEK0Q7O0FBdUUvRCxTQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLGlCQUF4QixFQUEyQyxpQkFBd0M7VUFBckMsc0JBQXFDO1VBQTdCLG9CQUE2QjtVQUF0QixnQkFBc0I7VUFBakIsOEJBQWlCOztBQUNqRixjQUFRLEtBQVIsQ0FBYywrQkFBZCxFQUErQyxFQUFFLFFBQUYsRUFBTyxzQkFBUCxFQUFtQixjQUFuQixFQUEyQixZQUEzQixFQUEvQzs7QUFEaUYsVUFHN0UsQ0FBQyxVQUFELEVBQWE7QUFDZixZQUFJLFdBQVcsSUFBWCxFQUFpQjtBQUNuQixpQkFEbUI7U0FBckI7QUFHQSxZQUFJLFFBQVEsb0JBQVIsS0FBaUMsT0FBTyxTQUFQLEVBQWtCO0FBQ3JELGdCQUFLLG9CQUFMLENBQTBCLEtBQTFCLEVBRHFEO1NBQXZELE1BR0ssSUFBSSxRQUFRLHlCQUFSLEtBQXNDLE9BQU8sU0FBUCxFQUFrQjtBQUMvRCxnQkFBSyxTQUFMLENBQWUsR0FBZixFQUQrRDtTQUE1RDtPQVBQO0tBSHlDLENBQTNDLENBdkUrRDs7QUF1Ri9ELFNBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsZUFBeEIsRUFBeUMsaUJBQXFDO1VBQWxDLHNCQUFrQztVQUExQix3QkFBMEI7VUFBakIsOEJBQWlCOztBQUM1RSxjQUFRLEtBQVIsQ0FBYyw2QkFBZCxFQUE2QyxFQUFFLGNBQUYsRUFBVSxnQkFBVixFQUFtQixzQkFBbkIsRUFBN0M7O0FBRDRFLFVBR3hFLE1BQUssTUFBTCxDQUFZLGNBQVosRUFBSixFQUFrQztBQUNoQyxjQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRGdDLGFBR2hDLENBQUssZ0JBQUwsR0FIZ0M7T0FBbEMsTUFJTztBQUNMLGNBQUssWUFBTCxHQUFvQixNQUFLLFNBQUwsQ0FEZjtBQUVMLGNBQUssU0FBTCxHQUFpQixVQUFqQixDQUZLO0FBR0wsWUFBSSxDQUFDLE1BQUssWUFBTCxJQUFxQixNQUFLLFNBQUwsRUFBZ0I7QUFDeEMsZ0JBQUssTUFBTCxDQUFZLEtBQVosUUFBd0IsWUFBTTs7QUFFNUIsa0JBQUssY0FBTCxDQUFvQixPQUFwQixDQUE0QixpQkFBZ0Q7a0JBQTdDLHNCQUE2QztrQkFBckMsd0NBQXFDO2tCQUFwQixvQ0FBb0I7O0FBQzFFLG9CQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLGVBQXZCLEVBQXdDLGFBQXhDLEVBRDBFO2FBQWhELENBQTVCLENBRjRCO0FBSzVCLGtCQUFLLGNBQUwsR0FBc0IsRUFBdEIsQ0FMNEI7V0FBTixDQUF4Qjs7QUFEd0MsZUFTeEMsQ0FBSyxxQkFBTCxHQVR3QztTQUExQyxNQVdLLElBQUksTUFBSyxZQUFMLElBQXFCLENBQUMsTUFBSyxTQUFMLEVBQWdCOztBQUU3QyxnQkFBSyxnQkFBTCxHQUY2QztTQUExQztPQWxCUDtLQUh1QyxDQUF6QyxDQXZGK0Q7R0FBakU7Ozs7OztlQUpXOzs4QkEwSEQ7OztBQUNSLFdBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsVUFBQyxPQUFELEVBQWE7QUFDN0IsZUFBSyxTQUFMLEdBQWlCLG9CQUFRLE9BQVIsQ0FBakIsQ0FENkI7O0FBRzdCLGVBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0I7QUFDcEIsZUFBUSxPQUFLLFNBQUwsVUFBUjtBQUNBLDRCQUFrQixJQUFsQjtBQUNBLHNCQUFZLEtBQVo7QUFDQSxrQ0FBd0IsS0FBeEI7U0FKRixFQUg2Qjs7QUFVN0IsZUFBSyxNQUFMLENBQVksU0FBWixDQUFzQixPQUFLLGtCQUFMLEVBQXRCLEVBVjZCO09BQWIsQ0FBbEIsQ0FEUTs7Ozs7Ozs7NENBaUJjO0FBQ3RCLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMsdUJBQVQsR0FENkM7T0FBZCxDQUFqQyxDQURzQjs7Ozs7Ozs7dUNBUUw7QUFDakIsV0FBSyxtQkFBTCxDQUF5QixPQUF6QixDQUFpQyxVQUFDLFFBQUQsRUFBYztBQUM3QyxpQkFBUyxrQkFBVCxHQUQ2QztPQUFkLENBQWpDLENBRGlCOzs7Ozs7OztnQ0FRUCxTQUFTLE1BQU07QUFDekIsV0FBSyxtQkFBTCxDQUF5QixPQUF6QixDQUFpQyxVQUFDLFFBQUQsRUFBYztBQUM3QyxpQkFBUyxhQUFULENBQXVCLE9BQXZCLEVBQWdDLElBQWhDLEVBRDZDO09BQWQsQ0FBakMsQ0FEeUI7Ozs7Ozs7O3VDQVFSO0FBQ2pCLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMsa0JBQVQsR0FENkM7T0FBZCxDQUFqQyxDQURpQjs7Ozs7Ozs7Z0NBUVAsZ0JBQWdCO0FBQzFCLFVBQUksY0FBSixFQUFvQjtBQUNsQixhQUFLLE1BQUwsR0FBYyxlQUFlLE1BQWYsQ0FESTtPQUFwQjtBQUdBLFdBQUssbUJBQUwsQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxRQUFELEVBQWM7QUFDN0MsaUJBQVMscUJBQVQsQ0FBK0IsY0FBL0IsRUFENkM7T0FBZCxDQUFqQyxDQUowQjs7Ozs7Ozs7eUNBV1AsT0FBTztBQUMxQixXQUFLLG1CQUFMLENBQXlCLE9BQXpCLENBQWlDLFVBQUMsUUFBRCxFQUFjO0FBQzdDLGlCQUFTLGlCQUFULENBQTJCLEtBQTNCLEVBRDZDO09BQWQsQ0FBakMsQ0FEMEI7Ozs7Ozs7O3VDQVFUOzs7Ozs7O3NDQU1EOzs7QUFDaEIsV0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQixVQUFDLE9BQUQsRUFBYTtBQUM3QixZQUFNLFFBQVEsUUFBUSxPQUFSLENBQWdCLE9BQUssU0FBTCxDQUF4QixDQUR1QjtBQUU3QixZQUFJLFFBQVEsQ0FBQyxDQUFELEVBQUk7QUFDZCxrQkFBUSxNQUFSLENBQWUsS0FBZixFQUFzQixDQUF0QixFQURjO1NBQWhCO0FBR0EsWUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBbkIsRUFBc0I7O1NBQTFCLE1BR0s7QUFDSCxtQkFBSyxTQUFMLEdBQWlCLG9CQUFRLE9BQVIsQ0FBakIsQ0FERztBQUVILG1CQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCO0FBQ3BCLG1CQUFRLE9BQUssU0FBTCxVQUFSO2FBREYsRUFGRztBQUtILHVCQUFXLFlBQU07QUFDZixxQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixPQUFLLGtCQUFMLEVBQXRCLEVBRGU7YUFBTixFQUVSLEdBRkgsRUFMRztXQUhMO09BTGdCLENBQWxCLENBRGdCOzs7Ozs7Ozs4QkF1QlIsS0FBSztBQUNiLGNBQVEsS0FBUixDQUFjLHlCQUFkLEVBQXlDLEdBQXpDLEVBRGE7Ozs7Ozs7O2lDQU1GO0FBQ1gsV0FBSyxNQUFMLENBQVksVUFBWixHQURXOzs7Ozs7Ozs7eUNBT1E7QUFDbkIsVUFBTSxZQUFZLEtBQUssaUJBQUwsRUFBWixDQURhO0FBRW5CLGFBQU8sVUFBVSxrQkFBVixDQUE2QixJQUE3QixDQUFQLENBRm1COzs7Ozs7Ozs7eUNBUUEsbUJBQW1CO0FBQ3RDLFdBQUssaUJBQUwsR0FBeUIsaUJBQXpCLENBRHNDOzs7Ozs7Ozs7b0NBT3hCO0FBQ2QsYUFBTyxLQUFLLFVBQUwsQ0FETzs7Ozs7Ozs7O21DQU9EO0FBQ2IsWUFBTSx3QkFBTixDQURhOzs7Ozs7Ozs7a0NBT0Q7QUFDWixhQUFPLEtBQUssUUFBTCxDQURLOzs7Ozs7Ozs7Ozs7OEJBVUosUUFBUSxpQkFBcUM7VUFBcEIsc0VBQWdCLGtCQUFJOztBQUNyRCxVQUFJLEtBQUssTUFBTCxDQUFZLGNBQVosRUFBSixFQUFrQztBQUNoQyxhQUFLLGNBQUwsQ0FBb0IsSUFBcEIsQ0FBeUIsRUFBRSxjQUFGLEVBQVUsZ0NBQVYsRUFBMkIsNEJBQTNCLEVBQXpCLEVBRGdDO09BQWxDLE1BRU87QUFDTCxhQUFLLElBQU0sTUFBTixJQUFnQixlQUFyQixFQUFzQztBQUNwQyxjQUFJLGdCQUFnQixjQUFoQixDQUErQixNQUEvQixDQUFKLEVBQTRDO0FBQzFDLGdCQUFNLFVBQWEsZUFBVSxNQUF2QixDQURvQztBQUUxQywwQkFBYyxNQUFkLElBQXdCLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0IsT0FBdEIsRUFBK0IsZ0JBQWdCLE1BQWhCLENBQS9CLENBQXhCLENBRjBDO1dBQTVDO1NBREY7T0FIRjtBQVVBLGFBQU8sYUFBUCxDQVhxRDs7Ozs7Ozs7Ozs7MkNBbUJoQyxRQUFRLHFCQUFxQjs7O0FBQ2xELFVBQU0sbUJBQW1CLEVBQW5CLENBRDRDO0FBRWxELFdBQUssSUFBTSxNQUFOLElBQWdCLG1CQUFyQixFQUEwQztBQUN4QyxZQUFJLG9CQUFvQixjQUFwQixDQUFtQyxNQUFuQyxDQUFKLEVBQWdEOztBQUM5QyxnQkFBTSxVQUFhLGVBQVUsTUFBdkI7QUFDTiw2QkFBaUIsTUFBakIsSUFBMkIsWUFBcUI7a0JBQXBCLG1FQUFhLGtCQUFPOztBQUM5QyxxQkFBSyxNQUFMLENBQVksT0FBWixDQUFvQixPQUFwQixFQUE2QixVQUE3QixFQUQ4QzthQUFyQjtlQUZtQjtTQUFoRDtPQURGO0FBUUEsYUFBTyxnQkFBUCxDQVZrRDs7Ozs7Ozs7O2dDQWdCeEMsZUFBZTtBQUN6QixXQUFLLElBQU0sTUFBTixJQUFnQixhQUFyQixFQUFvQztBQUNsQyxZQUFJLGNBQWMsY0FBZCxDQUE2QixNQUE3QixDQUFKLEVBQTBDO0FBQ3hDLGVBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsY0FBYyxNQUFkLENBQXhCLEVBRHdDO1NBQTFDO09BREY7Ozs7Ozs7OztnREFVMEIsVUFBVTtBQUNwQyxVQUFNLHFCQUFxQixPQUFPLE1BQVAsQ0FBYyxnREFBZCxFQUE4QyxRQUE5QyxDQUFyQixDQUQ4QjtBQUVwQyxXQUFLLG1CQUFMLENBQXlCLElBQXpCLENBQThCLGtCQUE5QixFQUZvQzs7OztTQTdUM0I7Ozs7Ozs7Ozs7Ozs7QUMxQmI7O0FBRUE7Ozs7Ozs7O0FBTU8sSUFBTSw0QkFBVSx1QkFBVjs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFnQkE7Ozs7O0FBSVgsV0FKVyxNQUlYLE9BQWtGOzJCQUFwRSxPQUFvRTtRQUFwRSxxQ0FBUyxzQkFBMkQ7UUFBbEQsNkJBQWtEO1FBQXRDLDJDQUFzQzs2QkFBbkIsU0FBbUI7UUFBbkIseUNBQVcscUJBQVE7OzBCQUp2RSxRQUl1RTs7Ozs7O0FBS2hGLFNBQUssTUFBTCxHQUFjLCtCQUFpQjtBQUM3QixvQkFENkI7QUFFN0IsNEJBRjZCO0FBRzdCLDBDQUg2QjtBQUk3Qix3QkFKNkI7S0FBakIsQ0FBZCxDQUxnRjtHQUFsRjs7Ozs7O2VBSlc7OzhCQW1CRDtBQUNSLFdBQUssTUFBTCxDQUFZLE9BQVosR0FEUTs7Ozs7Ozs7aUNBTUc7QUFDWCxXQUFLLE1BQUwsQ0FBWSxVQUFaLEdBRFc7Ozs7Ozs7Ozs7a0RBUWlEO1VBQXJDLGtDQUFxQztVQUF2QixnREFBdUI7O0FBQzVELGFBQU8sS0FBSyxNQUFMLENBQVksc0JBQVosZUFBK0MsS0FBSyxhQUFMLFdBQXdCLFlBQXZFLEVBQXVGLG1CQUF2RixDQUFQLENBRDREOzs7Ozs7Ozs7b0NBTzlDO0FBQ2QsYUFBTyxLQUFLLE1BQUwsQ0FBWSxhQUFaLEVBQVAsQ0FEYzs7Ozs7Ozs7O2tDQU9GO0FBQ1osYUFBTyxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQVAsQ0FEWTs7Ozs7Ozs7O2dDQU9GO0FBQ1YsYUFBTyxLQUFLLE1BQUwsQ0FBWSxTQUFaLEVBQVAsQ0FEVTs7Ozs7Ozs7O21DQU9HO0FBQ2IsYUFBTyxLQUFLLE1BQUwsQ0FBWSxZQUFaLEVBQVAsQ0FEYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs2Q0FpQnNDO1VBQWpDLGtDQUFpQztVQUFuQix3Q0FBbUI7O0FBQ25ELGFBQU8sS0FBSyxNQUFMLENBQVksU0FBWixlQUFrQyxLQUFLLGFBQUwsV0FBd0IsWUFBMUQsRUFBMEUsZUFBMUUsQ0FBUCxDQURtRDs7Ozs7Ozs7Ozt3Q0FRTTtVQUE1QyxrQ0FBNEM7VUFBOUIsd0NBQThCO1VBQWIsNEJBQWE7O0FBQ3pELFlBQU0sa0NBQTJCLGNBQTNCLENBQU4sQ0FEeUQ7Ozs7Ozs7O2dDQU0vQyxVQUFVO0FBQ3BCLFdBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0IsUUFBeEIsRUFEb0I7Ozs7Ozs7OztnREFPTSxVQUFVO0FBQ3BDLGFBQU8sS0FBSyxNQUFMLENBQVksMkJBQVosQ0FBd0MsUUFBeEMsQ0FBUCxDQURvQzs7Ozs7Ozs7OzhCQU81QixtQkFBbUI7QUFDM0IsV0FBSyxVQUFMLEdBRDJCO0FBRTNCLFVBQUksaUJBQUosRUFBdUI7QUFDckIsYUFBSyxNQUFMLENBQVksb0JBQVosQ0FBaUMsaUJBQWpDLEVBRHFCO09BQXZCO0FBR0EsV0FBSyxPQUFMLEdBTDJCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4Q0FzQm1DO2dDQUFwQyxRQUFvQztVQUFwQyx3Q0FBVSxtQkFBMEI7Z0NBQXRCLFFBQXNCO1VBQXRCLHdDQUFVLFlBQU0sRUFBTixpQkFBWTs7QUFDOUQsYUFBTyxRQUFRLE1BQVIsQ0FBZSxVQUFDLFFBQUQsRUFBVyxNQUFYLEVBQXNCO0FBQzFDLGlCQUFTLE1BQVQsSUFBbUI7Y0FBRztjQUFTO2lCQUFXLFFBQVEsRUFBRSxnQkFBRixFQUFXLFVBQVgsRUFBaUIsY0FBakIsRUFBUjtTQUF2QixDQUR1QjtBQUUxQyxlQUFPLFFBQVAsQ0FGMEM7T0FBdEIsRUFHbkIsRUFISSxDQUFQLENBRDhEOzs7O1NBaElyRDs7Ozs7Ozs7O1FDakJHOztBQVBoQjs7Ozs7OztBQU9PLFNBQVMseUJBQVQsR0FBcUM7QUFDMUMsTUFBSSxTQUFTLDBDQUFULENBRHNDO0FBRTFDLE1BQUksT0FBTywwQkFBVSxNQUFWLENBQWlCLE1BQWpCLENBQVA7Ozs7OztBQUZzQyxNQVExQyxDQUFLLE9BQUwsR0FBZSxVQUFTLE1BQVQsRUFBaUI7QUFDOUIsVUFBTSxPQUFPLEdBQVAsRUFBWTtBQUNoQixjQUFRLE1BQVI7QUFDQSxZQUFNLE9BQU8sSUFBUDtBQUNOLGVBQVMsT0FBTyxNQUFQLENBQWMsT0FBTyxPQUFQLEVBQWdCO0FBQ3JDLHdCQUFnQixnQ0FBaEI7T0FETyxDQUFUO0tBSEYsRUFPQyxJQVBELENBT00sVUFBQyxRQUFELEVBQWM7QUFDbEIsYUFBTyxTQUFTLElBQVQsRUFBUCxDQURrQjtLQUFkLENBUE4sQ0FVQyxJQVZELENBVU0sT0FBTyxTQUFQLENBVk4sQ0FXQyxLQVhELENBV08sT0FBTyxPQUFQLENBWFAsQ0FEOEI7R0FBakIsQ0FSMkI7O0FBdUIxQyxTQUFPLElBQVAsQ0F2QjBDO0NBQXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7SUNITTs7Ozs7Ozs7Ozs7eUNBSVU7Ozs7Ozs7eUNBSUE7Ozs7Ozs7OENBSUs7Ozs7Ozs7O3NDQUtSLE9BQU87Ozs7Ozs7b0NBSVQ7Ozs7Ozs7OzBDQUtNLGdCQUFnQjs7O1NBMUIzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRGIsSUFBTSxrQkFBa0I7QUFDdEIsZUFBYSxRQUFiO0FBQ0EsYUFBVyxNQUFYO0FBQ0EsbUJBQWlCLFlBQWpCO0NBSEk7Ozs7OztJQVNPOzs7OztBQUlYLFdBSlcsd0JBSVgsT0FBb0Q7UUFBdEMseUJBQXNDO1FBQTVCLDZCQUE0QjtRQUFoQixpQ0FBZ0I7OzBCQUp6QywwQkFJeUM7O0FBQ2xELFNBQUssUUFBTCxHQUFnQixRQUFoQixDQURrRDtBQUVsRCxTQUFLLFVBQUwsR0FBa0IsVUFBbEIsQ0FGa0Q7QUFHbEQsU0FBSyxZQUFMLEdBQW9CLFlBQXBCLENBSGtEO0dBQXBEOzs7Ozs7O2VBSlc7O3VDQWFRLFFBQVE7QUFDekIsVUFBTSxpQkFBaUI7QUFDckIsY0FBTSxLQUFLLFFBQUw7QUFDTixjQUFTLE9BQU8sYUFBUCxXQUEwQixLQUFLLFlBQUwsU0FBcUIsS0FBSyxRQUFMO0FBQ3hELGlCQUFTLEtBQUssV0FBTDtPQUhMLENBRG1CO0FBTXpCLFVBQUksT0FBTyxXQUFQLEVBQUosRUFBMEI7QUFDeEIsdUJBQWUsUUFBZixHQUEwQixPQUFPLFdBQVAsRUFBMUIsQ0FEd0I7T0FBMUI7QUFHQSxhQUFPO0FBQ0wsYUFBSztBQUNILHdDQURHO1NBQUw7T0FERixDQVR5Qjs7Ozs7Ozs7O3dCQW1CVDtBQUNoQixhQUFPLE1BQVAsQ0FEZ0I7Ozs7U0FoQ1A7Ozs7Ozs7OztJQTBDQTs7Ozs7OztBQUlYLFdBSlcscUJBSVgsUUFBK0M7UUFBakMsMEJBQWlDO1FBQXZCLGtDQUF1QjtRQUFULG9CQUFTOzswQkFKcEMsdUJBSW9DOzt1RUFKcEMsa0NBS0gsRUFBRSwwQkFBRixFQUFnQixrQkFBaEIsS0FEdUM7O0FBRTdDLFVBQUssS0FBTCxHQUFhLEtBQWIsQ0FGNkM7O0dBQS9DOzs7Ozs7ZUFKVzs7d0JBV0k7VUFDTCxRQUFVLEtBQVYsTUFESzs7QUFFYixhQUFPO0FBQ0wsb0JBREs7T0FBUCxDQUZhOzs7O1NBWEo7RUFBOEI7Ozs7Ozs7O0lBd0I5Qjs7Ozs7OztBQUtYLFdBTFcsK0JBS1gsUUFBeUQ7UUFBM0MsMEJBQTJDO1FBQWpDLGtDQUFpQztRQUFuQixvQkFBbUI7UUFBWiwwQkFBWTs7MEJBTDlDLGlDQUs4Qzs7d0VBTDlDLDRDQU1ILEVBQUUsa0JBQUYsRUFBWSwwQkFBWixLQURpRDs7QUFFdkQsV0FBSyxLQUFMLEdBQWEsS0FBYixDQUZ1RDtBQUd2RCxXQUFLLFFBQUwsR0FBZ0IsUUFBaEIsQ0FIdUQ7O0dBQXpEOzs7Ozs7O2VBTFc7O3dCQWNJO1VBQ0wsUUFBb0IsS0FBcEIsTUFESztVQUNFLFdBQWEsS0FBYixTQURGOztBQUViLGFBQU87QUFDTCxvQkFESyxFQUNFLGtCQURGO09BQVAsQ0FGYTs7OztTQWRKO0VBQXdDOzs7Ozs7O0lBMEJ4Qzs7Ozs7Ozs7Ozs7aURBSXFEO1VBQWpDLGtDQUFpQztVQUFuQixvQkFBbUI7VUFBWiwwQkFBWTs7QUFDOUQsYUFBTyxlQUFlLGVBQWYsQ0FBK0I7QUFDcEMsa0JBQVUsZ0JBQWdCLFdBQWhCO0FBQ1Ysa0NBRm9DO0FBR3BDLG9CQUhvQztBQUlwQywwQkFKb0M7T0FBL0IsQ0FBUCxDQUQ4RDs7Ozs7Ozs7K0NBV1o7VUFBdkIsa0NBQXVCO1VBQVQsb0JBQVM7O0FBQ2xELGFBQU8sZUFBZSxlQUFmLENBQStCO0FBQ3BDLGtCQUFVLGdCQUFnQixTQUFoQjtBQUNWLGtDQUZvQztBQUdwQyxlQUFPLEtBQVA7QUFDQSxrQkFBVSxJQUFWO09BSkssQ0FBUCxDQURrRDs7Ozs7Ozs7cURBV007VUFBdkIsa0NBQXVCO1VBQVQsb0JBQVM7O0FBQ3hELGFBQU8sZUFBZSxlQUFmLENBQStCO0FBQ3BDLGtCQUFVLGdCQUFnQixlQUFoQjtBQUNWLGtDQUZvQztBQUdwQyxlQUFPLEtBQVA7QUFDQSxrQkFBVSxJQUFWO09BSkssQ0FBUCxDQUR3RDs7Ozs7Ozs7MkNBV1U7VUFBM0MsMEJBQTJDO1VBQWpDLGtDQUFpQztVQUFuQixvQkFBbUI7VUFBWiwwQkFBWTs7QUFDbEUsVUFBSSxTQUFTLFFBQVQsRUFBbUI7QUFDckIsZUFBTyxJQUFJLHFCQUFKLENBQTBCLEVBQUUsa0JBQUYsRUFBWSwwQkFBWixFQUEwQixPQUFPLEtBQVAsRUFBcEQsQ0FBUCxDQURxQjtPQUF2QjtBQUdBLGFBQU8sSUFBSSwrQkFBSixDQUFvQyxFQUFFLGtCQUFGLEVBQVksMEJBQVosRUFBMEIsWUFBMUIsRUFBaUMsa0JBQWpDLEVBQXBDLENBQVAsQ0FKa0U7Ozs7U0FyQ3pEOzs7Ozs7Ozs7Ozs7Ozs7c0JDeEdKOzs7Ozs7Ozs7bUJBQ0E7Ozs7OzttQkFBUzs7Ozs7Ozs7O3dCQUNUOzs7Ozs7Ozs7NkJBQ0E7Ozs7Ozs2QkFBa0M7Ozs7Ozs7Ozs7Ozs7O0FDSDNDOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7O0lBTWE7Ozs7Ozs7QUFJWCxXQUpXLFdBSVgsT0FBa0o7UUFBcEkscUJBQW9JO1FBQTVILDZEQUE0SDtRQUFoRyw2QkFBZ0c7NkJBQXBGLFNBQW9GO1FBQXBGLHlDQUFXLHFCQUF5RTtxQ0FBbkUseUJBQW1FO1FBQW5FLGdKQUFtRTs7MEJBSnZJLGFBSXVJOztBQUNoSixRQUFNLG9CQUFvQixTQUFwQixpQkFBb0IsR0FBTTtBQUM5QixVQUFNLFFBQVEsTUFBSyxRQUFMLEVBQVIsQ0FEd0I7QUFFOUIsVUFBTSxZQUFZLDBCQUFlLG1CQUFmLENBQW1DO0FBQ25ELHNCQUFjLDBCQUFkO0FBQ0Esb0JBRm1EO09BQW5DLENBQVosQ0FGd0I7QUFNOUIsYUFBTyxTQUFQLENBTjhCO0tBQU47Ozs7QUFEc0g7dUVBSnZJLHdCQWdCSCxFQUFFLGNBQUYsRUFBVyxzQkFBWCxFQUF1QixvQ0FBdkIsRUFBMEMsa0JBQTFDLEtBWjBJOztBQWFoSixRQUFNLHdCQUF3QixTQUF4QixxQkFBd0IsUUFBb0M7VUFBakMsZ0NBQWlDO1VBQXBCLHNCQUFvQjtVQUFaLG9CQUFZOztBQUNoRSxjQUFRLEtBQVIsQ0FBYyxvQ0FBZCxFQUFvRCxFQUFFLHdCQUFGLEVBQWUsY0FBZixFQUF1QixZQUF2QixFQUFwRCxFQURnRTs7QUFHaEUsVUFBSSxLQUFKLEVBQVc7QUFDVCxjQUFLLFFBQUwsQ0FBYyxHQUFkLENBQWtCLEVBQUUsWUFBRixFQUFsQixFQURTO09BQVg7S0FINEIsQ0Fia0g7QUFvQmhKLFFBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFDLEtBQUQsRUFBVztBQUNuQyxjQUFRLEtBQVIsQ0FBYyxnQ0FBZCxFQUFnRCxLQUFoRCxFQURtQztLQUFYLENBcEJzSDtBQXVCaEosVUFBSywyQkFBTCxDQUFpQyxFQUFFLG9DQUFGLEVBQXFCLDRDQUFyQixFQUFqQzs7Ozs7QUF2QmdKLFNBNEJoSixDQUFLLFFBQUwsR0FBZ0IsSUFBSSx3QkFBSixFQUFoQixDQTVCZ0o7O0dBQWxKOzs7Ozs7ZUFKVzs7K0JBcUNBO0FBQ1QsYUFBTyxLQUFLLFFBQUwsQ0FBYyxHQUFkLEVBQVAsQ0FEUzs7OztTQXJDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTGIsSUFBTSxxQkFBcUIsZ0JBQXJCOzs7Ozs7O0lBTU87Ozs7O0FBSVgsV0FKVyxnQ0FJWCxHQUErQztxRUFBSixrQkFBSTs7d0JBQWpDLElBQWlDO1FBQWpDLCtCQUFNLDhCQUEyQjs7MEJBSnBDLGtDQUlvQzs7Ozs7O0FBSzdDLFNBQUssR0FBTCxHQUFXLEdBQVgsQ0FMNkM7R0FBL0M7Ozs7Ozs7ZUFKVzs7MEJBZUw7Ozs7Ozs7K0JBSVM7VUFBVCxvQkFBUzs7OztTQW5CSjs7Ozs7Ozs7O0lBMEJBOzs7Ozs7Ozs7Ozs7Ozs7OzBCQUtMO0FBQ0osYUFBTyxhQUFhLE9BQWIsQ0FBcUIsS0FBSyxHQUFMLENBQTVCLENBREk7Ozs7Ozs7OytCQU1TO1VBQVQsb0JBQVM7O0FBQ2IsbUJBQWEsT0FBYixDQUFxQixLQUFLLEdBQUwsRUFBVSxLQUEvQixFQURhOzs7O1NBWEo7RUFBNkM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUJuRCxJQUFNLDRCQUFVLFNBQVYsT0FBVSxDQUFDLElBQUQsRUFBVTtBQUMvQixNQUFNLFFBQVEsS0FBSyxLQUFMLENBQVcsS0FBSyxNQUFMLEtBQWdCLEtBQUssTUFBTCxDQUFuQyxDQUR5QjtBQUUvQixTQUFPLEtBQUssS0FBTCxDQUFQLENBRitCO0NBQVY7Ozs7Ozs7QUFVaEIsSUFBTSxrQ0FBYSxTQUFiLFVBQWEsQ0FBQyxHQUFELEVBQVM7QUFDakMsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0MsVUFBQyxRQUFELEVBQWM7QUFDbEIsV0FBTyxTQUFTLElBQVQsRUFBUCxDQURrQjtHQUFkLENBREQsQ0FJSixJQUpJLENBSUMsZ0JBQWlCO1FBQWQsdUJBQWM7O0FBQ3JCLFdBQU8sT0FBUCxDQURxQjtHQUFqQixDQUpSLENBRGlDO0NBQVQ7Ozs7Ozs7SUFjYjs7Ozs7OztBQUlYLFdBSlcsc0JBSVgsR0FBMEI7UUFBZCxnRUFBVSxrQkFBSTs7MEJBSmYsd0JBSWU7O3VFQUpmLG1DQUtILFVBRGtCOztBQUV4QixVQUFLLElBQUwsR0FBWSxxQkFBWixDQUZ3Qjs7R0FBMUI7O1NBSlc7RUFBK0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIENhbGxiYWNrUG9sbGluZ1RyYW5zcG9ydDogcmVxdWlyZSgnLi9saWIvQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0JyksXG4gIENvbWV0RDogcmVxdWlyZSgnLi9saWIvQ29tZXREJyksXG4gIExvbmdQb2xsaW5nVHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9Mb25nUG9sbGluZ1RyYW5zcG9ydCcpLFxuICBSZXF1ZXN0VHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9SZXF1ZXN0VHJhbnNwb3J0JyksXG4gIFRyYW5zcG9ydDogcmVxdWlyZSgnLi9saWIvVHJhbnNwb3J0JyksXG4gIFRyYW5zcG9ydFJlZ2lzdHJ5OiByZXF1aXJlKCcuL2xpYi9UcmFuc3BvcnRSZWdpc3RyeScpLFxuICBVdGlsczogcmVxdWlyZSgnLi9saWIvVXRpbHMnKSxcbiAgV2ViU29ja2V0VHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9XZWJTb2NrZXRUcmFuc3BvcnQnKVxufVxuIiwidmFyIFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vVHJhbnNwb3J0Jyk7XG52YXIgUmVxdWVzdFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vUmVxdWVzdFRyYW5zcG9ydCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENhbGxiYWNrUG9sbGluZ1RyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3N1cGVyID0gbmV3IFJlcXVlc3RUcmFuc3BvcnQoKTtcbiAgICB2YXIgX3NlbGYgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcik7XG5cbiAgICBfc2VsZi5hY2NlcHQgPSBmdW5jdGlvbih2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBfc2VsZi5qc29ucFNlbmQgPSBmdW5jdGlvbihwYWNrZXQpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZhaWxUcmFuc3BvcnRGbihlbnZlbG9wZSwgcmVxdWVzdCwgeCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgJ2Vycm9yJywgeCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX3NlbGYudHJhbnNwb3J0U2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAvLyBNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXIgaGFzIGEgMjA4MyBVUkwgbWF4IGxlbmd0aFxuICAgICAgICAvLyBXZSBtdXN0IGVuc3VyZSB0aGF0IHdlIHN0YXkgd2l0aGluIHRoYXQgbGVuZ3RoXG4gICAgICAgIHZhciBzdGFydCA9IDA7XG4gICAgICAgIHZhciBsZW5ndGggPSBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGg7XG4gICAgICAgIHZhciBsZW5ndGhzID0gW107XG4gICAgICAgIHdoaWxlIChsZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyBFbmNvZGUgdGhlIG1lc3NhZ2VzIGJlY2F1c2UgYWxsIGJyYWNrZXRzLCBxdW90ZXMsIGNvbW1hcywgY29sb25zLCBldGNcbiAgICAgICAgICAgIC8vIHByZXNlbnQgaW4gdGhlIEpTT04gd2lsbCBiZSBVUkwgZW5jb2RlZCwgdGFraW5nIG1hbnkgbW9yZSBjaGFyYWN0ZXJzXG4gICAgICAgICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlLm1lc3NhZ2VzLnNsaWNlKHN0YXJ0LCBzdGFydCArIGxlbmd0aCkpO1xuICAgICAgICAgICAgdmFyIHVybExlbmd0aCA9IGVudmVsb3BlLnVybC5sZW5ndGggKyBlbmNvZGVVUkkoanNvbikubGVuZ3RoO1xuXG4gICAgICAgICAgICB2YXIgbWF4TGVuZ3RoID0gdGhpcy5nZXRDb25maWd1cmF0aW9uKCkubWF4VVJJTGVuZ3RoO1xuICAgICAgICAgICAgaWYgKHVybExlbmd0aCA+IG1heExlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHggPSAnQmF5ZXV4IG1lc3NhZ2UgdG9vIGJpZyAoJyArIHVybExlbmd0aCArICcgYnl0ZXMsIG1heCBpcyAnICsgbWF4TGVuZ3RoICsgJykgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnZm9yIHRyYW5zcG9ydCAnICsgdGhpcy5nZXRUeXBlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChfZmFpbFRyYW5zcG9ydEZuLmNhbGwodGhpcywgZW52ZWxvcGUsIHJlcXVlc3QsIHgpLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC0tbGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZW5ndGhzLnB1c2gobGVuZ3RoKTtcbiAgICAgICAgICAgIHN0YXJ0ICs9IGxlbmd0aDtcbiAgICAgICAgICAgIGxlbmd0aCA9IGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aCAtIHN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGVyZSB3ZSBhcmUgc3VyZSB0aGF0IHRoZSBtZXNzYWdlcyBjYW4gYmUgc2VudCB3aXRoaW4gdGhlIFVSTCBsaW1pdFxuXG4gICAgICAgIHZhciBlbnZlbG9wZVRvU2VuZCA9IGVudmVsb3BlO1xuICAgICAgICBpZiAobGVuZ3Rocy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB2YXIgYmVnaW4gPSAwO1xuICAgICAgICAgICAgdmFyIGVuZCA9IGxlbmd0aHNbMF07XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzcGxpdCcsIGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aCwgJ21lc3NhZ2VzIGludG8nLCBsZW5ndGhzLmpvaW4oJyArICcpKTtcbiAgICAgICAgICAgIGVudmVsb3BlVG9TZW5kID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBlbnZlbG9wZSk7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZC5tZXNzYWdlcyA9IGVudmVsb3BlLm1lc3NhZ2VzLnNsaWNlKGJlZ2luLCBlbmQpO1xuICAgICAgICAgICAgZW52ZWxvcGVUb1NlbmQub25TdWNjZXNzID0gZW52ZWxvcGUub25TdWNjZXNzO1xuICAgICAgICAgICAgZW52ZWxvcGVUb1NlbmQub25GYWlsdXJlID0gZW52ZWxvcGUub25GYWlsdXJlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGxlbmd0aHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEVudmVsb3BlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBlbnZlbG9wZSk7XG4gICAgICAgICAgICAgICAgYmVnaW4gPSBlbmQ7XG4gICAgICAgICAgICAgICAgZW5kICs9IGxlbmd0aHNbaV07XG4gICAgICAgICAgICAgICAgbmV4dEVudmVsb3BlLm1lc3NhZ2VzID0gZW52ZWxvcGUubWVzc2FnZXMuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICAgICAgICAgICAgbmV4dEVudmVsb3BlLm9uU3VjY2VzcyA9IGVudmVsb3BlLm9uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUub25GYWlsdXJlID0gZW52ZWxvcGUub25GYWlsdXJlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VuZChuZXh0RW52ZWxvcGUsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc2VuZGluZyByZXF1ZXN0JywgcmVxdWVzdC5pZCwgJ2VudmVsb3BlJywgZW52ZWxvcGVUb1NlbmQpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgc2FtZVN0YWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuanNvbnBTZW5kKHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgdXJsOiBlbnZlbG9wZVRvU2VuZC51cmwsXG4gICAgICAgICAgICAgICAgc3luYzogZW52ZWxvcGVUb1NlbmQuc3luYyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5yZXF1ZXN0SGVhZGVycyxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShlbnZlbG9wZVRvU2VuZC5tZXNzYWdlcyksXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWNlaXZlZCA9IHNlbGYuY29udmVydFRvTWVzc2FnZXMocmVzcG9uc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cENvZGU6IDIwNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydFN1Y2Nlc3MoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIHJlY2VpdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uKHJlYXNvbiwgZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtZVN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNhbWVTdGFjayA9IGZhbHNlO1xuICAgICAgICB9IGNhdGNoICh4eCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4eFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIF9zZWxmO1xufTtcbiIsInZhciBUcmFuc3BvcnRSZWdpc3RyeSA9IHJlcXVpcmUoJy4vVHJhbnNwb3J0UmVnaXN0cnknKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG4vKipcbiAqIFRoZSBjb25zdHJ1Y3RvciBmb3IgYSBDb21ldEQgb2JqZWN0LCBpZGVudGlmaWVkIGJ5IGFuIG9wdGlvbmFsIG5hbWUuXG4gKiBUaGUgZGVmYXVsdCBuYW1lIGlzIHRoZSBzdHJpbmcgJ2RlZmF1bHQnLlxuICogSW4gdGhlIHJhcmUgY2FzZSBhIHBhZ2UgbmVlZHMgbW9yZSB0aGFuIG9uZSBCYXlldXggY29udmVyc2F0aW9uLFxuICogYSBuZXcgaW5zdGFuY2UgY2FuIGJlIGNyZWF0ZWQgdmlhOlxuICogPHByZT5cbiAqIHZhciBiYXlldXhVcmwyID0gLi4uO1xuICpcbiAqIC8vIERvam8gc3R5bGVcbiAqIHZhciBjb21ldGQyID0gbmV3IGRvam94LkNvbWV0RCgnYW5vdGhlcl9vcHRpb25hbF9uYW1lJyk7XG4gKlxuICogLy8galF1ZXJ5IHN0eWxlXG4gKiB2YXIgY29tZXRkMiA9IG5ldyAkLkNvbWV0RCgnYW5vdGhlcl9vcHRpb25hbF9uYW1lJyk7XG4gKlxuICogY29tZXRkMi5pbml0KHt1cmw6IGJheWV1eFVybDJ9KTtcbiAqIDwvcHJlPlxuICogQHBhcmFtIG5hbWUgdGhlIG9wdGlvbmFsIG5hbWUgb2YgdGhpcyBjb21ldGQgb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ29tZXREKG5hbWUpIHtcbiAgICB2YXIgX2NvbWV0ZCA9IHRoaXM7XG4gICAgdmFyIF9uYW1lID0gbmFtZSB8fCAnZGVmYXVsdCc7XG4gICAgdmFyIF9jcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgIHZhciBfdHJhbnNwb3J0cyA9IG5ldyBUcmFuc3BvcnRSZWdpc3RyeSgpO1xuICAgIHZhciBfdHJhbnNwb3J0O1xuICAgIHZhciBfc3RhdHVzID0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgdmFyIF9tZXNzYWdlSWQgPSAwO1xuICAgIHZhciBfY2xpZW50SWQgPSBudWxsO1xuICAgIHZhciBfYmF0Y2ggPSAwO1xuICAgIHZhciBfbWVzc2FnZVF1ZXVlID0gW107XG4gICAgdmFyIF9pbnRlcm5hbEJhdGNoID0gZmFsc2U7XG4gICAgdmFyIF9saXN0ZW5lcnMgPSB7fTtcbiAgICB2YXIgX2JhY2tvZmYgPSAwO1xuICAgIHZhciBfc2NoZWR1bGVkU2VuZCA9IG51bGw7XG4gICAgdmFyIF9leHRlbnNpb25zID0gW107XG4gICAgdmFyIF9hZHZpY2UgPSB7fTtcbiAgICB2YXIgX2hhbmRzaGFrZVByb3BzO1xuICAgIHZhciBfaGFuZHNoYWtlQ2FsbGJhY2s7XG4gICAgdmFyIF9jYWxsYmFja3MgPSB7fTtcbiAgICB2YXIgX3JlbW90ZUNhbGxzID0ge307XG4gICAgdmFyIF9yZWVzdGFibGlzaCA9IGZhbHNlO1xuICAgIHZhciBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdmFyIF91bmNvbm5lY3RUaW1lID0gMDtcbiAgICB2YXIgX2hhbmRzaGFrZU1lc3NhZ2VzID0gMDtcbiAgICB2YXIgX2NvbmZpZyA9IHtcbiAgICAgICAgcHJvdG9jb2w6IG51bGwsXG4gICAgICAgIHN0aWNreVJlY29ubmVjdDogdHJ1ZSxcbiAgICAgICAgY29ubmVjdFRpbWVvdXQ6IDAsXG4gICAgICAgIG1heENvbm5lY3Rpb25zOiAyLFxuICAgICAgICBiYWNrb2ZmSW5jcmVtZW50OiAxMDAwLFxuICAgICAgICBtYXhCYWNrb2ZmOiA2MDAwMCxcbiAgICAgICAgbG9nTGV2ZWw6ICdpbmZvJyxcbiAgICAgICAgcmV2ZXJzZUluY29taW5nRXh0ZW5zaW9uczogdHJ1ZSxcbiAgICAgICAgbWF4TmV0d29ya0RlbGF5OiAxMDAwMCxcbiAgICAgICAgcmVxdWVzdEhlYWRlcnM6IHt9LFxuICAgICAgICBhcHBlbmRNZXNzYWdlVHlwZVRvVVJMOiB0cnVlLFxuICAgICAgICBhdXRvQmF0Y2g6IGZhbHNlLFxuICAgICAgICB1cmxzOiB7fSxcbiAgICAgICAgbWF4VVJJTGVuZ3RoOiAyMDAwLFxuICAgICAgICBhZHZpY2U6IHtcbiAgICAgICAgICAgIHRpbWVvdXQ6IDYwMDAwLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDAsXG4gICAgICAgICAgICByZWNvbm5lY3Q6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIG1heEludGVydmFsOiAwXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpZWxkVmFsdWUob2JqZWN0LCBuYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0W25hbWVdO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWl4ZXMgaW4gdGhlIGdpdmVuIG9iamVjdHMgaW50byB0aGUgdGFyZ2V0IG9iamVjdCBieSBjb3B5aW5nIHRoZSBwcm9wZXJ0aWVzLlxuICAgICAqIEBwYXJhbSBkZWVwIGlmIHRoZSBjb3B5IG11c3QgYmUgZGVlcFxuICAgICAqIEBwYXJhbSB0YXJnZXQgdGhlIHRhcmdldCBvYmplY3RcbiAgICAgKiBAcGFyYW0gb2JqZWN0cyB0aGUgb2JqZWN0cyB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBjb3BpZWQgaW50byB0aGUgdGFyZ2V0XG4gICAgICovXG4gICAgdGhpcy5fbWl4aW4gPSBmdW5jdGlvbihkZWVwLCB0YXJnZXQsIG9iamVjdHMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRhcmdldCB8fCB7fTtcblxuICAgICAgICAvLyBTa2lwIGZpcnN0IDIgcGFyYW1ldGVycyAoZGVlcCBhbmQgdGFyZ2V0KSwgYW5kIGxvb3Agb3ZlciB0aGUgb3RoZXJzXG4gICAgICAgIGZvciAodmFyIGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgb2JqZWN0ID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICAgICAgICBpZiAob2JqZWN0ID09PSB1bmRlZmluZWQgfHwgb2JqZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIG9iamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9wID0gX2ZpZWxkVmFsdWUob2JqZWN0LCBwcm9wTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXJnID0gX2ZpZWxkVmFsdWUocmVzdWx0LCBwcm9wTmFtZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gQXZvaWQgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AgPT09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gRG8gbm90IG1peGluIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGVlcCAmJiB0eXBlb2YgcHJvcCA9PT0gJ29iamVjdCcgJiYgcHJvcCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3AgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtwcm9wTmFtZV0gPSB0aGlzLl9taXhpbihkZWVwLCB0YXJnIGluc3RhbmNlb2YgQXJyYXkgPyB0YXJnIDogW10sIHByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc291cmNlID0gdHlwZW9mIHRhcmcgPT09ICdvYmplY3QnICYmICEodGFyZyBpbnN0YW5jZW9mIEFycmF5KSA/IHRhcmcgOiB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcHJvcE5hbWVdID0gdGhpcy5fbWl4aW4oZGVlcCwgc291cmNlLCBwcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtwcm9wTmFtZV0gPSBwcm9wO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzU3RyaW5nKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBVdGlscy5pc1N0cmluZyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2lzRnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF96ZXJvUGFkKHZhbHVlLCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgICAgICB3aGlsZSAoLS1sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gTWF0aC5wb3coMTAsIGxlbmd0aCkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdCArPSAnMCc7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IHZhbHVlO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9sb2cobGV2ZWwsIGFyZ3MpIHtcbiAgICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgY29uc29sZSkge1xuICAgICAgICAgICAgdmFyIGxvZ2dlciA9IGNvbnNvbGVbbGV2ZWxdO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGxvZ2dlcikpIHtcbiAgICAgICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICBbXS5zcGxpY2UuY2FsbChhcmdzLCAwLCAwLCBfemVyb1BhZChub3cuZ2V0SG91cnMoKSwgMikgKyAnOicgKyBfemVyb1BhZChub3cuZ2V0TWludXRlcygpLCAyKSArICc6JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBfemVyb1BhZChub3cuZ2V0U2Vjb25kcygpLCAyKSArICcuJyArIF96ZXJvUGFkKG5vdy5nZXRNaWxsaXNlY29uZHMoKSwgMykpO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3dhcm4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2xvZygnd2FybicsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHRoaXMuX2luZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF9jb25maWcubG9nTGV2ZWwgIT09ICd3YXJuJykge1xuICAgICAgICAgICAgX2xvZygnaW5mbycsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF9jb25maWcubG9nTGV2ZWwgPT09ICdkZWJ1ZycpIHtcbiAgICAgICAgICAgIF9sb2coJ2RlYnVnJywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfc3BsaXRVUkwodXJsKSB7XG4gICAgICAgIC8vIFsxXSA9IHByb3RvY29sOi8vLFxuICAgICAgICAvLyBbMl0gPSBob3N0OnBvcnQsXG4gICAgICAgIC8vIFszXSA9IGhvc3QsXG4gICAgICAgIC8vIFs0XSA9IElQdjZfaG9zdCxcbiAgICAgICAgLy8gWzVdID0gSVB2NF9ob3N0LFxuICAgICAgICAvLyBbNl0gPSA6cG9ydCxcbiAgICAgICAgLy8gWzddID0gcG9ydCxcbiAgICAgICAgLy8gWzhdID0gdXJpLFxuICAgICAgICAvLyBbOV0gPSByZXN0IChxdWVyeSAvIGZyYWdtZW50KVxuICAgICAgICByZXR1cm4gLyheaHR0cHM/OlxcL1xcLyk/KCgoXFxbW15cXF1dK1xcXSl8KFteOlxcL1xcPyNdKykpKDooXFxkKykpPyk/KFteXFw/I10qKSguKik/Ly5leGVjKHVybCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBob3N0QW5kUG9ydCBpcyBjcm9zcyBkb21haW4uXG4gICAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gY2hlY2tzIGFnYWluc3Qgd2luZG93LmxvY2F0aW9uLmhvc3RcbiAgICAgKiBidXQgdGhpcyBmdW5jdGlvbiBjYW4gYmUgb3ZlcnJpZGRlbiB0byBtYWtlIGl0IHdvcmsgaW4gbm9uLWJyb3dzZXJcbiAgICAgKiBlbnZpcm9ubWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaG9zdEFuZFBvcnQgdGhlIGhvc3QgYW5kIHBvcnQgaW4gZm9ybWF0IGhvc3Q6cG9ydFxuICAgICAqIEByZXR1cm4gd2hldGhlciB0aGUgZ2l2ZW4gaG9zdEFuZFBvcnQgaXMgY3Jvc3MgZG9tYWluXG4gICAgICovXG4gICAgdGhpcy5faXNDcm9zc0RvbWFpbiA9IGZ1bmN0aW9uKGhvc3RBbmRQb3J0KSB7XG4gICAgICAgIHJldHVybiBob3N0QW5kUG9ydCAmJiBob3N0QW5kUG9ydCAhPT0gd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9jb25maWd1cmUoY29uZmlndXJhdGlvbikge1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQ29uZmlndXJpbmcgY29tZXRkIG9iamVjdCB3aXRoJywgY29uZmlndXJhdGlvbik7XG4gICAgICAgIC8vIFN1cHBvcnQgb2xkIHN0eWxlIHBhcmFtLCB3aGVyZSBvbmx5IHRoZSBCYXlldXggc2VydmVyIFVSTCB3YXMgcGFzc2VkXG4gICAgICAgIGlmIChfaXNTdHJpbmcoY29uZmlndXJhdGlvbikpIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSB7IHVybDogY29uZmlndXJhdGlvbiB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgX2NvbmZpZyA9IF9jb21ldGQuX21peGluKGZhbHNlLCBfY29uZmlnLCBjb25maWd1cmF0aW9uKTtcblxuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKTtcbiAgICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgICAgIHRocm93ICdNaXNzaW5nIHJlcXVpcmVkIGNvbmZpZ3VyYXRpb24gcGFyYW1ldGVyIFxcJ3VybFxcJyBzcGVjaWZ5aW5nIHRoZSBCYXlldXggc2VydmVyIFVSTCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiB3ZSdyZSBjcm9zcyBkb21haW4uXG4gICAgICAgIHZhciB1cmxQYXJ0cyA9IF9zcGxpdFVSTCh1cmwpO1xuICAgICAgICB2YXIgaG9zdEFuZFBvcnQgPSB1cmxQYXJ0c1syXTtcbiAgICAgICAgdmFyIHVyaSA9IHVybFBhcnRzWzhdO1xuICAgICAgICB2YXIgYWZ0ZXJVUkkgPSB1cmxQYXJ0c1s5XTtcbiAgICAgICAgX2Nyb3NzRG9tYWluID0gX2NvbWV0ZC5faXNDcm9zc0RvbWFpbihob3N0QW5kUG9ydCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYXBwZW5kaW5nIGV4dHJhIHBhdGggaXMgc3VwcG9ydGVkXG4gICAgICAgIGlmIChfY29uZmlnLmFwcGVuZE1lc3NhZ2VUeXBlVG9VUkwpIHtcbiAgICAgICAgICAgIGlmIChhZnRlclVSSSAhPT0gdW5kZWZpbmVkICYmIGFmdGVyVVJJLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdBcHBlbmRpbmcgbWVzc2FnZSB0eXBlIHRvIFVSSSAnICsgdXJpICsgYWZ0ZXJVUkkgKyAnIGlzIG5vdCBzdXBwb3J0ZWQsIGRpc2FibGluZyBcXCdhcHBlbmRNZXNzYWdlVHlwZVRvVVJMXFwnIGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgICAgICAgICAgICBfY29uZmlnLmFwcGVuZE1lc3NhZ2VUeXBlVG9VUkwgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHVyaVNlZ21lbnRzID0gdXJpLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RTZWdtZW50SW5kZXggPSB1cmlTZWdtZW50cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIGlmICh1cmkubWF0Y2goL1xcLyQvKSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudEluZGV4IC09IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1cmlTZWdtZW50c1tsYXN0U2VnbWVudEluZGV4XS5pbmRleE9mKCcuJykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBWZXJ5IGxpa2VseSB0aGUgQ29tZXREIHNlcnZsZXQncyBVUkwgcGF0dGVybiBpcyBtYXBwZWQgdG8gYW4gZXh0ZW5zaW9uLCBzdWNoIGFzICouY29tZXRkXG4gICAgICAgICAgICAgICAgICAgIC8vIEl0IHdpbGwgYmUgZGlmZmljdWx0IHRvIGFkZCB0aGUgZXh0cmEgcGF0aCBpbiB0aGlzIGNhc2VcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnQXBwZW5kaW5nIG1lc3NhZ2UgdHlwZSB0byBVUkkgJyArIHVyaSArICcgaXMgbm90IHN1cHBvcnRlZCwgZGlzYWJsaW5nIFxcJ2FwcGVuZE1lc3NhZ2VUeXBlVG9VUkxcXCcgY29uZmlndXJhdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICBfY29uZmlnLmFwcGVuZE1lc3NhZ2VUeXBlVG9VUkwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tzdWJzY3JpcHRpb24uY2hhbm5lbF07XG4gICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucyAmJiBzdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbi5pZF0pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgc3Vic2NyaXB0aW9uc1tzdWJzY3JpcHRpb24uaWRdO1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdSZW1vdmVkJywgc3Vic2NyaXB0aW9uLmxpc3RlbmVyID8gJ2xpc3RlbmVyJyA6ICdzdWJzY3JpcHRpb24nLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlbW92ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbiAmJiAhc3Vic2NyaXB0aW9uLmxpc3RlbmVyKSB7XG4gICAgICAgICAgICBfcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jbGVhclN1YnNjcmlwdGlvbnMoKSB7XG4gICAgICAgIGZvciAodmFyIGNoYW5uZWwgaW4gX2xpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKF9saXN0ZW5lcnMuaGFzT3duUHJvcGVydHkoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpcHRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3NldFN0YXR1cyhuZXdTdGF0dXMpIHtcbiAgICAgICAgaWYgKF9zdGF0dXMgIT09IG5ld1N0YXR1cykge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1N0YXR1cycsIF9zdGF0dXMsICctPicsIG5ld1N0YXR1cyk7XG4gICAgICAgICAgICBfc3RhdHVzID0gbmV3U3RhdHVzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2lzRGlzY29ubmVjdGVkKCkge1xuICAgICAgICByZXR1cm4gX3N0YXR1cyA9PT0gJ2Rpc2Nvbm5lY3RpbmcnIHx8IF9zdGF0dXMgPT09ICdkaXNjb25uZWN0ZWQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9uZXh0TWVzc2FnZUlkKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gKytfbWVzc2FnZUlkO1xuICAgICAgICByZXR1cm4gJycgKyByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FwcGx5RXh0ZW5zaW9uKHNjb3BlLCBjYWxsYmFjaywgbmFtZSwgbWVzc2FnZSwgb3V0Z29pbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKHNjb3BlLCBtZXNzYWdlKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfY29tZXRkLm9uRXh0ZW5zaW9uRXhjZXB0aW9uO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIGV4dGVuc2lvbiBleGNlcHRpb24gaGFuZGxlcicsIG5hbWUsIHgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChfY29tZXRkLCB4LCBuYW1lLCBvdXRnb2luZywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoeHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgZXh0ZW5zaW9uIGV4Y2VwdGlvbiBoYW5kbGVyJywgbmFtZSwgeHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgZXh0ZW5zaW9uJywgbmFtZSwgeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcHBseUluY29taW5nRXh0ZW5zaW9ucyhtZXNzYWdlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW5kZXggPSBfY29uZmlnLnJldmVyc2VJbmNvbWluZ0V4dGVuc2lvbnMgPyBfZXh0ZW5zaW9ucy5sZW5ndGggLSAxIC0gaSA6IGk7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaW5kZXhdO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZXh0ZW5zaW9uLmV4dGVuc2lvbi5pbmNvbWluZztcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gX2FwcGx5RXh0ZW5zaW9uKGV4dGVuc2lvbi5leHRlbnNpb24sIGNhbGxiYWNrLCBleHRlbnNpb24ubmFtZSwgbWVzc2FnZSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSByZXN1bHQgPT09IHVuZGVmaW5lZCA/IG1lc3NhZ2UgOiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FwcGx5T3V0Z29pbmdFeHRlbnNpb25zKG1lc3NhZ2UpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGV4dGVuc2lvbi5leHRlbnNpb24ub3V0Z29pbmc7XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IF9hcHBseUV4dGVuc2lvbihleHRlbnNpb24uZXh0ZW5zaW9uLCBjYWxsYmFjaywgZXh0ZW5zaW9uLm5hbWUsIG1lc3NhZ2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSByZXN1bHQgPT09IHVuZGVmaW5lZCA/IG1lc3NhZ2UgOiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdGlmeShjaGFubmVsLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tjaGFubmVsXTtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMgJiYgc3Vic2NyaXB0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAvLyBTdWJzY3JpcHRpb25zIG1heSBjb21lIGFuZCBnbywgc28gdGhlIGFycmF5IG1heSBoYXZlICdob2xlcydcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24uY2FsbGJhY2suY2FsbChzdWJzY3JpcHRpb24uc2NvcGUsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25MaXN0ZW5lckV4Y2VwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdJbnZva2luZyBsaXN0ZW5lciBleGNlcHRpb24gaGFuZGxlcicsIHN1YnNjcmlwdGlvbiwgeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIHgsIHN1YnNjcmlwdGlvbiwgc3Vic2NyaXB0aW9uLmxpc3RlbmVyLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoICh4eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBsaXN0ZW5lciBleGNlcHRpb24gaGFuZGxlcicsIHN1YnNjcmlwdGlvbiwgeHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgbGlzdGVuZXInLCBzdWJzY3JpcHRpb24sIG1lc3NhZ2UsIHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdGlmeUxpc3RlbmVycyhjaGFubmVsLCBtZXNzYWdlKSB7XG4gICAgICAgIC8vIE5vdGlmeSBkaXJlY3QgbGlzdGVuZXJzXG4gICAgICAgIF9ub3RpZnkoY2hhbm5lbCwgbWVzc2FnZSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSBnbG9iYmluZyBsaXN0ZW5lcnNcbiAgICAgICAgdmFyIGNoYW5uZWxQYXJ0cyA9IGNoYW5uZWwuc3BsaXQoJy8nKTtcbiAgICAgICAgdmFyIGxhc3QgPSBjaGFubmVsUGFydHMubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IGxhc3Q7IGkgPiAwOyAtLWkpIHtcbiAgICAgICAgICAgIHZhciBjaGFubmVsUGFydCA9IGNoYW5uZWxQYXJ0cy5zbGljZSgwLCBpKS5qb2luKCcvJykgKyAnLyonO1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBub3RpZnkgL2Zvby8qIGlmIHRoZSBjaGFubmVsIGlzIC9mb28vYmFyL2JheixcbiAgICAgICAgICAgIC8vIHNvIHdlIHN0b3AgYXQgdGhlIGZpcnN0IG5vbiByZWN1cnNpdmUgZ2xvYmJpbmdcbiAgICAgICAgICAgIGlmIChpID09PSBsYXN0KSB7XG4gICAgICAgICAgICAgICAgX25vdGlmeShjaGFubmVsUGFydCwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBBZGQgdGhlIHJlY3Vyc2l2ZSBnbG9iYmVyIGFuZCBub3RpZnlcbiAgICAgICAgICAgIGNoYW5uZWxQYXJ0ICs9ICcqJztcbiAgICAgICAgICAgIF9ub3RpZnkoY2hhbm5lbFBhcnQsIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NhbmNlbERlbGF5ZWRTZW5kKCkge1xuICAgICAgICBpZiAoX3NjaGVkdWxlZFNlbmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIFV0aWxzLmNsZWFyVGltZW91dChfc2NoZWR1bGVkU2VuZCk7XG4gICAgICAgIH1cbiAgICAgICAgX3NjaGVkdWxlZFNlbmQgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kZWxheWVkU2VuZChvcGVyYXRpb24sIGRlbGF5KSB7XG4gICAgICAgIF9jYW5jZWxEZWxheWVkU2VuZCgpO1xuICAgICAgICB2YXIgdGltZSA9IF9hZHZpY2UuaW50ZXJ2YWwgKyBkZWxheTtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0Z1bmN0aW9uIHNjaGVkdWxlZCBpbicsIHRpbWUsICdtcywgaW50ZXJ2YWwgPScsIF9hZHZpY2UuaW50ZXJ2YWwsICdiYWNrb2ZmID0nLCBfYmFja29mZiwgb3BlcmF0aW9uKTtcbiAgICAgICAgX3NjaGVkdWxlZFNlbmQgPSBVdGlscy5zZXRUaW1lb3V0KF9jb21ldGQsIG9wZXJhdGlvbiwgdGltZSk7XG4gICAgfVxuXG4gICAgLy8gTmVlZGVkIHRvIGJyZWFrIGN5Y2xpYyBkZXBlbmRlbmNpZXMgYmV0d2VlbiBmdW5jdGlvbiBkZWZpbml0aW9uc1xuICAgIHZhciBfaGFuZGxlTWVzc2FnZXM7XG4gICAgdmFyIF9oYW5kbGVGYWlsdXJlO1xuXG4gICAgLyoqXG4gICAgICogRGVsaXZlcnMgdGhlIG1lc3NhZ2VzIHRvIHRoZSBDb21ldEQgc2VydmVyXG4gICAgICogQHBhcmFtIHN5bmMgd2hldGhlciB0aGUgc2VuZCBpcyBzeW5jaHJvbm91c1xuICAgICAqIEBwYXJhbSBtZXNzYWdlcyB0aGUgYXJyYXkgb2YgbWVzc2FnZXMgdG8gc2VuZFxuICAgICAqIEBwYXJhbSBtZXRhQ29ubmVjdCB0cnVlIGlmIHRoaXMgc2VuZCBpcyBvbiAvbWV0YS9jb25uZWN0XG4gICAgICogQHBhcmFtIGV4dHJhUGF0aCBhbiBleHRyYSBwYXRoIHRvIGFwcGVuZCB0byB0aGUgQmF5ZXV4IHNlcnZlciBVUkxcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfc2VuZChzeW5jLCBtZXNzYWdlcywgbWV0YUNvbm5lY3QsIGV4dHJhUGF0aCkge1xuICAgICAgICAvLyBXZSBtdXN0IGJlIHN1cmUgdGhhdCB0aGUgbWVzc2FnZXMgaGF2ZSBhIGNsaWVudElkLlxuICAgICAgICAvLyBUaGlzIGlzIG5vdCBndWFyYW50ZWVkIHNpbmNlIHRoZSBoYW5kc2hha2UgbWF5IHRha2UgdGltZSB0byByZXR1cm5cbiAgICAgICAgLy8gKGFuZCBoZW5jZSB0aGUgY2xpZW50SWQgaXMgbm90IGtub3duIHlldCkgYW5kIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAvLyBtYXkgY3JlYXRlIG90aGVyIG1lc3NhZ2VzLlxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VJZCA9IG1lc3NhZ2UuaWQ7XG5cbiAgICAgICAgICAgIGlmIChfY2xpZW50SWQpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLmNsaWVudElkID0gX2NsaWVudElkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtZXNzYWdlID0gX2FwcGx5T3V0Z29pbmdFeHRlbnNpb25zKG1lc3NhZ2UpO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCAmJiBtZXNzYWdlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gRXh0ZW5zaW9ucyBtYXkgaGF2ZSBtb2RpZmllZCB0aGUgbWVzc2FnZSBpZCwgYnV0IHdlIG5lZWQgdG8gb3duIGl0LlxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuaWQgPSBtZXNzYWdlSWQ7XG4gICAgICAgICAgICAgICAgbWVzc2FnZXNbaV0gPSBtZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgX2NhbGxiYWNrc1ttZXNzYWdlSWRdO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnNwbGljZShpLS0sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVybCA9IF9jb21ldGQuZ2V0VVJMKCk7XG4gICAgICAgIGlmIChfY29uZmlnLmFwcGVuZE1lc3NhZ2VUeXBlVG9VUkwpIHtcbiAgICAgICAgICAgIC8vIElmIHVybCBkb2VzIG5vdCBlbmQgd2l0aCAnLycsIHRoZW4gYXBwZW5kIGl0XG4gICAgICAgICAgICBpZiAoIXVybC5tYXRjaCgvXFwvJC8pKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsICsgJy8nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4dHJhUGF0aCkge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybCArIGV4dHJhUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IHtcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgc3luYzogc3luYyxcbiAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcbiAgICAgICAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24ocmN2ZE1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgX2hhbmRsZU1lc3NhZ2VzLmNhbGwoX2NvbWV0ZCwgcmN2ZE1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgaGFuZGxpbmcgb2YgbWVzc2FnZXMnLCB4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25GYWlsdXJlOiBmdW5jdGlvbihjb25kdWl0LCBtZXNzYWdlcywgZmFpbHVyZSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc3BvcnQgPSBfY29tZXRkLmdldFRyYW5zcG9ydCgpO1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmNvbm5lY3Rpb25UeXBlID0gdHJhbnNwb3J0ID8gdHJhbnNwb3J0LmdldFR5cGUoKSA6IFwidW5rbm93blwiO1xuICAgICAgICAgICAgICAgICAgICBfaGFuZGxlRmFpbHVyZS5jYWxsKF9jb21ldGQsIGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgaGFuZGxpbmcgb2YgZmFpbHVyZScsIHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1NlbmQnLCBlbnZlbG9wZSk7XG4gICAgICAgIF90cmFuc3BvcnQuc2VuZChlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9xdWV1ZVNlbmQobWVzc2FnZSkge1xuICAgICAgICBpZiAoX2JhdGNoID4gMCB8fCBfaW50ZXJuYWxCYXRjaCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgX21lc3NhZ2VRdWV1ZS5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3NlbmQoZmFsc2UsIFttZXNzYWdlXSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYSBjb21wbGV0ZSBiYXlldXggbWVzc2FnZS5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIGFzIGEgcHVibGljIHNvIHRoYXQgZXh0ZW5zaW9ucyBtYXkgdXNlIGl0XG4gICAgICogdG8gc2VuZCBiYXlldXggbWVzc2FnZSBkaXJlY3RseSwgZm9yIGV4YW1wbGUgaW4gY2FzZSBvZiByZS1zZW5kaW5nXG4gICAgICogbWVzc2FnZXMgdGhhdCBoYXZlIGFscmVhZHkgYmVlbiBzZW50IGJ1dCB0aGF0IGZvciBzb21lIHJlYXNvbiBtdXN0XG4gICAgICogYmUgcmVzZW50LlxuICAgICAqL1xuICAgIHRoaXMuc2VuZCA9IF9xdWV1ZVNlbmQ7XG5cbiAgICBmdW5jdGlvbiBfcmVzZXRCYWNrb2ZmKCkge1xuICAgICAgICBfYmFja29mZiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2luY3JlYXNlQmFja29mZigpIHtcbiAgICAgICAgaWYgKF9iYWNrb2ZmIDwgX2NvbmZpZy5tYXhCYWNrb2ZmKSB7XG4gICAgICAgICAgICBfYmFja29mZiArPSBfY29uZmlnLmJhY2tvZmZJbmNyZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9iYWNrb2ZmO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIHRoZSBiYXRjaCBvZiBtZXNzYWdlcyB0byBiZSBzZW50IGluIGEgc2luZ2xlIHJlcXVlc3QuXG4gICAgICogQHNlZSAjX2VuZEJhdGNoKHNlbmRNZXNzYWdlcylcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfc3RhcnRCYXRjaCgpIHtcbiAgICAgICAgKytfYmF0Y2g7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdTdGFydGluZyBiYXRjaCwgZGVwdGgnLCBfYmF0Y2gpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mbHVzaEJhdGNoKCkge1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSBfbWVzc2FnZVF1ZXVlO1xuICAgICAgICBfbWVzc2FnZVF1ZXVlID0gW107XG4gICAgICAgIGlmIChtZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBfc2VuZChmYWxzZSwgbWVzc2FnZXMsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuZHMgdGhlIGJhdGNoIG9mIG1lc3NhZ2VzIHRvIGJlIHNlbnQgaW4gYSBzaW5nbGUgcmVxdWVzdCxcbiAgICAgKiBvcHRpb25hbGx5IHNlbmRpbmcgbWVzc2FnZXMgcHJlc2VudCBpbiB0aGUgbWVzc2FnZSBxdWV1ZSBkZXBlbmRpbmdcbiAgICAgKiBvbiB0aGUgZ2l2ZW4gYXJndW1lbnQuXG4gICAgICogQHNlZSAjX3N0YXJ0QmF0Y2goKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9lbmRCYXRjaCgpIHtcbiAgICAgICAgLS1fYmF0Y2g7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdFbmRpbmcgYmF0Y2gsIGRlcHRoJywgX2JhdGNoKTtcbiAgICAgICAgaWYgKF9iYXRjaCA8IDApIHtcbiAgICAgICAgICAgIHRocm93ICdDYWxscyB0byBzdGFydEJhdGNoKCkgYW5kIGVuZEJhdGNoKCkgYXJlIG5vdCBwYWlyZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9iYXRjaCA9PT0gMCAmJiAhX2lzRGlzY29ubmVjdGVkKCkgJiYgIV9pbnRlcm5hbEJhdGNoKSB7XG4gICAgICAgICAgICBfZmx1c2hCYXRjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgdGhlIGNvbm5lY3QgbWVzc2FnZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9jb25uZWN0KCkge1xuICAgICAgICBpZiAoIV9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvY29ubmVjdCcsXG4gICAgICAgICAgICAgICAgY29ubmVjdGlvblR5cGU6IF90cmFuc3BvcnQuZ2V0VHlwZSgpXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBJbiBjYXNlIG9mIHJlbG9hZCBvciB0ZW1wb3JhcnkgbG9zcyBvZiBjb25uZWN0aW9uXG4gICAgICAgICAgICAvLyB3ZSB3YW50IHRoZSBuZXh0IHN1Y2Nlc3NmdWwgY29ubmVjdCB0byByZXR1cm4gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgYmVpbmcgaGVsZCBieSB0aGUgc2VydmVyLCBzbyB0aGF0IGNvbm5lY3QgbGlzdGVuZXJzXG4gICAgICAgICAgICAvLyBjYW4gYmUgbm90aWZpZWQgdGhhdCB0aGUgY29ubmVjdGlvbiBoYXMgYmVlbiByZS1lc3RhYmxpc2hlZFxuICAgICAgICAgICAgaWYgKCFfY29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgYmF5ZXV4TWVzc2FnZS5hZHZpY2UgPSB7IHRpbWVvdXQ6IDAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX3NldFN0YXR1cygnY29ubmVjdGluZycpO1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0Nvbm5lY3Qgc2VudCcsIGJheWV1eE1lc3NhZ2UpO1xuICAgICAgICAgICAgX3NlbmQoZmFsc2UsIFtiYXlldXhNZXNzYWdlXSwgdHJ1ZSwgJ2Nvbm5lY3QnKTtcbiAgICAgICAgICAgIF9zZXRTdGF0dXMoJ2Nvbm5lY3RlZCcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2RlbGF5ZWRDb25uZWN0KGRlbGF5KSB7XG4gICAgICAgIF9zZXRTdGF0dXMoJ2Nvbm5lY3RpbmcnKTtcbiAgICAgICAgX2RlbGF5ZWRTZW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX2Nvbm5lY3QoKTtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF91cGRhdGVBZHZpY2UobmV3QWR2aWNlKSB7XG4gICAgICAgIGlmIChuZXdBZHZpY2UpIHtcbiAgICAgICAgICAgIF9hZHZpY2UgPSBfY29tZXRkLl9taXhpbihmYWxzZSwge30sIF9jb25maWcuYWR2aWNlLCBuZXdBZHZpY2UpO1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ05ldyBhZHZpY2UnLCBfYWR2aWNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kaXNjb25uZWN0KGFib3J0KSB7XG4gICAgICAgIF9jYW5jZWxEZWxheWVkU2VuZCgpO1xuICAgICAgICBpZiAoYWJvcnQgJiYgX3RyYW5zcG9ydCkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydC5hYm9ydCgpO1xuICAgICAgICB9XG4gICAgICAgIF9jbGllbnRJZCA9IG51bGw7XG4gICAgICAgIF9zZXRTdGF0dXMoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICBfYmF0Y2ggPSAwO1xuICAgICAgICBfcmVzZXRCYWNrb2ZmKCk7XG4gICAgICAgIF90cmFuc3BvcnQgPSBudWxsO1xuXG4gICAgICAgIC8vIEZhaWwgYW55IGV4aXN0aW5nIHF1ZXVlZCBtZXNzYWdlXG4gICAgICAgIGlmIChfbWVzc2FnZVF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlcyA9IF9tZXNzYWdlUXVldWU7XG4gICAgICAgICAgICBfbWVzc2FnZVF1ZXVlID0gW107XG4gICAgICAgICAgICBfaGFuZGxlRmFpbHVyZS5jYWxsKF9jb21ldGQsIHVuZGVmaW5lZCwgbWVzc2FnZXMsIHtcbiAgICAgICAgICAgICAgICByZWFzb246ICdEaXNjb25uZWN0ZWQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9ub3RpZnlUcmFuc3BvcnRFeGNlcHRpb24ob2xkVHJhbnNwb3J0LCBuZXdUcmFuc3BvcnQsIGZhaWx1cmUpIHtcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBfY29tZXRkLm9uVHJhbnNwb3J0RXhjZXB0aW9uO1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdJbnZva2luZyB0cmFuc3BvcnQgZXhjZXB0aW9uIGhhbmRsZXInLCBvbGRUcmFuc3BvcnQsIG5ld1RyYW5zcG9ydCwgZmFpbHVyZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChfY29tZXRkLCBmYWlsdXJlLCBvbGRUcmFuc3BvcnQsIG5ld1RyYW5zcG9ydCk7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgdHJhbnNwb3J0IGV4Y2VwdGlvbiBoYW5kbGVyJywgeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyB0aGUgaW5pdGlhbCBoYW5kc2hha2UgbWVzc2FnZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9oYW5kc2hha2UoaGFuZHNoYWtlUHJvcHMsIGhhbmRzaGFrZUNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kc2hha2VQcm9wcykpIHtcbiAgICAgICAgICAgIGhhbmRzaGFrZUNhbGxiYWNrID0gaGFuZHNoYWtlUHJvcHM7XG4gICAgICAgICAgICBoYW5kc2hha2VQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIF9jbGllbnRJZCA9IG51bGw7XG5cbiAgICAgICAgX2NsZWFyU3Vic2NyaXB0aW9ucygpO1xuXG4gICAgICAgIC8vIFJlc2V0IHRoZSB0cmFuc3BvcnRzIGlmIHdlJ3JlIG5vdCByZXRyeWluZyB0aGUgaGFuZHNoYWtlXG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydHMucmVzZXQodHJ1ZSk7XG4gICAgICAgICAgICBfdXBkYXRlQWR2aWNlKF9jb25maWcuYWR2aWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9iYXRjaCA9IDA7XG5cbiAgICAgICAgLy8gTWFyayB0aGUgc3RhcnQgb2YgYW4gaW50ZXJuYWwgYmF0Y2guXG4gICAgICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgaGFuZHNoYWtlIGFuZCBjb25uZWN0IGFyZSBhc3luYy5cbiAgICAgICAgLy8gSXQgbWF5IGhhcHBlbiB0aGF0IHRoZSBhcHBsaWNhdGlvbiBjYWxscyBpbml0KCkgdGhlbiBzdWJzY3JpYmUoKVxuICAgICAgICAvLyBhbmQgdGhlIHN1YnNjcmliZSBtZXNzYWdlIGlzIHNlbnQgYmVmb3JlIHRoZSBjb25uZWN0IG1lc3NhZ2UsIGlmXG4gICAgICAgIC8vIHRoZSBzdWJzY3JpYmUgbWVzc2FnZSBpcyBub3QgaGVsZCB1bnRpbCB0aGUgY29ubmVjdCBtZXNzYWdlIGlzIHNlbnQuXG4gICAgICAgIC8vIFNvIGhlcmUgd2Ugc3RhcnQgYSBiYXRjaCB0byBob2xkIHRlbXBvcmFyaWx5IGFueSBtZXNzYWdlIHVudGlsXG4gICAgICAgIC8vIHRoZSBjb25uZWN0aW9uIGlzIGZ1bGx5IGVzdGFibGlzaGVkLlxuICAgICAgICBfaW50ZXJuYWxCYXRjaCA9IHRydWU7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgcHJvcGVydGllcyBwcm92aWRlZCBieSB0aGUgdXNlciwgc28gdGhhdFxuICAgICAgICAvLyB3ZSBjYW4gcmV1c2UgdGhlbSBkdXJpbmcgYXV0b21hdGljIHJlLWhhbmRzaGFrZVxuICAgICAgICBfaGFuZHNoYWtlUHJvcHMgPSBoYW5kc2hha2VQcm9wcztcbiAgICAgICAgX2hhbmRzaGFrZUNhbGxiYWNrID0gaGFuZHNoYWtlQ2FsbGJhY2s7XG5cbiAgICAgICAgdmFyIHZlcnNpb24gPSAnMS4wJztcblxuICAgICAgICAvLyBGaWd1cmUgb3V0IHRoZSB0cmFuc3BvcnRzIHRvIHNlbmQgdG8gdGhlIHNlcnZlclxuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKTtcbiAgICAgICAgdmFyIHRyYW5zcG9ydFR5cGVzID0gX3RyYW5zcG9ydHMuZmluZFRyYW5zcG9ydFR5cGVzKHZlcnNpb24sIF9jcm9zc0RvbWFpbiwgdXJsKTtcblxuICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICAgICAgICAgIG1pbmltdW1WZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL2hhbmRzaGFrZScsXG4gICAgICAgICAgICBzdXBwb3J0ZWRDb25uZWN0aW9uVHlwZXM6IHRyYW5zcG9ydFR5cGVzLFxuICAgICAgICAgICAgYWR2aWNlOiB7XG4gICAgICAgICAgICAgICAgdGltZW91dDogX2FkdmljZS50aW1lb3V0LFxuICAgICAgICAgICAgICAgIGludGVydmFsOiBfYWR2aWNlLmludGVydmFsXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIERvIG5vdCBhbGxvdyB0aGUgdXNlciB0byBvdmVycmlkZSBpbXBvcnRhbnQgZmllbGRzLlxuICAgICAgICB2YXIgbWVzc2FnZSA9IF9jb21ldGQuX21peGluKGZhbHNlLCB7fSwgX2hhbmRzaGFrZVByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgX2NvbWV0ZC5fcHV0Q2FsbGJhY2sobWVzc2FnZS5pZCwgaGFuZHNoYWtlQ2FsbGJhY2spO1xuXG4gICAgICAgIC8vIFBpY2sgdXAgdGhlIGZpcnN0IGF2YWlsYWJsZSB0cmFuc3BvcnQgYXMgaW5pdGlhbCB0cmFuc3BvcnRcbiAgICAgICAgLy8gc2luY2Ugd2UgZG9uJ3Qga25vdyBpZiB0aGUgc2VydmVyIHN1cHBvcnRzIGl0XG4gICAgICAgIGlmICghX3RyYW5zcG9ydCkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydCA9IF90cmFuc3BvcnRzLm5lZ290aWF0ZVRyYW5zcG9ydCh0cmFuc3BvcnRUeXBlcywgdmVyc2lvbiwgX2Nyb3NzRG9tYWluLCB1cmwpO1xuICAgICAgICAgICAgaWYgKCFfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSAnQ291bGQgbm90IGZpbmQgaW5pdGlhbCB0cmFuc3BvcnQgYW1vbmc6ICcgKyBfdHJhbnNwb3J0cy5nZXRUcmFuc3BvcnRUeXBlcygpO1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX3dhcm4oZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgZmFpbHVyZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdJbml0aWFsIHRyYW5zcG9ydCBpcycsIF90cmFuc3BvcnQuZ2V0VHlwZSgpKTtcblxuICAgICAgICAvLyBXZSBzdGFydGVkIGEgYmF0Y2ggdG8gaG9sZCB0aGUgYXBwbGljYXRpb24gbWVzc2FnZXMsXG4gICAgICAgIC8vIHNvIGhlcmUgd2UgbXVzdCBieXBhc3MgaXQgYW5kIHNlbmQgaW1tZWRpYXRlbHkuXG4gICAgICAgIF9zZXRTdGF0dXMoJ2hhbmRzaGFraW5nJyk7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdIYW5kc2hha2Ugc2VudCcsIG1lc3NhZ2UpO1xuICAgICAgICBfc2VuZChmYWxzZSwgW21lc3NhZ2VdLCBmYWxzZSwgJ2hhbmRzaGFrZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kZWxheWVkSGFuZHNoYWtlKGRlbGF5KSB7XG4gICAgICAgIF9zZXRTdGF0dXMoJ2hhbmRzaGFraW5nJyk7XG5cbiAgICAgICAgLy8gV2Ugd2lsbCBjYWxsIF9oYW5kc2hha2UoKSB3aGljaCB3aWxsIHJlc2V0IF9jbGllbnRJZCwgYnV0IHdlIHdhbnQgdG8gYXZvaWRcbiAgICAgICAgLy8gdGhhdCBiZXR3ZWVuIHRoZSBlbmQgb2YgdGhpcyBtZXRob2QgYW5kIHRoZSBjYWxsIHRvIF9oYW5kc2hha2UoKSBzb21lb25lIG1heVxuICAgICAgICAvLyBjYWxsIHB1Ymxpc2goKSAob3Igb3RoZXIgbWV0aG9kcyB0aGF0IGNhbGwgX3F1ZXVlU2VuZCgpKS5cbiAgICAgICAgX2ludGVybmFsQmF0Y2ggPSB0cnVlO1xuXG4gICAgICAgIF9kZWxheWVkU2VuZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF9oYW5kc2hha2UoX2hhbmRzaGFrZVByb3BzLCBfaGFuZHNoYWtlQ2FsbGJhY2spO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdGlmeUNhbGxiYWNrKGNhbGxiYWNrLCBtZXNzYWdlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYWxsYmFjay5jYWxsKF9jb21ldGQsIG1lc3NhZ2UpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25DYWxsYmFja0V4Y2VwdGlvbjtcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdJbnZva2luZyBjYWxsYmFjayBleGNlcHRpb24gaGFuZGxlcicsIHgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChfY29tZXRkLCB4LCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICh4eCkge1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBjYWxsYmFjayBleGNlcHRpb24gaGFuZGxlcicsIHh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIG1lc3NhZ2UgY2FsbGJhY2snLCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2dldENhbGxiYWNrID0gZnVuY3Rpb24obWVzc2FnZUlkKSB7XG4gICAgICAgIHJldHVybiBfY2FsbGJhY2tzW21lc3NhZ2VJZF07XG4gICAgfTtcblxuICAgIHRoaXMuX3B1dENhbGxiYWNrID0gZnVuY3Rpb24obWVzc2FnZUlkLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fZ2V0Q2FsbGJhY2sobWVzc2FnZUlkKTtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgX2NhbGxiYWNrc1ttZXNzYWdlSWRdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gX2NvbWV0ZC5fZ2V0Q2FsbGJhY2soW21lc3NhZ2UuaWRdKTtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgZGVsZXRlIF9jYWxsYmFja3NbbWVzc2FnZS5pZF07XG4gICAgICAgICAgICBfbm90aWZ5Q2FsbGJhY2soY2FsbGJhY2ssIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2hhbmRsZVJlbW90ZUNhbGwobWVzc2FnZSkge1xuICAgICAgICB2YXIgY29udGV4dCA9IF9yZW1vdGVDYWxsc1ttZXNzYWdlLmlkXTtcbiAgICAgICAgZGVsZXRlIF9yZW1vdGVDYWxsc1ttZXNzYWdlLmlkXTtcbiAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdIYW5kbGluZyByZW1vdGUgY2FsbCByZXNwb25zZSBmb3InLCBtZXNzYWdlLCAnd2l0aCBjb250ZXh0JywgY29udGV4dCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSB0aW1lb3V0LCBpZiBwcmVzZW50LlxuICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSBjb250ZXh0LnRpbWVvdXQ7XG4gICAgICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgICAgIFV0aWxzLmNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gY29udGV4dC5jYWxsYmFjaztcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBfbm90aWZ5Q2FsbGJhY2soY2FsbGJhY2ssIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLm9uVHJhbnNwb3J0RmFpbHVyZSA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGZhaWx1cmVJbmZvLCBmYWlsdXJlSGFuZGxlcikge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0IGZhaWx1cmUnLCBmYWlsdXJlSW5mbywgJ2ZvcicsIG1lc3NhZ2UpO1xuXG4gICAgICAgIHZhciB0cmFuc3BvcnRzID0gdGhpcy5nZXRUcmFuc3BvcnRSZWdpc3RyeSgpO1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5nZXRVUkwoKTtcbiAgICAgICAgdmFyIGNyb3NzRG9tYWluID0gdGhpcy5faXNDcm9zc0RvbWFpbihfc3BsaXRVUkwodXJsKVsyXSk7XG4gICAgICAgIHZhciB2ZXJzaW9uID0gJzEuMCc7XG4gICAgICAgIHZhciB0cmFuc3BvcnRUeXBlcyA9IHRyYW5zcG9ydHMuZmluZFRyYW5zcG9ydFR5cGVzKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpO1xuXG4gICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gPT09ICdub25lJykge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCA9PT0gJy9tZXRhL2hhbmRzaGFrZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZhaWx1cmVJbmZvLnRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9ICdDb3VsZCBub3QgbmVnb3RpYXRlIHRyYW5zcG9ydCwgY2xpZW50PVsnICsgdHJhbnNwb3J0VHlwZXMgKyAnXSwgc2VydmVyPVsnICsgbWVzc2FnZS5zdXBwb3J0ZWRDb25uZWN0aW9uVHlwZXMgKyAnXSc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dhcm4oZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIF9ub3RpZnlUcmFuc3BvcnRFeGNlcHRpb24oX3RyYW5zcG9ydC5nZXRUeXBlKCksIG51bGwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogZmFpbHVyZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25UeXBlOiBfdHJhbnNwb3J0LmdldFR5cGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogX3RyYW5zcG9ydFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmYWlsdXJlSW5mby5kZWxheSA9IHRoaXMuZ2V0QmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgLy8gRGlmZmVyZW50IGxvZ2ljIGRlcGVuZGluZyBvbiB3aGV0aGVyIHdlIGFyZSBoYW5kc2hha2luZyBvciBjb25uZWN0aW5nLlxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCA9PT0gJy9tZXRhL2hhbmRzaGFrZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZhaWx1cmVJbmZvLnRyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgdHJhbnNwb3J0IGlzIGludmFsaWQsIHRyeSB0byBuZWdvdGlhdGUgYWdhaW4uXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdUcmFuc3BvcnQgPSB0cmFuc3BvcnRzLm5lZ290aWF0ZVRyYW5zcG9ydCh0cmFuc3BvcnRUeXBlcywgdmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghbmV3VHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93YXJuKCdDb3VsZCBub3QgbmVnb3RpYXRlIHRyYW5zcG9ydCwgY2xpZW50PVsnICsgdHJhbnNwb3J0VHlwZXMgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihfdHJhbnNwb3J0LmdldFR5cGUoKSwgbnVsbCwgbWVzc2FnZS5mYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmFjdGlvbiA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHJhbnNwb3J0LmdldFR5cGUoKSwgJy0+JywgbmV3VHJhbnNwb3J0LmdldFR5cGUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfbm90aWZ5VHJhbnNwb3J0RXhjZXB0aW9uKF90cmFuc3BvcnQuZ2V0VHlwZSgpLCBuZXdUcmFuc3BvcnQuZ2V0VHlwZSgpLCBtZXNzYWdlLmZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ2hhbmRzaGFrZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby50cmFuc3BvcnQgPSBuZXdUcmFuc3BvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmFpbHVyZUluZm8uYWN0aW9uICE9PSAnbm9uZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyZWFzZUJhY2tvZmZQZXJpb2QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICAgICAgICAgIGlmIChfdW5jb25uZWN0VGltZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBfdW5jb25uZWN0VGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmFpbHVyZUluZm8uYWN0aW9uID09PSAncmV0cnknKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmRlbGF5ID0gdGhpcy5pbmNyZWFzZUJhY2tvZmZQZXJpb2QoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB3ZSBtYXkgc3dpdGNoIHRvIGhhbmRzaGFraW5nLlxuICAgICAgICAgICAgICAgICAgICB2YXIgbWF4SW50ZXJ2YWwgPSBfYWR2aWNlLm1heEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF4SW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXhwaXJhdGlvbiA9IF9hZHZpY2UudGltZW91dCArIF9hZHZpY2UuaW50ZXJ2YWwgKyBtYXhJbnRlcnZhbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bmNvbm5lY3RlZCA9IG5vdyAtIF91bmNvbm5lY3RUaW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHVuY29ubmVjdGVkICsgX2JhY2tvZmYgPiBleHBpcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ2hhbmRzaGFrZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZmFpbHVyZUluZm8uYWN0aW9uID09PSAnaGFuZHNoYWtlJykge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5kZWxheSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydHMucmVzZXQoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0QmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZhaWx1cmVIYW5kbGVyLmNhbGwoX2NvbWV0ZCwgZmFpbHVyZUluZm8pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaGFuZGxlVHJhbnNwb3J0RmFpbHVyZShmYWlsdXJlSW5mbykge1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVHJhbnNwb3J0IGZhaWx1cmUgaGFuZGxpbmcnLCBmYWlsdXJlSW5mbyk7XG5cbiAgICAgICAgaWYgKGZhaWx1cmVJbmZvLnRyYW5zcG9ydCkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydCA9IGZhaWx1cmVJbmZvLnRyYW5zcG9ydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmYWlsdXJlSW5mby51cmwpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnQuc2V0VVJMKGZhaWx1cmVJbmZvLnVybCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYWN0aW9uID0gZmFpbHVyZUluZm8uYWN0aW9uO1xuICAgICAgICB2YXIgZGVsYXkgPSBmYWlsdXJlSW5mby5kZWxheSB8fCAwO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnaGFuZHNoYWtlJzpcbiAgICAgICAgICAgICAgICBfZGVsYXllZEhhbmRzaGFrZShkZWxheSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXRyeSc6XG4gICAgICAgICAgICAgICAgX2RlbGF5ZWRDb25uZWN0KGRlbGF5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0KHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyAnVW5rbm93biBhY3Rpb24gJyArIGFjdGlvbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsSGFuZHNoYWtlKG1lc3NhZ2UsIGZhaWx1cmVJbmZvKSB7XG4gICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvaGFuZHNoYWtlJywgbWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFRoZSBsaXN0ZW5lcnMgbWF5IGhhdmUgZGlzY29ubmVjdGVkLlxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIGZhaWx1cmVJbmZvLmFjdGlvbiA9ICdub25lJztcbiAgICAgICAgfVxuXG4gICAgICAgIF9jb21ldGQub25UcmFuc3BvcnRGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgbWVzc2FnZSwgZmFpbHVyZUluZm8sIF9oYW5kbGVUcmFuc3BvcnRGYWlsdXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaGFuZHNoYWtlUmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKTtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgdmFyIGNyb3NzRG9tYWluID0gX2NvbWV0ZC5faXNDcm9zc0RvbWFpbihfc3BsaXRVUkwodXJsKVsyXSk7XG4gICAgICAgICAgICB2YXIgbmV3VHJhbnNwb3J0ID0gX3RyYW5zcG9ydHMubmVnb3RpYXRlVHJhbnNwb3J0KG1lc3NhZ2Uuc3VwcG9ydGVkQ29ubmVjdGlvblR5cGVzLCBtZXNzYWdlLnZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpO1xuICAgICAgICAgICAgaWYgKG5ld1RyYW5zcG9ydCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3VjY2Vzc2Z1bCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIF9mYWlsSGFuZHNoYWtlKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgY2F1c2U6ICduZWdvdGlhdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ25vbmUnLFxuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IG51bGxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF90cmFuc3BvcnQgIT09IG5ld1RyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHJhbnNwb3J0LmdldFR5cGUoKSwgJy0+JywgbmV3VHJhbnNwb3J0LmdldFR5cGUoKSk7XG4gICAgICAgICAgICAgICAgX3RyYW5zcG9ydCA9IG5ld1RyYW5zcG9ydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2NsaWVudElkID0gbWVzc2FnZS5jbGllbnRJZDtcblxuICAgICAgICAgICAgLy8gRW5kIHRoZSBpbnRlcm5hbCBiYXRjaCBhbmQgYWxsb3cgaGVsZCBtZXNzYWdlcyBmcm9tIHRoZSBhcHBsaWNhdGlvblxuICAgICAgICAgICAgLy8gdG8gZ28gdG8gdGhlIHNlcnZlciAoc2VlIF9oYW5kc2hha2UoKSB3aGVyZSB3ZSBzdGFydCB0aGUgaW50ZXJuYWwgYmF0Y2gpLlxuICAgICAgICAgICAgX2ludGVybmFsQmF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgIF9mbHVzaEJhdGNoKCk7XG5cbiAgICAgICAgICAgIC8vIEhlcmUgdGhlIG5ldyB0cmFuc3BvcnQgaXMgaW4gcGxhY2UsIGFzIHdlbGwgYXMgdGhlIGNsaWVudElkLCBzb1xuICAgICAgICAgICAgLy8gdGhlIGxpc3RlbmVycyBjYW4gcGVyZm9ybSBhIHB1Ymxpc2goKSBpZiB0aGV5IHdhbnQuXG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIGxpc3RlbmVycyBiZWZvcmUgdGhlIGNvbm5lY3QgYmVsb3cuXG4gICAgICAgICAgICBtZXNzYWdlLnJlZXN0YWJsaXNoID0gX3JlZXN0YWJsaXNoO1xuICAgICAgICAgICAgX3JlZXN0YWJsaXNoID0gdHJ1ZTtcblxuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvaGFuZHNoYWtlJywgbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIF9oYW5kc2hha2VNZXNzYWdlcyA9IG1lc3NhZ2VbJ3gtbWVzc2FnZXMnXSB8fCAwO1xuXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gX2lzRGlzY29ubmVjdGVkKCkgPyAnbm9uZScgOiBfYWR2aWNlLnJlY29ubmVjdCB8fCAncmV0cnknO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdyZXRyeSc6XG4gICAgICAgICAgICAgICAgICAgIF9yZXNldEJhY2tvZmYoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9oYW5kc2hha2VNZXNzYWdlcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2RlbGF5ZWRDb25uZWN0KDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1Byb2Nlc3NpbmcnLCBfaGFuZHNoYWtlTWVzc2FnZXMsICdoYW5kc2hha2UtZGVsaXZlcmVkIG1lc3NhZ2VzJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0KHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVW5yZWNvZ25pemVkIGFkdmljZSBhY3Rpb24gJyArIGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsSGFuZHNoYWtlKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICBjYXVzZTogJ3Vuc3VjY2Vzc2Z1bCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBfYWR2aWNlLnJlY29ubmVjdCB8fCAnaGFuZHNoYWtlJyxcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IF90cmFuc3BvcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2hhbmRzaGFrZUZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfZmFpbEhhbmRzaGFrZShtZXNzYWdlLCB7XG4gICAgICAgICAgICBjYXVzZTogJ2ZhaWx1cmUnLFxuICAgICAgICAgICAgYWN0aW9uOiAnaGFuZHNoYWtlJyxcbiAgICAgICAgICAgIHRyYW5zcG9ydDogbnVsbFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbENvbm5lY3QobWVzc2FnZSwgZmFpbHVyZUluZm8pIHtcbiAgICAgICAgLy8gTm90aWZ5IHRoZSBsaXN0ZW5lcnMgYWZ0ZXIgdGhlIHN0YXR1cyBjaGFuZ2UgYnV0IGJlZm9yZSB0aGUgbmV4dCBhY3Rpb24uXG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Nvbm5lY3QnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG5cbiAgICAgICAgLy8gVGhlIGxpc3RlbmVycyBtYXkgaGF2ZSBkaXNjb25uZWN0ZWQuXG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NvbWV0ZC5vblRyYW5zcG9ydEZhaWx1cmUuY2FsbChfY29tZXRkLCBtZXNzYWdlLCBmYWlsdXJlSW5mbywgX2hhbmRsZVRyYW5zcG9ydEZhaWx1cmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jb25uZWN0UmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBfY29ubmVjdGVkID0gbWVzc2FnZS5zdWNjZXNzZnVsO1xuXG4gICAgICAgIGlmIChfY29ubmVjdGVkKSB7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9jb25uZWN0JywgbWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIE5vcm1hbGx5LCB0aGUgYWR2aWNlIHdpbGwgc2F5IFwicmVjb25uZWN0OiAncmV0cnknLCBpbnRlcnZhbDogMFwiXG4gICAgICAgICAgICAvLyBhbmQgdGhlIHNlcnZlciB3aWxsIGhvbGQgdGhlIHJlcXVlc3QsIHNvIHdoZW4gYSByZXNwb25zZSByZXR1cm5zXG4gICAgICAgICAgICAvLyB3ZSBpbW1lZGlhdGVseSBjYWxsIHRoZSBzZXJ2ZXIgYWdhaW4gKGxvbmcgcG9sbGluZykuXG4gICAgICAgICAgICAvLyBMaXN0ZW5lcnMgY2FuIGNhbGwgZGlzY29ubmVjdCgpLCBzbyBjaGVjayB0aGUgc3RhdGUgYWZ0ZXIgdGhleSBydW4uXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gX2lzRGlzY29ubmVjdGVkKCkgPyAnbm9uZScgOiBfYWR2aWNlLnJlY29ubmVjdCB8fCAncmV0cnknO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdyZXRyeSc6XG4gICAgICAgICAgICAgICAgICAgIF9yZXNldEJhY2tvZmYoKTtcbiAgICAgICAgICAgICAgICAgICAgX2RlbGF5ZWRDb25uZWN0KF9iYWNrb2ZmKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1VucmVjb2duaXplZCBhZHZpY2UgYWN0aW9uICcgKyBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbENvbm5lY3QobWVzc2FnZSwge1xuICAgICAgICAgICAgICAgIGNhdXNlOiAndW5zdWNjZXNzZnVsJyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IF9hZHZpY2UucmVjb25uZWN0IHx8ICdyZXRyeScsXG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0OiBfdHJhbnNwb3J0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jb25uZWN0RmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9jb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgICAgICBfZmFpbENvbm5lY3QobWVzc2FnZSwge1xuICAgICAgICAgICAgY2F1c2U6ICdmYWlsdXJlJyxcbiAgICAgICAgICAgIGFjdGlvbjogJ3JldHJ5JyxcbiAgICAgICAgICAgIHRyYW5zcG9ydDogbnVsbFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbERpc2Nvbm5lY3QobWVzc2FnZSkge1xuICAgICAgICBfZGlzY29ubmVjdCh0cnVlKTtcbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9kaXNjb25uZWN0JywgbWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kaXNjb25uZWN0UmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgL21ldGEvY29ubmVjdCB0byBhcnJpdmUuXG4gICAgICAgICAgICBfZGlzY29ubmVjdChmYWxzZSk7XG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9kaXNjb25uZWN0JywgbWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbERpc2Nvbm5lY3QobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGlzY29ubmVjdEZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfZmFpbERpc2Nvbm5lY3QobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxTdWJzY3JpYmUobWVzc2FnZSkge1xuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbbWVzc2FnZS5zdWJzY3JpcHRpb25dO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IHN1YnNjcmlwdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uICYmICFzdWJzY3JpcHRpb24ubGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHN1YnNjcmlwdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdSZW1vdmVkIGZhaWxlZCBzdWJzY3JpcHRpb24nLCBzdWJzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9zdWJzY3JpYmUnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N1YnNjcmliZVJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvc3Vic2NyaWJlJywgbWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbFN1YnNjcmliZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9zdWJzY3JpYmVGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2ZhaWxTdWJzY3JpYmUobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxVbnN1YnNjcmliZShtZXNzYWdlKSB7XG4gICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWJzY3JpYmUnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Vuc3Vic2NyaWJlUmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxVbnN1YnNjcmliZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF91bnN1YnNjcmliZUZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfZmFpbFVuc3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGlmICghX2hhbmRsZVJlbW90ZUNhbGwobWVzc2FnZSkpIHtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3B1Ymxpc2gnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21lc3NhZ2VSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLmRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKCFfaGFuZGxlUmVtb3RlQ2FsbChtZXNzYWdlKSkge1xuICAgICAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMobWVzc2FnZS5jaGFubmVsLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBpZiAoX2hhbmRzaGFrZU1lc3NhZ2VzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAtLV9oYW5kc2hha2VNZXNzYWdlcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9oYW5kc2hha2VNZXNzYWdlcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1Byb2Nlc3NlZCBsYXN0IGhhbmRzaGFrZS1kZWxpdmVyZWQgbWVzc2FnZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2RlbGF5ZWRDb25uZWN0KDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fd2FybignVW5rbm93biBCYXlldXggTWVzc2FnZScsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvcHVibGlzaCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9mYWlsTWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWVzc2FnZUZhaWx1cmUoZmFpbHVyZSkge1xuICAgICAgICBfZmFpbE1lc3NhZ2UoZmFpbHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlY2VpdmUobWVzc2FnZSkge1xuICAgICAgICBfdW5jb25uZWN0VGltZSA9IDA7XG5cbiAgICAgICAgbWVzc2FnZSA9IF9hcHBseUluY29taW5nRXh0ZW5zaW9ucyhtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBfdXBkYXRlQWR2aWNlKG1lc3NhZ2UuYWR2aWNlKTtcblxuICAgICAgICB2YXIgY2hhbm5lbCA9IG1lc3NhZ2UuY2hhbm5lbDtcbiAgICAgICAgc3dpdGNoIChjaGFubmVsKSB7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS9oYW5kc2hha2UnOlxuICAgICAgICAgICAgICAgIF9oYW5kc2hha2VSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgIF9jb25uZWN0UmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS9kaXNjb25uZWN0JzpcbiAgICAgICAgICAgICAgICBfZGlzY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvc3Vic2NyaWJlJzpcbiAgICAgICAgICAgICAgICBfc3Vic2NyaWJlUmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS91bnN1YnNjcmliZSc6XG4gICAgICAgICAgICAgICAgX3Vuc3Vic2NyaWJlUmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIF9tZXNzYWdlUmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWNlaXZlcyBhIG1lc3NhZ2UuXG4gICAgICogVGhpcyBtZXRob2QgaXMgZXhwb3NlZCBhcyBhIHB1YmxpYyBzbyB0aGF0IGV4dGVuc2lvbnMgbWF5IGluamVjdFxuICAgICAqIG1lc3NhZ2VzIHNpbXVsYXRpbmcgdGhhdCB0aGV5IGhhZCBiZWVuIHJlY2VpdmVkLlxuICAgICAqL1xuICAgIHRoaXMucmVjZWl2ZSA9IF9yZWNlaXZlO1xuXG4gICAgX2hhbmRsZU1lc3NhZ2VzID0gZnVuY3Rpb24ocmN2ZE1lc3NhZ2VzKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdSZWNlaXZlZCcsIHJjdmRNZXNzYWdlcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByY3ZkTWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gcmN2ZE1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgX3JlY2VpdmUobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2hhbmRsZUZhaWx1cmUgPSBmdW5jdGlvbihjb25kdWl0LCBtZXNzYWdlcywgZmFpbHVyZSkge1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnaGFuZGxlRmFpbHVyZScsIGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKTtcblxuICAgICAgICBmYWlsdXJlLnRyYW5zcG9ydCA9IGNvbmR1aXQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICB2YXIgZmFpbHVyZU1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IG1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogbWVzc2FnZS5jaGFubmVsLFxuICAgICAgICAgICAgICAgIGZhaWx1cmU6IGZhaWx1cmVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgc3dpdGNoIChtZXNzYWdlLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS9oYW5kc2hha2UnOlxuICAgICAgICAgICAgICAgICAgICBfaGFuZHNoYWtlRmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgICAgICBfY29ubmVjdEZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS9kaXNjb25uZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3RGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvc3Vic2NyaWJlJzpcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZU1lc3NhZ2Uuc3Vic2NyaXB0aW9uID0gbWVzc2FnZS5zdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIF9zdWJzY3JpYmVGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvdW5zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlTWVzc2FnZS5zdWJzY3JpcHRpb24gPSBtZXNzYWdlLnN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgX3Vuc3Vic2NyaWJlRmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIF9tZXNzYWdlRmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9oYXNTdWJzY3JpcHRpb25zKGNoYW5uZWwpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW2NoYW5uZWxdO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpcHRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVzb2x2ZVNjb3BlZENhbGxiYWNrKHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSB7XG4gICAgICAgICAgICBzY29wZTogc2NvcGUsXG4gICAgICAgICAgICBtZXRob2Q6IGNhbGxiYWNrXG4gICAgICAgIH07XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihzY29wZSkpIHtcbiAgICAgICAgICAgIGRlbGVnYXRlLnNjb3BlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgZGVsZWdhdGUubWV0aG9kID0gc2NvcGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoX2lzU3RyaW5nKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIGlmICghc2NvcGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgc2NvcGUgJyArIHNjb3BlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZS5tZXRob2QgPSBzY29wZVtjYWxsYmFja107XG4gICAgICAgICAgICAgICAgaWYgKCFfaXNGdW5jdGlvbihkZWxlZ2F0ZS5tZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGNhbGxiYWNrICcgKyBjYWxsYmFjayArICcgZm9yIHNjb3BlICcgKyBzY29wZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBjYWxsYmFjayAnICsgY2FsbGJhY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlbGVnYXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIGlzTGlzdGVuZXIpIHtcbiAgICAgICAgLy8gVGhlIGRhdGEgc3RydWN0dXJlIGlzIGEgbWFwPGNoYW5uZWwsIHN1YnNjcmlwdGlvbltdPiwgd2hlcmUgZWFjaCBzdWJzY3JpcHRpb25cbiAgICAgICAgLy8gaG9sZHMgdGhlIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCBhbmQgaXRzIHNjb3BlLlxuXG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IF9yZXNvbHZlU2NvcGVkQ2FsbGJhY2soc2NvcGUsIGNhbGxiYWNrKTtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0FkZGluZycsIGlzTGlzdGVuZXIgPyAnbGlzdGVuZXInIDogJ3N1YnNjcmlwdGlvbicsICdvbicsIGNoYW5uZWwsICd3aXRoIHNjb3BlJywgZGVsZWdhdGUuc2NvcGUsICdhbmQgY2FsbGJhY2snLCBkZWxlZ2F0ZS5tZXRob2QpO1xuXG4gICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSB7XG4gICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgc2NvcGU6IGRlbGVnYXRlLnNjb3BlLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGRlbGVnYXRlLm1ldGhvZCxcbiAgICAgICAgICAgIGxpc3RlbmVyOiBpc0xpc3RlbmVyXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW2NoYW5uZWxdO1xuICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgIHN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIF9saXN0ZW5lcnNbY2hhbm5lbF0gPSBzdWJzY3JpcHRpb25zO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaGluZyBvbnRvIGFuIGFycmF5IGFwcGVuZHMgYXQgdGhlIGVuZCBhbmQgcmV0dXJucyB0aGUgaWQgYXNzb2NpYXRlZCB3aXRoIHRoZSBlbGVtZW50IGluY3JlYXNlZCBieSAxLlxuICAgICAgICAvLyBOb3RlIHRoYXQgaWY6XG4gICAgICAgIC8vIGEucHVzaCgnYScpOyB2YXIgaGI9YS5wdXNoKCdiJyk7IGRlbGV0ZSBhW2hiLTFdOyB2YXIgaGM9YS5wdXNoKCdjJyk7XG4gICAgICAgIC8vIHRoZW46XG4gICAgICAgIC8vIGhjPT0zLCBhLmpvaW4oKT09J2EnLCwnYycsIGEubGVuZ3RoPT0zXG4gICAgICAgIHN1YnNjcmlwdGlvbi5pZCA9IHN1YnNjcmlwdGlvbnMucHVzaChzdWJzY3JpcHRpb24pIC0gMTtcblxuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQWRkZWQnLCBpc0xpc3RlbmVyID8gJ2xpc3RlbmVyJyA6ICdzdWJzY3JpcHRpb24nLCBzdWJzY3JpcHRpb24pO1xuXG4gICAgICAgIC8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5OiB3ZSB1c2VkIHRvIHJldHVybiBbY2hhbm5lbCwgc3Vic2NyaXB0aW9uLmlkXVxuICAgICAgICBzdWJzY3JpcHRpb25bMF0gPSBjaGFubmVsO1xuICAgICAgICBzdWJzY3JpcHRpb25bMV0gPSBzdWJzY3JpcHRpb24uaWQ7XG5cbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFBVQkxJQyBBUElcbiAgICAvL1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIHRoZSBnaXZlbiB0cmFuc3BvcnQgdW5kZXIgdGhlIGdpdmVuIHRyYW5zcG9ydCB0eXBlLlxuICAgICAqIFRoZSBvcHRpb25hbCBpbmRleCBwYXJhbWV0ZXIgc3BlY2lmaWVzIHRoZSBcInByaW9yaXR5XCIgYXQgd2hpY2ggdGhlXG4gICAgICogdHJhbnNwb3J0IGlzIHJlZ2lzdGVyZWQgKHdoZXJlIDAgaXMgdGhlIG1heCBwcmlvcml0eSkuXG4gICAgICogSWYgYSB0cmFuc3BvcnQgd2l0aCB0aGUgc2FtZSB0eXBlIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCwgdGhpcyBmdW5jdGlvblxuICAgICAqIGRvZXMgbm90aGluZyBhbmQgcmV0dXJucyBmYWxzZS5cbiAgICAgKiBAcGFyYW0gdHlwZSB0aGUgdHJhbnNwb3J0IHR5cGVcbiAgICAgKiBAcGFyYW0gdHJhbnNwb3J0IHRoZSB0cmFuc3BvcnQgb2JqZWN0XG4gICAgICogQHBhcmFtIGluZGV4IHRoZSBpbmRleCBhdCB3aGljaCB0aGlzIHRyYW5zcG9ydCBpcyB0byBiZSByZWdpc3RlcmVkXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoZSB0cmFuc3BvcnQgaGFzIGJlZW4gcmVnaXN0ZXJlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICogQHNlZSAjdW5yZWdpc3RlclRyYW5zcG9ydCh0eXBlKVxuICAgICAqL1xuICAgIHRoaXMucmVnaXN0ZXJUcmFuc3BvcnQgPSBmdW5jdGlvbih0eXBlLCB0cmFuc3BvcnQsIGluZGV4KSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBfdHJhbnNwb3J0cy5hZGQodHlwZSwgdHJhbnNwb3J0LCBpbmRleCk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdSZWdpc3RlcmVkIHRyYW5zcG9ydCcsIHR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24odHJhbnNwb3J0LnJlZ2lzdGVyZWQpKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0LnJlZ2lzdGVyZWQodHlwZSwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVW5yZWdpc3RlcnMgdGhlIHRyYW5zcG9ydCB3aXRoIHRoZSBnaXZlbiB0cmFuc3BvcnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gdHlwZSB0aGUgdHJhbnNwb3J0IHR5cGUgdG8gdW5yZWdpc3RlclxuICAgICAqIEByZXR1cm4gdGhlIHRyYW5zcG9ydCB0aGF0IGhhcyBiZWVuIHVucmVnaXN0ZXJlZCxcbiAgICAgKiBvciBudWxsIGlmIG5vIHRyYW5zcG9ydCB3YXMgcHJldmlvdXNseSByZWdpc3RlcmVkIHVuZGVyIHRoZSBnaXZlbiB0cmFuc3BvcnQgdHlwZVxuICAgICAqL1xuICAgIHRoaXMudW5yZWdpc3RlclRyYW5zcG9ydCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF90cmFuc3BvcnRzLnJlbW92ZSh0eXBlKTtcbiAgICAgICAgaWYgKHRyYW5zcG9ydCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1VucmVnaXN0ZXJlZCB0cmFuc3BvcnQnLCB0eXBlKTtcblxuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHRyYW5zcG9ydC51bnJlZ2lzdGVyZWQpKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0LnVucmVnaXN0ZXJlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cmFuc3BvcnQ7XG4gICAgfTtcblxuICAgIHRoaXMudW5yZWdpc3RlclRyYW5zcG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RyYW5zcG9ydHMuY2xlYXIoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHJldHVybiBhbiBhcnJheSBvZiBhbGwgcmVnaXN0ZXJlZCB0cmFuc3BvcnQgdHlwZXNcbiAgICAgKi9cbiAgICB0aGlzLmdldFRyYW5zcG9ydFR5cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHJhbnNwb3J0cy5nZXRUcmFuc3BvcnRUeXBlcygpO1xuICAgIH07XG5cbiAgICB0aGlzLmZpbmRUcmFuc3BvcnQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBfdHJhbnNwb3J0cy5maW5kKG5hbWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0aGUgVHJhbnNwb3J0UmVnaXN0cnkgb2JqZWN0XG4gICAgICovXG4gICAgdGhpcy5nZXRUcmFuc3BvcnRSZWdpc3RyeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RyYW5zcG9ydHM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZXMgdGhlIGluaXRpYWwgQmF5ZXV4IGNvbW11bmljYXRpb24gd2l0aCB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKiBDb25maWd1cmF0aW9uIGlzIHBhc3NlZCB2aWEgYW4gb2JqZWN0IHRoYXQgbXVzdCBjb250YWluIGEgbWFuZGF0b3J5IGZpZWxkIDxjb2RlPnVybDwvY29kZT5cbiAgICAgKiBvZiB0eXBlIHN0cmluZyBjb250YWluaW5nIHRoZSBVUkwgb2YgdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICovXG4gICAgdGhpcy5jb25maWd1cmUgPSBmdW5jdGlvbihjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIF9jb25maWd1cmUuY2FsbCh0aGlzLCBjb25maWd1cmF0aW9uKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlcyBhbmQgZXN0YWJsaXNoZXMgdGhlIEJheWV1eCBjb21tdW5pY2F0aW9uIHdpdGggdGhlIEJheWV1eCBzZXJ2ZXJcbiAgICAgKiB2aWEgYSBoYW5kc2hha2UgYW5kIGEgc3Vic2VxdWVudCBjb25uZWN0LlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgICAqIEBwYXJhbSBoYW5kc2hha2VQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGhhbmRzaGFrZSBtZXNzYWdlXG4gICAgICogQHNlZSAjY29uZmlndXJlKGNvbmZpZ3VyYXRpb24pXG4gICAgICogQHNlZSAjaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzKVxuICAgICAqL1xuICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uKGNvbmZpZ3VyYXRpb24sIGhhbmRzaGFrZVByb3BzKSB7XG4gICAgICAgIHRoaXMuY29uZmlndXJlKGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICB0aGlzLmhhbmRzaGFrZShoYW5kc2hha2VQcm9wcyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVzdGFibGlzaGVzIHRoZSBCYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyXG4gICAgICogdmlhIGEgaGFuZHNoYWtlIGFuZCBhIHN1YnNlcXVlbnQgY29ubmVjdC5cbiAgICAgKiBAcGFyYW0gaGFuZHNoYWtlUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBoYW5kc2hha2UgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBoYW5kc2hha2VDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgaGFuZHNoYWtlIGlzIGFja25vd2xlZGdlZFxuICAgICAqL1xuICAgIHRoaXMuaGFuZHNoYWtlID0gZnVuY3Rpb24oaGFuZHNoYWtlUHJvcHMsIGhhbmRzaGFrZUNhbGxiYWNrKSB7XG4gICAgICAgIF9zZXRTdGF0dXMoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICBfcmVlc3RhYmxpc2ggPSBmYWxzZTtcbiAgICAgICAgX2hhbmRzaGFrZShoYW5kc2hha2VQcm9wcywgaGFuZHNoYWtlQ2FsbGJhY2spO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEaXNjb25uZWN0cyBmcm9tIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqIEl0IGlzIHBvc3NpYmxlIHRvIHN1Z2dlc3QgdG8gYXR0ZW1wdCBhIHN5bmNocm9ub3VzIGRpc2Nvbm5lY3QsIGJ1dCB0aGlzIGZlYXR1cmVcbiAgICAgKiBtYXkgb25seSBiZSBhdmFpbGFibGUgaW4gY2VydGFpbiB0cmFuc3BvcnRzIChmb3IgZXhhbXBsZSwgbG9uZy1wb2xsaW5nIG1heSBzdXBwb3J0XG4gICAgICogaXQsIGNhbGxiYWNrLXBvbGxpbmcgY2VydGFpbmx5IGRvZXMgbm90KS5cbiAgICAgKiBAcGFyYW0gc3luYyB3aGV0aGVyIGF0dGVtcHQgdG8gcGVyZm9ybSBhIHN5bmNocm9ub3VzIGRpc2Nvbm5lY3RcbiAgICAgKiBAcGFyYW0gZGlzY29ubmVjdFByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgZGlzY29ubmVjdCBtZXNzYWdlXG4gICAgICogQHBhcmFtIGRpc2Nvbm5lY3RDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgZGlzY29ubmVjdCBpcyBhY2tub3dsZWRnZWRcbiAgICAgKi9cbiAgICB0aGlzLmRpc2Nvbm5lY3QgPSBmdW5jdGlvbihzeW5jLCBkaXNjb25uZWN0UHJvcHMsIGRpc2Nvbm5lY3RDYWxsYmFjaykge1xuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Ygc3luYyAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBkaXNjb25uZWN0Q2FsbGJhY2sgPSBkaXNjb25uZWN0UHJvcHM7XG4gICAgICAgICAgICBkaXNjb25uZWN0UHJvcHMgPSBzeW5jO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihkaXNjb25uZWN0UHJvcHMpKSB7XG4gICAgICAgICAgICBkaXNjb25uZWN0Q2FsbGJhY2sgPSBkaXNjb25uZWN0UHJvcHM7XG4gICAgICAgICAgICBkaXNjb25uZWN0UHJvcHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL2Rpc2Nvbm5lY3QnXG4gICAgICAgIH07XG4gICAgICAgIC8vIERvIG5vdCBhbGxvdyB0aGUgdXNlciB0byBvdmVycmlkZSBpbXBvcnRhbnQgZmllbGRzLlxuICAgICAgICB2YXIgbWVzc2FnZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgZGlzY29ubmVjdFByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgX2NvbWV0ZC5fcHV0Q2FsbGJhY2sobWVzc2FnZS5pZCwgZGlzY29ubmVjdENhbGxiYWNrKTtcblxuICAgICAgICBfc2V0U3RhdHVzKCdkaXNjb25uZWN0aW5nJyk7XG4gICAgICAgIF9zZW5kKHN5bmMgPT09IHRydWUsIFttZXNzYWdlXSwgZmFsc2UsICdkaXNjb25uZWN0Jyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1hcmtzIHRoZSBzdGFydCBvZiBhIGJhdGNoIG9mIGFwcGxpY2F0aW9uIG1lc3NhZ2VzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgICAqIGluIGEgc2luZ2xlIHJlcXVlc3QsIG9idGFpbmluZyBhIHNpbmdsZSByZXNwb25zZSBjb250YWluaW5nIChwb3NzaWJseSkgbWFueVxuICAgICAqIGFwcGxpY2F0aW9uIHJlcGx5IG1lc3NhZ2VzLlxuICAgICAqIE1lc3NhZ2VzIGFyZSBoZWxkIGluIGEgcXVldWUgYW5kIG5vdCBzZW50IHVudGlsIHtAbGluayAjZW5kQmF0Y2goKX0gaXMgY2FsbGVkLlxuICAgICAqIElmIHN0YXJ0QmF0Y2goKSBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMsIHRoZW4gYW4gZXF1YWwgbnVtYmVyIG9mIGVuZEJhdGNoKClcbiAgICAgKiBjYWxscyBtdXN0IGJlIG1hZGUgdG8gY2xvc2UgYW5kIHNlbmQgdGhlIGJhdGNoIG9mIG1lc3NhZ2VzLlxuICAgICAqIEBzZWUgI2VuZEJhdGNoKClcbiAgICAgKi9cbiAgICB0aGlzLnN0YXJ0QmF0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3N0YXJ0QmF0Y2goKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIGVuZCBvZiBhIGJhdGNoIG9mIGFwcGxpY2F0aW9uIG1lc3NhZ2VzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgICAqIGluIGEgc2luZ2xlIHJlcXVlc3QuXG4gICAgICogQHNlZSAjc3RhcnRCYXRjaCgpXG4gICAgICovXG4gICAgdGhpcy5lbmRCYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfZW5kQmF0Y2goKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIGdpdmVuIGNhbGxiYWNrIGluIHRoZSBnaXZlbiBzY29wZSwgc3Vycm91bmRlZCBieSBhIHtAbGluayAjc3RhcnRCYXRjaCgpfVxuICAgICAqIGFuZCB7QGxpbmsgI2VuZEJhdGNoKCl9IGNhbGxzLlxuICAgICAqIEBwYXJhbSBzY29wZSB0aGUgc2NvcGUgb2YgdGhlIGNhbGxiYWNrLCBtYXkgYmUgb21pdHRlZFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2l0aGluIHtAbGluayAjc3RhcnRCYXRjaCgpfSBhbmQge0BsaW5rICNlbmRCYXRjaCgpfSBjYWxsc1xuICAgICAqL1xuICAgIHRoaXMuYmF0Y2ggPSBmdW5jdGlvbihzY29wZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gX3Jlc29sdmVTY29wZWRDYWxsYmFjayhzY29wZSwgY2FsbGJhY2spO1xuICAgICAgICB0aGlzLnN0YXJ0QmF0Y2goKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlbGVnYXRlLm1ldGhvZC5jYWxsKGRlbGVnYXRlLnNjb3BlKTtcbiAgICAgICAgICAgIHRoaXMuZW5kQmF0Y2goKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgdGhpcy5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgYmF0Y2gnLCB4KTtcbiAgICAgICAgICAgIHRoaXMuZW5kQmF0Y2goKTtcbiAgICAgICAgICAgIHRocm93IHg7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGxpc3RlbmVyIGZvciBiYXlldXggbWVzc2FnZXMsIHBlcmZvcm1pbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGluIHRoZSBnaXZlbiBzY29wZVxuICAgICAqIHdoZW4gYSBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gY2hhbm5lbCBhcnJpdmVzLlxuICAgICAqIEBwYXJhbSBjaGFubmVsIHRoZSBjaGFubmVsIHRoZSBsaXN0ZW5lciBpcyBpbnRlcmVzdGVkIHRvXG4gICAgICogQHBhcmFtIHNjb3BlIHRoZSBzY29wZSBvZiB0aGUgY2FsbGJhY2ssIG1heSBiZSBvbWl0dGVkXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW4gYSBtZXNzYWdlIGlzIHNlbnQgdG8gdGhlIGNoYW5uZWxcbiAgICAgKiBAcmV0dXJucyB0aGUgc3Vic2NyaXB0aW9uIGhhbmRsZSB0byBiZSBwYXNzZWQgdG8ge0BsaW5rICNyZW1vdmVMaXN0ZW5lcihvYmplY3QpfVxuICAgICAqIEBzZWUgI3JlbW92ZUxpc3RlbmVyKHN1YnNjcmlwdGlvbilcbiAgICAgKi9cbiAgICB0aGlzLmFkZExpc3RlbmVyID0gZnVuY3Rpb24oY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMiwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzU3RyaW5nKGNoYW5uZWwpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiBjaGFubmVsIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIHRydWUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBzdWJzY3JpcHRpb24gb2J0YWluZWQgd2l0aCBhIGNhbGwgdG8ge0BsaW5rICNhZGRMaXN0ZW5lcihzdHJpbmcsIG9iamVjdCwgZnVuY3Rpb24pfS5cbiAgICAgKiBAcGFyYW0gc3Vic2NyaXB0aW9uIHRoZSBzdWJzY3JpcHRpb24gdG8gdW5zdWJzY3JpYmUuXG4gICAgICogQHNlZSAjYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKVxuICAgICAqL1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gQmV3YXJlIG9mIHN1YnNjcmlwdGlvbi5pZCA9PSAwLCB3aGljaCBpcyBmYWxzeSA9PiBjYW5ub3QgdXNlICFzdWJzY3JpcHRpb24uaWRcbiAgICAgICAgaWYgKCFzdWJzY3JpcHRpb24gfHwgIXN1YnNjcmlwdGlvbi5jaGFubmVsIHx8ICEoXCJpZFwiIGluIHN1YnNjcmlwdGlvbikpIHtcbiAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGFyZ3VtZW50OiBleHBlY3RlZCBzdWJzY3JpcHRpb24sIG5vdCAnICsgc3Vic2NyaXB0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgX3JlbW92ZUxpc3RlbmVyKHN1YnNjcmlwdGlvbik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycyByZWdpc3RlcmVkIHdpdGgge0BsaW5rICNhZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spfSBvclxuICAgICAqIHtAbGluayAjc3Vic2NyaWJlKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjayl9LlxuICAgICAqL1xuICAgIHRoaXMuY2xlYXJMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2xpc3RlbmVycyA9IHt9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmVzIHRvIHRoZSBnaXZlbiBjaGFubmVsLCBwZXJmb3JtaW5nIHRoZSBnaXZlbiBjYWxsYmFjayBpbiB0aGUgZ2l2ZW4gc2NvcGVcbiAgICAgKiB3aGVuIGEgbWVzc2FnZSBmb3IgdGhlIGNoYW5uZWwgYXJyaXZlcy5cbiAgICAgKiBAcGFyYW0gY2hhbm5lbCB0aGUgY2hhbm5lbCB0byBzdWJzY3JpYmUgdG9cbiAgICAgKiBAcGFyYW0gc2NvcGUgdGhlIHNjb3BlIG9mIHRoZSBjYWxsYmFjaywgbWF5IGJlIG9taXR0ZWRcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgY2hhbm5lbFxuICAgICAqIEBwYXJhbSBzdWJzY3JpYmVQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIHN1YnNjcmliZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIHN1YnNjcmliZUNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgYWNrbm93bGVkZ2VkXG4gICAgICogQHJldHVybiB0aGUgc3Vic2NyaXB0aW9uIGhhbmRsZSB0byBiZSBwYXNzZWQgdG8ge0BsaW5rICN1bnN1YnNjcmliZShvYmplY3QpfVxuICAgICAqL1xuICAgIHRoaXMuc3Vic2NyaWJlID0gZnVuY3Rpb24oY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrLCBzdWJzY3JpYmVQcm9wcywgc3Vic2NyaWJlQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAyLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGNoYW5uZWwgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBzdGF0ZTogYWxyZWFkeSBkaXNjb25uZWN0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm9ybWFsaXplIGFyZ3VtZW50c1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oc2NvcGUpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVDYWxsYmFjayA9IHN1YnNjcmliZVByb3BzO1xuICAgICAgICAgICAgc3Vic2NyaWJlUHJvcHMgPSBjYWxsYmFjaztcbiAgICAgICAgICAgIGNhbGxiYWNrID0gc2NvcGU7XG4gICAgICAgICAgICBzY29wZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oc3Vic2NyaWJlUHJvcHMpKSB7XG4gICAgICAgICAgICBzdWJzY3JpYmVDYWxsYmFjayA9IHN1YnNjcmliZVByb3BzO1xuICAgICAgICAgICAgc3Vic2NyaWJlUHJvcHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPbmx5IHNlbmQgdGhlIG1lc3NhZ2UgdG8gdGhlIHNlcnZlciBpZiB0aGlzIGNsaWVudCBoYXMgbm90IHlldCBzdWJzY3JpYmVkIHRvIHRoZSBjaGFubmVsXG4gICAgICAgIHZhciBzZW5kID0gIV9oYXNTdWJzY3JpcHRpb25zKGNoYW5uZWwpO1xuXG4gICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBfYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHNlbmQpIHtcbiAgICAgICAgICAgIC8vIFNlbmQgdGhlIHN1YnNjcmlwdGlvbiBtZXNzYWdlIGFmdGVyIHRoZSBzdWJzY3JpcHRpb24gcmVnaXN0cmF0aW9uIHRvIGF2b2lkXG4gICAgICAgICAgICAvLyByYWNlcyB3aGVyZSB0aGUgc2VydmVyIHdvdWxkIHNlbmQgYSBtZXNzYWdlIHRvIHRoZSBzdWJzY3JpYmVycywgYnV0IGhlcmVcbiAgICAgICAgICAgIC8vIG9uIHRoZSBjbGllbnQgdGhlIHN1YnNjcmlwdGlvbiBoYXMgbm90IGJlZW4gYWRkZWQgeWV0IHRvIHRoZSBkYXRhIHN0cnVjdHVyZXNcbiAgICAgICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS9zdWJzY3JpYmUnLFxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbjogY2hhbm5lbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIERvIG5vdCBhbGxvdyB0aGUgdXNlciB0byBvdmVycmlkZSBpbXBvcnRhbnQgZmllbGRzLlxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIHN1YnNjcmliZVByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBzdWJzY3JpYmVDYWxsYmFjayk7XG5cbiAgICAgICAgICAgIF9xdWV1ZVNlbmQobWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbnN1YnNjcmliZXMgdGhlIHN1YnNjcmlwdGlvbiBvYnRhaW5lZCB3aXRoIGEgY2FsbCB0byB7QGxpbmsgI3N1YnNjcmliZShzdHJpbmcsIG9iamVjdCwgZnVuY3Rpb24pfS5cbiAgICAgKiBAcGFyYW0gc3Vic2NyaXB0aW9uIHRoZSBzdWJzY3JpcHRpb24gdG8gdW5zdWJzY3JpYmUuXG4gICAgICogQHBhcmFtIHVuc3Vic2NyaWJlUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSB1bnN1YnNjcmliZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIHVuc3Vic2NyaWJlQ2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHVuc3Vic2NyaXB0aW9uIGlzIGFja25vd2xlZGdlZFxuICAgICAqL1xuICAgIHRoaXMudW5zdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24sIHVuc3Vic2NyaWJlUHJvcHMsIHVuc3Vic2NyaWJlQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAxLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBzdGF0ZTogYWxyZWFkeSBkaXNjb25uZWN0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHVuc3Vic2NyaWJlUHJvcHMpKSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZUNhbGxiYWNrID0gdW5zdWJzY3JpYmVQcm9wcztcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlUHJvcHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGxvY2FsIGxpc3RlbmVyIGJlZm9yZSBzZW5kaW5nIHRoZSBtZXNzYWdlXG4gICAgICAgIC8vIFRoaXMgZW5zdXJlcyB0aGF0IGlmIHRoZSBzZXJ2ZXIgZmFpbHMsIHRoaXMgY2xpZW50IGRvZXMgbm90IGdldCBub3RpZmljYXRpb25zXG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKTtcblxuICAgICAgICB2YXIgY2hhbm5lbCA9IHN1YnNjcmlwdGlvbi5jaGFubmVsO1xuICAgICAgICAvLyBPbmx5IHNlbmQgdGhlIG1lc3NhZ2UgdG8gdGhlIHNlcnZlciBpZiB0aGlzIGNsaWVudCB1bnN1YnNjcmliZXMgdGhlIGxhc3Qgc3Vic2NyaXB0aW9uXG4gICAgICAgIGlmICghX2hhc1N1YnNjcmlwdGlvbnMoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS91bnN1YnNjcmliZScsXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uOiBjaGFubmVsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgdW5zdWJzY3JpYmVQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgX2NvbWV0ZC5fcHV0Q2FsbGJhY2sobWVzc2FnZS5pZCwgdW5zdWJzY3JpYmVDYWxsYmFjayk7XG5cbiAgICAgICAgICAgIF9xdWV1ZVNlbmQobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZXN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbiwgc3Vic2NyaWJlUHJvcHMpIHtcbiAgICAgICAgX3JlbW92ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmUoc3Vic2NyaXB0aW9uLmNoYW5uZWwsIHN1YnNjcmlwdGlvbi5zY29wZSwgc3Vic2NyaXB0aW9uLmNhbGxiYWNrLCBzdWJzY3JpYmVQcm9wcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgc3Vic2NyaXB0aW9ucyBhZGRlZCB2aWEge0BsaW5rICNzdWJzY3JpYmUoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrLCBzdWJzY3JpYmVQcm9wcyl9LFxuICAgICAqIGJ1dCBkb2VzIG5vdCByZW1vdmUgdGhlIGxpc3RlbmVycyBhZGRlZCB2aWEge0BsaW5rIGFkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjayl9LlxuICAgICAqL1xuICAgIHRoaXMuY2xlYXJTdWJzY3JpcHRpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9jbGVhclN1YnNjcmlwdGlvbnMoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIGEgbWVzc2FnZSBvbiB0aGUgZ2l2ZW4gY2hhbm5lbCwgY29udGFpbmluZyB0aGUgZ2l2ZW4gY29udGVudC5cbiAgICAgKiBAcGFyYW0gY2hhbm5lbCB0aGUgY2hhbm5lbCB0byBwdWJsaXNoIHRoZSBtZXNzYWdlIHRvXG4gICAgICogQHBhcmFtIGNvbnRlbnQgdGhlIGNvbnRlbnQgb2YgdGhlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gcHVibGlzaFByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgcHVibGlzaCBtZXNzYWdlXG4gICAgICogQHBhcmFtIHB1Ymxpc2hDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgcHVibGlzaCBpcyBhY2tub3dsZWRnZWQgYnkgdGhlIHNlcnZlclxuICAgICAqL1xuICAgIHRoaXMucHVibGlzaCA9IGZ1bmN0aW9uKGNoYW5uZWwsIGNvbnRlbnQsIHB1Ymxpc2hQcm9wcywgcHVibGlzaENhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMSwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzU3RyaW5nKGNoYW5uZWwpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiBjaGFubmVsIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICgvXlxcL21ldGFcXC8vLnRlc3QoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50OiBjYW5ub3QgcHVibGlzaCB0byBtZXRhIGNoYW5uZWxzJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY29udGVudCkpIHtcbiAgICAgICAgICAgIHB1Ymxpc2hDYWxsYmFjayA9IGNvbnRlbnQ7XG4gICAgICAgICAgICBjb250ZW50ID0gcHVibGlzaFByb3BzID0ge307XG4gICAgICAgIH0gZWxzZSBpZiAoX2lzRnVuY3Rpb24ocHVibGlzaFByb3BzKSkge1xuICAgICAgICAgICAgcHVibGlzaENhbGxiYWNrID0gcHVibGlzaFByb3BzO1xuICAgICAgICAgICAgcHVibGlzaFByb3BzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgY2hhbm5lbDogY2hhbm5lbCxcbiAgICAgICAgICAgIGRhdGE6IGNvbnRlbnRcbiAgICAgICAgfTtcbiAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBwdWJsaXNoUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBwdWJsaXNoQ2FsbGJhY2spO1xuXG4gICAgICAgIF9xdWV1ZVNlbmQobWVzc2FnZSk7XG4gICAgfTtcblxuICAgIHRoaXMucmVtb3RlQ2FsbCA9IGZ1bmN0aW9uKHRhcmdldCwgY29udGVudCwgdGltZW91dCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAxLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcodGFyZ2V0KSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogdGFyZ2V0IG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgc3RhdGU6IGFscmVhZHkgZGlzY29ubmVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjb250ZW50KSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBjb250ZW50O1xuICAgICAgICAgICAgY29udGVudCA9IHt9O1xuICAgICAgICAgICAgdGltZW91dCA9IF9jb25maWcubWF4TmV0d29ya0RlbGF5O1xuICAgICAgICB9IGVsc2UgaWYgKF9pc0Z1bmN0aW9uKHRpbWVvdXQpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHRpbWVvdXQ7XG4gICAgICAgICAgICB0aW1lb3V0ID0gX2NvbmZpZy5tYXhOZXR3b3JrRGVsYXk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHRpbWVvdXQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiB0aW1lb3V0IG11c3QgYmUgYSBudW1iZXInO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0YXJnZXQubWF0Y2goL15cXC8vKSkge1xuICAgICAgICAgICAgdGFyZ2V0ID0gJy8nICsgdGFyZ2V0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaGFubmVsID0gJy9zZXJ2aWNlJyArIHRhcmdldDtcblxuICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgY2hhbm5lbDogY2hhbm5lbCxcbiAgICAgICAgICAgIGRhdGE6IGNvbnRlbnRcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgY29udGV4dCA9IHtcbiAgICAgICAgICAgIGNhbGxiYWNrOiBjYWxsYmFja1xuICAgICAgICB9O1xuICAgICAgICBpZiAodGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRleHQudGltZW91dCA9IFV0aWxzLnNldFRpbWVvdXQoX2NvbWV0ZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RpbWluZyBvdXQgcmVtb3RlIGNhbGwnLCBiYXlldXhNZXNzYWdlLCAnYWZ0ZXInLCB0aW1lb3V0LCAnbXMnKTtcbiAgICAgICAgICAgICAgICBfZmFpbE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBpZDogYmF5ZXV4TWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICc0MDY6OnRpbWVvdXQnLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSA6IGJheWV1eE1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246ICdSZW1vdGUgQ2FsbCBUaW1lb3V0J1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aW1lb3V0KTtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdTY2hlZHVsZWQgcmVtb3RlIGNhbGwgdGltZW91dCcsIGJheWV1eE1lc3NhZ2UsICdpbicsIHRpbWVvdXQsICdtcycpO1xuICAgICAgICB9XG4gICAgICAgIF9yZW1vdGVDYWxsc1tiYXlldXhNZXNzYWdlLmlkXSA9IGNvbnRleHQ7XG5cbiAgICAgICAgX3F1ZXVlU2VuZChiYXlldXhNZXNzYWdlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHN0YXR1cyBvZiB0aGUgYmF5ZXV4IGNvbW11bmljYXRpb24gd2l0aCB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKi9cbiAgICB0aGlzLmdldFN0YXR1cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3N0YXR1cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaW5zdGFuY2UgaGFzIGJlZW4gZGlzY29ubmVjdGVkLlxuICAgICAqL1xuICAgIHRoaXMuaXNEaXNjb25uZWN0ZWQgPSBfaXNEaXNjb25uZWN0ZWQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBiYWNrb2ZmIHBlcmlvZCB1c2VkIHRvIGluY3JlYXNlIHRoZSBiYWNrb2ZmIHRpbWUgd2hlbiByZXRyeWluZyBhbiB1bnN1Y2Nlc3NmdWwgb3IgZmFpbGVkIG1lc3NhZ2UuXG4gICAgICogRGVmYXVsdCB2YWx1ZSBpcyAxIHNlY29uZCwgd2hpY2ggbWVhbnMgaWYgdGhlcmUgaXMgYSBwZXJzaXN0ZW50IGZhaWx1cmUgdGhlIHJldHJpZXMgd2lsbCBoYXBwZW5cbiAgICAgKiBhZnRlciAxIHNlY29uZCwgdGhlbiBhZnRlciAyIHNlY29uZHMsIHRoZW4gYWZ0ZXIgMyBzZWNvbmRzLCBldGMuIFNvIGZvciBleGFtcGxlIHdpdGggMTUgc2Vjb25kcyBvZlxuICAgICAqIGVsYXBzZWQgdGltZSwgdGhlcmUgd2lsbCBiZSA1IHJldHJpZXMgKGF0IDEsIDMsIDYsIDEwIGFuZCAxNSBzZWNvbmRzIGVsYXBzZWQpLlxuICAgICAqIEBwYXJhbSBwZXJpb2QgdGhlIGJhY2tvZmYgcGVyaW9kIHRvIHNldFxuICAgICAqIEBzZWUgI2dldEJhY2tvZmZJbmNyZW1lbnQoKVxuICAgICAqL1xuICAgIHRoaXMuc2V0QmFja29mZkluY3JlbWVudCA9IGZ1bmN0aW9uKHBlcmlvZCkge1xuICAgICAgICBfY29uZmlnLmJhY2tvZmZJbmNyZW1lbnQgPSBwZXJpb2Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJhY2tvZmYgcGVyaW9kIHVzZWQgdG8gaW5jcmVhc2UgdGhlIGJhY2tvZmYgdGltZSB3aGVuIHJldHJ5aW5nIGFuIHVuc3VjY2Vzc2Z1bCBvciBmYWlsZWQgbWVzc2FnZS5cbiAgICAgKiBAc2VlICNzZXRCYWNrb2ZmSW5jcmVtZW50KHBlcmlvZClcbiAgICAgKi9cbiAgICB0aGlzLmdldEJhY2tvZmZJbmNyZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jb25maWcuYmFja29mZkluY3JlbWVudDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYmFja29mZiBwZXJpb2QgdG8gd2FpdCBiZWZvcmUgcmV0cnlpbmcgYW4gdW5zdWNjZXNzZnVsIG9yIGZhaWxlZCBtZXNzYWdlLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0QmFja29mZlBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2JhY2tvZmY7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEluY3JlYXNlcyB0aGUgYmFja29mZiBwZXJpb2QgdXAgdG8gdGhlIG1heGltdW0gdmFsdWUgY29uZmlndXJlZC5cbiAgICAgKiBAcmV0dXJucyB0aGUgYmFja29mZiBwZXJpb2QgYWZ0ZXIgaW5jcmVtZW50XG4gICAgICogQHNlZSBnZXRCYWNrb2ZmSW5jcmVtZW50XG4gICAgICovXG4gICAgdGhpcy5pbmNyZWFzZUJhY2tvZmZQZXJpb2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9pbmNyZWFzZUJhY2tvZmYoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBiYWNrb2ZmIHBlcmlvZCB0byB6ZXJvLlxuICAgICAqL1xuICAgIHRoaXMucmVzZXRCYWNrb2ZmUGVyaW9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9yZXNldEJhY2tvZmYoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgbG9nIGxldmVsIGZvciBjb25zb2xlIGxvZ2dpbmcuXG4gICAgICogVmFsaWQgdmFsdWVzIGFyZSB0aGUgc3RyaW5ncyAnZXJyb3InLCAnd2FybicsICdpbmZvJyBhbmQgJ2RlYnVnJywgZnJvbVxuICAgICAqIGxlc3MgdmVyYm9zZSB0byBtb3JlIHZlcmJvc2UuXG4gICAgICogQHBhcmFtIGxldmVsIHRoZSBsb2cgbGV2ZWwgc3RyaW5nXG4gICAgICovXG4gICAgdGhpcy5zZXRMb2dMZXZlbCA9IGZ1bmN0aW9uKGxldmVsKSB7XG4gICAgICAgIF9jb25maWcubG9nTGV2ZWwgPSBsZXZlbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGFuIGV4dGVuc2lvbiB3aG9zZSBjYWxsYmFja3MgYXJlIGNhbGxlZCBmb3IgZXZlcnkgaW5jb21pbmcgbWVzc2FnZVxuICAgICAqICh0aGF0IGNvbWVzIGZyb20gdGhlIHNlcnZlciB0byB0aGlzIGNsaWVudCBpbXBsZW1lbnRhdGlvbikgYW5kIGZvciBldmVyeVxuICAgICAqIG91dGdvaW5nIG1lc3NhZ2UgKHRoYXQgb3JpZ2luYXRlcyBmcm9tIHRoaXMgY2xpZW50IGltcGxlbWVudGF0aW9uIGZvciB0aGVcbiAgICAgKiBzZXJ2ZXIpLlxuICAgICAqIFRoZSBmb3JtYXQgb2YgdGhlIGV4dGVuc2lvbiBvYmplY3QgaXMgdGhlIGZvbGxvd2luZzpcbiAgICAgKiA8cHJlPlxuICAgICAqIHtcbiAgICAgKiAgICAgaW5jb21pbmc6IGZ1bmN0aW9uKG1lc3NhZ2UpIHsgLi4uIH0sXG4gICAgICogICAgIG91dGdvaW5nOiBmdW5jdGlvbihtZXNzYWdlKSB7IC4uLiB9XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqIEJvdGggcHJvcGVydGllcyBhcmUgb3B0aW9uYWwsIGJ1dCBpZiB0aGV5IGFyZSBwcmVzZW50IHRoZXkgd2lsbCBiZSBjYWxsZWRcbiAgICAgKiByZXNwZWN0aXZlbHkgZm9yIGVhY2ggaW5jb21pbmcgbWVzc2FnZSBhbmQgZm9yIGVhY2ggb3V0Z29pbmcgbWVzc2FnZS5cbiAgICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgZXh0ZW5zaW9uXG4gICAgICogQHBhcmFtIGV4dGVuc2lvbiB0aGUgZXh0ZW5zaW9uIHRvIHJlZ2lzdGVyXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoZSBleHRlbnNpb24gd2FzIHJlZ2lzdGVyZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqIEBzZWUgI3VucmVnaXN0ZXJFeHRlbnNpb24obmFtZSlcbiAgICAgKi9cbiAgICB0aGlzLnJlZ2lzdGVyRXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSwgZXh0ZW5zaW9uKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMiwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzU3RyaW5nKG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiBleHRlbnNpb24gbmFtZSBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBleGlzdGluZyA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZXhpc3RpbmdFeHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ0V4dGVuc2lvbi5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgZXhpc3RpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIF9leHRlbnNpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uOiBleHRlbnNpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1JlZ2lzdGVyZWQgZXh0ZW5zaW9uJywgbmFtZSk7XG5cbiAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBleHRlbnNpb25zXG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oZXh0ZW5zaW9uLnJlZ2lzdGVyZWQpKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9uLnJlZ2lzdGVyZWQobmFtZSwgdGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faW5mbygnQ291bGQgbm90IHJlZ2lzdGVyIGV4dGVuc2lvbiB3aXRoIG5hbWUnLCBuYW1lLCAnc2luY2UgYW5vdGhlciBleHRlbnNpb24gd2l0aCB0aGUgc2FtZSBuYW1lIGFscmVhZHkgZXhpc3RzJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVW5yZWdpc3RlciBhbiBleHRlbnNpb24gcHJldmlvdXNseSByZWdpc3RlcmVkIHdpdGhcbiAgICAgKiB7QGxpbmsgI3JlZ2lzdGVyRXh0ZW5zaW9uKG5hbWUsIGV4dGVuc2lvbil9LlxuICAgICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb24gdG8gdW5yZWdpc3Rlci5cbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGV4dGVuc2lvbiB3YXMgdW5yZWdpc3RlcmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICB0aGlzLnVucmVnaXN0ZXJFeHRlbnNpb24gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmICghX2lzU3RyaW5nKG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiBleHRlbnNpb24gbmFtZSBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1bnJlZ2lzdGVyZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGV4dGVuc2lvbi5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgX2V4dGVuc2lvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHVucmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1VucmVnaXN0ZXJlZCBleHRlbnNpb24nLCBuYW1lKTtcblxuICAgICAgICAgICAgICAgIC8vIENhbGxiYWNrIGZvciBleHRlbnNpb25zXG4gICAgICAgICAgICAgICAgdmFyIGV4dCA9IGV4dGVuc2lvbi5leHRlbnNpb247XG4gICAgICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGV4dC51bnJlZ2lzdGVyZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dC51bnJlZ2lzdGVyZWQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5yZWdpc3RlcmVkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIHRoZSBleHRlbnNpb24gcmVnaXN0ZXJlZCB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuICAgICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb24gdG8gZmluZFxuICAgICAqIEByZXR1cm4gdGhlIGV4dGVuc2lvbiBmb3VuZCBvciBudWxsIGlmIG5vIGV4dGVuc2lvbiB3aXRoIHRoZSBnaXZlbiBuYW1lIGhhcyBiZWVuIHJlZ2lzdGVyZWRcbiAgICAgKi9cbiAgICB0aGlzLmdldEV4dGVuc2lvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGV4dGVuc2lvbi5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4dGVuc2lvbi5leHRlbnNpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG5hbWUgYXNzaWduZWQgdG8gdGhpcyBDb21ldEQgb2JqZWN0LCBvciB0aGUgc3RyaW5nICdkZWZhdWx0J1xuICAgICAqIGlmIG5vIG5hbWUgaGFzIGJlZW4gZXhwbGljaXRseSBwYXNzZWQgYXMgcGFyYW1ldGVyIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgKi9cbiAgICB0aGlzLmdldE5hbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9uYW1lO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjbGllbnRJZCBhc3NpZ25lZCBieSB0aGUgQmF5ZXV4IHNlcnZlciBkdXJpbmcgaGFuZHNoYWtlLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0Q2xpZW50SWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jbGllbnRJZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgVVJMIG9mIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gX3RyYW5zcG9ydC5nZXRVUkwoKTtcbiAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXJsID0gX2NvbmZpZy51cmxzW190cmFuc3BvcnQuZ2V0VHlwZSgpXTtcbiAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY29uZmlnLnVybDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRUcmFuc3BvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnQ7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWl4aW4odHJ1ZSwge30sIF9jb25maWcpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldEFkdmljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbWl4aW4odHJ1ZSwge30sIF9hZHZpY2UpO1xuICAgIH07XG59O1xuIiwidmFyIFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vVHJhbnNwb3J0Jyk7XG52YXIgUmVxdWVzdFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vUmVxdWVzdFRyYW5zcG9ydCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIExvbmdQb2xsaW5nVHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgUmVxdWVzdFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcbiAgICAvLyBCeSBkZWZhdWx0LCBzdXBwb3J0IGNyb3NzIGRvbWFpblxuICAgIHZhciBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IHRydWU7XG5cbiAgICBfc2VsZi5hY2NlcHQgPSBmdW5jdGlvbih2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIHJldHVybiBfc3VwcG9ydHNDcm9zc0RvbWFpbiB8fCAhY3Jvc3NEb21haW47XG4gICAgfTtcblxuICAgIF9zZWxmLnhoclNlbmQgPSBmdW5jdGlvbihwYWNrZXQpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgX3NlbGYudHJhbnNwb3J0U2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbmRpbmcgcmVxdWVzdCcsIHJlcXVlc3QuaWQsICdlbnZlbG9wZScsIGVudmVsb3BlKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgc2FtZVN0YWNrID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3QueGhyID0gdGhpcy54aHJTZW5kKHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IHRoaXMsXG4gICAgICAgICAgICAgICAgdXJsOiBlbnZlbG9wZS51cmwsXG4gICAgICAgICAgICAgICAgc3luYzogZW52ZWxvcGUuc3luYyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5yZXF1ZXN0SGVhZGVycyxcbiAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShlbnZlbG9wZS5tZXNzYWdlcyksXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1ZygnVHJhbnNwb3J0Jywgc2VsZi5nZXRUeXBlKCksICdyZWNlaXZlZCByZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZWNlaXZlZCA9IHNlbGYuY29udmVydFRvTWVzc2FnZXMocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBDb2RlOiAyMDRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRTdWNjZXNzKGVudmVsb3BlLCByZXF1ZXN0LCByZWNlaXZlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMocmVxdWVzdC54aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uRXJyb3I6IGZ1bmN0aW9uKHJlYXNvbiwgZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3JlY2VpdmVkIGVycm9yJywgcmVhc29uLCBleGNlcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZS5odHRwQ29kZSA9IHNlbGYueGhyU3RhdHVzKHJlcXVlc3QueGhyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhbWVTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzYW1lU3RhY2sgPSBmYWxzZTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogeFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIF9zdXBlci5yZXNldChpbml0KTtcbiAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSB0cnVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwidmFyIFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vVHJhbnNwb3J0JylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKVxuXG4vKipcbiAqIEJhc2Ugb2JqZWN0IHdpdGggdGhlIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciB0cmFuc3BvcnRzIGJhc2VkIG9uIHJlcXVlc3RzLlxuICogVGhlIGtleSByZXNwb25zaWJpbGl0eSBpcyB0byBhbGxvdyBhdCBtb3N0IDIgb3V0c3RhbmRpbmcgcmVxdWVzdHMgdG8gdGhlIHNlcnZlcixcbiAqIHRvIGF2b2lkIHRoYXQgcmVxdWVzdHMgYXJlIHNlbnQgYmVoaW5kIGEgbG9uZyBwb2xsLlxuICogVG8gYWNoaWV2ZSB0aGlzLCB3ZSBoYXZlIG9uZSByZXNlcnZlZCByZXF1ZXN0IGZvciB0aGUgbG9uZyBwb2xsLCBhbmQgYWxsIG90aGVyXG4gKiByZXF1ZXN0cyBhcmUgc2VyaWFsaXplZCBvbmUgYWZ0ZXIgdGhlIG90aGVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlcXVlc3RUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF9zdXBlciA9IG5ldyBUcmFuc3BvcnQoKTtcbiAgICB2YXIgX3NlbGYgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcik7XG4gICAgdmFyIF9yZXF1ZXN0SWRzID0gMDtcbiAgICB2YXIgX21ldGFDb25uZWN0UmVxdWVzdCA9IG51bGw7XG4gICAgdmFyIF9yZXF1ZXN0cyA9IFtdO1xuICAgIHZhciBfZW52ZWxvcGVzID0gW107XG5cbiAgICBmdW5jdGlvbiBfY29hbGVzY2VFbnZlbG9wZXMoZW52ZWxvcGUpIHtcbiAgICAgICAgd2hpbGUgKF9lbnZlbG9wZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGVudmVsb3BlQW5kUmVxdWVzdCA9IF9lbnZlbG9wZXNbMF07XG4gICAgICAgICAgICB2YXIgbmV3RW52ZWxvcGUgPSBlbnZlbG9wZUFuZFJlcXVlc3RbMF07XG4gICAgICAgICAgICB2YXIgbmV3UmVxdWVzdCA9IGVudmVsb3BlQW5kUmVxdWVzdFsxXTtcbiAgICAgICAgICAgIGlmIChuZXdFbnZlbG9wZS51cmwgPT09IGVudmVsb3BlLnVybCAmJlxuICAgICAgICAgICAgICAgIG5ld0VudmVsb3BlLnN5bmMgPT09IGVudmVsb3BlLnN5bmMpIHtcbiAgICAgICAgICAgICAgICBfZW52ZWxvcGVzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgZW52ZWxvcGUubWVzc2FnZXMgPSBlbnZlbG9wZS5tZXNzYWdlcy5jb25jYXQobmV3RW52ZWxvcGUubWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdDb2FsZXNjZWQnLCBuZXdFbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGgsICdtZXNzYWdlcyBmcm9tIHJlcXVlc3QnLCBuZXdSZXF1ZXN0LmlkKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3RyYW5zcG9ydFNlbmQoZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdGhpcy50cmFuc3BvcnRTZW5kKGVudmVsb3BlLCByZXF1ZXN0KTtcbiAgICAgICAgcmVxdWVzdC5leHBpcmVkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFlbnZlbG9wZS5zeW5jKSB7XG4gICAgICAgICAgICB2YXIgbWF4RGVsYXkgPSB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhOZXR3b3JrRGVsYXk7XG4gICAgICAgICAgICB2YXIgZGVsYXkgPSBtYXhEZWxheTtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0Lm1ldGFDb25uZWN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZGVsYXkgKz0gdGhpcy5nZXRBZHZpY2UoKS50aW1lb3V0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICd3YWl0aW5nIGF0IG1vc3QnLCBkZWxheSwgJ21zIGZvciB0aGUgcmVzcG9uc2UsIG1heE5ldHdvcmtEZWxheScsIG1heERlbGF5KTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgcmVxdWVzdC50aW1lb3V0ID0gdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3QuZXhwaXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9ICdSZXF1ZXN0ICcgKyByZXF1ZXN0LmlkICsgJyBvZiB0cmFuc3BvcnQgJyArIHNlbGYuZ2V0VHlwZSgpICsgJyBleGNlZWRlZCAnICsgZGVsYXkgKyAnIG1zIG1heCBuZXR3b3JrIGRlbGF5JztcbiAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBlcnJvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciB4aHIgPSByZXF1ZXN0LnhocjtcbiAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMoeGhyKTtcbiAgICAgICAgICAgICAgICBzZWxmLmFib3J0WEhSKHhocik7XG4gICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmNvbXBsZXRlKHJlcXVlc3QsIGZhbHNlLCByZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5vbkZhaWx1cmUoeGhyLCBlbnZlbG9wZS5tZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcXVldWVTZW5kKGVudmVsb3BlKSB7XG4gICAgICAgIHZhciByZXF1ZXN0SWQgPSArK19yZXF1ZXN0SWRzO1xuICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIGlkOiByZXF1ZXN0SWQsXG4gICAgICAgICAgICBtZXRhQ29ubmVjdDogZmFsc2UsXG4gICAgICAgICAgICBlbnZlbG9wZTogZW52ZWxvcGVcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb25zaWRlciB0aGUgbWV0YUNvbm5lY3QgcmVxdWVzdHMgd2hpY2ggc2hvdWxkIGFsd2F5cyBiZSBwcmVzZW50XG4gICAgICAgIGlmIChfcmVxdWVzdHMubGVuZ3RoIDwgdGhpcy5nZXRDb25maWd1cmF0aW9uKCkubWF4Q29ubmVjdGlvbnMgLSAxKSB7XG4gICAgICAgICAgICBfcmVxdWVzdHMucHVzaChyZXF1ZXN0KTtcbiAgICAgICAgICAgIF90cmFuc3BvcnRTZW5kLmNhbGwodGhpcywgZW52ZWxvcGUsIHJlcXVlc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAncXVldWVpbmcgcmVxdWVzdCcsIHJlcXVlc3RJZCwgJ2VudmVsb3BlJywgZW52ZWxvcGUpO1xuICAgICAgICAgICAgX2VudmVsb3Blcy5wdXNoKFtlbnZlbG9wZSwgcmVxdWVzdF0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21ldGFDb25uZWN0Q29tcGxldGUocmVxdWVzdCkge1xuICAgICAgICB2YXIgcmVxdWVzdElkID0gcmVxdWVzdC5pZDtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnbWV0YUNvbm5lY3QgY29tcGxldGUsIHJlcXVlc3QnLCByZXF1ZXN0SWQpO1xuICAgICAgICBpZiAoX21ldGFDb25uZWN0UmVxdWVzdCAhPT0gbnVsbCAmJiBfbWV0YUNvbm5lY3RSZXF1ZXN0LmlkICE9PSByZXF1ZXN0SWQpIHtcbiAgICAgICAgICAgIHRocm93ICdMb25ncG9sbCByZXF1ZXN0IG1pc21hdGNoLCBjb21wbGV0aW5nIHJlcXVlc3QgJyArIHJlcXVlc3RJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc2V0IG1ldGFDb25uZWN0IHJlcXVlc3RcbiAgICAgICAgX21ldGFDb25uZWN0UmVxdWVzdCA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NvbXBsZXRlKHJlcXVlc3QsIHN1Y2Nlc3MpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gVXRpbHMuaW5BcnJheShyZXF1ZXN0LCBfcmVxdWVzdHMpO1xuICAgICAgICAvLyBUaGUgaW5kZXggY2FuIGJlIG5lZ2F0aXZlIGlmIHRoZSByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWRcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgIF9yZXF1ZXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9lbnZlbG9wZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGVudmVsb3BlQW5kUmVxdWVzdCA9IF9lbnZlbG9wZXMuc2hpZnQoKTtcbiAgICAgICAgICAgIHZhciBuZXh0RW52ZWxvcGUgPSBlbnZlbG9wZUFuZFJlcXVlc3RbMF07XG4gICAgICAgICAgICB2YXIgbmV4dFJlcXVlc3QgPSBlbnZlbG9wZUFuZFJlcXVlc3RbMV07XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0IGRlcXVldWVkIHJlcXVlc3QnLCBuZXh0UmVxdWVzdC5pZCk7XG4gICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5hdXRvQmF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvYWxlc2NlRW52ZWxvcGVzLmNhbGwodGhpcywgbmV4dEVudmVsb3BlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3F1ZXVlU2VuZC5jYWxsKHRoaXMsIG5leHRFbnZlbG9wZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCBjb21wbGV0ZWQgcmVxdWVzdCcsIHJlcXVlc3QuaWQsIG5leHRFbnZlbG9wZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jb21wbGV0ZShuZXh0UmVxdWVzdCwgZmFsc2UsIG5leHRSZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246ICdQcmV2aW91cyByZXF1ZXN0IGZhaWxlZCdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHhociA9IG5leHRSZXF1ZXN0LnhocjtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZS5odHRwQ29kZSA9IHNlbGYueGhyU3RhdHVzKHhocik7XG4gICAgICAgICAgICAgICAgICAgIG5leHRFbnZlbG9wZS5vbkZhaWx1cmUoeGhyLCBuZXh0RW52ZWxvcGUubWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3NlbGYuY29tcGxldGUgPSBmdW5jdGlvbihyZXF1ZXN0LCBzdWNjZXNzLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICBpZiAobWV0YUNvbm5lY3QpIHtcbiAgICAgICAgICAgIF9tZXRhQ29ubmVjdENvbXBsZXRlLmNhbGwodGhpcywgcmVxdWVzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfY29tcGxldGUuY2FsbCh0aGlzLCByZXF1ZXN0LCBzdWNjZXNzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyB0aGUgYWN0dWFsIHNlbmQgZGVwZW5kaW5nIG9uIHRoZSB0cmFuc3BvcnQgdHlwZSBkZXRhaWxzLlxuICAgICAqIEBwYXJhbSBlbnZlbG9wZSB0aGUgZW52ZWxvcGUgdG8gc2VuZFxuICAgICAqIEBwYXJhbSByZXF1ZXN0IHRoZSByZXF1ZXN0IGluZm9ybWF0aW9uXG4gICAgICovXG4gICAgX3NlbGYudHJhbnNwb3J0U2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0KSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIF9zZWxmLnRyYW5zcG9ydFN1Y2Nlc3MgPSBmdW5jdGlvbihlbnZlbG9wZSwgcmVxdWVzdCwgcmVzcG9uc2VzKSB7XG4gICAgICAgIGlmICghcmVxdWVzdC5leHBpcmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZW91dChyZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZShyZXF1ZXN0LCB0cnVlLCByZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZXMgJiYgcmVzcG9uc2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5vblN1Y2Nlc3MocmVzcG9uc2VzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW52ZWxvcGUub25GYWlsdXJlKHJlcXVlc3QueGhyLCBlbnZlbG9wZS5tZXNzYWdlcywge1xuICAgICAgICAgICAgICAgICAgICBodHRwQ29kZTogMjA0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYudHJhbnNwb3J0RmFpbHVyZSA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0LCBmYWlsdXJlKSB7XG4gICAgICAgIGlmICghcmVxdWVzdC5leHBpcmVkKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZW91dChyZXF1ZXN0LnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy5jb21wbGV0ZShyZXF1ZXN0LCBmYWxzZSwgcmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICBlbnZlbG9wZS5vbkZhaWx1cmUocmVxdWVzdC54aHIsIGVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfbWV0YUNvbm5lY3RTZW5kKGVudmVsb3BlKSB7XG4gICAgICAgIGlmIChfbWV0YUNvbm5lY3RSZXF1ZXN0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyAnQ29uY3VycmVudCBtZXRhQ29ubmVjdCByZXF1ZXN0cyBub3QgYWxsb3dlZCwgcmVxdWVzdCBpZD0nICsgX21ldGFDb25uZWN0UmVxdWVzdC5pZCArICcgbm90IHlldCBjb21wbGV0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlcXVlc3RJZCA9ICsrX3JlcXVlc3RJZHM7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ21ldGFDb25uZWN0IHNlbmQsIHJlcXVlc3QnLCByZXF1ZXN0SWQsICdlbnZlbG9wZScsIGVudmVsb3BlKTtcbiAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICBpZDogcmVxdWVzdElkLFxuICAgICAgICAgICAgbWV0YUNvbm5lY3Q6IHRydWUsXG4gICAgICAgICAgICBlbnZlbG9wZTogZW52ZWxvcGVcbiAgICAgICAgfTtcbiAgICAgICAgX3RyYW5zcG9ydFNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSwgcmVxdWVzdCk7XG4gICAgICAgIF9tZXRhQ29ubmVjdFJlcXVlc3QgPSByZXF1ZXN0O1xuICAgIH1cblxuICAgIF9zZWxmLnNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgaWYgKG1ldGFDb25uZWN0KSB7XG4gICAgICAgICAgICBfbWV0YUNvbm5lY3RTZW5kLmNhbGwodGhpcywgZW52ZWxvcGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3F1ZXVlU2VuZC5jYWxsKHRoaXMsIGVudmVsb3BlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfc3VwZXIuYWJvcnQoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfcmVxdWVzdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0ID0gX3JlcXVlc3RzW2ldO1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnQWJvcnRpbmcgcmVxdWVzdCcsIHJlcXVlc3QpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5hYm9ydFhIUihyZXF1ZXN0LnhocikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRGYWlsdXJlKHJlcXVlc3QuZW52ZWxvcGUsIHJlcXVlc3QsIHtyZWFzb246ICdhYm9ydCd9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9tZXRhQ29ubmVjdFJlcXVlc3QpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdBYm9ydGluZyBtZXRhQ29ubmVjdCByZXF1ZXN0JywgX21ldGFDb25uZWN0UmVxdWVzdCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYWJvcnRYSFIoX21ldGFDb25uZWN0UmVxdWVzdC54aHIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BvcnRGYWlsdXJlKF9tZXRhQ29ubmVjdFJlcXVlc3QuZW52ZWxvcGUsIF9tZXRhQ29ubmVjdFJlcXVlc3QsIHtyZWFzb246ICdhYm9ydCd9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlc2V0KHRydWUpO1xuICAgIH07XG5cbiAgICBfc2VsZi5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgX3N1cGVyLnJlc2V0KGluaXQpO1xuICAgICAgICBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgX3JlcXVlc3RzID0gW107XG4gICAgICAgIF9lbnZlbG9wZXMgPSBbXTtcbiAgICB9O1xuXG4gICAgX3NlbGYuYWJvcnRYSFIgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgaWYgKHhocikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB4aHIucmVhZHlTdGF0ZTtcbiAgICAgICAgICAgICAgICB4aHIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUgIT09IFhNTEh0dHBSZXF1ZXN0LlVOU0VOVDtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1Zyh4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIF9zZWxmLnhoclN0YXR1cyA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICBpZiAoeGhyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4aHIuc3RhdHVzO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF9zZWxmO1xufTtcbiIsInZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKVxuXG4vKipcbiAqIEJhc2Ugb2JqZWN0IHdpdGggdGhlIGNvbW1vbiBmdW5jdGlvbmFsaXR5IGZvciB0cmFuc3BvcnRzLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFRyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3R5cGU7XG4gICAgdmFyIF9jb21ldGQ7XG4gICAgdmFyIF91cmw7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiBpbnZva2VkIGp1c3QgYWZ0ZXIgYSB0cmFuc3BvcnQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHJlZ2lzdGVyZWQuXG4gICAgICogQHBhcmFtIHR5cGUgdGhlIHR5cGUgb2YgdHJhbnNwb3J0IChmb3IgZXhhbXBsZSAnbG9uZy1wb2xsaW5nJylcbiAgICAgKiBAcGFyYW0gY29tZXRkIHRoZSBjb21ldGQgb2JqZWN0IHRoaXMgdHJhbnNwb3J0IGhhcyBiZWVuIHJlZ2lzdGVyZWQgdG9cbiAgICAgKiBAc2VlICN1bnJlZ2lzdGVyZWQoKVxuICAgICAqL1xuICAgIHRoaXMucmVnaXN0ZXJlZCA9IGZ1bmN0aW9uKHR5cGUsIGNvbWV0ZCkge1xuICAgICAgICBfdHlwZSA9IHR5cGU7XG4gICAgICAgIF9jb21ldGQgPSBjb21ldGQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIGludm9rZWQganVzdCBhZnRlciBhIHRyYW5zcG9ydCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgdW5yZWdpc3RlcmVkLlxuICAgICAqIEBzZWUgI3JlZ2lzdGVyZWQodHlwZSwgY29tZXRkKVxuICAgICAqL1xuICAgIHRoaXMudW5yZWdpc3RlcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90eXBlID0gbnVsbDtcbiAgICAgICAgX2NvbWV0ZCA9IG51bGw7XG4gICAgfTtcblxuICAgIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnLmFwcGx5KF9jb21ldGQsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHRoaXMuX21peGluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY29tZXRkLl9taXhpbi5hcHBseShfY29tZXRkLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jb21ldGQuZ2V0Q29uZmlndXJhdGlvbigpO1xuICAgIH07XG5cbiAgICB0aGlzLmdldEFkdmljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbWV0ZC5nZXRBZHZpY2UoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24oZnVua3Rpb24sIGRlbGF5KSB7XG4gICAgICAgIHJldHVybiBVdGlscy5zZXRUaW1lb3V0KF9jb21ldGQsIGZ1bmt0aW9uLCBkZWxheSk7XG4gICAgfTtcblxuICAgIHRoaXMuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgICAgIFV0aWxzLmNsZWFyVGltZW91dChoYW5kbGUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyB0aGUgZ2l2ZW4gcmVzcG9uc2UgaW50byBhbiBhcnJheSBvZiBiYXlldXggbWVzc2FnZXNcbiAgICAgKiBAcGFyYW0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIHRvIGNvbnZlcnRcbiAgICAgKiBAcmV0dXJuIGFuIGFycmF5IG9mIGJheWV1eCBtZXNzYWdlcyBvYnRhaW5lZCBieSBjb252ZXJ0aW5nIHRoZSByZXNwb25zZVxuICAgICAqL1xuICAgIHRoaXMuY29udmVydFRvTWVzc2FnZXMgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBpZiAoVXRpbHMuaXNTdHJpbmcocmVzcG9uc2UpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnQ291bGQgbm90IGNvbnZlcnQgdG8gSlNPTiB0aGUgZm9sbG93aW5nIHN0cmluZycsICdcIicgKyByZXNwb25zZSArICdcIicpO1xuICAgICAgICAgICAgICAgIHRocm93IHg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFV0aWxzLmlzQXJyYXkocmVzcG9uc2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3BvbnNlID09PSB1bmRlZmluZWQgfHwgcmVzcG9uc2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzcG9uc2UgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIHJldHVybiBbcmVzcG9uc2VdO1xuICAgICAgICB9XG4gICAgICAgIHRocm93ICdDb252ZXJzaW9uIEVycm9yICcgKyByZXNwb25zZSArICcsIHR5cGVvZiAnICsgKHR5cGVvZiByZXNwb25zZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGlzIHRyYW5zcG9ydCBjYW4gd29yayBmb3IgdGhlIGdpdmVuIHZlcnNpb24gYW5kIGNyb3NzIGRvbWFpbiBjb21tdW5pY2F0aW9uIGNhc2UuXG4gICAgICogQHBhcmFtIHZlcnNpb24gYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgdHJhbnNwb3J0IHZlcnNpb25cbiAgICAgKiBAcGFyYW0gY3Jvc3NEb21haW4gYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgY29tbXVuaWNhdGlvbiBpcyBjcm9zcyBkb21haW5cbiAgICAgKiBAcGFyYW0gdXJsIHRoZSBVUkwgdG8gY29ubmVjdCB0b1xuICAgICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGlzIHRyYW5zcG9ydCBjYW4gd29yayBmb3IgdGhlIGdpdmVuIHZlcnNpb24gYW5kIGNyb3NzIGRvbWFpbiBjb21tdW5pY2F0aW9uIGNhc2UsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgdGhpcy5hY2NlcHQgPSBmdW5jdGlvbih2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHR5cGUgb2YgdGhpcyB0cmFuc3BvcnQuXG4gICAgICogQHNlZSAjcmVnaXN0ZXJlZCh0eXBlLCBjb21ldGQpXG4gICAgICovXG4gICAgdGhpcy5nZXRUeXBlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHlwZTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRVUkwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF91cmw7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0VVJMID0gZnVuY3Rpb24odXJsKSB7XG4gICAgICAgIF91cmwgPSB1cmw7XG4gICAgfTtcblxuICAgIHRoaXMuc2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgX3R5cGUsICdyZXNldCcsIGluaXQgPyAnaW5pdGlhbCcgOiAncmV0cnknKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgX3R5cGUsICdhYm9ydGVkJyk7XG4gICAgfTtcblxuICAgIHRoaXMudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZSgpO1xuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5kZXJpdmUgPSBmdW5jdGlvbihiYXNlT2JqZWN0KSB7XG4gICAgZnVuY3Rpb24gRigpIHtcbiAgICB9XG5cbiAgICBGLnByb3RvdHlwZSA9IGJhc2VPYmplY3Q7XG4gICAgcmV0dXJuIG5ldyBGKCk7XG59O1xuIiwiLyoqXG4gKiBBIHJlZ2lzdHJ5IGZvciB0cmFuc3BvcnRzIHVzZWQgYnkgdGhlIENvbWV0RCBvYmplY3QuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVHJhbnNwb3J0UmVnaXN0cnkoKSB7XG4gICAgdmFyIF90eXBlcyA9IFtdO1xuICAgIHZhciBfdHJhbnNwb3J0cyA9IHt9O1xuXG4gICAgdGhpcy5nZXRUcmFuc3BvcnRUeXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3R5cGVzLnNsaWNlKDApO1xuICAgIH07XG5cbiAgICB0aGlzLmZpbmRUcmFuc3BvcnRUeXBlcyA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBfdHlwZXNbaV07XG4gICAgICAgICAgICBpZiAoX3RyYW5zcG9ydHNbdHlwZV0uYWNjZXB0KHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgdGhpcy5uZWdvdGlhdGVUcmFuc3BvcnQgPSBmdW5jdGlvbih0eXBlcywgdmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSBfdHlwZXNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHR5cGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09IHR5cGVzW2pdKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc3BvcnQgPSBfdHJhbnNwb3J0c1t0eXBlXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zcG9ydC5hY2NlcHQodmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc3BvcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHRoaXMuYWRkID0gZnVuY3Rpb24odHlwZSwgdHJhbnNwb3J0LCBpbmRleCkge1xuICAgICAgICB2YXIgZXhpc3RpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChfdHlwZXNbaV0gPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIF90eXBlcy5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdHlwZXMuc3BsaWNlKGluZGV4LCAwLCB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF90cmFuc3BvcnRzW3R5cGVdID0gdHJhbnNwb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICFleGlzdGluZztcbiAgICB9O1xuXG4gICAgdGhpcy5maW5kID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKF90eXBlc1tpXSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdHJhbnNwb3J0c1t0eXBlXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoX3R5cGVzW2ldID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgX3R5cGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB2YXIgdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHNbdHlwZV07XG4gICAgICAgICAgICAgICAgZGVsZXRlIF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc3BvcnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3R5cGVzID0gW107XG4gICAgICAgIF90cmFuc3BvcnRzID0ge307XG4gICAgfTtcblxuICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0c1tfdHlwZXNbaV1dLnJlc2V0KGluaXQpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG4iLCJleHBvcnRzLmlzU3RyaW5nID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZztcbn07XG5cbmV4cG9ydHMuaXNBcnJheSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgQXJyYXk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gZWxlbWVudCBpcyBjb250YWluZWQgaW50byB0aGUgZ2l2ZW4gYXJyYXkuXG4gKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBjaGVjayBwcmVzZW5jZSBmb3JcbiAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgdG8gY2hlY2sgZm9yIHRoZSBlbGVtZW50IHByZXNlbmNlXG4gKiBAcmV0dXJuIHRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCwgaWYgcHJlc2VudCwgb3IgYSBuZWdhdGl2ZSBpbmRleCBpZiB0aGUgZWxlbWVudCBpcyBub3QgcHJlc2VudFxuICovXG5leHBvcnRzLmluQXJyYXkgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXJyYXkpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChlbGVtZW50ID09PSBhcnJheVtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufTtcblxuZXhwb3J0cy5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGNvbWV0ZCwgZnVua3Rpb24sIGRlbGF5KSB7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb21ldGQuX2RlYnVnKCdJbnZva2luZyB0aW1lZCBmdW5jdGlvbicsIGZ1bmt0aW9uKTtcbiAgICAgICAgICAgIGZ1bmt0aW9uKCk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIGNvbWV0ZC5fZGVidWcoJ0V4Y2VwdGlvbiBpbnZva2luZyB0aW1lZCBmdW5jdGlvbicsIGZ1bmt0aW9uLCB4KTtcbiAgICAgICAgfVxuICAgIH0sIGRlbGF5KTtcbn07XG5cbmV4cG9ydHMuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKHRpbWVvdXRIYW5kbGUpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dEhhbmRsZSk7XG59O1xuIiwidmFyIFRyYW5zcG9ydCA9IHJlcXVpcmUoJy4vVHJhbnNwb3J0JylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFdlYlNvY2tldFRyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3N1cGVyID0gbmV3IFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcbiAgICB2YXIgX2NvbWV0ZDtcbiAgICAvLyBCeSBkZWZhdWx0IFdlYlNvY2tldCBpcyBzdXBwb3J0ZWRcbiAgICB2YXIgX3dlYlNvY2tldFN1cHBvcnRlZCA9IHRydWU7XG4gICAgLy8gV2hldGhlciB3ZSB3ZXJlIGFibGUgdG8gZXN0YWJsaXNoIGEgV2ViU29ja2V0IGNvbm5lY3Rpb25cbiAgICB2YXIgX3dlYlNvY2tldENvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHZhciBfc3RpY2t5UmVjb25uZWN0ID0gdHJ1ZTtcbiAgICAvLyBUaGUgY29udGV4dCBjb250YWlucyB0aGUgZW52ZWxvcGVzIHRoYXQgaGF2ZSBiZWVuIHNlbnRcbiAgICAvLyBhbmQgdGhlIHRpbWVvdXRzIGZvciB0aGUgbWVzc2FnZXMgdGhhdCBoYXZlIGJlZW4gc2VudC5cbiAgICB2YXIgX2NvbnRleHQgPSBudWxsO1xuICAgIHZhciBfY29ubmVjdGluZyA9IG51bGw7XG4gICAgdmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB2YXIgX3N1Y2Nlc3NDYWxsYmFjayA9IG51bGw7XG5cbiAgICBfc2VsZi5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgX3N1cGVyLnJlc2V0KGluaXQpO1xuICAgICAgICBfd2ViU29ja2V0U3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGluaXQpIHtcbiAgICAgICAgICAgIF93ZWJTb2NrZXRDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBfc3RpY2t5UmVjb25uZWN0ID0gdHJ1ZTtcbiAgICAgICAgX2NvbnRleHQgPSBudWxsO1xuICAgICAgICBfY29ubmVjdGluZyA9IG51bGw7XG4gICAgICAgIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZvcmNlQ2xvc2UoY29udGV4dCwgZXZlbnQpIHtcbiAgICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgICAgIHRoaXMud2ViU29ja2V0Q2xvc2UoY29udGV4dCwgZXZlbnQuY29kZSwgZXZlbnQucmVhc29uKTtcbiAgICAgICAgICAgIC8vIEZvcmNlIGltbWVkaWF0ZSBmYWlsdXJlIG9mIHBlbmRpbmcgbWVzc2FnZXMgdG8gdHJpZ2dlciByZWNvbm5lY3QuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBzZXJ2ZXIgbWF5IG5vdCByZXBseSB0byBvdXIgY2xvc2UoKVxuICAgICAgICAgICAgLy8gYW5kIHRoZXJlZm9yZSB0aGUgb25jbG9zZSBmdW5jdGlvbiBpcyBuZXZlciBjYWxsZWQuXG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UoY29udGV4dCwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3NhbWVDb250ZXh0KGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQgPT09IF9jb25uZWN0aW5nIHx8IGNvbnRleHQgPT09IF9jb250ZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9zdG9yZUVudmVsb3BlKGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB2YXIgbWVzc2FnZUlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGVudmVsb3BlLm1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlSWRzLnB1c2gobWVzc2FnZS5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5lbnZlbG9wZXNbbWVzc2FnZUlkcy5qb2luKCcsJyldID0gW2VudmVsb3BlLCBtZXRhQ29ubmVjdF07XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3N0b3JlZCBlbnZlbG9wZSwgZW52ZWxvcGVzJywgY29udGV4dC5lbnZlbG9wZXMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93ZWJzb2NrZXRDb25uZWN0KGNvbnRleHQpIHtcbiAgICAgICAgLy8gV2UgbWF5IGhhdmUgbXVsdGlwbGUgYXR0ZW1wdHMgdG8gb3BlbiBhIFdlYlNvY2tldFxuICAgICAgICAvLyBjb25uZWN0aW9uLCBmb3IgZXhhbXBsZSBhIC9tZXRhL2Nvbm5lY3QgcmVxdWVzdCB0aGF0XG4gICAgICAgIC8vIG1heSB0YWtlIHRpbWUsIGFsb25nIHdpdGggYSB1c2VyLXRyaWdnZXJlZCBwdWJsaXNoLlxuICAgICAgICAvLyBFYXJseSByZXR1cm4gaWYgd2UgYXJlIGFscmVhZHkgY29ubmVjdGluZy5cbiAgICAgICAgaWYgKF9jb25uZWN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNYW5nbGUgdGhlIFVSTCwgY2hhbmdpbmcgdGhlIHNjaGVtZSBmcm9tICdodHRwJyB0byAnd3MnLlxuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKS5yZXBsYWNlKC9eaHR0cC8sICd3cycpO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdjb25uZWN0aW5nIHRvIFVSTCcsIHVybCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBwcm90b2NvbCA9IF9jb21ldGQuZ2V0Q29uZmlndXJhdGlvbigpLnByb3RvY29sO1xuICAgICAgICAgICAgY29udGV4dC53ZWJTb2NrZXQgPSBwcm90b2NvbCA/IG5ldyBXZWJTb2NrZXQodXJsLCBwcm90b2NvbCkgOiBuZXcgV2ViU29ja2V0KHVybCk7XG4gICAgICAgICAgICBfY29ubmVjdGluZyA9IGNvbnRleHQ7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIF93ZWJTb2NrZXRTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdFeGNlcHRpb24gd2hpbGUgY3JlYXRpbmcgV2ViU29ja2V0IG9iamVjdCcsIHgpO1xuICAgICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ5IGRlZmF1bHQgdXNlIHN0aWNreSByZWNvbm5lY3RzLlxuICAgICAgICBfc3RpY2t5UmVjb25uZWN0ID0gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCkuc3RpY2t5UmVjb25uZWN0ICE9PSBmYWxzZTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjb25uZWN0VGltZW91dCA9IF9jb21ldGQuZ2V0Q29uZmlndXJhdGlvbigpLmNvbm5lY3RUaW1lb3V0O1xuICAgICAgICBpZiAoY29ubmVjdFRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICBjb250ZXh0LmNvbm5lY3RUaW1lciA9IHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVHJhbnNwb3J0Jywgc2VsZi5nZXRUeXBlKCksICd0aW1lZCBvdXQgd2hpbGUgY29ubmVjdGluZyB0byBVUkwnLCB1cmwsICc6JywgY29ubmVjdFRpbWVvdXQsICdtcycpO1xuICAgICAgICAgICAgICAgIC8vIFRoZSBjb25uZWN0aW9uIHdhcyBub3Qgb3BlbmVkLCBjbG9zZSBhbnl3YXkuXG4gICAgICAgICAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbChzZWxmLCBjb250ZXh0LCB7Y29kZTogMTAwMCwgcmVhc29uOiAnQ29ubmVjdCBUaW1lb3V0J30pO1xuICAgICAgICAgICAgfSwgY29ubmVjdFRpbWVvdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9ub3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1dlYlNvY2tldCBvbm9wZW4nLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LmNvbm5lY3RUaW1lcikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2xlYXJUaW1lb3V0KGNvbnRleHQuY29ubmVjdFRpbWVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKF9zYW1lQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgICAgICAgICAgIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICAgICAgICAgICAgICBfY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICAgICAgX3dlYlNvY2tldENvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5vbk9wZW4oY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSB2YWxpZCBjb25uZWN0aW9uIGFscmVhZHksIGNsb3NlIHRoaXMgb25lLlxuICAgICAgICAgICAgICAgIF9jb21ldGQuX3dhcm4oJ0Nsb3NpbmcgZXh0cmEgV2ViU29ja2V0IGNvbm5lY3Rpb24nLCB0aGlzLCAnYWN0aXZlIGNvbm5lY3Rpb24nLCBfY29udGV4dCk7XG4gICAgICAgICAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbChzZWxmLCBjb250ZXh0LCB7Y29kZTogMTAwMCwgcmVhc29uOiAnRXh0cmEgQ29ubmVjdGlvbid9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGlzIGNhbGxiYWNrIGlzIGludm9rZWQgd2hlbiB0aGUgc2VydmVyIHNlbmRzIHRoZSBjbG9zZSBmcmFtZS5cbiAgICAgICAgLy8gVGhlIGNsb3NlIGZyYW1lIGZvciBhIGNvbm5lY3Rpb24gbWF5IGFycml2ZSAqYWZ0ZXIqIGFub3RoZXJcbiAgICAgICAgLy8gY29ubmVjdGlvbiBoYXMgYmVlbiBvcGVuZWQsIHNvIHdlIG11c3QgbWFrZSBzdXJlIHRoYXQgYWN0aW9uc1xuICAgICAgICAvLyBhcmUgcGVyZm9ybWVkIG9ubHkgaWYgaXQncyB0aGUgc2FtZSBjb25uZWN0aW9uLlxuICAgICAgICB2YXIgb25jbG9zZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudCA9IGV2ZW50IHx8IHtjb2RlOiAxMDAwfTtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdXZWJTb2NrZXQgb25jbG9zZScsIGNvbnRleHQsIGV2ZW50LCAnY29ubmVjdGluZycsIF9jb25uZWN0aW5nLCAnY3VycmVudCcsIF9jb250ZXh0KTtcblxuICAgICAgICAgICAgaWYgKGNvbnRleHQuY29ubmVjdFRpbWVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVvdXQoY29udGV4dC5jb25uZWN0VGltZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLm9uQ2xvc2UoY29udGV4dCwgZXZlbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBvbm1lc3NhZ2UgPSBmdW5jdGlvbih3c01lc3NhZ2UpIHtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdXZWJTb2NrZXQgb25tZXNzYWdlJywgd3NNZXNzYWdlLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHNlbGYub25NZXNzYWdlKGNvbnRleHQsIHdzTWVzc2FnZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29udGV4dC53ZWJTb2NrZXQub25vcGVuID0gb25vcGVuO1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbmNsb3NlID0gb25jbG9zZTtcbiAgICAgICAgY29udGV4dC53ZWJTb2NrZXQub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gQ2xpZW50cyBzaG91bGQgY2FsbCBvbmNsb3NlKCksIGJ1dCBpZiB0aGV5IGRvIG5vdCB3ZSBkbyBpdCBoZXJlIGZvciBzYWZldHkuXG4gICAgICAgICAgICBvbmNsb3NlKHtjb2RlOiAxMDAwLCByZWFzb246ICdFcnJvcid9KTtcbiAgICAgICAgfTtcbiAgICAgICAgY29udGV4dC53ZWJTb2NrZXQub25tZXNzYWdlID0gb25tZXNzYWdlO1xuXG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2NvbmZpZ3VyZWQgY2FsbGJhY2tzIG9uJywgY29udGV4dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3dlYlNvY2tldFNlbmQoY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoZW52ZWxvcGUubWVzc2FnZXMpO1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5zZW5kKGpzb24pO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzZW50JywgZW52ZWxvcGUsICdtZXRhQ29ubmVjdCA9JywgbWV0YUNvbm5lY3QpO1xuXG4gICAgICAgIC8vIE1hbmFnZSB0aGUgdGltZW91dCB3YWl0aW5nIGZvciB0aGUgcmVzcG9uc2UuXG4gICAgICAgIHZhciBtYXhEZWxheSA9IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgdmFyIGRlbGF5ID0gbWF4RGVsYXk7XG4gICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgZGVsYXkgKz0gdGhpcy5nZXRBZHZpY2UoKS50aW1lb3V0O1xuICAgICAgICAgICAgX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBtZXNzYWdlSWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGVudmVsb3BlLm1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC50aW1lb3V0c1ttZXNzYWdlLmlkXSA9IHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3RpbWluZyBvdXQgbWVzc2FnZScsIG1lc3NhZ2UuaWQsICdhZnRlcicsIGRlbGF5LCAnb24nLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9mb3JjZUNsb3NlLmNhbGwoc2VsZiwgY29udGV4dCwge2NvZGU6IDEwMDAsIHJlYXNvbjogJ01lc3NhZ2UgVGltZW91dCd9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICd3YWl0aW5nIGF0IG1vc3QnLCBkZWxheSwgJ21zIGZvciBtZXNzYWdlcycsIG1lc3NhZ2VJZHMsICdtYXhOZXR3b3JrRGVsYXknLCBtYXhEZWxheSwgJywgdGltZW91dHM6JywgY29udGV4dC50aW1lb3V0cyk7XG4gICAgfVxuXG4gICAgX3NlbGYuX25vdGlmeVN1Y2Nlc3MgPSBmdW5jdGlvbihmbiwgbWVzc2FnZXMpIHtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCBtZXNzYWdlcyk7XG4gICAgfTtcblxuICAgIF9zZWxmLl9ub3RpZnlGYWlsdXJlID0gZnVuY3Rpb24oZm4sIGNvbnRleHQsIG1lc3NhZ2VzLCBmYWlsdXJlKSB7XG4gICAgICAgIGZuLmNhbGwodGhpcywgY29udGV4dCwgbWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfc2VuZChjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dCA9IF9jb25uZWN0aW5nIHx8IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVudmVsb3Blczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0czoge31cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBfc3RvcmVFbnZlbG9wZS5jYWxsKHRoaXMsIGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICAgICAgX3dlYnNvY2tldENvbm5lY3QuY2FsbCh0aGlzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3N0b3JlRW52ZWxvcGUuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgIF93ZWJTb2NrZXRTZW5kLmNhbGwodGhpcywgY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3QuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbChzZWxmLCBjb250ZXh0LCB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IDEwMDAsXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ0V4Y2VwdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogeFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfc2VsZi5vbk9wZW4gPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgICAgIHZhciBlbnZlbG9wZXMgPSBjb250ZXh0LmVudmVsb3BlcztcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnb3BlbmVkJywgY29udGV4dCwgJ3BlbmRpbmcgbWVzc2FnZXMnLCBlbnZlbG9wZXMpO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZW52ZWxvcGVzKSB7XG4gICAgICAgICAgICBpZiAoZW52ZWxvcGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZWxlbWVudCA9IGVudmVsb3Blc1trZXldO1xuICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFDb25uZWN0ID0gZWxlbWVudFsxXTtcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSB0aGUgc3VjY2VzcyBjYWxsYmFjaywgd2hpY2ggaXMgaW5kZXBlbmRlbnQgZnJvbSB0aGUgZW52ZWxvcGUsXG4gICAgICAgICAgICAgICAgLy8gc28gdGhhdCBpdCBjYW4gYmUgdXNlZCB0byBub3RpZnkgYXJyaXZhbCBvZiBtZXNzYWdlcy5cbiAgICAgICAgICAgICAgICBfc3VjY2Vzc0NhbGxiYWNrID0gZW52ZWxvcGUub25TdWNjZXNzO1xuICAgICAgICAgICAgICAgIF93ZWJTb2NrZXRTZW5kLmNhbGwodGhpcywgY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5vbk1lc3NhZ2UgPSBmdW5jdGlvbihjb250ZXh0LCB3c01lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAncmVjZWl2ZWQgd2Vic29ja2V0IG1lc3NhZ2UnLCB3c01lc3NhZ2UsIGNvbnRleHQpO1xuXG4gICAgICAgIHZhciBjbG9zZSA9IGZhbHNlO1xuICAgICAgICB2YXIgbWVzc2FnZXMgPSB0aGlzLmNvbnZlcnRUb01lc3NhZ2VzKHdzTWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdmFyIG1lc3NhZ2VJZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlc1tpXTtcblxuICAgICAgICAgICAgLy8gRGV0ZWN0IGlmIHRoZSBtZXNzYWdlIGlzIGEgcmVzcG9uc2UgdG8gYSByZXF1ZXN0IHdlIG1hZGUuXG4gICAgICAgICAgICAvLyBJZiBpdCdzIGEgbWV0YSBtZXNzYWdlLCBmb3Igc3VyZSBpdCdzIGEgcmVzcG9uc2U7IG90aGVyd2lzZSBpdCdzXG4gICAgICAgICAgICAvLyBhIHB1Ymxpc2ggbWVzc2FnZSBhbmQgcHVibGlzaCByZXNwb25zZXMgZG9uJ3QgaGF2ZSB0aGUgZGF0YSBmaWVsZC5cbiAgICAgICAgICAgIGlmICgvXlxcL21ldGFcXC8vLnRlc3QobWVzc2FnZS5jaGFubmVsKSB8fCBtZXNzYWdlLmRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmlkKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGltZW91dCA9IGNvbnRleHQudGltZW91dHNbbWVzc2FnZS5pZF07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb250ZXh0LnRpbWVvdXRzW21lc3NhZ2UuaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAncmVtb3ZlZCB0aW1lb3V0IGZvciBtZXNzYWdlJywgbWVzc2FnZS5pZCwgJywgdGltZW91dHMnLCBjb250ZXh0LnRpbWVvdXRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCcvbWV0YS9jb25uZWN0JyA9PT0gbWVzc2FnZS5jaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCcvbWV0YS9kaXNjb25uZWN0JyA9PT0gbWVzc2FnZS5jaGFubmVsICYmICFfY29ubmVjdGVkKSB7XG4gICAgICAgICAgICAgICAgY2xvc2UgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBlbnZlbG9wZSBjb3JyZXNwb25kaW5nIHRvIHRoZSBtZXNzYWdlcy5cbiAgICAgICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVudmVsb3BlcyA9IGNvbnRleHQuZW52ZWxvcGVzO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG1lc3NhZ2VJZHMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBpZCA9IG1lc3NhZ2VJZHNbal07XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZW52ZWxvcGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudmVsb3Blcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZHMgPSBrZXkuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gVXRpbHMuaW5BcnJheShpZCwgaWRzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW52ZWxvcGUgPSBlbnZlbG9wZXNba2V5XVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXRhQ29ubmVjdCA9IGVudmVsb3Blc1trZXldWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGVudmVsb3Blc1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW52ZWxvcGVzW2lkcy5qb2luKCcsJyldID0gW2VudmVsb3BlLCBtZXRhQ29ubmVjdF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAncmVtb3ZlZCBlbnZlbG9wZSwgZW52ZWxvcGVzJywgZW52ZWxvcGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX25vdGlmeVN1Y2Nlc3MoX3N1Y2Nlc3NDYWxsYmFjaywgbWVzc2FnZXMpO1xuXG4gICAgICAgIGlmIChjbG9zZSkge1xuICAgICAgICAgICAgdGhpcy53ZWJTb2NrZXRDbG9zZShjb250ZXh0LCAxMDAwLCAnRGlzY29ubmVjdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLm9uQ2xvc2UgPSBmdW5jdGlvbihjb250ZXh0LCBldmVudCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdjbG9zZWQnLCBjb250ZXh0LCBldmVudCk7XG5cbiAgICAgICAgaWYgKF9zYW1lQ29udGV4dChjb250ZXh0KSkge1xuICAgICAgICAgICAgLy8gUmVtZW1iZXIgaWYgd2Ugd2VyZSBhYmxlIHRvIGNvbm5lY3QuXG4gICAgICAgICAgICAvLyBUaGlzIGNsb3NlIGV2ZW50IGNvdWxkIGJlIGR1ZSB0byBzZXJ2ZXIgc2h1dGRvd24sXG4gICAgICAgICAgICAvLyBhbmQgaWYgaXQgcmVzdGFydHMgd2Ugd2FudCB0byB0cnkgd2Vic29ja2V0IGFnYWluLlxuICAgICAgICAgICAgX3dlYlNvY2tldFN1cHBvcnRlZCA9IF9zdGlja3lSZWNvbm5lY3QgJiYgX3dlYlNvY2tldENvbm5lY3RlZDtcbiAgICAgICAgICAgIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICAgICAgICAgIF9jb250ZXh0ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0aW1lb3V0cyA9IGNvbnRleHQudGltZW91dHM7XG4gICAgICAgIGNvbnRleHQudGltZW91dHMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gdGltZW91dHMpIHtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0cy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyVGltZW91dCh0aW1lb3V0c1tpZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVudmVsb3BlcyA9IGNvbnRleHQuZW52ZWxvcGVzO1xuICAgICAgICBjb250ZXh0LmVudmVsb3BlcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZW52ZWxvcGVzKSB7XG4gICAgICAgICAgICBpZiAoZW52ZWxvcGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZW52ZWxvcGUgPSBlbnZlbG9wZXNba2V5XVswXTtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YUNvbm5lY3QgPSBlbnZlbG9wZXNba2V5XVsxXTtcbiAgICAgICAgICAgICAgICBpZiAobWV0YUNvbm5lY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgd2Vic29ja2V0Q29kZTogZXZlbnQuY29kZSxcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBldmVudC5yZWFzb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5leGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZS5leGNlcHRpb24gPSBldmVudC5leGNlcHRpb247XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX25vdGlmeUZhaWx1cmUoZW52ZWxvcGUub25GYWlsdXJlLCBjb250ZXh0LCBlbnZlbG9wZS5tZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYucmVnaXN0ZXJlZCA9IGZ1bmN0aW9uKHR5cGUsIGNvbWV0ZCkge1xuICAgICAgICBfc3VwZXIucmVnaXN0ZXJlZCh0eXBlLCBjb21ldGQpO1xuICAgICAgICBfY29tZXRkID0gY29tZXRkO1xuICAgIH07XG5cbiAgICBfc2VsZi5hY2NlcHQgPSBmdW5jdGlvbih2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2FjY2VwdCwgc3VwcG9ydGVkOicsIF93ZWJTb2NrZXRTdXBwb3J0ZWQpO1xuICAgICAgICAvLyBVc2luZyAhISB0byByZXR1cm4gYSBib29sZWFuIChhbmQgbm90IHRoZSBXZWJTb2NrZXQgb2JqZWN0KS5cbiAgICAgICAgcmV0dXJuIF93ZWJTb2NrZXRTdXBwb3J0ZWQgJiYgISgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIFdlYlNvY2tldCkgJiYgX2NvbWV0ZC53ZWJzb2NrZXRFbmFibGVkICE9PSBmYWxzZTtcbiAgICB9O1xuXG4gICAgX3NlbGYuc2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzZW5kaW5nJywgZW52ZWxvcGUsICdtZXRhQ29ubmVjdCA9JywgbWV0YUNvbm5lY3QpO1xuICAgICAgICBfc2VuZC5jYWxsKHRoaXMsIF9jb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgIH07XG5cbiAgICBfc2VsZi53ZWJTb2NrZXRDbG9zZSA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvZGUsIHJlYXNvbikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQud2ViU29ja2V0KSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC53ZWJTb2NrZXQuY2xvc2UoY29kZSwgcmVhc29uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoeCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3N1cGVyLmFib3J0KCk7XG4gICAgICAgIF9mb3JjZUNsb3NlLmNhbGwodGhpcywgX2NvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdBYm9ydCd9KTtcbiAgICAgICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF9zZWxmO1xufTtcbiIsImltcG9ydCB7IENvbWV0RCwgV2ViU29ja2V0VHJhbnNwb3J0IH0gZnJvbSAnemV0YXB1c2gtY29tZXRkJ1xuaW1wb3J0IHsgRmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydCB9IGZyb20gJy4vY29tZXRkJ1xuaW1wb3J0IHsgZ2V0U2VydmVycywgc2h1ZmZsZSB9IGZyb20gJy4vdXRpbHMnXG5pbXBvcnQgeyBDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIgfSBmcm9tICcuL2Nvbm5lY3Rpb24tc3RhdHVzJ1xuXG4vKipcbiAqIEBkZXNjIENvbWV0RCBNZXNzYWdlcyBlbnVtZXJhdGlvblxuICovXG5jb25zdCBNZXNzYWdlID0ge1xuICBSRUNPTk5FQ1RfSEFORFNIQUtFX1ZBTFVFOiAnaGFuZHNoYWtlJyxcbiAgUkVDT05ORUNUX05PTkVfVkFMVUU6ICdub25lJyxcbiAgUkVDT05ORUNUX1JFVFJZX1ZBTFVFOiAncmV0cnknXG59XG5cbi8qKlxuICogQGRlc2MgQ29tZXREIFRyYW5zcG9ydHMgZW51bWVyYXRpb25cbiAqL1xuY29uc3QgVHJhbnNwb3J0ID0ge1xuICBMT05HX1BPTExJTkc6ICdsb25nLXBvbGxpbmcnLFxuICBXRUJTT0NLRVQ6ICd3ZWJzb2NrZXQnXG59XG5cbi8qKlxuICogQGRlc2MgUHJvdmlkZSB1dGlsaXRpZXMgYW5kIGFic3RyYWN0aW9uIG9uIENvbWV0RCBUcmFuc3BvcnQgbGF5ZXJcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgY2xhc3MgQ2xpZW50SGVscGVyIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGFwaVVybCwgYnVzaW5lc3NJZCwgaGFuZHNoYWtlU3RyYXRlZ3ksIHJlc291cmNlIH0pIHtcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuYnVzaW5lc3NJZCA9IGJ1c2luZXNzSWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb24oKTpBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9XG4gICAgICovXG4gICAgdGhpcy5oYW5kc2hha2VTdHJhdGVneSA9IGhhbmRzaGFrZVN0cmF0ZWd5XG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnJlc291cmNlID0gcmVzb3VyY2VcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZlcnMgPSBnZXRTZXJ2ZXJzKGAke2FwaVVybH0ke2J1c2luZXNzSWR9YClcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7QXJyYXk8T2JqZWN0Pn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMgPSBbXVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLndhc0Nvbm5lY3RlZCA9IGZhbHNlXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZlclVybCA9IG51bGxcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7QXJyYXk8T2JqZWN0Pn1cbiAgICAgKi9cbiAgICB0aGlzLnN1YnNjcmliZVF1ZXVlID0gW11cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Q29tZXREfVxuICAgICAqL1xuICAgIHRoaXMuY29tZXRkID0gbmV3IENvbWV0RCgpXG4gICAgdGhpcy5jb21ldGQucmVnaXN0ZXJUcmFuc3BvcnQoVHJhbnNwb3J0LldFQlNPQ0tFVCwgbmV3IFdlYlNvY2tldFRyYW5zcG9ydCgpKVxuICAgIHRoaXMuY29tZXRkLnJlZ2lzdGVyVHJhbnNwb3J0KFRyYW5zcG9ydC5MT05HX1BPTExJTkcsIG5ldyBGZXRjaExvbmdQb2xsaW5nVHJhbnNwb3J0KCkpXG4gICAgdGhpcy5jb21ldGQub25UcmFuc3BvcnRFeGNlcHRpb24gPSAoY29tZXRkLCB0cmFuc3BvcnQpID0+IHtcbiAgICAgIGlmIChUcmFuc3BvcnQuTE9OR19QT0xMSU5HID09PSB0cmFuc3BvcnQpIHtcbiAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYW4gb3RoZXIgYXZhaWxhYmxlIHNlcnZlclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGN1cnJlbnQgb25lIGZyb20gdGhlIF9zZXJ2ZXJMaXN0IGFycmF5XG4gICAgICAgIHRoaXMudXBkYXRlU2VydmVyVXJsKClcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jb21ldGQuYWRkTGlzdGVuZXIoJy9tZXRhL2hhbmRzaGFrZScsICh7IGV4dCwgc3VjY2Vzc2Z1bCwgYWR2aWNlLCBlcnJvciB9KSA9PiB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Oi9tZXRhL2hhbmRzaGFrZScsIHsgZXh0LCBzdWNjZXNzZnVsLCBhZHZpY2UsIGVycm9yIH0pXG4gICAgICBpZiAoc3VjY2Vzc2Z1bCkge1xuICAgICAgICBjb25zdCB7IGF1dGhlbnRpY2F0aW9uID0gbnVsbCB9ID0gZXh0XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQoYXV0aGVudGljYXRpb24pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gdGhpcy5oYW5kc2hha2VGYWlsdXJlKGVycm9yKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLmNvbWV0ZC5hZGRMaXN0ZW5lcignL21ldGEvaGFuZHNoYWtlJywgKHsgYWR2aWNlLCBlcnJvciwgZXh0LCBzdWNjZXNzZnVsIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6L21ldGEvaGFuZHNoYWtlJywgeyBleHQsIHN1Y2Nlc3NmdWwsIGFkdmljZSwgZXJyb3IgfSlcbiAgICAgIC8vIEF1dGhOZWdvdGlhdGlvblxuICAgICAgaWYgKCFzdWNjZXNzZnVsKSB7XG4gICAgICAgIGlmIChhZHZpY2UgPT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfTk9ORV9WQUxVRSA9PT0gYWR2aWNlLnJlY29ubmVjdCkge1xuICAgICAgICAgIHRoaXMuYXV0aGVudGljYXRpb25GYWlsZWQoZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfSEFORFNIQUtFX1ZBTFVFID09PSBhZHZpY2UucmVjb25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5uZWdvdGlhdGUoZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9jb25uZWN0JywgKHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6L21ldGEvY29ubmVjdCcsIHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pXG4gICAgICAvLyBDb25uZWN0aW9uTGlzdGVuZXJcbiAgICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbkNsb3NlZCgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLndhc0Nvbm5lY3RlZCA9IHRoaXMuY29ubmVjdGVkXG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gc3VjY2Vzc2Z1bFxuICAgICAgICBpZiAoIXRoaXMud2FzQ29ubmVjdGVkICYmIHRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgdGhpcy5jb21ldGQuYmF0Y2godGhpcywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gVW5xdWV1ZSBzdWJzY3JpcHRpb25zXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZVF1ZXVlLmZvckVhY2goKHsgcHJlZml4LCBzZXJ2aWNlTGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgfSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnN1YnNjcmliZShwcmVmaXgsIHNlcnZpY2VMaXN0ZW5lciwgc3Vic2NyaXB0aW9ucylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZVF1ZXVlID0gW11cbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vIE5vdGlmeSBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uRXN0YWJsaXNoZWQoKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMud2FzQ29ubmVjdGVkICYmICF0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgICAgIC8vIE5vdGlmeSBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgICAgICAgIHRoaXMuY29ubmVjdGlvbkJyb2tlbigpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBDb25uZWN0IGNsaWVudCB1c2luZyBDb21ldEQgVHJhbnNwb3J0XG4gICAqL1xuICBjb25uZWN0KCkge1xuICAgIHRoaXMuc2VydmVycy50aGVuKChzZXJ2ZXJzKSA9PiB7XG4gICAgICB0aGlzLnNlcnZlclVybCA9IHNodWZmbGUoc2VydmVycylcblxuICAgICAgdGhpcy5jb21ldGQuY29uZmlndXJlKHtcbiAgICAgICAgdXJsOiBgJHt0aGlzLnNlcnZlclVybH0vc3RyZGAsXG4gICAgICAgIGJhY2tvZmZJbmNyZW1lbnQ6IDEwMDAsXG4gICAgICAgIG1heEJhY2tvZmY6IDYwMDAwLFxuICAgICAgICBhcHBlbmRNZXNzYWdlVHlwZVRvVVJMOiBmYWxzZVxuICAgICAgfSlcblxuICAgICAgdGhpcy5jb21ldGQuaGFuZHNoYWtlKHRoaXMuZ2V0SGFuZHNoYWtlRmllbGRzKCkpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQGRlc2MgTm90aWZ5IGxpc3RlbmVycyB3aGVuIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICovXG4gIGNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uQ29ubmVjdGlvbkVzdGFibGlzaGVkKClcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBicm9rZW5cbiAgICovXG4gIGNvbm5lY3Rpb25Ccm9rZW4oKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lci5vbkNvbm5lY3Rpb25Ccm9rZW4oKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBhIG1lc3NhZ2UgaXMgbG9zdFxuICAgKi9cbiAgbWVzc2FnZUxvc3QoY2hhbm5lbCwgZGF0YSkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25NZXNzYWdlTG9zdChjaGFubmVsLCBkYXRhKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBjb25uZWN0aW9uIGlzIGNsb3NlZFxuICAgKi9cbiAgY29ubmVjdGlvbkNsb3NlZCgpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uQ29ubmVjdGlvbkNsb3NlZCgpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQGRlc2MgTm90aWZ5IGxpc3RlbmVycyB3aGVuIGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICovXG4gIGluaXRpYWxpemVkKGF1dGhlbnRpY2F0aW9uKSB7XG4gICAgaWYgKGF1dGhlbnRpY2F0aW9uKSB7XG4gICAgICB0aGlzLnVzZXJJZCA9IGF1dGhlbnRpY2F0aW9uLnVzZXJJZFxuICAgIH1cbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uU3VjY2Vzc2Z1bEhhbmRzaGFrZShhdXRoZW50aWNhdGlvbilcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gaGFuZHNoYWtlIHN0ZXAgc3VjY2VlZFxuICAgKi9cbiAgYXV0aGVudGljYXRpb25GYWlsZWQoZXJyb3IpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uRmFpbGVkSGFuZHNoYWtlKGVycm9yKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqXG4gICAqL1xuICBoYW5kc2hha2VGYWlsdXJlKCkge1xuXG4gIH1cbiAgLyoqXG4gICogQGRlc2MgUmVtb3ZlIGN1cnJlbnQgc2VydmVyIHVybCBmcm9tIHRoZSBzZXJ2ZXIgbGlzdCBhbmQgc2h1ZmZsZSBmb3IgYW5vdGhlciBvbmVcbiAgKi9cbiAgdXBkYXRlU2VydmVyVXJsKCkge1xuICAgIHRoaXMuc2VydmVycy50aGVuKChzZXJ2ZXJzKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHNlcnZlcnMuaW5kZXhPZih0aGlzLnNlcnZlclVybClcbiAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgIHNlcnZlcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgfVxuICAgICAgaWYgKHNlcnZlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIE5vIG1vcmUgc2VydmVyIGF2YWlsYWJsZVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuc2VydmVyVXJsID0gc2h1ZmZsZShzZXJ2ZXJzKVxuICAgICAgICB0aGlzLmNvbWV0ZC5jb25maWd1cmUoe1xuICAgICAgICAgIHVybDogYCR7dGhpcy5zZXJ2ZXJVcmx9L3N0cmRgXG4gICAgICAgIH0pXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY29tZXRkLmhhbmRzaGFrZSh0aGlzLmdldEhhbmRzaGFrZUZpZWxkcygpKVxuICAgICAgICB9LCAyNTApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICAvKipcbiAgICpcbiAgICovXG4gIG5lZ290aWF0ZShleHQpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Om5lZ290aWF0ZScsIGV4dClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgRGlzY29ubmVjdCBDb21ldEQgY2xpZW50XG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY29tZXRkLmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgQ29tZXREIGhhbmRzaGFrZSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcygpIHtcbiAgICBjb25zdCBoYW5kc2hha2UgPSB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5KClcbiAgICByZXR1cm4gaGFuZHNoYWtlLmdldEhhbmRzaGFrZUZpZWxkcyh0aGlzKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBTZXQgYSBuZXcgaGFuZHNoYWtlIGZhY3RvcnkgbWV0aG9kc1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfSBoYW5kc2hha2VTdHJhdGVneVxuICAgKi9cbiAgc2V0SGFuZHNoYWtlU3RyYXRlZ3koaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5ID0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgfVxuICAvKipcbiAgICogQGRlc2MgR2V0IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVzaW5lc3NJZFxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgdGhyb3cgTm90WWV0SW1wbGVtZW50ZWRFcnJvcigpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBTdWJyaWJlIGFsbCBtZXRob2RzIGRlZmluZWQgaW4gdGhlIHNlcnZpY2VMaXN0ZW5lciBmb3IgdGhlIGdpdmVuIHByZWZpeGVkIGNoYW5uZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCAtIENoYW5uZWwgcHJlZml4XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzZXJ2aWNlTGlzdGVuZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IHN1YnNjcmlwdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqL1xuICBzdWJzY3JpYmUocHJlZml4LCBzZXJ2aWNlTGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgPSB7fSkge1xuICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnN1YnNjcmliZVF1ZXVlLnB1c2goeyBwcmVmaXgsIHNlcnZpY2VMaXN0ZW5lciwgc3Vic2NyaXB0aW9ucyB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IG1ldGhvZCBpbiBzZXJ2aWNlTGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHNlcnZpY2VMaXN0ZW5lci5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgICAgY29uc3QgY2hhbm5lbCA9IGAke3ByZWZpeH0vJHttZXRob2R9YFxuICAgICAgICAgIHN1YnNjcmlwdGlvbnNbbWV0aG9kXSA9IHRoaXMuY29tZXRkLnN1YnNjcmliZShjaGFubmVsLCBzZXJ2aWNlTGlzdGVuZXJbbWV0aG9kXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3Vic2NyaXB0aW9uc1xuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgYSBwdWJsaXNoZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCAtIENoYW5uZWwgcHJlZml4XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwdWJsaXNoZXJEZWZpbml0aW9uXG4gICAqIEByZXR1cm4ge09iamVjdH0gc2VydmljZVB1Ymxpc2hlclxuICAgKi9cbiAgY3JlYXRlU2VydmljZVB1Ymxpc2hlcihwcmVmaXgsIHB1Ymxpc2hlckRlZmluaXRpb24pIHtcbiAgICBjb25zdCBzZXJ2aWNlUHVibGlzaGVyID0ge31cbiAgICBmb3IgKGNvbnN0IG1ldGhvZCBpbiBwdWJsaXNoZXJEZWZpbml0aW9uKSB7XG4gICAgICBpZiAocHVibGlzaGVyRGVmaW5pdGlvbi5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIGNvbnN0IGNoYW5uZWwgPSBgJHtwcmVmaXh9LyR7bWV0aG9kfWBcbiAgICAgICAgc2VydmljZVB1Ymxpc2hlclttZXRob2RdID0gKHBhcmFtZXRlcnMgPSB7fSkgPT4ge1xuICAgICAgICAgIHRoaXMuY29tZXRkLnB1Ymxpc2goY2hhbm5lbCwgcGFyYW1ldGVycylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VydmljZVB1Ymxpc2hlclxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBVbnN1YmNyaWJlIGFsbCBzdWJzY3JpcHRpb25zIGRlZmluZWQgaW4gZ2l2ZW4gc3Vic2NyaXB0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IHN1YnNjcmlwdGlvbnNcbiAgICovXG4gIHVuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IG1ldGhvZCBpbiBzdWJzY3JpcHRpb25zKSB7XG4gICAgICBpZiAoc3Vic2NyaXB0aW9ucy5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgIHRoaXMuY29tZXRkLnVuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbnNbbWV0aG9kXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEFkZCBhIGNvbm5lY3Rpb24gbGlzdGVuZXIgdG8gaGFuZGxlIGxpZmUgY3ljbGUgY29ubmVjdGlvbiBldmVudHNcbiAgICogQHBhcmFtIHtDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXJ9IGxpc3RlbmVyXG4gICAqL1xuICBhZGRDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICBjb25zdCBjb25uZWN0aW9uTGlzdGVuZXIgPSBPYmplY3QuYXNzaWduKG5ldyBDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIoKSwgbGlzdGVuZXIpXG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzLnB1c2goY29ubmVjdGlvbkxpc3RlbmVyKVxuICB9XG5cbn1cbiIsImltcG9ydCB7IENsaWVudEhlbHBlciB9IGZyb20gJy4vY2xpZW50LWhlbHBlcidcblxuaW1wb3J0IHsgTm90WWV0SW1wbGVtZW50ZWRFcnJvciB9IGZyb20gJy4vdXRpbHMnXG5cbi8qKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBkZXNjIERlZmF1bHQgWmV0YVB1c2ggQVBJIFVSTFxuICovXG5leHBvcnQgY29uc3QgQVBJX1VSTCA9ICdodHRwczovL2FwaS56cHVzaC5pby8nXG5cbi8qKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBkZXNjIFpldGFQdXNoIENsaWVudCB0byBjb25uZWN0XG4gKiBAZXhhbXBsZVxuICogY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gKiAgIGJ1c2luZXNzSWQ6ICc8WU9VUi1CVVNJTkVTUy1JRD4nLFxuICogICBoYW5kc2hha2VTdHJhdGVneSgpIHtcbiAqICAgICByZXR1cm4gQXV0aGVudEZhY3RvcnkuY3JlYXRlV2Vha0hhbmRzaGFrZSh7XG4gKiAgICAgICB0b2tlbjogbnVsbCxcbiAqICAgICAgIGRlcGxveW1lbnRJZDogJzxZT1VSLURFUExPWU1FTlQtSUQ+J1xuICAqICAgIH0pXG4gKiAgIH1cbiAqIH0pXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnQge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXBpVXJsID0gQVBJX1VSTCwgYnVzaW5lc3NJZCwgaGFuZHNoYWtlU3RyYXRlZ3ksIHJlc291cmNlID0gbnVsbCB9KSB7XG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0NsaWVudEhlbHBlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWVudCA9IG5ldyBDbGllbnRIZWxwZXIoe1xuICAgICAgYXBpVXJsLFxuICAgICAgYnVzaW5lc3NJZCxcbiAgICAgIGhhbmRzaGFrZVN0cmF0ZWd5LFxuICAgICAgcmVzb3VyY2VcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBDb25uZWN0IGNsaWVudCB0byBaZXRhUHVzaFxuICAgKi9cbiAgY29ubmVjdCgpIHtcbiAgICB0aGlzLmNsaWVudC5jb25uZWN0KClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgRGlzb25uZWN0IGNsaWVudCBmcm9tIFpldGFQdXNoXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY2xpZW50LmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBDcmVhdGUgYSBzZXJ2aWNlIHB1Ymxpc2hlciBiYXNlZCBvbiBwdWJsaXNoZXIgZGVmaW5pdGlvbiBmb3IgdGhlIGdpdmVuIGRlcGxveW1lbnQgaWRcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBjcmVhdGVTZXJ2aWNlUHVibGlzaGVyKHsgZGVwbG95bWVudElkLCBwdWJsaXNoZXJEZWZpbml0aW9uIH0pIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuY3JlYXRlU2VydmljZVB1Ymxpc2hlcihgL3NlcnZpY2UvJHt0aGlzLmdldEJ1c2luZXNzSWQoKX0vJHtkZXBsb3ltZW50SWR9YCwgcHVibGlzaGVyRGVmaW5pdGlvbilcbiAgfVxuICAvKipcbiAgICogQGRlc2MgR2V0IHRoZSBjbGllbnQgYnVzaW5lc3MgaWRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0QnVzaW5lc3NJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuZ2V0QnVzaW5lc3NJZCgpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCB0aGUgY2xpZW50IHJlc291cmNlXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFJlc291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5nZXRSZXNvdXJjZSgpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEdldCB0aGUgY2xpZW50IHVzZXIgaWRcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0VXNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5nZXRVc2VySWQoKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgdGhlIGNsaWVudCBzZXNzaW9uIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFNlc3Npb25JZCgpIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuZ2V0U2Vzc2lvbklkKClcbiAgfVxuICAvKipcbiAgICogQGRlc2MgU3Vic2NyaWJlIGFsbCBtZXRob2RzIGRlc2NyaWJlZCBpbiB0aGUgc2VydmljZUxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZGVwbG95bWVudElkXG4gICAqIEByZXR1cm4ge09iamVjdH0gc3Vic2NyaXB0aW9uXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IHN0YWNrU2VydmljZUxpc3RlbmVyID0ge1xuICAgKiAgIGxpc3QoKSB7fSxcbiAgICogICBwdXNoKCkge30sXG4gICAqICAgdXBkYXRlKCkge31cbiAgICogfVxuICAgKiBjbGllbnQuc3Vic2NyaWJlTGlzdGVuZXIoe1xuICAgKiAgIGRlcGxveW1lbnRJZDogJzxZT1VSLVNUQUNLLURFUExPWU1FTlQtSUQ+JyxcbiAgICogICBzZXJ2aWNlTGlzdGVuZXJcbiAgICogfSlcbiAgICovXG4gIHN1YnNjcmliZUxpc3RlbmVyKHsgZGVwbG95bWVudElkLCBzZXJ2aWNlTGlzdGVuZXIgfSkge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5zdWJzY3JpYmUoYC9zZXJ2aWNlLyR7dGhpcy5nZXRCdXNpbmVzc0lkKCl9LyR7ZGVwbG95bWVudElkfWAsIHNlcnZpY2VMaXN0ZW5lcilcbiAgfVxuICAvKipcbiAgKiBAZGVzYyBDcmVhdGUgYSBwdWJsaXNoL3N1YnNjcmliZVxuICAqIEBleHBlcmltZW50YWxcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBjcmVhdGVQdWJTdWIoeyBkZXBsb3ltZW50SWQsIHNlcnZpY2VMaXN0ZW5lciwgcHVibGlzaGVyIH0pIHtcbiAgICB0aHJvdyBuZXcgTm90WWV0SW1wbGVtZW50ZWRFcnJvcignY3JlYXRlUHViU3ViJylcbiAgfVxuICAvKipcbiAgICogQGRlc2MgU2V0IG5ldyBjbGllbnQgcmVzb3VyY2UgdmFsdWVcbiAgICovXG4gIHNldFJlc291cmNlKHJlc291cmNlKSB7XG4gICAgdGhpcy5jbGllbnQuc2V0UmVzb3VyY2UocmVzb3VyY2UpXG4gIH1cbiAgLyoqXG4gICAqIEBkZXNjIEFkZCBhIGNvbm5lY3Rpb24gbGlzdGVuZXIgdG8gaGFuZGxlIGxpZmUgY3ljbGUgY29ubmVjdGlvbiBldmVudHNcbiAgICogQHBhcmFtIHtDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXJ9IGxpc3RlbmVyXG4gICAqL1xuICBhZGRDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKVxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBGb3JjZSBkaXNjb25uZWN0L2Nvbm5lY3Qgd2l0aCBuZXcgaGFuZHNoYWtlIGZhY3RvcnlcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOkFic3RyYWN0SGFuZHNoYWtlTWFuYWdlcn0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgICovXG4gIGhhbmRzaGFrZShoYW5kc2hha2VTdHJhdGVneSkge1xuICAgIHRoaXMuZGlzY29ubmVjdCgpXG4gICAgaWYgKGhhbmRzaGFrZVN0cmF0ZWd5KSB7XG4gICAgICB0aGlzLmNsaWVudC5zZXRIYW5kc2hha2VTdHJhdGVneShoYW5kc2hha2VTdHJhdGVneSlcbiAgICB9XG4gICAgdGhpcy5jb25uZWN0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgYSBzZXJ2aWNlIGxpc3RlciBmcm9tIG1ldGhvZHMgbGlzdCB3aXRoIGEgZGVmYXVsdCBoYW5kbGVyXG4gICAqIEByZXR1cm4ge09iamVjdH0gbGlzdGVuZXJcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgZ2V0U3RhY2tTZXJ2aWNlTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAqICAgcmV0dXJuIENsaWVudC5nZXRTZXJ2aWNlTGlzdGVuZXIoe1xuICAgKiAgICAgbWV0aG9kczogWydnZXRMaXN0ZW5lcnMnLCAnbGlzdCcsICdwdXJnZScsICdwdXNoJywgJ3JlbW92ZScsICdzZXRMaXN0ZW5lcnMnLCAndXBkYXRlJywgJ2Vycm9yJ10sXG4gICAqICAgICBoYW5kbGVyOiAoeyBjaGFubmVsLCBkYXRhIH0pID0+IHtcbiAgICogICAgICAgY29uc29sZS5kZWJ1ZyhgU3RhY2s6OiR7bWV0aG9kfWAsIHsgY2hhbm5lbCwgZGF0YSB9KVxuICAgKiAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBmb3JtW25hbWU9XCIke21ldGhvZH1cIl0gW25hbWU9XCJvdXRwdXRcIl1gKS52YWx1ZSA9IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAqICAgICB9XG4gICAqICAgfSlcbiAgICogfVxuICAgKi9cbiAgc3RhdGljIGdldFNlcnZpY2VMaXN0ZW5lcih7IG1ldGhvZHMgPSBbXSwgaGFuZGxlciA9ICgpID0+IHt9IH0pIHtcbiAgICByZXR1cm4gbWV0aG9kcy5yZWR1Y2UoKGxpc3RlbmVyLCBtZXRob2QpID0+IHtcbiAgICAgIGxpc3RlbmVyW21ldGhvZF0gPSAoeyBjaGFubmVsLCBkYXRhIH0pID0+IGhhbmRsZXIoeyBjaGFubmVsLCBkYXRhLCBtZXRob2QgfSlcbiAgICAgIHJldHVybiBsaXN0ZW5lclxuICAgIH0sIHt9KVxuICB9XG5cbn1cbiIsImltcG9ydCB7IFRyYW5zcG9ydCwgTG9uZ1BvbGxpbmdUcmFuc3BvcnQgfSBmcm9tICd6ZXRhcHVzaC1jb21ldGQnXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAZGVzYyBJbXBsZW1lbnRzIExvbmdQb2xsaW5nVHJhbnNwb3J0IHVzaW5nIGJvcndzZXIgZmV0Y2goKSBBUElcbiAqIEByZXR1cm4ge0ZldGNoTG9uZ1BvbGxpbmdUcmFuc3BvcnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGZXRjaExvbmdQb2xsaW5nVHJhbnNwb3J0KCkge1xuICB2YXIgX3N1cGVyID0gbmV3IExvbmdQb2xsaW5nVHJhbnNwb3J0KClcbiAgdmFyIHRoYXQgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcilcblxuICAvKipcbiAgICogQGRlc2MgSW1wbGVtZW50cyB0cmFuc3BvcnQgdmlhIGZldGNoKCkgQVBJXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAgICovXG4gIHRoYXQueGhyU2VuZCA9IGZ1bmN0aW9uKHBhY2tldCkge1xuICAgIGZldGNoKHBhY2tldC51cmwsIHtcbiAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgYm9keTogcGFja2V0LmJvZHksXG4gICAgICBoZWFkZXJzOiBPYmplY3QuYXNzaWduKHBhY2tldC5oZWFkZXJzLCB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbjtjaGFyc2V0PVVURi04J1xuICAgICAgfSlcbiAgICB9KVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuICAgIH0pXG4gICAgLnRoZW4ocGFja2V0Lm9uU3VjY2VzcylcbiAgICAuY2F0Y2gocGFja2V0Lm9uRXJyb3IpXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuIiwiLyoqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQGRlc2MgRGVmaW5lIGxpZmUgY3ljbGUgY29ubmVjdGlvbiBtZXRob2RzIFxuICovXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyIHtcbiAgLyoqXG4gICAqIEBkZXNjIENhbGxiYWNrIGZpcmVkIHdoZW4gY29ubmVjdGlvbiBpcyBicm9rZW5cbiAgICovXG4gIG9uQ29ubmVjdGlvbkJyb2tlbigpIHt9XG4gIC8qKlxuICAgKiBAZGVzYyBDYWxsYmFjayBmaXJlZCB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBvbkNvbm5lY3Rpb25DbG9zZWQoKSB7fVxuICAvKipcbiAgICogQGRlc2MgQ2FsbGJhY2sgZmlyZWQgd2hlbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgb25Db25uZWN0aW9uRXN0YWJsaXNoZWQoKSB7fVxuICAvKipcbiAgICogQGRlc2MgQ2FsbGJhY2sgZmlyZWQgd2hlbiBhbiBlcnJvciBvY2N1cnMgaW4gaGFuZHNoYWtlIHN0ZXBcbiAgICogQHBhcmFtIHtPYmplY3R9IGVycm9yXG4gICAqL1xuICBvbkZhaWxlZEhhbmRzaGFrZShlcnJvcikge31cbiAgLyoqXG4gICAqIEBkZXNjIENhbGxiYWNrIGZpcmVkIHdoZW4gYSBtZXNzYWdlIGlzIGxvc3RcbiAgICovXG4gIG9uTWVzc2FnZUxvc3QoKSB7fVxuICAvKipcbiAgICogQGRlc2MgQ2FsbGJhY2sgZmlyZWQgd2hlbiBoYW5kc2hha2Ugc3RlcCBzdWNjZWVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhdXRoZW50aWNhdGlvblxuICAgKi9cbiAgb25TdWNjZXNzZnVsSGFuZHNoYWtlKGF1dGhlbnRpY2F0aW9uKSB7fVxufVxuIiwiLyoqXG4gKiBaZXRhUHVzaCBkZXBsb3lhYmxlcyBuYW1lc1xuICovXG5jb25zdCBEZXBsb3lhYmxlTmFtZXMgPSB7XG4gIEFVVEhfU0lNUExFOiAnc2ltcGxlJyxcbiAgQVVUSF9XRUFLOiAnd2VhaycsXG4gIEFVVEhfREVMRUdBVElORzogJ2RlbGVnYXRpbmcnXG59XG5cbi8qKlxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0SGFuZHNoYWtlTWFuYWdlciB7XG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoeyBhdXRoVHlwZSwgYnVzaW5lc3NJZCwgZGVwbG95bWVudElkIH0pIHtcbiAgICB0aGlzLmF1dGhUeXBlID0gYXV0aFR5cGVcbiAgICB0aGlzLmJ1c2luZXNzSWQgPSBidXNpbmVzc0lkXG4gICAgdGhpcy5kZXBsb3ltZW50SWQgPSBkZXBsb3ltZW50SWRcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtDbGllbnRIZWxwZXJ9IGNsaWVudFxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBnZXRIYW5kc2hha2VGaWVsZHMoY2xpZW50KSB7XG4gICAgY29uc3QgYXV0aGVudGljYXRpb24gPSB7XG4gICAgICBkYXRhOiB0aGlzLmF1dGhEYXRhLFxuICAgICAgdHlwZTogYCR7Y2xpZW50LmdldEJ1c2luZXNzSWQoKX0uJHt0aGlzLmRlcGxveW1lbnRJZH0uJHt0aGlzLmF1dGhUeXBlfWAsXG4gICAgICB2ZXJzaW9uOiB0aGlzLmF1dGhWZXJzaW9uXG4gICAgfVxuICAgIGlmIChjbGllbnQuZ2V0UmVzb3VyY2UoKSkge1xuICAgICAgYXV0aGVudGljYXRpb24ucmVzb3VyY2UgPSBjbGllbnQuZ2V0UmVzb3VyY2UoKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZXh0OiB7XG4gICAgICAgIGF1dGhlbnRpY2F0aW9uXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBHZXQgYXV0aCB2ZXJzaW9uXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldCBhdXRoVmVyc2lvbigpIHtcbiAgICByZXR1cm4gJ25vbmUnXG4gIH1cblxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZXh0ZW5kcyB7QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfVxuICovXG5leHBvcnQgY2xhc3MgVG9rZW5IYW5kc2hha2VNYW5hZ2VyIGV4dGVuZHMgQWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIHRva2VuIH0pIHtcbiAgICBzdXBlcih7IGRlcGxveW1lbnRJZCwgYXV0aFR5cGUgfSlcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7dG9rZW46IHN0cmluZ31cbiAgICovXG4gIGdldCBhdXRoRGF0YSgpIHtcbiAgICBjb25zdCB7IHRva2VuIH0gPSB0aGlzXG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQGV4dGVuZHMge0Fic3RyYWN0SGFuZHNoYWtlTWFuYWdlcn1cbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRaZXRhcHVzaEhhbmRzaGFrZU1hbmFnZXIgZXh0ZW5kcyBBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXIge1xuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkLCBsb2dpbiwgcGFzc3dvcmQgfSkge1xuICAgIHN1cGVyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCB9KVxuICAgIHRoaXMubG9naW4gPSBsb2dpblxuICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZFxuICB9XG4gIC8qKlxuICAgKiBAZGVzYyBHZXQgYXV0aCBkYXRhXG4gICAqIEByZXR1cm4ge2xvZ2luOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmd9XG4gICAqL1xuICBnZXQgYXV0aERhdGEoKSB7XG4gICAgY29uc3QgeyBsb2dpbiwgcGFzc3dvcmQgfSA9IHRoaXNcbiAgICByZXR1cm4ge1xuICAgICAgbG9naW4sIHBhc3N3b3JkXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5leHBvcnQgY2xhc3MgQXV0aGVudEZhY3Rvcnkge1xuICAvKipcbiAgICogQHJldHVybiB7RGVmYXVsdFpldGFwdXNoSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVTaW1wbGVIYW5kc2hha2UoeyBkZXBsb3ltZW50SWQsIGxvZ2luLCBwYXNzd29yZCB9KSB7XG4gICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZUhhbmRzaGFrZSh7XG4gICAgICBhdXRoVHlwZTogRGVwbG95YWJsZU5hbWVzLkFVVEhfU0lNUExFLFxuICAgICAgZGVwbG95bWVudElkLFxuICAgICAgbG9naW4sXG4gICAgICBwYXNzd29yZFxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVXZWFrSGFuZHNoYWtlKHsgZGVwbG95bWVudElkLCB0b2tlbiB9KSB7XG4gICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZUhhbmRzaGFrZSh7XG4gICAgICBhdXRoVHlwZTogRGVwbG95YWJsZU5hbWVzLkFVVEhfV0VBSyxcbiAgICAgIGRlcGxveW1lbnRJZCxcbiAgICAgIGxvZ2luOiB0b2tlbixcbiAgICAgIHBhc3N3b3JkOiBudWxsXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7VG9rZW5IYW5kc2hha2VNYW5hZ2VyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZURlbGVnYXRpbmdIYW5kc2hha2UoeyBkZXBsb3ltZW50SWQsIHRva2VuIH0pIHtcbiAgICByZXR1cm4gQXV0aGVudEZhY3RvcnkuY3JlYXRlSGFuZHNoYWtlKHtcbiAgICAgIGF1dGhUeXBlOiBEZXBsb3lhYmxlTmFtZXMuQVVUSF9ERUxFR0FUSU5HLFxuICAgICAgZGVwbG95bWVudElkLFxuICAgICAgbG9naW46IHRva2VuLFxuICAgICAgcGFzc3dvcmQ6IG51bGxcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUb2tlbkhhbmRzaGFrZU1hbmFnZXJ8RGVmYXVsdFpldGFwdXNoSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVIYW5kc2hha2UoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkLCBsb2dpbiwgcGFzc3dvcmQgfSkge1xuICAgIGlmIChudWxsID09PSBwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIG5ldyBUb2tlbkhhbmRzaGFrZU1hbmFnZXIoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkLCB0b2tlbjogbG9naW4gfSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEZWZhdWx0WmV0YXB1c2hIYW5kc2hha2VNYW5hZ2VyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkICB9KVxuICB9XG5cbn1cbiIsImV4cG9ydCB7IEF1dGhlbnRGYWN0b3J5IH0gZnJvbSAnLi9oYW5kc2hha2UnXG5leHBvcnQgeyBBUElfVVJMLCBDbGllbnQgfSBmcm9tICcuL2NsaWVudCdcbmV4cG9ydCB7IFNtYXJ0Q2xpZW50IH0gZnJvbSAnLi9zbWFydC1jbGllbnQnXG5leHBvcnQgeyBBYnN0cmFjdFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSwgTG9jYWxTdG9yYWdlVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IH0gZnJvbSAnLi90b2tlbi1wZXJzaXN0ZW5jZSdcbiIsImltcG9ydCB7IENsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0IHsgQXV0aGVudEZhY3RvcnkgfSBmcm9tICcuL2hhbmRzaGFrZSdcbmltcG9ydCB7IExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSB9IGZyb20gJy4vdG9rZW4tcGVyc2lzdGVuY2UnXG5cbi8qKlxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqIEBleHRlbmRzIHtDbGllbnR9XG4gKi9cbmV4cG9ydCBjbGFzcyBTbWFydENsaWVudCBleHRlbmRzIENsaWVudCB7XG4gIC8qKlxuICAgKlxuICAgKi9cbiAgY29uc3RydWN0b3IoeyBhcGlVcmwsIGF1dGhlbnRpY2F0aW9uRGVwbG95bWVudElkLCBidXNpbmVzc0lkLCByZXNvdXJjZSA9IG51bGwsIFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSA9IExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSB9KSB7XG4gICAgY29uc3QgaGFuZHNoYWtlU3RyYXRlZ3kgPSAoKSA9PiB7XG4gICAgICBjb25zdCB0b2tlbiA9IHRoaXMuZ2V0VG9rZW4oKVxuICAgICAgY29uc3QgaGFuZHNoYWtlID0gQXV0aGVudEZhY3RvcnkuY3JlYXRlV2Vha0hhbmRzaGFrZSh7XG4gICAgICAgIGRlcGxveW1lbnRJZDogYXV0aGVudGljYXRpb25EZXBsb3ltZW50SWQsXG4gICAgICAgIHRva2VuXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGhhbmRzaGFrZVxuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqL1xuICAgIHN1cGVyKHsgYXBpVXJsICwgYnVzaW5lc3NJZCwgaGFuZHNoYWtlU3RyYXRlZ3ksIHJlc291cmNlIH0pXG4gICAgY29uc3Qgb25TdWNjZXNzZnVsSGFuZHNoYWtlID0gKHsgcHVibGljVG9rZW4sIHVzZXJJZCwgdG9rZW4gfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnU21hcnRDbGllbnQ6Om9uU3VjY2Vzc2Z1bEhhbmRzaGFrZScsIHsgcHVibGljVG9rZW4sIHVzZXJJZCwgdG9rZW4gfSlcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ3kuc2V0KHsgdG9rZW4gfSlcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgb25GYWlsZWRIYW5kc2hha2UgPSAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1NtYXJ0Q2xpZW50OjpvbkZhaWxlZEhhbmRzaGFrZScsIGVycm9yKVxuICAgIH1cbiAgICB0aGlzLmFkZENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcih7IG9uRmFpbGVkSGFuZHNoYWtlLCBvblN1Y2Nlc3NmdWxIYW5kc2hha2UgfSlcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5fVxuICAgICAqL1xuICAgIHRoaXMuc3RyYXRlZ3kgPSBuZXcgVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5KClcbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RvcmVkIHRva2VuXG4gICAqL1xuICBnZXRUb2tlbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJhdGVneS5nZXQoKVxuICB9XG59XG4iLCIvKipcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFpFVEFQVVNIX1RPS0VOX0tFWSA9ICd6ZXRhcHVzaC50b2tlbidcblxuLyoqXG4gKiBAYWNjZXNzIHByb3RlY3RlZFxuICogQGRlc2MgUHJvdmlkZSBhYnN0cmFjdGlvbiBmb3IgdG9rZW4gcGVyc2lzdGVuY2VcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGtleSA9IFpFVEFQVVNIX1RPS0VOX0tFWSB9ID0ge30pIHtcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMua2V5ID0ga2V5XG4gIH1cbiAgLyoqXG4gICAqIEBhYnN0cmFjdFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdG9yZWQgdG9rZW5cbiAgICovXG4gIGdldCgpIHt9XG4gIC8qKlxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIHNldCh7IHRva2VuIH0pIHt9XG59XG5cbi8qKlxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqIEBleHRlbmRzIHtBYnN0cmFjdFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneX1cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSBleHRlbmRzIEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdG9yZWQgdG9rZW5cbiAgICovXG4gIGdldCgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5rZXkpXG4gIH1cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgc2V0KHsgdG9rZW4gfSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMua2V5LCB0b2tlbilcbiAgfVxufVxuIiwiLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gbGlzdFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5leHBvcnQgY29uc3Qgc2h1ZmZsZSA9IChsaXN0KSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGgpXG4gIHJldHVybiBsaXN0W2luZGV4XVxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybiB7UHJvbWlzZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlcnZlcnMgPSAodXJsKSA9PiB7XG4gIHJldHVybiBmZXRjaCh1cmwpXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG4gICAgfSlcbiAgICAudGhlbigoeyBzZXJ2ZXJzIH0pID0+IHtcbiAgICAgIHJldHVybiBzZXJ2ZXJzXG4gICAgfSlcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBleHRlbmRzIHtFcnJvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIE5vdFlldEltcGxlbWVudGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZSA9ICcnKSB7XG4gICAgc3VwZXIobWVzc2FnZSlcbiAgICB0aGlzLm5hbWUgPSAnTm90SW1wbGVtZW50ZWRFcnJvcidcbiAgfVxuXG59XG4iXX0=
