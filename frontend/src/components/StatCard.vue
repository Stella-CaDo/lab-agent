<template>
  <el-card shadow="never" class="stat-card">
    <div class="row">
      <div class="icon" :style="{ background: color + '1a', color: color }">
        <el-icon :size="22"><component :is="icon" /></el-icon>
      </div>
      <div class="text">
        <div class="label">{{ title }}</div>
        <div class="value">
          {{ value }}<span v-if="suffix" class="suffix">{{ suffix }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  value: { type: [Number, String], default: 0 },
  icon: { type: String, default: 'DataLine' },
  color: { type: String, default: '#409EFF' },
  suffix: { type: String, default: '' }
})
</script>

<style scoped>
.stat-card {
  margin-bottom: 16px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-3px);
}
.row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.label {
  font-size: 13px;
  color: #909399;
}
.value {
  font-size: 26px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}
.suffix {
  font-size: 14px;
  font-weight: 400;
  margin-left: 2px;
  color: #909399;
}
</style>
