<template>
  <div v-loading="loading">
    <PageHeader title="数据统计" desc="预约趋势 · 状态占比 · 实验室排行 · 时段热力">
      <el-button :loading="loading" @click="loadAll">刷新</el-button>
    </PageHeader>

    <!-- 5 个指标卡 -->
    <div class="stat-row">
      <StatCard title="实验室总数" :value="overview.labCount" icon="House" color="#409EFF" />
      <StatCard
        title="可用实验室"
        :value="overview.labAvailable"
        icon="CircleCheck"
        color="#67C23A"
      />
      <StatCard
        title="今日预约"
        :value="overview.todayReservations"
        icon="Calendar"
        color="#E6A23C"
      />
      <StatCard title="待审核" :value="overview.pendingCount" icon="Bell" color="#F56C6C" />
      <StatCard
        title="今日使用率"
        :value="overview.avgUsage"
        suffix="%"
        icon="DataLine"
        color="#909399"
      />
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <ChartBox title="预约趋势" :option="trendOption" :height="320">
          <template #extra>
            <el-radio-group v-model="range" size="small" @change="loadTrend">
              <el-radio-button :value="7">近 7 天</el-radio-button>
              <el-radio-button :value="30">近 30 天</el-radio-button>
            </el-radio-group>
          </template>
        </ChartBox>
      </el-col>
      <el-col :span="8">
        <ChartBox title="预约状态占比" :option="statusOption" :height="320" />
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <ChartBox title="实验室使用排行" :option="usageOption" :height="300" />
      </el-col>
      <el-col :span="12">
        <ChartBox title="周 × 时段预约热力" :option="heatOption" :height="300" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'
import ChartBox from '@/components/ChartBox.vue'
import { getOverview, getTrend, getLabUsage, getStatusRatio, getHeatmap } from '@/api/stats'

const loading = ref(false)
const range = ref(7)

const overview = ref({
  labCount: 0,
  labAvailable: 0,
  todayReservations: 0,
  pendingCount: 0,
  avgUsage: 0
})
const trend = ref([])
const usage = ref([])
const statusRatio = ref([])
const heat = ref({ days: [], slots: [], data: [] })

/* 状态配色跟 dict.js 的 el-tag 保持一致 */
const STATUS_COLOR = {
  待审核: '#E6A23C',
  已通过: '#67C23A',
  已驳回: '#F56C6C',
  已取消: '#909399'
}

async function loadOverview() {
  overview.value = await getOverview()
}
async function loadTrend() {
  trend.value = await getTrend(range.value)
}
async function loadUsage() {
  usage.value = await getLabUsage()
}
async function loadStatus() {
  statusRatio.value = await getStatusRatio()
}
async function loadHeat() {
  heat.value = await getHeatmap()
}

async function loadAll() {
  loading.value = true
  try {
    await Promise.all([loadOverview(), loadTrend(), loadUsage(), loadStatus(), loadHeat()])
  } catch (e) {
    // request.js 的响应拦截器已经弹过错误提示，这里不重复提示
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

/* ---------- 折线：预约趋势 ---------- */
const trendOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 44, right: 24, top: 24, bottom: 32 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trend.value.map((i) => i.date),
    axisLine: { lineStyle: { color: '#dcdfe6' } },
    axisLabel: { color: '#909399' }
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    splitLine: { lineStyle: { color: '#f2f3f5' } },
    axisLabel: { color: '#909399' }
  },
  series: [
    {
      name: '预约数',
      type: 'line',
      smooth: true,
      symbolSize: 6,
      data: trend.value.map((i) => i.count),
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64,158,255,0.28)' },
            { offset: 1, color: 'rgba(64,158,255,0.02)' }
          ]
        }
      }
    }
  ]
}))

/* ---------- 环形：状态占比 ---------- */
const statusOption = computed(() => {
  const list = statusRatio.value.filter((i) => i.value > 0)
  return {
    tooltip: { trigger: 'item', formatter: '{b}：{c} 单（{d}%）' },
    legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { color: '#606266' } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '68%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: { formatter: '{b}\n{c}' },
        data: list.map((i) => ({
          name: i.name,
          value: i.value,
          itemStyle: { color: STATUS_COLOR[i.name] || '#909399' }
        }))
      }
    ]
  }
})

/* ---------- 横向柱：实验室使用排行 ---------- */
const usageOption = computed(() => {
  const names = usage.value.map((i) => i.name).reverse()
  const counts = usage.value.map((i) => i.count).reverse()
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    // ECharts 6 会自动给轴标签留位，不再需要 containLabel（v6 已废弃）
    grid: { left: 8, right: 40, top: 16, bottom: 16 },
    xAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f2f3f5' } },
      axisLabel: { color: '#909399' }
    },
    yAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    series: [
      {
        name: '使用次数',
        type: 'bar',
        barWidth: 16,
        data: counts,
        itemStyle: { color: '#409EFF', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#909399' }
      }
    ]
  }
})

/* ---------- 热力图：周 × 时段 ---------- */
const heatOption = computed(() => {
  const max = Math.max(1, ...heat.value.data.map((i) => i[2]))
  return {
    tooltip: {
      position: 'top',
      formatter: (p) =>
        heat.value.days[p.value[0]] +
        ' ' +
        heat.value.slots[p.value[1]] +
        '<br/>预约 ' +
        p.value[2] +
        ' 单'
    },
    grid: { left: 64, right: 24, top: 16, bottom: 64 },
    xAxis: {
      type: 'category',
      data: heat.value.days,
      splitArea: { show: true },
      axisLabel: { color: '#606266' }
    },
    yAxis: {
      type: 'category',
      data: heat.value.slots,
      splitArea: { show: true },
      axisLabel: { color: '#606266' }
    },
    visualMap: {
      min: 0,
      max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 80,
      textStyle: { color: '#909399' },
      inRange: { color: ['#f0f5ff', '#7fb1ff', '#409EFF', '#1d39c4'] }
    },
    series: [
      {
        name: '预约数',
        type: 'heatmap',
        data: heat.value.data,
        label: { show: true, fontSize: 10, color: '#303133' },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.25)' } }
      }
    ]
  }
})
</script>

<style scoped>
.stat-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.stat-row > * {
  flex: 1;
  min-width: 170px;
}
</style>
