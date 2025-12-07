import request from '@/utils/request'

// 查询采购计划列表
export function listProcurementPlan(query) {
  return request({
    url: '/procurementPlan/procurementPlan/list',
    method: 'get',
    params: query
  })
}

// 查询采购计划详细
export function getProcurementPlan(procurementPlanId) {
  return request({
    url: '/procurementPlan/procurementPlan/' + procurementPlanId,
    method: 'get'
  })
}

// 新增采购计划
export function addProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan',
    method: 'post',
    data: data
  })
}

// 审批采购计划
export function approverProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan/approver',
    method: 'put',
    data: data
  })
}

// 审核采购计划
export function auditProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan/audit',
    method: 'put',
    data: data
  })
}

// 发货
export function shipProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan/ship',
    method: 'put',
    data: data
  })
}

// 到货
export function arriveProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan/arrive',
    method: 'put',
    data: data
  })
}

// 修改采购计划
export function updateProcurementPlan(data) {
  return request({
    url: '/procurementPlan/procurementPlan',
    method: 'put',
    data: data
  })
}

// 删除采购计划
export function delProcurementPlan(procurementPlanId) {
  return request({
    url: '/procurementPlan/procurementPlan/' + procurementPlanId,
    method: 'delete'
  })
}
