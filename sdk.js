
'use strict'

(function(window) {

	// define api key and secret that only have access to the widget APIs
	var API_KEY = "";
	var SECRET = "";

	var EngageSDK = function(customer) {
		// note: load widget configuration for the customer
	};

	EngageSDK.prototype.getAgentCollection = function(category) {
		// todo: load agents by category if provided or all agents if not provided
	}

	EngageSDK.prototype.drawWidget = function(type) {
		switch(type) {
			case "toolbar":
			default:
				// todo: output widget
				break;
		}
	}

	// find script and look for config; if found init script
	var currentScript = document.currentScript;
	if(currentScript != null) {
		currentScript = document.querySelector('script[data-customer-hash]')
	}
	var customerHash = currentScript.getAttribute('data-customer-hash');
	if(customerHash != null) {
		var engage = new EngageSDK(customerHash);
		engage.getAgentCollection(currentScript.getAttribute('data-category'));
		engage.drawWidget(currentScript.getAttribute('data-widget-type'));
	}

	window.EngageSDK = EngageSDK;

})(window);