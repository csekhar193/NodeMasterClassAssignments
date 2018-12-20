/*
*	Route File
*
*/

//Dependencies
let handlers = require('../lib/handlers/handlers');

// Container for the router
let router = {
	'ping'  : handlers.ping,
	'users' : handlers.users,
	'tokens': handlers.tokens,
	'menu'  : handlers.menu,
	'carts' : handlers.carts
};


// Export the route
module.exports = router;
