<template>
  <div>
    <PageHeader title="预约管理" desc="提交预约 · 审核 · 状态流转">
      <el-button type="primary" @click="openCreate">新建预约</el-button>
    </PageHeader>

    <el-tabs v-model="tab" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待审核" name="pending" />
      <el-tab-pane label="已通过" name="approved" />
      <el-tab-pane label="已驳回" name="rejected" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <SearchBar :loading="store.loading" @search="onSearch" @reset="onReset">
      <el-form-item label="日期">
        <el-date-picker
          v-model="store.query.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
          clearable
          style="width: 160px"
        />
      </el-form-item>
      <el-form-item label="实验室">
        <el-select v-model="store.query.labId" placeholder="全部" clearable style="width: 200px">
          <el-option v-for="l in labs" :key="l.id" :label="l.name" :value="l.id" />
        </el-select>
      </el-form-item>
    </SearchBar>

    <el-table v-loading="store.loading" :data="store.list" border>
      <el-table-column type="index" label="#" width="56" />
      <el-table-column prop="labName" label="实验室" min-width="150" />
      <el-table-column prop="userName" label="预约人" width="100" />
      <el-table-column prop="date" label="日期" width="110" />
      <el-table-column label="时段" width="140">
        <template #default="{ row }">{{ row.startTime }} - {{ row.endTime }}</template>
      </el-table-column>
      <el-table-column prop="purpose" label="用途" width="110" />
      <el-table-column prop="attendees" label="人数" width="72" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="RES_STATUS[row.status].tag">{{ RES_STATUS[row.status].text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            link
            type="success"
            @click="onFlow(row, 'approved')"
          >
            通过
          </el-button>
          <el-button
            v-if="row.status === 'pending'"
            link
            type="danger"
            @click="onFlow(row, 'rejected')"
          >
            驳回
          </el-button>
          <el-button
            v-if="row.status === 'approved'"
            link
            type="warning"
            @click="onFlow(row, 'cancelled')"
          >
            取消
          </el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="store.query.page"
        v-model:page-size="store.query.size"
        :total="store.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="store.fetchList"
        @size-change="onSearch"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新建预约" width="460px">
      <el-form label-width="80px">
        <el-form-item label="实验室" required>
          <el-select
            v-model="form.labId"
            placeholder="请选择"
            style="width: 100%"
            @change="onLabChange"
          >
            <el-option
              v-for="l in availableLabs"
              :key="l.id"
              :label="l.name + '（容量 ' + l.capacity + '）'"
              :value="l.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="日期" required>
          <el-date-picker
            v-model="form.date"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="isPast"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="开始时间" required>
          <el-select
            v-model="form.startTime"
            placeholder="请选择"
            style="width: 100%"
            @change="form.endTime = ''"
          >
            <el-option v-for="t in startOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <el-form-item label="结束时间" required>
          <el-select v-model="form.endTime" placeholder="请选择" style="width: 100%">
            <el-option v-for="t in endOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <el-form-item label="用途">
          <el-select v-model="form.purpose" style="width: 100%">
            <el-option v-for="p in PURPOSES" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>

        <el-form-item label="人数" required>
          <el-input-number
            v-model="form.attendees"
            :min="1"
            :max="currentLab ? currentLab.capacity : 200"
          />
          <span v-if="currentLab" class="hint" style="margin-left: 10px">
            上限 {{ currentLab.capacity }} 人
          </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="onSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '@/components/PageHeader.vue'
import SearchBar from '@/components/SearchBar.vue'
import { useReservationStore } from '@/stores/reservation'
import { useLabStore } from '@/stores/lab'
import { useAuthStore } from '@/stores/auth'
import { PURPOSES, RES_STATUS } from '@/constants/dict'

const store = useReservationStore()
const labStore = useLabStore()
const auth = useAuthStore()

const labs = ref([])
const tab = ref('all')
const dialogVisible = ref(false)
const submitting = ref(false)
const form = reactive({
  labId: null,
  date: '',
  startTime: '',
  endTime: '',
  purpose: PURPOSES[0],
  attendees: 1
})

const currentLab = computed(() => labs.value.find((l) => l.id === form.labId) || null)
const availableLabs = computed(() => labs.value.filter((l) => l.status === 'available'))

/* ---------- 时间刻度：跟着实验室的开放时间走 ---------- */
const toMin = (t) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const fmt = (m) =>
  String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

const timePoints = computed(() => {
  const lab = currentLab.value
  if (!lab) return []
  const open = toMin(lab.openTime)
  const close = toMin(lab.closeTime)
  const pts = []
  for (let m = open; m <= close; m += 120) pts.push(fmt(m))
  // 收尾点不是整点间隔时也要能选（比如 17:30 关门）
  if (pts[pts.length - 1] !== lab.closeTime) pts.push(lab.closeTime)
  return pts
})
const startOptions = computed(() => timePoints.value.slice(0, -1))
const endOptions = computed(() => {
  const rest = timePoints.value.slice(1)
  return form.startTime ? rest.filter((t) => t > form.startTime) : rest
})

const isPast = (d) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d.getTime() < today.getTime()
}

onMounted(async () => {
  labs.value = await labStore.fetchAllLabs()
  await store.fetchList()
})

function onTabChange(name) {
  tab.value = name
  store.query.status = name === 'all' ? '' : name
  store.query.page = 1
  store.fetchList()
}

function onSearch() {
  store.query.page = 1
  store.fetchList()
}

function onReset() {
  store.query.date = ''
  store.query.labId = ''
  store.query.page = 1
  store.fetchList()
}

function openCreate() {
  Object.assign(form, {
    labId: null,
    date: '',
    startTime: '',
    endTime: '',
    purpose: PURPOSES[0],
    attendees: 1
  })
  dialogVisible.value = true
}

function onLabChange() {
  form.startTime = ''
  form.endTime = ''
  form.attendees = 1
}

/** 与 mock 的后端校验保持一致，逐条拦在前面 */
function validate() {
  const lab = currentLab.value
  if (!form.labId) return '请选择实验室'
  if (!lab) return '实验室不存在'
  if (lab.status !== 'available') return '该实验室当前不可预约'
  if (!form.date) return '请选择预约日期'
  if (!form.startTime || !form.endTime) return '请选择预约时段'
  if (form.startTime >= form.endTime) return '结束时间必须晚于开始时间'
  if (form.startTime < lab.openTime || form.endTime > lab.closeTime) {
    return '预约时段需在开放时间 ' + lab.openTime + '-' + lab.closeTime + ' 内'
  }
  if (!form.attendees || form.attendees < 1) return '人数至少 1 人'
  if (form.attendees > lab.capacity) return '人数不能超过容量 ' + lab.capacity
  return ''
}

async function onSubmit() {
  const err = validate()
  if (err) return ElMessage.error(err)

  submitting.value = true
  try {
    // 先查冲突，命中就停在这里，不发 POST
    const conflict = await store.findConflict(form)
    if (conflict) {
      return ElMessage.warning(
        '时段冲突：' + conflict.startTime + '-' + conflict.endTime + ' 已被占用'
      )
    }
    await store.submit({ ...form, userId: auth.user && auth.user.id })
    ElMessage.success('预约提交成功，等待审核')
    dialogVisible.value = false
  } finally {
    submitting.value = false
  }
}

async function onFlow(row, status) {
  const label = { approved: '通过', rejected: '驳回', cancelled: '取消' }[status]
  try {
    await ElMessageBox.confirm('确定要' + label + '这条预约吗？', '提示', { type: 'warning' })
    await store.changeStatus(row.id, status)
    ElMessage.success('已' + label)
  } catch (e) {
    // 点了取消
  }
}

async function onDelete(row) {
  try {
    await ElMessageBox.confirm('删除后不可恢复，确定？', '提示', { type: 'warning' })
    await store.remove(row.id)
    ElMessage.success('已删除')
  } catch (e) {
    // 点了取消
  }
}
</script>
