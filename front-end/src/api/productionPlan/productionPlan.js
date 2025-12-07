import request from '@/utils/request'

export function listProductionPlan(query) {
  return request({
    url: '/production/plan/list',
    method: 'get',
    params: query
  })
}

export function getProductionPlan(planId) {
  return request({
    url: '/production/plan/' + planId,
    method: 'get'
  })
}

export function addProductionPlan(data) {
  return request({
    url: '/production/plan',
    method: 'post',
    data: data
  })
}

export function updateProductionPlan(data) {
  return request({
    url: '/production/plan',
    method: 'put',
    data: data
  })
}

export function delProductionPlan(planId) {
  return request({
    url: '/production/plan/' + planId,
    method: 'delete'
  })
}

export function nextProductionPlan(planId) {
  return request({
    url: '/production/plan/' + planId + '/next',
    method: 'post'
  })
}
