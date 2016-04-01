/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery",
		"event-dispatcher/EventDispatcher",
		"gibberish.aes","crypto.sha1"],
	function(jQuery, EventDispatcher, GibberishAES) {

		'use strict';

		var API_KEY = "5e5287ce9c4979cd6acf742850fd21af";
		var ENCRYPTED_SECRET = "U2FsdGVkX19abhCdHOU9/IdUyncqLJABbJUrfVqSkfupbAAOPJdFFal1gvK18B1Hf1YS3VGJ/nzuk6OvgIqgNA==";
		var SECRET = null;
		var KEY = "U2FsdGVkX19UCrDCxlsIRGRGV5EmhVcardtNhay47Zb+fw/KKDtvWNzp/DXP7+T3aYMidQBlcKNBDEfWNDpGdA";

		var BaseRESTService = function() {
			EventDispatcher.call(this);
			this.useToken = false;
		};

		BaseRESTService.token = null;
		BaseRESTService.requestId = 0;

		BaseRESTService.baseUrl = "https://wapi.engage.co";

		BaseRESTService.prototype = new EventDispatcher();

		var onSuccess = function(data, textStatus, jqXHR) {
//			console.log("BaseRESTService.onSuccess", data, textStatus, jqXHR);
			if(data.hasOwnProperty("token")) {
				BaseRESTService.token = data.token;
			}
			if(data.hasOwnProperty("requestId")) {
				BaseRESTService.requestId = data.requestId;
			}
            if(this.useToken) BaseRESTService.requestId++;
			this.handleResponse(data);
		};

		var onFail = function(jqXHR, textStatus, errorThrown) {
//			console.log("BaseRESTService.onFail", jqXHR, textStatus, errorThrown);
			//todo: check for retry opportunity
			var message = (jqXHR.responseJSON != null) ? jqXHR.responseJSON.message : textStatus;
			this.handleError(message, jqXHR.status);
		};

		BaseRESTService.prototype.handleResponse = function(data) {
			var event = new Event(Event.RESULT);
			event.data = data;
			this.dispatchEvent(event);
		};

		BaseRESTService.prototype.handleError = function(message, status) {
			var event = new Event(Event.ERROR);
			event.message = message;
			event.status = status;
			event.service = this;
			this.dispatchEvent(event);
		};

		var getSecret = function() {
			if(SECRET == null) {
				SECRET = GibberishAES.dec(ENCRYPTED_SECRET, KEY);
			}
			return SECRET;
		};

		BaseRESTService.prototype.encryptString = function(string) {
			return GibberishAES.enc(string, getSecret());
		};

		BaseRESTService.prototype.packageRequestData = function(paramsRef) {
			var params = (paramsRef) ? JSON.parse(JSON.stringify(paramsRef)) : [];
			if(this.useToken && BaseRESTService.token != null) {
				params.unshift({name:"requestId", value:BaseRESTService.requestId});
				params.unshift({name:"token", value:BaseRESTService.token});
			}
			params.unshift({name:"apiKey", value:API_KEY});
			var data = new Object();
			var sigBuilder = [];
			for(var i = 0; i < params.length; i++) {
				var value = params[i].value;
				var name = params[i].name;
				data[name] = value;
//				if(typeof value != 'undefined') {
					if(Object.prototype.toString.call(value) === '[object Array]') {
						value.forEach(function(v) {
							sigBuilder.push(name + "[]=" + v); //(v != undefined ? v : '')
						});
					}else {
						sigBuilder.push(name + "=" + value); //(value != undefined ? value : '')
					}
//				}
			}

			sigBuilder.push("secret=" + getSecret());
//			console.log(sigBuilder.join("&"));
			data.sig = CryptoJS.SHA1(sigBuilder.join("&")).toString();
//			console.log(data.sig);
			return data;
		};

		BaseRESTService.prototype.makeRequest = function(options) {
			jQuery.support.cors = true;
			this.request = jQuery.ajax(options);
			this.request.success(jQuery.proxy(onSuccess, this));
			this.request.fail(jQuery.proxy(onFail, this));
		};

		BaseRESTService.prototype.prepareRequest = function() {
			return {};
		};

		BaseRESTService.prototype.execute = function() {
			this.makeRequest(this.prepareRequest());
		};

		BaseRESTService.prototype.makeGetRequestUrl = function() {
			var request = this.prepareRequest();
			var params = new Array();
			for(var param in request.data) {
				params.push(param + "=" + request.data[param]);
			}
			return request.url + "?" + params.join("&");
		};

		BaseRESTService.prototype.overrideAPIKeyAndSecret = function(apiKey, secret) {
			API_KEY = apiKey;
			SECRET = secret;
		};

		return BaseRESTService;

	});
