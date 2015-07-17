define(["jquery"],
	function(jQuery) {

		'use strict';

		var EngageToolbar = function(sdk, options) {
			this.sdk = sdk;
			this.options = options;
		};

		EngageToolbar.prototype.draw = function() {
			this.tab = jQuery('<div class="engage-tab"></div>');
			var tabPlacement = (this.options.tabPlacement) ? this.options.tabPlacement : "right-tab";
			this.tab.addClass(tabPlacement);
			if(this.options.backgroundColor) {
				this.tab.css("background-color", this.options.backgroundColor);
			}
			this.label = jQuery('<div class="engage-tab-label"></div>');
			var labelText = (this.options.label) ? this.options.label : "Chat";
			this.label.text(labelText);	
			if(this.options.labelOrientation) {
				this.label.addClass(this.options.labelOrientation);
			}
			if(this.options.labelColor) {
				this.tab.css("color", this.options.labelColor);
			}
			this.label.appendTo(this.tab);
			this.tab.appendTo(jQuery("body"));
		}

		return EngageToolbar;

});