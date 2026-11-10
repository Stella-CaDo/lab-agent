<template>
  <div style="width: 300px; margin: 120px auto">
    <h3 style="margin-bottom: 16px">实验室预约系统</h3>

    <el-input
      v-model="form.account"
      placeholder="账号"
      style="margin-bottom: 10px"
      @keyup.enter="onSubmit"
    />
    <el-input
      v-model="form.password"
      type="password"
      placeholder="密码"
      show-password
      style="margin-bottom: 16px"
      @keyup.enter="onSubmit"
    />

    <el-button type="primary" style="width: 100%" :loading="loading" @click="onSubmit">
      登录
    </el-button>

    <p style="margin-top: 12px; font-size: 12px; color: #909399">
      admin / teacher / student，密码 123456
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ account: '', password: '' })
const loading = ref(false)

async function onSubmit() {
  // 只做两条前端校验，不发请求（验收里明确要求"不发请求"）
  if (!form.account.trim()) return ElMessage.error('请输入账号')
  if (form.password.length < 6) return ElMessage.error('密码至少 6 位')

  loading.value = true
  try {
    await auth.login({ account: form.account.trim(), password: form.password })
    ElMessage.success('登录成功')
    // 被守卫拦下来时会带 redirect，登录后回到原页面
    router.replace(route.query.redirect || '/manager/home')
  } catch (e) {
    // request.js 的响应拦截器已经弹过错误提示，这里什么都不做
  } finally {
    loading.value = false
  }
}
</script>
