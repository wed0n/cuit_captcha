import glob
import json
import shutil
import subprocess
import sys
import os
import filecmp

copyList = ["node_modules/onnxruntime-web/dist/ort-wasm-simd.wasm"]

result = subprocess.run("pnpm build", shell=True)
if result.returncode != 0:
    print("Vite构建失败", file=sys.stderr)
    exit(-1)
jsList = glob.glob("vite_dist/assets/*.js")
if len(jsList) != 1:
    print("生成的js文件数不为1", file=sys.stderr)
    exit(-2)

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
// @icon         https://static.wed0n.top/cuit/captcha/vite.svg
// @grant        none
// @sandbox      JavaScript
// @run-at       document-idle
// ==/UserScript==

// 如果你不想忍受Cloudflare在璃月的访问速度较慢，而且你有自己的服务器，你可以修改这个资源路径。
const resourcePath = "https://static.wed0n.top/cuit/captcha/";

console.log("cuit_captcha");

""".format(version)

with open(jsList[0], "r", encoding="UTF-8") as last, open("dist/userscript.js", "w", encoding="UTF-8") as result:
    result.write(first+last.read())

for path in copyList:
    name = os.path.basename(path)
    target = "dist/"+name
    if not os.path.exists(target) or not filecmp.cmp(target, path):
        shutil.copy2(path, target)
