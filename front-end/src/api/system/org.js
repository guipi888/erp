import request from '@/utils/request'

export function listOrg(params) {
  return request({ url: '/system/org/list', method: 'get', params })
}

export function getOrg(orgId) {
  return request({ url: `/system/org/${orgId}`, method: 'get' })
}

export function addOrg(data) {
  return request({ url: '/system/org', method: 'post', data })
}

export function updateOrg(data) {
  return request({ url: '/system/org', method: 'put', data })
}

export function delOrg(orgId) {
  return request({ url: `/system/org/${orgId}`, method: 'delete' })
}

export function updateOrder(orgId, orderNum) {
  return request({ url: `/system/org/${orgId}/order`, method: 'put', params: { orderNum }})
}

export function moveOrg(orgId, newParentId) {
  return request({ url: `/system/org/${orgId}/move/${newParentId}`, method: 'put' })
}

export function countMembers(orgId) {
  return request({ url: `/system/org/${orgId}/members/count`, method: 'get' })
}

