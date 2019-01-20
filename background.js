"use strict";

(async () => {

    const log = console.log;

    let settings;
    let whitelist;
    let extensions;

    const loadSettings = async () => {
        settings = await browser.storage.sync.get(null);
        whitelist = settings.whitelist.split('\n');
        extensions = settings.extensions.split('\n');
        return settings;
    }
    const launchRemoteTab = async (url) => {
        const remoteBase = browser.runtime.getURL('remote.html');
        const remoteUrl = remoteBase + '?url=' + encodeURIComponent(url);
        let tabs = await browser.tabs.query({ currentWindow: true });
        for (let tab of tabs) {
            if (tab.url.indexOf(remoteBase) === 0) {
                browser.tabs.remove(tab.id);
            }
        }
        return browser.tabs.create({ url: remoteUrl });
    }
    const getHostFromUrl = (url) => {
        return url ? (new URL(url)).host.toLowerCase() : null;
    }
    const getExtensionFromUrl = (url) => {
        return url ? (new URL(url)).pathname.split('.').pop().toLowerCase() : null;
    }
    // note: will miss opening && closing states ... would need a q
    const sendServerMesssage = (message) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(message));
        } else if (ws.readyState === ws.CLOSED) {
            ws = new WebSocket(settings.serverURL);
            ws.onopen = e => ws.send(JSON.stringify(message));
        }
    }
    // load settings
    await loadSettings();

    // start web socket client
    let ws = new WebSocket(settings.serverURL);
    ws.onerror = e => log('websocket error', e);

    // receive message from remote
    browser.runtime.onMessage.addListener((message, sender) => {
        message.key = settings.serverKey;
        sendServerMesssage(message);
    });
    chrome.storage.onChanged.addListener(async (changes, area) => {
        await loadSettings();
        ws.close();
    });
    chrome.browserAction.onClicked.addListener(async () => {
        chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tabs) {
            launchRemoteTab(tabs[0].url);
        });
    });

    // load settings register listen to requests
    chrome.webRequest.onBeforeRequest.addListener(request => {

        if (settings.disable) {
            return false;
        }
        // check if request is valid
        if (!settings.ignore && !whitelist.includes(getHostFromUrl(request.originUrl))) {
            return false;
        }
        if (!extensions.includes(getExtensionFromUrl(request.url))) {
            return false;
        }
        // remove existing tab
        if (settings.closetab && request.tabId > 0) {
            browser.tabs.remove(request.tabId);
        }
        if (settings.clipboard) {
            navigator.clipboard.writeText(request.url);
        }
        // open remote / player
        if (settings.noremote) {
            sendServerMesssage({ action: 'play', url: request.url, key: settings.serverKey });
        } else {
            launchRemoteTab(request.url);
        }
        return { cancel: true };
    }, {
            urls: ["<all_urls>"]
        },
        ["blocking"]);
})();
