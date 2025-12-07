import request from '@/utils/request'

// 查询客户列表列表
export function listClient(query) {
  return request({
    url: '/client/client/list',
    method: 'get',
    params: query
  })
}

// 查询客户列表详细
export function getClient(clientId) {
  return request({
    url: '/client/client/' + clientId,
    method: 'get'
  })
}

// 新增客户列表
export function addClient(data) {
  return request({
    url: '/client/client',
    method: 'post',
    data: data
  })
}

// 审批客户列表
export function approverClient(data) {
  return request({
    url: '/client/client/approver',
    method: 'put',
    data: data
  })
}

// 审核客户列表
export function auditClient(data) {
  return request({
    url: '/client/client/audit',
    method: 'put',
    data: data
  })
}

// 修改客户列表
export function updateClient(data) {
  return request({
    url: '/client/client',
    method: 'put',
    data: data
  })
}

// 删除客户列表
export function delClient(clientId) {
  return request({
    url: '/client/client/' + clientId,
    method: 'delete'
  })
}
