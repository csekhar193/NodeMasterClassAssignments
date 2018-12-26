/*
*	Configuration file of the application
*
*/

// Create Container of the config
let environmentVariable = {};

// Add the development property to environmentVarable
environmentVariable.development = {
	'httpPort' : 3000,
	'httpsPort' : 3001,
	'envName' : 'development',
	'hashingSecret' : 'ThisIsASecret', 
	'stripeToken': 'sk_test_ZA7Im5RCM2nh5SiDYnbFIprb:',
	'mailgun': {
		'from': 'postmaster@sandbox22be83c3bb3d424bbc0c98be806cd62a.mailgun.org',
		'domain': 'sandbox22be83c3bb3d424bbc0c98be806cd62a.mailgun.org', 
		'token': '01d712e39ab778de17067b41ca75bf72-41a2adb4-ed2e0049'
	}
}

// Add the production property to environmentVarable
environmentVariable.production = {
	'httpPort' : 5000,
	'httpsPort' : 5001,
	'envName' : 'production',
	'hashingSecret' : 'ThisIsAlsoASecret',
	'stripeToken': 'sk_test_ZA7Im5RCM2nh5SiDYnbFIprb:',
	'mailgun': {
		'from': 'postmaster@sandbox22be83c3bb3d424bbc0c98be806cd62a.mailgun.org',
		'domain': 'sandbox22be83c3bb3d424bbc0c98be806cd62a.mailgun.org', 
		'token': '01d712e39ab778de17067b41ca75bf72-41a2adb4-ed2e0049'
	}
}

// Select the appropriate property with NODE_ENV, if not set development as default selected property
let selectedProperty = typeof(environmentVariable[process.env.NODE_ENV]) == 'object' ? environmentVariable[process.env.NODE_ENV] : environmentVariable['development'];

//Export the selected property
module.exports = selectedProperty;