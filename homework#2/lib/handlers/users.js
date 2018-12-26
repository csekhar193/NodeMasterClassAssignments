/*
*	Sub Handlers of Users Handler
*
*/

// Dependencies
let _tokens = require('./tokens');
let _data = require('../data');
let helpers = require('../helpers');

// Container of sub tokens 
let users = {};

// Method: POST
// Required Data: firstname, lastname, email, phone, password, streetaddress
// optional data: none
users.post = function insertingProfileData(data, callback) {
	let firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
	let lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
	let email =typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
	let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	let streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;

	if( firstname && lastname && helpers.validateEmail(email) && phone && password && streetAddress) {
		_data.read('users', email, function (err, fileData) {
			if( err ) {
				// create new cart for the user
				let cartId = helpers.createRandomString(20);
				let cartObject = [];
				_data.create('carts', cartId, cartObject, (err) => {
					if(!err) {
						// Hash the password
						let hashedPassword = helpers.hash(password);
						if (hashedPassword) {
							let postData = {
								firstname,
								lastname,
								email,
								phone,
								hashedPassword,
								streetAddress,
								cart: cartId
							}
							// create the user with the given details
							_data.create('users', email, postData, function (err) {
								if(!err) {
									callback(200);
								} else {
									console.log(err);
									callback(500, {'Error': 'Could not create the new user.'});
								}
							});
						} else {
							callback(400, {'Error': 'Unable to hash the password.'});
						}	
					} else {
						callback(500, {'Error': 'Unable to create a cart for the user.'});
					}
				});

			} else {
				callback(400, {'Error': 'A User with that phone number all ready exits.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
};

// Users GET
// required data: none
// optional data : none
users.get = function readingProfileData (data, callback) {
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, function (tokenIsValid) {
			if(tokenIsValid) {
				//lookup the user
				_data.read('users', email, function (err, data) {
					if(!err && data) {
						// Removed the hashed password from the data.
						delete data.hashedPassword;
						callback(200, data);
					} else {
						callback(404);
					}
				});
			} else {
				callback(403, {'Error': 'Missing required token in header, or token is not valid.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

// Users PUT
// required data: firstname or lastname or password or phone or streetAddress
// optional data : none
users.put = function modifyProfileData (data, callback) {
	//check for the required field
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// check for the optional fields
		let firstname = typeof(data.payload.firstname) == 'string' && data.payload.firstname.trim().length > 0 ? data.payload.firstname.trim() : false;
		let lastname = typeof(data.payload.lastname) == 'string' && data.payload.lastname.trim().length > 0 ? data.payload.lastname.trim() : false;
		let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
		let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
		let streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
		// Error if nothing is sent for update	
		if ( firstname || lastname || password || phone || streetAddress) {
			// get the tokens from the headers
			let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
			//verify that the given token is valid for the email id
			_tokens.verifyToken(token, email, function (tokenIsValid) {
				if(tokenIsValid) {
					//lookup for user
					_data.read('users', email, function (err, userData) {
						if (!err && userData) {
							if (firstname) {
								userData.firstname = firstname;
							}
							if (lastname) {
								userData.lastname = lastname;
							}
							if (password) {
								userData.hashedPassword = helpers.hash(password);
							}
							if (phone) {
								userData.phone = phone;
							}
							if (streetAddress) {
								userData.streetAddress = streetAddress;
							}
							// update the user
							_data.update('users', email, userData, function (err) {
								if(!err) {
									callback(200);
								} else {
									callback(500, {'Error': 'Unable to update the user.'});
								}
							});
						} else {
							callback(400, {'Error': 'The specified user does not exists.'});
						}
					});
				} else {
					callback(403, {'Error': 'Missing required token in header, or token is not valid.'});
				}
			});
		} else {
			callback(400, {'Error': 'Missing fields to update.'});
		}
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

// Users DELETE
// required data: none
// optional data : none
users.delete = function delereProfileData (data, callback) {
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, function (tokenIsValid) {
			if(tokenIsValid) {
				//lookup the user
				_data.read('users', email, function (err, userData) {
					if(!err && data) {
						let cartId = userData.cart;
						// delete the cart related to the user
						_data.delete('carts', cartId, function (err) {
							if(!err) {
								// delete the user
								_data.delete('users', email, function (err) {
									if (!err) {
										callback(200);
									} else {
										callback(500, {'Error' : 'Unable to delete the user.'})
									}
								});
							} else {
								callback(500, {'Error' : 'Unable to delete the user cart.'})
							}
						});
					} else {
						callback(404, {'Error': 'The specified user does not exists to delete.'});
					}
				});
			} else {
				callback(403, {'Error': 'Missing required token in header, or token is not valid.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

// Export the users module
module.exports = users;
