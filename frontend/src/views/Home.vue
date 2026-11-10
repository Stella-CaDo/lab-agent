<template>
  <div class="home-wrap">
    <el-card class="top-card">
      <h2 class="title">系统首页</h2>
      <div class="stat-row">
        <div class="stat-item" @click="$router.push('/manager/lab')">
          <div class="stat-num">{{ labTotal }}</div>
          <div class="stat-label">实验室总数</div>
          <div class="stat-icon">
            <el-icon :size="32"><Document /></el-icon>
          </div>
        </div>
        <div class="stat-item" @click="$router.push('/manager/equ')">
          <div class="stat-num">{{ deviceTotal }}</div>
          <div class="stat-label">设备总数</div>
          <div class="stat-icon">
            <el-icon :size="32"><Download /></el-icon>
          </div>
        </div>
        <div class="stat-item" @click="$router.push('/manager/booking')">
          <div class="stat-num">{{ useDevice }}</div>
          <div class="stat-label">预约总数</div>
          <div class="stat-icon">
            <el-icon :size="32"><Box /></el-icon>
          </div>
        </div>
        <div class="stat-item" @click="$router.push('/manager/user')">
          <div class="stat-num">{{ userTotal }}</div>
          <div class="stat-label">注册用户</div>
          <div class="stat-icon">
            <el-icon :size="32"><User /></el-icon>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, Download, Box, User } from '@element-plus/icons-vue'

const router = useRouter()

// 实验室总数：读取缓存里 labList 的长度
const labTotal = computed(() => {
  const raw = localStorage.getItem('labList')
  const list = raw ? JSON.parse(raw) : []
  return list.length
})

// 新增：设备总数 computed
const deviceTotal = computed(() => {
  const raw = localStorage.getItem('deviceList')
  return raw ? JSON.parse(raw).length : 0
})


// 在用设备 = 预约总数
const useDevice = computed(() => {
  const raw = localStorage.getItem('reserveList')
  const list = raw ? JSON.parse(raw) : []
  return list.length
})

// 注册用户数量
const userTotal = computed(() => {
  const raw = localStorage.getItem('userList')
  const list = raw ? JSON.parse(raw) : []
  return list.length
})
</script>

<style scoped>
.home-wrap {
  padding: 16px;
}
.title {
  margin: 0 0 24px;
  font-weight: 600;
}
.stat-row {
  display: flex;
  gap: 20px;
}
.stat-item {
  flex: 1;
  padding: 20px;
  border-radius: 12px;
  background: #f5f7fa;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}
.stat-item:hover {
  background: #ecf5ff;
  transform: translateY(-3px);
}
.stat-num {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
}
.stat-label {
  margin-top: 8px;
  color: #606266;
  font-size: 15px;
}
.stat-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #409eff;
  background: rgba(64, 158, 255, 0.12);
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
