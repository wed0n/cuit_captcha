import {
  getImageTensor,
  getInputs,
  getSession,
  tensorToStr
} from './util'

declare const resourcePath: string
declare const useIndexDB: boolean
declare function checkLogin(): void

const USERNAME = 'username'
const PASSWORD = 'password'

const username = localStorage.getItem(USERNAME)
const password = localStorage.getItem(PASSWORD)
const img = document.getElementById('imgCode') as HTMLImageElement
const captchaInput = document.getElementById('captcha') as HTMLInputElement

let shouldClick = true

async function main() {
  const { usernameInput, passwordInput, isJwc } = getInputs()
  const loginButton = document.getElementsByTagName(
    'button'
  )[0] as HTMLButtonElement

  function login() {
    let input = (input: HTMLInputElement, value: string) => {
      const event = new Event('change')
      input.value = value
      input.dispatchEvent(event)
    }
    if (username != null && password != null) {
      input(usernameInput, username)
      input(passwordInput, password)
      if (shouldClick) loginButton.click()
    }
  }

  function refreshCaptcha() {
    const timestamp = new Date().getTime()
    img.src = `captcha?timestamp=${timestamp}`
  }

  async function jwc() {
    const session = await getSession(resourcePath, useIndexDB)
    const messageElement = document.getElementsByClassName('tipLi')[0]
    const observer = new MutationObserver(() => {
      const message = messageElement.innerHTML
      if (message.includes('验证码')) refreshCaptcha()
      else if (message.includes('账号或者密码')) shouldClick = false
    })
    observer.observe(messageElement, {
      childList: true,
      subtree: false,
    })

    const inputTensor = await getImageTensor(img)
    const outputTensor = await session.run({ input1: inputTensor })
    const result = tensorToStr(outputTensor)
    if (!/^\w{4}$/.test(result)) {
      refreshCaptcha()
      return
    }
    captchaInput.value = result.toLowerCase()
    login()
  }

  loginButton.onclick = () => {
    let check = (input: HTMLInputElement, key: string) => {
      if (input.value != '') {
        localStorage.setItem(key, input.value)
      }
    }
    check(usernameInput, USERNAME)
    check(passwordInput, PASSWORD)
    if (isJwc) checkLogin()
  }

  if (isJwc) {
    img.onload = jwc
    if (img.complete) {
      jwc()
    }
  } else {
    login()
  }
}

const wait = setInterval(() => {
  const form = document.getElementsByTagName('form')[0]
  if (form != undefined) {
    clearInterval(wait)
    main()
  }
}, 500)
