// 本地"数据库"：全部数据存在浏览器 localStorage 里
// 没有后端、没有数据库服务；这里的字段名 = 前端契约
// 首次运行自动生成种子数据；之后刷新、重启、build 之后都还在
import { PURPOSES } from '../constants/dict.js'

const STORAGE_KEY = 'lab_db_v1'
const DB_VERSION = 1

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
export const nextId = (list) => (list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1)

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

/** 生成一份全新的种子数据（首次进入和"重置演示数据"都用它） */
function createSeed() {
  const rand = seededRandom(20240501)
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]

  /* ---------------- 用户（A1 登录用） ---------------- */
  const users = [
    {
      id: 1,
      name: '张管理',
      account: 'admin',
      password: '123456',
      role: 'admin',
      phone: '13800000001',
      status: 'active'
    },
    {
      id: 2,
      name: '李老师',
      account: 'teacher',
      password: '123456',
      role: 'teacher',
      phone: '13800000002',
      status: 'active'
    },
    {
      id: 3,
      name: '王同学',
      account: 'student',
      password: '123456',
      role: 'student',
      phone: '13800000003',
      status: 'active'
    },
    {
      id: 4,
      name: '赵同学',
      account: 'student2',
      password: '123456',
      role: 'student',
      phone: '13800000004',
      status: 'active'
    }
  ]

  /* ---------------- 实验室 ---------------- */
  const labs = [
    {
      id: 1,
      name: '计算机基础实验室',
      building: 'A栋',
      room: 'A201',
      capacity: 60,
      openTime: '08:00',
      closeTime: '21:00',
      status: 'available',
      remark: '60 台高性能 PC'
    },
    {
      id: 2,
      name: '计算机网络实验室',
      building: 'A栋',
      room: 'A305',
      capacity: 40,
      openTime: '08:00',
      closeTime: '20:00',
      status: 'available',
      remark: '含路由器交换机实验台'
    },
    {
      id: 3,
      name: '软件工程实验室',
      building: 'A栋',
      room: 'A401',
      capacity: 50,
      openTime: '09:00',
      closeTime: '21:00',
      status: 'available',
      remark: '双屏工位'
    },
    {
      id: 4,
      name: '电子电路实验室',
      building: 'B栋',
      room: 'B102',
      capacity: 36,
      openTime: '08:30',
      closeTime: '18:00',
      status: 'available',
      remark: '示波器 / 万用表'
    },
    {
      id: 5,
      name: '嵌入式系统实验室',
      building: 'B栋',
      room: 'B205',
      capacity: 30,
      openTime: '09:00',
      closeTime: '20:00',
      status: 'maintenance',
      remark: '设备检修中'
    },
    {
      id: 6,
      name: '化学分析实验室',
      building: 'C栋',
      room: 'C101',
      capacity: 24,
      openTime: '08:00',
      closeTime: '17:00',
      status: 'available',
      remark: '需穿实验服'
    },
    {
      id: 7,
      name: '物理光学实验室',
      building: 'C栋',
      room: 'C203',
      capacity: 28,
      openTime: '08:00',
      closeTime: '17:30',
      status: 'available',
      remark: '激光设备'
    },
    {
      id: 8,
      name: '人工智能实验室',
      building: 'A栋',
      room: 'A502',
      capacity: 45,
      openTime: '08:00',
      closeTime: '22:00',
      status: 'available',
      remark: 'GPU 服务器集群'
    }
  ]

  /* ---------------- 设备 ---------------- */
  const devices = [
    {
      id: 1,
      labId: 1,
      name: '台式机',
      model: 'Dell OptiPlex 7010',
      count: 60,
      status: 'normal',
      purchaseDate: '2023-09-01'
    },
    {
      id: 2,
      labId: 1,
      name: '投影仪',
      model: 'Epson CB-X06',
      count: 1,
      status: 'normal',
      purchaseDate: '2023-09-01'
    },
    {
      id: 3,
      labId: 2,
      name: '交换机',
      model: 'H3C S5130',
      count: 12,
      status: 'normal',
      purchaseDate: '2022-03-15'
    },
    {
      id: 4,
      labId: 2,
      name: '路由器',
      model: 'Cisco 2911',
      count: 8,
      status: 'normal',
      purchaseDate: '2022-03-15'
    },
    {
      id: 5,
      labId: 3,
      name: '显示器',
      model: 'AOC 27寸',
      count: 100,
      status: 'normal',
      purchaseDate: '2024-02-20'
    },
    {
      id: 6,
      labId: 4,
      name: '示波器',
      model: 'Tektronix TBS1102',
      count: 20,
      status: 'normal',
      purchaseDate: '2021-11-10'
    },
    {
      id: 7,
      labId: 4,
      name: '万用表',
      model: 'Fluke 17B+',
      count: 24,
      status: 'repair',
      purchaseDate: '2021-11-10'
    },
    {
      id: 8,
      labId: 5,
      name: 'STM32 开发板',
      model: 'STM32F407',
      count: 30,
      status: 'normal',
      purchaseDate: '2023-06-05'
    },
    {
      id: 9,
      labId: 6,
      name: '电子天平',
      model: 'FA2004',
      count: 10,
      status: 'normal',
      purchaseDate: '2022-09-12'
    },
    {
      id: 10,
      labId: 7,
      name: '激光器',
      model: 'He-Ne 2mW',
      count: 6,
      status: 'normal',
      purchaseDate: '2020-04-18'
    },
    {
      id: 11,
      labId: 8,
      name: 'GPU 服务器',
      model: 'NVIDIA A100 x4',
      count: 2,
      status: 'normal',
      purchaseDate: '2024-05-30'
    },
    {
      id: 12,
      labId: 8,
      name: '工作站',
      model: 'Dell Precision 7960',
      count: 10,
      status: 'normal',
      purchaseDate: '2024-05-30'
    }
  ]

  /* ---------------- 预约记录（按相对日期生成） ---------------- */
  const reservations = []
  let id = 1
  for (let day = -29; day <= 2; day++) {
    const date = offsetDate(day)
    const count = 2 + Math.floor(rand() * 4)
    for (let i = 0; i < count; i++) {
      // 只在实验室开放时段内生成，避免"8:00 预约 8:30 才开门"的假数据
      let lab, slot
      do {
        lab = pick(labs)
        slot = pick(SLOT_RANGES)
      } while (slot[0] < lab.openTime || slot[1] > lab.closeTime)
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
        labId: lab.id,
        userId: pick(users).id,
        date,
        startTime: slot[0],
        endTime: slot[1],
        purpose: pick(PURPOSES),
        attendees: 10 + Math.floor(rand() * 25),
        status,
        createdAt: date + ' 09:00'
      })
    }
  }

  return { version: DB_VERSION, labs, users, devices, reservations }
}

/** 读 localStorage；数据损坏或版本不对就当没有，重新种子 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || data.version !== DB_VERSION || !Array.isArray(data.labs)) return null
    return data
  } catch {
    return null
  }
}

/** 把当前内存数据写回 localStorage；无痕模式写不进去也不影响页面运行 */
export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // 忽略：隐私模式 / 空间满时只影响刷新后的持久化
  }
}

/** 当前数据：优先读浏览器缓存，没有就生成种子并落盘 */
export const db =
  readStorage() ||
  (() => {
    const fresh = createSeed()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    } catch {
      // 忽略
    }
    return fresh
  })()

/** 重置演示数据：内存和 localStorage 一起恢复成种子 */
export function resetDb() {
  const fresh = createSeed()
  for (const key of Object.keys(db)) delete db[key]
  Object.assign(db, fresh)
  saveDb()
  return db
}

/** 调试用：localStorage 的 key */
export const DB_KEY = STORAGE_KEY
