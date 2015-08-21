Javascript SDK
======

**Load SDK into Page**
```
<script src="//sdk.engage.co/sdk.js"></script>
```

**Initialize Engage SDK Object**
```
var engage = new EngageSDK("COMPANY_HASH");
```

**Get all the Agents in the Company**
```
engage.getUsers(null, function(users) {
	for(var i = 0; i < this.users.length; i++) {}
});
```

**Get all the Agents in a Category**
```
engage.getUsers("customer-facing-team", function(users) {});
```

**Watch for any change to an Agent's status**
```
engage.presence.watchUser("user_domain", function(status, domain) {
	if(status == "online") {
		// do something
	}
});
engage.presence.start();
```

**Unwatch Agent Status changes in the Collection**
```
engage.presence.unwwatchUser("user_domain");
```

**Check an Agent's Status**
```
if(engage.presence.getUserStatus("user_domain") == "online") {
	// do something
}
```
**Draw Widget**
```
var widgetOptions = {
	type: "toolbar",
	options: {
		"tabPlacement": "right-tab",
		"onlineLabel": "Online! Chat Now!",
		"offlineLabel": "Meet Our Team!",
		"backgroundColor": "#004400",
		"labelColor": "#00ff00"
	}
};
engage.drawWidget(widgetOptions, function(toolbar) {
	// do something to the toolbar
});
```
**Hide Widget**
```
engage.setWidgetVisibility(false);
```
**Show Widget**
```
engage.setWidgetVisibility(true);
```
**Store Local Property**
```
engage.setLocalProperty("name", "value");
```
**Retreive Local Property**
```
engage.getLocalProperty("name");
```


Toolbar Widget
======
**Standard Toolbar Implementation**
```
<script src="//sdk.engage.co/sdk.js"></script>
<script>
	var engage = new EngageSDK("COMPANY_HASH");
	engage.drawToolbar({
		"tabPlacement": "left-tab",
		"onlineLabel": "Online! Chat Now!",
		"offlineLabel": "Meet Our Team!",
		"backgroundColor": "#004400",
		"labelColor": "#00ff00"
	}, function(toolbar) {
		// do something to the toolbar
	});
</script>
```

**Set Toolbar Options after Initialization**
```
engage.drawToolbar({}, function(toolbar) {
	toolbar.setOption("tabPlacement", "left-tab");
	toolbar.setOption("onlineLabel", "Online! Chat Now!");
	toolbar.setOption("offlineLabel", "Meet Our Team!");
	toolbar.setOption("backgroundColor", "#004400");
	toolbar.setOption("labelColor", "#00ff00");
});
```

**Set Toolbar Visibility**
```
engage.drawToolbar({}, function(toolbar) {
	// note: false is hide and true is show
	toolbar.setVisibility(false);
});
```

**Manually open Toolbar Directory**
```
engage.drawToolbar({}, function(toolbar) {
	toolbar.openDrawer();
});
```

**Manually close Toolbar Directory**
```
engage.drawToolbar({}, function(toolbar) {
	toolbar.closeDrawer();
});
```

**Check if anyone is online**
```
engage.drawToolbar({}, function(toolbar) {
	if(!toolbar.isAnyoneOnline()) {
		toolbar.setVisibility(false);
	}
});
```

#### Toolbar Configuration Options ####

- **category** *(optional)* Specify the category slug of the group of users you want to load into the toolbar.  If this is not included then all users from the company will be loaded.

- **directoryTitle** *(optional)* The title you want shown at the top of the directory view of the toolbar widget.  If this is not included in the options then no title will be shown.

- **tabPlacement** *(optional)* This option inducates the placement of the widget on the page.  Valid placements are left-tab, right-tab, top-left-tab, top-right-tab, bottom-left-tab, bottom-right-tab and bottom-toolbar.  The default placement is right-tab.

- **disableMobileView** *(optional)*

- **onlineLabel** *(optional)*

- **offlineLabel** *(optional)*

- **labelOrientation** *(optional)*

- **backgroundColor** *(optional)*

- **labelColor** *(optional)*

- **hideTabOffline** *(optional)*

- **hideOfflineAgents** *(optional)*

- **showOnlineAgentsFirst** *(optional)*

- **agentOrder** *(optional)*

- **showAgentLocation** *(optional)*

- **showListOnly** *(optional)*

- **showSearch** *(optional)* Coming soon!

- **directoryUrl** *(optional)*

- **proactive** *(optional)* If provided this option defines the proactive component to the toolbar.  It has three sub-options:
  - **message** *(required)* This is the message you want to show up inside the proactive bubble
  - **delay** *(optional)* This defines (in milliseconds) when the proactive bubble will show after the page is loaded.  If not provided this will default to 1 second (or 1000 milliseconds).
  - **frequency** *(optional)* This defines (in minutes) how often the visitor will see the proactive bubble.  If not provided this will default to 24 hours (or 1440 minutes).
