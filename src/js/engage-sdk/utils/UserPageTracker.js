/**
 *
 *
 * @author Danny Patterson
 */

define("UserPageTracker",
      ["jquery"],
	function(jQuery) {

		'use strict';

		var config = {
			xdomainURL: "https://xdomain.engage.co",
			xdomainIframePath: "/inpage/html/xdomain_iframe.php",
			xDomainIframeID: "wf_cstat_xdiframe",
			cobrowsingUpdateInteval: 500
		};

		var UserPageTracker = function(companyHash) {
			this.companyHash = companyHash;
			this.currentPageData = {
				page_url: "",
				page_title:"",
				in_focus: false,
				viewport: {
					xpos: 0,
					ypos: 0,
					width: 0,
					height: 0,
					pwidth: 0,
					pheight: 0
				},
				referrer: ""
			};
			this.lastPageDataJSON = {};
		};

		var onPushPageActivityToIframe = function() {
			if(this.xDomainIframeWindow) {
	            var pageDataJSON = JSON.stringify(this.currentPageData);
	            if(this.lastPageDataJSON != pageDataJSON) {
	            	this.lastPageDataJSON = pageDataJSON;
	            	// console.log(this.currentPageData);
	            	var pageDataCobrowsePacket = JSON.parse(pageDataJSON);
					pageDataCobrowsePacket.type = "cobrowse_data";
            		this.xDomainIframeWindow.postMessage(JSON.stringify(pageDataCobrowsePacket), config.xdomainURL);
	            }
            }
		};

		var onUpdatePageFocus = function(event) {
			// console.log("onUpdatePageFocus", document.visibilityState);
			this.currentPageData.in_focus = document.visibilityState == "visible";
			onPushPageActivityToIframe.apply(this);
		}
		var onUpdatePageViewport = function(event) {
			// console.log("onUpdatePageViewport");
			var body = jQuery("body");
			this.currentPageData.viewport.xpos = body.scrollLeft();
			this.currentPageData.viewport.ypos = body.scrollTop();
			this.currentPageData.viewport.width = jQuery(window).width(); //body.width();
			this.currentPageData.viewport.height = jQuery(window).height(); //body.height();
			this.currentPageData.viewport.pwidth = Math.max(body.get(0).scrollWidth, jQuery(window).width());
			this.currentPageData.viewport.pheight = Math.max(body.get(0).scrollHeight, jQuery(window).height());
            //console.log(this.currentPageData.viewport);
			onPushPageActivityToIframe.apply(this);
		}

		UserPageTracker.prototype.init = function() {
			var self = this;
			jQuery(function() {

				if(window.wf_cstat == null) window.wf_cstat = {};

				// todo: check if the iframe already exists on the page; if it does, then skip all this and don't initalize

				// todo: find cleaner way to detect postmessage feature support
				var browserSupport = false
                if('postMessage' in window && typeof window.postMessage != 'undefined'){
                    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
                        if(new Number(RegExp.$1) > 7) {
                        	browserSupport = true;
                        }
                    }else{
                        browserSupport = true;
                    }
                }
                if(!browserSupport) return;

                self.currentPageData.page_url = document.URL;
                self.currentPageData.page_title = document.title;
                self.currentPageData.referrer = document.referrer;
                onUpdatePageViewport.apply(self);
                onUpdatePageFocus.apply(self);

                jQuery(window).on("resize", jQuery.proxy(onUpdatePageViewport, self));
                jQuery(window).on("scroll", jQuery.proxy(onUpdatePageViewport, self));
                jQuery(document).on("visibilitychange", jQuery.proxy(onUpdatePageFocus, self));

                self.xDomainIframe = jQuery("<iframe>", {
	                	id: config.xDomainIframeID,
	                	name: config.xDomainIframeID
	                });
                self.xDomainIframe.on("load", function() {
					self.xDomainIframeWindow = self.xDomainIframe.get(0).contentWindow || window.iframes[config.xDomainIframeID];
                })
                self.xDomainIframe.attr("src", config.xdomainURL + config.xdomainIframePath + "?ts=" + new Date().valueOf() + '#' + self.companyHash);
                self.xDomainIframe.css("display", "none");
                self.xDomainIframe.css("width", 0);
                self.xDomainIframe.css("height", 0);
                self.xDomainIframe.css("border", "none");
                try{
                    self.xDomainIframe.style.setProperty("display",'none','important');
                }catch(e){}
				self.xDomainIframe.appendTo(jQuery("body"));

                self.cobrowsingUpdateTimeout = setInterval(jQuery.proxy(onPushPageActivityToIframe, self), config.cobrowsingUpdateInteval);

			});
		};

		return UserPageTracker;

	});