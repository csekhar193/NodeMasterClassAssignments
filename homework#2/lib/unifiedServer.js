/*
*	The requested routes are handled by this unified Server function and return the payload according to the requested route
* 
*/

// Dependencies
const url 	        = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let handlers 		= require('./handlers/handlers');
let helpers 		= require('./helpers');
let router			= require('../routes/router');

// Container for the unified Server
let server = {};

// Create unified server function
server.unifiedServer = (req, res) => {
	// parse the requested url
	const parsedUrl   = url.parse(req.url, true);
	const path 	      = parsedUrl.pathname;

	//trim the unwanted slashes
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');
	
	// Get the query String 
	let queryStringObject = parsedUrl.query;
	
	// Get the method 
	const method = req.method.toLowerCase();

	// Get the Headers
	let headers = req.headers;

	// initialise the decoder
	let decoder = new StringDecoder('utf-8');
	let buffer 	= '';

	req.on('data', (data) => {
		buffer += decoder.write(data);
	});

	req.on('end', () => {
		buffer += decoder.end();
		console.log(trimmedPath);
		console.log(router[trimmedPath]);
		//Choose the handler this request should go to. If one is not found use not Found handler
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct a data object to send to the handler
		let data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: helpers.parseJsonToObject(buffer)
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, function callback (statuscode, payload) {
			// use Status code call back by the handler, or default to 200
			statuscode = typeof(statuscode) == 'number' ? statuscode : 200;

			// use the payload called back by the handler, or default to empty object
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload to a string
			let payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('Content-Type' , 'application/json');
			res.writeHead(statuscode);
			res.end(payloadString);

			// Log the response
			console.log(`Returning the response with status code as ${statuscode} and payload as ${payloadString}`);

		});
	});
};

//Export the server
module.exports = server;