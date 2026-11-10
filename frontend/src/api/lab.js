import request from './request'

/** 分页查询：keyword / location / status / page / size */
export const getLabList = (params) => request.get('/labs', { params })
/** 单个实验室 */
export const getLabDetail = (id) => request.get('/labs/' + id)
/** 新增（payload 里不要带 id） */
export const createLab = (data) => request.post('/labs', data)
/** 修改 */
export const updateLab = (id, data) => request.put('/labs/' + id, data)
/** 删除 */
export const deleteLab = (id) => request.delete('/labs/' + id)
