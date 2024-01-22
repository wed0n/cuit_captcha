// ==UserScript==
// @name         CUIT验证码自动填写
// @namespace    https:/blog.wed0n.cf
// @version      0.1.0
// @description  驾校教务处登录自动填写验证码
// @author       Wed0n
// @match        *.cuit.edu.cn*/authserver/*
// @icon         https://cdn.jsdelivr.net/gh/wed0n/cuit_captcha@latest/public/vite.svg
// @grant        none
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==
(async () => {
    console.log("cuit_captcha");
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/wed0n/cuit_captcha@latest/dist/script.js';
    script.type = 'module';
    document.body.appendChild(script);
})();