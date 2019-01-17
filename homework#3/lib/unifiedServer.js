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
		//Choose the handler this request should go to. If one is not found use not Found handler
		let chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// if the choosen handler is within the public then use public handler as default
		chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

		// Construct a data object to send to the handler
		let data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: helpers.parseJsonToObject(buffer)
		};

		// Route the request to the handler specified in the router
		chosenHandler(data, function callback (statuscode, payload, contentType) {
			// Determine the response type
			contentType = typeof(contentType) == 'string' ? contentType : 'json';

			// use Status code call back by the handler, or default to 200
			statuscode = typeof(statuscode) == 'number' ? statuscode : 200;

			// Return the response-parts that are content-specific
			let payloadString = '';
			if(contentType == 'json') {
				res.setHeader('Content-Type' , 'application/json');
				payload = typeof(payload) == 'object' ? payload : {};
				payloadString = JSON.stringify(payload);
			}


			if(contentType == 'html') {
				res.setHeader('Content-Type' , 'text/html');
				payloadString = typeof(payload) == 'string' ? payload : {};
			}

			if(contentType == 'favicon') {
				res.setHeader('Content-Type' , 'image/x-icon');
				payloadString = typeof(payload) !== undefined ? payload : {};
			}

			if(contentType == 'css') {
				res.setHeader('Content-Type' , 'text/css');
				payloadString = typeof(payload) !== undefined ? payload : {};
			}

			if(contentType == 'png') {
				res.setHeader('Content-Type' , 'image/png');
				payloadString = typeof(payload) !== undefined ? payload : {};
			}

			if(contentType == 'jpg') {
				res.setHeader('Content-Type' , 'image/jpeg');
				payloadString = typeof(payload) !== undefined ? payload : {};
			}

			if(contentType == 'plain') {
				res.setHeader('Content-Type' , 'text/plain');
				payloadString = typeof(payload) !== undefined ? payload : {};
			}

			// Return the response-parts that are common to all content-types
			res.writeHead(statuscode);
			res.end(payloadString);

			// Log the response
			console.log(`Returning in the response with status code as ${statuscode} and payload as ${payload}`);

		});
	});
};

//Export the server
module.exports = server;