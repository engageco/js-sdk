(function(e,t){typeof define=="function"&&define.amd?define(["jquery","EngageSDK"],t):e.EngageToolbar=t(e.jQuery,e.EngageSDK)})(this,function(e,t){var n,r,i;return function(e){function v(e,t){return h.call(e,t)}function m(e,t){var n,r,i,s,o,u,a,f,c,h,p,v=t&&t.split("/"),m=l.map,g=m&&m["*"]||{};if(e&&e.charAt(0)===".")if(t){e=e.split("/"),o=e.length-1,l.nodeIdCompat&&d.test(e[o])&&(e[o]=e[o].replace(d,"")),e=v.slice(0,v.length-1).concat(e);for(c=0;c<e.length;c+=1){p=e[c];if(p===".")e.splice(c,1),c-=1;else if(p===".."){if(c===1&&(e[2]===".."||e[0]===".."))break;c>0&&(e.splice(c-1,2),c-=2)}}e=e.join("/")}else e.indexOf("./")===0&&(e=e.substring(2));if((v||g)&&m){n=e.split("/");for(c=n.length;c>0;c-=1){r=n.slice(0,c).join("/");if(v)for(h=v.length;h>0;h-=1){i=m[v.slice(0,h).join("/")];if(i){i=i[r];if(i){s=i,u=c;break}}}if(s)break;!a&&g&&g[r]&&(a=g[r],f=c)}!s&&a&&(s=a,u=f),s&&(n.splice(0,u,s),e=n.join("/"))}return e}function g(t,n){return function(){var r=p.call(arguments,0);return typeof r[0]!="string"&&r.length===1&&r.push(null),s.apply(e,r.concat([t,n]))}}function y(e){return function(t){return m(t,e)}}function b(e){return function(t){a[e]=t}}function w(n){if(v(f,n)){var r=f[n];delete f[n],c[n]=!0,t.apply(e,r)}if(!v(a,n)&&!v(c,n))throw new Error("No "+n);return a[n]}function E(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function S(e){return function(){return l&&l.config&&l.config[e]||{}}}var t,s,o,u,a={},f={},l={},c={},h=Object.prototype.hasOwnProperty,p=[].slice,d=/\.js$/;o=function(e,t){var n,r=E(e),i=r[0];return e=r[1],i&&(i=m(i,t),n=w(i)),i?n&&n.normalize?e=n.normalize(e,y(t)):e=m(e,t):(e=m(e,t),r=E(e),i=r[0],e=r[1],i&&(n=w(i))),{f:i?i+"!"+e:e,n:e,pr:i,p:n}},u={require:function(e){return g(e)},exports:function(e){var t=a[e];return typeof t!="undefined"?t:a[e]={}},module:function(e){return{id:e,uri:"",exports:a[e],config:S(e)}}},t=function(t,n,r,i){var s,l,h,p,d,m=[],y=typeof r,E;i=i||t;if(y==="undefined"||y==="function"){n=!n.length&&r.length?["require","exports","module"]:n;for(d=0;d<n.length;d+=1){p=o(n[d],i),l=p.f;if(l==="require")m[d]=u.require(t);else if(l==="exports")m[d]=u.exports(t),E=!0;else if(l==="module")s=m[d]=u.module(t);else if(v(a,l)||v(f,l)||v(c,l))m[d]=w(l);else{if(!p.p)throw new Error(t+" missing "+l);p.p.load(p.n,g(i,!0),b(l),{}),m[d]=a[l]}}h=r?r.apply(a[t],m):undefined;if(t)if(s&&s.exports!==e&&s.exports!==a[t])a[t]=s.exports;else if(h!==e||!E)a[t]=h}else t&&(a[t]=r)},n=r=s=function(n,r,i,a,f){if(typeof n=="string")return u[n]?u[n](r):w(o(n,r).f);if(!n.splice){l=n,l.deps&&s(l.deps,l.callback);if(!r)return;r.splice?(n=r,r=i,i=null):n=e}return r=r||function(){},typeof i=="function"&&(i=a,a=f),a?t(e,n,r,i):setTimeout(function(){t(e,n,r,i)},4),s},s.config=function(e){return s(e)},n._defined=a,i=function(e,t,n){if(typeof e!="string")throw new Error("See almond README: incorrect module build, no module name");t.splice||(n=t,t=[]),!v(a,e)&&!v(f,e)&&(f[e]=[e,t,n])},i.amd={jQuery:!0}}(),i("almond",function(){}),i("engage-sdk/utils/ScreenController",["jquery"],function(e){"use strict";var t=function(){this.screens=new Array,this.currentScreen=null,this.cssClasses={left:"left",right:"right",overlay:"overlay",hide:"hide",background:"background"},this.clearHistory()};return t.DIRECTION_BACK="back",t.DIRECTION_FORWARD="forward",t.prototype.addScreen=function(e,t){this.screens[e]==null&&(this.screens[e]=t,t.css("visibility","hidden"))},t.prototype.clearHistory=function(){this.history=new Array,this.currentIndex=-1},t.prototype.getScreen=function(e){return this.screens[e]},t.prototype.setScreen=function(e,n,r){var i,s,o=this.screens[e];if(this.currentScreen==o)return null;if(!o.hasClass(this.cssClasses.overlay)){n==t.DIRECTION_BACK?s=this.cssClasses.right:s=this.cssClasses.left;if(this.currentScreen!=null){var u=this.currentScreen;setTimeout(function(){u.css("visibility","hidden")},700),this.currentScreen.hasClass(t.OVERLAY)&&(s=this.cssClasses.hide),this.currentScreen.addClass(s)}}else this.currentScreen!=null&&this.currentScreen.addClass(t.BACKGROUND);return o.css("visibility","visible"),o.removeClass(this.cssClasses.left+" "+this.cssClasses.right+" "+this.cssClasses.overlay+" "+this.cssClasses.hide+" "+this.cssClasses.background),r||(this.history=this.history.slice(0,this.currentIndex+1),this.history.push(e),this.currentIndex=this.history.length-1),this.currentScreen=o,o},t.prototype.back=function(e){this.currentIndex>0?(this.currentIndex--,this.setScreen(this.history[this.currentIndex],t.DIRECTION_BACK,!0)):e!=null&&this.setScreen(e,t.DIRECTION_BACK,!0)},t.prototype.forward=function(){this.currentIndex<this.history.length-1&&this.setScreen(this.history[++this.currentIndex],t.DIRECTION_FORWARD,!0)},t.prototype.resetAllScreens=function(){for(var e in this.screens){var t=this.screens[e];t.hasClass(this.cssClasses.overlay)?t.addClass(this.cssClasses.hide):t.addClass(this.cssClasses.right)}},t.prototype.isOverlayOpen=function(){return this.currentScreen.hasClass(t.OVERLAY)},t}),i("EngageToolbar",["jquery","engage-sdk/utils/ScreenController"],function(e,t){"use strict";var n=function(n,r){this.sdk=n,this.options=r,this.users=null,this.tab=null,this.drawer=null,this.sdk.getUsers(this.options.category,e.proxy(s,this)),this.screenController=new t,this.screenController.cssClasses.left="engage-left",this.screenController.cssClasses.right="engage-right",e(e.proxy(i,this))};n.SCREENS={SEARCH:"search",DIRECTORY:"directory",PROFILE:"profile"};var r=function(e){var t=[];return e.city&&t.push(e.city),e.state&&t.push(e.state),t.join(", ")},i=function(){this.tab=e('<div class="engage-tab"><div class="engage-tab-label"></div></div>'),this.tab.on("click",e.proxy(f,this));var t=this.options.tabPlacement?this.options.tabPlacement:"right-tab";this.tab.addClass(t),this.options.backgroundColor&&this.tab.css("background-color",this.options.backgroundColor);var r=this.tab.find(".engage-tab-label"),i=this.options.label?this.options.label:"Chat";r.text(i),this.options.labelOrientation&&r.addClass(this.options.labelOrientation),this.options.labelColor&&this.tab.css("color",this.options.labelColor),r.appendTo(this.tab),this.tab.appendTo(e("body")),this.drawer=e('<div class="engage-drawer"><div class="engage-header"><a class="engage-back engage-hide"></a><a class="engage-close"></a></div><div class="engage-screen engage-search engage-right">search</div><div class="engage-screen engage-directory engage-right"><ul></ul></div><div class="engage-screen engage-profile engage-right"><div class="engage-profilePhoto"><div class="engage-photo"><img></div><div class="engage-statusIndicator engage-online"></div></div><div class="engage-name"></div><div class="engage-title"></div><div class="engage-location"></div><hr><div class="engage-bio"></div><div class="engage-button-row"><a class="engage-button engage-button-blue">View Profile</a><a class="engage-button engage-chat">Start Chat</a></div></div></div>'),this.drawer.find(".engage-close").on("click",e.proxy(l,this)),this.drawer.find(".engage-back").on("click",e.proxy(c,this)),this.drawer.find(".engage-button").on("click",e.proxy(a,this)),this.drawer.addClass("engage-hide"),this.drawer.addClass(t),this.drawer.appendTo(e("body")),this.searchScreen=this.drawer.find(".engage-screen.engage-search"),this.screenController.addScreen(n.SCREENS.SEARCH,this.searchScreen),this.directoryScreen=this.drawer.find(".engage-screen.engage-directory"),this.screenController.addScreen(n.SCREENS.DIRECTORY,this.directoryScreen),this.options.showListOnly&&this.directoryScreen.addClass("engage-list"),this.profileScreen=this.drawer.find(".engage-screen.engage-profile"),this.screenController.addScreen("profile",this.profileScreen),this.users&&s.apply(this,[this.users])},s=function(t){this.users=t.users;if(this.directoryScreen){var n=this.directoryScreen.find("ul");for(var i=0;i<this.users.length;i++){var s=this.users[i],f=e('<li><div class="engage-profilePhoto engage-small"><div class="engage-photo"><img></div><div class="engage-statusIndicator"></div></div><div class="engage-name"></div><div class="engage-title"></div><div class="engage-location"></div><a class="engage-button">Chat Now</a></li>');f.find(".engage-photo > img").attr("src",s.profilePhoto),f.find(".engage-name").text(s.firstName+" "+s.lastName),f.find(".engage-title").text(s.title),f.find(".engage-location").text(r(s)),f.find(".engage-location").toggle(this.options.showAgentLocation==1),f.attr("data-domain",s.domain),f.data("user",s),f.on("click",e.proxy(u,this)),f.find(".engage-button").on("click",e.proxy(a,this)),n.append(f),this.sdk.presence.watchUser(s.domain,e.proxy(o,this))}this.sdk.presence.start()}},o=function(e,t){var n=e=="online",r=this.directoryScreen.find("li[data-domain='"+t+"']");r.find(".engage-statusIndicator").toggleClass("engage-online",n);var i=r.find(".engage-button");i.toggleClass("engage-outline",!n);var s=n?"Chat Now":"Send Message";i.text(s);if(this.currentUser&&this.currentUser.domain==t){this.profileScreen.find(".engage-statusIndicator").toggleClass("engage-online",n);var i=this.profileScreen.find(".engage-button.engage-chat");i.toggleClass("engage-outline",!n),i.text(s)}},u=function(t){var i=e(t.currentTarget).data("user");this.screenController.setScreen(n.SCREENS.PROFILE),this.drawer.find(".engage-back").removeClass("engage-hide"),this.currentUser=i,this.profileScreen.find(".engage-photo > img").attr("src",i.profilePhoto),this.profileScreen.find(".engage-name").text(i.firstName+" "+i.lastName),this.profileScreen.find(".engage-title").text(i.title),this.profileScreen.find(".engage-location").text(r(i)),this.profileScreen.find(".engage-location").toggle(this.options.showAgentLocation==1);var s=e.trim(i.bio).substring(0,140).split(" ").slice(0,-1).join(" ")+"...";this.profileScreen.find(".engage-bio").text(s),o.apply(this,[this.sdk.presence.getUserStatus(i.domain),i.domain])},a=function(t){t.stopImmediatePropagation();var n=e(t.currentTarget).parent().data("user")||this.currentUser;window.open(n.profileUrl)},f=function(e){this.tab.addClass("engage-hide");var t=this;setTimeout(function(){t.drawer.removeClass("engage-hide"),t.screenController.currentScreen==null&&(t.options.showSearch?t.screenController.setScreen(n.SCREENS.SEARCH):t.screenController.setScreen(n.SCREENS.DIRECTORY))},300)},l=function(e){this.drawer.addClass("engage-hide");var t=this;setTimeout(function(){t.tab.removeClass("engage-hide")},500)},c=function(e){this.screenController.back(),this.drawer.find(".engage-back").toggleClass("engage-hide",this.screenController.currentIndex==0)};return n.prototype.setVisibility=function(e){tyhis.tab.toggle(e)},n}),i("jquery",function(){return e}),i("EngageSDK",function(){return t}),r("EngageToolbar")});