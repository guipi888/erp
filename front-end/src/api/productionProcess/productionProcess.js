import request from '@/utils/request'

export function listProductionProcess(query) {
  return request({
    url: '/production/process/list',
    method: 'get',
    params: query
  })
}

export function getProductionProcess(processId) {
  return request({
    url: '/production/process/' + processId,
    method: 'get'
  })
}

export function addProductionProcess(data) {
  return request({
    url: '/production/process',
    method: 'post',
    data: data
  })
}

export function updateProductionProcess(data) {
  return request({
    url: '/production/process',
    method: 'put',
    data: data
  })
}

// 删除功能已禁用
export function delProductionProcess() {
  return Promise.reject(new Error('删除功能已禁用'))
}

// 启用/禁用流程状态
export function changeProductionProcessStatus(data) {
  return request({
    url: '/production/process/status',
    method: 'put',
    data
  })
}
