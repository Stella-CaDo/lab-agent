// 本地"数据库"：全部数据存在浏览器 localStorage 里
// 没有后端、没有数据库服务；这里的字段名 = 前端契约
//
// 存储分工（以变体页面为准）：
//   labList    —— 实验室（变体 Lab.vue 直接读写这个 key）
//   deviceList —— 设备  （变体 Equ.vue 直接读写这个 key）
//   userList / reserveList —— 只读镜像，给变体 Home.vue 的 4 张卡取数
//   lab_db_v1  —— 用户 / 预约的完整数据（变体里没有这两张表，沿用主干的）
//
// 实验室和预约统一用 labName(字符串) 关联，不再用 labId。
import { PURPOSES } from '../constants/dict.js'

const STORAGE_KEY = 'lab_db_v1'
const DB_VERSION = 2

/** 变体页面直读的 key：实验室 / 设备以这里为准 */
export const LEGACY_KEY = {
  labs: 'labList',
  devices: 'deviceList',
  users: 'userList',
  reservations: 'reserveList'
}

/** 固定种子伪随机：同一个种子每次生成的数据一样 */
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

/** Date 转 YYYY-MM-DD */
export function fmtDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

/** 相对今天偏移 n 天的日期字符串（负数表示过去） */
export function offsetDate(n) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return fmtDate(d)
}

/** 新增数据时取下一个 id */
export const nextId = (list) =>
  list.length ? Math.max(...list.map((i) => Number(i.id) || 0)) + 1 : 1

/** 6 个标准时段：热力图纵轴直接用 */
export const TIME_SLOTS = ['08:00', '10:00', '13:00', '15:00', '17:00', '19:00']
const SLOT_RANGES = [
  ['08:00', '10:00'],
  ['10:00', '12:00'],
  ['13:00', '15:00'],
  ['15:00', '17:00'],
  ['17:00', '19:00'],
  ['19:00', '21:00']
]

/* ================= 种子数据：实验室 / 设备照搬变体页面里的那份 ================= */

export const SEED_LABS = [
  { id: 1, labName: '计算机实验室1', location: '实验楼301', maxPeople: 40, status: '可用' },
  { id: 2, labName: '物理实验室', location: '实验楼205', maxPeople: 30, status: '可用' },
  { id: 3, labName: '化学实验室', location: '实验楼102', maxPeople: 25, status: '维修中' }
]

export const SEED_DEVICES = [
  { id: 'DEV001', name: '激光雷达', type: '测量仪器', labName: 'ROS机器人实验室', status: '正常', count: 8, remark: '思岚RPLIDAR A1' },
  { id: 'DEV002', name: 'Jetson Nano开发板', type: '计算机设备', labName: 'ROS机器人实验室', status: '正常', count: 12, remark: '4G版本' },
  { id: 'DEV003', name: '工业相机', type: '光学设备', labName: 'ROS机器人实验室', status: '维修中', count: 3, remark: 'USB全局快门相机' },
  { id: 'DEV004', name: 'STM32单片机', type: '计算机设备', labName: '嵌入式实验室', status: '正常', count: 30, remark: 'F103C8T6' },
  { id: 'DEV005', name: '示波器', type: '测量仪器', labName: '嵌入式实验室', status: '正常', count: 6, remark: '双通道数字示波器' },
  { id: 'DEV006', name: '伺服电机套件', type: '机械装置', labName: 'ROS机器人实验室', status: '正常', count: 5, remark: '带减速器' },
  { id: 'DEV007', name: '台式主机', type: '计算机设备', labName: '计算机机房A', status: '正常', count: 45, remark: 'i5主机，Ubuntu系统' },
  { id: 'DEV008', name: '双目深度相机', type: '光学设备', labName: 'ROS机器人实验室', status: '维修中', count: 2, remark: '奥比中光' },
  { id: 'DEV009', name: '稳压电源', type: '测量仪器', labName: '嵌入式实验室', status: '正常', count: 10, remark: '0-30V可调' },
  { id: 'DEV010', name: '机械臂', type: '机械装置', labName: 'ROS机器人实验室', status: '正常', count: 4, remark: '6轴协作机械臂' }
]

/** 读数组型缓存；没有就灌种子，坏数据也当没有 */
function readArray(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : null
  } catch {
    return null
  }
}

/** 读数组型缓存；没有就灌种子并落盘 */
function readOrSeed(key, seed) {
  const data = readArray(key)
  if (data) return data
  const fresh = JSON.parse(JSON.stringify(seed))
  try {
    localStorage.setItem(key, JSON.stringify(fresh))
  } catch {
    // 无痕模式写不进去，内存里照样能用
  }
  return fresh
}

/** 生成用户 + 预约的种子（变体里没有这两张表，沿用主干的玩法） */
function createCore() {
  const rand = seededRandom(20240501)
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  const users = [
    { id: 1, name: '张管理', account: 'admin', password: '123456', role: 'admin', phone: '13800000001', status: 'active' },
    { id: 2, name: '李老师', account: 'teacher', password: '123456', role: 'teacher', phone: '13800000002', status: 'active' },
    { id: 3, name: '王同学', account: 'student', password: '123456', role: 'student', phone: '13800000003', status: 'active' },
    { id: 4, name: '赵同学', account: 'student2', password: '123456', role: 'student', phone: '13800000004', status: 'active' }
  ]

  const reservations = []
  let id = 1
  for (let day = -29; day <= 2; day++) {
    const date = offsetDate(day)
    const count = 2 + Math.floor(rand() * 4)
    for (let i = 0; i < count; i++) {
      const lab = pick(SEED_LABS)
      const slot = pick(SLOT_RANGES)
      const r = rand()
      const status =
        day < 0
          ? r < 0.72
            ? 'approved'
            : r < 0.86
              ? 'rejected'
              : 'cancelled'
          : r < 0.5
            ? 'pending'
            : 'approved'
      reservations.push({
        id: id++,
        // 用实验室名字关联（变体里实验室没有 labId 这个概念）
        labName: lab.labName,
        userId: pick(users).id,
        date,
        startTime: slot[0],
        endTime: slot[1],
        purpose: pick(PURPOSES),
        attendees: 1 + Math.floor(rand() * Math.min(lab.maxPeople, 40)),
        status,
        createdAt: date + ' 09:00'
      })
    }
  }

  return { version: DB_VERSION, users, reservations }
}

/** 读 lab_db_v1；版本不对或形状不对就当没有 */
function readCore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.version !== DB_VERSION) return null
    if (!Array.isArray(data.users) || !Array.isArray(data.reservations)) return null
    return data
  } catch {
    return null
  }
}

const core = readCore() || createCore()

/** 当前数据：实验室 / 设备读变体的 key，用户 / 预约读 lab_db_v1 */
export const db = {
  version: DB_VERSION,
  labs: readOrSeed(LEGACY_KEY.labs, SEED_LABS),
  devices: readOrSeed(LEGACY_KEY.devices, SEED_DEVICES),
  users: core.users,
  reservations: core.reservations
}

/** 把当前内存数据写回 localStorage；无痕模式写不进去也不影响页面运行 */
export function saveDb() {
  try {
    localStorage.setItem(LEGACY_KEY.labs, JSON.stringify(db.labs))
    localStorage.setItem(LEGACY_KEY.devices, JSON.stringify(db.devices))
    // 首页两张卡只取条数，用户镜像里去掉密码
    localStorage.setItem(
      LEGACY_KEY.users,
      JSON.stringify(db.users.map(({ password, ...u }) => u))
    )
    localStorage.setItem(LEGACY_KEY.reservations, JSON.stringify(db.reservations))
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: DB_VERSION,
        users: db.users,
        reservations: db.reservations
      })
    )
  } catch {
    // 忽略：隐私模式 / 空间满时只影响刷新后的持久化
  }
}

/**
 * 变体页面是直接写 labList / deviceList 的（不经过接口）。
 * 接口处理请求前先同步一次，保证两边看到的是同一份数据。
 */
export function syncLegacyIn() {
  const labs = readArray(LEGACY_KEY.labs)
  if (labs) db.labs = labs
  const devices = readArray(LEGACY_KEY.devices)
  if (devices) db.devices = devices
}

/** 重置演示数据：内存和 localStorage 一起恢复成种子 */
export function resetDb() {
  const fresh = createCore()
  const labs = JSON.parse(JSON.stringify(SEED_LABS))
  const devices = JSON.parse(JSON.stringify(SEED_DEVICES))
  for (const key of Object.keys(db)) delete db[key]
  Object.assign(db, { ...fresh, labs, devices })
  saveDb()
  return db
}

/** 启动时先把两个镜像 key 补齐，首页一进来就有数字 */
saveDb()

/** 调试用：localStorage 的 key */
export const DB_KEY = STORAGE_KEY
