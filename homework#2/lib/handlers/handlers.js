/*
*	Create and defination of the handlers
*
*/

// Dependencies
let _users  = require('./users');
let _tokens = require('./tokens');
let _menu   = require('./menu');
let _carts  = require('./carts');
let _orders = require('./orders');

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

// Handlers for menu
handlers.menu = function pizzaData (data, callback) {
	let availableMethods = ['get'];
	if(availableMethods.indexOf(data.method) > -1) {
		handlers._menu[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Handlers for carts
handlers.carts = function pizzaCartData (data, callback) {
	let availableMethods = ['get', 'put', 'delete'];
	if(availableMethods.indexOf(data.method) > -1) {
		handlers._carts[data.method](data, callback);
	} else {
		callback(405);
	}
};

// Handlers for orders
handlers.orders = function orderDetails (data, callback) {
	let availableMethods = ['get', 'post'];
	if(availableMethods.indexOf(data.method) > -1) {
		handlers._orders[data.method](data, callback);
	} else {
		callback(405);
	}
};

// sub Handlers
handlers._users  = _users;
handlers._tokens = _tokens;
handlers._menu	 = _menu;
handlers._carts	 = _carts;
handlers._orders = _orders;


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