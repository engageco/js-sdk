(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['jquery', 'EngageSDK'], factory);
    } else {
        // Browser globals
        root.EngageToolbar = factory(root.jQuery, root.EngageSDK);
    }
}(this, function(jQuery, EngageSDK) {/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/**
 *
 *
 * @author Danny Patterson
 */

define('engage-sdk/utils/ScreenController',["jquery"],
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
/**
 *
 *
 * @author Danny Patterson
 */

define('widgets/utils/SortOrderUtil',["jquery"],
	function(jQuery) {

		'use strict';

		var SortOrderUtil = {};

        SortOrderUtil.orderByOnline = function(list, presence) {
            return list.sort(function(a, b) {
                    var userAStatus = presence.getUserStatus(jQuery(a).data("user").domain);
                    var userBStatus = presence.getUserStatus(jQuery(b).data("user").domain);
                    if(userAStatus == "online" && userBStatus != "online") {
                        return -1;
                    }else if(userAStatus != "online" && userBStatus == "online") {
                        return 1;
                    }
                    return 0;
                });
        };

        SortOrderUtil.orderByRandom = function(list) {
            return list.sort(function(a, b) {
                    return Math.round(Math.random()) - 0.5;
                });
        };

        SortOrderUtil.orderByAlpha = function(list) {
            return list.sort(function(a, b) {
                    var userALastName = jQuery(a).data("user").lastName;
                    var userBLastName = jQuery(b).data("user").lastName;
                    if(userALastName < userBLastName) {
                        return -1;
                    }else if(userALastName > userBLastName) {
                        return 1;
                    }
                    return 0;
                });
        };

        SortOrderUtil.orderByLastChat = function(list) {
            return list.sort(function(a, b) {
                var userALastChat = Date.parse(jQuery(a).data("user").lastChat);
                var userBLastChat = Date.parse(jQuery(b).data("user").lastChat);
                if(userALastChat < userBLastChat) {
                    return -1;
                }else if(userALastChat > userBLastChat) {
                    return 1;
                }
                return 0;
            });
        };

        //SortOrderUtil.orderByDistance = function(list, lat, long) {
        //    // todo
        //    return list;
        //};

        //SortOrderUtil.orderByCategory = function(list, categoryOrder) {
        //    // todo
        //    return list;
        //};

		return SortOrderUtil;

	});
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

	define("jquery", function () {
        return jQuery;
    });
    define("EngageSDK", function () {
        return EngageSDK;
    });
    
    return require("EngageToolbar");
}));