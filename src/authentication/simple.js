/*
	ZetaPush Simple Authentication v1.0
	Javascript Simple Authentication for ZetaPush
	Mikael Morvan - 2015
	*/

;(function () {
	'use strict';

	/**
	 * Class for managing Simple Authentication.     
	 *
	 * @class Manages Simple Authentication for ZetaPush
	 */
	function zpSimpleAuthent(deploymentId) {
		_deploymentId= deploymentId;	

		zp.on('/meta/handshake', function(msg){
			if (msg.successful){
				_userId= msg.ext.authentication.userId;
				_token= msg.ext.authentication.token;
			}
		});
	}
	
	var proto = zpSimpleAuthent.prototype;
	var exports = this;
	var _userId, _token, _deploymentId;

	proto.getUserId= function(){
		return _userId;
	}

	proto.getToken= function(){
		return _token;
	}

	/*
		If parameters == 2, the first parameter is a connection token

	*/
	proto.getConnectionData= function(login, password, resource){
		var authType = zp.getBusinessId() +'.' + _deploymentId + '.' + 'simple';
		var loginData;
		var resourceName;

		if (arguments.length === 2){		
			loginData={token: login};
			resourceName= password;
		} else {
			loginData={"login": login, "password": password};
			resourceName= resource;
		}

		var handshakeData=
			{"ext":
				{
					"authentication":{
						"action":"authenticate",
						"type": authType,
						"resource": resourceName,
						"data": loginData
					}
				}
			}
		return handshakeData;
	}

	exports.zp.authent.Simple = zpSimpleAuthent;
	
}.call(this));
