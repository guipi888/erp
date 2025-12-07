import request from '@/utils/request'

// 查询设备分类列表
export function listClassification(query) {
  return request({
    url: '/classification/classification/list',
    method: 'get',
    params: query
  })
}

// 查询设备分类详细
export function getClassification(classificationId) {
  return request({
    url: '/classification/classification/' + classificationId,
    method: 'get'
  })
}

// 新增设备分类
export function addClassification(data) {
  return request({
    url: '/classification/classification',
    method: 'post',
    data: data
  })
}

// 修改设备分类
export function updateClassification(data) {
  return request({
    url: '/classification/classification',
    method: 'put',
    data: data
  })
}

// 删除设备分类
export function delClassification(classificationId) {
  return request({
    url: '/classification/classification/' + classificationId,
    method: 'delete'
  })
}
