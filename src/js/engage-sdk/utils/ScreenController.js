/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery"],
	function(jQuery) {

		'use strict';

		var ScreenController = function() {
			this.screens = new Array();
			this.currentScreen = null;
            this.cssClasses = {
                left: "left",
                right: "right",
                overlay: "overlay",
                hide: "hide",
                background: "background"
            }
			this.clearHistory();
		};

        ScreenController.DIRECTION_BACK = "back";
        ScreenController.DIRECTION_FORWARD = "forward";

		ScreenController.prototype.addScreen = function(screenId, screen) {
			if(this.screens[screenId] == null) {
				this.screens[screenId] = screen;
				screen.css("visibility", "hidden");
			}
		};

		ScreenController.prototype.clearHistory = function() {
			this.history = new Array();
			this.currentIndex = -1;
		};

		ScreenController.prototype.getScreen = function(screenId) {
			return this.screens[screenId];
		};

		ScreenController.prototype.setScreen = function(screenId, direction, hideFromHistory) {
            var inTransition, outTransition;
            var screen = this.screens[screenId];
            if(this.currentScreen == screen) return null;
            if(!screen.hasClass(this.cssClasses.overlay)) {
                if(direction == ScreenController.DIRECTION_BACK) {
                    outTransition = this.cssClasses.right;
                }else {
                    outTransition = this.cssClasses.left;
                }
                if(this.currentScreen != null) {
                    var oldScreen = this.currentScreen;
                    setTimeout(function(){oldScreen.css("visibility", "hidden");}, 700);
                    if(this.currentScreen.hasClass(ScreenController.OVERLAY)) {
                        outTransition = this.cssClasses.hide;
                    }
                    this.currentScreen.addClass(outTransition);
                }
            }else {
                if(this.currentScreen != null) {
                    this.currentScreen.addClass(ScreenController.BACKGROUND);
                }
            }
            screen.css("visibility", "visible");
//			setTimeout(function(){
            screen.removeClass(this.cssClasses.left + " " + this.cssClasses.right + " " + this.cssClasses.overlay + " " + this.cssClasses.hide + " " + this.cssClasses.background);
//			}, 100);
            if(!hideFromHistory) {
                this.history = this.history.slice(0, this.currentIndex + 1);
                this.history.push(screenId);
                this.currentIndex = this.history.length - 1;
            }
            this.currentScreen = screen;
            return screen;
		};

		ScreenController.prototype.back = function(defaultScreen) {
            if(this.currentIndex > 0) {
                this.currentIndex--;
                this.setScreen(this.history[this.currentIndex], ScreenController.DIRECTION_BACK, true);
            }else {
                if(defaultScreen != null) {
                    this.setScreen(defaultScreen, ScreenController.DIRECTION_BACK, true);
                }else {
                    // todo: if mobile, close the app
                    //navigator.notification.confirm("Are you sure you want to exit?", onConfirmExit, "Exit", ["Yes", "No"]);
                }
            }
		};

		ScreenController.prototype.forward = function() {
			if(this.currentIndex < this.history.length - 1) {
				this.setScreen(this.history[++this.currentIndex], ScreenController.DIRECTION_FORWARD, true);
			}
		};

		ScreenController.prototype.resetAllScreens = function() {
			for(var screenId in this.screens) {
				var screen = this.screens[screenId];
				if(!screen.hasClass(this.cssClasses.overlay)) {
					screen.addClass(this.cssClasses.right);
				}else {
					screen.addClass(this.cssClasses.hide);
				}
			}
		};

		ScreenController.prototype.isOverlayOpen = function() {
			return this.currentScreen.hasClass(ScreenController.OVERLAY);
		};

		return ScreenController;

	});