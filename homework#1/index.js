/*
*	Hello World REST API	
*	HomeWork#1
*/

//Dependencies
const http 	= require('http');
const https = require('https');
const fs 	= require('fs');	

let config        = require('./config');
let unifiedServer = require('./unifiedServer').unifiedServer;

// Create HTTPS server options
let httpsServerOptions = {
	'key'  : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
}

// Create HTTP server
const httpServer = http.createServer((req, res) => {
	unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen( config.httpPort, () => {
	console.log(`Hello World API is running on port ${config.httpPort}.`);
});

//Create HTTPS server
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
	unifiedServer(req, res);
});

//Start the HTTPS server
httpsServer.listen( config.httpsPort, () => {
	console.log(`Hello World API is running on port ${config.httpsPort}.`);
});


