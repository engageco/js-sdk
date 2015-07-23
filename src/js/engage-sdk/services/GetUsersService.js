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

		var GetUsersService = function(companyHash, categorySlug, searchKey) {
			BaseRESTService.call(this);
			this.companyHash = companyHash;
			this.categorySlug = categorySlug;
			this.searchKey = searchKey;
		};

		GetUsersService.prototype = new BaseRESTService();

		GetUsersService.prototype.handleResponse = function(data) {
			var event = new Event(Event.RESULT);
			event.service = this;
			event.data = data;
			this.dispatchEvent(event);
		};

		GetUsersService.prototype.handleError = function(message, status) {
			var event = new Event(Event.ERROR);
			event.message = message;
			event.status = status;
			event.service = this;
			this.dispatchEvent(event);
		};

		GetUsersService.prototype.prepareRequest = function() {
			var data = [
				{name:"companyHash", value:this.companyHash}
			];
			if(this.categorySlug) {
				data.push({name:"categorySlug", value:this.categorySlug});
			}
			if(this.searchKey) {
				data.push({name:"searchKey", value:this.searchKey});
			}
			return {
				crossDomain: true,
				data: this.packageRequestData(data),
				dataType: "json",
				type: "GET",
				url: BaseRESTService.baseUrl + "/api/v2/getUsers"
			};
		};

		return GetUsersService;

	});