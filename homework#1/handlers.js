/*
*	Create and Export Handlers Object
*
*/

// Define the Handler
var handlers = {};

// Define hello Handler
handlers.hello = function(data, callback) {
	//Callback a http Status Code and a payload object
	callback(200, {
		'message' : 'Welcome to Hello World API'
	});
}

// Define Not Found Handler
handlers.notFound = function(data, callback) {
	callback(404);
}

// Export Handlers
module.exports = handlers;