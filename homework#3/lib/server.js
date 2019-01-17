/*
*	Server File
*
*/

// Dependencies
const http          = require('http');
const https         = require('https');
const fs	        = require('fs');
const path 			= require('path');

let config 			= require('./config');
let unifiedServer   = require('./unifiedServer');

// Container for server
let server = {};

// Create the HTTPS server options
server.httpsServerOptions = {
	'key' : fs.readFileSync(path.join(__dirname, '../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
}

//Create HTTPS Server
server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
	unifiedServer.unifiedServer(req, res);
});

//Create HTTP Server
server.httpServer = http.createServer((req, res) => {
	unifiedServer.unifiedServer(req, res);
});

//init function of server
server.init = function serverStart () {
	// Listen to the HTTPS Server
	server.httpsServer.listen(config.httpsPort, () => {
		console.log('\x1b[33m%s\x1b[0m', `This app is listening on port ${config.httpsPort} in ${config.envName} mode of HTTP Server.`);

	});

	// Listen to the HTTP Server
	server.httpServer.listen(config.httpPort, () => {
		console.log('\x1b[33m%s\x1b[0m', `This app is listening on port ${config.httpPort} in ${config.envName} mode of HTTP Server.`);
	});
};

// Export the server
module.exports = server;