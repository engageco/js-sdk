(function(e,t){typeof define=="function"&&define.amd?define(["jquery","EngageSDK"],t):e.EngageToolbar=t(e.jQuery,e.EngageSDK)})(this,function(e,t){var n,r,i;return function(e){function v(e,t){return h.call(e,t)}function m(e,t){var n,r,i,s,o,u,a,f,c,h,p,v=t&&t.split("/"),m=l.map,g=m&&m["*"]||{};if(e&&e.charAt(0)===".")if(t){e=e.split("/"),o=e.length-1,l.nodeIdCompat&&d.test(e[o])&&(e[o]=e[o].replace(d,"")),e=v.slice(0,v.length-1).concat(e);for(c=0;c<e.length;c+=1){p=e[c];if(p===".")e.splice(c,1),c-=1;else if(p===".."){if(c===1&&(e[2]===".."||e[0]===".."))break;c>0&&(e.splice(c-1,2),c-=2)}}e=e.join("/")}else e.indexOf("./")===0&&(e=e.substring(2));if((v||g)&&m){n=e.split("/");for(c=n.length;c>0;c-=1){r=n.slice(0,c).join("/");if(v)for(h=v.length;h>0;h-=1){i=m[v.slice(0,h).join("/")];if(i){i=i[r];if(i){s=i,u=c;break}}}if(s)break;!a&&g&&g[r]&&(a=g[r],f=c)}!s&&a&&(s=a,u=f),s&&(n.splice(0,u,s),e=n.join("/"))}return e}function g(t,n){return function(){var r=p.call(arguments,0);return typeof r[0]!="string"&&r.length===1&&r.push(null),s.apply(e,r.concat([t,n]))}}function y(e){return function(t){return m(t,e)}}function b(e){return function(t){a[e]=t}}function w(n){if(v(f,n)){var r=f[n];delete f[n],c[n]=!0,t.apply(e,r)}if(!v(a,n)&&!v(c,n))throw new Error("No "+n);return a[n]}function E(e){var t,n=e?e.indexOf("!"):-1;return n>-1&&(t=e.substring(0,n),e=e.substring(n+1,e.length)),[t,e]}function S(e){return function(){return l&&l.config&&l.config[e]||{}}}var t,s,o,u,a={},f={},l={},c={},h=Object.prototype.hasOwnProperty,p=[].slice,d=/\.js$/;o=function(e,t){var n,r=E(e),i=r[0];return e=r[1],i&&(i=m(i,t),n=w(i)),i?n&&n.normalize?e=n.normalize(e,y(t)):e=m(e,t):(e=m(e,t),r=E(e),i=r[0],e=r[1],i&&(n=w(i))),{f:i?i+"!"+e:e,n:e,pr:i,p:n}},u={require:function(e){return g(e)},exports:function(e){var t=a[e];return typeof t!="undefined"?t:a[e]={}},module:function(e){return{id:e,uri:"",exports:a[e],config:S(e)}}},t=function(t,n,r,i){var s,l,h,p,d,m=[],y=typeof r,E;i=i||t;if(y==="undefined"||y==="function"){n=!n.length&&r.length?["require","exports","module"]:n;for(d=0;d<n.length;d+=1){p=o(n[d],i),l=p.f;if(l==="require")m[d]=u.require(t);else if(l==="exports")m[d]=u.exports(t),E=!0;else if(l==="module")s=m[d]=u.module(t);else if(v(a,l)||v(f,l)||v(c,l))m[d]=w(l);else{if(!p.p)throw new Error(t+" missing "+l);p.p.load(p.n,g(i,!0),b(l),{}),m[d]=a[l]}}h=r?r.apply(a[t],m):undefined;if(t)if(s&&s.exports!==e&&s.exports!==a[t])a[t]=s.exports;else if(h!==e||!E)a[t]=h}else t&&(a[t]=r)},n=r=s=function(n,r,i,a,f){if(typeof n=="string")return u[n]?u[n](r):w(o(n,r).f);if(!n.splice){l=n,l.deps&&s(l.deps,l.callback);if(!r)return;r.splice?(n=r,r=i,i=null):n=e}return r=r||function(){},typeof i=="function"&&(i=a,a=f),a?t(e,n,r,i):setTimeout(function(){t(e,n,r,i)},4),s},s.config=function(e){return s(e)},n._defined=a,i=function(e,t,n){if(typeof e!="string")throw new Error("See almond README: incorrect module build, no module name");t.splice||(n=t,t=[]),!v(a,e)&&!v(f,e)&&(f[e]=[e,t,n])},i.amd={jQuery:!0}}(),i("almond",function(){}),i("EngageToolbar",["jquery"],function(e){"use strict";var t=function(e,t){this.sdk=e,this.options=t};return t.prototype.draw=function(){this.tab=e('<div class="engage-tab"></div>');var t=this.options.tabPlacement?this.options.tabPlacement:"right-tab";this.tab.addClass(t),this.options.backgroundColor&&this.tab.css("background-color",this.options.backgroundColor),this.label=e('<div class="engage-tab-label"></div>');var n=this.options.label?this.options.label:"Chat";this.label.text(n),this.options.labelOrientation&&this.label.addClass(this.options.labelOrientation),this.options.labelColor&&this.tab.css("color",this.options.labelColor),this.label.appendTo(this.tab),this.tab.appendTo(e("body"))},t}),i("jquery",function(){return e}),i("EngageSDK",function(){return t}),r("EngageToolbar")});