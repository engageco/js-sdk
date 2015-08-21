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

- **disableMobileView** *(optional)* This option allows you to disable the mobile view that is enabled by default.  The mobile view moves the tab into the bottom-toolbar placement and makes the directory view the full size of the page.

- **onlineLabel** *(optional)* This specifies the label that should be displayed when at least one user is online.  If not provided it will default to "Chat".

- **offlineLabel** *(optional)* This specifies the label that should be displayed when all users are offline.  If not provided it will default to "Chat".

- **labelOrientation** *(optional)* If the left-tab and right-tab placements, this option allows you to flip the orientation of the label.  The value "flipped" is currently the only supportted value.

- **backgroundColor** *(optional)* This option specifices the color of the tab.  It defaults to black (#000).

- **labelColor** *(optional)* This option specifices the color of the tab's label text.  It defaults to white (#fff).

- **hideTabOffline** *(optional)*  If set to true, this option allows you to hide the entire tab if there are no users online.  This option defaults to false.

- **hideOfflineAgents** *(optional)* If set to true, this option allows you to hide any agents that are currently offline, away or busy.  This option defaults to false.

- **agentOrder** *(optional)* This option allows you to specify the desired sort order of the agents in the directory.  Valid options are last-chat, random and alpha.  The default value is last-chat.

- **showOnlineAgentsFirst** *(optional)* If set to true, this option allows you sort online agents before all other agents in the directory.  This still opperates within the defined agent order.  This option defaults to true.

- **showAgentLocation** *(optional)* If set to true, the agents city and state will be shown in the directory view.  This option defaults to false.

- **showListOnly** *(optional)* If set to true, the directory will always show as a vertical list.  Otherwise the list view is reserved for mobile viewing only and the grid view is used for tablet and desktop viewing.  This option defaults to false.

- **showSearch** *(optional)* Coming soon!

- **directoryUrl** *(optional)* If a URL is provided, a link will show in the footer of the directory that will take people to the provided page in a new tab.  We suggest you put your Engage Directory URL in this option.  If nothing is provided then this link is not displayed.

- **proactive** *(optional)* If provided this option defines the proactive component to the toolbar.  It has three sub-options:
  - **message** *(required)* This is the message you want to show up inside the proactive bubble
  - **delay** *(optional)* This defines (in milliseconds) when the proactive bubble will show after the page is loaded.  If not provided this will default to 1 second (or 1000 milliseconds).
  - **frequency** *(optional)* This defines (in minutes) how often the visitor will see the proactive bubble.  If not provided this will default to 24 hours (or 1440 minutes).
