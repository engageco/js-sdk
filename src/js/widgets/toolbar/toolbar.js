define(["jquery"],
	function(jQuery) {

		'use strict';

		var EngageToolbar = function(sdk, options) {
			this.sdk = sdk;
			this.options = options;
			console.log(options);
		};

		EngageToolbar.prototype.draw = function() {
			var self = this;
			jQuery(function() {
				self.tab = jQuery('<div class="engage-tab"></div>');
				var tabPlacement = (self.options.tabPlacement) ? self.options.tabPlacement : "right-tab";
				self.tab.addClass(tabPlacement);
				if(self.options.backgroundColor) {
					self.tab.css("background-color", self.options.backgroundColor);
				}
				self.label = jQuery('<div class="engage-tab-label"></div>');
				var labelText = (self.options.label) ? self.options.label : "Chat";
				self.label.text(labelText);	
				if(self.options.labelOrientation) {
					self.label.addClass(self.options.labelOrientation);
				}
				if(self.options.labelColor) {
					self.tab.css("color", self.options.labelColor);
				}
				self.label.appendTo(self.tab);
				self.tab.appendTo(jQuery("body"));
			});
		};

		EngageToolbar.prototype.setVisibility = function(isVisible) {
			tyhis.tab.toggle(isVisible);
		};

		return EngageToolbar;

});