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

// create context menus
chrome.contextMenus.create({
  id: "1",
  title: "Click here to record",
  contexts: ["page"],
});

chrome.contextMenus.onClicked.addListener(function () {
  // baseURL = "https://www.facebook.com/";
  // chrome.tabs.create({ url: baseURL });
  //   console.log(chrome.runtime.getURL("popup.html"));

  chrome.tabs.create(
    {
      url: chrome.runtime.getURL("popup.html"),
      active: false,
    },
    function (tab) {
      // After the tab has been created, open a window to inject the tab
      chrome.windows.create({
        tabId: tab.id,
        type: "popup",
        focused: true,
        height: 320,
        width: 320,
      });
    }
  );
});

