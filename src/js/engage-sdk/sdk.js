define(["require",
		"jquery",
		"engage-sdk/utils/PresenceMonitor",
        "engage-sdk/utils/UserPageTracker",
        "engage-sdk/services/BaseRESTService",
        "engage-sdk/services/ServiceQueue",
        "engage-sdk/services/GetUsersService",
        "event-dispatcher/Event",
		"headjs"],
	function(require, jQuery, PresenceMonitor, UserPageTracker, BaseRESTService, ServiceQueue, GetUsersService, Event) {

		"use strict";

		// define api key and secret that only have access to the widget APIs
		// if(!window.engageConfig) window.engageConfig = {
		// 	API_KEY: "9h23gk87234ysd7f9234hjksdf89234",
		// 	SECRET: "902340ulsdknzl23ljag07234asdf03952lkds"
		// };

		var EngageSDK = function(companyHash) {
            BaseRESTService.baseUrl = "https://wapidev.engage.co";
			this.companyHash = companyHash;
			this.presence = PresenceMonitor.getInstance();
			// todo: initialize browser preview and start tracking the user
			var userPageTracker = new UserPageTracker(companyHash);
			userPageTracker.init();

		};

		EngageSDK.prototype.getUsers = function(categorySlug, callback) {
			var getUsersService = new GetUsersService(this.companyHash, categorySlug);
            getUsersService.addEventListener(Event.RESULT, function(event) {
               callback(event.data);
            });
            ServiceQueue.getInstance().addRequest(getUsersService);
		};

		EngageSDK.prototype.drawWidget = function(config, category) {
			var sdk = this;
			// note: load widget configuration for the customer if 'config' is a string
			switch(config.type) {
				case "toolbar":
					var jsSrc = (config.js) ? config.js : "https://sdk.engage.co/toolbar.js";
					var cssSrc = (config.css) ? config.css : "https://sdk.engage.co/toolbar.css";
					head.load([jsSrc, cssSrc], function() {
						sdk.widget = new EngageToolbar(sdk, config.options);
						sdk.widget.draw();
					});
					break;
				case "custom":
				default:
					head.load([config.js, config.css], function() {
						// todo: pass in an instance of the sdk to a callback
					});
					break;
			}
		};

		EngageSDK.prototype.setWidgetVisibility = function(isVisible) {
			if(this.widget) {
				this.widget.setVisibility(isVisible);
			}
		};

		// find script and look for config; if found init script
		var currentScript = document.currentScript;
		// console.log(currentScript);
		if(currentScript != null) {
			currentScript = document.querySelector("script[data-customer-hash]")
		}
		if(currentScript != null) {
			var customerHash = currentScript.getAttribute("data-customer-hash");
			if(customerHash != null) {
				var engage = new EngageSDK(customerHash);
				var widgetConfig = currentScript.getAttribute("data-widget");
				if(widgetConfig) {
					engage.drawWidget(widgetConfig, currentScript.getAttribute("data-category"));
				}
				
			}
		}

		return EngageSDK;

});