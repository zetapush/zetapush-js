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
    var _ref$enableHttps = _ref.enableHttps;
    var enableHttps = _ref$enableHttps === undefined ? false : _ref$enableHttps;
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
    this.servers = (0, _utils.getServers)({ apiUrl: apiUrl, businessId: businessId, enableHttps: enableHttps });
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

},{"./cometd":12,"./connection-status":13,"./utils":19,"zetapush-cometd":1}],11:[function(require,module,exports){
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
 * Default ZetaPush API URL
 * @access public
 */
var API_URL = exports.API_URL = 'https://api.zpush.io/';

/**
 * ZetaPush Client to connect
 * @access public
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
 * @example
 * const client = new Client({
 *   businessId: '<YOUR-BUSINESS-ID>',
 *   enableHttps: true,
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
   * Create a new ZetaPush client
   */

  function Client(_ref) {
    var _ref$apiUrl = _ref.apiUrl;
    var apiUrl = _ref$apiUrl === undefined ? API_URL : _ref$apiUrl;
    var businessId = _ref.businessId;
    var _ref$enableHttps = _ref.enableHttps;
    var enableHttps = _ref$enableHttps === undefined ? false : _ref$enableHttps;
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
      enableHttps: enableHttps,
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

},{"./client-helper":10,"./utils":19}],12:[function(require,module,exports){
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

},{"zetapush-cometd":1}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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
   * Get auth data
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

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.definitions = exports.LocalStorageTokenPersistenceStrategy = exports.AbstractTokenPersistenceStrategy = exports.SmartClient = exports.Client = exports.API_URL = exports.AuthentFactory = undefined;

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

var _definitions = require('./definitions');

var definitions = _interopRequireWildcard(_definitions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.definitions = definitions;

},{"./client":11,"./definitions":14,"./handshake":15,"./smart-client":17,"./token-persistence":18}],17:[function(require,module,exports){
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
   * Create a new ZetaPush smart client
   */

  function SmartClient(_ref) {
    var apiUrl = _ref.apiUrl;
    var authenticationDeploymentId = _ref.authenticationDeploymentId;
    var businessId = _ref.businessId;
    var enableHttps = _ref.enableHttps;
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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SmartClient).call(this, { apiUrl: apiUrl, businessId: businessId, enableHttps: enableHttps, handshakeStrategy: handshakeStrategy, resource: resource }));

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

},{"./client":11,"./handshake":15,"./token-persistence":18}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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
 * @param {boolean} enableHttps
 * @return {string}
 */
var getSecureUrl = exports.getSecureUrl = function getSecureUrl(url, enableHttps) {
  return enableHttps ? url.replace(UNSECURE_PATTERN, 'https://') : url;
};

/**
 * @access private
 * @return {Promise}
 */
var getServers = exports.getServers = function getServers(_ref) {
  var apiUrl = _ref.apiUrl;
  var businessId = _ref.businessId;
  var enableHttps = _ref.enableHttps;

  var secureApiUrl = getSecureUrl(apiUrl, enableHttps);
  var url = '' + secureApiUrl + businessId;
  return fetch(url).then(function (response) {
    return response.json();
  }).then(function (_ref2) {
    var servers = _ref2.servers;

    // TODO: Replace by a server side implementation when available
    return servers.map(function (server) {
      return getSecureUrl(server, enableHttps);
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

},{}]},{},[16])(16)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvQ29tZXRELmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvTG9uZ1BvbGxpbmdUcmFuc3BvcnQuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9SZXF1ZXN0VHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3pldGFwdXNoLWNvbWV0ZC9saWIvVHJhbnNwb3J0UmVnaXN0cnkuanMiLCJub2RlX21vZHVsZXMvemV0YXB1c2gtY29tZXRkL2xpYi9VdGlscy5qcyIsIm5vZGVfbW9kdWxlcy96ZXRhcHVzaC1jb21ldGQvbGliL1dlYlNvY2tldFRyYW5zcG9ydC5qcyIsInNyYy9jbGllbnQtaGVscGVyLmpzIiwic3JjL2NsaWVudC5qcyIsInNyYy9jb21ldGQuanMiLCJzcmMvY29ubmVjdGlvbi1zdGF0dXMuanMiLCJzcmMvZGVmaW5pdGlvbnMuanMiLCJzcmMvaGFuZHNoYWtlLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL3NtYXJ0LWNsaWVudC5qcyIsInNyYy90b2tlbi1wZXJzaXN0ZW5jZS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2o0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDN1dBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7O0FBS0EsSUFBTSxVQUFVO0FBQ2QsNkJBQTJCLFdBQTNCO0FBQ0Esd0JBQXNCLE1BQXRCO0FBQ0EseUJBQXVCLE9BQXZCO0NBSEk7Ozs7O0FBU04sSUFBTSxZQUFZO0FBQ2hCLGdCQUFjLGNBQWQ7QUFDQSxhQUFXLFdBQVg7Q0FGSTs7Ozs7OztJQVNPOzs7OztBQUlY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QUE5Qiw2QkFBOEI7TUFBbEIsK0JBQWtCOztBQUNqRSxNQUFNLGVBQWUsYUFBYSxNQUFiLEVBQXFCLFdBQXJCLENBQWYsQ0FEMkQ7QUFFakUsTUFBTSxXQUFTLGVBQWUsVUFBeEIsQ0FGMkQ7QUFHakUsU0FBTyxNQUFNLEdBQU4sRUFDSixJQURJLENBQ0MsVUFBQyxRQUFELEVBQWM7QUFDbEIsV0FBTyxTQUFTLElBQVQsRUFBUCxDQURrQjtHQUFkLENBREQsQ0FJSixJQUpJLENBSUMsaUJBQWlCO1FBQWQsd0JBQWM7OztBQUVyQixXQUFPLFFBQVEsR0FBUixDQUFZLFVBQUMsTUFBRCxFQUFZO0FBQzdCLGFBQU8sYUFBYSxNQUFiLEVBQXFCLFdBQXJCLENBQVAsQ0FENkI7S0FBWixDQUFuQixDQUZxQjtHQUFqQixDQUpSLENBSGlFO0NBQXpDOzs7Ozs7O0lBbUJiOzs7Ozs7O0FBSVgsV0FKVyxzQkFJWCxHQUEwQjtRQUFkLGdFQUFVLGtCQUFJOzswQkFKZix3QkFJZTs7dUVBSmYsbUNBS0gsVUFEa0I7O0FBRXhCLFVBQUssSUFBTCxHQUFZLHFCQUFaLENBRndCOztHQUExQjs7U0FKVztFQUErQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9DYWxsYmFja1BvbGxpbmdUcmFuc3BvcnQnKSxcbiAgQ29tZXREOiByZXF1aXJlKCcuL2xpYi9Db21ldEQnKSxcbiAgTG9uZ1BvbGxpbmdUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL0xvbmdQb2xsaW5nVHJhbnNwb3J0JyksXG4gIFJlcXVlc3RUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL1JlcXVlc3RUcmFuc3BvcnQnKSxcbiAgVHJhbnNwb3J0OiByZXF1aXJlKCcuL2xpYi9UcmFuc3BvcnQnKSxcbiAgVHJhbnNwb3J0UmVnaXN0cnk6IHJlcXVpcmUoJy4vbGliL1RyYW5zcG9ydFJlZ2lzdHJ5JyksXG4gIFV0aWxzOiByZXF1aXJlKCcuL2xpYi9VdGlscycpLFxuICBXZWJTb2NrZXRUcmFuc3BvcnQ6IHJlcXVpcmUoJy4vbGliL1dlYlNvY2tldFRyYW5zcG9ydCcpXG59XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKTtcbnZhciBSZXF1ZXN0VHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9SZXF1ZXN0VHJhbnNwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ2FsbGJhY2tQb2xsaW5nVHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgUmVxdWVzdFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIF9zZWxmLmpzb25wU2VuZCA9IGZ1bmN0aW9uKHBhY2tldCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmFpbFRyYW5zcG9ydEZuKGVudmVsb3BlLCByZXF1ZXN0LCB4KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCAnZXJyb3InLCB4KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vIE1pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlciBoYXMgYSAyMDgzIFVSTCBtYXggbGVuZ3RoXG4gICAgICAgIC8vIFdlIG11c3QgZW5zdXJlIHRoYXQgd2Ugc3RheSB3aXRoaW4gdGhhdCBsZW5ndGhcbiAgICAgICAgdmFyIHN0YXJ0ID0gMDtcbiAgICAgICAgdmFyIGxlbmd0aCA9IGVudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aDtcbiAgICAgICAgdmFyIGxlbmd0aHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIEVuY29kZSB0aGUgbWVzc2FnZXMgYmVjYXVzZSBhbGwgYnJhY2tldHMsIHF1b3RlcywgY29tbWFzLCBjb2xvbnMsIGV0Y1xuICAgICAgICAgICAgLy8gcHJlc2VudCBpbiB0aGUgSlNPTiB3aWxsIGJlIFVSTCBlbmNvZGVkLCB0YWtpbmcgbWFueSBtb3JlIGNoYXJhY3RlcnNcbiAgICAgICAgICAgIHZhciBqc29uID0gSlNPTi5zdHJpbmdpZnkoZW52ZWxvcGUubWVzc2FnZXMuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgbGVuZ3RoKSk7XG4gICAgICAgICAgICB2YXIgdXJsTGVuZ3RoID0gZW52ZWxvcGUudXJsLmxlbmd0aCArIGVuY29kZVVSSShqc29uKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIHZhciBtYXhMZW5ndGggPSB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhVUklMZW5ndGg7XG4gICAgICAgICAgICBpZiAodXJsTGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9ICdCYXlldXggbWVzc2FnZSB0b28gYmlnICgnICsgdXJsTGVuZ3RoICsgJyBieXRlcywgbWF4IGlzICcgKyBtYXhMZW5ndGggKyAnKSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdmb3IgdHJhbnNwb3J0ICcgKyB0aGlzLmdldFR5cGUoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KF9mYWlsVHJhbnNwb3J0Rm4uY2FsbCh0aGlzLCBlbnZlbG9wZSwgcmVxdWVzdCwgeCksIDApO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLS1sZW5ndGg7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxlbmd0aHMucHVzaChsZW5ndGgpO1xuICAgICAgICAgICAgc3RhcnQgKz0gbGVuZ3RoO1xuICAgICAgICAgICAgbGVuZ3RoID0gZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoIC0gc3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIZXJlIHdlIGFyZSBzdXJlIHRoYXQgdGhlIG1lc3NhZ2VzIGNhbiBiZSBzZW50IHdpdGhpbiB0aGUgVVJMIGxpbWl0XG5cbiAgICAgICAgdmFyIGVudmVsb3BlVG9TZW5kID0gZW52ZWxvcGU7XG4gICAgICAgIGlmIChsZW5ndGhzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhciBiZWdpbiA9IDA7XG4gICAgICAgICAgICB2YXIgZW5kID0gbGVuZ3Roc1swXTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NwbGl0JywgZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoLCAnbWVzc2FnZXMgaW50bycsIGxlbmd0aHMuam9pbignICsgJykpO1xuICAgICAgICAgICAgZW52ZWxvcGVUb1NlbmQgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIGVudmVsb3BlKTtcbiAgICAgICAgICAgIGVudmVsb3BlVG9TZW5kLm1lc3NhZ2VzID0gZW52ZWxvcGUubWVzc2FnZXMuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZC5vblN1Y2Nlc3MgPSBlbnZlbG9wZS5vblN1Y2Nlc3M7XG4gICAgICAgICAgICBlbnZlbG9wZVRvU2VuZC5vbkZhaWx1cmUgPSBlbnZlbG9wZS5vbkZhaWx1cmU7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuZ3Rocy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0RW52ZWxvcGUgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIGVudmVsb3BlKTtcbiAgICAgICAgICAgICAgICBiZWdpbiA9IGVuZDtcbiAgICAgICAgICAgICAgICBlbmQgKz0gbGVuZ3Roc1tpXTtcbiAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUubWVzc2FnZXMgPSBlbnZlbG9wZS5tZXNzYWdlcy5zbGljZShiZWdpbiwgZW5kKTtcbiAgICAgICAgICAgICAgICBuZXh0RW52ZWxvcGUub25TdWNjZXNzID0gZW52ZWxvcGUub25TdWNjZXNzO1xuICAgICAgICAgICAgICAgIG5leHRFbnZlbG9wZS5vbkZhaWx1cmUgPSBlbnZlbG9wZS5vbkZhaWx1cmU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKG5leHRFbnZlbG9wZSwgcmVxdWVzdC5tZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdzZW5kaW5nIHJlcXVlc3QnLCByZXF1ZXN0LmlkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZVRvU2VuZCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBzYW1lU3RhY2sgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5qc29ucFNlbmQoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogdGhpcyxcbiAgICAgICAgICAgICAgICB1cmw6IGVudmVsb3BlVG9TZW5kLnVybCxcbiAgICAgICAgICAgICAgICBzeW5jOiBlbnZlbG9wZVRvU2VuZC5zeW5jLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLnJlcXVlc3RIZWFkZXJzLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlVG9TZW5kLm1lc3NhZ2VzKSxcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVkID0gc2VsZi5jb252ZXJ0VG9NZXNzYWdlcyhyZXNwb25zZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlY2VpdmVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodHRwQ29kZTogMjA0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0U3VjY2VzcyhlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwgcmVjZWl2ZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1Zyh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24ocmVhc29uLCBleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWx1cmUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb246IHJlYXNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4Y2VwdGlvbjogZXhjZXB0aW9uXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzYW1lU3RhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtlZXAgdGhlIHNlbWFudGljIG9mIGNhbGxpbmcgcmVzcG9uc2UgY2FsbGJhY2tzIGFzeW5jaHJvbm91c2x5IGFmdGVyIHRoZSByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlVG9TZW5kLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2FtZVN0YWNrID0gZmFsc2U7XG4gICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZVRvU2VuZCwgcmVxdWVzdCwge1xuICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHh4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwidmFyIFRyYW5zcG9ydFJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnRSZWdpc3RyeScpXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJylcbi8qKlxuICogVGhlIGNvbnN0cnVjdG9yIGZvciBhIENvbWV0RCBvYmplY3QsIGlkZW50aWZpZWQgYnkgYW4gb3B0aW9uYWwgbmFtZS5cbiAqIFRoZSBkZWZhdWx0IG5hbWUgaXMgdGhlIHN0cmluZyAnZGVmYXVsdCcuXG4gKiBJbiB0aGUgcmFyZSBjYXNlIGEgcGFnZSBuZWVkcyBtb3JlIHRoYW4gb25lIEJheWV1eCBjb252ZXJzYXRpb24sXG4gKiBhIG5ldyBpbnN0YW5jZSBjYW4gYmUgY3JlYXRlZCB2aWE6XG4gKiA8cHJlPlxuICogdmFyIGJheWV1eFVybDIgPSAuLi47XG4gKlxuICogLy8gRG9qbyBzdHlsZVxuICogdmFyIGNvbWV0ZDIgPSBuZXcgZG9qb3guQ29tZXREKCdhbm90aGVyX29wdGlvbmFsX25hbWUnKTtcbiAqXG4gKiAvLyBqUXVlcnkgc3R5bGVcbiAqIHZhciBjb21ldGQyID0gbmV3ICQuQ29tZXREKCdhbm90aGVyX29wdGlvbmFsX25hbWUnKTtcbiAqXG4gKiBjb21ldGQyLmluaXQoe3VybDogYmF5ZXV4VXJsMn0pO1xuICogPC9wcmU+XG4gKiBAcGFyYW0gbmFtZSB0aGUgb3B0aW9uYWwgbmFtZSBvZiB0aGlzIGNvbWV0ZCBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDb21ldEQobmFtZSkge1xuICAgIHZhciBfY29tZXRkID0gdGhpcztcbiAgICB2YXIgX25hbWUgPSBuYW1lIHx8ICdkZWZhdWx0JztcbiAgICB2YXIgX2Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgdmFyIF90cmFuc3BvcnRzID0gbmV3IFRyYW5zcG9ydFJlZ2lzdHJ5KCk7XG4gICAgdmFyIF90cmFuc3BvcnQ7XG4gICAgdmFyIF9zdGF0dXMgPSAnZGlzY29ubmVjdGVkJztcbiAgICB2YXIgX21lc3NhZ2VJZCA9IDA7XG4gICAgdmFyIF9jbGllbnRJZCA9IG51bGw7XG4gICAgdmFyIF9iYXRjaCA9IDA7XG4gICAgdmFyIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICB2YXIgX2ludGVybmFsQmF0Y2ggPSBmYWxzZTtcbiAgICB2YXIgX2xpc3RlbmVycyA9IHt9O1xuICAgIHZhciBfYmFja29mZiA9IDA7XG4gICAgdmFyIF9zY2hlZHVsZWRTZW5kID0gbnVsbDtcbiAgICB2YXIgX2V4dGVuc2lvbnMgPSBbXTtcbiAgICB2YXIgX2FkdmljZSA9IHt9O1xuICAgIHZhciBfaGFuZHNoYWtlUHJvcHM7XG4gICAgdmFyIF9oYW5kc2hha2VDYWxsYmFjaztcbiAgICB2YXIgX2NhbGxiYWNrcyA9IHt9O1xuICAgIHZhciBfcmVtb3RlQ2FsbHMgPSB7fTtcbiAgICB2YXIgX3JlZXN0YWJsaXNoID0gZmFsc2U7XG4gICAgdmFyIF9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICB2YXIgX3VuY29ubmVjdFRpbWUgPSAwO1xuICAgIHZhciBfaGFuZHNoYWtlTWVzc2FnZXMgPSAwO1xuICAgIHZhciBfY29uZmlnID0ge1xuICAgICAgICBwcm90b2NvbDogbnVsbCxcbiAgICAgICAgc3RpY2t5UmVjb25uZWN0OiB0cnVlLFxuICAgICAgICBjb25uZWN0VGltZW91dDogMCxcbiAgICAgICAgbWF4Q29ubmVjdGlvbnM6IDIsXG4gICAgICAgIGJhY2tvZmZJbmNyZW1lbnQ6IDEwMDAsXG4gICAgICAgIG1heEJhY2tvZmY6IDYwMDAwLFxuICAgICAgICBsb2dMZXZlbDogJ2luZm8nLFxuICAgICAgICByZXZlcnNlSW5jb21pbmdFeHRlbnNpb25zOiB0cnVlLFxuICAgICAgICBtYXhOZXR3b3JrRGVsYXk6IDEwMDAwLFxuICAgICAgICByZXF1ZXN0SGVhZGVyczoge30sXG4gICAgICAgIGFwcGVuZE1lc3NhZ2VUeXBlVG9VUkw6IHRydWUsXG4gICAgICAgIGF1dG9CYXRjaDogZmFsc2UsXG4gICAgICAgIHVybHM6IHt9LFxuICAgICAgICBtYXhVUklMZW5ndGg6IDIwMDAsXG4gICAgICAgIGFkdmljZToge1xuICAgICAgICAgICAgdGltZW91dDogNjAwMDAsXG4gICAgICAgICAgICBpbnRlcnZhbDogMCxcbiAgICAgICAgICAgIHJlY29ubmVjdDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgbWF4SW50ZXJ2YWw6IDBcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmllbGRWYWx1ZShvYmplY3QsIG5hbWUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3RbbmFtZV07XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNaXhlcyBpbiB0aGUgZ2l2ZW4gb2JqZWN0cyBpbnRvIHRoZSB0YXJnZXQgb2JqZWN0IGJ5IGNvcHlpbmcgdGhlIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIGRlZXAgaWYgdGhlIGNvcHkgbXVzdCBiZSBkZWVwXG4gICAgICogQHBhcmFtIHRhcmdldCB0aGUgdGFyZ2V0IG9iamVjdFxuICAgICAqIEBwYXJhbSBvYmplY3RzIHRoZSBvYmplY3RzIHdob3NlIHByb3BlcnRpZXMgYXJlIGNvcGllZCBpbnRvIHRoZSB0YXJnZXRcbiAgICAgKi9cbiAgICB0aGlzLl9taXhpbiA9IGZ1bmN0aW9uKGRlZXAsIHRhcmdldCwgb2JqZWN0cykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGFyZ2V0IHx8IHt9O1xuXG4gICAgICAgIC8vIFNraXAgZmlyc3QgMiBwYXJhbWV0ZXJzIChkZWVwIGFuZCB0YXJnZXQpLCBhbmQgbG9vcCBvdmVyIHRoZSBvdGhlcnNcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICAgIGlmIChvYmplY3QgPT09IHVuZGVmaW5lZCB8fCBvYmplY3QgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3AgPSBfZmllbGRWYWx1ZShvYmplY3QsIHByb3BOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmcgPSBfZmllbGRWYWx1ZShyZXN1bHQsIHByb3BOYW1lKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBBdm9pZCBpbmZpbml0ZSBsb29wc1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBEbyBub3QgbWl4aW4gdW5kZWZpbmVkIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkZWVwICYmIHR5cGVvZiBwcm9wID09PSAnb2JqZWN0JyAmJiBwcm9wICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvcCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BOYW1lXSA9IHRoaXMuX21peGluKGRlZXAsIHRhcmcgaW5zdGFuY2VvZiBBcnJheSA/IHRhcmcgOiBbXSwgcHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb3VyY2UgPSB0eXBlb2YgdGFyZyA9PT0gJ29iamVjdCcgJiYgISh0YXJnIGluc3RhbmNlb2YgQXJyYXkpID8gdGFyZyA6IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtwcm9wTmFtZV0gPSB0aGlzLl9taXhpbihkZWVwLCBzb3VyY2UsIHByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3BOYW1lXSA9IHByb3A7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaXNTdHJpbmcodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLmlzU3RyaW5nKHZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3plcm9QYWQodmFsdWUsIGxlbmd0aCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgICAgIHdoaWxlICgtLWxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSBNYXRoLnBvdygxMCwgbGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0ICs9ICcwJztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gdmFsdWU7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2xvZyhsZXZlbCwgYXJncykge1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBjb25zb2xlKSB7XG4gICAgICAgICAgICB2YXIgbG9nZ2VyID0gY29uc29sZVtsZXZlbF07XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24obG9nZ2VyKSkge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIFtdLnNwbGljZS5jYWxsKGFyZ3MsIDAsIDAsIF96ZXJvUGFkKG5vdy5nZXRIb3VycygpLCAyKSArICc6JyArIF96ZXJvUGFkKG5vdy5nZXRNaW51dGVzKCksIDIpICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgIF96ZXJvUGFkKG5vdy5nZXRTZWNvbmRzKCksIDIpICsgJy4nICsgX3plcm9QYWQobm93LmdldE1pbGxpc2Vjb25kcygpLCAzKSk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmFwcGx5KGNvbnNvbGUsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fd2FybiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfbG9nKCd3YXJuJywgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5faW5mbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2NvbmZpZy5sb2dMZXZlbCAhPT0gJ3dhcm4nKSB7XG4gICAgICAgICAgICBfbG9nKCdpbmZvJywgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX2NvbmZpZy5sb2dMZXZlbCA9PT0gJ2RlYnVnJykge1xuICAgICAgICAgICAgX2xvZygnZGVidWcnLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9zcGxpdFVSTCh1cmwpIHtcbiAgICAgICAgLy8gWzFdID0gcHJvdG9jb2w6Ly8sXG4gICAgICAgIC8vIFsyXSA9IGhvc3Q6cG9ydCxcbiAgICAgICAgLy8gWzNdID0gaG9zdCxcbiAgICAgICAgLy8gWzRdID0gSVB2Nl9ob3N0LFxuICAgICAgICAvLyBbNV0gPSBJUHY0X2hvc3QsXG4gICAgICAgIC8vIFs2XSA9IDpwb3J0LFxuICAgICAgICAvLyBbN10gPSBwb3J0LFxuICAgICAgICAvLyBbOF0gPSB1cmksXG4gICAgICAgIC8vIFs5XSA9IHJlc3QgKHF1ZXJ5IC8gZnJhZ21lbnQpXG4gICAgICAgIHJldHVybiAvKF5odHRwcz86XFwvXFwvKT8oKChcXFtbXlxcXV0rXFxdKXwoW146XFwvXFw/I10rKSkoOihcXGQrKSk/KT8oW15cXD8jXSopKC4qKT8vLmV4ZWModXJsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGdpdmVuIGhvc3RBbmRQb3J0IGlzIGNyb3NzIGRvbWFpbi5cbiAgICAgKiBUaGUgZGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBjaGVja3MgYWdhaW5zdCB3aW5kb3cubG9jYXRpb24uaG9zdFxuICAgICAqIGJ1dCB0aGlzIGZ1bmN0aW9uIGNhbiBiZSBvdmVycmlkZGVuIHRvIG1ha2UgaXQgd29yayBpbiBub24tYnJvd3NlclxuICAgICAqIGVudmlyb25tZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBob3N0QW5kUG9ydCB0aGUgaG9zdCBhbmQgcG9ydCBpbiBmb3JtYXQgaG9zdDpwb3J0XG4gICAgICogQHJldHVybiB3aGV0aGVyIHRoZSBnaXZlbiBob3N0QW5kUG9ydCBpcyBjcm9zcyBkb21haW5cbiAgICAgKi9cbiAgICB0aGlzLl9pc0Nyb3NzRG9tYWluID0gZnVuY3Rpb24oaG9zdEFuZFBvcnQpIHtcbiAgICAgICAgcmV0dXJuIGhvc3RBbmRQb3J0ICYmIGhvc3RBbmRQb3J0ICE9PSB3aW5kb3cubG9jYXRpb24uaG9zdDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbmZpZ3VyZShjb25maWd1cmF0aW9uKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdDb25maWd1cmluZyBjb21ldGQgb2JqZWN0IHdpdGgnLCBjb25maWd1cmF0aW9uKTtcbiAgICAgICAgLy8gU3VwcG9ydCBvbGQgc3R5bGUgcGFyYW0sIHdoZXJlIG9ubHkgdGhlIEJheWV1eCBzZXJ2ZXIgVVJMIHdhcyBwYXNzZWRcbiAgICAgICAgaWYgKF9pc1N0cmluZyhjb25maWd1cmF0aW9uKSkge1xuICAgICAgICAgICAgY29uZmlndXJhdGlvbiA9IHsgdXJsOiBjb25maWd1cmF0aW9uIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25maWd1cmF0aW9uKSB7XG4gICAgICAgICAgICBjb25maWd1cmF0aW9uID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBfY29uZmlnID0gX2NvbWV0ZC5fbWl4aW4oZmFsc2UsIF9jb25maWcsIGNvbmZpZ3VyYXRpb24pO1xuXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICBpZiAoIXVybCkge1xuICAgICAgICAgICAgdGhyb3cgJ01pc3NpbmcgcmVxdWlyZWQgY29uZmlndXJhdGlvbiBwYXJhbWV0ZXIgXFwndXJsXFwnIHNwZWNpZnlpbmcgdGhlIEJheWV1eCBzZXJ2ZXIgVVJMJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHdlJ3JlIGNyb3NzIGRvbWFpbi5cbiAgICAgICAgdmFyIHVybFBhcnRzID0gX3NwbGl0VVJMKHVybCk7XG4gICAgICAgIHZhciBob3N0QW5kUG9ydCA9IHVybFBhcnRzWzJdO1xuICAgICAgICB2YXIgdXJpID0gdXJsUGFydHNbOF07XG4gICAgICAgIHZhciBhZnRlclVSSSA9IHVybFBhcnRzWzldO1xuICAgICAgICBfY3Jvc3NEb21haW4gPSBfY29tZXRkLl9pc0Nyb3NzRG9tYWluKGhvc3RBbmRQb3J0KTtcblxuICAgICAgICAvLyBDaGVjayBpZiBhcHBlbmRpbmcgZXh0cmEgcGF0aCBpcyBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCkge1xuICAgICAgICAgICAgaWYgKGFmdGVyVVJJICE9PSB1bmRlZmluZWQgJiYgYWZ0ZXJVUkkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0FwcGVuZGluZyBtZXNzYWdlIHR5cGUgdG8gVVJJICcgKyB1cmkgKyBhZnRlclVSSSArICcgaXMgbm90IHN1cHBvcnRlZCwgZGlzYWJsaW5nIFxcJ2FwcGVuZE1lc3NhZ2VUeXBlVG9VUkxcXCcgY29uZmlndXJhdGlvbicpO1xuICAgICAgICAgICAgICAgIF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJpU2VnbWVudHMgPSB1cmkuc3BsaXQoJy8nKTtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFNlZ21lbnRJbmRleCA9IHVyaVNlZ21lbnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHVyaS5tYXRjaCgvXFwvJC8pKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50SW5kZXggLT0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVyaVNlZ21lbnRzW2xhc3RTZWdtZW50SW5kZXhdLmluZGV4T2YoJy4nKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFZlcnkgbGlrZWx5IHRoZSBDb21ldEQgc2VydmxldCdzIFVSTCBwYXR0ZXJuIGlzIG1hcHBlZCB0byBhbiBleHRlbnNpb24sIHN1Y2ggYXMgKi5jb21ldGRcbiAgICAgICAgICAgICAgICAgICAgLy8gSXQgd2lsbCBiZSBkaWZmaWN1bHQgdG8gYWRkIHRoZSBleHRyYSBwYXRoIGluIHRoaXMgY2FzZVxuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdBcHBlbmRpbmcgbWVzc2FnZSB0eXBlIHRvIFVSSSAnICsgdXJpICsgJyBpcyBub3Qgc3VwcG9ydGVkLCBkaXNhYmxpbmcgXFwnYXBwZW5kTWVzc2FnZVR5cGVUb1VSTFxcJyBjb25maWd1cmF0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW3N1YnNjcmlwdGlvbi5jaGFubmVsXTtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zICYmIHN1YnNjcmlwdGlvbnNbc3Vic2NyaXB0aW9uLmlkXSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzdWJzY3JpcHRpb25zW3N1YnNjcmlwdGlvbi5pZF07XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlbW92ZWQnLCBzdWJzY3JpcHRpb24ubGlzdGVuZXIgPyAnbGlzdGVuZXInIDogJ3N1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9uICYmICFzdWJzY3JpcHRpb24ubGlzdGVuZXIpIHtcbiAgICAgICAgICAgIF9yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2NsZWFyU3Vic2NyaXB0aW9ucygpIHtcbiAgICAgICAgZm9yICh2YXIgY2hhbm5lbCBpbiBfbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAoX2xpc3RlbmVycy5oYXNPd25Qcm9wZXJ0eShjaGFubmVsKSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1tjaGFubmVsXTtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZW1vdmVTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc2V0U3RhdHVzKG5ld1N0YXR1cykge1xuICAgICAgICBpZiAoX3N0YXR1cyAhPT0gbmV3U3RhdHVzKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU3RhdHVzJywgX3N0YXR1cywgJy0+JywgbmV3U3RhdHVzKTtcbiAgICAgICAgICAgIF9zdGF0dXMgPSBuZXdTdGF0dXM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaXNEaXNjb25uZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiBfc3RhdHVzID09PSAnZGlzY29ubmVjdGluZycgfHwgX3N0YXR1cyA9PT0gJ2Rpc2Nvbm5lY3RlZCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25leHRNZXNzYWdlSWQoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSArK19tZXNzYWdlSWQ7XG4gICAgICAgIHJldHVybiAnJyArIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFeHRlbnNpb24oc2NvcGUsIGNhbGxiYWNrLCBuYW1lLCBtZXNzYWdlLCBvdXRnb2luZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoc2NvcGUsIG1lc3NhZ2UpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25FeHRlbnNpb25FeGNlcHRpb247XG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnSW52b2tpbmcgZXh0ZW5zaW9uIGV4Y2VwdGlvbiBoYW5kbGVyJywgbmFtZSwgeCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIHgsIG5hbWUsIG91dGdvaW5nLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoICh4eCkge1xuICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBleHRlbnNpb24gZXhjZXB0aW9uIGhhbmRsZXInLCBuYW1lLCB4eCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBleHRlbnNpb24nLCBuYW1lLCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FwcGx5SW5jb21pbmdFeHRlbnNpb25zKG1lc3NhZ2UpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfZXh0ZW5zaW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgPT09IHVuZGVmaW5lZCB8fCBtZXNzYWdlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBpbmRleCA9IF9jb25maWcucmV2ZXJzZUluY29taW5nRXh0ZW5zaW9ucyA/IF9leHRlbnNpb25zLmxlbmd0aCAtIDEgLSBpIDogaTtcbiAgICAgICAgICAgIHZhciBleHRlbnNpb24gPSBfZXh0ZW5zaW9uc1tpbmRleF07XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBleHRlbnNpb24uZXh0ZW5zaW9uLmluY29taW5nO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBfYXBwbHlFeHRlbnNpb24oZXh0ZW5zaW9uLmV4dGVuc2lvbiwgY2FsbGJhY2ssIGV4dGVuc2lvbi5uYW1lLCBtZXNzYWdlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gbWVzc2FnZSA6IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXBwbHlPdXRnb2luZ0V4dGVuc2lvbnMobWVzc2FnZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZXh0ZW5zaW9uLmV4dGVuc2lvbi5vdXRnb2luZztcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gX2FwcGx5RXh0ZW5zaW9uKGV4dGVuc2lvbi5leHRlbnNpb24sIGNhbGxiYWNrLCBleHRlbnNpb24ubmFtZSwgbWVzc2FnZSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gbWVzc2FnZSA6IHJlc3VsdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5KGNoYW5uZWwsIG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbnMgPSBfbGlzdGVuZXJzW2NoYW5uZWxdO1xuICAgICAgICBpZiAoc3Vic2NyaXB0aW9ucyAmJiBzdWJzY3JpcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaXB0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIC8vIFN1YnNjcmlwdGlvbnMgbWF5IGNvbWUgYW5kIGdvLCBzbyB0aGUgYXJyYXkgbWF5IGhhdmUgJ2hvbGVzJ1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi5jYWxsYmFjay5jYWxsKHN1YnNjcmlwdGlvbi5zY29wZSwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vbkxpc3RlbmVyRXhjZXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIGxpc3RlbmVyIGV4Y2VwdGlvbiBoYW5kbGVyJywgc3Vic2NyaXB0aW9uLCB4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoX2NvbWV0ZCwgeCwgc3Vic2NyaXB0aW9uLCBzdWJzY3JpcHRpb24ubGlzdGVuZXIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGxpc3RlbmVyIGV4Y2VwdGlvbiBoYW5kbGVyJywgc3Vic2NyaXB0aW9uLCB4eCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBsaXN0ZW5lcicsIHN1YnNjcmlwdGlvbiwgbWVzc2FnZSwgeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5TGlzdGVuZXJzKGNoYW5uZWwsIG1lc3NhZ2UpIHtcbiAgICAgICAgLy8gTm90aWZ5IGRpcmVjdCBsaXN0ZW5lcnNcbiAgICAgICAgX25vdGlmeShjaGFubmVsLCBtZXNzYWdlKTtcblxuICAgICAgICAvLyBOb3RpZnkgdGhlIGdsb2JiaW5nIGxpc3RlbmVyc1xuICAgICAgICB2YXIgY2hhbm5lbFBhcnRzID0gY2hhbm5lbC5zcGxpdCgnLycpO1xuICAgICAgICB2YXIgbGFzdCA9IGNoYW5uZWxQYXJ0cy5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKHZhciBpID0gbGFzdDsgaSA+IDA7IC0taSkge1xuICAgICAgICAgICAgdmFyIGNoYW5uZWxQYXJ0ID0gY2hhbm5lbFBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJy8nKSArICcvKic7XG4gICAgICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIG5vdGlmeSAvZm9vLyogaWYgdGhlIGNoYW5uZWwgaXMgL2Zvby9iYXIvYmF6LFxuICAgICAgICAgICAgLy8gc28gd2Ugc3RvcCBhdCB0aGUgZmlyc3Qgbm9uIHJlY3Vyc2l2ZSBnbG9iYmluZ1xuICAgICAgICAgICAgaWYgKGkgPT09IGxhc3QpIHtcbiAgICAgICAgICAgICAgICBfbm90aWZ5KGNoYW5uZWxQYXJ0LCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEFkZCB0aGUgcmVjdXJzaXZlIGdsb2JiZXIgYW5kIG5vdGlmeVxuICAgICAgICAgICAgY2hhbm5lbFBhcnQgKz0gJyonO1xuICAgICAgICAgICAgX25vdGlmeShjaGFubmVsUGFydCwgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY2FuY2VsRGVsYXllZFNlbmQoKSB7XG4gICAgICAgIGlmIChfc2NoZWR1bGVkU2VuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KF9zY2hlZHVsZWRTZW5kKTtcbiAgICAgICAgfVxuICAgICAgICBfc2NoZWR1bGVkU2VuZCA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2RlbGF5ZWRTZW5kKG9wZXJhdGlvbiwgZGVsYXkpIHtcbiAgICAgICAgX2NhbmNlbERlbGF5ZWRTZW5kKCk7XG4gICAgICAgIHZhciB0aW1lID0gX2FkdmljZS5pbnRlcnZhbCArIGRlbGF5O1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnRnVuY3Rpb24gc2NoZWR1bGVkIGluJywgdGltZSwgJ21zLCBpbnRlcnZhbCA9JywgX2FkdmljZS5pbnRlcnZhbCwgJ2JhY2tvZmYgPScsIF9iYWNrb2ZmLCBvcGVyYXRpb24pO1xuICAgICAgICBfc2NoZWR1bGVkU2VuZCA9IFV0aWxzLnNldFRpbWVvdXQoX2NvbWV0ZCwgb3BlcmF0aW9uLCB0aW1lKTtcbiAgICB9XG5cbiAgICAvLyBOZWVkZWQgdG8gYnJlYWsgY3ljbGljIGRlcGVuZGVuY2llcyBiZXR3ZWVuIGZ1bmN0aW9uIGRlZmluaXRpb25zXG4gICAgdmFyIF9oYW5kbGVNZXNzYWdlcztcbiAgICB2YXIgX2hhbmRsZUZhaWx1cmU7XG5cbiAgICAvKipcbiAgICAgKiBEZWxpdmVycyB0aGUgbWVzc2FnZXMgdG8gdGhlIENvbWV0RCBzZXJ2ZXJcbiAgICAgKiBAcGFyYW0gc3luYyB3aGV0aGVyIHRoZSBzZW5kIGlzIHN5bmNocm9ub3VzXG4gICAgICogQHBhcmFtIG1lc3NhZ2VzIHRoZSBhcnJheSBvZiBtZXNzYWdlcyB0byBzZW5kXG4gICAgICogQHBhcmFtIG1ldGFDb25uZWN0IHRydWUgaWYgdGhpcyBzZW5kIGlzIG9uIC9tZXRhL2Nvbm5lY3RcbiAgICAgKiBAcGFyYW0gZXh0cmFQYXRoIGFuIGV4dHJhIHBhdGggdG8gYXBwZW5kIHRvIHRoZSBCYXlldXggc2VydmVyIFVSTFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9zZW5kKHN5bmMsIG1lc3NhZ2VzLCBtZXRhQ29ubmVjdCwgZXh0cmFQYXRoKSB7XG4gICAgICAgIC8vIFdlIG11c3QgYmUgc3VyZSB0aGF0IHRoZSBtZXNzYWdlcyBoYXZlIGEgY2xpZW50SWQuXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IGd1YXJhbnRlZWQgc2luY2UgdGhlIGhhbmRzaGFrZSBtYXkgdGFrZSB0aW1lIHRvIHJldHVyblxuICAgICAgICAvLyAoYW5kIGhlbmNlIHRoZSBjbGllbnRJZCBpcyBub3Qga25vd24geWV0KSBhbmQgdGhlIGFwcGxpY2F0aW9uXG4gICAgICAgIC8vIG1heSBjcmVhdGUgb3RoZXIgbWVzc2FnZXMuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICB2YXIgbWVzc2FnZUlkID0gbWVzc2FnZS5pZDtcblxuICAgICAgICAgICAgaWYgKF9jbGllbnRJZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UuY2xpZW50SWQgPSBfY2xpZW50SWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfYXBwbHlPdXRnb2luZ0V4dGVuc2lvbnMobWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkICYmIG1lc3NhZ2UgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBFeHRlbnNpb25zIG1heSBoYXZlIG1vZGlmaWVkIHRoZSBtZXNzYWdlIGlkLCBidXQgd2UgbmVlZCB0byBvd24gaXQuXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5pZCA9IG1lc3NhZ2VJZDtcbiAgICAgICAgICAgICAgICBtZXNzYWdlc1tpXSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfY2FsbGJhY2tzW21lc3NhZ2VJZF07XG4gICAgICAgICAgICAgICAgbWVzc2FnZXMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVzc2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXJsID0gX2NvbWV0ZC5nZXRVUkwoKTtcbiAgICAgICAgaWYgKF9jb25maWcuYXBwZW5kTWVzc2FnZVR5cGVUb1VSTCkge1xuICAgICAgICAgICAgLy8gSWYgdXJsIGRvZXMgbm90IGVuZCB3aXRoICcvJywgdGhlbiBhcHBlbmQgaXRcbiAgICAgICAgICAgIGlmICghdXJsLm1hdGNoKC9cXC8kLykpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSB1cmwgKyAnLyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXh0cmFQYXRoKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gdXJsICsgZXh0cmFQYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVudmVsb3BlID0ge1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBzeW5jOiBzeW5jLFxuICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzLFxuICAgICAgICAgICAgb25TdWNjZXNzOiBmdW5jdGlvbihyY3ZkTWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBfaGFuZGxlTWVzc2FnZXMuY2FsbChfY29tZXRkLCByY3ZkTWVzc2FnZXMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBoYW5kbGluZyBvZiBtZXNzYWdlcycsIHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbkZhaWx1cmU6IGZ1bmN0aW9uKGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF9jb21ldGQuZ2V0VHJhbnNwb3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuY29ubmVjdGlvblR5cGUgPSB0cmFuc3BvcnQgPyB0cmFuc3BvcnQuZ2V0VHlwZSgpIDogXCJ1bmtub3duXCI7XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kbGVGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBoYW5kbGluZyBvZiBmYWlsdXJlJywgeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnU2VuZCcsIGVudmVsb3BlKTtcbiAgICAgICAgX3RyYW5zcG9ydC5zZW5kKGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3F1ZXVlU2VuZChtZXNzYWdlKSB7XG4gICAgICAgIGlmIChfYmF0Y2ggPiAwIHx8IF9pbnRlcm5hbEJhdGNoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfbWVzc2FnZVF1ZXVlLnB1c2gobWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfc2VuZChmYWxzZSwgW21lc3NhZ2VdLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhIGNvbXBsZXRlIGJheWV1eCBtZXNzYWdlLlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGV4cG9zZWQgYXMgYSBwdWJsaWMgc28gdGhhdCBleHRlbnNpb25zIG1heSB1c2UgaXRcbiAgICAgKiB0byBzZW5kIGJheWV1eCBtZXNzYWdlIGRpcmVjdGx5LCBmb3IgZXhhbXBsZSBpbiBjYXNlIG9mIHJlLXNlbmRpbmdcbiAgICAgKiBtZXNzYWdlcyB0aGF0IGhhdmUgYWxyZWFkeSBiZWVuIHNlbnQgYnV0IHRoYXQgZm9yIHNvbWUgcmVhc29uIG11c3RcbiAgICAgKiBiZSByZXNlbnQuXG4gICAgICovXG4gICAgdGhpcy5zZW5kID0gX3F1ZXVlU2VuZDtcblxuICAgIGZ1bmN0aW9uIF9yZXNldEJhY2tvZmYoKSB7XG4gICAgICAgIF9iYWNrb2ZmID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5jcmVhc2VCYWNrb2ZmKCkge1xuICAgICAgICBpZiAoX2JhY2tvZmYgPCBfY29uZmlnLm1heEJhY2tvZmYpIHtcbiAgICAgICAgICAgIF9iYWNrb2ZmICs9IF9jb25maWcuYmFja29mZkluY3JlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2JhY2tvZmY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGEgdGhlIGJhdGNoIG9mIG1lc3NhZ2VzIHRvIGJlIHNlbnQgaW4gYSBzaW5nbGUgcmVxdWVzdC5cbiAgICAgKiBAc2VlICNfZW5kQmF0Y2goc2VuZE1lc3NhZ2VzKVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9zdGFydEJhdGNoKCkge1xuICAgICAgICArK19iYXRjaDtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1N0YXJ0aW5nIGJhdGNoLCBkZXB0aCcsIF9iYXRjaCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZsdXNoQmF0Y2goKSB7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IF9tZXNzYWdlUXVldWU7XG4gICAgICAgIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIF9zZW5kKGZhbHNlLCBtZXNzYWdlcywgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW5kcyB0aGUgYmF0Y2ggb2YgbWVzc2FnZXMgdG8gYmUgc2VudCBpbiBhIHNpbmdsZSByZXF1ZXN0LFxuICAgICAqIG9wdGlvbmFsbHkgc2VuZGluZyBtZXNzYWdlcyBwcmVzZW50IGluIHRoZSBtZXNzYWdlIHF1ZXVlIGRlcGVuZGluZ1xuICAgICAqIG9uIHRoZSBnaXZlbiBhcmd1bWVudC5cbiAgICAgKiBAc2VlICNfc3RhcnRCYXRjaCgpXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2VuZEJhdGNoKCkge1xuICAgICAgICAtLV9iYXRjaDtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0VuZGluZyBiYXRjaCwgZGVwdGgnLCBfYmF0Y2gpO1xuICAgICAgICBpZiAoX2JhdGNoIDwgMCkge1xuICAgICAgICAgICAgdGhyb3cgJ0NhbGxzIHRvIHN0YXJ0QmF0Y2goKSBhbmQgZW5kQmF0Y2goKSBhcmUgbm90IHBhaXJlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2JhdGNoID09PSAwICYmICFfaXNEaXNjb25uZWN0ZWQoKSAmJiAhX2ludGVybmFsQmF0Y2gpIHtcbiAgICAgICAgICAgIF9mbHVzaEJhdGNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyB0aGUgY29ubmVjdCBtZXNzYWdlXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3QoKSB7XG4gICAgICAgIGlmICghX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGlkOiBfbmV4dE1lc3NhZ2VJZCgpLFxuICAgICAgICAgICAgICAgIGNoYW5uZWw6ICcvbWV0YS9jb25uZWN0JyxcbiAgICAgICAgICAgICAgICBjb25uZWN0aW9uVHlwZTogX3RyYW5zcG9ydC5nZXRUeXBlKClcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEluIGNhc2Ugb2YgcmVsb2FkIG9yIHRlbXBvcmFyeSBsb3NzIG9mIGNvbm5lY3Rpb25cbiAgICAgICAgICAgIC8vIHdlIHdhbnQgdGhlIG5leHQgc3VjY2Vzc2Z1bCBjb25uZWN0IHRvIHJldHVybiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgLy8gaW5zdGVhZCBvZiBiZWluZyBoZWxkIGJ5IHRoZSBzZXJ2ZXIsIHNvIHRoYXQgY29ubmVjdCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIC8vIGNhbiBiZSBub3RpZmllZCB0aGF0IHRoZSBjb25uZWN0aW9uIGhhcyBiZWVuIHJlLWVzdGFibGlzaGVkXG4gICAgICAgICAgICBpZiAoIV9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBiYXlldXhNZXNzYWdlLmFkdmljZSA9IHsgdGltZW91dDogMCB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfc2V0U3RhdHVzKCdjb25uZWN0aW5nJyk7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQ29ubmVjdCBzZW50JywgYmF5ZXV4TWVzc2FnZSk7XG4gICAgICAgICAgICBfc2VuZChmYWxzZSwgW2JheWV1eE1lc3NhZ2VdLCB0cnVlLCAnY29ubmVjdCcpO1xuICAgICAgICAgICAgX3NldFN0YXR1cygnY29ubmVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZGVsYXllZENvbm5lY3QoZGVsYXkpIHtcbiAgICAgICAgX3NldFN0YXR1cygnY29ubmVjdGluZycpO1xuICAgICAgICBfZGVsYXllZFNlbmQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfY29ubmVjdCgpO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3VwZGF0ZUFkdmljZShuZXdBZHZpY2UpIHtcbiAgICAgICAgaWYgKG5ld0FkdmljZSkge1xuICAgICAgICAgICAgX2FkdmljZSA9IF9jb21ldGQuX21peGluKGZhbHNlLCB7fSwgX2NvbmZpZy5hZHZpY2UsIG5ld0FkdmljZSk7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnTmV3IGFkdmljZScsIF9hZHZpY2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc2Nvbm5lY3QoYWJvcnQpIHtcbiAgICAgICAgX2NhbmNlbERlbGF5ZWRTZW5kKCk7XG4gICAgICAgIGlmIChhYm9ydCAmJiBfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0LmFib3J0KCk7XG4gICAgICAgIH1cbiAgICAgICAgX2NsaWVudElkID0gbnVsbDtcbiAgICAgICAgX3NldFN0YXR1cygnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIF9iYXRjaCA9IDA7XG4gICAgICAgIF9yZXNldEJhY2tvZmYoKTtcbiAgICAgICAgX3RyYW5zcG9ydCA9IG51bGw7XG5cbiAgICAgICAgLy8gRmFpbCBhbnkgZXhpc3RpbmcgcXVldWVkIG1lc3NhZ2VcbiAgICAgICAgaWYgKF9tZXNzYWdlUXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gX21lc3NhZ2VRdWV1ZTtcbiAgICAgICAgICAgIF9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICAgICAgICAgIF9oYW5kbGVGYWlsdXJlLmNhbGwoX2NvbWV0ZCwgdW5kZWZpbmVkLCBtZXNzYWdlcywge1xuICAgICAgICAgICAgICAgIHJlYXNvbjogJ0Rpc2Nvbm5lY3RlZCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihvbGRUcmFuc3BvcnQsIG5ld1RyYW5zcG9ydCwgZmFpbHVyZSkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IF9jb21ldGQub25UcmFuc3BvcnRFeGNlcHRpb247XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIHRyYW5zcG9ydCBleGNlcHRpb24gaGFuZGxlcicsIG9sZFRyYW5zcG9ydCwgbmV3VHJhbnNwb3J0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIGZhaWx1cmUsIG9sZFRyYW5zcG9ydCwgbmV3VHJhbnNwb3J0KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiB0cmFuc3BvcnQgZXhjZXB0aW9uIGhhbmRsZXInLCB4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIHRoZSBpbml0aWFsIGhhbmRzaGFrZSBtZXNzYWdlXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2hhbmRzaGFrZShoYW5kc2hha2VQcm9wcywgaGFuZHNoYWtlQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRzaGFrZVByb3BzKSkge1xuICAgICAgICAgICAgaGFuZHNoYWtlQ2FsbGJhY2sgPSBoYW5kc2hha2VQcm9wcztcbiAgICAgICAgICAgIGhhbmRzaGFrZVByb3BzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NsaWVudElkID0gbnVsbDtcblxuICAgICAgICBfY2xlYXJTdWJzY3JpcHRpb25zKCk7XG5cbiAgICAgICAgLy8gUmVzZXQgdGhlIHRyYW5zcG9ydHMgaWYgd2UncmUgbm90IHJldHJ5aW5nIHRoZSBoYW5kc2hha2VcbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0cy5yZXNldCh0cnVlKTtcbiAgICAgICAgICAgIF91cGRhdGVBZHZpY2UoX2NvbmZpZy5hZHZpY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgX2JhdGNoID0gMDtcblxuICAgICAgICAvLyBNYXJrIHRoZSBzdGFydCBvZiBhbiBpbnRlcm5hbCBiYXRjaC5cbiAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZSBoYW5kc2hha2UgYW5kIGNvbm5lY3QgYXJlIGFzeW5jLlxuICAgICAgICAvLyBJdCBtYXkgaGFwcGVuIHRoYXQgdGhlIGFwcGxpY2F0aW9uIGNhbGxzIGluaXQoKSB0aGVuIHN1YnNjcmliZSgpXG4gICAgICAgIC8vIGFuZCB0aGUgc3Vic2NyaWJlIG1lc3NhZ2UgaXMgc2VudCBiZWZvcmUgdGhlIGNvbm5lY3QgbWVzc2FnZSwgaWZcbiAgICAgICAgLy8gdGhlIHN1YnNjcmliZSBtZXNzYWdlIGlzIG5vdCBoZWxkIHVudGlsIHRoZSBjb25uZWN0IG1lc3NhZ2UgaXMgc2VudC5cbiAgICAgICAgLy8gU28gaGVyZSB3ZSBzdGFydCBhIGJhdGNoIHRvIGhvbGQgdGVtcG9yYXJpbHkgYW55IG1lc3NhZ2UgdW50aWxcbiAgICAgICAgLy8gdGhlIGNvbm5lY3Rpb24gaXMgZnVsbHkgZXN0YWJsaXNoZWQuXG4gICAgICAgIF9pbnRlcm5hbEJhdGNoID0gdHJ1ZTtcblxuICAgICAgICAvLyBTYXZlIHRoZSBwcm9wZXJ0aWVzIHByb3ZpZGVkIGJ5IHRoZSB1c2VyLCBzbyB0aGF0XG4gICAgICAgIC8vIHdlIGNhbiByZXVzZSB0aGVtIGR1cmluZyBhdXRvbWF0aWMgcmUtaGFuZHNoYWtlXG4gICAgICAgIF9oYW5kc2hha2VQcm9wcyA9IGhhbmRzaGFrZVByb3BzO1xuICAgICAgICBfaGFuZHNoYWtlQ2FsbGJhY2sgPSBoYW5kc2hha2VDYWxsYmFjaztcblxuICAgICAgICB2YXIgdmVyc2lvbiA9ICcxLjAnO1xuXG4gICAgICAgIC8vIEZpZ3VyZSBvdXQgdGhlIHRyYW5zcG9ydHMgdG8gc2VuZCB0byB0aGUgc2VydmVyXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICB2YXIgdHJhbnNwb3J0VHlwZXMgPSBfdHJhbnNwb3J0cy5maW5kVHJhbnNwb3J0VHlwZXModmVyc2lvbiwgX2Nyb3NzRG9tYWluLCB1cmwpO1xuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgbWluaW11bVZlcnNpb246IHZlcnNpb24sXG4gICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvaGFuZHNoYWtlJyxcbiAgICAgICAgICAgIHN1cHBvcnRlZENvbm5lY3Rpb25UeXBlczogdHJhbnNwb3J0VHlwZXMsXG4gICAgICAgICAgICBhZHZpY2U6IHtcbiAgICAgICAgICAgICAgICB0aW1lb3V0OiBfYWR2aWNlLnRpbWVvdXQsXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWw6IF9hZHZpY2UuaW50ZXJ2YWxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgIHZhciBtZXNzYWdlID0gX2NvbWV0ZC5fbWl4aW4oZmFsc2UsIHt9LCBfaGFuZHNoYWtlUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBoYW5kc2hha2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gUGljayB1cCB0aGUgZmlyc3QgYXZhaWxhYmxlIHRyYW5zcG9ydCBhcyBpbml0aWFsIHRyYW5zcG9ydFxuICAgICAgICAvLyBzaW5jZSB3ZSBkb24ndCBrbm93IGlmIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgaXRcbiAgICAgICAgaWYgKCFfdHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHMubmVnb3RpYXRlVHJhbnNwb3J0KHRyYW5zcG9ydFR5cGVzLCB2ZXJzaW9uLCBfY3Jvc3NEb21haW4sIHVybCk7XG4gICAgICAgICAgICBpZiAoIV90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9ICdDb3VsZCBub3QgZmluZCBpbml0aWFsIHRyYW5zcG9ydCBhbW9uZzogJyArIF90cmFuc3BvcnRzLmdldFRyYW5zcG9ydFR5cGVzKCk7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fd2FybihmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBmYWlsdXJlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0luaXRpYWwgdHJhbnNwb3J0IGlzJywgX3RyYW5zcG9ydC5nZXRUeXBlKCkpO1xuXG4gICAgICAgIC8vIFdlIHN0YXJ0ZWQgYSBiYXRjaCB0byBob2xkIHRoZSBhcHBsaWNhdGlvbiBtZXNzYWdlcyxcbiAgICAgICAgLy8gc28gaGVyZSB3ZSBtdXN0IGJ5cGFzcyBpdCBhbmQgc2VuZCBpbW1lZGlhdGVseS5cbiAgICAgICAgX3NldFN0YXR1cygnaGFuZHNoYWtpbmcnKTtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0hhbmRzaGFrZSBzZW50JywgbWVzc2FnZSk7XG4gICAgICAgIF9zZW5kKGZhbHNlLCBbbWVzc2FnZV0sIGZhbHNlLCAnaGFuZHNoYWtlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2RlbGF5ZWRIYW5kc2hha2UoZGVsYXkpIHtcbiAgICAgICAgX3NldFN0YXR1cygnaGFuZHNoYWtpbmcnKTtcblxuICAgICAgICAvLyBXZSB3aWxsIGNhbGwgX2hhbmRzaGFrZSgpIHdoaWNoIHdpbGwgcmVzZXQgX2NsaWVudElkLCBidXQgd2Ugd2FudCB0byBhdm9pZFxuICAgICAgICAvLyB0aGF0IGJldHdlZW4gdGhlIGVuZCBvZiB0aGlzIG1ldGhvZCBhbmQgdGhlIGNhbGwgdG8gX2hhbmRzaGFrZSgpIHNvbWVvbmUgbWF5XG4gICAgICAgIC8vIGNhbGwgcHVibGlzaCgpIChvciBvdGhlciBtZXRob2RzIHRoYXQgY2FsbCBfcXVldWVTZW5kKCkpLlxuICAgICAgICBfaW50ZXJuYWxCYXRjaCA9IHRydWU7XG5cbiAgICAgICAgX2RlbGF5ZWRTZW5kKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX2hhbmRzaGFrZShfaGFuZHNoYWtlUHJvcHMsIF9oYW5kc2hha2VDYWxsYmFjayk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbm90aWZ5Q2FsbGJhY2soY2FsbGJhY2ssIG1lc3NhZ2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoX2NvbWV0ZCwgbWVzc2FnZSk7XG4gICAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gX2NvbWV0ZC5vbkNhbGxiYWNrRXhjZXB0aW9uO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0ludm9raW5nIGNhbGxiYWNrIGV4Y2VwdGlvbiBoYW5kbGVyJywgeCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsKF9jb21ldGQsIHgsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKHh4KSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb21ldGQuX2luZm8oJ0V4Y2VwdGlvbiBkdXJpbmcgZXhlY3V0aW9uIG9mIGNhbGxiYWNrIGV4Y2VwdGlvbiBoYW5kbGVyJywgeHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5faW5mbygnRXhjZXB0aW9uIGR1cmluZyBleGVjdXRpb24gb2YgbWVzc2FnZSBjYWxsYmFjaycsIHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZ2V0Q2FsbGJhY2sgPSBmdW5jdGlvbihtZXNzYWdlSWQpIHtcbiAgICAgICAgcmV0dXJuIF9jYWxsYmFja3NbbWVzc2FnZUlkXTtcbiAgICB9O1xuXG4gICAgdGhpcy5fcHV0Q2FsbGJhY2sgPSBmdW5jdGlvbihtZXNzYWdlSWQsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9nZXRDYWxsYmFjayhtZXNzYWdlSWQpO1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICBfY2FsbGJhY2tzW21lc3NhZ2VJZF0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBfY29tZXRkLl9nZXRDYWxsYmFjayhbbWVzc2FnZS5pZF0pO1xuICAgICAgICBpZiAoX2lzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICBkZWxldGUgX2NhbGxiYWNrc1ttZXNzYWdlLmlkXTtcbiAgICAgICAgICAgIF9ub3RpZnlDYWxsYmFjayhjYWxsYmFjaywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaGFuZGxlUmVtb3RlQ2FsbChtZXNzYWdlKSB7XG4gICAgICAgIHZhciBjb250ZXh0ID0gX3JlbW90ZUNhbGxzW21lc3NhZ2UuaWRdO1xuICAgICAgICBkZWxldGUgX3JlbW90ZUNhbGxzW21lc3NhZ2UuaWRdO1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ0hhbmRsaW5nIHJlbW90ZSBjYWxsIHJlc3BvbnNlIGZvcicsIG1lc3NhZ2UsICd3aXRoIGNvbnRleHQnLCBjb250ZXh0KTtcblxuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHRpbWVvdXQsIGlmIHByZXNlbnQuXG4gICAgICAgICAgICB2YXIgdGltZW91dCA9IGNvbnRleHQudGltZW91dDtcbiAgICAgICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBjb250ZXh0LmNhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIF9ub3RpZnlDYWxsYmFjayhjYWxsYmFjaywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMub25UcmFuc3BvcnRGYWlsdXJlID0gZnVuY3Rpb24obWVzc2FnZSwgZmFpbHVyZUluZm8sIGZhaWx1cmVIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQgZmFpbHVyZScsIGZhaWx1cmVJbmZvLCAnZm9yJywgbWVzc2FnZSk7XG5cbiAgICAgICAgdmFyIHRyYW5zcG9ydHMgPSB0aGlzLmdldFRyYW5zcG9ydFJlZ2lzdHJ5KCk7XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLmdldFVSTCgpO1xuICAgICAgICB2YXIgY3Jvc3NEb21haW4gPSB0aGlzLl9pc0Nyb3NzRG9tYWluKF9zcGxpdFVSTCh1cmwpWzJdKTtcbiAgICAgICAgdmFyIHZlcnNpb24gPSAnMS4wJztcbiAgICAgICAgdmFyIHRyYW5zcG9ydFR5cGVzID0gdHJhbnNwb3J0cy5maW5kVHJhbnNwb3J0VHlwZXModmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCk7XG5cbiAgICAgICAgaWYgKGZhaWx1cmVJbmZvLmFjdGlvbiA9PT0gJ25vbmUnKSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvaGFuZHNoYWtlJykge1xuICAgICAgICAgICAgICAgIGlmICghZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0gJ0NvdWxkIG5vdCBuZWdvdGlhdGUgdHJhbnNwb3J0LCBjbGllbnQ9WycgKyB0cmFuc3BvcnRUeXBlcyArICddLCBzZXJ2ZXI9WycgKyBtZXNzYWdlLnN1cHBvcnRlZENvbm5lY3Rpb25UeXBlcyArICddJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2FybihmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgX25vdGlmeVRyYW5zcG9ydEV4Y2VwdGlvbihfdHJhbnNwb3J0LmdldFR5cGUoKSwgbnVsbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiBmYWlsdXJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvblR5cGU6IF90cmFuc3BvcnQuZ2V0VHlwZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0OiBfdHJhbnNwb3J0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZhaWx1cmVJbmZvLmRlbGF5ID0gdGhpcy5nZXRCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAvLyBEaWZmZXJlbnQgbG9naWMgZGVwZW5kaW5nIG9uIHdoZXRoZXIgd2UgYXJlIGhhbmRzaGFraW5nIG9yIGNvbm5lY3RpbmcuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsID09PSAnL21ldGEvaGFuZHNoYWtlJykge1xuICAgICAgICAgICAgICAgIGlmICghZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0cmFuc3BvcnQgaXMgaW52YWxpZCwgdHJ5IHRvIG5lZ290aWF0ZSBhZ2Fpbi5cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1RyYW5zcG9ydCA9IHRyYW5zcG9ydHMubmVnb3RpYXRlVHJhbnNwb3J0KHRyYW5zcG9ydFR5cGVzLCB2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFuZXdUcmFuc3BvcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3dhcm4oJ0NvdWxkIG5vdCBuZWdvdGlhdGUgdHJhbnNwb3J0LCBjbGllbnQ9WycgKyB0cmFuc3BvcnRUeXBlcyArICddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfbm90aWZ5VHJhbnNwb3J0RXhjZXB0aW9uKF90cmFuc3BvcnQuZ2V0VHlwZSgpLCBudWxsLCBtZXNzYWdlLmZhaWx1cmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIF90cmFuc3BvcnQuZ2V0VHlwZSgpLCAnLT4nLCBuZXdUcmFuc3BvcnQuZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9ub3RpZnlUcmFuc3BvcnRFeGNlcHRpb24oX3RyYW5zcG9ydC5nZXRUeXBlKCksIG5ld1RyYW5zcG9ydC5nZXRUeXBlKCksIG1lc3NhZ2UuZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnaGFuZHNoYWtlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLnRyYW5zcG9ydCA9IG5ld1RyYW5zcG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF91bmNvbm5lY3RUaW1lID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIF91bmNvbm5lY3RUaW1lID0gbm93O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gPT09ICdyZXRyeScpIHtcbiAgICAgICAgICAgICAgICAgICAgZmFpbHVyZUluZm8uZGVsYXkgPSB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHdlIG1heSBzd2l0Y2ggdG8gaGFuZHNoYWtpbmcuXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXhJbnRlcnZhbCA9IF9hZHZpY2UubWF4SW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXhJbnRlcnZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBleHBpcmF0aW9uID0gX2FkdmljZS50aW1lb3V0ICsgX2FkdmljZS5pbnRlcnZhbCArIG1heEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVuY29ubmVjdGVkID0gbm93IC0gX3VuY29ubmVjdFRpbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodW5jb25uZWN0ZWQgKyBfYmFja29mZiA+IGV4cGlyYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnaGFuZHNoYWtlJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmYWlsdXJlSW5mby5hY3Rpb24gPT09ICdoYW5kc2hha2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVJbmZvLmRlbGF5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0cy5yZXNldChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRCYWNrb2ZmUGVyaW9kKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmFpbHVyZUhhbmRsZXIuY2FsbChfY29tZXRkLCBmYWlsdXJlSW5mbyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9oYW5kbGVUcmFuc3BvcnRGYWlsdXJlKGZhaWx1cmVJbmZvKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQgZmFpbHVyZSBoYW5kbGluZycsIGZhaWx1cmVJbmZvKTtcblxuICAgICAgICBpZiAoZmFpbHVyZUluZm8udHJhbnNwb3J0KSB7XG4gICAgICAgICAgICBfdHJhbnNwb3J0ID0gZmFpbHVyZUluZm8udHJhbnNwb3J0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZhaWx1cmVJbmZvLnVybCkge1xuICAgICAgICAgICAgX3RyYW5zcG9ydC5zZXRVUkwoZmFpbHVyZUluZm8udXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3Rpb24gPSBmYWlsdXJlSW5mby5hY3Rpb247XG4gICAgICAgIHZhciBkZWxheSA9IGZhaWx1cmVJbmZvLmRlbGF5IHx8IDA7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdoYW5kc2hha2UnOlxuICAgICAgICAgICAgICAgIF9kZWxheWVkSGFuZHNoYWtlKGRlbGF5KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoZGVsYXkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93ICdVbmtub3duIGFjdGlvbiAnICsgYWN0aW9uO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwgZmFpbHVyZUluZm8pIHtcbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9oYW5kc2hha2UnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG5cbiAgICAgICAgLy8gVGhlIGxpc3RlbmVycyBtYXkgaGF2ZSBkaXNjb25uZWN0ZWQuXG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgZmFpbHVyZUluZm8uYWN0aW9uID0gJ25vbmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgX2NvbWV0ZC5vblRyYW5zcG9ydEZhaWx1cmUuY2FsbChfY29tZXRkLCBtZXNzYWdlLCBmYWlsdXJlSW5mbywgX2hhbmRsZVRyYW5zcG9ydEZhaWx1cmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9oYW5kc2hha2VSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpO1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICB2YXIgY3Jvc3NEb21haW4gPSBfY29tZXRkLl9pc0Nyb3NzRG9tYWluKF9zcGxpdFVSTCh1cmwpWzJdKTtcbiAgICAgICAgICAgIHZhciBuZXdUcmFuc3BvcnQgPSBfdHJhbnNwb3J0cy5uZWdvdGlhdGVUcmFuc3BvcnQobWVzc2FnZS5zdXBwb3J0ZWRDb25uZWN0aW9uVHlwZXMsIG1lc3NhZ2UudmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCk7XG4gICAgICAgICAgICBpZiAobmV3VHJhbnNwb3J0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zdWNjZXNzZnVsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwge1xuICAgICAgICAgICAgICAgICAgICBjYXVzZTogJ25lZ290aWF0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAnbm9uZScsXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogbnVsbFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoX3RyYW5zcG9ydCAhPT0gbmV3VHJhbnNwb3J0KSB7XG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCcsIF90cmFuc3BvcnQuZ2V0VHlwZSgpLCAnLT4nLCBuZXdUcmFuc3BvcnQuZ2V0VHlwZSgpKTtcbiAgICAgICAgICAgICAgICBfdHJhbnNwb3J0ID0gbmV3VHJhbnNwb3J0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfY2xpZW50SWQgPSBtZXNzYWdlLmNsaWVudElkO1xuXG4gICAgICAgICAgICAvLyBFbmQgdGhlIGludGVybmFsIGJhdGNoIGFuZCBhbGxvdyBoZWxkIG1lc3NhZ2VzIGZyb20gdGhlIGFwcGxpY2F0aW9uXG4gICAgICAgICAgICAvLyB0byBnbyB0byB0aGUgc2VydmVyIChzZWUgX2hhbmRzaGFrZSgpIHdoZXJlIHdlIHN0YXJ0IHRoZSBpbnRlcm5hbCBiYXRjaCkuXG4gICAgICAgICAgICBfaW50ZXJuYWxCYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgX2ZsdXNoQmF0Y2goKTtcblxuICAgICAgICAgICAgLy8gSGVyZSB0aGUgbmV3IHRyYW5zcG9ydCBpcyBpbiBwbGFjZSwgYXMgd2VsbCBhcyB0aGUgY2xpZW50SWQsIHNvXG4gICAgICAgICAgICAvLyB0aGUgbGlzdGVuZXJzIGNhbiBwZXJmb3JtIGEgcHVibGlzaCgpIGlmIHRoZXkgd2FudC5cbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgbGlzdGVuZXJzIGJlZm9yZSB0aGUgY29ubmVjdCBiZWxvdy5cbiAgICAgICAgICAgIG1lc3NhZ2UucmVlc3RhYmxpc2ggPSBfcmVlc3RhYmxpc2g7XG4gICAgICAgICAgICBfcmVlc3RhYmxpc2ggPSB0cnVlO1xuXG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9oYW5kc2hha2UnLCBtZXNzYWdlKTtcblxuICAgICAgICAgICAgX2hhbmRzaGFrZU1lc3NhZ2VzID0gbWVzc2FnZVsneC1tZXNzYWdlcyddIHx8IDA7XG5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfaXNEaXNjb25uZWN0ZWQoKSA/ICdub25lJyA6IF9hZHZpY2UucmVjb25uZWN0IHx8ICdyZXRyeSc7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2hhbmRzaGFrZU1lc3NhZ2VzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoMCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUHJvY2Vzc2luZycsIF9oYW5kc2hha2VNZXNzYWdlcywgJ2hhbmRzaGFrZS1kZWxpdmVyZWQgbWVzc2FnZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRocm93ICdVbnJlY29nbml6ZWQgYWR2aWNlIGFjdGlvbiAnICsgYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX2ZhaWxIYW5kc2hha2UobWVzc2FnZSwge1xuICAgICAgICAgICAgICAgIGNhdXNlOiAndW5zdWNjZXNzZnVsJyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IF9hZHZpY2UucmVjb25uZWN0IHx8ICdoYW5kc2hha2UnLFxuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogX3RyYW5zcG9ydFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaGFuZHNoYWtlRmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsSGFuZHNoYWtlKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgIGNhdXNlOiAnZmFpbHVyZScsXG4gICAgICAgICAgICBhY3Rpb246ICdoYW5kc2hha2UnLFxuICAgICAgICAgICAgdHJhbnNwb3J0OiBudWxsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsQ29ubmVjdChtZXNzYWdlLCBmYWlsdXJlSW5mbykge1xuICAgICAgICAvLyBOb3RpZnkgdGhlIGxpc3RlbmVycyBhZnRlciB0aGUgc3RhdHVzIGNoYW5nZSBidXQgYmVmb3JlIHRoZSBuZXh0IGFjdGlvbi5cbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvY29ubmVjdCcsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcblxuICAgICAgICAvLyBUaGUgbGlzdGVuZXJzIG1heSBoYXZlIGRpc2Nvbm5lY3RlZC5cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICBmYWlsdXJlSW5mby5hY3Rpb24gPSAnbm9uZSc7XG4gICAgICAgIH1cblxuICAgICAgICBfY29tZXRkLm9uVHJhbnNwb3J0RmFpbHVyZS5jYWxsKF9jb21ldGQsIG1lc3NhZ2UsIGZhaWx1cmVJbmZvLCBfaGFuZGxlVHJhbnNwb3J0RmFpbHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIF9jb25uZWN0ZWQgPSBtZXNzYWdlLnN1Y2Nlc3NmdWw7XG5cbiAgICAgICAgaWYgKF9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Nvbm5lY3QnLCBtZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gTm9ybWFsbHksIHRoZSBhZHZpY2Ugd2lsbCBzYXkgXCJyZWNvbm5lY3Q6ICdyZXRyeScsIGludGVydmFsOiAwXCJcbiAgICAgICAgICAgIC8vIGFuZCB0aGUgc2VydmVyIHdpbGwgaG9sZCB0aGUgcmVxdWVzdCwgc28gd2hlbiBhIHJlc3BvbnNlIHJldHVybnNcbiAgICAgICAgICAgIC8vIHdlIGltbWVkaWF0ZWx5IGNhbGwgdGhlIHNlcnZlciBhZ2FpbiAobG9uZyBwb2xsaW5nKS5cbiAgICAgICAgICAgIC8vIExpc3RlbmVycyBjYW4gY2FsbCBkaXNjb25uZWN0KCksIHNvIGNoZWNrIHRoZSBzdGF0ZSBhZnRlciB0aGV5IHJ1bi5cbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBfaXNEaXNjb25uZWN0ZWQoKSA/ICdub25lJyA6IF9hZHZpY2UucmVjb25uZWN0IHx8ICdyZXRyeSc7XG4gICAgICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3JldHJ5JzpcbiAgICAgICAgICAgICAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoX2JhY2tvZmYpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdub25lJzpcbiAgICAgICAgICAgICAgICAgICAgX2Rpc2Nvbm5lY3QoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnVW5yZWNvZ25pemVkIGFkdmljZSBhY3Rpb24gJyArIGFjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsQ29ubmVjdChtZXNzYWdlLCB7XG4gICAgICAgICAgICAgICAgY2F1c2U6ICd1bnN1Y2Nlc3NmdWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogX2FkdmljZS5yZWNvbm5lY3QgfHwgJ3JldHJ5JyxcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQ6IF90cmFuc3BvcnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Nvbm5lY3RGYWlsdXJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuXG4gICAgICAgIF9mYWlsQ29ubmVjdChtZXNzYWdlLCB7XG4gICAgICAgICAgICBjYXVzZTogJ2ZhaWx1cmUnLFxuICAgICAgICAgICAgYWN0aW9uOiAncmV0cnknLFxuICAgICAgICAgICAgdHJhbnNwb3J0OiBudWxsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKSB7XG4gICAgICAgIF9kaXNjb25uZWN0KHRydWUpO1xuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Rpc2Nvbm5lY3QnLCBtZXNzYWdlKTtcbiAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2Rpc2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoZSAvbWV0YS9jb25uZWN0IHRvIGFycml2ZS5cbiAgICAgICAgICAgIF9kaXNjb25uZWN0KGZhbHNlKTtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL2Rpc2Nvbm5lY3QnLCBtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9kaXNjb25uZWN0RmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsRGlzY29ubmVjdChtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbFN1YnNjcmliZShtZXNzYWdlKSB7XG4gICAgICAgIHZhciBzdWJzY3JpcHRpb25zID0gX2xpc3RlbmVyc1ttZXNzYWdlLnN1YnNjcmlwdGlvbl07XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gc3Vic2NyaXB0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICAgICAgICAgIHZhciBzdWJzY3JpcHRpb24gPSBzdWJzY3JpcHRpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb24gJiYgIXN1YnNjcmlwdGlvbi5saXN0ZW5lcikge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgc3Vic2NyaXB0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlbW92ZWQgZmFpbGVkIHN1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3N1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc3Vic2NyaWJlUmVzcG9uc2UobWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICBfaGFuZGxlQ2FsbGJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9zdWJzY3JpYmUnLCBtZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9mYWlsU3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N1YnNjcmliZUZhaWx1cmUobWVzc2FnZSkge1xuICAgICAgICBfZmFpbFN1YnNjcmliZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmFpbFVuc3Vic2NyaWJlKG1lc3NhZ2UpIHtcbiAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1YnNjcmliZScsIG1lc3NhZ2UpO1xuICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS91bnN1Y2Nlc3NmdWwnLCBtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdW5zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKSB7XG4gICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIF9oYW5kbGVDYWxsYmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgIF9ub3RpZnlMaXN0ZW5lcnMoJy9tZXRhL3Vuc3Vic2NyaWJlJywgbWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfZmFpbFVuc3Vic2NyaWJlKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3Vuc3Vic2NyaWJlRmFpbHVyZShtZXNzYWdlKSB7XG4gICAgICAgIF9mYWlsVW5zdWJzY3JpYmUobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZhaWxNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCFfaGFuZGxlUmVtb3RlQ2FsbChtZXNzYWdlKSkge1xuICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvcHVibGlzaCcsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycygnL21ldGEvdW5zdWNjZXNzZnVsJywgbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWVzc2FnZVJlc3BvbnNlKG1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2UuZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoIV9oYW5kbGVSZW1vdGVDYWxsKG1lc3NhZ2UpKSB7XG4gICAgICAgICAgICAgICAgX25vdGlmeUxpc3RlbmVycyhtZXNzYWdlLmNoYW5uZWwsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGlmIChfaGFuZHNoYWtlTWVzc2FnZXMgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC0tX2hhbmRzaGFrZU1lc3NhZ2VzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2hhbmRzaGFrZU1lc3NhZ2VzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnUHJvY2Vzc2VkIGxhc3QgaGFuZHNoYWtlLWRlbGl2ZXJlZCBtZXNzYWdlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfZGVsYXllZENvbm5lY3QoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5zdWNjZXNzZnVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl93YXJuKCdVbmtub3duIEJheWV1eCBNZXNzYWdlJywgbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgICAgICAgICAgX2hhbmRsZUNhbGxiYWNrKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBfbm90aWZ5TGlzdGVuZXJzKCcvbWV0YS9wdWJsaXNoJywgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX2ZhaWxNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tZXNzYWdlRmFpbHVyZShmYWlsdXJlKSB7XG4gICAgICAgIF9mYWlsTWVzc2FnZShmYWlsdXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmVjZWl2ZShtZXNzYWdlKSB7XG4gICAgICAgIF91bmNvbm5lY3RUaW1lID0gMDtcblxuICAgICAgICBtZXNzYWdlID0gX2FwcGx5SW5jb21pbmdFeHRlbnNpb25zKG1lc3NhZ2UpO1xuICAgICAgICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkIHx8IG1lc3NhZ2UgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF91cGRhdGVBZHZpY2UobWVzc2FnZS5hZHZpY2UpO1xuXG4gICAgICAgIHZhciBjaGFubmVsID0gbWVzc2FnZS5jaGFubmVsO1xuICAgICAgICBzd2l0Y2ggKGNoYW5uZWwpIHtcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL2hhbmRzaGFrZSc6XG4gICAgICAgICAgICAgICAgX2hhbmRzaGFrZVJlc3BvbnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnL21ldGEvY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgX2Nvbm5lY3RSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Rpc2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgIF9kaXNjb25uZWN0UmVzcG9uc2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcvbWV0YS9zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgIF9zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy9tZXRhL3Vuc3Vic2NyaWJlJzpcbiAgICAgICAgICAgICAgICBfdW5zdWJzY3JpYmVSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgX21lc3NhZ2VSZXNwb25zZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2VpdmVzIGEgbWVzc2FnZS5cbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBleHBvc2VkIGFzIGEgcHVibGljIHNvIHRoYXQgZXh0ZW5zaW9ucyBtYXkgaW5qZWN0XG4gICAgICogbWVzc2FnZXMgc2ltdWxhdGluZyB0aGF0IHRoZXkgaGFkIGJlZW4gcmVjZWl2ZWQuXG4gICAgICovXG4gICAgdGhpcy5yZWNlaXZlID0gX3JlY2VpdmU7XG5cbiAgICBfaGFuZGxlTWVzc2FnZXMgPSBmdW5jdGlvbihyY3ZkTWVzc2FnZXMpIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1JlY2VpdmVkJywgcmN2ZE1lc3NhZ2VzKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJjdmRNZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSByY3ZkTWVzc2FnZXNbaV07XG4gICAgICAgICAgICBfcmVjZWl2ZShtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfaGFuZGxlRmFpbHVyZSA9IGZ1bmN0aW9uKGNvbmR1aXQsIG1lc3NhZ2VzLCBmYWlsdXJlKSB7XG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdoYW5kbGVGYWlsdXJlJywgY29uZHVpdCwgbWVzc2FnZXMsIGZhaWx1cmUpO1xuXG4gICAgICAgIGZhaWx1cmUudHJhbnNwb3J0ID0gY29uZHVpdDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIHZhciBmYWlsdXJlTWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBpZDogbWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGFubmVsOiBtZXNzYWdlLmNoYW5uZWwsXG4gICAgICAgICAgICAgICAgZmFpbHVyZTogZmFpbHVyZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZhaWx1cmUubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL2hhbmRzaGFrZSc6XG4gICAgICAgICAgICAgICAgICAgIF9oYW5kc2hha2VGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnL21ldGEvY29ubmVjdCc6XG4gICAgICAgICAgICAgICAgICAgIF9jb25uZWN0RmFpbHVyZShmYWlsdXJlTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJy9tZXRhL2Rpc2Nvbm5lY3QnOlxuICAgICAgICAgICAgICAgICAgICBfZGlzY29ubmVjdEZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS9zdWJzY3JpYmUnOlxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlTWVzc2FnZS5zdWJzY3JpcHRpb24gPSBtZXNzYWdlLnN1YnNjcmlwdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgX3N1YnNjcmliZUZhaWx1cmUoZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICcvbWV0YS91bnN1YnNjcmliZSc6XG4gICAgICAgICAgICAgICAgICAgIGZhaWx1cmVNZXNzYWdlLnN1YnNjcmlwdGlvbiA9IG1lc3NhZ2Uuc3Vic2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICBfdW5zdWJzY3JpYmVGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgX21lc3NhZ2VGYWlsdXJlKGZhaWx1cmVNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2hhc1N1YnNjcmlwdGlvbnMoY2hhbm5lbCkge1xuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmlwdGlvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic2NyaXB0aW9uc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZXNvbHZlU2NvcGVkQ2FsbGJhY2soc2NvcGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IHtcbiAgICAgICAgICAgIHNjb3BlOiBzY29wZSxcbiAgICAgICAgICAgIG1ldGhvZDogY2FsbGJhY2tcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKHNjb3BlKSkge1xuICAgICAgICAgICAgZGVsZWdhdGUuc2NvcGUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBkZWxlZ2F0ZS5tZXRob2QgPSBzY29wZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChfaXNTdHJpbmcoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyAnSW52YWxpZCBzY29wZSAnICsgc2NvcGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlbGVnYXRlLm1ldGhvZCA9IHNjb3BlW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBpZiAoIV9pc0Z1bmN0aW9uKGRlbGVnYXRlLm1ldGhvZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgY2FsbGJhY2sgJyArIGNhbGxiYWNrICsgJyBmb3Igc2NvcGUgJyArIHNjb3BlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIV9pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHRocm93ICdJbnZhbGlkIGNhbGxiYWNrICcgKyBjYWxsYmFjaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVsZWdhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgaXNMaXN0ZW5lcikge1xuICAgICAgICAvLyBUaGUgZGF0YSBzdHJ1Y3R1cmUgaXMgYSBtYXA8Y2hhbm5lbCwgc3Vic2NyaXB0aW9uW10+LCB3aGVyZSBlYWNoIHN1YnNjcmlwdGlvblxuICAgICAgICAvLyBob2xkcyB0aGUgY2FsbGJhY2sgdG8gYmUgY2FsbGVkIGFuZCBpdHMgc2NvcGUuXG5cbiAgICAgICAgdmFyIGRlbGVnYXRlID0gX3Jlc29sdmVTY29wZWRDYWxsYmFjayhzY29wZSwgY2FsbGJhY2spO1xuICAgICAgICBfY29tZXRkLl9kZWJ1ZygnQWRkaW5nJywgaXNMaXN0ZW5lciA/ICdsaXN0ZW5lcicgOiAnc3Vic2NyaXB0aW9uJywgJ29uJywgY2hhbm5lbCwgJ3dpdGggc2NvcGUnLCBkZWxlZ2F0ZS5zY29wZSwgJ2FuZCBjYWxsYmFjaycsIGRlbGVnYXRlLm1ldGhvZCk7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IHtcbiAgICAgICAgICAgIGNoYW5uZWw6IGNoYW5uZWwsXG4gICAgICAgICAgICBzY29wZTogZGVsZWdhdGUuc2NvcGUsXG4gICAgICAgICAgICBjYWxsYmFjazogZGVsZWdhdGUubWV0aG9kLFxuICAgICAgICAgICAgbGlzdGVuZXI6IGlzTGlzdGVuZXJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgc3Vic2NyaXB0aW9ucyA9IF9saXN0ZW5lcnNbY2hhbm5lbF07XG4gICAgICAgIGlmICghc3Vic2NyaXB0aW9ucykge1xuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgICAgICAgX2xpc3RlbmVyc1tjaGFubmVsXSA9IHN1YnNjcmlwdGlvbnM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoaW5nIG9udG8gYW4gYXJyYXkgYXBwZW5kcyBhdCB0aGUgZW5kIGFuZCByZXR1cm5zIHRoZSBpZCBhc3NvY2lhdGVkIHdpdGggdGhlIGVsZW1lbnQgaW5jcmVhc2VkIGJ5IDEuXG4gICAgICAgIC8vIE5vdGUgdGhhdCBpZjpcbiAgICAgICAgLy8gYS5wdXNoKCdhJyk7IHZhciBoYj1hLnB1c2goJ2InKTsgZGVsZXRlIGFbaGItMV07IHZhciBoYz1hLnB1c2goJ2MnKTtcbiAgICAgICAgLy8gdGhlbjpcbiAgICAgICAgLy8gaGM9PTMsIGEuam9pbigpPT0nYScsLCdjJywgYS5sZW5ndGg9PTNcbiAgICAgICAgc3Vic2NyaXB0aW9uLmlkID0gc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnNjcmlwdGlvbikgLSAxO1xuXG4gICAgICAgIF9jb21ldGQuX2RlYnVnKCdBZGRlZCcsIGlzTGlzdGVuZXIgPyAnbGlzdGVuZXInIDogJ3N1YnNjcmlwdGlvbicsIHN1YnNjcmlwdGlvbik7XG5cbiAgICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IHdlIHVzZWQgdG8gcmV0dXJuIFtjaGFubmVsLCBzdWJzY3JpcHRpb24uaWRdXG4gICAgICAgIHN1YnNjcmlwdGlvblswXSA9IGNoYW5uZWw7XG4gICAgICAgIHN1YnNjcmlwdGlvblsxXSA9IHN1YnNjcmlwdGlvbi5pZDtcblxuICAgICAgICByZXR1cm4gc3Vic2NyaXB0aW9uO1xuICAgIH1cblxuICAgIC8vXG4gICAgLy8gUFVCTElDIEFQSVxuICAgIC8vXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgdGhlIGdpdmVuIHRyYW5zcG9ydCB1bmRlciB0aGUgZ2l2ZW4gdHJhbnNwb3J0IHR5cGUuXG4gICAgICogVGhlIG9wdGlvbmFsIGluZGV4IHBhcmFtZXRlciBzcGVjaWZpZXMgdGhlIFwicHJpb3JpdHlcIiBhdCB3aGljaCB0aGVcbiAgICAgKiB0cmFuc3BvcnQgaXMgcmVnaXN0ZXJlZCAod2hlcmUgMCBpcyB0aGUgbWF4IHByaW9yaXR5KS5cbiAgICAgKiBJZiBhIHRyYW5zcG9ydCB3aXRoIHRoZSBzYW1lIHR5cGUgaXMgYWxyZWFkeSByZWdpc3RlcmVkLCB0aGlzIGZ1bmN0aW9uXG4gICAgICogZG9lcyBub3RoaW5nIGFuZCByZXR1cm5zIGZhbHNlLlxuICAgICAqIEBwYXJhbSB0eXBlIHRoZSB0cmFuc3BvcnQgdHlwZVxuICAgICAqIEBwYXJhbSB0cmFuc3BvcnQgdGhlIHRyYW5zcG9ydCBvYmplY3RcbiAgICAgKiBAcGFyYW0gaW5kZXggdGhlIGluZGV4IGF0IHdoaWNoIHRoaXMgdHJhbnNwb3J0IGlzIHRvIGJlIHJlZ2lzdGVyZWRcbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIHRyYW5zcG9ydCBoYXMgYmVlbiByZWdpc3RlcmVkLCBmYWxzZSBvdGhlcndpc2VcbiAgICAgKiBAc2VlICN1bnJlZ2lzdGVyVHJhbnNwb3J0KHR5cGUpXG4gICAgICovXG4gICAgdGhpcy5yZWdpc3RlclRyYW5zcG9ydCA9IGZ1bmN0aW9uKHR5cGUsIHRyYW5zcG9ydCwgaW5kZXgpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IF90cmFuc3BvcnRzLmFkZCh0eXBlLCB0cmFuc3BvcnQsIGluZGV4KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ1JlZ2lzdGVyZWQgdHJhbnNwb3J0JywgdHlwZSk7XG5cbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbih0cmFuc3BvcnQucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQucmVnaXN0ZXJlZCh0eXBlLCB0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbnJlZ2lzdGVycyB0aGUgdHJhbnNwb3J0IHdpdGggdGhlIGdpdmVuIHRyYW5zcG9ydCB0eXBlLlxuICAgICAqIEBwYXJhbSB0eXBlIHRoZSB0cmFuc3BvcnQgdHlwZSB0byB1bnJlZ2lzdGVyXG4gICAgICogQHJldHVybiB0aGUgdHJhbnNwb3J0IHRoYXQgaGFzIGJlZW4gdW5yZWdpc3RlcmVkLFxuICAgICAqIG9yIG51bGwgaWYgbm8gdHJhbnNwb3J0IHdhcyBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgdW5kZXIgdGhlIGdpdmVuIHRyYW5zcG9ydCB0eXBlXG4gICAgICovXG4gICAgdGhpcy51bnJlZ2lzdGVyVHJhbnNwb3J0ID0gZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB2YXIgdHJhbnNwb3J0ID0gX3RyYW5zcG9ydHMucmVtb3ZlKHR5cGUpO1xuICAgICAgICBpZiAodHJhbnNwb3J0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVW5yZWdpc3RlcmVkIHRyYW5zcG9ydCcsIHR5cGUpO1xuXG4gICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24odHJhbnNwb3J0LnVucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICB0cmFuc3BvcnQudW5yZWdpc3RlcmVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICB9O1xuXG4gICAgdGhpcy51bnJlZ2lzdGVyVHJhbnNwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdHJhbnNwb3J0cy5jbGVhcigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIGFuIGFycmF5IG9mIGFsbCByZWdpc3RlcmVkIHRyYW5zcG9ydCB0eXBlc1xuICAgICAqL1xuICAgIHRoaXMuZ2V0VHJhbnNwb3J0VHlwZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzLmdldFRyYW5zcG9ydFR5cGVzKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZmluZFRyYW5zcG9ydCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzLmZpbmQobmFtZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm5zIHRoZSBUcmFuc3BvcnRSZWdpc3RyeSBvYmplY3RcbiAgICAgKi9cbiAgICB0aGlzLmdldFRyYW5zcG9ydFJlZ2lzdHJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHJhbnNwb3J0cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ29uZmlndXJlcyB0aGUgaW5pdGlhbCBCYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqIENvbmZpZ3VyYXRpb24gaXMgcGFzc2VkIHZpYSBhbiBvYmplY3QgdGhhdCBtdXN0IGNvbnRhaW4gYSBtYW5kYXRvcnkgZmllbGQgPGNvZGU+dXJsPC9jb2RlPlxuICAgICAqIG9mIHR5cGUgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIFVSTCBvZiB0aGUgQmF5ZXV4IHNlcnZlci5cbiAgICAgKiBAcGFyYW0gY29uZmlndXJhdGlvbiB0aGUgY29uZmlndXJhdGlvbiBvYmplY3RcbiAgICAgKi9cbiAgICB0aGlzLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uKGNvbmZpZ3VyYXRpb24pIHtcbiAgICAgICAgX2NvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmZpZ3VyYXRpb24pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDb25maWd1cmVzIGFuZCBlc3RhYmxpc2hlcyB0aGUgQmF5ZXV4IGNvbW11bmljYXRpb24gd2l0aCB0aGUgQmF5ZXV4IHNlcnZlclxuICAgICAqIHZpYSBhIGhhbmRzaGFrZSBhbmQgYSBzdWJzZXF1ZW50IGNvbm5lY3QuXG4gICAgICogQHBhcmFtIGNvbmZpZ3VyYXRpb24gdGhlIGNvbmZpZ3VyYXRpb24gb2JqZWN0XG4gICAgICogQHBhcmFtIGhhbmRzaGFrZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgaGFuZHNoYWtlIG1lc3NhZ2VcbiAgICAgKiBAc2VlICNjb25maWd1cmUoY29uZmlndXJhdGlvbilcbiAgICAgKiBAc2VlICNoYW5kc2hha2UoaGFuZHNoYWtlUHJvcHMpXG4gICAgICovXG4gICAgdGhpcy5pbml0ID0gZnVuY3Rpb24oY29uZmlndXJhdGlvbiwgaGFuZHNoYWtlUHJvcHMpIHtcbiAgICAgICAgdGhpcy5jb25maWd1cmUoY29uZmlndXJhdGlvbik7XG4gICAgICAgIHRoaXMuaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXN0YWJsaXNoZXMgdGhlIEJheWV1eCBjb21tdW5pY2F0aW9uIHdpdGggdGhlIEJheWV1eCBzZXJ2ZXJcbiAgICAgKiB2aWEgYSBoYW5kc2hha2UgYW5kIGEgc3Vic2VxdWVudCBjb25uZWN0LlxuICAgICAqIEBwYXJhbSBoYW5kc2hha2VQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIGhhbmRzaGFrZSBtZXNzYWdlXG4gICAgICogQHBhcmFtIGhhbmRzaGFrZUNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBoYW5kc2hha2UgaXMgYWNrbm93bGVkZ2VkXG4gICAgICovXG4gICAgdGhpcy5oYW5kc2hha2UgPSBmdW5jdGlvbihoYW5kc2hha2VQcm9wcywgaGFuZHNoYWtlQ2FsbGJhY2spIHtcbiAgICAgICAgX3NldFN0YXR1cygnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIF9yZWVzdGFibGlzaCA9IGZhbHNlO1xuICAgICAgICBfaGFuZHNoYWtlKGhhbmRzaGFrZVByb3BzLCBoYW5kc2hha2VDYWxsYmFjayk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3RzIGZyb20gdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICogSXQgaXMgcG9zc2libGUgdG8gc3VnZ2VzdCB0byBhdHRlbXB0IGEgc3luY2hyb25vdXMgZGlzY29ubmVjdCwgYnV0IHRoaXMgZmVhdHVyZVxuICAgICAqIG1heSBvbmx5IGJlIGF2YWlsYWJsZSBpbiBjZXJ0YWluIHRyYW5zcG9ydHMgKGZvciBleGFtcGxlLCBsb25nLXBvbGxpbmcgbWF5IHN1cHBvcnRcbiAgICAgKiBpdCwgY2FsbGJhY2stcG9sbGluZyBjZXJ0YWlubHkgZG9lcyBub3QpLlxuICAgICAqIEBwYXJhbSBzeW5jIHdoZXRoZXIgYXR0ZW1wdCB0byBwZXJmb3JtIGEgc3luY2hyb25vdXMgZGlzY29ubmVjdFxuICAgICAqIEBwYXJhbSBkaXNjb25uZWN0UHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBkaXNjb25uZWN0IG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gZGlzY29ubmVjdENhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBkaXNjb25uZWN0IGlzIGFja25vd2xlZGdlZFxuICAgICAqL1xuICAgIHRoaXMuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKHN5bmMsIGRpc2Nvbm5lY3RQcm9wcywgZGlzY29ubmVjdENhbGxiYWNrKSB7XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBzeW5jICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RDYWxsYmFjayA9IGRpc2Nvbm5lY3RQcm9wcztcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RQcm9wcyA9IHN5bmM7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGRpc2Nvbm5lY3RQcm9wcykpIHtcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RDYWxsYmFjayA9IGRpc2Nvbm5lY3RQcm9wcztcbiAgICAgICAgICAgIGRpc2Nvbm5lY3RQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiAnL21ldGEvZGlzY29ubmVjdCdcbiAgICAgICAgfTtcbiAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCBkaXNjb25uZWN0UHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGNhbGxiYWNrLlxuICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCBkaXNjb25uZWN0Q2FsbGJhY2spO1xuXG4gICAgICAgIF9zZXRTdGF0dXMoJ2Rpc2Nvbm5lY3RpbmcnKTtcbiAgICAgICAgX3NlbmQoc3luYyA9PT0gdHJ1ZSwgW21lc3NhZ2VdLCBmYWxzZSwgJ2Rpc2Nvbm5lY3QnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFya3MgdGhlIHN0YXJ0IG9mIGEgYmF0Y2ggb2YgYXBwbGljYXRpb24gbWVzc2FnZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICogaW4gYSBzaW5nbGUgcmVxdWVzdCwgb2J0YWluaW5nIGEgc2luZ2xlIHJlc3BvbnNlIGNvbnRhaW5pbmcgKHBvc3NpYmx5KSBtYW55XG4gICAgICogYXBwbGljYXRpb24gcmVwbHkgbWVzc2FnZXMuXG4gICAgICogTWVzc2FnZXMgYXJlIGhlbGQgaW4gYSBxdWV1ZSBhbmQgbm90IHNlbnQgdW50aWwge0BsaW5rICNlbmRCYXRjaCgpfSBpcyBjYWxsZWQuXG4gICAgICogSWYgc3RhcnRCYXRjaCgpIGlzIGNhbGxlZCBtdWx0aXBsZSB0aW1lcywgdGhlbiBhbiBlcXVhbCBudW1iZXIgb2YgZW5kQmF0Y2goKVxuICAgICAqIGNhbGxzIG11c3QgYmUgbWFkZSB0byBjbG9zZSBhbmQgc2VuZCB0aGUgYmF0Y2ggb2YgbWVzc2FnZXMuXG4gICAgICogQHNlZSAjZW5kQmF0Y2goKVxuICAgICAqL1xuICAgIHRoaXMuc3RhcnRCYXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfc3RhcnRCYXRjaCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYXJrcyB0aGUgZW5kIG9mIGEgYmF0Y2ggb2YgYXBwbGljYXRpb24gbWVzc2FnZXMgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICogaW4gYSBzaW5nbGUgcmVxdWVzdC5cbiAgICAgKiBAc2VlICNzdGFydEJhdGNoKClcbiAgICAgKi9cbiAgICB0aGlzLmVuZEJhdGNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9lbmRCYXRjaCgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gY2FsbGJhY2sgaW4gdGhlIGdpdmVuIHNjb3BlLCBzdXJyb3VuZGVkIGJ5IGEge0BsaW5rICNzdGFydEJhdGNoKCl9XG4gICAgICogYW5kIHtAbGluayAjZW5kQmF0Y2goKX0gY2FsbHMuXG4gICAgICogQHBhcmFtIHNjb3BlIHRoZSBzY29wZSBvZiB0aGUgY2FsbGJhY2ssIG1heSBiZSBvbWl0dGVkXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aXRoaW4ge0BsaW5rICNzdGFydEJhdGNoKCl9IGFuZCB7QGxpbmsgI2VuZEJhdGNoKCl9IGNhbGxzXG4gICAgICovXG4gICAgdGhpcy5iYXRjaCA9IGZ1bmN0aW9uKHNjb3BlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBfcmVzb2x2ZVNjb3BlZENhbGxiYWNrKHNjb3BlLCBjYWxsYmFjayk7XG4gICAgICAgIHRoaXMuc3RhcnRCYXRjaCgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZGVsZWdhdGUubWV0aG9kLmNhbGwoZGVsZWdhdGUuc2NvcGUpO1xuICAgICAgICAgICAgdGhpcy5lbmRCYXRjaCgpO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB0aGlzLl9pbmZvKCdFeGNlcHRpb24gZHVyaW5nIGV4ZWN1dGlvbiBvZiBiYXRjaCcsIHgpO1xuICAgICAgICAgICAgdGhpcy5lbmRCYXRjaCgpO1xuICAgICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbGlzdGVuZXIgZm9yIGJheWV1eCBtZXNzYWdlcywgcGVyZm9ybWluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgaW4gdGhlIGdpdmVuIHNjb3BlXG4gICAgICogd2hlbiBhIG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBjaGFubmVsIGFycml2ZXMuXG4gICAgICogQHBhcmFtIGNoYW5uZWwgdGhlIGNoYW5uZWwgdGhlIGxpc3RlbmVyIGlzIGludGVyZXN0ZWQgdG9cbiAgICAgKiBAcGFyYW0gc2NvcGUgdGhlIHNjb3BlIG9mIHRoZSBjYWxsYmFjaywgbWF5IGJlIG9taXR0ZWRcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgdGhlIGNhbGxiYWNrIHRvIGNhbGwgd2hlbiBhIG1lc3NhZ2UgaXMgc2VudCB0byB0aGUgY2hhbm5lbFxuICAgICAqIEByZXR1cm5zIHRoZSBzdWJzY3JpcHRpb24gaGFuZGxlIHRvIGJlIHBhc3NlZCB0byB7QGxpbmsgI3JlbW92ZUxpc3RlbmVyKG9iamVjdCl9XG4gICAgICogQHNlZSAjcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKVxuICAgICAqL1xuICAgIHRoaXMuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAyLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGNoYW5uZWwgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjaywgdHJ1ZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIHN1YnNjcmlwdGlvbiBvYnRhaW5lZCB3aXRoIGEgY2FsbCB0byB7QGxpbmsgI2FkZExpc3RlbmVyKHN0cmluZywgb2JqZWN0LCBmdW5jdGlvbil9LlxuICAgICAqIEBwYXJhbSBzdWJzY3JpcHRpb24gdGhlIHN1YnNjcmlwdGlvbiB0byB1bnN1YnNjcmliZS5cbiAgICAgKiBAc2VlICNhZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2spXG4gICAgICovXG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgICAvLyBCZXdhcmUgb2Ygc3Vic2NyaXB0aW9uLmlkID09IDAsIHdoaWNoIGlzIGZhbHN5ID0+IGNhbm5vdCB1c2UgIXN1YnNjcmlwdGlvbi5pZFxuICAgICAgICBpZiAoIXN1YnNjcmlwdGlvbiB8fCAhc3Vic2NyaXB0aW9uLmNoYW5uZWwgfHwgIShcImlkXCIgaW4gc3Vic2NyaXB0aW9uKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgYXJndW1lbnQ6IGV4cGVjdGVkIHN1YnNjcmlwdGlvbiwgbm90ICcgKyBzdWJzY3JpcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBfcmVtb3ZlTGlzdGVuZXIoc3Vic2NyaXB0aW9uKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgd2l0aCB7QGxpbmsgI2FkZExpc3RlbmVyKGNoYW5uZWwsIHNjb3BlLCBjYWxsYmFjayl9IG9yXG4gICAgICoge0BsaW5rICNzdWJzY3JpYmUoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKX0uXG4gICAgICovXG4gICAgdGhpcy5jbGVhckxpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfbGlzdGVuZXJzID0ge307XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1YnNjcmliZXMgdG8gdGhlIGdpdmVuIGNoYW5uZWwsIHBlcmZvcm1pbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGluIHRoZSBnaXZlbiBzY29wZVxuICAgICAqIHdoZW4gYSBtZXNzYWdlIGZvciB0aGUgY2hhbm5lbCBhcnJpdmVzLlxuICAgICAqIEBwYXJhbSBjaGFubmVsIHRoZSBjaGFubmVsIHRvIHN1YnNjcmliZSB0b1xuICAgICAqIEBwYXJhbSBzY29wZSB0aGUgc2NvcGUgb2YgdGhlIGNhbGxiYWNrLCBtYXkgYmUgb21pdHRlZFxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB0aGUgY2FsbGJhY2sgdG8gY2FsbCB3aGVuIGEgbWVzc2FnZSBpcyBzZW50IHRvIHRoZSBjaGFubmVsXG4gICAgICogQHBhcmFtIHN1YnNjcmliZVByb3BzIGFuIG9iamVjdCB0byBiZSBtZXJnZWQgd2l0aCB0aGUgc3Vic2NyaWJlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gc3Vic2NyaWJlQ2FsbGJhY2sgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHdoZW4gdGhlIHN1YnNjcmlwdGlvbiBpcyBhY2tub3dsZWRnZWRcbiAgICAgKiBAcmV0dXJuIHRoZSBzdWJzY3JpcHRpb24gaGFuZGxlIHRvIGJlIHBhc3NlZCB0byB7QGxpbmsgI3Vuc3Vic2NyaWJlKG9iamVjdCl9XG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpYmUgPSBmdW5jdGlvbihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzLCBzdWJzY3JpYmVDYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDIsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQgdHlwZTogY2hhbm5lbCBtdXN0IGJlIGEgc3RyaW5nJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3JtYWxpemUgYXJndW1lbnRzXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihzY29wZSkpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZUNhbGxiYWNrID0gc3Vic2NyaWJlUHJvcHM7XG4gICAgICAgICAgICBzdWJzY3JpYmVQcm9wcyA9IGNhbGxiYWNrO1xuICAgICAgICAgICAgY2FsbGJhY2sgPSBzY29wZTtcbiAgICAgICAgICAgIHNjb3BlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihzdWJzY3JpYmVQcm9wcykpIHtcbiAgICAgICAgICAgIHN1YnNjcmliZUNhbGxiYWNrID0gc3Vic2NyaWJlUHJvcHM7XG4gICAgICAgICAgICBzdWJzY3JpYmVQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgc2VuZCB0aGUgbWVzc2FnZSB0byB0aGUgc2VydmVyIGlmIHRoaXMgY2xpZW50IGhhcyBub3QgeWV0IHN1YnNjcmliZWQgdG8gdGhlIGNoYW5uZWxcbiAgICAgICAgdmFyIHNlbmQgPSAhX2hhc1N1YnNjcmlwdGlvbnMoY2hhbm5lbCk7XG5cbiAgICAgICAgdmFyIHN1YnNjcmlwdGlvbiA9IF9hZGRMaXN0ZW5lcihjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIGZhbHNlKTtcblxuICAgICAgICBpZiAoc2VuZCkge1xuICAgICAgICAgICAgLy8gU2VuZCB0aGUgc3Vic2NyaXB0aW9uIG1lc3NhZ2UgYWZ0ZXIgdGhlIHN1YnNjcmlwdGlvbiByZWdpc3RyYXRpb24gdG8gYXZvaWRcbiAgICAgICAgICAgIC8vIHJhY2VzIHdoZXJlIHRoZSBzZXJ2ZXIgd291bGQgc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHN1YnNjcmliZXJzLCBidXQgaGVyZVxuICAgICAgICAgICAgLy8gb24gdGhlIGNsaWVudCB0aGUgc3Vic2NyaXB0aW9uIGhhcyBub3QgYmVlbiBhZGRlZCB5ZXQgdG8gdGhlIGRhdGEgc3RydWN0dXJlc1xuICAgICAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL3N1YnNjcmliZScsXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uOiBjaGFubmVsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gRG8gbm90IGFsbG93IHRoZSB1c2VyIHRvIG92ZXJyaWRlIGltcG9ydGFudCBmaWVsZHMuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHRoaXMuX21peGluKGZhbHNlLCB7fSwgc3Vic2NyaWJlUHJvcHMsIGJheWV1eE1lc3NhZ2UpO1xuXG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIHN1YnNjcmliZUNhbGxiYWNrKTtcblxuICAgICAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFVuc3Vic2NyaWJlcyB0aGUgc3Vic2NyaXB0aW9uIG9idGFpbmVkIHdpdGggYSBjYWxsIHRvIHtAbGluayAjc3Vic2NyaWJlKHN0cmluZywgb2JqZWN0LCBmdW5jdGlvbil9LlxuICAgICAqIEBwYXJhbSBzdWJzY3JpcHRpb24gdGhlIHN1YnNjcmlwdGlvbiB0byB1bnN1YnNjcmliZS5cbiAgICAgKiBAcGFyYW0gdW5zdWJzY3JpYmVQcm9wcyBhbiBvYmplY3QgdG8gYmUgbWVyZ2VkIHdpdGggdGhlIHVuc3Vic2NyaWJlIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gdW5zdWJzY3JpYmVDYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgd2hlbiB0aGUgdW5zdWJzY3JpcHRpb24gaXMgYWNrbm93bGVkZ2VkXG4gICAgICovXG4gICAgdGhpcy51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbiwgdW5zdWJzY3JpYmVQcm9wcywgdW5zdWJzY3JpYmVDYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDEsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX2lzRGlzY29ubmVjdGVkKCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIHN0YXRlOiBhbHJlYWR5IGRpc2Nvbm5lY3RlZCc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2lzRnVuY3Rpb24odW5zdWJzY3JpYmVQcm9wcykpIHtcbiAgICAgICAgICAgIHVuc3Vic2NyaWJlQ2FsbGJhY2sgPSB1bnN1YnNjcmliZVByb3BzO1xuICAgICAgICAgICAgdW5zdWJzY3JpYmVQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbG9jYWwgbGlzdGVuZXIgYmVmb3JlIHNlbmRpbmcgdGhlIG1lc3NhZ2VcbiAgICAgICAgLy8gVGhpcyBlbnN1cmVzIHRoYXQgaWYgdGhlIHNlcnZlciBmYWlscywgdGhpcyBjbGllbnQgZG9lcyBub3QgZ2V0IG5vdGlmaWNhdGlvbnNcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzdWJzY3JpcHRpb24pO1xuXG4gICAgICAgIHZhciBjaGFubmVsID0gc3Vic2NyaXB0aW9uLmNoYW5uZWw7XG4gICAgICAgIC8vIE9ubHkgc2VuZCB0aGUgbWVzc2FnZSB0byB0aGUgc2VydmVyIGlmIHRoaXMgY2xpZW50IHVuc3Vic2NyaWJlcyB0aGUgbGFzdCBzdWJzY3JpcHRpb25cbiAgICAgICAgaWYgKCFfaGFzU3Vic2NyaXB0aW9ucyhjaGFubmVsKSkge1xuICAgICAgICAgICAgdmFyIGJheWV1eE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICAgICAgY2hhbm5lbDogJy9tZXRhL3Vuc3Vic2NyaWJlJyxcbiAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb246IGNoYW5uZWxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gdGhpcy5fbWl4aW4oZmFsc2UsIHt9LCB1bnN1YnNjcmliZVByb3BzLCBiYXlldXhNZXNzYWdlKTtcblxuICAgICAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgICAgICBfY29tZXRkLl9wdXRDYWxsYmFjayhtZXNzYWdlLmlkLCB1bnN1YnNjcmliZUNhbGxiYWNrKTtcblxuICAgICAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlc3Vic2NyaWJlID0gZnVuY3Rpb24oc3Vic2NyaXB0aW9uLCBzdWJzY3JpYmVQcm9wcykge1xuICAgICAgICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbik7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZShzdWJzY3JpcHRpb24uY2hhbm5lbCwgc3Vic2NyaXB0aW9uLnNjb3BlLCBzdWJzY3JpcHRpb24uY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBzdWJzY3JpcHRpb25zIGFkZGVkIHZpYSB7QGxpbmsgI3N1YnNjcmliZShjaGFubmVsLCBzY29wZSwgY2FsbGJhY2ssIHN1YnNjcmliZVByb3BzKX0sXG4gICAgICogYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgbGlzdGVuZXJzIGFkZGVkIHZpYSB7QGxpbmsgYWRkTGlzdGVuZXIoY2hhbm5lbCwgc2NvcGUsIGNhbGxiYWNrKX0uXG4gICAgICovXG4gICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2NsZWFyU3Vic2NyaXB0aW9ucygpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgYSBtZXNzYWdlIG9uIHRoZSBnaXZlbiBjaGFubmVsLCBjb250YWluaW5nIHRoZSBnaXZlbiBjb250ZW50LlxuICAgICAqIEBwYXJhbSBjaGFubmVsIHRoZSBjaGFubmVsIHRvIHB1Ymxpc2ggdGhlIG1lc3NhZ2UgdG9cbiAgICAgKiBAcGFyYW0gY29udGVudCB0aGUgY29udGVudCBvZiB0aGUgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBwdWJsaXNoUHJvcHMgYW4gb2JqZWN0IHRvIGJlIG1lcmdlZCB3aXRoIHRoZSBwdWJsaXNoIG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0gcHVibGlzaENhbGxiYWNrIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB3aGVuIHRoZSBwdWJsaXNoIGlzIGFja25vd2xlZGdlZCBieSB0aGUgc2VydmVyXG4gICAgICovXG4gICAgdGhpcy5wdWJsaXNoID0gZnVuY3Rpb24oY2hhbm5lbCwgY29udGVudCwgcHVibGlzaFByb3BzLCBwdWJsaXNoQ2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAxLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcoY2hhbm5lbCkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGNoYW5uZWwgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKC9eXFwvbWV0YVxcLy8udGVzdChjaGFubmVsKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgYXJndW1lbnQ6IGNhbm5vdCBwdWJsaXNoIHRvIG1ldGEgY2hhbm5lbHMnO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfaXNEaXNjb25uZWN0ZWQoKSkge1xuICAgICAgICAgICAgdGhyb3cgJ0lsbGVnYWwgc3RhdGU6IGFscmVhZHkgZGlzY29ubmVjdGVkJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfaXNGdW5jdGlvbihjb250ZW50KSkge1xuICAgICAgICAgICAgcHVibGlzaENhbGxiYWNrID0gY29udGVudDtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBwdWJsaXNoUHJvcHMgPSB7fTtcbiAgICAgICAgfSBlbHNlIGlmIChfaXNGdW5jdGlvbihwdWJsaXNoUHJvcHMpKSB7XG4gICAgICAgICAgICBwdWJsaXNoQ2FsbGJhY2sgPSBwdWJsaXNoUHJvcHM7XG4gICAgICAgICAgICBwdWJsaXNoUHJvcHMgPSB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgZGF0YTogY29udGVudFxuICAgICAgICB9O1xuICAgICAgICAvLyBEbyBub3QgYWxsb3cgdGhlIHVzZXIgdG8gb3ZlcnJpZGUgaW1wb3J0YW50IGZpZWxkcy5cbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB0aGlzLl9taXhpbihmYWxzZSwge30sIHB1Ymxpc2hQcm9wcywgYmF5ZXV4TWVzc2FnZSk7XG5cbiAgICAgICAgLy8gU2F2ZSB0aGUgY2FsbGJhY2suXG4gICAgICAgIF9jb21ldGQuX3B1dENhbGxiYWNrKG1lc3NhZ2UuaWQsIHB1Ymxpc2hDYWxsYmFjayk7XG5cbiAgICAgICAgX3F1ZXVlU2VuZChtZXNzYWdlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZW1vdGVDYWxsID0gZnVuY3Rpb24odGFyZ2V0LCBjb250ZW50LCB0aW1lb3V0LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50cyBudW1iZXI6IHJlcXVpcmVkIDEsIGdvdCAnICsgYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV9pc1N0cmluZyh0YXJnZXQpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudCB0eXBlOiB0YXJnZXQgbXVzdCBiZSBhIHN0cmluZyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF9pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBzdGF0ZTogYWxyZWFkeSBkaXNjb25uZWN0ZWQnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9pc0Z1bmN0aW9uKGNvbnRlbnQpKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNvbnRlbnQ7XG4gICAgICAgICAgICBjb250ZW50ID0ge307XG4gICAgICAgICAgICB0aW1lb3V0ID0gX2NvbmZpZy5tYXhOZXR3b3JrRGVsYXk7XG4gICAgICAgIH0gZWxzZSBpZiAoX2lzRnVuY3Rpb24odGltZW91dCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGltZW91dDtcbiAgICAgICAgICAgIHRpbWVvdXQgPSBfY29uZmlnLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdGltZW91dCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IHRpbWVvdXQgbXVzdCBiZSBhIG51bWJlcic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRhcmdldC5tYXRjaCgvXlxcLy8pKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSAnLycgKyB0YXJnZXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoYW5uZWwgPSAnL3NlcnZpY2UnICsgdGFyZ2V0O1xuXG4gICAgICAgIHZhciBiYXlldXhNZXNzYWdlID0ge1xuICAgICAgICAgICAgaWQ6IF9uZXh0TWVzc2FnZUlkKCksXG4gICAgICAgICAgICBjaGFubmVsOiBjaGFubmVsLFxuICAgICAgICAgICAgZGF0YTogY29udGVudFxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBjb250ZXh0ID0ge1xuICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aW1lb3V0ID4gMCkge1xuICAgICAgICAgICAgY29udGV4dC50aW1lb3V0ID0gVXRpbHMuc2V0VGltZW91dChfY29tZXRkLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnVGltaW5nIG91dCByZW1vdGUgY2FsbCcsIGJheWV1eE1lc3NhZ2UsICdhZnRlcicsIHRpbWVvdXQsICdtcycpO1xuICAgICAgICAgICAgICAgIF9mYWlsTWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBiYXlldXhNZXNzYWdlLmlkLFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogJzQwNjo6dGltZW91dCcsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlIDogYmF5ZXV4TWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ1JlbW90ZSBDYWxsIFRpbWVvdXQnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1NjaGVkdWxlZCByZW1vdGUgY2FsbCB0aW1lb3V0JywgYmF5ZXV4TWVzc2FnZSwgJ2luJywgdGltZW91dCwgJ21zJyk7XG4gICAgICAgIH1cbiAgICAgICAgX3JlbW90ZUNhbGxzW2JheWV1eE1lc3NhZ2UuaWRdID0gY29udGV4dDtcblxuICAgICAgICBfcXVldWVTZW5kKGJheWV1eE1lc3NhZ2UpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc3RhdHVzIG9mIHRoZSBiYXlldXggY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBCYXlldXggc2VydmVyLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0U3RhdHVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfc3RhdHVzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBpbnN0YW5jZSBoYXMgYmVlbiBkaXNjb25uZWN0ZWQuXG4gICAgICovXG4gICAgdGhpcy5pc0Rpc2Nvbm5lY3RlZCA9IF9pc0Rpc2Nvbm5lY3RlZDtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGJhY2tvZmYgcGVyaW9kIHVzZWQgdG8gaW5jcmVhc2UgdGhlIGJhY2tvZmYgdGltZSB3aGVuIHJldHJ5aW5nIGFuIHVuc3VjY2Vzc2Z1bCBvciBmYWlsZWQgbWVzc2FnZS5cbiAgICAgKiBEZWZhdWx0IHZhbHVlIGlzIDEgc2Vjb25kLCB3aGljaCBtZWFucyBpZiB0aGVyZSBpcyBhIHBlcnNpc3RlbnQgZmFpbHVyZSB0aGUgcmV0cmllcyB3aWxsIGhhcHBlblxuICAgICAqIGFmdGVyIDEgc2Vjb25kLCB0aGVuIGFmdGVyIDIgc2Vjb25kcywgdGhlbiBhZnRlciAzIHNlY29uZHMsIGV0Yy4gU28gZm9yIGV4YW1wbGUgd2l0aCAxNSBzZWNvbmRzIG9mXG4gICAgICogZWxhcHNlZCB0aW1lLCB0aGVyZSB3aWxsIGJlIDUgcmV0cmllcyAoYXQgMSwgMywgNiwgMTAgYW5kIDE1IHNlY29uZHMgZWxhcHNlZCkuXG4gICAgICogQHBhcmFtIHBlcmlvZCB0aGUgYmFja29mZiBwZXJpb2QgdG8gc2V0XG4gICAgICogQHNlZSAjZ2V0QmFja29mZkluY3JlbWVudCgpXG4gICAgICovXG4gICAgdGhpcy5zZXRCYWNrb2ZmSW5jcmVtZW50ID0gZnVuY3Rpb24ocGVyaW9kKSB7XG4gICAgICAgIF9jb25maWcuYmFja29mZkluY3JlbWVudCA9IHBlcmlvZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYmFja29mZiBwZXJpb2QgdXNlZCB0byBpbmNyZWFzZSB0aGUgYmFja29mZiB0aW1lIHdoZW4gcmV0cnlpbmcgYW4gdW5zdWNjZXNzZnVsIG9yIGZhaWxlZCBtZXNzYWdlLlxuICAgICAqIEBzZWUgI3NldEJhY2tvZmZJbmNyZW1lbnQocGVyaW9kKVxuICAgICAqL1xuICAgIHRoaXMuZ2V0QmFja29mZkluY3JlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbmZpZy5iYWNrb2ZmSW5jcmVtZW50O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYWNrb2ZmIHBlcmlvZCB0byB3YWl0IGJlZm9yZSByZXRyeWluZyBhbiB1bnN1Y2Nlc3NmdWwgb3IgZmFpbGVkIG1lc3NhZ2UuXG4gICAgICovXG4gICAgdGhpcy5nZXRCYWNrb2ZmUGVyaW9kID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfYmFja29mZjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5jcmVhc2VzIHRoZSBiYWNrb2ZmIHBlcmlvZCB1cCB0byB0aGUgbWF4aW11bSB2YWx1ZSBjb25maWd1cmVkLlxuICAgICAqIEByZXR1cm5zIHRoZSBiYWNrb2ZmIHBlcmlvZCBhZnRlciBpbmNyZW1lbnRcbiAgICAgKiBAc2VlIGdldEJhY2tvZmZJbmNyZW1lbnRcbiAgICAgKi9cbiAgICB0aGlzLmluY3JlYXNlQmFja29mZlBlcmlvZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2luY3JlYXNlQmFja29mZigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgdGhlIGJhY2tvZmYgcGVyaW9kIHRvIHplcm8uXG4gICAgICovXG4gICAgdGhpcy5yZXNldEJhY2tvZmZQZXJpb2QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3Jlc2V0QmFja29mZigpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBsb2cgbGV2ZWwgZm9yIGNvbnNvbGUgbG9nZ2luZy5cbiAgICAgKiBWYWxpZCB2YWx1ZXMgYXJlIHRoZSBzdHJpbmdzICdlcnJvcicsICd3YXJuJywgJ2luZm8nIGFuZCAnZGVidWcnLCBmcm9tXG4gICAgICogbGVzcyB2ZXJib3NlIHRvIG1vcmUgdmVyYm9zZS5cbiAgICAgKiBAcGFyYW0gbGV2ZWwgdGhlIGxvZyBsZXZlbCBzdHJpbmdcbiAgICAgKi9cbiAgICB0aGlzLnNldExvZ0xldmVsID0gZnVuY3Rpb24obGV2ZWwpIHtcbiAgICAgICAgX2NvbmZpZy5sb2dMZXZlbCA9IGxldmVsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlcnMgYW4gZXh0ZW5zaW9uIHdob3NlIGNhbGxiYWNrcyBhcmUgY2FsbGVkIGZvciBldmVyeSBpbmNvbWluZyBtZXNzYWdlXG4gICAgICogKHRoYXQgY29tZXMgZnJvbSB0aGUgc2VydmVyIHRvIHRoaXMgY2xpZW50IGltcGxlbWVudGF0aW9uKSBhbmQgZm9yIGV2ZXJ5XG4gICAgICogb3V0Z29pbmcgbWVzc2FnZSAodGhhdCBvcmlnaW5hdGVzIGZyb20gdGhpcyBjbGllbnQgaW1wbGVtZW50YXRpb24gZm9yIHRoZVxuICAgICAqIHNlcnZlcikuXG4gICAgICogVGhlIGZvcm1hdCBvZiB0aGUgZXh0ZW5zaW9uIG9iamVjdCBpcyB0aGUgZm9sbG93aW5nOlxuICAgICAqIDxwcmU+XG4gICAgICoge1xuICAgICAqICAgICBpbmNvbWluZzogZnVuY3Rpb24obWVzc2FnZSkgeyAuLi4gfSxcbiAgICAgKiAgICAgb3V0Z29pbmc6IGZ1bmN0aW9uKG1lc3NhZ2UpIHsgLi4uIH1cbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQm90aCBwcm9wZXJ0aWVzIGFyZSBvcHRpb25hbCwgYnV0IGlmIHRoZXkgYXJlIHByZXNlbnQgdGhleSB3aWxsIGJlIGNhbGxlZFxuICAgICAqIHJlc3BlY3RpdmVseSBmb3IgZWFjaCBpbmNvbWluZyBtZXNzYWdlIGFuZCBmb3IgZWFjaCBvdXRnb2luZyBtZXNzYWdlLlxuICAgICAqIEBwYXJhbSBuYW1lIHRoZSBuYW1lIG9mIHRoZSBleHRlbnNpb25cbiAgICAgKiBAcGFyYW0gZXh0ZW5zaW9uIHRoZSBleHRlbnNpb24gdG8gcmVnaXN0ZXJcbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGV4dGVuc2lvbiB3YXMgcmVnaXN0ZXJlZCwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICogQHNlZSAjdW5yZWdpc3RlckV4dGVuc2lvbihuYW1lKVxuICAgICAqL1xuICAgIHRoaXMucmVnaXN0ZXJFeHRlbnNpb24gPSBmdW5jdGlvbihuYW1lLCBleHRlbnNpb24pIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICB0aHJvdyAnSWxsZWdhbCBhcmd1bWVudHMgbnVtYmVyOiByZXF1aXJlZCAyLCBnb3QgJyArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfaXNTdHJpbmcobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGV4dGVuc2lvbiBuYW1lIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGV4aXN0aW5nID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX2V4dGVuc2lvbnMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBleGlzdGluZ0V4dGVuc2lvbiA9IF9leHRlbnNpb25zW2ldO1xuICAgICAgICAgICAgaWYgKGV4aXN0aW5nRXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICBleGlzdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFleGlzdGluZykge1xuICAgICAgICAgICAgX2V4dGVuc2lvbnMucHVzaCh7XG4gICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICBleHRlbnNpb246IGV4dGVuc2lvblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnUmVnaXN0ZXJlZCBleHRlbnNpb24nLCBuYW1lKTtcblxuICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGV4dGVuc2lvbnNcbiAgICAgICAgICAgIGlmIChfaXNGdW5jdGlvbihleHRlbnNpb24ucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb24ucmVnaXN0ZXJlZChuYW1lLCB0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pbmZvKCdDb3VsZCBub3QgcmVnaXN0ZXIgZXh0ZW5zaW9uIHdpdGggbmFtZScsIG5hbWUsICdzaW5jZSBhbm90aGVyIGV4dGVuc2lvbiB3aXRoIHRoZSBzYW1lIG5hbWUgYWxyZWFkeSBleGlzdHMnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVbnJlZ2lzdGVyIGFuIGV4dGVuc2lvbiBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgd2l0aFxuICAgICAqIHtAbGluayAjcmVnaXN0ZXJFeHRlbnNpb24obmFtZSwgZXh0ZW5zaW9uKX0uXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbiB0byB1bnJlZ2lzdGVyLlxuICAgICAqIEByZXR1cm4gdHJ1ZSBpZiB0aGUgZXh0ZW5zaW9uIHdhcyB1bnJlZ2lzdGVyZWQsIGZhbHNlIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHRoaXMudW5yZWdpc3RlckV4dGVuc2lvbiA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgaWYgKCFfaXNTdHJpbmcobmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93ICdJbGxlZ2FsIGFyZ3VtZW50IHR5cGU6IGV4dGVuc2lvbiBuYW1lIG11c3QgYmUgYSBzdHJpbmcnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVucmVnaXN0ZXJlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICBfZXh0ZW5zaW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgdW5yZWdpc3RlcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVW5yZWdpc3RlcmVkIGV4dGVuc2lvbicsIG5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsbGJhY2sgZm9yIGV4dGVuc2lvbnNcbiAgICAgICAgICAgICAgICB2YXIgZXh0ID0gZXh0ZW5zaW9uLmV4dGVuc2lvbjtcbiAgICAgICAgICAgICAgICBpZiAoX2lzRnVuY3Rpb24oZXh0LnVucmVnaXN0ZXJlZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0LnVucmVnaXN0ZXJlZCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bnJlZ2lzdGVyZWQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGhlIGV4dGVuc2lvbiByZWdpc3RlcmVkIHdpdGggdGhlIGdpdmVuIG5hbWUuXG4gICAgICogQHBhcmFtIG5hbWUgdGhlIG5hbWUgb2YgdGhlIGV4dGVuc2lvbiB0byBmaW5kXG4gICAgICogQHJldHVybiB0aGUgZXh0ZW5zaW9uIGZvdW5kIG9yIG51bGwgaWYgbm8gZXh0ZW5zaW9uIHdpdGggdGhlIGdpdmVuIG5hbWUgaGFzIGJlZW4gcmVnaXN0ZXJlZFxuICAgICAqL1xuICAgIHRoaXMuZ2V0RXh0ZW5zaW9uID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9leHRlbnNpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uID0gX2V4dGVuc2lvbnNbaV07XG4gICAgICAgICAgICBpZiAoZXh0ZW5zaW9uLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXh0ZW5zaW9uLmV4dGVuc2lvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbmFtZSBhc3NpZ25lZCB0byB0aGlzIENvbWV0RCBvYmplY3QsIG9yIHRoZSBzdHJpbmcgJ2RlZmF1bHQnXG4gICAgICogaWYgbm8gbmFtZSBoYXMgYmVlbiBleHBsaWNpdGx5IHBhc3NlZCBhcyBwYXJhbWV0ZXIgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAqL1xuICAgIHRoaXMuZ2V0TmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX25hbWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNsaWVudElkIGFzc2lnbmVkIGJ5IHRoZSBCYXlldXggc2VydmVyIGR1cmluZyBoYW5kc2hha2UuXG4gICAgICovXG4gICAgdGhpcy5nZXRDbGllbnRJZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NsaWVudElkO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBVUkwgb2YgdGhlIEJheWV1eCBzZXJ2ZXIuXG4gICAgICovXG4gICAgdGhpcy5nZXRVUkwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90cmFuc3BvcnQpIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSBfdHJhbnNwb3J0LmdldFVSTCgpO1xuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cmwgPSBfY29uZmlnLnVybHNbX3RyYW5zcG9ydC5nZXRUeXBlKCldO1xuICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9jb25maWcudXJsO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyYW5zcG9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3RyYW5zcG9ydDtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taXhpbih0cnVlLCB7fSwgX2NvbmZpZyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0QWR2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9taXhpbih0cnVlLCB7fSwgX2FkdmljZSk7XG4gICAgfTtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKTtcbnZhciBSZXF1ZXN0VHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9SZXF1ZXN0VHJhbnNwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKSB7XG4gICAgdmFyIF9zdXBlciA9IG5ldyBSZXF1ZXN0VHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuICAgIC8vIEJ5IGRlZmF1bHQsIHN1cHBvcnQgY3Jvc3MgZG9tYWluXG4gICAgdmFyIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gdHJ1ZTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBwb3J0c0Nyb3NzRG9tYWluIHx8ICFjcm9zc0RvbWFpbjtcbiAgICB9O1xuXG4gICAgX3NlbGYueGhyU2VuZCA9IGZ1bmN0aW9uKHBhY2tldCkge1xuICAgICAgICB0aHJvdyAnQWJzdHJhY3QnO1xuICAgIH07XG5cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc2VuZGluZyByZXF1ZXN0JywgcmVxdWVzdC5pZCwgJ2VudmVsb3BlJywgZW52ZWxvcGUpO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBzYW1lU3RhY2sgPSB0cnVlO1xuICAgICAgICAgICAgcmVxdWVzdC54aHIgPSB0aGlzLnhoclNlbmQoe1xuICAgICAgICAgICAgICAgIHRyYW5zcG9ydDogdGhpcyxcbiAgICAgICAgICAgICAgICB1cmw6IGVudmVsb3BlLnVybCxcbiAgICAgICAgICAgICAgICBzeW5jOiBlbnZlbG9wZS5zeW5jLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLnJlcXVlc3RIZWFkZXJzLFxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlLm1lc3NhZ2VzKSxcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3JlY2VpdmVkIHJlc3BvbnNlJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlY2VpdmVkID0gc2VsZi5jb252ZXJ0VG9NZXNzYWdlcyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjZWl2ZWQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3N1cHBvcnRzQ3Jvc3NEb21haW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHR0cENvZGU6IDIwNFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydFN1Y2Nlc3MoZW52ZWxvcGUsIHJlcXVlc3QsIHJlY2VpdmVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IHhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyhyZXF1ZXN0Lnhocik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50cmFuc3BvcnRGYWlsdXJlKGVudmVsb3BlLCByZXF1ZXN0LCBmYWlsdXJlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgb25FcnJvcjogZnVuY3Rpb24ocmVhc29uLCBleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAncmVjZWl2ZWQgZXJyb3InLCByZWFzb24sIGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIF9zdXBwb3J0c0Nyb3NzRG9tYWluID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uOiByZWFzb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNlcHRpb246IGV4Y2VwdGlvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMocmVxdWVzdC54aHIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2FtZVN0YWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHJhbnNwb3J0RmFpbHVyZShlbnZlbG9wZSwgcmVxdWVzdCwgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNhbWVTdGFjayA9IGZhbHNlO1xuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRyYW5zcG9ydEZhaWx1cmUoZW52ZWxvcGUsIHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgX3N1cGVyLnJlc2V0KGluaXQpO1xuICAgICAgICBfc3VwcG9ydHNDcm9zc0RvbWFpbiA9IHRydWU7XG4gICAgfTtcblxuICAgIHJldHVybiBfc2VsZjtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbi8qKlxuICogQmFzZSBvYmplY3Qgd2l0aCB0aGUgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIHRyYW5zcG9ydHMgYmFzZWQgb24gcmVxdWVzdHMuXG4gKiBUaGUga2V5IHJlc3BvbnNpYmlsaXR5IGlzIHRvIGFsbG93IGF0IG1vc3QgMiBvdXRzdGFuZGluZyByZXF1ZXN0cyB0byB0aGUgc2VydmVyLFxuICogdG8gYXZvaWQgdGhhdCByZXF1ZXN0cyBhcmUgc2VudCBiZWhpbmQgYSBsb25nIHBvbGwuXG4gKiBUbyBhY2hpZXZlIHRoaXMsIHdlIGhhdmUgb25lIHJlc2VydmVkIHJlcXVlc3QgZm9yIHRoZSBsb25nIHBvbGwsIGFuZCBhbGwgb3RoZXJcbiAqIHJlcXVlc3RzIGFyZSBzZXJpYWxpemVkIG9uZSBhZnRlciB0aGUgb3RoZXIuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVxdWVzdFRyYW5zcG9ydCgpIHtcbiAgICB2YXIgX3N1cGVyID0gbmV3IFRyYW5zcG9ydCgpO1xuICAgIHZhciBfc2VsZiA9IFRyYW5zcG9ydC5kZXJpdmUoX3N1cGVyKTtcbiAgICB2YXIgX3JlcXVlc3RJZHMgPSAwO1xuICAgIHZhciBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gbnVsbDtcbiAgICB2YXIgX3JlcXVlc3RzID0gW107XG4gICAgdmFyIF9lbnZlbG9wZXMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIF9jb2FsZXNjZUVudmVsb3BlcyhlbnZlbG9wZSkge1xuICAgICAgICB3aGlsZSAoX2VudmVsb3Blcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZW52ZWxvcGVBbmRSZXF1ZXN0ID0gX2VudmVsb3Blc1swXTtcbiAgICAgICAgICAgIHZhciBuZXdFbnZlbG9wZSA9IGVudmVsb3BlQW5kUmVxdWVzdFswXTtcbiAgICAgICAgICAgIHZhciBuZXdSZXF1ZXN0ID0gZW52ZWxvcGVBbmRSZXF1ZXN0WzFdO1xuICAgICAgICAgICAgaWYgKG5ld0VudmVsb3BlLnVybCA9PT0gZW52ZWxvcGUudXJsICYmXG4gICAgICAgICAgICAgICAgbmV3RW52ZWxvcGUuc3luYyA9PT0gZW52ZWxvcGUuc3luYykge1xuICAgICAgICAgICAgICAgIF9lbnZlbG9wZXMuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5tZXNzYWdlcyA9IGVudmVsb3BlLm1lc3NhZ2VzLmNvbmNhdChuZXdFbnZlbG9wZS5tZXNzYWdlcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0NvYWxlc2NlZCcsIG5ld0VudmVsb3BlLm1lc3NhZ2VzLmxlbmd0aCwgJ21lc3NhZ2VzIGZyb20gcmVxdWVzdCcsIG5ld1JlcXVlc3QuaWQpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfdHJhbnNwb3J0U2VuZChlbnZlbG9wZSwgcmVxdWVzdCkge1xuICAgICAgICB0aGlzLnRyYW5zcG9ydFNlbmQoZW52ZWxvcGUsIHJlcXVlc3QpO1xuICAgICAgICByZXF1ZXN0LmV4cGlyZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWVudmVsb3BlLnN5bmMpIHtcbiAgICAgICAgICAgIHZhciBtYXhEZWxheSA9IHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLm1heE5ldHdvcmtEZWxheTtcbiAgICAgICAgICAgIHZhciBkZWxheSA9IG1heERlbGF5O1xuICAgICAgICAgICAgaWYgKHJlcXVlc3QubWV0YUNvbm5lY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkZWxheSArPSB0aGlzLmdldEFkdmljZSgpLnRpbWVvdXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3dhaXRpbmcgYXQgbW9zdCcsIGRlbGF5LCAnbXMgZm9yIHRoZSByZXNwb25zZSwgbWF4TmV0d29ya0RlbGF5JywgbWF4RGVsYXkpO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICByZXF1ZXN0LnRpbWVvdXQgPSB0aGlzLnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5leHBpcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gJ1JlcXVlc3QgJyArIHJlcXVlc3QuaWQgKyAnIG9mIHRyYW5zcG9ydCAnICsgc2VsZi5nZXRUeXBlKCkgKyAnIGV4Y2VlZGVkICcgKyBkZWxheSArICcgbXMgbWF4IG5ldHdvcmsgZGVsYXknO1xuICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICByZWFzb246IGVycm9yTWVzc2FnZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIHhociA9IHJlcXVlc3QueGhyO1xuICAgICAgICAgICAgICAgIGZhaWx1cmUuaHR0cENvZGUgPSBzZWxmLnhoclN0YXR1cyh4aHIpO1xuICAgICAgICAgICAgICAgIHNlbGYuYWJvcnRYSFIoeGhyKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9kZWJ1ZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuY29tcGxldGUocmVxdWVzdCwgZmFsc2UsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm9uRmFpbHVyZSh4aHIsIGVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9xdWV1ZVNlbmQoZW52ZWxvcGUpIHtcbiAgICAgICAgdmFyIHJlcXVlc3RJZCA9ICsrX3JlcXVlc3RJZHM7XG4gICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgaWQ6IHJlcXVlc3RJZCxcbiAgICAgICAgICAgIG1ldGFDb25uZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIGVudmVsb3BlOiBlbnZlbG9wZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbnNpZGVyIHRoZSBtZXRhQ29ubmVjdCByZXF1ZXN0cyB3aGljaCBzaG91bGQgYWx3YXlzIGJlIHByZXNlbnRcbiAgICAgICAgaWYgKF9yZXF1ZXN0cy5sZW5ndGggPCB0aGlzLmdldENvbmZpZ3VyYXRpb24oKS5tYXhDb25uZWN0aW9ucyAtIDEpIHtcbiAgICAgICAgICAgIF9yZXF1ZXN0cy5wdXNoKHJlcXVlc3QpO1xuICAgICAgICAgICAgX3RyYW5zcG9ydFNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSwgcmVxdWVzdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdxdWV1ZWluZyByZXF1ZXN0JywgcmVxdWVzdElkLCAnZW52ZWxvcGUnLCBlbnZlbG9wZSk7XG4gICAgICAgICAgICBfZW52ZWxvcGVzLnB1c2goW2VudmVsb3BlLCByZXF1ZXN0XSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWV0YUNvbm5lY3RDb21wbGV0ZShyZXF1ZXN0KSB7XG4gICAgICAgIHZhciByZXF1ZXN0SWQgPSByZXF1ZXN0LmlkO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdtZXRhQ29ubmVjdCBjb21wbGV0ZSwgcmVxdWVzdCcsIHJlcXVlc3RJZCk7XG4gICAgICAgIGlmIChfbWV0YUNvbm5lY3RSZXF1ZXN0ICE9PSBudWxsICYmIF9tZXRhQ29ubmVjdFJlcXVlc3QuaWQgIT09IHJlcXVlc3RJZCkge1xuICAgICAgICAgICAgdGhyb3cgJ0xvbmdwb2xsIHJlcXVlc3QgbWlzbWF0Y2gsIGNvbXBsZXRpbmcgcmVxdWVzdCAnICsgcmVxdWVzdElkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzZXQgbWV0YUNvbm5lY3QgcmVxdWVzdFxuICAgICAgICBfbWV0YUNvbm5lY3RSZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfY29tcGxldGUocmVxdWVzdCwgc3VjY2Vzcykge1xuICAgICAgICB2YXIgaW5kZXggPSBVdGlscy5pbkFycmF5KHJlcXVlc3QsIF9yZXF1ZXN0cyk7XG4gICAgICAgIC8vIFRoZSBpbmRleCBjYW4gYmUgbmVnYXRpdmUgaWYgdGhlIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZFxuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgX3JlcXVlc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX2VudmVsb3Blcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgZW52ZWxvcGVBbmRSZXF1ZXN0ID0gX2VudmVsb3Blcy5zaGlmdCgpO1xuICAgICAgICAgICAgdmFyIG5leHRFbnZlbG9wZSA9IGVudmVsb3BlQW5kUmVxdWVzdFswXTtcbiAgICAgICAgICAgIHZhciBuZXh0UmVxdWVzdCA9IGVudmVsb3BlQW5kUmVxdWVzdFsxXTtcbiAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQgZGVxdWV1ZWQgcmVxdWVzdCcsIG5leHRSZXF1ZXN0LmlkKTtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0Q29uZmlndXJhdGlvbigpLmF1dG9CYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBfY29hbGVzY2VFbnZlbG9wZXMuY2FsbCh0aGlzLCBuZXh0RW52ZWxvcGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfcXVldWVTZW5kLmNhbGwodGhpcywgbmV4dEVudmVsb3BlKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0IGNvbXBsZXRlZCByZXF1ZXN0JywgcmVxdWVzdC5pZCwgbmV4dEVudmVsb3BlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gS2VlcCB0aGUgc2VtYW50aWMgb2YgY2FsbGluZyByZXNwb25zZSBjYWxsYmFja3MgYXN5bmNocm9ub3VzbHkgYWZ0ZXIgdGhlIHJlcXVlc3RcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNvbXBsZXRlKG5leHRSZXF1ZXN0LCBmYWxzZSwgbmV4dFJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFpbHVyZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlYXNvbjogJ1ByZXZpb3VzIHJlcXVlc3QgZmFpbGVkJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgeGhyID0gbmV4dFJlcXVlc3QueGhyO1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmh0dHBDb2RlID0gc2VsZi54aHJTdGF0dXMoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVudmVsb3BlLm9uRmFpbHVyZSh4aHIsIG5leHRFbnZlbG9wZS5tZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfc2VsZi5jb21wbGV0ZSA9IGZ1bmN0aW9uKHJlcXVlc3QsIHN1Y2Nlc3MsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgX21ldGFDb25uZWN0Q29tcGxldGUuY2FsbCh0aGlzLCByZXF1ZXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9jb21wbGV0ZS5jYWxsKHRoaXMsIHJlcXVlc3QsIHN1Y2Nlc3MpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHRoZSBhY3R1YWwgc2VuZCBkZXBlbmRpbmcgb24gdGhlIHRyYW5zcG9ydCB0eXBlIGRldGFpbHMuXG4gICAgICogQHBhcmFtIGVudmVsb3BlIHRoZSBlbnZlbG9wZSB0byBzZW5kXG4gICAgICogQHBhcmFtIHJlcXVlc3QgdGhlIHJlcXVlc3QgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBfc2VsZi50cmFuc3BvcnRTZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgX3NlbGYudHJhbnNwb3J0U3VjY2VzcyA9IGZ1bmN0aW9uKGVudmVsb3BlLCByZXF1ZXN0LCByZXNwb25zZXMpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmV4cGlyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlKHJlcXVlc3QsIHRydWUsIHJlcXVlc3QubWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlcyAmJiByZXNwb25zZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVudmVsb3BlLm9uU3VjY2VzcyhyZXNwb25zZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbnZlbG9wZS5vbkZhaWx1cmUocmVxdWVzdC54aHIsIGVudmVsb3BlLm1lc3NhZ2VzLCB7XG4gICAgICAgICAgICAgICAgICAgIGh0dHBDb2RlOiAyMDRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi50cmFuc3BvcnRGYWlsdXJlID0gZnVuY3Rpb24oZW52ZWxvcGUsIHJlcXVlc3QsIGZhaWx1cmUpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmV4cGlyZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLmNvbXBsZXRlKHJlcXVlc3QsIGZhbHNlLCByZXF1ZXN0Lm1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgIGVudmVsb3BlLm9uRmFpbHVyZShyZXF1ZXN0LnhociwgZW52ZWxvcGUubWVzc2FnZXMsIGZhaWx1cmUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9tZXRhQ29ubmVjdFNlbmQoZW52ZWxvcGUpIHtcbiAgICAgICAgaWYgKF9tZXRhQ29ubmVjdFJlcXVlc3QgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93ICdDb25jdXJyZW50IG1ldGFDb25uZWN0IHJlcXVlc3RzIG5vdCBhbGxvd2VkLCByZXF1ZXN0IGlkPScgKyBfbWV0YUNvbm5lY3RSZXF1ZXN0LmlkICsgJyBub3QgeWV0IGNvbXBsZXRlZCc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVxdWVzdElkID0gKytfcmVxdWVzdElkcztcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnbWV0YUNvbm5lY3Qgc2VuZCwgcmVxdWVzdCcsIHJlcXVlc3RJZCwgJ2VudmVsb3BlJywgZW52ZWxvcGUpO1xuICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgIGlkOiByZXF1ZXN0SWQsXG4gICAgICAgICAgICBtZXRhQ29ubmVjdDogdHJ1ZSxcbiAgICAgICAgICAgIGVudmVsb3BlOiBlbnZlbG9wZVxuICAgICAgICB9O1xuICAgICAgICBfdHJhbnNwb3J0U2VuZC5jYWxsKHRoaXMsIGVudmVsb3BlLCByZXF1ZXN0KTtcbiAgICAgICAgX21ldGFDb25uZWN0UmVxdWVzdCA9IHJlcXVlc3Q7XG4gICAgfVxuXG4gICAgX3NlbGYuc2VuZCA9IGZ1bmN0aW9uKGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICBpZiAobWV0YUNvbm5lY3QpIHtcbiAgICAgICAgICAgIF9tZXRhQ29ubmVjdFNlbmQuY2FsbCh0aGlzLCBlbnZlbG9wZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcXVldWVTZW5kLmNhbGwodGhpcywgZW52ZWxvcGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIF9zdXBlci5hYm9ydCgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9yZXF1ZXN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSBfcmVxdWVzdHNbaV07XG4gICAgICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdBYm9ydGluZyByZXF1ZXN0JywgcmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmFib3J0WEhSKHJlcXVlc3QueGhyKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydEZhaWx1cmUocmVxdWVzdC5lbnZlbG9wZSwgcmVxdWVzdCwge3JlYXNvbjogJ2Fib3J0J30pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoX21ldGFDb25uZWN0UmVxdWVzdCkge1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0Fib3J0aW5nIG1ldGFDb25uZWN0IHJlcXVlc3QnLCBfbWV0YUNvbm5lY3RSZXF1ZXN0KTtcbiAgICAgICAgICAgIGlmICghdGhpcy5hYm9ydFhIUihfbWV0YUNvbm5lY3RSZXF1ZXN0LnhocikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydEZhaWx1cmUoX21ldGFDb25uZWN0UmVxdWVzdC5lbnZlbG9wZSwgX21ldGFDb25uZWN0UmVxdWVzdCwge3JlYXNvbjogJ2Fib3J0J30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gICAgfTtcblxuICAgIF9zZWxmLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBfc3VwZXIucmVzZXQoaW5pdCk7XG4gICAgICAgIF9tZXRhQ29ubmVjdFJlcXVlc3QgPSBudWxsO1xuICAgICAgICBfcmVxdWVzdHMgPSBbXTtcbiAgICAgICAgX2VudmVsb3BlcyA9IFtdO1xuICAgIH07XG5cbiAgICBfc2VsZi5hYm9ydFhIUiA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgICBpZiAoeGhyKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHhoci5yZWFkeVN0YXRlO1xuICAgICAgICAgICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZSAhPT0gWE1MSHR0cFJlcXVlc3QuVU5TRU5UO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgX3NlbGYueGhyU3RhdHVzID0gZnVuY3Rpb24oeGhyKSB7XG4gICAgICAgIGlmICh4aHIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHhoci5zdGF0dXM7XG4gICAgICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGVidWcoeCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwidmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbi8qKlxuICogQmFzZSBvYmplY3Qgd2l0aCB0aGUgY29tbW9uIGZ1bmN0aW9uYWxpdHkgZm9yIHRyYW5zcG9ydHMuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gVHJhbnNwb3J0KCkge1xuICAgIHZhciBfdHlwZTtcbiAgICB2YXIgX2NvbWV0ZDtcbiAgICB2YXIgX3VybDtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIGludm9rZWQganVzdCBhZnRlciBhIHRyYW5zcG9ydCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcmVnaXN0ZXJlZC5cbiAgICAgKiBAcGFyYW0gdHlwZSB0aGUgdHlwZSBvZiB0cmFuc3BvcnQgKGZvciBleGFtcGxlICdsb25nLXBvbGxpbmcnKVxuICAgICAqIEBwYXJhbSBjb21ldGQgdGhlIGNvbWV0ZCBvYmplY3QgdGhpcyB0cmFuc3BvcnQgaGFzIGJlZW4gcmVnaXN0ZXJlZCB0b1xuICAgICAqIEBzZWUgI3VucmVnaXN0ZXJlZCgpXG4gICAgICovXG4gICAgdGhpcy5yZWdpc3RlcmVkID0gZnVuY3Rpb24odHlwZSwgY29tZXRkKSB7XG4gICAgICAgIF90eXBlID0gdHlwZTtcbiAgICAgICAgX2NvbWV0ZCA9IGNvbWV0ZDtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gaW52b2tlZCBqdXN0IGFmdGVyIGEgdHJhbnNwb3J0IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB1bnJlZ2lzdGVyZWQuXG4gICAgICogQHNlZSAjcmVnaXN0ZXJlZCh0eXBlLCBjb21ldGQpXG4gICAgICovXG4gICAgdGhpcy51bnJlZ2lzdGVyZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX3R5cGUgPSBudWxsO1xuICAgICAgICBfY29tZXRkID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgX2NvbWV0ZC5fZGVidWcuYXBwbHkoX2NvbWV0ZCwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fbWl4aW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9jb21ldGQuX21peGluLmFwcGx5KF9jb21ldGQsIGFyZ3VtZW50cyk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0QWR2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfY29tZXRkLmdldEFkdmljZSgpO1xuICAgIH07XG5cbiAgICB0aGlzLnNldFRpbWVvdXQgPSBmdW5jdGlvbihmdW5rdGlvbiwgZGVsYXkpIHtcbiAgICAgICAgcmV0dXJuIFV0aWxzLnNldFRpbWVvdXQoX2NvbWV0ZCwgZnVua3Rpb24sIGRlbGF5KTtcbiAgICB9O1xuXG4gICAgdGhpcy5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICAgICAgVXRpbHMuY2xlYXJUaW1lb3V0KGhhbmRsZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoZSBnaXZlbiByZXNwb25zZSBpbnRvIGFuIGFycmF5IG9mIGJheWV1eCBtZXNzYWdlc1xuICAgICAqIEBwYXJhbSByZXNwb25zZSB0aGUgcmVzcG9uc2UgdG8gY29udmVydFxuICAgICAqIEByZXR1cm4gYW4gYXJyYXkgb2YgYmF5ZXV4IG1lc3NhZ2VzIG9idGFpbmVkIGJ5IGNvbnZlcnRpbmcgdGhlIHJlc3BvbnNlXG4gICAgICovXG4gICAgdGhpcy5jb252ZXJ0VG9NZXNzYWdlcyA9IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChVdGlscy5pc1N0cmluZyhyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2RlYnVnKCdDb3VsZCBub3QgY29udmVydCB0byBKU09OIHRoZSBmb2xsb3dpbmcgc3RyaW5nJywgJ1wiJyArIHJlc3BvbnNlICsgJ1wiJyk7XG4gICAgICAgICAgICAgICAgdGhyb3cgeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoVXRpbHMuaXNBcnJheShyZXNwb25zZSkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzcG9uc2UgPT09IHVuZGVmaW5lZCB8fCByZXNwb25zZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNwb25zZSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIFtyZXNwb25zZV07XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgJ0NvbnZlcnNpb24gRXJyb3IgJyArIHJlc3BvbnNlICsgJywgdHlwZW9mICcgKyAodHlwZW9mIHJlc3BvbnNlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgdHJhbnNwb3J0IGNhbiB3b3JrIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbiBhbmQgY3Jvc3MgZG9tYWluIGNvbW11bmljYXRpb24gY2FzZS5cbiAgICAgKiBAcGFyYW0gdmVyc2lvbiBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSB0cmFuc3BvcnQgdmVyc2lvblxuICAgICAqIEBwYXJhbSBjcm9zc0RvbWFpbiBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb21tdW5pY2F0aW9uIGlzIGNyb3NzIGRvbWFpblxuICAgICAqIEBwYXJhbSB1cmwgdGhlIFVSTCB0byBjb25uZWN0IHRvXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoaXMgdHJhbnNwb3J0IGNhbiB3b3JrIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbiBhbmQgY3Jvc3MgZG9tYWluIGNvbW11bmljYXRpb24gY2FzZSxcbiAgICAgKiBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICB0aGlzLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgdGhyb3cgJ0Fic3RyYWN0JztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdHlwZSBvZiB0aGlzIHRyYW5zcG9ydC5cbiAgICAgKiBAc2VlICNyZWdpc3RlcmVkKHR5cGUsIGNvbWV0ZClcbiAgICAgKi9cbiAgICB0aGlzLmdldFR5cGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90eXBlO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX3VybDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRVUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICAgICAgX3VybCA9IHVybDtcbiAgICB9O1xuXG4gICAgdGhpcy5zZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHRocm93ICdBYnN0cmFjdCc7XG4gICAgfTtcblxuICAgIHRoaXMucmVzZXQgPSBmdW5jdGlvbihpbml0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHlwZSwgJ3Jlc2V0JywgaW5pdCA/ICdpbml0aWFsJyA6ICdyZXRyeScpO1xuICAgIH07XG5cbiAgICB0aGlzLmFib3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCBfdHlwZSwgJ2Fib3J0ZWQnKTtcbiAgICB9O1xuXG4gICAgdGhpcy50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlKCk7XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmRlcml2ZSA9IGZ1bmN0aW9uKGJhc2VPYmplY3QpIHtcbiAgICBmdW5jdGlvbiBGKCkge1xuICAgIH1cblxuICAgIEYucHJvdG90eXBlID0gYmFzZU9iamVjdDtcbiAgICByZXR1cm4gbmV3IEYoKTtcbn07XG4iLCIvKipcbiAqIEEgcmVnaXN0cnkgZm9yIHRyYW5zcG9ydHMgdXNlZCBieSB0aGUgQ29tZXREIG9iamVjdC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBUcmFuc3BvcnRSZWdpc3RyeSgpIHtcbiAgICB2YXIgX3R5cGVzID0gW107XG4gICAgdmFyIF90cmFuc3BvcnRzID0ge307XG5cbiAgICB0aGlzLmdldFRyYW5zcG9ydFR5cGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdHlwZXMuc2xpY2UoMCk7XG4gICAgfTtcblxuICAgIHRoaXMuZmluZFRyYW5zcG9ydFR5cGVzID0gZnVuY3Rpb24odmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IF90eXBlc1tpXTtcbiAgICAgICAgICAgIGlmIChfdHJhbnNwb3J0c1t0eXBlXS5hY2NlcHQodmVyc2lvbiwgY3Jvc3NEb21haW4sIHVybCkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aGlzLm5lZ290aWF0ZVRyYW5zcG9ydCA9IGZ1bmN0aW9uKHR5cGVzLCB2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgdHlwZSA9IF90eXBlc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdHlwZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gdHlwZXNbal0pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zcG9ydCA9IF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNwb3J0LmFjY2VwdCh2ZXJzaW9uLCBjcm9zc0RvbWFpbiwgdXJsKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGQgPSBmdW5jdGlvbih0eXBlLCB0cmFuc3BvcnQsIGluZGV4KSB7XG4gICAgICAgIHZhciBleGlzdGluZyA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IF90eXBlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKF90eXBlc1tpXSA9PT0gdHlwZSkge1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgX3R5cGVzLnB1c2godHlwZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF90eXBlcy5zcGxpY2UoaW5kZXgsIDAsIHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RyYW5zcG9ydHNbdHlwZV0gPSB0cmFuc3BvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gIWV4aXN0aW5nO1xuICAgIH07XG5cbiAgICB0aGlzLmZpbmQgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3R5cGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoX3R5cGVzW2ldID09PSB0eXBlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90cmFuc3BvcnRzW3R5cGVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChfdHlwZXNbaV0gPT09IHR5cGUpIHtcbiAgICAgICAgICAgICAgICBfdHlwZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHZhciB0cmFuc3BvcnQgPSBfdHJhbnNwb3J0c1t0eXBlXTtcbiAgICAgICAgICAgICAgICBkZWxldGUgX3RyYW5zcG9ydHNbdHlwZV07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zcG9ydDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgdGhpcy5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfdHlwZXMgPSBbXTtcbiAgICAgICAgX3RyYW5zcG9ydHMgPSB7fTtcbiAgICB9O1xuXG4gICAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKGluaXQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdHlwZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIF90cmFuc3BvcnRzW190eXBlc1tpXV0ucmVzZXQoaW5pdCk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcbiIsImV4cG9ydHMuaXNTdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nO1xufTtcblxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBBcnJheTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBnaXZlbiBlbGVtZW50IGlzIGNvbnRhaW5lZCBpbnRvIHRoZSBnaXZlbiBhcnJheS5cbiAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGNoZWNrIHByZXNlbmNlIGZvclxuICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSB0byBjaGVjayBmb3IgdGhlIGVsZW1lbnQgcHJlc2VuY2VcbiAqIEByZXR1cm4gdGhlIGluZGV4IG9mIHRoZSBlbGVtZW50LCBpZiBwcmVzZW50LCBvciBhIG5lZ2F0aXZlIGluZGV4IGlmIHRoZSBlbGVtZW50IGlzIG5vdCBwcmVzZW50XG4gKi9cbmV4cG9ydHMuaW5BcnJheSA9IGZ1bmN0aW9uIChlbGVtZW50LCBhcnJheSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IGFycmF5W2ldKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59O1xuXG5leHBvcnRzLnNldFRpbWVvdXQgPSBmdW5jdGlvbiAoY29tZXRkLCBmdW5rdGlvbiwgZGVsYXkpIHtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbWV0ZC5fZGVidWcoJ0ludm9raW5nIHRpbWVkIGZ1bmN0aW9uJywgZnVua3Rpb24pO1xuICAgICAgICAgICAgZnVua3Rpb24oKTtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgY29tZXRkLl9kZWJ1ZygnRXhjZXB0aW9uIGludm9raW5nIHRpbWVkIGZ1bmN0aW9uJywgZnVua3Rpb24sIHgpO1xuICAgICAgICB9XG4gICAgfSwgZGVsYXkpO1xufTtcblxuZXhwb3J0cy5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAodGltZW91dEhhbmRsZSkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKTtcbn07XG4iLCJ2YXIgVHJhbnNwb3J0ID0gcmVxdWlyZSgnLi9UcmFuc3BvcnQnKVxudmFyIFV0aWxzID0gcmVxdWlyZSgnLi9VdGlscycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gV2ViU29ja2V0VHJhbnNwb3J0KCkge1xuICAgIHZhciBfc3VwZXIgPSBuZXcgVHJhbnNwb3J0KCk7XG4gICAgdmFyIF9zZWxmID0gVHJhbnNwb3J0LmRlcml2ZShfc3VwZXIpO1xuICAgIHZhciBfY29tZXRkO1xuICAgIC8vIEJ5IGRlZmF1bHQgV2ViU29ja2V0IGlzIHN1cHBvcnRlZFxuICAgIHZhciBfd2ViU29ja2V0U3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAvLyBXaGV0aGVyIHdlIHdlcmUgYWJsZSB0byBlc3RhYmxpc2ggYSBXZWJTb2NrZXQgY29ubmVjdGlvblxuICAgIHZhciBfd2ViU29ja2V0Q29ubmVjdGVkID0gZmFsc2U7XG4gICAgdmFyIF9zdGlja3lSZWNvbm5lY3QgPSB0cnVlO1xuICAgIC8vIFRoZSBjb250ZXh0IGNvbnRhaW5zIHRoZSBlbnZlbG9wZXMgdGhhdCBoYXZlIGJlZW4gc2VudFxuICAgIC8vIGFuZCB0aGUgdGltZW91dHMgZm9yIHRoZSBtZXNzYWdlcyB0aGF0IGhhdmUgYmVlbiBzZW50LlxuICAgIHZhciBfY29udGV4dCA9IG51bGw7XG4gICAgdmFyIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICB2YXIgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHZhciBfc3VjY2Vzc0NhbGxiYWNrID0gbnVsbDtcblxuICAgIF9zZWxmLnJlc2V0ID0gZnVuY3Rpb24oaW5pdCkge1xuICAgICAgICBfc3VwZXIucmVzZXQoaW5pdCk7XG4gICAgICAgIF93ZWJTb2NrZXRTdXBwb3J0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoaW5pdCkge1xuICAgICAgICAgICAgX3dlYlNvY2tldENvbm5lY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIF9zdGlja3lSZWNvbm5lY3QgPSB0cnVlO1xuICAgICAgICBfY29udGV4dCA9IG51bGw7XG4gICAgICAgIF9jb25uZWN0aW5nID0gbnVsbDtcbiAgICAgICAgX2Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZm9yY2VDbG9zZShjb250ZXh0LCBldmVudCkge1xuICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy53ZWJTb2NrZXRDbG9zZShjb250ZXh0LCBldmVudC5jb2RlLCBldmVudC5yZWFzb24pO1xuICAgICAgICAgICAgLy8gRm9yY2UgaW1tZWRpYXRlIGZhaWx1cmUgb2YgcGVuZGluZyBtZXNzYWdlcyB0byB0cmlnZ2VyIHJlY29ubmVjdC5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIHNlcnZlciBtYXkgbm90IHJlcGx5IHRvIG91ciBjbG9zZSgpXG4gICAgICAgICAgICAvLyBhbmQgdGhlcmVmb3JlIHRoZSBvbmNsb3NlIGZ1bmN0aW9uIGlzIG5ldmVyIGNhbGxlZC5cbiAgICAgICAgICAgIHRoaXMub25DbG9zZShjb250ZXh0LCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfc2FtZUNvbnRleHQoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gY29udGV4dCA9PT0gX2Nvbm5lY3RpbmcgfHwgY29udGV4dCA9PT0gX2NvbnRleHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3N0b3JlRW52ZWxvcGUoY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHZhciBtZXNzYWdlSWRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW52ZWxvcGUubWVzc2FnZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZW52ZWxvcGUubWVzc2FnZXNbaV07XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5pZCkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmVudmVsb3Blc1ttZXNzYWdlSWRzLmpvaW4oJywnKV0gPSBbZW52ZWxvcGUsIG1ldGFDb25uZWN0XTtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnc3RvcmVkIGVudmVsb3BlLCBlbnZlbG9wZXMnLCBjb250ZXh0LmVudmVsb3Blcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3dlYnNvY2tldENvbm5lY3QoY29udGV4dCkge1xuICAgICAgICAvLyBXZSBtYXkgaGF2ZSBtdWx0aXBsZSBhdHRlbXB0cyB0byBvcGVuIGEgV2ViU29ja2V0XG4gICAgICAgIC8vIGNvbm5lY3Rpb24sIGZvciBleGFtcGxlIGEgL21ldGEvY29ubmVjdCByZXF1ZXN0IHRoYXRcbiAgICAgICAgLy8gbWF5IHRha2UgdGltZSwgYWxvbmcgd2l0aCBhIHVzZXItdHJpZ2dlcmVkIHB1Ymxpc2guXG4gICAgICAgIC8vIEVhcmx5IHJldHVybiBpZiB3ZSBhcmUgYWxyZWFkeSBjb25uZWN0aW5nLlxuICAgICAgICBpZiAoX2Nvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1hbmdsZSB0aGUgVVJMLCBjaGFuZ2luZyB0aGUgc2NoZW1lIGZyb20gJ2h0dHAnIHRvICd3cycuXG4gICAgICAgIHZhciB1cmwgPSBfY29tZXRkLmdldFVSTCgpLnJlcGxhY2UoL15odHRwLywgJ3dzJyk7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2Nvbm5lY3RpbmcgdG8gVVJMJywgdXJsKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHByb3RvY29sID0gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCkucHJvdG9jb2w7XG4gICAgICAgICAgICBjb250ZXh0LndlYlNvY2tldCA9IHByb3RvY29sID8gbmV3IFdlYlNvY2tldCh1cmwsIHByb3RvY29sKSA6IG5ldyBXZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICAgIF9jb25uZWN0aW5nID0gY29udGV4dDtcbiAgICAgICAgfSBjYXRjaCAoeCkge1xuICAgICAgICAgICAgX3dlYlNvY2tldFN1cHBvcnRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZGVidWcoJ0V4Y2VwdGlvbiB3aGlsZSBjcmVhdGluZyBXZWJTb2NrZXQgb2JqZWN0JywgeCk7XG4gICAgICAgICAgICB0aHJvdyB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgZGVmYXVsdCB1c2Ugc3RpY2t5IHJlY29ubmVjdHMuXG4gICAgICAgIF9zdGlja3lSZWNvbm5lY3QgPSBfY29tZXRkLmdldENvbmZpZ3VyYXRpb24oKS5zdGlja3lSZWNvbm5lY3QgIT09IGZhbHNlO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNvbm5lY3RUaW1lb3V0ID0gX2NvbWV0ZC5nZXRDb25maWd1cmF0aW9uKCkuY29ubmVjdFRpbWVvdXQ7XG4gICAgICAgIGlmIChjb25uZWN0VGltZW91dCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRleHQuY29ubmVjdFRpbWVyID0gdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIF9jb21ldGQuX2RlYnVnKCdUcmFuc3BvcnQnLCBzZWxmLmdldFR5cGUoKSwgJ3RpbWVkIG91dCB3aGlsZSBjb25uZWN0aW5nIHRvIFVSTCcsIHVybCwgJzonLCBjb25uZWN0VGltZW91dCwgJ21zJyk7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvbm5lY3Rpb24gd2FzIG5vdCBvcGVuZWQsIGNsb3NlIGFueXdheS5cbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdDb25uZWN0IFRpbWVvdXQnfSk7XG4gICAgICAgICAgICB9LCBjb25uZWN0VGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb25vcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBfY29tZXRkLl9kZWJ1ZygnV2ViU29ja2V0IG9ub3BlbicsIGNvbnRleHQpO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuY29ubmVjdFRpbWVyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jbGVhclRpbWVvdXQoY29udGV4dC5jb25uZWN0VGltZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoX3NhbWVDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgICAgICAgICAgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIF9jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgICAgICAgICBfd2ViU29ja2V0Q29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLm9uT3Blbihjb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIHZhbGlkIGNvbm5lY3Rpb24gYWxyZWFkeSwgY2xvc2UgdGhpcyBvbmUuXG4gICAgICAgICAgICAgICAgX2NvbWV0ZC5fd2FybignQ2xvc2luZyBleHRyYSBXZWJTb2NrZXQgY29ubmVjdGlvbicsIHRoaXMsICdhY3RpdmUgY29ubmVjdGlvbicsIF9jb250ZXh0KTtcbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtjb2RlOiAxMDAwLCByZWFzb246ICdFeHRyYSBDb25uZWN0aW9uJ30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoaXMgY2FsbGJhY2sgaXMgaW52b2tlZCB3aGVuIHRoZSBzZXJ2ZXIgc2VuZHMgdGhlIGNsb3NlIGZyYW1lLlxuICAgICAgICAvLyBUaGUgY2xvc2UgZnJhbWUgZm9yIGEgY29ubmVjdGlvbiBtYXkgYXJyaXZlICphZnRlciogYW5vdGhlclxuICAgICAgICAvLyBjb25uZWN0aW9uIGhhcyBiZWVuIG9wZW5lZCwgc28gd2UgbXVzdCBtYWtlIHN1cmUgdGhhdCBhY3Rpb25zXG4gICAgICAgIC8vIGFyZSBwZXJmb3JtZWQgb25seSBpZiBpdCdzIHRoZSBzYW1lIGNvbm5lY3Rpb24uXG4gICAgICAgIHZhciBvbmNsb3NlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50ID0gZXZlbnQgfHwge2NvZGU6IDEwMDB9O1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1dlYlNvY2tldCBvbmNsb3NlJywgY29udGV4dCwgZXZlbnQsICdjb25uZWN0aW5nJywgX2Nvbm5lY3RpbmcsICdjdXJyZW50JywgX2NvbnRleHQpO1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dC5jb25uZWN0VGltZXIpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNsZWFyVGltZW91dChjb250ZXh0LmNvbm5lY3RUaW1lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYub25DbG9zZShjb250ZXh0LCBldmVudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIG9ubWVzc2FnZSA9IGZ1bmN0aW9uKHdzTWVzc2FnZSkge1xuICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1dlYlNvY2tldCBvbm1lc3NhZ2UnLCB3c01lc3NhZ2UsIGNvbnRleHQpO1xuICAgICAgICAgICAgc2VsZi5vbk1lc3NhZ2UoY29udGV4dCwgd3NNZXNzYWdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbm9wZW4gPSBvbm9wZW47XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0Lm9uY2xvc2UgPSBvbmNsb3NlO1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBDbGllbnRzIHNob3VsZCBjYWxsIG9uY2xvc2UoKSwgYnV0IGlmIHRoZXkgZG8gbm90IHdlIGRvIGl0IGhlcmUgZm9yIHNhZmV0eS5cbiAgICAgICAgICAgIG9uY2xvc2Uoe2NvZGU6IDEwMDAsIHJlYXNvbjogJ0Vycm9yJ30pO1xuICAgICAgICB9O1xuICAgICAgICBjb250ZXh0LndlYlNvY2tldC5vbm1lc3NhZ2UgPSBvbm1lc3NhZ2U7XG5cbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnY29uZmlndXJlZCBjYWxsYmFja3Mgb24nLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2ViU29ja2V0U2VuZChjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpIHtcbiAgICAgICAgdmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShlbnZlbG9wZS5tZXNzYWdlcyk7XG4gICAgICAgIGNvbnRleHQud2ViU29ja2V0LnNlbmQoanNvbik7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbnQnLCBlbnZlbG9wZSwgJ21ldGFDb25uZWN0ID0nLCBtZXRhQ29ubmVjdCk7XG5cbiAgICAgICAgLy8gTWFuYWdlIHRoZSB0aW1lb3V0IHdhaXRpbmcgZm9yIHRoZSByZXNwb25zZS5cbiAgICAgICAgdmFyIG1heERlbGF5ID0gdGhpcy5nZXRDb25maWd1cmF0aW9uKCkubWF4TmV0d29ya0RlbGF5O1xuICAgICAgICB2YXIgZGVsYXkgPSBtYXhEZWxheTtcbiAgICAgICAgaWYgKG1ldGFDb25uZWN0KSB7XG4gICAgICAgICAgICBkZWxheSArPSB0aGlzLmdldEFkdmljZSgpLnRpbWVvdXQ7XG4gICAgICAgICAgICBfY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIG1lc3NhZ2VJZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnZlbG9wZS5tZXNzYWdlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gZW52ZWxvcGUubWVzc2FnZXNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnRpbWVvdXRzW21lc3NhZ2UuaWRdID0gdGhpcy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbWV0ZC5fZGVidWcoJ1RyYW5zcG9ydCcsIHNlbGYuZ2V0VHlwZSgpLCAndGltaW5nIG91dCBtZXNzYWdlJywgbWVzc2FnZS5pZCwgJ2FmdGVyJywgZGVsYXksICdvbicsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbChzZWxmLCBjb250ZXh0LCB7Y29kZTogMTAwMCwgcmVhc29uOiAnTWVzc2FnZSBUaW1lb3V0J30pO1xuICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3dhaXRpbmcgYXQgbW9zdCcsIGRlbGF5LCAnbXMgZm9yIG1lc3NhZ2VzJywgbWVzc2FnZUlkcywgJ21heE5ldHdvcmtEZWxheScsIG1heERlbGF5LCAnLCB0aW1lb3V0czonLCBjb250ZXh0LnRpbWVvdXRzKTtcbiAgICB9XG5cbiAgICBfc2VsZi5fbm90aWZ5U3VjY2VzcyA9IGZ1bmN0aW9uKGZuLCBtZXNzYWdlcykge1xuICAgICAgICBmbi5jYWxsKHRoaXMsIG1lc3NhZ2VzKTtcbiAgICB9O1xuXG4gICAgX3NlbGYuX25vdGlmeUZhaWx1cmUgPSBmdW5jdGlvbihmbiwgY29udGV4dCwgbWVzc2FnZXMsIGZhaWx1cmUpIHtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCBjb250ZXh0LCBtZXNzYWdlcywgZmFpbHVyZSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9zZW5kKGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gX2Nvbm5lY3RpbmcgfHwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW52ZWxvcGVzOiB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXRzOiB7fVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIF9zdG9yZUVudmVsb3BlLmNhbGwodGhpcywgY29udGV4dCwgZW52ZWxvcGUsIG1ldGFDb25uZWN0KTtcbiAgICAgICAgICAgICAgICBfd2Vic29ja2V0Q29ubmVjdC5jYWxsKHRoaXMsIGNvbnRleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfc3RvcmVFbnZlbG9wZS5jYWxsKHRoaXMsIGNvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgICAgICAgICAgX3dlYlNvY2tldFNlbmQuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRoZSBzZW1hbnRpYyBvZiBjYWxsaW5nIHJlc3BvbnNlIGNhbGxiYWNrcyBhc3luY2hyb25vdXNseSBhZnRlciB0aGUgcmVxdWVzdC5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfZm9yY2VDbG9zZS5jYWxsKHNlbGYsIGNvbnRleHQsIHtcbiAgICAgICAgICAgICAgICAgICAgY29kZTogMTAwMCxcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uOiAnRXhjZXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgZXhjZXB0aW9uOiB4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9zZWxmLm9uT3BlbiA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgICAgdmFyIGVudmVsb3BlcyA9IGNvbnRleHQuZW52ZWxvcGVzO1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdvcGVuZWQnLCBjb250ZXh0LCAncGVuZGluZyBtZXNzYWdlcycsIGVudmVsb3Blcyk7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgIGlmIChlbnZlbG9wZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZW52ZWxvcGVzW2tleV07XG4gICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgICAgICB2YXIgbWV0YUNvbm5lY3QgPSBlbGVtZW50WzFdO1xuICAgICAgICAgICAgICAgIC8vIFN0b3JlIHRoZSBzdWNjZXNzIGNhbGxiYWNrLCB3aGljaCBpcyBpbmRlcGVuZGVudCBmcm9tIHRoZSBlbnZlbG9wZSxcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIHRvIG5vdGlmeSBhcnJpdmFsIG9mIG1lc3NhZ2VzLlxuICAgICAgICAgICAgICAgIF9zdWNjZXNzQ2FsbGJhY2sgPSBlbnZlbG9wZS5vblN1Y2Nlc3M7XG4gICAgICAgICAgICAgICAgX3dlYlNvY2tldFNlbmQuY2FsbCh0aGlzLCBjb250ZXh0LCBlbnZlbG9wZSwgbWV0YUNvbm5lY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9zZWxmLm9uTWVzc2FnZSA9IGZ1bmN0aW9uKGNvbnRleHQsIHdzTWVzc2FnZSkge1xuICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZWNlaXZlZCB3ZWJzb2NrZXQgbWVzc2FnZScsIHdzTWVzc2FnZSwgY29udGV4dCk7XG5cbiAgICAgICAgdmFyIGNsb3NlID0gZmFsc2U7XG4gICAgICAgIHZhciBtZXNzYWdlcyA9IHRoaXMuY29udmVydFRvTWVzc2FnZXMod3NNZXNzYWdlLmRhdGEpO1xuICAgICAgICB2YXIgbWVzc2FnZUlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldO1xuXG4gICAgICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIG1lc3NhZ2UgaXMgYSByZXNwb25zZSB0byBhIHJlcXVlc3Qgd2UgbWFkZS5cbiAgICAgICAgICAgIC8vIElmIGl0J3MgYSBtZXRhIG1lc3NhZ2UsIGZvciBzdXJlIGl0J3MgYSByZXNwb25zZTsgb3RoZXJ3aXNlIGl0J3NcbiAgICAgICAgICAgIC8vIGEgcHVibGlzaCBtZXNzYWdlIGFuZCBwdWJsaXNoIHJlc3BvbnNlcyBkb24ndCBoYXZlIHRoZSBkYXRhIGZpZWxkLlxuICAgICAgICAgICAgaWYgKC9eXFwvbWV0YVxcLy8udGVzdChtZXNzYWdlLmNoYW5uZWwpIHx8IG1lc3NhZ2UuZGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gY29udGV4dC50aW1lb3V0c1ttZXNzYWdlLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQudGltZW91dHNbbWVzc2FnZS5pZF07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZW1vdmVkIHRpbWVvdXQgZm9yIG1lc3NhZ2UnLCBtZXNzYWdlLmlkLCAnLCB0aW1lb3V0cycsIGNvbnRleHQudGltZW91dHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJy9tZXRhL2Nvbm5lY3QnID09PSBtZXNzYWdlLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJy9tZXRhL2Rpc2Nvbm5lY3QnID09PSBtZXNzYWdlLmNoYW5uZWwgJiYgIV9jb25uZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjbG9zZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIGVudmVsb3BlIGNvcnJlc3BvbmRpbmcgdG8gdGhlIG1lc3NhZ2VzLlxuICAgICAgICB2YXIgcmVtb3ZlZCA9IGZhbHNlO1xuICAgICAgICB2YXIgZW52ZWxvcGVzID0gY29udGV4dC5lbnZlbG9wZXM7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWVzc2FnZUlkcy5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgdmFyIGlkID0gbWVzc2FnZUlkc1tqXTtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZW52ZWxvcGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkcyA9IGtleS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBVdGlscy5pbkFycmF5KGlkLCBpZHMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IGVudmVsb3Blc1trZXldWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1ldGFDb25uZWN0ID0gZW52ZWxvcGVzW2tleV1bMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZW52ZWxvcGVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZXNbaWRzLmpvaW4oJywnKV0gPSBbZW52ZWxvcGUsIG1ldGFDb25uZWN0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1ZygnVHJhbnNwb3J0JywgdGhpcy5nZXRUeXBlKCksICdyZW1vdmVkIGVudmVsb3BlLCBlbnZlbG9wZXMnLCBlbnZlbG9wZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbm90aWZ5U3VjY2Vzcyhfc3VjY2Vzc0NhbGxiYWNrLCBtZXNzYWdlcyk7XG5cbiAgICAgICAgaWYgKGNsb3NlKSB7XG4gICAgICAgICAgICB0aGlzLndlYlNvY2tldENsb3NlKGNvbnRleHQsIDEwMDAsICdEaXNjb25uZWN0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NlbGYub25DbG9zZSA9IGZ1bmN0aW9uKGNvbnRleHQsIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ2Nsb3NlZCcsIGNvbnRleHQsIGV2ZW50KTtcblxuICAgICAgICBpZiAoX3NhbWVDb250ZXh0KGNvbnRleHQpKSB7XG4gICAgICAgICAgICAvLyBSZW1lbWJlciBpZiB3ZSB3ZXJlIGFibGUgdG8gY29ubmVjdC5cbiAgICAgICAgICAgIC8vIFRoaXMgY2xvc2UgZXZlbnQgY291bGQgYmUgZHVlIHRvIHNlcnZlciBzaHV0ZG93bixcbiAgICAgICAgICAgIC8vIGFuZCBpZiBpdCByZXN0YXJ0cyB3ZSB3YW50IHRvIHRyeSB3ZWJzb2NrZXQgYWdhaW4uXG4gICAgICAgICAgICBfd2ViU29ja2V0U3VwcG9ydGVkID0gX3N0aWNreVJlY29ubmVjdCAmJiBfd2ViU29ja2V0Q29ubmVjdGVkO1xuICAgICAgICAgICAgX2Nvbm5lY3RpbmcgPSBudWxsO1xuICAgICAgICAgICAgX2NvbnRleHQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRpbWVvdXRzID0gY29udGV4dC50aW1lb3V0cztcbiAgICAgICAgY29udGV4dC50aW1lb3V0cyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpZCBpbiB0aW1lb3V0cykge1xuICAgICAgICAgICAgaWYgKHRpbWVvdXRzLmhhc093blByb3BlcnR5KGlkKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHRpbWVvdXRzW2lkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZW52ZWxvcGVzID0gY29udGV4dC5lbnZlbG9wZXM7XG4gICAgICAgIGNvbnRleHQuZW52ZWxvcGVzID0ge307XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBlbnZlbG9wZXMpIHtcbiAgICAgICAgICAgIGlmIChlbnZlbG9wZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IGVudmVsb3Blc1trZXldWzBdO1xuICAgICAgICAgICAgICAgIHZhciBtZXRhQ29ubmVjdCA9IGVudmVsb3Blc1trZXldWzFdO1xuICAgICAgICAgICAgICAgIGlmIChtZXRhQ29ubmVjdCkge1xuICAgICAgICAgICAgICAgICAgICBfY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBmYWlsdXJlID0ge1xuICAgICAgICAgICAgICAgICAgICB3ZWJzb2NrZXRDb2RlOiBldmVudC5jb2RlLFxuICAgICAgICAgICAgICAgICAgICByZWFzb246IGV2ZW50LnJlYXNvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBmYWlsdXJlLmV4Y2VwdGlvbiA9IGV2ZW50LmV4Y2VwdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fbm90aWZ5RmFpbHVyZShlbnZlbG9wZS5vbkZhaWx1cmUsIGNvbnRleHQsIGVudmVsb3BlLm1lc3NhZ2VzLCBmYWlsdXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5yZWdpc3RlcmVkID0gZnVuY3Rpb24odHlwZSwgY29tZXRkKSB7XG4gICAgICAgIF9zdXBlci5yZWdpc3RlcmVkKHR5cGUsIGNvbWV0ZCk7XG4gICAgICAgIF9jb21ldGQgPSBjb21ldGQ7XG4gICAgfTtcblxuICAgIF9zZWxmLmFjY2VwdCA9IGZ1bmN0aW9uKHZlcnNpb24sIGNyb3NzRG9tYWluLCB1cmwpIHtcbiAgICAgICAgdGhpcy5fZGVidWcoJ1RyYW5zcG9ydCcsIHRoaXMuZ2V0VHlwZSgpLCAnYWNjZXB0LCBzdXBwb3J0ZWQ6JywgX3dlYlNvY2tldFN1cHBvcnRlZCk7XG4gICAgICAgIC8vIFVzaW5nICEhIHRvIHJldHVybiBhIGJvb2xlYW4gKGFuZCBub3QgdGhlIFdlYlNvY2tldCBvYmplY3QpLlxuICAgICAgICByZXR1cm4gX3dlYlNvY2tldFN1cHBvcnRlZCAmJiAhKCd1bmRlZmluZWQnID09PSB0eXBlb2YgV2ViU29ja2V0KSAmJiBfY29tZXRkLndlYnNvY2tldEVuYWJsZWQgIT09IGZhbHNlO1xuICAgIH07XG5cbiAgICBfc2VsZi5zZW5kID0gZnVuY3Rpb24oZW52ZWxvcGUsIG1ldGFDb25uZWN0KSB7XG4gICAgICAgIHRoaXMuX2RlYnVnKCdUcmFuc3BvcnQnLCB0aGlzLmdldFR5cGUoKSwgJ3NlbmRpbmcnLCBlbnZlbG9wZSwgJ21ldGFDb25uZWN0ID0nLCBtZXRhQ29ubmVjdCk7XG4gICAgICAgIF9zZW5kLmNhbGwodGhpcywgX2NvbnRleHQsIGVudmVsb3BlLCBtZXRhQ29ubmVjdCk7XG4gICAgfTtcblxuICAgIF9zZWxmLndlYlNvY2tldENsb3NlID0gZnVuY3Rpb24oY29udGV4dCwgY29kZSwgcmVhc29uKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC53ZWJTb2NrZXQpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LndlYlNvY2tldC5jbG9zZShjb2RlLCByZWFzb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoICh4KSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJ1Zyh4KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2VsZi5hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBfc3VwZXIuYWJvcnQoKTtcbiAgICAgICAgX2ZvcmNlQ2xvc2UuY2FsbCh0aGlzLCBfY29udGV4dCwge2NvZGU6IDEwMDAsIHJlYXNvbjogJ0Fib3J0J30pO1xuICAgICAgICB0aGlzLnJlc2V0KHRydWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gX3NlbGY7XG59O1xuIiwiaW1wb3J0IHsgQ29tZXRELCBXZWJTb2NrZXRUcmFuc3BvcnQgfSBmcm9tICd6ZXRhcHVzaC1jb21ldGQnXG5pbXBvcnQgeyBGZXRjaExvbmdQb2xsaW5nVHJhbnNwb3J0IH0gZnJvbSAnLi9jb21ldGQnXG5pbXBvcnQgeyBnZXRTZXJ2ZXJzLCBzaHVmZmxlIH0gZnJvbSAnLi91dGlscydcbmltcG9ydCB7IENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lciB9IGZyb20gJy4vY29ubmVjdGlvbi1zdGF0dXMnXG5cbi8qKlxuICogQ29tZXREIE1lc3NhZ2VzIGVudW1lcmF0aW9uXG4gKi9cbmNvbnN0IE1lc3NhZ2UgPSB7XG4gIFJFQ09OTkVDVF9IQU5EU0hBS0VfVkFMVUU6ICdoYW5kc2hha2UnLFxuICBSRUNPTk5FQ1RfTk9ORV9WQUxVRTogJ25vbmUnLFxuICBSRUNPTk5FQ1RfUkVUUllfVkFMVUU6ICdyZXRyeSdcbn1cblxuLyoqXG4gKiBDb21ldEQgVHJhbnNwb3J0cyBlbnVtZXJhdGlvblxuICovXG5jb25zdCBUcmFuc3BvcnQgPSB7XG4gIExPTkdfUE9MTElORzogJ2xvbmctcG9sbGluZycsXG4gIFdFQlNPQ0tFVDogJ3dlYnNvY2tldCdcbn1cblxuLyoqXG4gKiBQcm92aWRlIHV0aWxpdGllcyBhbmQgYWJzdHJhY3Rpb24gb24gQ29tZXREIFRyYW5zcG9ydCBsYXllclxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnRIZWxwZXIge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFpldGFQdXNoIGNsaWVudCBoZWxwZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXBpVXJsLCBidXNpbmVzc0lkLCBlbmFibGVIdHRwcyA9IGZhbHNlLCBoYW5kc2hha2VTdHJhdGVneSwgcmVzb3VyY2UgfSkge1xuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5idXNpbmVzc0lkID0gYnVzaW5lc3NJZFxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtmdW5jdGlvbigpOkFic3RyYWN0SGFuZHNoYWtlTWFuYWdlcn1cbiAgICAgKi9cbiAgICB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5ID0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMucmVzb3VyY2UgPSByZXNvdXJjZVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHRoaXMuc2VydmVycyA9IGdldFNlcnZlcnMoeyBhcGlVcmwsIGJ1c2luZXNzSWQsIGVuYWJsZUh0dHBzIH0pXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICovXG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzID0gW11cbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy53YXNDb25uZWN0ZWQgPSBmYWxzZVxuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5zZXJ2ZXJVcmwgPSBudWxsXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0FycmF5PE9iamVjdD59XG4gICAgICovXG4gICAgdGhpcy5zdWJzY3JpYmVRdWV1ZSA9IFtdXG4gICAgLyoqXG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICogQHR5cGUge0NvbWV0RH1cbiAgICAgKi9cbiAgICB0aGlzLmNvbWV0ZCA9IG5ldyBDb21ldEQoKVxuICAgIHRoaXMuY29tZXRkLnJlZ2lzdGVyVHJhbnNwb3J0KFRyYW5zcG9ydC5XRUJTT0NLRVQsIG5ldyBXZWJTb2NrZXRUcmFuc3BvcnQoKSlcbiAgICB0aGlzLmNvbWV0ZC5yZWdpc3RlclRyYW5zcG9ydChUcmFuc3BvcnQuTE9OR19QT0xMSU5HLCBuZXcgRmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydCgpKVxuICAgIHRoaXMuY29tZXRkLm9uVHJhbnNwb3J0RXhjZXB0aW9uID0gKGNvbWV0ZCwgdHJhbnNwb3J0KSA9PiB7XG4gICAgICBpZiAoVHJhbnNwb3J0LkxPTkdfUE9MTElORyA9PT0gdHJhbnNwb3J0KSB7XG4gICAgICAgIC8vIFRyeSB0byBmaW5kIGFuIG90aGVyIGF2YWlsYWJsZSBzZXJ2ZXJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBjdXJyZW50IG9uZSBmcm9tIHRoZSBfc2VydmVyTGlzdCBhcnJheVxuICAgICAgICB0aGlzLnVwZGF0ZVNlcnZlclVybCgpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9oYW5kc2hha2UnLCAoeyBleHQsIHN1Y2Nlc3NmdWwsIGFkdmljZSwgZXJyb3IgfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnQ2xpZW50SGVscGVyOjovbWV0YS9oYW5kc2hha2UnLCB7IGV4dCwgc3VjY2Vzc2Z1bCwgYWR2aWNlLCBlcnJvciB9KVxuICAgICAgaWYgKHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgY29uc3QgeyBhdXRoZW50aWNhdGlvbiA9IG51bGwgfSA9IGV4dFxuICAgICAgICB0aGlzLmluaXRpYWxpemVkKGF1dGhlbnRpY2F0aW9uKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIHRoaXMuaGFuZHNoYWtlRmFpbHVyZShlcnJvcilcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5jb21ldGQuYWRkTGlzdGVuZXIoJy9tZXRhL2hhbmRzaGFrZScsICh7IGFkdmljZSwgZXJyb3IsIGV4dCwgc3VjY2Vzc2Z1bCB9KSA9PiB7XG4gICAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Oi9tZXRhL2hhbmRzaGFrZScsIHsgZXh0LCBzdWNjZXNzZnVsLCBhZHZpY2UsIGVycm9yIH0pXG4gICAgICAvLyBBdXRoTmVnb3RpYXRpb25cbiAgICAgIGlmICghc3VjY2Vzc2Z1bCkge1xuICAgICAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBhZHZpY2UpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfTk9ORV9WQUxVRSA9PT0gYWR2aWNlLnJlY29ubmVjdCkge1xuICAgICAgICAgIHRoaXMuYXV0aGVudGljYXRpb25GYWlsZWQoZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoTWVzc2FnZS5SRUNPTk5FQ1RfSEFORFNIQUtFX1ZBTFVFID09PSBhZHZpY2UucmVjb25uZWN0KSB7XG4gICAgICAgICAgdGhpcy5uZWdvdGlhdGUoZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuY29tZXRkLmFkZExpc3RlbmVyKCcvbWV0YS9jb25uZWN0JywgKHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWVudEhlbHBlcjo6L21ldGEvY29ubmVjdCcsIHsgYWR2aWNlLCBjaGFubmVsLCBzdWNjZXNzZnVsIH0pXG4gICAgICAvLyBDb25uZWN0aW9uTGlzdGVuZXJcbiAgICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAgICAgIHRoaXMuY29ubmVjdGlvbkNsb3NlZCgpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy53YXNDb25uZWN0ZWQgPSB0aGlzLmNvbm5lY3RlZFxuICAgICAgICB0aGlzLmNvbm5lY3RlZCA9IHN1Y2Nlc3NmdWxcbiAgICAgICAgaWYgKCF0aGlzLndhc0Nvbm5lY3RlZCAmJiB0aGlzLmNvbm5lY3RlZCkge1xuICAgICAgICAgIHRoaXMuY29tZXRkLmJhdGNoKHRoaXMsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFVucXVldWUgc3Vic2NyaXB0aW9uc1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVRdWV1ZS5mb3JFYWNoKCh7IHByZWZpeCwgbGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgfSkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnN1YnNjcmliZShwcmVmaXgsIGxpc3RlbmVyLCBzdWJzY3JpcHRpb25zKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlUXVldWUgPSBbXVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgZXN0YWJsaXNoZWRcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25Fc3RhYmxpc2hlZCgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy53YXNDb25uZWN0ZWQgJiYgIXRoaXMuY29ubmVjdGVkKSB7XG4gICAgICAgICAgLy8gTm90aWZ5IGNvbm5lY3Rpb24gaXMgYnJva2VuXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uQnJva2VuKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIENvbm5lY3QgY2xpZW50IHVzaW5nIENvbWV0RCBUcmFuc3BvcnRcbiAgICovXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIHRoaXMuc2VydmVyVXJsID0gc2h1ZmZsZShzZXJ2ZXJzKVxuXG4gICAgICB0aGlzLmNvbWV0ZC5jb25maWd1cmUoe1xuICAgICAgICB1cmw6IGAke3RoaXMuc2VydmVyVXJsfS9zdHJkYCxcbiAgICAgICAgYmFja29mZkluY3JlbWVudDogMTAwMCxcbiAgICAgICAgbWF4QmFja29mZjogNjAwMDAsXG4gICAgICAgIGFwcGVuZE1lc3NhZ2VUeXBlVG9VUkw6IGZhbHNlXG4gICAgICB9KVxuXG4gICAgICB0aGlzLmNvbWV0ZC5oYW5kc2hha2UodGhpcy5nZXRIYW5kc2hha2VGaWVsZHMoKSlcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgY29ubmVjdGlvbkVzdGFibGlzaGVkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uRXN0YWJsaXNoZWQoKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBjb25uZWN0aW9uIGlzIGJyb2tlblxuICAgKi9cbiAgY29ubmVjdGlvbkJyb2tlbigpIHtcbiAgICB0aGlzLmNvbm5lY3Rpb25MaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLm9uQ29ubmVjdGlvbkJyb2tlbigpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTm90aWZ5IGxpc3RlbmVycyB3aGVuIGEgbWVzc2FnZSBpcyBsb3N0XG4gICAqL1xuICBtZXNzYWdlTG9zdChjaGFubmVsLCBkYXRhKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uTGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lci5vbk1lc3NhZ2VMb3N0KGNoYW5uZWwsIGRhdGEpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTm90aWZ5IGxpc3RlbmVycyB3aGVuIGNvbm5lY3Rpb24gaXMgY2xvc2VkXG4gICAqL1xuICBjb25uZWN0aW9uQ2xvc2VkKCkge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25Db25uZWN0aW9uQ2xvc2VkKClcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOb3RpZnkgbGlzdGVuZXJzIHdoZW4gY29ubmVjdGlvbiBpcyBlc3RhYmxpc2hlZFxuICAgKi9cbiAgaW5pdGlhbGl6ZWQoYXV0aGVudGljYXRpb24pIHtcbiAgICBpZiAoYXV0aGVudGljYXRpb24pIHtcbiAgICAgIHRoaXMudXNlcklkID0gYXV0aGVudGljYXRpb24udXNlcklkXG4gICAgfVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25TdWNjZXNzZnVsSGFuZHNoYWtlKGF1dGhlbnRpY2F0aW9uKVxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIE5vdGlmeSBsaXN0ZW5lcnMgd2hlbiBoYW5kc2hha2Ugc3RlcCBzdWNjZWVkXG4gICAqL1xuICBhdXRoZW50aWNhdGlvbkZhaWxlZChlcnJvcikge1xuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIub25GYWlsZWRIYW5kc2hha2UoZXJyb3IpXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogTWFuYWdlIGhhbmRzaGFrZSBmYWlsdXJlIGNhc2VcbiAgICovXG4gIGhhbmRzaGFrZUZhaWx1cmUoKSB7XG5cbiAgfVxuICAvKipcbiAgKiBSZW1vdmUgY3VycmVudCBzZXJ2ZXIgdXJsIGZyb20gdGhlIHNlcnZlciBsaXN0IGFuZCBzaHVmZmxlIGZvciBhbm90aGVyIG9uZVxuICAqL1xuICB1cGRhdGVTZXJ2ZXJVcmwoKSB7XG4gICAgdGhpcy5zZXJ2ZXJzLnRoZW4oKHNlcnZlcnMpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2VydmVycy5pbmRleE9mKHRoaXMuc2VydmVyVXJsKVxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgc2VydmVycy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICB9XG4gICAgICBpZiAoc2VydmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gTm8gbW9yZSBzZXJ2ZXIgYXZhaWxhYmxlXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXJ2ZXJVcmwgPSBzaHVmZmxlKHNlcnZlcnMpXG4gICAgICAgIHRoaXMuY29tZXRkLmNvbmZpZ3VyZSh7XG4gICAgICAgICAgdXJsOiBgJHt0aGlzLnNlcnZlclVybH0vc3RyZGBcbiAgICAgICAgfSlcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jb21ldGQuaGFuZHNoYWtlKHRoaXMuZ2V0SGFuZHNoYWtlRmllbGRzKCkpXG4gICAgICAgIH0sIDI1MClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBOZWdvY2lhdGUgYXV0aGVudGljYXRpb25cbiAgICovXG4gIG5lZ290aWF0ZShleHQpIHtcbiAgICBjb25zb2xlLmRlYnVnKCdDbGllbnRIZWxwZXI6Om5lZ290aWF0ZScsIGV4dClcbiAgfVxuICAvKipcbiAgICogRGlzY29ubmVjdCBDb21ldEQgY2xpZW50XG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY29tZXRkLmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgQ29tZXREIGhhbmRzaGFrZSBwYXJhbWV0ZXJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcygpIHtcbiAgICBjb25zdCBoYW5kc2hha2UgPSB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5KClcbiAgICByZXR1cm4gaGFuZHNoYWtlLmdldEhhbmRzaGFrZUZpZWxkcyh0aGlzKVxuICB9XG4gIC8qKlxuICAgKiBTZXQgYSBuZXcgaGFuZHNoYWtlIGZhY3RvcnkgbWV0aG9kc1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfSBoYW5kc2hha2VTdHJhdGVneVxuICAgKi9cbiAgc2V0SGFuZHNoYWtlU3RyYXRlZ3koaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICB0aGlzLmhhbmRzaGFrZVN0cmF0ZWd5ID0gaGFuZHNoYWtlU3RyYXRlZ3lcbiAgfVxuICAvKipcbiAgICogR2V0IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVzaW5lc3NJZFxuICB9XG4gIC8qKlxuICAgKiBHZXQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgdGhyb3cgTm90WWV0SW1wbGVtZW50ZWRFcnJvcigpXG4gIH1cbiAgLyoqXG4gICAqIEdldCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvdXJjZVxuICB9XG4gIC8qKlxuICAgKiBTdWJyaWJlIGFsbCBtZXRob2RzIGRlZmluZWQgaW4gdGhlIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gcHJlZml4ZWQgY2hhbm5lbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gQ2hhbm5lbCBwcmVmaXhcbiAgICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH0gc3Vic2NyaXB0aW9uc1xuICAgKi9cbiAgc3Vic2NyaWJlKHByZWZpeCwgbGlzdGVuZXIsIHN1YnNjcmlwdGlvbnMgPSB7fSkge1xuICAgIGlmICh0aGlzLmNvbWV0ZC5pc0Rpc2Nvbm5lY3RlZCgpKSB7XG4gICAgICB0aGlzLnN1YnNjcmliZVF1ZXVlLnB1c2goeyBwcmVmaXgsIGxpc3RlbmVyLCBzdWJzY3JpcHRpb25zIH0pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZm9yIChjb25zdCBtZXRob2QgaW4gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGxpc3RlbmVyLmhhc093blByb3BlcnR5KG1ldGhvZCkpIHtcbiAgICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgICAgc3Vic2NyaXB0aW9uc1ttZXRob2RdID0gdGhpcy5jb21ldGQuc3Vic2NyaWJlKGNoYW5uZWwsIGxpc3RlbmVyW21ldGhvZF0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN1YnNjcmlwdGlvbnNcbiAgfVxuICAvKipcbiAgICogR2V0IGEgcHVibGlzaGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggLSBDaGFubmVsIHByZWZpeFxuICAgKiBAcGFyYW0ge09iamVjdH0gZGVmaW5pdGlvblxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHNlcnZpY2VQdWJsaXNoZXJcbiAgICovXG4gIGNyZWF0ZVNlcnZpY2VQdWJsaXNoZXIocHJlZml4LCBkZWZpbml0aW9uKSB7XG4gICAgY29uc3Qgc2VydmljZVB1Ymxpc2hlciA9IHt9XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gZGVmaW5pdGlvbikge1xuICAgICAgaWYgKGRlZmluaXRpb24uaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICBjb25zdCBjaGFubmVsID0gYCR7cHJlZml4fS8ke21ldGhvZH1gXG4gICAgICAgIHNlcnZpY2VQdWJsaXNoZXJbbWV0aG9kXSA9IChwYXJhbWV0ZXJzID0ge30pID0+IHtcbiAgICAgICAgICB0aGlzLmNvbWV0ZC5wdWJsaXNoKGNoYW5uZWwsIHBhcmFtZXRlcnMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNlcnZpY2VQdWJsaXNoZXJcbiAgfVxuICAvKipcbiAgICogVW5zdWJjcmliZSBhbGwgc3Vic2NyaXB0aW9ucyBkZWZpbmVkIGluIGdpdmVuIHN1YnNjcmlwdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBzdWJzY3JpcHRpb25zXG4gICAqL1xuICB1bnN1YnNjcmliZShzdWJzY3JpcHRpb25zKSB7XG4gICAgZm9yIChjb25zdCBtZXRob2QgaW4gc3Vic2NyaXB0aW9ucykge1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMuaGFzT3duUHJvcGVydHkobWV0aG9kKSkge1xuICAgICAgICB0aGlzLmNvbWV0ZC51bnN1YnNjcmliZShzdWJzY3JpcHRpb25zW21ldGhvZF0pXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBBZGQgYSBjb25uZWN0aW9uIGxpc3RlbmVyIHRvIGhhbmRsZSBsaWZlIGN5Y2xlIGNvbm5lY3Rpb24gZXZlbnRzXG4gICAqIEBwYXJhbSB7Q29ubmVjdGlvblN0YXR1c0xpc3RlbmVyfSBsaXN0ZW5lclxuICAgKi9cbiAgYWRkQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgY29uc3QgY29ubmVjdGlvbkxpc3RlbmVyID0gT2JqZWN0LmFzc2lnbihuZXcgQ29ubmVjdGlvblN0YXR1c0xpc3RlbmVyKCksIGxpc3RlbmVyKVxuICAgIHRoaXMuY29ubmVjdGlvbkxpc3RlbmVycy5wdXNoKGNvbm5lY3Rpb25MaXN0ZW5lcilcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBDbGllbnRIZWxwZXIgfSBmcm9tICcuL2NsaWVudC1oZWxwZXInXG5cbmltcG9ydCB7IE5vdFlldEltcGxlbWVudGVkRXJyb3IgfSBmcm9tICcuL3V0aWxzJ1xuXG4vKipcbiAqIERlZmF1bHQgWmV0YVB1c2ggQVBJIFVSTFxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IEFQSV9VUkwgPSAnaHR0cHM6Ly9hcGkuenB1c2guaW8vJ1xuXG4vKipcbiAqIFpldGFQdXNoIENsaWVudCB0byBjb25uZWN0XG4gKiBAYWNjZXNzIHB1YmxpY1xuICogQGV4YW1wbGVcbiAqIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICogICBidXNpbmVzc0lkOiAnPFlPVVItQlVTSU5FU1MtSUQ+JyxcbiAqICAgaGFuZHNoYWtlU3RyYXRlZ3koKSB7XG4gKiAgICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZVdlYWtIYW5kc2hha2Uoe1xuICogICAgICAgdG9rZW46IG51bGwsXG4gKiAgICAgICBkZXBsb3ltZW50SWQ6ICc8WU9VUi1ERVBMT1lNRU5ULUlEPidcbiAgKiAgICB9KVxuICogICB9XG4gKiB9KVxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoe1xuICogICBidXNpbmVzc0lkOiAnPFlPVVItQlVTSU5FU1MtSUQ+JyxcbiAqICAgZW5hYmxlSHR0cHM6IHRydWUsXG4gKiAgIGhhbmRzaGFrZVN0cmF0ZWd5KCkge1xuICogICAgIHJldHVybiBBdXRoZW50RmFjdG9yeS5jcmVhdGVXZWFrSGFuZHNoYWtlKHtcbiAqICAgICAgIHRva2VuOiBudWxsLFxuICogICAgICAgZGVwbG95bWVudElkOiAnPFlPVVItREVQTE9ZTUVOVC1JRD4nXG4gICogICAgfSlcbiAqICAgfVxuICogfSlcbiAqL1xuZXhwb3J0IGNsYXNzIENsaWVudCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgWmV0YVB1c2ggY2xpZW50XG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGFwaVVybCA9IEFQSV9VUkwsIGJ1c2luZXNzSWQsIGVuYWJsZUh0dHBzID0gZmFsc2UsIGhhbmRzaGFrZVN0cmF0ZWd5LCByZXNvdXJjZSA9IG51bGwgfSkge1xuICAgIC8qKlxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtDbGllbnRIZWxwZXJ9XG4gICAgICovXG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgQ2xpZW50SGVscGVyKHtcbiAgICAgIGFwaVVybCxcbiAgICAgIGJ1c2luZXNzSWQsXG4gICAgICBlbmFibGVIdHRwcyxcbiAgICAgIGhhbmRzaGFrZVN0cmF0ZWd5LFxuICAgICAgcmVzb3VyY2VcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBDb25uZWN0IGNsaWVudCB0byBaZXRhUHVzaFxuICAgKi9cbiAgY29ubmVjdCgpIHtcbiAgICB0aGlzLmhlbHBlci5jb25uZWN0KClcbiAgfVxuICAvKipcbiAgICogRGlzb25uZWN0IGNsaWVudCBmcm9tIFpldGFQdXNoXG4gICAqL1xuICBkaXNjb25uZWN0KCkge1xuICAgIHRoaXMuaGVscGVyLmRpc2Nvbm5lY3QoKVxuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzZXJ2aWNlIHB1Ymxpc2hlciBiYXNlZCBvbiBwdWJsaXNoZXIgZGVmaW5pdGlvbiBmb3IgdGhlIGdpdmVuIGRlcGxveW1lbnQgaWRcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlU2VydmljZVB1Ymxpc2hlcih7IGRlcGxveW1lbnRJZCwgZGVmaW5pdGlvbiB9KSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmNyZWF0ZVNlcnZpY2VQdWJsaXNoZXIoYC9zZXJ2aWNlLyR7dGhpcy5nZXRCdXNpbmVzc0lkKCl9LyR7ZGVwbG95bWVudElkfWAsIGRlZmluaXRpb24pXG4gIH1cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xpZW50IGJ1c2luZXNzIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldEJ1c2luZXNzSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmdldEJ1c2luZXNzSWQoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsaWVudCByZXNvdXJjZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRSZXNvdXJjZSgpIHtcbiAgICByZXR1cm4gdGhpcy5oZWxwZXIuZ2V0UmVzb3VyY2UoKVxuICB9XG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsaWVudCB1c2VyIGlkXG4gICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICovXG4gIGdldFVzZXJJZCgpIHtcbiAgICByZXR1cm4gdGhpcy5oZWxwZXIuZ2V0VXNlcklkKClcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBjbGllbnQgc2Vzc2lvbiBpZFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRTZXNzaW9uSWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVscGVyLmdldFNlc3Npb25JZCgpXG4gIH1cbiAgLyoqXG4gICAqIFN1YnNjcmliZSBhbGwgbWV0aG9kcyBkZXNjcmliZWQgaW4gdGhlIGxpc3RlbmVyIGZvciB0aGUgZ2l2ZW4gZGVwbG95bWVudElkXG4gICAqIEByZXR1cm4ge09iamVjdH0gc3Vic2NyaXB0aW9uXG4gICAqIEBleGFtcGxlXG4gICAqIGNvbnN0IHN0YWNrU2VydmljZUxpc3RlbmVyID0ge1xuICAgKiAgIGxpc3QoKSB7fSxcbiAgICogICBwdXNoKCkge30sXG4gICAqICAgdXBkYXRlKCkge31cbiAgICogfVxuICAgKiBjbGllbnQuc3Vic2NyaWJlKHtcbiAgICogICBkZXBsb3ltZW50SWQ6ICc8WU9VUi1TVEFDSy1ERVBMT1lNRU5ULUlEPicsXG4gICAqICAgbGlzdGVuZXI6IHN0YWNrU2VydmljZUxpc3RlbmVyXG4gICAqIH0pXG4gICAqL1xuICBzdWJzY3JpYmUoeyBkZXBsb3ltZW50SWQsIGxpc3RlbmVyIH0pIHtcbiAgICByZXR1cm4gdGhpcy5oZWxwZXIuc3Vic2NyaWJlKGAvc2VydmljZS8ke3RoaXMuZ2V0QnVzaW5lc3NJZCgpfS8ke2RlcGxveW1lbnRJZH1gLCBsaXN0ZW5lcilcbiAgfVxuICAvKipcbiAgICogQ3JlYXRlIGEgcHVibGlzaC9zdWJzY3JpYmVcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cbiAgY3JlYXRlUHVibGlzaGVyU3Vic2NyaWJlcih7IGRlcGxveW1lbnRJZCwgbGlzdGVuZXIsIGRlZmluaXRpb24gfSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdWJzY3JpcHRpb246IHRoaXMuc3Vic2NyaWJlKHsgZGVwbG95bWVudElkLCBsaXN0ZW5lciB9KSxcbiAgICAgIHB1Ymxpc2hlcjogdGhpcy5jcmVhdGVTZXJ2aWNlUHVibGlzaGVyKHsgZGVwbG95bWVudElkLCBkZWZpbml0aW9uIH0pXG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBTZXQgbmV3IGNsaWVudCByZXNvdXJjZSB2YWx1ZVxuICAgKi9cbiAgc2V0UmVzb3VyY2UocmVzb3VyY2UpIHtcbiAgICB0aGlzLmhlbHBlci5zZXRSZXNvdXJjZShyZXNvdXJjZSlcbiAgfVxuICAvKipcbiAgICogQWRkIGEgY29ubmVjdGlvbiBsaXN0ZW5lciB0byBoYW5kbGUgbGlmZSBjeWNsZSBjb25uZWN0aW9uIGV2ZW50c1xuICAgKiBAcGFyYW0ge0Nvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcn0gbGlzdGVuZXJcbiAgICovXG4gIGFkZENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgIHJldHVybiB0aGlzLmhlbHBlci5hZGRDb25uZWN0aW9uU3RhdHVzTGlzdGVuZXIobGlzdGVuZXIpXG4gIH1cbiAgLyoqXG4gICAqIEZvcmNlIGRpc2Nvbm5lY3QvY29ubmVjdCB3aXRoIG5ldyBoYW5kc2hha2UgZmFjdG9yeVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfSBoYW5kc2hha2VTdHJhdGVneVxuICAgKi9cbiAgaGFuZHNoYWtlKGhhbmRzaGFrZVN0cmF0ZWd5KSB7XG4gICAgdGhpcy5kaXNjb25uZWN0KClcbiAgICBpZiAoaGFuZHNoYWtlU3RyYXRlZ3kpIHtcbiAgICAgIHRoaXMuaGVscGVyLnNldEhhbmRzaGFrZVN0cmF0ZWd5KGhhbmRzaGFrZVN0cmF0ZWd5KVxuICAgIH1cbiAgICB0aGlzLmNvbm5lY3QoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNlcnZpY2UgbGlzdGVyIGZyb20gbWV0aG9kcyBsaXN0IHdpdGggYSBkZWZhdWx0IGhhbmRsZXJcbiAgICogQHJldHVybiB7T2JqZWN0fSBsaXN0ZW5lclxuICAgKiBAZXhhbXBsZVxuICAgKiBjb25zdCBnZXRTdGFja1NlcnZpY2VMaXN0ZW5lciA9ICgpID0+IHtcbiAgICogICByZXR1cm4gQ2xpZW50LmdldFNlcnZpY2VMaXN0ZW5lcih7XG4gICAqICAgICBtZXRob2RzOiBbJ2dldExpc3RlbmVycycsICdsaXN0JywgJ3B1cmdlJywgJ3B1c2gnLCAncmVtb3ZlJywgJ3NldExpc3RlbmVycycsICd1cGRhdGUnLCAnZXJyb3InXSxcbiAgICogICAgIGhhbmRsZXI6ICh7IGNoYW5uZWwsIGRhdGEgfSkgPT4ge1xuICAgKiAgICAgICBjb25zb2xlLmRlYnVnKGBTdGFjazo6JHttZXRob2R9YCwgeyBjaGFubmVsLCBkYXRhIH0pXG4gICAqICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGZvcm1bbmFtZT1cIiR7bWV0aG9kfVwiXSBbbmFtZT1cIm91dHB1dFwiXWApLnZhbHVlID0gSlNPTi5zdHJpbmdpZnkoZGF0YSlcbiAgICogICAgIH1cbiAgICogICB9KVxuICAgKiB9XG4gICAqL1xuICBzdGF0aWMgZ2V0U2VydmljZUxpc3RlbmVyKHsgbWV0aG9kcyA9IFtdLCBoYW5kbGVyID0gKCkgPT4ge30gfSkge1xuICAgIHJldHVybiBtZXRob2RzLnJlZHVjZSgobGlzdGVuZXIsIG1ldGhvZCkgPT4ge1xuICAgICAgbGlzdGVuZXJbbWV0aG9kXSA9ICh7IGNoYW5uZWwsIGRhdGEgfSkgPT4gaGFuZGxlcih7IGNoYW5uZWwsIGRhdGEsIG1ldGhvZCB9KVxuICAgICAgcmV0dXJuIGxpc3RlbmVyXG4gICAgfSwge30pXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgVHJhbnNwb3J0LCBMb25nUG9sbGluZ1RyYW5zcG9ydCB9IGZyb20gJ3pldGFwdXNoLWNvbWV0ZCdcblxuLyoqXG4gKiBJbXBsZW1lbnRzIExvbmdQb2xsaW5nVHJhbnNwb3J0IHVzaW5nIGJvcndzZXIgZmV0Y2goKSBBUElcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHJldHVybiB7RmV0Y2hMb25nUG9sbGluZ1RyYW5zcG9ydH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZldGNoTG9uZ1BvbGxpbmdUcmFuc3BvcnQoKSB7XG4gIGNvbnN0IF9zdXBlciA9IG5ldyBMb25nUG9sbGluZ1RyYW5zcG9ydCgpXG4gIGNvbnN0IHRoYXQgPSBUcmFuc3BvcnQuZGVyaXZlKF9zdXBlcilcblxuICAvKipcbiAgICogSW1wbGVtZW50cyB0cmFuc3BvcnQgdmlhIGZldGNoKCkgQVBJXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYWNrZXRcbiAgICovXG4gIHRoYXQueGhyU2VuZCA9IGZ1bmN0aW9uIChwYWNrZXQpIHtcbiAgICBmZXRjaChwYWNrZXQudXJsLCB7XG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIGJvZHk6IHBhY2tldC5ib2R5LFxuICAgICAgaGVhZGVyczogT2JqZWN0LmFzc2lnbihwYWNrZXQuaGVhZGVycywge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD1VVEYtOCdcbiAgICAgIH0pXG4gICAgfSlcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgICB9KVxuICAgIC50aGVuKHBhY2tldC5vblN1Y2Nlc3MpXG4gICAgLmNhdGNoKHBhY2tldC5vbkVycm9yKVxuICB9XG5cbiAgcmV0dXJuIHRoYXRcbn1cbiIsIi8qKlxuICogRGVmaW5lIGxpZmUgY3ljbGUgY29ubmVjdGlvbiBtZXRob2RzIFxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZXhwb3J0IGNsYXNzIENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lciB7XG4gIC8qKlxuICAgKiBDYWxsYmFjayBmaXJlZCB3aGVuIGNvbm5lY3Rpb24gaXMgYnJva2VuXG4gICAqL1xuICBvbkNvbm5lY3Rpb25Ccm9rZW4oKSB7fVxuICAvKipcbiAgICogQ2FsbGJhY2sgZmlyZWQgd2hlbiBjb25uZWN0aW9uIGlzIGNsb3NlZFxuICAgKi9cbiAgb25Db25uZWN0aW9uQ2xvc2VkKCkge31cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZpcmVkIHdoZW4gaXMgZXN0YWJsaXNoZWRcbiAgICovXG4gIG9uQ29ubmVjdGlvbkVzdGFibGlzaGVkKCkge31cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZpcmVkIHdoZW4gYW4gZXJyb3Igb2NjdXJzIGluIGhhbmRzaGFrZSBzdGVwXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlcnJvclxuICAgKi9cbiAgb25GYWlsZWRIYW5kc2hha2UoZXJyb3IpIHt9XG4gIC8qKlxuICAgKiBDYWxsYmFjayBmaXJlZCB3aGVuIGEgbWVzc2FnZSBpcyBsb3N0XG4gICAqL1xuICBvbk1lc3NhZ2VMb3N0KCkge31cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZpcmVkIHdoZW4gaGFuZHNoYWtlIHN0ZXAgc3VjY2VlZFxuICAgKiBAcGFyYW0ge09iamVjdH0gYXV0aGVudGljYXRpb25cbiAgICovXG4gIG9uU3VjY2Vzc2Z1bEhhbmRzaGFrZShhdXRoZW50aWNhdGlvbikge31cbn1cbiIsIi8qKlxuICogRGF0YSBhZ2dyZWdhdGlvblxuICogXG4gKiBQcm92aWRlcyBkYXRhIGFnZ3JlZ2F0aW9uIG92ZXIgdGltZSBhbmQgYWNyb3NzIGRpZmZlcmVudCBpdGVtc1xuICogIFVzZXIgZGV2aWNlcyBwdXNoIGl0ZW1zIGRhdGEgb24gZGV2ZWxvcGVyLWRlZmluZWQgY2F0ZWdvcmllc1xuICogIFRoaXMgc2VydmljZSBhdXRvbWF0aWNhbGx5IGFnZ3JlZ2F0ZXMgdGhlIGRhdGFcbiAqIFJhdyBkYXRhIGlzIG5vdCBhdmFpbGFibGUgZm9yIHJlYWRpbmcsIG9ubHkgdGhlIGdlbmVyYXRlZCBhZ2dyZWdhdGlvbiByZXN1bHRcbiAqIFxuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIGl0ZW0gYWdncmVnYXRpb25cbiAqIFxuICogVXNlcnMgY2FuIHB1c2ggZGF0YSBhbmQgYmUgbm90aWZpZWQgb2YgYWdncmVnYXRlZCBkYXRhLlxuICogVGhpcyBzZXJ2aWNlIGRvZXMgbm90IGFsbG93IHlvdSB0byByZWFkIHRoZSBkYXRhLiBUbyBhY2hpZXZlIHRoYXQga2luZCBvZiBiZWhhdmlvciwgeW91IGNvdWxkIGNvbmZpZ3VyZSBhIGNhbGxiYWNrIHRvIHN0b3JlIHRoZSBkYXRhLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgQWdncmVnUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIFB1c2hlcyBzb21lIGRhdGFcblx0ICogXG5cdCAqIFB1c2hlcyB0aGUgZ2l2ZW4gZGF0YS5cblx0ICogQWxsIHRoZSBpdGVtcyBhcmUgcHJvY2Vzc2VkIGFjY29yZGluZyB0byB0aGUgZGVmaW5lZCBydWxlcy5cblx0ICogQXQgbGVhc3Qgb25lIHB1c2ggZm9yIGEgZ2l2ZW4gaXRlbSBpcyBuZWVkZWQgZHVyaW5nIGEgdGltZSBwZXJpb2QgdG8gdHJpZ2dlciBwcm9jZXNzaW5nIGFuZCBjYWxsaW5nIG9mIHRoZSBjb3JyZXNwb25kaW5nIGNhbGxiYWNrIHZlcmIvbWFjcm8uXG5cdCAqICovXG5cdHB1c2goe2l0ZW1zLG93bmVyfSkge31cbn1cbi8qKlxuICogRGF0YSBzdGFja3NcbiAqIFxuICogU3RhY2tzIGFyZSBhIHBlci11c2VyIG5hbWVkIHBlcnNpc3RlbnQgcXVldWUgb2YgZGF0YVxuICogIEFuIGFkbWluaXN0cmF0b3IgY3JlYXRlcyBhIHN0YWNrIHNlcnZpY2VcbiAqICBFbmQtdXNlcnMgY2FuIHB1c2ggZGF0YSBvbiBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIHRoZWlyIG93biBhcmJpdHJhcnkgbmFtZWQgc3RhY2tzXG4gKiAqL1xuLyoqXG4gKiBEYXRhIHN0YWNrIHVzZXIgQVBJXG4gKiBcbiAqIERhdGEgaXMgc3RvcmVkIG9uIGEgcGVyIHVzZXIgYmFzaXMuIEhvd2V2ZXIsIG5vdGlmaWNhdGlvbnMgY2FuIGJlIHNlbnQgdG8gYSBjb25maWd1cmFibGUgc2V0IG9mIGxpc3RlbmVycy5cbiAqIFN0YWNrIG5hbWVzIGFyZSBhcmJpdHJhcnkgYW5kIGRvIG5vdCBuZWVkIHRvIGJlIGV4cGxpY2l0bHkgaW5pdGFsaXplZC5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IFN0YWNrUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIExpc3RzIHRoZSBsaXN0ZW5lcnNcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIHdob2xlIGxpc3Qgb2YgbGlzdGVuZXJzIGZvciB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqICovXG5cdGdldExpc3RlbmVycyh7b3duZXIsc3RhY2t9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIGNvbnRlbnRcblx0ICogXG5cdCAqIFJldHVybnMgYSBwYWdpbmF0ZWQgbGlzdCBvZiBjb250ZW50cyBmb3IgdGhlIGdpdmVuIHN0YWNrLlxuXHQgKiBDb250ZW50IGlzIHNvcnRlZCBhY2NvcmRpbmcgdG8gdGhlIHN0YXRpY2FsbHkgY29uZmlndXJlZCBvcmRlci5cblx0ICogKi9cblx0bGlzdCh7b3duZXIscGFnZSxzdGFja30pIHt9LFxuXHQvKipcblx0ICogRW1wdGllcyBhIHN0YWNrXG5cdCAqIFxuXHQgKiBSZW1vdmVzIGFsbCBpdGVtcyBmcm9tIHRoZSBnaXZlbiBzdGFjay5cblx0ICogKi9cblx0cHVyZ2Uoe293bmVyLHN0YWNrfSkge30sXG5cdC8qKlxuXHQgKiBQdXNoZXMgYW4gaXRlbVxuXHQgKiBcblx0ICogUHVzaGVzIGFuIGl0ZW0gb250byB0aGUgZ2l2ZW4gc3RhY2suXG5cdCAqIFRoZSBzdGFjayBkb2VzIG5vdCBuZWVkIHRvIGJlIGNyZWF0ZWQuXG5cdCAqICovXG5cdHB1c2goe3N0YWNrLGRhdGEsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgaXRlbXNcblx0ICogXG5cdCAqIFJlbW92ZXMgdGhlIGl0ZW0gd2l0aCB0aGUgZ2l2ZW4gZ3VpZCBmcm9tIHRoZSBnaXZlbiBzdGFjay5cblx0ICogKi9cblx0cmVtb3ZlKHtndWlkcyxvd25lcixzdGFja30pIHt9LFxuXHQvKipcblx0ICogU2V0cyB0aGUgbGlzdGVuZXJzXG5cdCAqIFxuXHQgKiBTZXRzIHRoZSBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiBzdGFjay5cblx0ICogKi9cblx0c2V0TGlzdGVuZXJzKHtsaXN0ZW5lcnMsb3duZXIsc3RhY2t9KSB7fSxcblx0LyoqXG5cdCAqIFVwZGF0ZXMgYW4gaXRlbVxuXHQgKiBcblx0ICogVXBkYXRlcyBhbiBleGlzdGluZyBpdGVtIG9mIHRoZSBnaXZlbiBzdGFjay5cblx0ICogVGhlIGl0ZW0gTVVTVCBleGlzdCBwcmlvciB0byB0aGUgY2FsbC5cblx0ICogKi9cblx0dXBkYXRlKHtndWlkLHN0YWNrLGRhdGEsb3duZXJ9KSB7fVxufVxuLyoqXG4gKiBFY2hvXG4gKiBcbiAqIEVjaG9cbiAqICovXG4vKipcbiAqIEVjaG8gc2VydmljZVxuICogXG4gKiBTaW1wbGUgZWNobyBzZXJ2aWNlLCBmb3IgZGV2ZWxvcG1lbnQgcHVycG9zZXMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBFY2hvUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIEVjaG9lcyBhbiBvYmplY3Rcblx0ICogXG5cdCAqIEVjaG9lcyBhbiBvYmplY3Q6IHRoZSBzZXJ2ZXIgd2lsbCBlY2hvIHRoYXQgb2JqZWN0IG9uIGNoYW5uZWwgJ2VjaG8nIGZvciB0aGUgY3VycmVudCB1c2VyLlxuXHQgKiAqL1xuXHRlY2hvKHt9KSB7fVxufVxuLyoqXG4gKiBHYW1lIGVuZ2luZVxuICogXG4gKiBBYnN0cmFjdCBHYW1lIEVuZ2luZVxuICogIENvbmNyZXRlIGdhbWUgZW5naW5lcyBhcmUgcmVtb3RlIGNvbWV0ZCBjbGllbnRzIG9yIGludGVybmFsIG1hY3Jvc1xuICogKi9cbi8qKlxuICogR2FtZSBFbmdpbmUgQVBJXG4gKiBcbiAqIFRoZSBHYW1lIEVuZ2luZSBBUEkgaXMgZm9yIGdhbWUgZW5naW5lIGNsaWVudHMsIG5vdCBlbmQtdXNlcnMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBHYW1lRW5naW5lUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIE5vdGlmeSB0aGUgcmVzdWx0IGZvciBhIGpvaW4gcmVxdWVzdFxuXHQgKiBcblx0ICogQSBHYW1lIEVuZ2luZSBub3RpZmllcyB0aGUgU1RSIG9mIHRoZSByZXN1bHQgb2YgYSBqb2luIHJlcXVlc3QgdGhhdCBpdCByZWNlaXZlZCBvbiBqb2luX2NhbGxiYWNrXG5cdCAqICovXG5cdGpvaW5fcmVzdWx0KHtjYWxsZXJJZCxlcnJvcixtc2dJZCxwYXlsb2FkfSkge30sXG5cdC8qKlxuXHQgKiBOb3RpZnkgdGhlIHJlc3VsdCBmb3IgYW4gb3JnYW5pemF0aW9uIHJlcXVlc3Rcblx0ICogXG5cdCAqIEEgR2FtZSBFbmdpbmUgbm90aWZpZXMgdGhlIFNUUiBvZiB0aGUgcmVzdWx0IG9mIGFuIG9yZ2FuaXphdGlvbiByZXF1ZXN0IHRoYXQgaXQgcmVjZWl2ZWQgb24gb3JnYW5pemVfY2FsbGJhY2tcblx0ICogKi9cblx0b3JnYW5pemVfcmVzdWx0KHtjYWxsZXJJZCxlcnJvcixtc2dJZCxwYXlsb2FkfSkge30sXG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYSBnYW1lIGVuZ2luZVxuXHQgKiBcblx0ICogQSBjbGllbnQgcmVnaXN0ZXJzIGl0c2VsZiB0byB0aGUgU1RSIGFzIGEgR2FtZSBFbmdpbmUuXG5cdCAqIFRoZSBTVFIgbWF5LCBmcm9tIG5vdyBvbiwgZGlzcGF0Y2ggZ2FtZSBvZiB0aGUgZ2l2ZW4gZ2FtZSB0eXBlIHRvIHNhaWQgY2xpZW50LlxuXHQgKiBVbnJlZ2lzdHJhdGlvbiBpcyBkb25lIGF1dG9tYXRpY2FsbHkgb24gbG9nb2ZmLlxuXHQgKiAqL1xuXHRyZWdpc3Rlcih7Z2FtZUluZm8sbG9jYXRpb24sbWF4R2FtZXN9KSB7fSxcblx0LyoqXG5cdCAqIE5vdGlmeSB0aGUgcmVzdWx0IGZvciBhIHN0YXJ0IHJlcXVlc3Rcblx0ICogXG5cdCAqIEEgR2FtZSBFbmdpbmUgbm90aWZpZXMgdGhlIFNUUiBvZiB0aGUgcmVzdWx0IG9mIGEgc3RhcnQgcmVxdWVzdCB0aGF0IGl0IHJlY2VpdmVkIG9uIHN0YXJ0X2NhbGxiYWNrXG5cdCAqICovXG5cdHN0YXJ0X3Jlc3VsdCh7Z2FtZUlkfSkge30sXG5cdC8qKlxuXHQgKiBOb3RpZnkgYSBnYW1lIGV2ZW50XG5cdCAqIFxuXHQgKiBBIEdhbWUgRW5naW5lIG5vdGlmaWVzIHRoZSBTVFIgb2Ygc29tZSBhcmJpdHJhcnkgZ2FtZSBldmVudC5cblx0ICogKi9cblx0c3RhdGUoe2RhdGEsZ2FtZUlkLHN0YXR1c30pIHt9LFxuXHQvKipcblx0ICogTm90aWZ5IHRoZSByZXN1bHQgZm9yIGFuIHVuam9pbiByZXF1ZXN0XG5cdCAqIFxuXHQgKiBBIEdhbWUgRW5naW5lIG5vdGlmaWVzIHRoZSBTVFIgb2YgdGhlIHJlc3VsdCBvZiBhbiB1bmpvaW4gcmVxdWVzdCB0aGF0IGl0IHJlY2VpdmVkIG9uIHVuam9pbl9jYWxsYmFja1xuXHQgKiAqL1xuXHR1bmpvaW5fcmVzdWx0KHtjYWxsZXJJZCxlcnJvcixtc2dJZCxwYXlsb2FkfSkge31cbn1cbi8qKlxuICogVXNlciBBUEkgZm9yIGdhbWVzXG4gKiBcbiAqIFVzZXJzIGNhbiBsaXN0LCBzdGFydCwgam9pbiBnYW1lcywgYW5kIHBsYXkuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBHYW1lUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIExpc3RzIGdhbWUgdHlwZXNcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIGxpc3Qgb2YgZ2FtZSB0eXBlcyBzdXBwb3J0ZWQgYnkgdGhlIHNlcnZlciBhbmQgdGhlIGN1cnJlbnRseSByZWdpc3RlcmVkIGdhbWUgZW5naW5lcy5cblx0ICogKi9cblx0YXZhaWxhYmxlKHt9KSB7fSxcblx0LyoqQSB1c2VyIGpvaW5zIGEgZ2FtZSovXG5cdGpvaW4oe2dhbWVJZCxyb2xlLHVzZXJJZCx1c2VyTmFtZX0pIHt9LFxuXHQvKipPcmdhbml6ZXMgYSBnYW1lKi9cblx0b3JnYW5pemUoe3R5cGUsb3duZXIsb3B0aW9uc30pIHt9LFxuXHQvKipHaXZlcyBzb21lIGNvbW1hbmQgdG8gdGhlIGdhbWUgZW5naW5lKi9cblx0cGxheSh7ZGF0YSxnYW1lSWQsdXNlcklkfSkge30sXG5cdC8qKlN0YXJ0cyBhIGdhbWUqL1xuXHRzdGFydCh7Z2FtZUlkfSkge30sXG5cdC8qKkEgdXNlciBjYW5jZWxzIGpvaW5pbmcgYSBnYW1lKi9cblx0dW5qb2luKHtnYW1lSWQscm9sZSx1c2VySWQsdXNlck5hbWV9KSB7fVxufVxuLyoqXG4gKiBHZW5lcmljIERhdGEgQWNjZXNzXG4gKiBcbiAqIEdlbmVyaWMgRGF0YSBBY2Nlc3MgU2VydmljZSA6IE5vU1FMIHN0b3JhZ2VcbiAqICovXG4vKipcbiAqIEdEQSBVc2VyIEFQSVxuICogXG4gKiBVc2VyIEFQSSBmb3IgR2VuZXJpYyBEYXRhIEFjY2Vzcy5cbiAqIERhdGEgaXMgc3RvcmVkIG9uIGEgcGVyLXVzZXIgYmFzaXMuXG4gKiBVc2VycyBjYW4gcHV0LCBnZXQsIGxpc3QgdGhlaXIgZGF0YS5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IEdkYVB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBBc2tzIGZvciBhIGRhdGEgcm93XG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgZnVsbCBkYXRhIHJvdy5cblx0ICogKi9cblx0Z2V0KHtrZXksb3duZXIsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIEFza3MgZm9yIGEgZGF0YSBjZWxsXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcHJlY2lzZSBsaXN0IG9mIGNlbGxzIGZyb20gYSBjb2x1bW4gaW4gYSBkYXRhIHJvdy5cblx0ICogKi9cblx0Z2V0Q2VsbHMoe2NvbHVtbixrZXksa2V5Mixvd25lcix0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogSW5jcmVtZW50cyBhbiBpbnRlZ2VyIHZhbHVlXG5cdCAqIFxuXHQgKiBJbmNyZW1lbnRzIGEgY2VsbCA2NC1iaXQgc2lnbmVkIGludGVnZXIgdmFsdWUgYW5kIHJldHVybnMgdGhlIHJlc3VsdCBpbiB0aGUgZGF0YSBmaWVsZC5cblx0ICogVGhlIGluY3JlbWVudCBpcyBhdG9taWMgOiBpZiB5b3UgY29uY3VycmVudGx5IGluY3JlbWVudCAxMCB0aW1lcyBhIHZhbHVlIGJ5IDEsIHRoZSBmaW5hbCByZXN1bHQgd2lsbCBiZSB0aGUgaW5pdGlhbCB2YWx1ZSBwbHVzIDEwLiBUaGUgYWN0dWFsIGluZGl2aWR1YWwgcmVzdWx0aW5nIHZhbHVlcyBzZWVuIGJ5IHRoZSAxMCBjb25jdXJyZW50IGNhbGxlcnMgbWF5IHZhcnkgZGlzY29udGludW91c2x5LCB3aXRoIGR1cGxpY2F0ZXMgOiBhdCBsZWFzdCBvbmUgb2YgdGhlbSB3aWxsIHNlZSB0aGUgZmluYWwgKCsxMCkgcmVzdWx0LlxuXHQgKiAqL1xuXHRpbmMoe3RhYmxlLGRhdGEsa2V5LGtleTIsb3duZXIsY29sdW1ufSkge30sXG5cdC8qKlxuXHQgKiBBc2tzIGZvciBhIGxpc3Qgb2Ygcm93c1xuXHQgKiBcblx0ICogUmV0dXJucyBhIHBhZ2luYXRlZCBsaXN0IG9mIHJvd3MgZnJvbSB0aGUgZ2l2ZW4gdGFibGUuXG5cdCAqICovXG5cdGxpc3Qoe2NvbHVtbnMsb3duZXIscGFnZSx0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogUHV0cyBzb21lIGRhdGEgaW50byBhIGNlbGxcblx0ICogXG5cdCAqIENyZWF0ZXMgb3IgcmVwbGFjZXMgdGhlIGNvbnRlbnRzIG9mIGEgcGFydGljdWxhciBjZWxsLlxuXHQgKiAqL1xuXHRwdXQoe2NvbHVtbixkYXRhLGtleSxrZXkyLG93bmVyLHRhYmxlfSkge30sXG5cdC8qKlxuXHQgKiBQdXRzIHNldmVyYWwgcm93c1xuXHQgKiBcblx0ICogQ3JlYXRlcyBvciByZXBsYWNlcyB0aGUgKG1heWJlIHBhcnRpYWwpIGNvbnRlbnRzIG9mIGEgY29sbGVjdGlvbiBvZiByb3dzLlxuXHQgKiBUaGlzIG1ldGhvZCBvbmx5IGNyZWF0ZXMgb3IgcmVwbGFjZXMgY2VsbHMgZm9yIG5vbi1udWxsIGlucHV0IHZhbHVlcy5cblx0ICogKi9cblx0cHV0cyh7b3duZXIscm93cyx0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogQXNrcyBmb3IgYSByYW5nZSBvZiByb3dzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIHJhbmdlIG9mIHJvd3MgZnJvbSB0aGUgZ2l2ZW4gdGFibGUuXG5cdCAqIEEgcmFuZ2UgY29uc2lzdHMgb2YgY29uc2VjdXRpdmUgcm93cyBmcm9tIHRoZSBzdGFydCBrZXkgKGluY2x1c2l2ZSkgdG8gdGhlIHN0b3Aga2V5IChleGNsdXNpdmUpLlxuXHQgKiBZb3UgY2FuIHNwZWNpZnkgcGFydGlhbCBrZXlzIGZvciB0aGUgc3RhcnQgYW5kIHN0b3AgZmllbGRzLlxuXHQgKiAqL1xuXHRyYW5nZSh7Y29sdW1ucyxvd25lcixwYWdlLHN0YXJ0LHN0b3AsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIFJlZHVjZXMgYSByYW5nZSBvZiByb3dzXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgY29tcHV0ZWQgc2luZ2xlIHJlZHVjZWQgcmVzdWx0IGZyb20gYSByYW5nZSBvZiByb3dzIGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiBBIHJhbmdlIGNvbnNpc3RzIG9mIGNvbnNlY3V0aXZlIHJvd3MgZnJvbSB0aGUgc3RhcnQga2V5IChpbmNsdXNpdmUpIHRvIHRoZSBzdG9wIGtleSAoZXhjbHVzaXZlKS5cblx0ICogWW91IGNhbiBzcGVjaWZ5IHBhcnRpYWwga2V5cyBmb3IgdGhlIHN0YXJ0IGFuZCBzdG9wIGZpZWxkcy5cblx0ICogKi9cblx0cmVkdWNlKHt9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgb25lIGNlbGwgaW5zaWRlIGEgY29sdW1uIG9mIGEgcm93XG5cdCAqIFxuXHQgKiBSZW1vdmVzIG9ubHkgb25lIGNlbGwgb2YgdGhlIGdpdmVuIGNvbHVtbiBvZiB0aGUgZ2l2ZW4gcm93IGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiAqL1xuXHRyZW1vdmVDZWxsKHtjb2x1bW4sa2V5LGtleTIsb3duZXIsdGFibGV9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgb25lIGZ1bGwgY29sdW1uIG9mIGEgcm93XG5cdCAqIFxuXHQgKiBSZW1vdmVzIGFsbCBjZWxscyBvZiB0aGUgZ2l2ZW4gY29sdW1uIG9mIHRoZSBnaXZlbiByb3cgZnJvbSB0aGUgZ2l2ZW4gdGFibGUuXG5cdCAqICovXG5cdHJlbW92ZUNvbHVtbih7Y29sdW1uLGtleSxvd25lcix0YWJsZX0pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBhIHJhbmdlIG9mIHJvd3Ncblx0ICogXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBjb2x1bW5zIG9mIHRoZSBnaXZlbiByYW5nZSBvZiByb3dzIGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiAqL1xuXHRyZW1vdmVSYW5nZSh7Y29sdW1ucyxvd25lcixzdGFydCxzdG9wLHRhYmxlfSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIG9uZSBmdWxsIHJvd1xuXHQgKiBcblx0ICogUmVtb3ZlcyBhbGwgY29sdW1ucyBvZiB0aGUgZ2l2ZW4gcm93IGZyb20gdGhlIGdpdmVuIHRhYmxlLlxuXHQgKiAqL1xuXHRyZW1vdmVSb3coe2tleSxvd25lcix0YWJsZX0pIHt9XG59XG4vKipcbiAqIEdyb3VwcyBNYW5hZ2VtZW50XG4gKiBcbiAqIEdyb3VwcyBtYW5hZ2VtZW50IGZvciB1c2VycywgZ3JhbnRzIG9uIHJlc291cmNlcywgcmVtb3RlIGNvbW1hbmRzIG9uIGRldmljZXNcbiAqICBUaGlzIGlzIHdoZXJlIHlvdSBjYW4gY29uZmlndXJlIHJpZ2h0cyBmb3IgYW55IHJlc291cmNlXG4gKiBcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciByZW1vdGUgY29udHJvbFxuICogXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBSZW1vdGluZ1B1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBBZGRzIGEgbGlzdGVuZXJcblx0ICogXG5cdCAqIEEgdXNlciByZXF1ZXN0cyBub3RpZmljYXRpb25zIGZyb20gYSBkZXZpY2Ugb3duZWQgYnkgYW55b25lIHdobyBncmFudGVkIGhpbSB0aGUgcmlnaHQgYXV0aG9yaXphdGlvbnMuXG5cdCAqIFdoZW5ldmVyIHRoZSBkZXZpY2UgY2FsbHMgJ25vdGlmeScsIG5vdGlmaWNhdGlvbnMgd2lsbCBiZSBzZW50IHRvIHRoZSBjYWxsZXIgb2YgdGhpcyB2ZXJiLlxuXHQgKiAqL1xuXHRhZGRMaXN0ZW5lcih7Y21kLGRhdGEsZnJvbSxmcm9tUmVzb3VyY2Usb3duZXIscmVzb3VyY2V9KSB7fSxcblx0LyoqUmVzcG9uc2UgdG8gJ2dldENhcGFiaWxpdGllcycqL1xuXHRjYXBhYmlsaXRpZXMoe2Fuc3dlcmluZ1Jlc291cmNlLGFza2luZ1Jlc291cmNlLGNhcGFiaWxpdGllc30pIHt9LFxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBjb21tYW5kXG5cdCAqIFxuXHQgKiBBIHVzZXIgZXhlY3V0ZXMgYSBjb21tYW5kIG9uIGEgZGV2aWNlIG93bmVkIGJ5IGFueW9uZSB3aG8gZ3JhbnRlZCBoaW0gdGhlIHJpZ2h0IGF1dGhvcml6YXRpb25zLlxuXHQgKiBUaGUgY29tbWFuZCBpcyBpc3N1ZWQgb24gY2hhbm5lbCAnY29tbWFuZCdcblx0ICogKi9cblx0ZXhlY3V0ZSh7cmVzb3VyY2UsY21kLGRhdGEsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFJlcXVlc3RzIGNhcGFiaWxpdGllc1xuXHQgKiBcblx0ICogQSB1c2VyIHJlcXVlc3RzIGFsbCBoaXMgZGV2aWNlcyBmb3IgdGhlIHdob2xlIGxpc3Qgb2YgdGhlaXIgY2FwYWJpbGl0aWVzLlxuXHQgKiBEZXZpY2VzIGFyZSBleHBlY3RlZCB0byBhbnN3ZXIgb24gY2hhbm5lbCAnY2FwYWJpbGl0aWVzJ1xuXHQgKiAqL1xuXHRnZXRDYXBhYmlsaXRpZXMoe30pIHt9LFxuXHQvKipcblx0ICogTm90aWZpZXMgb2Ygc29tZSBldmVudFxuXHQgKiBcblx0ICogQSBkZXZpY2Ugbm90aWZpZXMgdGhlIHJlZ2lzdGVyZWQgdXNlcnMvZGV2aWNlcyBvbiB0aGlzIGNoYW5uZWwuXG5cdCAqIFRoZSBzZXJ2ZXIgZm9yd2FyZHMgdGhlIG5vdGlmaWNhdGlvbiB0byBzYWlkIHVzZXJzLlxuXHQgKiAqL1xuXHRub3RpZnkoe2NtZCxkYXRhLGZyb20sZnJvbVJlc291cmNlLG93bmVyLHJlc291cmNlfSkge30sXG5cdC8qKlxuXHQgKiBQaW5ncyBkZXZpY2VzXG5cdCAqIFxuXHQgKiBBIHVzZXIgcmVxdWVzdHMgYWxsIGRldmljZXMgKG9mIGFsbCBvd25lcnMpIG9uIHdoaWNoIGhlIGhhcyBhdXRob3JpemF0aW9ucyB0byByZXNwb25kIG9uIGNoYW5uZWwgJ3BvbmcnXG5cdCAqICovXG5cdHBpbmcoe2FjdGlvbn0pIHt9LFxuXHQvKipSZXNwb25zZSB0byBwaW5nKi9cblx0cG9uZyh7YWN0aW9uLGF2YWlsYWJsZSxvd25lcixyZXNvdXJjZSx1aWQsdXNlcn0pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBhIGxpc3RlbmVyXG5cdCAqIFxuXHQgKiBBIHVzZXIgc3RvcHMgcmVxdWVzdGluZyBub3RpZmljYXRpb25zIGZyb20gYSBkZXZpY2Ugb3duZWQgYnkgYW55b25lIHdobyBncmFudGVkIGhpbSB0aGUgcmlnaHQgYXV0aG9yaXphdGlvbnNcblx0ICogKi9cblx0cmVtb3ZlTGlzdGVuZXIoe2NtZCxkYXRhLGZyb20sZnJvbVJlc291cmNlLG93bmVyLHJlc291cmNlfSkge31cbn1cbi8qKlxuICogVXNlciBBUEkgZm9yIGdyb3VwcyBhbmQgcmlnaHRzLlxuICogXG4gKiBHcm91cHMgYXJlIHN0b3JlZCBwZXIgdXNlci5cbiAqIFRoaXMgbWVhbnMgdGhhdCB0d28gdXNlcnMgY2FuIG93biBhIGdyb3VwIHdpdGggdGhlIHNhbWUgaWRlbnRpZmllci4gQSBjb3VwbGUgKG93bmVyLCBncm91cCkgaXMgbmVlZGVkIHRvIHVuaXF1ZWx5IGlkZW50aWZ5IGEgZ3JvdXAgaW5zaWRlIGEgZ3JvdXAgbWFuYWdlbWVudCBzZXJ2aWNlLlxuICogVGhlIHRyaXBsZXQgKGRlcGxveW1lbnRJZCwgb3duZXIsIGdyb3VwKSBpcyBhY3R1YWxseSBuZWVkZWQgdG8gZnVsbHkgcXVhbGlmeSBhIGdyb3VwIG91dHNpZGUgb2YgdGhlIHNjb3BlIG9mIHRoaXMgc2VydmljZS5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IEdyb3VwTWFuYWdlbWVudFB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBBZGRzIG1lIHRvIGEgZ3JvdXBcblx0ICogXG5cdCAqIEFkZHMgbWUgKHRoZSBjYWxsZXIpIHRvIGEgZ3JvdXAuXG5cdCAqIFRoaXMgdmVyYiBleGlzdHMgc28gdGhhdCBncm91cCBvd25lcnMgbWF5IGdyYW50IHRoZSByaWdodCB0byBqb2luIHRoZWlyIGdyb3VwcyB3aXRob3V0IGdyYW50aW5nIHRoZSByaWdodCB0byBhZGQgb3RoZXIgdXNlcnMgdG8gdGhvc2UgZ3JvdXBzLlxuXHQgKiBUaGUgJ3VzZXInIGZpZWxkIGlzIGltcGxpY2l0bHkgc2V0IHRvIHRoZSBjdXJyZW50IHVzZXIncyBrZXkuXG5cdCAqICovXG5cdGFkZE1lKHtncm91cCxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogQWRkcyBhIHVzZXIgdG8gYSBncm91cFxuXHQgKiBcblx0ICogQWRkcyB0aGUgZ2l2ZW4gdXNlciB0byB0aGUgZ2l2ZW4gZ3JvdXAuXG5cdCAqIEFkZGl0aW9uIG1heSBmYWlsIGlmIHRoZSBnaXZlbiBncm91cCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXHQgKiAqL1xuXHRhZGRVc2VyKHt1c2VyLGdyb3VwLG93bmVyfSkge30sXG5cdC8qKkFkZHMgdXNlcnMgdG8gYSBncm91cCovXG5cdGFkZFVzZXJzKHt1c2Vycyxncm91cCxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogTGlzdHMgbXkgb3duZWQgZ3JvdXBzLCB3aXRoIGRldGFpbHNcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIHdob2xlIGxpc3Qgb2YgZ3JvdXBzIG93bmVkIGJ5IHRoZSBjdXJyZW50IHVzZXIsIHdpdGggdGhlaXIgbWVtYmVyc1xuXHQgKiAqL1xuXHRhbGxHcm91cHMoe293bmVyfSkge30sXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZ3JvdXBcblx0ICogXG5cdCAqIENyZWF0ZXMgYSBncm91cCBvd25lZCBieSB0aGUgY3VycmVudCB1c2VyLlxuXHQgKiBHcm91cCBjcmVhdGlvbiBtYXkgZmFpbCBpZiB0aGUgZ3JvdXAgYWxyZWFkeSBleGlzdHMuXG5cdCAqICovXG5cdGNyZWF0ZUdyb3VwKHtncm91cCxncm91cE5hbWUsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBncm91cFxuXHQgKiBcblx0ICogUmVtb3ZlcyB0aGUgZ2l2ZW4gZ3JvdXAgb3duZWQgYnkgdGhlIGN1cnJlbnQgdXNlciBvciB0aGUgZ2l2ZW4gb3duZXIuXG5cdCAqIEFsc28gcmVtb3ZlcyBhbGwgZ3JhbnRzIHRvIHRoYXQgZ3JvdXAuXG5cdCAqICovXG5cdGRlbEdyb3VwKHtncm91cCxvd25lcn0pIHt9LFxuXHQvKipSZW1vdmVzIGEgdXNlciBmcm9tIGEgZ3JvdXAqL1xuXHRkZWxVc2VyKHtncm91cCxvd25lcix1c2VyfSkge30sXG5cdC8qKlJlbW92ZXMgdXNlcnMgZnJvbSBhIGdyb3VwKi9cblx0ZGVsVXNlcnMoe2dyb3VwLGdyb3VwTmFtZSxvd25lcix1c2Vyc30pIHt9LFxuXHQvKipcblx0ICogVGVzdHMgZm9yIGEgZ3JvdXAncyBleGlzdGVuY2Vcblx0ICogXG5cdCAqIFJldHVybnMgd2hldGhlciBhIGdyb3VwIGV4aXN0cyBvciBub3QuXG5cdCAqICovXG5cdGV4aXN0cyh7Z3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIEdyYW50cyBhIHJpZ2h0IHRvIGEgZ3JvdXBcblx0ICogXG5cdCAqIFRoZSBncmFudGluZyBBUEkgZG9lcyBub3QgZG8gYW55IGNoZWNrIHdoZW4gc3RvcmluZyBwZXJtaXNzaW9ucy5cblx0ICogSW4gcGFydGljdWxhciB3aGVuIGdyYW50aW5nIHJpZ2h0cyBvbiBhIHZlcmIgYW5kIHJlc291cmNlIG9mIGFub3RoZXIgQVBJLCB0aGUgZXhpc3RlbmNlIG9mIHNhaWQgdmVyYiBhbmQgcmVzb3VyY2UgaXMgbm90IGNoZWNrZWQuXG5cdCAqICovXG5cdGdyYW50KHthY3Rpb24sZ3JvdXAsb3duZXIscmVzb3VyY2V9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIHRoZSBncm91cCB1c2Vyc1xuXHQgKiBcblx0ICogUmV0dXJucyB0aGUgd2hvbGUgbGlzdCBvZiB1c2VycyBjb25maWd1cmVkIGluc2lkZSB0aGUgZ2l2ZW4gZ3JvdXAuXG5cdCAqICovXG5cdGdyb3VwVXNlcnMoe2dyb3VwLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBteSBvd25lZCBncm91cHNcblx0ICogXG5cdCAqIFJldHVybnMgdGhlIHdob2xlIGxpc3Qgb2YgZ3JvdXBzIG93bmVkIGJ5IHRoZSBjdXJyZW50IHVzZXJcblx0ICogKi9cblx0Z3JvdXBzKHtvd25lcn0pIHt9LFxuXHQvKipcblx0ICogTGlzdHMgcmlnaHRzIGZvciBhIGdyb3VwXG5cdCAqIFxuXHQgKiBUaGlzIEFQSSBsaXN0cyBleHBsaWNpdGx5IGNvbmZpZ3VyZWQgcmlnaHRzLlxuXHQgKiBFZmZlY3RpdmUgcmlnaHRzIGluY2x1ZGUgY29uZmlndXJlZCByaWdodHMsIGltcGxpY2l0IHJpZ2h0cyBhbmQgaW5oZXJpdGVkIHJpZ2h0cy5cblx0ICogKi9cblx0bGlzdEdyYW50cyh7Z3JvdXAsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIHByZXNlbmNlcyBmb3IgYSBncm91cFxuXHQgKiBcblx0ICogUmV0dXJucyB0aGUgbGlzdCBvZiBtZW1iZXJzIG9mIHRoZSBnaXZlbiBncm91cHMsIGFsb25nIHdpdGggdGhlaXIgYWN0dWFsIGFuZCBjdXJyZW50IHByZXNlbmNlIG9uIHRoZSB6ZXRhcHVzaCBzZXJ2ZXIuXG5cdCAqIFRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIGRvZXMgbm90IGluY2x1ZGUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHBhcnRpY3VsYXIgZGV2aWNlcyB1c2VycyBhcmUgY29ubmVjdGVkIHdpdGguXG5cdCAqIElmIGEgdXNlciBpcyBjb25uZWN0ZWQgdHdpY2Ugd2l0aCB0d28gZGlmZmVyZW50IGRldmljZXMsIHR3byBpZGVudGljYWwgZW50cmllcyB3aWxsIGJlIHJldHVybmVkLlxuXHQgKiAqL1xuXHRsaXN0UHJlc2VuY2VzKHtncm91cCxvd25lcn0pIHt9LFxuXHQvKipcblx0ICogVGVzdHMgbWVtYmVyc2hpcFxuXHQgKiBcblx0ICogVGVzdHMgd2hldGhlciBJICh0aGUgY2FsbGVyKSBhbSBhIG1lbWJlciBvZiB0aGUgZ2l2ZW4gZ3JvdXAuXG5cdCAqIFRoaXMgdmVyYiBleGlzdHMgc28gdGhhdCB1c2VycyBjYW4gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIHBhcnQgb2YgYSBncm91cCB3aXRob3V0IGJlaW5nIGdyYW50ZWQgcGFydGljdWxhciByaWdodHMuXG5cdCAqIFRoZSAndXNlcicgZmllbGQgaXMgaW1wbGljaXRseSBzZXQgdG8gdGhlIGN1cnJlbnQgdXNlcidzIGtleS5cblx0ICogKi9cblx0bWVtYmVyT2Yoe2hhcmRGYWlsLGdyb3VwLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBHcmFudHMgcmlnaHRzIHRvIGEgZ3JvdXBcblx0ICogXG5cdCAqIEdyYW50IHNldmVyYWwgcmlnaHRzIGF0IG9uY2UuXG5cdCAqICovXG5cdG1ncmFudCh7YWN0aW9ucyxncm91cCxvd25lcixyZXNvdXJjZX0pIHt9LFxuXHQvKipSZXZva2VzIHJpZ2h0cyBmb3IgYSBncm91cCovXG5cdG1yZXZva2Uoe2FjdGlvbnMsZ3JvdXAsb3duZXIscmVzb3VyY2V9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIHRoZSBncm91cHMgSSBhbSBwYXJ0IG9mXG5cdCAqIFxuXHQgKiBSZXR1cm5zIHRoZSB3aG9sZSBsaXN0IG9mIGdyb3VwcyB0aGUgY3VycmVudCB1c2VyIGlzIHBhcnQgb2YuXG5cdCAqIEdyb3VwcyBtYXkgYmUgb3duZWQgYnkgYW55b25lLCBpbmNsdWRpbmcgdGhlIGN1cnJlbnQgdXNlci5cblx0ICogKi9cblx0bXlHcm91cHMoe293bmVyfSkge30sXG5cdC8qKlJldm9rZXMgYSByaWdodCBmb3IgYSBncm91cCovXG5cdHJldm9rZSh7YWN0aW9uLGdyb3VwLG93bmVyLHJlc291cmNlfSkge31cbn1cbi8qKlxuICogSFRUUCBjbGllbnRcbiAqIFxuICogV2ViLXNlcnZpY2UgY2xpZW50XG4gKiAgQW4gYWRtaW4gcmVjb3JkcyBVUkwgdGVtcGxhdGVzIHRoYXQgY2FuIGJlIGNhbGxlZCBieSB1c2Vyc1xuICogIENhbGxzIGFyZSBub3QgY29uZmlndXJhYmxlIGJ5IGVuZC11c2Vyc1xuICogIEhvd2V2ZXIgYW4gYWRtaW4gbWF5IGxldmVyYWdlIHRoZSBtYWNybyBzZXJ2aWNlIHRvIGFjaGlldmUgVVJMLCBoZWFkZXJzIGFuZCBib2R5IGNvbmZpZ3VyYWJpbGl0eVxuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIGh0dHAgcmVxdWVzdHNcbiAqIFxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgSHR0cGNsaWVudFB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBNYWtlcyBhIHByZWRlZmluZWQgcmVxdWVzdFxuXHQgKiBcblx0ICogTG9va3VwcyBhIHByZWRlZmluZWQgcmVxdWVzdCBieSBuYW1lLCBhbmQgZXhlY3V0ZXMgaXQuXG5cdCAqICovXG5cdGNhbGwoe25hbWUscmVxdWVzdElkfSkge30sXG5cdC8qKlxuXHQgKiBNYWtlcyBhIHBhcmFtZXRlcml6ZWQgcmVxdWVzdFxuXHQgKiBcblx0ICogRXhlY3V0ZXMgYW4gSFRUUCByZXF1ZXN0IHdpdGggdGhlIGdpdmVuIHVybCwgbWV0aG9kLCBoZWFkZXJzIGFuZCBib2R5LlxuXHQgKiAqL1xuXHRyZXF1ZXN0KHt9KSB7fVxufVxuLyoqXG4gKiBNYWNyb3NcbiAqIFxuICogTWFjcm8tY29tbWFuZCBzZXJ2aWNlXG4gKiAgQW4gYWRtaW4gZGVmaW5lcyBtYWNyby1jb21tYW5kcyB0aGF0IGNhbiBzZXF1ZW50aWFsbHkgY2FsbCBhbnkgbnVtYmVyIG9mIG90aGVyIGFwaSB2ZXJicywgbG9vcCBvbiBjb2xsZWN0aW9ucyBvZiBkYXRhLCBtYWtlIGRlY2lzaW9ucywgZXRjXG4gKiBcbiAqIFxuICogIEVuZC11c2VycyBwbGF5IHRoZW0sIHdpdGggY29udGV4dHVhbCBwYXJhbWV0ZXJzXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3IgbWFjcm8gZXhlY3V0aW9uXG4gKiBcbiAqIFNpbXBsZSBlcnJvcnMgYXJlIHJlcG9ydGVkIGFzIHVzdWFsLlxuICogSG93ZXZlciwgdGhlIG1hY3JvIGV4ZWN1dGlvbiB2ZXJicyB0cmVhdCBtb3N0IGVycm9ycyBpbiBhIHBhcnRpY3VsYXIgd2F5IDogaW5zdGVhZCBvZiByZXBvcnRpbmcgZXJyb3JzIG9uIHRoZSB1c3VhbCAnZXJyb3InIGNoYW5uZWwsIGVycm9ycyBhcmUgcHV0IGluIHRoZSByZXR1cm5lZCAnTWFjcm9Db21wbGV0aW9uJyByZXN1bHQuXG4gKiBUaGlzIGJlaGF2aW9yIGNhbiBiZSB0dW5lZCBvbiBhIHBlci1jYWxsIGJhc2lzIHdpdGggdGhlIGhhcmRGYWlsIHBhcmFtZXRlci5cbiAqIE5vdGUgdGhhdCBzb21lIHBhcnRpY3VsYXIgZXJyb3JzIHdpbGwgYWx3YXlzIGJlaGF2ZSBhcyBpZiBoYXJkRmFpbCB3ZXJlIHRydWUsIGJlY2F1c2UgdGhleSBhcmUgcmVsYXRlZCB0byBwcm9ncmFtbWluZyBlcnJvcnMsIG9yIHByZXZlbnQgcHJvY2Vzc2luZyBmcm9tIGVuZGluZyBncmFjZWZ1bGx5IDogU1RBQ0tfT1ZFUkZMT1csIE5PX1NVQ0hfRlVOQ1RJT04sIFJBTV9FWENFRURFRCwgQ1lDTEVTX0VYQ0VFREVELCBUSU1FX0VYQ0VFREVELCBRVU9UQV9FWENFRURFRCwgUkFURV9FWENFRURFRCwgQkFEX0NPTVBBUkFUT1JfVkFMVUVcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IE1hY3JvUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIFBsYXlzIGEgcHJldmlvdXNseSByZWNvcmRlZCBtYWNyb1xuXHQgKiBcblx0ICogRE8gTk9UIHVzZSB0aGlzIHZlcmIgZnJvbSBpbnNpZGUgYW4gZW5jbG9zaW5nIG1hY3JvIHdoZW4geW91IG5lZWQgdGhlIHJlc3VsdCBpbiBvcmRlciB0byBwcm9jZWVkIHdpdGggdGhlIGVuY2xvc2luZyBtYWNyby5cblx0ICogWW91IGNhbiBvdmVycmlkZSB0aGUgZGVmYXVsdCBub3RpZmljYXRpb24gY2hhbm5lbCB3aGVuIGRlZmluaW5nIHRoZSBtYWNyby5cblx0ICogKi9cblx0Y2FsbCh7ZGVidWcsaGFyZEZhaWwsbmFtZSxwYXJhbWV0ZXJzfSkge30sXG5cdC8qKlxuXHQgKiBQbGF5cyBhIHByZXZpb3VzbHkgcmVjb3JkZWQgbWFjcm8gYW5kIHJldHVybnMgdGhlIHJlc3VsdC5cblx0ICogXG5cdCAqIFVzZSB0aGlzIHZlcmIgd2hlbiB5b3Ugd2FudCB0byBzeW5jaHJvbm91c2x5IGNhbGwgYSBtYWNybyBmcm9tIGluc2lkZSBhbm90aGVyIG1hY3JvLlxuXHQgKiAqL1xuXHRmdW5jKHt9KSB7fSxcblx0LyoqXG5cdCAqIFNpbWlsYXIgdG8gZnVuYywgd2l0aCB0aGUgYWJpbGl0eSB0byBpbXBlcnNvbmF0ZSBhbnkgdXNlciBhdCB3aWxsLlxuXHQgKiBcblx0ICogVXNlIHRoaXMgdmVyYiB3aGVuIHlvdSBkbyBub3Qgd2FudCB0byB1c2Ugb3IgY2Fubm90IHVzZSB0aGUgc3RhbmRhcmQgcmlnaHRzIHN5c3RlbSBhbmQgd2lzaCB0byBieXBhc3MgaXQgY29tcGxldGVseS5cblx0ICogVXNlIHRoaXMgdmVyYiBzcGFyaW5nbHksIGFzIGl0IGNhbiBnaXZlIHRoZSBjYWxsZXIgYW55IHJpZ2h0IG9uIGFueSByZXNvdXJjZS5cblx0ICogKi9cblx0c3Vkbyh7fSkge31cbn1cbi8qKlxuICogTWFpbCBzZW5kZXJcbiAqIFxuICogU2VuZHMgZW1haWwgdGhyb3VnaCBTTVRQXG4gKiAqL1xuLyoqXG4gKiBNYWlsIHNlcnZpY2UgdXNlciBBUElcbiAqIFxuICogVGhpcyBzZXJ2aWNlIGlzIHN0YXRpY2FsbHkgY29uZmlndXJlZCB3aXRoIGFuIG91dGdvaW5nIFNNVFAgc2VydmVyLlxuICogVXNlcnMgY2FsbCB0aGUgQVBJIGhlcmUgdG8gYWN0dWFsbHkgc2VuZCBlbWFpbHMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBTZW5kbWFpbFB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBTZW5kcyBhbiBlbWFpbFxuXHQgKiBcblx0ICogU2VuZHMgYW4gZW1haWwgd2l0aCB0aGUgZ2l2ZW4gYm9keSB0byB0aGUgaW50ZW5kZWQgcmVjaXBpZW50cy5cblx0ICogKi9cblx0c2VuZCh7fSkge31cbn1cbi8qKlxuICogTWVzc2FnaW5nIHNlcnZpY2VcbiAqIFxuICogTWVzc2FnaW5nIHNlcnZpY2VcbiAqICovXG4vKipcbiAqIE1lc3NhZ2luZyBzZXJ2aWNlXG4gKiBcbiAqIFNpbXBsZSBhbmQgZmxleGlibGUgdXNlci10by11c2VyIG9yIHVzZXItdG8tZ3JvdXAgbWVzc2FnaW5nIHNlcnZpY2UuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBNZXNzYWdpbmdQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogU2VuZHMgYSBtZXNzYWdlIHRvIGEgdGFyZ2V0XG5cdCAqIFxuXHQgKiBTZW5kcyB0aGUgZ2l2ZW4gbWVzc2FnZSB0byB0aGUgc3BlY2lmaWVkIHRhcmdldCBvbiB0aGUgZ2l2ZW4gKG9wdGlvbmFsKSBjaGFubmVsLlxuXHQgKiBUaGUgYWRtaW5pc3RyYXRpdmVseSBnaXZlbiBkZWZhdWx0IGNoYW5uZWwgbmFtZSBpcyB1c2VkIHdoZW4gbm9uZSBpcyBwcm92aWRlZCBpbiB0aGUgbWVzc2FnZSBpdHNlbGYuXG5cdCAqICovXG5cdHNlbmQoe3RhcmdldCxjaGFubmVsLGRhdGF9KSB7fVxufVxuLyoqXG4gKiBQcm9kdWNlciBjb25zdW1lclxuICogXG4gKiBQcm9kdWNlciBjb25zdW1lciBzZXJ2aWNlXG4gKiAgVXNlcnMgY2FuIHN1Ym1pdCB0YXNrcyBhbmQgb3RoZXIgdXNlcnMgY29uc3VtZSB0aGVtXG4gKiAqL1xuLyoqXG4gKiBQcm9kdWNlciAvIGNvbnN1bWVyIHJlYWwtdGltZSBBUElcbiAqIFxuICogVGFzayBwcm9kdWNlcnMgc3VibWl0cyB0aGVpciB0YXNrcy5cbiAqIFRoZSBzZXJ2ZXIgZGlzcGF0Y2hlcyB0aGUgdGFza3MuXG4gKiBDb25zdW1lcnMgcHJvY2VzcyB0aGVtIGFuZCByZXBvcnQgY29tcGxldGlvbiBiYWNrIHRvIHRoZSBzZXJ2ZXIuXG4gKiBUYXNrcyBhcmUgZ2xvYmFsIHRvIHRoZSBzZXJ2aWNlIChpLmUuIE5PVCBwZXIgdXNlcikuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBRdWV1ZVB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBTdWJtaXRzIGEgdGFza1xuXHQgKiBcblx0ICogUHJvZHVjZXIgQVBJLlxuXHQgKiBBIHRhc2sgcHJvZHVjZXIgc3VibWl0cyB0aGUgZ2l2ZW4gdGFzayB0byB0aGUgc2VydmVyLlxuXHQgKiBUaGUgc2VydmVyIHdpbGwgZmluZCBhIHRhc2tlciB3aXRoIHByb2Nlc3NpbmcgY2FwYWNpdHkgYW5kIGRpc3BhdGNoIHRoZSB0YXNrLlxuXHQgKiBUaGUgdGFzayByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0byB0aGUgY2FsbGVyLlxuXHQgKiBXaGVuIGNhbGxlZCBmcm9tIGluc2lkZSBhIG1hY3JvLCB0aGUgY29tc3VtZXIgZ2VuZXJhdGVkIHJlc3VsdCBpcyBhdmFpbGFibGUgZm9yIGZ1cnRoZXIgdXNlLlxuXHQgKiAqL1xuXHRjYWxsKHtkZXNjcmlwdGlvbixvcmlnaW5CdXNpbmVzc0lkLG9yaWdpbkRlcGxveW1lbnRJZCxkYXRhLG93bmVyfSkge30sXG5cdC8qKlxuXHQgKiBOb3RpZmllcyBjb21wbGV0aW9uIG9mIGEgdGFza1xuXHQgKiBcblx0ICogQ29uc3VtZXIgQVBJLlxuXHQgKiBUaGUgdGFza2VyIG5vdGlmaWVzIGNvbXBsZXRpb24gb2YgdGhlIGdpdmVuIHRhc2sgdG8gdGhlIHNlcnZlci5cblx0ICogVGhlIHRhc2tlciBjYW4gb3B0aW9uYWxseSBpbmNsdWRlIGEgcmVzdWx0IG9yIGFuIGVycm9yIGNvZGUuXG5cdCAqICovXG5cdGRvbmUoe3Jlc3VsdCxzdWNjZXNzLHRhc2tJZH0pIHt9LFxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgY29uc3VtZXJcblx0ICogXG5cdCAqIENvbnN1bWVyIEFQSS5cblx0ICogUmVnaXN0ZXJzIHRoZSBjdXJyZW50IHVzZXIgcmVzb3VyY2UgYXMgYW4gYXZhaWxhYmxlIHRhc2sgY29uc3VtZXIuXG5cdCAqIFRhc2tzIHdpbGwgYmUgdGhlbiBkaXNwYXRjaGVkIHRvIHRoYXQgY29uc3VtZXIuXG5cdCAqICovXG5cdHJlZ2lzdGVyKHtjYXBhY2l0eX0pIHt9LFxuXHQvKipcblx0ICogU3VibWl0cyBhIHRhc2tcblx0ICogXG5cdCAqIFByb2R1Y2VyIEFQSS5cblx0ICogQSB0YXNrIHByb2R1Y2VyIHN1Ym1pdHMgdGhlIGdpdmVuIHRhc2sgdG8gdGhlIHNlcnZlci5cblx0ICogVGhlIHNlcnZlciB3aWxsIGZpbmQgYSB0YXNrZXIgd2l0aCBwcm9jZXNzaW5nIGNhcGFjaXR5IGFuZCBkaXNwYXRjaCB0aGUgdGFzay5cblx0ICogVGhlIHRhc2sgcmVzdWx0IHdpbGwgYmUgaWdub3JlZCA6IHRoZSBwcm9kdWNlciB3aWxsIG5vdCByZWNlaXZlIGFueSBub3RpZmljYXRpb24gb2YgYW55IGtpbmQsIGV2ZW4gaW4gY2FzZSBvZiBlcnJvcnMgKGluY2x1ZGluZyBjYXBhY2l0eSBleGNlZWRlZCBlcnJvcnMpLlxuXHQgKiBUaGlzIHZlcmIgd2lsbCByZXR1cm4gaW1tZWRpYXRlbHkgOiB5b3UgY2FuIHVzZSB0aGlzIEFQSSB0byBhc3luY2hyb25vdXNseSBzdWJtaXQgYSB0YXNrLlxuXHQgKiAqL1xuXHRzdWJtaXQoe2Rlc2NyaXB0aW9uLG9yaWdpbkJ1c2luZXNzSWQsb3JpZ2luRGVwbG95bWVudElkLGRhdGEsb3duZXJ9KSB7fSxcblx0LyoqXG5cdCAqIFVucmVnaXN0ZXJzIGEgY29uc3VtZXJcblx0ICogXG5cdCAqIENvbnN1bWVyIEFQSS5cblx0ICogVW5yZWdpc3RlcnMgdGhlIGN1cnJlbnQgdXNlciByZXNvdXJjZSBhcyBhbiBhdmFpbGFibGUgdGFzayBjb25zdW1lci5cblx0ICogQWxsIG5vbiBmaW5pc2hlZCB0YXNrcyBhcmUgcmV0dXJuZWQgdG8gdGhlIHNlcnZlci5cblx0ICogKi9cblx0dW5yZWdpc3Rlcih7fSkge31cbn1cbi8qKlxuICogU01TIHZpYSBPVkhcbiAqIFxuICogU01TIHNlbmRlciwgdG8gc2VuZCB0ZXh0IG1lc3NhZ2VzIHRvIG1vYmlsZSBwaG9uZXNcbiAqIFRoaXMgU01TIHNlbmRpbmcgc2VydmljZSB1c2VzIHRoZSBPVkggQVBJXG4gKiBcbiAqICovXG4vKipcbiAqIFNNUyBzZXJ2aWNlXG4gKiBcbiAqIFVzZXIgQVBJIGZvciBTTVMuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBTbXNfb3ZoUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIFNlbmRzIGFuIFNNU1xuXHQgKiBcblx0ICogU2VuZHMgdGhlIGdpdmVuIG1lc3NhZ2UgdG8gdGhlIGdpdmVuIHJlY2lwaWVudHMuXG5cdCAqICovXG5cdHNlbmQoe30pIHt9XG59XG4vKipcbiAqIFNjaGVkdWxlclxuICogXG4gKiBTY2hlZHVsZXIgc2VydmljZVxuICogIEVuZC11c2VycyBjYW4gc2NoZWR1bGUgb25lLXRpbWUgb3IgcmVwZXRpdGl2ZSB0YXNrcyB1c2luZyBhIGNsYXNzaWNhbCBjcm9uIHN5bnRheCAod2l0aCB0aGUgeWVhciBmaWVsZCkgb3IgYSB0aW1lc3RhbXAgKG1pbGxpc2Vjb25kcyBmcm9tIHRoZSBlcG9jaClcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciB0aGUgU2NoZWR1bGVyXG4gKiBcbiAqIFVzZXIgZW5kcG9pbnRzIGZvciBzY2hlZHVsaW5nIDogdXNlcnMgY2FuIHNjaGVkdWxlLCBsaXN0IGFuZCBkZWxldGUgdGFza3MuXG4gKiBUYXNrcyBhcmUgc3RvcmVkIG9uIGEgcGVyLXVzZXIgYmFzaXM6IGEgdGFzayB3aWxsIHJ1biB3aXRoIHRoZSBwcml2aWxlZGdlcyBvZiB0aGUgdXNlciB3aG8gc3RvcmVkIGl0LlxuICogVGFza3MgYXJlIHJ1biBvbiB0aGUgc2VydmVyIGFuZCB0aHVzIGNhbiBjYWxsIGFwaSB2ZXJicyBtYXJrZWQgYXMgc2VydmVyLW9ubHkuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBDcm9uUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIExpc3QgdGhlIGNvbmZpZ3VyZWQgdGFza3Ncblx0ICogXG5cdCAqIFJldHVybnMgYSBwYWdpbmF0ZWQgbGlzdCBvZiB0aGUgYXNraW5nIHVzZXIncyB0YXNrcy5cblx0ICogKi9cblx0bGlzdCh7b3duZXIscGFnZSxzdGFydCxzdG9wfSkge30sXG5cdC8qKlxuXHQgKiBTY2hlZHVsZXMgYSB0YXNrXG5cdCAqIFxuXHQgKiBTY2hlZHVsZXMgYSB0YXNrIGZvciBsYXRlciBleGVjdXRpb24uXG5cdCAqIElmIGEgdGFzayBhbHJlYWR5IGV4aXN0cyB3aXRoIHRoZSBzYW1lIGNyb25OYW1lLCB0aGlzIG5ldyB0YXNrIGNvbXBsZXRlbHkgcmVwbGFjZXMgaXQuXG5cdCAqIEEgdGFzayBjYW4gYmUgc2NoZWR1bGVkIHdpdGggYSBjcm9uLWxpa2Ugc3ludGF4IGZvciByZXBldGl0aXZlIG9yIG9uZS1zaG90IGV4ZWN1dGlvbi5cblx0ICogV2lsZGNhcmRzIGFyZSBub3QgYWxsb3dlZCBmb3IgbWludXRlcyBhbmQgaG91cnMuXG5cdCAqIFdoZW4gc2NoZWR1bGluZyBmb3Igb25lLXNob3QgZXhlY3V0aW9uLCB0aGUgdGltZSBtdXN0IGJlIGF0IGxlYXN0IHR3byBtaW51dGVzIGludG8gdGhlIGZ1dHVyZS5cblx0ICogKi9cblx0c2NoZWR1bGUoe30pIHt9LFxuXHQvKipcblx0ICogUmVtb3ZlcyBhIHNjaGVkdWxlZCB0YXNrXG5cdCAqIFxuXHQgKiBSZW1vdmVzIGEgcHJldmlvdXNseSBzY2hlZHVsZWQgdGFzay5cblx0ICogRG9lcyBhYnNvbHV0ZWx5IG5vdGhpbmcgaWYgYXNrZWQgdG8gcmVtb3ZlIGEgbm9uLWV4aXN0ZW50IHRhc2suXG5cdCAqICovXG5cdHVuc2NoZWR1bGUoe2Nyb25OYW1lLG93bmVyfSkge31cbn1cbi8qKlxuICogU2VhcmNoIGVuZ2luZVxuICogXG4gKiBFbGFzdGljU2VhcmNoIGVuZ2luZSwgdG8gaW5kZXggYW5kIHNlYXJjaCBkYXRhXG4gKiAgQW4gYWRtaW4gY3JlYXRlcyBpbmRpY2VzXG4gKiAgVXNlcnMgaW5kZXggYW5kIHNlYXJjaCBkb2N1bWVudHNcbiAqIFxuICogKi9cbi8qKlxuICogRWxhc3RpY1NlYXJjaCBTZXJ2aWNlXG4gKiBcbiAqIFRoaXMgQVBJIGlzIGEgdmVyeSB0aGluIHdyYXBwZXIgYXJvdW5kIEVsYXN0aWNTZWFyY2gncyBBUEkuXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBTZWFyY2hQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogRGVsZXRlcyBkYXRhXG5cdCAqIFxuXHQgKiBEZWxldGVzIGEgZG9jdW1lbnQgZnJvbSB0aGUgZWxhc3RpY3NlYXJjaCBlbmdpbmUgYnkgaWQuXG5cdCAqICovXG5cdGRlbGV0ZSh7aWQsaW5kZXgsdHlwZX0pIHt9LFxuXHQvKipcblx0ICogR2V0cyBkYXRhXG5cdCAqIFxuXHQgKiBSZXRyaWV2ZXMgYSBkb2N1bWVudCBmcm9tIHRoZSBlbGFzdGljc2VhcmNoIGVuZ2luZSBieSBpZC5cblx0ICogKi9cblx0Z2V0KHtpZCxpbmRleCx0eXBlfSkge30sXG5cdC8qKlxuXHQgKiBJbmRleGVzIGRhdGFcblx0ICogXG5cdCAqIEluc2VydHMgb3IgdXBkYXRlcyBhIGRvY3VtZW50IGludG8gdGhlIGVsYXN0aWNzZWFyY2ggZW5naW5lLlxuXHQgKiAqL1xuXHRpbmRleCh7ZGF0YSxpZCxpbmRleCx0eXBlfSkge30sXG5cdC8qKlNlYXJjaGVzIGZvciBkYXRhKi9cblx0c2VhcmNoKHtpbmRpY2VzLHBhZ2UscXVlcnksc29ydH0pIHt9XG59XG4vKipcbiAqIFRlbXBsYXRlIGVuZ2luZVxuICogXG4gKiBUZW1wbGF0ZSBlbmdpbmUgdG8gcHJvZHVjZSBkb2N1bWVudHMgZnJvbSBwYXJhbWV0ZXJpemVkIHRlbXBsYXRlc1xuICogPGJyPkFuIGFkbWluIGNyZWF0ZXMgdGVtcGxhdGVzXG4gKiA8YnI+IFVzZXJzIHByb2R1Y2UgZG9jdW1lbnRzXG4gKiA8YnI+VGhlIGltcGxlbWVudGF0aW9uIHVzZXMgdGhlIDxhIGhyZWY9J2h0dHA6Ly9mcmVlbWFya2VyXG4gKiBvcmcvJz5mcmVlbWFya2VyPC9hPiBlbmdpbmVcbiAqIFxuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIHRlbXBsYXRlc1xuICogXG4gKiBVc2VycyB1c2UgdGhpcyBBUEkgdG8gZXZhbHVhdGUgcHJlLWNvbmZpZ3VyZWQgdGVtcGxhdGVzLlxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgVGVtcGxhdGVQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogRXZhbHVhdGVzIGEgdGVtcGxhdGVcblx0ICogXG5cdCAqIEV2YWx1YXRlcyB0aGUgZ2l2ZW4gdGVtcGxhdGUgYW5kIHJldHVybnMgdGhlIHJlc3VsdCBhcyBhIHN0cmluZy5cblx0ICogVGVtcGxhdGVzIGFyZSBwYXJzZWQgdGhlIGZpcnN0IHRpbWUgdGhleSBhcmUgZXZhbHVhdGVkLiBFdmFsdWF0aW9uIG1heSBmYWlsIGVhcmx5IGR1ZSB0byBhIHBhcnNpbmcgZXJyb3IuXG5cdCAqICovXG5cdGV2YWx1YXRlKHtkYXRhLGxhbmd1YWdlVGFnLG5hbWUscmVxdWVzdElkfSkge31cbn1cbi8qKlxuICogVXBsb2FkOiBTM1xuICogXG4gKiBVcGxvYWQgc2VydmljZSB3aXRoIFMzIHN0b3JhZ2VcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciBmaWxlIG1hbmFnZW1lbnRcbiAqIFxuICogVXNlciBBUEkgZm9yIHZpcnR1YWwgZmlsZSBtYW5hZ2VtZW50IGFuZCBodHRwIGZpbGUgdXBsb2FkXG4gKiBUaGlzIEFQSSBjb250YWlucyBhbGwgdGhlIHZlcmJzIG5lZWRlZCB0byBicm93c2UsIHVwbG9hZCBhbmQgcmVtb3ZlIGZpbGVzLlxuICogRmlsZXMgYXJlIHN0b3JlZCBvbiBhIHBlci11c2VyIGJhc2lzOiBlYWNoIHVzZXIgaGFzIGhpcyBvciBoZXIgb3duIHdob2xlIHZpcnR1YWwgZmlsZXN5c3RlbS5cbiAqIFVwbG9hZGluZyBhIGZpbGUgaXMgYSAzLXN0ZXAgcHJvY2VzcyA6IHJlcXVlc3QgYW4gdXBsb2FkIFVSTCwgdXBsb2FkIHZpYSBIVFRQLCBub3RpZnkgdGhpcyBzZXJ2aWNlIG9mIGNvbXBsZXRpb24uXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBacGZzX3MzUHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIENvcGllcyBhIGZpbGVcblx0ICogXG5cdCAqIENvcGllcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkgdG8gYSBuZXcgbG9jYXRpb24uXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRjcCh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGRpc2sgdXNhZ2Vcblx0ICogXG5cdCAqIFJldHVybnMgYW4gcmVjdXJzaXZlbHkgYWdncmVnYXRlZCBudW1iZXIgb2YgdXNlZCBieXRlcywgc3RhcnRpbmcgYXQgdGhlIGdpdmVuIHBhdGguXG5cdCAqICovXG5cdGR1KHtvd25lcixwYXRofSkge30sXG5cdC8qKlJlcXVlc3RzIGFuIHVwbG9hZCBVUkwgd2l0aG91dCBjb25zdHJhaW50cy4qL1xuXHRmcmVlVXBsb2FkVXJsKHt9KSB7fSxcblx0LyoqXG5cdCAqIExpbmtzIGEgZmlsZVxuXHQgKiBcblx0ICogTGlua3MgYSBmaWxlIG9yIGZvbGRlciB0byBhbm90aGVyIGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bGluayh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBhIGZvbGRlciBjb250ZW50XG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIGxpc3Qgb2YgdGhlIGZvbGRlcidzIGNvbnRlbnQuXG5cdCAqICovXG5cdGxzKHtmb2xkZXIsb3duZXIscGFnZX0pIHt9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZvbGRlclxuXHQgKiBcblx0ICogQ3JlYXRlcyBhIG5ldyBmb2xkZXIuXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRta2Rpcih7Zm9sZGVyLG93bmVyLHBhcmVudHN9KSB7fSxcblx0LyoqXG5cdCAqIE1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogTW92ZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpIHRvIGEgbmV3IGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bXYoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogTm90aWZpZXMgb2YgdXBsb2FkIGNvbXBsZXRpb25cblx0ICogXG5cdCAqIFRoZSBjbGllbnQgYXBwbGljYXRpb24gY2FsbHMgdGhpcyB2ZXJiIHRvIG5vdGlmeSB0aGF0IGl0J3MgZG9uZSB1cGxvYWRpbmcgdG8gdGhlIGNsb3VkLlxuXHQgKiBDYWxsaW5nIHRoYXQgdmVyYiBNQVkgdHJpZ2dlciBhZGRpdGlvbmFsIGV2ZW50cyBzdWNoIGFzIHRodW1ibmFpbC9tZXRhZGF0YSBjcmVhdGlvbi5cblx0ICogKi9cblx0bmV3RmlsZSh7Z3VpZCxtZXRhZGF0YSxvd25lcix0YWdzfSkge30sXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhbiB1cGxvYWQgVVJMXG5cdCAqIFxuXHQgKiBSZXF1ZXN0cyBhbiBIVFRQIHVwbG9hZCBVUkwuXG5cdCAqIFRoZSBVUkwgY29udGFpbnMgdGVtcG9yYXJ5IGNyZWRlbnRpYWxzICh0eXBpY2FsbHkgdmFsaWQgZm9yIGEgZmV3IG1pbnV0ZXMpIGFuZCBpcyBtZWFudCBmb3IgaW1tZWRpYXRlIHVzZS5cblx0ICogKi9cblx0bmV3VXBsb2FkVXJsKHtjb250ZW50VHlwZSxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogUmVtb3ZlcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkuXG5cdCAqICovXG5cdHJtKHtvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgZmlsZVxuXHQgKiBcblx0ICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIHNpbmdsZSBmaWxlLlxuXHQgKiBUaGUgZW50cnkgZmllbGQgd2lsbCBiZSBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IGV4aXN0XG5cdCAqICovXG5cdHN0YXQoe293bmVyLHBhdGh9KSB7fSxcblx0LyoqVXBkYXRlcyBhIGZpbGUncyBtZXRhZGF0YSovXG5cdHVwZGF0ZU1ldGEoe21ldGFkYXRhLG1ldGFkYXRhRmlsZXMsb3duZXIscGF0aH0pIHt9XG59XG4vKipcbiAqIFVwbG9hZDogbG9jYWxcbiAqIFxuICogVXBsb2FkIHNlcnZpY2Ugd2l0aCBsb2NhbCBIREZTIHN0b3JhZ2VcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciBmaWxlIG1hbmFnZW1lbnRcbiAqIFxuICogVXNlciBBUEkgZm9yIHZpcnR1YWwgZmlsZSBtYW5hZ2VtZW50IGFuZCBodHRwIGZpbGUgdXBsb2FkXG4gKiBUaGlzIEFQSSBjb250YWlucyBhbGwgdGhlIHZlcmJzIG5lZWRlZCB0byBicm93c2UsIHVwbG9hZCBhbmQgcmVtb3ZlIGZpbGVzLlxuICogRmlsZXMgYXJlIHN0b3JlZCBvbiBhIHBlci11c2VyIGJhc2lzOiBlYWNoIHVzZXIgaGFzIGhpcyBvciBoZXIgb3duIHdob2xlIHZpcnR1YWwgZmlsZXN5c3RlbS5cbiAqIFVwbG9hZGluZyBhIGZpbGUgaXMgYSAzLXN0ZXAgcHJvY2VzcyA6IHJlcXVlc3QgYW4gdXBsb2FkIFVSTCwgdXBsb2FkIHZpYSBIVFRQLCBub3RpZnkgdGhpcyBzZXJ2aWNlIG9mIGNvbXBsZXRpb24uXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBacGZzX2hkZnNQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQ29waWVzIGEgZmlsZVxuXHQgKiBcblx0ICogQ29waWVzIGEgZmlsZSBvciBmb2xkZXIgKHJlY3Vyc2l2ZWx5KSB0byBhIG5ldyBsb2NhdGlvbi5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdGNwKHtvbGRQYXRoLG93bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIFJldHVybnMgZGlzayB1c2FnZVxuXHQgKiBcblx0ICogUmV0dXJucyBhbiByZWN1cnNpdmVseSBhZ2dyZWdhdGVkIG51bWJlciBvZiB1c2VkIGJ5dGVzLCBzdGFydGluZyBhdCB0aGUgZ2l2ZW4gcGF0aC5cblx0ICogKi9cblx0ZHUoe293bmVyLHBhdGh9KSB7fSxcblx0LyoqUmVxdWVzdHMgYW4gdXBsb2FkIFVSTCB3aXRob3V0IGNvbnN0cmFpbnRzLiovXG5cdGZyZWVVcGxvYWRVcmwoe30pIHt9LFxuXHQvKipcblx0ICogTGlua3MgYSBmaWxlXG5cdCAqIFxuXHQgKiBMaW5rcyBhIGZpbGUgb3IgZm9sZGVyIHRvIGFub3RoZXIgbG9jYXRpb24uXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRsaW5rKHtvbGRQYXRoLG93bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIExpc3RzIGEgZm9sZGVyIGNvbnRlbnRcblx0ICogXG5cdCAqIFJldHVybnMgYSBwYWdpbmF0ZWQgbGlzdCBvZiB0aGUgZm9sZGVyJ3MgY29udGVudC5cblx0ICogKi9cblx0bHMoe2ZvbGRlcixvd25lcixwYWdlfSkge30sXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZm9sZGVyXG5cdCAqIFxuXHQgKiBDcmVhdGVzIGEgbmV3IGZvbGRlci5cblx0ICogTWF5IGZhaWwgaWYgdGhlIHRhcmdldCBsb2NhdGlvbiBpcyBub3QgZW1wdHkuXG5cdCAqICovXG5cdG1rZGlyKHtmb2xkZXIsb3duZXIscGFyZW50c30pIHt9LFxuXHQvKipcblx0ICogTW92ZXMgYSBmaWxlXG5cdCAqIFxuXHQgKiBNb3ZlcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkgdG8gYSBuZXcgbG9jYXRpb24uXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRtdih7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBOb3RpZmllcyBvZiB1cGxvYWQgY29tcGxldGlvblxuXHQgKiBcblx0ICogVGhlIGNsaWVudCBhcHBsaWNhdGlvbiBjYWxscyB0aGlzIHZlcmIgdG8gbm90aWZ5IHRoYXQgaXQncyBkb25lIHVwbG9hZGluZyB0byB0aGUgY2xvdWQuXG5cdCAqIENhbGxpbmcgdGhhdCB2ZXJiIE1BWSB0cmlnZ2VyIGFkZGl0aW9uYWwgZXZlbnRzIHN1Y2ggYXMgdGh1bWJuYWlsL21ldGFkYXRhIGNyZWF0aW9uLlxuXHQgKiAqL1xuXHRuZXdGaWxlKHtndWlkLG1ldGFkYXRhLG93bmVyLHRhZ3N9KSB7fSxcblx0LyoqXG5cdCAqIFJlcXVlc3RzIGFuIHVwbG9hZCBVUkxcblx0ICogXG5cdCAqIFJlcXVlc3RzIGFuIEhUVFAgdXBsb2FkIFVSTC5cblx0ICogVGhlIFVSTCBjb250YWlucyB0ZW1wb3JhcnkgY3JlZGVudGlhbHMgKHR5cGljYWxseSB2YWxpZCBmb3IgYSBmZXcgbWludXRlcykgYW5kIGlzIG1lYW50IGZvciBpbW1lZGlhdGUgdXNlLlxuXHQgKiAqL1xuXHRuZXdVcGxvYWRVcmwoe2NvbnRlbnRUeXBlLG93bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBmaWxlXG5cdCAqIFxuXHQgKiBSZW1vdmVzIGEgZmlsZSBvciBmb2xkZXIgKHJlY3Vyc2l2ZWx5KS5cblx0ICogKi9cblx0cm0oe293bmVyLHBhdGh9KSB7fSxcblx0LyoqXG5cdCAqIFJldHVybnMgaW5mb3JtYXRpb24gYWJvdXQgYSBmaWxlXG5cdCAqIFxuXHQgKiBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgc2luZ2xlIGZpbGUuXG5cdCAqIFRoZSBlbnRyeSBmaWVsZCB3aWxsIGJlIG51bGwgaWYgdGhlIHBhdGggZG9lcyBub3QgZXhpc3Rcblx0ICogKi9cblx0c3RhdCh7b3duZXIscGF0aH0pIHt9LFxuXHQvKipVcGRhdGVzIGEgZmlsZSdzIG1ldGFkYXRhKi9cblx0dXBkYXRlTWV0YSh7bWV0YWRhdGEsbWV0YWRhdGFGaWxlcyxvd25lcixwYXRofSkge31cbn1cbi8qKlxuICogVXBsb2FkOiBwc2V1ZG8tUzNcbiAqIFxuICogVXBsb2FkIHNlcnZpY2Ugd2l0aCBwc2V1ZG8tUzNjb21wYXRpYmxlIHN0b3JhZ2VcbiAqICovXG4vKipcbiAqIFVzZXIgQVBJIGZvciBmaWxlIG1hbmFnZW1lbnRcbiAqIFxuICogVXNlciBBUEkgZm9yIHZpcnR1YWwgZmlsZSBtYW5hZ2VtZW50IGFuZCBodHRwIGZpbGUgdXBsb2FkXG4gKiBUaGlzIEFQSSBjb250YWlucyBhbGwgdGhlIHZlcmJzIG5lZWRlZCB0byBicm93c2UsIHVwbG9hZCBhbmQgcmVtb3ZlIGZpbGVzLlxuICogRmlsZXMgYXJlIHN0b3JlZCBvbiBhIHBlci11c2VyIGJhc2lzOiBlYWNoIHVzZXIgaGFzIGhpcyBvciBoZXIgb3duIHdob2xlIHZpcnR1YWwgZmlsZXN5c3RlbS5cbiAqIFVwbG9hZGluZyBhIGZpbGUgaXMgYSAzLXN0ZXAgcHJvY2VzcyA6IHJlcXVlc3QgYW4gdXBsb2FkIFVSTCwgdXBsb2FkIHZpYSBIVFRQLCBub3RpZnkgdGhpcyBzZXJ2aWNlIG9mIGNvbXBsZXRpb24uXG4gKiBAYWNjZXNzIHB1YmxpY1xuICogKi9cbmV4cG9ydCBjb25zdCBacGZzX3MzY29tcGF0UHVibGlzaGVyRGVmaW5pdGlvbiA9IHtcblx0LyoqXG5cdCAqIENvcGllcyBhIGZpbGVcblx0ICogXG5cdCAqIENvcGllcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkgdG8gYSBuZXcgbG9jYXRpb24uXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRjcCh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGRpc2sgdXNhZ2Vcblx0ICogXG5cdCAqIFJldHVybnMgYW4gcmVjdXJzaXZlbHkgYWdncmVnYXRlZCBudW1iZXIgb2YgdXNlZCBieXRlcywgc3RhcnRpbmcgYXQgdGhlIGdpdmVuIHBhdGguXG5cdCAqICovXG5cdGR1KHtvd25lcixwYXRofSkge30sXG5cdC8qKlJlcXVlc3RzIGFuIHVwbG9hZCBVUkwgd2l0aG91dCBjb25zdHJhaW50cy4qL1xuXHRmcmVlVXBsb2FkVXJsKHt9KSB7fSxcblx0LyoqXG5cdCAqIExpbmtzIGEgZmlsZVxuXHQgKiBcblx0ICogTGlua3MgYSBmaWxlIG9yIGZvbGRlciB0byBhbm90aGVyIGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bGluayh7b2xkUGF0aCxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBMaXN0cyBhIGZvbGRlciBjb250ZW50XG5cdCAqIFxuXHQgKiBSZXR1cm5zIGEgcGFnaW5hdGVkIGxpc3Qgb2YgdGhlIGZvbGRlcidzIGNvbnRlbnQuXG5cdCAqICovXG5cdGxzKHtmb2xkZXIsb3duZXIscGFnZX0pIHt9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZvbGRlclxuXHQgKiBcblx0ICogQ3JlYXRlcyBhIG5ldyBmb2xkZXIuXG5cdCAqIE1heSBmYWlsIGlmIHRoZSB0YXJnZXQgbG9jYXRpb24gaXMgbm90IGVtcHR5LlxuXHQgKiAqL1xuXHRta2Rpcih7Zm9sZGVyLG93bmVyLHBhcmVudHN9KSB7fSxcblx0LyoqXG5cdCAqIE1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogTW92ZXMgYSBmaWxlIG9yIGZvbGRlciAocmVjdXJzaXZlbHkpIHRvIGEgbmV3IGxvY2F0aW9uLlxuXHQgKiBNYXkgZmFpbCBpZiB0aGUgdGFyZ2V0IGxvY2F0aW9uIGlzIG5vdCBlbXB0eS5cblx0ICogKi9cblx0bXYoe29sZFBhdGgsb3duZXIscGF0aH0pIHt9LFxuXHQvKipcblx0ICogTm90aWZpZXMgb2YgdXBsb2FkIGNvbXBsZXRpb25cblx0ICogXG5cdCAqIFRoZSBjbGllbnQgYXBwbGljYXRpb24gY2FsbHMgdGhpcyB2ZXJiIHRvIG5vdGlmeSB0aGF0IGl0J3MgZG9uZSB1cGxvYWRpbmcgdG8gdGhlIGNsb3VkLlxuXHQgKiBDYWxsaW5nIHRoYXQgdmVyYiBNQVkgdHJpZ2dlciBhZGRpdGlvbmFsIGV2ZW50cyBzdWNoIGFzIHRodW1ibmFpbC9tZXRhZGF0YSBjcmVhdGlvbi5cblx0ICogKi9cblx0bmV3RmlsZSh7Z3VpZCxtZXRhZGF0YSxvd25lcix0YWdzfSkge30sXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhbiB1cGxvYWQgVVJMXG5cdCAqIFxuXHQgKiBSZXF1ZXN0cyBhbiBIVFRQIHVwbG9hZCBVUkwuXG5cdCAqIFRoZSBVUkwgY29udGFpbnMgdGVtcG9yYXJ5IGNyZWRlbnRpYWxzICh0eXBpY2FsbHkgdmFsaWQgZm9yIGEgZmV3IG1pbnV0ZXMpIGFuZCBpcyBtZWFudCBmb3IgaW1tZWRpYXRlIHVzZS5cblx0ICogKi9cblx0bmV3VXBsb2FkVXJsKHtjb250ZW50VHlwZSxvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGEgZmlsZVxuXHQgKiBcblx0ICogUmVtb3ZlcyBhIGZpbGUgb3IgZm9sZGVyIChyZWN1cnNpdmVseSkuXG5cdCAqICovXG5cdHJtKHtvd25lcixwYXRofSkge30sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGluZm9ybWF0aW9uIGFib3V0IGEgZmlsZVxuXHQgKiBcblx0ICogUmV0dXJucyBpbmZvcm1hdGlvbiBhYm91dCBhIHNpbmdsZSBmaWxlLlxuXHQgKiBUaGUgZW50cnkgZmllbGQgd2lsbCBiZSBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IGV4aXN0XG5cdCAqICovXG5cdHN0YXQoe293bmVyLHBhdGh9KSB7fSxcblx0LyoqVXBkYXRlcyBhIGZpbGUncyBtZXRhZGF0YSovXG5cdHVwZGF0ZU1ldGEoe21ldGFkYXRhLG1ldGFkYXRhRmlsZXMsb3duZXIscGF0aH0pIHt9XG59XG4vKipcbiAqIFVzZXIgZGlyZWN0b3J5IHNlcnZpY2VcbiAqIFxuICogVXNlciBkaXJlY3Rvcnkgc2VydmljZVxuICogKi9cbi8qKlxuICogVXNlciBBUEkgZm9yIHVzZXIgaW5mb3JtYXRpb25cbiAqIFxuICogQGFjY2VzcyBwdWJsaWNcbiAqICovXG5leHBvcnQgY29uc3QgVXNlcmRpclB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlNlYXJjaGVzIGZvciB1c2VycyBtYXRjaGluZyB0aGUgcmVxdWVzdCovXG5cdHNlYXJjaCh7cGFnZSxxdWVyeSxyZXF1ZXN0SWR9KSB7fSxcblx0LyoqUmVxdWVzdHMgcHVibGljIGRhdGEgZm9yIHRoZSBzcGVjaWZpZWQgdXNlcnMqL1xuXHR1c2VySW5mbyh7dXNlcktleXN9KSB7fVxufVxuLyoqXG4gKiBEZWxlZ2F0aW5nIGF1dGhlbnRpY2F0aW9uXG4gKiBcbiAqIFRoaXMgYXV0aGVudGljYXRpb24gZGVsZWdhdGVzIGF1dGhlbnRpY2F0aW9uIHRvIGFuIGV4dGVybmFsIGF1dGggcHJvdmlkZXJcbiAqIDxicj5XaGVuIGEgemV0YXB1c2ggY2xpZW50IGhhbmRzaGFrZXMgd2l0aCBhIGRlbGVnYXRlZCBhdXRoZW50aWNhdGlvbiwgdGhlICd0b2tlbicgZmllbGQgZ2l2ZW4gYnkgdGhlIGNsaWVudCBpcyBzZW50IHRvIHRoZSBjb25maWd1cmVkIHJlbW90ZSBzZXJ2ZXIgYXMgcGFydCBvZiB0aGUgVVJMXG4gKiA8YnI+VGhlIHJlc3BvbnNlIG11c3QgYmUgaW4gSlNPTiBmb3JtYXRcbiAqICBFYWNoIGtleSBvZiB0aGUgcmVzcG9uc2Ugd2lsbCBiZSBjb25zaWRlcmVkIGEgdXNlciBpbmZvcm1hdGlvbiBmaWVsZCBuYW1lXG4gKiBcbiAqICovXG4vKipcbiAqIEVuZC11c2VyIEFQSSBmb3IgdGhlIGRlbGVnYXRpbmcgYXV0aGVudGljYXRpb25cbiAqIFxuICogUHJvdmlzaW9ubmluZyB2ZXJicy5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IERlbGVnYXRpbmdQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogR2V0IHVzZXIgaW5mb1xuXHQgKiBcblx0ICogUmV0cmlldmVzIGNhY2hlZCB1c2VyIGluZm8gb3IgKGlmIG1pc3NpbmcpIGVhZ2VybHkgY3JlYXRlcyBhIHpldGFwdXNoIGtleSBmb3IgdGhlIHVzZXIuXG5cdCAqIFRoZSByZXR1cm5lZCBmaWVsZCAnemV0YXB1c2hLZXknIGlzIGEgdW5pcXVlIGFuZCBwZXJtYW5lbnQgSUQgaWRlbnRpZnlpbmcgYSB1c2VyIGluIGEgc2FuZGJveC5cblx0ICogKi9cblx0dXNlckluZm8oe30pIHt9XG59XG4vKipcbiAqIExvY2FsIGF1dGhlbnRpY2F0aW9uXG4gKiBcbiAqIFpldGFwdXNoIGxvY2FsIGF1dGhlbnRpY2F0aW9uXG4gKiAgVGhlIGNvbmZpZ3VyZXIgY2FuIGNob29zZSB0aGUgcHJpbWFyeSBrZXkgYW5kIG1hbmRhdG9yeSB1c2VyIGZpZWxkcyBmb3IgYWNjb3VudCBjcmVhdGlvblxuICogIFRoZSBmaWVsZCAnemV0YXB1c2hLZXknIGlzIGdlbmVyYXRlZCBieSB0aGUgc2VydmVyIGFuZCBNVVNUIG5vdCBiZSB1c2VkIDogaXQgY29udGFpbnMgdGhlIHVuaXF1ZSBrZXkgb2YgdGhlIHVzZXIgaW5zaWRlIGEgc2FuZGJveCAoaXQgY2FuIGJlIG9idGFpbmVkIGZyb20gaW5zaWRlIGEgbWFjcm8gd2l0aCB0aGUgPGI+X191c2VyS2V5PC9iPiBwc2V1ZG8tY29uc3RhbnQpXG4gKiAqL1xuLyoqXG4gKiBFbmQtdXNlciBBUEkgZm9yIHRoZSBzaW1wbGUgbG9jYWwgYXV0aGVudGljYXRpb25cbiAqIFxuICogVGhlc2UgQVBJIHZlcmJzIGFsbG93IGVuZC11c2VycyB0byBtYW5hZ2UgdGhlaXIgYWNjb3VudC5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IFNpbXBsZVB1Ymxpc2hlckRlZmluaXRpb24gPSB7XG5cdC8qKlxuXHQgKiBDaGFuZ2VzIGEgcGFzc3dvcmRcblx0ICogXG5cdCAqIENoYW5nZXMgYSB1c2VyIHBhc3N3b3JkIGZvciB0aGlzIGF1dGhlbnRpY2F0aW9uIHJlYWxtLlxuXHQgKiBUaGUgdXNlciBjYW4gYmUgZWl0aGVyIGltcGxpY2l0ICh0aGUgY3VycmVudCB1c2VyKSBvciBkZWR1Y2VkIGZyb20gdGhlIHRva2VuLlxuXHQgKiBUaGUgY2hhbmdlIGlzIGVmZmVjdGl2ZSBpbW1lZGlhdGVseS4gSG93ZXZlciwgYWxyZWFkeSBsb2dnZWQgaW4gdXNlcnMgbWlnaHQgc3RheSBjb25uZWN0ZWQuXG5cdCAqICovXG5cdGNoYW5nZVBhc3N3b3JkKHt9KSB7fSxcblx0LyoqXG5cdCAqIENoZWNrcyBzb21lIGFjY291bnQncyBleGlzdGVuY2Vcblx0ICogXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiB1c2VyIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgJ3NpbXBsZScgYXV0aGVudGljYXRpb24gcmVhbG0uXG5cdCAqICovXG5cdGNoZWNrVXNlcih7fSkge30sXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgdXNlclxuXHQgKiBcblx0ICogQ3JlYXRlcyBhIG5ldyB1c2VyIGluIHRoaXMgJ3NpbXBsZScgYXV0aGVudGljYXRpb24gcmVhbG0uXG5cdCAqICovXG5cdGNyZWF0ZVVzZXIoe30pIHt9LFxuXHQvKipcblx0ICogRGVsZXRlcyBhIHVzZXJcblx0ICogXG5cdCAqIERlbGV0ZXMgYW4gZXhpc3RpbmcgdXNlciBpbiB0aGlzICdzaW1wbGUnIGF1dGhlbnRpY2F0aW9uIHJlYWxtLlxuXHQgKiAqL1xuXHRkZWxldGVVc2VyKHt9KSB7fSxcblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgcGFzc3dvcmQgcmVzZXRcblx0ICogXG5cdCAqIFJlcXVlc3RzIGEgcGFzc3dvcmQgcmVzZXQgZm9yIHRoZSBnaXZlbiB1c2VyS2V5LlxuXHQgKiBUaGUgdXNlcktleSBtdXN0IGV4aXN0IGFuZCBtdXN0IGJlIGdpdmVuLCBhcyBpdCBjYW5ub3Qgb2J2aW91c2x5IGJlIGRlZHVjZWQgZnJvbSB0aGUgY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyLlxuXHQgKiBUaGUgcmV0dXJuZWQgdG9rZW4gbmVlZHMgdG8gYmUgc2VudCB0byB0aGUgaW50ZW5kZWQgcmVjaXBpZW50IG9ubHkuIFRoZSB0eXBpY2FsIHVzZSBjYXNlIGlzIHRvIGRlZmluZSBhIG1hY3JvIHRoYXQgcmVxdWVzdHMgYSByZXNldCwgZ2VuZXJhdGVzIGEgZW1haWwgdGVtcGxhdGUgYW5kIGVtYWlscyB0aGUgdXNlci4gVGhlIG1hY3JvIGNhbiB0aGVuIGJlIHNhZmVseSBjYWxsZWQgYnkgYSB3ZWFrbHkgYXV0aGVudGljYXRlZCB1c2VyLlxuXHQgKiBSZXF1ZXN0aW5nIGEgcmVzZXQgZG9lcyBub3QgaW52YWxpZGF0ZSB0aGUgcGFzc3dvcmQuXG5cdCAqIFJlcXVlc3RpbmcgYSByZXNldCBhZ2FpbiBpbnZhbGlkYXRlcyBwcmV2aW91cyByZXNldCByZXF1ZXN0cyAob25seSB0aGUgbGFzdCB0b2tlbiBpcyB1c2FibGUpXG5cdCAqICovXG5cdHJlcXVlc3RSZXNldCh7fSkge30sXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGEgdXNlclxuXHQgKiBcblx0ICogVXBkYXRlcyBhbiBleGlzdGluZyB1c2VyIGluIHRoaXMgJ3NpbXBsZScgYXV0aGVudGljYXRpb24gcmVhbG0uXG5cdCAqICovXG5cdHVwZGF0ZVVzZXIoe30pIHt9XG59XG4vKipcbiAqIFdlYWsgYXV0aGVudGljYXRpb25cbiAqIFxuICogVGhlIHdlYWsgYXV0aGVudGljYXRpb24gYWxsb3dzIGZvciBhbm9ueW1vdXMgYXV0aGVudGljYXRpb24gb2YgZGV2aWNlc1xuICogIFN1Y2ggZGV2aWNlcyBjYW4gZGlzcGxheSBhIHFyY29kZSB0byBhbGxvdyByZWd1bGFyIHVzZXJzIHRvIHRha2UgY29udHJvbCBvZiB0aGVtXG4gKiAqL1xuLyoqXG4gKiBVc2VyIEFQSSBmb3Igd2VhayBkZXZpY2VzIGNvbnRyb2xcbiAqIFxuICogVXNlciBBUEkgZm9yIGNvbnRyb2wgYW5kIHJlbGVhc2Ugb2Ygd2Vha2x5IGF1dGhlbnRpY2F0ZWQgdXNlciBzZXNzaW9ucy5cbiAqIEBhY2Nlc3MgcHVibGljXG4gKiAqL1xuZXhwb3J0IGNvbnN0IFdlYWtQdWJsaXNoZXJEZWZpbml0aW9uID0ge1xuXHQvKipcblx0ICogQ29udHJvbHMgYSBzZXNzaW9uXG5cdCAqIFxuXHQgKiBUYWtlcyBjb250cm9sIG9mIGEgd2VhayB1c2VyIHNlc3Npb24sIGlkZW50aWZpZWQgYnkgdGhlIGdpdmVuIHB1YmxpYyB0b2tlbi5cblx0ICogVGhlIHB1YmxpYyB0b2tlbiBoYXMgYmVlbiBwcmV2aW91c2x5IG1hZGUgYXZhaWxhYmxlIGJ5IHRoZSBjb250cm9sbGVkIGRldmljZSwgZm9yIGV4YW1wbGUgYnkgZGlzcGxheWluZyBhIFFSQ29kZS5cblx0ICogVXBvbiBjb250cm9sIG5vdGlmaWNhdGlvbiwgdGhlIGNsaWVudCBTREsgb2YgdGhlIGNvbnRyb2xsZWQgc2Vzc2lvbiBpcyBleHBlY3RlZCB0byByZS1oYW5kc2hha2UuXG5cdCAqICovXG5cdGNvbnRyb2woe2Z1bGxSaWdodHMscHVibGljVG9rZW59KSB7fSxcblx0LyoqXG5cdCAqIFJlbGVhc2VzIGEgc2Vzc2lvblxuXHQgKiBcblx0ICogUmVsZWFzZXMgY29udHJvbCBvZiBhIHdlYWsgdXNlciBzZXNzaW9uLCBpZGVudGlmaWVkIGJ5IHRoZSBnaXZlbiBwdWJsaWMgdG9rZW4uXG5cdCAqIFRoZSB3ZWFrIHVzZXIgc2Vzc2lvbiBtdXN0IGhhdmUgYmVlbiBwcmV2aW91c2x5IGNvbnRyb2xsZWQgYnkgYSBjYWxsIHRvICdjb250cm9sJy5cblx0ICogKi9cblx0cmVsZWFzZSh7ZnVsbFJpZ2h0cyxwdWJsaWNUb2tlbn0pIHt9XG59XG4iLCIvKipcbiAqIFpldGFQdXNoIGRlcGxveWFibGVzIG5hbWVzXG4gKi9cbmNvbnN0IERlcGxveWFibGVOYW1lcyA9IHtcbiAgQVVUSF9TSU1QTEU6ICdzaW1wbGUnLFxuICBBVVRIX1dFQUs6ICd3ZWFrJyxcbiAgQVVUSF9ERUxFR0FUSU5HOiAnZGVsZWdhdGluZydcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByb3RlY3RlZFxuICovXG5leHBvcnQgY2xhc3MgQWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyIHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBidXNpbmVzc0lkLCBkZXBsb3ltZW50SWQgfSkge1xuICAgIHRoaXMuYXV0aFR5cGUgPSBhdXRoVHlwZVxuICAgIHRoaXMuYnVzaW5lc3NJZCA9IGJ1c2luZXNzSWRcbiAgICB0aGlzLmRlcGxveW1lbnRJZCA9IGRlcGxveW1lbnRJZFxuICB9XG4gIC8qKlxuICAgKiBAcGFyYW0ge0NsaWVudEhlbHBlcn0gY2xpZW50XG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG4gIGdldEhhbmRzaGFrZUZpZWxkcyhjbGllbnQpIHtcbiAgICBjb25zdCBhdXRoZW50aWNhdGlvbiA9IHtcbiAgICAgIGRhdGE6IHRoaXMuYXV0aERhdGEsXG4gICAgICB0eXBlOiBgJHtjbGllbnQuZ2V0QnVzaW5lc3NJZCgpfS4ke3RoaXMuZGVwbG95bWVudElkfS4ke3RoaXMuYXV0aFR5cGV9YCxcbiAgICAgIHZlcnNpb246IHRoaXMuYXV0aFZlcnNpb25cbiAgICB9XG4gICAgaWYgKGNsaWVudC5nZXRSZXNvdXJjZSgpKSB7XG4gICAgICBhdXRoZW50aWNhdGlvbi5yZXNvdXJjZSA9IGNsaWVudC5nZXRSZXNvdXJjZSgpXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBleHQ6IHtcbiAgICAgICAgYXV0aGVudGljYXRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEdldCBhdXRoIHZlcnNpb25cbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhWZXJzaW9uKCkge1xuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuXG59XG5cbi8qKlxuICogQGFjY2VzcyBwdWJsaWNcbiAqIEBleHRlbmRzIHtBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBUb2tlbkhhbmRzaGFrZU1hbmFnZXIgZXh0ZW5kcyBBYnN0cmFjdEhhbmRzaGFrZU1hbmFnZXIge1xuICAvKipcbiAgICpcbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgdG9rZW4gfSkge1xuICAgIHN1cGVyKHsgZGVwbG95bWVudElkLCBhdXRoVHlwZSB9KVxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHt0b2tlbjogc3RyaW5nfVxuICAgKi9cbiAgZ2V0IGF1dGhEYXRhKCkge1xuICAgIGNvbnN0IHsgdG9rZW4gfSA9IHRoaXNcbiAgICByZXR1cm4ge1xuICAgICAgdG9rZW5cbiAgICB9XG4gIH1cblxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHVibGljXG4gKiBAZXh0ZW5kcyB7QWJzdHJhY3RIYW5kc2hha2VNYW5hZ2VyfVxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdFpldGFwdXNoSGFuZHNoYWtlTWFuYWdlciBleHRlbmRzIEFic3RyYWN0SGFuZHNoYWtlTWFuYWdlciB7XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIGxvZ2luLCBwYXNzd29yZCB9KSB7XG4gICAgc3VwZXIoeyBhdXRoVHlwZSwgZGVwbG95bWVudElkIH0pXG4gICAgdGhpcy5sb2dpbiA9IGxvZ2luXG4gICAgdGhpcy5wYXNzd29yZCA9IHBhc3N3b3JkXG4gIH1cbiAgLyoqXG4gICAqIEdldCBhdXRoIGRhdGFcbiAgICogQHJldHVybiB7bG9naW46IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZ31cbiAgICovXG4gIGdldCBhdXRoRGF0YSgpIHtcbiAgICBjb25zdCB7IGxvZ2luLCBwYXNzd29yZCB9ID0gdGhpc1xuICAgIHJldHVybiB7XG4gICAgICBsb2dpbiwgcGFzc3dvcmRcbiAgICB9XG4gIH1cblxufVxuXG4vKipcbiAqIEZhY3RvcnkgdG8gY3JlYXRlIGhhbmRzaGFrZVxuICogQGFjY2VzcyBwdWJsaWNcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRGYWN0b3J5IHtcbiAgLyoqXG4gICAqIEByZXR1cm4ge0RlZmF1bHRaZXRhcHVzaEhhbmRzaGFrZU1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlU2ltcGxlSGFuZHNoYWtlKHsgZGVwbG95bWVudElkLCBsb2dpbiwgcGFzc3dvcmQgfSkge1xuICAgIHJldHVybiBBdXRoZW50RmFjdG9yeS5jcmVhdGVIYW5kc2hha2Uoe1xuICAgICAgYXV0aFR5cGU6IERlcGxveWFibGVOYW1lcy5BVVRIX1NJTVBMRSxcbiAgICAgIGRlcGxveW1lbnRJZCxcbiAgICAgIGxvZ2luLFxuICAgICAgcGFzc3dvcmRcbiAgICB9KVxuICB9XG4gIC8qKlxuICAgKiBAcmV0dXJuIHtUb2tlbkhhbmRzaGFrZU1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlV2Vha0hhbmRzaGFrZSh7IGRlcGxveW1lbnRJZCwgdG9rZW4gfSkge1xuICAgIHJldHVybiBBdXRoZW50RmFjdG9yeS5jcmVhdGVIYW5kc2hha2Uoe1xuICAgICAgYXV0aFR5cGU6IERlcGxveWFibGVOYW1lcy5BVVRIX1dFQUssXG4gICAgICBkZXBsb3ltZW50SWQsXG4gICAgICBsb2dpbjogdG9rZW4sXG4gICAgICBwYXNzd29yZDogbnVsbFxuICAgIH0pXG4gIH1cbiAgLyoqXG4gICAqIEByZXR1cm4ge1Rva2VuSGFuZHNoYWtlTWFuYWdlcn1cbiAgICovXG4gIHN0YXRpYyBjcmVhdGVEZWxlZ2F0aW5nSGFuZHNoYWtlKHsgZGVwbG95bWVudElkLCB0b2tlbiB9KSB7XG4gICAgcmV0dXJuIEF1dGhlbnRGYWN0b3J5LmNyZWF0ZUhhbmRzaGFrZSh7XG4gICAgICBhdXRoVHlwZTogRGVwbG95YWJsZU5hbWVzLkFVVEhfREVMRUdBVElORyxcbiAgICAgIGRlcGxveW1lbnRJZCxcbiAgICAgIGxvZ2luOiB0b2tlbixcbiAgICAgIHBhc3N3b3JkOiBudWxsXG4gICAgfSlcbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7VG9rZW5IYW5kc2hha2VNYW5hZ2VyfERlZmF1bHRaZXRhcHVzaEhhbmRzaGFrZU1hbmFnZXJ9XG4gICAqL1xuICBzdGF0aWMgY3JlYXRlSGFuZHNoYWtlKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgbG9naW4sIHBhc3N3b3JkIH0pIHtcbiAgICBpZiAobnVsbCA9PT0gcGFzc3dvcmQpIHtcbiAgICAgIHJldHVybiBuZXcgVG9rZW5IYW5kc2hha2VNYW5hZ2VyKHsgYXV0aFR5cGUsIGRlcGxveW1lbnRJZCwgdG9rZW46IGxvZ2luIH0pXG4gICAgfVxuICAgIHJldHVybiBuZXcgRGVmYXVsdFpldGFwdXNoSGFuZHNoYWtlTWFuYWdlcih7IGF1dGhUeXBlLCBkZXBsb3ltZW50SWQsIGxvZ2luLCBwYXNzd29yZCAgfSlcbiAgfVxuXG59XG4iLCJpbXBvcnQgKiBhcyBkZWZpbml0aW9ucyBmcm9tICcuL2RlZmluaXRpb25zJ1xuXG5leHBvcnQgeyBBdXRoZW50RmFjdG9yeSB9IGZyb20gJy4vaGFuZHNoYWtlJ1xuZXhwb3J0IHsgQVBJX1VSTCwgQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQnXG5leHBvcnQgeyBTbWFydENsaWVudCB9IGZyb20gJy4vc21hcnQtY2xpZW50J1xuZXhwb3J0IHsgQWJzdHJhY3RUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3ksIExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSB9IGZyb20gJy4vdG9rZW4tcGVyc2lzdGVuY2UnXG5leHBvcnQgeyBkZWZpbml0aW9ucyB9XG4iLCJpbXBvcnQgeyBDbGllbnQgfSBmcm9tICcuL2NsaWVudCdcbmltcG9ydCB7IEF1dGhlbnRGYWN0b3J5IH0gZnJvbSAnLi9oYW5kc2hha2UnXG5pbXBvcnQgeyBMb2NhbFN0b3JhZ2VUb2tlblBlcnNpc3RlbmNlU3RyYXRlZ3kgfSBmcm9tICcuL3Rva2VuLXBlcnNpc3RlbmNlJ1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJvdGVjdGVkXG4gKiBAZXh0ZW5kcyB7Q2xpZW50fVxuICovXG5leHBvcnQgY2xhc3MgU21hcnRDbGllbnQgZXh0ZW5kcyBDbGllbnQge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IFpldGFQdXNoIHNtYXJ0IGNsaWVudFxuICAgKi9cbiAgY29uc3RydWN0b3Ioe1xuICAgIGFwaVVybCwgYXV0aGVudGljYXRpb25EZXBsb3ltZW50SWQsIGJ1c2luZXNzSWQsIGVuYWJsZUh0dHBzLCByZXNvdXJjZSA9IG51bGwsXG4gICAgVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5ID0gTG9jYWxTdG9yYWdlVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5XG4gIH0pIHtcbiAgICBjb25zdCBoYW5kc2hha2VTdHJhdGVneSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRva2VuID0gdGhpcy5nZXRUb2tlbigpXG4gICAgICBjb25zdCBoYW5kc2hha2UgPSBBdXRoZW50RmFjdG9yeS5jcmVhdGVXZWFrSGFuZHNoYWtlKHtcbiAgICAgICAgZGVwbG95bWVudElkOiBhdXRoZW50aWNhdGlvbkRlcGxveW1lbnRJZCxcbiAgICAgICAgdG9rZW5cbiAgICAgIH0pXG4gICAgICByZXR1cm4gaGFuZHNoYWtlXG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICovXG4gICAgc3VwZXIoeyBhcGlVcmwgLCBidXNpbmVzc0lkLCBlbmFibGVIdHRwcywgaGFuZHNoYWtlU3RyYXRlZ3ksIHJlc291cmNlIH0pXG4gICAgY29uc3Qgb25TdWNjZXNzZnVsSGFuZHNoYWtlID0gKHsgcHVibGljVG9rZW4sIHVzZXJJZCwgdG9rZW4gfSkgPT4ge1xuICAgICAgY29uc29sZS5kZWJ1ZygnU21hcnRDbGllbnQ6Om9uU3VjY2Vzc2Z1bEhhbmRzaGFrZScsIHsgcHVibGljVG9rZW4sIHVzZXJJZCwgdG9rZW4gfSlcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIHRoaXMuc3RyYXRlZ3kuc2V0KHsgdG9rZW4gfSlcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgb25GYWlsZWRIYW5kc2hha2UgPSAoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ1NtYXJ0Q2xpZW50OjpvbkZhaWxlZEhhbmRzaGFrZScsIGVycm9yKVxuICAgIH1cbiAgICB0aGlzLmFkZENvbm5lY3Rpb25TdGF0dXNMaXN0ZW5lcih7IG9uRmFpbGVkSGFuZHNoYWtlLCBvblN1Y2Nlc3NmdWxIYW5kc2hha2UgfSlcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5fVxuICAgICAqL1xuICAgIHRoaXMuc3RyYXRlZ3kgPSBuZXcgVG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5KClcbiAgfVxuICAvKipcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RvcmVkIHRva2VuXG4gICAqL1xuICBnZXRUb2tlbigpIHtcbiAgICByZXR1cm4gdGhpcy5zdHJhdGVneS5nZXQoKVxuICB9XG59XG4iLCIvKipcbiAqIEB0eXBlIHtzdHJpbmd9XG4gKi9cbmNvbnN0IFpFVEFQVVNIX1RPS0VOX0tFWSA9ICd6ZXRhcHVzaC50b2tlbidcblxuLyoqXG4gKiBQcm92aWRlIGFic3RyYWN0aW9uIGZvciB0b2tlbiBwZXJzaXN0ZW5jZVxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqL1xuZXhwb3J0IGNsYXNzIEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IGtleSA9IFpFVEFQVVNIX1RPS0VOX0tFWSB9ID0ge30pIHtcbiAgICAvKipcbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMua2V5ID0ga2V5XG4gIH1cbiAgLyoqXG4gICAqIEBhYnN0cmFjdFxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdG9yZWQgdG9rZW5cbiAgICovXG4gIGdldCgpIHt9XG4gIC8qKlxuICAgKiBAYWJzdHJhY3RcbiAgICovXG4gIHNldCh7IHRva2VuIH0pIHt9XG59XG5cbi8qKlxuICogQGFjY2VzcyBwcm90ZWN0ZWRcbiAqIEBleHRlbmRzIHtBYnN0cmFjdFRva2VuUGVyc2lzdGVuY2VTdHJhdGVneX1cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsU3RvcmFnZVRva2VuUGVyc2lzdGVuY2VTdHJhdGVneSBleHRlbmRzIEFic3RyYWN0VG9rZW5QZXJzaXN0ZW5jZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdG9yZWQgdG9rZW5cbiAgICovXG4gIGdldCgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5rZXkpXG4gIH1cbiAgLyoqXG4gICAqIEBvdmVycmlkZVxuICAgKi9cbiAgc2V0KHsgdG9rZW4gfSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMua2V5LCB0b2tlbilcbiAgfVxufVxuIiwiLyoqXG4gKiBNYXRjaCB1bnNlY3VyZSBwYXR0ZXJuIHdlYlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xuY29uc3QgVU5TRUNVUkVfUEFUVEVSTiA9IC9eaHR0cDpcXC9cXC98XlxcL1xcLy9cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gbGlzdFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5leHBvcnQgY29uc3Qgc2h1ZmZsZSA9IChsaXN0KSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGlzdC5sZW5ndGgpXG4gIHJldHVybiBsaXN0W2luZGV4XVxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVIdHRwc1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgZ2V0U2VjdXJlVXJsID0gKHVybCwgZW5hYmxlSHR0cHMpID0+IHtcbiAgcmV0dXJuIGVuYWJsZUh0dHBzID8gdXJsLnJlcGxhY2UoVU5TRUNVUkVfUEFUVEVSTiwgJ2h0dHBzOi8vJykgOiB1cmxcbn1cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEByZXR1cm4ge1Byb21pc2V9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZXJ2ZXJzID0gKHsgYXBpVXJsLCBidXNpbmVzc0lkLCBlbmFibGVIdHRwcyB9KSA9PiB7XG4gIGNvbnN0IHNlY3VyZUFwaVVybCA9IGdldFNlY3VyZVVybChhcGlVcmwsIGVuYWJsZUh0dHBzKVxuICBjb25zdCB1cmwgPSBgJHtzZWN1cmVBcGlVcmx9JHtidXNpbmVzc0lkfWBcbiAgcmV0dXJuIGZldGNoKHVybClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKClcbiAgICB9KVxuICAgIC50aGVuKCh7IHNlcnZlcnMgfSkgPT4ge1xuICAgICAgLy8gVE9ETzogUmVwbGFjZSBieSBhIHNlcnZlciBzaWRlIGltcGxlbWVudGF0aW9uIHdoZW4gYXZhaWxhYmxlXG4gICAgICByZXR1cm4gc2VydmVycy5tYXAoKHNlcnZlcikgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0U2VjdXJlVXJsKHNlcnZlciwgZW5hYmxlSHR0cHMpXG4gICAgICB9KVxuICAgIH0pXG59XG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKiBAZXh0ZW5kcyB7RXJyb3J9XG4gKi9cbmV4cG9ydCBjbGFzcyBOb3RZZXRJbXBsZW1lbnRlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UgPSAnJykge1xuICAgIHN1cGVyKG1lc3NhZ2UpXG4gICAgdGhpcy5uYW1lID0gJ05vdEltcGxlbWVudGVkRXJyb3InXG4gIH1cblxufVxuIl19
