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
	
	// calculate toppings price
	let toppingsPrice = (toppings && toppings.reduce((count, topping) => count + topping.price }, 0) || 0;
	// calculate total price to compare with grand total for verification
	let totalPrice = [toppingsPrice, data.payload.pizza.basePrice, data.payload.size.price, data.payload.crust.price].
					 recude((count, price) => count + price, 0);

	if (helpers.validateEmail(email) && pizzaName && quantity && size && crust && grandTotal && type && totalPrice === grandTotal) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				_data.read('users', email, (err, userData) => {
					if(!err) {
						let cartId = helpers.createRandomString(20);
						let cartObject = {
							id: cartId,
							pizzaName,
							type,
							quantity,
							size,
							toppings,
							crust,
							grandTotal
						}
						_data.create('carts', cartId, cartObject, (err) => {
							if(!err) {
								userData.carts = [];
								userData.carts.push(cartId);
								_data.update('users', email, userData, (err) => {
									if (!err) {
										callback(200);
									} else {
										callback(500, {'Error': 'Unable to update the user with the cart id.'});
									}
								});
							} else {
								callback(500, {'Error': 'Unable to create a cart for the user.'});
							}
						});
					} else {
							callback(400, {'Error': 'The specified user does exist with the given email id.'});
					}
				});			
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