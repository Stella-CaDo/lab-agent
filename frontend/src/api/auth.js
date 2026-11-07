import request from './request'

/** 登录：返回 { token, user } */
export const login = (data) => request.post('/auth/login', data)
