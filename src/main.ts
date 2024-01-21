import * as ort from 'onnxruntime-web'
import { getImageTensor, tensorToStr } from './util'

const resourcePath = 'https://cdn.jsdelivr.net/gh/wed0n/cuit_captcha@latest/dist/'
const img = document.getElementById('imgCode') as HTMLImageElement
img.setAttribute('crossOrigin', '*')
const input = document.getElementById('captcha') as HTMLInputElement

ort.env.wasm.wasmPaths = resourcePath
let isInit = false
let session: ort.InferenceSession
async function main() {
  if (!isInit) {
    session = await ort.InferenceSession.create(resourcePath + 'model.onnx')
  }
  const inputTensor = await getImageTensor(img)
  const outputTensor = await session.run({ input1: inputTensor })
  const result = tensorToStr(outputTensor)
  input.value = result
}

img.onload = main
