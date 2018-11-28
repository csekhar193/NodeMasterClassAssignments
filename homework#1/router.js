/*
*	Create and Export Route Object
*
*/

// Dependencies
let handlers = require('./handlers');

// Define Route Object
let route = {
	'hello': handlers.hello
}

// Export Route Object
module.exports = route;