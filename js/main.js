"use strict";

let settings;

// util
const getHostFromUrl = url => {

    return url ? (new URL(url)).host.toLowerCase() : null;
}
const getExtensionFromUrl = url => {

    return url ? (new URL(url)).pathname.split('.').pop().toLowerCase() : null;
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
    });
};
// register handlers
browser.storage.sync.get(defaultSettings).then(store => {

    settings = store;
    // migrate old data format if needed
    if (!Array.isArray(settings.whitelist)) {
        settings.whitelist = Util.split(settings.whitelist);
        browser.storage.sync.set({ whitelist: settings.whitelist });
    }
    if (!Array.isArray(settings.extensions)) {
        settings.extensions = Util.split(settings.extensions);
        browser.storage.sync.set({ extensions: settings.extensions });
    }
    chrome.storage.onChanged.addListener(onChangedHandler);
    chrome.webRequest.onBeforeRequest.addListener(onRequestHandler, {
        urls: ["<all_urls>"]
    }, ["blocking"]);
});
