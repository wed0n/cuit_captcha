import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'
import * as tfvis from '@tensorflow/tfjs-vis'
import { init } from './util'

const img = document.getElementById('imgCode') as HTMLImageElement
const chars = Array.from('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')

function stringTochararray(str: string) {
  const items = Array.from(str)
  const result = []
  for (const item of items) {
    result.push(chars.indexOf(item))
  }
  return result
}

function createModel() {
  const input = tf.input({ shape: [38, 82, 1] })

  let tmp: any = input
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 2; j++) {
      tmp = tf.layers
        .conv2d({
          filters: 32 * 2 ** i,
          kernelSize: 3,
          padding: 'same',
        })
        .apply(tmp)

      tmp = tf.layers.batchNormalization().apply(tmp)
      tmp = tf.layers.activation({ activation: 'relu' }).apply(tmp)
    }
    tmp = tf.layers.maxPooling2d({ poolSize: 2 }).apply(tmp)
  }
  tmp = tf.layers.flatten().apply(tmp)
  const outputs: tf.SymbolicTensor[] = []
  for (let i = 0; i < 4; i++) {
    const tmpDense = tf.layers
      .dense({
        units: 36,
        activation: 'softmax',
      })
      .apply(tmp) as tf.SymbolicTensor
    outputs.push(tmpDense)
  }
  const model = tf.model({
    inputs: input,
    outputs: outputs,
  })
  const surface = { name: 'Model Summary', tab: 'Model Inspection' }
  tfvis.show.modelSummary(surface, model)
  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return model
}

async function prepareData(n: number) {
  const dataArray: tf.Tensor3D[] = []
  const labelArray: number[][][] = [[], [], [], []]
  for (let i = 0; i < n; i++) {
    img.src = `http://localhost:8080/captcha?${i}`
    img.setAttribute('crossOrigin', '*')
    const waitImg = new Promise<void>((resolve, _reject) => {
      img.onload = () => {
        resolve()
      }
    })
    await waitImg
    const data = tf.browser.fromPixels(img, 1)
    dataArray.push(data)
    const rep = await fetch('http://localhost:8080/code')
    const text = await rep.text()
    const array = stringTochararray(text)
    for (let i = 0; i < array.length; i++) {
      const item = Array(36).fill(0)
      item[array[i]] = 1
      labelArray[i].push(item)
    }
  }
  return {
    data: tf.stack(dataArray),
    label: [
      tf.tensor2d(labelArray[0]),
      tf.tensor2d(labelArray[1]),
      tf.tensor2d(labelArray[2]),
      tf.tensor2d(labelArray[3]),
    ],
  }
}
export async function main() {
  await init()
  const { data: trainDataArray, label: labelArray } = (await prepareData(
    10000
  ))!
  const model = createModel()
  const surface = { name: 'show.history live', tab: 'Training' }
  const history: any = []
  const result = await model.fit(trainDataArray, labelArray, {
    epochs: 8,
    batchSize: 32,
    callbacks: {
      onEpochEnd: (_epoch, log) => {
        history.push(log)
        tfvis.show.history(surface, history, [
          'loss',
          'dense_Dense1_acc',
          'dense_Dense2_acc',
          'dense_Dense3_acc',
          'dense_Dense4_acc',
        ])
      },
    },
  })
  console.log(result.history)
  document.getElementById('result')!.innerHTML = 'ok'
  if (confirm('是否下载模型')) {
    await model.save('downloads://mymodel')
  }
}

main()
