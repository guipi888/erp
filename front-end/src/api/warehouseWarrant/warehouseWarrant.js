import request from '@/utils/request'

// 查询入库列表列表
export function listWarehouseWarrant(query) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/list',
    method: 'get',
    params: query
  })
}

// 查询入库列表详细
export function getWarehouseWarrant(warehouseWarrantId) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/' + warehouseWarrantId,
    method: 'get'
  })
}

// 新增入库列表
export function addWarehouseWarrant(data) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant',
    method: 'post',
    data: data
  })
}

// 审批入库列表
export function approverWarehouseWarrant(data) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/approver',
    method: 'put',
    data: data
  })
}

// 审核入库列表
export function auditWarehouseWarrant(data) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/audit',
    method: 'put',
    data: data
  })
}

// 选择入库列表
export function warehouseUpdateWarehouseWarrant(data) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/warehouse',
    method: 'put',
    data: data
  })
}

// 修改入库列表
export function updateWarehouseWarrant(data) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant',
    method: 'put',
    data: data
  })
}

// 删除入库列表
export function delWarehouseWarrant(warehouseWarrantId) {
  return request({
    url: '/warehouseWarrant/warehouseWarrant/' + warehouseWarrantId,
    method: 'delete'
  })
}
