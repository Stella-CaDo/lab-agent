// 浏览器内的 mock 接口层
// 用 axios 自定义 adapter 把 /api/* 的请求转到这里，不发真实网络请求
// 数据读写在 localStorage（见 db.js）：刷新、重启、build 之后都还在
// ============================================================
import { db, saveDb, resetDb, nextId, offsetDate, TIME_SLOTS } from './db.js'

const isDev = Boolean(import.meta.env && import.meta.env.DEV)

/* ---------------- 基础工具 ---------------- */
const ok = (data = null, msg = 'ok') => ({ code: 0, msg, data })
const fail = (msg = '参数错误') => ({ code: 1, msg, data: null })

/** 模拟一点网络延迟，让页面的 loading 状态看得见 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** 内存分页 */
function paginate(list, page = 1, size = 10) {
  const p = Math.max(1, Number(page) || 1)
  const s = Math.max(1, Number(size) || 10)
  return {
    list: list.slice((p - 1) * s, p * s),
    total: list.length,
    page: p,
    size: s
  }
}

/** 时段重叠判定：新开始 < 老结束 且 老开始 < 新结束 */
const isOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

/** 给预约补上实验室名 / 用户名，表格直接展示 */
function withNames(r) {
  const lab = db.labs.find((l) => l.id === r.labId)
  const user = db.users.find((u) => u.id === r.userId)
  return {
    ...r,
    labName: lab ? lab.name : '已删除实验室',
    userName: user ? user.name : '未知用户'
  }
}

/** 实验室字段校验：返回错误文案或 null */
function validateLab(body) {
  if (!body.name || !String(body.name).trim()) return '实验室名称不能为空'
  const capacity = Number(body.capacity)
  if (!capacity || capacity < 1 || capacity > 200) return '容量必须是 1 到 200 之间的数字'
  if (!body.building) return '请选择所属楼栋'
  if (body.openTime && body.closeTime && body.openTime >= body.closeTime)
    return '开放时间：结束必须晚于开始'
  return null
}

/** 把 axios 的 params 规整成字符串（null / undefined / 空串直接丢掉） */
function normalizeQuery(params = {}) {
  const query = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue
    query[key] = String(value)
  }
  return query
}

/** axios 传进来的 data 默认已经被序列化成 JSON 字符串 */
function parseBody(data) {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

/* ---------------- 所有 mock 路由 ---------------- */
export async function handleMock({ method, path, query = {}, body = {} }) {
  if (isDev) console.info('[API]', method, path, { query, body })
  await sleep(80 + Math.floor(Math.random() * 120))

  /* ===== 登录（A1 调用） ===== */
  if (path === '/auth/login' && method === 'POST') {
    const user = db.users.find((u) => u.account === body.account)
    if (!user || user.password !== body.password) return fail('账号或密码错误')
    if (user.status !== 'active') return fail('账号已被禁用')
    const { password, ...safeUser } = user
    return ok({ token: 'mock-token-' + user.id, user: safeUser }, '登录成功')
  }

  /* ===== 实验室 CRUD（B1 调用） ===== */
  if (path === '/labs' && method === 'GET') {
    const keyword = (query.keyword || '').trim()
    const building = query.building || ''
    const status = query.status || ''
    const filtered = db.labs.filter((l) => {
      const hit =
        !keyword ||
        l.name.includes(keyword) ||
        l.room.includes(keyword) ||
        l.building.includes(keyword)
      return hit && (!building || l.building === building) && (!status || l.status === status)
    })
    return ok(paginate(filtered, query.page, query.size))
  }

  if (path === '/labs' && method === 'POST') {
    const error = validateLab(body)
    if (error) return fail(error)
    // id 放最后：防止前端把表单里的 null 传进来
    const lab = {
      status: 'available',
      remark: '',
      ...body,
      id: nextId(db.labs)
    }
    db.labs.push(lab)
    saveDb()
    return ok(lab, '新增成功')
  }

  let m = /^\/labs\/(\d+)$/.exec(path)
  if (m) {
    const id = Number(m[1])
    const idx = db.labs.findIndex((l) => l.id === id)
    if (idx === -1) return fail('实验室不存在')
    if (method === 'GET') return ok(db.labs[idx])
    if (method === 'PUT') {
      const error = validateLab(body)
      if (error) return fail(error)
      db.labs[idx] = { ...db.labs[idx], ...body, id }
      saveDb()
      return ok(db.labs[idx], '修改成功')
    }
    if (method === 'DELETE') {
      const used = db.reservations.some((r) => r.labId === id && r.status === 'pending')
      if (used) return fail('该实验室还有待审核预约，不能删除')
      db.labs.splice(idx, 1)
      saveDb()
      return ok(null, '删除成功')
    }
  }

  /* ===== 预约（A2 / A3 调用） ===== */
  if (path === '/reservations' && method === 'GET') {
    const status = query.status || ''
    const date = query.date || ''
    const labId = query.labId || ''
    const filtered = db.reservations
      .filter(
        (r) =>
          (!status || r.status === status) &&
          (!date || r.date === date) &&
          (!labId || String(r.labId) === labId)
      )
      .slice()
      .sort((a, b) =>
        a.date === b.date ? (a.startTime < b.startTime ? 1 : -1) : a.date < b.date ? 1 : -1
      )
      .map(withNames)
    return ok(paginate(filtered, query.page, query.size))
  }

  if (path === '/reservations' && method === 'POST') {
    const lab = db.labs.find((l) => l.id === Number(body.labId))
    if (!lab) return fail('实验室不存在')
    if (lab.status !== 'available') return fail('该实验室当前不可预约')
    if (!body.date || !body.startTime || !body.endTime) return fail('请选择预约日期和时段')
    if (body.date < offsetDate(0)) return fail('不能预约过去的日期')
    if (body.startTime >= body.endTime) return fail('结束时间必须晚于开始时间')
    if (body.startTime < lab.openTime || body.endTime > lab.closeTime) {
      return fail('预约时段超出实验室开放时间 ' + lab.openTime + '-' + lab.closeTime)
    }
    if (Number(body.attendees) > lab.capacity)
      return fail('预约人数不能超过实验室容量 ' + lab.capacity)
    // 冲突校验：同实验室 + 同日期 + 时段重叠 + 状态有效
    const conflict = db.reservations.find(
      (r) =>
        r.labId === lab.id &&
        r.date === body.date &&
        (r.status === 'pending' || r.status === 'approved') &&
        isOverlap(body.startTime, body.endTime, r.startTime, r.endTime)
    )
    if (conflict)
      return fail('时段冲突：' + conflict.startTime + '-' + conflict.endTime + ' 已被占用')
    const record = {
      id: nextId(db.reservations),
      labId: lab.id,
      userId: Number(body.userId) || 1,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      purpose: body.purpose || '课程实验',
      attendees: Number(body.attendees) || 1,
      status: 'pending',
      createdAt: offsetDate(0) + ' ' + new Date().toTimeString().slice(0, 5)
    }
    db.reservations.push(record)
    saveDb()
    return ok(withNames(record), '预约提交成功，等待审核')
  }

  m = /^\/reservations\/(\d+)\/status$/.exec(path)
  if (m && method === 'PUT') {
    const target = db.reservations.find((r) => r.id === Number(m[1]))
    if (!target) return fail('预约不存在')
    // 状态机：待审核 → 通过/驳回；已通过 → 取消
    const allowMap = {
      pending: ['approved', 'rejected'],
      approved: ['cancelled']
    }
    if (!(allowMap[target.status] || []).includes(body.status))
      return fail('当前状态不允许这样流转')
    target.status = body.status
    saveDb()
    return ok(withNames(target), '状态已更新')
  }

  m = /^\/reservations\/(\d+)$/.exec(path)
  if (m && method === 'DELETE') {
    const idx = db.reservations.findIndex((r) => r.id === Number(m[1]))
    if (idx === -1) return fail('预约不存在')
    db.reservations.splice(idx, 1)
    saveDb()
    return ok(null, '删除成功')
  }

  /* ===== 设备（B2 调用） ===== */
  if (path === '/devices' && method === 'GET') {
    const keyword = (query.keyword || '').trim()
    const labId = query.labId || ''
    const filtered = db.devices
      .filter(
        (d) =>
          (!labId || String(d.labId) === labId) &&
          (!keyword || d.name.includes(keyword) || d.model.includes(keyword))
      )
      .map((d) => ({
        ...d,
        labName: (db.labs.find((l) => l.id === d.labId) || {}).name || '-'
      }))
    return ok(paginate(filtered, query.page, query.size))
  }

  /* ===== 用户（B3 调用，只读） ===== */
  if (path === '/users' && method === 'GET') {
    const list = db.users.map((u) => {
      const item = { ...u }
      delete item.password
      return item
    })
    return ok(paginate(list, query.page, query.size))
  }

  /* ===== 统计（A3 / A4 调用） ===== */
  if (path === '/stats/overview' && method === 'GET') {
    const today = offsetDate(0)
    const usedToday = new Set(
      db.reservations
        .filter((r) => r.date === today && r.status !== 'rejected' && r.status !== 'cancelled')
        .map((r) => r.labId + '|' + r.startTime)
    ).size
    return ok({
      labCount: db.labs.length,
      labAvailable: db.labs.filter((l) => l.status === 'available').length,
      todayReservations: db.reservations.filter((r) => r.date === today).length,
      pendingCount: db.reservations.filter((r) => r.status === 'pending').length,
      avgUsage: Math.round((usedToday / (db.labs.length * TIME_SLOTS.length)) * 1000) / 10
    })
  }

  if (path === '/stats/trend' && method === 'GET') {
    const range = Number(query.range) || 7
    const days = []
    for (let i = range - 1; i >= 0; i--) {
      const date = offsetDate(-i)
      days.push({
        date: date.slice(5),
        count: db.reservations.filter((r) => r.date === date).length
      })
    }
    return ok(days)
  }

  if (path === '/stats/lab-usage' && method === 'GET') {
    const list = db.labs
      .map((l) => ({
        name: l.name,
        count: db.reservations.filter((r) => r.labId === l.id && r.status === 'approved').length
      }))
      .sort((a, b) => b.count - a.count)
    return ok(list)
  }

  if (path === '/stats/status-ratio' && method === 'GET') {
    const nameMap = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
      cancelled: '已取消'
    }
    const list = Object.keys(nameMap).map((k) => ({
      name: nameMap[k],
      value: db.reservations.filter((r) => r.status === k).length
    }))
    return ok(list)
  }

  if (path === '/stats/heatmap' && method === 'GET') {
    const data = []
    for (let day = 0; day < 7; day++) {
      for (let slot = 0; slot < TIME_SLOTS.length; slot++) {
        const value = db.reservations.filter((r) => {
          const d = new Date(r.date + 'T00:00:00')
          return (
            d.getDay() === day &&
            r.startTime === TIME_SLOTS[slot] &&
            r.status !== 'rejected' &&
            r.status !== 'cancelled'
          )
        }).length
        data.push([day, slot, value])
      }
    }
    return ok({
      days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      slots: TIME_SLOTS,
      data
    })
  }

  return fail('接口不存在: ' + method + ' ' + path)
}

/**
 * axios 自定义 adapter：/api/* 全部在浏览器内处理
 * axios 约定返回 { data, status, statusText, headers, config, request }
 */
export async function mockAdapter(config) {
  const method = String(config.method || 'get').toUpperCase()
  const path = String(config.url || '').split('?')[0]
  const query = normalizeQuery(config.params)
  const body = parseBody(config.data)

  const result = await handleMock({ method, path, query, body })
  return {
    data: result,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  }
}

/** 给 Layout 的"重置演示数据"用：清掉缓存并恢复种子 */
export function resetMockDb() {
  resetDb()
}

/* ---------------- 开发环境调试入口 ---------------- */
if (isDev && typeof window !== 'undefined') {
  // 控制台里 __labMock.get('/labs', { page: 1, size: 2 }) 就能直接测接口
  window.__labMock = {
    get: (path, query) => handleMock({ method: 'GET', path, query }),
    post: (path, body) => handleMock({ method: 'POST', path, body }),
    put: (path, body) => handleMock({ method: 'PUT', path, body }),
    del: (path) => handleMock({ method: 'DELETE', path }),
    reset() {
      resetDb()
      window.location.reload()
    },
    dump: () => db
  }
}
