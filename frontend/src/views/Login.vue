<!--
  登录页（方案 A）
  - 来源：https://github.com/guohaolian/animated-characters-login-page 的 src/components/LoginPage.vue
  - 本文件改动范围：中文化、换 Logo、把不存在的链接改成不跳转的占位、修两处会裁掉内容的样式
  - 登录字段：原设计为「邮箱」，现改为「账号」（不再校验邮箱格式）；「使用 Google 登录」入口及处理函数已移除
  - 未做：真实登录接口、路由守卫、记住我、退出登录（属于方案 B/C，按要求没有动）
-->
<template>
  <div class="login-page">
    <!-- Left Content Section with Animated Characters -->
    <div class="left-section">
      <div class="logo-section">
        <!-- 方案 A 改动：原来是 <a href="/">，在单页应用里会整页刷新；换成 router-link 留在 SPA 内，品牌换成本项目的 -->
        <router-link to="/" class="logo-link">
          <img src="@/assets/img/logo.png" alt="实验室预约系统" class="logo-image" />
          <span>实验室预约系统</span>
        </router-link>
      </div>

      <div class="characters-section">
        <AnimatedCharacters
          :isTyping="isTyping"
          :showPassword="showPassword"
          :passwordLength="password.length"
          :loginFailed="loginFailed"
          :loginSuccess="loginSuccess"
        />
      </div>

      <div class="footer-links">
        <!-- 方案 A 改动：隐私政策/服务条款页面还不存在，保留样式但阻止默认跳转，避免整页刷新后 404 -->
        <a href="#" class="footer-link" @click.prevent>隐私政策</a>
        <a href="#" class="footer-link" @click.prevent>服务条款</a>
      </div>

      <!-- Decorative elements -->
      <div class="grid-overlay"></div>
      <div class="blur-circle blur-circle-1"></div>
      <div class="blur-circle blur-circle-2"></div>
    </div>

    <!-- Right Login Section -->
    <div class="right-section">
      <div class="form-wrapper">
        <!-- Mobile Logo -->
        <div class="mobile-logo">
          <!-- 方案 A 改动：原图是外部 CDN 图标，换成项目内 Logo，和 Layout 顶栏保持一致 -->
          <img src="@/assets/img/logo.png" alt="实验室预约系统" class="logo-image" />
          <span>实验室预约系统</span>
        </div>

        <!-- Header -->
        <div class="form-header">
          <h1 class="form-title">欢迎回来</h1>
          <p class="form-subtitle">请输入您的账号信息</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- Account Field -->
          <div class="form-group">
            <label for="account" class="form-label">账号</label>
            <input
              id="account"
              v-model="account"
              type="text"
              placeholder="请输入账号"
              class="form-input"
              autocomplete="username"
              required
              @focus="isTyping = true"
              @blur="isTyping = false"
            />
            <p v-if="errors.account" class="error-message">{{ errors.account }}</p>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="password-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                required
              />
              <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                <svg
                  v-if="showPassword"
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  class="icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path
                    d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"
                  />
                  <path
                    d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"
                  />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>

          <!-- Remember & Forgot -->
          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="rememberMe" class="checkbox" />
              <span>记住我（30 天）</span>
            </label>
            <!-- 方案 A 改动：忘记密码页面还没做，先占位、不跳转 -->
            <a href="#" class="forgot-link" @click.prevent>忘记密码？</a>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="error-alert">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-button" :disabled="isLoading">
            <span class="button-text">{{ isLoading ? '登录中…' : '登录' }}</span>
            <svg
              class="button-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>

        <!-- Sign Up Link -->
        <!-- 方案 A 改动：本系统账号由管理员分配，没有自助注册页；原来的 <a href="/signup"> 会跳到不存在的路由 -->
        <div class="signup-link">没有账号？请联系实验室管理员开通</div>
      </div>
    </div>
  </div>
</template>

<script setup>
/*
 * 登录页脚本
 * 方案 A：只做移植相关的调整，登录逻辑本身保持原样（演示性质，未接后端）。
 */
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// 组件搬到了 src/components/login/ 下，原相对路径 ./AnimatedCharacters.vue 会失效，改用 @ 别名
import AnimatedCharacters from '@/components/login/AnimatedCharacters.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const account = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isTyping = ref(false)
const isLoading = ref(false)
const loginFailed = ref(false)
const loginSuccess = ref(false)
const errorMessage = ref('')
const errors = ref({
  account: '',
  password: ''
})

const validateForm = () => {
  errors.value = { account: '', password: '' }
  let isValid = true

  // 方案 A 改动：登录凭据由「邮箱」改为「账号」，不再校验邮箱格式，只要求非空
  if (!account.value.trim()) {
    errors.value.account = '请输入账号'
    isValid = false
  }

  if (!password.value) {
    errors.value.password = '请输入密码'
    isValid = false
  } else if (password.value.length < 6) {
    errors.value.password = '密码至少 6 位'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true
  errorMessage.value = ''
  loginFailed.value = false
  loginSuccess.value = false

  try {
    // 接主干 auth store：账号/密码交给 mock 的 /auth/login 校验
    // 种子账号 admin / teacher / student，密码统一 123456
    await auth.login({ account: account.value.trim(), password: password.value })
    loginSuccess.value = true
    // 成功动画停留 600ms 再进后台，避免瞬间跳走
    setTimeout(() => {
      loginSuccess.value = false
      router.replace(route.query.redirect || '/manager/home')
    }, 600)
  } catch (error) {
    errorMessage.value = '账号或密码错误，请重试'
    loginFailed.value = true
    setTimeout(() => {
      loginFailed.value = false
    }, 3000)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  /* 方案 A 修复：原来这里还有 max-height: 100vh + overflow: hidden，
     窗口高度不够时会把「登录」按钮直接裁掉；改为允许纵向滚动 */
  overflow-x: hidden;
}

.left-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(to bottom right, #9ca3af, #6b7280, #4b5563);
  padding: 3rem;
  color: white;
}

.logo-section {
  position: relative;
  z-index: 20;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
}

.logo-image {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.characters-section {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 500px;
}

.footer-links {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #1f2937;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(96px);
}

.blur-circle-1 {
  top: 25%;
  right: 25%;
  width: 16rem;
  height: 16rem;
  background: rgba(156, 163, 175, 0.2);
}

.blur-circle-2 {
  bottom: 25%;
  left: 25%;
  width: 24rem;
  height: 24rem;
  background: rgba(209, 213, 219, 0.2);
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.mobile-logo {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 3rem;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
  color: #111827;
}

.form-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  height: 3rem;
  padding: 0 1rem;
  background: white;
  border: 1.5px solid rgba(229, 231, 235, 0.6);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  outline: none;
}

.form-input::placeholder {
  opacity: 0.35;
}

.form-input:focus {
  border-color: #6366f1;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 2.5rem;
}

/* Hide browser-native password reveal/clear buttons (e.g. Edge) */
.password-wrapper .form-input[type='password']::-ms-reveal,
.password-wrapper .form-input[type='password']::-ms-clear {
  display: none;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: #111827;
}

.icon {
  width: 20px;
  height: 20px;
}

.error-message {
  font-size: 0.875rem;
  color: #dc2626;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.error-alert {
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 0.5rem;
}

.submit-button {
  position: relative;
  width: 100%;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
  background: #111827;
  color: white;
  border: none;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-text {
  transition: transform 0.3s;
}

.button-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.submit-button:hover:not(:disabled) .button-text {
  transform: translateX(-8px);
}

.submit-button:hover:not(:disabled) .button-icon {
  transform: translateX(8px);
}

.signup-link {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.signup-link a {
  color: #111827;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .left-section {
    display: none;
  }

  .mobile-logo {
    display: flex;
  }
}

/* 方案 A 修复：1024–1300px 时左栏可用宽度不足角色容器固定的 550px，角色右半边会被裁切，整体缩小一档 */
@media (max-width: 1300px) and (min-width: 1025px) {
  .characters-section {
    transform: scale(0.82);
    transform-origin: center bottom;
  }
}
</style>
