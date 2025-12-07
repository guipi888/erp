import request from '@/utils/request'

// 查询库房列列表
export function listWarehouse(query) {
  return request({
    url: '/warehouse/warehouse/list',
    method: 'get',
    params: query
  })
}

// 查询库房列详细
export function getWarehouse(warehouseId) {
  return request({
    url: '/warehouse/warehouse/' + warehouseId,
    method: 'get'
  })
}

// 新增库房列
export function addWarehouse(data) {
  return request({
    url: '/warehouse/warehouse',
    method: 'post',
    data: data
  })
}

// 修改库房列
export function updateWarehouse(data) {
  return request({
    url: '/warehouse/warehouse',
    method: 'put',
    data: data
  })
}

// 删除库房列
export function delWarehouse(warehouseId) {
  return request({
    url: '/warehouse/warehouse/' + warehouseId,
    method: 'delete'
  })
}
