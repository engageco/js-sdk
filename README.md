Javascript SDK
======

**Load SDK into Page**
```
<script src="//sdk.workface.com/v2/WorkfaceSDK.js"></script>
```

**Initialize Workface Object**
```
var workface = new WorkfaceSDK("API_KEY", "SECRET", "cb15f03f140f28d81223f7b7c64e3a0d");
```

**Get all the Agents in the Company**
```
var allAgents = workface.getAgentCollection();
```

**TODO: Get Agents by Geolocation**

**Get all the Agents in a Category**
```
var customerFacingTeam = workface.getAgentCollection("customer-facing-team");
```

**Watch for any change to an Agent's status in the Collection**
```
customerFacingTeam.watchStatus(function() {
	// todo: callback
});
```

**Unwatch Agent Status changes in the Collection**
```
customerFacingTeam.unwatchStatus();
```

**Loop through Agents in a Collection**
```
var agents = customerFacingTeam.getAgents();
for(var i = 0; i < agents.length; i++) {

}
```

**Get an Agent**
```
var patterson = workface.getAgent("patterson");
```

**Watch for the Agent's Status Changes**
```
patterson.watchStatus(function() {
	// todo: callback
});
```

**Unwatch the Agent's Status Changes**
```
patterson.unwatchStatus();
```

**Check an Agent's Status**
```
if(patterson.status == WorkfaceSDK.STATUS.ONLINE) {

}
```