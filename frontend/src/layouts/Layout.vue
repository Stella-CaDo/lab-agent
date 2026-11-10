<template>
  <div>
    <el-container style="min-height: 100vh">
      <el-header
        style="
          display: flex;
          align-items: center;
          border-bottom: 1px solid #ddd;
          background-color: #fff;
        "
      >
        <div
          style="flex: 1; display: flex; align-items: center; font-size: 24px; font-weight: bold"
        >
          <img style="width: 40px" src="@/assets/img/logo.png" alt="" />
          <div style="margin-left: 5px">实验室预约系统</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px">
          <img src="@/assets/img/logo.png" alt="" style="width: 30px; border-radius: 50%" />
          <span>{{ auth.user?.name || '未登录' }}</span>
          <el-button size="small" @click="onLogout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="220px">
          <el-menu router style="height: 100%" :default-active="$route.path">
            <el-menu-item index="/manager/home">
              <el-icon><icon-menu /></el-icon>
              <span>系统首页</span>
            </el-menu-item>
            <el-menu-item index="/manager/lab">
              <el-icon><House /></el-icon>
              <span>实验室管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/equ">
              <el-icon><Setting /></el-icon>
              <span>设备管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/booking">
              <el-icon><Calendar /></el-icon>
              <span>预约管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/data">
              <el-icon><DataAnalysis /></el-icon>
              <span>数据统计</span>
            </el-menu-item>
            <el-menu-item index="/manager/user">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Menu as IconMenu,
  House,
  Setting,
  User,
  DataAnalysis,
  Calendar
} from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()

function onLogout() {
  auth.logout()
  router.replace('/login')
}
</script>
