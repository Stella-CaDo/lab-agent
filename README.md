# 实验室预约系统（Lab Agent）

> **纯前端的实验室预约与管理演示系统**：管理员、教师、学生登录后，可以维护实验室与设备、提交并审核预约、查看预约统计。
>
> 项目没有后端服务和数据库：所有 `/api/*` 请求由浏览器内的 mock 层接管，数据持久化在浏览器 `localStorage` 中 —— 刷新页面、重启开发服务器或重新构建后数据仍然存在。

适合作为 Vue 3 全家桶 + Element Plus + ECharts 的课程设计、前端综合实训或答辩演示项目。

---

## 功能概览

| 模块 | 路由 | 主要能力 |
| --- | --- | --- |
| 登录 | `/login` | 账号密码登录、账号非空与密码 ≥ 6 位校验、成功 / 失败动画、登录后回跳来源页 |
| 系统首页 | `/manager/home` | 实验室 / 设备 / 预约 / 用户 4 张指标卡，点击直达对应页面 |
| 实验室管理 | `/manager/lab` | 按名称过滤、新增 / 编辑 / 删除、重名校验 |
| 设备管理 | `/manager/equ` | 按名称 / 编号过滤、新增 / 编辑 / 删除（二次确认）、自动生成 `DEVxxx` 编号 |
| 预约管理 | `/manager/booking` | 状态 Tabs、日期 / 实验室筛选、新建预约、冲突预检、通过 / 驳回 / 取消 / 删除、分页 |
| 数据统计 | `/manager/data` | 5 张指标卡 + 4 张 ECharts 图表，支持近 7 / 30 天切换与整体刷新 |
| 用户管理 | `/manager/user` | 只读用户列表、关键字 / 角色 / 状态筛选、分页（10 / 20 / 50） |
| 404 | 未匹配路径 | 统一兜底页，可一键回首页 |

### 登录与访问控制

- 未登录访问任意页面会被守卫重定向到 `/login?redirect=原路径`，登录成功后回跳。
- 已登录再访问 `/login` 会自动回到 `/manager/home`。
- `token` 与用户信息分别持久化在 `lab_token`、`lab_user`，刷新不掉登录。
- 顶栏显示当前用户姓名，右侧「退出」清空登录态并回到登录页。
- 浏览器标题随路由变化，格式为 `页面名 - 实验室预约系统`。

---

## 技术栈

| 分类 | 技术 | 版本（package-lock） |
| --- | --- | --- |
| 前端框架 | Vue | 3.5.44 |
| 构建工具 | Vite | 8.3.5 |
| 路由 | Vue Router | 5.4.0 |
| 状态管理 | Pinia | 4.1.0 |
| UI 组件库 | Element Plus | 2.14.7 |
| 图表 | ECharts | 6.1.0 |
| HTTP | axios | 1.21.0 |
| 运行时 | Node.js | `^22.18.0` 或 `>=24.12.0` |

> Element Plus 使用 `zh-cn` locale 并全局注册图标；ECharts 在 `ChartBox.vue` 中按需注册折线 / 柱状 / 饼 / 热力四种图表。

---

## 快速开始

### 环境要求

- Node.js：`^22.18.0 || >=24.12.0`（实测 24.14.0）
- npm：10+（实测 11.19.1）

### 安装与启动

先进入前端目录：

```powershell
cd frontend
npm install
npm run dev
```

终端会输出本地地址，默认 <http://localhost:5173>；端口被占用时 Vite 会自动递增，请以终端输出为准。

### 构建与预览

在 `frontend/` 目录执行：

```powershell
npm run build     # 产物输出到 dist/
npm run preview   # 本地预览构建产物
npm run format    # Prettier 格式化 src/
```

### 5 分钟演示路线

1. 用 `admin / 123456` 登录，进入系统首页。
2. 点击首页「实验室总数」卡片，进入实验室管理，新增一间「虚拟仿真实验室」（容量 30）。
3. 打开预约管理 → 新建预约，选择该实验室、明天、`10:00 - 12:00`，提交。
4. 再提交一条同时段、同实验室的预约，观察「时段冲突」提示。
5. 在预约列表中通过第一条预约，再点击一次「取消」。
6. 打开数据统计，查看趋势、状态占比与热力图的变化。

---

## 演示账号

| 账号 | 密码 | 角色 | 姓名 |
| --- | --- | --- | --- |
| `admin` | `123456` | 管理员 | 张管理 |
| `teacher` | `123456` | 教师 | 李老师 |
| `student` | `123456` | 学生 | 王同学 |
| `student2` | `123456` | 学生 | 赵同学 |

> 种子账号都是启用状态。若登录提示「账号或密码错误」，先确认浏览器里是否残留了旧版本的 `lab_db_v1` —— 清掉 `localStorage` 后刷新即可恢复种子数据。

---

## 项目结构

```text
lab-agent/
├─ README.md
└─ frontend/
   ├─ index.html
   ├─ vite.config.js          # @ → src 别名
   ├─ jsconfig.json
   ├─ package.json
   ├─ package-lock.json
   ├─ public/                 # 静态资源（当前为空）
   └─ src/
      ├─ main.js              # 入口：Pinia → Router → Element Plus → 挂载
      ├─ App.vue
      ├─ api/                 # 接口封装
      │  ├─ request.js        # axios 实例 + mock adapter + 拦截器
      │  ├─ auth.js
      │  ├─ lab.js
      │  ├─ device.js
      │  ├─ reservation.js
      │  ├─ stats.js
      │  └─ user.js
      ├─ mock/
      │  ├─ index.js          # 17 条 mock 路由 + axios adapter
      │  └─ db.js             # 种子数据 + localStorage 读写 + 重置
      ├─ stores/              # Pinia
      │  ├─ auth.js
      │  ├─ lab.js
      │  └─ reservation.js
      ├─ router/index.js      # 路由表 + 登录守卫 + 页面标题
      ├─ layouts/Layout.vue   # 顶栏 + 侧边菜单 + router-view
      ├─ views/               # Login / Home / Lab / Equ / Booking / Data / User / NotFound
      ├─ components/
      │  ├─ PageHeader.vue
      │  ├─ SearchBar.vue
      │  ├─ StatCard.vue
      │  ├─ ChartBox.vue
      │  └─ login/            # 登录页动画角色组件
      ├─ constants/dict.js    # 枚举字典
      └─ assets/
         ├─ css/global.css
         └─ img/logo.png
```

---

## 数据层设计

前端没有真实网络请求。`src/api/request.js` 创建 axios 实例时把 `adapter` 指向 `mockAdapter`，`/api/*` 的请求在浏览器内被 `src/mock/index.js` 直接处理，返回统一的 `{ code, msg, data }`；响应拦截器在 `code === 0` 时把 `data` 交给业务代码，否则弹出 `ElMessage` 并 reject。**DevTools 的 Network 面板看不到这些请求，是预期行为。**

```text
Vue 页面 / Pinia Store
        │  调用 src/api/*.js
        ▼
axios 实例（baseURL = /api，adapter = mockAdapter）
        │  请求拦截：注入 Authorization: Bearer <token>
        │  响应拦截：code === 0 解包 data，否则统一报错
        ▼
src/mock/index.js（17 条路由，80–200ms 模拟延迟）
        ▼
src/mock/db.js（种子数据、读写、重置）
        ▼
localStorage
```

### localStorage 键

| key | 内容 | 初始值 |
| --- | --- | --- |
| `lab_db_v1` | 用户 + 预约：`{ version: 3, users, reservations }`，用户含明文密码 | 4 个账号、20 条预约 |
| `labList` | 实验室数组，实验室页直接维护 | 3 间实验室 |
| `deviceList` | 设备数组，设备页直接维护 | 10 台设备 |
| `userList` | 用户只读镜像（已去密码），供首页计数 | 4 条 |
| `reserveList` | 预约只读镜像，供首页计数 | 20 条 |
| `lab_token` | 登录 token，形如 `mock-token-1` | 登录后写入 |
| `lab_user` | 当前用户 JSON（不含密码） | 登录后写入 |

> `lab_db_v1` 里的用户带明文密码，仅用于本地演示；`userList` 镜像在写入时已去掉密码。

### Mock 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/auth/login` | 账号密码登录，返回 `{ token, user }`；校验账号存在、密码正确、状态为 `active` |
| GET | `/labs` | 实验室分页查询：`keyword` / `location` / `status` / `page` / `size` |
| POST | `/labs` | 新增实验室，校验名称、位置、容量（1–200） |
| GET | `/labs/:id` | 实验室详情 |
| PUT | `/labs/:id` | 修改实验室 |
| DELETE | `/labs/:id` | 删除实验室；存在待审核预约时拒绝 |
| GET | `/reservations` | 预约分页查询：`status` / `date` / `labName` / `page` / `size`，附带 `userName` |
| POST | `/reservations` | 提交预约，做日期 / 时段 / 容量 / 冲突校验，初始状态 `pending` |
| PUT | `/reservations/:id/status` | 状态流转：`approved` / `rejected` / `cancelled` |
| DELETE | `/reservations/:id` | 删除预约 |
| GET | `/devices` | 设备分页查询：`keyword` / `labName` / `page` / `size` |
| GET | `/users` | 用户分页查询（只读）：`keyword` / `role` / `status` / `page` / `size`，响应不含密码 |
| GET | `/stats/overview` | 实验室数、可用数、今日预约、待审核、今日使用率 |
| GET | `/stats/trend` | 近 N 天预约趋势（`range` 默认 7） |
| GET | `/stats/lab-usage` | 各实验室已通过预约数排行 |
| GET | `/stats/status-ratio` | 四种预约状态占比 |
| GET | `/stats/heatmap` | 周 × 时段预约热力数据 |

> 设备接口只有查询，设备页实际直接操作 `deviceList`；用户接口只读且响应不含密码。所有接口共用 `code` 约定：`0` 成功，非 `0` 失败并带 `msg`。

### 页面与数据的两种模式

- **走 mock 接口**：`Booking.vue`（预约增删改查与状态流转）、`Data.vue`（5 个统计接口）、`User.vue`（用户列表），登录也走接口。
- **直接读写 localStorage**：`Lab.vue`（`labList`）、`Equ.vue`（`deviceList`）；`Home.vue` 只读取 4 个 localStorage key，不经过接口。

`labList` / `deviceList` 是早期变体页面沿用的 key，数据口径以它们为准；`lab_db_v1` 保存用户与预约。两套 key 由 `db.js` 的 `saveDb()` 和 `syncLegacyIn()` 保持一致。

mock 在每次处理请求前调用 `syncLegacyIn()`，把 `labList` / `deviceList` 同步回内存数据库，因此实验室页的改动能被预约页和统计页看到；设备页的改动也能被接口层读到（设备接口目前只提供查询）。

### 预约规则

1. 只能预约状态为「可用」的实验室。
2. 日期不能早于今天（日期选择器已禁用过去日期，mock 也会再校验一次）。
3. 时段必须在 `08:00 - 21:00` 内，且开始时间早于结束时间。
4. 预约人数在 1 到实验室容量之间。
5. 冲突判定：同一实验室、同一天、时段重叠，且对方状态为「待审核」或「已通过」，即视为冲突。重叠公式为 `newStart < oldEnd && oldStart < newEnd`。
6. 新建预约的初始状态固定为「待审核」。
7. 删除实验室时，若该实验室还有「待审核」预约，接口会拒绝（仅通过接口删除时生效，见「已知限制」）。

### 预约状态机

```text
             通过
  pending ───────────► approved ──取消──► cancelled
     │
     └── 驳回 ──► rejected
```

| 状态 | 文案 | 可执行操作 |
| --- | --- | --- |
| `pending` | 待审核 | 通过 / 驳回 / 删除 |
| `approved` | 已通过 | 取消 / 删除 |
| `rejected` | 已驳回 | 删除 |
| `cancelled` | 已取消 | 删除 |

---

## 调试与数据重置

`src/mock/index.js` 在开发模式暴露 `window.__labMock`：

```js
// 仅 npm run dev 下可用
await __labMock.get('/stats/overview')
await __labMock.get('/labs', { page: 1, size: 2 })
await __labMock.post('/auth/login', { account: 'admin', password: '123456' })
__labMock.dump()    // 查看内存中的 db
__labMock.reset()   // 恢复种子数据并刷新页面
```

`__labMock.get` 返回完整响应 `{ code, msg, data }`。

重置数据的其他方式（浏览器控制台）：

```js
// 只重置用户与预约：恢复 4 个账号 + 20 条预约
localStorage.removeItem('lab_db_v1')
location.reload()

// 连实验室与设备一起重置：3 间实验室 + 10 台设备
const keys = ['lab_db_v1', 'labList', 'deviceList', 'userList', 'reserveList']
keys.forEach((k) => localStorage.removeItem(k))
location.reload()
```

补充说明：

- Network 面板为空是正常的，请求被 axios adapter 就地处理了。
- 每个 mock 请求有 80–200ms 延迟，用来展示 loading 状态。
- `__labMock` 只在开发构建中存在，生产构建没有该入口。

---

## 构建产物与优化

`npm run build` 已实测通过（Node 24.14.0，约 0.5s），产物在 `frontend/dist`。构建会提示超过 500 kB 的 chunk：

| 产物 | 大小（minified） | 说明 |
| --- | --- | --- |
| `index-*.js` | 约 882 kB | Element Plus 与公共依赖主包 |
| `Data-*.js` | 约 604 kB | 统计页 + ECharts 图表模块 |
| `Login-*.js` | 约 18 kB | 登录页与动画角色 |

可选的优化方向：

- Element Plus 改为按需引入（`unplugin-vue-components` + `unplugin-auto-import`），并停用全量图标注册。
- 用 `manualChunks` 把 `echarts`、`element-plus` 拆成独立 vendor chunk。
- 图表页继续保持路由级懒加载（目前已经是懒加载）。

---

## 已知限制

1. **无后端**：数据只存在当前浏览器，换浏览器 / 清缓存 / 换设备都会回到种子数据，无法多端同步。
2. **数据双轨**：实验室页、设备页直接读写 localStorage，首页直接读取 localStorage；预约、统计、用户走 mock 接口。接口请求前会调用 `syncLegacyIn()` 对齐，但直接改缓存不会触发接口层校验。例如实验室页删除还有待审核预约的实验室时，不会像 `DELETE /labs/:id` 那样被拦截。
3. **权限只到路由级**：登录后所有角色看到相同菜单和操作，未按管理员 / 教师 / 学生细分；mock 也不校验请求头里的 token。
4. **实验室列表分页仅展示**：`Lab.vue` 的分页器只绑定了总数，翻页不会改变表格内容（列表实际是全量前端过滤）；`Equ.vue` 没有分页。
5. **两套枚举**：`constants/dict.js` 里 `LAB_STATUS` / `DEVICE_STATUS` 是英文键，实验室页和设备页使用中文状态字符串（可用 / 占用 / 维修中、正常 / 维修中），暂未统一。
6. **登录页部分入口为占位**：「记住我（30 天）」「忘记密码」「隐私政策」「服务条款」只有界面，没有实际逻辑；登录态本身始终持久化。
7. **演示数据规模小**：3 间实验室、10 台设备、4 个用户、20 条预约（10 天 × 每天 2 条，正好两页）。
8. **构建体积**：Element Plus 全量注册 + ECharts，主包约 882 kB，有 >500 kB 警告，演示项目未做进一步拆包。

---

## 开发约定

- 路径别名：`@` → `frontend/src`（`vite.config.js` + `jsconfig.json`）。
- 请求统一走 `src/api/*.js`，不要在组件里直接 `axios`；接口返回已由拦截器解包为 `data`。
- 列表页的状态优先放 Pinia（参考 `stores/lab.js`、`stores/reservation.js`）；只读或一次性请求可以在组件内完成（参考 `User.vue`）。
- 枚举放 `constants/dict.js`；新增状态时同步 mock 校验、状态标签和筛选项。
- 通用样式类 `.pager`、`.muted`、`.hint` 在 `assets/css/global.css`。
- 新增页面：`views/` 建组件 → `router/index.js` 的 `/manager` 子路由加 `meta.title` → `layouts/Layout.vue` 加菜单 → 需要接口时在 `api/` 和 `mock/index.js` 补对应方法。

---

## 版本记录

| 日期 | 标签 / 节点 | 内容 |
| --- | --- | --- |
| 2026-11-03 | `v0.1-skeleton`（`a5ebb8f`） | 脚手架：Vue 3 + Vite + Pinia + Router + Element Plus + ECharts，目录骨架 |
| 2026-11-06 | `v0.1.1-p0`（`9af18a7`） | 补装 ECharts 依赖，加入开发手册与进度文档 |
| 2026-11-07 | `v0.2-foundation`（`284e482`） | 浏览器 mock + localStorage + axios 封装 + 公共组件 + Pinia 接线 |
| 2026-11-10 | `99c7442` | 合入变体登录页、首页、实验室、设备四页 |
| 2026-11-10 | `0df0010` | 预约种子压缩到 20 条（正好两页），种子版本升到 v3 |
| 2026-11-12 | `中版本` | 预约、统计、用户页完成，补齐项目 README；业务页面全部落地 |

---

## 致谢与许可

- 登录页的视觉与动画角色改造自 [guohaolian/animated-characters-login-page](https://github.com/guohaolian/animated-characters-login-page)，本项目的改动范围见 [`Login.vue`](frontend/src/views/Login.vue) 顶部注释。
- 依赖与素材：Vue、Vite、Pinia、Vue Router、Element Plus、ECharts、axios；图标来自 Element Plus Icons。
- 本仓库未附 LICENSE 文件，当前作为课程设计与演示项目使用；第三方依赖遵循各自许可证。

---

最后更新：2026-11-12
