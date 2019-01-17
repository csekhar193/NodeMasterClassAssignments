/*
*	Route File
*
*/

//Dependencies
let handlers = require('../lib/handlers/handlers');

// Container for the router
let router = {
	''                : handlers.index,
	'account/create'  : handlers.accountCreate,
	'account/edit'    : handlers.accountEdit,
	'account/deleted' : handlers.accountDeleted,
	'session/create'  : handlers.sessionCreate,
	'session/deleted' : handlers.sessionDeleted,
	'menu/all' 		  : handlers.menuList,
	'item/info'		  : handlers.itemInfo, 	
	'cart/all'		  : handlers.cartList,
	'orders'		  : handlers.order,	

	'ping'       : handlers.ping,
	'api/users'  : handlers.users,
	'api/tokens' : handlers.tokens,
	'api/menu'   : handlers.menu,
	'api/carts'  : handlers.carts,
	'api/orders' : handlers.orders,
	'favicon.ico': handlers.favicon,
	'public'     : handlers.public
};


// Export the route
module.exports = router;
