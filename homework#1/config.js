/*
*	Environment Variable declaration and definition of Hello World REST API
*
*/

// Declare Environment Variable
let environments = {};

// Creating and defining development property
environments.development = {
	'httpPort'  : 3000,
	'httpsPort' : 3001,
	'envName'   : 'development'
};

// Creating and defining production property
environments.production = {
	'httpPort'  : 5000,
	'httpsPort' : 5001,
	'envName'   : 'production'
};

// Get the current Environment, if not set development as default environment
let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'development';

// set the environment to export
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments['development'];

// Export the environment
module.exports = environmentToExport;