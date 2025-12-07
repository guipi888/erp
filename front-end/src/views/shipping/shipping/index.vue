<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="88px">
      <el-form-item label="单据类型" prop="shippingType">
        <el-select v-model="queryParams.shippingType" placeholder="选择类型" clearable>
          <!-- 文案调整：物料物流 -> 外购件物流 -->
          <el-option :value="1" label="外购件物流" />
          <el-option :value="3" label="半成品物流" />
          <el-option :value="2" label="成品物流" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.shippingType===1" label="采购单号">
        <el-autocomplete
          v-model="poQuery"
          placeholder="输入采购计划名称或采购单号"
          :fetch-suggestions="fetchPOSuggestions"
          :debounce="300"
          :trigger-on-focus="true"
          @select="onPOQuerySelect"
        />
      </el-form-item>
      <el-form-item v-if="queryParams.shippingType===2" label="生产单号">
        <el-autocomplete
          v-model="moQuery"
          placeholder="输入工单号或生产计划名称"
          :fetch-suggestions="fetchMOSuggestions"
          :debounce="300"
          :trigger-on-focus="true"
          @select="onMOQuerySelect"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="选择状态" clearable>
          <el-option :value="0" label="运输中" />
          <el-option :value="1" label="已完成" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button v-hasPermi="['shipping:shipping:add']" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['shipping:shipping:edit']" type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>

      <el-col :span="2">
        <el-button v-hasPermi="['shipping:shipping:export']" type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编码" align="center" prop="shippingCode" />
      <el-table-column label="单据类型" align="center" prop="shippingType">
        <template slot-scope="scope">
          <el-tag :type="scope.row.shippingType===1?'info':(scope.row.shippingType===2?'primary':'success')">
            {{ scope.row.shippingType===1?'外购件物流':(scope.row.shippingType===2?'成品物流':'半成品物流') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="运单号" align="center" prop="trackingNo" />
      <el-table-column label="物流公司" align="center" prop="logisticsCompany" />
      <el-table-column label="运输物料" align="center">
        <template slot-scope="scope">
          <span>{{ displayItemName(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运输数量" align="center" prop="shipQty" />
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <span v-if="shippingStatus(scope.row) === '已完成'"><el-tag type="success">已完成</el-tag></span>
          <span v-else><el-tag type="warning">运输中</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="预计到货时间" align="center" prop="etaTime">
        <template slot-scope="scope">{{ parseTime(scope.row.etaTime) }}</template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="canEdit(scope.row)" v-hasPermi="['shipping:shipping:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="单据类型" prop="shippingType">
          <el-radio-group v-model="form.shippingType">
            <!-- 文案调整：配件物流 -> 外购件物流 -->
            <el-radio :label="1">外购件物流</el-radio>
            <el-radio :label="3">半成品物流</el-radio>
            <el-radio :label="2">成品物流</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.shippingType===1" label="采购单号" prop="purchaseOrderNo">
          <el-autocomplete
            v-model="poDialogQuery"
            placeholder="输入采购计划名称或采购单号"
            :fetch-suggestions="fetchPOSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onPODialogSelect"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="form.shippingType===1" label="物料名称">
          <el-input v-model="form.accessoryName" placeholder="自动带入" disabled />
        </el-form-item>
        <el-form-item v-if="form.shippingType===1" label="运输数量" prop="shipQty">
          <el-input-number v-model="form.shipQty" :min="1" :max="poSelectedQty || undefined" :step="1" controls-position="right" placeholder="请输入运输数量" />
        </el-form-item>
        <el-form-item v-if="form.shippingType!==1" label="关联出库单" prop="relatedDeliveryId">
          <el-autocomplete
            v-model="deliveryDialogQuery"
            placeholder="输入出库名称搜索"
            :fetch-suggestions="fetchDeliverySuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onDeliveryDialogSelect"
          />
        </el-form-item>
        <el-form-item v-if="form.shippingType!==1" label="运输数量" prop="shipQty">
          <el-input-number v-model="form.shipQty" :min="1" :step="1" controls-position="right" placeholder="请输入运输数量" />
        </el-form-item>
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-input v-model="form.logisticsCompany" placeholder="请输入物流公司" />
        </el-form-item>
        <el-form-item label="运单号" prop="trackingNo">
          <el-input v-model="form.trackingNo" placeholder="请输入运单号" />
        </el-form-item>
        <el-form-item v-if="form.shippingType===1" label="预计到货时间" prop="etaTime">
          <el-date-picker v-model="form.etaTime" type="datetime" placeholder="请选择时间" value-format="timestamp" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listShipping, getShipping, addShipping, updateShipping } from '@/api/shipping/shipping'
import { listProcurementPlan, getProcurementPlan, shipProcurementPlan } from '@/api/procurementPlan/procurementPlan'
import { listProductionPlan, getProductionPlan } from '@/api/productionPlan/productionPlan'
import { getMaterials } from '@/api/materials/materials'
import { listWarehouseDelivery } from '@/api/warehouseDelivery/warehouseDelivery'

export default {
  name: 'Shipping',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,

      showSearch: true,
      total: 0,
      list: [],
      title: '',
      open: false,
      queryParams: { pageNum: 1, pageSize: 10, shippingType: null, purchaseOrderNo: null, workOrderNo: null, status: null },
      poOptions: [],
      moOptions: [],
      poLoading: false,
      moLoading: false,
      poQuery: '',
      moQuery: '',
      poDialogQuery: '',
      moDialogQuery: '',
      poNameDict: {},
      planStatusDict: {},
      itemNameDict: {},
      poSelectedQty: null,
      deliveryDialogQuery: '',
      form: {},
      rules: {
        shippingType: [{ required: true, message: '单据类型不能为空', trigger: 'change' }],
        purchaseOrderNo: [{ required: true, message: '采购单号不能为空', trigger: 'change' }],
        relatedDeliveryId: [{ required: true, message: '请选择关联出库单', trigger: 'change' }],
        shipQty: [{ required: true, message: '运输数量不能为空', trigger: 'change' }],
        logisticsCompany: [{ required: true, message: '物流公司不能为空', trigger: 'blur' }],
        trackingNo: [{ required: true, message: '运单号不能为空', trigger: 'blur' }]
      }
    }
  },
  watch: {
    'queryParams.shippingType'(val) {
      if (val === 1) { this.queryParams.workOrderNo = null } else if (val === 2) { this.queryParams.purchaseOrderNo = null } else if (val === 3) { this.queryParams.purchaseOrderNo = null; this.queryParams.workOrderNo = null }
    },
    'form.shippingType'(val) {
      if (val === 1) { this.form.workOrderNo = null } else if (val === 2) { this.form.purchaseOrderNo = null } else if (val === 3) { this.form.purchaseOrderNo = null; this.form.workOrderNo = null }
    }
  },
  created() { this.getList() },
  methods: {
    fetchPOSuggestions(query, cb) {
      const keyword = (query || '').trim()
      this.poLoading = true
      const params = keyword ? { auditStatus: 2, procurementPlanName: keyword, purchaseOrderNo: keyword, pageNum: 1, pageSize: 20 } : { auditStatus: 2, pageNum: 1, pageSize: 20 }
      listProcurementPlan(params)
        .then(res => {
          const suggestions = (res.rows || []).map(r => ({
            value: `${r.procurementPlanName || '采购计划'}${r.purchaseOrderNo ? ' - ' + r.purchaseOrderNo : ''}`,
            purchaseOrderNo: r.purchaseOrderNo,
            id: r.procurementPlanId,
            qty: r.procurementPlanNum,
            // 使用 lpMaterialId 替代历史字段 itemId
            materialId: r.lpMaterialId
          }))
          cb(suggestions)
        })
        .finally(() => { this.poLoading = false })
      },
    onPOQuerySelect(item) {
      this.queryParams.purchaseOrderNo = item && item.purchaseOrderNo ? item.purchaseOrderNo : null
      this.poQuery = item && item.value ? item.value : ''
    },
    onPODialogSelect(item) {
      if (!item) return
      this.form.purchaseOrderNo = item.purchaseOrderNo || null
      this.form.procurementPlanId = item.id || null
      this.poSelectedQty = item.qty || null
      this.form.shipQty = item.qty || null
      if (item.materialId) {
        getMaterials(item.materialId).then(resp => {
          const d = resp && resp.data
          this.$set(this.form, 'accessoryName', d ? d.accessoryName : '')
        }).catch(() => { this.$set(this.form, 'accessoryName', '') })
      } else {
        this.$set(this.form, 'accessoryName', '')
      }
    },
    fetchMOSuggestions(query, cb) {
      const keyword = (query || '').trim()
      this.moLoading = true
      const params = keyword ? { workOrderNo: keyword, planName: keyword, pageNum: 1, pageSize: 20 } : { pageNum: 1, pageSize: 20 }
      listProductionPlan(params)
        .then(res => {
          const suggestions = (res.rows || []).map(r => ({
            value: `${r.workOrderNo || ''}${r.planName ? ' - ' + r.planName : ''}`,
            workOrderNo: r.workOrderNo,
            id: r.planId
          }))
          cb(suggestions)
        })
        .finally(() => { this.moLoading = false })
    },
    onMOQuerySelect(item) {
      this.queryParams.workOrderNo = item && item.workOrderNo ? item.workOrderNo : null
      this.moQuery = item && item.value ? item.value : ''
    },
    onMODialogSelect(item) { /* 兼容旧入口，保留方法但不使用 */ },
    fetchDeliverySuggestions(query, cb) {
      const keyword = (query || '').trim()
      listWarehouseDelivery({ warehouseDeliveryName: keyword, pageNum: 1, pageSize: 20 })
        .then(res => {
          const suggestions = (res.rows || []).map(r => ({
            value: r.warehouseDeliveryName,
            warehouseDeliveryId: r.warehouseDeliveryId,
            warehouseDeliveryNum: r.warehouseDeliveryNum,
            unit: r.unit
          }))
          cb(suggestions)
        })
        .catch(() => cb([]))
    },
    onDeliveryDialogSelect(item) {
      if (!item) return
      this.form.relatedDeliveryId = item.warehouseDeliveryId || null
      this.deliveryDialogQuery = item.value || ''
      this.form.accessoryName = item.value || this.form.accessoryName
      if (!this.form.shipQty) this.form.shipQty = item.warehouseDeliveryNum || this.form.shipQty
      if (!this.form.unit && item.unit) this.$set(this.form, 'unit', item.unit)
    },
    remoteSearchPO(query) {
      const keyword = (query || '').trim()
      this.poLoading = true
      const params = keyword ? { auditStatus: 2, procurementPlanName: keyword, purchaseOrderNo: keyword, pageNum: 1, pageSize: 9999 } : { auditStatus: 2, pageNum: 1, pageSize: 9999 }
      listProcurementPlan(params).then(res => {
        this.poOptions = (res.rows || []).map(r => ({ value: r.purchaseOrderNo, label: `${r.procurementPlanName || '采购计划'}${r.purchaseOrderNo ? ' - ' + r.purchaseOrderNo : ''}`, id: r.procurementPlanId, qty: r.procurementPlanNum, materialId: r.lpMaterialId }))
        this.poLoading = false
      }).catch(() => { this.poLoading = false })
    },
    onPOVisibleChange(visible) {
      if (visible) {
        this.remoteSearchPO('')
      }
    },
    remoteSearchMO(query) {
      if (!query) { this.moOptions = []; return }
      this.moLoading = true
      listProductionPlan({ workOrderNo: query, pageNum: 1, pageSize: 10 }).then(res => {
        this.moOptions = (res.rows || []).map(r => ({ value: r.workOrderNo, label: `${r.workOrderNo}${r.planName ? ' - ' + r.planName : ''}`, id: r.planId, finishedProductId: r.finishedProductId }))
        this.moLoading = false
      }).catch(() => { this.moLoading = false })
    },
    getList() { this.loading = true; listShipping(this.queryParams).then(res => { this.list = res.rows; this.total = res.total; this.loading = false; this.resolvePONameMap(res.rows || []); this.resolveItemNames(res.rows || []) }) },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.queryParams.purchaseOrderNo = null; this.queryParams.workOrderNo = null; this.queryParams.status = null; this.poQuery = ''; this.moQuery = ''; this.handleQuery() },
    handleSelectionChange(selection) { this.ids = selection.map(i => i.shippingId); this.single = selection.length !== 1 },
    handleAdd() { this.reset(); this.open = true; this.title = '新增发运' },
    handleUpdate(row) {
      const target = row || (Array.isArray(this.list) ? this.list.find(x => x && x.shippingId === (Array.isArray(this.ids) && this.ids.length ? this.ids[0] : null)) : null)
      if (target && !this.canEdit(target)) { this.$modal.msgWarning('已完成不可修改'); return }
      this.reset()
      const id = row && row.shippingId ? row.shippingId : (Array.isArray(this.ids) && this.ids.length ? this.ids[0] : null)
      if (!id) { this.$modal.msgWarning('请选择一条记录'); return }
      getShipping(id).then(r => { this.form = r.data; if (this.form && this.form.shippingType === 1) { this.poDialogQuery = this.form.purchaseOrderNo || '' } else if (this.form && this.form.shippingType === 2) { this.moDialogQuery = this.form.workOrderNo || '' } if (this.form && this.form.etaTime) { try { const t = typeof this.form.etaTime === 'number' ? this.form.etaTime : new Date(this.form.etaTime).getTime(); if (Number.isFinite(t)) this.form.etaTime = t } catch (e) {} } this.open = true; this.title = '修改发运' })
    },

    handleExport() { this.download('shipping/shipping/export', { ...this.queryParams }, `shipping_${new Date().getTime()}.xlsx`) },
    cancel() { this.open = false; this.reset() },
    reset() { this.form = { shippingId: null, shippingType: 1, purchaseOrderNo: null, workOrderNo: null, relatedDeliveryId: null, procurementPlanId: null, productionPlanId: null, accessoryName: null, shipQty: null, logisticsCompany: null, trackingNo: null, etaTime: null, remark: null }; this.poDialogQuery = ''; this.moDialogQuery = ''; this.deliveryDialogQuery = ''; this.poSelectedQty = null; this.resetForm('form') },
    onPOChange(value) {
      const opt = this.poOptions.find(o => o.value === value)
      if (opt) {
        this.form.shipQty = opt.qty || 0
        this.form.procurementPlanId = opt.id
        this.poSelectedQty = opt.qty || null
        if (opt.materialId) {
          getMaterials(opt.materialId).then(resp => {
            const d = resp && resp.data
            this.$set(this.form, 'accessoryName', d ? d.accessoryName : '')
          }).catch(() => { this.$set(this.form, 'accessoryName', '') })
        } else {
          this.$set(this.form, 'accessoryName', '')
        }
      }
    },
    onPlanChange(id) {
      const opt = this.poOptions.find(o => o.id === id)
      if (opt) {
        this.form.purchaseOrderNo = opt.value || null
        this.form.shipQty = opt.qty || 0
        this.poSelectedQty = opt.qty || null
        if (opt.materialId) {
          getMaterials(opt.materialId).then(resp => {
            const d = resp && resp.data
            this.$set(this.form, 'accessoryName', d ? d.accessoryName : '')
          }).catch(() => { this.$set(this.form, 'accessoryName', '') })
        } else {
          this.$set(this.form, 'accessoryName', '')
        }
      }
    },
    goToPurchaseByNo(row) {
      const no = row && row.purchaseOrderNo
      if (!no) return
      listProcurementPlan({ purchaseOrderNo: no, pageNum: 1, pageSize: 1 }).then(res => {
        const first = (res.rows || [])[0]
        if (first && first.procurementPlanId) {
          this.$router.push(`/procurementPlan-data/procurementPlan/${first.procurementPlanId}`)
        }
      })
    },
    goToProductionByNo(row) {
      const no = row && row.workOrderNo
      if (!no) return
      listProductionPlan({ workOrderNo: no, pageNum: 1, pageSize: 1 }).then(res => {
        const first = (res.rows || [])[0]
        if (first && first.planId) {
          this.$router.push(`/productionPlan-data/productionPlan/${first.planId}`)
        }
      })
    },
    submitForm() {
      const doSave = () => {
        const api = this.form.shippingId ? updateShipping : addShipping
        return api(this.form)
          .then(() => {
            if (this.form.shippingType === 1 && this.form.procurementPlanId) {
              return shipProcurementPlan({ procurementPlanId: this.form.procurementPlanId })
                .catch(() => {
                  this.$modal.msgWarning('发运保存成功，但采购计划状态未更新，请检查审批状态')
                  return Promise.resolve()
                })
            }
            return Promise.resolve()
          })
      }
      this.$refs['form'].validate(valid => {
        if (!valid) return
        if (this.form.shippingType === 1) {
          if (!this.form.purchaseOrderNo) { this.$modal.msgError('请选择采购单号'); return }
          const qty = Number(this.form.shipQty || 0)
          if (!Number.isFinite(qty) || qty <= 0) { this.$modal.msgError('请输入有效运输数量'); return }
          if (this.poSelectedQty != null && qty > Number(this.poSelectedQty)) { this.$modal.msgError('运输数量不可超过采购计划数量'); return }
          if (!this.form.procurementPlanId) {
            listProcurementPlan({ purchaseOrderNo: this.form.purchaseOrderNo, auditStatus: 2, pageNum: 1, pageSize: 1 }).then(res => {
              const row = (res.rows || [])[0]
              if (row && row.procurementPlanId) { this.form.procurementPlanId = row.procurementPlanId; doSave().then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }).catch(err => { this.$modal.msgError((err && err.msg) || (err && err.message) || '保存失败') }) } else { this.$modal.msgError('未找到已审批的采购单') }
            }).catch(() => { this.$modal.msgError('查询采购单失败') })
            return
          }
          doSave().then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }).catch(err => { this.$modal.msgError((err && err.msg) || (err && err.message) || '保存失败') })
        } else {
          if (this.form.shippingType !== 1) {
            const qty = Number(this.form.shipQty || 0)
            if (!this.form.relatedDeliveryId) { this.$modal.msgError('请选择关联出库单'); return }
            if (!Number.isFinite(qty) || qty <= 0) { this.$modal.msgError('请输入有效运输数量'); return }
          }
          doSave().then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }).catch(err => { this.$modal.msgError((err && err.msg) || (err && err.message) || '保存失败') })
        }
      })
    },
    onMOChange(value) {
      const opt = this.moOptions.find(o => o.value === value)
      if (opt) { this.form.productionPlanId = opt.id }
    },
    displayItemName(row) {
      if (!row) return '-'
      if (row.shippingType === 1) {
        return row.accessoryName || this.itemNameDict['po:' + (row.procurementPlanId || row.purchaseOrderNo)] || '-'
      }
      if (row.shippingType === 2) {
        return this.itemNameDict['mo:' + (row.productionPlanId || row.workOrderNo)] || '-'
      }
      return '半成品'
    },
    shippingStatus(row) {
      if (!row) return '运输中'
      if (row.shippingType === 1) {
        const s = this.planStatusDict[row.purchaseOrderNo] != null ? this.planStatusDict[row.purchaseOrderNo] : this.planStatusDict[row.procurementPlanId]
        return s === 4 ? '已完成' : '运输中'
      }
      return '运输中'
    },
    resolveItemNames(rows) {
      const poKeys = Array.from(new Set((rows || []).filter(r => r.shippingType === 1 && !r.accessoryName && (r.procurementPlanId || r.purchaseOrderNo)).map(r => r.procurementPlanId || r.purchaseOrderNo)))
      const moKeys = Array.from(new Set((rows || []).filter(r => r.shippingType === 2 && (r.productionPlanId || r.workOrderNo)).map(r => r.productionPlanId || r.workOrderNo)))
      const poTasks = poKeys.map(key => {
        if (this.itemNameDict['po:' + key]) return Promise.resolve()
        const byId = typeof key === 'number'
        const planReq = byId ? getProcurementPlan(key) : listProcurementPlan({ purchaseOrderNo: key, pageNum: 1, pageSize: 1 })
        return planReq.then(pr => {
          const plan = byId ? (pr && pr.data) : ((pr.rows || [])[0])
          const mid = plan && plan.lpMaterialId
          const no = plan && plan.purchaseOrderNo
          const id = plan && plan.procurementPlanId
          if (no) this.$set(this.planStatusDict, no, plan.auditStatus)
          if (id != null) this.$set(this.planStatusDict, id, plan.auditStatus)
          if (!mid) { this.$set(this.itemNameDict, 'po:' + key, '-'); return }
          return getMaterials(mid).then(mr => {
            const name = (mr && mr.data && mr.data.accessoryName) || '-'
            this.$set(this.itemNameDict, 'po:' + key, name)
          })
        }).catch(() => { this.$set(this.itemNameDict, 'po:' + key, '-') })
      })
      const moTasks = moKeys.map(key => {
        if (this.itemNameDict['mo:' + key]) return Promise.resolve()
        const byId = typeof key === 'number'
        const planReq = byId ? getProductionPlan(key) : listProductionPlan({ workOrderNo: key, pageNum: 1, pageSize: 1 })
        return planReq.then(pr => {
          const plan = byId ? (pr && pr.data) : ((pr.rows || [])[0])
          const name = (plan && plan.planName) || '-'
          this.$set(this.itemNameDict, 'mo:' + key, name)
        }).catch(() => { this.$set(this.itemNameDict, 'mo:' + key, '-') })
      })
      Promise.all([...poTasks, ...moTasks]).catch(() => {})
    },
    resolvePONameMap(rows) {
      const nos = Array.from(new Set((rows || []).filter(r => r.shippingType === 1 && r.purchaseOrderNo).map(r => r.purchaseOrderNo)))
      if (!nos.length) return
      const tasks = nos.map(no => listProcurementPlan({ purchaseOrderNo: no, pageNum: 1, pageSize: 1 }).then(res => {
        const row = (res.rows || [])[0]
        if (row && row.purchaseOrderNo) {
          this.$set(this.poNameDict, row.purchaseOrderNo, row.procurementPlanName || '采购计划')
          this.$set(this.planStatusDict, row.purchaseOrderNo, row.auditStatus)
        } else {
          this.$set(this.poNameDict, no, '-')
        }
      }).catch(() => { this.$set(this.poNameDict, no, '-') }))
      Promise.all(tasks).catch(() => {})
    },
    canEdit(row) {
      return this.shippingStatus(row) !== '已完成'
    }
  }
}
</script>
