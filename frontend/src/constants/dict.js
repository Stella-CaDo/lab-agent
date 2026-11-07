// 全站共用的枚举字典：中文文案 + el-tag 颜色 + 下拉选项
// 页面一律从这里取值，不要在页面里再写一份

export const BUILDINGS = ['A栋', 'B栋', 'C栋']

export const LAB_STATUS = {
  available: { text: '可用', tag: 'success' },
  maintenance: { text: '维护中', tag: 'warning' },
  disabled: { text: '停用', tag: 'info' }
}

export const RES_STATUS = {
  pending: { text: '待审核', tag: 'warning' },
  approved: { text: '已通过', tag: 'success' },
  rejected: { text: '已驳回', tag: 'danger' },
  cancelled: { text: '已取消', tag: 'info' }
}

export const DEVICE_STATUS = {
  normal: { text: '正常', tag: 'success' },
  repair: { text: '维修中', tag: 'warning' },
  scrapped: { text: '已报废', tag: 'info' }
}

export const USER_ROLE = {
  admin: { text: '管理员', tag: 'danger' },
  teacher: { text: '教师', tag: 'warning' },
  student: { text: '学生', tag: 'success' }
}

export const USER_STATUS = {
  active: { text: '正常', tag: 'success' },
  disabled: { text: '禁用', tag: 'info' }
}

export const PURPOSES = ['课程实验', '毕业设计', '科研项目', '竞赛培训', '课外实践']
