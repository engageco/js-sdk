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

		var TrackService = function(applicationName, customerDomain, companyId, type, description) {
			BaseRESTService.call(this);
			this.userGuid = null;
			this.description = description;
			this.customerDomain = customerDomain;
			this.applicationName = applicationName;
			this.type = type;
			this.companyId = companyId;
		};

		TrackService.prototype = new BaseRESTService();

		TrackService.prototype.handleResponse = function(data) {
			var event = new Event(Event.RESULT);
			event.service = this;
			event.data = data;
			this.dispatchEvent(event);
		};

		TrackService.prototype.handleError = function(message, status) {
			var event = new Event(Event.ERROR);
			event.message = message;
			event.status = status;
			event.service = this;
			this.dispatchEvent(event);
		};

		TrackService.prototype.prepareRequest = function() {
			var params = new Array();
			if(this.userGuid != null) {
				params.push({name:"uid", value:this.userGuid});
			}
			params.push({name:"ad", value:this.description});
			params.push({name:"cd", value:this.customerDomain});
			params.push({name:"an", value:this.applicationName});
			params.push({name:"t", value:this.type});
			params.push({name:"coid", value:this.companyId});
			return {
				crossDomain: true,
				data: this.packageRequestData(params),
				dataType: "json",
				type: "POST",
				url: BaseRESTService.baseUrl + "/api/v2/track"
			};
		};

		return TrackService;

	});