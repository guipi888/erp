import request from '@/utils/request'

// 查询market列表
export function listMarket(query) {
  return request({
    url: '/market/market/list',
    method: 'get',
    params: query
  })
}

// 查询market详细
export function getMarket(marketId) {
  return request({
    url: '/market/market/' + marketId,
    method: 'get'
  })
}

// 新增market
export function addMarket(data) {
  return request({
    url: '/market/market',
    method: 'post',
    data: data
  })
}

// 审批market
export function approverMarket(data) {
  return request({
    url: '/market/market/approver',
    method: 'put',
    data: data
  })
}

// 审核market
export function auditMarket(data) {
  return request({
    url: '/market/market/audit',
    method: 'put',
    data: data
  })
}

// 修改market
export function updateMarket(data) {
  return request({
    url: '/market/market',
    method: 'put',
    data: data
  })
}

// 删除market
export function delMarket(marketId) {
  return request({
    url: '/market/market/' + marketId,
    method: 'delete'
  })
}
