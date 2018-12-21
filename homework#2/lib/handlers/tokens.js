/*
*	Sub Handlers of Tokens Handler
*
*/

// Dependencies
let helpers = require('../helpers');
let _data = require('../data');

// Container of sub tokens 
let tokens = {};

// Method: POST
// Required Data: email, password
// optional data: none
tokens.post = function insertingTokenData(data, callback) {
	let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	if (helpers.validateEmail(email) && password) {
		//lookup for the user with the email id
		_data.read('users', email, function (err, userData) {
			if(!err && userData) {
				//hash the sent password and compare with the userData password
				let hashedPassword = helpers.hash(password);
				if(hashedPassword == userData.hashedPassword) {
					// if valid create a token id with random name, set expiration date 1hour
					let tokenId = helpers.createRandomString(20);
					let expires = Date.now() + 1000 * 60 * 60;
					let tokenObject = {
						email,
						id : tokenId,
						expires
					}
					//store the token 
					_data.create('tokens', tokenId, tokenObject , function(err) {
						if(!err) {
							callback(200, tokenObject);
						} else {
							callback(500, {'Error': 'Unable to create the token.'});		
						}
					});
				} else {
					callback(400, {'Error': 'Password did not match the specified user\'s stored password.'});
				}
			} else {
				callback(400, {'Error': 'The specified user does exist with the given email id.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
};

// Tokens GET
// required data: id
// optional data : none
tokens.get = function readTokenData(data, callback) {
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : '';
	if (id) {
		//lookup the token
		_data.read('tokens', id, function (err, tokenData) {
			if(!err && tokenData) {
				callback(200, tokenData);
			} else {
				callback(404, {'Error': 'The specified token data does not exists.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

// Tokens PUT
// required data: id, extend
// optional data : none
tokens.put = function (data, callback) {
	let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length > 0 ? data.payload.id.trim() : '';
	let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
	if( id && extend ) {
		// lookup for the token
		_data.read('tokens', id, function (err, tokenData) {
			if( !err && tokenData) {
				// check to make sure that token is'nt already expires
				if(tokenData.expires > Date.now()) {
					// set the expiration hour from now
					tokenData.expires = Date.now() + 1000 * 60 * 60;
					// store the new update
					_data.update('tokens', id, tokenData, function (err) {
						if( !err) {
							callback(200);
						} else {
							callback(500, {'Error': 'Unable to extend the expiration time.'});
						}
					});

				} else {
					callback(400, {'Error': 'The token has already expired, and connot be extended.'});	
				}
			} else {
				callback(400, {'Error': 'Specified Token does not exists.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

// Tokens Delete
// required data: id, extend
// optional data : none
tokens.delete = function (data, callback) {
	let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : '';
	if (id) {
		//lookup the token
		_data.read('tokens', id, function (err, tokenData) {
			if(!err && tokenData) {
				_data.delete('tokens', id, function(err) {
					if(!err) {
						callback(200);
					} else {
						callback(500, {'Error': 'Could not delete the specified token.'});		
					}
				});
			} else {
				callback(404, {'Error': 'The specified token data does not exists.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}


// verify if a given taken id is currently valid for a given user
tokens.verifyToken = function (id, email, callback) {
	// lookup the token
	_data.read('tokens', id, function (err, tokenData) {
		if (!err && tokenData) {
			if(tokenData.email == email && tokenData.expires > Date.now()) {
				return callback(true);
			} else {
				return callback(false);
			}
		} else {
			return callback(false);
		}
	});
};

// Export the modules
module.exports = tokens;
