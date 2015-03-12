/*
	ZetaPushCore v1.0
	Javascript core sdk for ZetaPush
	Mikael Morvan - Mars 2015
	*/

;(function () {
	'use strict';

	/**
	 * Class for managing core functionnalities.     
	 *
	 * @class ZetaPush Manages core functionnalities
	 */
	function ZetaPush() {
	}

	// Inherits from EventEmitter
	ZetaPush.prototype= new EventEmitter();

	// Singleton for ZetaPush core
	var zp= new ZetaPush();

	var proto = ZetaPush.prototype;
	var exports = this;
	var originalGlobalValue = exports.ZetaPush;

	var cometd = $.cometd,
	_connectionData= null,
	connected = false,
	clientId,
	subscriptions = [];

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
			zp.emitEvent('ZetaPush_Connected');
			cometd.batch(function(){ 
				zp.refresh(); 
			});
		} else if (wasConnected && !connected) {
			log.warn('connection broken');
			zp.emitEvent('ZetaPush_Disconnected');
		}
	});

	cometd.addListener('/meta/disconnect', function(msg) {
		log.info('got disconnect');
		if (msg.successful) {
			connected = false;
			log.info('connection closed');
			zp.emitEvent('ZetaPush_Disconnected');
		}
	});

	cometd.addListener('/meta/handshake', function(handshake) {
		if (handshake.successful) {
			log.debug('successful handshake', handshake);
			zp.emitEvent('ZetaPush_Hanshake_Successful');
			clientId = handshake.clientId;
		}
		else {
			log.warn('unsuccessful handshake');
			zp.emitEvent('ZetaPush_Hanshake_Denied');
			clientId = null;
		}
	});

	proto.init= function(serverUrl, debugLevel){
		log.setLevel(debugLevel);
		cometd.configure({
			url: serverUrl,
			logLevel: debugLevel,
			backoffIncrement: 100,
			maxBackoff: 500,
			appendMessageTypeToURL: false
		});
	}

	proto.disconnect= function() {
		cometd.disconnect(true);
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
		disconnect();
	};

	proto.subscribe= function(key) {
		if (connected) {
			key.sub = cometd.subscribe(key.chan, key.cb);
			log.debug('subscribed', key);
		} else {
			log.debug('queuing subscription request', key);
		}
		subscriptions.push(key);
		if (key.renewOnReconnect==null)
			key.renewOnReconnect = true;

		return key;
	}

	proto.unsubscribe= function (key) {
		if (key.sub){
			cometd.unsubscribe(key.sub);
			key.sub= null;
			log.debug('unsubscribed', key);
		}
		key.renewOnReconnect = false;
	}

	proto.refresh= function() {		
		log.debug('refreshing subscriptions');
		var renew = [];
		subscriptions.forEach(function(key) {
			if (key.sub)
				cometd.unsubscribe(key.sub);
			if (key.renewOnReconnect)
				renew.push(key);
		});
		subscriptions = [];
		renew.forEach(function(key) {
			subscribe(key);
		});		
	};

	proto.publish= function(channel, data){
		if (connected){
			cometd.publish(channel, data);
		}
	};

	
	// Make an Text ID so the localStorage will be filled by something
	proto.makeResourceId= function()
	{
		var text = "";
		var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		localStorage['resource']= text;
	}

	proto.connect= function(connectionData){

		_connectionData= connectionData;
		
		cometd.handshake(connectionData);	
	};	

	proto.reconnect= function(){
		connect(_connectionData);		
	}

	/**
	 * Reverts the global {@link ZetaPush} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting ZetaPush class.
	 */
	 ZetaPush.noConflict = function noConflict() {
		exports.ZetaPush = originalGlobalValue;
		return zp;
	 };

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return zp;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = zp;
	}
	else {
		exports.zetaPush = zp;
	}
}.call(this));
