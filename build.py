import json
import shutil
import subprocess
import sys
import os
import filecmp

copyList = [
    "node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm",
]

result = subprocess.run(
    "npx rollup ./src/main.ts --format iife --filterLogs !code:EVAL --plugin @rollup/plugin-typescript --plugin @rollup/plugin-node-resolve",
    stdout=subprocess.PIPE,
    shell=True,
)
if result.returncode != 0:
    print("Rollup 构建失败", file=sys.stderr)
    exit(-1)

version = ""
with open("package.json") as f:
    tmp = json.load(f)
    version = tmp["version"]

first = """// ==UserScript==
// @name         CUIT验证码自动填写
// @namespace    wed0n.cuit.captcha
// @homepage     https://github.com/wed0n/cuit_captcha
// @version      {}
// @description  驾校教务处登录自动填写验证码
// @author       Wed0n
// @license      MIT
// @match        *.cuit.edu.cn*/authserver/*
// @match        https://webvpn.cuit.edu.cn/*
// @icon         https://blog.wed0n.top/img/avatar.webp
// @grant        none
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==

// 如果你不想忍受 Cloudflare 在璃月的访问速度较慢，而且你有自己的服务器，你可以修改这个资源路径。
const resourcePath = "https://static.wed0n.top/cuit/captcha/";
// 启用 indexDB 缓存 WASM 运行库与模型文件，能大大提高脚本运行速度，但会增加磁盘空间消耗。
const useIndexDB = true;

console.log("cuit_captcha");

""".format(
    version
)

with open("dist/userscript.js", "w", encoding="UTF-8") as target:
    target.write(first + result.stdout.decode())

for path in copyList:
    name = os.path.basename(path)
    target = "dist/" + name
    if not os.path.exists(target) or not filecmp.cmp(target, path):
        shutil.copy2(path, target)
