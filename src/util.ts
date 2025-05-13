import { InferenceSession, Tensor } from 'onnxruntime-web'
import { charArray } from './char_array'

// 对图片的预处理及将结果转为字符串参照原项目，使用TypeScript实现
// https://github.com/sml2h3/ddddocr/blob/491ce024dc1bd1c4edd3ba3f84fca5b8317c233c/ddddocr/__init__.py#L2555
export async function getImageTensor(img: HTMLImageElement): Promise<Tensor> {
  const canvas = document.createElement('canvas')
  canvas.height = 64
  canvas.width = Math.round(img.width * (64 / img.height))
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  // document.body.appendChild(canvas)
  return imageDataToTensor(imageData, canvas.width, canvas.height)
}

export function tensorToStr(tensor: InferenceSession.OnnxValueMapType) {
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
): Tensor {
  const transposedData = new Array<number>()

  for (let i = 0; i < imageData.length; i += 4) {
    // skip data[i + 3] to filter out the alpha channel
    const grey = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3
    const item = grey / 255
    transposedData.push((item - 0.5) / 0.5)
  }

  const result = new Tensor('float32', transposedData, [1, 1, height, width])
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
