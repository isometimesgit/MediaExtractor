"use strict";

const saveOptions = (e) => {

    e.preventDefault();
    browser.storage.sync.set({
        whitelist: document.querySelector("#whitelist").value.toLowerCase().split('\n').sort().join('\n'),
        extensions: document.querySelector("#extensions").value.toLowerCase().split('\n').sort().join('\n'),
        ignore: document.querySelector("#ignore").checked,
        closetab: document.querySelector("#closetab").checked,
        disable: document.querySelector("#disable").checked
    });
    updateUI();
}
const restoreOptions = async () => {

    const settings = await browser.storage.sync.get(null);
    document.querySelector('#whitelist').value = settings.whitelist || 'openload.co';
    document.querySelector('#extensions').value = settings.extensions || "avi\nmp4\nmkv\nm3u8";
    document.querySelector("#ignore").checked = settings.ignore;
    document.querySelector("#closetab").checked = settings.closetab || true;
    document.querySelector("#disable").checked = settings.disable;
}
const updateUI = () => {
    document.querySelector('#whitelist').disabled = document.querySelector("#ignore").checked;
}
document.addEventListener('DOMContentLoaded', async () => {

    await restoreOptions();
    updateUI();
    Array.from(document.querySelectorAll('input[type="checkbox"]')).forEach(i => i.onclick = updateUI);
    Array.from(document.querySelectorAll("input,textarea")).forEach(i => i.onchange = saveOptions);
});
