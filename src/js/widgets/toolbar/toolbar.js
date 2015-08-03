define("EngageToolbar", ["jquery",
        "engage-sdk/utils/ScreenController",
        "widgets/utils/SortOrderUtil"],
	function(jQuery, ScreenController, SortOrderUtil) {

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
            this.neverOpened = true;
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
			var tabPlacement = (this.options.tabPlacement) ? this.options.tabPlacement : "right-tab";
			// create tab
			this.tab = jQuery('<div class="engage-tab">' +
                    '<div class="engage-tab-label"></div>' +
                    '<div class="engage-profilePhoto engage-tiny">' +
                        '<div class="engage-photo no-photo"><img></div>' +
                        '<div class="engage-statusIndicator engage-online"></div>' +
                    '</div>' +
                '</div>');
			this.tab.addClass(tabPlacement);
			if(this.options.backgroundColor) {
				this.tab.css("background-color", this.options.backgroundColor);
                this.tab.find(".engage-statusIndicator").css("border-color", this.options.backgroundColor);
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
            //console.log(this.tab.find(".engage-profilePhoto"));
            this.tab.on("click", jQuery.proxy(onTabClick, this));
            this.tab.find(".engage-profilePhoto").on("click", jQuery.proxy(onTabUserClick, this));

            this.bubble = jQuery('<div class="engage-bubble">' +
                    '<div class="engage-bubble-message">Hey there! Do you need any help?</div>' +
                    '<div class="engage-name">Peter Hashtag</div>' +
                    '<div class="engage-title">CTO</div>' +
                    '<a class="engage-button engage-chat">Chat Now</a>' +
                '</div>');
            this.bubble.on("click", jQuery.proxy(onTabUserClick, this));
            this.bubble.find(".engage-button").on("click", jQuery.proxy(onUserChatClick, this));
            this.bubble.addClass(tabPlacement);
            this.bubble.appendTo(jQuery("body"));

			// create drawer
			this.drawer = jQuery('<div class="engage-drawer">' +
                    '<div class="engage-header">' +
                        '<div class="engage-directory-title"></div>' +
                        '<a class="engage-back engage-hide"></a>' +
                        '<a class="engage-close"></a>' +
                    '</div>' +
                    '<div class="engage-screen engage-search engage-right"></div>' +
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
            this.drawer.find(".engage-directory-title").text(this.options.directoryTitle);
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

        var onShowTabUser = function(user) {
            //if(!this.bubble.hasClass("engage-show")) { // don't switch users if the proactive bubble is open
                if(user && user.profilePhoto != null && user.profilePhoto != "") {
                    this.tab.find(".engage-profilePhoto").data("user", user);
                    this.tab.find(".engage-photo > img").attr("src", user.profilePhoto);
                    this.tab.find(".engage-photo").removeClass("no-photo");
                }else {
                    this.tab.find(".engage-photo > img").attr("src", "");
                    this.tab.find(".engage-photo").addClass("no-photo");
                }
                this.tab.toggleClass("engage-show-user", (user != null));
                if(this.neverOpened && user && this.options.proactive) {
                    this.bubble.data("user", user);
                    this.bubble.find(".engage-name").text(user.firstName + " " + user.lastName);
                    this.bubble.find(".engage-title").text(user.title);
                    var proactiveDelay = this.options.proactive.delay ? this.options.proactive.delay : 100;
                    clearTimeout(this.showProactiveBubbleTimeout);
                    this.showProactiveBubbleTimeout = setTimeout(jQuery.proxy(onOpenProactiveBubble, this), proactiveDelay);
                }else {
                    this.bubble.removeClass("engage-show");
                }
            //}
        };

        var onOpenProactiveBubble = function() {
            this.bubble.find(".engage-bubble-message").text(this.options.proactive.message);
            this.bubble.addClass("engage-show");
        };

		var onUsersLoaded = function(data) {
			this.users = data.users;
            // todo: look for agents this visitor has chatted with before and highlight them in a featured agents area in the drawer and put them in the
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
                    if(user.profilePhoto != null && user.profilePhoto != "") {
                        item.find(".engage-photo > img").attr("src", user.profilePhoto);
                    }else {
                        item.find(".engage-photo").addClass("no-photo");
                    }
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
            item.toggle(online || !this.options.hideOfflineAgents)
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
            // NOTE: Since this is called each time a user's presence changes, we want to add a delay
            //       in case multiple users change at once.
            clearTimeout(this.sortTimeout);
            this.sortTimeout = setTimeout(jQuery.proxy(onSortUserList, this), 200);
		};

        var onSortUserList = function(event) {
            var sortedList = this.directoryScreen.find("li");
            switch(this.options.agentOrder) {
                case "random":
                    sortedList = SortOrderUtil.orderByRandom(sortedList);
                    break;
                case "alpha":
                    sortedList = SortOrderUtil.orderByAlpha(sortedList);
                    break;
                case "last-chat":
                default:
                    sortedList = SortOrderUtil.orderByLastChat(sortedList);
                    break;
            }
            if(this.options.showOnlineAgentsFirst != false) {
                sortedList = SortOrderUtil.orderByOnline(sortedList, this.sdk.presence);
            }
            this.directoryScreen.find("ul").append(sortedList);
            //if(this.currentUser == null || this.sdk.presence.getUserStatus(this.currentUser.domain) != "online") {
                var user = sortedList.first().data("user");
                var isOnline = this.sdk.presence.getUserStatus(user.domain) == "online";
                onShowTabUser.apply(this, [isOnline ? user : null]);
            //}
        };

		var onUserClick = function(event) {
			var user = jQuery(event.currentTarget).data("user");
            this.screenController.setScreen(EngageToolbar.SCREENS.PROFILE);
            this.drawer.find(".engage-back").removeClass("engage-hide");
            this.currentUser = user;
            var status = this.sdk.presence.getUserStatus(user.domain);
            if(status == "online") {
                onShowTabUser.apply(this, [this.currentUser]);
            }
            if(user.profilePhoto != null && user.profilePhoto != "") {
                this.profileScreen.find(".engage-photo > img").attr("src", user.profilePhoto);
                this.tab.find(".engage-photo").removeClass("no-photo");
            }else {
                this.profileScreen.find(".engage-photo > img").attr("src", "");
                this.profileScreen.find(".engage-photo").addClass("no-photo");
            }
            this.profileScreen.find(".engage-name").text(user.firstName + " " + user.lastName);
            this.profileScreen.find(".engage-title").text(user.title);
            this.profileScreen.find(".engage-location").text(getCityStateFormatted(user));
            this.profileScreen.find(".engage-location").toggle(this.options.showAgentLocation == true);
            var bio = jQuery.trim(user.bio).substring(0, 140).split(" ").slice(0, -1).join(" ");
            if(bio != "") bio += "...";
            this.profileScreen.find(".engage-bio").text(bio);
            onUserPresenceChange.apply(this, [status, user.domain]);
		};

		var onUserChatClick = function(event) {
			event.stopImmediatePropagation();
			var user = jQuery(event.currentTarget).parent().data("user") || this.currentUser;
			window.open(user.profileUrl);
		};

		var onTabClick = function(event) {
			this.tab.addClass("engage-hide");
            clearTimeout(this.showProactiveBubbleTimeout);
            this.bubble.removeClass("engage-show");
            this.neverOpened = false;
			var self = this;
			setTimeout(function() {
				self.drawer.removeClass("engage-hide");
                setTimeout(jQuery.proxy(onShowFirstScreen, self), 300);
			}, 300);
		};

        var onTabUserClick = function(event) {
            event.stopImmediatePropagation();
            onShowFirstScreen.apply(this);
            onTabClick.apply(this, [event]);
            onUserClick.apply(this, [event]);
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

        var onShowFirstScreen = function() {
            if(this.screenController.currentScreen == null) {
                if(this.options.showSearch) {
                    this.screenController.setScreen(EngageToolbar.SCREENS.SEARCH);
                }else {
                    this.screenController.setScreen(EngageToolbar.SCREENS.DIRECTORY);
                }
            }
        };

		EngageToolbar.prototype.setVisibility = function(isVisible) {
			tyhis.tab.toggle(isVisible);
		};

		return EngageToolbar;

});