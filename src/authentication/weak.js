/*
	ZetaPush Weak Authentication v1.0
	Javascript Weak Authentication for ZetaPush
	Mikael Morvan - 2015
	*/

;(function () {
	'use strict';

	/**
	 * Class for managing Weak Authentication.     
	 *
	 * @class Manages Weak Authentication for ZetaPush
	 */
	function zpWeakAuthent(deploymentId) {
		_deploymentId= deploymentId;	

		_authType = zp.getBusinessId() +'.' + _deploymentId + '.' + 'weak';
		zp.on('/meta/handshake', function(msg){
			if (msg.successful){
				_token= msg.ext.authentication.token;
				_publicToken= msg.ext.authentication.publicToken;
				_userId= msg.ext.authentication.userId;
			}
		});	

		zp.on(zp.generateChannel(_deploymentId,'control'), function(msg){
			console.log("control", msg);
			// Receive a control demand
			// must reconnect
			if (zp.isConnected(_authType))
				zp.reconnect();
		});

		zp.on(zp.generateChannel(_deploymentId,'release'), function(msg){
			console.log("release", msg);
			// Receive a release control demand
			// must reconnect
			if (zp.isConnected(_authType))
				zp.reconnect();
		});
	}    
	
	var proto = zpWeakAuthent.prototype;
	var exports = this;
	// These 2 token are usefull to reconnect with the same Id on the server
	var _token, _publicToken;
	// This token is the id of the user
	var _userId, _authType, _deploymentId;	

	proto.getConnectionData= function(token, resource){
		
		var loginData= {"token": token};
		
		if (_token){
			loginData= {"token": _token};
		}

		var handshakeData=
			{"ext":
				{
					"authentication":{
						"action":"authenticate",
						"type": _authType,
						"resource": resource,
						"data": loginData
					}
				}
			}
		return handshakeData;
	}

	proto.getUserId= function(){
		return _userId;		
	}
	
	proto.getToken= function(){
		return _token;
	}

	proto.getPublicToken= function(){
		return _publicToken;
	}

	proto.getQRCodeUrl= function(publicToken){
		return zp.getRestServerUrl()+'/'+zp.getBusinessId()+'/'+_deploymentId+'/weak/qrcode/'+publicToken;
	}

	exports.zp.authent.Weak = zpWeakAuthent;
	
}.call(this));
