import request from '@/utils/request'

// 查询成品入库列表
export function listOperationproduct(query) {
  return request({
    url: '/operationproduct/operationproduct/list',
    method: 'get',
    params: query
  })
}

// 查询成品入库详细
export function getOperationproduct(operationProductId) {
  return request({
    url: '/operationproduct/operationproduct/' + operationProductId,
    method: 'get'
  })
}

// 新增成品入库
export function addOperationproduct(data) {
  return request({
    url: '/operationproduct/operationproduct',
    method: 'post',
    data: data
  })
}

// 审批成品入库
export function approverOperationProduct(data) {
  return request({
    url: '/operationproduct/operationproduct/approver',
    method: 'put',
    data: data
  })
}

// 审核成品入库
export function auditOperationProduct(data) {
  return request({
    url: '/operationproduct/operationproduct/audit',
    method: 'put',
    data: data
  })
}

// 选择成品入库
export function chonseOperationProduct(data) {
  return request({
    url: '/operationproduct/operationproduct/chonse',
    method: 'put',
    data: data
  })
}

// 修改成品入库
export function updateOperationproduct(data) {
  return request({
    url: '/operationproduct/operationproduct',
    method: 'put',
    data: data
  })
}

// 删除成品入库
export function delOperationproduct(operationProductId) {
  return request({
    url: '/operationproduct/operationproduct/' + operationProductId,
    method: 'delete'
  })
}
