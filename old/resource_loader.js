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