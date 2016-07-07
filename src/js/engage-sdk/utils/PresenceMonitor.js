/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery",
        "event-dispatcher/EventDispatcher",
        "event-dispatcher/Event"],
    function(jQuery, EventDispatcher, Event) {

        'use strict';

        var PresenceMonitor = function() {
            EventDispatcher.call(this);
            this.checkInterval = null;
            this.isRunning = false;
            this.servers = new Object();
            this.autoStart = false;
        };

        PresenceMonitor.prototype = new EventDispatcher();

        PresenceMonitor._instance = null;

        PresenceMonitor.getInstance = function() {
            if(PresenceMonitor._instance == null) {
                PresenceMonitor._instance = new PresenceMonitor();
            }
            return PresenceMonitor._instance
        };

        PresenceMonitor.OFFLINE = "offline";
        PresenceMonitor.AWAY = "away";
        PresenceMonitor.BUSY = "busy";
        PresenceMonitor.ONLINE = "online";

        PresenceMonitor.prototype.status = null;

        //var getJids = function(server, users) {
        //	var jids = new Array();
        //	for(var user in users) {
        //		jids.push(user + "@" + server);
        //	}
        //	return jids;
        //};

        var getUsers = function(users) {
            var userKeys = new Array();
            for(var user in users) {
                userKeys.push(user);
            }
            return userKeys;
        };

        var convertObjectToArray = function(object) {
            var array = new Array();
            for(var item in object) {
                array.push(object[item]);
            }
            return array;
        };

        var onStatusChange = function(user, status, callback) {
            var event = new Event("change:" + user);
            event.status = status;
            this.dispatchEvent(event);
            if(callback) {
                callback(status, user);
            }
        };

        var onCheckPresence = function() {
            if(!this.isRunning) {
                this.isRunning = true;
                for(var server in this.servers) {
                    if(server == "status.engage.co") {
                        // todo: load presence from status server
                        var users = getUsers(this.servers[server]);
                        if(users.length > 0) {
                            var nocache = Math.round(Math.random() * 10000000);
                            var request = jQuery.ajax({
                                crossDomain: true,
                                // dataType: "xml",
                                type: "GET",
                                url: "https://status.engage.co/user-status?nocache=" + nocache + "&jid[]=" + users.join("&jid[]=")
                            });
                            request.success(jQuery.proxy(onStatusSuccess, this));
                            request.fail(jQuery.proxy(onFail, this));
                        }
                    }else {
                        var users = convertObjectToArray(this.servers[server]);
                        if(users.length > 0 && users[0].userId != null) {
                            //var jids = getJids(server, this.servers[server]);
                            //if(jids.length > 0) {
                            //    var request = jQuery.ajax({
                            //    	crossDomain: true,
                            //    	dataType: "xml",
                            //    	type: "GET",
                            //    	url: "https://" + server + "/status?type=xml&jid=" + jids.join("&jid=")
                            //    });
                            //    request.success(jQuery.proxy(onXMPPSuccess, this));
                            //    request.fail(jQuery.proxy(onFail, this));

                            // KLUDGE: Since this is mostly just used by the profile, we only make one user call
                            var request = jQuery.ajax({
                                crossDomain: true,
                                type: "GET",
                                url: "https://wapi.engage.co/api/v2/userStatus?userId=" + users[0].userId + "&userDomain=" + users[0].user
                            });
                            request.success(jQuery.proxy(onCombinedStatusSuccess, this, users[0]));
                            request.fail(jQuery.proxy(onFail, this));

                        }
                    }
                }
            }
        };

        var onStatusSuccess = function(data, textStatus, jqXHR) {
            this.isRunning = false;
            var server = "status.engage.co";
            for(var user in data) {
                var oldStatus = this.servers[server][user].status;
                var status = data[user];
                if(data[user] == 1) {
                    this.servers[server][user].status = PresenceMonitor.ONLINE;
                }else {
                    this.servers[server][user].status = PresenceMonitor.OFFLINE;
                }
                if(oldStatus != this.servers[server][user].status) {
                    onStatusChange.apply(this, [user, this.servers[server][user].status, this.servers[server][user].callback]);
                }
            }
        };

        var onCombinedStatusSuccess = function(user, data, textStatus, jqXHR) {
            this.isRunning = false;
            var oldStatus = user.status;
            if(data.status != "offline" && data.dashboard != "offline") {
                user.status = PresenceMonitor.ONLINE;
            }else {
                user.status = PresenceMonitor.OFFLINE;
            }
            if(oldStatus != user.status) {
                onStatusChange.apply(this, [user.jid, user.status, user.callback]);
            }
        };

        //var onXMPPSuccess = function(data, textStatus, jqXHR) {
        //	this.isRunning = false;
        //	var self = this;
        //	var presenceResponses = jQuery(data).find("presence").each(function(index, item) {
        //		var presence = jQuery(item);
        //		var jid = getBareJidFromJid(presence.attr("from"));
        //		var server = getDomainFromJid(jid);
        //		var user = getNodeFromJid(jid);
        //		var oldStatus = self.servers[server][user] ? self.servers[server][user].status : "offline";
        //		var status = presence.find("status");
        //		if(status.length > 0) {
        //			if(status.text() == "online") {
        //				self.servers[server][user].status = PresenceMonitor.ONLINE;
        //			}else if(status.text() == "busy") {
        //				self.servers[server][user].status = PresenceMonitor.BUSY;
        //			}else if(status.text() == "away") {
        //				self.servers[server][user].status = PresenceMonitor.AWAY;
        //			}else {
        //				self.servers[server][user].status = PresenceMonitor.OFFLINE;
        //			}
        //		}else {
        //			self.servers[server][user].status = PresenceMonitor.OFFLINE;
        //		}
        //		if(oldStatus != self.servers[server][user].status) {
        //			onStatusChange.apply(self, [jid, self.servers[server][user].status, self.servers[server][user].callback]);
        //		}
        //	});
        //};

        var onFail = function(jqXHR, textStatus, errorThrown) {
            // todo: throw error
            this.isRunning = false;
            this.stop();
        };

        // @see Strophe.getDomainFromJid
        var getDomainFromJid = function(jid) {
            var bare = getBareJidFromJid(jid);
            if(bare.indexOf("@") < 0) {
                return bare;
            }else {
                var parts = bare.split("@");
                parts.splice(0, 1);
                return parts.join('@');
            }
        };
        // @see Strophe.getNodeFromJid
        var getNodeFromJid = function(jid) {
            if(jid.indexOf("@") < 0) { return null; }
            return jid.split("@")[0];
        };
        // @see Strophe.getBareJidFromJid
        var getBareJidFromJid = function(jid) {
            return jid ? jid.split("/")[0] : null;
        };

        PresenceMonitor.prototype.start = function() {
            if(this.checkInterval == null) {
                this.checkInterval = setInterval(jQuery.proxy(onCheckPresence, this), 15000);
            }
            onCheckPresence.apply(this);
        };

        PresenceMonitor.prototype.stop = function() {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        };

        PresenceMonitor.prototype.watchUser = function(jid, callback, userId) {
            var server = getDomainFromJid(jid);
            var user = getNodeFromJid(jid);
            if(server == null || user == null) {
                server = "status.engage.co";
                user = jid;
            }
            if(this.servers[server] == null) {
                this.servers[server] = new Object();
            }
            if(!this.servers[server].hasOwnProperty(user)) {
                this.servers[server][user] = {
                    userDomain: user,
                    jid: jid,
                    status: null
                };
                if(callback) {
                    this.servers[server][user].callback = callback;
                }
                if(userId) {
                    this.servers[server][user].userId = userId;
                }
                if(this.checkInterval != null) {
                    onCheckPresence.apply(this);
                }else if(this.autoStart) {
                    this.start();
                }
            }
        };

        PresenceMonitor.prototype.unwatchUser = function(jid) {
            var server = getDomainFromJid(jid);
            var user = getNodeFromJid(jid);
            if(server == null || user == null) {
                server = "status.engage.co";
                user = jid;
            }
            if(this.servers.hasOwnProperty(server)) {
                delete this.servers[server][user];
            }
        };

        PresenceMonitor.prototype.watchCategory = function(categorySlug, callback) {
            // todo: load users from category
            // todo: create group watch util
        };

        PresenceMonitor.prototype.getUserStatus = function(jid) {
            var server = getDomainFromJid(jid);
            var user = getNodeFromJid(jid);
            if(server == null || user == null) {
                server = "status.engage.co";
                user = jid;
            }
            if(this.servers.hasOwnProperty(server) && this.servers[server].hasOwnProperty(user)) {
                return this.servers[server][user].status;
            }else {
                return PresenceMonitor.OFFLINE;
            }
        };

        return PresenceMonitor;

    });