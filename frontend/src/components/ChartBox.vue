<template>
  <el-card shadow="never" class="chart-card">
    <template #header>
      <div class="head">
        <span class="title">{{ title }}</span>
        <slot name="extra" />
      </div>
    </template>
    <div ref="chartEl" class="chart-body" :style="{ height: height + 'px' }"></div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { LineChart, BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 按需注册：只打包用到的图表类型，体积更小
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  CanvasRenderer
])

const props = defineProps({
  title: { type: String, default: '' },
  option: { type: Object, default: null },
  height: { type: Number, default: 320 }
})

const chartEl = ref(null)
let chart = null
let observer = null

function render() {
  if (!chart || !props.option) return
  chart.setOption(props.option, true) // true 表示不合并旧配置
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  render()
  // 容器尺寸变化时重绘，比监听 window.resize 更准
  observer = new ResizeObserver(() => chart && chart.resize())
  observer.observe(chartEl.value)
})

// option 变化时重新渲染
watch(
  () => props.option,
  () => nextTick(render),
  { deep: true }
)

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
  if (chart) chart.dispose()
})
</script>

<style scoped>
.chart-card {
  margin-bottom: 16px;
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: 15px;
  font-weight: 600;
}
.chart-body {
  width: 100%;
}
</style>
