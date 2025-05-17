import { gunzipSync, gzipSync } from 'fflate'
import { openDB } from 'idb'
import * as ort from 'onnxruntime-web'
import { charArray } from './char_array'

// 对图片的预处理及将结果转为字符串参照原项目，使用TypeScript实现
// https://github.com/sml2h3/ddddocr/blob/491ce024dc1bd1c4edd3ba3f84fca5b8317c233c/ddddocr/__init__.py#L2555
export async function getImageTensor(
  img: HTMLImageElement
): Promise<ort.Tensor> {
  const canvas = document.createElement('canvas')
  canvas.height = 64
  canvas.width = Math.round(img.width * (64 / img.height))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  // document.body.appendChild(canvas)
  return imageDataToTensor(imageData, canvas.width, canvas.height)
}

export function tensorToStr(tensor: ort.InferenceSession.OnnxValueMapType) {
  const items: any = tensor.output.data
  let result = ''
  for (const item of items as number[]) {
    if (item == 0) continue
    result += charArray[item]
  }
  return result
}

function imageDataToTensor(
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): ort.Tensor {
  const transposedData = new Array<number>()

  for (let i = 0; i < imageData.length; i += 4) {
    // skip data[i + 3] to filter out the alpha channel
    const grey = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3
    const item = grey / 255
    transposedData.push((item - 0.5) / 0.5)
  }

  const result = new ort.Tensor('float32', transposedData, [
    1,
    1,
    height,
    width,
  ])
  return result
}

export function getInputs() {
  if (window.location.host == 'webvpn.cuit.edu.cn') {
    const inputs = document.getElementsByClassName(
      'input-txt'
    ) as unknown as HTMLInputElement[]
    return {
      usernameInput: inputs[0],
      passwordInput: inputs[1],
      isJwc: false,
    }
  } else if (
    /.*\.cuit\.edu\.cn[^/]*\/authserver\/.*/.test(window.location.href)
  ) {
    return {
      usernameInput: document.getElementById('usernamepsw') as HTMLInputElement,
      passwordInput: document.getElementById('password') as HTMLInputElement,
      isJwc: true,
    }
  }
  throw 'Not cuit website'
}

interface Store {
  storeName: string
  pathName: string
}

let session: ort.InferenceSession
const STORE_NAME = 'runtime'
const SIMD_WASM: Store = {
  storeName: 'simdWASM',
  pathName: 'ort-wasm-simd-threaded.wasm',
}
const MODEL: Store = {
  storeName: 'model',
  pathName: 'model.onnx',
}
export async function getSession(resourcePath: string, useIndexDB: boolean) {
  if (session == undefined) {
    if (useIndexDB) {
      const db = await openDB('cuit_captcha', 1, {
        upgrade(db) {
          if (db.objectStoreNames.contains(STORE_NAME)) {
            db.deleteObjectStore(STORE_NAME)
          }
          db.createObjectStore(STORE_NAME)
        },
      })
      const [simdWasmCompressed, modelCompressed] = await Promise.all([
        db.get(STORE_NAME, SIMD_WASM.storeName),
        db.get(STORE_NAME, MODEL.storeName),
      ])

      let simdWasm: Blob
      let model: Blob
      if (simdWasmCompressed === undefined || modelCompressed === undefined) {
        const downloadAndStore = async (store: Store) => {
          const response = await fetch(resourcePath + store.pathName)
          if (!response.ok) throw new Error('download failed')
          const blob = await response.blob()
          ;(async () => {
            const compressed = gzipSync(
              new Uint8Array(await blob.arrayBuffer())
            )
            db.put(STORE_NAME, compressed, store.storeName)
          })()
          return blob
        }
        const simdWasmStoreP = downloadAndStore(SIMD_WASM)
        const modelStoreP = downloadAndStore(MODEL)
        simdWasm = await simdWasmStoreP
        model = await modelStoreP
      } else {
        const unzip = async (compressData: Uint8Array) => {
          const rawData = gunzipSync(compressData)
          return new Blob([rawData], { type: 'application/wasm' })
        }
        const [simdWasm2, model2] = await Promise.all([
          unzip(simdWasmCompressed),
          unzip(modelCompressed),
        ])
        simdWasm = simdWasm2
        model = model2
      }
      ort.env.wasm.wasmPaths = {
        wasm: URL.createObjectURL(simdWasm),
      }
      session = await ort.InferenceSession.create(URL.createObjectURL(model))
    } else {
      ort.env.wasm.wasmPaths = {
        wasm: resourcePath + SIMD_WASM.pathName,
      }
      session = await ort.InferenceSession.create(resourcePath + MODEL.pathName)
    }
  }
  return session
}
