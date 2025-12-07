import request from '@/utils/request'

// 查询设备附件列表列表
export function listAdjunct(query) {
  return request({
    url: '/adjunct/adjunct/list',
    method: 'get',
    params: query
  })
}

// 查询设备附件列表详细
export function getAdjunct(adjunctId) {
  return request({
    url: '/adjunct/adjunct/' + adjunctId,
    method: 'get'
  })
}

// 新增设备附件列表
export function addAdjunct(data) {
  return request({
    url: '/adjunct/adjunct',
    method: 'post',
    data: data
  })
}
// 审批设备附件列表
export function approverAdjunct(data) {
  return request({
    url: '/adjunct/adjunct/approver',
    method: 'put',
    data: data
  })
}

// 审核设备附件列表
export function auditAdjunct(data) {
  return request({
    url: '/adjunct/adjunct/audit',
    method: 'put',
    data: data
  })
}
// 修改设备附件列表
export function updateAdjunct(data) {
  return request({
    url: '/adjunct/adjunct',
    method: 'put',
    data: data
  })
}

// 删除设备附件列表
export function delAdjunct(adjunctId) {
  return request({
    url: '/adjunct/adjunct/' + adjunctId,
    method: 'delete'
  })
}
