import request from '@/utils/request'

// 查询供应商分类列表
export function listClassify(query) {
  return request({
    url: '/classify/classify/list',
    method: 'get',
    params: query
  })
}

// 查询供应商分类详细
export function getClassify(classifyId) {
  return request({
    url: '/classify/classify/' + classifyId,
    method: 'get'
  })
}

// 新增供应商分类
export function addClassify(data) {
  return request({
    url: '/classify/classify',
    method: 'post',
    data: data
  })
}

// 修改供应商分类
export function updateClassify(data) {
  return request({
    url: '/classify/classify',
    method: 'put',
    data: data
  })
}

// 删除供应商分类
export function delClassify(classifyId) {
  return request({
    url: '/classify/classify/' + classifyId,
    method: 'delete'
  })
}
