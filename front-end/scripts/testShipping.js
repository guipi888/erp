// 命令行自测：发运单（配件/成品/半成品）
// 说明：
// 1) 使用管理员账号登录并获取 Bearer Token
// 2) 若无“已审批”采购计划则创建并自动审核+审批
// 3) 创建配件物流发运（数量自动取采购计划数量）
// 4) 若无供应商出库记录则创建；基于此创建成品物流与半成品物流，备注写入关联出库单ID
// 5) 拉取并打印发运单列表的校验结果

const axios = require('axios')

const api = process.env.API || 'http://localhost:8080'
const adminUser = process.env.ADMIN_USER || 'admin'
const adminPass = process.env.ADMIN_PASS || 'admin123'

async function login() {
  const res = await axios.post(api + '/login', { username: adminUser, password: adminPass }, { headers: { 'Content-Type': 'application/json' } })
  const d = res.data || {}
  const token = d.token || (d.data && d.data.token) || d.access_token
  if (!token) throw new Error('登录失败：未返回令牌')
  return axios.create({ baseURL: api, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } })
}

async function ensureApprovedProcurementPlan(http) {
  // 优先使用已审批的采购计划
  const list = await http.get('/procurementPlan/procurementPlan/list', { params: { auditStatus: 2, pageNum: 1, pageSize: 1 } })
  const rows = (list.data && list.data.rows) || []
  if (rows.length) {
    const r = rows[0]
    return { id: r.procurementPlanId, no: r.purchaseOrderNo, qty: r.procurementPlanNum }
  }

  // 无数据则最小化创建一条采购计划并审核+审批
  const addPayload = {
    procurementPlanName: '测试采购计划',
    procurementPlanNum: 10,
    procurementPlanPrice: 100.0,
    unit: '件',
    remark: 'CLI自测创建'
  }
  const addRes = await http.post('/procurementPlan/procurementPlan', addPayload)
  if (!addRes.data || addRes.data.code !== 200) throw new Error('采购计划创建失败')

  // 获取新创建的采购计划（按创建时间倒序）
  const newList = await http.get('/procurementPlan/procurementPlan/list', { params: { pageNum: 1, pageSize: 1, unit: '件' } })
  const created = (newList.data && newList.data.rows && newList.data.rows[0]) || null
  if (!created || !created.procurementPlanId) throw new Error('未找到新建的采购计划')

  // 审核 + 审批
  await http.put('/procurementPlan/procurementPlan/audit', { procurementPlanId: created.procurementPlanId, auditStatus: '1', auditOpinion: 'CLI自测审核' })
  await http.put('/procurementPlan/procurementPlan/approver', { procurementPlanId: created.procurementPlanId, auditStatus: '2', approverOpinion: 'CLI自测审批' })

  // 重新查询确认审批状态与采购订单号
  const confirm = await http.get('/procurementPlan/procurementPlan/' + created.procurementPlanId)
  const plan = (confirm.data && confirm.data.data) || {}
  if (plan.auditStatus !== 2) throw new Error('采购计划未到“已审批”状态')
  if (!plan.purchaseOrderNo) throw new Error('采购订单号未生成')
  return { id: plan.procurementPlanId, no: plan.purchaseOrderNo, qty: plan.procurementPlanNum }
}

async function createAccessoryShipping(http, plan) {
  const payload = {
    shippingType: 1,
    purchaseOrderNo: plan.no,
    procurementPlanId: plan.id,
    shipQty: plan.qty,
    logisticsCompany: '顺丰',
    trackingNo: 'SF' + Math.floor(Math.random() * 1e9),
    etaTime: new Date(Date.now() + 24 * 3600 * 1000),
    remark: 'CLI自测-配件物流(PO)'
  }
  const res = await http.post('/shipping/shipping', payload)
  if (!res.data || res.data.code !== 200) throw new Error('配件物流发运创建失败')
  // 同步更新采购计划为“运输中”(后端接口存在则执行，失败不阻断)
  try { await http.put('/procurementPlan/procurementPlan/ship', { procurementPlanId: plan.id }) } catch (e) {}
  return res
}

async function ensureWarehouseDelivery(http) {
  const probe = await http.get('/warehouseDelivery/warehouseDelivery/list', { params: { pageNum: 1, pageSize: 1 } })
  const first = (probe.data && probe.data.rows && probe.data.rows[0]) || null
  if (first) {
    return { id: first.warehouseDeliveryId, name: first.warehouseDeliveryName, num: first.warehouseDeliveryNum, unit: first.unit }
  }
  const invProbe = await http.get('/production/supplierInventory/list', { params: { pageNum: 1, pageSize: 1 } })
  let inv = (invProbe.data && invProbe.data.rows && invProbe.data.rows[0]) || null
  if (!inv) {
    const invAdd = await http.post('/production/supplierInventory', { inventoryName: 'CLI自测库存', inventoryNum: 5, inventoryUnit: '件', remark: 'CLI' })
    if (!invAdd.data || invAdd.data.code !== 200) throw new Error('供应商库存创建失败')
    const invRefresh = await http.get('/production/supplierInventory/list', { params: { pageNum: 1, pageSize: 1 } })
    inv = (invRefresh.data && invRefresh.data.rows && invRefresh.data.rows[0]) || null
    if (!inv || !inv.inventoryId) throw new Error('未找到新建的供应商库存')
  }
  const add = await http.post('/warehouseDelivery/warehouseDelivery', { warehouseDeliveryName: '测试出库-成品', warehouseDeliveryNum: inv.inventoryNum || 5, unit: inv.inventoryUnit || '件', inventoryId: inv.inventoryId, remark: 'CLI自测创建' })
  if (!add.data || add.data.code !== 200) {
    console.warn('供应商出库创建失败，继续执行物流发运验证')
    return { id: null, name: '未关联出库', num: inv.inventoryNum || 5, unit: inv.inventoryUnit || '件' }
  }
  const refresh = await http.get('/warehouseDelivery/warehouseDelivery/list', { params: { pageNum: 1, pageSize: 1 } })
  const row = (refresh.data && refresh.data.rows && refresh.data.rows[0]) || null
  if (!row || !row.warehouseDeliveryId) throw new Error('未找到新建的供应商出库')
  return { id: row.warehouseDeliveryId, name: row.warehouseDeliveryName, num: row.warehouseDeliveryNum, unit: row.unit }
}

async function createFinishedShipping(http, delivery) {
  const payload = {
    shippingType: 2,
    workOrderNo: 'MO-TEST-' + Date.now(),
    shipQty: delivery.num || 5,
    logisticsCompany: '京东',
    trackingNo: 'JD' + Math.floor(Math.random() * 1e9),
    remark: `CLI自测-成品物流(关联出库ID:${delivery.id})`
  }
  const res = await http.post('/shipping/shipping', payload)
  if (!res.data || res.data.code !== 200) throw new Error('成品物流发运创建失败')
  return res
}

async function createSemiFinishedShipping(http, delivery) {
  const payload = {
    shippingType: 3,
    workOrderNo: 'SF-TEST-' + Date.now(),
    shipQty: delivery.num || 3,
    logisticsCompany: '德邦',
    trackingNo: 'DB' + Math.floor(Math.random() * 1e9),
    remark: `CLI自测-半成品物流(关联出库ID:${delivery.id})`
  }
  const res = await http.post('/shipping/shipping', payload)
  if (!res.data || res.data.code !== 200) throw new Error('半成品物流发运创建失败')
  return res
}

async function verify(http, plan, delivery) {
  const poList = await http.get('/shipping/shipping/list', { params: { shippingType: 1, purchaseOrderNo: plan.no, pageNum: 1, pageSize: 5 } })
  const poRows = (poList.data && poList.data.rows) || []
  const moList = await http.get('/shipping/shipping/list', { params: { shippingType: 2, pageNum: 1, pageSize: 5 } })
  const moRows = (moList.data && moList.data.rows) || []
  const sfList = await http.get('/shipping/shipping/list', { params: { shippingType: 3, pageNum: 1, pageSize: 5 } })
  const sfRows = (sfList.data && sfList.data.rows) || []

  console.log('配件物流记录数(本次PO)：', poRows.length)
  if (poRows[0]) {
    console.log('  回显-采购单号：', poRows[0].purchaseOrderNo)
    console.log('  回显-发货数量：', poRows[0].shipQty)
  }
  console.log('成品物流记录数：', moRows.length)
  if (moRows[0]) {
    console.log('  回显-备注：', moRows[0].remark)
    console.log('  回显-发货数量：', moRows[0].shipQty)
  }
  console.log('半成品物流记录数：', sfRows.length)
  if (sfRows[0]) {
    console.log('  回显-备注：', sfRows[0].remark)
    console.log('  回显-发货数量：', sfRows[0].shipQty)
  }
}

async function main() {
  const http = await login()
  console.log('登录成功')
  const plan = await ensureApprovedProcurementPlan(http)
  console.log('已审批采购计划：', plan.no, '数量=', plan.qty)
  await createAccessoryShipping(http, plan)
  console.log('已创建配件物流发运，采购单号：', plan.no)
  const delivery = await ensureWarehouseDelivery(http)
  console.log('供应商出库：', delivery.name, '数量=', String(delivery.num))
  await createFinishedShipping(http, delivery)
  console.log('已创建成品物流发运')
  await createSemiFinishedShipping(http, delivery)
  console.log('已创建半成品物流发运')
  await verify(http, plan, delivery)
}

main().catch(err => { console.error('自测失败：', err && err.message ? err.message : err); process.exit(1) })
