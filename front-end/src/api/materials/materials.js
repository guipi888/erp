import request from '@/utils/request'

export function listMaterials(query = {}) {
  const params = {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    itemName: query.accessoryName || query.itemName,
    unit: query.unit,
    categoryId: query.accessoryClassifyId || query.categoryId,
    status: query.status
  }
  return request({ url: '/materials/item/list', method: 'get', params }).then(res => {
    const rows = (res && res.rows) ? res.rows : []
    const mapped = rows.map(it => ({
      itemId: it.itemId,
      accessoryName: it.itemName,
      accessoryNum: it.itemNum,
      accessoryPrice: it.price,
      unit: it.unit,
      accessoryClassifyId: it.categoryId,
      supplierId: it.supplierId,
      status: it.status,
      remark: it.remark,
      createBy: it.createBy,
      createTime: it.createTime,
      updateBy: it.updateBy,
      updateTime: it.updateTime
    }))
    return { ...res, rows: mapped }
  })
}

export function getMaterials(itemId) {
  const id = itemId
  return request({ url: '/materials/item/' + id, method: 'get' }).then(res => {
    const d = res && res.data ? res.data : {}
    const mapped = {
      itemId: d.itemId,
      accessoryName: d.itemName,
      accessoryNum: d.itemNum,
      accessoryPrice: d.price,
      unit: d.unit,
      accessoryClassifyId: d.categoryId,
      supplierId: d.supplierId,
      status: d.status,
      remark: d.remark,
      createBy: d.createBy,
      createTime: d.createTime,
      updateBy: d.updateBy,
      updateTime: d.updateTime
    }
    return { ...res, data: mapped }
  })
}

export function addMaterials(data) {
  const payload = {
    itemName: data.accessoryName,
    price: data.accessoryPrice,
    unit: data.unit,
    categoryId: data.accessoryClassifyId,
    supplierId: data.supplierId,
    status: data.status,
    remark: data.remark
  }
  return request({ url: '/materials/item', method: 'post', data: payload })
}

export function updateMaterials(data) {
  const payload = {
    itemId: data.itemId,
    itemName: data.accessoryName,
    price: data.accessoryPrice,
    unit: data.unit,
    categoryId: data.accessoryClassifyId,
    supplierId: data.supplierId,
    status: data.status,
    remark: data.remark
  }
  return request({ url: '/materials/item', method: 'put', data: payload })
}

export function delMaterials() {
  return Promise.reject(new Error('删除功能已禁用'))
}

export function changeMaterialsStatus(data) {
  const payload = { itemId: data.itemId, status: data.status }
  return request({ url: '/materials/item/status', method: 'put', data: payload })
}
