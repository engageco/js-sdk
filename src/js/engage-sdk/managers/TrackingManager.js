/**
 *	Tracks for following events
 *
 * html5AnonymousChat
 *    TrackingManager.TYPE.CLICK, "chatConnectClick"
 *    TrackingManager.TYPE.CLICK, "emailTranscript"
 *    TrackingManager.TYPE.CLICK, "sendOfflineMessage"
 *
 *    TrackingManager.TYPE.CHAT, "startChat"
 *    TrackingManager.TYPE.CHAT, "endChat"
 *    TrackingManager.TYPE.CHAT, "sendMessage"
 *    TrackingManager.TYPE.CHAT, "receiveMessage"
 *    TrackingManager.TYPE.LOAD, "getProfileLoad"
 *
 *    TrackingManager.TYPE.CHAT, "startVideoPlayback"
 *    TrackingManager.TYPE.CHAT, "startAudioPlayback"
 *    TrackingManager.TYPE.CHAT, "stopVideoPlayback"
 *    TrackingManager.TYPE.CHAT, "stopAudioPlayback"
 *    TrackingManager.TYPE.CHAT, "startVideoBroadcast"
 *    TrackingManager.TYPE.CHAT, "stopVideoBroadcast"
 *    TrackingManager.TYPE.CHAT, "startAudioBroadcast"
 *    TrackingManager.TYPE.CHAT, "stopAudioBroadcast"
 *
 * @author Danny Patterson
 */

define(["jquery",
		"engage-sdk/services/TrackService",
		"jquery.cookie"],
	function(jQuery, TrackService) {

		'use strict';

		var TrackingManager = function() {
			this.applicationName = null;
			this.customerDomain = null;
			this.companyId = null;
			this.userGuid = loadUserGuid();
			this.capabilities = null;
		};

		TrackingManager.TYPE = {
			CLICK: "click",
			CHAT: "chat",
			LOAD: "load"
		};

		TrackingManager._instance = null;

		TrackingManager.translateChatSource = function(from) {
			switch(parseInt(from)){
				case 0:
					return "Profile_page";		//profile page (profile.engage.com/userdomain)
				case 1:
					return "Status_button";		//in-page status buttons
				case 2:
					return "User_card";			//usercard (hover card)
				case 3:
					return "Email_sig";			//image signature (email)
				case 4:
					return "HTML_profile";		//HTML profile embed
				case 5:
					return "HTML_listing";		//toolbar/lightbox top level directory listing
				case 6:
					return "Chat_Bubble";		//chat bubble "Reconnect"
				case 7:
					return "Rolodesk_card";		//rolodesk "connect" card
			}
			return "unknown";       			//empy param
		};

		TrackingManager.getInstance = function() {
			if(TrackingManager._instance == null) {
				TrackingManager._instance = new TrackingManager();
			}
			return TrackingManager._instance
		};

		var loadUserGuid = function() {
			var userGuid = jQuery.cookie("userGuid");
			if(userGuid == null) {
				var s4 = function() {
					return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
				};
				userGuid = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
				jQuery.cookie("userGuid", userGuid);
			}
			return userGuid;
		};

		TrackingManager.prototype.startChat = function(fullName) {
			this.trackEvent(TrackingManager.TYPE.CHAT, "startChat");
			if(typeof s_cstat != "undefined") {
				s_cstat.start(this.companyId, this.customerDomain, fullName);
			}
		};

		TrackingManager.prototype.endChat = function() {
			this.trackEvent(TrackingManager.TYPE.CHAT, "endChat");
			if(typeof s_cstat != "undefined") {
				s_cstat.end_chat(true);
			}
		};

		TrackingManager.prototype.trackEvent = function(type, description) {
			if(this.applicationName == null || this.customerDomain == null || this.companyId == null) return false;
			var trackService = new TrackService(this.applicationName, this.customerDomain, this.companyId, type, description);
			trackService.execute();
		};

		return TrackingManager;

	});