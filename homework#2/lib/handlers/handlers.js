/*
*	Create and defination of the handlers
*
*/

// Dependencies
let _users = require('./users');
let _tokens = require('./tokens');

// Container for the handlers
let handlers = {};

// Handlers for tokens
handlers.users = function profile (data, callback) {
	let availableMethods = ['get', 'post', 'put', 'delete'];
	if(availableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {
		callback(405)
	}
};

// Handlers for tokens
handlers.tokens = function authorization (data, callback) {
	let availableMethods = ['get', 'post', 'put', 'delete'];
	if(availableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback);
	} else {
		callback(405)
	}
};

// sub Handlers
handlers._users = _users;
handlers._tokens = _tokens;


// ping Handler for testing
handlers.ping = function testRoute (data, callback) {
	callback(200);
};

// not Found route
handlers.notFound = function notARoute (data, callback) {
	callback(404);
};



// Export the handlers
module.exports = handlers;