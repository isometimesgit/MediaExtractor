"use strict";

(async () => {

    let settings;
    let whitelist;
    let extensions;

    const loadSettings = async () => {
        settings = await browser.storage.sync.get(null);
        whitelist = settings.whitelist.split('\n');
        extensions = settings.extensions.split('\n');
        return settings;
    }
    const getHostFromUrl = (url) => {
        return url ? (new URL(url)).host.toLowerCase() : null;
    }
    const getExtensionFromUrl = (url) => {
        return url ? (new URL(url)).pathname.split('.').pop().toLowerCase() : null;
    }

    // load settings
    await loadSettings();

    chrome.storage.onChanged.addListener(async (changes, area) => {
        await loadSettings();
        ws.close();
    });

    // load settings register listen to requests
    chrome.webRequest.onBeforeRequest.addListener(request => {

        if (settings.disable) {
            return false;
        }
        // check if domain is valid
        if (!settings.ignore && !whitelist.includes(getHostFromUrl(request.originUrl))) {
            return false;
        }
        // check if extension is valid
        if (!extensions.includes(getExtensionFromUrl(request.url))) {
            return false;
        }
        // remove existing tab
        if (settings.closetab && request.tabId > 0) {
            browser.tabs.remove(request.tabId);
        }
        // copy url to clipboard
        navigator.clipboard.writeText(request.url);

        return { cancel: true };
    }, {
            urls: ["<all_urls>"]
        },
        ["blocking"]);
})();
