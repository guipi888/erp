import request from '@/utils/request'

// 查询客户分类列表
export function listClientclassify(query) {
  return request({
    url: '/clientclassify/clientclassify/list',
    method: 'get',
    params: query
  })
}

// 查询客户分类详细
export function getClientclassify(clientClassifyId) {
  return request({
    url: '/clientclassify/clientclassify/' + clientClassifyId,
    method: 'get'
  })
}

// 新增客户分类
export function addClientclassify(data) {
  return request({
    url: '/clientclassify/clientclassify',
    method: 'post',
    data: data
  })
}

// 修改客户分类
export function updateClientclassify(data) {
  return request({
    url: '/clientclassify/clientclassify',
    method: 'put',
    data: data
  })
}

// 删除客户分类
export function delClientclassify(clientClassifyId) {
  return request({
    url: '/clientclassify/clientclassify/' + clientClassifyId,
    method: 'delete'
  })
}
