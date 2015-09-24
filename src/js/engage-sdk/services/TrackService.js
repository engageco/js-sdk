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

		var TrackService = function(applicationName, customerDomain, publisherDomain, companyId, userGuid, tag, type, description) {
			BaseRESTService.call(this);
			this.applicationName = applicationName;
			this.customerDomain = customerDomain;
			this.publisherDomain = publisherDomain;
			this.companyId = companyId;
			this.userGuid = userGuid;
			this.tag = tag;
			this.type = type;
			this.description = description;
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
			if(this.publisherDomain != null) {
				params.push({name:"pd", value:this.publisherDomain});
			}
			if(this.userGuid != null) {
				params.push({name:"uid", value:this.userGuid});
			}
			params.push({name:"ad", value:this.description});
			params.push({name:"cd", value:this.customerDomain});
			params.push({name:"an", value:this.applicationName});
			params.push({name:"t", value:this.type});
			params.push({name:"coid", value:this.companyId});
			if(this.tag != null) {
				params.push({name: "tag", value: this.tag});
			}
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