/**
 *
 *
 * @author Danny Patterson
 */

define(["jquery"],
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