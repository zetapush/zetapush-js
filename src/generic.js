/*
	ZetaPush Generic Service v1.0
	Javascript Generic Service for ZetaPush
	Mikael Morvan - 2015
	*/

;(function () {
	'use strict';

	/**
	 * Class for managing Generic Service.     
	 *
	 * @class Manages Generic Service for ZetaPush
	 */
	function zpGenericService(deploymentId){
		this._deploymentId= deploymentId;
		this._subscribeKeyArray=[];
	}

	zpGenericService.prototype= Object.create(zp.service._base.prototype);
	var proto = zpGenericService.prototype;
	var exports = this;	

	exports.zp.service.Generic = zpGenericService;
	
}.call(this));
