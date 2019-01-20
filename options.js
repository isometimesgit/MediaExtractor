"use strict";

const saveOptions = (e) => {

    e.preventDefault();
    browser.storage.sync.set({
        serverURL: document.querySelector("#serverURL").value,
        serverKey: document.querySelector("#serverKey").value,
        whitelist: document.querySelector("#whitelist").value.toLowerCase().split('\n').sort().join('\n'),
        extensions: document.querySelector("#extensions").value.toLowerCase().split('\n').sort().join('\n'),
        ignore: document.querySelector("#ignore").checked,
        noremote: document.querySelector("#noremote").checked,
        closetab: document.querySelector("#closetab").checked,
        disable: document.querySelector("#disable").checked,
        clipboard: document.querySelector("#clipboard").checked
    });
    updateUI();
}
const restoreOptions = async () => {

    const settings = await browser.storage.sync.get(null);
    document.querySelector('#serverURL').value = settings.serverURL || 'ws://localhost:8080';
    document.querySelector('#serverKey').value = settings.serverKey || Math.random().toString(36).substr(2, 8);
    document.querySelector('#whitelist').value = settings.whitelist.toLowerCase() || 'openload.co';
    document.querySelector('#extensions').value = settings.extensions.toLowerCase() || 'avi\nmp4\nmkv';
    document.querySelector("#ignore").checked = settings.ignore;
    document.querySelector("#noremote").checked = settings.noremote;
    document.querySelector("#closetab").checked = settings.closetab || true;
    document.querySelector("#disable").checked = settings.disable;
    document.querySelector("#clipboard").checked = settings.clipboard;
}
const updateUI = () => {
    document.querySelector('#whitelist').disabled = document.querySelector("#ignore").checked;
}
const openRemoteTab = async () => {
    const remoteBase = browser.runtime.getURL('remote.html');
    let tabs = await browser.tabs.query({ currentWindow: true });
    for (let tab of tabs) {
        if (tab.url.indexOf(remoteBase) === 0) {
            browser.tabs.remove(tab.id);
        }
    }
    browser.tabs.create({ url: browser.runtime.getURL('remote.html') });
}
document.addEventListener('DOMContentLoaded', async () => {

    await restoreOptions();
    updateUI();
    Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(i => i.onclick = updateUI);
    Array.from(document.querySelectorAll("input,textarea")).forEach(i => i.onchange = saveOptions);
    document.querySelector('#open-remote').addEventListener('click', () => openRemoteTab());
});
