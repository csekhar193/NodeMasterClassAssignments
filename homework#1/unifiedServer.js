/*
*	Create and Export Unified Server for HTTP and HTTPS Servers.
*
*/

// Dependencies
const url 			= require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let router 	 = require('./router');
let handlers = require('./handlers');

// Define Unified Server
let unifiedServer = function server (req, res) {

	// Get the Parsed URL
	const parsedURL = url.parse(req.url, true);

	// Get the Path from the parsed URL
	const path = parsedURL.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Get the request method 
	const method = req.method.toLowerCase();

	// Get the query string 
	let queryStringObject = parsedURL.query;

	// Get the Headers of the request 
	let headers = req.headers;
	let decoder = new StringDecoder('utf-8');
	let buffer  = '';

	req.on('data', (data) => {
		buffer += decoder.write(data);
	});

	req.on('end', () => {
		buffer += decoder.end();

		//Choose the handler this request should go to. If one is not found use not Found handler
		let chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		// Construct a data object to send to the handler
		let data = {
			trimmedPath,
			queryStringObject,
			method,
			headers,
			payload: buffer
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
	})

}

// Export Unified Server
module.exports = { unifiedServer };
