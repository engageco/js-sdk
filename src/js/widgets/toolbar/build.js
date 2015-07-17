require.config({
	waitSeconds: 15,
	baseUrl: "js",
	urlArgs: "v=@@version",
	paths: {
        "event-dispatcher": "components/event-dispatcher/src",
        "jquery": "components/jquery/dist/jquery",
        "gibberish.aes": "components/gibberish-aes/dist/gibberish-aes-1.0.0",
        "crypto.sha1": "components/CryptoJS/build/rollups/sha1"
	}
});