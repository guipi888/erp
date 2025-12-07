import request from '@/utils/request'

// 物料（lp_item）列表查询：改用 /materials/item/list
export function listItems(query) {
  const params = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    itemName: query.name,
    unit: query.unit,
    categoryId: query.categoryId,
    status: query.status
  }
  return request({ url: '/materials/item/list', method: 'get', params })
    .then(res => res)
    .catch(err => ({ rows: [], total: 0, code: -1, msg: (err && err.message) || '请求失败' }))
}

// 物料详情（lp_item）
export function getItem(itemId) {
  return request({ url: '/materials/item/' + itemId, method: 'get' })
}

// 新增物料（lp_item）
export function addItem(data) {
  const payload = {
    itemName: data.itemName || data.name,
    unit: data.unit,
    price: data.price,
    categoryId: data.categoryId || data.classId,
    supplierId: data.supplierId,
    remark: data.remark,
    status: data.status
  }
  return request({ url: '/materials/item', method: 'post', data: payload })
}

// 修改物料（lp_item）
export function updateItem(data) {
  const payload = {
    itemId: data.itemId || data.id,
    itemName: data.itemName || data.name,
    unit: data.unit,
    price: data.price,
    categoryId: data.categoryId || data.classId,
    supplierId: data.supplierId,
    remark: data.remark,
    status: data.status
  }
  return request({ url: '/materials/item', method: 'put', data: payload })
}

// 启用/禁用状态（lp_item）
export function changeItemStatus(data) {
  const payload = { itemId: data.itemId || data.id, status: data.status }
  return request({ url: '/materials/item/status', method: 'put', data: payload })
}
