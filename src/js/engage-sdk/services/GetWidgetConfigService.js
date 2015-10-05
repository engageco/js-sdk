/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery",
		"engage-sdk/services/BaseRESTService",
		"event-dispatcher/Event"],
	function(jQuery, BaseRESTService, Event) {

		'use strict';

		var GetWidgetConfigService = function(companyHash, slug) {
			BaseRESTService.call(this);
			this.useToken = false;
			this.companyHash = companyHash;
			this.slug = slug;
		};

		GetWidgetConfigService.prototype = new BaseRESTService();

		GetWidgetConfigService.prototype.handleResponse = function(data) {
			var event = new Event(Event.RESULT);
			event.service = this;
			event.data = data;
			this.dispatchEvent(event);
		};

		GetWidgetConfigService.prototype.handleError = function(message, status) {
			var event = new Event(Event.ERROR);
			event.message = message;
			event.status = status;
			event.service = this;
			this.dispatchEvent(event);
		};

		GetWidgetConfigService.prototype.prepareRequest = function() {
			var data = [
				{name:"companyHash", value:this.companyHash},
				{name:"slug", value:this.slug},
			];
			return {
				crossDomain: true,
				data: this.packageRequestData(data),
				dataType: "json",
				type: "GET",
				url: BaseRESTService.baseUrl + "/api/v2/widgetConfig"
			};
		};

		return GetWidgetConfigService;

	});