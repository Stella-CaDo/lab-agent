<template>
  <div class="page-wrap">
    <el-card>
      <div class="search-area" style="margin-bottom:16px">
        <el-input v-model="searchVal" placeholder="输入实验室名称搜索" style="width:260px"></el-input>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button type="success" @click="openAddDialog">新增实验室</el-button>
      </div>
      <el-table :data="showTableData" border style="width:100%">
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="labName" label="实验室名称" />
        <el-table-column prop="location" label="所在位置" />
        <el-table-column prop="maxPeople" label="容纳人数" />
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === '可用'
                  ? 'success'
                  : scope.row.status === '占用'
                  ? 'warning'
                  : 'danger'
              "
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        layout="total, prev, pager, next"
        :total="showTableData.length"
        style="margin-top:12px;justify-content:flex-end"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" title="实验室信息">
      <el-form :model="form">
        <el-form-item label="实验室名称">
          <el-input v-model="form.labName"></el-input>
        </el-form-item>
        <el-form-item label="所在位置">
          <el-input v-model="form.location"></el-input>
        </el-form-item>
        <el-form-item label="容纳人数">
          <el-input v-model="form.maxPeople"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="可用" value="可用" />
            <el-option label="占用" value="占用" />
            <el-option label="维修中" value="维修中" />
          </el-select>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
const searchVal = ref('')
const dialogVisible = ref(false)
const tableData = ref([])
const form = ref({
  id: '',
  labName: '',
  location: '',
  maxPeople: '',
  status: '可用'
})
let editId = null

// 读取缓存
onMounted(() => {
  const cache = localStorage.getItem('labList')
  if (cache) {
    tableData.value = JSON.parse(cache)
  } else {
    // 第一次打开，初始数据
    tableData.value = [
      { id: 1, labName: '计算机实验室1', location: '实验楼301', maxPeople: 40, status: '可用' },
      { id: 2, labName: '物理实验室', location: '实验楼205', maxPeople: 30, status: '可用' },
      { id: 3, labName: '化学实验室', location: '实验楼102', maxPeople: 25, status: '维修中' },
    ]
    localStorage.setItem('labList', JSON.stringify(tableData.value))
  }
})

const showTableData = computed(() => {
  if (!searchVal.value) return tableData.value
  return tableData.value.filter(item => item.labName.includes(searchVal.value))
})
const onSearch = () => {}

const openAddDialog = () => {
  dialogVisible.value = true
  form.value = { id: '', labName: '', location: '', maxPeople: '', status: '可用' }
  editId = null
}
const openEditDialog = (row) => {
  dialogVisible.value = true
  form.value = { ...row }
  editId = row.id
}
const submitForm = () => {
  if (editId === null) {
    // 新增，判断实验室名称是否重复
    const isRepeat = tableData.value.some(item => item.labName === form.value.labName)
    if (isRepeat) {
      ElMessage.warning('此教室已存在')
      return
    }
    const idList = tableData.value.map(item => item.id)
    const maxId = idList.length ? Math.max(...idList) : 0
    const newId = maxId + 1
    tableData.value.push({
      id: newId,
      labName: form.value.labName,
      location: form.value.location,
      maxPeople: form.value.maxPeople,
      status: form.value.status
    })
  } else {
    // 编辑，排除自身再判断重名
    const isRepeat = tableData.value.some(item => item.labName === form.value.labName && item.id !== editId)
    if (isRepeat) {
      ElMessage.warning('此教室已存在')
      return
    }
    const index = tableData.value.findIndex(i => i.id === editId)
    if (index !== -1) {
      tableData.value[index] = { ...form.value }
    }
  }
  // 保存到缓存
  localStorage.setItem('labList', JSON.stringify(tableData.value))
  dialogVisible.value = false
  ElMessage.success('操作成功')
}
const deleteRow = (row) => {
  tableData.value = tableData.value.filter(item => item.id !== row.id)
  // 删除后保存缓存
  localStorage.setItem('labList', JSON.stringify(tableData.value))
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.page-wrap {
  padding: 10px;
}
</style>
