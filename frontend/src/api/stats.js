import request from './request'

/** 首页 4 个指标 */
export const getOverview = () => request.get('/stats/overview')
/** 预约趋势：range 取 7 或 30 */
export const getTrend = (range = 7) => request.get('/stats/trend', { params: { range } })
/** 各实验室使用次数（降序） */
export const getLabUsage = () => request.get('/stats/lab-usage')
/** 预约状态占比 */
export const getStatusRatio = () => request.get('/stats/status-ratio')
/** 周 × 时段热力图 */
export const getHeatmap = () => request.get('/stats/heatmap')
