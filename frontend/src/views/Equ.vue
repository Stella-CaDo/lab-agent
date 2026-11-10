<template>
  <div class="equ-page">
    <div class="top-bar">
      <el-input v-model="searchKey" placeholder="搜索设备名称/编号" style="width:300px" clearable />
      <el-button type="primary" @click="openAddDialog">新增设备</el-button>
    </div>

    <el-table :data="filterTable" border stripe style="width:100%;margin-top:16px;">
      <el-table-column prop="id" label="设备编号" width="120" />
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="type" label="设备类型" />
      <el-table-column prop="labName" label="所属实验室" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="count" label="数量" width="80" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    
    <el-dialog v-model="dialogVisible" title="设备信息" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="设备编号">
          <el-input v-model="form.id" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="设备名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="form.type" placeholder="请选择">
            <el-option label="测量仪器" value="测量仪器" />
            <el-option label="机械装置" value="机械装置" />
            <el-option label="计算机设备" value="计算机设备" />
            <el-option label="光学设备" value="光学设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属实验室">
          <el-select v-model="form.labName" placeholder="请选择">
            <el-option label="ROS机器人实验室" value="ROS机器人实验室" />
            <el-option label="嵌入式实验室" value="嵌入式实验室" />
            <el-option label="计算机机房A" value="计算机机房A" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="正常" />
            <el-radio label="维修中" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="form.count" :min="1" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const searchKey = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)

const tableData = ref([])

onMounted(() => {
  const cache = localStorage.getItem('deviceList')
  if (cache) {
    tableData.value = JSON.parse(cache)
  } else {
    tableData.value = [
      { id: 'DEV001', name: '激光雷达', type: '测量仪器', labName: 'ROS机器人实验室', status: '正常', count: 8, remark: '思岚RPLIDAR A1' },
      { id: 'DEV002', name: 'Jetson Nano开发板', type: '计算机设备', labName: 'ROS机器人实验室', status: '正常', count: 12, remark: '4G版本' },
      { id: 'DEV003', name: '工业相机', type: '光学设备', labName: 'ROS机器人实验室', status: '维修中', count: 3, remark: 'USB全局快门相机' },
      { id: 'DEV004', name: 'STM32单片机', type: '计算机设备', labName: '嵌入式实验室', status: '正常', count: 30, remark: 'F103C8T6' },
      { id: 'DEV005', name: '示波器', type: '测量仪器', labName: '嵌入式实验室', status: '正常', count: 6, remark: '双通道数字示波器' },
      { id: 'DEV006', name: '伺服电机套件', type: '机械装置', labName: 'ROS机器人实验室', status: '正常', count: 5, remark: '带减速器' },
      { id: 'DEV007', name: '台式主机', type: '计算机设备', labName: '计算机机房A', status: '正常', count: 45, remark: 'i5主机，Ubuntu系统' },
      { id: 'DEV008', name: '双目深度相机', type: '光学设备', labName: 'ROS机器人实验室', status: '维修中', count: 2, remark: '奥比中光' },
      { id: 'DEV009', name: '稳压电源', type: '测量仪器', labName: '嵌入式实验室', status: '正常', count: 10, remark: '0-30V可调' },
      { id: 'DEV010', name: '机械臂', type: '机械装置', labName: 'ROS机器人实验室', status: '正常', count: 4, remark: '6轴协作机械臂' },
    ]
    localStorage.setItem('deviceList', JSON.stringify(tableData.value))
  }
})

// ✅ 新增：过滤后的列表，匹配名称、编号
const filterTable = computed(() => {
  if (!searchKey.value) return tableData.value
  const kw = searchKey.value.trim().toLowerCase()
  return tableData.value.filter(item =>
    item.id.toLowerCase().includes(kw) ||
    item.name.toLowerCase().includes(kw)
  )
})

const form = ref({
  id: '',
  name: '',
  type: '',
  labName: '',
  status: '正常',
  count: 1,
  remark: ''
})

const openAddDialog = () => {
  isEdit.value = false
  form.value = {
    id: '',
    name: '',
    type: '',
    labName: '',
    status: '正常',
    count: 1,
    remark: ''
  }
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

const submitForm = () => {
  if (!isEdit.value) {
    // 自动编号：接现有最大 DEV 序号，避免新建设备编号为空
    const nums = tableData.value.map((i) => Number(String(i.id).replace(/\D/g, '')) || 0)
    const nextId = 'DEV' + String(Math.max(0, ...nums) + 1).padStart(3, '0')
    tableData.value.push({ ...form.value, id: nextId })
    ElMessage.success('新增成功')
  } else {
    const index = tableData.value.findIndex(item => item.id === form.value.id)
    tableData.value[index] = { ...form.value }
    ElMessage.success('修改成功')
  }
  localStorage.setItem('deviceList', JSON.stringify(tableData.value))
  dialogVisible.value = false
}

const handleDel = (row) => {
  ElMessageBox.confirm(`确定删除【${row.name}】？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = tableData.value.findIndex(i => i.id === row.id)
      tableData.value.splice(idx, 1)
      localStorage.setItem('deviceList', JSON.stringify(tableData.value))
      ElMessage.success('删除成功')
    })
}
</script>

<style scoped>
.equ-page {
  padding: 20px;
}
.top-bar {
  display: flex;
  gap:12px;
  align-items: center;
}
</style>