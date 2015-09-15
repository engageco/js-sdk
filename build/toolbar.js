!function(a,b){a.EngageToolbar=b(a.jQuery,a.EngageSDK)}(this,function(a,b){var c,d,e,f=a;return c=function(a){var b=function(){this.screens=new Array,this.currentScreen=null,this.cssClasses={left:"left",right:"right",overlay:"overlay",hide:"hide",background:"background"},this.clearHistory()};return b.DIRECTION_BACK="back",b.DIRECTION_FORWARD="forward",b.prototype.addScreen=function(a,b){null==this.screens[a]&&(this.screens[a]=b,b.css("visibility","hidden"))},b.prototype.clearHistory=function(){this.history=new Array,this.currentIndex=-1},b.prototype.getScreen=function(a){return this.screens[a]},b.prototype.setScreen=function(a,c,d){var e,f=this.screens[a];if(this.currentScreen==f)return null;if(f.hasClass(this.cssClasses.overlay))null!=this.currentScreen&&this.currentScreen.addClass(b.BACKGROUND);else if(e=c==b.DIRECTION_BACK?this.cssClasses.right:this.cssClasses.left,null!=this.currentScreen){var g=this.currentScreen;setTimeout(function(){g.css("visibility","hidden")},700),this.currentScreen.hasClass(b.OVERLAY)&&(e=this.cssClasses.hide),this.currentScreen.addClass(e)}return f.css("visibility","visible"),f.removeClass(this.cssClasses.left+" "+this.cssClasses.right+" "+this.cssClasses.overlay+" "+this.cssClasses.hide+" "+this.cssClasses.background),d||(this.history=this.history.slice(0,this.currentIndex+1),this.history.push(a),this.currentIndex=this.history.length-1),this.currentScreen=f,f},b.prototype.back=function(a){this.currentIndex>0?(this.currentIndex--,this.setScreen(this.history[this.currentIndex],b.DIRECTION_BACK,!0)):null!=a&&this.setScreen(a,b.DIRECTION_BACK,!0)},b.prototype.forward=function(){this.currentIndex<this.history.length-1&&this.setScreen(this.history[++this.currentIndex],b.DIRECTION_FORWARD,!0)},b.prototype.resetAllScreens=function(){for(var a in this.screens){var b=this.screens[a];b.hasClass(this.cssClasses.overlay)?b.addClass(this.cssClasses.hide):b.addClass(this.cssClasses.right)}},b.prototype.isOverlayOpen=function(){return this.currentScreen.hasClass(b.OVERLAY)},b}(f),d=function(a){var b={};return b.orderByOnline=function(b,c){return b.sort(function(b,d){var e=c.getUserStatus(a(b).data("user").domain),f=c.getUserStatus(a(d).data("user").domain);return"online"==e&&"online"!=f?-1:"online"!=e&&"online"==f?1:0})},b.orderByRandom=function(a){return a.sort(function(a,b){return Math.round(Math.random())-.5})},b.orderByAlpha=function(b){return b.sort(function(b,c){var d=a(b).data("user").lastName,e=a(c).data("user").lastName;return e>d?-1:d>e?1:0})},b.orderByLastChat=function(b){return b.sort(function(b,c){var d=Date.parse(a(b).data("user").lastChat),e=Date.parse(a(c).data("user").lastChat);return e>d?-1:d>e?1:0})},b}(f),e=function(a,b,c){var d=function(c,d){this.sdk=c,this.options=d,this.users=null,this.tab=null,this.drawer=null,this.setOption("category",this.options.category),this.screenController=new b,this.screenController.cssClasses.left="engage-left",this.screenController.cssClasses.right="engage-right",a(a.proxy(f,this)),this.neverOpened=!0};d.SCREENS={SEARCH:"search",DIRECTORY:"directory",PROFILE:"profile"};var e=function(a){var b=[];return a.city&&b.push(a.city),a.state&&b.push(a.state),b.join(", ")},f=function(){this.tab=a('<div class="engage-tab mobile-enabled engage-hide"><div class="engage-tab-label"></div><div class="engage-profilePhoto engage-tiny"><div class="engage-photo no-photo"><img></div><div class="engage-statusIndicator engage-online"></div></div></div>'),this.tabLabel=this.tab.find(".engage-tab-label"),this.tabLabel.appendTo(this.tab),this.tab.appendTo(a("body")),this.tab.on("click",a.proxy(o,this)),this.tab.find(".engage-profilePhoto").on("click",a.proxy(p,this)),this.bubble=a('<div class="engage-bubble mobile-enabled"><div class="engage-bubble-close"></div><div class="engage-bubble-message"></div><div class="engage-name"></div><div class="engage-title"></div><a class="engage-button engage-chat">Engage Live</a></div>'),this.bubble.on("click",a.proxy(p,this)),this.bubble.find(".engage-button").on("click",a.proxy(n,this)),this.bubble.find(".engage-bubble-close").on("click",a.proxy(i,this)),this.bubble.appendTo(a("body")),this.drawer=a('<div class="engage-drawer mobile-enabled engage-hide"><div class="engage-header"><div class="engage-directory-title"></div><a class="engage-back engage-hide"></a><a class="engage-close"></a></div><div class="engage-footer"><span class="engage-powered-by">&copy; '+(new Date).getFullYear()+' <a href="http://engage.co" target="tab">Powered By Engage</a></span><a class="engage-directory-link" target="tab">Full Company Directory</a></div><div class="engage-screen engage-search engage-right"></div><div class="engage-screen engage-directory engage-right"><ul></ul></div><div class="engage-screen engage-profile engage-right"><div class="engage-profilePhoto"><div class="engage-photo"><img></div><div class="engage-statusIndicator engage-online"></div></div><div class="engage-name"></div><div class="engage-title"></div><div class="engage-location"></div><hr><div class="engage-bio"></div><div class="engage-button-row"><a class="engage-button engage-button-blue">View Profile</a><a class="engage-button engage-chat">Engage Live</a></div></div></div>'),this.drawer.find(".engage-close").on("click",a.proxy(q,this)),this.drawer.find(".engage-back").on("click",a.proxy(r,this)),this.drawer.find(".engage-button").on("click",a.proxy(n,this)),this.drawer.appendTo(a("body")),this.searchScreen=this.drawer.find(".engage-screen.engage-search"),this.screenController.addScreen(d.SCREENS.SEARCH,this.searchScreen),this.directoryScreen=this.drawer.find(".engage-screen.engage-directory"),this.screenController.addScreen(d.SCREENS.DIRECTORY,this.directoryScreen),this.profileScreen=this.drawer.find(".engage-screen.engage-profile"),this.screenController.addScreen("profile",this.profileScreen),this.setOption("tabPlacement",this.options.tabPlacement),this.setOption("showListOnly",this.options.showListOnly),this.setOption("offlineLabel",this.options.offlineLabel),this.setOption("labelOrientation",this.options.labelOrientation),this.setOption("disableMobileView",this.options.disableMobileView),this.setOption("labelColor",this.options.labelColor),this.setOption("directoryTitle",this.options.directoryTitle),this.setOption("backgroundColor",this.options.backgroundColor),this.setOption("directoryUrl",this.options.directoryUrl),this.users&&j.apply(this,[{users:this.users}])},g=function(b){if(b&&null!=b.profilePhoto&&""!=b.profilePhoto?(this.tab.find(".engage-profilePhoto").data("user",b),this.tab.find(".engage-photo > img").attr("src",b.profilePhoto),this.tab.find(".engage-photo").removeClass("no-photo")):(this.tab.find(".engage-photo > img").attr("src",""),this.tab.find(".engage-photo").addClass("no-photo")),this.tab.toggleClass("engage-show-user",null!=b),this.neverOpened&&b&&this.options.proactive){this.bubble.data("user",b),this.bubble.find(".engage-name").text(b.firstName+" "+b.lastName),this.bubble.find(".engage-title").text(b.title);var c=this.options.proactive.delay?this.options.proactive.delay:1e3;clearTimeout(this.showProactiveBubbleTimeout),this.showProactiveBubbleTimeout=setTimeout(a.proxy(h,this),c)}else this.bubble.removeClass("engage-show")},h=function(){var a=this.sdk.getLocalProperty("proactive-last-displayed"),b=new Date(Date.parse(a)),c=this.options.proactive&&this.options.proactive.frequency?this.options.proactive.frequency:1440,d=new Date(b.getTime()+Math.round(6e4*c));(null==a||d<=new Date)&&(this.sdk.setLocalProperty("proactive-last-displayed",new Date),this.bubble.find(".engage-bubble-message").text(this.options.proactive.message),this.bubble.addClass("engage-show"))},i=function(a){a.stopImmediatePropagation(),this.bubble.removeClass("engage-show")},j=function(b){if(this.users=b.users,this.users&&this.directoryScreen){for(var c=this.directoryScreen.find("ul"),d=0;d<this.users.length;d++){var f=this.users[d],g=a('<li><div class="engage-profilePhoto engage-small"><div class="engage-photo"><img></div><div class="engage-statusIndicator"></div></div><div class="engage-name"></div><div class="engage-title"></div><div class="engage-location"></div><a class="engage-button">Engage Live</a></li>');null!=f.profilePhoto&&""!=f.profilePhoto?g.find(".engage-photo > img").attr("src",f.profilePhoto):g.find(".engage-photo").addClass("no-photo"),g.find(".engage-name").text(f.firstName+" "+f.lastName),g.find(".engage-title").text(f.title),g.find(".engage-location").text(e(f)),g.find(".engage-location").toggle(1==this.options.showAgentLocation),g.attr("data-domain",f.domain),g.data("user",f),g.on("click",a.proxy(m,this)),g.find(".engage-button").on("click",a.proxy(n,this)),c.append(g),this.sdk.presence.watchUser(f.domain,a.proxy(k,this))}this.sdk.presence.start()}},k=function(b,c){var d="online"==b,e=this.directoryScreen.find("li[data-domain='"+c+"']");e.find(".engage-statusIndicator").toggleClass("engage-online",d),e.toggle(d||!this.options.hideOfflineAgents);var f=e.find(".engage-button");f.toggleClass("engage-outline",!d);var g=d?"Engage Live":"Send Message";if(f.text(g),this.currentUser&&this.currentUser.domain==c){this.profileScreen.find(".engage-statusIndicator").toggleClass("engage-online",d);var f=this.profileScreen.find(".engage-button.engage-chat");f.toggleClass("engage-outline",!d),f.text(g)}clearTimeout(this.sortTimeout),this.sortTimeout=setTimeout(a.proxy(l,this),200)},l=function(a){var b=this.directoryScreen.find("li");switch(this.options.agentOrder){case"random":b=c.orderByRandom(b);break;case"alpha":b=c.orderByAlpha(b);break;case"last-chat":default:b=c.orderByLastChat(b)}0!=this.options.showOnlineAgentsFirst&&(b=c.orderByOnline(b,this.sdk.presence)),this.directoryScreen.find("ul").append(b);var d=b.first().data("user"),e="online"==this.sdk.presence.getUserStatus(d.domain);g.apply(this,[e?d:null]),s.apply(this),u.apply(this)},m=function(b){var c=a(b.currentTarget).data("user");this.screenController.setScreen(d.SCREENS.PROFILE),this.drawer.find(".engage-back").removeClass("engage-hide"),this.currentUser=c;var f=this.sdk.presence.getUserStatus(c.domain);"online"==f&&g.apply(this,[this.currentUser]),null!=c.profilePhoto&&""!=c.profilePhoto?(this.profileScreen.find(".engage-photo > img").attr("src",c.profilePhoto),this.tab.find(".engage-photo").removeClass("no-photo")):(this.profileScreen.find(".engage-photo > img").attr("src",""),this.profileScreen.find(".engage-photo").addClass("no-photo")),this.profileScreen.find(".engage-name").text(c.firstName+" "+c.lastName),this.profileScreen.find(".engage-title").text(c.title),this.profileScreen.find(".engage-location").text(e(c)),this.profileScreen.find(".engage-location").toggle(1==this.options.showAgentLocation);var h=a.trim(c.bio).substring(0,140).split(" ").slice(0,-1).join(" ");""!=h&&(h+="..."),this.profileScreen.find(".engage-bio").text(h),k.apply(this,[f,c.domain])},n=function(b){b.stopImmediatePropagation();var c=a(b.currentTarget).parent().data("user")||this.currentUser;window.open(c.profileUrl)},o=function(a){this.openDrawer()},p=function(a){a.stopImmediatePropagation(),t.apply(this),o.apply(this,[a]),m.apply(this,[a])},q=function(a){this.closeDrawer()},r=function(a){this.screenController.back(),this.drawer.find(".engage-back").toggleClass("engage-hide",0==this.screenController.currentIndex)},s=function(a){var b=this.isAnyoneOnline(this)?this.options.onlineLabel:this.options.offlineLabel;b=b?b:"Engage Live",this.tabLabel.text(b)},t=function(){null==this.screenController.currentScreen&&(this.options.showSearch?this.screenController.setScreen(d.SCREENS.SEARCH):this.screenController.setScreen(d.SCREENS.DIRECTORY))},u=function(){var a=!(this.explicitlyHide||this.options.hideTabOffline&&!this.isAnyoneOnline());this.tab.toggleClass("engage-hide",!a),a||(this.bubble.toggleClass("engage-show",!1),this.drawer.toggleClass("engage-hide",!0))};return d.prototype.setOption=function(b,c){switch(this.options[b]=c,b){case"category":this.sdk.getUsers(c,a.proxy(j,this));break;case"directoryTitle":this.isInitialized()&&this.drawer.find(".engage-directory-title").text(this.options.directoryTitle);break;case"tabPlacement":if(this.isInitialized()){var d=c?c:"right-tab";this.tab.addClass(d),this.bubble.addClass(d),this.drawer.addClass(d)}break;case"disableMobileView":this.isInitialized()&&(this.tab.toggleClass("mobile-enabled",!c),this.bubble.toggleClass("mobile-enabled",!c),this.drawer.toggleClass("mobile-enabled",!c));break;case"onlineLabel":this.isInitialized()&&s.apply(this);break;case"offlineLabel":this.isInitialized()&&s.apply(this);break;case"labelOrientation":this.isInitialized()&&this.tabLabel.addClass(c);break;case"backgroundColor":this.isInitialized()&&c&&(this.tab.css("background-color",c),this.tab.find(".engage-statusIndicator").css("border-color",c));break;case"labelColor":this.isInitialized()&&c&&this.tab.css("color",c);break;case"hideTabOffline":break;case"hideOfflineAgents":break;case"showOnlineAgentsFirst":break;case"agentOrder":break;case"showAgentLocation":break;case"showListOnly":this.isInitialized()&&this.directoryScreen.toggleClass("engage-list",1==c);break;case"showSearch":break;case"proactive":break;case"directoryUrl":if(this.isInitialized()){var e=this.drawer.find(".engage-directory-link");e.attr("href",c),e.toggle(null!=c&&""!=c)}}},d.prototype.isInitialized=function(){return null!=this.tab},d.prototype.openDrawer=function(){clearTimeout(this.showProactiveBubbleTimeout),this.tab.addClass("engage-hide"),this.bubble.removeClass("engage-show"),this.neverOpened=!1;var b=this;setTimeout(function(){b.drawer.removeClass("engage-hide"),setTimeout(a.proxy(t,b),300)},300)},d.prototype.closeDrawer=function(){this.drawer.addClass("engage-hide");var a=this;setTimeout(function(){a.tab.removeClass("engage-hide")},500)},d.prototype.setVisibility=function(a){this.explicitlyHide=!a,u.apply(this)},d.prototype.isAnyoneOnline=function(){if(this.users)for(var a=0;a<this.users.length;a++)if("online"==this.sdk.presence.getUserStatus(this.users[a].domain))return!0;return!1},d}(f,c,d),"function"==typeof define&&define.amd&&define("EngageToolbar",[],function(){return e}),e});