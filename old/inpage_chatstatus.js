if(typeof window.engage_resource_loader == 'undefined'){
(function(window,document){
        "use strict";
        if(!window.console) console = {log:function(){}};
		window.engage_resource_loader = {
			stylesheets : [],
            scripts : [],
			css_onloads : [],
            css_tests : {
                'font-family': 'fontFamily'
                //TODO: add more css-to-js conversion vals in here for additional style tests we want/need to support
            },
			
            //load_js function takes six arguments:
            //  url:    absolute path of javascritp file to load
            //  load_if_exists: boolean, load even if the script has already been loaded w/ the resource loader
            //  onload_funct: false if no need for onload funcitonality, else valid callback function
            //  onload_data: data to be passed into onload_funct
            //  conditional_load_funct: false if no need to check, else a function that returns boolean to determine if the script should be loaded or not
            //  onload_cb_if_noload:    boolean, if a conditional load funct is provided and returns false, should we call the onload anyway (if one is provided)
            load_js : function(url, load_if_exists, onload_funct, onload_data, conditional_load_funct, onload_cb_if_noload ){
                var cb = function(a,b,c,d,e,f){ var aa=a,bb=b,cc=c,dd=d,ee=e,ff=f; return function(){ engage_resource_loader._load_js(aa,bb,cc,dd,ee,ff); }; };
                engage_resource_loader.DOMready( window, cb( url, load_if_exists, onload_funct, onload_data, conditional_load_funct, onload_cb_if_noload  ) );
            },
            
            _load_js : function(url, load_if_exists, onload_funct, onload_data, conditional_load_funct, onload_cb_if_noload ){
                var found = false;
                if(!load_if_exists){
                    for(var i=0,l=engage_resource_loader.scripts.length; i<l; i++){
                        if( url==engage_resource_loader.scripts[i] ){
                            found = true; break;
                        }
                    }
                }
                if( found && !onload_cb_if_noload) return;
                
                var load_script = true;
                if( conditional_load_funct !== false && typeof conditional_load_funct == 'function'){
                    load_script = conditional_load_funct();
                    if(!load_script && !onload_cb_if_noload) return;
                }
                if(!found && load_script){
                    engage_resource_loader.scripts.push(url);
                    var s = document.createElement('script');
                    s.src = url;
                    s.async = true;
                    s.type = 'text/javascript';
                    if(onload_funct !== false && typeof onload_funct == 'function'){
                        var engage_resource_loader_script_onload = function(){ onload_funct( onload_data ) };
                        if(s.readyState){ //IE
                            s.onreadystatechange = function(){
                                if(s.readyState=='loaded' || s.readyState=='complete'){
                                    s.onreadystatechange=null;
                                    engage_resource_loader_script_onload();
                                }
                            };
                        }else{
                            s.onload = engage_resource_loader_script_onload;
                        }
                    }
                    document.getElementsByTagName('HEAD')[0].appendChild(s);
                }else if(onload_funct !== false && typeof onload_funct == 'function'){
                    onload_funct( onload_data );
                }
            },
            
			//load_css function takes two arguments:
			//	url: absolute path of css file to load
			//	onload_params: false if no need to wait for onload functionality, else an object with ALL of the following:
			//		className:	'class name for span you have defined a testable style for in the stylesheet (example: "test_stylesheet_ready") ',
			//		testStyle:	'css style you want to test a value for (example: "font-family") ',
			//		testValue:	'expected css value that will only be present for span w/ class name on style when stylesheet is loaded (example: "css_is_ready") ',
			//		cb_data:	{data obj passed to callback function, any properties/values you need}, 
			//		cb:			callback_function for when stylesheet is loaded and ready
			load_css : function(url, onload_params){
                var cb = function(a,b){ var aa=a,bb=b; return function(){ engage_resource_loader._load_css(aa,bb); }; };
                engage_resource_loader.DOMready( window, cb( url, onload_params ) );
            },
            
            _load_css : function(url, onload_params){
                //deferr until DOM is ready
                
				//see if the stylesheet has already been included (EXACT url match)
				var found = false;
				for(var i=0,l=engage_resource_loader.stylesheets.length; i<l; i++){	
					if( url==engage_resource_loader.stylesheets[i]){
						found = true; break;
					}
				}
				if(!found){
					if (document.createStyleSheet){ //IE specific
						document.createStyleSheet(url);
					}else{
						var link = document.createElement('link');
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = url;
						document.getElementsByTagName('body')[0].appendChild(link); //put at bottom of body so page rules that overlap cascalde correctly
					}
					engage_resource_loader.stylesheets.push(url);
				}
				if(onload_params !== false){
					engage_resource_loader.css_onloads.push(onload_params); //TODO, NOTE: assumes all onload_params are valid and present - check for engage_resource_loader?
					engage_resource_loader.is_stylesheet_loaded(engage_resource_loader.css_onloads.length-1);
				}
			},
            
            //determine if stylesheet is loaded and ready by creating span element w/ specified test class and checking for matched of computed style of test style vs test value
			is_stylesheet_loaded : function(onloads_ind) {
				var opts = engage_resource_loader.css_onloads[onloads_ind];
				var testElem = document.createElement('span');
				testElem.className = opts.className;
				document.getElementsByTagName('body')[0].appendChild(testElem);
                var style_val = engage_resource_loader.get_specific_style_of_elem( testElem, opts.testStyle );
                (typeof style_val != 'undefined' && (style_val === opts.testValue || style_val === opts.testValue+' !important')) ? opts.cb(opts.cb_data) : setTimeout("window.engage_resource_loader.is_stylesheet_loaded("+onloads_ind+");", 250) ;
				document.getElementsByTagName('body')[0].removeChild(testElem); //cleanup
			},
            
            get_specific_style_of_elem : function( elem, get_style ){
                if(window.getComputedStyle) {   //standards-compliant method
					var value = document.defaultView.getComputedStyle(elem, null).getPropertyValue( get_style );
				}else if(elem.currentStyle){ //IE < 9 specific
                    if( typeof engage_resource_loader.css_tests[get_style] != 'undefined' && engage_resource_loader.css_tests[get_style]  != null){
                        get_style = engage_resource_loader.css_tests[get_style];
                    }
                    var value = elem.currentStyle[ get_style ];
                }
                return value;
            },
            
            //cross-browser dom ready funciton, args are window obj ref and cb function
            DOMready : function(win, fn) {
                var done = false, top = true,
                doc = win.document, root = doc.documentElement,
                add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
                rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
                pre = doc.addEventListener ? '' : 'on',
                init = function(e) {
                    if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                    if (!done && (done = true)) fn.call(win, e.type || e);
                },
                poll = function() {
                    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
                    init('poll');
                };
                if (doc.readyState == 'complete') fn.call(win, 'lazy');
                else {
                    if (doc.createEventObject && root.doScroll) {
                        try { top = !win.frameElement; } catch(e) { }
                        if (top) poll();
                    }
                    doc[add](pre + 'DOMContentLoaded', init, false);
                    doc[add](pre + 'readystatechange', init, false);
                    win[add](pre + 'load', init, false);
                }

            },
            
            window_onload: function( func ){
                var oldonload = window.onload;
                if (typeof window.onload != 'function'){
                    window.onload = func;
                } else {
                    window.onload = function(){
                    oldonload();
                    func();
                }
            }
            }
		};
})(window,document); }

(function(window, document){
    "use strict";
    try{
    
    
    if(typeof window.wf_cstat == 'undefined'){
    
        //utility functions
        var _wff = window._wff || {};
        _wff.parse_qparam = function(val) {
            var result = null, tmp = [];
            decodeURI(location.search).replace ( "?", "" ) 
            .split("&")
            .forEach(function (item) {
                tmp = item.split("=");
                if (tmp[0] === val) result = decodeURIComponent(tmp[1]);
            });
            return result;
        };
        _wff.remove_company_id_tag = function(val){
            if(!val || val.length==0) return val;
            return (val.split("|"))[0];
        };
        
        window.wf_cstat = {
            protocol :  'http:',                                    //current protocol being used
            wf_server : window.location.hostname,                   //tld for current script location
            wf_xdomain_domain : "xdomain"+(window.location.hostname=='engage'?'engage':'engage.co'),   //tld for current script location
            css_path :  '/inpage/css/chatstatus.css?lastmod=1424970614',     //path to needed css file for usercard
            css_ready: false,                                       //css loaded & ready to go
            endchat_reconn_timeout: (12*1000),                      //how long to show 'reconnect' option in bubble after chat closes
            _cookie_check_iter: 200,                                //how often to check/read cookies for new info (ms)
            chat_statuses : {},                                     //current chat statuses, keyed by userid, [start_ts,shown]
            chat_bubbles : {},                                      //keyed by userdomain, holds top-level node ref for that userdomain chat happening
            chat_timeouts : {},                                     //timeout ID holder for setTimeout actions when chat is ended
            chat_statuses_cookie_key: 'wf_cstat_statuses',          //cookie name that holds info about which udomains are chatting (this.chat_statuses)
            status_cache_cookie_life : (1000*60*60),                //keep the status cookie for 1 hour
            wrap: false,                                            //has the abs positioned wrapper been added?
            xdiframe_path: '/inpage/html/xdomain_iframe.html',      //endpoint for x-domain iframe src
            stati_path: '/services/status_updater.min.js?lastmod=1424971425', //path to status manager file
            browser_support : false,                                //if true then postMessage is available in this browser
            postload_setup : false,                                 //has the post load (after status updater, css) setup been complete?
            company_id : _wff.remove_company_id_tag( _wff.parse_qparam('company_id') ), //company id
            comp_id_dostatus : true,                                //is this company id supposed to have chatstatus?
            page_url : null,                                        //the page URL (as it was initially loaded)
            page_title : null,                                      //the title of the page (as it was initially loaded)
            page_in_focus : false,                                  //is this page currently in focus??
            page_viewport: {                                        //viewport information for the page (including x/y pos, width, and height)
                'xpos': 0,
                'ypos': 0,
                'width': 0,
                'height': 0,
                'pwidth': 0,
                'pheight': 0
            },
            site_referrer: null,
            cobrowsing_update_inteval : 500,                         //how often to assert that this page has activity still (in MS) and push to iframe
            last_page_activity_data: {},                             //last stored page activity data that was pushed to iframe
            cobrowsing_update_tmo: null,
            force_iframe_ssl: window.location.hostname!='engage'?true:false,
        
            
            //function first called when script loads (on DOM ready)
            setup: function(){ //set the protocol, load the needed CSS, check if window.postMessage is supported, and start the cookie check loop
                
                if( window.location.protocol === 'https:' ) wf_cstat.protocol = 'https:';
                if( 'ENGAGE_XDOMAIN_DOMAIN' in window && window.ENGAGE_XDOMAIN_DOMAIN ) wf_cstat.wf_xdomain_domain = window.ENGAGE_XDOMAIN_DOMAIN
                if( 'postMessage' in window && typeof window.postMessage != 'undefined' ){
                    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
                        if( new Number(RegExp.$1) > 7) wf_cstat.browser_support=true;
                    }else{
                        wf_cstat.browser_support = true;
                    }
                }
                if( !wf_cstat.browser_support ) return; // browser doesn't support needed methods (window.postMessage), so chatbuggles won't work
                wf_cstat.page_url = document.URL;
                wf_cstat.page_title = document.title;
                //bind event listener for page/tab losing & gaining focus
                if(document.addEventListener){
                    window.addEventListener('resize', wf_cstat._update_page_viewport_data, false);
                    window.addEventListener('scroll', wf_cstat._update_page_viewport_data, false);
                }else if(document.attachEvent){
                    window.attachEvent('onresize',wf_cstat._update_page_viewport_data);
                    window.attachEvent('onscroll',wf_cstat._update_page_viewport_data);
                };
                
                var hidden = "hidden";
                // Standards:
                if (hidden in document)
                    document.addEventListener("visibilitychange", _pagevis_onchange);
                else if ((hidden = "mozHidden") in document)
                    document.addEventListener("mozvisibilitychange", _pagevis_onchange);
                else if ((hidden = "webkitHidden") in document)
                    document.addEventListener("webkitvisibilitychange", _pagevis_onchange);
                else if ((hidden = "msHidden") in document)
                    document.addEventListener("msvisibilitychange", _pagevis_onchange);
                // IE 9 and lower:
                else if ('onfocusin' in document){
                    if(document.addEventListener){
                        window.addEventListener('focus',_pagevis_onchange,false);
                        window.addEventListener('blur',_pagevis_onchange,false);
                    }else{
                        window.attachEvent('onfocus',_pagevis_onchange); 
                        window.attachEvent('onblur',_pagevis_onchange); 
                    }
                    //document.onfocusin = document.onfocusout = _pagevis_onchange;
                // All others:
                }else
                    window.onpageshow = window.onpagehide = window.onfocus = window.onblur = _pagevis_onchange;

                    function _pagevis_onchange (evt) {
                        var v = 'visible', h = 'hidden',
                            evtMap = { focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h };
                        evt = evt || window.event;
                        if (evt.type in evtMap)
                            wf_cstat.page_in_focus = evtMap[evt.type]=='hidden' ? false : true;
                        else        
                            wf_cstat.page_in_focus = this[hidden] ? false : true;
                        //console.log(wf_cstat.page_in_focus);
                    }
                
                wf_cstat.site_referrer = document.referrer;
                wf_cstat._update_page_viewport_data();
                wf_cstat.get_resources();
            },
            
            //Grab needed external resources (CSS file & status updater) if they aren't already loaded & ready
            get_resources: function(){
                engage_resource_loader.load_js(
                    wf_cstat.protocol+'//'+wf_cstat.wf_server+wf_cstat.stati_path,
                    false,
                    wf_cstat.status_manager_loaded,
                    null,
                    function(){ return ('engage_stati_upd' in window) ? false : true; },
                    true
                );
                engage_resource_loader.load_css(
                    this.protocol+'//'+this.wf_server+this.css_path, { className:'engage-cstat-css-ready', testStyle: 'font-family', testValue: 'wf-cstat-cssready', cb_data:null, 
                    cb: function(d){ wf_cstat.css_ready=true; } }
                );
                setTimeout(wf_cstat._cookie_check,wf_cstat._cookie_check_iter); //start the cookie check loop
            },            
            
            //This function is called as soon as the status updater is ready, and checks the company ID to make sure they can use chatstatus
            status_manager_loaded: function(d){
                setTimeout(wf_cstat._cookie_check,wf_cstat._cookie_check_iter); //start the cookie check loop
                wf_cstat.comp_id_check_done = true;
            },

             
            //called when all resources are loaded & checks are complete... sets up DOM wrappers and fixes quirks mode issues, and creates iframe for xdomain comm and binds postMessage listeners
            perform_postload_setup : function(){
                if( !('engage_stati_upd' in window) || !wf_cstat.css_ready || !wf_cstat.comp_id_check_done) return;
                wf_cstat.postload_setup = true;
                var d = document.createElement('div'); d.id="wf_cstat_wrap"; document.body.appendChild(d); wf_cstat.wrap=d; //draw wrap
                var i = document.createElement('iframe'); 
                i.id="wf_cstat_xdiframe"; 
                i.name="wf_cstat_xdiframe"; 
                try{
                    i.style.setProperty('display','none','important');
                    i.style.setProperty('width','0px','important');
                    i.style.setProperty('height','0px','important');
                    i.style.setProperty('border','none','important');
                }catch(e){}
                i.src = wf_cstat._get_xdomain_url() + wf_cstat.xdiframe_path+'#'+wf_cstat.company_id;
                document.body.appendChild( i ); d.style.position='fixed';
                if(document.compatMode!='CSS1Compat' && (/MSIE (\d+\.\d+);/.test(navigator.userAgent))){ //handle quirks mode positioning in IE
                    d.style.position='absolute'; document.getElementById('wf_cstat_wrap').style.setExpression("top","( ((ignoreMe = document.body.scrollTop)+1) + 'px' )");
                }
                if(document.addEventListener){ 
                    window.addEventListener('message',wf_cstat._write_status_cookie_from_xdiframe,false);
                }else if(document.attachEvent){ 
                    window.attachEvent('onmessage',wf_cstat._write_status_cookie_from_xdiframe); 
                };
                wf_cstat.cobrowsing_update_tmo = setInterval( wf_cstat._push_page_activity_to_iframe, wf_cstat.cobrowsing_update_inteval );
            },
            
            //update the cobrowsing status cookie to track back to standalone chat (via postmessage to xdomain iframe)
            _push_page_activity_to_iframe: function(){
                var xdif_win = wf_cstat._get_xdomain_win();
                if(!xdif_win) return;
                var url = wf_cstat.page_url;
                var new_data = {
                    'page_url':     wf_cstat.page_url,
                    'page_title':   wf_cstat.page_title,
                    'in_focus':     wf_cstat.page_in_focus,
                    'viewport':     wf_cstat.page_viewport,
                    'referrer':     wf_cstat.site_referrer
                }
                var json_data = _wfs._encode_json(new_data);
                if( wf_cstat.last_page_activity_data===json_data ) return; //no change
                wf_cstat.last_page_activity_data = json_data;
                new_data['type'] = 'cobrowse_data';
                xdif_win.postMessage( _wfs._encode_json(new_data), wf_cstat._get_xdomain_url() );
            },
            
            //pause iframe from updating/touching cobrowse tracking cookie
            pause_cobrowse_touch : function(){
                var xdif_win = wf_cstat._get_xdomain_win();
                if(!xdif_win) return;
                xdif_win.postMessage( _wfs._encode_json({'type':'pause_cobrowse'}), wf_cstat._get_xdomain_url() );
            },

            
            //iteration function for updaing the chat statuses on this page from the cookie
            _cookie_check: function(){
                if( !wf_cstat.css_ready || !('_wfs' in window) ) return setTimeout(wf_cstat._cookie_check,wf_cstat._cookie_check_iter);
                if( !wf_cstat.postload_setup ){
                    if(wf_cstat.comp_id_dostatus!==true) return;
                    wf_cstat.perform_postload_setup();
                }
                var cache = _wfs._get_cache_cookie( wf_cstat.chat_statuses_cookie_key ) || {};
                for( var udomain in wf_cstat.chat_statuses ){
                    if(!wf_cstat.chat_statuses.hasOwnProperty(udomain)) continue;
                    if( !(udomain in cache) ) wf_cstat._hide( udomain, false, false ); //chat is no longer occuring
                }
                wf_cstat.chat_statuses = cache;
                var ud_cnt = 0;
                for( var udomain in wf_cstat.chat_statuses ){
                    if(!wf_cstat.chat_statuses.hasOwnProperty(udomain)) continue;
                    ud_cnt++;
                    !wf_cstat.chat_statuses[udomain][1] ? wf_cstat._hide( udomain, true, false ) : wf_cstat._show_chat( udomain, true );
                }
                setTimeout(wf_cstat._cookie_check,wf_cstat._cookie_check_iter);
            },
            
            //show (start) a new chat for a userdomain
            _show_chat : function( udomain , do_forcehide ){
                wf_cstat._force_hide( udomain );
                if( udomain in wf_cstat.chat_bubbles ) return; //already shown
                wf_cstat.chat_bubbles[udomain]=true;
                var cbf = function(ud){ var u=ud; return function(s,d){ wf_cstat._draw_bubble(u,s,d); } }
                _wfs.user_info_lookup( udomain, cbf(udomain) );
            },
            
            //callback funct from user info lookup after a chat is started - draws the chat bubble & sets up event listeners if using server polling
            _draw_bubble: function(udomain,success,data){
                if(!success) return delete wf_cstat.chat_bubbles[udomain];
                
                var _c = function(a){ return document.createElement(a);}, w = wf_cstat.wrap;
                var cb=_c('div'); cb.className='wf_chatbub'; w.childNodes.length==0 ? w.appendChild(cb) :w.insertBefore(cb,w.childNodes[0]); //bubble
                var cc=_c('div'); cc.className='wf_chatbubc'; cb.appendChild(cc); //bubblecont
                var iw=_c('div'); iw.className='imgw'; cc.appendChild(iw); //imgwrap
                var im=_c('div'); im.className='imgm'; iw.appendChild(im); //imgmask
                var i=_c('img'); i.height=53; i.src=data.img_path; im.appendChild(i); //img
                
                var rw=_c('div'); rw.className='rcont'; cc.appendChild(rw); //rightcont
                var rd=_c('div'); rd.id='wf_chatdesc_'+udomain; rd.className='desc'; rd.innerHTML='You are currently chatting with:'; rw.appendChild(rd); //top label
                var eb=_c('div'); eb.id='wf_chatdesc_endchat_'+udomain; eb.className='endb'; eb.innerHTML='END CHAT'; eb.title="End your current chat with this person"; eb.onclick=function(){wf_cstat._end_chat(udomain);}; rw.appendChild(eb); //end button
                //TODO: remove when end chat works (w/ ExternalInterface call from SWF in standalone chat)
                eb.style.display = 'none';
                
                var bb=_c('div'); bb.id='wf_chatdesc_hide_'+udomain; bb.className='hideb'; bb.innerHTML='HIDE'; bb.title="Hide this chat status notification"; bb.onclick=function(){wf_cstat._hide(udomain,true,true);}; rw.appendChild(bb); //hide button
                var rn=_c('div'); rn.className='uname'; rn.innerHTML=data.name; rw.appendChild(rn); //name
                var pl=_c('a'); pl.className='vprof'; pl.href="http://"+wf_cstat.wf_server+"/e/"+udomain; pl.target="_blank"; pl.innerHTML='View Profile >'; pl.title="Click to view my profile page"; rw.appendChild(pl); //profile link
                var tt=_c('div'); tt.className='title'; tt.innerHTML=data.title; rw.appendChild(tt); //title
                wf_cstat.chat_bubbles[udomain] = cb;
                cb.style.cursor = 'pointer'; cb.title = 'Click to go to chat session';
                var cbf = function(udomain){ var d=udomain; return function(e){ wf_cstat.open_existing_chat(e,udomain); }};
                if(document.addEventListener){cb.addEventListener('mouseup',cbf(udomain),false);}else if(document.attachEvent){ cb.attachEvent('onmouseup',cbf(udomain)); }else{ cb.onmouseup=cbf(udomain); }
                wf_cstat._fade(cb,0,true);
            },
            
            open_existing_chat: function(evt, udomain){
                if( !(udomain in wf_cstat.chat_statuses) ) return;
                var evt = (evt || window.event),
                    targ = (evt.target || evt.srcElement);
                if( !targ ) return; //DUMB hack for old IE
                if(targ.className=='vprof' || targ.className=='hideb' || targ.className=='endb') return; //view profile link or hide button clicked
                var xdif_win = wf_cstat._get_xdomain_win();
                if(!xdif_win) return;
                var payload = _wfs._encode_json( {'type':'chat_focus','udomain':udomain} );
                xdif_win.postMessage( payload, wf_cstat._get_xdomain_url() );
            },
            
            _get_xdomain_win : function(){
                var xdif = document.getElementById('wf_cstat_xdiframe');
                if( !xdif ) return false;
                var xdif_win = xdif.contentWindow || window.iframes['wf_cstat_xdiframe'];
                return xdif_win;
            },
            
            chat_ended: function( udomain ){
                if( !(udomain in wf_cstat.chat_bubbles) ) return;
                wf_cstat.chat_bubbles[udomain].style.cursor = 'auto'; //change cursor (from pointer);
                var cur_ts = new Date().getTime(),
                    chat_len = cur_ts-wf_cstat.chat_statuses[udomain][0],
                    chat_mins = Math.floor(((chat_len)/1000)/60),
                    chat_secs = Math.floor((chat_len/1000)-(chat_mins*60));
                //change text in bubble to 'chat ended' context
                var d = document.getElementById('wf_chatdesc_'+udomain); d.innerHTML='';
                var eb = document.getElementById('wf_chatdesc_endchat_'+udomain);
                var hd = document.getElementById('wf_chatdesc_hide_'+udomain);
                var rc = document.createElement('a'); rc.className='reconn'; rc.innerHTML='RECONNECT'; rc.title="Reconnect with this person"; rc.target="_blank"; rc.href=wf_cstat.protocol+"//"+wf_cstat.wf_server+"/connect/"+udomain+'?f=6';
                hd.parentNode.insertBefore(rc,hd.nextSibling);
                eb.style.display = 'none';
                hd.style.display = 'none';
                var ls = document.createElement('span'); ls.innerHTML='Chat Ended'; d.appendChild(ls);
                var ts = document.createElement('span'); ts.className='time'; ts.innerHTML='&nbsp;('+chat_mins.toString()+':'+(chat_secs.toString().length==1?'0':'')+chat_secs+')'; d.appendChild(ts);
                wf_cstat.chat_timeouts[udomain] = setTimeout(function(){ wf_cstat._hide( udomain, true, false );}, wf_cstat.endchat_reconn_timeout);
            },
            
            _write_status_cookie_from_xdiframe : function(evt){
                var evt = evt || window.event;
                if( evt.origin != wf_cstat._get_xdomain_url() ) return;
                var cval = _wfs._parse_json( evt.data.toString() ),
                    _cookie = _wfs._get_cache_cookie( wf_cstat.chat_statuses_cookie_key ) || {},
                    changed = false;
                for( var udomain in cval){
                    if( !cval.hasOwnProperty(udomain) ) continue;
                    if( !(udomain in _cookie) ){
                        _cookie[udomain] = [ cval[udomain], true ];
                        changed = true;
                    }
                }
                for( var udomain in _cookie){
                    if( !_cookie.hasOwnProperty(udomain) ) continue;
                    if( !(udomain in cval) ){ //chat was ended
                        delete _cookie[udomain];
                        changed = true;
                    }
                }
                if(changed) _wfs._set_cache_cookie( wf_cstat.chat_statuses_cookie_key, _cookie, wf_cstat.status_cache_cookie_life );
            },
            
            _force_hide: function(udomain){
                if( !(udomain in wf_cstat.chat_timeouts) ) return;
                clearTimeout(wf_cstat.chat_timeouts[udomain]);
                delete wf_cstat.chat_timeouts[udomain];
                var el = wf_cstat.chat_bubbles[udomain];
                if( !el ) return;
                delete wf_cstat.chat_bubbles[udomain];
                wf_cstat._fade( el, 10, false); //delete 'reconn' bubble
            },
            
            _end_chat: function(udomain){
                if( !(udomain in wf_cstat.chat_statuses) ) return;
                var xdif_win = wf_cstat._get_xdomain_win();
                if(!xdif_win) return;
                var payload = _wfs._encode_json( {'type':'chat_end','udomain':udomain} );
                xdif_win.postMessage( payload, wf_cstat._get_xdomain_url() );
            },
            
            _hide: function(udomain, manual_hide, update_cookie){
                if( !(udomain in wf_cstat.chat_statuses) && !manual_hide ) return;
                if( udomain in wf_cstat.chat_statuses && update_cookie){
                    wf_cstat.chat_statuses[udomain][1] = false;
                    wf_cstat._upd_status_cache();
                }
                if(!manual_hide) return wf_cstat.chat_ended( udomain );//chat ended (not 'hide button' clicked or user action)
                if(wf_cstat.chat_bubbles[udomain]){ //verify it still exists before hiding
                    var elem = wf_cstat.chat_bubbles[udomain];
                    delete wf_cstat.chat_bubbles[udomain];
                    wf_cstat._fade( elem, 100, false);
                }
            },
            
            _fade: function(elem,cur_opacity,adding){
                if( !elem ) return;
                var style = elem.style,
                    cur_opacity = (adding ? cur_opacity+10 : cur_opacity-10);
                if( !style ) return;
                style.opacity=(cur_opacity/100); style.MozOpacity=(cur_opacity/100); style.KhtmlOpacity=(cur_opacity/100); style.filter="alpha(opacity="+cur_opacity+")";
                if(cur_opacity != 100 && cur_opacity != 0) setTimeout(function(){wf_cstat._fade(elem,cur_opacity,adding);},50);
                if(cur_opacity == 0) wf_cstat.wrap.removeChild( elem );
                
            },
            
            _upd_status_cache: function(){
                _wfs._set_cache_cookie( wf_cstat.chat_statuses_cookie_key, wf_cstat.chat_statuses, wf_cstat.status_cache_cookie_life );
            },
            
            _update_page_viewport_data: function(e){
                var e = window
                , a = 'inner';
                if ( !( 'innerWidth' in window ) ){
                    a = 'client';
                    e = document.documentElement || document.body;
                }
                wf_cstat.page_viewport['width'] = e[a+'Width'];
                wf_cstat.page_viewport['height'] = e[a+'Height'];
                wf_cstat.page_viewport['pwidth'] = Math.max( e[a+'Width'], document.body.scrollWidth);
                wf_cstat.page_viewport['pheight'] = Math.max( e[a+'Height'], document.body.scrollHeight);
                wf_cstat.page_viewport['ypos'] = window.pageYOffset || document.documentElement.scrollTop;
                wf_cstat.page_viewport['xpos'] = window.pageXOffset || document.documentElement.scrollLeft;
                wf_cstat._push_page_activity_to_iframe();
            },
            
            _get_xdomain_url: function(){
                var xdu = wf_cstat.wf_xdomain_domain.replace("<CID>.","");//.replace("<CID>",wf_cstat.company_id);
                return (wf_cstat.force_iframe_ssl ? 'https:' : wf_cstat.protocol) + '//' + xdu;
            }
            
        };
        engage_resource_loader.DOMready( window, function(){ wf_cstat.setup(); } );
    };
    }catch(e){ if('engage_err_log' in window){if('WF_ERR_LOG_PREVENT_CATCH' in window){throw(e);}else{engage_err_log.err( e.name+' - '+e.message, e.fileName || false, e.lineNumber || false );}}}
})(window,document);