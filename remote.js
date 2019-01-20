"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    window.onresize = () => {
        let containerSize = document.querySelector('.btn-push').getBoundingClientRect().width;
        let textPercentage = 0.17; // 40/230
        let textRatio = containerSize * textPercentage;
        let textEms = textRatio / 5;
        Array.from(document.querySelectorAll('.btn-push i')).forEach((e) => {
            e.style.fontSize = textEms + "em";
        });
    }
    window.onresize();

    const url = (new URLSearchParams(document.location.search.substring(1))).get('url');
    const urlBox = document.querySelector('#url');

    urlBox.value = url;
    urlBox.onfocus = (e) => urlBox.select();

    document.querySelector('#options').onclick = () => browser.runtime.openOptionsPage();

    const onButtonClick = (e) => {
        e.target.blur();
        document.querySelector('#url').value = e.target.getAttribute('data-url') || document.querySelector('#url').value;
        const message = {
            action: e.target.getAttribute('data-action'),
            url: document.querySelector('#url').value
        };
        browser.runtime.sendMessage(message);
    }
    Array.from(document.querySelectorAll('.btn-push')).forEach((e) => e.onclick = onButtonClick);
});
