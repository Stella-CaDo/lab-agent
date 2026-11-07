import request from './request'

/** 用户列表（只读）：page / size */
export const getUserList = (params) => request.get('/users', { params })
