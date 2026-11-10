import request from './request'

/** 分页查询：status / date / labName / page / size */
export const getReservationList = (params) => request.get('/reservations', { params })
/** 提交预约 */
export const createReservation = (data) => request.post('/reservations', data)
/** 审核或取消：status 取 approved / rejected / cancelled */
export const changeReservationStatus = (id, status) =>
  request.put('/reservations/' + id + '/status', { status })
/** 删除预约 */
export const deleteReservation = (id) => request.delete('/reservations/' + id)
