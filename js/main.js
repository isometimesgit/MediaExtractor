"use strict";

let settings;

// util
const getHostFromUrl = url => {

    return url ? (new URL(url)).host.toLowerCase() : null;
}
const getExtensionFromUrl = url => {

    return url ? (new URL(url)).pathname.split('.').pop().toLowerCase() : null;
}
const setIcon = settings => {
    if (settings.disable) {
        browser.browserAction.setIcon({ path: '/assets/icon/icon-dark.svg' });
    } else {
        browser.browserAction.setIcon({ path: '/assets/icon/icon-on.svg' });
    }
}
// handlers
const onRequestHandler = request => {

    if (settings.disable) {
        return false;
    }
    // check if domain is valid
    if (!settings.ignore && !settings.whitelist.includes(getHostFromUrl(request.originUrl))) {
        return false;
    }
    // check if extension is valid
    if (!settings.extensions.includes(getExtensionFromUrl(request.url))) {
        return false;
    }
    // remove existing tab
    if (settings.closetab && request.tabId > 0) {
        browser.tabs.query({ currentWindow: true }).then(tabs => {
            if (tabs.length > 1) {
                browser.tabs.remove(request.tabId);
            }
        });
    }
    // copy url to clipboard
    navigator.clipboard.writeText(request.url);
    return { cancel: true };
}
const onChangedHandler = (changes, area) => {

    browser.storage.sync.get(defaultSettings).then(store => {
        settings = store;
        setIcon(settings);
    });
};
// register handlers
browser.storage.sync.get(defaultSettings).then(store => {

    settings = store;
    setIcon(settings);
    chrome.storage.onChanged.addListener(onChangedHandler);
    chrome.webRequest.onBeforeRequest.addListener(onRequestHandler, {
        urls: ["<all_urls>"]
    }, ["blocking"]);
});
