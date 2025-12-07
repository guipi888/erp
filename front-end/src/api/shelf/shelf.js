import request from '@/utils/request'

// 查询货架列表列表
export function listShelf(query) {
  return request({
    url: '/shelf/shelf/list',
    method: 'get',
    params: query
  })
}

// 查询货架列表详细
export function getShelf(shelfId) {
  return request({
    url: '/shelf/shelf/' + shelfId,
    method: 'get'
  })
}

// 新增货架列表
export function addShelf(data) {
  return request({
    url: '/shelf/shelf',
    method: 'post',
    data: data
  })
}

// 修改货架列表
export function updateShelf(data) {
  return request({
    url: '/shelf/shelf',
    method: 'put',
    data: data
  })
}

// 删除货架列表
export function delShelf(shelfId) {
  return request({
    url: '/shelf/shelf/' + shelfId,
    method: 'delete'
  })
}
