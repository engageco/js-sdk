Javascript SDK
======

**Load SDK into Page**
```
<script src="//sdk.engage.co/v2/EngageSDK.js"></script>
```

**Initialize Engage SDK Object**
```
var engage = new EngageSDK("cb15f03f140f28d81223f7b7c64e3a0d");
```

**Get all the Agents in the Company**
```
var allAgents = engage.getAgentCollection();
```

**TODO: Get Agents by Geolocation**

**Get all the Agents in a Category**
```
var customerFacingTeam = engage.getAgentCollection("customer-facing-team");
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
var johndoe = customerFacingTeam.getAgent("johndoe");
```

**Watch for the Agent's Status Changes**
```
johndoe.watchStatus(function() {
	// todo: callback
});
```

**Unwatch the Agent's Status Changes**
```
johndoe.unwatchStatus();
```

**Check an Agent's Status**
```
if(johndoe.status == EngageSDK.STATUS.ONLINE) {

}
```

**TODO: Listen for "flag" events**
	***currently chating with***
	***recently chatted with***

**TODO: proactive chat events**

**TODO: tap into browser preview**

