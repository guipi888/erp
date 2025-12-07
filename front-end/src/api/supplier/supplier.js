import request from '@/utils/request'

// 查询供应商列表
export function listSupplier(query) {
  return request({
    url: '/supplier/supplier/list',
    method: 'get',
    params: query
  })
}

// 查询审批后供应商
export function approverList() {
  return request({
    url: '/supplier/supplier/approverList',
    method: 'get'

  })
}

// 查询供应商详细
export function getSupplier(supplierId) {
  return request({
    url: '/supplier/supplier/' + supplierId,
    method: 'get'
  })
}

// 新增供应商
export function addSupplier(data) {
  return request({
    url: '/supplier/supplier',
    method: 'post',
    data: data
  })
}
// 审批
export function approverSupplier(data) {
  return request({
    url: '/supplier/supplier/approver',
    method: 'put',
    data: data
  })
}

// 审核
export function auditSupplier(data) {
  return request({
    url: '/supplier/supplier/audit',
    method: 'put',
    data: data
  })
}

// 修改供应商
export function updateSupplier(data) {
  return request({
    url: '/supplier/supplier',
    method: 'put',
    data: data
  })
}

// 删除供应商
export function delSupplier(supplierId) {
  return request({
    url: '/supplier/supplier/' + supplierId,
    method: 'delete'
  })
}
