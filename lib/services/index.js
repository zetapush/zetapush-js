/**
 * @access protected
 */
export class Service {
	constructor({ $publish }) {
		this.$publish = $publish
	}
}
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
export class Aggreg extends Service {
	/**
	 * Get default deployment id associated to Aggreg service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'aggreg_0'
	}
	/**
	 * Pushes some data
	 * 
	 * Pushes the given data.
	 * All the items are processed according to the defined rules.
	 * At least one push for a given item is needed during a time period to trigger processing and calling of the corresponding callback verb/macro.
	 * */
	push({items,owner}) { this.$publish('push', {items,owner})}
}
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
export class Stack extends Service {
	/**
	 * Get default deployment id associated to Stack service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'stack_0'
	}
	/**
	 * Lists the listeners
	 * 
	 * Returns the whole list of listeners for the given stack.
	 * */
	getListeners({owner,stack}) { this.$publish('getListeners', {owner,stack})}
	/**
	 * Lists content
	 * 
	 * Returns a paginated list of contents for the given stack.
	 * Content is sorted according to the statically configured order.
	 * */
	list({owner,page,stack}) { this.$publish('list', {owner,page,stack})}
	/**
	 * Empties a stack
	 * 
	 * Removes all items from the given stack.
	 * */
	purge({owner,stack}) { this.$publish('purge', {owner,stack})}
	/**
	 * Pushes an item
	 * 
	 * Pushes an item onto the given stack.
	 * The stack does not need to be created.
	 * */
	push({stack,data,owner}) { this.$publish('push', {stack,data,owner})}
	/**
	 * Removes items
	 * 
	 * Removes the item with the given guid from the given stack.
	 * */
	remove({guids,owner,stack}) { this.$publish('remove', {guids,owner,stack})}
	/**
	 * Sets the listeners
	 * 
	 * Sets the listeners for the given stack.
	 * */
	setListeners({listeners,owner,stack}) { this.$publish('setListeners', {listeners,owner,stack})}
	/**
	 * Updates an item
	 * 
	 * Updates an existing item of the given stack.
	 * The item MUST exist prior to the call.
	 * */
	update({guid,stack,data,owner}) { this.$publish('update', {guid,stack,data,owner})}
}
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
export class Echo extends Service {
	/**
	 * Get default deployment id associated to Echo service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'echo_0'
	}
	/**
	 * Echoes an object
	 * 
	 * Echoes an object: the server will echo that object on channel 'echo' for the current user.
	 * */
	echo(parameter) { this.$publish('echo', parameter)}
}
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
export class GameEngine extends Service {
	/**
	 * Get default deployment id associated to GameEngine service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'game_0'
	}
	/**
	 * Notify the result for a join request
	 * 
	 * A Game Engine notifies the STR of the result of a join request that it received on join_callback
	 * */
	join_result({callerId,error,msgId,payload}) { this.$publish('join_result', {callerId,error,msgId,payload})}
	/**
	 * Notify the result for an organization request
	 * 
	 * A Game Engine notifies the STR of the result of an organization request that it received on organize_callback
	 * */
	organize_result({callerId,error,msgId,payload}) { this.$publish('organize_result', {callerId,error,msgId,payload})}
	/**
	 * Registers a game engine
	 * 
	 * A client registers itself to the STR as a Game Engine.
	 * The STR may, from now on, dispatch game of the given game type to said client.
	 * Unregistration is done automatically on logoff.
	 * */
	register({gameInfo,location,maxGames}) { this.$publish('register', {gameInfo,location,maxGames})}
	/**
	 * Notify the result for a start request
	 * 
	 * A Game Engine notifies the STR of the result of a start request that it received on start_callback
	 * */
	start_result({gameId}) { this.$publish('start_result', {gameId})}
	/**
	 * Notify a game event
	 * 
	 * A Game Engine notifies the STR of some arbitrary game event.
	 * */
	state({data,gameId,status}) { this.$publish('state', {data,gameId,status})}
	/**
	 * Notify the result for an unjoin request
	 * 
	 * A Game Engine notifies the STR of the result of an unjoin request that it received on unjoin_callback
	 * */
	unjoin_result({callerId,error,msgId,payload}) { this.$publish('unjoin_result', {callerId,error,msgId,payload})}
}
/**
 * User API for games
 * 
 * Users can list, start, join games, and play.
 * @access public
 * */
export class Game extends Service {
	/**
	 * Get default deployment id associated to Game service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'game_0'
	}
	/**
	 * Lists game types
	 * 
	 * Returns the list of game types supported by the server and the currently registered game engines.
	 * */
	available() { this.$publish('available', {})}
	/**A user joins a game*/
	join({gameId,role,userId,userName}) { this.$publish('join', {gameId,role,userId,userName})}
	/**Organizes a game*/
	organize({type,owner,options}) { this.$publish('organize', {type,owner,options})}
	/**Gives some command to the game engine*/
	play({data,gameId,userId}) { this.$publish('play', {data,gameId,userId})}
	/**Starts a game*/
	start({gameId}) { this.$publish('start', {gameId})}
	/**A user cancels joining a game*/
	unjoin({gameId,role,userId,userName}) { this.$publish('unjoin', {gameId,role,userId,userName})}
}
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
export class Gda extends Service {
	/**
	 * Get default deployment id associated to Gda service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'gda_0'
	}
	/**
	 * Asks for a data row
	 * 
	 * Returns a full data row.
	 * */
	get({key,owner,table}) { this.$publish('get', {key,owner,table})}
	/**
	 * Asks for a data cell
	 * 
	 * Returns a precise list of cells from a column in a data row.
	 * */
	getCells({column,key,key2,owner,table}) { this.$publish('getCells', {column,key,key2,owner,table})}
	/**
	 * Increments an integer value
	 * 
	 * Increments a cell 64-bit signed integer value and returns the result in the data field.
	 * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
	 * */
	inc({table,data,key,key2,owner,column}) { this.$publish('inc', {table,data,key,key2,owner,column})}
	/**
	 * Asks for a list of rows
	 * 
	 * Returns a paginated list of rows from the given table.
	 * */
	list({columns,owner,page,table}) { this.$publish('list', {columns,owner,page,table})}
	/**
	 * Puts some data into a cell
	 * 
	 * Creates or replaces the contents of a particular cell.
	 * */
	put({column,data,key,key2,owner,table}) { this.$publish('put', {column,data,key,key2,owner,table})}
	/**
	 * Puts several rows
	 * 
	 * Creates or replaces the (maybe partial) contents of a collection of rows.
	 * This method only creates or replaces cells for non-null input values.
	 * */
	puts({owner,rows,table}) { this.$publish('puts', {owner,rows,table})}
	/**
	 * Asks for a range of rows
	 * 
	 * Returns a paginated range of rows from the given table.
	 * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
	 * You can specify partial keys for the start and stop fields.
	 * */
	range({columns,owner,page,start,stop,table}) { this.$publish('range', {columns,owner,page,start,stop,table})}
	/**
	 * Removes one cell inside a column of a row
	 * 
	 * Removes only one cell of the given column of the given row from the given table.
	 * */
	removeCell({column,key,key2,owner,table}) { this.$publish('removeCell', {column,key,key2,owner,table})}
	/**
	 * Removes one full column of a row
	 * 
	 * Removes all cells of the given column of the given row from the given table.
	 * */
	removeColumn({column,key,owner,table}) { this.$publish('removeColumn', {column,key,owner,table})}
	/**
	 * Removes a range of rows
	 * 
	 * Removes the specified columns of the given range of rows from the given table.
	 * */
	removeRange({columns,owner,start,stop,table}) { this.$publish('removeRange', {columns,owner,start,stop,table})}
	/**
	 * Removes one full row
	 * 
	 * Removes all columns of the given row from the given table.
	 * */
	removeRow({key,owner,table}) { this.$publish('removeRow', {key,owner,table})}
}
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
export class Remoting extends Service {
	/**
	 * Get default deployment id associated to Remoting service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'groups_0'
	}
	/**
	 * Adds a listener
	 * 
	 * A user requests notifications from a device owned by anyone who granted him the right authorizations.
	 * Whenever the device calls 'notify', notifications will be sent to the caller of this verb.
	 * */
	addListener({cmd,data,from,fromResource,owner,resource}) { this.$publish('addListener', {cmd,data,from,fromResource,owner,resource})}
	/**Response to 'getCapabilities'*/
	capabilities({answeringResource,askingResource,capabilities}) { this.$publish('capabilities', {answeringResource,askingResource,capabilities})}
	/**
	 * Executes a command
	 * 
	 * A user executes a command on a device owned by anyone who granted him the right authorizations.
	 * The command is issued on channel 'command'
	 * */
	execute({resource,cmd,data,owner}) { this.$publish('execute', {resource,cmd,data,owner})}
	/**
	 * Requests capabilities
	 * 
	 * A user requests all his devices for the whole list of their capabilities.
	 * Devices are expected to answer on channel 'capabilities'
	 * */
	getCapabilities() { this.$publish('getCapabilities', {})}
	/**
	 * Notifies of some event
	 * 
	 * A device notifies the registered users/devices on this channel.
	 * The server forwards the notification to said users.
	 * */
	notify({cmd,data,from,fromResource,owner,resource}) { this.$publish('notify', {cmd,data,from,fromResource,owner,resource})}
	/**
	 * Pings devices
	 * 
	 * A user requests all devices (of all owners) on which he has authorizations to respond on channel 'pong'
	 * */
	ping({action}) { this.$publish('ping', {action})}
	/**Response to ping*/
	pong({action,available,owner,resource,uid,user}) { this.$publish('pong', {action,available,owner,resource,uid,user})}
	/**
	 * Removes a listener
	 * 
	 * A user stops requesting notifications from a device owned by anyone who granted him the right authorizations
	 * */
	removeListener({cmd,data,from,fromResource,owner,resource}) { this.$publish('removeListener', {cmd,data,from,fromResource,owner,resource})}
}
/**
 * User API for groups and rights.
 * 
 * Groups are stored per user.
 * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
 * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
 * @access public
 * */
export class GroupManagement extends Service {
	/**
	 * Get default deployment id associated to GroupManagement service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'groups_0'
	}
	/**
	 * Adds me to a group
	 * 
	 * Adds me (the caller) to a group.
	 * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
	 * The 'user' field is implicitly set to the current user's key.
	 * */
	addMe({group,owner}) { this.$publish('addMe', {group,owner})}
	/**
	 * Adds a user to a group
	 * 
	 * Adds the given user to the given group.
	 * Addition may fail if the given group does not already exist.
	 * */
	addUser({user,group,owner}) { this.$publish('addUser', {user,group,owner})}
	/**Adds users to a group*/
	addUsers({users,group,owner}) { this.$publish('addUsers', {users,group,owner})}
	/**
	 * Lists my owned groups, with details
	 * 
	 * Returns the whole list of groups owned by the current user, with their members
	 * */
	allGroups({owner}) { this.$publish('allGroups', {owner})}
	/**
	 * Creates a group
	 * 
	 * Creates a group owned by the current user.
	 * Group creation may fail if the group already exists.
	 * */
	createGroup({group,groupName,owner}) { this.$publish('createGroup', {group,groupName,owner})}
	/**
	 * Removes a group
	 * 
	 * Removes the given group owned by the current user or the given owner.
	 * Also removes all grants to that group.
	 * */
	delGroup({group,owner}) { this.$publish('delGroup', {group,owner})}
	/**Removes a user from a group*/
	delUser({group,owner,user}) { this.$publish('delUser', {group,owner,user})}
	/**Removes users from a group*/
	delUsers({group,groupName,owner,users}) { this.$publish('delUsers', {group,groupName,owner,users})}
	/**
	 * Tests for a group's existence
	 * 
	 * Returns whether a group exists or not.
	 * */
	exists({group,owner}) { this.$publish('exists', {group,owner})}
	/**
	 * Grants a right to a group
	 * 
	 * The granting API does not do any check when storing permissions.
	 * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
	 * */
	grant({action,group,owner,resource}) { this.$publish('grant', {action,group,owner,resource})}
	/**
	 * Lists the group users
	 * 
	 * Returns the whole list of users configured inside the given group.
	 * */
	groupUsers({group,owner}) { this.$publish('groupUsers', {group,owner})}
	/**
	 * Lists my owned groups
	 * 
	 * Returns the whole list of groups owned by the current user
	 * */
	groups({owner}) { this.$publish('groups', {owner})}
	/**
	 * Lists rights for a group
	 * 
	 * This API lists explicitly configured rights.
	 * Effective rights include configured rights, implicit rights and inherited rights.
	 * */
	listGrants({group,owner}) { this.$publish('listGrants', {group,owner})}
	/**
	 * Lists presences for a group
	 * 
	 * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
	 * The current implementation does not include information about the particular devices users are connected with.
	 * If a user is connected twice with two different devices, two identical entries will be returned.
	 * */
	listPresences({group,owner}) { this.$publish('listPresences', {group,owner})}
	/**
	 * Tests membership
	 * 
	 * Tests whether I (the caller) am a member of the given group.
	 * This verb exists so that users can determine if they are part of a group without being granted particular rights.
	 * The 'user' field is implicitly set to the current user's key.
	 * */
	memberOf({hardFail,group,owner}) { this.$publish('memberOf', {hardFail,group,owner})}
	/**
	 * Grants rights to a group
	 * 
	 * Grant several rights at once.
	 * */
	mgrant({actions,group,owner,resource}) { this.$publish('mgrant', {actions,group,owner,resource})}
	/**Revokes rights for a group*/
	mrevoke({actions,group,owner,resource}) { this.$publish('mrevoke', {actions,group,owner,resource})}
	/**
	 * Lists the groups I am part of
	 * 
	 * Returns the whole list of groups the current user is part of.
	 * Groups may be owned by anyone, including the current user.
	 * */
	myGroups({owner}) { this.$publish('myGroups', {owner})}
	/**Revokes a right for a group*/
	revoke({action,group,owner,resource}) { this.$publish('revoke', {action,group,owner,resource})}
}
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
export class Httpclient extends Service {
	/**
	 * Get default deployment id associated to Httpclient service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'httpclient_0'
	}
	/**
	 * Makes a predefined request
	 * 
	 * Lookups a predefined request by name, and executes it.
	 * */
	call({name,requestId}) { this.$publish('call', {name,requestId})}
}
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
export class Macro extends Service {
	/**
	 * Get default deployment id associated to Macro service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'macro_0'
	}
	/**
	 * Plays a previously recorded macro
	 * 
	 * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
	 * You can override the default notification channel when defining the macro.
	 * */
	call({debug,hardFail,name,parameters}) { this.$publish('call', {debug,hardFail,name,parameters})}
}
/**
 * User API for macro debugging
 * 
 * Debugger API for macro.
 * These API verbs are not intended for use by most developers.
 * @access public
 * */
export class MacroDebug extends Service {
	/**
	 * Get default deployment id associated to MacroDebug service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'macro_0'
	}
	/**Enables or disables a breakpoint*/
	breakpoint({breakpoint,enabled,token}) { this.$publish('breakpoint', {breakpoint,enabled,token})}
	/**Requests some information*/
	info({exp,frame,token}) { this.$publish('info', {exp,frame,token})}
	/**
	 * Debugs a previously recorded macro
	 * 
	 * The given breakpoints will be honored, causing a suspension of the execution, resumable via 'resume'.
	 * Only one debug session can be active at any given time.
	 * */
	livedebug({breakpoints,debug,hardFail,name,parameters,token}) { this.$publish('livedebug', {breakpoints,debug,hardFail,name,parameters,token})}
	/**Resumes a paused macro*/
	resume({token,type}) { this.$publish('resume', {token,type})}
	/**Sets a variable value*/
	variable({data,frame,name,token}) { this.$publish('variable', {data,frame,name,token})}
}
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
export class Sendmail extends Service {
	/**
	 * Get default deployment id associated to Sendmail service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'sendmail_0'
	}
}
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
export class Messaging extends Service {
	/**
	 * Get default deployment id associated to Messaging service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'messaging_0'
	}
	/**
	 * Sends a message to a target
	 * 
	 * Sends the given message to the specified target on the given (optional) channel.
	 * The administratively given default channel name is used when none is provided in the message itself.
	 * */
	send({target,channel,data}) { this.$publish('send', {target,channel,data})}
}
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
export class Queue extends Service {
	/**
	 * Get default deployment id associated to Queue service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'queue_0'
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
	call({description,originBusinessId,originDeploymentId,data,owner}) { this.$publish('call', {description,originBusinessId,originDeploymentId,data,owner})}
	/**
	 * Notifies completion of a task
	 * 
	 * Consumer API.
	 * The tasker notifies completion of the given task to the server.
	 * The tasker can optionally include a result or an error code.
	 * */
	done({result,success,taskId}) { this.$publish('done', {result,success,taskId})}
	/**
	 * Registers a consumer
	 * 
	 * Consumer API.
	 * Registers the current user resource as an available task consumer.
	 * Tasks will be then dispatched to that consumer.
	 * */
	register({capacity}) { this.$publish('register', {capacity})}
	/**
	 * Submits a task
	 * 
	 * Producer API.
	 * A task producer submits the given task to the server.
	 * The server will find a tasker with processing capacity and dispatch the task.
	 * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
	 * This verb will return immediately : you can use this API to asynchronously submit a task.
	 * */
	submit({description,originBusinessId,originDeploymentId,data,owner}) { this.$publish('submit', {description,originBusinessId,originDeploymentId,data,owner})}
	/**
	 * Unregisters a consumer
	 * 
	 * Consumer API.
	 * Unregisters the current user resource as an available task consumer.
	 * All non finished tasks are returned to the server.
	 * */
	unregister() { this.$publish('unregister', {})}
}
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
export class Notif extends Service {
	/**
	 * Get default deployment id associated to Notif service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'notif_0'
	}
}
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
export class Sms_ovh extends Service {
	/**
	 * Get default deployment id associated to Sms_ovh service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'sms_ovh_0'
	}
}
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
export class Cron extends Service {
	/**
	 * Get default deployment id associated to Cron service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'cron_0'
	}
	/**
	 * List the configured tasks
	 * 
	 * Returns a paginated list of the asking user's tasks.
	 * */
	list({owner,page,start,stop}) { this.$publish('list', {owner,page,start,stop})}
	/**
	 * Removes a scheduled task
	 * 
	 * Removes a previously scheduled task.
	 * Does absolutely nothing if asked to remove a non-existent task.
	 * */
	unschedule({cronName,owner}) { this.$publish('unschedule', {cronName,owner})}
}
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
export class Search extends Service {
	/**
	 * Get default deployment id associated to Search service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'search_0'
	}
	/**
	 * Deletes data
	 * 
	 * Deletes a document from the elasticsearch engine by id.
	 * */
	delete({id,index,type}) { this.$publish('delete', {id,index,type})}
	/**
	 * Gets data
	 * 
	 * Retrieves a document from the elasticsearch engine by id.
	 * */
	get({id,index,type}) { this.$publish('get', {id,index,type})}
	/**
	 * Indexes data
	 * 
	 * Inserts or updates a document into the elasticsearch engine.
	 * */
	index({data,id,index,type}) { this.$publish('index', {data,id,index,type})}
	/**Searches for data*/
	search({indices,page,query,sort,types}) { this.$publish('search', {indices,page,query,sort,types})}
}
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
export class Template extends Service {
	/**
	 * Get default deployment id associated to Template service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'template_0'
	}
	/**
	 * Evaluates a template
	 * 
	 * Evaluates the given template and returns the result as a string.
	 * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
	 * */
	evaluate({data,languageTag,name,requestId}) { this.$publish('evaluate', {data,languageTag,name,requestId})}
}
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
export class Zpfs_s3 extends Service {
	/**
	 * Get default deployment id associated to Zpfs_s3 service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'zpfs_s3_0'
	}
	/**
	 * Copies a file
	 * 
	 * Copies a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	cp({oldPath,owner,path}) { this.$publish('cp', {oldPath,owner,path})}
	/**
	 * Returns disk usage
	 * 
	 * Returns an recursively aggregated number of used bytes, starting at the given path.
	 * */
	du({owner,path}) { this.$publish('du', {owner,path})}
	/**
	 * Links a file
	 * 
	 * Links a file or folder to another location.
	 * May fail if the target location is not empty.
	 * */
	link({oldPath,owner,path}) { this.$publish('link', {oldPath,owner,path})}
	/**
	 * Lists a folder content
	 * 
	 * Returns a paginated list of the folder's content.
	 * */
	ls({folder,owner,page}) { this.$publish('ls', {folder,owner,page})}
	/**
	 * Creates a folder
	 * 
	 * Creates a new folder.
	 * May fail if the target location is not empty.
	 * */
	mkdir({folder,owner,parents}) { this.$publish('mkdir', {folder,owner,parents})}
	/**
	 * Moves a file
	 * 
	 * Moves a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	mv({oldPath,owner,path}) { this.$publish('mv', {oldPath,owner,path})}
	/**
	 * Notifies of upload completion
	 * 
	 * The client application calls this verb to notify that it's done uploading to the cloud.
	 * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
	 * */
	newFile({guid,metadata,owner,tags}) { this.$publish('newFile', {guid,metadata,owner,tags})}
	/**
	 * Requests an upload URL
	 * 
	 * Requests an HTTP upload URL.
	 * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
	 * */
	newUploadUrl({contentType,owner,path}) { this.$publish('newUploadUrl', {contentType,owner,path})}
	/**
	 * Removes a file
	 * 
	 * Removes a file or folder (recursively).
	 * */
	rm({owner,path}) { this.$publish('rm', {owner,path})}
	/**
	 * Returns information about a file
	 * 
	 * Returns information about a single file.
	 * The entry field will be null if the path does not exist
	 * */
	stat({owner,path}) { this.$publish('stat', {owner,path})}
	/**Updates a file's metadata*/
	updateMeta({metadata,metadataFiles,owner,path}) { this.$publish('updateMeta', {metadata,metadataFiles,owner,path})}
}
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
export class Zpfs_hdfs extends Service {
	/**
	 * Get default deployment id associated to Zpfs_hdfs service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'zpfs_hdfs_0'
	}
	/**
	 * Copies a file
	 * 
	 * Copies a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	cp({oldPath,owner,path}) { this.$publish('cp', {oldPath,owner,path})}
	/**
	 * Returns disk usage
	 * 
	 * Returns an recursively aggregated number of used bytes, starting at the given path.
	 * */
	du({owner,path}) { this.$publish('du', {owner,path})}
	/**
	 * Links a file
	 * 
	 * Links a file or folder to another location.
	 * May fail if the target location is not empty.
	 * */
	link({oldPath,owner,path}) { this.$publish('link', {oldPath,owner,path})}
	/**
	 * Lists a folder content
	 * 
	 * Returns a paginated list of the folder's content.
	 * */
	ls({folder,owner,page}) { this.$publish('ls', {folder,owner,page})}
	/**
	 * Creates a folder
	 * 
	 * Creates a new folder.
	 * May fail if the target location is not empty.
	 * */
	mkdir({folder,owner,parents}) { this.$publish('mkdir', {folder,owner,parents})}
	/**
	 * Moves a file
	 * 
	 * Moves a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	mv({oldPath,owner,path}) { this.$publish('mv', {oldPath,owner,path})}
	/**
	 * Notifies of upload completion
	 * 
	 * The client application calls this verb to notify that it's done uploading to the cloud.
	 * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
	 * */
	newFile({guid,metadata,owner,tags}) { this.$publish('newFile', {guid,metadata,owner,tags})}
	/**
	 * Requests an upload URL
	 * 
	 * Requests an HTTP upload URL.
	 * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
	 * */
	newUploadUrl({contentType,owner,path}) { this.$publish('newUploadUrl', {contentType,owner,path})}
	/**
	 * Removes a file
	 * 
	 * Removes a file or folder (recursively).
	 * */
	rm({owner,path}) { this.$publish('rm', {owner,path})}
	/**
	 * Returns information about a file
	 * 
	 * Returns information about a single file.
	 * The entry field will be null if the path does not exist
	 * */
	stat({owner,path}) { this.$publish('stat', {owner,path})}
	/**Updates a file's metadata*/
	updateMeta({metadata,metadataFiles,owner,path}) { this.$publish('updateMeta', {metadata,metadataFiles,owner,path})}
}
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
export class Zpfs_s3compat extends Service {
	/**
	 * Get default deployment id associated to Zpfs_s3compat service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'zpfs_s3compat_0'
	}
	/**
	 * Copies a file
	 * 
	 * Copies a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	cp({oldPath,owner,path}) { this.$publish('cp', {oldPath,owner,path})}
	/**
	 * Returns disk usage
	 * 
	 * Returns an recursively aggregated number of used bytes, starting at the given path.
	 * */
	du({owner,path}) { this.$publish('du', {owner,path})}
	/**
	 * Links a file
	 * 
	 * Links a file or folder to another location.
	 * May fail if the target location is not empty.
	 * */
	link({oldPath,owner,path}) { this.$publish('link', {oldPath,owner,path})}
	/**
	 * Lists a folder content
	 * 
	 * Returns a paginated list of the folder's content.
	 * */
	ls({folder,owner,page}) { this.$publish('ls', {folder,owner,page})}
	/**
	 * Creates a folder
	 * 
	 * Creates a new folder.
	 * May fail if the target location is not empty.
	 * */
	mkdir({folder,owner,parents}) { this.$publish('mkdir', {folder,owner,parents})}
	/**
	 * Moves a file
	 * 
	 * Moves a file or folder (recursively) to a new location.
	 * May fail if the target location is not empty.
	 * */
	mv({oldPath,owner,path}) { this.$publish('mv', {oldPath,owner,path})}
	/**
	 * Notifies of upload completion
	 * 
	 * The client application calls this verb to notify that it's done uploading to the cloud.
	 * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
	 * */
	newFile({guid,metadata,owner,tags}) { this.$publish('newFile', {guid,metadata,owner,tags})}
	/**
	 * Requests an upload URL
	 * 
	 * Requests an HTTP upload URL.
	 * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
	 * */
	newUploadUrl({contentType,owner,path}) { this.$publish('newUploadUrl', {contentType,owner,path})}
	/**
	 * Removes a file
	 * 
	 * Removes a file or folder (recursively).
	 * */
	rm({owner,path}) { this.$publish('rm', {owner,path})}
	/**
	 * Returns information about a file
	 * 
	 * Returns information about a single file.
	 * The entry field will be null if the path does not exist
	 * */
	stat({owner,path}) { this.$publish('stat', {owner,path})}
	/**Updates a file's metadata*/
	updateMeta({metadata,metadataFiles,owner,path}) { this.$publish('updateMeta', {metadata,metadataFiles,owner,path})}
}
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
export class Userdir extends Service {
	/**
	 * Get default deployment id associated to Userdir service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'userdir_0'
	}
	/**Searches for users matching the request*/
	search({page,query,requestId}) { this.$publish('search', {page,query,requestId})}
	/**Requests public data for the specified users*/
	userInfo({userKeys}) { this.$publish('userInfo', {userKeys})}
}
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
export class Delegating extends Service {
	/**
	 * Get default deployment id associated to Delegating service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'delegating_0'
	}
}
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
export class Simple extends Service {
	/**
	 * Get default deployment id associated to Simple service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'simple_0'
	}
}
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
export class Weak extends Service {
	/**
	 * Get default deployment id associated to Weak service
	 * @return {string}
	 */
	static get DEFAULT_DEPLOYMENT_ID() {
		return 'weak_0'
	}
	/**
	 * Controls a session
	 * 
	 * Takes control of a weak user session, identified by the given public token.
	 * The public token has been previously made available by the controlled device, for example by displaying a QRCode.
	 * Upon control notification, the client SDK of the controlled session is expected to re-handshake.
	 * */
	control({fullRights,publicToken}) { this.$publish('control', {fullRights,publicToken})}
	/**
	 * Releases a session
	 * 
	 * Releases control of a weak user session, identified by the given public token.
	 * The weak user session must have been previously controlled by a call to 'control'.
	 * */
	release({fullRights,publicToken}) { this.$publish('release', {fullRights,publicToken})}
}
