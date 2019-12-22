"use strict";

const saveOptions = evt => {
    browser.storage.sync.set({
        whitelist: Util.split(document.querySelector("#whitelist").value),
        extensions: Util.split(document.querySelector("#extensions").value),
        ignore: document.querySelector("#ignore").checked,
        closetab: document.querySelector("#closetab").checked,
        disable: document.querySelector("#disable").checked
    });
}
const restoreOptions = async _ => {

    const settings = await browser.storage.sync.get(defaultSettings);
    document.querySelector('#whitelist').value = Util.join(settings.whitelist);
    document.querySelector('#extensions').value = Util.join(settings.extensions);
    document.querySelector("#ignore").checked = settings.ignore;
    document.querySelector("#closetab").checked = settings.closetab;
    document.querySelector("#disable").checked = settings.disable;
}
document.addEventListener('DOMContentLoaded', async _ => {
    await restoreOptions();
    Array.from(document.querySelectorAll("input,textarea")).forEach(i => i.onchange = saveOptions);
});
