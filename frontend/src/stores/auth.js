import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'

const TOKEN_KEY = 'lab_token'
const USER_KEY = 'lab_user'

/** localStorage 里的 user 可能被手动改坏，读失败就当作没登录 */
function readUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref(readUser())

  /** 调接口拿 { token, user }，同时写内存和 localStorage */
  async function login(payload) {
    const data = await loginApi(payload)
    token.value = data.token
    user.value = data.user
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, login, logout }
})
