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
engage.getUsers();
```

**Get all the Agents in a Category**
```
engage.getUsers("customer-facing-team");
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

**Toolbar Configuration Options**

