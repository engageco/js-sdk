define("EngageSDK", ["require",
        "jquery",
		"engage-sdk/managers/TrackingManager",
		"engage-sdk/utils/PresenceMonitor",
		"engage-sdk/utils/UserPageTracker",
        "engage-sdk/services/BaseRESTService",
        "engage-sdk/services/ServiceQueue",
		"engage-sdk/services/GetUsersService",
		"engage-sdk/services/GetWidgetConfigService",
        "event-dispatcher/Event",
		"headjs",
        "jquery.cookie"],
	function(require, jQuery, TrackingManager, PresenceMonitor, UserPageTracker, BaseRESTService, ServiceQueue,
			 GetUsersService, GetWidgetConfigService, Event) {

		"use strict";

		// define api key and secret that only have access to the widget APIs
		// if(!window.engageConfig) window.engageConfig = {
		// 	API_KEY: "9h23gk87234ysd7f9234hjksdf89234",
		// 	SECRET: "902340ulsdknzl23ljag07234asdf03952lkds"
		// };

		var EngageSDK = function(companyHash, disableTracking) {
            //BaseRESTService.baseUrl = "https://wapidev.engage.co";
			this.companyHash = companyHash;
			this.presence = PresenceMonitor.getInstance();
			if(!disableTracking) {
				this.tracking = TrackingManager.getInstance();
				this.tracking.applicationName = "SDK";
				this.tracking.companyId = this.companyHash;
			}
			var userPageTracker = new UserPageTracker(this, companyHash);
			userPageTracker.init();
		};

        EngageSDK.jQuery = jQuery;

		EngageSDK.version = "@@version";

		EngageSDK.prototype.getUsers = function(categorySlug, callback, syndicationCode) {
			var getUsersService = new GetUsersService();
            if(syndicationCode) {
                getUsersService.syndicationCode = syndicationCode;
            }else {
                getUsersService.companyHash = this.companyHash;
            }
            getUsersService.categorySlug = categorySlug;
            getUsersService.addEventListener(Event.RESULT, function(event) {
                if(callback) callback(event.data);
            });
            ServiceQueue.getInstance().addRequest(getUsersService);
		};

		EngageSDK.prototype.drawWidget = function(config, callback) {
			var sdk = this;
			// note: load widget configuration for the customer if 'config' is a string
			switch(config.type) {
				case "toolbar":
					var jsSrc = (config.js) ? config.js : "https://sdk.engage.co/toolbar.js";
					var cssSrc = (config.css) ? config.css : "https://sdk.engage.co/toolbar.css";
					head.load([jsSrc, cssSrc], function() {
						sdk.widget = new EngageToolbar(sdk, config.options, callback);
						//callback(sdk.widget);
					});
					break;
				case "custom":
				default:
					head.load([config.js, config.css], function() {
                        if(callback) callback();
					});
					break;
			}
		};

		EngageSDK.prototype.loadWidget = function(slug, callback) {
			var getWidgetConfigService = new GetWidgetConfigService(this.companyHash, slug);
			getWidgetConfigService.addEventListener(Event.RESULT, jQuery.proxy(function(event) {
                if(!event.data.config.disabled) {
                    if(this.tracking) {
                        this.tracking.tag = slug;
                        this.tracking.trackEvent("loadWidget", event.data.id);
                    }
                    this.drawWidget(event.data.config, callback);
                }
			}, this));
			ServiceQueue.getInstance().addRequest(getWidgetConfigService);
		};

		EngageSDK.prototype.setWidgetVisibility = function(isVisible) {
			if(this.widget) {
				this.widget.setVisibility(isVisible);
			}
		};

        EngageSDK.prototype.setLocalProperty = function(name, value) {
            if(window.localStorage) {
                window.localStorage.setItem(name, value);
            }else {
                jQuery.cookie(name, value);
            }
        };

        EngageSDK.prototype.getLocalProperty = function(name) {
            if(window.localStorage) {
                return window.localStorage.getItem(name);
            }else {
                return jQuery.cookie(name);
            }
        };



		// find script and look for config; if found init script
		var currentScript = document.currentScript;
		if(currentScript != null) {
			currentScript = document.querySelector("script[data-company]")
		}
		if(currentScript != null) {
			var companyHash = currentScript.getAttribute("data-company");
			if(companyHash != null) {
				var engage = new EngageSDK(companyHash);
				var widgetSlug = currentScript.getAttribute("data-widget");
				if(widgetSlug) {
					engage.loadWidget(widgetSlug);
				}else {
					var widgetConfig = JSON.parse(decodeURIComponent(currentScript.getAttribute("data-widget-config")));
					if(widgetConfig) {
						engage.drawWidget(widgetConfig);
					}
				}

			}
		}

		return EngageSDK;

});