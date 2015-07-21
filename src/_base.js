/*
	ZetaPush Base Class v1.0
	Javascript Base Class for ZetaPush
	Mikael Morvan - 2015
*/

;(function () {
	'use strict';

	/**
	 * Base class for all the services.     
	 *
	 * @class Base class
	 */
	function zpBase(){
	}    

	var proto = zpBase.prototype;
	var exports = this;
	var _deploymentId;
	var _subscribeKeyArray;

	proto.on= function(verb, callback){
		return zp.on(zp.generateChannel(this._deploymentId,verb), callback);
	}

	proto.off= function(value){
		zp.off(value);
	}

	proto.send= function(verb, objectParam){
		zp.send(zp.generateChannel(this._deploymentId,verb), objectParam);
	}

	proto.onError= function(callback){
		this._subscribeKeyArray.push(this.on('error', callback));
	}

	proto.releaseService= function(){
		var that= this;
		this._subscribeKeyArray.forEach(function(value, key){
			that.off(value);
		} );
	}

	exports.zp.service._base = zpBase;
	
}.call(this));
