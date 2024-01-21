import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'

export async function init() {
  try {
    await tf.setBackend('webgpu')
    console.log('use webgpu')
  } catch (error) {
    console.log('use webgl')
  }
  console.log('init tf')
}
export function printTensor(tensor: tf.Tensor) {
  console.log(tensor)
  console.log(tensor.arraySync())
}
