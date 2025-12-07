import request from '@/utils/request'

// 查询财务数据列表
export function listFinance(query) {
  return request({
    url: '/finance/finance/list',
    method: 'get',
    params: query
  })
}

// 查询财务数据详细
export function getFinance(financeId) {
  return request({
    url: '/finance/finance/' + financeId,
    method: 'get'
  })
}

// 新增财务数据
export function addFinance(data) {
  return request({
    url: '/finance/finance',
    method: 'post',
    data: data
  })
}
// 审批财务approverFinance
export function approverFinance(data) {
  return request({
    url: '/finance/finance/approver',
    method: 'put',
    data: data
  })
}

// 审核财务
export function auditFinance(data) {
  return request({
    url: '/finance/finance/audit',
    method: 'put',
    data: data
  })
}

// 修改财务数据
export function updateFinance(data) {
  return request({
    url: '/finance/finance',
    method: 'put',
    data: data
  })
}

// 删除财务数据
export function delFinance(financeId) {
  return request({
    url: '/finance/finance/' + financeId,
    method: 'delete'
  })
}
