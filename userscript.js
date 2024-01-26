// ==UserScript==
// @name         CUIT验证码自动填写
// @namespace    https:/blog.wed0n.cf
// @version      0.1.2
// @description  驾校教务处登录自动填写验证码
// @author       Wed0n
// @license      MIT
// @match        *.cuit.edu.cn*/authserver/*
// @icon         https://cdn.jsdelivr.net/gh/wed0n/cuit_captcha@latest/public/vite.svg
// @grant        none
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==
(async () => {
    window.wed0nPath = "https://static.wed0n.cf/cuit/captcha/";
    const username = "";
    const password = "";

    console.log("cuit_captcha");
    const script = document.createElement("script");
    script.src = wed0nPath + "script.js";
    script.type = "module";
    document.body.appendChild(script);
    if (username != "" && password != "") {
        document.getElementById("usernamepsw").value = username;
        document.getElementById("password").value = password;
    }
})();