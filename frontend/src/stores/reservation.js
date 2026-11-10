import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getReservationList,
  createReservation,
  changeReservationStatus,
  deleteReservation
} from '@/api/reservation'

export const useReservationStore = defineStore('reservation', () => {
  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  // status: '' 表示全部
  const query = ref({ status: '', date: '', labName: '', page: 1, size: 10 })

  async function fetchList(extra = {}) {
    loading.value = true
    try {
      const data = await getReservationList({ ...query.value, ...extra })
      list.value = data.list
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function submit(form) {
    await createReservation(form)
    query.value.page = 1
    await fetchList()
  }

  async function changeStatus(id, status) {
    await changeReservationStatus(id, status)
    await fetchList()
  }

  async function remove(id) {
    await deleteReservation(id)
    await fetchList()
  }

  /**
   * 冲突预检：拉取目标实验室当天的全部预约，在前端判断是否重叠。
   * 命中就由页面提示，不往下发 POST —— 这是 A2 验收第 7 条的关键。
   */
  async function findConflict({ labName, date, startTime, endTime }) {
    const data = await getReservationList({ labName, date, page: 1, size: 200 })
    return data.list.find(
      (r) =>
        (r.status === 'pending' || r.status === 'approved') &&
        startTime < r.endTime &&
        r.startTime < endTime
    )
  }

  return { list, total, loading, query, fetchList, submit, changeStatus, remove, findConflict }
})
