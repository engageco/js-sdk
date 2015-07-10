
/*
This javascript class is intended to be defined once in the global namespace, and is responsible for updating all the status images and other status items throughout the page in realtime, as well as getting/caching user info
It updates every 3 seconds, and caches urls for dupliacted users buttons throughout the page for performance

The interval timer is started w/ the init function and the heartbeat is every this.status_update_interval seconds. On the first interval, and every this.update_imgs_every_iter interval, the page is scanned for
any present status images in case they are added dynamically, or were slow to load in the request/response cycle when init was called. Any non-image indicator of any kind can be added to the listener via
the add_indicator function at any time during execution, which will be picked up on the next heartbeat.

Additionally, the class has an optional digest callback that simply sends the status of every present user (NOT those using image status indicators) on every heartbeat. To subscribe to this callback, pass in a listener
function that takes 1 parameter (statuses) as input to the subscribe_to_digest_cb function and a namspace for that listener (to unsubscribe later if needed)

NOTE: to specificy a different url (aka for testing) other than console.engage.co, simply create a JS variable in the global namespace called ENGAGE_STATUS_PING_DOMAIN, with the TLD and a forward slash (ex "test_domain.com/")
*/

(function(window, document){
    "use strict";
    if(!window.console) console = {log:function(){}};
    try{
	window.engage_stati_upd = window.engage_stati_upd || {
        indicators : [],                                //all status indicators present (which aren't img tags) in format {type:'type of indicator',namespace:'whatever_ns',user:'userDomain',cb_data:{any data for cb},cb:callback(new_status,cb_data) or boolean(false) for no cb}
            //NOTE: for the current implementation, we are assuming that ALL non-img indicators are fully cacheable and interchangable because they only include user & status - support for independent 'type' caching will come later if/when needed
		imgs: [],                                       //all on-page status images (NOT nesessarily a status indicator, but a status element of type <img> tag w/ the img status url
		timer: null,                                    //interval pointer for heartbeat timer
		status_update_interval: 5,						//how often to update the user status (in seconds)
		iter_cnt: 0,									//iteration interval cnt, for tracking how often to update img list
		update_imgs_every_iter: 20,						//how often (iteration count) should we update the image list on the page in case of dynamic content or delayed loading?
		img_class_name: 'engage_status_indicator',	//classname for all status images used on pages
		prot: 'http:',								    //current window protocol
        ping_domain: "console.engage.co/",                   //TLD for ping endpoints
		status_path: 'online-status-img/',				//path after domain to the status images
        batch_status_upd_path: 'api_1.php/api/getOnlineStatusJson',           //path for jsonp batch status ping endpoint
		cache_user_urls: {},							//user-keyed object that is cleared every time and interval hits, caching for multiple users on the same page
        user_statuses: {},                              //user keyed list of statuses to pass into all callbacks for elements in this.inidcators
        single_offline: {},                             //user keyed list of users marked as offline only once after being online - used to account for network latency/hiccup when marking users as offline (must be offline for 2 consecutive requests)
        do_double_offline_checks: false,                //force the user to show up offline for TWO iters before changing (if hte user was online previously)
        users: [],                                      //array of unique user domains that need to be checked for status
        invalid_users: {},                              //users flagged as invalid (not included in response from status ping)
        companies: {},                                  //known/valid list of user domains keyed by company_id|?tag?
        xdomain_calls : [],                             //list of all cross-domain script instances
        global_xdomain_cbs : {},                        //global cb list for try/catch validation (to use timeout & regular callbacks)
        digest_cb_listeners : [],                       //list of all callbacks subscribed to the digest response
        user_cb_change_listeners : [],                  //list of all callbacks subscribed to for individual user status change calls
        company_cb_listeners : {},                      //obj w/ all subscribed callback listeners for company-level status keyed by company_id|?tag?, val is array of present cbs for that key
        next_heartbeat_ts : null,                       //millisecond timestamp of next expected heartbeat
        check_now_ms_tolerance : 500,                   //milliseconds that this.check_now() is allowed to call before next heartbeat (else it is just ignored)
        status_check_ajax_timeout : (1000*8),           //milliseconds an ajax call to status check can be pending before timed out
        highest_returned_key : 0,                       //so latency doesn't cause overlapping reqs
        track_chat_date_tolerance: 10,                  //ignore any tracked chats older than 10 days
        
        //special case nodejs enpoints
        nping_domain: "https://status.engage.co/",
        nbatch_status_upd_path: "user-status",
        use_nodejs : true, 
        
        uinfo_cache : {},                               //for caching info about individual user lookups
        uinfo_domain: 'console.engage.co/',                  //TLD for uinfo lookup endpoints
        uinfo_path: 'api_1.php/api/getUserInfo',        //path for looking up user info
        uinfo_cbs : {},                                 //keyed list of callbacks for userinfo calls
        uinfo_cache_key : 'wf_uinfo_cache:',            //cache key for cookie info cache
        uinfo_fail_recheck_allowance : {},              //when next recheck is allowed for this udomain (if it failed previously)
        uinfo_recheck_tmo : (15*1000),                  //how often to allow a uninfo recheck after failure (in ms)
        cinfo_cache : {},                               //for caching lists of user domains by company & optional tag
        cinfo_domain: 'console.engage.co/',                  //TLD for cinfo lookup endpoints
        cinfo_path: 'api_1.php/api/getCompanyTagUsers', //path for looking up company/tag users
        cinfo_cbs: {},                                  //keyed list of callbacks for cinfo calls
        cinfo_cache_key : 'wf_cinfo_cache:',            //cache key for cookie info cache
        
        force_node : true,                              //force node.js endpoints (rather han WF symfony proxy)
        has_run : false,                                //prevents multiple init calls
        wf_statf_bound: false,                          //has the function caller been bound to window._wff ?
        global_ready_called: null,  
        
        //functions that can be run before script is fully loaded (or anytime during page execution). Format is siply a closure function to run that takes no arguments
        wf_dofunction: {
            push: function( funct ){
                if( !_wfs.wf_statf_bound && funct===false){
                    _wfs.wf_statf_bound = true;
                    var run_f = ('_wff' in window && typeof(window._wff)==='object') ? window._wff.slice(0) : [];
                    window._wff = _wfs.wf_dofunction;
                    for(var i=0; i<run_f.length; i++) run_f[i]();
                }else if(_wfs.wf_statf_bound){
                    funct();
                }
            }
        },
        
        //start interval checking - first fuction called, right after class is defined
		init: function(){
            if( _wfs.has_run ) return;
            _wfs.has_run = true;
            var allow_node=false;
			if(window.location.protocol == 'https:') _wfs.prot = 'https:';
            //if(_wfs.force_node || window.location.host=='console.engege.co' || window.location.host=='engage' || window.location.host=='test.engage') _wfs.use_nodejs = true;
            if( typeof ENGAGE_STATUS_PING_DOMAIN != 'undefined' && ENGAGE_STATUS_PING_DOMAIN != "") _wfs.ping_domain =ENGAGE_STATUS_PING_DOMAIN;
            _wfs._set_heartbeat_ts();
            _wfs.timer = setInterval(_wfs._update_status, _wfs.status_update_interval*1000);
            var loaded_ms = new Date();
            _wfs.global_ready_called = setInterval(function(){
                    if('engage_status_service_ready' in window && typeof(window.engage_status_service_ready)=='function' && _wfs.global_ready_called!==true){
                        clearInterval(_wfs.global_ready_called);
                        _wfs.global_ready_called = true;
                        return window.engage_status_service_ready();
                    }
                    var this_ms = new Date();
                    if((this_ms.getTime() - loaded_ms.getTime())/1000 > 8){
                        clearInterval(_wfs.global_ready_called);
                    }
                },100);
            _wfs.wf_dofunction.push(false);
		},
		
        //get udomains for all users in the sepcified company_id (w/ optional tags)
        company_udomain_lookup: function(company_id, cb){
            if( company_id in _wfs.cinfo_cache ){
                if(!(company_id in _wfs.companies)) _wfs.companies[company_id] = _wfs.cinfo_cache[company_id];
                return cb( true, _wfs.cinfo_cache[company_id] ); //return content of cache
            }
            var ccache = _wfs._get_cache_cookie( _wfs.cinfo_cache_key+company_id );
            if(ccache && 'exists' in ccache){
                _wfs.cinfo_cache[company_id] = ccache;
                if(!(company_id in _wfs.companies)) _wfs.companies[company_id] = ccache['users'];
                return cb( true, ccache );
            }
            //create a new xdomain ajax object and call execute the call w/ the appropriate callback specified
            var cbf = function(ci){ var tci=ci; return function(s,d,k){ _wfs._cinfo_fetch_callback(s,d,k,tci); } };
            var call_key = _wfs.new_xdomain_call(
                _wfs.prot + '//' +_wfs.cinfo_domain + _wfs.cinfo_path,
                cbf(company_id),
                {ci:company_id}
            );
            _wfs.cinfo_cbs[ call_key ] = cb;
            _wfs.execute_xdomain_call(call_key,null);
        },
        
        
        //get info (lookup) for a specific user - udomain OR user email can get passed in
        user_info_lookup: function(user_domain, cb){
            if( user_domain in _wfs.uinfo_cache ) return cb( true, _wfs.uinfo_cache[user_domain] ); //return content of cache
            var ccache = _wfs._get_cache_cookie( _wfs.uinfo_cache_key+user_domain );
            if(ccache && 'exists' in ccache){
                _wfs.uinfo_cache[user_domain] = ccache;
                return cb( true, ccache );
            }
            if( user_domain in _wfs.uinfo_fail_recheck_allowance && (new Date().getTime()) < _wfs.uinfo_fail_recheck_allowance[user_domain]) return cb( false, {} );
            //create a new xdomain ajax object and call execute the call w/ the appropriate callback specified
            var cbf = function(ud){ var tud=ud; return function(s,d,k){ _wfs._uinfo_fetch_callback(s,d,k,tud); } };
            var call_key = _wfs.new_xdomain_call(
                _wfs.prot + '//' +_wfs.uinfo_domain + _wfs.uinfo_path,
                cbf(user_domain),
                {un:user_domain}
            );
            _wfs.uinfo_cbs[ call_key ] = cb;
            _wfs.execute_xdomain_call(call_key,null);
        },
        
        //get an xdomain call and add it to the CB tracking arr 
        new_xdomain_call : function( url, cb, data ){
            var nextkey = _wfs.xdomain_calls.length;
            var xdomain_call = new _engage_xdomain_ajax( url, cb, data, nextkey );
            _wfs.xdomain_calls.push(xdomain_call);
            return nextkey;
        },
        
        execute_xdomain_call : function( xdomain_key, call_timeout_tolerance ){
            if(typeof _wfs.xdomain_calls[xdomain_key] == 'undefined' || _wfs.xdomain_calls[xdomain_key] == null ) return false; //key is invalid
            var call = _wfs.xdomain_calls[xdomain_key];
            return  call.execute(call_timeout_tolerance);
        },
        
        //force a status check now, instead of waiting for the heartbeat - heartbeat isn't interrupted, this is just done in addition
        //NOTE: this function is ingored called within 500ms (current value of this.check_now_ms_tolerance) of heartbeat pulse
        check_now : function(){ //check against TS
            var cur_ms_ts = new Date().getTime();
            if( (cur_ms_ts+_wfs.check_now_ms_tolerance) >= _wfs.next_heartbeat_ts) return; //not within tolerance
            _wfs._update_status();
        },
        
        //add & subscribe to company/tag level status
        subscribe_to_company_level_status : function( company_id, cb, namespace ){
            if( !namespace ) namespace = 'global';
            var cbf = function(comp_id,cb_cb,cb_ns){ return function(success,data){ _wfs.company_level_subscription_lookup_return(success,data,comp_id,cb_cb,cb_ns); }; };
            _wfs.company_udomain_lookup( company_id, cbf( company_id, cb, namespace ) );
        },
        
        
        //callback function for adding/subscribing to company level status
        company_level_subscription_lookup_return: function( success, data, company_id, cb, namespace ){
            if(success && 'exists' in data && data.exists==true){
                if(!(company_id in _wfs.company_cb_listeners)) _wfs.company_cb_listeners[company_id] = [];
                _wfs.company_cb_listeners[company_id].push( {cb:cb, ns:namespace} );
                for(var i=0,l=_wfs.companies[company_id].length; i<l; i++){
                    _wfs._add_user_to_internal_tracking( _wfs.companies[company_id][i] );
                }
                _wfs.check_now();
            }
        },
        
        //execute the callback added for a company/tag level status (called after user status lookup return)
        execute_company_status_listener_cb: function( comp_id, data){
            var online = [];
            for(var i=0,l=_wfs.companies[comp_id].length; i<l; i++){
                var ud = _wfs.companies[comp_id][i];
                if(ud in _wfs.user_statuses && _wfs.user_statuses[ud]===true) online.push(ud);
            }
            data.cb( online.length>0, online.length, online );
        },
        //add a non-img indicator to be checked - refer to docs above for this.indicators
        add_indicator : function(i_data){ //idata={namespace:'whatever_namespace',user:'udomain,cb:'false if none else cb function',cb_data:{dataforcallback},(optional)check_now:boolean}
            if( !('check_now' in i_data) ) i_data['check_now'] = true;
            if( !('namespace' in i_data) ) i_data.namespace='global';
            if( !('cb_data' in i_data) ) i_data.cb_data = null;
            _wfs.indicators.push(i_data);
            _wfs._add_user_to_internal_tracking( i_data.user );
            if( i_data['check_now'] ) _wfs.check_now();
        },
        _add_user_to_internal_tracking : function( u_domain ){
            if( (u_domain in _wfs.user_statuses) === false){ //if first time this user added, add the user to tracking objects
                _wfs.users.push(u_domain);
                _wfs.user_statuses[u_domain] = false;
            }
        },
        
        //remove all indicators for a specific namespace
        remove_indicators_for_namespace : function(namespace){
            var removed_users = {}, remaining_users = {};
            for(var i=_wfs.indicators.length-1; i>=0; i--){
                var this_user = _wfs.indicators[i].user;
                if(_wfs.indicators[i].namespace == namespace){
                    _wfs.indicators.splice(i,1);
                    removed_users[ this_user ] = true;
                }else{
                    remaining_users[this_user]=true;
                }
            }
            //now remove orphaned uers from this.user_statuses & this.users
            for( var rem_user in removed_users ){
                if( (rem_user in remaining_users) === false){ //user is no longer present
                    _wfs._remove_orphaned_user( rem_user );
                }
            }
        },

        //subscribe a function to be called when a user status is modified / set
        subscribe_to_user_status: function( u_domain, cb_function ){
            _wfs._add_user_to_internal_tracking( u_domain );
            _wfs.user_cb_change_listeners.push({cb:cb_function,ud:u_domain,first:true});
            _wfs.check_now();
        },
        //pass in callbacks here to have a function that gets every member present and their status passed back on every update heartbeat
        subscribe_to_digest_cb : function(cb, namespace){
            _wfs.digest_cb_listeners.push({cb:cb,ns:namespace});
        },
        
        //remove all subscribed digest callbacks from the call list w/ a particular namespace
        unsubscribe_namespace_from_digest_cb : function(namespace){
            for(var i=_wfs.digest_cb_listeners.length-1; i>=0; i--){
                if(_wfs.digest_cb_listeners[i].ns == namespace) _wfs.digest_cb_listeners.splice(i,1);
            }
        },
        
        //remove all subscribed company status callbacks from the call list w/ a particular namespace
        unsubscribe_namespace_from_company_cb : function(namespace){
            for(var cid in _wfs.company_cb_listeners){
                if(!_wfs.company_cb_listeners.hasOwnProperty(cid)) continue;
                for(var i=_wfs.company_cb_listeners[cid].length-1; i>=0; i--){
                    if(_wfs.company_cb_listeners[cid][i].ns == namespace) _wfs.company_cb_listeners[cid].splice(i,1);
                }
                if(_wfs.company_cb_listeners[cid].length==0) delete( _wfs.company_cb_listeners[cid] );
            }
        },
        
        track_recent_chat : function(udomain){
            var tdata = _wfs._get_cache_cookie('engage_recentchats'),
                ts = new Date().getTime();
            if(!tdata) tdata = {};
            tdata[udomain] = ts;
            _wfs._set_cache_cookie('engage_recentchats',tdata,(60*60*24*14));
        },
        
        get_tracked_chats: function(){
            var new_tdata = {};
            var tdata = _wfs._get_cache_cookie('engage_recentchats'),
                ts = new Date().getTime(),
                limit = ts-(_wfs.track_chat_date_tolerance*24*60*60);
            if(tdata){
                for(var t in tdata){
                    if(!tdata.hasOwnProperty(t)) continue;
                    if(tdata[t] >= limit) new_tdata[t] = tdata[t];
                }
                _wfs._set_cache_cookie('engage_recentchats',new_tdata,(60*60*24*14));
            }
            return new_tdata;
        },
 
        //set the next expected heartbeat timestamp (for internal comparison)
        _set_heartbeat_ts : function(){
            var cur_ms_ts = new Date().getTime();
            _wfs.next_heartbeat_ts = cur_ms_ts+(_wfs.status_update_interval*1000);
        },
        
        //remove an orphaned user from this.user_statuses and this.users
        _remove_orphaned_user : function(user){
            delete _wfs.user_statuses[ user ];
            for(var i=0,l=_wfs.users.length; i<l; i++){
                if(_wfs.users[i] == user) _wfs.users.splice(i,1);
            }
        },
        
        //function called on each interval heartbeat - updates all the indicators & images
		_update_status: function(){
            _wfs._set_heartbeat_ts();
            //first, update all the non-image user statuses if any are present
            if(_wfs.users.length > 0){
                //create a new xdomain ajax object and call execute the call w/ the appropriate callback specified
                var users_for_req = _wfs.users;
                var call_key = _wfs.new_xdomain_call( _wfs.nping_domain + _wfs.nbatch_status_upd_path,
                    _wfs._status_fetch_callback,
                    {jid:users_for_req}
                );
                _wfs.execute_xdomain_call(call_key,_wfs.status_check_ajax_timeout);
            }
            
			_wfs.cache_user_urls= {}; //clear img url cache
			if( _wfs.iter_cnt % _wfs.update_imgs_every_iter == 0) _wfs._update_img_list(); //recheck DOM for images present
			for(var i=0,l=_wfs.imgs.length; i<l; i++){
				_wfs._refresh_img_url(_wfs.imgs[i]);
			}
			_wfs.iter_cnt++;
		},
        
        //callback after the cross-domain json cinfo call returns
        _cinfo_fetch_callback: function( success, data, key_of_xdomain_call, company_id ){
            if(typeof data.xdomain_ts_vals != 'undefined' && 'xdomain_ts_vals' in data ) delete data.xdomain_ts_vals;
            if( success ){
                if(typeof data.exists != 'undefined' && 'exists' in data){
                    _wfs._set_cache_cookie( _wfs.cinfo_cache_key+company_id, data, (60*30) );//cache for 30 mins in cookie
                    if(!(company_id in _wfs.companies)) _wfs.companies[company_id] = data.users;
                }
            }
            _wfs.xdomain_calls[key_of_xdomain_call] = false;
            _wfs.cinfo_cbs[key_of_xdomain_call]( success, data );
        },
        
        //callback after the cross-doomain json uinfo call reutrns
        _uinfo_fetch_callback: function( success, data, key_of_xdomain_call, udomain ){
            if(typeof data.xdomain_ts_vals != 'undefined' && 'xdomain_ts_vals' in data ) delete data.xdomain_ts_vals;
            if( success ){
                if(typeof data.exists != 'undefined' && 'exists' in data) _wfs._set_cache_cookie( _wfs.uinfo_cache_key+udomain, data, (60*30) );//cache for 30 mins in cookie
                if( udomain in _wfs.uinfo_fail_recheck_allowance ) delete _wfs.uinfo_fail_recheck_allowance[udomain]; 
            }else{
                _wfs.uinfo_fail_recheck_allowance[udomain] = new Date().getTime()+_wfs.uinfo_recheck_tmo;
            }
            _wfs.xdomain_calls[key_of_xdomain_call] = false;
            _wfs.uinfo_cbs[key_of_xdomain_call]( success, data );
        },
        
        //callback after the cross-domain json status check returns
        _status_fetch_callback: function( success, returned_statuses, key_of_xdomain_call){
            if( key_of_xdomain_call < _wfs.highest_returned_key ) return;
            _wfs.highest_returned_key = key_of_xdomain_call;
            //update all returned users, then fire all registered callbacks for that user in the indicators array
            //if check failed, update all users present to offline
            if(typeof returned_statuses.xdomain_ts_vals != 'undefined' && 'xdomain_ts_vals' in returned_statuses ) delete returned_statuses.xdomain_ts_vals;
            var last_statuses = {};
            for( var ud in _wfs.user_statuses){
                last_statuses[ud] = _wfs.user_statuses[ud];
            }
            
            for( var udomain in returned_statuses){ //NOTE: will be empty on error
                //udomain = udomain.split('@')[0];
                returned_statuses[udomain] = parseInt( returned_statuses[udomain], 10); //normalize
                if( udomain in _wfs.user_statuses ){
                    var is_online = (returned_statuses[udomain]==0 ? false : true);
                    if( !is_online ){ //see if user was marked as needing additional offline check last time
                        if( udomain in last_statuses && last_statuses[udomain]==true ){ //not the first check for this user
                            if( _wfs.do_double_offline_checks ){
                                if( !(udomain in _wfs.single_offline) ){ //NOT the second confirmed offline response for this user
                                    _wfs.single_offline[udomain]=true;
                                    is_online = true; //leave as offline for this last iteration (next offline will take them offline)
                                }else{ //confirmed second response.. leave them as offline & remove from check obj
                                    delete(_wfs.single_offline[udomain]);
                                }
                            }else{
                                delete(_wfs.single_offline[udomain]);
                            }
                        }
                    }
                    _wfs.user_statuses[udomain] = is_online;
                }
            }
            for(var i=0,l=_wfs.indicators.length; i<l; i++){
                if( _wfs.indicators[i].cb === false) continue;
                _wfs.indicators[i].cb( _wfs.user_statuses[ _wfs.indicators[i].user ] , _wfs.indicators[i].cb_data );
            }
            for(var j=0,l=_wfs.digest_cb_listeners.length; j<l; j++){
                _wfs.digest_cb_listeners[j].cb( _wfs.user_statuses );
            }
            for(var i=0,l=_wfs.user_cb_change_listeners.length; i<l; i++){
                var el = _wfs.user_cb_change_listeners[i];
                if( el.ud in _wfs.invalid_users ) continue;
                if(el.ud in _wfs.user_statuses && (!(el.ud in last_statuses) || el.first || (last_statuses[el.ud] !== _wfs.user_statuses[el.ud])) ){
                    el.cb( el.ud, _wfs.user_statuses[el.ud] );
                }else if(!el.ud in _wfs.user_statuses){
                    _wfs.invalid_users[el.ud] = true;
                    el.cb( el.ud, false );
                }
                _wfs.user_cb_change_listeners[i].first = false;
            }
            for(var cid in _wfs.company_cb_listeners){
                if(!_wfs.company_cb_listeners.hasOwnProperty(cid)) continue;
                for(var k=0,l=_wfs.company_cb_listeners[cid].length; k<l; k++){
                    _wfs.execute_company_status_listener_cb( cid, _wfs.company_cb_listeners[cid][k] );
                }
            }
            _wfs.xdomain_calls[key_of_xdomain_call] = false; //free memory but don't delete the key
        },
        
        //update a specific image url on-page so the status is up to date
		_refresh_img_url : function(img){
			//We cache img paths here to use same url for effeciency if same user has multiple images on-page
			i_user_domain = img.getAttribute('data-user');
			i_size_format = img.getAttribute('data-format');
			cache_key = i_user_domain+':'+i_size_format;
            if( (cache_key in _wfs.cache_user_urls)===false ){ //cache miss
				new_url = _wfs.prot + _wfs.ping_domain + _wfs.status_path + i_size_format + '/' + i_user_domain + '?t=0&r=' + Math.floor(Math.random()*100001);
				_wfs.cache_user_urls[cache_key] = new_url;
			}else{
				new_url = _wfs.cache_user_urls[cache_key];
			}
			img.setAttribute('src',new_url);
		},
		
        //this function scans the DOM and stores all status images present on the page - this is done so they can be added dynamically, or if they take a while to load initially
		_update_img_list: function(){
		    if(typeof document.getElementsByClassName == 'function'){
				var elems = document.getElementsByClassName(_wfs.img_class_name);
			}else{
				all_imgs = document.getElementsByTagName('img');
				var elems = [];
				for(i=0,l=all_imgs.length; i<l; i++){
					if( all_imgs[i].className.indexOf(_wfs.img_class_name) != -1) elems.push(all_imgs[i]);
				}
			}
			_wfs.imgs = elems; //udate list of images on page
		},
        
        _set_cache_cookie: function(key,val,exp_seconds){
            var date = new Date(); date.setTime(date.getTime()+(exp_seconds*1000));
            var cval = encodeURIComponent(_wfs._encode_json(val));
            document.cookie = key+"="+cval+"; expires="+date.toGMTString()+'; path=/';
        },
        
        _set_cache_cookie_for_domain: function(key,val,exp_seconds,domain,compress){
            val = _wfs._encode_json(val);
            if(compress) val = _wfs._lzw_compress(val);
            var date = new Date(); date.setTime(date.getTime()+(exp_seconds*1000));
            var cval = encodeURIComponent(val);
            document.cookie = key+"="+cval+"; expires="+date.toGMTString()+'; domain='+domain+'; path=/';
        },
        
        _get_cache_cookie: function(key){
            var val = _wfs._get_cookie_val_for_key(key);
            return (!val ? null : _wfs._parse_json(val));
        },
        
        _get_compressed_cache_cookie: function(key){
            var val = _wfs._get_cookie_val_for_key(key);
            try{
                var decomp = _wfs._lzw_decompress(val.split(','));
            }catch(err){
                var decomp = null;
            }
            return (!val  ? null : _wfs._parse_json(decomp) );
        },
        
        _get_cookie_val_for_key: function(key){
            var nameEQ = key + "=",
                ca = document.cookie.split(';');
            for(var i=0,l=ca.length; i<l ;i++) {
                while (ca[i].charAt(0)==' ') ca[i] = ca[i].substring(1,ca[i].length);
                if (ca[i].indexOf(nameEQ) == 0){
                    var val = decodeURIComponent(ca[i].substring(nameEQ.length,ca[i].length));
                    return val;
                }
            }
            return null;
        },
        
        _encode_json: function(a){ //http://www.sitepoint.com/javascript-json-serialization/
            if(window.JSON && typeof window.JSON.stringify == 'function') return JSON.stringify(a);
            var b=typeof a;if(b!="object"||a===null){if(b=="string")a='"'+a+'"';return String(a)}else{var c,d,e=[],f=a&&a.constructor==Array;for(c in a){d=a[c];b=typeof d;if(b=="string")d='"'+d+'"';else if(b=="object"&&d!==null)d=_wfs._encode_json(d);e.push((f?"":'"'+c+'":')+String(d))}return(f?"[":"{")+String(e)+(f?"]":"}")}
        },
        
        _parse_json : function(str){
            if( typeof(str) != 'string') return str;
            if(window.JSON && typeof window.JSON.parse == 'function') return JSON.parse(str);
            if (str === ""){str = '""'; } 
            try{ eval("var temp_json_var=" + str + ";"); }catch(e){ var temp_json_var=null; } return temp_json_var;
        },
        
        _xdomain_cb : function( call_key, ret_data ){
            //NOTE: we have to use this anon proxy function because if the call timed out, the object at _wfs.xdomain_calls[call_key] will be cleared out!
            if(_wfs.xdomain_calls[call_key] !== false) _wfs.xdomain_calls[call_key].return_callback(ret_data);
        },
        
        _lzw_compress: function(f){
            f = _wfs.Base64.encode(f);
            var e,j={},h,g,d="",b=[],a=256;for(e=0;e<256;e+=1){j[String.fromCharCode(e)]=e}for(e=0;e<f.length;e+=1){h=f.charAt(e);g=d+h;if(j.hasOwnProperty(g)){d=g}else{b.push(j[d]);j[g]=a++;d=String(h)}}if(d!==""){b.push(j[d])}
            return b.join();
        },
        _lzw_decompress: function(f){
            var e,h=[],c,b,d,g="",a=256;for(e=0;e<256;e+=1){h[e]=String.fromCharCode(e)}c=String.fromCharCode(f[0]);b=c;for(e=1;e<f.length;e+=1){d=f[e];if(h[d]){g=h[d]}else{if(d===a){g=c+c.charAt(0)}else{return null}}b+=g;h[a++]=c+g.charAt(0);c=g}
            //console.log(b);
            return _wfs.Base64.decode(b);
        },
        Base64:{_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=_wfs.Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=_wfs.Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=0,c1=0,c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
	};
    
    //this object is intended to be instantiated to do a cross-domain ajax request by putting all the params for the request in a url string and passing in a callback, which is rendered and returned
    //the script is then executed in real-time and the callback is fired with the return data as it's payload.
    window._engage_xdomain_ajax = window._engage_xdomain_ajax || function(url,callback,data,ind_key){
        this.failed = false;            //did the call fail (via timeout check/settings)
        this.url = url;                 //base url to call (NO query string)
        this.callback = callback;       //callback function to pass returned data into
        this.data = data;               //data in format { url_param:value, url_param:value} strings, ints, and arrays are acceptible
        this.ind_key = ind_key;         //top-level key for where this instance will be stored in _wfs.xdomain_calls (for referencing callback)
        this.script = null;             //script tag node
        this.exec_ts = false;           //timestamp call execution started
        this.timeout_ms = false;        //set dynamically by passing a val into this.execute else default is used
        this.default_timeout = 10*1000; //default timeout is 10 seconds
        this.tmo_id = false;            //id for setTimeout
        this.return_exec = false;       //call return executed yet?
        this.execute = function(timeout_ms){
            if( this.exec_ts !== false ) return false; //call already executed!
            //setup the global CB
            var gcbf = function(i){ var ii=i; return function(data){ _wfs._xdomain_cb(ii,data); }; };
            _wfs.global_xdomain_cbs[this.ind_key] = gcbf(this.ind_key);
            this.exec_ts = new Date().getTime();
            this.timeout_ms = timeout_ms || this.default_timeout;
            //format URL & params and stick the script in the doc head so it is called
            url = this.url+'?nocache='+Math.floor(Math.random()*10000001);
            for( var key in data){
                if(typeof data[key] == 'object'){
                    for(var i=0,l=data[key].length; i<l; i++){
                        url+= '&'+key+'['+(_wfs.use_nodejs?'':i)+']='+encodeURIComponent( data[key][i] ); //TODO: this needs to be changed w/ Node.JS intro
                    }
                    continue;
                }
                url += '&'+key+'='+encodeURIComponent(data[key]); //NOTE: assumed ALL string/integer options here (no boolean)
            }
            url+= '&callback='+encodeURIComponent('_wfs.global_xdomain_cbs['+this.ind_key+']');//set return callback
            this.script = document.createElement('script'); this.script.setAttribute("type", "text/javascript"); this.script.setAttribute("src", url);
            var tmo_cb = function(k){ var ik=k; return function(){ _wfs.xdomain_calls[ik].timeout(); } };
            this.tmo_id = setTimeout( tmo_cb(this.ind_key), this.timeout_ms );
            document.getElementsByTagName("head").item(0).appendChild(this.script);
            return true;
        },
        this.timeout = function(){ //NOTE if this function fires then the script load timed out,
            this.failed = true; this.tmo_id = false;
            this.return_callback({});
        },
        //first callback fired directly from script return - remove the created script node, then fire next callback in sequence
        this.return_callback = function(data){
           if( this.tmo_id !== false ) clearTimeout( this.tmo_id ); //req did NOT timeout and returned succesffuly
           if( this.return_exec ) return;
           this.return_exec = true;
           document.getElementsByTagName("head").item(0).removeChild(this.script);
           var finished_ts = new Date().getTime(); data.xdomain_ts_vals = [ this.exec_ts, this.finished_ts ]; //set xdomain_ts_vals in data
           this.callback( this.failed ? false : true , data, this.ind_key);
        }
    };
    window._wfs = engage_stati_upd;
    window.engage_stati_upd.init();
    }catch(e){ if('engage_err_log' in window){if('WF_ERR_LOG_PREVENT_CATCH' in window){throw(e);}else{engage_err_log.err( e.name+' - '+e.message, e.fileName || false, e.lineNumber || false );}}}
})(window,document);

