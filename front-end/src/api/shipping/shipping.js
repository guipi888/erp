import request from '@/utils/request'

export function listShipping(query) {
  return request({ url: '/shipping/shipping/list', method: 'get', params: query })
}
export function getShipping(id) {
  return request({ url: `/shipping/shipping/${id}`, method: 'get' })
}
export function addShipping(data) {
  return request({ url: '/shipping/shipping', method: 'post', data })
}
export function updateShipping(data) {
  return request({ url: '/shipping/shipping', method: 'put', data })
}
export function delShipping(ids) {
  return request({ url: `/shipping/shipping/${ids}`, method: 'delete' })
}
