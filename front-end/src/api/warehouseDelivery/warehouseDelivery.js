import request from '@/utils/request'

// 查询出库列表
export function listWarehouseDelivery(query) {
  return request({
    url: '/warehouseDelivery/warehouseDelivery/list',
    method: 'get',
    params: query
  })
}

// 查询出库详情
export function getWarehouseDelivery(id) {
  return request({
    url: '/warehouseDelivery/warehouseDelivery/' + id,
    method: 'get'
  })
}

// 新增出库记录
export function addWarehouseDelivery(data) {
  return request({
    url: '/warehouseDelivery/warehouseDelivery',
    method: 'post',
    data
  })
}

// 修改出库记录
export function updateWarehouseDelivery(data) {
  return request({
    url: '/warehouseDelivery/warehouseDelivery',
    method: 'put',
    data
  })
}

// 删除出库记录
export function delWarehouseDelivery(id) {
  return request({
    url: '/warehouseDelivery/warehouseDelivery/' + id,
    method: 'delete'
  })
}
