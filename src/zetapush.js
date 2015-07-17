/*
	ZetaPushCore v1.0
	Javascript core sdk for ZetaPush
	Mikael Morvan - March 2015
*/


;(function () {
	'use strict';

	/**
	 * Class for managing core functionnalities.     
	 *
	 * @class ZetaPush Manages core functionnalities
	 */
	function ZP() {
		this.authent={};
		this.service={};
	}

	// Singleton for ZetaPush core
	var _zp= new ZP();
	var proto = ZP.prototype;
	var exports = this;
	var originalGlobalValue = exports.ZP;

	org.cometd.JSON.toJSON = JSON.stringify;
	org.cometd.JSON.fromJSON = JSON.parse;

	function _setHeaders(headersArray, headers)
	{
		if (headers)
		{
			for (var headerName in headers)
			{
				headersArray[headerName]= headers[headerName];				
			}
		}
	}

	function LongPollingTransport()
	{
		var _super = new org.cometd.LongPollingTransport();
		var that = org.cometd.Transport.derive(_super);

		that.xhrSend = function(packet)
		{
			var headers=[];
			headers['Content-Type']= 'application/json;charset=UTF-8';
			_setHeaders(headers, packet.headers);

			qwest.post(
				packet.url,
				packet.body,
				{
					async: packet.sync !== true,
					headers: headers,
					dataType: '-',
					withCredentials: true,
					timeout: 120000
				}
			)
			.then(
				packet.onSuccess
			)
			.catch(function(e,url){				
				var reason="Connection Failed for server " + url;
				packet.onError(reason, e);
			})							
		};

		return that;
	}
	
	// Bind CometD
	var cometd = new org.cometd.CometD();

	// Registration order is important.
	if (org.cometd.WebSocket)
	{
		cometd.registerTransport('websocket', new org.cometd.WebSocketTransport());
	}
	cometd.registerTransport('long-polling', new LongPollingTransport());

	var _connectionData= null,
	connected = false,
	_businessId= null,
	_clientId= null,
	_serverUrl= null, 
	_serverList=[],
	_debugLevel= null,
	subscriptions = [];

	/*
		Listeners for cometD meta channels
	*/
	cometd.addListener('/meta/connect', function(msg) {
		if (cometd.isDisconnected()) {
			connected = false;
			log.info('connection closed');
			return;
		}

		var wasConnected = connected;
		connected = msg.successful;
		if (!wasConnected && connected) { // reconnected
			log.info('connection established');
			cometd.notifyListeners('/meta/connected', msg);
			cometd.batch(function(){ 
				_zp.refresh(); 
			});
		} else if (wasConnected && !connected) {
			log.warn('connection broken');
		}
	});

	cometd.addListener('/meta/handshake', function(handshake) {
		if (handshake.successful) {
			log.debug('successful handshake', handshake);
			_clientId = handshake.clientId;
		}
		else {
			log.warn('unsuccessful handshake');
			_clientId = null;
		}
	});

	cometd.onTransportException= function(_cometd, transport){		
		if (transport==='long-polling'){
			log.debug('onTransportException for long-polling');

			// Try to find an other available server
			// Remove the current one from the _serverList array
			for (var i = _serverList.length - 1; i >= 0; i--) {
				if (_serverList[i]===_serverUrl){
					_serverList.splice(i,1);
					break;
				}
			};
			if (_serverList.length===0){
				log.info("No more server available");
			} else {
				_serverUrl= _serverList[Math.floor(Math.random()*_serverList.length)];
				cometd.configure({
					url: _serverUrl+'/strd'
				});
				log.debug('CometD Url', _serverUrl);
				setTimeout(function(){ 
					cometd.handshake(_connectionData);
				},500);
				
			}

		}
	}
	/*
		Return a Real-time server url
	*/
	function getServer(businessId, force, apiUrl, callback){
		// Get the server list from a server
		
		var headers=[];		
		headers['Content-Type']= 'application/json;charset=UTF-8';
		qwest.get(
			apiUrl + businessId,
			null,
			{
				dataType: '-',
				headers: headers,
				responseType: 'json',
				cache: true
			}
		)
		.then(function(data){
			data.lastCheck= Date.now();
			data.lastBusinessId= businessId;
			var error= null;
			_serverList= data.servers;						
			callback(error, data.servers[Math.floor(Math.random()*data.servers.length)]);
		})
		.catch(function(error,url){
			log.error("Error retrieving server url list for businessId", businessId)
			callback(error, null);
		})
		;
		
	}

	/*
		Init ZetaPush with the BusinessId of the user		
	*/
	proto.init= function(businessId, debugLevel){
		_businessId= businessId;
		if (arguments.length== 1){
			_debugLevel= 'info';
		} else {
			_debugLevel= debugLevel;
		}
		log.setLevel(_debugLevel);
	}

	/*
		Connect to ZetaPush
		connectionData must be given by an Authent Object
	*/
	proto.connect= function(connectionData, apiUrl){

		if (proto.isConnected())
			return;

		if (arguments.length === 1){			
			apiUrl= "http://api.zpush.io/";
		}

		_connectionData= connectionData;
		
		/*
			Get the server Url
		*/

		getServer(_businessId, false, apiUrl, function(error, serverUrl){
			_serverUrl= serverUrl;
				
			if (_debugLevel === 'debug')
				cometd.websocketEnabled= false;	
					
			cometd.configure({
				url: _serverUrl+'/strd',
				logLevel: _debugLevel,
				backoffIncrement: 100,
				maxBackoff: 500,
				appendMessageTypeToURL: false
			});
			
			cometd.handshake(connectionData);	
		});

	};

    proto.onConnected= function(callback){
        proto.on('/meta/connected', callback);
    }

    proto.onHandshake= function(callback){
        proto.on('/meta/handshake', callback);
    }

	proto.isConnected= function(authentType){
		if (authentType){
			return (authentType == _connectionData.ext.authentication.type) && !cometd.isDisconnected();
		}
		return !cometd.isDisconnected();
	}
	/*
		Generate a channel
	*/
	proto.generateChannel= function(deploymentId, verb){
		return '/service/' + _businessId +'/'+ deploymentId +'/'+ verb;
	}

	/*
		Generate a channel
	*/
	proto.generateMetaChannel= function( deploymentId, verb){
		return '/meta/' + _businessId +'/'+ deploymentId +'/'+ verb;
	}

	/*
		Listener for every ZetaPush and CometD events

		Args:
		1 argument: a previous key (for refresh)
		2 arguments: a topic and a callback
		4 arguments: businessId, deploymentId, verb and callback
	*/
	proto.on= function(businessId, deploymentId, verb, callback){
		// One can call the function with a key
		if (arguments.length== 1){
			var key= arguments[0];
		}
		else if (arguments.length == 2){			
			var key={};			
			key.channel= arguments[0];
			key.callback= arguments[1];
			subscriptions.push(key);
		} else if (arguments.length == 4) {
			var key={};
			key.channel= proto.generateChannel(businessId, deploymentId, verb);
			key.callback= callback;
			subscriptions.push(key);
		} else{
			throw "zetaPush.on - bad arguments";
		}

		var tokens= key.channel.split("/");
		if (tokens.length<=1){
			cometd.notifyListeners('/meta/error', "Syntax error in the channel name");
			return null;
		}
		
		if (tokens[1]=='service'){
			key.isService= true;

			if (connected) {
				key.sub = cometd.subscribe(key.channel, key.callback);
				log.debug('subscribed', key);
			} else {
				log.debug('queuing subscription request', key);
			}

		} else if (tokens[1]=='meta'){
			key.isService= false;
			key.sub= cometd.addListener(key.channel, key.callback);
		} else {
			log.error("This event can t be managed by ZetaPush", evt);
			return null;
		}
		if (key.renewOnReconnect==null)
			key.renewOnReconnect = true;

		return key;
	}

	/*
		Remove listener
	*/
	proto.off= function(key){
		if (!key || key.sub==null)
			return;

		if (key.isService){
			cometd.unsubscribe(key.sub);
			key.sub= null;
		} else {
			cometd.removeListener(key.sub);
			key.sub= null;
		}
		log.debug('unsubscribed', key);
		key.renewOnReconnect = false;
	}

	/*
		Send data
		3 params
		businessId, deploymentId, verb (no data)
		4 params
		businessId, deploymentId, verb, data
		2 params
		channel, data
	*/
	proto.send= function(businessId, deploymentId, verb, data){

		var evt, sendData;

		if ((arguments.length== 2) || (arguments.length==1)){
			evt= arguments[0];
			sendData= arguments[1];
		} 
		else if ((arguments.length==3) || (arguments.length==4)){
			evt= proto.generateChannel(businessId, deploymentId, verb);
			sendData= data;
		}

		var tokens= evt.split("/");
		if (tokens.length<=1){
			cometd.notifyListeners('/meta/error', "Syntax error in the channel name");
			return;
		}

		if (tokens[1]=='service'){
			if (connected){
				cometd.publish(evt, sendData);
			}
		} 
		else if (tokens[1]=='meta'){
			cometd.notifyListeners(evt, sendData);
		}
	}


	/*
		Disconnect ZetaPush
	*/
	proto.disconnect= function() {
		// Unsubscribe first
		/*
		subscriptions.forEach(function(value, key){
			proto.off(value);
		} );
		*/
		cometd.disconnect(true);
	}

	/*
		GetServerUrl
	*/
	proto.getServerUrl= function(){
		return _serverUrl;
	}

	proto.getRestServerUrl= function(){
		return _serverUrl+'/rest/deployed';
	}

	// http://cometd.org/documentation/cometd-javascript/subscription
	cometd.onListenerException = function(exception, subscriptionHandle, isListener, message) {
		log.error('Uncaught exception for subscription', subscriptionHandle, ':', exception, 'message:', message);
		if (isListener) {
			cometd.removeListener(subscriptionHandle);
			log.error('removed listener');
		} else {
			cometd.unsubscribe(subscriptionHandle);
			log.error('unsubscribed');
		}
		// Try not to disconnect ???
		//disconnect();
	};

	/*
		Refresh subscriptions
	*/
	proto.refresh= function() {		
		log.debug('refreshing subscriptions');
		var renew = [];
		subscriptions.forEach(function(key) {
			if (key.sub){
				if (key.isService)
					cometd.unsubscribe(key.sub)
				else
					cometd.removeListener(key.sub);
			}
			if (key.renewOnReconnect)
				renew.push(key);
		});
		//subscriptions = [];
		renew.forEach(function(key) {
			//proto.on(key.channel, key.callback);
			proto.on(key);
		});		
	};

	/*
		Make a new Resource ID
		Store it in localStorage
	*/
	proto.makeResourceId= function()
	{
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

		

	/*
		Reconnect
	*/
	proto.reconnect= function(){
		connect(_connectionData);		
	}

	/*
		getBusinessId
	*/
	proto.getBusinessId= function(){
		return _businessId;
	}

	exports.zp = _zp;
}.call(this));
