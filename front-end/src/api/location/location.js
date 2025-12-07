import request from '@/utils/request'

// 查询货位列表列表
export function listLocation(query) {
  return request({
    url: '/location/location/list',
    method: 'get',
    params: query
  })
}

// 查询货位列表详细
export function getLocation(locationId) {
  return request({
    url: '/location/location/' + locationId,
    method: 'get'
  })
}

// 新增货位列表
export function addLocation(data) {
  return request({
    url: '/location/location',
    method: 'post',
    data: data
  })
}

// 修改货位列表
export function updateLocation(data) {
  return request({
    url: '/location/location',
    method: 'put',
    data: data
  })
}

// 删除货位列表
export function delLocation(locationId) {
  return request({
    url: '/location/location/' + locationId,
    method: 'delete'
  })
}
