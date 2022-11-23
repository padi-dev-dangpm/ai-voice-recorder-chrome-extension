chrome.tabs.onUpdated.addListener((tabId, tab) => {
	chrome.runtime.onMessage.addListener((requester, sender, response) => {
		if (requester.type == "RECORD") {
			chrome.tabs.sendMessage(tabId, {
				type: "NEW",
			});
		}
		if (requester.type == "STOP") {
			chrome.tabs.sendMessage(tabId, {
				type: "UPLOAD",
			});
		}
	});
});
