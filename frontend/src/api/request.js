// axios 统一封装：mock adapter + token 注入 + 业务码判断 + 统一错误提示
import axios from 'axios'
import { ElMessage } from 'element-plus'
// 浏览器内的 mock 接口层：所有 /api/* 都交给它，不发真实网络请求
import { mockAdapter } from '@/mock/index.js'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  adapter: mockAdapter // 关键：全站请求在浏览器里就地处理
})

// 请求拦截：自动带 token（A1 登录后才有值）
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('lab_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

// 响应拦截：code 为 0 才算成功，直接把 data 返回给业务层
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && body.code === 0) return body.data
    const msg = (body && body.msg) || '请求失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  (error) => {
    const data = error.response && error.response.data
    const msg = (data && data.msg) || error.message || '网络异常'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
