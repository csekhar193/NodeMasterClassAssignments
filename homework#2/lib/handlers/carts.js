/*
*	Sub Handlers of carts Handler
*
*/

// Dependencies
let _tokens = require('./tokens');
let _data = require('../data');
let helpers = require('../helpers');

//Container for the carts
let carts = {};

// Define post request
carts.post = function userCartDetails (data, callback) {
	let pizzaName  = typeof(data.payload.pizza.name) == 'string' && data.payload.pizza.name.trim().length > 0 ? data.payload.pizza.name.trim() : false;
	let type       = typeof(data.payload.pizza.type) == 'string' && data.payload.pizza.type.trim().length > 0 ? data.payload.pizza.type.trim() : false;
	let quantity   = typeof(data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;
	let size	   = typeof(data.payload.size.name) == 'string' && ['regular', 'medium', 'large'].indexOf(data.payload.size.name) > -1 ? data.payload.size.name : false;
	let toppings   = typeof(data.payload.toppings) == 'object' && data.payload.toppings.length > 0 ? data.payload.toppings : false;
	let crust	   = typeof(data.payload.crust.name) == 'string' && ['new hand tossed', 'wheat thin crust', 'cheese brust', 'fresh pan pizza', 'classic hand tossed'].indexOf(data.payload.crust.name) > -1? data.payload.crust.name : false;
	let grandTotal = typeof(data.payload.grandTotal) == 'number' && data.payload.grandTotal > 0 ? data.payload.grandTotal : false;	
	let email      = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	 	
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, function (tokenIsValid) {
			if(tokenIsValid) {
				
			} else {
				callback(403, {'Error': 'Missing required token in header, or token is not valid.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
};


//Export the carts
module.exports = carts;