# CUIT验证码自动填写
本项目使用了[ddddocr](https://github.com/sml2h3/ddddocr)的预训练模型，通过wasm运行在浏览器中。显然图文验证码，已经完全不安全了,该退出历史的舞台了。
## 编译
由于onnxruntime-web对vite的支持不够友好，目前需要手动将`node_modules/onnxruntime-web/dist`中对应的`wasm`复制到`dist`中。
```bash
pnpm install
pnpm build
```
## 注意
wasm属于比较新的web技术，因此对浏览器的版本有要求，详情参考 https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface#browser_compatibility