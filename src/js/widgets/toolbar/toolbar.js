define("EngageToolbar", ["jquery",
        "engage-sdk/utils/ScreenController",
        "widgets/utils/SortOrderUtil"],
	function(jQuery, ScreenController, SortOrderUtil) {

		'use strict';

		var EngageToolbar = function(sdk, options, callback) {
			this.sdk = sdk;
			this.options = options;
			this.users = null;
			this.tab = null;
			this.drawer = null;
            this.setOption("category", this.options.category);
            this.screenController = new ScreenController();
            this.screenController.cssClasses.left = "engage-left";
            this.screenController.cssClasses.right = "engage-right";
            if(this.sdk.tracking) {
                this.sdk.tracking.applicationName = "ToolbarV2";
            }
            this.neverOpened = true;
            this.callback = callback;
			jQuery(jQuery.proxy(onDOMReady, this));
		};

        EngageToolbar.version = "@@version";

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
            console.log("onDOMReady");
			this.tab = jQuery('<div class="engage-tab mobile-enabled engage-hide">' +
                    '<div class="engage-tab-label"></div>' +
                    '<div class="engage-profilePhoto engage-tiny">' +
                        '<div class="engage-photo no-photo"><img></div>' +
                        '<div class="engage-statusIndicator engage-online"></div>' +
                    '</div>' +
                '</div>');
			this.tabLabel = this.tab.find('.engage-tab-label');
            this.tabLabel.appendTo(this.tab);
			this.tab.appendTo(jQuery("body"));
            this.tab.on("click", jQuery.proxy(onTabClick, this));
            this.tab.find(".engage-profilePhoto").on("click", jQuery.proxy(onTabUserClick, this));

            this.bubble = jQuery('<div class="engage-bubble mobile-enabled">' +
                    '<div class="engage-bubble-close"></div>' +
                    '<div class="engage-bubble-message"></div>' +
                    '<div class="engage-name"></div>' +
                    '<div class="engage-title"></div>' +
                    '<a class="engage-button engage-chat">Engage Live</a>' +
                '</div>');
            this.bubble.on("click", jQuery.proxy(onTabUserClick, this));
            this.bubble.find(".engage-button").on("click", jQuery.proxy(onUserChatClick, this));
            this.bubble.find(".engage-bubble-close").on("click", jQuery.proxy(onCloseProactiveBubble, this));
            this.bubble.appendTo(jQuery("body"));

			this.drawer = jQuery('<div class="engage-drawer mobile-enabled engage-hide">' +
                    '<div class="engage-header">' +
                        '<div class="engage-directory-title"></div>' +
                        '<a class="engage-back engage-hide"></a>' +
                        '<a class="engage-close"></a>' +
                    '</div>' +
                    '<div class="engage-footer">' +
                        '<span class="engage-powered-by">&copy; ' + new Date().getFullYear() + ' <a href="http://engage.co" target="_tab">Powered By Engage</a></span>' +
                        '<a class="engage-directory-link" target="_tab">Full Company Directory</a>' +
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
                            '<a class="engage-button engage-chat">Engage Live</a>' +
                        '</div>' +
                    '</div>' +
                '</div>');
			this.drawer.find(".engage-close").on("click", jQuery.proxy(onDrawerCloseClick, this));
            this.drawer.find(".engage-back").on("click", jQuery.proxy(onScreenBackClick, this));
            this.drawer.find(".engage-button").on("click", jQuery.proxy(onUserChatClick, this));
			this.drawer.appendTo(jQuery("body"));
			this.searchScreen = this.drawer.find(".engage-screen.engage-search");
            this.screenController.addScreen(EngageToolbar.SCREENS.SEARCH, this.searchScreen);
			this.directoryScreen = this.drawer.find(".engage-screen.engage-directory");
            this.screenController.addScreen(EngageToolbar.SCREENS.DIRECTORY, this.directoryScreen);
			this.profileScreen = this.drawer.find(".engage-screen.engage-profile");
            this.screenController.addScreen("profile", this.profileScreen);

            this.setOption("tabPlacement", this.options.tabPlacement);
            this.setOption("showListOnly", this.options.showListOnly);
            this.setOption("offlineLabel", this.options.offlineLabel);
            this.setOption("labelOrientation", this.options.labelOrientation);
            this.setOption("disableMobileView", this.options.disableMobileView);
            this.setOption("labelColor", this.options.labelColor);
            this.setOption("directoryTitle", this.options.directoryTitle);
            this.setOption("backgroundColor", this.options.backgroundColor);
            this.setOption("directoryUrl", this.options.directoryUrl);

            if(this.users) {
                onUsersLoaded.apply(this, [{users:this.users}]);
            }

            if(this.sdk.tracking) {
                this.sdk.tracking.publisherDomain = document.URL;
                this.sdk.tracking.trackEvent("load", "toolbarInit");
            }

            if(this.callback) {
                this.callback(this);
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
                    var proactiveDelay = this.options.proactive.delay ? this.options.proactive.delay : 1000;
                    clearTimeout(this.showProactiveBubbleTimeout);
                    this.showProactiveBubbleTimeout = setTimeout(jQuery.proxy(onOpenProactiveBubble, this), proactiveDelay);
                }else {
                    this.bubble.removeClass("engage-show");
                }
            //}
        };

        var onOpenProactiveBubble = function() {
            if(!this.tab.hasClass("engage-hide")) {
                var lastShown = this.sdk.getLocalProperty("proactive-last-displayed");
                var lastShownDate = new Date(Date.parse(lastShown));
                var frequency = (this.options.proactive && this.options.proactive.frequency) ? this.options.proactive.frequency : 1440;
                var nextShowDate = new Date(lastShownDate.getTime() + Math.round(frequency * 60000));
                if(lastShown == null || nextShowDate <= new Date()) {
                    this.sdk.setLocalProperty("proactive-last-displayed", new Date());
                    this.bubble.find(".engage-bubble-message").text(this.options.proactive.message);
                    this.bubble.addClass("engage-show");
                }
            }
        };

        var onCloseProactiveBubble = function(event) {
            event.stopImmediatePropagation();
            this.bubble.removeClass("engage-show");
        };

		var onUsersLoaded = function(data) {
            console.log("onUsersLoaded", this.directoryScreen);
            // todo: unwatch all old users
            this.users = data.users;
            if(!this.directoryScreen) {
                //onDOMReady.apply(this);
                return false;
            }
            this.directoryScreen.find("ul li").remove();
            // todo: look for agents this visitor has chatted with before and highlight them in a featured agents area
            if(this.users && this.directoryScreen) {
                var list = this.directoryScreen.find("ul");
                //console.log(list);
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
                            '<a class="engage-button">Engage Live</a>' +
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
			var label = online ? "Engage Live" : "Send Message";
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
            onUpdateLabel.apply(this);
            //this.setVisibility(!(this.options.hideTabOffline && !this.isAnyoneOnline()));
            updateVisibility.apply(this);
        };

		var onUserClick = function(event) {
			var user = jQuery(event.currentTarget).data("user");
            if(this.sdk.tracking) {
                this.sdk.tracking.customerDomain = user.domain;
                this.sdk.tracking.trackEvent("click", "toolbarViewProfile");
                this.sdk.tracking.customerDomain = null;
            }
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
			window.open(user.profileUrl, "_tab");
		};

		var onTabClick = function(event) {
            this.openDrawer();
		};

        var onTabUserClick = function(event) {
            event.stopImmediatePropagation();
            onShowFirstScreen.apply(this);
            onTabClick.apply(this, [event]);
            onUserClick.apply(this, [event]);
        };

        var onDrawerCloseClick = function(event) {
            this.closeDrawer();
        };

        var onScreenBackClick = function(event) {
            this.screenController.back();
            this.drawer.find(".engage-back").toggleClass("engage-hide", this.screenController.currentIndex == 0);
        };

        var onUpdateLabel = function(event) {
            var labelText = (this.isAnyoneOnline(this)) ? this.options.onlineLabel : this.options.offlineLabel;
            labelText = (labelText) ? labelText : "Engage Live";
            this.tabLabel.text(labelText);
        };

        var onShowFirstScreen = function() {
            console.log("onShowFirstScreen");
            console.log(this.screenController.currentScreen);
            if(this.screenController.currentScreen == null) {
                if(this.options.showSearch) {
                    this.screenController.setScreen(EngageToolbar.SCREENS.SEARCH);
                }else {
                    this.screenController.setScreen(EngageToolbar.SCREENS.DIRECTORY);
                }
            }
        };

        var updateVisibility = function() {
            var isVisible = (!this.explicitlyHide && !(this.options.hideTabOffline && !this.isAnyoneOnline()));
            this.tab.toggleClass("engage-hide", !isVisible);
            if(!isVisible) {
                this.bubble.toggleClass("engage-show", false);
                this.drawer.toggleClass("engage-hide", true);
            }
        };

        EngageToolbar.prototype.setOption = function(name, value) {
            this.options[name] = value;
            switch(name) {
                case "category":
                    //if(this.sdk.tracking) {
                    //    this.sdk.tracking.tag = value;
                    //}
                    this.sdk.getUsers(value, jQuery.proxy(onUsersLoaded, this));
                    break;
                case "directoryTitle":
                    if(this.isInitialized()) {
                        this.drawer.find(".engage-directory-title").text(this.options.directoryTitle);
                    }
                    break;
                case "tabPlacement":
                    if(this.isInitialized()) {
                        var allTabPlacements = "top-left-tab left-tab bottom-left-tab top-right-tab right-tab bottom-right-tab";
                        var tabPlacement = (value) ? value : "right-tab";
                        this.tab.removeClass(allTabPlacements).addClass(tabPlacement);
                        this.bubble.removeClass(allTabPlacements).addClass(tabPlacement);
                        this.drawer.removeClass(allTabPlacements).addClass(tabPlacement);
                    }
                    break;
                case "disableMobileView":
                    if(this.isInitialized()) {
                        this.tab.toggleClass("mobile-enabled", !value);
                        this.bubble.toggleClass("mobile-enabled", !value);
                        this.drawer.toggleClass("mobile-enabled", !value);
                    }
                    break;
                case "onlineLabel":
                    if(this.isInitialized()) {
                        onUpdateLabel.apply(this);
                    }
                    break;
                case "offlineLabel":
                    if(this.isInitialized()) {
                        onUpdateLabel.apply(this);
                    }
                    break;
                case "labelOrientation":
                    if(this.isInitialized()) {
                        if(value == "flipped") {
                            this.tabLabel.addClass("flipped");
                        }else {
                            this.tabLabel.removeClass("flipped");
                        }
                    }
                    break;
                case "backgroundColor":
                    if(this.isInitialized() && value) {
                        this.tab.css("background-color", value);
                        this.tab.find(".engage-statusIndicator").css("border-color", value);
                    }
                    break;
                case "labelColor":
                    if(this.isInitialized() && value) {
                        this.tab.css("color", value);
                    }
                    break;
                case "hideTabOffline":
                    updateVisibility.apply(this);
                    break;
                case "hideOfflineAgents":
                    onSortUserList.apply(this);
                    break;
                case "showOnlineAgentsFirst":
                    onSortUserList.apply(this);
                    break;
                case "agentOrder":
                    onSortUserList.apply(this);
                    break;
                case "showAgentLocation":
                    this.drawer.find(".engage-location").toggle(value == true);
                    break;
                case "showListOnly":
                    if(this.isInitialized()) {
                        this.directoryScreen.toggleClass("engage-list", (value == true));
                    }
                    break;
                case "showSearch":
                    break;
                case "proactive":
                    break;
                case "directoryUrl":
                    if(this.isInitialized()) {
                        var link = this.drawer.find(".engage-directory-link");
                        link.attr("href", value);
                        link.toggle(value != null && value != "");
                    }
                    break;
            }
        };

        EngageToolbar.prototype.isInitialized = function() {
            return this.tab != null;
        };

        EngageToolbar.prototype.openDrawer = function() {
            clearTimeout(this.showProactiveBubbleTimeout);
            this.tab.addClass("engage-hide");
            this.bubble.removeClass("engage-show");
            this.neverOpened = false;
            if(this.sdk.tracking) {
                this.sdk.tracking.trackEvent("click", "toolbarOpen");
            }
            var self = this;
            setTimeout(function() {
                self.drawer.removeClass("engage-hide");
                setTimeout(jQuery.proxy(onShowFirstScreen, self), 300);
            }, 300);
        };

        EngageToolbar.prototype.closeDrawer = function() {
            this.drawer.addClass("engage-hide");
            var self = this;
            setTimeout(function() {
                self.tab.removeClass("engage-hide");
            }, 500);
        };

        EngageToolbar.prototype.setVisibility = function(isVisible) {
            this.explicitlyHide = !isVisible;
            updateVisibility.apply(this);
        };

        EngageToolbar.prototype.isAnyoneOnline = function() {
            if(this.users) {
                for(var i = 0; i < this.users.length; i++) {
                    if(this.sdk.presence.getUserStatus(this.users[i].domain) == "online") {
                        return true;
                    }
                }
            }
            return false;
        };

		return EngageToolbar;

});