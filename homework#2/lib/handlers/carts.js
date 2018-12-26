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


// Method : PUT
// Required Data: pizzaName, type, quantity, size, crust, grandTotal
// Optional Data: toppings
carts.put = function updateCartData (data, callback) {
	let pizzaName  = typeof(data.payload.pizza.name) == 'string' && data.payload.pizza.name.trim().length > 0 ? data.payload.pizza.name.trim() : false;
	let type       = typeof(data.payload.pizza.type) == 'string' && data.payload.pizza.type.trim().length > 0 ? data.payload.pizza.type.trim() : false;
	let quantity   = typeof(data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;
	let size	   = typeof(data.payload.size.name) == 'string' && ['regular', 'medium', 'large'].indexOf(data.payload.size.name) > -1 ? data.payload.size.name : false;
	let toppings   = typeof(data.payload.toppings) == 'object' && data.payload.toppings.length > 0 ? data.payload.toppings : false;
	let crust	   = typeof(data.payload.crust.name) == 'string' && ['new hand tossed', 'wheat thin crust', 'cheese brust', 'fresh pan pizza', 'classic hand tossed'].indexOf(data.payload.crust.name.toLowerCase()) > -1? data.payload.crust.name : false;
	let grandTotal = typeof(data.payload.grandTotal) == 'number' && data.payload.grandTotal > 0 ? data.payload.grandTotal : false;	
	let email      = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	
	// calculate toppings price
	let toppingsPrice = (toppings && toppings.reduce( (count, topping) => count + topping.price , 0))   || 0;
	// calculate total price to compare with grand total for verification
	let totalPrice = [toppingsPrice, data.payload.pizza.basePrice, data.payload.size.price, data.payload.crust.price].
					 reduce((count, price) => count + price, 0);

	if (helpers.validateEmail(email) && pizzaName && quantity && size && crust && grandTotal && type && totalPrice === grandTotal) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				_data.read('users', email, (err, userData) => {
					if(!err) {
						let cartId = userData.cart;
						// Get the cart Data
						_data.read('carts', cartId, (err, cartData) => {
							if(!err && cartData) {
								let cartProductId = helpers.createRandomString(20);
								let cartObject = {
									id: cartProductId,
									pizzaName,
									type,
									size,
									toppings,
									crust,
									quantity,
									grandTotal
								}
								cartData.push(cartObject);
								_data.update('carts', cartId, cartData, (err) => {
									if(!err) {
										callback(200);
									} else {
										callback(500, {'Error': 'Unable to create a cart for the user.'});
									}
								});
							} else {
								callback(400, {'Error': 'Unable to read the cart data.'});
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

// Method : GET
// Required Data: email
// Optional Data: none
carts.get = function getCartData(data, callback) {
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				//lookup the user
				_data.read('users', email, (err, data) => {
					if(!err && data) {
						cartId = data.cart;
						_data.read('carts', cartId, (err, data) => {
							if(!err && data) {
								callback(200, data);
							} else {
								callback(404)
							}
						});
					} else {
						callback(500, {'Error': 'Unable to read the user data.'});
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

// Method : Delete
// Required Data: email, id(cartProductId)
// Optional Data: none
carts.delete = function deleteCartData(data, callback) {
	let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	let cartProductId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length > 0 ? data.queryStringObject.id.trim() : false;
	if (helpers.validateEmail(email) && cartProductId) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				//lookup the user
				_data.read('users', email, (err, userData) => {
					if(!err && userData) {
						cartId = userData.cart;
						_data.read('carts', cartId, (err, cartData) => {
							if(!err && cartData) {
								let newCartData = cartData.filter((cart) => cart.id != cartProductId);
								_data.update('carts', cartId, newCartData, (err) => {
									if(!err) {
										callback(200);
									} else {
										callback(500, {'Error': 'Unable to Delete a product from the cart.'});
									}
								});
							} else {
								callback(500, {'Error': 'Unable to read the cart data.'});
							}
						});
					} else {
						callback(500, {'Error': 'Unable to read the user data.'});
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