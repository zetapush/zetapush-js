'use strict';

exports.__esModule = true;
exports.Userdir = exports.Zpfs_s3compat = exports.Zpfs_hdfs = exports.Zpfs_s3 = exports.Trigger = exports.Template = exports.Search = exports.Cron = exports.Sms_ovh = exports.Rdbms = exports.Notif = exports.Queue = exports.Messaging = exports.Sendmail = exports.Macro = exports.MacroDebug = exports.Httpclient = exports.GroupManagement = exports.Remoting = exports.Gda = exports.GameEngine = exports.Game = exports.Echo = exports.Stack = exports.Aggreg = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = require('./core');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var Aggreg = exports.Aggreg = function (_Service) {
	_inherits(Aggreg, _Service);

	function Aggreg() {
		_classCallCheck(this, Aggreg);

		return _possibleConstructorReturn(this, _Service.apply(this, arguments));
	}

	/**
  * Pushes some data
  *
  * Pushes the given data.
  * All the items are processed according to the defined rules.
  * At least one push for a given item is needed during a time period to trigger processing and calling of the corresponding callback verb/macro.
  * */
	Aggreg.prototype.push = function push(_ref) {
		var items = _ref.items,
		    owner = _ref.owner;
		return this.$publish('push', { items: items, owner: owner });
	};

	_createClass(Aggreg, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Aggreg service
   * @return {string}
   */
		get: function get() {
			return 'aggreg_0';
		}
	}]);

	return Aggreg;
}(_core.Service);
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
 * Stack names are arbitrary and do not need to be explicitly initialized.
 * @access public
 * */


var Stack = exports.Stack = function (_Service2) {
	_inherits(Stack, _Service2);

	function Stack() {
		_classCallCheck(this, Stack);

		return _possibleConstructorReturn(this, _Service2.apply(this, arguments));
	}

	/**
  * Lists the listeners
  *
  * Returns the whole list of listeners for the given stack.
  * */
	Stack.prototype.getListeners = function getListeners(_ref2) {
		var stack = _ref2.stack,
		    owner = _ref2.owner;
		return this.$publish('getListeners', { stack: stack, owner: owner });
	};
	/**
  * Lists content
  *
  * Returns a paginated list of contents for the given stack.
  * Content is sorted according to the statically configured order.
  * */


	Stack.prototype.list = function list(_ref3) {
		var stack = _ref3.stack,
		    owner = _ref3.owner,
		    page = _ref3.page;
		return this.$publish('list', { stack: stack, owner: owner, page: page });
	};
	/**
  * Empties a stack
  *
  * Removes all items from the given stack.
  * */


	Stack.prototype.purge = function purge(_ref4) {
		var stack = _ref4.stack,
		    owner = _ref4.owner;
		return this.$publish('purge', { stack: stack, owner: owner });
	};
	/**
  * Pushes an item
  *
  * Pushes an item onto the given stack.
  * The stack does not need to be created.
  * */


	Stack.prototype.push = function push(_ref5) {
		var stack = _ref5.stack,
		    data = _ref5.data,
		    owner = _ref5.owner;
		return this.$publish('push', { stack: stack, data: data, owner: owner });
	};
	/**
  * Removes items
  *
  * Removes the item with the given guid from the given stack.
  * */


	Stack.prototype.remove = function remove(_ref6) {
		var guids = _ref6.guids,
		    stack = _ref6.stack,
		    owner = _ref6.owner;
		return this.$publish('remove', { guids: guids, stack: stack, owner: owner });
	};
	/**
  * Sets the listeners
  *
  * Sets the listeners for the given stack.
  * */


	Stack.prototype.setListeners = function setListeners(_ref7) {
		var listeners = _ref7.listeners,
		    stack = _ref7.stack,
		    owner = _ref7.owner;
		return this.$publish('setListeners', { listeners: listeners, stack: stack, owner: owner });
	};
	/**
  * Updates an item
  *
  * Updates an existing item of the given stack.
  * The item MUST exist prior to the call.
  * */


	Stack.prototype.update = function update(_ref8) {
		var guid = _ref8.guid,
		    stack = _ref8.stack,
		    data = _ref8.data,
		    owner = _ref8.owner;
		return this.$publish('update', { guid: guid, stack: stack, data: data, owner: owner });
	};

	_createClass(Stack, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Stack service
   * @return {string}
   */
		get: function get() {
			return 'stack_0';
		}
	}]);

	return Stack;
}(_core.Service);
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


var Echo = exports.Echo = function (_Service3) {
	_inherits(Echo, _Service3);

	function Echo() {
		_classCallCheck(this, Echo);

		return _possibleConstructorReturn(this, _Service3.apply(this, arguments));
	}

	/**
  * Echoes an object
  *
  * Echoes an object: the server will echo that object on channel 'echo' for the current user.
  * */
	Echo.prototype.echo = function echo(parameter) {
		return this.$publish('echo', parameter);
	};

	_createClass(Echo, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Echo service
   * @return {string}
   */
		get: function get() {
			return 'echo_0';
		}
	}]);

	return Echo;
}(_core.Service);
/**
 * Game engine
 *
 * Abstract Game Engine
 *  Concrete game engines are remote cometd clients or internal macros
 * */
/**
 * User API for games
 *
 * Users can list, start, join games, and play.
 * @access public
 * */


var Game = exports.Game = function (_Service4) {
	_inherits(Game, _Service4);

	function Game() {
		_classCallCheck(this, Game);

		return _possibleConstructorReturn(this, _Service4.apply(this, arguments));
	}

	/**
  * Lists game types
  *
  * Returns the list of game types supported by the server and the currently registered game engines.
  * */
	Game.prototype.available = function available() {
		return this.$publish('available', {});
	};
	/**A user joins a game*/


	Game.prototype.join = function join(_ref9) {
		var role = _ref9.role,
		    gameId = _ref9.gameId,
		    userId = _ref9.userId,
		    userName = _ref9.userName;
		return this.$publish('join', { role: role, gameId: gameId, userId: userId, userName: userName });
	};
	/**Organizes a game*/


	Game.prototype.organize = function organize(_ref10) {
		var type = _ref10.type,
		    owner = _ref10.owner,
		    options = _ref10.options;
		return this.$publish('organize', { type: type, owner: owner, options: options });
	};
	/**Gives some command to the game engine*/


	Game.prototype.play = function play(_ref11) {
		var gameId = _ref11.gameId,
		    userId = _ref11.userId,
		    data = _ref11.data;
		return this.$publish('play', { gameId: gameId, userId: userId, data: data });
	};
	/**Starts a game*/


	Game.prototype.start = function start(_ref12) {
		var gameId = _ref12.gameId;
		return this.$publish('start', { gameId: gameId });
	};
	/**A user cancels joining a game*/


	Game.prototype.unjoin = function unjoin(_ref13) {
		var role = _ref13.role,
		    gameId = _ref13.gameId,
		    userId = _ref13.userId,
		    userName = _ref13.userName;
		return this.$publish('unjoin', { role: role, gameId: gameId, userId: userId, userName: userName });
	};

	_createClass(Game, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Game service
   * @return {string}
   */
		get: function get() {
			return 'game_0';
		}
	}]);

	return Game;
}(_core.Service);
/**
 * Game Engine API
 *
 * The Game Engine API is for game engine clients, not end-users.
 * @access public
 * */


var GameEngine = exports.GameEngine = function (_Service5) {
	_inherits(GameEngine, _Service5);

	function GameEngine() {
		_classCallCheck(this, GameEngine);

		return _possibleConstructorReturn(this, _Service5.apply(this, arguments));
	}

	/**
  * Notify the result for a join request
  *
  * A Game Engine notifies the STR of the result of a join request that it received on join_callback
  * */
	GameEngine.prototype.join_result = function join_result(_ref14) {
		var msgId = _ref14.msgId,
		    payload = _ref14.payload,
		    error = _ref14.error,
		    callerId = _ref14.callerId;
		return this.$publish('join_result', { msgId: msgId, payload: payload, error: error, callerId: callerId });
	};
	/**
  * Notify the result for an organization request
  *
  * A Game Engine notifies the STR of the result of an organization request that it received on organize_callback
  * */


	GameEngine.prototype.organize_result = function organize_result(_ref15) {
		var msgId = _ref15.msgId,
		    payload = _ref15.payload,
		    error = _ref15.error,
		    callerId = _ref15.callerId;
		return this.$publish('organize_result', { msgId: msgId, payload: payload, error: error, callerId: callerId });
	};
	/**
  * Registers a game engine
  *
  * A client registers itself to the STR as a Game Engine.
  * The STR may, from now on, dispatch game of the given game type to said client.
  * Unregistration is done automatically on logoff.
  * */


	GameEngine.prototype.register = function register(_ref16) {
		var maxGames = _ref16.maxGames,
		    gameInfo = _ref16.gameInfo,
		    location = _ref16.location;
		return this.$publish('register', { maxGames: maxGames, gameInfo: gameInfo, location: location });
	};
	/**
  * Notify the result for a start request
  *
  * A Game Engine notifies the STR of the result of a start request that it received on start_callback
  * */


	GameEngine.prototype.start_result = function start_result(_ref17) {
		var gameId = _ref17.gameId;
		return this.$publish('start_result', { gameId: gameId });
	};
	/**
  * Notify a game event
  *
  * A Game Engine notifies the STR of some arbitrary game event.
  * */


	GameEngine.prototype.state = function state(_ref18) {
		var status = _ref18.status,
		    gameId = _ref18.gameId,
		    data = _ref18.data;
		return this.$publish('state', { status: status, gameId: gameId, data: data });
	};
	/**
  * Notify the result for an unjoin request
  *
  * A Game Engine notifies the STR of the result of an unjoin request that it received on unjoin_callback
  * */


	GameEngine.prototype.unjoin_result = function unjoin_result(_ref19) {
		var msgId = _ref19.msgId,
		    payload = _ref19.payload,
		    error = _ref19.error,
		    callerId = _ref19.callerId;
		return this.$publish('unjoin_result', { msgId: msgId, payload: payload, error: error, callerId: callerId });
	};

	_createClass(GameEngine, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to GameEngine service
   * @return {string}
   */
		get: function get() {
			return 'game_0';
		}
	}]);

	return GameEngine;
}(_core.Service);
/**
 * Generic Data Access
 *
 * Generic Data Access Service : NoSQL storage
 * */
/**
 * GDA User API
 *
 * User API for Generic Data Access.
 * The data are stored on a per-user basis.
 * Users can put, get, list their data.
 * @access public
 * */


var Gda = exports.Gda = function (_Service6) {
	_inherits(Gda, _Service6);

	function Gda() {
		_classCallCheck(this, Gda);

		return _possibleConstructorReturn(this, _Service6.apply(this, arguments));
	}

	/**
  * Asks for a data row
  *
  * Returns a full data row.
  * */
	Gda.prototype.get = function get(_ref20) {
		var table = _ref20.table,
		    key = _ref20.key,
		    owner = _ref20.owner;
		return this.$publish('get', { table: table, key: key, owner: owner });
	};
	/**
  * Asks for a data cell
  *
  * Returns a precise list of cells from a column in a data row.
  * */


	Gda.prototype.getCells = function getCells(_ref21) {
		var table = _ref21.table,
		    key = _ref21.key,
		    key2 = _ref21.key2,
		    owner = _ref21.owner,
		    column = _ref21.column;
		return this.$publish('getCells', { table: table, key: key, key2: key2, owner: owner, column: column });
	};
	/**
  * Increments an integer value
  *
  * Increments a cell 64-bit signed integer value and returns the result in the data field.
  * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
  * */


	Gda.prototype.inc = function inc(_ref22) {
		var table = _ref22.table,
		    data = _ref22.data,
		    key = _ref22.key,
		    key2 = _ref22.key2,
		    owner = _ref22.owner,
		    column = _ref22.column;
		return this.$publish('inc', { table: table, data: data, key: key, key2: key2, owner: owner, column: column });
	};
	/**
  * Asks for a list of rows
  *
  * Returns a paginated list of rows from the given table.
  * */


	Gda.prototype.list = function list(_ref23) {
		var columns = _ref23.columns,
		    table = _ref23.table,
		    owner = _ref23.owner,
		    page = _ref23.page;
		return this.$publish('list', { columns: columns, table: table, owner: owner, page: page });
	};
	/**
  * Puts some data into a cell
  *
  * Creates or replaces the contents of a particular cell.
  * */


	Gda.prototype.put = function put(_ref24) {
		var table = _ref24.table,
		    data = _ref24.data,
		    key = _ref24.key,
		    key2 = _ref24.key2,
		    owner = _ref24.owner,
		    column = _ref24.column;
		return this.$publish('put', { table: table, data: data, key: key, key2: key2, owner: owner, column: column });
	};
	/**
  * Puts several rows
  *
  * Creates or replaces the (maybe partial) contents of a collection of rows.
  * This method only creates or replaces cells for non-null input values.
  * */


	Gda.prototype.puts = function puts(_ref25) {
		var rows = _ref25.rows,
		    table = _ref25.table,
		    owner = _ref25.owner;
		return this.$publish('puts', { rows: rows, table: table, owner: owner });
	};
	/**
  * Asks for a range of rows
  *
  * Returns a paginated range of rows from the given table.
  * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
  * You can specify partial keys for the start and stop fields.
  * */


	Gda.prototype.range = function range(_ref26) {
		var columns = _ref26.columns,
		    start = _ref26.start,
		    table = _ref26.table,
		    stop = _ref26.stop,
		    owner = _ref26.owner,
		    page = _ref26.page;
		return this.$publish('range', { columns: columns, start: start, table: table, stop: stop, owner: owner, page: page });
	};
	/**
  * Removes one cell inside a column of a row
  *
  * Removes only one cell of the given column of the given row from the given table.
  * */


	Gda.prototype.removeCell = function removeCell(_ref27) {
		var table = _ref27.table,
		    key = _ref27.key,
		    key2 = _ref27.key2,
		    owner = _ref27.owner,
		    column = _ref27.column;
		return this.$publish('removeCell', { table: table, key: key, key2: key2, owner: owner, column: column });
	};
	/**
  * Removes one full column of a row
  *
  * Removes all cells of the given column of the given row from the given table.
  * */


	Gda.prototype.removeColumn = function removeColumn(_ref28) {
		var table = _ref28.table,
		    key = _ref28.key,
		    owner = _ref28.owner,
		    column = _ref28.column;
		return this.$publish('removeColumn', { table: table, key: key, owner: owner, column: column });
	};
	/**
  * Removes a range of rows
  *
  * Removes the specified columns of the given range of rows from the given table.
  * */


	Gda.prototype.removeRange = function removeRange(_ref29) {
		var columns = _ref29.columns,
		    start = _ref29.start,
		    table = _ref29.table,
		    stop = _ref29.stop,
		    owner = _ref29.owner;
		return this.$publish('removeRange', { columns: columns, start: start, table: table, stop: stop, owner: owner });
	};
	/**
  * Removes one full row
  *
  * Removes all columns of the given row from the given table.
  * */


	Gda.prototype.removeRow = function removeRow(_ref30) {
		var table = _ref30.table,
		    key = _ref30.key,
		    owner = _ref30.owner;
		return this.$publish('removeRow', { table: table, key: key, owner: owner });
	};

	_createClass(Gda, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Gda service
   * @return {string}
   */
		get: function get() {
			return 'gda_0';
		}
	}]);

	return Gda;
}(_core.Service);
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


var Remoting = function (_Service7) {
	_inherits(Remoting, _Service7);

	function Remoting() {
		_classCallCheck(this, Remoting);

		return _possibleConstructorReturn(this, _Service7.apply(this, arguments));
	}

	/**
  * Adds a listener
  *
  * A user requests notifications from a device owned by anyone who granted him the right authorizations.
  * Whenever the device calls 'notify', notifications will be sent to the caller of this verb.
  * */
	Remoting.prototype.addListener = function addListener(_ref31) {
		var resource = _ref31.resource,
		    fromResource = _ref31.fromResource,
		    cmd = _ref31.cmd,
		    from = _ref31.from,
		    data = _ref31.data,
		    owner = _ref31.owner;
		return this.$publish('addListener', { resource: resource, fromResource: fromResource, cmd: cmd, from: from, data: data, owner: owner });
	};
	/**Response to 'getCapabilities'*/


	Remoting.prototype.capabilities = function capabilities(_ref32) {
		var askingResource = _ref32.askingResource,
		    _capabilities = _ref32.capabilities,
		    answeringResource = _ref32.answeringResource;
		return this.$publish('capabilities', { askingResource: askingResource, capabilities: _capabilities, answeringResource: answeringResource });
	};
	/**
  * Executes a command
  *
  * A user executes a command on a device owned by anyone who granted him the right authorizations.
  * The command is issued on channel 'command'
  * */


	Remoting.prototype.execute = function execute(_ref33) {
		var resource = _ref33.resource,
		    cmd = _ref33.cmd,
		    data = _ref33.data,
		    owner = _ref33.owner;
		return this.$publish('execute', { resource: resource, cmd: cmd, data: data, owner: owner });
	};
	/**
  * Requests capabilities
  *
  * A user requests all his devices for the whole list of their capabilities.
  * Devices are expected to answer on channel 'capabilities'
  * */


	Remoting.prototype.getCapabilities = function getCapabilities() {
		return this.$publish('getCapabilities', {});
	};
	/**
  * Notifies of some event
  *
  * A device notifies the registered users/devices on this channel.
  * The server forwards the notification to said users.
  * */


	Remoting.prototype.notify = function notify(_ref34) {
		var resource = _ref34.resource,
		    fromResource = _ref34.fromResource,
		    cmd = _ref34.cmd,
		    from = _ref34.from,
		    data = _ref34.data,
		    owner = _ref34.owner;
		return this.$publish('notify', { resource: resource, fromResource: fromResource, cmd: cmd, from: from, data: data, owner: owner });
	};
	/**
  * Pings devices
  *
  * A user requests all devices (of all owners) on which he has authorizations to respond on channel 'pong'
  * */


	Remoting.prototype.ping = function ping(_ref35) {
		var action = _ref35.action;
		return this.$publish('ping', { action: action });
	};
	/**Response to ping*/


	Remoting.prototype.pong = function pong(_ref36) {
		var user = _ref36.user,
		    resource = _ref36.resource,
		    available = _ref36.available,
		    uid = _ref36.uid,
		    owner = _ref36.owner,
		    action = _ref36.action;
		return this.$publish('pong', { user: user, resource: resource, available: available, uid: uid, owner: owner, action: action });
	};
	/**
  * Removes a listener
  *
  * A user stops requesting notifications from a device owned by anyone who granted him the right authorizations
  * */


	Remoting.prototype.removeListener = function removeListener(_ref37) {
		var resource = _ref37.resource,
		    fromResource = _ref37.fromResource,
		    cmd = _ref37.cmd,
		    from = _ref37.from,
		    data = _ref37.data,
		    owner = _ref37.owner;
		return this.$publish('removeListener', { resource: resource, fromResource: fromResource, cmd: cmd, from: from, data: data, owner: owner });
	};

	_createClass(Remoting, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Remoting service
   * @return {string}
   */
		get: function get() {
			return 'groups_0';
		}
	}]);

	return Remoting;
}(_core.Service);
/**
 * User API for groups and rights.
 *
 * Groups are stored per user.
 * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
 * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
 * @access public
 * */


exports.Remoting = Remoting;

var GroupManagement = exports.GroupManagement = function (_Service8) {
	_inherits(GroupManagement, _Service8);

	function GroupManagement() {
		_classCallCheck(this, GroupManagement);

		return _possibleConstructorReturn(this, _Service8.apply(this, arguments));
	}

	/**
  * Adds me to a group
  *
  * Adds me (the caller) to a group.
  * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
  * The 'user' field is implicitly set to the current user's key.
  * */
	GroupManagement.prototype.addMe = function addMe(_ref38) {
		var group = _ref38.group,
		    owner = _ref38.owner;
		return this.$publish('addMe', { group: group, owner: owner });
	};
	/**
  * Adds a user to a group
  *
  * Adds the given user to the given group.
  * Addition may fail if the given group does not already exist.
  * */


	GroupManagement.prototype.addUser = function addUser(_ref39) {
		var user = _ref39.user,
		    group = _ref39.group,
		    owner = _ref39.owner;
		return this.$publish('addUser', { user: user, group: group, owner: owner });
	};
	/**Adds users to a group*/


	GroupManagement.prototype.addUsers = function addUsers(_ref40) {
		var users = _ref40.users,
		    group = _ref40.group,
		    owner = _ref40.owner;
		return this.$publish('addUsers', { users: users, group: group, owner: owner });
	};
	/**
  * Lists my owned groups, with details
  *
  * Returns the whole list of groups owned by the current user, with their members
  * */


	GroupManagement.prototype.allGroups = function allGroups(_ref41) {
		var owner = _ref41.owner;
		return this.$publish('allGroups', { owner: owner });
	};
	/**
  * Creates a group
  *
  * Creates a group owned by the current user.
  * Group creation may fail if the group already exists.
  * */


	GroupManagement.prototype.createGroup = function createGroup(_ref42) {
		var group = _ref42.group,
		    groupName = _ref42.groupName,
		    owner = _ref42.owner;
		return this.$publish('createGroup', { group: group, groupName: groupName, owner: owner });
	};
	/**
  * Removes a group
  *
  * Removes the given group owned by the current user or the given owner.
  * Also removes all grants to that group.
  * */


	GroupManagement.prototype.delGroup = function delGroup(_ref43) {
		var group = _ref43.group,
		    owner = _ref43.owner;
		return this.$publish('delGroup', { group: group, owner: owner });
	};
	/**Removes a user from a group*/


	GroupManagement.prototype.delUser = function delUser(_ref44) {
		var user = _ref44.user,
		    group = _ref44.group,
		    owner = _ref44.owner;
		return this.$publish('delUser', { user: user, group: group, owner: owner });
	};
	/**Removes users from a group*/


	GroupManagement.prototype.delUsers = function delUsers(_ref45) {
		var users = _ref45.users,
		    group = _ref45.group,
		    groupName = _ref45.groupName,
		    owner = _ref45.owner;
		return this.$publish('delUsers', { users: users, group: group, groupName: groupName, owner: owner });
	};
	/**
  * Tests for a group's existence
  *
  * Returns whether a group exists or not.
  * */


	GroupManagement.prototype.exists = function exists(_ref46) {
		var group = _ref46.group,
		    owner = _ref46.owner;
		return this.$publish('exists', { group: group, owner: owner });
	};
	/**
  * Grants a right to a group
  *
  * The granting API does not do any check when storing permissions.
  * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
  * */


	GroupManagement.prototype.grant = function grant(_ref47) {
		var resource = _ref47.resource,
		    group = _ref47.group,
		    owner = _ref47.owner,
		    action = _ref47.action;
		return this.$publish('grant', { resource: resource, group: group, owner: owner, action: action });
	};
	/**
  * Lists the group users
  *
  * Returns the whole list of users configured inside the given group.
  * */


	GroupManagement.prototype.groupUsers = function groupUsers(_ref48) {
		var group = _ref48.group,
		    owner = _ref48.owner;
		return this.$publish('groupUsers', { group: group, owner: owner });
	};
	/**
  * Lists my owned groups
  *
  * Returns the whole list of groups owned by the current user
  * */


	GroupManagement.prototype.groups = function groups(_ref49) {
		var owner = _ref49.owner;
		return this.$publish('groups', { owner: owner });
	};
	/**
  * Lists rights for a group
  *
  * This API lists explicitly configured rights.
  * Effective rights include configured rights, implicit rights and inherited rights.
  * */


	GroupManagement.prototype.listGrants = function listGrants(_ref50) {
		var group = _ref50.group,
		    owner = _ref50.owner;
		return this.$publish('listGrants', { group: group, owner: owner });
	};
	/**
  * Lists presences for a group
  *
  * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
  * The current implementation does not include information about the particular devices users are connected with.
  * If a user is connected twice with two different devices, two identical entries will be returned.
  * */


	GroupManagement.prototype.listPresences = function listPresences(_ref51) {
		var group = _ref51.group,
		    owner = _ref51.owner;
		return this.$publish('listPresences', { group: group, owner: owner });
	};
	/**
  * Tests membership
  *
  * Tests whether I (the caller) am a member of the given group.
  * This verb exists so that users can determine if they are part of a group without being granted particular rights.
  * The 'user' field is implicitly set to the current user's key.
  * */


	GroupManagement.prototype.memberOf = function memberOf(_ref52) {
		var hardFail = _ref52.hardFail,
		    group = _ref52.group,
		    owner = _ref52.owner;
		return this.$publish('memberOf', { hardFail: hardFail, group: group, owner: owner });
	};
	/**
  * Grants rights to a group
  *
  * Grant several rights at once.
  * */


	GroupManagement.prototype.mgrant = function mgrant(_ref53) {
		var resource = _ref53.resource,
		    actions = _ref53.actions,
		    group = _ref53.group,
		    owner = _ref53.owner;
		return this.$publish('mgrant', { resource: resource, actions: actions, group: group, owner: owner });
	};
	/**Revokes rights for a group*/


	GroupManagement.prototype.mrevoke = function mrevoke(_ref54) {
		var resource = _ref54.resource,
		    actions = _ref54.actions,
		    group = _ref54.group,
		    owner = _ref54.owner;
		return this.$publish('mrevoke', { resource: resource, actions: actions, group: group, owner: owner });
	};
	/**
  * Lists the groups I am part of
  *
  * Returns the whole list of groups the current user is part of.
  * Groups may be owned by anyone, including the current user.
  * */


	GroupManagement.prototype.myGroups = function myGroups(_ref55) {
		var owner = _ref55.owner;
		return this.$publish('myGroups', { owner: owner });
	};
	/**Revokes a right for a group*/


	GroupManagement.prototype.revoke = function revoke(_ref56) {
		var resource = _ref56.resource,
		    group = _ref56.group,
		    owner = _ref56.owner,
		    action = _ref56.action;
		return this.$publish('revoke', { resource: resource, group: group, owner: owner, action: action });
	};

	_createClass(GroupManagement, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to GroupManagement service
   * @return {string}
   */
		get: function get() {
			return 'groups_0';
		}
	}]);

	return GroupManagement;
}(_core.Service);
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


var Httpclient = exports.Httpclient = function (_Service9) {
	_inherits(Httpclient, _Service9);

	function Httpclient() {
		_classCallCheck(this, Httpclient);

		return _possibleConstructorReturn(this, _Service9.apply(this, arguments));
	}

	/**
  * Makes a predefined request
  *
  * Lookups a predefined request by name, and executes it.
  * */
	Httpclient.prototype.call = function call(_ref57) {
		var name = _ref57.name,
		    requestId = _ref57.requestId;
		return this.$publish('call', { name: name, requestId: requestId });
	};

	_createClass(Httpclient, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Httpclient service
   * @return {string}
   */
		get: function get() {
			return 'httpclient_0';
		}
	}]);

	return Httpclient;
}(_core.Service);
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
 * User API for macro debugging
 *
 * Debugger API for macro.
 * These API verbs are not intended for use by most developers.
 * @access public
 * */


var MacroDebug = function (_Service10) {
	_inherits(MacroDebug, _Service10);

	function MacroDebug() {
		_classCallCheck(this, MacroDebug);

		return _possibleConstructorReturn(this, _Service10.apply(this, arguments));
	}

	/**Enables or disables a breakpoint*/
	MacroDebug.prototype.breakpoint = function breakpoint(_ref58) {
		var _breakpoint = _ref58.breakpoint,
		    token = _ref58.token,
		    enabled = _ref58.enabled;
		return this.$publish('breakpoint', { breakpoint: _breakpoint, token: token, enabled: enabled });
	};
	/**Requests some information*/


	MacroDebug.prototype.info = function info(_ref59) {
		var token = _ref59.token,
		    path = _ref59.path,
		    exp = _ref59.exp,
		    requestId = _ref59.requestId,
		    frame = _ref59.frame;
		return this.$publish('info', { token: token, path: path, exp: exp, requestId: requestId, frame: frame });
	};
	/**
  * Debugs a previously recorded macro
  *
  * The given breakpoints will be honored, causing a suspension of the execution, resumable via 'resume'.
  * Only one debug session can be active at any given time.
  * */


	MacroDebug.prototype.livedebug = function livedebug(_ref60) {
		var parameters = _ref60.parameters,
		    token = _ref60.token,
		    breakpoints = _ref60.breakpoints,
		    hardFail = _ref60.hardFail,
		    name = _ref60.name,
		    requestId = _ref60.requestId,
		    debug = _ref60.debug;
		return this.$publish('livedebug', { parameters: parameters, token: token, breakpoints: breakpoints, hardFail: hardFail, name: name, requestId: requestId, debug: debug });
	};
	/**Resumes a paused macro*/


	MacroDebug.prototype.resume = function resume(_ref61) {
		var token = _ref61.token,
		    type = _ref61.type;
		return this.$publish('resume', { token: token, type: type });
	};
	/**Sets a variable value*/


	MacroDebug.prototype.variable = function variable(_ref62) {
		var token = _ref62.token,
		    name = _ref62.name,
		    frame = _ref62.frame,
		    data = _ref62.data;
		return this.$publish('variable', { token: token, name: name, frame: frame, data: data });
	};

	_createClass(MacroDebug, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to MacroDebug service
   * @return {string}
   */
		get: function get() {
			return 'macro_0';
		}
	}]);

	return MacroDebug;
}(_core.Service);
/**
 * User API for macro execution
 *
 * Simple errors are reported as usual.
 * However, the macro execution verbs treat most errors in a particular way : instead of reporting errors on the usual 'error' channel, errors are put in the returned 'MacroCompletion' result.
 * This behavior can be tuned on a per-call basis with the hardFail parameter.
 * Note that some particular errors will always behave as if hardFail were true, because they are related to programming errors, or prevent processing from ending gracefully : STACK_OVERFLOW, NO_SUCH_FUNCTION, RAM_EXCEEDED, CYCLES_EXCEEDED, TIME_EXCEEDED, QUOTA_EXCEEDED, RATE_EXCEEDED, BAD_COMPARATOR_VALUE
 * @access public
 * */


exports.MacroDebug = MacroDebug;

var Macro = exports.Macro = function (_Service11) {
	_inherits(Macro, _Service11);

	function Macro() {
		_classCallCheck(this, Macro);

		return _possibleConstructorReturn(this, _Service11.apply(this, arguments));
	}

	/**
  * Plays a previously recorded macro
  *
  * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
  * You can override the default notification channel when defining the macro.
  * */
	Macro.prototype.call = function call(_ref63) {
		var parameters = _ref63.parameters,
		    hardFail = _ref63.hardFail,
		    name = _ref63.name,
		    requestId = _ref63.requestId,
		    debug = _ref63.debug;
		return this.$publish('call', { parameters: parameters, hardFail: hardFail, name: name, requestId: requestId, debug: debug });
	};

	_createClass(Macro, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Macro service
   * @return {string}
   */
		get: function get() {
			return 'macro_0';
		}
	}]);

	return Macro;
}(_core.Service);
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


var Sendmail = exports.Sendmail = function (_Service12) {
	_inherits(Sendmail, _Service12);

	function Sendmail() {
		_classCallCheck(this, Sendmail);

		return _possibleConstructorReturn(this, _Service12.apply(this, arguments));
	}

	_createClass(Sendmail, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Sendmail service
   * @return {string}
   */
		get: function get() {
			return 'sendmail_0';
		}
	}]);

	return Sendmail;
}(_core.Service);
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


var Messaging = exports.Messaging = function (_Service13) {
	_inherits(Messaging, _Service13);

	function Messaging() {
		_classCallCheck(this, Messaging);

		return _possibleConstructorReturn(this, _Service13.apply(this, arguments));
	}

	/**
  * Sends a message to a target
  *
  * Sends the given message to the specified target on the given (optional) channel.
  * The administratively given default channel name is used when none is provided in the message itself.
  * */
	Messaging.prototype.send = function send(_ref64) {
		var target = _ref64.target,
		    channel = _ref64.channel,
		    data = _ref64.data;
		return this.$publish('send', { target: target, channel: channel, data: data });
	};

	_createClass(Messaging, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Messaging service
   * @return {string}
   */
		get: function get() {
			return 'messaging_0';
		}
	}]);

	return Messaging;
}(_core.Service);
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


var Queue = exports.Queue = function (_Service14) {
	_inherits(Queue, _Service14);

	function Queue() {
		_classCallCheck(this, Queue);

		return _possibleConstructorReturn(this, _Service14.apply(this, arguments));
	}

	/**
  * Submits a task
  *
  * Producer API.
  * A task producer submits the given task to the server.
  * The server will find a tasker with processing capacity and dispatch the task.
  * The task result will be returned to the caller.
  * When called from inside a macro, the comsumer generated result is available for further use.
  * */
	Queue.prototype.call = function call(_ref65) {
		var description = _ref65.description,
		    originBusinessId = _ref65.originBusinessId,
		    originDeploymentId = _ref65.originDeploymentId,
		    data = _ref65.data,
		    owner = _ref65.owner;
		return this.$publish('call', { description: description, originBusinessId: originBusinessId, originDeploymentId: originDeploymentId, data: data, owner: owner });
	};
	/**
  * Notifies completion of a task
  *
  * Consumer API.
  * The tasker notifies completion of the given task to the server.
  * The tasker can optionally include a result or an error code.
  * */


	Queue.prototype.done = function done(_ref66) {
		var result = _ref66.result,
		    taskId = _ref66.taskId,
		    success = _ref66.success;
		return this.$publish('done', { result: result, taskId: taskId, success: success });
	};
	/**
  * Registers a consumer
  *
  * Consumer API.
  * Registers the current user resource as an available task consumer.
  * Tasks will be then dispatched to that consumer.
  * */


	Queue.prototype.register = function register(_ref67) {
		var capacity = _ref67.capacity;
		return this.$publish('register', { capacity: capacity });
	};
	/**
  * Submits a task
  *
  * Producer API.
  * A task producer submits the given task to the server.
  * The server will find a tasker with processing capacity and dispatch the task.
  * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
  * This verb will return immediately : you can use this API to asynchronously submit a task.
  * */


	Queue.prototype.submit = function submit(_ref68) {
		var description = _ref68.description,
		    originBusinessId = _ref68.originBusinessId,
		    originDeploymentId = _ref68.originDeploymentId,
		    data = _ref68.data,
		    owner = _ref68.owner;
		return this.$publish('submit', { description: description, originBusinessId: originBusinessId, originDeploymentId: originDeploymentId, data: data, owner: owner });
	};
	/**
  * Unregisters a consumer
  *
  * Consumer API.
  * Unregisters the current user resource as an available task consumer.
  * All non finished tasks are returned to the server.
  * */


	Queue.prototype.unregister = function unregister() {
		return this.$publish('unregister', {});
	};

	_createClass(Queue, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Queue service
   * @return {string}
   */
		get: function get() {
			return 'queue_0';
		}
	}]);

	return Queue;
}(_core.Service);
/**
 * Push Notifications
 *
 * Native Push Notifications for Android, iOS
 *
 *
 *
 * */
/**
 * Notification User API
 *
 * User API for notifications.
 * For notifications to work properly, it is imperative that the resource name of a device remain constant over time.
 * @access public
 * */


var Notif = exports.Notif = function (_Service15) {
	_inherits(Notif, _Service15);

	function Notif() {
		_classCallCheck(this, Notif);

		return _possibleConstructorReturn(this, _Service15.apply(this, arguments));
	}

	_createClass(Notif, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Notif service
   * @return {string}
   */
		get: function get() {
			return 'notif_0';
		}
	}]);

	return Notif;
}(_core.Service);
/**
 * RDBMS
 *
 * Relational Database : SQL storage
 * */
/**
 * RDBMS User API
 *
 * User API for SQL queries.
 * Contrary to GDA or Stacks, the data are not stored on a per-user basis.
 * Users can store, get, list their data.
 * @access public
 * */


var Rdbms = exports.Rdbms = function (_Service16) {
	_inherits(Rdbms, _Service16);

	function Rdbms() {
		_classCallCheck(this, Rdbms);

		return _possibleConstructorReturn(this, _Service16.apply(this, arguments));
	}

	_createClass(Rdbms, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Rdbms service
   * @return {string}
   */
		get: function get() {
			return 'rdbms_0';
		}
	}]);

	return Rdbms;
}(_core.Service);
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


var Sms_ovh = exports.Sms_ovh = function (_Service17) {
	_inherits(Sms_ovh, _Service17);

	function Sms_ovh() {
		_classCallCheck(this, Sms_ovh);

		return _possibleConstructorReturn(this, _Service17.apply(this, arguments));
	}

	_createClass(Sms_ovh, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Sms_ovh service
   * @return {string}
   */
		get: function get() {
			return 'sms_ovh_0';
		}
	}]);

	return Sms_ovh;
}(_core.Service);
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


var Cron = exports.Cron = function (_Service18) {
	_inherits(Cron, _Service18);

	function Cron() {
		_classCallCheck(this, Cron);

		return _possibleConstructorReturn(this, _Service18.apply(this, arguments));
	}

	/**
  * List the configured tasks
  *
  * Returns a paginated list of the asking user's tasks.
  * */
	Cron.prototype.list = function list(_ref69) {
		var start = _ref69.start,
		    stop = _ref69.stop,
		    owner = _ref69.owner,
		    page = _ref69.page;
		return this.$publish('list', { start: start, stop: stop, owner: owner, page: page });
	};

	_createClass(Cron, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Cron service
   * @return {string}
   */
		get: function get() {
			return 'cron_0';
		}
	}]);

	return Cron;
}(_core.Service);
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


var Search = function (_Service19) {
	_inherits(Search, _Service19);

	function Search() {
		_classCallCheck(this, Search);

		return _possibleConstructorReturn(this, _Service19.apply(this, arguments));
	}

	/**
  * Deletes data
  *
  * Deletes a document from the elasticsearch engine by id.
  * */
	Search.prototype.delete = function _delete(_ref70) {
		var type = _ref70.type,
		    id = _ref70.id,
		    index = _ref70.index;
		return this.$publish('delete', { type: type, id: id, index: index });
	};
	/**
  * Gets data
  *
  * Retrieves a document from the elasticsearch engine by id.
  * */


	Search.prototype.get = function get(_ref71) {
		var type = _ref71.type,
		    id = _ref71.id,
		    index = _ref71.index;
		return this.$publish('get', { type: type, id: id, index: index });
	};
	/**
  * Indexes data
  *
  * Inserts or updates a document into the elasticsearch engine.
  * */


	Search.prototype.index = function index(_ref72) {
		var type = _ref72.type,
		    id = _ref72.id,
		    _index = _ref72.index,
		    data = _ref72.data;
		return this.$publish('index', { type: type, id: id, index: _index, data: data });
	};
	/**Searches for data*/


	Search.prototype.search = function search(_ref73) {
		var indices = _ref73.indices,
		    query = _ref73.query,
		    sort = _ref73.sort,
		    page = _ref73.page,
		    types = _ref73.types;
		return this.$publish('search', { indices: indices, query: query, sort: sort, page: page, types: types });
	};

	_createClass(Search, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Search service
   * @return {string}
   */
		get: function get() {
			return 'search_0';
		}
	}]);

	return Search;
}(_core.Service);
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


exports.Search = Search;

var Template = exports.Template = function (_Service20) {
	_inherits(Template, _Service20);

	function Template() {
		_classCallCheck(this, Template);

		return _possibleConstructorReturn(this, _Service20.apply(this, arguments));
	}

	/**
  * Evaluates a template
  *
  * Evaluates the given template and returns the result as a string.
  * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
  * */
	Template.prototype.evaluate = function evaluate(_ref74) {
		var languageTag = _ref74.languageTag,
		    name = _ref74.name,
		    requestId = _ref74.requestId,
		    data = _ref74.data;
		return this.$publish('evaluate', { languageTag: languageTag, name: name, requestId: requestId, data: data });
	};

	_createClass(Template, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Template service
   * @return {string}
   */
		get: function get() {
			return 'template_0';
		}
	}]);

	return Template;
}(_core.Service);
/**
 * Triggers
 *
 * Register callbacks for events and trigger them when needed
 *
 * */
/**
 * Trigger service
 *
 * Register listeners and trigger events.
 * @access public
 * */


var Trigger = exports.Trigger = function (_Service21) {
	_inherits(Trigger, _Service21);

	function Trigger() {
		_classCallCheck(this, Trigger);

		return _possibleConstructorReturn(this, _Service21.apply(this, arguments));
	}

	_createClass(Trigger, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Trigger service
   * @return {string}
   */
		get: function get() {
			return 'trigger_0';
		}
	}]);

	return Trigger;
}(_core.Service);
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


var Zpfs_s3 = exports.Zpfs_s3 = function (_Service22) {
	_inherits(Zpfs_s3, _Service22);

	function Zpfs_s3() {
		_classCallCheck(this, Zpfs_s3);

		return _possibleConstructorReturn(this, _Service22.apply(this, arguments));
	}

	/**
  * Copies a file
  *
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	Zpfs_s3.prototype.cp = function cp(_ref75) {
		var oldPath = _ref75.oldPath,
		    path = _ref75.path,
		    owner = _ref75.owner;
		return this.$publish('cp', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Returns disk usage
  *
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */


	Zpfs_s3.prototype.du = function du(_ref76) {
		var path = _ref76.path,
		    owner = _ref76.owner;
		return this.$publish('du', { path: path, owner: owner });
	};
	/**
  * Links a file
  *
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3.prototype.link = function link(_ref77) {
		var oldPath = _ref77.oldPath,
		    path = _ref77.path,
		    owner = _ref77.owner;
		return this.$publish('link', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Lists a folder content
  *
  * Returns a paginated list of the folder's content.
  * */


	Zpfs_s3.prototype.ls = function ls(_ref78) {
		var folder = _ref78.folder,
		    owner = _ref78.owner,
		    page = _ref78.page;
		return this.$publish('ls', { folder: folder, owner: owner, page: page });
	};
	/**
  * Creates a folder
  *
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3.prototype.mkdir = function mkdir(_ref79) {
		var parents = _ref79.parents,
		    folder = _ref79.folder,
		    owner = _ref79.owner;
		return this.$publish('mkdir', { parents: parents, folder: folder, owner: owner });
	};
	/**
  * Moves a file
  *
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3.prototype.mv = function mv(_ref80) {
		var oldPath = _ref80.oldPath,
		    path = _ref80.path,
		    owner = _ref80.owner;
		return this.$publish('mv', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Notifies of upload completion
  *
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */


	Zpfs_s3.prototype.newFile = function newFile(_ref81) {
		var tags = _ref81.tags,
		    guid = _ref81.guid,
		    metadata = _ref81.metadata,
		    owner = _ref81.owner;
		return this.$publish('newFile', { tags: tags, guid: guid, metadata: metadata, owner: owner });
	};
	/**
  * Requests an upload URL
  *
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */


	Zpfs_s3.prototype.newUploadUrl = function newUploadUrl(_ref82) {
		var contentType = _ref82.contentType,
		    path = _ref82.path,
		    owner = _ref82.owner;
		return this.$publish('newUploadUrl', { contentType: contentType, path: path, owner: owner });
	};
	/**
  * Removes a file
  *
  * Removes a file or folder (recursively).
  * */


	Zpfs_s3.prototype.rm = function rm(_ref83) {
		var path = _ref83.path,
		    owner = _ref83.owner;
		return this.$publish('rm', { path: path, owner: owner });
	};
	/**
  * Creates a snapshot in a new folder
  *
  * Creates a new folder and then copies the given files inside
  * */


	Zpfs_s3.prototype.snapshot = function snapshot(_ref84) {
		var parents = _ref84.parents,
		    folder = _ref84.folder,
		    items = _ref84.items,
		    flatten = _ref84.flatten,
		    owner = _ref84.owner;
		return this.$publish('snapshot', { parents: parents, folder: folder, items: items, flatten: flatten, owner: owner });
	};
	/**
  * Returns information about a file
  *
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */


	Zpfs_s3.prototype.stat = function stat(_ref85) {
		var path = _ref85.path,
		    owner = _ref85.owner;
		return this.$publish('stat', { path: path, owner: owner });
	};
	/**Updates a file's metadata*/


	Zpfs_s3.prototype.updateMeta = function updateMeta(_ref86) {
		var path = _ref86.path,
		    metadataFiles = _ref86.metadataFiles,
		    metadata = _ref86.metadata,
		    owner = _ref86.owner;
		return this.$publish('updateMeta', { path: path, metadataFiles: metadataFiles, metadata: metadata, owner: owner });
	};

	_createClass(Zpfs_s3, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Zpfs_s3 service
   * @return {string}
   */
		get: function get() {
			return 'zpfs_s3_0';
		}
	}]);

	return Zpfs_s3;
}(_core.Service);
/**
 * Upload: local
 *
 * Upload service with local HDFS storage
 * */
/**
 * User API for local file management
 *
 * User API for file content manipulation
 * @access public
 * */


var Zpfs_hdfs = exports.Zpfs_hdfs = function (_Service23) {
	_inherits(Zpfs_hdfs, _Service23);

	function Zpfs_hdfs() {
		_classCallCheck(this, Zpfs_hdfs);

		return _possibleConstructorReturn(this, _Service23.apply(this, arguments));
	}

	/**
  * Copies a file
  *
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	Zpfs_hdfs.prototype.cp = function cp(_ref87) {
		var oldPath = _ref87.oldPath,
		    path = _ref87.path,
		    owner = _ref87.owner;
		return this.$publish('cp', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Returns disk usage
  *
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */


	Zpfs_hdfs.prototype.du = function du(_ref88) {
		var path = _ref88.path,
		    owner = _ref88.owner;
		return this.$publish('du', { path: path, owner: owner });
	};
	/**
  * Links a file
  *
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */


	Zpfs_hdfs.prototype.link = function link(_ref89) {
		var oldPath = _ref89.oldPath,
		    path = _ref89.path,
		    owner = _ref89.owner;
		return this.$publish('link', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Lists a folder content
  *
  * Returns a paginated list of the folder's content.
  * */


	Zpfs_hdfs.prototype.ls = function ls(_ref90) {
		var folder = _ref90.folder,
		    owner = _ref90.owner,
		    page = _ref90.page;
		return this.$publish('ls', { folder: folder, owner: owner, page: page });
	};
	/**
  * Creates a folder
  *
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */


	Zpfs_hdfs.prototype.mkdir = function mkdir(_ref91) {
		var parents = _ref91.parents,
		    folder = _ref91.folder,
		    owner = _ref91.owner;
		return this.$publish('mkdir', { parents: parents, folder: folder, owner: owner });
	};
	/**
  * Moves a file
  *
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */


	Zpfs_hdfs.prototype.mv = function mv(_ref92) {
		var oldPath = _ref92.oldPath,
		    path = _ref92.path,
		    owner = _ref92.owner;
		return this.$publish('mv', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Notifies of upload completion
  *
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */


	Zpfs_hdfs.prototype.newFile = function newFile(_ref93) {
		var tags = _ref93.tags,
		    guid = _ref93.guid,
		    metadata = _ref93.metadata,
		    owner = _ref93.owner;
		return this.$publish('newFile', { tags: tags, guid: guid, metadata: metadata, owner: owner });
	};
	/**
  * Requests an upload URL
  *
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */


	Zpfs_hdfs.prototype.newUploadUrl = function newUploadUrl(_ref94) {
		var contentType = _ref94.contentType,
		    path = _ref94.path,
		    owner = _ref94.owner;
		return this.$publish('newUploadUrl', { contentType: contentType, path: path, owner: owner });
	};
	/**
  * Removes a file
  *
  * Removes a file or folder (recursively).
  * */


	Zpfs_hdfs.prototype.rm = function rm(_ref95) {
		var path = _ref95.path,
		    owner = _ref95.owner;
		return this.$publish('rm', { path: path, owner: owner });
	};
	/**
  * Creates a snapshot in a new folder
  *
  * Creates a new folder and then copies the given files inside
  * */


	Zpfs_hdfs.prototype.snapshot = function snapshot(_ref96) {
		var parents = _ref96.parents,
		    folder = _ref96.folder,
		    items = _ref96.items,
		    flatten = _ref96.flatten,
		    owner = _ref96.owner;
		return this.$publish('snapshot', { parents: parents, folder: folder, items: items, flatten: flatten, owner: owner });
	};
	/**
  * Returns information about a file
  *
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */


	Zpfs_hdfs.prototype.stat = function stat(_ref97) {
		var path = _ref97.path,
		    owner = _ref97.owner;
		return this.$publish('stat', { path: path, owner: owner });
	};
	/**Updates a file's metadata*/


	Zpfs_hdfs.prototype.updateMeta = function updateMeta(_ref98) {
		var path = _ref98.path,
		    metadataFiles = _ref98.metadataFiles,
		    metadata = _ref98.metadata,
		    owner = _ref98.owner;
		return this.$publish('updateMeta', { path: path, metadataFiles: metadataFiles, metadata: metadata, owner: owner });
	};

	_createClass(Zpfs_hdfs, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Zpfs_hdfs service
   * @return {string}
   */
		get: function get() {
			return 'zpfs_hdfs_0';
		}
	}]);

	return Zpfs_hdfs;
}(_core.Service);
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


var Zpfs_s3compat = exports.Zpfs_s3compat = function (_Service24) {
	_inherits(Zpfs_s3compat, _Service24);

	function Zpfs_s3compat() {
		_classCallCheck(this, Zpfs_s3compat);

		return _possibleConstructorReturn(this, _Service24.apply(this, arguments));
	}

	/**
  * Copies a file
  *
  * Copies a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */
	Zpfs_s3compat.prototype.cp = function cp(_ref99) {
		var oldPath = _ref99.oldPath,
		    path = _ref99.path,
		    owner = _ref99.owner;
		return this.$publish('cp', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Returns disk usage
  *
  * Returns an recursively aggregated number of used bytes, starting at the given path.
  * */


	Zpfs_s3compat.prototype.du = function du(_ref100) {
		var path = _ref100.path,
		    owner = _ref100.owner;
		return this.$publish('du', { path: path, owner: owner });
	};
	/**
  * Links a file
  *
  * Links a file or folder to another location.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3compat.prototype.link = function link(_ref101) {
		var oldPath = _ref101.oldPath,
		    path = _ref101.path,
		    owner = _ref101.owner;
		return this.$publish('link', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Lists a folder content
  *
  * Returns a paginated list of the folder's content.
  * */


	Zpfs_s3compat.prototype.ls = function ls(_ref102) {
		var folder = _ref102.folder,
		    owner = _ref102.owner,
		    page = _ref102.page;
		return this.$publish('ls', { folder: folder, owner: owner, page: page });
	};
	/**
  * Creates a folder
  *
  * Creates a new folder.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3compat.prototype.mkdir = function mkdir(_ref103) {
		var parents = _ref103.parents,
		    folder = _ref103.folder,
		    owner = _ref103.owner;
		return this.$publish('mkdir', { parents: parents, folder: folder, owner: owner });
	};
	/**
  * Moves a file
  *
  * Moves a file or folder (recursively) to a new location.
  * May fail if the target location is not empty.
  * */


	Zpfs_s3compat.prototype.mv = function mv(_ref104) {
		var oldPath = _ref104.oldPath,
		    path = _ref104.path,
		    owner = _ref104.owner;
		return this.$publish('mv', { oldPath: oldPath, path: path, owner: owner });
	};
	/**
  * Notifies of upload completion
  *
  * The client application calls this verb to notify that it's done uploading to the cloud.
  * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
  * */


	Zpfs_s3compat.prototype.newFile = function newFile(_ref105) {
		var tags = _ref105.tags,
		    guid = _ref105.guid,
		    metadata = _ref105.metadata,
		    owner = _ref105.owner;
		return this.$publish('newFile', { tags: tags, guid: guid, metadata: metadata, owner: owner });
	};
	/**
  * Requests an upload URL
  *
  * Requests an HTTP upload URL.
  * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
  * */


	Zpfs_s3compat.prototype.newUploadUrl = function newUploadUrl(_ref106) {
		var contentType = _ref106.contentType,
		    path = _ref106.path,
		    owner = _ref106.owner;
		return this.$publish('newUploadUrl', { contentType: contentType, path: path, owner: owner });
	};
	/**
  * Removes a file
  *
  * Removes a file or folder (recursively).
  * */


	Zpfs_s3compat.prototype.rm = function rm(_ref107) {
		var path = _ref107.path,
		    owner = _ref107.owner;
		return this.$publish('rm', { path: path, owner: owner });
	};
	/**
  * Creates a snapshot in a new folder
  *
  * Creates a new folder and then copies the given files inside
  * */


	Zpfs_s3compat.prototype.snapshot = function snapshot(_ref108) {
		var parents = _ref108.parents,
		    folder = _ref108.folder,
		    items = _ref108.items,
		    flatten = _ref108.flatten,
		    owner = _ref108.owner;
		return this.$publish('snapshot', { parents: parents, folder: folder, items: items, flatten: flatten, owner: owner });
	};
	/**
  * Returns information about a file
  *
  * Returns information about a single file.
  * The entry field will be null if the path does not exist
  * */


	Zpfs_s3compat.prototype.stat = function stat(_ref109) {
		var path = _ref109.path,
		    owner = _ref109.owner;
		return this.$publish('stat', { path: path, owner: owner });
	};
	/**Updates a file's metadata*/


	Zpfs_s3compat.prototype.updateMeta = function updateMeta(_ref110) {
		var path = _ref110.path,
		    metadataFiles = _ref110.metadataFiles,
		    metadata = _ref110.metadata,
		    owner = _ref110.owner;
		return this.$publish('updateMeta', { path: path, metadataFiles: metadataFiles, metadata: metadata, owner: owner });
	};

	_createClass(Zpfs_s3compat, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Zpfs_s3compat service
   * @return {string}
   */
		get: function get() {
			return 'zpfs_s3compat_0';
		}
	}]);

	return Zpfs_s3compat;
}(_core.Service);
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


var Userdir = exports.Userdir = function (_Service25) {
	_inherits(Userdir, _Service25);

	function Userdir() {
		_classCallCheck(this, Userdir);

		return _possibleConstructorReturn(this, _Service25.apply(this, arguments));
	}

	/**Searches for users matching the request*/
	Userdir.prototype.search = function search(_ref111) {
		var requestId = _ref111.requestId,
		    query = _ref111.query,
		    page = _ref111.page;
		return this.$publish('search', { requestId: requestId, query: query, page: page });
	};
	/**Requests public data for the specified users*/


	Userdir.prototype.userInfo = function userInfo(_ref112) {
		var userKeys = _ref112.userKeys;
		return this.$publish('userInfo', { userKeys: userKeys });
	};

	_createClass(Userdir, null, [{
		key: 'DEFAULT_DEPLOYMENT_ID',

		/**
   * Get default deployment id associated to Userdir service
   * @return {string}
   */
		get: function get() {
			return 'userdir_0';
		}
	}]);

	return Userdir;
}(_core.Service);