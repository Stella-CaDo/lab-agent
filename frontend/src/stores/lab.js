import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLabList, createLab, updateLab, deleteLab } from '@/api/lab'

export const useLabStore = defineStore('lab', () => {
  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  // 查询条件放 store，页面只负责 v-model 绑定
  const query = ref({
    keyword: '',
    building: '',
    status: '',
    page: 1,
    size: 10
  })

  async function fetchList(extra = {}) {
    loading.value = true
    try {
      const data = await getLabList({ ...query.value, ...extra })
      list.value = data.list
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  /** 有 id 走修改，没有走新增；表单里的 id 不发给 mock */
  async function saveLab(form) {
    const { id, ...payload } = form
    if (id) await updateLab(id, payload)
    else await createLab(payload)
    await fetchList()
  }

  async function removeLab(id) {
    await deleteLab(id)
    await fetchList()
  }

  /** 下拉框用：一次取全部实验室（最多 100 条） */
  async function fetchAllLabs() {
    const data = await getLabList({ page: 1, size: 100 })
    return data.list
  }

  return {
    list,
    total,
    loading,
    query,
    fetchList,
    saveLab,
    removeLab,
    fetchAllLabs
  }
})
