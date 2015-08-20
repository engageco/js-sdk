/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery",
		"engage-sdk/services/KeepAliveService",
		"event-dispatcher/EventDispatcher",
		"event-dispatcher/Event"],
	function(jQuery, KeepAliveService, EventDispatcher, Event) {

		'use strict';

		var TOKEN_WINDOW = 5;
		var KEEP_ALIVE_TIMEOUT = 600000;

		var ServiceQueue = function() {
			EventDispatcher.call(this);
			this.services = new Array();
			this.keepAliveEnabled = false;
			this.currentServices = new Array();
			this.keepAliveService = new KeepAliveService();
			this.keepAliveInterval = null;
			this.onServiceDoneHandler = jQuery.proxy(onServiceDone, this);
		};

		ServiceQueue.prototype = new EventDispatcher();

		var removeServiceFromCurrentList = function(service) {
			for(var i = 0; i < this.currentServices.length; i++) {
				this.currentServices.splice(i, 1);
				break;
			}
		};

		var executeNextRequest = function() {
			if(this.currentServices.length < 5 && this.services.length > 0) {
				clearInterval(this.keepAliveInterval);
				var service = this.services.shift();
				service.addEventListener(Event.RESULT, this.onServiceDoneHandler);
				service.addEventListener(Event.ERROR, this.onServiceDoneHandler);
				service.execute();
				this.currentServices.push(service);
			}
		};

		var onServiceDone = function(event) {
			clearInterval(this.keepAliveInterval);
			event.service.removeEventListener(Event.RESULT, this.onServiceDoneHandler);
			event.service.removeEventListener(Event.ERROR, this.onServiceDoneHandler);
			removeServiceFromCurrentList.apply(this, [event.service]);
			if(event.type == Event.ERROR) {
				this.dispatchEvent(event);
			}
			if(this.keepAliveEnabled) {
				this.keepAliveInterval = setInterval(jQuery.proxy(onKeepAliveTick, this), KEEP_ALIVE_TIMEOUT);
			}
			executeNextRequest.apply(this);
		};

		var onKeepAliveTick = function() {
			if(this.keepAliveEnabled) {
				this.addRequest(this.keepAliveService);
			}
		};

		ServiceQueue._instance = null;

		ServiceQueue.getInstance = function() {
			if(ServiceQueue._instance == null) {
				ServiceQueue._instance = new ServiceQueue();
			}
			return ServiceQueue._instance
		};

		ServiceQueue.prototype.addRequest = function(service, isPriority) {
			if(isPriority) {
				this.services.push(service);
			}else {
				this.services.unshift(service);
			}
			executeNextRequest.apply(this);
		};

		ServiceQueue.prototype.useKeepAlive = function(keepAliveEnabled) {
			this.keepAliveEnabled = keepAliveEnabled;
			clearInterval(this.keepAliveInterval);
			if(keepAliveEnabled) {
				this.keepAliveInterval = setInterval(jQuery.proxy(onKeepAliveTick, this), KEEP_ALIVE_TIMEOUT);
			}
		};

		return ServiceQueue;

	});
