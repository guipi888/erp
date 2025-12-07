import request from '@/utils/request'

// 查询生产侧供应商库存列表
export function listInventory(query) {
  return request({
    url: '/production/supplierInventory/list',
    method: 'get',
    params: query
  })
}

// 查询生产侧供应商库存详情
export function getInventory(inventoryId) {
  return request({
    url: '/production/supplierInventory/' + inventoryId,
    method: 'get'
  })
}

// 新增/合并供应商库存（生产侧）
export function addInventory(data) {
  return request({
    url: '/production/supplierInventory',
    method: 'post',
    data: data
  })
}

// 修改供应商库存（生产侧）
export function updateInventory(data) {
  return request({
    url: '/production/supplierInventory',
    method: 'put',
    data: data
  })
}

// 删除供应商库存（生产侧）
export function delInventory(inventoryId) {
  return request({
    url: '/production/supplierInventory/' + inventoryId,
    method: 'delete'
  })
}

