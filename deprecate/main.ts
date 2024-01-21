import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'
import { init } from './util'

const img = document.getElementById('imgCode') as HTMLImageElement
img.setAttribute('crossOrigin', '*')
const chars = Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
let isInitTf = false
let model: tf.LayersModel
async function main() {
  if (!isInitTf) {
    await init()
    model = await tf.loadLayersModel('http://localhost:8090/mymodel.json')
    isInitTf = true
  }
  const data = tf.browser.fromPixels(img, 1)
  const result = model.predict(data.reshape([1, 38, 82, 1])) as tf.Tensor[]
  console.log(tensorToString(result))
}

function tensorToString(tensors: tf.Tensor[]) {
  let result = ''
  for (let tensor of tensors) {
    const array = tensor.dataSync()
    let tmp = 0
    for (let i = 0; i < array.length; i++) {
      if (array[i] > array[tmp]) {
        tmp = i
      }
    }
    result += chars[tmp]
  }
  return result
}

img.onload = main
main()
