# CUIT验证码自动填写
本项目使用了[ddddocr](https://github.com/sml2h3/ddddocr)的预训练模型，通过wasm运行在浏览器中。显然图文验证码，已经完全不安全了,该退出历史的舞台了。
## 编译
```bash
pnpm install
python3 build.py
```
## 注意
WASM属于比较新的Web技术，因此对浏览器的版本有要求，详情参考 https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface#browser_compatibility