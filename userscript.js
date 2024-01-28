// ==UserScript==
// @name         CUIT验证码自动填写
// @namespace    https://blog.wed0n.cf
// @homepage     https://github.com/wed0n/cuit_captcha
// @version      0.1.3
// @description  驾校教务处登录自动填写验证码
// @author       Wed0n
// @license      MIT
// @match        *.cuit.edu.cn*/authserver/*
// @icon         https://static.wed0n.cf/cuit/captcha/vite.svg
// @grant        none
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==

// 如果你不想忍受Cloudflare在璃月的访问速度较慢，而且你有自己的服务器，你可以修改这个资源路径。
const resourcePath = "https://static.wed0n.cf/cuit/captcha/";
// 如果需要自动填写账号密码就修改下方两个变量。
const username = "";
const password = "";

console.log("cuit_captcha");
if (username != "" && password != "") {
    document.getElementById("usernamepsw").value = username;
    document.getElementById("password").value = password;
}
