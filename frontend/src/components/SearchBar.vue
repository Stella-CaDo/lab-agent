<template>
  <!-- 查询区外壳：外面用 <SearchBar @search="..." @reset="..."> 包一批 el-form-item -->
  <el-form :inline="true" class="search-bar" @submit.prevent>
    <slot />
    <el-form-item>
      <el-button type="primary" :loading="loading" @click="$emit('search')">查询</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false }
})
defineEmits(['search', 'reset'])
</script>

<style scoped>
.search-bar {
  margin-bottom: 8px;
}
</style>
