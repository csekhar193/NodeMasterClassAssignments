/*
*	Sub Handlers of orders Handler
*
*/

// Dependencies
let _tokens = require('./tokens');
let _data   = require('../data');
let helpers = require('../helpers');
let config  = require('../config');

// container for order 
let orders = {};

// Method : POST
// Required Data: email
// Optional Data: none
orders.post = function placeAnOrder (data, callback) {
	let email      = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				// get the user data for the cartId
				_data.read('users', email, (err, userData) => {
					if(!err) {
						// get the cart id
						let cartId = userData.cart;
						// read the cart data for the items
						_data.read('carts', cartId, (err, cartData) => {
							if(!err) {
								// create order container
								let orderDetails = {};
								orderDetails.id       = helpers.createRandomString(20);
								orderDetails.name     = `${userData.firstname} ${userData.lastname}`;
								orderDetails.email    = userData.email;
								orderDetails.phone    = userData.phone;
								orderDetails.address  = userData.streetAddress;
								orderDetails.items    = cartData;
								orderDetails.quantity = cartData.reduce((count, cart) => count + cart.quantity, 0);
								orderDetails.amount   = cartData.reduce((count, cart) =>  count + cart.grandTotal, 0);
								orderDetails.deliveryDate = Date.now() + (2 * ( 1000 * 60 * 60 * 24)); 
								orderDetails.createdDate  = Date.now();

								// Process payment
		                        // We'll need cc info and Stripe.com test key
		                        var stripeOptions = {
		                          'amount' : orderDetails.amount,
		                          'currency' : 'usd',
		                          'orderId' : orderDetails.id,
		                          'source' : 'tok_visa',
		                          'description' : 'Pizza Delivery Order',
		                          'token' : config.stripeToken
		                        };

		                        helpers.processPayment(stripeOptions, (err,responseData) => {
									if(!err){
										// Add credit card charge id to the order
										orderDetails.chargeId = responseData.id;
										let cartData = [];
										// truncate the cart of the user as the order is placed.
										_data.update('carts', cartId, cartData, (err) => {
											if(!err) {
												// create an order 
												_data.create('orders', orderDetails.id, orderDetails, (err) => {
													if (!err) {
														userData.orders = typeof(userData.orders) == 'object' ? userData.orders : [];
														userData.orders.push(orderDetails.id);
														// update the user data with the order id
														_data.update('users', email, userData, (err) => {
															if(!err) {
																// Email receipt to customer
																helpers.emailReceipt(orderDetails, (err) => {
																	if(!err){
																		callback(200);
																	} else {
																		callback(500,{'Error' : 'Order has been processed and paid but no email was sent'});
																	}
																});
															} else {
																callback(500, {'Error': 'Payment process is successful, but unable to update the user data'});
															}
														});
													} else {
														callback(500, {'Error': 'Payment process is successful, but unable to create a new order.'});
													}
												});
											} else {
												callback(500, {'Error': 'Payment process is successful, but unable to truncate the cart data.'});
											}
										});
									} else {
										callback(500, {'Error': 'Payment processing failed'});
									}
								});
							} else {
								callback(400, {'Error': 'Unable to read the cart data.'});
							}
						});
					} else {
						callback(400, {'Error': 'Unable to read the user data for the cart id.'});
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
orders.get = function getAllOrderDetails (data, callback) {
	let email      = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
	if (helpers.validateEmail(email)) {
		// get the tokens from the headers
		let token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
		//verify that the given token is valid for the email id
		_tokens.verifyToken(token, email, (tokenIsValid) => {
			if(tokenIsValid) {
				// get the user data for the cartId
				_data.read('users', email, (err, userData) => {
					if(!err) {
						// get order ids
						let orderIds = userData.orders;
						let orderData = [];
						orderIds
							.map(orders.getOrderDetails)
							.reduce(
								function(chain, orderPromise){
									return chain
										.then(function(){
											return orderPromise;
										})
										.then(function(data){
											orderData.push(data);
										});
								},
								Promise.resolve() 
							)
							.then(() => {
								callback(200, orderData);
							});
					} else {
						callback(400, {'Error': 'Unable to read the user data for the order id\'s.'});
					}
				});
			} else {
				callback(403, {'Error': 'Missing required token in header, or token is not valid.'});
			}
		});
	} else {
		callback(400, {'Error': 'Missing Required fields.'});
	}
}

orders.getOrderDetails = function  (id) {
	return new Promise( (resolve) => {
		// read the order details using id
		_data.read('orders', id, (err, orderDetails) => {
			if(!err && orderDetails) {
				resolve(orderDetails);
			} else {
				callback(500, {'Error': 'Unable to read the order details\'s.'});
			}
		});
	});
} 


// export the order module
module.exports = orders;