import request from '@/utils/request'

// 查询设备列表列表
export function listEquipment(query) {
  return request({
    url: '/equipment/equipment/list',
    method: 'get',
    params: query
  })
}

// 查询设备列表详细
export function getEquipment(equipmentId) {
  return request({
    url: '/equipment/equipment/' + equipmentId,
    method: 'get'
  })
}

// 新增设备列表
export function addEquipment(data) {
  return request({
    url: '/equipment/equipment',
    method: 'post',
    data: data
  })
}
// 审批设备
export function approverEquipment(data) {
  return request({
    url: '/equipment/equipment/approver',
    method: 'put',
    data: data
  })
}

// 审核设备
export function auditEquipment(data) {
  return request({
    url: '/equipment/equipment/audit',
    method: 'put',
    data: data
  })
}

// 保养
export function maintainEquipment(data) {
  return request({
    url: '/equipment/equipment/maintain',
    method: 'put',
    data: data
  })
}
// 修改设备列表
export function updateEquipment(data) {
  return request({
    url: '/equipment/equipment',
    method: 'put',
    data: data
  })
}

// 删除设备列表
export function delEquipment(equipmentId) {
  return request({
    url: '/equipment/equipment/' + equipmentId,
    method: 'delete'
  })
}
