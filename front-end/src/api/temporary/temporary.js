import request from '@/utils/request'

// 查询临时采购列表
export function listTemporary(query) {
  return request({
    url: '/temporary/temporary/list',
    method: 'get',
    params: query
  })
}

// 查询临时采购详细
export function getTemporary(
  temporaryId) {
  return request({
    url: '/temporary/temporary/' +
      temporaryId,
    method: 'get'
  })
}

// 新增临时采购
export function addTemporary(data) {
  return request({
    url: '/temporary/temporary',
    method: 'post',
    data: data
  })
}

// 审核临时采购
export function approverTemporary(data) {
  return request({
    url: '/temporary/temporary/approver',
    method: 'put',
    data: data
  })
}

// 审核临时采购
export function auditTemporary(data) {
  return request({
    url: '/temporary/temporary/audit',
    method: 'put',
    data: data
  })
}

// 修改临时采购
export function updateTemporary(data) {
  return request({
    url: '/temporary/temporary',
    method: 'put',
    data: data
  })
}

// 删除临时采购
export function delTemporary(
  temporaryId) {
  return request({
    url: '/temporary/temporary/' +
      temporaryId,
    method: 'delete'
  })
}
