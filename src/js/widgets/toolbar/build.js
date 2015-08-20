require.config({
	waitSeconds: 15,
	baseUrl: "js",
	urlArgs: "v=@@version",
	paths: {
        "event-dispatcher/Event": "components/event-dispatcher/src/Event",
        "event-dispatcher/EventDispatcher": "components/event-dispatcher/src/EventDispatcher",
        "jquery": "components/jquery/dist/jquery",
        "gibberish.aes": "components/gibberish-aes/dist/gibberish-aes-1.0.0",
        "crypto.sha1": "components/CryptoJS/build/rollups/sha1"
	}
});