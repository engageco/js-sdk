define(["jquery",
        "engage-sdk/utils/ScreenController"],
	function(jQuery, ScreenController) {

		'use strict';

		var EngageToolbar = function(sdk, options) {
			this.sdk = sdk;
			this.options = options;
			this.users = null;
			this.tab = null;
			this.drawer = null;
			this.sdk.getUsers(this.options.category, jQuery.proxy(onUsersLoaded, this));
            this.screenController = new ScreenController();
            this.screenController.cssClasses.left = "engage-left";
            this.screenController.cssClasses.right = "engage-right";
			jQuery(jQuery.proxy(onDOMReady, this));
		};

        EngageToolbar.SCREENS = {
            SEARCH: "search",
            DIRECTORY: "directory",
            PROFILE: "profile"
        };

        var getCityStateFormatted = function(user) {
            var cityState = [];
            if(user.city) cityState.push(user.city);
            if(user.state) cityState.push(user.state);
            return cityState.join(", ");
        };

		var onDOMReady = function() {
			// create tab
			this.tab = jQuery('<div class="engage-tab">' +
                    '<div class="engage-tab-label"></div>' +
                '</div>');
			this.tab.on("click", jQuery.proxy(onTabClick, this));
			var tabPlacement = (this.options.tabPlacement) ? this.options.tabPlacement : "right-tab";
			this.tab.addClass(tabPlacement);
			if(this.options.backgroundColor) {
				this.tab.css("background-color", this.options.backgroundColor);
			}
			var label = this.tab.find('.engage-tab-label');
			var labelText = (this.options.label) ? this.options.label : "Chat";
			label.text(labelText);
			if(this.options.labelOrientation) {
				label.addClass(this.options.labelOrientation);
			}
			if(this.options.labelColor) {
				this.tab.css("color", this.options.labelColor);
			}
			label.appendTo(this.tab);
			this.tab.appendTo(jQuery("body"));

			// create drawer
			this.drawer = jQuery('<div class="engage-drawer">' +
                    '<div class="engage-header">' +
                        '<a class="engage-back engage-hide"></a>' +
                        '<a class="engage-close"></a>' +
                    '</div>' +
                    '<div class="engage-screen engage-search engage-right">search</div>' +
                    '<div class="engage-screen engage-directory engage-right">' +
                        '<ul></ul>' +
                    '</div>' +
                    '<div class="engage-screen engage-profile engage-right">' +
                    '<div class="engage-profilePhoto">' +
                        '<div class="engage-photo"><img></div>' +
                            '<div class="engage-statusIndicator engage-online"></div>' +
                        '</div>' +
                        '<div class="engage-name"></div>' +
                        '<div class="engage-title"></div>' +
                        '<div class="engage-location"></div>' +
                        '<hr>' +
                        '<div class="engage-bio"></div>' +
                        '<div class="engage-button-row">' +
                            '<a class="engage-button engage-button-blue">View Profile</a>' +
                            '<a class="engage-button engage-chat">Start Chat</a>' +
                        '</div>' +
                    '</div>' +
                '</div>');
			this.drawer.find(".engage-close").on("click", jQuery.proxy(onDrawerCloseClick, this));
            this.drawer.find(".engage-back").on("click", jQuery.proxy(onScreenBackClick, this));
            this.drawer.find(".engage-button").on("click", jQuery.proxy(onUserChatClick, this));
			this.drawer.addClass("engage-hide");
			this.drawer.addClass(tabPlacement);
			this.drawer.appendTo(jQuery("body"));
			this.searchScreen = this.drawer.find(".engage-screen.engage-search");
            this.screenController.addScreen(EngageToolbar.SCREENS.SEARCH, this.searchScreen);
			this.directoryScreen = this.drawer.find(".engage-screen.engage-directory");
            this.screenController.addScreen(EngageToolbar.SCREENS.DIRECTORY, this.directoryScreen);
			if(this.options.showListOnly) {
				this.directoryScreen.addClass("engage-list");
			}
			this.profileScreen = this.drawer.find(".engage-screen.engage-profile");
            this.screenController.addScreen("profile", this.profileScreen);
            if(this.users) {
                onUsersLoaded.apply(this, [this.users]);
            }
		};

		var onUsersLoaded = function(data) {
			this.users = data.users;
            if(this.directoryScreen) {
                var list = this.directoryScreen.find("ul");
                for(var i = 0; i < this.users.length; i++) {
                    var user = this.users[i];
                    var item = jQuery('<li>' +
                            '<div class="engage-profilePhoto engage-small">' +
                                '<div class="engage-photo"><img></div>' +
                                '<div class="engage-statusIndicator"></div>' +
                            '</div>' +
                            '<div class="engage-name"></div>' +
                            '<div class="engage-title"></div>' +
                            '<div class="engage-location"></div>' +
                            '<a class="engage-button">Chat Now</a>' +
                        '</li>');
                    item.find(".engage-photo > img").attr("src", user.profilePhoto);
                    item.find(".engage-name").text(user.firstName + " " + user.lastName);
                    item.find(".engage-title").text(user.title);
                    item.find(".engage-location").text(getCityStateFormatted(user));
                    item.find(".engage-location").toggle(this.options.showAgentLocation == true);
                    item.attr("data-domain", user.domain);
                    item.data("user", user);
                    item.on("click", jQuery.proxy(onUserClick, this));
                    item.find(".engage-button").on("click", jQuery.proxy(onUserChatClick, this));
                    list.append(item);
                    this.sdk.presence.watchUser(user.domain, jQuery.proxy(onUserPresenceChange, this));
                }
                this.sdk.presence.start();
            }
		};

		var onUserPresenceChange = function(status, domain) {
			var online = status == "online";
			var item = this.directoryScreen.find("li[data-domain='" + domain + "']");
			item.find(".engage-statusIndicator").toggleClass("engage-online", online);
			var button = item.find(".engage-button");
			button.toggleClass("engage-outline", !online);
			var label = online ? "Chat Now" : "Send Message";
			button.text(label);
            if(this.currentUser && this.currentUser.domain == domain) {
                this.profileScreen.find(".engage-statusIndicator").toggleClass("engage-online", online);
                var button = this.profileScreen.find(".engage-button.engage-chat");
                button.toggleClass("engage-outline", !online);
                button.text(label);
            }
		};

		var onUserClick = function(event) {
			var user = jQuery(event.currentTarget).data("user");
            this.screenController.setScreen(EngageToolbar.SCREENS.PROFILE);
            this.drawer.find(".engage-back").removeClass("engage-hide");
            this.currentUser = user;
            this.profileScreen.find(".engage-photo > img").attr("src", user.profilePhoto);
            this.profileScreen.find(".engage-name").text(user.firstName + " " + user.lastName);
            this.profileScreen.find(".engage-title").text(user.title);
            this.profileScreen.find(".engage-location").text(getCityStateFormatted(user));
            this.profileScreen.find(".engage-location").toggle(this.options.showAgentLocation == true);
            var bio = jQuery.trim(user.bio).substring(0, 140).split(" ").slice(0, -1).join(" ") + "...";
            this.profileScreen.find(".engage-bio").text(bio);
            onUserPresenceChange.apply(this, [this.sdk.presence.getUserStatus(user.domain), user.domain]);
		};

		var onUserChatClick = function(event) {
			event.stopImmediatePropagation();
			var user = jQuery(event.currentTarget).parent().data("user") || this.currentUser;
			window.open(user.profileUrl);
		};

		var onTabClick = function(event) {
			this.tab.addClass("engage-hide");
			var self = this;
			setTimeout(function() {
				self.drawer.removeClass("engage-hide");
                if(self.screenController.currentScreen == null) {
                    if(self.options.showSearch) {
                        self.screenController.setScreen(EngageToolbar.SCREENS.SEARCH);
                    }else {
                        self.screenController.setScreen(EngageToolbar.SCREENS.DIRECTORY);
                    }
                }
			}, 300);
		};

		var onDrawerCloseClick = function(event) {
			this.drawer.addClass("engage-hide");
			var self = this;
			setTimeout(function() {
				self.tab.removeClass("engage-hide");
			}, 500);
		};

        var onScreenBackClick = function(event) {
            this.screenController.back();
            this.drawer.find(".engage-back").toggleClass("engage-hide", this.screenController.currentIndex == 0);
        };

		EngageToolbar.prototype.setVisibility = function(isVisible) {
			tyhis.tab.toggle(isVisible);
		};

		return EngageToolbar;

});