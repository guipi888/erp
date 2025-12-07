const axios = require('axios')

const api = process.env.API || 'http://localhost:8080'
const adminUser = process.env.ADMIN_USER || 'admin'
const adminPass = process.env.ADMIN_PASS || 'admin123'

async function main() {
  const loginRes = await axios.post(api + '/login', { username: adminUser, password: adminPass }, { headers: { 'Content-Type': 'application/json' } })
  const d = loginRes.data || {}
  const token = d.token || (d.data && d.data.token) || d.access_token
  if (!token) throw new Error('登录失败')
  const http = axios.create({ baseURL: api, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } })

  const cateNames = ['配件厂', '半成品生产厂', '成品组装厂']
  const listRes = await http.get('/classify/classify/list', { params: { pageNum: 1, pageSize: 9999 } })
  const rows = (listRes.data && listRes.data.rows) || []
  const cateIds = {}
  for (const name of cateNames) {
    let found = rows.find(r => r.classifyName === name)
    if (!found) {
      const addRes = await http.post('/classify/classify', { classifyName: name, description: '', sort: 1 })
      if (!addRes.data || addRes.data.code !== 200) throw new Error('分类创建失败: ' + name)
      const refresh = await http.get('/classify/classify/list', { params: { pageNum: 1, pageSize: 9999 } })
      const refreshed = (refresh.data && refresh.data.rows) || []
      found = refreshed.find(r => r.classifyName === name)
    }
    if (!found || !found.classifyId) throw new Error('分类不存在: ' + name)
    cateIds[name] = found.classifyId
  }

  const suppliers = [
    { supplierName: '配件厂', contact: '张三', classifyId: cateIds['配件厂'], supplierAddress: '上海市松江区', supplierPhone: '13800000001', supplierSynopsis: '配件供应商', auditStatus: 2, sort: 1, remark: '' },
    { supplierName: '半成品生产厂', contact: '李四', classifyId: cateIds['半成品生产厂'], supplierAddress: '江苏省苏州市', supplierPhone: '13800000002', supplierSynopsis: '半成品制造', auditStatus: 2, sort: 2, remark: '' },
    { supplierName: '成品组装厂', contact: '王五', classifyId: cateIds['成品组装厂'], supplierAddress: '广东省深圳市', supplierPhone: '13800000003', supplierSynopsis: '成品组装', auditStatus: 2, sort: 3, remark: '' }
  ]

  for (const s of suppliers) {
    const addRes = await http.post('/supplier/supplier', s)
    if (!addRes.data || addRes.data.code !== 200) throw new Error('供应商创建失败: ' + s.supplierName)
  }

  const verify = async (name) => {
    const r = await http.get('/supplier/supplier/list', { params: { pageNum: 1, pageSize: 10, supplierName: name } })
    const rows = (r.data && r.data.rows) || []
    return rows.length
  }

  for (const s of suppliers) {
    const count = await verify(s.supplierName)
    console.log('新增成功', s.supplierName, count)
  }
}

main().catch(err => { console.error(err && err.message ? err.message : err); process.exit(1) })

