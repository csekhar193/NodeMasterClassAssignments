/*
*	Sub Handlers of Menu Handler
*
*/

// Dependencies
let _tokens = require('./tokens');
let _data = require('../data');
let helpers = require('../helpers');

// Container for menu
let menu = {};

//Define get method
menu.get = function getPizzaMenuList(data, callback) {
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, function (tokenIsValid) {
			if(tokenIsValid) {
				//lookup the user
				_data.read('menu', 'menu', function (err, data) {
					if(!err && data) {
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
};

// Export the module
module.exports = menu;