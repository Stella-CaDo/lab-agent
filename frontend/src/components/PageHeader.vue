<template>
  <div class="page-header">
    <div class="left">
      <h2>{{ title }}</h2>
      <p v-if="desc" class="desc">{{ desc }}</p>
    </div>
    <!-- 右侧放操作按钮 -->
    <div class="right">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  desc: { type: String, default: '' }
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}
.left h2 {
  font-size: 18px;
}
.left .desc {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
