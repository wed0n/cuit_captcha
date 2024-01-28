import * as ort from 'onnxruntime-web'
import { getImageTensor, tensorToStr } from './util'

declare const resourcePath: string
const img = document.getElementById('imgCode') as HTMLImageElement
const input = document.getElementById('captcha') as HTMLInputElement

ort.env.wasm.wasmPaths = resourcePath
let isInited = false
let session: ort.InferenceSession

async function main() {
  if (!isInited) {
    session = await ort.InferenceSession.create(resourcePath + 'model.onnx')
    isInited = true
  }
  const inputTensor = await getImageTensor(img)
  const outputTensor = await session.run({ input1: inputTensor })
  const result = tensorToStr(outputTensor)
  input.value = result
}

img.onload = main
if (img.complete) {
  main()
}
