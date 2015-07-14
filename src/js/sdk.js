define("EngageSDK", ["engage/services/ServiceQueue"],
	function(ServiceQueue) {

		'use strict';

		// var ServiceQueue = require("engage/services/ServiceQueue");
		ServiceQueue.getInstance();

		// define api key and secret that only have access to the widget APIs
		if(!window.engageConfig) window.engageConfig = {
			API_KEY: "9h23gk87234ysd7f9234hjksdf89234",
			SECRET: "902340ulsdknzl23ljag07234asdf03952lkds"
		};

		var EngageSDK = function(customerHash) {
			this.customerHash = customerHash;
			// todo: initialize browser preview and start tracking the user
		};

		EngageSDK.prototype.getAgentCollection = function(categorySlug) {
			// todo: load agents by category if provided or all agents if not provided
		}

		EngageSDK.prototype.drawWidgetByType = function(type) {
			switch(type) {
				case "toolbar":
				default:
					// todo: output widget
					break;
			}
		}

		EngageSDK.prototype.drawWidgetByConfig = function(configId) {
			// note: load widget configuration for the customer
		}

		// find script and look for config; if found init script
		var currentScript = document.currentScript;
		if(currentScript != null) {
			currentScript = document.querySelector("script[data-customer-hash]")
		}
		if(currentScript != null) {
			var customerHash = currentScript.getAttribute("data-customer-hash");
			if(customerHash != null) {
				var engage = new EngageSDK(customerHash);
				var widgetConfig = currentScript.getAttribute("data-widget-config");
				if(widgetConfig) {
					engage.drawWidgetByConfig(widgetConfig);
				}else {
					engage.getAgentCollection(currentScript.getAttribute("data-category"));
					engage.drawWidgetByType(currentScript.getAttribute("data-widget-type"));
				}
				
			}
		}

		console.log(window);

		// window.EngageSDK = EngageSDK;

		return EngageSDK;

	});