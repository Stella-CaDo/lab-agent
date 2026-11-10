import request from './request'

/** 分页查询：keyword / labName / page / size */
export const getDeviceList = (params) => request.get('/devices', { params })
