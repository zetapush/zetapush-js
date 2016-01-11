/*
	ZetaPush Delegating v1.0
	Javascript Delegating Authentication for ZetaPush
	Mikael Morvan - 2015
	*/

;(function () {
	'use strict';

	/**
	 * Class for managing Delegating Authentication.     
	 *
	 * @class Manages Delegating Authentication for ZetaPush
	 */
	function zpDelegatingAuthent(deploymentId) {
		_deploymentId= deploymentId;	

		_authType = zp.getBusinessId() +'.' + _deploymentId + '.' + 'delegating';
		zp.on('/meta/handshake', function(msg){
			if (msg.successful){
				_token= msg.ext.authentication.token;				
				_userId= msg.ext.authentication.userId;
			}
		});	
		
	}    
	
	var proto = zpDelegatingAuthent.prototype;
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

	exports.zp.authent.Delegating = zpDelegatingAuthent;
	
}.call(this));
