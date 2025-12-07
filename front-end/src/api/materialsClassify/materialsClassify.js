import request from '@/utils/request'

export function listMaterialsClassify(query = {}) {
  const params = { pageNum: query.pageNum, pageSize: query.pageSize, name: query.accessoryClassifyName || query.name, code: query.code }
  return request({ url: '/materials/category/list', method: 'get', params }).then(res => {
    const rows = (res && res.rows) ? res.rows : []
    const mapped = rows.map(c => ({
      accessoryClassifyId: c.categoryId,
      accessoryClassifyName: c.name,
      code: c.code,
      sort: c.sort,
      remark: c.remark,
      createBy: c.createBy,
      createTime: c.createTime,
      updateBy: c.updateBy,
      updateTime: c.updateTime
    }))
    return { ...res, rows: mapped }
  })
}

export function getMaterialsClassify(id) {
  return request({ url: '/materials/category/' + id, method: 'get' }).then(res => {
    const c = res && res.data ? res.data : {}
    const mapped = {
      accessoryClassifyId: c.categoryId,
      accessoryClassifyName: c.name,
      code: c.code,
      sort: c.sort,
      remark: c.remark,
      createBy: c.createBy,
      createTime: c.createTime,
      updateBy: c.updateBy,
      updateTime: c.updateTime
    }
    return { ...res, data: mapped }
  })
}

export function addMaterialsClassify(data) {
  const payload = { name: data.accessoryClassifyName || data.name, code: data.code, sort: data.sort, remark: data.remark }
  return request({ url: '/materials/category', method: 'post', data: payload })
}

export function updateMaterialsClassify(data) {
  const payload = { categoryId: data.accessoryClassifyId || data.categoryId, name: data.accessoryClassifyName || data.name, code: data.code, sort: data.sort, remark: data.remark }
  return request({ url: '/materials/category', method: 'put', data: payload })
}

export function delMaterialsClassify(id) {
  return request({ url: '/materials/category/' + id, method: 'delete' })
}
