/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery",
		"engage/services/BaseRESTService",
		"event-dispatcher/Event"],
	function(jQuery, BaseRESTService, Event) {

		'use strict';

		var KeepAliveService = function() {
			BaseRESTService.call(this);
			this.useToken = true;
		};

		KeepAliveService.prototype = new BaseRESTService();

		KeepAliveService.prototype.handleResponse = function(data) {
			var event = new Event(Event.RESULT);
			event.service = this;
			this.dispatchEvent(event);
		};

		KeepAliveService.prototype.handleError = function(message, status) {
			var event = new Event(Event.ERROR);
			event.message = message;
			event.status = status;
			event.service = this;
			this.dispatchEvent(event);
		};

		KeepAliveService.prototype.prepareRequest = function() {
			return {
				crossDomain: true,
				data: this.packageRequestData([]),
				dataType: "json",
				type: "GET",
				url: BaseRESTService.baseUrl + "/api/v2/keepAlive"
			};
		};

		return KeepAliveService;

	});