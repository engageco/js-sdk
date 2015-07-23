define(["jquery"],
	function(jQuery) {

		'use strict';

		var EngageToolbar = function(sdk, options) {
			this.sdk = sdk;
			this.options = options;
            this.users = null;
			this.tab = null;
			this.drawer = null;
			this.currentScreen = null;
            // todo: load users
            this.sdk.getUsers(this.options.categorySlug, jQuery.proxy(onUsersLoaded, this));
		};

        var onUsersLoaded = function(data) {
            this.users = data.users;
            console.log(this.users);
            // todo: draw list
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
                    '<a class="engage-button">Chat Now</a>' +
                '</li>');
                item.find(".engage-photo > img").attr("src", user.profilePhoto);
                item.find(".engage-name").text(user.firstName + " " + user.lastName);
                item.find(".engage-title").text(user.title);
                // todo: check if we should add location
                item.attr("data-domain", user.domain);
                list.append(item);
                this.sdk.presence.watchUser(user.domain, jQuery.proxy(onUserPresenceChange, this));
            }
            this.sdk.presence.start();

        };

        var onUserPresenceChange = function(status, domain) {
            console.log(domain, status);
            this.directoryScreen.find("li[data-domain='" + domain + "'] .engage-statusIndicator").toggleClass("engage-online", status == "online");
        };

		var onTabClick = function() {
			this.tab.addClass("engage-hide");
			var self = this;
			setTimeout(function() {
				self.drawer.removeClass("engage-hide");
                if(self.currentScreen == null) {
                    self.currentScreen = (self.options.showSearch) ? self.searchScreen : self.directoryScreen;
                    self.currentScreen.removeClass("engage-right");
                }
                //self.profileScreen.removeClass("right");
			}, 300);
		};

		var onDrawerCloseClick = function() {
			this.drawer.addClass("engage-hide");
			var self = this;
			setTimeout(function() {
				self.tab.removeClass("engage-hide");
			}, 500);
		};

		EngageToolbar.prototype.draw = function() {
			var self = this;
			jQuery(function() {
				// create tab
				self.tab = jQuery('<div class="engage-tab">' +
					'<div class="engage-tab-label"></div>' +
				'</div>');
				self.tab.on("click", jQuery.proxy(onTabClick, self));
				var tabPlacement = (self.options.tabPlacement) ? self.options.tabPlacement : "right-tab";
				self.tab.addClass(tabPlacement);
				if(self.options.backgroundColor) {
					self.tab.css("background-color", self.options.backgroundColor);
				}
				var label = self.tab.find('.engage-tab-label');
				var labelText = (self.options.label) ? self.options.label : "Chat";
				label.text(labelText);
				if(self.options.labelOrientation) {
					label.addClass(self.options.labelOrientation);
				}
				if(self.options.labelColor) {
					self.tab.css("color", self.options.labelColor);
				}
				label.appendTo(self.tab);
				self.tab.appendTo(jQuery("body"));

                // todo: self.options.showAgentLocation
				// create drawer
				self.drawer = jQuery('<div class="engage-drawer">' +
						'<div class="engage-header">' +
							'<a class="engage-back"></a>' +
							'<a class="engage-close"></a>' +
						'</div>' +
						'<div class="engage-screen engage-search engage-right">search</div>' +
						'<div class="engage-screen engage-directory engage-right">' +
							'<ul>' +
                                //'<li>' +
                                //    '<div class="engage-profilePhoto engage-small">' +
                                //        '<div class="engage-photo"><img src="https://media.licdn.com/media/p/3/000/028/1c9/3227b27.jpg"></div>' +
                                //        '<div class="engage-statusIndicator engage-online"></div>' +
                                //    '</div>' +
                                //    '<div class="engage-name">Danny Patterson</div>' +
                                //    '<div class="engage-title">CTO</div>' +
                                //    '<a class="engage-button">Chat Now</a>' +
                                //'</li>' +
                                //'<li>' +
                                //    '<div class="engage-profilePhoto engage-small">' +
                                //        '<div class="engage-photo"><img src="https://media.licdn.com/media/p/3/000/028/1c9/3227b27.jpg"></div>' +
                                //        '<div class="engage-statusIndicator"></div>' +
                                //    '</div>' +
                                //    '<div class="engage-name">Danny Patterson</div>' +
                                //    '<div class="engage-title">CTO</div>' +
                                //    '<a class="engage-button engage-outline">Send Message</a>' +
                                //'</li>' +
							'</ul>' +
						'</div>' +
						'<div class="engage-screen engage-profile engage-right">' +
                            '<div class="engage-profilePhoto">' +
                                '<div class="engage-photo"><img src="https://media.licdn.com/media/p/3/000/028/1c9/3227b27.jpg"></div>' +
                                '<div class="engage-statusIndicator engage-online"></div>' +
                            '</div>' +
							'profile' +
						'</div>' +
					'</div>');
				self.drawer.on("click", jQuery.proxy(onDrawerCloseClick, self));
				self.drawer.addClass("engage-hide");
				self.drawer.addClass(tabPlacement);
				self.drawer.appendTo(jQuery("body"));

				self.searchScreen = self.drawer.find(".engage-screen.engage-search");
				self.directoryScreen = self.drawer.find(".engage-screen.engage-directory");
                if(self.options.showListOnly) {
                    self.directoryScreen.addClass("engage-list");
                }
				self.profileScreen = self.drawer.find(".engage-screen.engage-profile");

			});
		};

		EngageToolbar.prototype.setVisibility = function(isVisible) {
			tyhis.tab.toggle(isVisible);
		};

		return EngageToolbar;

});