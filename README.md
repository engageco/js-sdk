Javascript SDK
======

**load SDK into page**
```
<script src="//sdk.workface.com/v2/WorkfaceSDK.js"></script>
```

**initialize Workface Object**
```
var workface = new WorkfaceSDK("API_KEY", "SECRET", "cb15f03f140f28d81223f7b7c64e3a0d");
```

**get all the agents in the company**
```
var allAgents = workface.getAgentCollection();
```

**TODO: get agents by Geolocation**

**get all the agents in a category**
```
var customerFacingTeam = workface.getAgentCollection("customer-facing-team");
```

**watch for any change to an agent's status in the collection**
```
customerFacingTeam.watchStatus(function() {
	// todo: callback
});
```

**unwatch agent status changes in the collection**
```
customerFacingTeam.unwatchStatus();
```

**Loop through agents in a collection**
```
var agents = customerFacingTeam.getAgents();
for(var i = 0; i < agents.length; i++) {

}
```

**Get an Agent**
```
var patterson = workface.getAgent("patterson");
```

**watch for the agent's status changes**
```
patterson.watchStatus(function() {
	// todo: callback
});
```

**unwatch the agent's status changes**
```
patterson.unwatchStatus();
```

**Check an agent's status**
```
if(patterson.status == WorkfaceSDK.STATUS.ONLINE) {

}
```