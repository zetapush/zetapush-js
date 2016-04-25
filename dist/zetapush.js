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
 * @access public
 */

var AbstractHandshakeManager = exports.AbstractHandshakeManager = function () {
  /**
   * @param {{authType: string, businessId: string, deploymentId: string}} parameters
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
   * @param {{authType: string, deploymentId: string, token: string}} parameters
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


var CredentialsHandshakeManager = exports.CredentialsHandshakeManager = function (_AbstractHandshakeMan2) {
  _inherits(CredentialsHandshakeManager, _AbstractHandshakeMan2);

  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   */

  function CredentialsHandshakeManager(_ref3) {
    var authType = _ref3.authType;
    var deploymentId = _ref3.deploymentId;
    var login = _ref3.login;
    var password = _ref3.password;

    _classCallCheck(this, CredentialsHandshakeManager);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(CredentialsHandshakeManager).call(this, { authType: authType, deploymentId: deploymentId }));

    _this2.login = login;
    _this2.password = password;
    return _this2;
  }
  /**
   * Get auth data
   * @return {login: string, password: string}
   */


  _createClass(CredentialsHandshakeManager, [{
    key: 'authData',
    get: function get() {
      var login = this.login;
      var password = this.password;

      return {
        login: login, password: password
      };
    }
  }]);

  return CredentialsHandshakeManager;
}(AbstractHandshakeManager);

/**
 * Factory to create handshake
 * @access public
 */


var AuthentFactory = exports.AuthentFactory = function () {
  function AuthentFactory() {
    _classCallCheck(this, AuthentFactory);
  }

  _createClass(AuthentFactory, null, [{
    key: 'createSimpleHandshake',

    /**
     * @param {{deploymentId: string, login: string, password: string}} parameters
     * @return {CredentialsHandshakeManager}
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
     * @param {{deploymentId: string, token: string}} parameters
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
     * @param {{deploymentId: string, token: string}} parameters
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
     * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
     * @return {TokenHandshakeManager|CredentialsHandshakeManager}
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
      return new CredentialsHandshakeManager({ authType: authType, deploymentId: deploymentId, login: login, password: password });
    }
  }]);

  return AuthentFactory;
}();

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientHelper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _zetapushCometd = require('zetapush-cometd');

var _cometd = require('./connection/cometd');

var _connectionStatus = require('./connection/connection-status');

var _index = require('./utils/index');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * CometD Messages enumeration
 */
var Message = {
  RECONNECT_HANDSHAKE_VALUE: 'handshake',
  RECONNECT_NONE_VALUE: 'none',
  RECONNECT_RETRY_VALUE: 'retry'
};

/**
 * CometD Transports enumeration
 */
var Transport = {
  LONG_POLLING: 'long-polling',
  WEBSOCKET: 'websocket'
};

/**
 * Provide utilities and abstraction on CometD Transport layer
 * @access private
 */

var ClientHelper = exports.ClientHelper = function () {
  /**
   * Create a new ZetaPush client helper
   */

  function ClientHelper(_ref) {
    var _this = this;

    var apiUrl = _ref.apiUrl;
    var businessId = _ref.businessId;
    var _ref$forceHttps = _ref.forceHttps;
    var forceHttps = _ref$forceHttps === undefined ? false : _ref$forceHttps;
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
    this.servers = (0, _index.getServers)({ apiUrl: apiUrl, businessId: businessId, forceHttps: forceHttps });
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
        if ('undefined' === typeof advice) {
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
              var listener = _ref5.listener;
              var subscriptions = _ref5.subscriptions;

              _this.subscribe(prefix, listener, subscriptions);
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
   * Connect client using CometD Transport
   */


  _createClass(ClientHelper, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      this.servers.then(function (servers) {
        _this2.serverUrl = (0, _index.shuffle)(servers);

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
     * Notify listeners when connection is established
     */

  }, {
    key: 'connectionEstablished',
    value: function connectionEstablished() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionEstablished();
      });
    }
    /**
     * Notify listeners when connection is broken
     */

  }, {
    key: 'connectionBroken',
    value: function connectionBroken() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionBroken();
      });
    }
    /**
     * Notify listeners when a message is lost
     */

  }, {
    key: 'messageLost',
    value: function messageLost(channel, data) {
      this.connectionListeners.forEach(function (listener) {
        listener.onMessageLost(channel, data);
      });
    }
    /**
     * Notify listeners when connection is closed
     */

  }, {
    key: 'connectionClosed',
    value: function connectionClosed() {
      this.connectionListeners.forEach(function (listener) {
        listener.onConnectionClosed();
      });
    }
    /**
     * Notify listeners when connection is established
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
     * Notify listeners when handshake step succeed
     */

  }, {
    key: 'authenticationFailed',
    value: function authenticationFailed(error) {
      this.connectionListeners.forEach(function (listener) {
        listener.onFailedHandshake(error);
      });
    }
    /**
     * Manage handshake failure case
     */

  }, {
    key: 'handshakeFailure',
    value: function handshakeFailure() {}
    /**
    * Remove current server url from the server list and shuffle for another one
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
            _this3.serverUrl = (0, _index.shuffle)(servers);
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
     * Negociate authentication
     */

  }, {
    key: 'negotiate',
    value: function negotiate(ext) {
      console.debug('ClientHelper::negotiate', ext);
    }
    /**
     * Disconnect CometD client
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.cometd.disconnect();
    }
    /**
     * Get CometD handshake parameters
     * @return {Object}
     */

  }, {
    key: 'getHandshakeFields',
    value: function getHandshakeFields() {
      var handshake = this.handshakeStrategy();
      return handshake.getHandshakeFields(this);
    }
    /**
     * Set a new handshake factory methods
     * @param {function():AbstractHandshakeManager} handshakeStrategy
     */

  }, {
    key: 'setHandshakeStrategy',
    value: function setHandshakeStrategy(handshakeStrategy) {
      this.handshakeStrategy = handshakeStrategy;
    }
    /**
     * Get business id
     * @return {string}
     */

  }, {
    key: 'getBusinessId',
    value: function getBusinessId() {
      return this.businessId;
    }
    /**
     * Get session id
     * @return {string}
     */

  }, {
    key: 'getSessionId',
    value: function getSessionId() {
      throw NotYetImplementedError();
    }
    /**
     * Get resource
     * @return {string}
     */

  }, {
    key: 'getResource',
    value: function getResource() {
      return this.resource;
    }
    /**
     * Subribe all methods defined in the listener for the given prefixed channel
     * @param {string} prefix - Channel prefix
     * @param {Object} listener
     * @param {Object} subscriptions
     * @return {Object} subscriptions
     */

  }, {
    key: 'subscribe',
    value: function subscribe(prefix, listener) {
      var subscriptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (this.cometd.isDisconnected()) {
        this.subscribeQueue.push({ prefix: prefix, listener: listener, subscriptions: subscriptions });
      } else {
        for (var method in listener) {
          if (listener.hasOwnProperty(method)) {
            var channel = prefix + '/' + method;
            subscriptions[method] = this.cometd.subscribe(channel, listener[method]);
          }
        }
      }
      return subscriptions;
    }
    /**
     * Get a publisher
     * @param {string} prefix - Channel prefix
     * @param {Object} definition
     * @return {Object} servicePublisher
     */

  }, {
    key: 'createServicePublisher',
    value: function createServicePublisher(prefix, definition) {
      var _this4 = this;

      var servicePublisher = {};
      for (var method in definition) {
        if (definition.hasOwnProperty(method)) {
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
     * Unsubcribe all subscriptions defined in given subscriptions object
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
     * Add a connection listener to handle life cycle connection events
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

},{"./connection/cometd":13,"./connection/connection-status":14,"./utils/index":18,"zetapush-cometd":1}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _index = require('./utils/index');

var _clientHelper = require('./client-helper');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Client config object.
 * @typedef {Object} ClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} businessId - Business id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {function():AbstractHandshakeManager} handshakeStrategy - Handshake strategy
 * @property {string} resource - Client resource id
 */

/**
 * ZetaPush Client to connect
 * @access public
 * @example
 * // Securized client with token based connection
 * const client = new ZetaPush.Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   forceHttps: true,
 *   handshakeStrategy: function() {
 *     return ZetaPush.AuthentFactory.createWeakHandshake({
 *       token: null,
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 * @example
 * // Client with credentials based connection
 * const client = new ZetaPush.Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   handshakeStrategy: function() {
 *     return ZetaPush.AuthentFactory.createSimpleHandshake({
 *       login: '<USER-LOGIN>',
 *       password: '<USER-PASSWORD>',
 *       deploymentId: '<YOUR-DEPLOYMENT-ID>'
  *    })
 *   }
 * })
 */

var Client = exports.Client = function () {
  /**
   * @param {ClientConfig} config
   * Create a new ZetaPush client
   */

  function Client(_ref) {
    var _ref$apiUrl = _ref.apiUrl;
    var apiUrl = _ref$apiUrl === undefined ? _index.API_URL : _ref$apiUrl;
    var businessId = _ref.businessId;
    var _ref$forceHttps = _ref.forceHttps;
    var forceHttps = _ref$forceHttps === undefined ? false : _ref$forceHttps;
    var handshakeStrategy = _ref.handshakeStrategy;
    var _ref$resource = _ref.resource;
    var resource = _ref$resource === undefined ? null : _ref$resource;

    _classCallCheck(this, Client);

    /**
     * @access private
     * @type {ClientHelper}
     */
    this.helper = new _clientHelper.ClientHelper({
      apiUrl: apiUrl,
      businessId: businessId,
      forceHttps: forceHttps,
      handshakeStrategy: handshakeStrategy,
      resource: resource
    });
  }
  /**
   * Connect client to ZetaPush
   */


  _createClass(Client, [{
    key: 'connect',
    value: function connect() {
      this.helper.connect();
    }
    /**
     * Disonnect client from ZetaPush
     */

  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.helper.disconnect();
    }
    /**
     * Create a service publisher based on publisher definition for the given deployment id
     * @param {{deploymentId: string, definition: Object}} parameters
     * @return {Object}
     */

  }, {
    key: 'createServicePublisher',
    value: function createServicePublisher(_ref2) {
      var deploymentId = _ref2.deploymentId;
      var definition = _ref2.definition;

      return this.helper.createServicePublisher('/service/' + this.getBusinessId() + '/' + deploymentId, definition);
    }
    /**
     * Get the client business id
     * @return {string}
     */

  }, {
    key: 'getBusinessId',
    value: function getBusinessId() {
      return this.helper.getBusinessId();
    }
    /**
     * Get the client resource
     * @return {string}
     */

  }, {
    key: 'getResource',
    value: function getResource() {
      return this.helper.getResource();
    }
    /**
     * Get the client user id
     * @return {string}
     */

  }, {
    key: 'getUserId',
    value: function getUserId() {
      return this.helper.getUserId();
    }
    /**
     * Get the client session id
     * @return {string}
     */

  }, {
    key: 'getSessionId',
    value: function getSessionId() {
      return this.helper.getSessionId();
    }
    /**
     * Subscribe all methods described in the listener for the given deploymentId
     * @param {{deploymentId: string, listener: Object}} parameters
     * @return {Object} subscription
     * @example
     * const stackServiceListener = {
     *   list() {},
     *   push() {},
     *   update() {}
     * }
     * client.subscribe({
     *   deploymentId: '<YOUR-STACK-DEPLOYMENT-ID>',
     *   listener: stackServiceListener
     * })
     */

  }, {
    key: 'subscribe',
    value: function subscribe(_ref3) {
      var deploymentId = _ref3.deploymentId;
      var listener = _ref3.listener;

      return this.helper.subscribe('/service/' + this.getBusinessId() + '/' + deploymentId, listener);
    }
    /**
     * Create a publish/subscribe
     * @param {{deploymentId: string, listener: Object, definition: Object}} parameters
     * @return {Object}
     */

  }, {
    key: 'createPublisherSubscriber',
    value: function createPublisherSubscriber(_ref4) {
      var deploymentId = _ref4.deploymentId;
      var listener = _ref4.listener;
      var definition = _ref4.definition;

      return {
        subscription: this.subscribe({ deploymentId: deploymentId, listener: listener }),
        publisher: this.createServicePublisher({ deploymentId: deploymentId, definition: definition })
      };
    }
    /**
     * Set new client resource value
     * @param {string} resource
     */

  }, {
    key: 'setResource',
    value: function setResource(resource) {
      this.helper.setResource(resource);
    }
    /**
     * Add a connection listener to handle life cycle connection events
     * @param {ConnectionStatusListener} listener
     */

  }, {
    key: 'addConnectionStatusListener',
    value: function addConnectionStatusListener(listener) {
      return this.helper.addConnectionStatusListener(listener);
    }
    /**
     * Force disconnect/connect with new handshake factory
     * @param {function():AbstractHandshakeManager} handshakeStrategy
     */

  }, {
    key: 'handshake',
    value: function handshake(handshakeStrategy) {
      this.disconnect();
      if (handshakeStrategy) {
        this.helper.setHandshakeStrategy(handshakeStrategy);
      }
      this.connect();
    }

    /**
     * Get a service lister from methods list with a default handler
     * @access private
     * @param {{methods: Array<function>, handler: function}} params
     * @return {Object} listener
     * @example
     * const getStackServiceListener = () => {
     *   return Client.getGenericServiceListener({
     *     methods: ['getListeners', 'list', 'purge', 'push', 'remove', 'setListeners', 'update', 'error'],
     *     handler: ({ channel, data }) => {
     *       console.debug(`Stack::${method}`, { channel, data })
     *       document.querySelector(`form[name="${method}"] [name="output"]`).value = JSON.stringify(data)
     *     }
     *   })
     * }
     */

  }], [{
    key: 'getGenericServiceListener',
    value: function getGenericServiceListener(_ref5) {
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

},{"./client-helper":11,"./utils/index":18}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchLongPollingTransport = FetchLongPollingTransport;

var _zetapushCometd = require('zetapush-cometd');

/**
 * Implements LongPollingTransport using borwser fetch() API
 * @access private
 * @return {FetchLongPollingTransport}
 */
function FetchLongPollingTransport() {
  var _super = new _zetapushCometd.LongPollingTransport();
  var that = _zetapushCometd.Transport.derive(_super);

  /**
   * Implements transport via fetch() API
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

},{"zetapush-cometd":1}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Define life cycle connection methods 
 * @access public
 */

var ConnectionStatusListener = exports.ConnectionStatusListener = function () {
  function ConnectionStatusListener() {
    _classCallCheck(this, ConnectionStatusListener);
  }

  _createClass(ConnectionStatusListener, [{
    key: "onConnectionBroken",

    /**
     * Callback fired when connection is broken
     */
    value: function onConnectionBroken() {}
    /**
     * Callback fired when connection is closed
     */

  }, {
    key: "onConnectionClosed",
    value: function onConnectionClosed() {}
    /**
     * Callback fired when is established
     */

  }, {
    key: "onConnectionEstablished",
    value: function onConnectionEstablished() {}
    /**
     * Callback fired when an error occurs in handshake step
     * @param {Object} error
     */

  }, {
    key: "onFailedHandshake",
    value: function onFailedHandshake(error) {}
    /**
     * Callback fired when a message is lost
     */

  }, {
    key: "onMessageLost",
    value: function onMessageLost() {}
    /**
     * Callback fired when handshake step succeed
     * @param {Object} authentication
     */

  }, {
    key: "onSuccessfulHandshake",
    value: function onSuccessfulHandshake(authentication) {}
  }]);

  return ConnectionStatusListener;
}();

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

/**
 * Data aggregation
 * 
 * Provides data aggregation over time and across different items
 *  User devices push items data on developer-defined categories
 *  This service automatically aggregates the data
 * Raw data is not available for reading, only the generated aggregation result
 * 
 * */
/**
 * User API for item aggregation
 * 
 * Users can push data and be notified of aggregated data.
 * This service does not allow you to read the data. To achieve that kind of behavior, you could configure a callback to store the data.
 * @access public
 * */
var AggregPublisherDefinition = exports.AggregPublisherDefinition = {
	/**
  * Pushes some data
  * 
  * Pushes the given data.
  * All the items are processed according to the defined rules.
  * At least one push for a given item is needed during a time period to trigger processing and calling of the corresponding callback verb/macro.
  * */

	push: function push(_ref) {
		var items = _ref.items;
		var owner = _ref.owner;
	}
};
/**
 * Data stacks
 * 
 * Stacks are a per-user named persistent queue of data
 *  An administrator creates a stack service
 *  End-users can push data on an arbitrary number of their own arbitrary named stacks
 * */
/**
 * Data stack user API
 * 
 * Data is stored on a per user basis. However, notifications can be sent to a configurable set of listeners.
 * Stack names are arbitrary and do not need to be explicitly initalized.
 * @access public
 * */
var StackPublisherDefinition = exports.StackPublisherDefinition = {
	/**
  * Lists the listeners
  * 
  * Returns the whole list of listeners for the given stack.
  * */

	getListeners: function getListeners(_ref2) {
		var owner = _ref2.owner;
		var stack = _ref2.stack;
	},

	/**
  * Lists content
  * 
  * Returns a paginated list of contents for the given stack.
  * Content is sorted according to the statically configured order.
  * */
	list: function list(_ref3) {
		var owner = _ref3.owner;
		var page = _ref3.page;
		var stack = _ref3.stack;
	},

	/**
  * Empties a stack
  * 
  * Removes all items from the given stack.
  * */
	purge: function purge(_ref4) {
		var owner = _ref4.owner;
		var stack = _ref4.stack;
	},

	/**
  * Pushes an item
  * 
  * Pushes an item onto the given stack.
  * The stack does not need to be created.
  * */
	push: function push(_ref5) {
		var stack = _ref5.stack;
		var data = _ref5.data;
		var owner = _ref5.owner;
	},

	/**
  * Removes items
  * 
  * Removes the item with the given guid from the given stack.
  * */
	remove: function remove(_ref6) {
		var guids = _ref6.guids;
		var owner = _ref6.owner;
		var stack = _ref6.stack;
	},

	/**
  * Sets the listeners
  * 
  * Sets the listeners for the given stack.
  * */
	setListeners: function setListeners(_ref7) {
		var listeners = _ref7.listeners;
		var owner = _ref7.owner;
		var stack = _ref7.stack;
	},

	/**
  * Updates an item
  * 
  * Updates an existing item of the given stack.
  * The item MUST exist prior to the call.
  * */
	update: function update(_ref8) {
		var guid = _ref8.guid;
		var stack = _ref8.stack;
		var data = _ref8.data;
		var owner = _ref8.owner;
	}
};
/**
 * Echo
 * 
 * Echo
 * */
/**
 * Echo service
 * 
 * Simple echo service, for development purposes.
 * @access public
 * */
var EchoPublisherDefinition = exports.EchoPublisherDefinition = {
	/**
  * Echoes an object
  * 
  * Echoes an object: the server will echo that object on channel 'echo' for the current user.
  * */

	echo: function echo(_ref9) {
		_objectDestructuringEmpty(_ref9);
	}
};
/**
 * Game engine
 * 
 * Abstract Game Engine
 *  Concrete game engines are remote cometd clients or internal macros
 * */
/**
 * Game Engine API
 * 
 * The Game Engine API is for game engine clients, not end-users.
 * @access public
 * */
var GameEnginePublisherDefinition = exports.GameEnginePublisherDefinition = {
	/**
  * Notify the result for a join request
  * 
  * A Game Engine notifies the STR of the result of a join request that it received on join_callback
  * */

	join_result: function join_result(_ref10) {
		var callerId = _ref10.callerId;
		var error = _ref10.error;
		var msgId = _ref10.msgId;
		var payload = _ref10.payload;
	},

	/**
  * Notify the result for an organization request
  * 
  * A Game Engine notifies the STR of the result of an organization request that it received on organize_callback
  * */
	organize_result: function organize_result(_ref11) {
		var callerId = _ref11.callerId;
		var error = _ref11.error;
		var msgId = _ref11.msgId;
		var payload = _ref11.payload;
	},

	/**
  * Registers a game engine
  * 
  * A client registers itself to the STR as a Game Engine.
  * The STR may, from now on, dispatch game of the given game type to said client.
  * Unregistration is done automatically on logoff.
  * */
	register: function register(_ref12) {
		var gameInfo = _ref12.gameInfo;
		var location = _ref12.location;
		var maxGames = _ref12.maxGames;
	},

	/**
  * Notify the result for a start request
  * 
  * A Game Engine notifies the STR of the result of a start request that it received on start_callback
  * */
	start_result: function start_result(_ref13) {
		var gameId = _ref13.gameId;
	},

	/**
  * Notify a game event
  * 
  * A Game Engine notifies the STR of some arbitrary game event.
  * */
	state: function state(_ref14) {
		var data = _ref14.data;
		var gameId = _ref14.gameId;
		var status = _ref14.status;
	},

	/**
  * Notify the result for an unjoin request
  * 
  * A Game Engine notifies the STR of the result of an unjoin request that it received on unjoin_callback
  * */
	unjoin_result: function unjoin_result(_ref15) {
		var callerId = _ref15.callerId;
		var error = _ref15.error;
		var msgId = _ref15.msgId;
		var payload = _ref15.payload;
	}
};
/**
 * User API for games
 * 
 * Users can list, start, join games, and play.
 * @access public
 * */
var GamePublisherDefinition = exports.GamePublisherDefinition = {
	/**
  * Lists game types
  * 
  * Returns the list of game types supported by the server and the currently registered game engines.
  * */

	available: function available(_ref16) {
		_objectDestructuringEmpty(_ref16);
	},

	/**A user joins a game*/
	join: function join(_ref17) {
		var gameId = _ref17.gameId;
		var role = _ref17.role;
		var userId = _ref17.userId;
		var userName = _ref17.userName;
	},

	/**Organizes a game*/
	organize: function organize(_ref18) {
		var type = _ref18.type;
		var owner = _ref18.owner;
		var options = _ref18.options;
	},

	/**Gives some command to the game engine*/
	play: function play(_ref19) {
		var data = _ref19.data;
		var gameId = _ref19.gameId;
		var userId = _ref19.userId;
	},

	/**Starts a game*/
	start: function start(_ref20) {
		var gameId = _ref20.gameId;
	},

	/**A user cancels joining a game*/
	unjoin: function unjoin(_ref21) {
		var gameId = _ref21.gameId;
		var role = _ref21.role;
		var userId = _ref21.userId;
		var userName = _ref21.userName;
	}
};
/**
 * Generic Data Access
 * 
 * Generic Data Access Service : NoSQL storage
 * */
/**
 * GDA User API
 * 
 * User API for Generic Data Access.
 * Data is stored on a per-user basis.
 * Users can put, get, list their data.
 * @access public
 * */
var GdaPublisherDefinition = exports.GdaPublisherDefinition = {
	/**
  * Asks for a data row
  * 
  * Returns a full data row.
  * */

	get: function get(_ref22) {
		var key = _ref22.key;
		var owner = _ref22.owner;
		var table = _ref22.table;
	},

	/**
  * Asks for a data cell
  * 
  * Returns a precise list of cells from a column in a data row.
  * */
	getCells: function getCells(_ref23) {
		var column = _ref23.column;
		var key = _ref23.key;
		var key2 = _ref23.key2;
		var owner = _ref23.owner;
		var table = _ref23.table;
	},

	/**
  * Increments an integer value
  * 
  * Increments a cell 64-bit signed integer value and returns the result in the data field.
  * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
  * */
	inc: function inc(_ref24) {
		var table = _ref24.table;
		var data = _ref24.data;
		var key = _ref24.key;
		var key2 = _ref24.key2;
		var owner = _ref24.owner;
		var column = _ref24.column;
	},

	/**
  * Asks for a list of rows
  * 
  * Returns a paginated list of rows from the given table.
  * */
	list: function list(_ref25) {
		var columns = _ref25.columns;
		var owner = _ref25.owner;
		var page = _ref25.page;
		var table = _ref25.table;
	},

	/**
  * Puts some data into a cell
  * 
  * Creates or replaces the contents of a particular cell.
  * */
	put: function put(_ref26) {
		var column = _ref26.column;
		var data = _ref26.data;
		var key = _ref26.key;
		var key2 = _ref26.key2;
		var owner = _ref26.owner;
		var table = _ref26.table;
	},

	/**
  * Puts several rows
  * 
  * Creates or replaces the (maybe partial) contents of a collection of rows.
  * This method only creates or replaces cells for non-null input values.
  * */
	puts: function puts(_ref27) {
		var owner = _ref27.owner;
		var rows = _ref27.rows;
		var table = _ref27.table;
	},

	/**
  * Asks for a range of rows
  * 
  * Returns a paginated range of rows from the given table.
  * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
  * You can specify partial keys for the start and stop fields.
  * */
	range: function range(_ref28) {
		var columns = _ref28.columns;
		var owner = _ref28.owner;
		var page = _ref28.page;
		var start = _ref28.start;
		var stop = _ref28.stop;
		var table = _ref28.table;
	},

	/**
  * Reduces a range of rows
  * 
  * Returns a computed single reduced result from a range of rows from the given table.
  * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
  * You can specify partial keys for the start and stop fields.
  * */
	reduce: function reduce(_ref29) {
		_objectDestructuringEmpty(_ref29);
	},

	/**
  * Removes one cell inside a column of a row
  * 
  * Removes only one cell of the given column of the given row from the given table.
  * */
	removeCell: function removeCell(_ref30) {
		var column = _ref30.column;
		var key = _ref30.key;
		var key2 = _ref30.key2;
		var owner = _ref30.owner;
		var table = _ref30.table;
	},

	/**
  * Removes one full column of a row
  * 
  * Removes all cells of the given column of the given row from the given table.
  * */
	removeColumn: function removeColumn(_ref31) {
		var column = _ref31.column;
		var key = _ref31.key;
		var owner = _ref31.owner;
		var table = _ref31.table;
	},

	/**
  * Removes a range of rows
  * 
  * Removes the specified columns of the given range of rows from the given table.
  * */
	removeRange: function removeRange(_ref32) {
		var columns = _ref32.columns;
		var owner = _ref32.owner;
		var start = _ref32.start;
		var stop = _ref32.stop;
		var table = _ref32.table;
	},

	/**
  * Removes one full row
  * 
  * Removes all columns of the given row from the given table.
  * */
	removeRow: function removeRow(_ref33) {
		var key = _ref33.key;
		var owner = _ref33.owner;
		var table = _ref33.table;
	}
};
/**
 * Groups Management
 * 
 * Groups management for users, grants on resources, remote commands on devices
 *  This is where you can configure rights for any resource
 * 
 * */
/**
 * User API for remote control
 * 
 * @access public
 * */
var RemotingPublisherDefinition = exports.RemotingPublisherDefinition = {
	/**
  * Adds a listener
  * 
  * A user requests notifications from a device owned by anyone who granted him the right authorizations.
  * Whenever the device calls 'notify', notifications will be sent to the caller of this verb.
  * */

	addListener: function addListener(_ref34) {
		var cmd = _ref34.cmd;
		var data = _ref34.data;
		var from = _ref34.from;
		var fromResource = _ref34.fromResource;
		var owner = _ref34.owner;
		var resource = _ref34.resource;
	},

	/**Response to 'getCapabilities'*/
	capabilities: function capabilities(_ref35) {
		var answeringResource = _ref35.answeringResource;
		var askingResource = _ref35.askingResource;
		var _capabilities = _ref35.capabilities;
	},

	/**
  * Executes a command
  * 
  * A user executes a command on a device owned by anyone who granted him the right authorizations.
  * The command is issued on channel 'command'
  * */
	execute: function execute(_ref36) {
		var resource = _ref36.resource;
		var cmd = _ref36.cmd;
		var data = _ref36.data;
		var owner = _ref36.owner;
	},

	/**
  * Requests capabilities
  * 
  * A user requests all his devices for the whole list of their capabilities.
  * Devices are expected to answer on channel 'capabilities'
  * */
	getCapabilities: function getCapabilities(_ref37) {
		_objectDestructuringEmpty(_ref37);
	},

	/**
  * Notifies of some event
  * 
  * A device notifies the registered users/devices on this channel.
  * The server forwards the notification to said users.
  * */
	notify: function notify(_ref38) {
		var cmd = _ref38.cmd;
		var data = _ref38.data;
		var from = _ref38.from;
		var fromResource = _ref38.fromResource;
		var owner = _ref38.owner;
		var resource = _ref38.resource;
	},

	/**
  * Pings devices
  * 
  * A user requests all devices (of all owners) on which he has authorizations to respond on channel 'pong'
  * */
	ping: function ping(_ref39) {
		var action = _ref39.action;
	},

	/**Response to ping*/
	pong: function pong(_ref40) {
		var action = _ref40.action;
		var available = _ref40.available;
		var owner = _ref40.owner;
		var resource = _ref40.resource;
		var uid = _ref40.uid;
		var user = _ref40.user;
	},

	/**
  * Removes a listener
  * 
  * A user stops requesting notifications from a device owned by anyone who granted him the right authorizations
  * */
	removeListener: function removeListener(_ref41) {
		var cmd = _ref41.cmd;
		var data = _ref41.data;
		var from = _ref41.from;
		var fromResource = _ref41.fromResource;
		var owner = _ref41.owner;
		var resource = _ref41.resource;
	}
};
/**
 * User API for groups and rights.
 * 
 * Groups are stored per user.
 * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
 * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
 * @access public
 * */
var GroupManagementPublisherDefinition = exports.GroupManagementPublisherDefinition = {
	/**
  * Adds me to a group
  * 
  * Adds me (the caller) to a group.
  * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
  * The 'user' field is implicitly set to the current user's key.
  * */

	addMe: function addMe(_ref42) {
		var group = _ref42.group;
		var owner = _ref42.owner;
	},

	/**
  * Adds a user to a group
  * 
  * Adds the given user to the given group.
  * Addition may fail if the given group does not already exist.
  * */
	addUser: function addUser(_ref43) {
		var user = _ref43.user;
		var group = _ref43.group;
		var owner = _ref43.owner;
	},

	/**Adds users to a group*/
	addUsers: function addUsers(_ref44) {
		var users = _ref44.users;
		var group = _ref44.group;
		var owner = _ref44.owner;
	},

	/**
  * Lists my owned groups, with details
  * 
  * Returns the whole list of groups owned by the current user, with their members
  * */
	allGroups: function allGroups(_ref45) {
		var owner = _ref45.owner;
	},

	/**
  * Creates a group
  * 
  * Creates a group owned by the current user.
  * Group creation may fail if the group already exists.
  * */
	createGroup: function createGroup(_ref46) {
		var group = _ref46.group;
		var groupName = _ref46.groupName;
		var owner = _ref46.owner;
	},

	/**
  * Removes a group
  * 
  * Removes the given group owned by the current user or the given owner.
  * Also removes all grants to that group.
  * */
	delGroup: function delGroup(_ref47) {
		var group = _ref47.group;
		var owner = _ref47.owner;
	},

	/**Removes a user from a group*/
	delUser: function delUser(_ref48) {
		var group = _ref48.group;
		var owner = _ref48.owner;
		var user = _ref48.user;
	},

	/**Removes users from a group*/
	delUsers: function delUsers(_ref49) {
		var group = _ref49.group;
		var groupName = _ref49.groupName;
		var owner = _ref49.owner;
		var users = _ref49.users;
	},

	/**
  * Tests for a group's existence
  * 
  * Returns whether a group exists or not.
  * */
	exists: function exists(_ref50) {
		var group = _ref50.group;
		var owner = _ref50.owner;
	},

	/**
  * Grants a right to a group
  * 
  * The granting API does not do any check when storing permissions.
  * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
  * */
	grant: function grant(_ref51) {
		var action = _ref51.action;
		var group = _ref51.group;
		var owner = _ref51.owner;
		var resource = _ref51.resource;
	},

	/**
  * Lists the group users
  * 
  * Returns the whole list of users configured inside the given group.
  * */
	groupUsers: function groupUsers(_ref52) {
		var group = _ref52.group;
		var owner = _ref52.owner;
	},

	/**
  * Lists my owned groups
  * 
  * Returns the whole list of groups owned by the current user
  * */
	groups: function groups(_ref53) {
		var owner = _ref53.owner;
	},

	/**
  * Lists rights for a group
  * 
  * This API lists explicitly configured rights.
  * Effective rights include configured rights, implicit rights and inherited rights.
  * */
	listGrants: function listGrants(_ref54) {
		var group = _ref54.group;
		var owner = _ref54.owner;
	},

	/**
  * Lists presences for a group
  * 
  * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
  * The current implementation does not include information about the particular devices users are connected with.
  * If a user is connected twice with two different devices, two identical entries will be returned.
  * */
	listPresences: function listPresences(_ref55) {
		var group = _ref55.group;
		var owner = _ref55.owner;
	},

	/**
  * Tests membership
  * 
  * Tests whether I (the caller) am a member of the given group.
  * This verb exists so that users can determine if they are part of a group without being granted particular rights.
  * The 'user' field is implicitly set to the current user's key.
  * */
	memberOf: function memberOf(_ref56) {
		var hardFail = _ref56.hardFail;
		var group = _ref56.group;
		var owner = _ref56.owner;
	},

	/**
  * Grants rights to a group
  * 
  * Grant several rights at once.
  * */
	mgrant: function mgrant(_ref57) {
		var actions = _ref57.actions;
		var group = _ref57.group;
		var owner = _ref57.owner;
		var resource = _ref57.resource;
	},

	/**Revokes rights for a group*/
	mrevoke: function mrevoke(_ref58) {
		var actions = _ref58.actions;
		var group = _ref58.group;
		var owner = _ref58.owner;
		var resource = _ref58.resource;
	},

	/**
  * Lists the groups I am part of
  * 
  * Returns the whole list of groups the current user is part of.
  * Groups may be owned by anyone, including the current user.
  * */
	myGroups: function myGroups(_ref59) {
		var owner = _ref59.owner;
	},

	/**Revokes a right for a group*/
	revoke: function revoke(_ref60) {
		var action = _ref60.action;
		var group = _ref60.group;
		var owner = _ref60.owner;
		var resource = _ref60.resource;
	}
};
/**
 * HTTP client
 * 
 * Web-service client
 *  An admin records URL templates that can be called by users
 *  Calls are not configurable by end-users
 *  However an admin may leverage the macro service to achieve URL, headers and body configurability
 * */
/**
 * User API for http requests
 * 
 * @access public
 * */
var HttpclientPublisherDefinition = exports.HttpclientPublisherDefinition = {
	/**
  * Makes a predefined request
  * 
  * Lookups a predefined request by name, and executes it.
  * */

	call: function call(_ref61) {
		var name = _ref61.name;
		var requestId = _ref61.requestId;
	},

	/**
  * Makes a parameterized request
  * 
  * Executes an HTTP request with the given url, method, headers and body.
  * */
	request: function request(_ref62) {
		_objectDestructuringEmpty(_ref62);
	}
};
/**
 * Macros
 * 
 * Macro-command service
 *  An admin defines macro-commands that can sequentially call any number of other api verbs, loop on collections of data, make decisions, etc
 * 
 * 
 *  End-users play them, with contextual parameters
 * */
/**
 * User API for macro execution
 * 
 * Simple errors are reported as usual.
 * However, the macro execution verbs treat most errors in a particular way : instead of reporting errors on the usual 'error' channel, errors are put in the returned 'MacroCompletion' result.
 * This behavior can be tuned on a per-call basis with the hardFail parameter.
 * Note that some particular errors will always behave as if hardFail were true, because they are related to programming errors, or prevent processing from ending gracefully : STACK_OVERFLOW, NO_SUCH_FUNCTION, RAM_EXCEEDED, CYCLES_EXCEEDED, TIME_EXCEEDED, QUOTA_EXCEEDED, RATE_EXCEEDED, BAD_COMPARATOR_VALUE
 * @access public
 * */
var MacroPublisherDefinition = exports.MacroPublisherDefinition = {
	/**
  * Plays a previously recorded macro
  * 
  * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
  * You can override the default notification channel when defining the macro.
  * */

	call: function call(_ref63) {
		var debug = _ref63.debug;
		var hardFail = _ref63.hardFail;
		var name = _ref63.name;
		var parameters = _ref63.parameters;
	},

	/**
  * Plays a previously recorded macro and returns the result.
  * 
  * Use this verb when you want to synchronously call a macro from inside another macro.
  * */
	func: function func(_ref64) {
		_objectDestructuringEmpty(_ref64);
	},

	/**
  * Similar to func, with the ability to impersonate any user at will.
  * 
  * Use this verb when you do not want to use or cannot use the standard rights system and wish to bypass it completely.
  * Use this verb sparingly, as it can give the caller any right on any resource.
  * */
	sudo: function sudo(_ref65) {
		_objectDestructuringEmpty(_ref65);
	}
};
/**
 * Mail sender
 * 
 * Sends email through SMTP
 * */
/**
 * Mail service user API
 * 
 * This service is statically configured with an outgoing SMTP server.
 * Users call the API here to actually send emails.
 * @access public
 * */
var SendmailPublisherDefinition = exports.SendmailPublisherDefinition = {
	/**
  * Sends an email
  * 
  * Sends an email with the given body to the intended recipients.
  * */

	send: function send(_ref66) {
		_objectDestructuringEmpty(_ref66);
	}
};
/**
 * Messaging service
 * 
 * Messaging service
 * */
/**
 * Messaging service
 * 
 * Simple and flexible user-to-user or user-to-group messaging service.
 * @access public
 * */
var MessagingPublisherDefinition = exports.MessagingPublisherDefinition = {
	/**
  * Sends a message to a target
  * 
  * Sends the given message to the specified target on the given (optional) channel.
  * The administratively given default channel name is used when none is provided in the message itself.
  * */

	send: function send(_ref67) {
		var target = _ref67.target;
		var channel = _ref67.channel;
		var data = _ref67.data;
	}
};
/**
 * Producer consumer
 * 
 * Producer consumer service
 *  Users can submit tasks and other users consume them
 * */
/**
 * Producer / consumer real-time API
 * 
 * Task producers submits their tasks.
 * The server dispatches the tasks.
 * Consumers process them and report completion back to the server.
 * Tasks are global to the service (i.e. NOT per user).
 * @access public
 * */
var QueuePublisherDefinition = exports.QueuePublisherDefinition = {
	/**
  * Submits a task
  * 
  * Producer API.
  * A task producer submits the given task to the server.
  * The server will find a tasker with processing capacity and dispatch the task.
  * The task result will be returned to the caller.
  * When called from inside a macro, the comsumer generated result is available for further use.
  * */

	call: function call(_ref68) {
		var description = _ref68.description;
		var originBusinessId = _ref68.originBusinessId;
		var originDeploymentId = _ref68.originDeploymentId;
		var data = _ref68.data;
		var owner = _ref68.owner;
	},

	/**
  * Notifies completion of a task
  * 
  * Consumer API.
  * The tasker notifies completion of the given task to the server.
  * The tasker can optionally include a result or an error code.
  * */
	done: function done(_ref69) {
		var result = _ref69.result;
		var success = _ref69.success;
		var taskId = _ref69.taskId;
	},

	/**
  * Registers a consumer
  * 
  * Consumer API.
  * Registers the current user resource as an available task consumer.
  * Tasks will be then dispatched to that consumer.
  * */
	register: function register(_ref70) {
		var capacity = _ref70.capacity;
	},

	/**
  * Submits a task
  * 
  * Producer API.
  * A task producer submits the given task to the server.
  * The server will find a tasker with processing capacity and dispatch the task.
  * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
  * This verb will return immediately : you can use this API to asynchronously submit a task.
  * */
	submit: function submit(_ref71) {
		var description = _ref71.description;
		var originBusinessId = _ref71.originBusinessId;
		var originDeploymentId = _ref71.originDeploymentId;
		var data = _ref71.data;
		var owner = _ref71.owner;
	},

	/**
  * Unregisters a consumer
  * 
  * Consumer API.
  * Unregisters the current user resource as an available task consumer.
  * All non finished tasks are returned to the server.
  * */
	unregister: function unregister(_ref72) {
		_objectDestructuringEmpty(_ref72);
	}
};
/**
 * SMS via OVH
 * 
 * SMS sender, to send text messages to mobile phones
 * This SMS sending service uses the OVH API
 * 
 * */
/**
 * SMS service
 * 
 * User API for SMS.
 * @access public
 * */
var Sms_ovhPublisherDefinition = exports.Sms_ovhPublisherDefinition = {
	/**
  * Sends an SMS
  * 
  * Sends the given message to the given recipients.
  * */

	send: function send(_ref73) {
		_objectDestructuringEmpty(_ref73);
	}
};
/**
 * Scheduler
 * 
 * Scheduler service
 *  End-users can schedule one-time or repetitive tasks using a classical cron syntax (with the year field) or a timestamp (milliseconds from the epoch)
 * */
/**
 * User API for the Scheduler
 * 
 * User endpoints for scheduling : users can schedule, list and delete tasks.
 * Tasks are stored on a per-user basis: a task will run with the priviledges of the user who stored it.
 * Tasks are run on the server and thus can call api verbs marked as server-only.
 * @access public
 * */
var CronPublisherDefinition = exports.CronPublisherDefinition = {
	/**
  * List the configured tasks
  * 
  * Returns a paginated list of the asking user's tasks.
  * */

	list: function list(_ref74) {
		var owner = _ref74.owner;
		var page = _ref74.page;
		var start = _ref74.start;
		var stop = _ref74.stop;
	},

	/**
  * Schedules a task
  * 
  * Schedules a task for later execution.
  * If a task already exists with the same cronName, this new task completely replaces it.
  * A task can be scheduled with a cron-like syntax for repetitive or one-shot execution.
  * Wildcards are not allowed for minutes and hours.
  * When scheduling for one-shot execution, the time must be at least two minutes into the future.
  * */
	schedule: function schedule(_ref75) {
		_objectDestructuringEmpty(_ref75);
	},

	/**
  * Removes a scheduled task
  * 
  * Removes a previously scheduled task.
  * Does absolutely nothing if asked to remove a non-existent task.
  * */
	unschedule: function unschedule(_ref76) {
		var cronName = _ref76.cronName;
		var owner = _ref76.owner;
	}
};
/**
 * Search engine
 * 
 * ElasticSearch engine, to index and search data
 *  An admin creates indices
 *  Users index and search documents
 * 
 * */
/**
 * ElasticSearch Service
 * 
 * This API is a very thin wrapper around ElasticSearch's API.
 * @access public
 * */
var SearchPublisherDefinition = exports.SearchPublisherDefinition = {
	/**
  * Deletes data
  * 
  * Deletes a document from the elasticsearch engine by id.
  * */

	delete: function _delete(_ref77) {
		var id = _ref77.id;
		var index = _ref77.index;
		var type = _ref77.type;
	},

	/**
  * Gets data
  * 
  * Retrieves a document from the elasticsearch engine by id.
  * */
	get: function get(_ref78) {
		var id = _ref78.id;
		var index = _ref78.index;
		var type = _ref78.type;
	},

	/**
  * Indexes data
  * 
  * Inserts or updates a document into the elasticsearch engine.
  * */
	index: function index(_ref79) {
		var data = _ref79.data;
		var id = _ref79.id;
		var _index = _ref79.index;
		var type = _ref79.type;
	},

	/**Searches for data*/
	search: function search(_ref80) {
		var indices = _ref80.indices;
		var page = _ref80.page;
		var query = _ref80.query;
		var sort = _ref80.sort;
	}
};
/**
 * Template engine
 * 
 * Template engine to produce documents from parameterized templates
 * <br>An admin creates templates
 * <br> Users produce documents
 * <br>The implementation uses the <a href='http://freemarker
 * org/'>freemarker</a> engine
 * 
 * */
/**
 * User API for templates
 * 
 * Users use this API to evaluate pre-configured templates.
 * @access public
 * */
var TemplatePublisherDefinition = exports.TemplatePublisherDefinition = {
	/**
  * Evaluates a template
  * 
  * Evaluates the given template and returns the result as a string.
  * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
  * */

	evaluate: function evaluate(_ref81) {
		var data = _ref81.data;
		var languageTag = _ref81.languageTag;
		var name = _ref81.name;
		var requestId = _ref81.requestId;
	}
};
/**
 * Upload: S3
 * 
 * Upload service with S3 storage
 * */
/**
 * User API for file management
 * 
 * User API for virtual file management and http file upload
 * This API contains all the verbs needed to browse, upload and remove files.
 * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
 * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
 * @access public
 * */
var Zpfs_s3PublisherDefinition = exports.Zpfs_s3PublisherDefinition = {
	/**
  * Copies a file
  * 
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */

	cp: function cp(_ref82) {
		var oldPath = _ref82.oldPath;
		var owner = _ref82.owner;
		var path = _ref82.path;
	},

	/**
  * Returns disk usage
  * 
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */
	du: function du(_ref83) {
		var owner = _ref83.owner;
		var path = _ref83.path;
	},

	/**Requests an upload URL without constraints.*/
	freeUploadUrl: function freeUploadUrl(_ref84) {
		_objectDestructuringEmpty(_ref84);
	},

	/**
  * Links a file
  * 
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */
	link: function link(_ref85) {
		var oldPath = _ref85.oldPath;
		var owner = _ref85.owner;
		var path = _ref85.path;
	},

	/**
  * Lists a folder content
  * 
  * Returns a paginated list of the folder's content.
  * */
	ls: function ls(_ref86) {
		var folder = _ref86.folder;
		var owner = _ref86.owner;
		var page = _ref86.page;
	},

	/**
  * Creates a folder
  * 
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */
	mkdir: function mkdir(_ref87) {
		var folder = _ref87.folder;
		var owner = _ref87.owner;
		var parents = _ref87.parents;
	},

	/**
  * Moves a file
  * 
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	mv: function mv(_ref88) {
		var oldPath = _ref88.oldPath;
		var owner = _ref88.owner;
		var path = _ref88.path;
	},

	/**
  * Notifies of upload completion
  * 
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */
	newFile: function newFile(_ref89) {
		var guid = _ref89.guid;
		var metadata = _ref89.metadata;
		var owner = _ref89.owner;
		var tags = _ref89.tags;
	},

	/**
  * Requests an upload URL
  * 
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */
	newUploadUrl: function newUploadUrl(_ref90) {
		var contentType = _ref90.contentType;
		var owner = _ref90.owner;
		var path = _ref90.path;
	},

	/**
  * Removes a file
  * 
  * Removes a file or folder (recursively).
  * */
	rm: function rm(_ref91) {
		var owner = _ref91.owner;
		var path = _ref91.path;
	},

	/**
  * Returns information about a file
  * 
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */
	stat: function stat(_ref92) {
		var owner = _ref92.owner;
		var path = _ref92.path;
	},

	/**Updates a file's metadata*/
	updateMeta: function updateMeta(_ref93) {
		var metadata = _ref93.metadata;
		var metadataFiles = _ref93.metadataFiles;
		var owner = _ref93.owner;
		var path = _ref93.path;
	}
};
/**
 * Upload: local
 * 
 * Upload service with local HDFS storage
 * */
/**
 * User API for file management
 * 
 * User API for virtual file management and http file upload
 * This API contains all the verbs needed to browse, upload and remove files.
 * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
 * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
 * @access public
 * */
var Zpfs_hdfsPublisherDefinition = exports.Zpfs_hdfsPublisherDefinition = {
	/**
  * Copies a file
  * 
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */

	cp: function cp(_ref94) {
		var oldPath = _ref94.oldPath;
		var owner = _ref94.owner;
		var path = _ref94.path;
	},

	/**
  * Returns disk usage
  * 
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */
	du: function du(_ref95) {
		var owner = _ref95.owner;
		var path = _ref95.path;
	},

	/**Requests an upload URL without constraints.*/
	freeUploadUrl: function freeUploadUrl(_ref96) {
		_objectDestructuringEmpty(_ref96);
	},

	/**
  * Links a file
  * 
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */
	link: function link(_ref97) {
		var oldPath = _ref97.oldPath;
		var owner = _ref97.owner;
		var path = _ref97.path;
	},

	/**
  * Lists a folder content
  * 
  * Returns a paginated list of the folder's content.
  * */
	ls: function ls(_ref98) {
		var folder = _ref98.folder;
		var owner = _ref98.owner;
		var page = _ref98.page;
	},

	/**
  * Creates a folder
  * 
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */
	mkdir: function mkdir(_ref99) {
		var folder = _ref99.folder;
		var owner = _ref99.owner;
		var parents = _ref99.parents;
	},

	/**
  * Moves a file
  * 
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	mv: function mv(_ref100) {
		var oldPath = _ref100.oldPath;
		var owner = _ref100.owner;
		var path = _ref100.path;
	},

	/**
  * Notifies of upload completion
  * 
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */
	newFile: function newFile(_ref101) {
		var guid = _ref101.guid;
		var metadata = _ref101.metadata;
		var owner = _ref101.owner;
		var tags = _ref101.tags;
	},

	/**
  * Requests an upload URL
  * 
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */
	newUploadUrl: function newUploadUrl(_ref102) {
		var contentType = _ref102.contentType;
		var owner = _ref102.owner;
		var path = _ref102.path;
	},

	/**
  * Removes a file
  * 
  * Removes a file or folder (recursively).
  * */
	rm: function rm(_ref103) {
		var owner = _ref103.owner;
		var path = _ref103.path;
	},

	/**
  * Returns information about a file
  * 
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */
	stat: function stat(_ref104) {
		var owner = _ref104.owner;
		var path = _ref104.path;
	},

	/**Updates a file's metadata*/
	updateMeta: function updateMeta(_ref105) {
		var metadata = _ref105.metadata;
		var metadataFiles = _ref105.metadataFiles;
		var owner = _ref105.owner;
		var path = _ref105.path;
	}
};
/**
 * Upload: pseudo-S3
 * 
 * Upload service with pseudo-S3compatible storage
 * */
/**
 * User API for file management
 * 
 * User API for virtual file management and http file upload
 * This API contains all the verbs needed to browse, upload and remove files.
 * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
 * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
 * @access public
 * */
var Zpfs_s3compatPublisherDefinition = exports.Zpfs_s3compatPublisherDefinition = {
	/**
  * Copies a file
  * 
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */

	cp: function cp(_ref106) {
		var oldPath = _ref106.oldPath;
		var owner = _ref106.owner;
		var path = _ref106.path;
	},

	/**
  * Returns disk usage
  * 
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */
	du: function du(_ref107) {
		var owner = _ref107.owner;
		var path = _ref107.path;
	},

	/**Requests an upload URL without constraints.*/
	freeUploadUrl: function freeUploadUrl(_ref108) {
		_objectDestructuringEmpty(_ref108);
	},

	/**
  * Links a file
  * 
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */
	link: function link(_ref109) {
		var oldPath = _ref109.oldPath;
		var owner = _ref109.owner;
		var path = _ref109.path;
	},

	/**
  * Lists a folder content
  * 
  * Returns a paginated list of the folder's content.
  * */
	ls: function ls(_ref110) {
		var folder = _ref110.folder;
		var owner = _ref110.owner;
		var page = _ref110.page;
	},

	/**
  * Creates a folder
  * 
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */
	mkdir: function mkdir(_ref111) {
		var folder = _ref111.folder;
		var owner = _ref111.owner;
		var parents = _ref111.parents;
	},

	/**
  * Moves a file
  * 
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	mv: function mv(_ref112) {
		var oldPath = _ref112.oldPath;
		var owner = _ref112.owner;
		var path = _ref112.path;
	},

	/**
  * Notifies of upload completion
  * 
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */
	newFile: function newFile(_ref113) {
		var guid = _ref113.guid;
		var metadata = _ref113.metadata;
		var owner = _ref113.owner;
		var tags = _ref113.tags;
	},

	/**
  * Requests an upload URL
  * 
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */
	newUploadUrl: function newUploadUrl(_ref114) {
		var contentType = _ref114.contentType;
		var owner = _ref114.owner;
		var path = _ref114.path;
	},

	/**
  * Removes a file
  * 
  * Removes a file or folder (recursively).
  * */
	rm: function rm(_ref115) {
		var owner = _ref115.owner;
		var path = _ref115.path;
	},

	/**
  * Returns information about a file
  * 
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */
	stat: function stat(_ref116) {
		var owner = _ref116.owner;
		var path = _ref116.path;
	},

	/**Updates a file's metadata*/
	updateMeta: function updateMeta(_ref117) {
		var metadata = _ref117.metadata;
		var metadataFiles = _ref117.metadataFiles;
		var owner = _ref117.owner;
		var path = _ref117.path;
	}
};
/**
 * User directory service
 * 
 * User directory service
 * */
/**
 * User API for user information
 * 
 * @access public
 * */
var UserdirPublisherDefinition = exports.UserdirPublisherDefinition = {
	/**Searches for users matching the request*/

	search: function search(_ref118) {
		var page = _ref118.page;
		var query = _ref118.query;
		var requestId = _ref118.requestId;
	},

	/**Requests public data for the specified users*/
	userInfo: function userInfo(_ref119) {
		var userKeys = _ref119.userKeys;
	}
};
/**
 * Delegating authentication
 * 
 * This authentication delegates authentication to an external auth provider
 * <br>When a zetapush client handshakes with a delegated authentication, the 'token' field given by the client is sent to the configured remote server as part of the URL
 * <br>The response must be in JSON format
 *  Each key of the response will be considered a user information field name
 * 
 * */
/**
 * End-user API for the delegating authentication
 * 
 * Provisionning verbs.
 * @access public
 * */
var DelegatingPublisherDefinition = exports.DelegatingPublisherDefinition = {
	/**
  * Get user info
  * 
  * Retrieves cached user info or (if missing) eagerly creates a zetapush key for the user.
  * The returned field 'zetapushKey' is a unique and permanent ID identifying a user in a sandbox.
  * */

	userInfo: function userInfo(_ref120) {
		_objectDestructuringEmpty(_ref120);
	}
};
/**
 * Local authentication
 * 
 * Zetapush local authentication
 *  The configurer can choose the primary key and mandatory user fields for account creation
 *  The field 'zetapushKey' is generated by the server and MUST not be used : it contains the unique key of the user inside a sandbox (it can be obtained from inside a macro with the <b>__userKey</b> pseudo-constant)
 * */
/**
 * End-user API for the simple local authentication
 * 
 * These API verbs allow end-users to manage their account.
 * @access public
 * */
var SimplePublisherDefinition = exports.SimplePublisherDefinition = {
	/**
  * Changes a password
  * 
  * Changes a user password for this authentication realm.
  * The user can be either implicit (the current user) or deduced from the token.
  * The change is effective immediately. However, already logged in users might stay connected.
  * */

	changePassword: function changePassword(_ref121) {
		_objectDestructuringEmpty(_ref121);
	},

	/**
  * Checks some account's existence
  * 
  * Checks whether the given user already exists in this 'simple' authentication realm.
  * */
	checkUser: function checkUser(_ref122) {
		_objectDestructuringEmpty(_ref122);
	},

	/**
  * Creates a user
  * 
  * Creates a new user in this 'simple' authentication realm.
  * */
	createUser: function createUser(_ref123) {
		_objectDestructuringEmpty(_ref123);
	},

	/**
  * Deletes a user
  * 
  * Deletes an existing user in this 'simple' authentication realm.
  * */
	deleteUser: function deleteUser(_ref124) {
		_objectDestructuringEmpty(_ref124);
	},

	/**
  * Requests a password reset
  * 
  * Requests a password reset for the given userKey.
  * The userKey must exist and must be given, as it cannot obviously be deduced from the currently logged in user.
  * The returned token needs to be sent to the intended recipient only. The typical use case is to define a macro that requests a reset, generates a email template and emails the user. The macro can then be safely called by a weakly authenticated user.
  * Requesting a reset does not invalidate the password.
  * Requesting a reset again invalidates previous reset requests (only the last token is usable)
  * */
	requestReset: function requestReset(_ref125) {
		_objectDestructuringEmpty(_ref125);
	},

	/**
  * Updates a user
  * 
  * Updates an existing user in this 'simple' authentication realm.
  * */
	updateUser: function updateUser(_ref126) {
		_objectDestructuringEmpty(_ref126);
	}
};
/**
 * Weak authentication
 * 
 * The weak authentication allows for anonymous authentication of devices
 *  Such devices can display a qrcode to allow regular users to take control of them
 * */
/**
 * User API for weak devices control
 * 
 * User API for control and release of weakly authenticated user sessions.
 * @access public
 * */
var WeakPublisherDefinition = exports.WeakPublisherDefinition = {
	/**
  * Controls a session
  * 
  * Takes control of a weak user session, identified by the given public token.
  * The public token has been previously made available by the controlled device, for example by displaying a QRCode.
  * Upon control notification, the client SDK of the controlled session is expected to re-handshake.
  * */

	control: function control(_ref127) {
		var fullRights = _ref127.fullRights;
		var publicToken = _ref127.publicToken;
	},

	/**
  * Releases a session
  * 
  * Releases control of a weak user session, identified by the given public token.
  * The weak user session must have been previously controlled by a call to 'control'.
  * */
	release: function release(_ref128) {
		var fullRights = _ref128.fullRights;
		var publicToken = _ref128.publicToken;
	}
};

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.definitions = exports.SmartClient = exports.Client = exports.ConnectionStatusListener = exports.AuthentFactory = undefined;

var _handshake = require('./authentication/handshake');

Object.defineProperty(exports, 'AuthentFactory', {
  enumerable: true,
  get: function get() {
    return _handshake.AuthentFactory;
  }
});

var _connectionStatus = require('./connection/connection-status');

Object.defineProperty(exports, 'ConnectionStatusListener', {
  enumerable: true,
  get: function get() {
    return _connectionStatus.ConnectionStatusListener;
  }
});

var _client = require('./client');

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

var _index = require('./definitions/index');

var definitions = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.definitions = definitions;

},{"./authentication/handshake":10,"./client":12,"./connection/connection-status":14,"./definitions/index":15,"./smart-client":17}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmartClient = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _client = require('./client');

var _handshake = require('./authentication/handshake');

var _tokenPersistence = require('./utils/token-persistence');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * SmartClient config object.
 * @typedef {Object} SmartClientConfig
 * @property {string} apiUrl - Api Url
 * @property {string} authenticationDeploymentId - Authentication deployment id
 * @property {string} businessId - Business id
 * @property {boolean} forceHttps - Force end to end HTTPS connection
 * @property {string} resource - Client resource id
 * @property {AbstractTokenPersistenceStrategy} TokenPersistenceStrategy - Token storage strategy
 */

/**
 * @access public
 * @extends {Client}
 */

var SmartClient = exports.SmartClient = function (_Client) {
  _inherits(SmartClient, _Client);

  /**
   * Create a new ZetaPush smart client
   * @param {SmartClientConfig} config
   * @example
   * // Smart client
   * const client = new ZetaPush.SmartClient({
   *   businessId: '<YOUR-BUSINESS-ID-ID>',
   *   authenticationDeploymentId: '<YOUR-AUTHENTICATION-DEPLOYMENT-ID>'
   * })
   */

  function SmartClient(_ref) {
    var apiUrl = _ref.apiUrl;
    var authenticationDeploymentId = _ref.authenticationDeploymentId;
    var businessId = _ref.businessId;
    var forceHttps = _ref.forceHttps;
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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SmartClient).call(this, { apiUrl: apiUrl, businessId: businessId, forceHttps: forceHttps, handshakeStrategy: handshakeStrategy, resource: resource }));

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

},{"./authentication/handshake":10,"./client":12,"./utils/token-persistence":19}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Match unsecure pattern web
 * @type {RegExp}
 */
var UNSECURE_PATTERN = /^http:\/\/|^\/\//;

/**
* Default ZetaPush API URL
* @access private
*/
var API_URL = exports.API_URL = 'https://api.zpush.io/';

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
 * @param {boolean} forceHttps
 * @return {string}
 */
var getSecureUrl = exports.getSecureUrl = function getSecureUrl(url, forceHttps) {
  return forceHttps ? url.replace(UNSECURE_PATTERN, 'https://') : url;
};

/**
 * @access private
 * @param {{apiUrl: string, businessId: string, forceHttps: boolean}} parameters
 * @return {Promise}
 */
var getServers = exports.getServers = function getServers(_ref) {
  var apiUrl = _ref.apiUrl;
  var businessId = _ref.businessId;
  var forceHttps = _ref.forceHttps;

  var secureApiUrl = getSecureUrl(apiUrl, forceHttps);
  var url = '' + secureApiUrl + businessId;
  return fetch(url).then(function (response) {
    return response.json();
  }).then(function (_ref2) {
    var servers = _ref2.servers;

    // TODO: Replace by a server side implementation when available
    return servers.map(function (server) {
      return getSecureUrl(server, forceHttps);
    });
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

},{}],19:[function(require,module,exports){
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
 * Provide abstraction for token persistence
 * @access protected
 */

var AbstractTokenPersistenceStrategy = exports.AbstractTokenPersistenceStrategy = function () {
  /**
   * @param {{key: string}} parameters
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
     * @param {{token: string}} parameters
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
     * @param {{token: string}} parameters
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

},{}]},{},[16])(16)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ29tZXRELmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvTG9uZ1BvbGxpbmdUcmFuc3BvcnQuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9SZXF1ZXN0VHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0UmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9VdGlscy5qcyIsIm5vZGVfbW9kdWxlcy96ZXRhcHVzaC1jb21ldGQvbGliL1dlYlNvY2tldFRyYW5zcG9ydC5qcyIsInNyYy9hdXRoZW50aWNhdGlvbi9oYW5kc2hha2UuanMiLCJzcmMvY2xpZW50LWhlbHBlci5qcyIsInNyYy9jbGllbnQuanMiLCJzcmMvY29ubmVjdGlvbi9jb21ldGQuanMiLCJzcmMvY29ubmVjdGlvbi9jb25uZWN0aW9uLXN0YXR1cy5qcyIsInNyYy9kZWZpbml0aW9ucy9pbmRleC5qcyIsInNyYy9pbmRleC5qcyIsInNyYy9zbWFydC1jbGllbnQuanMiLCJzcmMvdXRpbHMvaW5kZXguanMiLCJzcmMvdXRpbHMvdG9rZW4tcGVyc2lzdGVuY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqNERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LENBRDZCO0tBQVosQ0FBbkIsQ0FGcUI7R0FBakIsQ0FKUixDQUhnRTtDQUF4Qzs7Ozs7OztJQW1CYjs7Ozs7OztBQUlYLFdBSlcsc0JBSVgsR0FBMEI7UUFBZCxnRUFBVSxrQkFBSTs7MEJBSmYsd0JBSWU7O3VFQUpmLG1DQUtILFVBRGtCOztBQUV4QixVQUFLLElBQUwsR0FBWSxxQkFBWixDQUZ3Qjs7R0FBMUI7O1NBSlc7RUFBK0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDckQ1QyxJQUFNLHFCQUFxQixnQkFBckI7Ozs7Ozs7SUFNTzs7Ozs7QUFJWCxXQUpXLGdDQUlYLEdBQStDO3FFQUFKLGtCQUFJOzt3QkFBakMsSUFBaUM7UUFBakMsK0JBQU0sOEJBQTJCOzswQkFKcEMsa0NBSW9DOzs7Ozs7QUFLN0MsU0FBSyxHQUFMLEdBQVcsR0FBWCxDQUw2QztHQUEvQzs7Ozs7OztlQUpXOzswQkFlTDs7Ozs7Ozs7K0JBS1M7VUFBVCxvQkFBUzs7OztTQXBCSjs7Ozs7Ozs7O0lBMkJBOzs7Ozs7Ozs7Ozs7Ozs7OzBCQUtMO0FBQ0osYUFBTyxhQUFhLE9BQWIsQ0FBcUIsS0FBSyxHQUFMLENBQTVCLENBREk7Ozs7Ozs7OzsrQkFPUztVQUFULG9CQUFTOztBQUNiLG1CQUFhLE9BQWIsQ0FBcUIsS0FBSyxHQUFMLEVBQVUsS0FBL0IsRUFEYTs7OztTQVpKO0VBQTZDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBDYWxsYmFja1BvbGxpbmdUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL0NhbGxiYWNrUG9sbGluZ1RyYW5zcG9ydCcpLFxuICBDb21ldEQ6IHJlcXVpcmUoJy4vbGliL0NvbWV0RCcpLFxuICBMb25nUG9sbGluZ1RyYW5zcG9ydDogcmVxdWlyZSgnLi9saWIvTG9uZ1BvbGxpbmdUcmFuc3BvcnQnKSxcbiAgUmVxdWVzdFRyYW5zcG9ydDogcmVxdWlyZSgnLi9saWIvUmVxdWVzdFRyYW5zcG9ydCcpLFxuICBUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL1RyYW5zcG9ydCcpLFxuICBUcmFuc3BvcnRSZWdpc3RyeTogcmVxdWlyZSgnLi9saWIvVHJhbnNwb3J0UmVnaXN0cnknKSxcbiAgVXRpbHM6IHJlcXVpcmUoJy4vbGliL1V0aWxzJyksXG4gIFdlYlNvY2tldFRyYW5zcG9ydDogcmVxdWlyZSgnLi9saWIvV2ViU29ja2V0VHJhbnNwb3J0Jylcbn1cbiIsInZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1RyYW5zcG9ydCcpO1xudmFyIFJlcXVlc3RUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1JlcXVlc3RUcmFuc3BvcnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDYWxsYmFja1BvbGxpbmdUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF9zdXBlciA9IG5ldyBSZXF1ZXN0VHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuXG4gICAgX3NlbGYuYWNjZXB0ID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgX3NlbGYuanNvbnBTZW5kID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9mYWlsVHJhbnNwb3J0Rm4oZW52ZWxvcGUsIHJlcXVlc3QsIHgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsICdlcnJvcicsIHgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIF9zZWxmLnRyYW5zcG9ydFNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgcmVxdWVzdCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyIGhhcyBhIDIwODMgVVJMIG1heCBsZW5ndGhcbiAgICAgICAgLy8gV2UgbXVzdCBlbnN1cmUgdGhhdCB3ZSBzdGF5IHdpdGhpbiB0aGF0IGxlbmd0aFxuICAgICAgICB2YXIgc3RhcnQgPSAwO1xuICAgICAgICB2YXIgbGVuZ3RoID0gZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoO1xuICAgICAgICB2YXIgbGVuZ3RocyA9IFtdO1xuICAgICAgICB3aGlsZSAobGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gRW5jb2RlIHRoZSBtZXNzYWdlcyBiZWNhdXNlIGFsbCBicmFja2V0cywgcXVvdGVzLCBjb21tYXMsIGNvbG9ucywgZXRjXG4gICAgICAgICAgICAvLyBwcmVzZW50IGluIHRoZSBKU09OIHdpbGwgYmUgVVJMIGVuY29kZWQsIHRha2luZyBtYW55IG1vcmUgY2hhcmFjdGVyc1xuICAgICAgICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShlbnZlbG9wZS5tZXNzYWdlcy5zbGljZShzdGFydCwgc3RhcnQgKyBsZW5ndGgpKTtcbiAgICAgICAgICAgIHZhciB1cmxMZW5ndGggPSBlbnZlbG9wZS51cmwubGVuZ3RoICsgZW5jb2RlVVJJKGpzb24pLmxlbmd0aDtcblxuICAgICAgICAgICAgdmFyIG1heExlbmd0aCA9IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLm1heFVSSUxlbmd0aDtcbiAgICAgICAgICAgIGlmICh1cmxMZW5ndGggPiBtYXhMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB4ID0gJ0JheWV1eCBtZXNzYWdlIHRvbyBiaWcgKCcgKyB1cmxMZW5ndGggKyAnIGJ5dGVzLCBtYXggaXMgJyArIG1heExlbmd0aCArICcpICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZvciB0cmFuc3BvcnQgJyArIHRoaXMuZ2V0VHlwZSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRpbWVvdXQoX2ZhaWxUcmFuc3BvcnRGbi5jYWxsKHRoaXMsIGVudmVsb3BlLCByZXF1ZXN0LCB4KSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAtLWxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGVuZ3Rocy5wdXNoKGxlbmd0aCk7XG4gICAgICAgICAgICBzdGFydCArPSBsZW5ndGg7XG4gICAgICAgICAgICBsZW5ndGggPSBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGggLSBzdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhlcmUgd2UgYXJlIHN1cmUgdGhhdCB0aGUgbWVzc2FnZXMgY2FuIGJlIHNlbnQgd2l0aGluIHRoZSBVUkwgbGltaXRcblxuICAgICAgICB2YXIgZW52ZWxvcGVUb1NlbmQgPSBlbnZlbG9wZTtcbiAgICAgICAgaWYgKGxlbmd0aHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFyIGJlZ2luID0gMDtcbiAgICAgICAgICAgIHZhciBlbmQgPSBsZW5ndGhzWzBdO1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc3BsaXQnLCBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGgsICdtZXNzYWdlcyBpbnRvJywgbGVuZ3Rocy5qb2luKCcgKyAnKSk7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZCA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgZW52ZWxvcGUpO1xuICAgICAgICAgICAgZW52ZWxvcGVUb1NlbmQubWVzc2FnZXMgPSBlbnZlbG9wZS5tZXNzYWdlcy5zbGljZShiZWdpbiwgZW5kKTtcbiAgICAgICAgICAgIGVudmVsb3BlVG9TZW5kLm9uU3VjY2VzcyA9IGVudmVsb3BlLm9uU3VjY2VzcztcbiAgICAgICAgICAgIGVudmVsb3BlVG9TZW5kLm9uRmFpbHVyZSA9IGVudmVsb3BlLm9uRmFpbHVyZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsZW5ndGhzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5leHRFbnZlbG9wZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgZW52ZWxvcGUpO1xuICAgICAgICAgICAgICAgIGJlZ2luID0gZW5kO1xuICAgICAgICAgICAgICAgIGVuZCArPSBsZW5ndGhzW2ldO1xuICAgICAgICAgICAgICAgIG5leHRFbnZlbG9wZS5tZXNzYWdlcyA9IGVudmVsb3BlLm1lc3NhZ2VzLnNsaWNlKGJlZ2luLCBlbmQpO1xuICAgICAgICAgICAgICAgIG5leHRFbnZlbG9wZS5vblN1Y2Nlc3MgPSBlbnZlbG9wZS5vblN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgbmV4dEVudmVsb3BlLm9uRmFpbHVyZSA9IGVudmVsb3BlLm9uRmFpbHVyZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQobmV4dEVudmVsb3BlLCByZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbmRpbmcgcmVxdWVzdCcsIHJlcXVlc3QuaWQsICdlbnZlbG9wZScsIGVudmVsb3BlVG9TZW5kKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHNhbWVTdGFjayA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmpzb25wU2VuZCh7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0OiB0aGlzLFxuICAgICAgICAgICAgICAgIHVybDogZW52ZWxvcGVUb1NlbmQudXJsLFxuICAgICAgICAgICAgICAgIHN5bmM6IGVudmVsb3BlVG9TZW5kLnN5bmMsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogdGhpcy5nZXRDb25maWd1cmF0aW9uKCkucmVxdWVzdEhlYWRlcnMsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZW52ZWxvcGVUb1NlbmQubWVzc2FnZXMpLFxuICAgICAgICAgICAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjZWl2ZWQgPSBzZWxmLmNvbnZlcnRUb01lc3NhZ2VzKHJlc3BvbnNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjZWl2ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHBDb2RlOiAyMDRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRTdWNjZXNzKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCByZWNlaXZlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbihyZWFzb24sIGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogcmVhc29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiBleGNlcHRpb25cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNhbWVTdGFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGVUb1NlbmQsIHJlcXVlc3QsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzYW1lU3RhY2sgPSBmYWxzZTtcbiAgICAgICAgfSBjYXRjaCAoeHgpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogeHhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBfc2VsZjtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0UmVnaXN0cnkgPSByZXF1aXJlKCcuL1RyYW5zcG9ydFJlZ2lzdHJ5JylcbnZhciBVdGlscyA9IHJlcXVpcmUoJy4vVXRpbHMnKVxuLyoqXG4gKiBUaGUgY29uc3RydWN0b3IgZm9yIGEgQ29tZXREIG9iamVjdCwgaWRlbnRpZmllZCBieSBhbiBvcHRpb25hbCBuYW1lLlxuICogVGhlIGRlZmF1bHQgbmFtZSBpcyB0aGUgc3RyaW5nICdkZWZhdWx0Jy5cbiAqIEluIHRoZSByYXJlIGNhc2UgYSBwYWdlIG5lZWRzIG1vcmUgdGhhbiBvbmUgQmF5ZXV4IGNvbnZlcnNhdGlvbixcbiAqIGEgbmV3IGluc3RhbmNlIGNhbiBiZSBjcmVhdGVkIHZpYTpcbiAqIDxwcmU+XG4gKiB2YXIgYmF5ZXV4VXJsMiA9IC4uLjtcbiAqXG4gKiAvLyBEb2pvIHN0eWxlXG4gKiB2YXIgY29tZXRkMiA9IG5ldyBkb2pveC5Db21ldEQoJ2Fub3RoZXJfb3B0aW9uYWxfbmFtZScpO1xuICpcbiAqIC8vIGpRdWVyeSBzdHlsZVxuICogdmFyIGNvbWV0ZDIgPSBuZXcgJC5Db21ldEQoJ2Fub3RoZXJfb3B0aW9uYWxfbmFtZScpO1xuICpcbiAqIGNvbWV0ZDIuaW5pdCh7dXJsOiBiYXlldXhVcmwyfSk7XG4gKiA8L3ByZT5cbiAqIEBwYXJhbSBuYW1lIHRoZSBvcHRpb25hbCBuYW1lIG9mIHRoaXMgY29tZXRkIG9iamVjdFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENvbWV0RChuYW1lKSB7XG4gICAgdmFyIF9jb21ldGQgPSB0aGlzO1xuICAgIHZhciBfbmFtZSA9IG5hbWUgfHwgJ2RlZmF1bHQnO1xuICAgIHZhciBfY3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICB2YXIgX3RyYW5zcG9ydHMgPSBuZXcgVHJhbnNwb3J0UmVnaXN0cnkoKTtcbiAgICB2YXIgX3RyYW5zcG9ydDtcbiAgICB2YXIgX3N0YXR1cyA9ICdkaXNjb25uZWN0ZWQnO1xuICAgIHZhciBfbWVzc2FnZUlkID0gMDtcbiAgICB2YXIgX2NsaWVudElkID0gbnVsbDtcbiAgICB2YXIgX2JhdGNoID0gMDtcbiAgICB2YXIgX21lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgIHZhciBfaW50ZXJuYWxCYXRjaCA9IGZhbHNlO1xuICAgIHZhciBfbGlzdGVuZXJzID0ge307XG4gICAgdmFyIF9iYWNrb2ZmID0gMDtcbiAgICB2YXIgX3NjaGVkdWxlZFNlbmQgPSBudWxsO1xuICAgIHZhciBfZXh0ZW5zaW9ucyA9IFtdO1xuICAgIHZhciBfYWR2aWNlID0ge307XG4gICAgdmFyIF9oYW5kc2hha2VQcm9wcztcbiAgICB2YXIgX2hhbmRzaGFrZUNhbGxiYWNrO1xuICAgIHZhciBfY2FsbGJhY2tzID0ge307XG4gICAgdmFyIF9yZW1vdGVDYWxscyA9IHt9O1xuICAgIHZhciBfcmVlc3RhYmxpc2ggPSBmYWxzZTtcbiAgICB2YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHZhciBfdW5jb25uZWN0VGltZSA9IDA7XG4gICAgdmFyIF9oYW5kc2hha2VNZXNzYWdlcyA9IDA7XG4gICAgdmFyIF9jb25maWcgPSB7XG4gICAgICAgIHByb3RvY29sOiBudWxsLFxuICAgICAgICBzdGlja3lSZWNvbm5lY3Q6IHRydWUsXG4gICAgICAgIGNvbm5lY3RUaW1lb3V0OiAwLFxuICAgICAgICBtYXhDb25uZWN0aW9uczogMixcbiAgICAgICAgYmFja29mZkluY3JlbWVudDogMTAwMCxcbiAgICAgICAgbWF4QmFja29mZjogNjAwMDAsXG4gICAgICAgIGxvZ0xldmVsOiAnaW5mbycsXG4gICAgICAgIHJldmVyc2VJbmNvbWluZ0V4dGVuc2lvbnM6IHRydWUsXG4gICAgICAgIG1heE5ldHdvcmtEZWxheTogMTAwMDAsXG4gICAgICAgIHJlcXVlc3RIZWFkZXJzOiB7fSxcbiAgICAgICAgYXBwZW5kTWVzc2FnZVR5cGVUb1VSTDogdHJ1ZSxcbiAgICAgICAgYXV0b0JhdGNoOiBmYWxzZSxcbiAgICAgICAgdXJsczoge30sXG4gICAgICAgIG1heFVSSUxlbmd0aDogMjAwMCxcbiAgICAgICAgYWR2aWNlOiB7XG4gICAgICAgICAgICB0aW1lb3V0OiA2MDAwMCxcbiAgICAgICAgICAgIGludGVydmFsOiAwLFxuICAgICAgICAgICAgcmVjb25uZWN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICBtYXhJbnRlcnZhbDogMFxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9maWVsZFZhbHVlKG9iamVjdCwgbmFtZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIG9iamVjdFtuYW1lXTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1peGVzIGluIHRoZSBnaXZlbiBvYmplY3RzIGludG8gdGhlIHRhcmdldCBvYmplY3QgYnkgY29weWluZyB0aGUgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0gZGVlcCBpZiB0aGUgY29weSBtdXN0IGJlIGRlZXBcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IHRoZSB0YXJnZXQgb2JqZWN0XG4gICAgICogQHBhcmFtIG9iamVjdHMgdGhlIG9iamVjdHMgd2hvc2UgcHJvcGVydGllcyBhcmUgY29waWVkIGludG8gdGhlIHRhcmdldFxuICAgICAqL1xuICAgIHRoaXMuX21peGluID0gZnVuY3Rpb24oZGVlcCwgdGFyZ2V0LCBvYmplY3RzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0YXJnZXQgfHwge307XG5cbiAgICAgICAgLy8gU2tpcCBmaXJzdCAyIHBhcmFtZXRlcnMgKGRlZXAgYW5kIHRhcmdldCksIGFuZCBsb29wIG92ZXIgdGhlIG90aGVyc1xuICAgICAgICBmb3IgKHZhciBpID0gMjsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG9iamVjdCA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICAgICAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkIHx8IG9iamVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcCA9IF9maWVsZFZhbHVlKG9iamVjdCwgcHJvcE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZyA9IF9maWVsZFZhbHVlKHJlc3VsdCwgcHJvcE5hbWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIEF2b2lkIGluZmluaXRlIGxvb3BzXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBtaXhpbiB1bmRlZmluZWQgdmFsdWVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9wID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZXAgJiYgdHlwZW9mIHByb3AgPT09ICdvYmplY3QnICYmIHByb3AgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcm9wIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcHJvcE5hbWVdID0gdGhpcy5fbWl4aW4oZGVlcCwgdGFyZyBpbnN0YW5jZW9mIEFycmF5ID8gdGFyZyA6IFtdLCBwcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNvdXJjZSA9IHR5cGVvZiB0YXJnID09PSAnb2JqZWN0JyAmJiAhKHRhcmcgaW5zdGFuY2VvZiBBcnJheSkgPyB0YXJnIDoge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BOYW1lXSA9IHRoaXMuX21peGluKGRlZXAsIHNvdXJjZSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbcHJvcE5hbWVdID0gcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc1N0cmluZyh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gVXRpbHMuaXNTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfemVyb1BhZCh2YWx1ZSwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcbiAgICAgICAgd2hpbGUgKC0tbGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID49IE1hdGgucG93KDEwLCBsZW5ndGgpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHQgKz0gJzAnO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbG9nKGxldmVsLCBhcmdzKSB7XG4gICAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGNvbnNvbGUpIHtcbiAgICAgICAgICAgIHZhciBsb2dnZXIgPSBjb25zb2xlW2xldmVsXTtcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihsb2dnZXIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgICAgICAgICAgW10uc3BsaWNlLmNhbGwoYXJncywgMCwgMCwgX3plcm9QYWQobm93LmdldEhvdXJzKCksIDIpICsgJzonICsgX3plcm9QYWQobm93LmdldE1pbnV0ZXMoKSwgMikgKyAnOicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgX3plcm9QYWQobm93LmdldFNlY29uZHMoKSwgMikgKyAnLicgKyBfemVyb1BhZChub3cuZ2V0TWlsbGlzZWNvbmRzKCksIDMpKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl93YXJuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9sb2coJ3dhcm4nLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICB0aGlzLl9pbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfY29uZmlnLmxvZ0xldmVsICE9PSAnd2FybicpIHtcbiAgICAgICAgICAgIF9sb2coJ2luZm8nLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfY29uZmlnLmxvZ0xldmVsID09PSAnZGVidWcnKSB7XG4gICAgICAgICAgICBfbG9nKCdkZWJ1ZycsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3NwbGl0VVJMKHVybCkge1xuICAgICAgICAvLyBbMV0gPSBwcm90b2NvbDovLyxcbiAgICAgICAgLy8gWzJdID0gaG9zdDpwb3J0LFxuICAgICAgICAvLyBbM10gPSBob3N0LFxuICAgICAgICAvLyBbNF0gPSBJUHY2X2hvc3QsXG4gICAgICAgIC8vIFs1XSA9IElQdjRfaG9zdCxcbiAgICAgICAgLy8gWzZdID0gOnBvcnQsXG4gICAgICAgIC8vIFs3XSA9IHBvcnQsXG4gICAgICAgIC8vIFs4XSA9IHVyaSxcbiAgICAgICAgLy8gWzldID0gcmVzdCAocXVlcnkgLyBmcmFnbWVudClcbiAgICAgICAgcmV0dXJuIC8oXmh0dHBzPzpcXC9cXC8pPygoKFxcW1teXFxdXStcXF0pfChbXjpcXC9cXD8jXSspKSg6KFxcZCspKT8pPyhbXlxcPyNdKikoLiopPy8uZXhlYyh1cmwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGUgZ2l2ZW4gaG9zdEFuZFBvcnQgaXMgY3Jvc3MgZG9tYWluLlxuICAgICAqIFRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHdpbmRvdy5sb2NhdGlvbi5ob3N0XG4gICAgICogYnV0IHRoaXMgZnVuY3Rpb24gY2FuIGJlIG92ZXJyaWRkZW4gdG8gbWFrZSBpdCB3b3JrIGluIG5vbi1icm93c2VyXG4gICAgICogZW52aXJvbm1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGhvc3RBbmRQb3J0IHRoZSBob3N0IGFuZCBwb3J0IGluIGZvcm1hdCBob3N0OnBvcnRcbiAgICAgKiBAcmV0dXJuIHdoZXRoZXIgdGhlIGdpdmVuIGhvc3RBbmRQb3J0IGlzIGNyb3NzIGRvbWFpblxuICAgICAqL1xuICAgIHRoaXMuX2lzQ3Jvc3NEb21haW4gPSBmdW5jdGlvbihob3N0QW5kUG9ydCkge1xuICAgICAgICByZXR1cm4gaG9zdEFuZFBvcnQgJiYgaG9zdEFuZFBvcnQgIT09IHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uZmlndXJlKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0NvbmZpZ3VyaW5nIGNvbWV0ZCBvYmplY3Qgd2l0aCcsIGNvbmZpZ3VyYXRpb24pO1xuICAgICAgICAvLyBTdXBwb3J0IG9sZCBzdHlsZSBwYXJhbSwgd2hlcmUgb25seSB0aGUgQmF5ZXV4IHNlcnZlciBVUkwgd2FzIHBhc3NlZFxuICAgICAgICBpZiAoX2lzU3RyaW5nKGNvbmZpZ3VyYXRpb24pKSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uID0geyB1cmw6IGNvbmZpZ3VyYXRpb24gfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb24gPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9jb25maWcgPSBfY29tZXRkLl9taXhpbihmYWxzZSwgX2NvbmZpZywgY29uZmlndXJhdGlvbik7XG5cbiAgICAgICAgdmFyIHVybCA9IF9jb21ldGQuZ2V0VVJMKCk7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgICB0aHJvdyAnTWlzc2luZyByZXF1aXJlZCBjb25maWd1cmF0aW9uIHBhcmFtZXRlciBcXCd1cmxcXCcgc3BlY2lmeWluZyB0aGUgQmF5ZXV4IHNlcnZlciBVUkwnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgd2UncmUgY3Jvc3MgZG9tYWluLlxuICAgICAgICB2YXIgdXJsUGFydHMgPSBfc3BsaXRVUkwodXJsKTtcbiAgICAgICAgdmFyIGhvc3RBbmRQb3J0ID0gdXJsUGFydHNbMl07XG4gICAgICAgIHZhciB1cmkgPSB1cmxQYXJ0c1s4XTtcbiAgICAgICAgdmFyIGFmdGVyVVJJID0gdXJsUGFydHNbOV07XG4gICAgICAgIF9jcm9zc0RvbWFpbiA9IF9jb21ldGQuX2lzQ3Jvc3NEb21haW4oaG9zdEFuZFBvcnQpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGFwcGVuZGluZyBleHRyYSBwYXRoIGlzIHN1cHBvcnRlZFxuICAgICAgICBpZiAoX2NvbmZpZy5hcHBlbmRNZXNzYWdlVHlwZVRvVVJMKSB7XG4gICAgICAgICAgICBpZiAoYWZ0ZXJVUkkgIT09IHVuZGVmaW5lZCAmJiBhZnRlclVSSS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnQXBwZW5kaW5nIG1lc3NhZ2UgdHlwZSB0byBVUkkgJyArIHVyaSArIGFmdGVyVVJJICsgJyBpcyBub3Qgc3VwcG9ydGVkLCBkaXNhYmxpbmcgXFwnYXBwZW5kTWVzc2FnZVR5cGVUb1VSTFxcJyBjb25maWd1cmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgX2NvbmZpZy5hcHBlbmRNZXNzYWdlVHlwZVRvVVJMID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB1cmlTZWdtZW50cyA9IHVyaS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIHZhciBsYXN0U2VnbWVudEluZGV4ID0gdXJpU2VnbWVudHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICBpZiAodXJpLm1hdGNoKC9cXC8kLykpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlZ21lbnRJbmRleCAtPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodXJpU2VnbWVudHNbbGFzdFNlZ21lbnRJbmRleF0uaW5kZXhPZignLicpID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVmVyeSBsaWtlbHkgdGhlIENvbWV0RCBzZXJ2bGV0J3MgVVJMIHBhdHRlcm4gaXMgbWFwcGVkIHRvIGFuIGV4dGVuc2lvbiwgc3VjaCBhcyAqLmNvbWV0ZFxuICAgICAgICAgICAgICAgICAgICAvLyBJdCB3aWxsIGJlIGRpZmZpY3VsdCB0byBhZGQgdGhlIGV4dHJhIHBhdGggaW4gdGhpcyBjYXNlXG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0FwcGVuZGluZyBtZXNzYWdlIHR5cGUgdG8gVVJJICcgKyB1cmkgKyAnIGlzIG5vdCBzdXBwb3J0ZWQsIGRpc2FibGluZyBcXCdhcHBlbmRNZXNzYWdlVHlwZVRvVVJMXFwnIGNvbmZpZ3VyYXRpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpZy5hcHBlbmRNZXNzYWdlVHlwZVRvVVJMID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlbW92ZUxpc3RlbmVyKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbc3Vic2NyaXB0aW9uLmNoYW5uZWxdO1xuICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMgJiYgc3Vic2NyaXB0aW9uc1tzdWJzY3JpcHRpb24uaWRdKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHN1YnNjcmlwdGlvbnNbc3Vic2NyaXB0aW9uLmlkXTtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUmVtb3ZlZCcsIHN1YnNjcmlwdGlvbi5saXN0ZW5lciA/ICdsaXN0ZW5lcicgOiAnc3Vic2NyaXB0aW9uJywgc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW1vdmVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24gJiYgIXN1YnNjcmlwdGlvbi5saXN0ZW5lcikge1xuICAgICAgICAgICAgX3JlbW92ZUxpc3RlbmVyKHN1YnNjcmlwdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY2xlYXJTdWJzY3JpcHRpb25zKCkge1xuICAgICAgICBmb3IgKHZhciBjaGFubmVsIGluIF9saXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChfbGlzdGVuZXJzLmhhc093blByb3BlcnR5KGNoYW5uZWwpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW2NoYW5uZWxdO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3JlbW92ZVN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb25zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9zZXRTdGF0dXMobmV3U3RhdHVzKSB7XG4gICAgICAgIGlmIChfc3RhdHVzICE9PSBuZXdTdGF0dXMpIHtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdTdGF0dXMnLCBfc3RhdHVzLCAnLT4nLCBuZXdTdGF0dXMpO1xuICAgICAgICAgICAgX3N0YXR1cyA9IG5ld1N0YXR1cztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pc0Rpc2Nvbm5lY3RlZCgpIHtcbiAgICAgICAgcmV0dXJuIF9zdGF0dXMgPT09ICdkaXNjb25uZWN0aW5nJyB8fCBfc3RhdHVzID09PSAnZGlzY29ubmVjdGVkJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbmV4dE1lc3NhZ2VJZCgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICsrX21lc3NhZ2VJZDtcbiAgICAgICAgcmV0dXJuICcnICsgcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcHBseUV4dGVuc2lvbihzY29wZSwgY2FsbGJhY2ssIG5hbWUsIG1lc3NhZ2UsIG91dGdvaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChzY29wZSwgbWVzc2FnZSk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vbkV4dGVuc2lvbkV4Y2VwdGlvbjtcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdJbnZva2luZyBleHRlbnNpb24gZXhjZXB0aW9uIGhhbmRsZXInLCBuYW1lLCB4KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoX2NvbWV0ZCwgeCwgbmFtZSwgb3V0Z29pbmcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGV4dGVuc2lvbiBleGNlcHRpb24gaGFuZGxlcicsIG5hbWUsIHh4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGV4dGVuc2lvbicsIG5hbWUsIHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlJbmNvbWluZ0V4dGVuc2lvbnMobWVzc2FnZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGluZGV4ID0gX2NvbmZpZy5yZXZlcnNlSW5jb21pbmdFeHRlbnNpb25zID8gX2V4dGVuc2lvbnMubGVuZ3RoIC0gMSAtIGkgOiBpO1xuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IF9leHRlbnNpb25zW2luZGV4XTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGV4dGVuc2lvbi5leHRlbnNpb24uaW5jb21pbmc7XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IF9hcHBseUV4dGVuc2lvbihleHRlbnNpb24uZXh0ZW5zaW9uLCBjYWxsYmFjaywgZXh0ZW5zaW9uLm5hbWUsIG1lc3NhZ2UsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcmVzdWx0ID09PSB1bmRlZmluZWQgPyBtZXNzYWdlIDogcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hcHBseU91dGdvaW5nRXh0ZW5zaW9ucyhtZXNzYWdlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBleHRlbnNpb24uZXh0ZW5zaW9uLm91dGdvaW5nO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBfYXBwbHlFeHRlbnNpb24oZXh0ZW5zaW9uLmV4dGVuc2lvbiwgY2FsbGJhY2ssIGV4dGVuc2lvbi5uYW1lLCBtZXNzYWdlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcmVzdWx0ID09PSB1bmRlZmluZWQgPyBtZXNzYWdlIDogcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9ub3RpZnkoY2hhbm5lbCwgbWVzc2FnZSkge1xuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zICYmIHN1YnNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzY3JpcHRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgLy8gU3Vic2NyaXB0aW9ucyBtYXkgY29tZSBhbmQgZ28sIHNvIHRoZSBhcnJheSBtYXkgaGF2ZSAnaG9sZXMnXG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmNhbGxiYWNrLmNhbGwoc3Vic2NyaXB0aW9uLnNjb3BlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfY29tZXRkLm9uTGlzdGVuZXJFeGNlcHRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgbGlzdGVuZXIgZXhjZXB0aW9uIGhhbmRsZXInLCBzdWJzY3JpcHRpb24sIHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChfY29tZXRkLCB4LCBzdWJzY3JpcHRpb24sIHN1YnNjcmlwdGlvbi5saXN0ZW5lciwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgbGlzdGVuZXIgZXhjZXB0aW9uIGhhbmRsZXInLCBzdWJzY3JpcHRpb24sIHh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGxpc3RlbmVyJywgc3Vic2NyaXB0aW9uLCBtZXNzYWdlLCB4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9ub3RpZnlMaXN0ZW5lcnMoY2hhbm5lbCwgbWVzc2FnZSkge1xuICAgICAgICAvLyBOb3RpZnkgZGlyZWN0IGxpc3RlbmVyc1xuICAgICAgICBfbm90aWZ5KGNoYW5uZWwsIG1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIE5vdGlmeSB0aGUgZ2xvYmJpbmcgbGlzdGVuZXJzXG4gICAgICAgIHZhciBjaGFubmVsUGFydHMgPSBjaGFubmVsLnNwbGl0KCcvJyk7XG4gICAgICAgIHZhciBsYXN0ID0gY2hhbm5lbFBhcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgIGZvciAodmFyIGkgPSBsYXN0OyBpID4gMDsgLS1pKSB7XG4gICAgICAgICAgICB2YXIgY2hhbm5lbFBhcnQgPSBjaGFubmVsUGFydHMuc2xpY2UoMCwgaSkuam9pbignLycpICsgJy8qJztcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gbm90aWZ5IC9mb28vKiBpZiB0aGUgY2hhbm5lbCBpcyAvZm9vL2Jhci9iYXosXG4gICAgICAgICAgICAvLyBzbyB3ZSBzdG9wIGF0IHRoZSBmaXJzdCBub24gcmVjdXJzaXZlIGdsb2JiaW5nXG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFzdCkge1xuICAgICAgICAgICAgICAgIF9ub3RpZnkoY2hhbm5lbFBhcnQsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQWRkIHRoZSByZWN1cnNpdmUgZ2xvYmJlciBhbmQgbm90aWZ5XG4gICAgICAgICAgICBjaGFubmVsUGFydCArPSAnKic7XG4gICAgICAgICAgICBfbm90aWZ5KGNoYW5uZWxQYXJ0LCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jYW5jZWxEZWxheWVkU2VuZCgpIHtcbiAgICAgICAgaWYgKF9zY2hlZHVsZWRTZW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICBVdGlscy5jbGVhclRpbWVvdXQoX3NjaGVkdWxlZFNlbmQpO1xuICAgICAgICB9XG4gICAgICAgIF9zY2hlZHVsZWRTZW5kID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGVsYXllZFNlbmQob3BlcmF0aW9uLCBkZWxheSkge1xuICAgICAgICBfY2FuY2VsRGVsYXllZFNlbmQoKTtcbiAgICAgICAgdmFyIHRpbWUgPSBfYWR2aWNlLmludGVydmFsICsgZGVsYXk7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdGdW5jdGlvbiBzY2hlZHVsZWQgaW4nLCB0aW1lLCAnbXMsIGludGVydmFsID0nLCBfYWR2aWNlLmludGVydmFsLCAnYmFja29mZiA9JywgX2JhY2tvZmYsIG9wZXJhdGlvbik7XG4gICAgICAgIF9zY2hlZHVsZWRTZW5kID0gVXRpbHMuc2V0VGltZW91dChfY29tZXRkLCBvcGVyYXRpb24sIHRpbWUpO1xuICAgIH1cblxuICAgIC8vIE5lZWRlZCB0byBicmVhayBjeWNsaWMgZGVwZW5kZW5jaWVzIGJldHdlZW4gZnVuY3Rpb24gZGVmaW5pdGlvbnNcbiAgICB2YXIgX2hhbmRsZU1lc3NhZ2VzO1xuICAgIHZhciBfaGFuZGxlRmFpbHVyZTtcblxuICAgIC8qKlxuICAgICAqIERlbGl2ZXJzIHRoZSBtZXNzYWdlcyB0byB0aGUgQ29tZXREIHNlcnZlclxuICAgICAqIEBwYXJhbSBzeW5jIHdoZXRoZXIgdGhlIHNlbmQgaXMgc3luY2hyb25vdXNcbiAgICAgKiBAcGFyYW0gbWVzc2FnZXMgdGhlIGFycmF5IG9mIG1lc3NhZ2VzIHRvIHNlbmRcbiAgICAgKiBAcGFyYW0gbWV0YUNvbm5lY3QgdHJ1ZSBpZiB0aGlzIHNlbmQgaXMgb24gL21ldGEvY29ubmVjdFxuICAgICAqIEBwYXJhbSBleHRyYVBhdGggYW4gZXh0cmEgcGF0aCB0byBhcHBlbmQgdG8gdGhlIEJheWV1eCBzZXJ2ZXIgVVJMXG4gICAgICovXG4gICAgZnVuY3Rpb24gX3NlbmQoc3luYywgbWVzc2FnZXMsIG1ldGFDb25uZWN0LCBleHRyYVBhdGgpIHtcbiAgICAgICAgLy8gV2UgbXVzdCBiZSBzdXJlIHRoYXQgdGhlIG1lc3NhZ2VzIGhhdmUgYSBjbGllbnRJZC5cbiAgICAgICAgLy8gVGhpcyBpcyBub3QgZ3VhcmFudGVlZCBzaW5jZSB0aGUgaGFuZHNoYWtlIG1heSB0YWtlIHRpbWUgdG8gcmV0dXJuXG4gICAgICAgIC8vIChhbmQgaGVuY2UgdGhlIGNsaWVudElkIGlzIG5vdCBrbm93biB5ZXQpIGFuZCB0aGUgYXBwbGljYXRpb25cbiAgICAgICAgLy8gbWF5IGNyZWF0ZSBvdGhlciBtZXNzYWdlcy5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlSWQgPSBtZXNzYWdlLmlkO1xuXG4gICAgICAgICAgICBpZiAoX2NsaWVudElkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5jbGllbnRJZCA9IF9jbGllbnRJZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWVzc2FnZSA9IF9hcHBseU91dGdvaW5nRXh0ZW5zaW9ucyhtZXNzYWdlKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQgJiYgbWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIEV4dGVuc2lvbnMgbWF5IGhhdmUgbW9kaWZpZWQgdGhlIG1lc3NhZ2UgaWQsIGJ1dCB3ZSBuZWVkIHRvIG93biBpdC5cbiAgICAgICAgICAgICAgICBtZXNzYWdlLmlkID0gbWVzc2FnZUlkO1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VzW2ldID0gbWVzc2FnZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIF9jYWxsYmFja3NbbWVzc2FnZUlkXTtcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5zcGxpY2UoaS0tLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXNzYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICBpZiAoX2NvbmZpZy5hcHBlbmRNZXNzYWdlVHlwZVRvVVJMKSB7XG4gICAgICAgICAgICAvLyBJZiB1cmwgZG9lcyBub3QgZW5kIHdpdGggJy8nLCB0aGVuIGFwcGVuZCBpdFxuICAgICAgICAgICAgaWYgKCF1cmwubWF0Y2goL1xcLyQvKSkge1xuICAgICAgICAgICAgICAgIHVybCA9IHVybCArICcvJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHRyYVBhdGgpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyBleHRyYVBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW52ZWxvcGUgPSB7XG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIHN5bmM6IHN5bmMsXG4gICAgICAgICAgICBtZXNzYWdlczogbWVzc2FnZXMsXG4gICAgICAgICAgICBvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJjdmRNZXNzYWdlcykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kbGVNZXNzYWdlcy5jYWxsKF9jb21ldGQsIHJjdmRNZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGhhbmRsaW5nIG9mIG1lc3NhZ2VzJywgeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uRmFpbHVyZTogZnVuY3Rpb24oY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNwb3J0ID0gX2NvbWV0ZC5nZXRUcmFuc3BvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZS5jb25uZWN0aW9uVHlwZSA9IHRyYW5zcG9ydCA/IHRyYW5zcG9ydC5nZXRUeXBlKCkgOiBcInVua25vd25cIjtcbiAgICAgICAgICAgICAgICAgICAgX2hhbmRsZUZhaWx1cmUuY2FsbChfY29tZXRkLCBjb25kdWl0LCBtZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGhhbmRsaW5nIG9mIGZhaWx1cmUnLCB4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdTZW5kJywgZW52ZWxvcGUpO1xuICAgICAgICBfdHJhbnNwb3J0LnNlbmQoZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcXVldWVTZW5kKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKF9iYXRjaCA+IDAgfHwgX2ludGVybmFsQmF0Y2ggPT09IHRydWUpIHtcbiAgICAgICAgICAgIF9tZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9zZW5kKGZhbHNlLCBbbWVzc2FnZV0sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGEgY29tcGxldGUgYmF5ZXV4IG1lc3NhZ2UuXG4gICAgICogVGhpcyBtZXRob2QgaXMgZXhwb3NlZCBhcyBhIHB1YmxpYyBzbyB0aGF0IGV4dGVuc2lvbnMgbWF5IHVzZSBpdFxuICAgICAqIHRvIHNlbmQgYmF5ZXV4IG1lc3NhZ2UgZGlyZWN0bHksIGZvciBleGFtcGxlIGluIGNhc2Ugb2YgcmUtc2VuZGluZ1xuICAgICAqIG1lc3NhZ2VzIHRoYXQgaGF2ZSBhbHJlYWR5IGJlZW4gc2VudCBidXQgdGhhdCBmb3Igc29tZSByZWFzb24gbXVzdFxuICAgICAqIGJlIHJlc2VudC5cbiAgICAgKi9cbiAgICB0aGlzLnNlbmQgPSBfcXVldWVTZW5kO1xuXG4gICAgZnVuY3Rpb24gX3Jlc2V0QmFja29mZigpIHtcbiAgICAgICAgX2JhY2tvZmYgPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmNyZWFzZUJhY2tvZmYoKSB7XG4gICAgICAgIGlmIChfYmFja29mZiA8IF9jb25maWcubWF4QmFja29mZikge1xuICAgICAgICAgICAgX2JhY2tvZmYgKz0gX2NvbmZpZy5iYWNrb2ZmSW5jcmVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfYmFja29mZjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYSB0aGUgYmF0Y2ggb2YgbWVzc2FnZXMgdG8gYmUgc2VudCBpbiBhIHNpbmdsZSByZXF1ZXN0LlxuICAgICAqIEBzZWUgI19lbmRCYXRjaChzZW5kTWVzc2FnZXMpXG4gICAgICovXG4gICAgZnVuY3Rpb24gX3N0YXJ0QmF0Y2goKSB7XG4gICAgICAgICsrX2JhdGNoO1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU3RhcnRpbmcgYmF0Y2gsIGRlcHRoJywgX2JhdGNoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmx1c2hCYXRjaCgpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gX21lc3NhZ2VRdWV1ZTtcbiAgICAgICAgX21lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgX3NlbmQoZmFsc2UsIG1lc3NhZ2VzLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmRzIHRoZSBiYXRjaCBvZiBtZXNzYWdlcyB0byBiZSBzZW50IGluIGEgc2luZ2xlIHJlcXVlc3QsXG4gICAgICogb3B0aW9uYWxseSBzZW5kaW5nIG1lc3NhZ2VzIHByZXNlbnQgaW4gdGhlIG1lc3NhZ2UgcXVldWUgZGVwZW5kaW5nXG4gICAgICogb24gdGhlIGdpdmVuIGFyZ3VtZW50LlxuICAgICAqIEBzZWUgI19zdGFydEJhdGNoKClcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfZW5kQmF0Y2goKSB7XG4gICAgICAgIC0tX2JhdGNoO1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnRW5kaW5nIGJhdGNoLCBkZXB0aCcsIF9iYXRjaCk7XG4gICAgICAgIGlmIChfYmF0Y2ggPCAwKSB7XG4gICAgICAgICAgICB0aHJvdyAnQ2FsbHMgdG8gc3RhcnRCYXRjaCgpIGFuZCBlbmRCYXRjaCgpIGFyZSBub3QgcGFpcmVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfYmF0Y2ggPT09IDAgJiYgIV9pc0Rpc2Nvbm5lY3RlZCgpICYmICFfaW50ZXJuYWxCYXRjaCkge1xuICAgICAgICAgICAgX2ZsdXNoQmF0Y2goKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIHRoZSBjb25uZWN0IG1lc3NhZ2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfY29ubmVjdCgpIHtcbiAgICAgICAgaWYgKCFfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL2Nvbm5lY3QnLFxuICAgICAgICAgICAgICAgIGNvbm5lY3Rpb25UeXBlOiBfdHJhbnNwb3J0LmdldFR5cGUoKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gSW4gY2FzZSBvZiByZWxvYWQgb3IgdGVtcG9yYXJ5IGxvc3Mgb2YgY29ubmVjdGlvblxuICAgICAgICAgICAgLy8gd2Ugd2FudCB0aGUgbmV4dCBzdWNjZXNzZnVsIGNvbm5lY3QgdG8gcmV0dXJuIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIGJlaW5nIGhlbGQgYnkgdGhlIHNlcnZlciwgc28gdGhhdCBjb25uZWN0IGxpc3RlbmVyc1xuICAgICAgICAgICAgLy8gY2FuIGJlIG5vdGlmaWVkIHRoYXQgdGhlIGNvbm5lY3Rpb24gaGFzIGJlZW4gcmUtZXN0YWJsaXNoZWRcbiAgICAgICAgICAgIGlmICghX2Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIGJheWV1eE1lc3NhZ2UuYWR2aWNlID0geyB0aW1lb3V0OiAwIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9zZXRTdGF0dXMoJ2Nvbm5lY3RpbmcnKTtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdDb25uZWN0IHNlbnQnLCBiYXlldXhNZXNzYWdlKTtcbiAgICAgICAgICAgIF9zZW5kKGZhbHNlLCBbYmF5ZXV4TWVzc2FnZV0sIHRydWUsICdjb25uZWN0Jyk7XG4gICAgICAgICAgICBfc2V0U3RhdHVzKCdjb25uZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kZWxheWVkQ29ubmVjdChkZWxheSkge1xuICAgICAgICBfc2V0U3RhdHVzKCdjb25uZWN0aW5nJyk7XG4gICAgICAgIF9kZWxheWVkU2VuZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF9jb25uZWN0KCk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdXBkYXRlQWR2aWNlKG5ld0FkdmljZSkge1xuICAgICAgICBpZiAobmV3QWR2aWNlKSB7XG4gICAgICAgICAgICBfYWR2aWNlID0gX2NvbWV0ZC5fbWl4aW4oZmFsc2UsIHt9LCBfY29uZmlnLmFkdmljZSwgbmV3QWR2aWNlKTtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdOZXcgYWR2aWNlJywgX2FkdmljZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGlzY29ubmVjdChhYm9ydCkge1xuICAgICAgICBfY2FuY2VsRGVsYXllZFNlbmQoKTtcbiAgICAgICAgaWYgKGFib3J0ICYmIF90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnQuYWJvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICBfY2xpZW50SWQgPSBudWxsO1xuICAgICAgICBfc2V0U3RhdHVzKCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgX2JhdGNoID0gMDtcbiAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgICAgICBfdHJhbnNwb3J0ID0gbnVsbDtcblxuICAgICAgICAvLyBGYWlsIGFueSBleGlzdGluZyBxdWV1ZWQgbWVzc2FnZVxuICAgICAgICBpZiAoX21lc3NhZ2VRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBfbWVzc2FnZVF1ZXVlO1xuICAgICAgICAgICAgX21lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgICAgICAgICAgX2hhbmRsZUZhaWx1cmUuY2FsbChfY29tZXRkLCB1bmRlZmluZWQsIG1lc3NhZ2VzLCB7XG4gICAgICAgICAgICAgICAgcmVhc29uOiAnRGlzY29ubmVjdGVkJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5VHJhbnNwb3J0RXhjZXB0aW9uKG9sZFRyYW5zcG9ydCwgbmV3VHJhbnNwb3J0LCBmYWlsdXJlKSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vblRyYW5zcG9ydEV4Y2VwdGlvbjtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgdHJhbnNwb3J0IGV4Y2VwdGlvbiBoYW5kbGVyJywgb2xkVHJhbnNwb3J0LCBuZXdUcmFuc3BvcnQsIGZhaWx1cmUpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoX2NvbWV0ZCwgZmFpbHVyZSwgb2xkVHJhbnNwb3J0LCBuZXdUcmFuc3BvcnQpO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIHRyYW5zcG9ydCBleGNlcHRpb24gaGFuZGxlcicsIHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgdGhlIGluaXRpYWwgaGFuZHNoYWtlIG1lc3NhZ2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzLCBoYW5kc2hha2VDYWxsYmFjaykge1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZHNoYWtlUHJvcHMpKSB7XG4gICAgICAgICAgICBoYW5kc2hha2VDYWxsYmFjayA9IGhhbmRzaGFrZVByb3BzO1xuICAgICAgICAgICAgaGFuZHNoYWtlUHJvcHMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBfY2xpZW50SWQgPSBudWxsO1xuXG4gICAgICAgIF9jbGVhclN1YnNjcmlwdGlvbnMoKTtcblxuICAgICAgICAvLyBSZXNldCB0aGUgdHJhbnNwb3J0cyBpZiB3ZSdyZSBub3QgcmV0cnlpbmcgdGhlIGhhbmRzaGFrZVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnRzLnJlc2V0KHRydWUpO1xuICAgICAgICAgICAgX3VwZGF0ZUFkdmljZShfY29uZmlnLmFkdmljZSk7XG4gICAgICAgIH1cblxuICAgICAgICBfYmF0Y2ggPSAwO1xuXG4gICAgICAgIC8vIE1hcmsgdGhlIHN0YXJ0IG9mIGFuIGludGVybmFsIGJhdGNoLlxuICAgICAgICAvLyBUaGlzIGlzIG5lZWRlZCBiZWNhdXNlIGhhbmRzaGFrZSBhbmQgY29ubmVjdCBhcmUgYXN5bmMuXG4gICAgICAgIC8vIEl0IG1heSBoYXBwZW4gdGhhdCB0aGUgYXBwbGljYXRpb24gY2FsbHMgaW5pdCgpIHRoZW4gc3Vic2NyaWJlKClcbiAgICAgICAgLy8gYW5kIHRoZSBzdWJzY3JpYmUgbWVzc2FnZSBpcyBzZW50IGJlZm9yZSB0aGUgY29ubmVjdCBtZXNzYWdlLCBpZlxuICAgICAgICAvLyB0aGUgc3Vic2NyaWJlIG1lc3NhZ2UgaXMgbm90IGhlbGQgdW50aWwgdGhlIGNvbm5lY3QgbWVzc2FnZSBpcyBzZW50LlxuICAgICAgICAvLyBTbyBoZXJlIHdlIHN0YXJ0IGEgYmF0Y2ggdG8gaG9sZCB0ZW1wb3JhcmlseSBhbnkgbWVzc2FnZSB1bnRpbFxuICAgICAgICAvLyB0aGUgY29ubmVjdGlvbiBpcyBmdWxseSBlc3RhYmxpc2hlZC5cbiAgICAgICAgX2ludGVybmFsQmF0Y2ggPSB0cnVlO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIHByb3BlcnRpZXMgcHJvdmlkZWQgYnkgdGhlIHVzZXIsIHNvIHRoYXRcbiAgICAgICAgLy8gd2UgY2FuIHJldXNlIHRoZW0gZHVyaW5nIGF1dG9tYXRpYyByZS1oYW5kc2hha2VcbiAgICAgICAgX2hhbmRzaGFrZVByb3BzID0gaGFuZHNoYWtlUHJvcHM7XG4gICAgICAgIF9oYW5kc2hha2VDYWxsYmFjayA9IGhhbmRzaGFrZUNhbGxiYWNrO1xuXG4gICAgICAgIHZhciB2ZXJzaW9uID0gJzEuMCc7XG5cbiAgICAgICAgLy8gRmlndXJlIG91dCB0aGUgdHJhbnNwb3J0cyB0byBzZW5kIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgdmFyIHVybCA9IF9jb21ldGQuZ2V0VVJMKCk7XG4gICAgICAgIHZhciB0cmFuc3BvcnRUeXBlcyA9IF90cmFuc3BvcnRzLmZpbmRUcmFuc3BvcnRUeXBlcyh2ZXJzaW9uLCBfY3Jvc3NEb21haW4sIHVybCk7XG5cbiAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgICBtaW5pbXVtVmVyc2lvbjogdmVyc2lvbixcbiAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS9oYW5kc2hha2UnLFxuICAgICAgICAgICAgc3VwcG9ydGVkQ29ubmVjdGlvblR5cGVzOiB0cmFuc3BvcnRUeXBlcyxcbiAgICAgICAgICAgIGFkdmljZToge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IF9hZHZpY2UudGltZW91dCxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogX2FkdmljZS5pbnRlcnZhbFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBfY29tZXRkLl9taXhpbihmYWxzZSwge30sIF9oYW5kc2hha2VQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIGhhbmRzaGFrZUNhbGxiYWNrKTtcblxuICAgICAgICAvLyBQaWNrIHVwIHRoZSBmaXJzdCBhdmFpbGFibGUgdHJhbnNwb3J0IGFzIGluaXRpYWwgdHJhbnNwb3J0XG4gICAgICAgIC8vIHNpbmNlIHdlIGRvbid0IGtub3cgaWYgdGhlIHNlcnZlciBzdXBwb3J0cyBpdFxuICAgICAgICBpZiAoIV90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnQgPSBfdHJhbnNwb3J0cy5uZWdvdGlhdGVUcmFuc3BvcnQodHJhbnNwb3J0VHlwZXMsIHZlcnNpb24sIF9jcm9zc0RvbWFpbiwgdXJsKTtcbiAgICAgICAgICAgIGlmICghX3RyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0gJ0NvdWxkIG5vdCBmaW5kIGluaXRpYWwgdHJhbnNwb3J0IGFtb25nOiAnICsgX3RyYW5zcG9ydHMuZ2V0VHJhbnNwb3J0VHlwZXMoKTtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl93YXJuKGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgIHRocm93IGZhaWx1cmU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW5pdGlhbCB0cmFuc3BvcnQgaXMnLCBfdHJhbnNwb3J0LmdldFR5cGUoKSk7XG5cbiAgICAgICAgLy8gV2Ugc3RhcnRlZCBhIGJhdGNoIHRvIGhvbGQgdGhlIGFwcGxpY2F0aW9uIG1lc3NhZ2VzLFxuICAgICAgICAvLyBzbyBoZXJlIHdlIG11c3QgYnlwYXNzIGl0IGFuZCBzZW5kIGltbWVkaWF0ZWx5LlxuICAgICAgICBfc2V0U3RhdHVzKCdoYW5kc2hha2luZycpO1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSGFuZHNoYWtlIHNlbnQnLCBtZXNzYWdlKTtcbiAgICAgICAgX3NlbmQoZmFsc2UsIFttZXNzYWdlXSwgZmFsc2UsICdoYW5kc2hha2UnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGVsYXllZEhhbmRzaGFrZShkZWxheSkge1xuICAgICAgICBfc2V0U3RhdHVzKCdoYW5kc2hha2luZycpO1xuXG4gICAgICAgIC8vIFdlIHdpbGwgY2FsbCBfaGFuZHNoYWtlKCkgd2hpY2ggd2lsbCByZXNldCBfY2xpZW50SWQsIGJ1dCB3ZSB3YW50IHRvIGF2b2lkXG4gICAgICAgIC8vIHRoYXQgYmV0d2VlbiB0aGUgZW5kIG9mIHRoaXMgbWV0aG9kIGFuZCB0aGUgY2FsbCB0byBfaGFuZHNoYWtlKCkgc29tZW9uZSBtYXlcbiAgICAgICAgLy8gY2FsbCBwdWJsaXNoKCkgKG9yIG90aGVyIG1ldGhvZHMgdGhhdCBjYWxsIF9xdWV1ZVNlbmQoKSkuXG4gICAgICAgIF9pbnRlcm5hbEJhdGNoID0gdHJ1ZTtcblxuICAgICAgICBfZGVsYXllZFNlbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfaGFuZHNoYWtlKF9oYW5kc2hha2VQcm9wcywgX2hhbmRzaGFrZUNhbGxiYWNrKTtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9ub3RpZnlDYWxsYmFjayhjYWxsYmFjaywgbWVzc2FnZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbChfY29tZXRkLCBtZXNzYWdlKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBfY29tZXRkLm9uQ2FsbGJhY2tFeGNlcHRpb247XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgY2FsbGJhY2sgZXhjZXB0aW9uIGhhbmRsZXInLCB4KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoX2NvbWV0ZCwgeCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoeHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgY2FsbGJhY2sgZXhjZXB0aW9uIGhhbmRsZXInLCB4eCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBtZXNzYWdlIGNhbGxiYWNrJywgeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9nZXRDYWxsYmFjayA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCkge1xuICAgICAgICByZXR1cm4gX2NhbGxiYWNrc1ttZXNzYWdlSWRdO1xuICAgIH07XG5cbiAgICB0aGlzLl9wdXRDYWxsYmFjayA9IGZ1bmN0aW9uKG1lc3NhZ2VJZCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2dldENhbGxiYWNrKG1lc3NhZ2VJZCk7XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIF9jYWxsYmFja3NbbWVzc2FnZUlkXSA9IGNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IF9jb21ldGQuX2dldENhbGxiYWNrKFttZXNzYWdlLmlkXSk7XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBfY2FsbGJhY2tzW21lc3NhZ2UuaWRdO1xuICAgICAgICAgICAgX25vdGlmeUNhbGxiYWNrKGNhbGxiYWNrLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oYW5kbGVSZW1vdGVDYWxsKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBfcmVtb3RlQ2FsbHNbbWVzc2FnZS5pZF07XG4gICAgICAgIGRlbGV0ZSBfcmVtb3RlQ2FsbHNbbWVzc2FnZS5pZF07XG4gICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSGFuZGxpbmcgcmVtb3RlIGNhbGwgcmVzcG9uc2UgZm9yJywgbWVzc2FnZSwgJ3dpdGggY29udGV4dCcsIGNvbnRleHQpO1xuXG4gICAgICAgICAgICAvLyBDbGVhciB0aGUgdGltZW91dCwgaWYgcHJlc2VudC5cbiAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gY29udGV4dC50aW1lb3V0O1xuICAgICAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBVdGlscy5jbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGNvbnRleHQuY2FsbGJhY2s7XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgX25vdGlmeUNhbGxiYWNrKGNhbGxiYWNrLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5vblRyYW5zcG9ydEZhaWx1cmUgPSBmdW5jdGlvbihtZXNzYWdlLCBmYWlsdXJlSW5mbywgZmFpbHVyZUhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCBmYWlsdXJlJywgZmFpbHVyZUluZm8sICdmb3InLCBtZXNzYWdlKTtcblxuICAgICAgICB2YXIgdHJhbnNwb3J0cyA9IHRoaXMuZ2V0VHJhbnNwb3J0UmVnaXN0cnkoKTtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuZ2V0VVJMKCk7XG4gICAgICAgIHZhciBjcm9zc0RvbWFpbiA9IHRoaXMuX2lzQ3Jvc3NEb21haW4oX3NwbGl0VVJMKHVybClbMl0pO1xuICAgICAgICB2YXIgdmVyc2lvbiA9ICcxLjAnO1xuICAgICAgICB2YXIgdHJhbnNwb3J0VHlwZXMgPSB0cmFuc3BvcnRzLmZpbmRUcmFuc3BvcnRUeXBlcyh2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKTtcblxuICAgICAgICBpZiAoZmFpbHVyZUluZm8uYWN0aW9uID09PSAnbm9uZScpIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09ICcvbWV0YS9oYW5kc2hha2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmYWlsdXJlSW5mby50cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSAnQ291bGQgbm90IG5lZ290aWF0ZSB0cmFuc3BvcnQsIGNsaWVudD1bJyArIHRyYW5zcG9ydFR5cGVzICsgJ10sIHNlcnZlcj1bJyArIG1lc3NhZ2Uuc3VwcG9ydGVkQ29ubmVjdGlvblR5cGVzICsgJ10nO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl93YXJuKGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICBfbm90aWZ5VHJhbnNwb3J0RXhjZXB0aW9uKF90cmFuc3BvcnQuZ2V0VHlwZSgpLCBudWxsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IGZhaWx1cmUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogX3RyYW5zcG9ydC5nZXRUeXBlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IF90cmFuc3BvcnRcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbHVyZUluZm8uZGVsYXkgPSB0aGlzLmdldEJhY2tvZmZQZXJpb2QoKTtcbiAgICAgICAgICAgIC8vIERpZmZlcmVudCBsb2dpYyBkZXBlbmRpbmcgb24gd2hldGhlciB3ZSBhcmUgaGFuZHNoYWtpbmcgb3IgY29ubmVjdGluZy5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09ICcvbWV0YS9oYW5kc2hha2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFmYWlsdXJlSW5mby50cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHRyYW5zcG9ydCBpcyBpbnZhbGlkLCB0cnkgdG8gbmVnb3RpYXRlIGFnYWluLlxuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VHJhbnNwb3J0ID0gdHJhbnNwb3J0cy5uZWdvdGlhdGVUcmFuc3BvcnQodHJhbnNwb3J0VHlwZXMsIHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW5ld1RyYW5zcG9ydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2FybignQ291bGQgbm90IG5lZ290aWF0ZSB0cmFuc3BvcnQsIGNsaWVudD1bJyArIHRyYW5zcG9ydFR5cGVzICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9ub3RpZnlUcmFuc3BvcnRFeGNlcHRpb24oX3RyYW5zcG9ydC5nZXRUeXBlKCksIG51bGwsIG1lc3NhZ2UuZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgX3RyYW5zcG9ydC5nZXRUeXBlKCksICctPicsIG5ld1RyYW5zcG9ydC5nZXRUeXBlKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihfdHJhbnNwb3J0LmdldFR5cGUoKSwgbmV3VHJhbnNwb3J0LmdldFR5cGUoKSwgbWVzc2FnZS5mYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmFjdGlvbiA9ICdoYW5kc2hha2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8udHJhbnNwb3J0ID0gbmV3VHJhbnNwb3J0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZhaWx1cmVJbmZvLmFjdGlvbiAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5jcmVhc2VCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoX3VuY29ubmVjdFRpbWUgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgX3VuY29ubmVjdFRpbWUgPSBub3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZhaWx1cmVJbmZvLmFjdGlvbiA9PT0gJ3JldHJ5Jykge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5kZWxheSA9IHRoaXMuaW5jcmVhc2VCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIHdoZXRoZXIgd2UgbWF5IHN3aXRjaCB0byBoYW5kc2hha2luZy5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG1heEludGVydmFsID0gX2FkdmljZS5tYXhJbnRlcnZhbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1heEludGVydmFsID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV4cGlyYXRpb24gPSBfYWR2aWNlLnRpbWVvdXQgKyBfYWR2aWNlLmludGVydmFsICsgbWF4SW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5jb25uZWN0ZWQgPSBub3cgLSBfdW5jb25uZWN0VGltZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmNvbm5lY3RlZCArIF9iYWNrb2ZmID4gZXhwaXJhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmFjdGlvbiA9ICdoYW5kc2hha2UnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZhaWx1cmVJbmZvLmFjdGlvbiA9PT0gJ2hhbmRzaGFrZScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uZGVsYXkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0cmFuc3BvcnRzLnJlc2V0KGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldEJhY2tvZmZQZXJpb2QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmYWlsdXJlSGFuZGxlci5jYWxsKF9jb21ldGQsIGZhaWx1cmVJbmZvKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2hhbmRsZVRyYW5zcG9ydEZhaWx1cmUoZmFpbHVyZUluZm8pIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCBmYWlsdXJlIGhhbmRsaW5nJywgZmFpbHVyZUluZm8pO1xuXG4gICAgICAgIGlmIChmYWlsdXJlSW5mby50cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnQgPSBmYWlsdXJlSW5mby50cmFuc3BvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmFpbHVyZUluZm8udXJsKSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0LnNldFVSTChmYWlsdXJlSW5mby51cmwpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFjdGlvbiA9IGZhaWx1cmVJbmZvLmFjdGlvbjtcbiAgICAgICAgdmFyIGRlbGF5ID0gZmFpbHVyZUluZm8uZGVsYXkgfHwgMDtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2hhbmRzaGFrZSc6XG4gICAgICAgICAgICAgICAgX2RlbGF5ZWRIYW5kc2hha2UoZGVsYXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmV0cnknOlxuICAgICAgICAgICAgICAgIF9kZWxheWVkQ29ubmVjdChkZWxheSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgICAgICBfZGlzY29ubmVjdCh0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgJ1Vua25vd24gYWN0aW9uICcgKyBhY3Rpb247XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbEhhbmRzaGFrZShtZXNzYWdlLCBmYWlsdXJlSW5mbykge1xuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2hhbmRzaGFrZScsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcblxuICAgICAgICAvLyBUaGUgbGlzdGVuZXJzIG1heSBoYXZlIGRpc2Nvbm5lY3RlZC5cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICBfY29tZXRkLm9uVHJhbnNwb3J0RmFpbHVyZS5jYWxsKF9jb21ldGQsIG1lc3NhZ2UsIGZhaWx1cmVJbmZvLCBfaGFuZGxlVHJhbnNwb3J0RmFpbHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2hhbmRzaGFrZVJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHVybCA9IF9jb21ldGQuZ2V0VVJMKCk7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIHZhciBjcm9zc0RvbWFpbiA9IF9jb21ldGQuX2lzQ3Jvc3NEb21haW4oX3NwbGl0VVJMKHVybClbMl0pO1xuICAgICAgICAgICAgdmFyIG5ld1RyYW5zcG9ydCA9IF90cmFuc3BvcnRzLm5lZ290aWF0ZVRyYW5zcG9ydChtZXNzYWdlLnN1cHBvcnRlZENvbm5lY3Rpb25UeXBlcywgbWVzc2FnZS52ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKTtcbiAgICAgICAgICAgIGlmIChuZXdUcmFuc3BvcnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnN1Y2Nlc3NmdWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBfZmFpbEhhbmRzaGFrZShtZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhdXNlOiAnbmVnb3RpYXRpb24nLFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0OiBudWxsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfdHJhbnNwb3J0ICE9PSBuZXdUcmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVHJhbnNwb3J0JywgX3RyYW5zcG9ydC5nZXRUeXBlKCksICctPicsIG5ld1RyYW5zcG9ydC5nZXRUeXBlKCkpO1xuICAgICAgICAgICAgICAgIF90cmFuc3BvcnQgPSBuZXdUcmFuc3BvcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9jbGllbnRJZCA9IG1lc3NhZ2UuY2xpZW50SWQ7XG5cbiAgICAgICAgICAgIC8vIEVuZCB0aGUgaW50ZXJuYWwgYmF0Y2ggYW5kIGFsbG93IGhlbGQgbWVzc2FnZXMgZnJvbSB0aGUgYXBwbGljYXRpb25cbiAgICAgICAgICAgIC8vIHRvIGdvIHRvIHRoZSBzZXJ2ZXIgKHNlZSBfaGFuZHNoYWtlKCkgd2hlcmUgd2Ugc3RhcnQgdGhlIGludGVybmFsIGJhdGNoKS5cbiAgICAgICAgICAgIF9pbnRlcm5hbEJhdGNoID0gZmFsc2U7XG4gICAgICAgICAgICBfZmx1c2hCYXRjaCgpO1xuXG4gICAgICAgICAgICAvLyBIZXJlIHRoZSBuZXcgdHJhbnNwb3J0IGlzIGluIHBsYWNlLCBhcyB3ZWxsIGFzIHRoZSBjbGllbnRJZCwgc29cbiAgICAgICAgICAgIC8vIHRoZSBsaXN0ZW5lcnMgY2FuIHBlcmZvcm0gYSBwdWJsaXNoKCkgaWYgdGhleSB3YW50LlxuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSBsaXN0ZW5lcnMgYmVmb3JlIHRoZSBjb25uZWN0IGJlbG93LlxuICAgICAgICAgICAgbWVzc2FnZS5yZWVzdGFibGlzaCA9IF9yZWVzdGFibGlzaDtcbiAgICAgICAgICAgIF9yZWVzdGFibGlzaCA9IHRydWU7XG5cbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2hhbmRzaGFrZScsIG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBfaGFuZHNoYWtlTWVzc2FnZXMgPSBtZXNzYWdlWyd4LW1lc3NhZ2VzJ10gfHwgMDtcblxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9pc0Rpc2Nvbm5lY3RlZCgpID8gJ25vbmUnIDogX2FkdmljZS5yZWNvbm5lY3QgfHwgJ3JldHJ5JztcbiAgICAgICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAncmV0cnknOlxuICAgICAgICAgICAgICAgICAgICBfcmVzZXRCYWNrb2ZmKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfaGFuZHNoYWtlTWVzc2FnZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kZWxheWVkQ29ubmVjdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdQcm9jZXNzaW5nJywgX2hhbmRzaGFrZU1lc3NhZ2VzLCAnaGFuZHNoYWtlLWRlbGl2ZXJlZCBtZXNzYWdlcycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgICAgICAgICAgICBfZGlzY29ubmVjdCh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ1VucmVjb2duaXplZCBhZHZpY2UgYWN0aW9uICcgKyBhY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbEhhbmRzaGFrZShtZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgY2F1c2U6ICd1bnN1Y2Nlc3NmdWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogX2FkdmljZS5yZWNvbm5lY3QgfHwgJ2hhbmRzaGFrZScsXG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0OiBfdHJhbnNwb3J0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oYW5kc2hha2VGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwge1xuICAgICAgICAgICAgY2F1c2U6ICdmYWlsdXJlJyxcbiAgICAgICAgICAgIGFjdGlvbjogJ2hhbmRzaGFrZScsXG4gICAgICAgICAgICB0cmFuc3BvcnQ6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxDb25uZWN0KG1lc3NhZ2UsIGZhaWx1cmVJbmZvKSB7XG4gICAgICAgIC8vIE5vdGlmeSB0aGUgbGlzdGVuZXJzIGFmdGVyIHRoZSBzdGF0dXMgY2hhbmdlIGJ1dCBiZWZvcmUgdGhlIG5leHQgYWN0aW9uLlxuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9jb25uZWN0JywgbWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFRoZSBsaXN0ZW5lcnMgbWF5IGhhdmUgZGlzY29ubmVjdGVkLlxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIGZhaWx1cmVJbmZvLmFjdGlvbiA9ICdub25lJztcbiAgICAgICAgfVxuXG4gICAgICAgIF9jb21ldGQub25UcmFuc3BvcnRGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgbWVzc2FnZSwgZmFpbHVyZUluZm8sIF9oYW5kbGVUcmFuc3BvcnRGYWlsdXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IG1lc3NhZ2Uuc3VjY2Vzc2Z1bDtcblxuICAgICAgICBpZiAoX2Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvY29ubmVjdCcsIG1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBOb3JtYWxseSwgdGhlIGFkdmljZSB3aWxsIHNheSBcInJlY29ubmVjdDogJ3JldHJ5JywgaW50ZXJ2YWw6IDBcIlxuICAgICAgICAgICAgLy8gYW5kIHRoZSBzZXJ2ZXIgd2lsbCBob2xkIHRoZSByZXF1ZXN0LCBzbyB3aGVuIGEgcmVzcG9uc2UgcmV0dXJuc1xuICAgICAgICAgICAgLy8gd2UgaW1tZWRpYXRlbHkgY2FsbCB0aGUgc2VydmVyIGFnYWluIChsb25nIHBvbGxpbmcpLlxuICAgICAgICAgICAgLy8gTGlzdGVuZXJzIGNhbiBjYWxsIGRpc2Nvbm5lY3QoKSwgc28gY2hlY2sgdGhlIHN0YXRlIGFmdGVyIHRoZXkgcnVuLlxuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IF9pc0Rpc2Nvbm5lY3RlZCgpID8gJ25vbmUnIDogX2FkdmljZS5yZWNvbm5lY3QgfHwgJ3JldHJ5JztcbiAgICAgICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAncmV0cnknOlxuICAgICAgICAgICAgICAgICAgICBfcmVzZXRCYWNrb2ZmKCk7XG4gICAgICAgICAgICAgICAgICAgIF9kZWxheWVkQ29ubmVjdChfYmFja29mZik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICAgICAgICAgICAgICBfZGlzY29ubmVjdChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdVbnJlY29nbml6ZWQgYWR2aWNlIGFjdGlvbiAnICsgYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxDb25uZWN0KG1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICBjYXVzZTogJ3Vuc3VjY2Vzc2Z1bCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBfYWR2aWNlLnJlY29ubmVjdCB8fCAncmV0cnknLFxuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogX3RyYW5zcG9ydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29ubmVjdEZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgX2ZhaWxDb25uZWN0KG1lc3NhZ2UsIHtcbiAgICAgICAgICAgIGNhdXNlOiAnZmFpbHVyZScsXG4gICAgICAgICAgICBhY3Rpb246ICdyZXRyeScsXG4gICAgICAgICAgICB0cmFuc3BvcnQ6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxEaXNjb25uZWN0KG1lc3NhZ2UpIHtcbiAgICAgICAgX2Rpc2Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvZGlzY29ubmVjdCcsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGlzY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIC9tZXRhL2Nvbm5lY3QgdG8gYXJyaXZlLlxuICAgICAgICAgICAgX2Rpc2Nvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvZGlzY29ubmVjdCcsIG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxEaXNjb25uZWN0KG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc2Nvbm5lY3RGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2ZhaWxEaXNjb25uZWN0KG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsU3Vic2NyaWJlKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW21lc3NhZ2Uuc3Vic2NyaXB0aW9uXTtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBzdWJzY3JpcHRpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHN1YnNjcmlwdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHN1YnNjcmlwdGlvbiAmJiAhc3Vic2NyaXB0aW9uLmxpc3RlbmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBzdWJzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUmVtb3ZlZCBmYWlsZWQgc3Vic2NyaXB0aW9uJywgc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvc3Vic2NyaWJlJywgbWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3N1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxTdWJzY3JpYmUobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc3Vic2NyaWJlRmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsU3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsVW5zdWJzY3JpYmUobWVzc2FnZSkge1xuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3Vic2NyaWJlJywgbWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3VjY2Vzc2Z1bCcsIG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF91bnN1YnNjcmliZVJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWJzY3JpYmUnLCBtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsVW5zdWJzY3JpYmUobWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdW5zdWJzY3JpYmVGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2ZhaWxVbnN1YnNjcmliZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICBpZiAoIV9oYW5kbGVSZW1vdGVDYWxsKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9wdWJsaXNoJywgbWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tZXNzYWdlUmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmICghX2hhbmRsZVJlbW90ZUNhbGwobWVzc2FnZSkpIHtcbiAgICAgICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKG1lc3NhZ2UuY2hhbm5lbCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgaWYgKF9oYW5kc2hha2VNZXNzYWdlcyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLS1faGFuZHNoYWtlTWVzc2FnZXM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfaGFuZHNoYWtlTWVzc2FnZXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdQcm9jZXNzZWQgbGFzdCBoYW5kc2hha2UtZGVsaXZlcmVkIG1lc3NhZ2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9kZWxheWVkQ29ubmVjdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX3dhcm4oJ1Vua25vd24gQmF5ZXV4IE1lc3NhZ2UnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2Uuc3VjY2Vzc2Z1bCkge1xuICAgICAgICAgICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3B1Ymxpc2gnLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfZmFpbE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX21lc3NhZ2VGYWlsdXJlKGZhaWx1cmUpIHtcbiAgICAgICAgX2ZhaWxNZXNzYWdlKGZhaWx1cmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWNlaXZlKG1lc3NhZ2UpIHtcbiAgICAgICAgX3VuY29ubmVjdFRpbWUgPSAwO1xuXG4gICAgICAgIG1lc3NhZ2UgPSBfYXBwbHlJbmNvbWluZ0V4dGVuc2lvbnMobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlID09PSB1bmRlZmluZWQgfHwgbWVzc2FnZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3VwZGF0ZUFkdmljZShtZXNzYWdlLmFkdmljZSk7XG5cbiAgICAgICAgdmFyIGNoYW5uZWwgPSBtZXNzYWdlLmNoYW5uZWw7XG4gICAgICAgIHN3aXRjaCAoY2hhbm5lbCkge1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvaGFuZHNoYWtlJzpcbiAgICAgICAgICAgICAgICBfaGFuZHNoYWtlUmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS9jb25uZWN0JzpcbiAgICAgICAgICAgICAgICBfY29ubmVjdFJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvZGlzY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL3N1YnNjcmliZSc6XG4gICAgICAgICAgICAgICAgX3N1YnNjcmliZVJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvdW5zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgIF91bnN1YnNjcmliZVJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBfbWVzc2FnZVJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVjZWl2ZXMgYSBtZXNzYWdlLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGV4cG9zZWQgYXMgYSBwdWJsaWMgc28gdGhhdCBleHRlbnNpb25zIG1heSBpbmplY3RcbiAgICAgKiBtZXNzYWdlcyBzaW11bGF0aW5nIHRoYXQgdGhleSBoYWQgYmVlbiByZWNlaXZlZC5cbiAgICAgKi9cbiAgICB0aGlzLnJlY2VpdmUgPSBfcmVjZWl2ZTtcblxuICAgIF9oYW5kbGVNZXNzYWdlcyA9IGZ1bmN0aW9uKHJjdmRNZXNzYWdlcykge1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUmVjZWl2ZWQnLCByY3ZkTWVzc2FnZXMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmN2ZE1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHJjdmRNZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIF9yZWNlaXZlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9oYW5kbGVGYWlsdXJlID0gZnVuY3Rpb24oY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ2hhbmRsZUZhaWx1cmUnLCBjb25kdWl0LCBtZXNzYWdlcywgZmFpbHVyZSk7XG5cbiAgICAgICAgZmFpbHVyZS50cmFuc3BvcnQgPSBjb25kdWl0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgdmFyIGZhaWx1cmVNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBtZXNzYWdlLmlkLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6IG1lc3NhZ2UuY2hhbm5lbCxcbiAgICAgICAgICAgICAgICBmYWlsdXJlOiBmYWlsdXJlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgICAgIHN3aXRjaCAobWVzc2FnZS5jaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvaGFuZHNoYWtlJzpcbiAgICAgICAgICAgICAgICAgICAgX2hhbmRzaGFrZUZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS9jb25uZWN0JzpcbiAgICAgICAgICAgICAgICAgICAgX2Nvbm5lY3RGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvZGlzY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0RmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL3N1YnNjcmliZSc6XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVNZXNzYWdlLnN1YnNjcmlwdGlvbiA9IG1lc3NhZ2Uuc3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICBfc3Vic2NyaWJlRmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL3Vuc3Vic2NyaWJlJzpcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZU1lc3NhZ2Uuc3Vic2NyaXB0aW9uID0gbWVzc2FnZS5zdWJzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgICAgIF91bnN1YnNjcmliZUZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBfbWVzc2FnZUZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaGFzU3Vic2NyaXB0aW9ucyhjaGFubmVsKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tjaGFubmVsXTtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Jlc29sdmVTY29wZWRDYWxsYmFjayhzY29wZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0ge1xuICAgICAgICAgICAgc2NvcGU6IHNjb3BlLFxuICAgICAgICAgICAgbWV0aG9kOiBjYWxsYmFja1xuICAgICAgICB9O1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oc2NvcGUpKSB7XG4gICAgICAgICAgICBkZWxlZ2F0ZS5zY29wZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGRlbGVnYXRlLm1ldGhvZCA9IHNjb3BlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF9pc1N0cmluZyhjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNjb3BlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIHNjb3BlICcgKyBzY29wZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVsZWdhdGUubWV0aG9kID0gc2NvcGVbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGlmICghX2lzRnVuY3Rpb24oZGVsZWdhdGUubWV0aG9kKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBjYWxsYmFjayAnICsgY2FsbGJhY2sgKyAnIGZvciBzY29wZSAnICsgc2NvcGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgY2FsbGJhY2sgJyArIGNhbGxiYWNrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWxlZ2F0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrLCBpc0xpc3RlbmVyKSB7XG4gICAgICAgIC8vIFRoZSBkYXRhIHN0cnVjdHVyZSBpcyBhIG1hcDxjaGFubmVsLCBzdWJzY3JpcHRpb25bXT4sIHdoZXJlIGVhY2ggc3Vic2NyaXB0aW9uXG4gICAgICAgIC8vIGhvbGRzIHRoZSBjYWxsYmFjayB0byBiZSBjYWxsZWQgYW5kIGl0cyBzY29wZS5cblxuICAgICAgICB2YXIgZGVsZWdhdGUgPSBfcmVzb2x2ZVNjb3BlZENhbGxiYWNrKHNjb3BlLCBjYWxsYmFjayk7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdBZGRpbmcnLCBpc0xpc3RlbmVyID8gJ2xpc3RlbmVyJyA6ICdzdWJzY3JpcHRpb24nLCAnb24nLCBjaGFubmVsLCAnd2l0aCBzY29wZScsIGRlbGVnYXRlLnNjb3BlLCAnYW5kIGNhbGxiYWNrJywgZGVsZWdhdGUubWV0aG9kKTtcblxuICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0ge1xuICAgICAgICAgICAgY2hhbm5lbDogY2hhbm5lbCxcbiAgICAgICAgICAgIHNjb3BlOiBkZWxlZ2F0ZS5zY29wZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBkZWxlZ2F0ZS5tZXRob2QsXG4gICAgICAgICAgICBsaXN0ZW5lcjogaXNMaXN0ZW5lclxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tjaGFubmVsXTtcbiAgICAgICAgaWYgKCFzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBzdWJzY3JpcHRpb25zID0gW107XG4gICAgICAgICAgICBfbGlzdGVuZXJzW2NoYW5uZWxdID0gc3Vic2NyaXB0aW9ucztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1c2hpbmcgb250byBhbiBhcnJheSBhcHBlbmRzIGF0IHRoZSBlbmQgYW5kIHJldHVybnMgdGhlIGlkIGFzc29jaWF0ZWQgd2l0aCB0aGUgZWxlbWVudCBpbmNyZWFzZWQgYnkgMS5cbiAgICAgICAgLy8gTm90ZSB0aGF0IGlmOlxuICAgICAgICAvLyBhLnB1c2goJ2EnKTsgdmFyIGhiPWEucHVzaCgnYicpOyBkZWxldGUgYVtoYi0xXTsgdmFyIGhjPWEucHVzaCgnYycpO1xuICAgICAgICAvLyB0aGVuOlxuICAgICAgICAvLyBoYz09MywgYS5qb2luKCk9PSdhJywsJ2MnLCBhLmxlbmd0aD09M1xuICAgICAgICBzdWJzY3JpcHRpb24uaWQgPSBzdWJzY3JpcHRpb25zLnB1c2goc3Vic2NyaXB0aW9uKSAtIDE7XG5cbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0FkZGVkJywgaXNMaXN0ZW5lciA/ICdsaXN0ZW5lcicgOiAnc3Vic2NyaXB0aW9uJywgc3Vic2NyaXB0aW9uKTtcblxuICAgICAgICAvLyBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eTogd2UgdXNlZCB0byByZXR1cm4gW2NoYW5uZWwsIHN1YnNjcmlwdGlvbi5pZF1cbiAgICAgICAgc3Vic2NyaXB0aW9uWzBdID0gY2hhbm5lbDtcbiAgICAgICAgc3Vic2NyaXB0aW9uWzFdID0gc3Vic2NyaXB0aW9uLmlkO1xuXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBQVUJMSUMgQVBJXG4gICAgLy9cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyB0aGUgZ2l2ZW4gdHJhbnNwb3J0IHVuZGVyIHRoZSBnaXZlbiB0cmFuc3BvcnQgdHlwZS5cbiAgICAgKiBUaGUgb3B0aW9uYWwgaW5kZXggcGFyYW1ldGVyIHNwZWNpZmllcyB0aGUgXCJwcmlvcml0eVwiIGF0IHdoaWNoIHRoZVxuICAgICAqIHRyYW5zcG9ydCBpcyByZWdpc3RlcmVkICh3aGVyZSAwIGlzIHRoZSBtYXggcHJpb3JpdHkpLlxuICAgICAqIElmIGEgdHJhbnNwb3J0IHdpdGggdGhlIHNhbWUgdHlwZSBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQsIHRoaXMgZnVuY3Rpb25cbiAgICAgKiBkb2VzIG5vdGhpbmcgYW5kIHJldHVybnMgZmFsc2UuXG4gICAgICogQHBhcmFtIHR5cGUgdGhlIHRyYW5zcG9ydCB0eXBlXG4gICAgICogQHBhcmFtIHRyYW5zcG9ydCB0aGUgdHJhbnNwb3J0IG9iamVjdFxuICAgICAqIEBwYXJhbSBpbmRleCB0aGUgaW5kZXggYXQgd2hpY2ggdGhpcyB0cmFuc3BvcnQgaXMgdG8gYmUgcmVnaXN0ZXJlZFxuICAgICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgdHJhbnNwb3J0IGhhcyBiZWVuIHJlZ2lzdGVyZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqIEBzZWUgI3VucmVnaXN0ZXJUcmFuc3BvcnQodHlwZSlcbiAgICAgKi9cbiAgICB0aGlzLnJlZ2lzdGVyVHJhbnNwb3J0ID0gZnVuY3Rpb24odHlwZSwgdHJhbnNwb3J0LCBpbmRleCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gX3RyYW5zcG9ydHMuYWRkKHR5cGUsIHRyYW5zcG9ydCwgaW5kZXgpO1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnUmVnaXN0ZXJlZCB0cmFuc3BvcnQnLCB0eXBlKTtcblxuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHRyYW5zcG9ydC5yZWdpc3RlcmVkKSkge1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydC5yZWdpc3RlcmVkKHR5cGUsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVucmVnaXN0ZXJzIHRoZSB0cmFuc3BvcnQgd2l0aCB0aGUgZ2l2ZW4gdHJhbnNwb3J0IHR5cGUuXG4gICAgICogQHBhcmFtIHR5cGUgdGhlIHRyYW5zcG9ydCB0eXBlIHRvIHVucmVnaXN0ZXJcbiAgICAgKiBAcmV0dXJuIHRoZSB0cmFuc3BvcnQgdGhhdCBoYXMgYmVlbiB1bnJlZ2lzdGVyZWQsXG4gICAgICogb3IgbnVsbCBpZiBubyB0cmFuc3BvcnQgd2FzIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCB1bmRlciB0aGUgZ2l2ZW4gdHJhbnNwb3J0IHR5cGVcbiAgICAgKi9cbiAgICB0aGlzLnVucmVnaXN0ZXJUcmFuc3BvcnQgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciB0cmFuc3BvcnQgPSBfdHJhbnNwb3J0cy5yZW1vdmUodHlwZSk7XG4gICAgICAgIGlmICh0cmFuc3BvcnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdVbnJlZ2lzdGVyZWQgdHJhbnNwb3J0JywgdHlwZSk7XG5cbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbih0cmFuc3BvcnQudW5yZWdpc3RlcmVkKSkge1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydC51bnJlZ2lzdGVyZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJhbnNwb3J0O1xuICAgIH07XG5cbiAgICB0aGlzLnVucmVnaXN0ZXJUcmFuc3BvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90cmFuc3BvcnRzLmNsZWFyKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4gYW4gYXJyYXkgb2YgYWxsIHJlZ2lzdGVyZWQgdHJhbnNwb3J0IHR5cGVzXG4gICAgICovXG4gICAgdGhpcy5nZXRUcmFuc3BvcnRUeXBlcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RyYW5zcG9ydHMuZ2V0VHJhbnNwb3J0VHlwZXMoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5maW5kVHJhbnNwb3J0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gX3RyYW5zcG9ydHMuZmluZChuYW1lKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQHJldHVybnMgdGhlIFRyYW5zcG9ydFJlZ2lzdHJ5IG9iamVjdFxuICAgICAqL1xuICAgIHRoaXMuZ2V0VHJhbnNwb3J0UmVnaXN0cnkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmVzIHRoZSBpbml0aWFsIEJheWV1eCBjb21tdW5pY2F0aW9uIHdpdGggdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICogQ29uZmlndXJhdGlvbiBpcyBwYXNzZWQgdmlhIGFuIG9iamVjdCB0aGF0IG11c3QgY29udGFpbiBhIG1hbmRhdG9yeSBmaWVsZCA8Y29kZT51cmw8L2NvZGU+XG4gICAgICogb2YgdHlwZSBzdHJpbmcgY29udGFpbmluZyB0aGUgVVJMIG9mIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqIEBwYXJhbSBjb25maWd1cmF0aW9uIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdFxuICAgICAqL1xuICAgIHRoaXMuY29uZmlndXJlID0gZnVuY3Rpb24oY29uZmlndXJhdGlvbikge1xuICAgICAgICBfY29uZmlndXJlLmNhbGwodGhpcywgY29uZmlndXJhdGlvbik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbmZpZ3VyZXMgYW5kIGVzdGFibGlzaGVzIHRoZSBCYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyXG4gICAgICogdmlhIGEgaGFuZHNoYWtlIGFuZCBhIHN1YnNlcXVlbnQgY29ubmVjdC5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgKiBAcGFyYW0gaGFuZHNoYWtlUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBoYW5kc2hha2UgbWVzc2FnZVxuICAgICAqIEBzZWUgI2NvbmZpZ3VyZShjb25maWd1cmF0aW9uKVxuICAgICAqIEBzZWUgI2hhbmRzaGFrZShoYW5kc2hha2VQcm9wcylcbiAgICAgKi9cbiAgICB0aGlzLmluaXQgPSBmdW5jdGlvbihjb25maWd1cmF0aW9uLCBoYW5kc2hha2VQcm9wcykge1xuICAgICAgICB0aGlzLmNvbmZpZ3VyZShjb25maWd1cmF0aW9uKTtcbiAgICAgICAgdGhpcy5oYW5kc2hha2UoaGFuZHNoYWtlUHJvcHMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFc3RhYmxpc2hlcyB0aGUgQmF5ZXV4IGNvbW11bmljYXRpb24gd2l0aCB0aGUgQmF5ZXV4IHNlcnZlclxuICAgICAqIHZpYSBhIGhhbmRzaGFrZSBhbmQgYSBzdWJzZXF1ZW50IGNvbm5lY3QuXG4gICAgICogQHBhcmFtIGhhbmRzaGFrZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgaGFuZHNoYWtlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gaGFuZHNoYWtlQ2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIGhhbmRzaGFrZSBpcyBhY2tub3dsZWRnZWRcbiAgICAgKi9cbiAgICB0aGlzLmhhbmRzaGFrZSA9IGZ1bmN0aW9uKGhhbmRzaGFrZVByb3BzLCBoYW5kc2hha2VDYWxsYmFjaykge1xuICAgICAgICBfc2V0U3RhdHVzKCdkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgX3JlZXN0YWJsaXNoID0gZmFsc2U7XG4gICAgICAgIF9oYW5kc2hha2UoaGFuZHNoYWtlUHJvcHMsIGhhbmRzaGFrZUNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGlzY29ubmVjdHMgZnJvbSB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKiBJdCBpcyBwb3NzaWJsZSB0byBzdWdnZXN0IHRvIGF0dGVtcHQgYSBzeW5jaHJvbm91cyBkaXNjb25uZWN0LCBidXQgdGhpcyBmZWF0dXJlXG4gICAgICogbWF5IG9ubHkgYmUgYXZhaWxhYmxlIGluIGNlcnRhaW4gdHJhbnNwb3J0cyAoZm9yIGV4YW1wbGUsIGxvbmctcG9sbGluZyBtYXkgc3VwcG9ydFxuICAgICAqIGl0LCBjYWxsYmFjay1wb2xsaW5nIGNlcnRhaW5seSBkb2VzIG5vdCkuXG4gICAgICogQHBhcmFtIHN5bmMgd2hldGhlciBhdHRlbXB0IHRvIHBlcmZvcm0gYSBzeW5jaHJvbm91cyBkaXNjb25uZWN0XG4gICAgICogQHBhcmFtIGRpc2Nvbm5lY3RQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGRpc2Nvbm5lY3QgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBkaXNjb25uZWN0Q2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIGRpc2Nvbm5lY3QgaXMgYWNrbm93bGVkZ2VkXG4gICAgICovXG4gICAgdGhpcy5kaXNjb25uZWN0ID0gZnVuY3Rpb24oc3luYywgZGlzY29ubmVjdFByb3BzLCBkaXNjb25uZWN0Q2FsbGJhY2spIHtcbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHN5bmMgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgZGlzY29ubmVjdENhbGxiYWNrID0gZGlzY29ubmVjdFByb3BzO1xuICAgICAgICAgICAgZGlzY29ubmVjdFByb3BzID0gc3luYztcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oZGlzY29ubmVjdFByb3BzKSkge1xuICAgICAgICAgICAgZGlzY29ubmVjdENhbGxiYWNrID0gZGlzY29ubmVjdFByb3BzO1xuICAgICAgICAgICAgZGlzY29ubmVjdFByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS9kaXNjb25uZWN0J1xuICAgICAgICB9O1xuICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIGRpc2Nvbm5lY3RQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIGRpc2Nvbm5lY3RDYWxsYmFjayk7XG5cbiAgICAgICAgX3NldFN0YXR1cygnZGlzY29ubmVjdGluZycpO1xuICAgICAgICBfc2VuZChzeW5jID09PSB0cnVlLCBbbWVzc2FnZV0sIGZhbHNlLCAnZGlzY29ubmVjdCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyB0aGUgc3RhcnQgb2YgYSBiYXRjaCBvZiBhcHBsaWNhdGlvbiBtZXNzYWdlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgICAgKiBpbiBhIHNpbmdsZSByZXF1ZXN0LCBvYnRhaW5pbmcgYSBzaW5nbGUgcmVzcG9uc2UgY29udGFpbmluZyAocG9zc2libHkpIG1hbnlcbiAgICAgKiBhcHBsaWNhdGlvbiByZXBseSBtZXNzYWdlcy5cbiAgICAgKiBNZXNzYWdlcyBhcmUgaGVsZCBpbiBhIHF1ZXVlIGFuZCBub3Qgc2VudCB1bnRpbCB7QGxpbmsgI2VuZEJhdGNoKCl9IGlzIGNhbGxlZC5cbiAgICAgKiBJZiBzdGFydEJhdGNoKCkgaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzLCB0aGVuIGFuIGVxdWFsIG51bWJlciBvZiBlbmRCYXRjaCgpXG4gICAgICogY2FsbHMgbXVzdCBiZSBtYWRlIHRvIGNsb3NlIGFuZCBzZW5kIHRoZSBiYXRjaCBvZiBtZXNzYWdlcy5cbiAgICAgKiBAc2VlICNlbmRCYXRjaCgpXG4gICAgICovXG4gICAgdGhpcy5zdGFydEJhdGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9zdGFydEJhdGNoKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1hcmtzIHRoZSBlbmQgb2YgYSBiYXRjaCBvZiBhcHBsaWNhdGlvbiBtZXNzYWdlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgICAgKiBpbiBhIHNpbmdsZSByZXF1ZXN0LlxuICAgICAqIEBzZWUgI3N0YXJ0QmF0Y2goKVxuICAgICAqL1xuICAgIHRoaXMuZW5kQmF0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2VuZEJhdGNoKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBnaXZlbiBjYWxsYmFjayBpbiB0aGUgZ2l2ZW4gc2NvcGUsIHN1cnJvdW5kZWQgYnkgYSB7QGxpbmsgI3N0YXJ0QmF0Y2goKX1cbiAgICAgKiBhbmQge0BsaW5rICNlbmRCYXRjaCgpfSBjYWxscy5cbiAgICAgKiBAcGFyYW0gc2NvcGUgdGhlIHNjb3BlIG9mIHRoZSBjYWxsYmFjaywgbWF5IGJlIG9taXR0ZWRcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIHdpdGhpbiB7QGxpbmsgI3N0YXJ0QmF0Y2goKX0gYW5kIHtAbGluayAjZW5kQmF0Y2goKX0gY2FsbHNcbiAgICAgKi9cbiAgICB0aGlzLmJhdGNoID0gZnVuY3Rpb24oc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IF9yZXNvbHZlU2NvcGVkQ2FsbGJhY2soc2NvcGUsIGNhbGxiYWNrKTtcbiAgICAgICAgdGhpcy5zdGFydEJhdGNoKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBkZWxlZ2F0ZS5tZXRob2QuY2FsbChkZWxlZ2F0ZS5zY29wZSk7XG4gICAgICAgICAgICB0aGlzLmVuZEJhdGNoKCk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHRoaXMuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGJhdGNoJywgeCk7XG4gICAgICAgICAgICB0aGlzLmVuZEJhdGNoKCk7XG4gICAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBsaXN0ZW5lciBmb3IgYmF5ZXV4IG1lc3NhZ2VzLCBwZXJmb3JtaW5nIHRoZSBnaXZlbiBjYWxsYmFjayBpbiB0aGUgZ2l2ZW4gc2NvcGVcbiAgICAgKiB3aGVuIGEgbWVzc2FnZSBmb3IgdGhlIGdpdmVuIGNoYW5uZWwgYXJyaXZlcy5cbiAgICAgKiBAcGFyYW0gY2hhbm5lbCB0aGUgY2hhbm5lbCB0aGUgbGlzdGVuZXIgaXMgaW50ZXJlc3RlZCB0b1xuICAgICAqIEBwYXJhbSBzY29wZSB0aGUgc2NvcGUgb2YgdGhlIGNhbGxiYWNrLCBtYXkgYmUgb21pdHRlZFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBjaGFubmVsXG4gICAgICogQHJldHVybnMgdGhlIHN1YnNjcmlwdGlvbiBoYW5kbGUgdG8gYmUgcGFzc2VkIHRvIHtAbGluayAjcmVtb3ZlTGlzdGVuZXIob2JqZWN0KX1cbiAgICAgKiBAc2VlICNyZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pXG4gICAgICovXG4gICAgdGhpcy5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDIsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogY2hhbm5lbCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgc3Vic2NyaXB0aW9uIG9idGFpbmVkIHdpdGggYSBjYWxsIHRvIHtAbGluayAjYWRkTGlzdGVuZXIoc3RyaW5nLCBvYmplY3QsIGZ1bmN0aW9uKX0uXG4gICAgICogQHBhcmFtIHN1YnNjcmlwdGlvbiB0aGUgc3Vic2NyaXB0aW9uIHRvIHVuc3Vic2NyaWJlLlxuICAgICAqIEBzZWUgI2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaylcbiAgICAgKi9cbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIC8vIEJld2FyZSBvZiBzdWJzY3JpcHRpb24uaWQgPT0gMCwgd2hpY2ggaXMgZmFsc3kgPT4gY2Fubm90IHVzZSAhc3Vic2NyaXB0aW9uLmlkXG4gICAgICAgIGlmICghc3Vic2NyaXB0aW9uIHx8ICFzdWJzY3JpcHRpb24uY2hhbm5lbCB8fCAhKFwiaWRcIiBpbiBzdWJzY3JpcHRpb24pKSB7XG4gICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBhcmd1bWVudDogZXhwZWN0ZWQgc3Vic2NyaXB0aW9uLCBub3QgJyArIHN1YnNjcmlwdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIF9yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCB3aXRoIHtAbGluayAjYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKX0gb3JcbiAgICAgKiB7QGxpbmsgI3N1YnNjcmliZShjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spfS5cbiAgICAgKi9cbiAgICB0aGlzLmNsZWFyTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9saXN0ZW5lcnMgPSB7fTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3Vic2NyaWJlcyB0byB0aGUgZ2l2ZW4gY2hhbm5lbCwgcGVyZm9ybWluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgaW4gdGhlIGdpdmVuIHNjb3BlXG4gICAgICogd2hlbiBhIG1lc3NhZ2UgZm9yIHRoZSBjaGFubmVsIGFycml2ZXMuXG4gICAgICogQHBhcmFtIGNoYW5uZWwgdGhlIGNoYW5uZWwgdG8gc3Vic2NyaWJlIHRvXG4gICAgICogQHBhcmFtIHNjb3BlIHRoZSBzY29wZSBvZiB0aGUgY2FsbGJhY2ssIG1heSBiZSBvbWl0dGVkXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBjYWxsIHdoZW4gYSBtZXNzYWdlIGlzIHNlbnQgdG8gdGhlIGNoYW5uZWxcbiAgICAgKiBAcGFyYW0gc3Vic2NyaWJlUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBzdWJzY3JpYmUgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBzdWJzY3JpYmVDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgc3Vic2NyaXB0aW9uIGlzIGFja25vd2xlZGdlZFxuICAgICAqIEByZXR1cm4gdGhlIHN1YnNjcmlwdGlvbiBoYW5kbGUgdG8gYmUgcGFzc2VkIHRvIHtAbGluayAjdW5zdWJzY3JpYmUob2JqZWN0KX1cbiAgICAgKi9cbiAgICB0aGlzLnN1YnNjcmliZSA9IGZ1bmN0aW9uKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgc3Vic2NyaWJlUHJvcHMsIHN1YnNjcmliZUNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMiwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzU3RyaW5nKGNoYW5uZWwpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiBjaGFubmVsIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgc3RhdGU6IGFscmVhZHkgZGlzY29ubmVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBhcmd1bWVudHNcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHNjb3BlKSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlQ2FsbGJhY2sgPSBzdWJzY3JpYmVQcm9wcztcbiAgICAgICAgICAgIHN1YnNjcmliZVByb3BzID0gY2FsbGJhY2s7XG4gICAgICAgICAgICBjYWxsYmFjayA9IHNjb3BlO1xuICAgICAgICAgICAgc2NvcGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHN1YnNjcmliZVByb3BzKSkge1xuICAgICAgICAgICAgc3Vic2NyaWJlQ2FsbGJhY2sgPSBzdWJzY3JpYmVQcm9wcztcbiAgICAgICAgICAgIHN1YnNjcmliZVByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSBzZW5kIHRoZSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXIgaWYgdGhpcyBjbGllbnQgaGFzIG5vdCB5ZXQgc3Vic2NyaWJlZCB0byB0aGUgY2hhbm5lbFxuICAgICAgICB2YXIgc2VuZCA9ICFfaGFzU3Vic2NyaXB0aW9ucyhjaGFubmVsKTtcblxuICAgICAgICB2YXIgc3Vic2NyaXB0aW9uID0gX2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgZmFsc2UpO1xuXG4gICAgICAgIGlmIChzZW5kKSB7XG4gICAgICAgICAgICAvLyBTZW5kIHRoZSBzdWJzY3JpcHRpb24gbWVzc2FnZSBhZnRlciB0aGUgc3Vic2NyaXB0aW9uIHJlZ2lzdHJhdGlvbiB0byBhdm9pZFxuICAgICAgICAgICAgLy8gcmFjZXMgd2hlcmUgdGhlIHNlcnZlciB3b3VsZCBzZW5kIGEgbWVzc2FnZSB0byB0aGUgc3Vic2NyaWJlcnMsIGJ1dCBoZXJlXG4gICAgICAgICAgICAvLyBvbiB0aGUgY2xpZW50IHRoZSBzdWJzY3JpcHRpb24gaGFzIG5vdCBiZWVuIGFkZGVkIHlldCB0byB0aGUgZGF0YSBzdHJ1Y3R1cmVzXG4gICAgICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvc3Vic2NyaWJlJyxcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb246IGNoYW5uZWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBzdWJzY3JpYmVQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgX2NvbWV0ZC5fcHV0Q2FsbGJhY2sobWVzc2FnZS5pZCwgc3Vic2NyaWJlQ2FsbGJhY2spO1xuXG4gICAgICAgICAgICBfcXVldWVTZW5kKG1lc3NhZ2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVW5zdWJzY3JpYmVzIHRoZSBzdWJzY3JpcHRpb24gb2J0YWluZWQgd2l0aCBhIGNhbGwgdG8ge0BsaW5rICNzdWJzY3JpYmUoc3RyaW5nLCBvYmplY3QsIGZ1bmN0aW9uKX0uXG4gICAgICogQHBhcmFtIHN1YnNjcmlwdGlvbiB0aGUgc3Vic2NyaXB0aW9uIHRvIHVuc3Vic2NyaWJlLlxuICAgICAqIEBwYXJhbSB1bnN1YnNjcmliZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgdW5zdWJzY3JpYmUgbWVzc2FnZVxuICAgICAqIEBwYXJhbSB1bnN1YnNjcmliZUNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSB1bnN1YnNjcmlwdGlvbiBpcyBhY2tub3dsZWRnZWRcbiAgICAgKi9cbiAgICB0aGlzLnVuc3Vic2NyaWJlID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uLCB1bnN1YnNjcmliZVByb3BzLCB1bnN1YnNjcmliZUNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMSwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgc3RhdGU6IGFscmVhZHkgZGlzY29ubmVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbih1bnN1YnNjcmliZVByb3BzKSkge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmVDYWxsYmFjayA9IHVuc3Vic2NyaWJlUHJvcHM7XG4gICAgICAgICAgICB1bnN1YnNjcmliZVByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBsb2NhbCBsaXN0ZW5lciBiZWZvcmUgc2VuZGluZyB0aGUgbWVzc2FnZVxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCBpZiB0aGUgc2VydmVyIGZhaWxzLCB0aGlzIGNsaWVudCBkb2VzIG5vdCBnZXQgbm90aWZpY2F0aW9uc1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHN1YnNjcmlwdGlvbik7XG5cbiAgICAgICAgdmFyIGNoYW5uZWwgPSBzdWJzY3JpcHRpb24uY2hhbm5lbDtcbiAgICAgICAgLy8gT25seSBzZW5kIHRoZSBtZXNzYWdlIHRvIHRoZSBzZXJ2ZXIgaWYgdGhpcyBjbGllbnQgdW5zdWJzY3JpYmVzIHRoZSBsYXN0IHN1YnNjcmlwdGlvblxuICAgICAgICBpZiAoIV9oYXNTdWJzY3JpcHRpb25zKGNoYW5uZWwpKSB7XG4gICAgICAgICAgICB2YXIgYmF5ZXV4TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvdW5zdWJzY3JpYmUnLFxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbjogY2hhbm5lbFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIERvIG5vdCBhbGxvdyB0aGUgdXNlciB0byBvdmVycmlkZSBpbXBvcnRhbnQgZmllbGRzLlxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIHVuc3Vic2NyaWJlUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIHVuc3Vic2NyaWJlQ2FsbGJhY2spO1xuXG4gICAgICAgICAgICBfcXVldWVTZW5kKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMucmVzdWJzY3JpYmUgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24sIHN1YnNjcmliZVByb3BzKSB7XG4gICAgICAgIF9yZW1vdmVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKTtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaWJlKHN1YnNjcmlwdGlvbi5jaGFubmVsLCBzdWJzY3JpcHRpb24uc2NvcGUsIHN1YnNjcmlwdGlvbi5jYWxsYmFjaywgc3Vic2NyaWJlUHJvcHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHN1YnNjcmlwdGlvbnMgYWRkZWQgdmlhIHtAbGluayAjc3Vic2NyaWJlKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgc3Vic2NyaWJlUHJvcHMpfSxcbiAgICAgKiBidXQgZG9lcyBub3QgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgYWRkZWQgdmlhIHtAbGluayBhZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spfS5cbiAgICAgKi9cbiAgICB0aGlzLmNsZWFyU3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfY2xlYXJTdWJzY3JpcHRpb25zKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyBhIG1lc3NhZ2Ugb24gdGhlIGdpdmVuIGNoYW5uZWwsIGNvbnRhaW5pbmcgdGhlIGdpdmVuIGNvbnRlbnQuXG4gICAgICogQHBhcmFtIGNoYW5uZWwgdGhlIGNoYW5uZWwgdG8gcHVibGlzaCB0aGUgbWVzc2FnZSB0b1xuICAgICAqIEBwYXJhbSBjb250ZW50IHRoZSBjb250ZW50IG9mIHRoZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIHB1Ymxpc2hQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIHB1Ymxpc2ggbWVzc2FnZVxuICAgICAqIEBwYXJhbSBwdWJsaXNoQ2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHB1Ymxpc2ggaXMgYWNrbm93bGVkZ2VkIGJ5IHRoZSBzZXJ2ZXJcbiAgICAgKi9cbiAgICB0aGlzLnB1Ymxpc2ggPSBmdW5jdGlvbihjaGFubmVsLCBjb250ZW50LCBwdWJsaXNoUHJvcHMsIHB1Ymxpc2hDYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDEsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogY2hhbm5lbCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoL15cXC9tZXRhXFwvLy50ZXN0KGNoYW5uZWwpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudDogY2Fubm90IHB1Ymxpc2ggdG8gbWV0YSBjaGFubmVscyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBzdGF0ZTogYWxyZWFkeSBkaXNjb25uZWN0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNvbnRlbnQpKSB7XG4gICAgICAgICAgICBwdWJsaXNoQ2FsbGJhY2sgPSBjb250ZW50O1xuICAgICAgICAgICAgY29udGVudCA9IHB1Ymxpc2hQcm9wcyA9IHt9O1xuICAgICAgICB9IGVsc2UgaWYgKF9pc0Z1bmN0aW9uKHB1Ymxpc2hQcm9wcykpIHtcbiAgICAgICAgICAgIHB1Ymxpc2hDYWxsYmFjayA9IHB1Ymxpc2hQcm9wcztcbiAgICAgICAgICAgIHB1Ymxpc2hQcm9wcyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXG4gICAgICAgICAgICBkYXRhOiBjb250ZW50XG4gICAgICAgIH07XG4gICAgICAgIC8vIERvIG5vdCBhbGxvdyB0aGUgdXNlciB0byBvdmVycmlkZSBpbXBvcnRhbnQgZmllbGRzLlxuICAgICAgICB2YXIgbWVzc2FnZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgcHVibGlzaFByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgX2NvbWV0ZC5fcHV0Q2FsbGJhY2sobWVzc2FnZS5pZCwgcHVibGlzaENhbGxiYWNrKTtcblxuICAgICAgICBfcXVldWVTZW5kKG1lc3NhZ2UpO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbW90ZUNhbGwgPSBmdW5jdGlvbih0YXJnZXQsIGNvbnRlbnQsIHRpbWVvdXQsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnRzIG51bWJlcjogcmVxdWlyZWQgMSwgZ290ICcgKyBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIGlmICghX2lzU3RyaW5nKHRhcmdldCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IHRhcmdldCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY29udGVudCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29udGVudDtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7fTtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBfY29uZmlnLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgfSBlbHNlIGlmIChfaXNGdW5jdGlvbih0aW1lb3V0KSkge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0aW1lb3V0O1xuICAgICAgICAgICAgdGltZW91dCA9IF9jb25maWcubWF4TmV0d29ya0RlbGF5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aW1lb3V0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogdGltZW91dCBtdXN0IGJlIGEgbnVtYmVyJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGFyZ2V0Lm1hdGNoKC9eXFwvLykpIHtcbiAgICAgICAgICAgIHRhcmdldCA9ICcvJyArIHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hhbm5lbCA9ICcvc2VydmljZScgKyB0YXJnZXQ7XG5cbiAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICBpZDogX25leHRNZXNzYWdlSWQoKSxcbiAgICAgICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXG4gICAgICAgICAgICBkYXRhOiBjb250ZW50XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGNvbnRleHQgPSB7XG4gICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRpbWVvdXQgPiAwKSB7XG4gICAgICAgICAgICBjb250ZXh0LnRpbWVvdXQgPSBVdGlscy5zZXRUaW1lb3V0KF9jb21ldGQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdUaW1pbmcgb3V0IHJlbW90ZSBjYWxsJywgYmF5ZXV4TWVzc2FnZSwgJ2FmdGVyJywgdGltZW91dCwgJ21zJyk7XG4gICAgICAgICAgICAgICAgX2ZhaWxNZXNzYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGJheWV1eE1lc3NhZ2UuaWQsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiAnNDA2Ojp0aW1lb3V0JyxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgOiBiYXlldXhNZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiAnUmVtb3RlIENhbGwgVGltZW91dCdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU2NoZWR1bGVkIHJlbW90ZSBjYWxsIHRpbWVvdXQnLCBiYXlldXhNZXNzYWdlLCAnaW4nLCB0aW1lb3V0LCAnbXMnKTtcbiAgICAgICAgfVxuICAgICAgICBfcmVtb3RlQ2FsbHNbYmF5ZXV4TWVzc2FnZS5pZF0gPSBjb250ZXh0O1xuXG4gICAgICAgIF9xdWV1ZVNlbmQoYmF5ZXV4TWVzc2FnZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzdGF0dXMgb2YgdGhlIGJheWV1eCBjb21tdW5pY2F0aW9uIHdpdGggdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICovXG4gICAgdGhpcy5nZXRTdGF0dXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9zdGF0dXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGlzIGluc3RhbmNlIGhhcyBiZWVuIGRpc2Nvbm5lY3RlZC5cbiAgICAgKi9cbiAgICB0aGlzLmlzRGlzY29ubmVjdGVkID0gX2lzRGlzY29ubmVjdGVkO1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYmFja29mZiBwZXJpb2QgdXNlZCB0byBpbmNyZWFzZSB0aGUgYmFja29mZiB0aW1lIHdoZW4gcmV0cnlpbmcgYW4gdW5zdWNjZXNzZnVsIG9yIGZhaWxlZCBtZXNzYWdlLlxuICAgICAqIERlZmF1bHQgdmFsdWUgaXMgMSBzZWNvbmQsIHdoaWNoIG1lYW5zIGlmIHRoZXJlIGlzIGEgcGVyc2lzdGVudCBmYWlsdXJlIHRoZSByZXRyaWVzIHdpbGwgaGFwcGVuXG4gICAgICogYWZ0ZXIgMSBzZWNvbmQsIHRoZW4gYWZ0ZXIgMiBzZWNvbmRzLCB0aGVuIGFmdGVyIDMgc2Vjb25kcywgZXRjLiBTbyBmb3IgZXhhbXBsZSB3aXRoIDE1IHNlY29uZHMgb2ZcbiAgICAgKiBlbGFwc2VkIHRpbWUsIHRoZXJlIHdpbGwgYmUgNSByZXRyaWVzIChhdCAxLCAzLCA2LCAxMCBhbmQgMTUgc2Vjb25kcyBlbGFwc2VkKS5cbiAgICAgKiBAcGFyYW0gcGVyaW9kIHRoZSBiYWNrb2ZmIHBlcmlvZCB0byBzZXRcbiAgICAgKiBAc2VlICNnZXRCYWNrb2ZmSW5jcmVtZW50KClcbiAgICAgKi9cbiAgICB0aGlzLnNldEJhY2tvZmZJbmNyZW1lbnQgPSBmdW5jdGlvbihwZXJpb2QpIHtcbiAgICAgICAgX2NvbmZpZy5iYWNrb2ZmSW5jcmVtZW50ID0gcGVyaW9kO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYWNrb2ZmIHBlcmlvZCB1c2VkIHRvIGluY3JlYXNlIHRoZSBiYWNrb2ZmIHRpbWUgd2hlbiByZXRyeWluZyBhbiB1bnN1Y2Nlc3NmdWwgb3IgZmFpbGVkIG1lc3NhZ2UuXG4gICAgICogQHNlZSAjc2V0QmFja29mZkluY3JlbWVudChwZXJpb2QpXG4gICAgICovXG4gICAgdGhpcy5nZXRCYWNrb2ZmSW5jcmVtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY29uZmlnLmJhY2tvZmZJbmNyZW1lbnQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJhY2tvZmYgcGVyaW9kIHRvIHdhaXQgYmVmb3JlIHJldHJ5aW5nIGFuIHVuc3VjY2Vzc2Z1bCBvciBmYWlsZWQgbWVzc2FnZS5cbiAgICAgKi9cbiAgICB0aGlzLmdldEJhY2tvZmZQZXJpb2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9iYWNrb2ZmO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbmNyZWFzZXMgdGhlIGJhY2tvZmYgcGVyaW9kIHVwIHRvIHRoZSBtYXhpbXVtIHZhbHVlIGNvbmZpZ3VyZWQuXG4gICAgICogQHJldHVybnMgdGhlIGJhY2tvZmYgcGVyaW9kIGFmdGVyIGluY3JlbWVudFxuICAgICAqIEBzZWUgZ2V0QmFja29mZkluY3JlbWVudFxuICAgICAqL1xuICAgIHRoaXMuaW5jcmVhc2VCYWNrb2ZmUGVyaW9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfaW5jcmVhc2VCYWNrb2ZmKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyB0aGUgYmFja29mZiBwZXJpb2QgdG8gemVyby5cbiAgICAgKi9cbiAgICB0aGlzLnJlc2V0QmFja29mZlBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfcmVzZXRCYWNrb2ZmKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGxvZyBsZXZlbCBmb3IgY29uc29sZSBsb2dnaW5nLlxuICAgICAqIFZhbGlkIHZhbHVlcyBhcmUgdGhlIHN0cmluZ3MgJ2Vycm9yJywgJ3dhcm4nLCAnaW5mbycgYW5kICdkZWJ1ZycsIGZyb21cbiAgICAgKiBsZXNzIHZlcmJvc2UgdG8gbW9yZSB2ZXJib3NlLlxuICAgICAqIEBwYXJhbSBsZXZlbCB0aGUgbG9nIGxldmVsIHN0cmluZ1xuICAgICAqL1xuICAgIHRoaXMuc2V0TG9nTGV2ZWwgPSBmdW5jdGlvbihsZXZlbCkge1xuICAgICAgICBfY29uZmlnLmxvZ0xldmVsID0gbGV2ZWw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVycyBhbiBleHRlbnNpb24gd2hvc2UgY2FsbGJhY2tzIGFyZSBjYWxsZWQgZm9yIGV2ZXJ5IGluY29taW5nIG1lc3NhZ2VcbiAgICAgKiAodGhhdCBjb21lcyBmcm9tIHRoZSBzZXJ2ZXIgdG8gdGhpcyBjbGllbnQgaW1wbGVtZW50YXRpb24pIGFuZCBmb3IgZXZlcnlcbiAgICAgKiBvdXRnb2luZyBtZXNzYWdlICh0aGF0IG9yaWdpbmF0ZXMgZnJvbSB0aGlzIGNsaWVudCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhlXG4gICAgICogc2VydmVyKS5cbiAgICAgKiBUaGUgZm9ybWF0IG9mIHRoZSBleHRlbnNpb24gb2JqZWN0IGlzIHRoZSBmb2xsb3dpbmc6XG4gICAgICogPHByZT5cbiAgICAgKiB7XG4gICAgICogICAgIGluY29taW5nOiBmdW5jdGlvbihtZXNzYWdlKSB7IC4uLiB9LFxuICAgICAqICAgICBvdXRnb2luZzogZnVuY3Rpb24obWVzc2FnZSkgeyAuLi4gfVxuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBCb3RoIHByb3BlcnRpZXMgYXJlIG9wdGlvbmFsLCBidXQgaWYgdGhleSBhcmUgcHJlc2VudCB0aGV5IHdpbGwgYmUgY2FsbGVkXG4gICAgICogcmVzcGVjdGl2ZWx5IGZvciBlYWNoIGluY29taW5nIG1lc3NhZ2UgYW5kIGZvciBlYWNoIG91dGdvaW5nIG1lc3NhZ2UuXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvblxuICAgICAqIEBwYXJhbSBleHRlbnNpb24gdGhlIGV4dGVuc2lvbiB0byByZWdpc3RlclxuICAgICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgZXh0ZW5zaW9uIHdhcyByZWdpc3RlcmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAc2VlICN1bnJlZ2lzdGVyRXh0ZW5zaW9uKG5hbWUpXG4gICAgICovXG4gICAgdGhpcy5yZWdpc3RlckV4dGVuc2lvbiA9IGZ1bmN0aW9uKG5hbWUsIGV4dGVuc2lvbikge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDIsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyhuYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogZXh0ZW5zaW9uIG5hbWUgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXhpc3RpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nRXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdFeHRlbnNpb24ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgICAgICAgICBfZXh0ZW5zaW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgIGV4dGVuc2lvbjogZXh0ZW5zaW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdSZWdpc3RlcmVkIGV4dGVuc2lvbicsIG5hbWUpO1xuXG4gICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGV4dGVuc2lvbi5yZWdpc3RlcmVkKSkge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbi5yZWdpc3RlcmVkKG5hbWUsIHRoaXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2luZm8oJ0NvdWxkIG5vdCByZWdpc3RlciBleHRlbnNpb24gd2l0aCBuYW1lJywgbmFtZSwgJ3NpbmNlIGFub3RoZXIgZXh0ZW5zaW9uIHdpdGggdGhlIHNhbWUgbmFtZSBhbHJlYWR5IGV4aXN0cycpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVucmVnaXN0ZXIgYW4gZXh0ZW5zaW9uIHByZXZpb3VzbHkgcmVnaXN0ZXJlZCB3aXRoXG4gICAgICoge0BsaW5rICNyZWdpc3RlckV4dGVuc2lvbihuYW1lLCBleHRlbnNpb24pfS5cbiAgICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgZXh0ZW5zaW9uIHRvIHVucmVnaXN0ZXIuXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoZSBleHRlbnNpb24gd2FzIHVucmVnaXN0ZXJlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgdGhpcy51bnJlZ2lzdGVyRXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZiAoIV9pc1N0cmluZyhuYW1lKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogZXh0ZW5zaW9uIG5hbWUgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdW5yZWdpc3RlcmVkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChleHRlbnNpb24ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIF9leHRlbnNpb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB1bnJlZ2lzdGVyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdVbnJlZ2lzdGVyZWQgZXh0ZW5zaW9uJywgbmFtZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxsYmFjayBmb3IgZXh0ZW5zaW9uc1xuICAgICAgICAgICAgICAgIHZhciBleHQgPSBleHRlbnNpb24uZXh0ZW5zaW9uO1xuICAgICAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihleHQudW5yZWdpc3RlcmVkKSkge1xuICAgICAgICAgICAgICAgICAgICBleHQudW5yZWdpc3RlcmVkKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVucmVnaXN0ZXJlZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRmluZCB0aGUgZXh0ZW5zaW9uIHJlZ2lzdGVyZWQgd2l0aCB0aGUgZ2l2ZW4gbmFtZS5cbiAgICAgKiBAcGFyYW0gbmFtZSB0aGUgbmFtZSBvZiB0aGUgZXh0ZW5zaW9uIHRvIGZpbmRcbiAgICAgKiBAcmV0dXJuIHRoZSBleHRlbnNpb24gZm91bmQgb3IgbnVsbCBpZiBubyBleHRlbnNpb24gd2l0aCB0aGUgZ2l2ZW4gbmFtZSBoYXMgYmVlbiByZWdpc3RlcmVkXG4gICAgICovXG4gICAgdGhpcy5nZXRFeHRlbnNpb24gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChleHRlbnNpb24ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBleHRlbnNpb24uZXh0ZW5zaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBuYW1lIGFzc2lnbmVkIHRvIHRoaXMgQ29tZXREIG9iamVjdCwgb3IgdGhlIHN0cmluZyAnZGVmYXVsdCdcbiAgICAgKiBpZiBubyBuYW1lIGhhcyBiZWVuIGV4cGxpY2l0bHkgcGFzc2VkIGFzIHBhcmFtZXRlciB0byB0aGUgY29uc3RydWN0b3IuXG4gICAgICovXG4gICAgdGhpcy5nZXROYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfbmFtZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgY2xpZW50SWQgYXNzaWduZWQgYnkgdGhlIEJheWV1eCBzZXJ2ZXIgZHVyaW5nIGhhbmRzaGFrZS5cbiAgICAgKi9cbiAgICB0aGlzLmdldENsaWVudElkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY2xpZW50SWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIFVSTCBvZiB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKi9cbiAgICB0aGlzLmdldFVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX3RyYW5zcG9ydCkge1xuICAgICAgICAgICAgdmFyIHVybCA9IF90cmFuc3BvcnQuZ2V0VVJMKCk7XG4gICAgICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVybCA9IF9jb25maWcudXJsc1tfdHJhbnNwb3J0LmdldFR5cGUoKV07XG4gICAgICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2NvbmZpZy51cmw7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VHJhbnNwb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHJhbnNwb3J0O1xuICAgIH07XG5cbiAgICB0aGlzLmdldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21peGluKHRydWUsIHt9LCBfY29uZmlnKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRBZHZpY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21peGluKHRydWUsIHt9LCBfYWR2aWNlKTtcbiAgICB9O1xufTtcbiIsInZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1RyYW5zcG9ydCcpO1xudmFyIFJlcXVlc3RUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1JlcXVlc3RUcmFuc3BvcnQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBMb25nUG9sbGluZ1RyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3N1cGVyID0gbmV3IFJlcXVlc3RUcmFuc3BvcnQoKTtcbiAgICB2YXIgX3NlbGYgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcik7XG4gICAgLy8gQnkgZGVmYXVsdCwgc3VwcG9ydCBjcm9zcyBkb21haW5cbiAgICB2YXIgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSB0cnVlO1xuXG4gICAgX3NlbGYuYWNjZXB0ID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICByZXR1cm4gX3N1cHBvcnRzQ3Jvc3NEb21haW4gfHwgIWNyb3NzRG9tYWluO1xuICAgIH07XG5cbiAgICBfc2VsZi54aHJTZW5kID0gZnVuY3Rpb24ocGFja2V0KSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIF9zZWxmLnRyYW5zcG9ydFNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgcmVxdWVzdCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzZW5kaW5nIHJlcXVlc3QnLCByZXF1ZXN0LmlkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZSk7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHNhbWVTdGFjayA9IHRydWU7XG4gICAgICAgICAgICByZXF1ZXN0LnhociA9IHRoaXMueGhyU2VuZCh7XG4gICAgICAgICAgICAgICAgdHJhbnNwb3J0OiB0aGlzLFxuICAgICAgICAgICAgICAgIHVybDogZW52ZWxvcGUudXJsLFxuICAgICAgICAgICAgICAgIHN5bmM6IGVudmVsb3BlLnN5bmMsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogdGhpcy5nZXRDb25maWd1cmF0aW9uKCkucmVxdWVzdEhlYWRlcnMsXG4gICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZW52ZWxvcGUubWVzc2FnZXMpLFxuICAgICAgICAgICAgICAgIG9uU3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAncmVjZWl2ZWQgcmVzcG9uc2UnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVjZWl2ZWQgPSBzZWxmLmNvbnZlcnRUb01lc3NhZ2VzKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwQ29kZTogMjA0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0U3VjY2VzcyhlbnZlbG9wZSwgcmVxdWVzdCwgcmVjZWl2ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1Zyh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZS5odHRwQ29kZSA9IHNlbGYueGhyU3RhdHVzKHJlcXVlc3QueGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBvbkVycm9yOiBmdW5jdGlvbihyZWFzb24sIGV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1ZygnVHJhbnNwb3J0Jywgc2VsZi5nZXRUeXBlKCksICdyZWNlaXZlZCBlcnJvcicsIHJlYXNvbiwgZXhjZXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogZXhjZXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyhyZXF1ZXN0Lnhocik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1lU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2FtZVN0YWNrID0gZmFsc2U7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBfc3VwZXIucmVzZXQoaW5pdCk7XG4gICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF9zZWxmO1xufTtcbiIsInZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1RyYW5zcG9ydCcpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJylcblxuLyoqXG4gKiBCYXNlIG9iamVjdCB3aXRoIHRoZSBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgdHJhbnNwb3J0cyBiYXNlZCBvbiByZXF1ZXN0cy5cbiAqIFRoZSBrZXkgcmVzcG9uc2liaWxpdHkgaXMgdG8gYWxsb3cgYXQgbW9zdCAyIG91dHN0YW5kaW5nIHJlcXVlc3RzIHRvIHRoZSBzZXJ2ZXIsXG4gKiB0byBhdm9pZCB0aGF0IHJlcXVlc3RzIGFyZSBzZW50IGJlaGluZCBhIGxvbmcgcG9sbC5cbiAqIFRvIGFjaGlldmUgdGhpcywgd2UgaGF2ZSBvbmUgcmVzZXJ2ZWQgcmVxdWVzdCBmb3IgdGhlIGxvbmcgcG9sbCwgYW5kIGFsbCBvdGhlclxuICogcmVxdWVzdHMgYXJlIHNlcmlhbGl6ZWQgb25lIGFmdGVyIHRoZSBvdGhlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBSZXF1ZXN0VHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgVHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuICAgIHZhciBfcmVxdWVzdElkcyA9IDA7XG4gICAgdmFyIF9tZXRhQ29ubmVjdFJlcXVlc3QgPSBudWxsO1xuICAgIHZhciBfcmVxdWVzdHMgPSBbXTtcbiAgICB2YXIgX2VudmVsb3BlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gX2NvYWxlc2NlRW52ZWxvcGVzKGVudmVsb3BlKSB7XG4gICAgICAgIHdoaWxlIChfZW52ZWxvcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBlbnZlbG9wZUFuZFJlcXVlc3QgPSBfZW52ZWxvcGVzWzBdO1xuICAgICAgICAgICAgdmFyIG5ld0VudmVsb3BlID0gZW52ZWxvcGVBbmRSZXF1ZXN0WzBdO1xuICAgICAgICAgICAgdmFyIG5ld1JlcXVlc3QgPSBlbnZlbG9wZUFuZFJlcXVlc3RbMV07XG4gICAgICAgICAgICBpZiAobmV3RW52ZWxvcGUudXJsID09PSBlbnZlbG9wZS51cmwgJiZcbiAgICAgICAgICAgICAgICBuZXdFbnZlbG9wZS5zeW5jID09PSBlbnZlbG9wZS5zeW5jKSB7XG4gICAgICAgICAgICAgICAgX2VudmVsb3Blcy5zaGlmdCgpO1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm1lc3NhZ2VzID0gZW52ZWxvcGUubWVzc2FnZXMuY29uY2F0KG5ld0VudmVsb3BlLm1lc3NhZ2VzKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnQ29hbGVzY2VkJywgbmV3RW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoLCAnbWVzc2FnZXMgZnJvbSByZXF1ZXN0JywgbmV3UmVxdWVzdC5pZCk7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF90cmFuc3BvcnRTZW5kKGVudmVsb3BlLCByZXF1ZXN0KSB7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0U2VuZChlbnZlbG9wZSwgcmVxdWVzdCk7XG4gICAgICAgIHJlcXVlc3QuZXhwaXJlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghZW52ZWxvcGUuc3luYykge1xuICAgICAgICAgICAgdmFyIG1heERlbGF5ID0gdGhpcy5nZXRDb25maWd1cmF0aW9uKCkubWF4TmV0d29ya0RlbGF5O1xuICAgICAgICAgICAgdmFyIGRlbGF5ID0gbWF4RGVsYXk7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5tZXRhQ29ubmVjdCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGRlbGF5ICs9IHRoaXMuZ2V0QWR2aWNlKCkudGltZW91dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnd2FpdGluZyBhdCBtb3N0JywgZGVsYXksICdtcyBmb3IgdGhlIHJlc3BvbnNlLCBtYXhOZXR3b3JrRGVsYXknLCBtYXhEZWxheSk7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHJlcXVlc3QudGltZW91dCA9IHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0LmV4cGlyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSAnUmVxdWVzdCAnICsgcmVxdWVzdC5pZCArICcgb2YgdHJhbnNwb3J0ICcgKyBzZWxmLmdldFR5cGUoKSArICcgZXhjZWVkZWQgJyArIGRlbGF5ICsgJyBtcyBtYXggbmV0d29yayBkZWxheSc7XG4gICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbjogZXJyb3JNZXNzYWdlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgeGhyID0gcmVxdWVzdC54aHI7XG4gICAgICAgICAgICAgICAgZmFpbHVyZS5odHRwQ29kZSA9IHNlbGYueGhyU3RhdHVzKHhocik7XG4gICAgICAgICAgICAgICAgc2VsZi5hYm9ydFhIUih4aHIpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5jb21wbGV0ZShyZXF1ZXN0LCBmYWxzZSwgcmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICAgICAgZW52ZWxvcGUub25GYWlsdXJlKHhociwgZW52ZWxvcGUubWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3F1ZXVlU2VuZChlbnZlbG9wZSkge1xuICAgICAgICB2YXIgcmVxdWVzdElkID0gKytfcmVxdWVzdElkcztcbiAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICBpZDogcmVxdWVzdElkLFxuICAgICAgICAgICAgbWV0YUNvbm5lY3Q6IGZhbHNlLFxuICAgICAgICAgICAgZW52ZWxvcGU6IGVudmVsb3BlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29uc2lkZXIgdGhlIG1ldGFDb25uZWN0IHJlcXVlc3RzIHdoaWNoIHNob3VsZCBhbHdheXMgYmUgcHJlc2VudFxuICAgICAgICBpZiAoX3JlcXVlc3RzLmxlbmd0aCA8IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLm1heENvbm5lY3Rpb25zIC0gMSkge1xuICAgICAgICAgICAgX3JlcXVlc3RzLnB1c2gocmVxdWVzdCk7XG4gICAgICAgICAgICBfdHJhbnNwb3J0U2VuZC5jYWxsKHRoaXMsIGVudmVsb3BlLCByZXF1ZXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3F1ZXVlaW5nIHJlcXVlc3QnLCByZXF1ZXN0SWQsICdlbnZlbG9wZScsIGVudmVsb3BlKTtcbiAgICAgICAgICAgIF9lbnZlbG9wZXMucHVzaChbZW52ZWxvcGUsIHJlcXVlc3RdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tZXRhQ29ubmVjdENvbXBsZXRlKHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIHJlcXVlc3RJZCA9IHJlcXVlc3QuaWQ7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ21ldGFDb25uZWN0IGNvbXBsZXRlLCByZXF1ZXN0JywgcmVxdWVzdElkKTtcbiAgICAgICAgaWYgKF9tZXRhQ29ubmVjdFJlcXVlc3QgIT09IG51bGwgJiYgX21ldGFDb25uZWN0UmVxdWVzdC5pZCAhPT0gcmVxdWVzdElkKSB7XG4gICAgICAgICAgICB0aHJvdyAnTG9uZ3BvbGwgcmVxdWVzdCBtaXNtYXRjaCwgY29tcGxldGluZyByZXF1ZXN0ICcgKyByZXF1ZXN0SWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNldCBtZXRhQ29ubmVjdCByZXF1ZXN0XG4gICAgICAgIF9tZXRhQ29ubmVjdFJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9jb21wbGV0ZShyZXF1ZXN0LCBzdWNjZXNzKSB7XG4gICAgICAgIHZhciBpbmRleCA9IFV0aWxzLmluQXJyYXkocmVxdWVzdCwgX3JlcXVlc3RzKTtcbiAgICAgICAgLy8gVGhlIGluZGV4IGNhbiBiZSBuZWdhdGl2ZSBpZiB0aGUgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkXG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICBfcmVxdWVzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfZW52ZWxvcGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBlbnZlbG9wZUFuZFJlcXVlc3QgPSBfZW52ZWxvcGVzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgbmV4dEVudmVsb3BlID0gZW52ZWxvcGVBbmRSZXF1ZXN0WzBdO1xuICAgICAgICAgICAgdmFyIG5leHRSZXF1ZXN0ID0gZW52ZWxvcGVBbmRSZXF1ZXN0WzFdO1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCBkZXF1ZXVlZCByZXF1ZXN0JywgbmV4dFJlcXVlc3QuaWQpO1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRDb25maWd1cmF0aW9uKCkuYXV0b0JhdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb2FsZXNjZUVudmVsb3Blcy5jYWxsKHRoaXMsIG5leHRFbnZlbG9wZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF9xdWV1ZVNlbmQuY2FsbCh0aGlzLCBuZXh0RW52ZWxvcGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQgY29tcGxldGVkIHJlcXVlc3QnLCByZXF1ZXN0LmlkLCBuZXh0RW52ZWxvcGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY29tcGxldGUobmV4dFJlcXVlc3QsIGZhbHNlLCBuZXh0UmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiAnUHJldmlvdXMgcmVxdWVzdCBmYWlsZWQnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciB4aHIgPSBuZXh0UmVxdWVzdC54aHI7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyh4aHIpO1xuICAgICAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUub25GYWlsdXJlKHhociwgbmV4dEVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZWxmLmNvbXBsZXRlID0gZnVuY3Rpb24ocmVxdWVzdCwgc3VjY2VzcywgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgaWYgKG1ldGFDb25uZWN0KSB7XG4gICAgICAgICAgICBfbWV0YUNvbm5lY3RDb21wbGV0ZS5jYWxsKHRoaXMsIHJlcXVlc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2NvbXBsZXRlLmNhbGwodGhpcywgcmVxdWVzdCwgc3VjY2Vzcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgdGhlIGFjdHVhbCBzZW5kIGRlcGVuZGluZyBvbiB0aGUgdHJhbnNwb3J0IHR5cGUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0gZW52ZWxvcGUgdGhlIGVudmVsb3BlIHRvIHNlbmRcbiAgICAgKiBAcGFyYW0gcmVxdWVzdCB0aGUgcmVxdWVzdCBpbmZvcm1hdGlvblxuICAgICAqL1xuICAgIF9zZWxmLnRyYW5zcG9ydFNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgcmVxdWVzdCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICBfc2VsZi50cmFuc3BvcnRTdWNjZXNzID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QsIHJlc3BvbnNlcykge1xuICAgICAgICBpZiAoIXJlcXVlc3QuZXhwaXJlZCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVvdXQocmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGUocmVxdWVzdCwgdHJ1ZSwgcmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2VzICYmIHJlc3BvbnNlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZW52ZWxvcGUub25TdWNjZXNzKHJlc3BvbnNlcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm9uRmFpbHVyZShyZXF1ZXN0LnhociwgZW52ZWxvcGUubWVzc2FnZXMsIHtcbiAgICAgICAgICAgICAgICAgICAgaHR0cENvZGU6IDIwNFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLnRyYW5zcG9ydEZhaWx1cmUgPSBmdW5jdGlvbihlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSkge1xuICAgICAgICBpZiAoIXJlcXVlc3QuZXhwaXJlZCkge1xuICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVvdXQocmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGUocmVxdWVzdCwgZmFsc2UsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgZW52ZWxvcGUub25GYWlsdXJlKHJlcXVlc3QueGhyLCBlbnZlbG9wZS5tZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX21ldGFDb25uZWN0U2VuZChlbnZlbG9wZSkge1xuICAgICAgICBpZiAoX21ldGFDb25uZWN0UmVxdWVzdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgJ0NvbmN1cnJlbnQgbWV0YUNvbm5lY3QgcmVxdWVzdHMgbm90IGFsbG93ZWQsIHJlcXVlc3QgaWQ9JyArIF9tZXRhQ29ubmVjdFJlcXVlc3QuaWQgKyAnIG5vdCB5ZXQgY29tcGxldGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXF1ZXN0SWQgPSArK19yZXF1ZXN0SWRzO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdtZXRhQ29ubmVjdCBzZW5kLCByZXF1ZXN0JywgcmVxdWVzdElkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZSk7XG4gICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgaWQ6IHJlcXVlc3RJZCxcbiAgICAgICAgICAgIG1ldGFDb25uZWN0OiB0cnVlLFxuICAgICAgICAgICAgZW52ZWxvcGU6IGVudmVsb3BlXG4gICAgICAgIH07XG4gICAgICAgIF90cmFuc3BvcnRTZW5kLmNhbGwodGhpcywgZW52ZWxvcGUsIHJlcXVlc3QpO1xuICAgICAgICBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gcmVxdWVzdDtcbiAgICB9XG5cbiAgICBfc2VsZi5zZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgX21ldGFDb25uZWN0U2VuZC5jYWxsKHRoaXMsIGVudmVsb3BlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9xdWV1ZVNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3N1cGVyLmFib3J0KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3JlcXVlc3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgcmVxdWVzdCA9IF9yZXF1ZXN0c1tpXTtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0Fib3J0aW5nIHJlcXVlc3QnLCByZXF1ZXN0KTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuYWJvcnRYSFIocmVxdWVzdC54aHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0RmFpbHVyZShyZXF1ZXN0LmVudmVsb3BlLCByZXF1ZXN0LCB7cmVhc29uOiAnYWJvcnQnfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChfbWV0YUNvbm5lY3RSZXF1ZXN0KSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnQWJvcnRpbmcgbWV0YUNvbm5lY3QgcmVxdWVzdCcsIF9tZXRhQ29ubmVjdFJlcXVlc3QpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmFib3J0WEhSKF9tZXRhQ29ubmVjdFJlcXVlc3QueGhyKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNwb3J0RmFpbHVyZShfbWV0YUNvbm5lY3RSZXF1ZXN0LmVudmVsb3BlLCBfbWV0YUNvbm5lY3RSZXF1ZXN0LCB7cmVhc29uOiAnYWJvcnQnfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgICB9O1xuXG4gICAgX3NlbGYucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIF9zdXBlci5yZXNldChpbml0KTtcbiAgICAgICAgX21ldGFDb25uZWN0UmVxdWVzdCA9IG51bGw7XG4gICAgICAgIF9yZXF1ZXN0cyA9IFtdO1xuICAgICAgICBfZW52ZWxvcGVzID0gW107XG4gICAgfTtcblxuICAgIF9zZWxmLmFib3J0WEhSID0gZnVuY3Rpb24oeGhyKSB7XG4gICAgICAgIGlmICh4aHIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0geGhyLnJlYWR5U3RhdGU7XG4gICAgICAgICAgICAgICAgeGhyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlICE9PSBYTUxIdHRwUmVxdWVzdC5VTlNFTlQ7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBfc2VsZi54aHJTdGF0dXMgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgaWYgKHhocikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4geGhyLnN0YXR1cztcbiAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1Zyh4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuICAgIHJldHVybiBfc2VsZjtcbn07XG4iLCJ2YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJylcblxuLyoqXG4gKiBCYXNlIG9iamVjdCB3aXRoIHRoZSBjb21tb24gZnVuY3Rpb25hbGl0eSBmb3IgdHJhbnNwb3J0cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF90eXBlO1xuICAgIHZhciBfY29tZXRkO1xuICAgIHZhciBfdXJsO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gaW52b2tlZCBqdXN0IGFmdGVyIGEgdHJhbnNwb3J0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSByZWdpc3RlcmVkLlxuICAgICAqIEBwYXJhbSB0eXBlIHRoZSB0eXBlIG9mIHRyYW5zcG9ydCAoZm9yIGV4YW1wbGUgJ2xvbmctcG9sbGluZycpXG4gICAgICogQHBhcmFtIGNvbWV0ZCB0aGUgY29tZXRkIG9iamVjdCB0aGlzIHRyYW5zcG9ydCBoYXMgYmVlbiByZWdpc3RlcmVkIHRvXG4gICAgICogQHNlZSAjdW5yZWdpc3RlcmVkKClcbiAgICAgKi9cbiAgICB0aGlzLnJlZ2lzdGVyZWQgPSBmdW5jdGlvbih0eXBlLCBjb21ldGQpIHtcbiAgICAgICAgX3R5cGUgPSB0eXBlO1xuICAgICAgICBfY29tZXRkID0gY29tZXRkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiBpbnZva2VkIGp1c3QgYWZ0ZXIgYSB0cmFuc3BvcnQgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IHVucmVnaXN0ZXJlZC5cbiAgICAgKiBAc2VlICNyZWdpc3RlcmVkKHR5cGUsIGNvbWV0ZClcbiAgICAgKi9cbiAgICB0aGlzLnVucmVnaXN0ZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdHlwZSA9IG51bGw7XG4gICAgICAgIF9jb21ldGQgPSBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfY29tZXRkLl9kZWJ1Zy5hcHBseShfY29tZXRkLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICB0aGlzLl9taXhpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbWV0ZC5fbWl4aW4uYXBwbHkoX2NvbWV0ZCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY29tZXRkLmdldENvbmZpZ3VyYXRpb24oKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRBZHZpY2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jb21ldGQuZ2V0QWR2aWNlKCk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0VGltZW91dCA9IGZ1bmN0aW9uKGZ1bmt0aW9uLCBkZWxheSkge1xuICAgICAgICByZXR1cm4gVXRpbHMuc2V0VGltZW91dChfY29tZXRkLCBmdW5rdGlvbiwgZGVsYXkpO1xuICAgIH07XG5cbiAgICB0aGlzLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgICAgICBVdGlscy5jbGVhclRpbWVvdXQoaGFuZGxlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgdGhlIGdpdmVuIHJlc3BvbnNlIGludG8gYW4gYXJyYXkgb2YgYmF5ZXV4IG1lc3NhZ2VzXG4gICAgICogQHBhcmFtIHJlc3BvbnNlIHRoZSByZXNwb25zZSB0byBjb252ZXJ0XG4gICAgICogQHJldHVybiBhbiBhcnJheSBvZiBiYXlldXggbWVzc2FnZXMgb2J0YWluZWQgYnkgY29udmVydGluZyB0aGUgcmVzcG9uc2VcbiAgICAgKi9cbiAgICB0aGlzLmNvbnZlcnRUb01lc3NhZ2VzID0gZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgaWYgKFV0aWxzLmlzU3RyaW5nKHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0NvdWxkIG5vdCBjb252ZXJ0IHRvIEpTT04gdGhlIGZvbGxvd2luZyBzdHJpbmcnLCAnXCInICsgcmVzcG9uc2UgKyAnXCInKTtcbiAgICAgICAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChVdGlscy5pc0FycmF5KHJlc3BvbnNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNwb25zZSA9PT0gdW5kZWZpbmVkIHx8IHJlc3BvbnNlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlc3BvbnNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gW3Jlc3BvbnNlXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyAnQ29udmVyc2lvbiBFcnJvciAnICsgcmVzcG9uc2UgKyAnLCB0eXBlb2YgJyArICh0eXBlb2YgcmVzcG9uc2UpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyB0cmFuc3BvcnQgY2FuIHdvcmsgZm9yIHRoZSBnaXZlbiB2ZXJzaW9uIGFuZCBjcm9zcyBkb21haW4gY29tbXVuaWNhdGlvbiBjYXNlLlxuICAgICAqIEBwYXJhbSB2ZXJzaW9uIGEgc3RyaW5nIGluZGljYXRpbmcgdGhlIHRyYW5zcG9ydCB2ZXJzaW9uXG4gICAgICogQHBhcmFtIGNyb3NzRG9tYWluIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNvbW11bmljYXRpb24gaXMgY3Jvc3MgZG9tYWluXG4gICAgICogQHBhcmFtIHVybCB0aGUgVVJMIHRvIGNvbm5lY3QgdG9cbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhpcyB0cmFuc3BvcnQgY2FuIHdvcmsgZm9yIHRoZSBnaXZlbiB2ZXJzaW9uIGFuZCBjcm9zcyBkb21haW4gY29tbXVuaWNhdGlvbiBjYXNlLFxuICAgICAqIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHRoaXMuYWNjZXB0ID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB0eXBlIG9mIHRoaXMgdHJhbnNwb3J0LlxuICAgICAqIEBzZWUgI3JlZ2lzdGVyZWQodHlwZSwgY29tZXRkKVxuICAgICAqL1xuICAgIHRoaXMuZ2V0VHlwZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3R5cGU7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VVJMID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdXJsO1xuICAgIH07XG5cbiAgICB0aGlzLnNldFVSTCA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgICBfdXJsID0gdXJsO1xuICAgIH07XG5cbiAgICB0aGlzLnNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIF90eXBlLCAncmVzZXQnLCBpbml0ID8gJ2luaXRpYWwnIDogJ3JldHJ5Jyk7XG4gICAgfTtcblxuICAgIHRoaXMuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIF90eXBlLCAnYWJvcnRlZCcpO1xuICAgIH07XG5cbiAgICB0aGlzLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFR5cGUoKTtcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMuZGVyaXZlID0gZnVuY3Rpb24oYmFzZU9iamVjdCkge1xuICAgIGZ1bmN0aW9uIEYoKSB7XG4gICAgfVxuXG4gICAgRi5wcm90b3R5cGUgPSBiYXNlT2JqZWN0O1xuICAgIHJldHVybiBuZXcgRigpO1xufTtcbiIsIi8qKlxuICogQSByZWdpc3RyeSBmb3IgdHJhbnNwb3J0cyB1c2VkIGJ5IHRoZSBDb21ldEQgb2JqZWN0LlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFRyYW5zcG9ydFJlZ2lzdHJ5KCkge1xuICAgIHZhciBfdHlwZXMgPSBbXTtcbiAgICB2YXIgX3RyYW5zcG9ydHMgPSB7fTtcblxuICAgIHRoaXMuZ2V0VHJhbnNwb3J0VHlwZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90eXBlcy5zbGljZSgwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5maW5kVHJhbnNwb3J0VHlwZXMgPSBmdW5jdGlvbih2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gX3R5cGVzW2ldO1xuICAgICAgICAgICAgaWYgKF90cmFuc3BvcnRzW3R5cGVdLmFjY2VwdCh2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHRoaXMubmVnb3RpYXRlVHJhbnNwb3J0ID0gZnVuY3Rpb24odHlwZXMsIHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gX3R5cGVzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0eXBlcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSB0eXBlc1tqXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHNbdHlwZV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc3BvcnQuYWNjZXB0KHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwb3J0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKHR5cGUsIHRyYW5zcG9ydCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGV4aXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoX3R5cGVzW2ldID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgZXhpc3RpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFleGlzdGluZykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBfdHlwZXMucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3R5cGVzLnNwbGljZShpbmRleCwgMCwgdHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdHJhbnNwb3J0c1t0eXBlXSA9IHRyYW5zcG9ydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhZXhpc3Rpbmc7XG4gICAgfTtcblxuICAgIHRoaXMuZmluZCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChfdHlwZXNbaV0gPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3RyYW5zcG9ydHNbdHlwZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKF90eXBlc1tpXSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIF90eXBlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdHJhbnNwb3J0c1t0eXBlXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwb3J0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF90eXBlcyA9IFtdO1xuICAgICAgICBfdHJhbnNwb3J0cyA9IHt9O1xuICAgIH07XG5cbiAgICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydHNbX3R5cGVzW2ldXS5yZXNldChpbml0KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuIiwiZXhwb3J0cy5pc1N0cmluZyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmc7XG59O1xuXG5leHBvcnRzLmlzQXJyYXkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGVsZW1lbnQgaXMgY29udGFpbmVkIGludG8gdGhlIGdpdmVuIGFycmF5LlxuICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgdG8gY2hlY2sgcHJlc2VuY2UgZm9yXG4gKiBAcGFyYW0gYXJyYXkgdGhlIGFycmF5IHRvIGNoZWNrIGZvciB0aGUgZWxlbWVudCBwcmVzZW5jZVxuICogQHJldHVybiB0aGUgaW5kZXggb2YgdGhlIGVsZW1lbnQsIGlmIHByZXNlbnQsIG9yIGEgbmVnYXRpdmUgaW5kZXggaWYgdGhlIGVsZW1lbnQgaXMgbm90IHByZXNlbnRcbiAqL1xuZXhwb3J0cy5pbkFycmF5ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGFycmF5KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7ICsraSkge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gYXJyYXlbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn07XG5cbmV4cG9ydHMuc2V0VGltZW91dCA9IGZ1bmN0aW9uIChjb21ldGQsIGZ1bmt0aW9uLCBkZWxheSkge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgdGltZWQgZnVuY3Rpb24nLCBmdW5rdGlvbik7XG4gICAgICAgICAgICBmdW5rdGlvbigpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICBjb21ldGQuX2RlYnVnKCdFeGNlcHRpb24gaW52b2tpbmcgdGltZWQgZnVuY3Rpb24nLCBmdW5rdGlvbiwgeCk7XG4gICAgICAgIH1cbiAgICB9LCBkZWxheSk7XG59O1xuXG5leHBvcnRzLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uICh0aW1lb3V0SGFuZGxlKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpO1xufTtcbiIsInZhciBUcmFuc3BvcnQgPSByZXF1aXJlKCcuL1RyYW5zcG9ydCcpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBXZWJTb2NrZXRUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF9zdXBlciA9IG5ldyBUcmFuc3BvcnQoKTtcbiAgICB2YXIgX3NlbGYgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcik7XG4gICAgdmFyIF9jb21ldGQ7XG4gICAgLy8gQnkgZGVmYXVsdCBXZWJTb2NrZXQgaXMgc3VwcG9ydGVkXG4gICAgdmFyIF93ZWJTb2NrZXRTdXBwb3J0ZWQgPSB0cnVlO1xuICAgIC8vIFdoZXRoZXIgd2Ugd2VyZSBhYmxlIHRvIGVzdGFibGlzaCBhIFdlYlNvY2tldCBjb25uZWN0aW9uXG4gICAgdmFyIF93ZWJTb2NrZXRDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB2YXIgX3N0aWNreVJlY29ubmVjdCA9IHRydWU7XG4gICAgLy8gVGhlIGNvbnRleHQgY29udGFpbnMgdGhlIGVudmVsb3BlcyB0aGF0IGhhdmUgYmVlbiBzZW50XG4gICAgLy8gYW5kIHRoZSB0aW1lb3V0cyBmb3IgdGhlIG1lc3NhZ2VzIHRoYXQgaGF2ZSBiZWVuIHNlbnQuXG4gICAgdmFyIF9jb250ZXh0ID0gbnVsbDtcbiAgICB2YXIgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgIHZhciBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgdmFyIF9zdWNjZXNzQ2FsbGJhY2sgPSBudWxsO1xuXG4gICAgX3NlbGYucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIF9zdXBlci5yZXNldChpbml0KTtcbiAgICAgICAgX3dlYlNvY2tldFN1cHBvcnRlZCA9IHRydWU7XG4gICAgICAgIGlmIChpbml0KSB7XG4gICAgICAgICAgICBfd2ViU29ja2V0Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgX3N0aWNreVJlY29ubmVjdCA9IHRydWU7XG4gICAgICAgIF9jb250ZXh0ID0gbnVsbDtcbiAgICAgICAgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9mb3JjZUNsb3NlKGNvbnRleHQsIGV2ZW50KSB7XG4gICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLndlYlNvY2tldENsb3NlKGNvbnRleHQsIGV2ZW50LmNvZGUsIGV2ZW50LnJlYXNvbik7XG4gICAgICAgICAgICAvLyBGb3JjZSBpbW1lZGlhdGUgZmFpbHVyZSBvZiBwZW5kaW5nIG1lc3NhZ2VzIHRvIHRyaWdnZXIgcmVjb25uZWN0LlxuICAgICAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgc2VydmVyIG1heSBub3QgcmVwbHkgdG8gb3VyIGNsb3NlKClcbiAgICAgICAgICAgIC8vIGFuZCB0aGVyZWZvcmUgdGhlIG9uY2xvc2UgZnVuY3Rpb24gaXMgbmV2ZXIgY2FsbGVkLlxuICAgICAgICAgICAgdGhpcy5vbkNsb3NlKGNvbnRleHQsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9zYW1lQ29udGV4dChjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0ID09PSBfY29ubmVjdGluZyB8fCBjb250ZXh0ID09PSBfY29udGV4dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc3RvcmVFbnZlbG9wZShjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2VJZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBlbnZlbG9wZS5tZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmlkKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQuZW52ZWxvcGVzW21lc3NhZ2VJZHMuam9pbignLCcpXSA9IFtlbnZlbG9wZSwgbWV0YUNvbm5lY3RdO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzdG9yZWQgZW52ZWxvcGUsIGVudmVsb3BlcycsIGNvbnRleHQuZW52ZWxvcGVzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2Vic29ja2V0Q29ubmVjdChjb250ZXh0KSB7XG4gICAgICAgIC8vIFdlIG1heSBoYXZlIG11bHRpcGxlIGF0dGVtcHRzIHRvIG9wZW4gYSBXZWJTb2NrZXRcbiAgICAgICAgLy8gY29ubmVjdGlvbiwgZm9yIGV4YW1wbGUgYSAvbWV0YS9jb25uZWN0IHJlcXVlc3QgdGhhdFxuICAgICAgICAvLyBtYXkgdGFrZSB0aW1lLCBhbG9uZyB3aXRoIGEgdXNlci10cmlnZ2VyZWQgcHVibGlzaC5cbiAgICAgICAgLy8gRWFybHkgcmV0dXJuIGlmIHdlIGFyZSBhbHJlYWR5IGNvbm5lY3RpbmcuXG4gICAgICAgIGlmIChfY29ubmVjdGluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTWFuZ2xlIHRoZSBVUkwsIGNoYW5naW5nIHRoZSBzY2hlbWUgZnJvbSAnaHR0cCcgdG8gJ3dzJy5cbiAgICAgICAgdmFyIHVybCA9IF9jb21ldGQuZ2V0VVJMKCkucmVwbGFjZSgvXmh0dHAvLCAnd3MnKTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnY29ubmVjdGluZyB0byBVUkwnLCB1cmwpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcHJvdG9jb2wgPSBfY29tZXRkLmdldENvbmZpZ3VyYXRpb24oKS5wcm90b2NvbDtcbiAgICAgICAgICAgIGNvbnRleHQud2ViU29ja2V0ID0gcHJvdG9jb2wgPyBuZXcgV2ViU29ja2V0KHVybCwgcHJvdG9jb2wpIDogbmV3IFdlYlNvY2tldCh1cmwpO1xuICAgICAgICAgICAgX2Nvbm5lY3RpbmcgPSBjb250ZXh0O1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICBfd2ViU29ja2V0U3VwcG9ydGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnRXhjZXB0aW9uIHdoaWxlIGNyZWF0aW5nIFdlYlNvY2tldCBvYmplY3QnLCB4KTtcbiAgICAgICAgICAgIHRocm93IHg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCeSBkZWZhdWx0IHVzZSBzdGlja3kgcmVjb25uZWN0cy5cbiAgICAgICAgX3N0aWNreVJlY29ubmVjdCA9IF9jb21ldGQuZ2V0Q29uZmlndXJhdGlvbigpLnN0aWNreVJlY29ubmVjdCAhPT0gZmFsc2U7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY29ubmVjdFRpbWVvdXQgPSBfY29tZXRkLmdldENvbmZpZ3VyYXRpb24oKS5jb25uZWN0VGltZW91dDtcbiAgICAgICAgaWYgKGNvbm5lY3RUaW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgY29udGV4dC5jb25uZWN0VGltZXIgPSB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAndGltZWQgb3V0IHdoaWxlIGNvbm5lY3RpbmcgdG8gVVJMJywgdXJsLCAnOicsIGNvbm5lY3RUaW1lb3V0LCAnbXMnKTtcbiAgICAgICAgICAgICAgICAvLyBUaGUgY29ubmVjdGlvbiB3YXMgbm90IG9wZW5lZCwgY2xvc2UgYW55d2F5LlxuICAgICAgICAgICAgICAgIF9mb3JjZUNsb3NlLmNhbGwoc2VsZiwgY29udGV4dCwge2NvZGU6IDEwMDAsIHJlYXNvbjogJ0Nvbm5lY3QgVGltZW91dCd9KTtcbiAgICAgICAgICAgIH0sIGNvbm5lY3RUaW1lb3V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvbm9wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdXZWJTb2NrZXQgb25vcGVuJywgY29udGV4dCk7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5jb25uZWN0VGltZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyVGltZW91dChjb250ZXh0LmNvbm5lY3RUaW1lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfc2FtZUNvbnRleHQoY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICBfY29ubmVjdGluZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgICAgIF93ZWJTb2NrZXRDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYub25PcGVuKGNvbnRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgdmFsaWQgY29ubmVjdGlvbiBhbHJlYWR5LCBjbG9zZSB0aGlzIG9uZS5cbiAgICAgICAgICAgICAgICBfY29tZXRkLl93YXJuKCdDbG9zaW5nIGV4dHJhIFdlYlNvY2tldCBjb25uZWN0aW9uJywgdGhpcywgJ2FjdGl2ZSBjb25uZWN0aW9uJywgX2NvbnRleHQpO1xuICAgICAgICAgICAgICAgIF9mb3JjZUNsb3NlLmNhbGwoc2VsZiwgY29udGV4dCwge2NvZGU6IDEwMDAsIHJlYXNvbjogJ0V4dHJhIENvbm5lY3Rpb24nfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGhpcyBjYWxsYmFjayBpcyBpbnZva2VkIHdoZW4gdGhlIHNlcnZlciBzZW5kcyB0aGUgY2xvc2UgZnJhbWUuXG4gICAgICAgIC8vIFRoZSBjbG9zZSBmcmFtZSBmb3IgYSBjb25uZWN0aW9uIG1heSBhcnJpdmUgKmFmdGVyKiBhbm90aGVyXG4gICAgICAgIC8vIGNvbm5lY3Rpb24gaGFzIGJlZW4gb3BlbmVkLCBzbyB3ZSBtdXN0IG1ha2Ugc3VyZSB0aGF0IGFjdGlvbnNcbiAgICAgICAgLy8gYXJlIHBlcmZvcm1lZCBvbmx5IGlmIGl0J3MgdGhlIHNhbWUgY29ubmVjdGlvbi5cbiAgICAgICAgdmFyIG9uY2xvc2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQgPSBldmVudCB8fCB7Y29kZTogMTAwMH07XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnV2ViU29ja2V0IG9uY2xvc2UnLCBjb250ZXh0LCBldmVudCwgJ2Nvbm5lY3RpbmcnLCBfY29ubmVjdGluZywgJ2N1cnJlbnQnLCBfY29udGV4dCk7XG5cbiAgICAgICAgICAgIGlmIChjb250ZXh0LmNvbm5lY3RUaW1lcikge1xuICAgICAgICAgICAgICAgIHNlbGYuY2xlYXJUaW1lb3V0KGNvbnRleHQuY29ubmVjdFRpbWVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5vbkNsb3NlKGNvbnRleHQsIGV2ZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgb25tZXNzYWdlID0gZnVuY3Rpb24od3NNZXNzYWdlKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnV2ViU29ja2V0IG9ubWVzc2FnZScsIHdzTWVzc2FnZSwgY29udGV4dCk7XG4gICAgICAgICAgICBzZWxmLm9uTWVzc2FnZShjb250ZXh0LCB3c01lc3NhZ2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0Lm9ub3BlbiA9IG9ub3BlbjtcbiAgICAgICAgY29udGV4dC53ZWJTb2NrZXQub25jbG9zZSA9IG9uY2xvc2U7XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0Lm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIENsaWVudHMgc2hvdWxkIGNhbGwgb25jbG9zZSgpLCBidXQgaWYgdGhleSBkbyBub3Qgd2UgZG8gaXQgaGVyZSBmb3Igc2FmZXR5LlxuICAgICAgICAgICAgb25jbG9zZSh7Y29kZTogMTAwMCwgcmVhc29uOiAnRXJyb3InfSk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0Lm9ubWVzc2FnZSA9IG9ubWVzc2FnZTtcblxuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdjb25maWd1cmVkIGNhbGxiYWNrcyBvbicsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93ZWJTb2NrZXRTZW5kKGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB2YXIganNvbiA9IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlLm1lc3NhZ2VzKTtcbiAgICAgICAgY29udGV4dC53ZWJTb2NrZXQuc2VuZChqc29uKTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc2VudCcsIGVudmVsb3BlLCAnbWV0YUNvbm5lY3QgPScsIG1ldGFDb25uZWN0KTtcblxuICAgICAgICAvLyBNYW5hZ2UgdGhlIHRpbWVvdXQgd2FpdGluZyBmb3IgdGhlIHJlc3BvbnNlLlxuICAgICAgICB2YXIgbWF4RGVsYXkgPSB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhOZXR3b3JrRGVsYXk7XG4gICAgICAgIHZhciBkZWxheSA9IG1heERlbGF5O1xuICAgICAgICBpZiAobWV0YUNvbm5lY3QpIHtcbiAgICAgICAgICAgIGRlbGF5ICs9IHRoaXMuZ2V0QWR2aWNlKCkudGltZW91dDtcbiAgICAgICAgICAgIF9jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbWVzc2FnZUlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBlbnZlbG9wZS5tZXNzYWdlc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSWRzLnB1c2gobWVzc2FnZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQudGltZW91dHNbbWVzc2FnZS5pZF0gPSB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVHJhbnNwb3J0Jywgc2VsZi5nZXRUeXBlKCksICd0aW1pbmcgb3V0IG1lc3NhZ2UnLCBtZXNzYWdlLmlkLCAnYWZ0ZXInLCBkZWxheSwgJ29uJywgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdNZXNzYWdlIFRpbWVvdXQnfSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnd2FpdGluZyBhdCBtb3N0JywgZGVsYXksICdtcyBmb3IgbWVzc2FnZXMnLCBtZXNzYWdlSWRzLCAnbWF4TmV0d29ya0RlbGF5JywgbWF4RGVsYXksICcsIHRpbWVvdXRzOicsIGNvbnRleHQudGltZW91dHMpO1xuICAgIH1cblxuICAgIF9zZWxmLl9ub3RpZnlTdWNjZXNzID0gZnVuY3Rpb24oZm4sIG1lc3NhZ2VzKSB7XG4gICAgICAgIGZuLmNhbGwodGhpcywgbWVzc2FnZXMpO1xuICAgIH07XG5cbiAgICBfc2VsZi5fbm90aWZ5RmFpbHVyZSA9IGZ1bmN0aW9uKGZuLCBjb250ZXh0LCBtZXNzYWdlcywgZmFpbHVyZSkge1xuICAgICAgICBmbi5jYWxsKHRoaXMsIGNvbnRleHQsIG1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3NlbmQoY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQgPSBfY29ubmVjdGluZyB8fCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZXM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dHM6IHt9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgX3N0b3JlRW52ZWxvcGUuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgIF93ZWJzb2NrZXRDb25uZWN0LmNhbGwodGhpcywgY29udGV4dCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9zdG9yZUVudmVsb3BlLmNhbGwodGhpcywgY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgICAgICBfd2ViU29ja2V0U2VuZC5jYWxsKHRoaXMsIGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9mb3JjZUNsb3NlLmNhbGwoc2VsZiwgY29udGV4dCwge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiAxMDAwLFxuICAgICAgICAgICAgICAgICAgICByZWFzb246ICdFeGNlcHRpb24nLFxuICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3NlbGYub25PcGVuID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgICB2YXIgZW52ZWxvcGVzID0gY29udGV4dC5lbnZlbG9wZXM7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ29wZW5lZCcsIGNvbnRleHQsICdwZW5kaW5nIG1lc3NhZ2VzJywgZW52ZWxvcGVzKTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGVudmVsb3Blcykge1xuICAgICAgICAgICAgaWYgKGVudmVsb3Blcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBlbnZlbG9wZXNba2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgZW52ZWxvcGUgPSBlbGVtZW50WzBdO1xuICAgICAgICAgICAgICAgIHZhciBtZXRhQ29ubmVjdCA9IGVsZW1lbnRbMV07XG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgdGhlIHN1Y2Nlc3MgY2FsbGJhY2ssIHdoaWNoIGlzIGluZGVwZW5kZW50IGZyb20gdGhlIGVudmVsb3BlLFxuICAgICAgICAgICAgICAgIC8vIHNvIHRoYXQgaXQgY2FuIGJlIHVzZWQgdG8gbm90aWZ5IGFycml2YWwgb2YgbWVzc2FnZXMuXG4gICAgICAgICAgICAgICAgX3N1Y2Nlc3NDYWxsYmFjayA9IGVudmVsb3BlLm9uU3VjY2VzcztcbiAgICAgICAgICAgICAgICBfd2ViU29ja2V0U2VuZC5jYWxsKHRoaXMsIGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYub25NZXNzYWdlID0gZnVuY3Rpb24oY29udGV4dCwgd3NNZXNzYWdlKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3JlY2VpdmVkIHdlYnNvY2tldCBtZXNzYWdlJywgd3NNZXNzYWdlLCBjb250ZXh0KTtcblxuICAgICAgICB2YXIgY2xvc2UgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gdGhpcy5jb252ZXJ0VG9NZXNzYWdlcyh3c01lc3NhZ2UuZGF0YSk7XG4gICAgICAgIHZhciBtZXNzYWdlSWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZXNbaV07XG5cbiAgICAgICAgICAgIC8vIERldGVjdCBpZiB0aGUgbWVzc2FnZSBpcyBhIHJlc3BvbnNlIHRvIGEgcmVxdWVzdCB3ZSBtYWRlLlxuICAgICAgICAgICAgLy8gSWYgaXQncyBhIG1ldGEgbWVzc2FnZSwgZm9yIHN1cmUgaXQncyBhIHJlc3BvbnNlOyBvdGhlcndpc2UgaXQnc1xuICAgICAgICAgICAgLy8gYSBwdWJsaXNoIG1lc3NhZ2UgYW5kIHB1Ymxpc2ggcmVzcG9uc2VzIGRvbid0IGhhdmUgdGhlIGRhdGEgZmllbGQuXG4gICAgICAgICAgICBpZiAoL15cXC9tZXRhXFwvLy50ZXN0KG1lc3NhZ2UuY2hhbm5lbCkgfHwgbWVzc2FnZS5kYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlSWRzLnB1c2gobWVzc2FnZS5pZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRpbWVvdXQgPSBjb250ZXh0LnRpbWVvdXRzW21lc3NhZ2UuaWRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY29udGV4dC50aW1lb3V0c1ttZXNzYWdlLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3JlbW92ZWQgdGltZW91dCBmb3IgbWVzc2FnZScsIG1lc3NhZ2UuaWQsICcsIHRpbWVvdXRzJywgY29udGV4dC50aW1lb3V0cyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgnL21ldGEvY29ubmVjdCcgPT09IG1lc3NhZ2UuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgnL21ldGEvZGlzY29ubmVjdCcgPT09IG1lc3NhZ2UuY2hhbm5lbCAmJiAhX2Nvbm5lY3RlZCkge1xuICAgICAgICAgICAgICAgIGNsb3NlID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZW52ZWxvcGUgY29ycmVzcG9uZGluZyB0byB0aGUgbWVzc2FnZXMuXG4gICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlbnZlbG9wZXMgPSBjb250ZXh0LmVudmVsb3BlcztcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtZXNzYWdlSWRzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaWQgPSBtZXNzYWdlSWRzW2pdO1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGVudmVsb3Blcykge1xuICAgICAgICAgICAgICAgIGlmIChlbnZlbG9wZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWRzID0ga2V5LnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IFV0aWxzLmluQXJyYXkoaWQsIGlkcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gZW52ZWxvcGVzW2tleV1bMF07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWV0YUNvbm5lY3QgPSBlbnZlbG9wZXNba2V5XVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlbnZlbG9wZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudmVsb3Blc1tpZHMuam9pbignLCcpXSA9IFtlbnZlbG9wZSwgbWV0YUNvbm5lY3RdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3JlbW92ZWQgZW52ZWxvcGUsIGVudmVsb3BlcycsIGVudmVsb3Blcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ub3RpZnlTdWNjZXNzKF9zdWNjZXNzQ2FsbGJhY2ssIG1lc3NhZ2VzKTtcblxuICAgICAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMud2ViU29ja2V0Q2xvc2UoY29udGV4dCwgMTAwMCwgJ0Rpc2Nvbm5lY3QnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5vbkNsb3NlID0gZnVuY3Rpb24oY29udGV4dCwgZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnY2xvc2VkJywgY29udGV4dCwgZXZlbnQpO1xuXG4gICAgICAgIGlmIChfc2FtZUNvbnRleHQoY29udGV4dCkpIHtcbiAgICAgICAgICAgIC8vIFJlbWVtYmVyIGlmIHdlIHdlcmUgYWJsZSB0byBjb25uZWN0LlxuICAgICAgICAgICAgLy8gVGhpcyBjbG9zZSBldmVudCBjb3VsZCBiZSBkdWUgdG8gc2VydmVyIHNodXRkb3duLFxuICAgICAgICAgICAgLy8gYW5kIGlmIGl0IHJlc3RhcnRzIHdlIHdhbnQgdG8gdHJ5IHdlYnNvY2tldCBhZ2Fpbi5cbiAgICAgICAgICAgIF93ZWJTb2NrZXRTdXBwb3J0ZWQgPSBfc3RpY2t5UmVjb25uZWN0ICYmIF93ZWJTb2NrZXRDb25uZWN0ZWQ7XG4gICAgICAgICAgICBfY29ubmVjdGluZyA9IG51bGw7XG4gICAgICAgICAgICBfY29udGV4dCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGltZW91dHMgPSBjb250ZXh0LnRpbWVvdXRzO1xuICAgICAgICBjb250ZXh0LnRpbWVvdXRzID0ge307XG4gICAgICAgIGZvciAodmFyIGlkIGluIHRpbWVvdXRzKSB7XG4gICAgICAgICAgICBpZiAodGltZW91dHMuaGFzT3duUHJvcGVydHkoaWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclRpbWVvdXQodGltZW91dHNbaWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBlbnZlbG9wZXMgPSBjb250ZXh0LmVudmVsb3BlcztcbiAgICAgICAgY29udGV4dC5lbnZlbG9wZXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGVudmVsb3Blcykge1xuICAgICAgICAgICAgaWYgKGVudmVsb3Blcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gZW52ZWxvcGVzW2tleV1bMF07XG4gICAgICAgICAgICAgICAgdmFyIG1ldGFDb25uZWN0ID0gZW52ZWxvcGVzW2tleV1bMV07XG4gICAgICAgICAgICAgICAgaWYgKG1ldGFDb25uZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdlYnNvY2tldENvZGU6IGV2ZW50LmNvZGUsXG4gICAgICAgICAgICAgICAgICAgIHJlYXNvbjogZXZlbnQucmVhc29uXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuZXhjZXB0aW9uID0gZXZlbnQuZXhjZXB0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9ub3RpZnlGYWlsdXJlKGVudmVsb3BlLm9uRmFpbHVyZSwgY29udGV4dCwgZW52ZWxvcGUubWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLnJlZ2lzdGVyZWQgPSBmdW5jdGlvbih0eXBlLCBjb21ldGQpIHtcbiAgICAgICAgX3N1cGVyLnJlZ2lzdGVyZWQodHlwZSwgY29tZXRkKTtcbiAgICAgICAgX2NvbWV0ZCA9IGNvbWV0ZDtcbiAgICB9O1xuXG4gICAgX3NlbGYuYWNjZXB0ID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdhY2NlcHQsIHN1cHBvcnRlZDonLCBfd2ViU29ja2V0U3VwcG9ydGVkKTtcbiAgICAgICAgLy8gVXNpbmcgISEgdG8gcmV0dXJuIGEgYm9vbGVhbiAoYW5kIG5vdCB0aGUgV2ViU29ja2V0IG9iamVjdCkuXG4gICAgICAgIHJldHVybiBfd2ViU29ja2V0U3VwcG9ydGVkICYmICEoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBXZWJTb2NrZXQpICYmIF9jb21ldGQud2Vic29ja2V0RW5hYmxlZCAhPT0gZmFsc2U7XG4gICAgfTtcblxuICAgIF9zZWxmLnNlbmQgPSBmdW5jdGlvbihlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc2VuZGluZycsIGVudmVsb3BlLCAnbWV0YUNvbm5lY3QgPScsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgX3NlbmQuY2FsbCh0aGlzLCBfY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICB9O1xuXG4gICAgX3NlbGYud2ViU29ja2V0Q2xvc2UgPSBmdW5jdGlvbihjb250ZXh0LCBjb2RlLCByZWFzb24pIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChjb250ZXh0LndlYlNvY2tldCkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQud2ViU29ja2V0LmNsb3NlKGNvZGUsIHJlYXNvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKHgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9zdXBlci5hYm9ydCgpO1xuICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHRoaXMsIF9jb250ZXh0LCB7Y29kZTogMTAwMCwgcmVhc29uOiAnQWJvcnQnfSk7XG4gICAgICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBfc2VsZjtcbn07XG4iLCIvKipcbiAqIFpldGFQdXNoIGRlcGxveWFibGVzIG5hbWVzXG4gKi9cbmNvbnN0IERlcGxveWFibGVOYW1lcyA9IHtcbiAgQVVUSF9TSU1QTEU6ICdzaW1wbGUnLFxuICBBVVRIX1dFQUs6ICd3ZWFrJyxcbiAgQVVUSF9ERUxFR0FUSU5HOiAnZGVsZWdhdGluZydcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7e2F1dGhUeXBlOiBzdHJpbmcsIGJ1c2luZXNzSWQ6IHN0cmluZywgZGVwbG95bWVudElkOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBidXNpbmVzc0lkLCBkZXBsb3ltZW50SWQgfSkge1xuICAgIHRoaXMuYXV0aFR5cGUgPSBhdXRoVHlwZVxuICAgIHRoaXMuYnVzaW5lc3NJZCA9IGJ1c2luZXNzSWRcbiAgICB0aGlzLmRlcGxveW1lbnRJZCA9IGRlcGxveW1lbnRJZFxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge0NsaWVudEhlbHBlcn0gY2xpZW50XG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcyhjbGllbnQpIHtcbiAgICBjb25zdCBhdXRoZW50aWNhdGlvbiA9IHtcbiAgICAgIGRhdGE6IHRoaXMuYXV0aERhdGEsXG4gICAgICB0eXBlOiBgJHtjbGllbnQuZ2V0QnVzaW5lc3NJZCgpfS4ke3RoaXMuZGVwbG95bWVudElkfS4ke3RoaXMuYXV0aFR5cGV9YCxcbiAgICAgIHZlcnNpb246IHRoaXMuYXV0aFZlcnNpb25cbiAgICB9XG4gICAgaWYgKGNsaWVudC5nZXRSZXNvdXJjZSgpKSB7XG4gICAgICBhdXRoZW50aWNhdGlvbi5yZXNvdXJjZSA9IGNsaWVudC5nZXRSZXNvdXJjZSgpXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBleHQ6IHtcbiAgICAgICAgYXV0aGVudGljYXRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdldCBhdXRoIHZlcnNpb25cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhWZXJzaW9uKCkge1xuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuXG59XG5cbi8qKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBleHRlbmRzIHtBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBUb2tlbkhhbmRzaGFrZU1hbmFnZXIgZXh0ZW5kcyBBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXIge1xuICAvKipcbiAgICogQHBhcmFtIHt7YXV0aFR5cGU6IHN0cmluZywgZGVwbG95bWVudElkOiBzdHJpbmcsIHRva2VuOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIHRva2VuIH0pIHtcbiAgICBzdXBlcih7IGRlcGxveW1lbnRJZCwgYXV0aFR5cGUgfSlcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7dG9rZW46IHN0cmluZ31cbiAgICovXG4gIGdldCBhdXRoRGF0YSgpIHtcbiAgICBjb25zdCB7IHRva2VuIH0gPSB0aGlzXG4gICAgcmV0dXJuIHtcbiAgICAgIHRva2VuXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQGV4dGVuZHMge0Fic3RyYWN0SGFuZHNoYWtlTWFuYWdlcn1cbiAqL1xuZXhwb3J0IGNsYXNzIENyZWRlbnRpYWxzSGFuZHNoYWtlTWFuYWdlciBleHRlbmRzIEFic3RyYWN0SGFuZHNoYWtlTWFuYWdlciB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7e2F1dGhUeXBlOiBzdHJpbmcsIGRlcGxveW1lbnRJZDogc3RyaW5nLCBsb2dpbjogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nfX0gcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkLCBsb2dpbiwgcGFzc3dvcmQgfSkge1xuICAgIHN1cGVyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCB9KVxuICAgIHRoaXMubG9naW4gPSBsb2dpblxuICAgIHRoaXMucGFzc3dvcmQgPSBwYXNzd29yZFxuICB9XG4gIC8qKlxuICAgKiBHZXQgYXV0aCBkYXRhXG4gICAqIEByZXR1cm4ge2xvZ2luOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmd9XG4gICAqL1xuICBnZXQgYXV0aERhdGEoKSB7XG4gICAgY29uc3QgeyBsb2dpbiwgcGFzc3dvcmQgfSA9IHRoaXNcbiAgICByZXR1cm4ge1xuICAgICAgbG9naW4sIHBhc3N3b3JkXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBGYWN0b3J5IHRvIGNyZWF0ZSBoYW5kc2hha2VcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50RmFjdG9yeSB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3tkZXBsb3ltZW50SWQ6IHN0cmluZywgbG9naW46IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZ319IHBhcmFtZXRlcnNcbiAgICogQHJldHVybiB7Q3JlZGVudGlhbHNIYW5kc2hha2VNYW5hZ2VyfVxuICAgKi9cbiAgc3RhdGljIGNyZWF0ZVNpbXBsZUhhbmRzaGFrZSh7IGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkIH0pIHtcbiAgICByZXR1cm4gQXV0aGVudEZhY3RvcnkuY3JlYXRlSGFuZHNoYWtlKHtcbiAgICAgIGF1dGhUeXBlOiBEZXBsb3lhYmxlTmFtZXMuQVVUSF9TSU1QTEUsXG4gICAgICBkZXBsb3ltZW50SWQsXG4gICAgICBsb2dpbixcbiAgICAgIHBhc3N3b3JkXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHt7ZGVwbG95bWVudElkOiBzdHJpbmcsIHRva2VuOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVXZWFrSGFuZHNoYWtlKHsgZGVwbG95bWVudElkLCB0b2tlbiB9KSB7XG4gICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZUhhbmRzaGFrZSh7XG4gICAgICBhdXRoVHlwZTogRGVwbG95YWJsZU5hbWVzLkFVVEhfV0VBSyxcbiAgICAgIGRlcGxveW1lbnRJZCxcbiAgICAgIGxvZ2luOiB0b2tlbixcbiAgICAgIHBhc3N3b3JkOiBudWxsXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHt7ZGVwbG95bWVudElkOiBzdHJpbmcsIHRva2VuOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVEZWxlZ2F0aW5nSGFuZHNoYWtlKHsgZGVwbG95bWVudElkLCB0b2tlbiB9KSB7XG4gICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZUhhbmRzaGFrZSh7XG4gICAgICBhdXRoVHlwZTogRGVwbG95YWJsZU5hbWVzLkFVVEhfREVMRUdBVElORyxcbiAgICAgIGRlcGxveW1lbnRJZCxcbiAgICAgIGxvZ2luOiB0b2tlbixcbiAgICAgIHBhc3N3b3JkOiBudWxsXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHt7YXV0aFR5cGU6IHN0cmluZywgZGVwbG95bWVudElkOiBzdHJpbmcsIGxvZ2luOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcnxDcmVkZW50aWFsc0hhbmRzaGFrZU1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlSGFuZHNoYWtlKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkIH0pIHtcbiAgICBpZiAobnVsbCA9PT0gcGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiBuZXcgVG9rZW5IYW5kc2hha2VNYW5hZ2VyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgdG9rZW46IGxvZ2luIH0pXG4gICAgfVxuICAgIHJldHVybiBuZXcgQ3JlZGVudGlhbHNIYW5kc2hha2VNYW5hZ2VyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkICB9KVxuICB9XG5cbn1cbiIsImltcG9ydCB7IENvbWV0RCwgV2ViU29ja2V0VHJhbnNwb3J0IH0gZnJvbSAnemV0YXB1c2gtY29tZXRkJ1xuaW1wb3J0IHsgRmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydCB9IGZyb20gJy4vY29ubmVjdGlvbi9jb21ldGQnXG5pbXBvcnQgeyBDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIgfSBmcm9tICcuL2Nvbm5lY3Rpb24vY29ubmVjdGlvbi1zdGF0dXMnXG5pbXBvcnQgeyBnZXRTZXJ2ZXJzLCBzaHVmZmxlIH0gZnJvbSAnLi91dGlscy9pbmRleCdcblxuLyoqXG4gKiBDb21ldEQgTWVzc2FnZXMgZW51bWVyYXRpb25cbiAqL1xuY29uc3QgTWVzc2FnZSA9IHtcbiAgUkVDT05ORUNUX0hBTkRTSEFLRV9WQUxVRTogJ2hhbmRzaGFrZScsXG4gIFJFQ09OTkVDVF9OT05FX1ZBTFVFOiAnbm9uZScsXG4gIFJFQ09OTkVDVF9SRVRSWV9WQUxVRTogJ3JldHJ5J1xufVxuXG4vKipcbiAqIENvbWV0RCBUcmFuc3BvcnRzIGVudW1lcmF0aW9uXG4gKi9cbmNvbnN0IFRyYW5zcG9ydCA9IHtcbiAgTE9OR19QT0xMSU5HOiAnbG9uZy1wb2xsaW5nJyxcbiAgV0VCU09DS0VUOiAnd2Vic29ja2V0J1xufVxuXG4vKipcbiAqIFByb3ZpZGUgdXRpbGl0aWVzIGFuZCBhYnN0cmFjdGlvbiBvbiBDb21ldEQgVHJhbnNwb3J0IGxheWVyXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGNsYXNzIENsaWVudEhlbHBlciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgWmV0YVB1c2ggY2xpZW50IGhlbHBlclxuICAgKi9cbiAgY29uc3RydWN0b3IoeyBhcGlVcmwsIGJ1c2luZXNzSWQsIGZvcmNlSHR0cHMgPSBmYWxzZSwgaGFuZHNoYWtlU3RyYXRlZ3ksIHJlc291cmNlIH0pIHtcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuYnVzaW5lc3NJZCA9IGJ1c2luZXNzSWRcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb24oKTpBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9XG4gICAgICovXG4gICAgdGhpcy5oYW5kc2hha2VTdHJhdGVneSA9IGhhbmRzaGFrZVN0cmF0ZWd5XG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLnJlc291cmNlID0gcmVzb3VyY2VcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICB0aGlzLnNlcnZlcnMgPSBnZXRTZXJ2ZXJzKHsgYXBpVXJsLCBidXNpbmVzc0lkLCBmb3JjZUh0dHBzIH0pXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICovXG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzID0gW11cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy53YXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5zZXJ2ZXJVcmwgPSBudWxsXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpYmVRdWV1ZSA9IFtdXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0NvbWV0RH1cbiAgICAgKi9cbiAgICB0aGlzLmNvbWV0ZCA9IG5ldyBDb21ldEQoKVxuICAgIHRoaXMuY29tZXRkLnJlZ2lzdGVyVHJhbnNwb3J0KFRyYW5zcG9ydC5XRUJTT0NLRVQsIG5ldyBXZWJTb2NrZXRUcmFuc3BvcnQoKSlcbiAgICB0aGlzLmNvbWV0ZC5yZWdpc3RlclRyYW5zcG9ydChUcmFuc3BvcnQuTE9OR19QT0xMSU5HLCBuZXcgRmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydCgpKVxuICAgIHRoaXMuY29tZXRkLm9uVHJhbnNwb3J0RXhjZXB0aW9uID0gKGNvbWV0ZCwgdHJhbnNwb3J0KSA9PiB7XG4gICAgICBpZiAoVHJhbnNwb3J0LkxPTkdfUE9MTElORyA9PT0gdHJhbnNwb3J0KSB7XG4gICAgICAgIC8vIFRyeSB0byBmaW5kIGFuIG90aGVyIGF2YWlsYWJsZSBzZXJ2ZXJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBjdXJyZW50IG9uZSBmcm9tIHRoZSBfc2VydmVyTGlzdCBhcnJheVxuICAgICAgICB0aGlzLnVwZGF0ZVNlcnZlclVybCgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9oYW5kc2hha2UnLCAoeyBleHQsIHN1Y2Nlc3NmdWwsIGFkdmljZSwgZXJyb3IgfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ2xpZW50SGVscGVyOjovbWV0YS9oYW5kc2hha2UnLCB7IGV4dCwgc3VjY2Vzc2Z1bCwgYWR2aWNlLCBlcnJvciB9KVxuICAgICAgaWYgKHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgY29uc3QgeyBhdXRoZW50aWNhdGlvbiA9IG51bGwgfSA9IGV4dFxuICAgICAgICB0aGlzLmluaXRpYWxpemVkKGF1dGhlbnRpY2F0aW9uKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIHRoaXMuaGFuZHNoYWtlRmFpbHVyZShlcnJvcilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5jb21ldGQuYWRkTGlzdGVuZXIoJy9tZXRhL2hhbmRzaGFrZScsICh7IGFkdmljZSwgZXJyb3IsIGV4dCwgc3VjY2Vzc2Z1bCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Oi9tZXRhL2hhbmRzaGFrZScsIHsgZXh0LCBzdWNjZXNzZnVsLCBhZHZpY2UsIGVycm9yIH0pXG4gICAgICAvLyBBdXRoTmVnb3RpYXRpb25cbiAgICAgIGlmICghc3VjY2Vzc2Z1bCkge1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBhZHZpY2UpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfTk9ORV9WQUxVRSA9PT0gYWR2aWNlLnJlY29ubmVjdCkge1xuICAgICAgICAgIHRoaXMuYXV0aGVudGljYXRpb25GYWlsZWQoZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfSEFORFNIQUtFX1ZBTFVFID09PSBhZHZpY2UucmVjb25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5uZWdvdGlhdGUoZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9jb25uZWN0JywgKHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6L21ldGEvY29ubmVjdCcsIHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pXG4gICAgICAvLyBDb25uZWN0aW9uTGlzdGVuZXJcbiAgICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbkNsb3NlZCgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNDb25uZWN0ZWQgPSB0aGlzLmNvbm5lY3RlZFxuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHN1Y2Nlc3NmdWxcbiAgICAgICAgaWYgKCF0aGlzLndhc0Nvbm5lY3RlZCAmJiB0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgICAgIHRoaXMuY29tZXRkLmJhdGNoKHRoaXMsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFVucXVldWUgc3Vic2NyaXB0aW9uc1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVRdWV1ZS5mb3JFYWNoKCh7IHByZWZpeCwgbGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgfSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnN1YnNjcmliZShwcmVmaXgsIGxpc3RlbmVyLCBzdWJzY3JpcHRpb25zKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlUXVldWUgPSBbXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy53YXNDb25uZWN0ZWQgJiYgIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgYnJva2VuXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uQnJva2VuKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIENvbm5lY3QgY2xpZW50IHVzaW5nIENvbWV0RCBUcmFuc3BvcnRcbiAgICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIHRoaXMuc2VydmVyVXJsID0gc2h1ZmZsZShzZXJ2ZXJzKVxuXG4gICAgICB0aGlzLmNvbWV0ZC5jb25maWd1cmUoe1xuICAgICAgICB1cmw6IGAke3RoaXMuc2VydmVyVXJsfS9zdHJkYCxcbiAgICAgICAgYmFja29mZkluY3JlbWVudDogMTAwMCxcbiAgICAgICAgbWF4QmFja29mZjogNjAwMDAsXG4gICAgICAgIGFwcGVuZE1lc3NhZ2VUeXBlVG9VUkw6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNvbWV0ZC5oYW5kc2hha2UodGhpcy5nZXRIYW5kc2hha2VGaWVsZHMoKSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgY29ubmVjdGlvbkVzdGFibGlzaGVkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uRXN0YWJsaXNoZWQoKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgKi9cbiAgY29ubmVjdGlvbkJyb2tlbigpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uQ29ubmVjdGlvbkJyb2tlbigpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTm90aWZ5IGxpc3RlbmVycyB3aGVuIGEgbWVzc2FnZSBpcyBsb3N0XG4gICAqL1xuICBtZXNzYWdlTG9zdChjaGFubmVsLCBkYXRhKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lci5vbk1lc3NhZ2VMb3N0KGNoYW5uZWwsIGRhdGEpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTm90aWZ5IGxpc3RlbmVycyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBjb25uZWN0aW9uQ2xvc2VkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uQ2xvc2VkKClcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgaW5pdGlhbGl6ZWQoYXV0aGVudGljYXRpb24pIHtcbiAgICBpZiAoYXV0aGVudGljYXRpb24pIHtcbiAgICAgIHRoaXMudXNlcklkID0gYXV0aGVudGljYXRpb24udXNlcklkXG4gICAgfVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25TdWNjZXNzZnVsSGFuZHNoYWtlKGF1dGhlbnRpY2F0aW9uKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBoYW5kc2hha2Ugc3RlcCBzdWNjZWVkXG4gICAqL1xuICBhdXRoZW50aWNhdGlvbkZhaWxlZChlcnJvcikge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25GYWlsZWRIYW5kc2hha2UoZXJyb3IpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTWFuYWdlIGhhbmRzaGFrZSBmYWlsdXJlIGNhc2VcbiAgICovXG4gIGhhbmRzaGFrZUZhaWx1cmUoKSB7XG5cbiAgfVxuICAvKipcbiAgKiBSZW1vdmUgY3VycmVudCBzZXJ2ZXIgdXJsIGZyb20gdGhlIHNlcnZlciBsaXN0IGFuZCBzaHVmZmxlIGZvciBhbm90aGVyIG9uZVxuICAqL1xuICB1cGRhdGVTZXJ2ZXJVcmwoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2VydmVycy5pbmRleE9mKHRoaXMuc2VydmVyVXJsKVxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgc2VydmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgICBpZiAoc2VydmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbW9yZSBzZXJ2ZXIgYXZhaWxhYmxlXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSBzaHVmZmxlKHNlcnZlcnMpXG4gICAgICAgIHRoaXMuY29tZXRkLmNvbmZpZ3VyZSh7XG4gICAgICAgICAgdXJsOiBgJHt0aGlzLnNlcnZlclVybH0vc3RyZGBcbiAgICAgICAgfSlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21ldGQuaGFuZHNoYWtlKHRoaXMuZ2V0SGFuZHNoYWtlRmllbGRzKCkpXG4gICAgICAgIH0sIDI1MClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOZWdvY2lhdGUgYXV0aGVudGljYXRpb25cbiAgICovXG4gIG5lZ290aWF0ZShleHQpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Om5lZ290aWF0ZScsIGV4dClcbiAgfVxuICAvKipcbiAgICogRGlzY29ubmVjdCBDb21ldEQgY2xpZW50XG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY29tZXRkLmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgQ29tZXREIGhhbmRzaGFrZSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcygpIHtcbiAgICBjb25zdCBoYW5kc2hha2UgPSB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5KClcbiAgICByZXR1cm4gaGFuZHNoYWtlLmdldEhhbmRzaGFrZUZpZWxkcyh0aGlzKVxuICB9XG4gIC8qKlxuICAgKiBTZXQgYSBuZXcgaGFuZHNoYWtlIGZhY3RvcnkgbWV0aG9kc1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfSBoYW5kc2hha2VTdHJhdGVneVxuICAgKi9cbiAgc2V0SGFuZHNoYWtlU3RyYXRlZ3koaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5ID0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgfVxuICAvKipcbiAgICogR2V0IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVzaW5lc3NJZFxuICB9XG4gIC8qKlxuICAgKiBHZXQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgdGhyb3cgTm90WWV0SW1wbGVtZW50ZWRFcnJvcigpXG4gIH1cbiAgLyoqXG4gICAqIEdldCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZVxuICB9XG4gIC8qKlxuICAgKiBTdWJyaWJlIGFsbCBtZXRob2RzIGRlZmluZWQgaW4gdGhlIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gcHJlZml4ZWQgY2hhbm5lbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gQ2hhbm5lbCBwcmVmaXhcbiAgICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH0gc3Vic2NyaXB0aW9uc1xuICAgKi9cbiAgc3Vic2NyaWJlKHByZWZpeCwgbGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgPSB7fSkge1xuICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnN1YnNjcmliZVF1ZXVlLnB1c2goeyBwcmVmaXgsIGxpc3RlbmVyLCBzdWJzY3JpcHRpb25zIH0pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBtZXRob2QgaW4gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGxpc3RlbmVyLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgICAgc3Vic2NyaXB0aW9uc1ttZXRob2RdID0gdGhpcy5jb21ldGQuc3Vic2NyaWJlKGNoYW5uZWwsIGxpc3RlbmVyW21ldGhvZF0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcbiAgfVxuICAvKipcbiAgICogR2V0IGEgcHVibGlzaGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggLSBDaGFubmVsIHByZWZpeFxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvblxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHNlcnZpY2VQdWJsaXNoZXJcbiAgICovXG4gIGNyZWF0ZVNlcnZpY2VQdWJsaXNoZXIocHJlZml4LCBkZWZpbml0aW9uKSB7XG4gICAgY29uc3Qgc2VydmljZVB1Ymxpc2hlciA9IHt9XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gZGVmaW5pdGlvbikge1xuICAgICAgaWYgKGRlZmluaXRpb24uaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgIHNlcnZpY2VQdWJsaXNoZXJbbWV0aG9kXSA9IChwYXJhbWV0ZXJzID0ge30pID0+IHtcbiAgICAgICAgICB0aGlzLmNvbWV0ZC5wdWJsaXNoKGNoYW5uZWwsIHBhcmFtZXRlcnMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlcnZpY2VQdWJsaXNoZXJcbiAgfVxuICAvKipcbiAgICogVW5zdWJjcmliZSBhbGwgc3Vic2NyaXB0aW9ucyBkZWZpbmVkIGluIGdpdmVuIHN1YnNjcmlwdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqL1xuICB1bnN1YnNjcmliZShzdWJzY3JpcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gc3Vic2NyaXB0aW9ucykge1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzLmNvbWV0ZC51bnN1YnNjcmliZShzdWJzY3JpcHRpb25zW21ldGhvZF0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBjb25uZWN0aW9uIGxpc3RlbmVyIHRvIGhhbmRsZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gZXZlbnRzXG4gICAqIEBwYXJhbSB7Q29ubmVjdGlvblN0YXR1c0xpc3RlbmVyfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxpc3RlbmVyID0gT2JqZWN0LmFzc2lnbihuZXcgQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKCksIGxpc3RlbmVyKVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5wdXNoKGNvbm5lY3Rpb25MaXN0ZW5lcilcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBBUElfVVJMIH0gZnJvbSAnLi91dGlscy9pbmRleCdcbmltcG9ydCB7IENsaWVudEhlbHBlciB9IGZyb20gJy4vY2xpZW50LWhlbHBlcidcbmltcG9ydCB7IE5vdFlldEltcGxlbWVudGVkRXJyb3IgfSBmcm9tICcuL3V0aWxzL2luZGV4J1xuXG4vKipcbiAqIENsaWVudCBjb25maWcgb2JqZWN0LlxuICogQHR5cGVkZWYge09iamVjdH0gQ2xpZW50Q29uZmlnXG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBpVXJsIC0gQXBpIFVybFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGJ1c2luZXNzSWQgLSBCdXNpbmVzcyBpZFxuICogQHByb3BlcnR5IHtib29sZWFufSBmb3JjZUh0dHBzIC0gRm9yY2UgZW5kIHRvIGVuZCBIVFRQUyBjb25uZWN0aW9uXG4gKiBAcHJvcGVydHkge2Z1bmN0aW9uKCk6QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfSBoYW5kc2hha2VTdHJhdGVneSAtIEhhbmRzaGFrZSBzdHJhdGVneVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJlc291cmNlIC0gQ2xpZW50IHJlc291cmNlIGlkXG4gKi9cblxuLyoqXG4gKiBaZXRhUHVzaCBDbGllbnQgdG8gY29ubmVjdFxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBleGFtcGxlXG4gKiAvLyBTZWN1cml6ZWQgY2xpZW50IHdpdGggdG9rZW4gYmFzZWQgY29ubmVjdGlvblxuICogY29uc3QgY2xpZW50ID0gbmV3IFpldGFQdXNoLkNsaWVudCh7XG4gKiAgIGJ1c2luZXNzSWQ6ICc8WU9VUi1CVVNJTkVTUy1JRD4nLFxuICogICBmb3JjZUh0dHBzOiB0cnVlLFxuICogICBoYW5kc2hha2VTdHJhdGVneTogZnVuY3Rpb24oKSB7XG4gKiAgICAgcmV0dXJuIFpldGFQdXNoLkF1dGhlbnRGYWN0b3J5LmNyZWF0ZVdlYWtIYW5kc2hha2Uoe1xuICogICAgICAgdG9rZW46IG51bGwsXG4gKiAgICAgICBkZXBsb3ltZW50SWQ6ICc8WU9VUi1ERVBMT1lNRU5ULUlEPidcbiAgKiAgICB9KVxuICogICB9XG4gKiB9KVxuICogQGV4YW1wbGVcbiAqIC8vIENsaWVudCB3aXRoIGNyZWRlbnRpYWxzIGJhc2VkIGNvbm5lY3Rpb25cbiAqIGNvbnN0IGNsaWVudCA9IG5ldyBaZXRhUHVzaC5DbGllbnQoe1xuICogICBidXNpbmVzc0lkOiAnPFlPVVItQlVTSU5FU1MtSUQ+JyxcbiAqICAgaGFuZHNoYWtlU3RyYXRlZ3k6IGZ1bmN0aW9uKCkge1xuICogICAgIHJldHVybiBaZXRhUHVzaC5BdXRoZW50RmFjdG9yeS5jcmVhdGVTaW1wbGVIYW5kc2hha2Uoe1xuICogICAgICAgbG9naW46ICc8VVNFUi1MT0dJTj4nLFxuICogICAgICAgcGFzc3dvcmQ6ICc8VVNFUi1QQVNTV09SRD4nLFxuICogICAgICAgZGVwbG95bWVudElkOiAnPFlPVVItREVQTE9ZTUVOVC1JRD4nXG4gICogICAgfSlcbiAqICAgfVxuICogfSlcbiAqL1xuZXhwb3J0IGNsYXNzIENsaWVudCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge0NsaWVudENvbmZpZ30gY29uZmlnXG4gICAqIENyZWF0ZSBhIG5ldyBaZXRhUHVzaCBjbGllbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXBpVXJsID0gQVBJX1VSTCwgYnVzaW5lc3NJZCwgZm9yY2VIdHRwcyA9IGZhbHNlLCBoYW5kc2hha2VTdHJhdGVneSwgcmVzb3VyY2UgPSBudWxsIH0pIHtcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Q2xpZW50SGVscGVyfVxuICAgICAqL1xuICAgIHRoaXMuaGVscGVyID0gbmV3IENsaWVudEhlbHBlcih7XG4gICAgICBhcGlVcmwsXG4gICAgICBidXNpbmVzc0lkLFxuICAgICAgZm9yY2VIdHRwcyxcbiAgICAgIGhhbmRzaGFrZVN0cmF0ZWd5LFxuICAgICAgcmVzb3VyY2VcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBDb25uZWN0IGNsaWVudCB0byBaZXRhUHVzaFxuICAgKi9cbiAgY29ubmVjdCgpIHtcbiAgICB0aGlzLmhlbHBlci5jb25uZWN0KClcbiAgfVxuICAvKipcbiAgICogRGlzb25uZWN0IGNsaWVudCBmcm9tIFpldGFQdXNoXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuaGVscGVyLmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzZXJ2aWNlIHB1Ymxpc2hlciBiYXNlZCBvbiBwdWJsaXNoZXIgZGVmaW5pdGlvbiBmb3IgdGhlIGdpdmVuIGRlcGxveW1lbnQgaWRcbiAgICogQHBhcmFtIHt7ZGVwbG95bWVudElkOiBzdHJpbmcsIGRlZmluaXRpb246IE9iamVjdH19IHBhcmFtZXRlcnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlU2VydmljZVB1Ymxpc2hlcih7IGRlcGxveW1lbnRJZCwgZGVmaW5pdGlvbiB9KSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmNyZWF0ZVNlcnZpY2VQdWJsaXNoZXIoYC9zZXJ2aWNlLyR7dGhpcy5nZXRCdXNpbmVzc0lkKCl9LyR7ZGVwbG95bWVudElkfWAsIGRlZmluaXRpb24pXG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xpZW50IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmdldEJ1c2luZXNzSWQoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsaWVudCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5oZWxwZXIuZ2V0UmVzb3VyY2UoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsaWVudCB1c2VyIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFVzZXJJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oZWxwZXIuZ2V0VXNlcklkKClcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBjbGllbnQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmdldFNlc3Npb25JZCgpXG4gIH1cbiAgLyoqXG4gICAqIFN1YnNjcmliZSBhbGwgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZGVwbG95bWVudElkXG4gICAqIEBwYXJhbSB7e2RlcGxveW1lbnRJZDogc3RyaW5nLCBsaXN0ZW5lcjogT2JqZWN0fX0gcGFyYW1ldGVyc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IHN1YnNjcmlwdGlvblxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBzdGFja1NlcnZpY2VMaXN0ZW5lciA9IHtcbiAgICogICBsaXN0KCkge30sXG4gICAqICAgcHVzaCgpIHt9LFxuICAgKiAgIHVwZGF0ZSgpIHt9XG4gICAqIH1cbiAgICogY2xpZW50LnN1YnNjcmliZSh7XG4gICAqICAgZGVwbG95bWVudElkOiAnPFlPVVItU1RBQ0stREVQTE9ZTUVOVC1JRD4nLFxuICAgKiAgIGxpc3RlbmVyOiBzdGFja1NlcnZpY2VMaXN0ZW5lclxuICAgKiB9KVxuICAgKi9cbiAgc3Vic2NyaWJlKHsgZGVwbG95bWVudElkLCBsaXN0ZW5lciB9KSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLnN1YnNjcmliZShgL3NlcnZpY2UvJHt0aGlzLmdldEJ1c2luZXNzSWQoKX0vJHtkZXBsb3ltZW50SWR9YCwgbGlzdGVuZXIpXG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHB1Ymxpc2gvc3Vic2NyaWJlXG4gICAqIEBwYXJhbSB7e2RlcGxveW1lbnRJZDogc3RyaW5nLCBsaXN0ZW5lcjogT2JqZWN0LCBkZWZpbml0aW9uOiBPYmplY3R9fSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGNyZWF0ZVB1Ymxpc2hlclN1YnNjcmliZXIoeyBkZXBsb3ltZW50SWQsIGxpc3RlbmVyLCBkZWZpbml0aW9uIH0pIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3Vic2NyaXB0aW9uOiB0aGlzLnN1YnNjcmliZSh7IGRlcGxveW1lbnRJZCwgbGlzdGVuZXIgfSksXG4gICAgICBwdWJsaXNoZXI6IHRoaXMuY3JlYXRlU2VydmljZVB1Ymxpc2hlcih7IGRlcGxveW1lbnRJZCwgZGVmaW5pdGlvbiB9KVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogU2V0IG5ldyBjbGllbnQgcmVzb3VyY2UgdmFsdWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlc291cmNlXG4gICAqL1xuICBzZXRSZXNvdXJjZShyZXNvdXJjZSkge1xuICAgIHRoaXMuaGVscGVyLnNldFJlc291cmNlKHJlc291cmNlKVxuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBjb25uZWN0aW9uIGxpc3RlbmVyIHRvIGhhbmRsZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gZXZlbnRzXG4gICAqIEBwYXJhbSB7Q29ubmVjdGlvblN0YXR1c0xpc3RlbmVyfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmFkZENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcihsaXN0ZW5lcilcbiAgfVxuICAvKipcbiAgICogRm9yY2UgZGlzY29ubmVjdC9jb25uZWN0IHdpdGggbmV3IGhhbmRzaGFrZSBmYWN0b3J5XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oKTpBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9IGhhbmRzaGFrZVN0cmF0ZWd5XG4gICAqL1xuICBoYW5kc2hha2UoaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICB0aGlzLmRpc2Nvbm5lY3QoKVxuICAgIGlmIChoYW5kc2hha2VTdHJhdGVneSkge1xuICAgICAgdGhpcy5oZWxwZXIuc2V0SGFuZHNoYWtlU3RyYXRlZ3koaGFuZHNoYWtlU3RyYXRlZ3kpXG4gICAgfVxuICAgIHRoaXMuY29ubmVjdCgpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2VydmljZSBsaXN0ZXIgZnJvbSBtZXRob2RzIGxpc3Qgd2l0aCBhIGRlZmF1bHQgaGFuZGxlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQHBhcmFtIHt7bWV0aG9kczogQXJyYXk8ZnVuY3Rpb24+LCBoYW5kbGVyOiBmdW5jdGlvbn19IHBhcmFtc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IGxpc3RlbmVyXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IGdldFN0YWNrU2VydmljZUxpc3RlbmVyID0gKCkgPT4ge1xuICAgKiAgIHJldHVybiBDbGllbnQuZ2V0R2VuZXJpY1NlcnZpY2VMaXN0ZW5lcih7XG4gICAqICAgICBtZXRob2RzOiBbJ2dldExpc3RlbmVycycsICdsaXN0JywgJ3B1cmdlJywgJ3B1c2gnLCAncmVtb3ZlJywgJ3NldExpc3RlbmVycycsICd1cGRhdGUnLCAnZXJyb3InXSxcbiAgICogICAgIGhhbmRsZXI6ICh7IGNoYW5uZWwsIGRhdGEgfSkgPT4ge1xuICAgKiAgICAgICBjb25zb2xlLmRlYnVnKGBTdGFjazo6JHttZXRob2R9YCwgeyBjaGFubmVsLCBkYXRhIH0pXG4gICAqICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm1bbmFtZT1cIiR7bWV0aG9kfVwiXSBbbmFtZT1cIm91dHB1dFwiXWApLnZhbHVlID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICogICAgIH1cbiAgICogICB9KVxuICAgKiB9XG4gICAqL1xuICBzdGF0aWMgZ2V0R2VuZXJpY1NlcnZpY2VMaXN0ZW5lcih7IG1ldGhvZHMgPSBbXSwgaGFuZGxlciA9ICgpID0+IHt9IH0pIHtcbiAgICByZXR1cm4gbWV0aG9kcy5yZWR1Y2UoKGxpc3RlbmVyLCBtZXRob2QpID0+IHtcbiAgICAgIGxpc3RlbmVyW21ldGhvZF0gPSAoeyBjaGFubmVsLCBkYXRhIH0pID0+IGhhbmRsZXIoeyBjaGFubmVsLCBkYXRhLCBtZXRob2QgfSlcbiAgICAgIHJldHVybiBsaXN0ZW5lclxuICAgIH0sIHt9KVxuICB9XG5cbn1cbiIsImltcG9ydCB7IFRyYW5zcG9ydCwgTG9uZ1BvbGxpbmdUcmFuc3BvcnQgfSBmcm9tICd6ZXRhcHVzaC1jb21ldGQnXG5cbi8qKlxuICogSW1wbGVtZW50cyBMb25nUG9sbGluZ1RyYW5zcG9ydCB1c2luZyBib3J3c2VyIGZldGNoKCkgQVBJXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEByZXR1cm4ge0ZldGNoTG9uZ1BvbGxpbmdUcmFuc3BvcnR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGZXRjaExvbmdQb2xsaW5nVHJhbnNwb3J0KCkge1xuICBjb25zdCBfc3VwZXIgPSBuZXcgTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKVxuICBjb25zdCB0aGF0ID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpXG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgdHJhbnNwb3J0IHZpYSBmZXRjaCgpIEFQSVxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gICAqL1xuICB0aGF0LnhoclNlbmQgPSBmdW5jdGlvbiAocGFja2V0KSB7XG4gICAgZmV0Y2gocGFja2V0LnVybCwge1xuICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICBib2R5OiBwYWNrZXQuYm9keSxcbiAgICAgIGhlYWRlcnM6IE9iamVjdC5hc3NpZ24ocGFja2V0LmhlYWRlcnMsIHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9VVRGLTgnXG4gICAgICB9KVxuICAgIH0pXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpXG4gICAgfSlcbiAgICAudGhlbihwYWNrZXQub25TdWNjZXNzKVxuICAgIC5jYXRjaChwYWNrZXQub25FcnJvcilcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG4iLCIvKipcbiAqIERlZmluZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gbWV0aG9kcyBcbiAqIEBhY2Nlc3MgcHVibGljXG4gKi9cbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIge1xuICAvKipcbiAgICogQ2FsbGJhY2sgZmlyZWQgd2hlbiBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgKi9cbiAgb25Db25uZWN0aW9uQnJva2VuKCkge31cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZpcmVkIHdoZW4gY29ubmVjdGlvbiBpcyBjbG9zZWRcbiAgICovXG4gIG9uQ29ubmVjdGlvbkNsb3NlZCgpIHt9XG4gIC8qKlxuICAgKiBDYWxsYmFjayBmaXJlZCB3aGVuIGlzIGVzdGFibGlzaGVkXG4gICAqL1xuICBvbkNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpIHt9XG4gIC8qKlxuICAgKiBDYWxsYmFjayBmaXJlZCB3aGVuIGFuIGVycm9yIG9jY3VycyBpbiBoYW5kc2hha2Ugc3RlcFxuICAgKiBAcGFyYW0ge09iamVjdH0gZXJyb3JcbiAgICovXG4gIG9uRmFpbGVkSGFuZHNoYWtlKGVycm9yKSB7fVxuICAvKipcbiAgICogQ2FsbGJhY2sgZmlyZWQgd2hlbiBhIG1lc3NhZ2UgaXMgbG9zdFxuICAgKi9cbiAgb25NZXNzYWdlTG9zdCgpIHt9XG4gIC8qKlxuICAgKiBDYWxsYmFjayBmaXJlZCB3aGVuIGhhbmRzaGFrZSBzdGVwIHN1Y2NlZWRcbiAgICogQHBhcmFtIHtPYmplY3R9IGF1dGhlbnRpY2F0aW9uXG4gICAqL1xuICBvblN1Y2Nlc3NmdWxIYW5kc2hha2UoYXV0aGVudGljYXRpb24pIHt9XG59XG4iLCIvKipcbiAqIERhdGEgYWdncmVnYXRpb25cbiAqIFxuICogUHJvdmlkZXMgZGF0YSBhZ2dyZWdhdGlvbiBvdmVyIHRpbWUgYW5kIGFjcm9zcyBkaWZmZXJlbnQgaXRlbXNcbiAqICBVc2VyIGRldmljZXMgcHVzaCBpdGVtcyBkYXRhIG9uIGRldmVsb3Blci1kZWZpbmVkIGNhdGVnb3JpZXNcbiAqICBUaGlzIHNlcnZpY2UgYXV0b21hdGljYWxseSBhZ2dyZWdhdGVzIHRoZSBkYXRhXG4gKiBSYXcgZGF0YSBpcyBub3QgYXZhaWxhYmxlIGZvciByZWFkaW5nLCBvbmx5IHRoZSBnZW5lcmF0ZWQgYWdncmVnYXRpb24gcmVzdWx0XG4gKiBcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciBpdGVtIGFnZ3JlZ2F0aW9uXG4gKiBcbiAqIFVzZXJzIGNhbiBwdXNoIGRhdGEgYW5kIGJlIG5vdGlmaWVkIG9mIGFnZ3JlZ2F0ZWQgZGF0YS5cbiAqIFRoaXMgc2VydmljZSBkb2VzIG5vdCBhbGxvdyB5b3UgdG8gcmVhZCB0aGUgZGF0YS4gVG8gYWNoaWV2ZSB0aGF0IGtpbmQgb2YgYmVoYXZpb3IsIHlvdSBjb3VsZCBjb25maWd1cmUgYSBjYWxsYmFjayB0byBzdG9yZSB0aGUgZGF0YS5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IEFnZ3JlZ1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBQdXNoZXMgc29tZSBkYXRhXG5cdCAqIFxuXHQgKiBQdXNoZXMgdGhlIGdpdmVuIGRhdGEuXG5cdCAqIEFsbCB0aGUgaXRlbXMgYXJlIHByb2Nlc3NlZCBhY2NvcmRpbmcgdG8gdGhlIGRlZmluZWQgcnVsZXMuXG5cdCAqIEF0IGxlYXN0IG9uZSBwdXNoIGZvciBhIGdpdmVuIGl0ZW0gaXMgbmVlZGVkIGR1cmluZyBhIHRpbWUgcGVyaW9kIHRvIHRyaWdnZXIgcHJvY2Vzc2luZyBhbmQgY2FsbGluZyBvZiB0aGUgY29ycmVzcG9uZGluZyBjYWxsYmFjayB2ZXJiL21hY3JvLlxuXHQgKiAqL1xuXHRwdXNoKHtpdGVtcyxvd25lcn0pIHt9XG59XG4vKipcbiAqIERhdGEgc3RhY2tzXG4gKiBcbiAqIFN0YWNrcyBhcmUgYSBwZXItdXNlciBuYW1lZCBwZXJzaXN0ZW50IHF1ZXVlIG9mIGRhdGFcbiAqICBBbiBhZG1pbmlzdHJhdG9yIGNyZWF0ZXMgYSBzdGFjayBzZXJ2aWNlXG4gKiAgRW5kLXVzZXJzIGNhbiBwdXNoIGRhdGEgb24gYW4gYXJiaXRyYXJ5IG51bWJlciBvZiB0aGVpciBvd24gYXJiaXRyYXJ5IG5hbWVkIHN0YWNrc1xuICogKi9cbi8qKlxuICogRGF0YSBzdGFjayB1c2VyIEFQSVxuICogXG4gKiBEYXRhIGlzIHN0b3JlZCBvbiBhIHBlciB1c2VyIGJhc2lzLiBIb3dldmVyLCBub3RpZmljYXRpb25zIGNhbiBiZSBzZW50IHRvIGEgY29uZmlndXJhYmxlIHNldCBvZiBsaXN0ZW5lcnMuXG4gKiBTdGFjayBuYW1lcyBhcmUgYXJiaXRyYXJ5IGFuZCBkbyBub3QgbmVlZCB0byBiZSBleHBsaWNpdGx5IGluaXRhbGl6ZWQuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBTdGFja1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBMaXN0cyB0aGUgbGlzdGVuZXJzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHRoZSB3aG9sZSBsaXN0IG9mIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHN0YWNrLlxuXHQgKiAqL1xuXHRnZXRMaXN0ZW5lcnMoe293bmVyLHN0YWNrfSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBjb250ZW50XG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIGxpc3Qgb2YgY29udGVudHMgZm9yIHRoZSBnaXZlbiBzdGFjay5cblx0ICogQ29udGVudCBpcyBzb3J0ZWQgYWNjb3JkaW5nIHRvIHRoZSBzdGF0aWNhbGx5IGNvbmZpZ3VyZWQgb3JkZXIuXG5cdCAqICovXG5cdGxpc3Qoe293bmVyLHBhZ2Usc3RhY2t9KSB7fSxcblx0LyoqXG5cdCAqIEVtcHRpZXMgYSBzdGFja1xuXHQgKiBcblx0ICogUmVtb3ZlcyBhbGwgaXRlbXMgZnJvbSB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqICovXG5cdHB1cmdlKHtvd25lcixzdGFja30pIHt9LFxuXHQvKipcblx0ICogUHVzaGVzIGFuIGl0ZW1cblx0ICogXG5cdCAqIFB1c2hlcyBhbiBpdGVtIG9udG8gdGhlIGdpdmVuIHN0YWNrLlxuXHQgKiBUaGUgc3RhY2sgZG9lcyBub3QgbmVlZCB0byBiZSBjcmVhdGVkLlxuXHQgKiAqL1xuXHRwdXNoKHtzdGFjayxkYXRhLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGl0ZW1zXG5cdCAqIFxuXHQgKiBSZW1vdmVzIHRoZSBpdGVtIHdpdGggdGhlIGdpdmVuIGd1aWQgZnJvbSB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqICovXG5cdHJlbW92ZSh7Z3VpZHMsb3duZXIsc3RhY2t9KSB7fSxcblx0LyoqXG5cdCAqIFNldHMgdGhlIGxpc3RlbmVyc1xuXHQgKiBcblx0ICogU2V0cyB0aGUgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqICovXG5cdHNldExpc3RlbmVycyh7bGlzdGVuZXJzLG93bmVyLHN0YWNrfSkge30sXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGFuIGl0ZW1cblx0ICogXG5cdCAqIFVwZGF0ZXMgYW4gZXhpc3RpbmcgaXRlbSBvZiB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqIFRoZSBpdGVtIE1VU1QgZXhpc3QgcHJpb3IgdG8gdGhlIGNhbGwuXG5cdCAqICovXG5cdHVwZGF0ZSh7Z3VpZCxzdGFjayxkYXRhLG93bmVyfSkge31cbn1cbi8qKlxuICogRWNob1xuICogXG4gKiBFY2hvXG4gKiAqL1xuLyoqXG4gKiBFY2hvIHNlcnZpY2VcbiAqIFxuICogU2ltcGxlIGVjaG8gc2VydmljZSwgZm9yIGRldmVsb3BtZW50IHB1cnBvc2VzLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgRWNob1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBFY2hvZXMgYW4gb2JqZWN0XG5cdCAqIFxuXHQgKiBFY2hvZXMgYW4gb2JqZWN0OiB0aGUgc2VydmVyIHdpbGwgZWNobyB0aGF0IG9iamVjdCBvbiBjaGFubmVsICdlY2hvJyBmb3IgdGhlIGN1cnJlbnQgdXNlci5cblx0ICogKi9cblx0ZWNobyh7fSkge31cbn1cbi8qKlxuICogR2FtZSBlbmdpbmVcbiAqIFxuICogQWJzdHJhY3QgR2FtZSBFbmdpbmVcbiAqICBDb25jcmV0ZSBnYW1lIGVuZ2luZXMgYXJlIHJlbW90ZSBjb21ldGQgY2xpZW50cyBvciBpbnRlcm5hbCBtYWNyb3NcbiAqICovXG4vKipcbiAqIEdhbWUgRW5naW5lIEFQSVxuICogXG4gKiBUaGUgR2FtZSBFbmdpbmUgQVBJIGlzIGZvciBnYW1lIGVuZ2luZSBjbGllbnRzLCBub3QgZW5kLXVzZXJzLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgR2FtZUVuZ2luZVB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBOb3RpZnkgdGhlIHJlc3VsdCBmb3IgYSBqb2luIHJlcXVlc3Rcblx0ICogXG5cdCAqIEEgR2FtZSBFbmdpbmUgbm90aWZpZXMgdGhlIFNUUiBvZiB0aGUgcmVzdWx0IG9mIGEgam9pbiByZXF1ZXN0IHRoYXQgaXQgcmVjZWl2ZWQgb24gam9pbl9jYWxsYmFja1xuXHQgKiAqL1xuXHRqb2luX3Jlc3VsdCh7Y2FsbGVySWQsZXJyb3IsbXNnSWQscGF5bG9hZH0pIHt9LFxuXHQvKipcblx0ICogTm90aWZ5IHRoZSByZXN1bHQgZm9yIGFuIG9yZ2FuaXphdGlvbiByZXF1ZXN0XG5cdCAqIFxuXHQgKiBBIEdhbWUgRW5naW5lIG5vdGlmaWVzIHRoZSBTVFIgb2YgdGhlIHJlc3VsdCBvZiBhbiBvcmdhbml6YXRpb24gcmVxdWVzdCB0aGF0IGl0IHJlY2VpdmVkIG9uIG9yZ2FuaXplX2NhbGxiYWNrXG5cdCAqICovXG5cdG9yZ2FuaXplX3Jlc3VsdCh7Y2FsbGVySWQsZXJyb3IsbXNnSWQscGF5bG9hZH0pIHt9LFxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgZ2FtZSBlbmdpbmVcblx0ICogXG5cdCAqIEEgY2xpZW50IHJlZ2lzdGVycyBpdHNlbGYgdG8gdGhlIFNUUiBhcyBhIEdhbWUgRW5naW5lLlxuXHQgKiBUaGUgU1RSIG1heSwgZnJvbSBub3cgb24sIGRpc3BhdGNoIGdhbWUgb2YgdGhlIGdpdmVuIGdhbWUgdHlwZSB0byBzYWlkIGNsaWVudC5cblx0ICogVW5yZWdpc3RyYXRpb24gaXMgZG9uZSBhdXRvbWF0aWNhbGx5IG9uIGxvZ29mZi5cblx0ICogKi9cblx0cmVnaXN0ZXIoe2dhbWVJbmZvLGxvY2F0aW9uLG1heEdhbWVzfSkge30sXG5cdC8qKlxuXHQgKiBOb3RpZnkgdGhlIHJlc3VsdCBmb3IgYSBzdGFydCByZXF1ZXN0XG5cdCAqIFxuXHQgKiBBIEdhbWUgRW5naW5lIG5vdGlmaWVzIHRoZSBTVFIgb2YgdGhlIHJlc3VsdCBvZiBhIHN0YXJ0IHJlcXVlc3QgdGhhdCBpdCByZWNlaXZlZCBvbiBzdGFydF9jYWxsYmFja1xuXHQgKiAqL1xuXHRzdGFydF9yZXN1bHQoe2dhbWVJZH0pIHt9LFxuXHQvKipcblx0ICogTm90aWZ5IGEgZ2FtZSBldmVudFxuXHQgKiBcblx0ICogQSBHYW1lIEVuZ2luZSBub3RpZmllcyB0aGUgU1RSIG9mIHNvbWUgYXJiaXRyYXJ5IGdhbWUgZXZlbnQuXG5cdCAqICovXG5cdHN0YXRlKHtkYXRhLGdhbWVJZCxzdGF0dXN9KSB7fSxcblx0LyoqXG5cdCAqIE5vdGlmeSB0aGUgcmVzdWx0IGZvciBhbiB1bmpvaW4gcmVxdWVzdFxuXHQgKiBcblx0ICogQSBHYW1lIEVuZ2luZSBub3RpZmllcyB0aGUgU1RSIG9mIHRoZSByZXN1bHQgb2YgYW4gdW5qb2luIHJlcXVlc3QgdGhhdCBpdCByZWNlaXZlZCBvbiB1bmpvaW5fY2FsbGJhY2tcblx0ICogKi9cblx0dW5qb2luX3Jlc3VsdCh7Y2FsbGVySWQsZXJyb3IsbXNnSWQscGF5bG9hZH0pIHt9XG59XG4vKipcbiAqIFVzZXIgQVBJIGZvciBnYW1lc1xuICogXG4gKiBVc2VycyBjYW4gbGlzdCwgc3RhcnQsIGpvaW4gZ2FtZXMsIGFuZCBwbGF5LlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgR2FtZVB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBMaXN0cyBnYW1lIHR5cGVzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGdhbWUgdHlwZXMgc3VwcG9ydGVkIGJ5IHRoZSBzZXJ2ZXIgYW5kIHRoZSBjdXJyZW50bHkgcmVnaXN0ZXJlZCBnYW1lIGVuZ2luZXMuXG5cdCAqICovXG5cdGF2YWlsYWJsZSh7fSkge30sXG5cdC8qKkEgdXNlciBqb2lucyBhIGdhbWUqL1xuXHRqb2luKHtnYW1lSWQscm9sZSx1c2VySWQsdXNlck5hbWV9KSB7fSxcblx0LyoqT3JnYW5pemVzIGEgZ2FtZSovXG5cdG9yZ2FuaXplKHt0eXBlLG93bmVyLG9wdGlvbnN9KSB7fSxcblx0LyoqR2l2ZXMgc29tZSBjb21tYW5kIHRvIHRoZSBnYW1lIGVuZ2luZSovXG5cdHBsYXkoe2RhdGEsZ2FtZUlkLHVzZXJJZH0pIHt9LFxuXHQvKipTdGFydHMgYSBnYW1lKi9cblx0c3RhcnQoe2dhbWVJZH0pIHt9LFxuXHQvKipBIHVzZXIgY2FuY2VscyBqb2luaW5nIGEgZ2FtZSovXG5cdHVuam9pbih7Z2FtZUlkLHJvbGUsdXNlcklkLHVzZXJOYW1lfSkge31cbn1cbi8qKlxuICogR2VuZXJpYyBEYXRhIEFjY2Vzc1xuICogXG4gKiBHZW5lcmljIERhdGEgQWNjZXNzIFNlcnZpY2UgOiBOb1NRTCBzdG9yYWdlXG4gKiAqL1xuLyoqXG4gKiBHREEgVXNlciBBUElcbiAqIFxuICogVXNlciBBUEkgZm9yIEdlbmVyaWMgRGF0YSBBY2Nlc3MuXG4gKiBEYXRhIGlzIHN0b3JlZCBvbiBhIHBlci11c2VyIGJhc2lzLlxuICogVXNlcnMgY2FuIHB1dCwgZ2V0LCBsaXN0IHRoZWlyIGRhdGEuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBHZGFQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQXNrcyBmb3IgYSBkYXRhIHJvd1xuXHQgKiBcblx0ICogUmV0dXJucyBhIGZ1bGwgZGF0YSByb3cuXG5cdCAqICovXG5cdGdldCh7a2V5LG93bmVyLHRhYmxlfSkge30sXG5cdC8qKlxuXHQgKiBBc2tzIGZvciBhIGRhdGEgY2VsbFxuXHQgKiBcblx0ICogUmV0dXJucyBhIHByZWNpc2UgbGlzdCBvZiBjZWxscyBmcm9tIGEgY29sdW1uIGluIGEgZGF0YSByb3cuXG5cdCAqICovXG5cdGdldENlbGxzKHtjb2x1bW4sa2V5LGtleTIsb3duZXIsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIEluY3JlbWVudHMgYW4gaW50ZWdlciB2YWx1ZVxuXHQgKiBcblx0ICogSW5jcmVtZW50cyBhIGNlbGwgNjQtYml0IHNpZ25lZCBpbnRlZ2VyIHZhbHVlIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgaW4gdGhlIGRhdGEgZmllbGQuXG5cdCAqIFRoZSBpbmNyZW1lbnQgaXMgYXRvbWljIDogaWYgeW91IGNvbmN1cnJlbnRseSBpbmNyZW1lbnQgMTAgdGltZXMgYSB2YWx1ZSBieSAxLCB0aGUgZmluYWwgcmVzdWx0IHdpbGwgYmUgdGhlIGluaXRpYWwgdmFsdWUgcGx1cyAxMC4gVGhlIGFjdHVhbCBpbmRpdmlkdWFsIHJlc3VsdGluZyB2YWx1ZXMgc2VlbiBieSB0aGUgMTAgY29uY3VycmVudCBjYWxsZXJzIG1heSB2YXJ5IGRpc2NvbnRpbnVvdXNseSwgd2l0aCBkdXBsaWNhdGVzIDogYXQgbGVhc3Qgb25lIG9mIHRoZW0gd2lsbCBzZWUgdGhlIGZpbmFsICgrMTApIHJlc3VsdC5cblx0ICogKi9cblx0aW5jKHt0YWJsZSxkYXRhLGtleSxrZXkyLG93bmVyLGNvbHVtbn0pIHt9LFxuXHQvKipcblx0ICogQXNrcyBmb3IgYSBsaXN0IG9mIHJvd3Ncblx0ICogXG5cdCAqIFJldHVybnMgYSBwYWdpbmF0ZWQgbGlzdCBvZiByb3dzIGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiAqL1xuXHRsaXN0KHtjb2x1bW5zLG93bmVyLHBhZ2UsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIFB1dHMgc29tZSBkYXRhIGludG8gYSBjZWxsXG5cdCAqIFxuXHQgKiBDcmVhdGVzIG9yIHJlcGxhY2VzIHRoZSBjb250ZW50cyBvZiBhIHBhcnRpY3VsYXIgY2VsbC5cblx0ICogKi9cblx0cHV0KHtjb2x1bW4sZGF0YSxrZXksa2V5Mixvd25lcix0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogUHV0cyBzZXZlcmFsIHJvd3Ncblx0ICogXG5cdCAqIENyZWF0ZXMgb3IgcmVwbGFjZXMgdGhlIChtYXliZSBwYXJ0aWFsKSBjb250ZW50cyBvZiBhIGNvbGxlY3Rpb24gb2Ygcm93cy5cblx0ICogVGhpcyBtZXRob2Qgb25seSBjcmVhdGVzIG9yIHJlcGxhY2VzIGNlbGxzIGZvciBub24tbnVsbCBpbnB1dCB2YWx1ZXMuXG5cdCAqICovXG5cdHB1dHMoe293bmVyLHJvd3MsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIEFza3MgZm9yIGEgcmFuZ2Ugb2Ygcm93c1xuXHQgKiBcblx0ICogUmV0dXJucyBhIHBhZ2luYXRlZCByYW5nZSBvZiByb3dzIGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiBBIHJhbmdlIGNvbnNpc3RzIG9mIGNvbnNlY3V0aXZlIHJvd3MgZnJvbSB0aGUgc3RhcnQga2V5IChpbmNsdXNpdmUpIHRvIHRoZSBzdG9wIGtleSAoZXhjbHVzaXZlKS5cblx0ICogWW91IGNhbiBzcGVjaWZ5IHBhcnRpYWwga2V5cyBmb3IgdGhlIHN0YXJ0IGFuZCBzdG9wIGZpZWxkcy5cblx0ICogKi9cblx0cmFuZ2Uoe2NvbHVtbnMsb3duZXIscGFnZSxzdGFydCxzdG9wLHRhYmxlfSkge30sXG5cdC8qKlxuXHQgKiBSZWR1Y2VzIGEgcmFuZ2Ugb2Ygcm93c1xuXHQgKiBcblx0ICogUmV0dXJucyBhIGNvbXB1dGVkIHNpbmdsZSByZWR1Y2VkIHJlc3VsdCBmcm9tIGEgcmFuZ2Ugb2Ygcm93cyBmcm9tIHRoZSBnaXZlbiB0YWJsZS5cblx0ICogQSByYW5nZSBjb25zaXN0cyBvZiBjb25zZWN1dGl2ZSByb3dzIGZyb20gdGhlIHN0YXJ0IGtleSAoaW5jbHVzaXZlKSB0byB0aGUgc3RvcCBrZXkgKGV4Y2x1c2l2ZSkuXG5cdCAqIFlvdSBjYW4gc3BlY2lmeSBwYXJ0aWFsIGtleXMgZm9yIHRoZSBzdGFydCBhbmQgc3RvcCBmaWVsZHMuXG5cdCAqICovXG5cdHJlZHVjZSh7fSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIG9uZSBjZWxsIGluc2lkZSBhIGNvbHVtbiBvZiBhIHJvd1xuXHQgKiBcblx0ICogUmVtb3ZlcyBvbmx5IG9uZSBjZWxsIG9mIHRoZSBnaXZlbiBjb2x1bW4gb2YgdGhlIGdpdmVuIHJvdyBmcm9tIHRoZSBnaXZlbiB0YWJsZS5cblx0ICogKi9cblx0cmVtb3ZlQ2VsbCh7Y29sdW1uLGtleSxrZXkyLG93bmVyLHRhYmxlfSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIG9uZSBmdWxsIGNvbHVtbiBvZiBhIHJvd1xuXHQgKiBcblx0ICogUmVtb3ZlcyBhbGwgY2VsbHMgb2YgdGhlIGdpdmVuIGNvbHVtbiBvZiB0aGUgZ2l2ZW4gcm93IGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiAqL1xuXHRyZW1vdmVDb2x1bW4oe2NvbHVtbixrZXksb3duZXIsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgYSByYW5nZSBvZiByb3dzXG5cdCAqIFxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgY29sdW1ucyBvZiB0aGUgZ2l2ZW4gcmFuZ2Ugb2Ygcm93cyBmcm9tIHRoZSBnaXZlbiB0YWJsZS5cblx0ICogKi9cblx0cmVtb3ZlUmFuZ2Uoe2NvbHVtbnMsb3duZXIsc3RhcnQsc3RvcCx0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBvbmUgZnVsbCByb3dcblx0ICogXG5cdCAqIFJlbW92ZXMgYWxsIGNvbHVtbnMgb2YgdGhlIGdpdmVuIHJvdyBmcm9tIHRoZSBnaXZlbiB0YWJsZS5cblx0ICogKi9cblx0cmVtb3ZlUm93KHtrZXksb3duZXIsdGFibGV9KSB7fVxufVxuLyoqXG4gKiBHcm91cHMgTWFuYWdlbWVudFxuICogXG4gKiBHcm91cHMgbWFuYWdlbWVudCBmb3IgdXNlcnMsIGdyYW50cyBvbiByZXNvdXJjZXMsIHJlbW90ZSBjb21tYW5kcyBvbiBkZXZpY2VzXG4gKiAgVGhpcyBpcyB3aGVyZSB5b3UgY2FuIGNvbmZpZ3VyZSByaWdodHMgZm9yIGFueSByZXNvdXJjZVxuICogXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgcmVtb3RlIGNvbnRyb2xcbiAqIFxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgUmVtb3RpbmdQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQWRkcyBhIGxpc3RlbmVyXG5cdCAqIFxuXHQgKiBBIHVzZXIgcmVxdWVzdHMgbm90aWZpY2F0aW9ucyBmcm9tIGEgZGV2aWNlIG93bmVkIGJ5IGFueW9uZSB3aG8gZ3JhbnRlZCBoaW0gdGhlIHJpZ2h0IGF1dGhvcml6YXRpb25zLlxuXHQgKiBXaGVuZXZlciB0aGUgZGV2aWNlIGNhbGxzICdub3RpZnknLCBub3RpZmljYXRpb25zIHdpbGwgYmUgc2VudCB0byB0aGUgY2FsbGVyIG9mIHRoaXMgdmVyYi5cblx0ICogKi9cblx0YWRkTGlzdGVuZXIoe2NtZCxkYXRhLGZyb20sZnJvbVJlc291cmNlLG93bmVyLHJlc291cmNlfSkge30sXG5cdC8qKlJlc3BvbnNlIHRvICdnZXRDYXBhYmlsaXRpZXMnKi9cblx0Y2FwYWJpbGl0aWVzKHthbnN3ZXJpbmdSZXNvdXJjZSxhc2tpbmdSZXNvdXJjZSxjYXBhYmlsaXRpZXN9KSB7fSxcblx0LyoqXG5cdCAqIEV4ZWN1dGVzIGEgY29tbWFuZFxuXHQgKiBcblx0ICogQSB1c2VyIGV4ZWN1dGVzIGEgY29tbWFuZCBvbiBhIGRldmljZSBvd25lZCBieSBhbnlvbmUgd2hvIGdyYW50ZWQgaGltIHRoZSByaWdodCBhdXRob3JpemF0aW9ucy5cblx0ICogVGhlIGNvbW1hbmQgaXMgaXNzdWVkIG9uIGNoYW5uZWwgJ2NvbW1hbmQnXG5cdCAqICovXG5cdGV4ZWN1dGUoe3Jlc291cmNlLGNtZCxkYXRhLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBjYXBhYmlsaXRpZXNcblx0ICogXG5cdCAqIEEgdXNlciByZXF1ZXN0cyBhbGwgaGlzIGRldmljZXMgZm9yIHRoZSB3aG9sZSBsaXN0IG9mIHRoZWlyIGNhcGFiaWxpdGllcy5cblx0ICogRGV2aWNlcyBhcmUgZXhwZWN0ZWQgdG8gYW5zd2VyIG9uIGNoYW5uZWwgJ2NhcGFiaWxpdGllcydcblx0ICogKi9cblx0Z2V0Q2FwYWJpbGl0aWVzKHt9KSB7fSxcblx0LyoqXG5cdCAqIE5vdGlmaWVzIG9mIHNvbWUgZXZlbnRcblx0ICogXG5cdCAqIEEgZGV2aWNlIG5vdGlmaWVzIHRoZSByZWdpc3RlcmVkIHVzZXJzL2RldmljZXMgb24gdGhpcyBjaGFubmVsLlxuXHQgKiBUaGUgc2VydmVyIGZvcndhcmRzIHRoZSBub3RpZmljYXRpb24gdG8gc2FpZCB1c2Vycy5cblx0ICogKi9cblx0bm90aWZ5KHtjbWQsZGF0YSxmcm9tLGZyb21SZXNvdXJjZSxvd25lcixyZXNvdXJjZX0pIHt9LFxuXHQvKipcblx0ICogUGluZ3MgZGV2aWNlc1xuXHQgKiBcblx0ICogQSB1c2VyIHJlcXVlc3RzIGFsbCBkZXZpY2VzIChvZiBhbGwgb3duZXJzKSBvbiB3aGljaCBoZSBoYXMgYXV0aG9yaXphdGlvbnMgdG8gcmVzcG9uZCBvbiBjaGFubmVsICdwb25nJ1xuXHQgKiAqL1xuXHRwaW5nKHthY3Rpb259KSB7fSxcblx0LyoqUmVzcG9uc2UgdG8gcGluZyovXG5cdHBvbmcoe2FjdGlvbixhdmFpbGFibGUsb3duZXIscmVzb3VyY2UsdWlkLHVzZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBsaXN0ZW5lclxuXHQgKiBcblx0ICogQSB1c2VyIHN0b3BzIHJlcXVlc3Rpbmcgbm90aWZpY2F0aW9ucyBmcm9tIGEgZGV2aWNlIG93bmVkIGJ5IGFueW9uZSB3aG8gZ3JhbnRlZCBoaW0gdGhlIHJpZ2h0IGF1dGhvcml6YXRpb25zXG5cdCAqICovXG5cdHJlbW92ZUxpc3RlbmVyKHtjbWQsZGF0YSxmcm9tLGZyb21SZXNvdXJjZSxvd25lcixyZXNvdXJjZX0pIHt9XG59XG4vKipcbiAqIFVzZXIgQVBJIGZvciBncm91cHMgYW5kIHJpZ2h0cy5cbiAqIFxuICogR3JvdXBzIGFyZSBzdG9yZWQgcGVyIHVzZXIuXG4gKiBUaGlzIG1lYW5zIHRoYXQgdHdvIHVzZXJzIGNhbiBvd24gYSBncm91cCB3aXRoIHRoZSBzYW1lIGlkZW50aWZpZXIuIEEgY291cGxlIChvd25lciwgZ3JvdXApIGlzIG5lZWRlZCB0byB1bmlxdWVseSBpZGVudGlmeSBhIGdyb3VwIGluc2lkZSBhIGdyb3VwIG1hbmFnZW1lbnQgc2VydmljZS5cbiAqIFRoZSB0cmlwbGV0IChkZXBsb3ltZW50SWQsIG93bmVyLCBncm91cCkgaXMgYWN0dWFsbHkgbmVlZGVkIHRvIGZ1bGx5IHF1YWxpZnkgYSBncm91cCBvdXRzaWRlIG9mIHRoZSBzY29wZSBvZiB0aGlzIHNlcnZpY2UuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBHcm91cE1hbmFnZW1lbnRQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQWRkcyBtZSB0byBhIGdyb3VwXG5cdCAqIFxuXHQgKiBBZGRzIG1lICh0aGUgY2FsbGVyKSB0byBhIGdyb3VwLlxuXHQgKiBUaGlzIHZlcmIgZXhpc3RzIHNvIHRoYXQgZ3JvdXAgb3duZXJzIG1heSBncmFudCB0aGUgcmlnaHQgdG8gam9pbiB0aGVpciBncm91cHMgd2l0aG91dCBncmFudGluZyB0aGUgcmlnaHQgdG8gYWRkIG90aGVyIHVzZXJzIHRvIHRob3NlIGdyb3Vwcy5cblx0ICogVGhlICd1c2VyJyBmaWVsZCBpcyBpbXBsaWNpdGx5IHNldCB0byB0aGUgY3VycmVudCB1c2VyJ3Mga2V5LlxuXHQgKiAqL1xuXHRhZGRNZSh7Z3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIEFkZHMgYSB1c2VyIHRvIGEgZ3JvdXBcblx0ICogXG5cdCAqIEFkZHMgdGhlIGdpdmVuIHVzZXIgdG8gdGhlIGdpdmVuIGdyb3VwLlxuXHQgKiBBZGRpdGlvbiBtYXkgZmFpbCBpZiB0aGUgZ2l2ZW4gZ3JvdXAgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cblx0ICogKi9cblx0YWRkVXNlcih7dXNlcixncm91cCxvd25lcn0pIHt9LFxuXHQvKipBZGRzIHVzZXJzIHRvIGEgZ3JvdXAqL1xuXHRhZGRVc2Vycyh7dXNlcnMsZ3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIG15IG93bmVkIGdyb3Vwcywgd2l0aCBkZXRhaWxzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHRoZSB3aG9sZSBsaXN0IG9mIGdyb3VwcyBvd25lZCBieSB0aGUgY3VycmVudCB1c2VyLCB3aXRoIHRoZWlyIG1lbWJlcnNcblx0ICogKi9cblx0YWxsR3JvdXBzKHtvd25lcn0pIHt9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGdyb3VwXG5cdCAqIFxuXHQgKiBDcmVhdGVzIGEgZ3JvdXAgb3duZWQgYnkgdGhlIGN1cnJlbnQgdXNlci5cblx0ICogR3JvdXAgY3JlYXRpb24gbWF5IGZhaWwgaWYgdGhlIGdyb3VwIGFscmVhZHkgZXhpc3RzLlxuXHQgKiAqL1xuXHRjcmVhdGVHcm91cCh7Z3JvdXAsZ3JvdXBOYW1lLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgZ3JvdXBcblx0ICogXG5cdCAqIFJlbW92ZXMgdGhlIGdpdmVuIGdyb3VwIG93bmVkIGJ5IHRoZSBjdXJyZW50IHVzZXIgb3IgdGhlIGdpdmVuIG93bmVyLlxuXHQgKiBBbHNvIHJlbW92ZXMgYWxsIGdyYW50cyB0byB0aGF0IGdyb3VwLlxuXHQgKiAqL1xuXHRkZWxHcm91cCh7Z3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqUmVtb3ZlcyBhIHVzZXIgZnJvbSBhIGdyb3VwKi9cblx0ZGVsVXNlcih7Z3JvdXAsb3duZXIsdXNlcn0pIHt9LFxuXHQvKipSZW1vdmVzIHVzZXJzIGZyb20gYSBncm91cCovXG5cdGRlbFVzZXJzKHtncm91cCxncm91cE5hbWUsb3duZXIsdXNlcnN9KSB7fSxcblx0LyoqXG5cdCAqIFRlc3RzIGZvciBhIGdyb3VwJ3MgZXhpc3RlbmNlXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgYSBncm91cCBleGlzdHMgb3Igbm90LlxuXHQgKiAqL1xuXHRleGlzdHMoe2dyb3VwLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBHcmFudHMgYSByaWdodCB0byBhIGdyb3VwXG5cdCAqIFxuXHQgKiBUaGUgZ3JhbnRpbmcgQVBJIGRvZXMgbm90IGRvIGFueSBjaGVjayB3aGVuIHN0b3JpbmcgcGVybWlzc2lvbnMuXG5cdCAqIEluIHBhcnRpY3VsYXIgd2hlbiBncmFudGluZyByaWdodHMgb24gYSB2ZXJiIGFuZCByZXNvdXJjZSBvZiBhbm90aGVyIEFQSSwgdGhlIGV4aXN0ZW5jZSBvZiBzYWlkIHZlcmIgYW5kIHJlc291cmNlIGlzIG5vdCBjaGVja2VkLlxuXHQgKiAqL1xuXHRncmFudCh7YWN0aW9uLGdyb3VwLG93bmVyLHJlc291cmNlfSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyB0aGUgZ3JvdXAgdXNlcnNcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIHdob2xlIGxpc3Qgb2YgdXNlcnMgY29uZmlndXJlZCBpbnNpZGUgdGhlIGdpdmVuIGdyb3VwLlxuXHQgKiAqL1xuXHRncm91cFVzZXJzKHtncm91cCxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogTGlzdHMgbXkgb3duZWQgZ3JvdXBzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHRoZSB3aG9sZSBsaXN0IG9mIGdyb3VwcyBvd25lZCBieSB0aGUgY3VycmVudCB1c2VyXG5cdCAqICovXG5cdGdyb3Vwcyh7b3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIHJpZ2h0cyBmb3IgYSBncm91cFxuXHQgKiBcblx0ICogVGhpcyBBUEkgbGlzdHMgZXhwbGljaXRseSBjb25maWd1cmVkIHJpZ2h0cy5cblx0ICogRWZmZWN0aXZlIHJpZ2h0cyBpbmNsdWRlIGNvbmZpZ3VyZWQgcmlnaHRzLCBpbXBsaWNpdCByaWdodHMgYW5kIGluaGVyaXRlZCByaWdodHMuXG5cdCAqICovXG5cdGxpc3RHcmFudHMoe2dyb3VwLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBwcmVzZW5jZXMgZm9yIGEgZ3JvdXBcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIGxpc3Qgb2YgbWVtYmVycyBvZiB0aGUgZ2l2ZW4gZ3JvdXBzLCBhbG9uZyB3aXRoIHRoZWlyIGFjdHVhbCBhbmQgY3VycmVudCBwcmVzZW5jZSBvbiB0aGUgemV0YXB1c2ggc2VydmVyLlxuXHQgKiBUaGUgY3VycmVudCBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBpbmNsdWRlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwYXJ0aWN1bGFyIGRldmljZXMgdXNlcnMgYXJlIGNvbm5lY3RlZCB3aXRoLlxuXHQgKiBJZiBhIHVzZXIgaXMgY29ubmVjdGVkIHR3aWNlIHdpdGggdHdvIGRpZmZlcmVudCBkZXZpY2VzLCB0d28gaWRlbnRpY2FsIGVudHJpZXMgd2lsbCBiZSByZXR1cm5lZC5cblx0ICogKi9cblx0bGlzdFByZXNlbmNlcyh7Z3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFRlc3RzIG1lbWJlcnNoaXBcblx0ICogXG5cdCAqIFRlc3RzIHdoZXRoZXIgSSAodGhlIGNhbGxlcikgYW0gYSBtZW1iZXIgb2YgdGhlIGdpdmVuIGdyb3VwLlxuXHQgKiBUaGlzIHZlcmIgZXhpc3RzIHNvIHRoYXQgdXNlcnMgY2FuIGRldGVybWluZSBpZiB0aGV5IGFyZSBwYXJ0IG9mIGEgZ3JvdXAgd2l0aG91dCBiZWluZyBncmFudGVkIHBhcnRpY3VsYXIgcmlnaHRzLlxuXHQgKiBUaGUgJ3VzZXInIGZpZWxkIGlzIGltcGxpY2l0bHkgc2V0IHRvIHRoZSBjdXJyZW50IHVzZXIncyBrZXkuXG5cdCAqICovXG5cdG1lbWJlck9mKHtoYXJkRmFpbCxncm91cCxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogR3JhbnRzIHJpZ2h0cyB0byBhIGdyb3VwXG5cdCAqIFxuXHQgKiBHcmFudCBzZXZlcmFsIHJpZ2h0cyBhdCBvbmNlLlxuXHQgKiAqL1xuXHRtZ3JhbnQoe2FjdGlvbnMsZ3JvdXAsb3duZXIscmVzb3VyY2V9KSB7fSxcblx0LyoqUmV2b2tlcyByaWdodHMgZm9yIGEgZ3JvdXAqL1xuXHRtcmV2b2tlKHthY3Rpb25zLGdyb3VwLG93bmVyLHJlc291cmNlfSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyB0aGUgZ3JvdXBzIEkgYW0gcGFydCBvZlxuXHQgKiBcblx0ICogUmV0dXJucyB0aGUgd2hvbGUgbGlzdCBvZiBncm91cHMgdGhlIGN1cnJlbnQgdXNlciBpcyBwYXJ0IG9mLlxuXHQgKiBHcm91cHMgbWF5IGJlIG93bmVkIGJ5IGFueW9uZSwgaW5jbHVkaW5nIHRoZSBjdXJyZW50IHVzZXIuXG5cdCAqICovXG5cdG15R3JvdXBzKHtvd25lcn0pIHt9LFxuXHQvKipSZXZva2VzIGEgcmlnaHQgZm9yIGEgZ3JvdXAqL1xuXHRyZXZva2Uoe2FjdGlvbixncm91cCxvd25lcixyZXNvdXJjZX0pIHt9XG59XG4vKipcbiAqIEhUVFAgY2xpZW50XG4gKiBcbiAqIFdlYi1zZXJ2aWNlIGNsaWVudFxuICogIEFuIGFkbWluIHJlY29yZHMgVVJMIHRlbXBsYXRlcyB0aGF0IGNhbiBiZSBjYWxsZWQgYnkgdXNlcnNcbiAqICBDYWxscyBhcmUgbm90IGNvbmZpZ3VyYWJsZSBieSBlbmQtdXNlcnNcbiAqICBIb3dldmVyIGFuIGFkbWluIG1heSBsZXZlcmFnZSB0aGUgbWFjcm8gc2VydmljZSB0byBhY2hpZXZlIFVSTCwgaGVhZGVycyBhbmQgYm9keSBjb25maWd1cmFiaWxpdHlcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciBodHRwIHJlcXVlc3RzXG4gKiBcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IEh0dHBjbGllbnRQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogTWFrZXMgYSBwcmVkZWZpbmVkIHJlcXVlc3Rcblx0ICogXG5cdCAqIExvb2t1cHMgYSBwcmVkZWZpbmVkIHJlcXVlc3QgYnkgbmFtZSwgYW5kIGV4ZWN1dGVzIGl0LlxuXHQgKiAqL1xuXHRjYWxsKHtuYW1lLHJlcXVlc3RJZH0pIHt9LFxuXHQvKipcblx0ICogTWFrZXMgYSBwYXJhbWV0ZXJpemVkIHJlcXVlc3Rcblx0ICogXG5cdCAqIEV4ZWN1dGVzIGFuIEhUVFAgcmVxdWVzdCB3aXRoIHRoZSBnaXZlbiB1cmwsIG1ldGhvZCwgaGVhZGVycyBhbmQgYm9keS5cblx0ICogKi9cblx0cmVxdWVzdCh7fSkge31cbn1cbi8qKlxuICogTWFjcm9zXG4gKiBcbiAqIE1hY3JvLWNvbW1hbmQgc2VydmljZVxuICogIEFuIGFkbWluIGRlZmluZXMgbWFjcm8tY29tbWFuZHMgdGhhdCBjYW4gc2VxdWVudGlhbGx5IGNhbGwgYW55IG51bWJlciBvZiBvdGhlciBhcGkgdmVyYnMsIGxvb3Agb24gY29sbGVjdGlvbnMgb2YgZGF0YSwgbWFrZSBkZWNpc2lvbnMsIGV0Y1xuICogXG4gKiBcbiAqICBFbmQtdXNlcnMgcGxheSB0aGVtLCB3aXRoIGNvbnRleHR1YWwgcGFyYW1ldGVyc1xuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIG1hY3JvIGV4ZWN1dGlvblxuICogXG4gKiBTaW1wbGUgZXJyb3JzIGFyZSByZXBvcnRlZCBhcyB1c3VhbC5cbiAqIEhvd2V2ZXIsIHRoZSBtYWNybyBleGVjdXRpb24gdmVyYnMgdHJlYXQgbW9zdCBlcnJvcnMgaW4gYSBwYXJ0aWN1bGFyIHdheSA6IGluc3RlYWQgb2YgcmVwb3J0aW5nIGVycm9ycyBvbiB0aGUgdXN1YWwgJ2Vycm9yJyBjaGFubmVsLCBlcnJvcnMgYXJlIHB1dCBpbiB0aGUgcmV0dXJuZWQgJ01hY3JvQ29tcGxldGlvbicgcmVzdWx0LlxuICogVGhpcyBiZWhhdmlvciBjYW4gYmUgdHVuZWQgb24gYSBwZXItY2FsbCBiYXNpcyB3aXRoIHRoZSBoYXJkRmFpbCBwYXJhbWV0ZXIuXG4gKiBOb3RlIHRoYXQgc29tZSBwYXJ0aWN1bGFyIGVycm9ycyB3aWxsIGFsd2F5cyBiZWhhdmUgYXMgaWYgaGFyZEZhaWwgd2VyZSB0cnVlLCBiZWNhdXNlIHRoZXkgYXJlIHJlbGF0ZWQgdG8gcHJvZ3JhbW1pbmcgZXJyb3JzLCBvciBwcmV2ZW50IHByb2Nlc3NpbmcgZnJvbSBlbmRpbmcgZ3JhY2VmdWxseSA6IFNUQUNLX09WRVJGTE9XLCBOT19TVUNIX0ZVTkNUSU9OLCBSQU1fRVhDRUVERUQsIENZQ0xFU19FWENFRURFRCwgVElNRV9FWENFRURFRCwgUVVPVEFfRVhDRUVERUQsIFJBVEVfRVhDRUVERUQsIEJBRF9DT01QQVJBVE9SX1ZBTFVFXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBNYWNyb1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBQbGF5cyBhIHByZXZpb3VzbHkgcmVjb3JkZWQgbWFjcm9cblx0ICogXG5cdCAqIERPIE5PVCB1c2UgdGhpcyB2ZXJiIGZyb20gaW5zaWRlIGFuIGVuY2xvc2luZyBtYWNybyB3aGVuIHlvdSBuZWVkIHRoZSByZXN1bHQgaW4gb3JkZXIgdG8gcHJvY2VlZCB3aXRoIHRoZSBlbmNsb3NpbmcgbWFjcm8uXG5cdCAqIFlvdSBjYW4gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgbm90aWZpY2F0aW9uIGNoYW5uZWwgd2hlbiBkZWZpbmluZyB0aGUgbWFjcm8uXG5cdCAqICovXG5cdGNhbGwoe2RlYnVnLGhhcmRGYWlsLG5hbWUscGFyYW1ldGVyc30pIHt9LFxuXHQvKipcblx0ICogUGxheXMgYSBwcmV2aW91c2x5IHJlY29yZGVkIG1hY3JvIGFuZCByZXR1cm5zIHRoZSByZXN1bHQuXG5cdCAqIFxuXHQgKiBVc2UgdGhpcyB2ZXJiIHdoZW4geW91IHdhbnQgdG8gc3luY2hyb25vdXNseSBjYWxsIGEgbWFjcm8gZnJvbSBpbnNpZGUgYW5vdGhlciBtYWNyby5cblx0ICogKi9cblx0ZnVuYyh7fSkge30sXG5cdC8qKlxuXHQgKiBTaW1pbGFyIHRvIGZ1bmMsIHdpdGggdGhlIGFiaWxpdHkgdG8gaW1wZXJzb25hdGUgYW55IHVzZXIgYXQgd2lsbC5cblx0ICogXG5cdCAqIFVzZSB0aGlzIHZlcmIgd2hlbiB5b3UgZG8gbm90IHdhbnQgdG8gdXNlIG9yIGNhbm5vdCB1c2UgdGhlIHN0YW5kYXJkIHJpZ2h0cyBzeXN0ZW0gYW5kIHdpc2ggdG8gYnlwYXNzIGl0IGNvbXBsZXRlbHkuXG5cdCAqIFVzZSB0aGlzIHZlcmIgc3BhcmluZ2x5LCBhcyBpdCBjYW4gZ2l2ZSB0aGUgY2FsbGVyIGFueSByaWdodCBvbiBhbnkgcmVzb3VyY2UuXG5cdCAqICovXG5cdHN1ZG8oe30pIHt9XG59XG4vKipcbiAqIE1haWwgc2VuZGVyXG4gKiBcbiAqIFNlbmRzIGVtYWlsIHRocm91Z2ggU01UUFxuICogKi9cbi8qKlxuICogTWFpbCBzZXJ2aWNlIHVzZXIgQVBJXG4gKiBcbiAqIFRoaXMgc2VydmljZSBpcyBzdGF0aWNhbGx5IGNvbmZpZ3VyZWQgd2l0aCBhbiBvdXRnb2luZyBTTVRQIHNlcnZlci5cbiAqIFVzZXJzIGNhbGwgdGhlIEFQSSBoZXJlIHRvIGFjdHVhbGx5IHNlbmQgZW1haWxzLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgU2VuZG1haWxQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogU2VuZHMgYW4gZW1haWxcblx0ICogXG5cdCAqIFNlbmRzIGFuIGVtYWlsIHdpdGggdGhlIGdpdmVuIGJvZHkgdG8gdGhlIGludGVuZGVkIHJlY2lwaWVudHMuXG5cdCAqICovXG5cdHNlbmQoe30pIHt9XG59XG4vKipcbiAqIE1lc3NhZ2luZyBzZXJ2aWNlXG4gKiBcbiAqIE1lc3NhZ2luZyBzZXJ2aWNlXG4gKiAqL1xuLyoqXG4gKiBNZXNzYWdpbmcgc2VydmljZVxuICogXG4gKiBTaW1wbGUgYW5kIGZsZXhpYmxlIHVzZXItdG8tdXNlciBvciB1c2VyLXRvLWdyb3VwIG1lc3NhZ2luZyBzZXJ2aWNlLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgTWVzc2FnaW5nUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIFNlbmRzIGEgbWVzc2FnZSB0byBhIHRhcmdldFxuXHQgKiBcblx0ICogU2VuZHMgdGhlIGdpdmVuIG1lc3NhZ2UgdG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgb24gdGhlIGdpdmVuIChvcHRpb25hbCkgY2hhbm5lbC5cblx0ICogVGhlIGFkbWluaXN0cmF0aXZlbHkgZ2l2ZW4gZGVmYXVsdCBjaGFubmVsIG5hbWUgaXMgdXNlZCB3aGVuIG5vbmUgaXMgcHJvdmlkZWQgaW4gdGhlIG1lc3NhZ2UgaXRzZWxmLlxuXHQgKiAqL1xuXHRzZW5kKHt0YXJnZXQsY2hhbm5lbCxkYXRhfSkge31cbn1cbi8qKlxuICogUHJvZHVjZXIgY29uc3VtZXJcbiAqIFxuICogUHJvZHVjZXIgY29uc3VtZXIgc2VydmljZVxuICogIFVzZXJzIGNhbiBzdWJtaXQgdGFza3MgYW5kIG90aGVyIHVzZXJzIGNvbnN1bWUgdGhlbVxuICogKi9cbi8qKlxuICogUHJvZHVjZXIgLyBjb25zdW1lciByZWFsLXRpbWUgQVBJXG4gKiBcbiAqIFRhc2sgcHJvZHVjZXJzIHN1Ym1pdHMgdGhlaXIgdGFza3MuXG4gKiBUaGUgc2VydmVyIGRpc3BhdGNoZXMgdGhlIHRhc2tzLlxuICogQ29uc3VtZXJzIHByb2Nlc3MgdGhlbSBhbmQgcmVwb3J0IGNvbXBsZXRpb24gYmFjayB0byB0aGUgc2VydmVyLlxuICogVGFza3MgYXJlIGdsb2JhbCB0byB0aGUgc2VydmljZSAoaS5lLiBOT1QgcGVyIHVzZXIpLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgUXVldWVQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogU3VibWl0cyBhIHRhc2tcblx0ICogXG5cdCAqIFByb2R1Y2VyIEFQSS5cblx0ICogQSB0YXNrIHByb2R1Y2VyIHN1Ym1pdHMgdGhlIGdpdmVuIHRhc2sgdG8gdGhlIHNlcnZlci5cblx0ICogVGhlIHNlcnZlciB3aWxsIGZpbmQgYSB0YXNrZXIgd2l0aCBwcm9jZXNzaW5nIGNhcGFjaXR5IGFuZCBkaXNwYXRjaCB0aGUgdGFzay5cblx0ICogVGhlIHRhc2sgcmVzdWx0IHdpbGwgYmUgcmV0dXJuZWQgdG8gdGhlIGNhbGxlci5cblx0ICogV2hlbiBjYWxsZWQgZnJvbSBpbnNpZGUgYSBtYWNybywgdGhlIGNvbXN1bWVyIGdlbmVyYXRlZCByZXN1bHQgaXMgYXZhaWxhYmxlIGZvciBmdXJ0aGVyIHVzZS5cblx0ICogKi9cblx0Y2FsbCh7ZGVzY3JpcHRpb24sb3JpZ2luQnVzaW5lc3NJZCxvcmlnaW5EZXBsb3ltZW50SWQsZGF0YSxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogTm90aWZpZXMgY29tcGxldGlvbiBvZiBhIHRhc2tcblx0ICogXG5cdCAqIENvbnN1bWVyIEFQSS5cblx0ICogVGhlIHRhc2tlciBub3RpZmllcyBjb21wbGV0aW9uIG9mIHRoZSBnaXZlbiB0YXNrIHRvIHRoZSBzZXJ2ZXIuXG5cdCAqIFRoZSB0YXNrZXIgY2FuIG9wdGlvbmFsbHkgaW5jbHVkZSBhIHJlc3VsdCBvciBhbiBlcnJvciBjb2RlLlxuXHQgKiAqL1xuXHRkb25lKHtyZXN1bHQsc3VjY2Vzcyx0YXNrSWR9KSB7fSxcblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIGNvbnN1bWVyXG5cdCAqIFxuXHQgKiBDb25zdW1lciBBUEkuXG5cdCAqIFJlZ2lzdGVycyB0aGUgY3VycmVudCB1c2VyIHJlc291cmNlIGFzIGFuIGF2YWlsYWJsZSB0YXNrIGNvbnN1bWVyLlxuXHQgKiBUYXNrcyB3aWxsIGJlIHRoZW4gZGlzcGF0Y2hlZCB0byB0aGF0IGNvbnN1bWVyLlxuXHQgKiAqL1xuXHRyZWdpc3Rlcih7Y2FwYWNpdHl9KSB7fSxcblx0LyoqXG5cdCAqIFN1Ym1pdHMgYSB0YXNrXG5cdCAqIFxuXHQgKiBQcm9kdWNlciBBUEkuXG5cdCAqIEEgdGFzayBwcm9kdWNlciBzdWJtaXRzIHRoZSBnaXZlbiB0YXNrIHRvIHRoZSBzZXJ2ZXIuXG5cdCAqIFRoZSBzZXJ2ZXIgd2lsbCBmaW5kIGEgdGFza2VyIHdpdGggcHJvY2Vzc2luZyBjYXBhY2l0eSBhbmQgZGlzcGF0Y2ggdGhlIHRhc2suXG5cdCAqIFRoZSB0YXNrIHJlc3VsdCB3aWxsIGJlIGlnbm9yZWQgOiB0aGUgcHJvZHVjZXIgd2lsbCBub3QgcmVjZWl2ZSBhbnkgbm90aWZpY2F0aW9uIG9mIGFueSBraW5kLCBldmVuIGluIGNhc2Ugb2YgZXJyb3JzIChpbmNsdWRpbmcgY2FwYWNpdHkgZXhjZWVkZWQgZXJyb3JzKS5cblx0ICogVGhpcyB2ZXJiIHdpbGwgcmV0dXJuIGltbWVkaWF0ZWx5IDogeW91IGNhbiB1c2UgdGhpcyBBUEkgdG8gYXN5bmNocm9ub3VzbHkgc3VibWl0IGEgdGFzay5cblx0ICogKi9cblx0c3VibWl0KHtkZXNjcmlwdGlvbixvcmlnaW5CdXNpbmVzc0lkLG9yaWdpbkRlcGxveW1lbnRJZCxkYXRhLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBVbnJlZ2lzdGVycyBhIGNvbnN1bWVyXG5cdCAqIFxuXHQgKiBDb25zdW1lciBBUEkuXG5cdCAqIFVucmVnaXN0ZXJzIHRoZSBjdXJyZW50IHVzZXIgcmVzb3VyY2UgYXMgYW4gYXZhaWxhYmxlIHRhc2sgY29uc3VtZXIuXG5cdCAqIEFsbCBub24gZmluaXNoZWQgdGFza3MgYXJlIHJldHVybmVkIHRvIHRoZSBzZXJ2ZXIuXG5cdCAqICovXG5cdHVucmVnaXN0ZXIoe30pIHt9XG59XG4vKipcbiAqIFNNUyB2aWEgT1ZIXG4gKiBcbiAqIFNNUyBzZW5kZXIsIHRvIHNlbmQgdGV4dCBtZXNzYWdlcyB0byBtb2JpbGUgcGhvbmVzXG4gKiBUaGlzIFNNUyBzZW5kaW5nIHNlcnZpY2UgdXNlcyB0aGUgT1ZIIEFQSVxuICogXG4gKiAqL1xuLyoqXG4gKiBTTVMgc2VydmljZVxuICogXG4gKiBVc2VyIEFQSSBmb3IgU01TLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgU21zX292aFB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBTZW5kcyBhbiBTTVNcblx0ICogXG5cdCAqIFNlbmRzIHRoZSBnaXZlbiBtZXNzYWdlIHRvIHRoZSBnaXZlbiByZWNpcGllbnRzLlxuXHQgKiAqL1xuXHRzZW5kKHt9KSB7fVxufVxuLyoqXG4gKiBTY2hlZHVsZXJcbiAqIFxuICogU2NoZWR1bGVyIHNlcnZpY2VcbiAqICBFbmQtdXNlcnMgY2FuIHNjaGVkdWxlIG9uZS10aW1lIG9yIHJlcGV0aXRpdmUgdGFza3MgdXNpbmcgYSBjbGFzc2ljYWwgY3JvbiBzeW50YXggKHdpdGggdGhlIHllYXIgZmllbGQpIG9yIGEgdGltZXN0YW1wIChtaWxsaXNlY29uZHMgZnJvbSB0aGUgZXBvY2gpXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgdGhlIFNjaGVkdWxlclxuICogXG4gKiBVc2VyIGVuZHBvaW50cyBmb3Igc2NoZWR1bGluZyA6IHVzZXJzIGNhbiBzY2hlZHVsZSwgbGlzdCBhbmQgZGVsZXRlIHRhc2tzLlxuICogVGFza3MgYXJlIHN0b3JlZCBvbiBhIHBlci11c2VyIGJhc2lzOiBhIHRhc2sgd2lsbCBydW4gd2l0aCB0aGUgcHJpdmlsZWRnZXMgb2YgdGhlIHVzZXIgd2hvIHN0b3JlZCBpdC5cbiAqIFRhc2tzIGFyZSBydW4gb24gdGhlIHNlcnZlciBhbmQgdGh1cyBjYW4gY2FsbCBhcGkgdmVyYnMgbWFya2VkIGFzIHNlcnZlci1vbmx5LlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgQ3JvblB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBMaXN0IHRoZSBjb25maWd1cmVkIHRhc2tzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIGxpc3Qgb2YgdGhlIGFza2luZyB1c2VyJ3MgdGFza3MuXG5cdCAqICovXG5cdGxpc3Qoe293bmVyLHBhZ2Usc3RhcnQsc3RvcH0pIHt9LFxuXHQvKipcblx0ICogU2NoZWR1bGVzIGEgdGFza1xuXHQgKiBcblx0ICogU2NoZWR1bGVzIGEgdGFzayBmb3IgbGF0ZXIgZXhlY3V0aW9uLlxuXHQgKiBJZiBhIHRhc2sgYWxyZWFkeSBleGlzdHMgd2l0aCB0aGUgc2FtZSBjcm9uTmFtZSwgdGhpcyBuZXcgdGFzayBjb21wbGV0ZWx5IHJlcGxhY2VzIGl0LlxuXHQgKiBBIHRhc2sgY2FuIGJlIHNjaGVkdWxlZCB3aXRoIGEgY3Jvbi1saWtlIHN5bnRheCBmb3IgcmVwZXRpdGl2ZSBvciBvbmUtc2hvdCBleGVjdXRpb24uXG5cdCAqIFdpbGRjYXJkcyBhcmUgbm90IGFsbG93ZWQgZm9yIG1pbnV0ZXMgYW5kIGhvdXJzLlxuXHQgKiBXaGVuIHNjaGVkdWxpbmcgZm9yIG9uZS1zaG90IGV4ZWN1dGlvbiwgdGhlIHRpbWUgbXVzdCBiZSBhdCBsZWFzdCB0d28gbWludXRlcyBpbnRvIHRoZSBmdXR1cmUuXG5cdCAqICovXG5cdHNjaGVkdWxlKHt9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBzY2hlZHVsZWQgdGFza1xuXHQgKiBcblx0ICogUmVtb3ZlcyBhIHByZXZpb3VzbHkgc2NoZWR1bGVkIHRhc2suXG5cdCAqIERvZXMgYWJzb2x1dGVseSBub3RoaW5nIGlmIGFza2VkIHRvIHJlbW92ZSBhIG5vbi1leGlzdGVudCB0YXNrLlxuXHQgKiAqL1xuXHR1bnNjaGVkdWxlKHtjcm9uTmFtZSxvd25lcn0pIHt9XG59XG4vKipcbiAqIFNlYXJjaCBlbmdpbmVcbiAqIFxuICogRWxhc3RpY1NlYXJjaCBlbmdpbmUsIHRvIGluZGV4IGFuZCBzZWFyY2ggZGF0YVxuICogIEFuIGFkbWluIGNyZWF0ZXMgaW5kaWNlc1xuICogIFVzZXJzIGluZGV4IGFuZCBzZWFyY2ggZG9jdW1lbnRzXG4gKiBcbiAqICovXG4vKipcbiAqIEVsYXN0aWNTZWFyY2ggU2VydmljZVxuICogXG4gKiBUaGlzIEFQSSBpcyBhIHZlcnkgdGhpbiB3cmFwcGVyIGFyb3VuZCBFbGFzdGljU2VhcmNoJ3MgQVBJLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgU2VhcmNoUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIERlbGV0ZXMgZGF0YVxuXHQgKiBcblx0ICogRGVsZXRlcyBhIGRvY3VtZW50IGZyb20gdGhlIGVsYXN0aWNzZWFyY2ggZW5naW5lIGJ5IGlkLlxuXHQgKiAqL1xuXHRkZWxldGUoe2lkLGluZGV4LHR5cGV9KSB7fSxcblx0LyoqXG5cdCAqIEdldHMgZGF0YVxuXHQgKiBcblx0ICogUmV0cmlldmVzIGEgZG9jdW1lbnQgZnJvbSB0aGUgZWxhc3RpY3NlYXJjaCBlbmdpbmUgYnkgaWQuXG5cdCAqICovXG5cdGdldCh7aWQsaW5kZXgsdHlwZX0pIHt9LFxuXHQvKipcblx0ICogSW5kZXhlcyBkYXRhXG5cdCAqIFxuXHQgKiBJbnNlcnRzIG9yIHVwZGF0ZXMgYSBkb2N1bWVudCBpbnRvIHRoZSBlbGFzdGljc2VhcmNoIGVuZ2luZS5cblx0ICogKi9cblx0aW5kZXgoe2RhdGEsaWQsaW5kZXgsdHlwZX0pIHt9LFxuXHQvKipTZWFyY2hlcyBmb3IgZGF0YSovXG5cdHNlYXJjaCh7aW5kaWNlcyxwYWdlLHF1ZXJ5LHNvcnR9KSB7fVxufVxuLyoqXG4gKiBUZW1wbGF0ZSBlbmdpbmVcbiAqIFxuICogVGVtcGxhdGUgZW5naW5lIHRvIHByb2R1Y2UgZG9jdW1lbnRzIGZyb20gcGFyYW1ldGVyaXplZCB0ZW1wbGF0ZXNcbiAqIDxicj5BbiBhZG1pbiBjcmVhdGVzIHRlbXBsYXRlc1xuICogPGJyPiBVc2VycyBwcm9kdWNlIGRvY3VtZW50c1xuICogPGJyPlRoZSBpbXBsZW1lbnRhdGlvbiB1c2VzIHRoZSA8YSBocmVmPSdodHRwOi8vZnJlZW1hcmtlclxuICogb3JnLyc+ZnJlZW1hcmtlcjwvYT4gZW5naW5lXG4gKiBcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciB0ZW1wbGF0ZXNcbiAqIFxuICogVXNlcnMgdXNlIHRoaXMgQVBJIHRvIGV2YWx1YXRlIHByZS1jb25maWd1cmVkIHRlbXBsYXRlcy5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IFRlbXBsYXRlUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIEV2YWx1YXRlcyBhIHRlbXBsYXRlXG5cdCAqIFxuXHQgKiBFdmFsdWF0ZXMgdGhlIGdpdmVuIHRlbXBsYXRlIGFuZCByZXR1cm5zIHRoZSByZXN1bHQgYXMgYSBzdHJpbmcuXG5cdCAqIFRlbXBsYXRlcyBhcmUgcGFyc2VkIHRoZSBmaXJzdCB0aW1lIHRoZXkgYXJlIGV2YWx1YXRlZC4gRXZhbHVhdGlvbiBtYXkgZmFpbCBlYXJseSBkdWUgdG8gYSBwYXJzaW5nIGVycm9yLlxuXHQgKiAqL1xuXHRldmFsdWF0ZSh7ZGF0YSxsYW5ndWFnZVRhZyxuYW1lLHJlcXVlc3RJZH0pIHt9XG59XG4vKipcbiAqIFVwbG9hZDogUzNcbiAqIFxuICogVXBsb2FkIHNlcnZpY2Ugd2l0aCBTMyBzdG9yYWdlXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgZmlsZSBtYW5hZ2VtZW50XG4gKiBcbiAqIFVzZXIgQVBJIGZvciB2aXJ0dWFsIGZpbGUgbWFuYWdlbWVudCBhbmQgaHR0cCBmaWxlIHVwbG9hZFxuICogVGhpcyBBUEkgY29udGFpbnMgYWxsIHRoZSB2ZXJicyBuZWVkZWQgdG8gYnJvd3NlLCB1cGxvYWQgYW5kIHJlbW92ZSBmaWxlcy5cbiAqIEZpbGVzIGFyZSBzdG9yZWQgb24gYSBwZXItdXNlciBiYXNpczogZWFjaCB1c2VyIGhhcyBoaXMgb3IgaGVyIG93biB3aG9sZSB2aXJ0dWFsIGZpbGVzeXN0ZW0uXG4gKiBVcGxvYWRpbmcgYSBmaWxlIGlzIGEgMy1zdGVwIHByb2Nlc3MgOiByZXF1ZXN0IGFuIHVwbG9hZCBVUkwsIHVwbG9hZCB2aWEgSFRUUCwgbm90aWZ5IHRoaXMgc2VydmljZSBvZiBjb21wbGV0aW9uLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgWnBmc19zM1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBDb3BpZXMgYSBmaWxlXG5cdCAqIFxuXHQgKiBDb3BpZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpIHRvIGEgbmV3IGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0Y3Aoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmV0dXJucyBkaXNrIHVzYWdlXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGFuIHJlY3Vyc2l2ZWx5IGFnZ3JlZ2F0ZWQgbnVtYmVyIG9mIHVzZWQgYnl0ZXMsIHN0YXJ0aW5nIGF0IHRoZSBnaXZlbiBwYXRoLlxuXHQgKiAqL1xuXHRkdSh7b3duZXIscGF0aH0pIHt9LFxuXHQvKipSZXF1ZXN0cyBhbiB1cGxvYWQgVVJMIHdpdGhvdXQgY29uc3RyYWludHMuKi9cblx0ZnJlZVVwbG9hZFVybCh7fSkge30sXG5cdC8qKlxuXHQgKiBMaW5rcyBhIGZpbGVcblx0ICogXG5cdCAqIExpbmtzIGEgZmlsZSBvciBmb2xkZXIgdG8gYW5vdGhlciBsb2NhdGlvbi5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdGxpbmsoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogTGlzdHMgYSBmb2xkZXIgY29udGVudFxuXHQgKiBcblx0ICogUmV0dXJucyBhIHBhZ2luYXRlZCBsaXN0IG9mIHRoZSBmb2xkZXIncyBjb250ZW50LlxuXHQgKiAqL1xuXHRscyh7Zm9sZGVyLG93bmVyLHBhZ2V9KSB7fSxcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmb2xkZXJcblx0ICogXG5cdCAqIENyZWF0ZXMgYSBuZXcgZm9sZGVyLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bWtkaXIoe2ZvbGRlcixvd25lcixwYXJlbnRzfSkge30sXG5cdC8qKlxuXHQgKiBNb3ZlcyBhIGZpbGVcblx0ICogXG5cdCAqIE1vdmVzIGEgZmlsZSBvciBmb2xkZXIgKHJlY3Vyc2l2ZWx5KSB0byBhIG5ldyBsb2NhdGlvbi5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdG12KHtvbGRQYXRoLG93bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIE5vdGlmaWVzIG9mIHVwbG9hZCBjb21wbGV0aW9uXG5cdCAqIFxuXHQgKiBUaGUgY2xpZW50IGFwcGxpY2F0aW9uIGNhbGxzIHRoaXMgdmVyYiB0byBub3RpZnkgdGhhdCBpdCdzIGRvbmUgdXBsb2FkaW5nIHRvIHRoZSBjbG91ZC5cblx0ICogQ2FsbGluZyB0aGF0IHZlcmIgTUFZIHRyaWdnZXIgYWRkaXRpb25hbCBldmVudHMgc3VjaCBhcyB0aHVtYm5haWwvbWV0YWRhdGEgY3JlYXRpb24uXG5cdCAqICovXG5cdG5ld0ZpbGUoe2d1aWQsbWV0YWRhdGEsb3duZXIsdGFnc30pIHt9LFxuXHQvKipcblx0ICogUmVxdWVzdHMgYW4gdXBsb2FkIFVSTFxuXHQgKiBcblx0ICogUmVxdWVzdHMgYW4gSFRUUCB1cGxvYWQgVVJMLlxuXHQgKiBUaGUgVVJMIGNvbnRhaW5zIHRlbXBvcmFyeSBjcmVkZW50aWFscyAodHlwaWNhbGx5IHZhbGlkIGZvciBhIGZldyBtaW51dGVzKSBhbmQgaXMgbWVhbnQgZm9yIGltbWVkaWF0ZSB1c2UuXG5cdCAqICovXG5cdG5ld1VwbG9hZFVybCh7Y29udGVudFR5cGUsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGZpbGVcblx0ICogXG5cdCAqIFJlbW92ZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpLlxuXHQgKiAqL1xuXHRybSh7b3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIGZpbGVcblx0ICogXG5cdCAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzaW5nbGUgZmlsZS5cblx0ICogVGhlIGVudHJ5IGZpZWxkIHdpbGwgYmUgbnVsbCBpZiB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdFxuXHQgKiAqL1xuXHRzdGF0KHtvd25lcixwYXRofSkge30sXG5cdC8qKlVwZGF0ZXMgYSBmaWxlJ3MgbWV0YWRhdGEqL1xuXHR1cGRhdGVNZXRhKHttZXRhZGF0YSxtZXRhZGF0YUZpbGVzLG93bmVyLHBhdGh9KSB7fVxufVxuLyoqXG4gKiBVcGxvYWQ6IGxvY2FsXG4gKiBcbiAqIFVwbG9hZCBzZXJ2aWNlIHdpdGggbG9jYWwgSERGUyBzdG9yYWdlXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgZmlsZSBtYW5hZ2VtZW50XG4gKiBcbiAqIFVzZXIgQVBJIGZvciB2aXJ0dWFsIGZpbGUgbWFuYWdlbWVudCBhbmQgaHR0cCBmaWxlIHVwbG9hZFxuICogVGhpcyBBUEkgY29udGFpbnMgYWxsIHRoZSB2ZXJicyBuZWVkZWQgdG8gYnJvd3NlLCB1cGxvYWQgYW5kIHJlbW92ZSBmaWxlcy5cbiAqIEZpbGVzIGFyZSBzdG9yZWQgb24gYSBwZXItdXNlciBiYXNpczogZWFjaCB1c2VyIGhhcyBoaXMgb3IgaGVyIG93biB3aG9sZSB2aXJ0dWFsIGZpbGVzeXN0ZW0uXG4gKiBVcGxvYWRpbmcgYSBmaWxlIGlzIGEgMy1zdGVwIHByb2Nlc3MgOiByZXF1ZXN0IGFuIHVwbG9hZCBVUkwsIHVwbG9hZCB2aWEgSFRUUCwgbm90aWZ5IHRoaXMgc2VydmljZSBvZiBjb21wbGV0aW9uLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgWnBmc19oZGZzUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIENvcGllcyBhIGZpbGVcblx0ICogXG5cdCAqIENvcGllcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkgdG8gYSBuZXcgbG9jYXRpb24uXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRjcCh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGRpc2sgdXNhZ2Vcblx0ICogXG5cdCAqIFJldHVybnMgYW4gcmVjdXJzaXZlbHkgYWdncmVnYXRlZCBudW1iZXIgb2YgdXNlZCBieXRlcywgc3RhcnRpbmcgYXQgdGhlIGdpdmVuIHBhdGguXG5cdCAqICovXG5cdGR1KHtvd25lcixwYXRofSkge30sXG5cdC8qKlJlcXVlc3RzIGFuIHVwbG9hZCBVUkwgd2l0aG91dCBjb25zdHJhaW50cy4qL1xuXHRmcmVlVXBsb2FkVXJsKHt9KSB7fSxcblx0LyoqXG5cdCAqIExpbmtzIGEgZmlsZVxuXHQgKiBcblx0ICogTGlua3MgYSBmaWxlIG9yIGZvbGRlciB0byBhbm90aGVyIGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bGluayh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBhIGZvbGRlciBjb250ZW50XG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIGxpc3Qgb2YgdGhlIGZvbGRlcidzIGNvbnRlbnQuXG5cdCAqICovXG5cdGxzKHtmb2xkZXIsb3duZXIscGFnZX0pIHt9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZvbGRlclxuXHQgKiBcblx0ICogQ3JlYXRlcyBhIG5ldyBmb2xkZXIuXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRta2Rpcih7Zm9sZGVyLG93bmVyLHBhcmVudHN9KSB7fSxcblx0LyoqXG5cdCAqIE1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogTW92ZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpIHRvIGEgbmV3IGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bXYoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogTm90aWZpZXMgb2YgdXBsb2FkIGNvbXBsZXRpb25cblx0ICogXG5cdCAqIFRoZSBjbGllbnQgYXBwbGljYXRpb24gY2FsbHMgdGhpcyB2ZXJiIHRvIG5vdGlmeSB0aGF0IGl0J3MgZG9uZSB1cGxvYWRpbmcgdG8gdGhlIGNsb3VkLlxuXHQgKiBDYWxsaW5nIHRoYXQgdmVyYiBNQVkgdHJpZ2dlciBhZGRpdGlvbmFsIGV2ZW50cyBzdWNoIGFzIHRodW1ibmFpbC9tZXRhZGF0YSBjcmVhdGlvbi5cblx0ICogKi9cblx0bmV3RmlsZSh7Z3VpZCxtZXRhZGF0YSxvd25lcix0YWdzfSkge30sXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhbiB1cGxvYWQgVVJMXG5cdCAqIFxuXHQgKiBSZXF1ZXN0cyBhbiBIVFRQIHVwbG9hZCBVUkwuXG5cdCAqIFRoZSBVUkwgY29udGFpbnMgdGVtcG9yYXJ5IGNyZWRlbnRpYWxzICh0eXBpY2FsbHkgdmFsaWQgZm9yIGEgZmV3IG1pbnV0ZXMpIGFuZCBpcyBtZWFudCBmb3IgaW1tZWRpYXRlIHVzZS5cblx0ICogKi9cblx0bmV3VXBsb2FkVXJsKHtjb250ZW50VHlwZSxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogUmVtb3ZlcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkuXG5cdCAqICovXG5cdHJtKHtvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgZmlsZVxuXHQgKiBcblx0ICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIHNpbmdsZSBmaWxlLlxuXHQgKiBUaGUgZW50cnkgZmllbGQgd2lsbCBiZSBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IGV4aXN0XG5cdCAqICovXG5cdHN0YXQoe293bmVyLHBhdGh9KSB7fSxcblx0LyoqVXBkYXRlcyBhIGZpbGUncyBtZXRhZGF0YSovXG5cdHVwZGF0ZU1ldGEoe21ldGFkYXRhLG1ldGFkYXRhRmlsZXMsb3duZXIscGF0aH0pIHt9XG59XG4vKipcbiAqIFVwbG9hZDogcHNldWRvLVMzXG4gKiBcbiAqIFVwbG9hZCBzZXJ2aWNlIHdpdGggcHNldWRvLVMzY29tcGF0aWJsZSBzdG9yYWdlXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgZmlsZSBtYW5hZ2VtZW50XG4gKiBcbiAqIFVzZXIgQVBJIGZvciB2aXJ0dWFsIGZpbGUgbWFuYWdlbWVudCBhbmQgaHR0cCBmaWxlIHVwbG9hZFxuICogVGhpcyBBUEkgY29udGFpbnMgYWxsIHRoZSB2ZXJicyBuZWVkZWQgdG8gYnJvd3NlLCB1cGxvYWQgYW5kIHJlbW92ZSBmaWxlcy5cbiAqIEZpbGVzIGFyZSBzdG9yZWQgb24gYSBwZXItdXNlciBiYXNpczogZWFjaCB1c2VyIGhhcyBoaXMgb3IgaGVyIG93biB3aG9sZSB2aXJ0dWFsIGZpbGVzeXN0ZW0uXG4gKiBVcGxvYWRpbmcgYSBmaWxlIGlzIGEgMy1zdGVwIHByb2Nlc3MgOiByZXF1ZXN0IGFuIHVwbG9hZCBVUkwsIHVwbG9hZCB2aWEgSFRUUCwgbm90aWZ5IHRoaXMgc2VydmljZSBvZiBjb21wbGV0aW9uLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgWnBmc19zM2NvbXBhdFB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBDb3BpZXMgYSBmaWxlXG5cdCAqIFxuXHQgKiBDb3BpZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpIHRvIGEgbmV3IGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0Y3Aoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmV0dXJucyBkaXNrIHVzYWdlXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGFuIHJlY3Vyc2l2ZWx5IGFnZ3JlZ2F0ZWQgbnVtYmVyIG9mIHVzZWQgYnl0ZXMsIHN0YXJ0aW5nIGF0IHRoZSBnaXZlbiBwYXRoLlxuXHQgKiAqL1xuXHRkdSh7b3duZXIscGF0aH0pIHt9LFxuXHQvKipSZXF1ZXN0cyBhbiB1cGxvYWQgVVJMIHdpdGhvdXQgY29uc3RyYWludHMuKi9cblx0ZnJlZVVwbG9hZFVybCh7fSkge30sXG5cdC8qKlxuXHQgKiBMaW5rcyBhIGZpbGVcblx0ICogXG5cdCAqIExpbmtzIGEgZmlsZSBvciBmb2xkZXIgdG8gYW5vdGhlciBsb2NhdGlvbi5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdGxpbmsoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogTGlzdHMgYSBmb2xkZXIgY29udGVudFxuXHQgKiBcblx0ICogUmV0dXJucyBhIHBhZ2luYXRlZCBsaXN0IG9mIHRoZSBmb2xkZXIncyBjb250ZW50LlxuXHQgKiAqL1xuXHRscyh7Zm9sZGVyLG93bmVyLHBhZ2V9KSB7fSxcblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBmb2xkZXJcblx0ICogXG5cdCAqIENyZWF0ZXMgYSBuZXcgZm9sZGVyLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bWtkaXIoe2ZvbGRlcixvd25lcixwYXJlbnRzfSkge30sXG5cdC8qKlxuXHQgKiBNb3ZlcyBhIGZpbGVcblx0ICogXG5cdCAqIE1vdmVzIGEgZmlsZSBvciBmb2xkZXIgKHJlY3Vyc2l2ZWx5KSB0byBhIG5ldyBsb2NhdGlvbi5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdG12KHtvbGRQYXRoLG93bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIE5vdGlmaWVzIG9mIHVwbG9hZCBjb21wbGV0aW9uXG5cdCAqIFxuXHQgKiBUaGUgY2xpZW50IGFwcGxpY2F0aW9uIGNhbGxzIHRoaXMgdmVyYiB0byBub3RpZnkgdGhhdCBpdCdzIGRvbmUgdXBsb2FkaW5nIHRvIHRoZSBjbG91ZC5cblx0ICogQ2FsbGluZyB0aGF0IHZlcmIgTUFZIHRyaWdnZXIgYWRkaXRpb25hbCBldmVudHMgc3VjaCBhcyB0aHVtYm5haWwvbWV0YWRhdGEgY3JlYXRpb24uXG5cdCAqICovXG5cdG5ld0ZpbGUoe2d1aWQsbWV0YWRhdGEsb3duZXIsdGFnc30pIHt9LFxuXHQvKipcblx0ICogUmVxdWVzdHMgYW4gdXBsb2FkIFVSTFxuXHQgKiBcblx0ICogUmVxdWVzdHMgYW4gSFRUUCB1cGxvYWQgVVJMLlxuXHQgKiBUaGUgVVJMIGNvbnRhaW5zIHRlbXBvcmFyeSBjcmVkZW50aWFscyAodHlwaWNhbGx5IHZhbGlkIGZvciBhIGZldyBtaW51dGVzKSBhbmQgaXMgbWVhbnQgZm9yIGltbWVkaWF0ZSB1c2UuXG5cdCAqICovXG5cdG5ld1VwbG9hZFVybCh7Y29udGVudFR5cGUsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGZpbGVcblx0ICogXG5cdCAqIFJlbW92ZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpLlxuXHQgKiAqL1xuXHRybSh7b3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIGZpbGVcblx0ICogXG5cdCAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBzaW5nbGUgZmlsZS5cblx0ICogVGhlIGVudHJ5IGZpZWxkIHdpbGwgYmUgbnVsbCBpZiB0aGUgcGF0aCBkb2VzIG5vdCBleGlzdFxuXHQgKiAqL1xuXHRzdGF0KHtvd25lcixwYXRofSkge30sXG5cdC8qKlVwZGF0ZXMgYSBmaWxlJ3MgbWV0YWRhdGEqL1xuXHR1cGRhdGVNZXRhKHttZXRhZGF0YSxtZXRhZGF0YUZpbGVzLG93bmVyLHBhdGh9KSB7fVxufVxuLyoqXG4gKiBVc2VyIGRpcmVjdG9yeSBzZXJ2aWNlXG4gKiBcbiAqIFVzZXIgZGlyZWN0b3J5IHNlcnZpY2VcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciB1c2VyIGluZm9ybWF0aW9uXG4gKiBcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IFVzZXJkaXJQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipTZWFyY2hlcyBmb3IgdXNlcnMgbWF0Y2hpbmcgdGhlIHJlcXVlc3QqL1xuXHRzZWFyY2goe3BhZ2UscXVlcnkscmVxdWVzdElkfSkge30sXG5cdC8qKlJlcXVlc3RzIHB1YmxpYyBkYXRhIGZvciB0aGUgc3BlY2lmaWVkIHVzZXJzKi9cblx0dXNlckluZm8oe3VzZXJLZXlzfSkge31cbn1cbi8qKlxuICogRGVsZWdhdGluZyBhdXRoZW50aWNhdGlvblxuICogXG4gKiBUaGlzIGF1dGhlbnRpY2F0aW9uIGRlbGVnYXRlcyBhdXRoZW50aWNhdGlvbiB0byBhbiBleHRlcm5hbCBhdXRoIHByb3ZpZGVyXG4gKiA8YnI+V2hlbiBhIHpldGFwdXNoIGNsaWVudCBoYW5kc2hha2VzIHdpdGggYSBkZWxlZ2F0ZWQgYXV0aGVudGljYXRpb24sIHRoZSAndG9rZW4nIGZpZWxkIGdpdmVuIGJ5IHRoZSBjbGllbnQgaXMgc2VudCB0byB0aGUgY29uZmlndXJlZCByZW1vdGUgc2VydmVyIGFzIHBhcnQgb2YgdGhlIFVSTFxuICogPGJyPlRoZSByZXNwb25zZSBtdXN0IGJlIGluIEpTT04gZm9ybWF0XG4gKiAgRWFjaCBrZXkgb2YgdGhlIHJlc3BvbnNlIHdpbGwgYmUgY29uc2lkZXJlZCBhIHVzZXIgaW5mb3JtYXRpb24gZmllbGQgbmFtZVxuICogXG4gKiAqL1xuLyoqXG4gKiBFbmQtdXNlciBBUEkgZm9yIHRoZSBkZWxlZ2F0aW5nIGF1dGhlbnRpY2F0aW9uXG4gKiBcbiAqIFByb3Zpc2lvbm5pbmcgdmVyYnMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBEZWxlZ2F0aW5nUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIEdldCB1c2VyIGluZm9cblx0ICogXG5cdCAqIFJldHJpZXZlcyBjYWNoZWQgdXNlciBpbmZvIG9yIChpZiBtaXNzaW5nKSBlYWdlcmx5IGNyZWF0ZXMgYSB6ZXRhcHVzaCBrZXkgZm9yIHRoZSB1c2VyLlxuXHQgKiBUaGUgcmV0dXJuZWQgZmllbGQgJ3pldGFwdXNoS2V5JyBpcyBhIHVuaXF1ZSBhbmQgcGVybWFuZW50IElEIGlkZW50aWZ5aW5nIGEgdXNlciBpbiBhIHNhbmRib3guXG5cdCAqICovXG5cdHVzZXJJbmZvKHt9KSB7fVxufVxuLyoqXG4gKiBMb2NhbCBhdXRoZW50aWNhdGlvblxuICogXG4gKiBaZXRhcHVzaCBsb2NhbCBhdXRoZW50aWNhdGlvblxuICogIFRoZSBjb25maWd1cmVyIGNhbiBjaG9vc2UgdGhlIHByaW1hcnkga2V5IGFuZCBtYW5kYXRvcnkgdXNlciBmaWVsZHMgZm9yIGFjY291bnQgY3JlYXRpb25cbiAqICBUaGUgZmllbGQgJ3pldGFwdXNoS2V5JyBpcyBnZW5lcmF0ZWQgYnkgdGhlIHNlcnZlciBhbmQgTVVTVCBub3QgYmUgdXNlZCA6IGl0IGNvbnRhaW5zIHRoZSB1bmlxdWUga2V5IG9mIHRoZSB1c2VyIGluc2lkZSBhIHNhbmRib3ggKGl0IGNhbiBiZSBvYnRhaW5lZCBmcm9tIGluc2lkZSBhIG1hY3JvIHdpdGggdGhlIDxiPl9fdXNlcktleTwvYj4gcHNldWRvLWNvbnN0YW50KVxuICogKi9cbi8qKlxuICogRW5kLXVzZXIgQVBJIGZvciB0aGUgc2ltcGxlIGxvY2FsIGF1dGhlbnRpY2F0aW9uXG4gKiBcbiAqIFRoZXNlIEFQSSB2ZXJicyBhbGxvdyBlbmQtdXNlcnMgdG8gbWFuYWdlIHRoZWlyIGFjY291bnQuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBTaW1wbGVQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQ2hhbmdlcyBhIHBhc3N3b3JkXG5cdCAqIFxuXHQgKiBDaGFuZ2VzIGEgdXNlciBwYXNzd29yZCBmb3IgdGhpcyBhdXRoZW50aWNhdGlvbiByZWFsbS5cblx0ICogVGhlIHVzZXIgY2FuIGJlIGVpdGhlciBpbXBsaWNpdCAodGhlIGN1cnJlbnQgdXNlcikgb3IgZGVkdWNlZCBmcm9tIHRoZSB0b2tlbi5cblx0ICogVGhlIGNoYW5nZSBpcyBlZmZlY3RpdmUgaW1tZWRpYXRlbHkuIEhvd2V2ZXIsIGFscmVhZHkgbG9nZ2VkIGluIHVzZXJzIG1pZ2h0IHN0YXkgY29ubmVjdGVkLlxuXHQgKiAqL1xuXHRjaGFuZ2VQYXNzd29yZCh7fSkge30sXG5cdC8qKlxuXHQgKiBDaGVja3Mgc29tZSBhY2NvdW50J3MgZXhpc3RlbmNlXG5cdCAqIFxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gdXNlciBhbHJlYWR5IGV4aXN0cyBpbiB0aGlzICdzaW1wbGUnIGF1dGhlbnRpY2F0aW9uIHJlYWxtLlxuXHQgKiAqL1xuXHRjaGVja1VzZXIoe30pIHt9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHVzZXJcblx0ICogXG5cdCAqIENyZWF0ZXMgYSBuZXcgdXNlciBpbiB0aGlzICdzaW1wbGUnIGF1dGhlbnRpY2F0aW9uIHJlYWxtLlxuXHQgKiAqL1xuXHRjcmVhdGVVc2VyKHt9KSB7fSxcblx0LyoqXG5cdCAqIERlbGV0ZXMgYSB1c2VyXG5cdCAqIFxuXHQgKiBEZWxldGVzIGFuIGV4aXN0aW5nIHVzZXIgaW4gdGhpcyAnc2ltcGxlJyBhdXRoZW50aWNhdGlvbiByZWFsbS5cblx0ICogKi9cblx0ZGVsZXRlVXNlcih7fSkge30sXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhIHBhc3N3b3JkIHJlc2V0XG5cdCAqIFxuXHQgKiBSZXF1ZXN0cyBhIHBhc3N3b3JkIHJlc2V0IGZvciB0aGUgZ2l2ZW4gdXNlcktleS5cblx0ICogVGhlIHVzZXJLZXkgbXVzdCBleGlzdCBhbmQgbXVzdCBiZSBnaXZlbiwgYXMgaXQgY2Fubm90IG9idmlvdXNseSBiZSBkZWR1Y2VkIGZyb20gdGhlIGN1cnJlbnRseSBsb2dnZWQgaW4gdXNlci5cblx0ICogVGhlIHJldHVybmVkIHRva2VuIG5lZWRzIHRvIGJlIHNlbnQgdG8gdGhlIGludGVuZGVkIHJlY2lwaWVudCBvbmx5LiBUaGUgdHlwaWNhbCB1c2UgY2FzZSBpcyB0byBkZWZpbmUgYSBtYWNybyB0aGF0IHJlcXVlc3RzIGEgcmVzZXQsIGdlbmVyYXRlcyBhIGVtYWlsIHRlbXBsYXRlIGFuZCBlbWFpbHMgdGhlIHVzZXIuIFRoZSBtYWNybyBjYW4gdGhlbiBiZSBzYWZlbHkgY2FsbGVkIGJ5IGEgd2Vha2x5IGF1dGhlbnRpY2F0ZWQgdXNlci5cblx0ICogUmVxdWVzdGluZyBhIHJlc2V0IGRvZXMgbm90IGludmFsaWRhdGUgdGhlIHBhc3N3b3JkLlxuXHQgKiBSZXF1ZXN0aW5nIGEgcmVzZXQgYWdhaW4gaW52YWxpZGF0ZXMgcHJldmlvdXMgcmVzZXQgcmVxdWVzdHMgKG9ubHkgdGhlIGxhc3QgdG9rZW4gaXMgdXNhYmxlKVxuXHQgKiAqL1xuXHRyZXF1ZXN0UmVzZXQoe30pIHt9LFxuXHQvKipcblx0ICogVXBkYXRlcyBhIHVzZXJcblx0ICogXG5cdCAqIFVwZGF0ZXMgYW4gZXhpc3RpbmcgdXNlciBpbiB0aGlzICdzaW1wbGUnIGF1dGhlbnRpY2F0aW9uIHJlYWxtLlxuXHQgKiAqL1xuXHR1cGRhdGVVc2VyKHt9KSB7fVxufVxuLyoqXG4gKiBXZWFrIGF1dGhlbnRpY2F0aW9uXG4gKiBcbiAqIFRoZSB3ZWFrIGF1dGhlbnRpY2F0aW9uIGFsbG93cyBmb3IgYW5vbnltb3VzIGF1dGhlbnRpY2F0aW9uIG9mIGRldmljZXNcbiAqICBTdWNoIGRldmljZXMgY2FuIGRpc3BsYXkgYSBxcmNvZGUgdG8gYWxsb3cgcmVndWxhciB1c2VycyB0byB0YWtlIGNvbnRyb2wgb2YgdGhlbVxuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIHdlYWsgZGV2aWNlcyBjb250cm9sXG4gKiBcbiAqIFVzZXIgQVBJIGZvciBjb250cm9sIGFuZCByZWxlYXNlIG9mIHdlYWtseSBhdXRoZW50aWNhdGVkIHVzZXIgc2Vzc2lvbnMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBXZWFrUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIENvbnRyb2xzIGEgc2Vzc2lvblxuXHQgKiBcblx0ICogVGFrZXMgY29udHJvbCBvZiBhIHdlYWsgdXNlciBzZXNzaW9uLCBpZGVudGlmaWVkIGJ5IHRoZSBnaXZlbiBwdWJsaWMgdG9rZW4uXG5cdCAqIFRoZSBwdWJsaWMgdG9rZW4gaGFzIGJlZW4gcHJldmlvdXNseSBtYWRlIGF2YWlsYWJsZSBieSB0aGUgY29udHJvbGxlZCBkZXZpY2UsIGZvciBleGFtcGxlIGJ5IGRpc3BsYXlpbmcgYSBRUkNvZGUuXG5cdCAqIFVwb24gY29udHJvbCBub3RpZmljYXRpb24sIHRoZSBjbGllbnQgU0RLIG9mIHRoZSBjb250cm9sbGVkIHNlc3Npb24gaXMgZXhwZWN0ZWQgdG8gcmUtaGFuZHNoYWtlLlxuXHQgKiAqL1xuXHRjb250cm9sKHtmdWxsUmlnaHRzLHB1YmxpY1Rva2VufSkge30sXG5cdC8qKlxuXHQgKiBSZWxlYXNlcyBhIHNlc3Npb25cblx0ICogXG5cdCAqIFJlbGVhc2VzIGNvbnRyb2wgb2YgYSB3ZWFrIHVzZXIgc2Vzc2lvbiwgaWRlbnRpZmllZCBieSB0aGUgZ2l2ZW4gcHVibGljIHRva2VuLlxuXHQgKiBUaGUgd2VhayB1c2VyIHNlc3Npb24gbXVzdCBoYXZlIGJlZW4gcHJldmlvdXNseSBjb250cm9sbGVkIGJ5IGEgY2FsbCB0byAnY29udHJvbCcuXG5cdCAqICovXG5cdHJlbGVhc2Uoe2Z1bGxSaWdodHMscHVibGljVG9rZW59KSB7fVxufVxuIiwiaW1wb3J0ICogYXMgZGVmaW5pdGlvbnMgZnJvbSAnLi9kZWZpbml0aW9ucy9pbmRleCdcblxuZXhwb3J0IHsgQXV0aGVudEZhY3RvcnkgfSBmcm9tICcuL2F1dGhlbnRpY2F0aW9uL2hhbmRzaGFrZSdcbmV4cG9ydCB7IENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lciB9IGZyb20gJy4vY29ubmVjdGlvbi9jb25uZWN0aW9uLXN0YXR1cydcbmV4cG9ydCB7IENsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuZXhwb3J0IHsgU21hcnRDbGllbnQgfSBmcm9tICcuL3NtYXJ0LWNsaWVudCdcbmV4cG9ydCB7IGRlZmluaXRpb25zIH1cbiIsImltcG9ydCB7IENsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuaW1wb3J0IHsgQXV0aGVudEZhY3RvcnkgfSBmcm9tICcuL2F1dGhlbnRpY2F0aW9uL2hhbmRzaGFrZSdcbmltcG9ydCB7IExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSB9IGZyb20gJy4vdXRpbHMvdG9rZW4tcGVyc2lzdGVuY2UnXG5cbi8qKlxuICogU21hcnRDbGllbnQgY29uZmlnIG9iamVjdC5cbiAqIEB0eXBlZGVmIHtPYmplY3R9IFNtYXJ0Q2xpZW50Q29uZmlnXG4gKiBAcHJvcGVydHkge3N0cmluZ30gYXBpVXJsIC0gQXBpIFVybFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGF1dGhlbnRpY2F0aW9uRGVwbG95bWVudElkIC0gQXV0aGVudGljYXRpb24gZGVwbG95bWVudCBpZFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGJ1c2luZXNzSWQgLSBCdXNpbmVzcyBpZFxuICogQHByb3BlcnR5IHtib29sZWFufSBmb3JjZUh0dHBzIC0gRm9yY2UgZW5kIHRvIGVuZCBIVFRQUyBjb25uZWN0aW9uXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcmVzb3VyY2UgLSBDbGllbnQgcmVzb3VyY2UgaWRcbiAqIEBwcm9wZXJ0eSB7QWJzdHJhY3RUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3l9IFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSAtIFRva2VuIHN0b3JhZ2Ugc3RyYXRlZ3lcbiAqL1xuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZXh0ZW5kcyB7Q2xpZW50fVxuICovXG5leHBvcnQgY2xhc3MgU21hcnRDbGllbnQgZXh0ZW5kcyBDbGllbnQge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFpldGFQdXNoIHNtYXJ0IGNsaWVudFxuICAgKiBAcGFyYW0ge1NtYXJ0Q2xpZW50Q29uZmlnfSBjb25maWdcbiAgICogQGV4YW1wbGVcbiAgICogLy8gU21hcnQgY2xpZW50XG4gICAqIGNvbnN0IGNsaWVudCA9IG5ldyBaZXRhUHVzaC5TbWFydENsaWVudCh7XG4gICAqICAgYnVzaW5lc3NJZDogJzxZT1VSLUJVU0lORVNTLUlELUlEPicsXG4gICAqICAgYXV0aGVudGljYXRpb25EZXBsb3ltZW50SWQ6ICc8WU9VUi1BVVRIRU5USUNBVElPTi1ERVBMT1lNRU5ULUlEPidcbiAgICogfSlcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXBpVXJsLCBhdXRoZW50aWNhdGlvbkRlcGxveW1lbnRJZCwgYnVzaW5lc3NJZCwgZm9yY2VIdHRwcywgcmVzb3VyY2UgPSBudWxsLCBUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kgPSBMb2NhbFN0b3JhZ2VUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kgfSkge1xuICAgIGNvbnN0IGhhbmRzaGFrZVN0cmF0ZWd5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLmdldFRva2VuKClcbiAgICAgIGNvbnN0IGhhbmRzaGFrZSA9IEF1dGhlbnRGYWN0b3J5LmNyZWF0ZVdlYWtIYW5kc2hha2Uoe1xuICAgICAgICBkZXBsb3ltZW50SWQ6IGF1dGhlbnRpY2F0aW9uRGVwbG95bWVudElkLFxuICAgICAgICB0b2tlblxuICAgICAgfSlcbiAgICAgIHJldHVybiBoYW5kc2hha2VcbiAgICB9XG4gICAgLyoqXG4gICAgICpcbiAgICAgKi9cbiAgICBzdXBlcih7IGFwaVVybCAsIGJ1c2luZXNzSWQsIGZvcmNlSHR0cHMsIGhhbmRzaGFrZVN0cmF0ZWd5LCByZXNvdXJjZSB9KVxuICAgIGNvbnN0IG9uU3VjY2Vzc2Z1bEhhbmRzaGFrZSA9ICh7IHB1YmxpY1Rva2VuLCB1c2VySWQsIHRva2VuIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1NtYXJ0Q2xpZW50OjpvblN1Y2Nlc3NmdWxIYW5kc2hha2UnLCB7IHB1YmxpY1Rva2VuLCB1c2VySWQsIHRva2VuIH0pXG5cbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICB0aGlzLnN0cmF0ZWd5LnNldCh7IHRva2VuIH0pXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG9uRmFpbGVkSGFuZHNoYWtlID0gKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdTbWFydENsaWVudDo6b25GYWlsZWRIYW5kc2hha2UnLCBlcnJvcilcbiAgICB9XG4gICAgdGhpcy5hZGRDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIoeyBvbkZhaWxlZEhhbmRzaGFrZSwgb25TdWNjZXNzZnVsSGFuZHNoYWtlIH0pXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge1Rva2VuUGVyc2lzdGVuY2VTdHJhdGVneX1cbiAgICAgKi9cbiAgICB0aGlzLnN0cmF0ZWd5ID0gbmV3IFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSgpXG4gIH1cbiAgLyoqXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0b3JlZCB0b2tlblxuICAgKi9cbiAgZ2V0VG9rZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RyYXRlZ3kuZ2V0KClcbiAgfVxufVxuIiwiLyoqXG4gKiBNYXRjaCB1bnNlY3VyZSBwYXR0ZXJuIHdlYlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xuY29uc3QgVU5TRUNVUkVfUEFUVEVSTiA9IC9eaHR0cDpcXC9cXC98XlxcL1xcLy9cblxuLyoqXG4qIERlZmF1bHQgWmV0YVB1c2ggQVBJIFVSTFxuKiBAYWNjZXNzIHByaXZhdGVcbiovXG5leHBvcnQgY29uc3QgQVBJX1VSTCA9ICdodHRwczovL2FwaS56cHVzaC5pby8nXG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IGxpc3RcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZXhwb3J0IGNvbnN0IHNodWZmbGUgPSAobGlzdCkgPT4ge1xuICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoKVxuICByZXR1cm4gbGlzdFtpbmRleF1cbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VIdHRwc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgZ2V0U2VjdXJlVXJsID0gKHVybCwgZm9yY2VIdHRwcykgPT4ge1xuICByZXR1cm4gZm9yY2VIdHRwcyA/IHVybC5yZXBsYWNlKFVOU0VDVVJFX1BBVFRFUk4sICdodHRwczovLycpIDogdXJsXG59XG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAcGFyYW0ge3thcGlVcmw6IHN0cmluZywgYnVzaW5lc3NJZDogc3RyaW5nLCBmb3JjZUh0dHBzOiBib29sZWFufX0gcGFyYW1ldGVyc1xuICogQHJldHVybiB7UHJvbWlzZX1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlcnZlcnMgPSAoeyBhcGlVcmwsIGJ1c2luZXNzSWQsIGZvcmNlSHR0cHMgfSkgPT4ge1xuICBjb25zdCBzZWN1cmVBcGlVcmwgPSBnZXRTZWN1cmVVcmwoYXBpVXJsLCBmb3JjZUh0dHBzKVxuICBjb25zdCB1cmwgPSBgJHtzZWN1cmVBcGlVcmx9JHtidXNpbmVzc0lkfWBcbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgICB9KVxuICAgIC50aGVuKCh7IHNlcnZlcnMgfSkgPT4ge1xuICAgICAgLy8gVE9ETzogUmVwbGFjZSBieSBhIHNlcnZlciBzaWRlIGltcGxlbWVudGF0aW9uIHdoZW4gYXZhaWxhYmxlXG4gICAgICByZXR1cm4gc2VydmVycy5tYXAoKHNlcnZlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0U2VjdXJlVXJsKHNlcnZlciwgZm9yY2VIdHRwcylcbiAgICAgIH0pXG4gICAgfSlcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBleHRlbmRzIHtFcnJvcn1cbiAqL1xuZXhwb3J0IGNsYXNzIE5vdFlldEltcGxlbWVudGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICAgKi9cbiAgY29uc3RydWN0b3IobWVzc2FnZSA9ICcnKSB7XG4gICAgc3VwZXIobWVzc2FnZSlcbiAgICB0aGlzLm5hbWUgPSAnTm90SW1wbGVtZW50ZWRFcnJvcidcbiAgfVxuXG59XG4iLCIvKipcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFpFVEFQVVNIX1RPS0VOX0tFWSA9ICd6ZXRhcHVzaC50b2tlbidcblxuLyoqXG4gKiBQcm92aWRlIGFic3RyYWN0aW9uIGZvciB0b2tlbiBwZXJzaXN0ZW5jZVxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7e2tleTogc3RyaW5nfX0gcGFyYW1ldGVyc1xuICAgKi9cbiAgY29uc3RydWN0b3IoeyBrZXkgPSBaRVRBUFVTSF9UT0tFTl9LRVkgfSA9IHt9KSB7XG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICB0aGlzLmtleSA9IGtleVxuICB9XG4gIC8qKlxuICAgKiBAYWJzdHJhY3RcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RvcmVkIHRva2VuXG4gICAqL1xuICBnZXQoKSB7fVxuICAvKipcbiAgICogQGFic3RyYWN0XG4gICAqIEBwYXJhbSB7e3Rva2VuOiBzdHJpbmd9fSBwYXJhbWV0ZXJzXG4gICAqL1xuICBzZXQoeyB0b2tlbiB9KSB7fVxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHJvdGVjdGVkXG4gKiBAZXh0ZW5kcyB7QWJzdHJhY3RUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3l9XG4gKi9cbmV4cG9ydCBjbGFzcyBMb2NhbFN0b3JhZ2VUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kgZXh0ZW5kcyBBYnN0cmFjdFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSB7XG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RvcmVkIHRva2VuXG4gICAqL1xuICBnZXQoKSB7XG4gICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMua2V5KVxuICB9XG4gIC8qKlxuICAgKiBAb3ZlcnJpZGVcbiAgICogQHBhcmFtIHt7dG9rZW46IHN0cmluZ319IHBhcmFtZXRlcnNcbiAgICovXG4gIHNldCh7IHRva2VuIH0pIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmtleSwgdG9rZW4pXG4gIH1cbn1cbiJdfQ==
