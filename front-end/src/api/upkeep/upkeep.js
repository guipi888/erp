import request from '@/utils/request'

// 查询设备保养列表
export function listUpkeep(query) {
  return request({
    url: '/upkeep/upkeep/list',
    method: 'get',
    params: query
  })
}

// 查询设备保养详细
export function upkeepLists(upkeepId) {
  return request({
    url: '/upkeep/upkeep/upkeepList/' + upkeepId,
    method: 'get'
  })
}

// 查询设备保养详细
export function getUpkeep(upkeepId) {
  return request({
    url: '/upkeep/upkeep/' + upkeepId,
    method: 'get'
  })
}

// 新增设备保养
export function addUpkeep(data) {
  return request({
    url: '/upkeep/upkeep',
    method: 'post',
    data: data
  })
}

// 审批操作
export function approverUpkeep(data) {
  return request({
    url: '/upkeep/upkeep/approver',
    method: 'put',
    data: data
  })
}

// 审核操作
export function auditUpkeep(data) {
  return request({
    url: '/upkeep/upkeep/audit',
    method: 'put',
    data: data
  })
}
// 修改设备保养
export function updateUpkeep(data) {
  return request({
    url: '/upkeep/upkeep',
    method: 'put',
    data: data
  })
}

// 删除设备保养
export function delUpkeep(upkeepId) {
  return request({
    url: '/upkeep/upkeep/' + upkeepId,
    method: 'delete'
  })
}
