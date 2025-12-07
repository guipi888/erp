import request from '@/utils/request'

// 查询库存列表列表
export function listInventory(query) {
  return request({
    url: '/inventory/inventory/list',
    method: 'get',
    params: query
  })
}

// 查询库存列表详细
export function getInventory(inventoryId) {
  return request({
    url: '/inventory/inventory/' + inventoryId,
    method: 'get'
  })
}

// 新增库存列表
export function addInventory(data) {
  return request({
    url: '/inventory/inventory',
    method: 'post',
    data: data
  })
}

// 修改库存列表
export function updateInventory(data) {
  return request({
    url: '/inventory/inventory',
    method: 'put',
    data: data
  })
}

// 删除库存列表
export function delInventory(inventoryId) {
  return request({
    url: '/inventory/inventory/' + inventoryId,
    method: 'delete'
  })
}
