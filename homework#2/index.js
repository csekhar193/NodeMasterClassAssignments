/*
* Primary file for the application
*
*/

// Dependencies
let server = require('./lib/server');

// Container for the application
let app = {};


//INIT function
app.init = function start () {
	// Start the server
	server.init();
};

// Execute the init function
app.init();

// Export the app module
module.exports = app;