/*
*	Helper methods and properties
*
*/

// Dependencies
const crypto = require('crypto');
const https  = require('https');
const path   = require('path');
const fs 	 = require('fs');
const querystring   = require('querystring');
const StringDecoder = require('string_decoder').StringDecoder;

let config  = require('./config');

// container for helper
let helpers = {};

// Create sha256 hash
helpers.hash = function (str) {
	if(typeof(str) == 'string' && str.length > 0) {
		let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
}

// Parse JSON to object
helpers.parseJsonToObject = function (payload) {
	try {	
		let obj = JSON.parse(payload);
		return obj;
	} catch (e) {
   		return {};
	}
}

// Validate email
helpers.validateEmail = function (email) {
	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());	
}

// Create a random token with the give length
helpers.createRandomString = function (stringLength) {
	stringLength = typeof(stringLength) == 'number' && stringLength > 0 ? stringLength : false;
	if( stringLength ) {
		// Define all the possible characters that could go into a string
		let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		// start the final string
		let str = '';

		for (let i = 1;  i <= stringLength; i++ ) {
			let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
			str += randomCharacter;
		}
		// return the final string
		return str;
	} else {
		return false;
	}
}

// Get the string content of a template
helpers.getTemplate = function (templateName, data, callback) {
	templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
	data = typeof(data) == 'object' && data !== null ? data : {};
	if(templateName){
		let templateDir = path.join(__dirname, '../templates/');
		fs.readFile(`${templateDir}${templateName}.html`, 'utf8', (err, str) => {
			if(!err && str && str.length > 0 ) {
				// Do interpolation on the string
				let finalString = helpers.interpolate(str, data);
				callback(false, finalString);
			} else {
				callback('No template could be found.');
			}
		}); 
	} else {
		callback('A valid template name was not specified');
	}
};

// Add the universal header and footer to a string and pass provided data object to interpolate function to fill the data.
helpers.addUniversalTemplates = function (str, data, callback) {
	str = typeof(str) == 'string' && str.length > 0 ? str : '';
	data = typeof(data) == 'object' && data !== null ? data : {};
	// Get the header
	helpers.getTemplate('_header', data, function(err, headerString) {
		if(!err && headerString) {
			// Get the footer
			helpers.getTemplate('_footer', data, function(err, footerString) {
				if(!err && footerString) {
					// Add them all together
					let fullString = headerString+str+footerString;
					callback(false, fullString);
				} else {	
					callback('Could not find the footer template');
				}
			});
		} else {
			callback('Could not find the header template');
		}
	});
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = function (str, data) {
	str = typeof(str) == 'string' && str.length > 0 ? str : '';
	data = typeof(data) == 'object' && data !== null ? data : {};

	// Add the templatedGlobals do the data object, prepending their key name with "globals"
	for (let keyName in config.templatedGlobals) {
		if(config.templatedGlobals.hasOwnProperty(keyName)){
			data['global.'+keyName] = config.templatedGlobals[keyName];
		}
	}
	console.log(data);
	// For each key in the data object, insert its value into the string at the correct placeholder
	for (let key in data) {
		if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
			let replace = data[key];
			let find = '{'+key+'}';
			str = str.replace(find, replace);
		}
	}
	return str;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = function(fileName, callback) {
	fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
	if(fileName) {
		let publicDir = path.join(__dirname, '/../public/');
		fs.readFile(publicDir+fileName, function(err, data) {
			if(!err && data) {
				callback(false, data);
			} else {
				callback('No file could be found');
			}
		});
	} else {
		callback('A valid file name was not specified.');
	}
};

// Create a payment process
helpers.processPayment = function (data, callback) {
	// validate the data
	let amount = typeof(data.amount) == 'number' && data.amount > 0 ? data.amount : false;
	let currency = typeof(data.currency) == 'string' && data.currency.trim().length === 3 ? data.currency.trim() : false;
	let token = typeof(data.token) == 'string' && data.token.trim().length > 0 ? data.token : false;
	let orderId = typeof(data.orderId) == 'string' && data.orderId.length > 0 ? data.orderId : false;
	let description = typeof(data.description) == 'string' && data.description.trim().length > 0 ? data.description.trim() : '';
	let source = typeof(data.source) == 'string' && data.source.trim().length > 0 ? data.source.trim() : false;

	// Check for all required data
	if(amount && currency && token && orderId && source && description) {
		// Create the request payload
		let payload = {
			amount,
			currency,
			source,
			description,
			'metadata[order_id]' : orderId
		};
		let stringPayload = querystring.stringify(payload);

		// Create the request details
		let requestDetails = {
			'protocol' : 'https:',
			'hostname' : 'api.stripe.com',
			'path' : '/v1/charges',
			'method' : 'POST',
			'auth' : token,
			'headers' : {
				'Content-Type' : 'application/x-www-form-urlencoded',
				'Content-Length' : Buffer.byteLength(stringPayload)
			}
		};

		// Instantiate the request
		let req = https.request(requestDetails, (response) => {
			// Get the status of the sent request
			let status = response.statusCode;
			let buffer = '';
			let decoder = new StringDecoder('utf-8');

			response.on('data', (chunk) => {
				buffer += decoder.write(chunk);
			});

			response.on('end', () => {
				buffer += decoder.end();
				// Callback false (no error) if successful or send message with status code if not
				if(status == 200 || status == 201){
				  callback(false, helpers.parseJsonToObject(buffer));
				} else {
				  callback(true, helpers.parseJsonToObject(buffer));
				}
			});
		});

		// Bind to error code so error doesn't get thrown
		req.on('error', (err) => {
			callback(err);
		});

		// Add the payload to the request
		req.write(stringPayload);

		// End/send the request
		req.end();

	} else {
		callback('Missing or invalid parameters');
	}
};

// Send email receipts using the MailGun API
helpers.emailReceipt = function(orderData,callback){
	let date = new Date(1970, 0, 1); 
    date.setSeconds(orderData.deliveryDate);
	let amount = orderData.amount;
	let orderNumber = orderData.id;
	let requestedDeliveryTime = date;
	let to = orderData.email;
	let from = 'Mailgun Sandbox <'+config.mailgun.from+'>';


	if(amount && orderNumber && requestedDeliveryTime && to && from) {

		// Create the request payload
		let message = 'Thank you for your order!!!\n\n';
		message += 'Order Number: '+orderNumber+'\n';
		message += 'Order Date: '+orderData.orderDate+'\n';
		if(requestedDeliveryTime != 'N/A'){
			message += 'Requested Delivery Time: '+requestedDeliveryTime+'\n';
		}
		message += 'Amount: '+ amount.toLocaleString("en-US", {style:"currency", currency:"USD"})+'\n\n';

		let payload = {
			to,
			from,
			amount,
			orderNumber,
			'deliveryDateTime' : requestedDeliveryTime,
			'subject' : 'Pizza Delivery Receipt',
			'text': message
		};
		
		let stringPayload = querystring.stringify(payload);
		
		// Create the request details
		let requestDetails = {
			'protocol': 'https:',
			'hostname': 'api.mailgun.net',
			'path': '/v3/' + config.mailgun.domain + '/messages',
			'method': 'POST',
			'auth': 'api:' + config.mailgun.token,
			'headers': {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(stringPayload),
			}
		};

		// Instantiate the request
		let req = https.request(requestDetails, (response) => {
			// Get the status of the sent request
			let status = response.statusCode;
			let buffer = '';
			let decoder = new StringDecoder('utf-8');

			response.on('data', (chunk) => {
				buffer += decoder.write(chunk);
			});

			response.on('end', () => {
				buffer += decoder.end();
				// Callback false (no error) if successful or send message with status code if not
				if(status == 200 || status == 201){
				  	callback(false);
				} else {
				  	callback(helpers.parseJsonToObject(buffer));
				}
			});
		});

		// Bind to error code so error doesn't get thrown
		req.on('error', (e) => {
			callback(e);
		});

		// Add the payload to the request
		req.write(stringPayload);

		// End/send the request
		req.end();

	} else {
		callback('Missing or invalid parameters');
	}
};

// Export the helper
module.exports = helpers;