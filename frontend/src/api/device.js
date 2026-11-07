import request from './request'

/** 分页查询：keyword / labId / page / size */
export const getDeviceList = (params) => request.get('/devices', { params })
