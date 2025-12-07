<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item :label="inventoryNameLabel" prop="inventoryName">
        <el-input
          v-model="queryParams.inventoryName"
          :placeholder="'请输入' + inventoryNameLabel"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数量" prop="inventoryNum">
        <el-input
          v-model="queryParams.inventoryNum"
          placeholder="请输入数量"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="价格" prop="inventoryPrice">
        <el-input
          v-model="queryParams.inventoryPrice"
          placeholder="请输入价格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位" prop="inventoryUnit">
        <el-input
          v-model="queryParams.inventoryUnit"
          placeholder="请输入单位"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          size="mini"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:add']"
          type="primary"
          plain
          icon="el-icon-shopping-cart-full"
          size="mini"
          @click="handleProcurementAdd"
        >采购入库</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:add']"
          type="primary"
          plain
          icon="el-icon-finished"
          size="mini"
          @click="handleProductionAdd"
        >完工入库</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:add']"
          type="primary"
          plain
          icon="el-icon-collection"
          size="mini"
          @click="handleSemiFinishedAdd"
        >半成品入库</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:edit']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:remove']"
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['Inventory:inventory:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <el-table
      v-loading="loading"
      :data="inventoryList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column :label="inventoryNameLabel" align="center" prop="inventoryName" />
      <el-table-column label="数量" align="center" prop="inventoryNum" />
      <el-table-column label="价格" align="center" prop="inventoryPrice" />
      <el-table-column label="单位" align="center" prop="inventoryUnit" />
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <span>{{ typeName(scope.row) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['Inventory:inventory:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['Inventory:inventory:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>

          <el-button
            v-hasPermi="['Inventory:inventory:pull']"
            size="mini"
            type="text"
            icon="el-icon-s-claim"
            @click="handlePull(scope.row)"
          >申领</el-button>

          <el-button
            v-hasPermi="['Inventory:inventory:query']"
            size="mini"
            type="text"
            icon="el-icon-time"
            @click="handleHistory(scope.row)"
          >查看历史</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" :visible.sync="openPull" width="520px" append-to-body>
      <el-form ref="form" :model="formPull" :rules="rulesPull" label-width="102px">
        <el-form-item label="出库类型" prop="outType">
          <el-radio-group v-model="formPull.outType">
            <el-radio :label="1">生产领料</el-radio>
            <el-radio :label="2">调拨出库</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formPull.outType===1" label="生产单" prop="productionPlanId">
          <el-select v-model="formPull.productionPlanId" filterable remote reserve-keyword :remote-method="remoteSearchPullProduction" :loading="pullProductionLoading" placeholder="搜索生产单号或计划名称" @change="onPullProductionChange">
            <el-option v-for="item in pullProductionOptions" :key="item.planId" :label="(item.workOrderNo ? (item.workOrderNo + ' - ') : '') + (item.planName || '')" :value="item.planId" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="inventoryNum">
          <el-input v-model="formPull.inventoryNum" type="number" placeholder="请输入数量" :disabled="formPull.outType===1 && lockPullByProductionPlan" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormPull">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改库存列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item :label="inventoryNameLabel" prop="inventoryName">
          <el-input v-model="form.inventoryName" :placeholder="'请输入' + inventoryNameLabel" />
        </el-form-item>
        <el-form-item label="数量" prop="inventoryNum">
          <el-input v-model="form.inventoryNum" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="价格" prop="inventoryPrice">
          <el-input v-model="form.inventoryPrice" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="单位" prop="inventoryUnit">
          <el-input v-model="form.inventoryUnit" placeholder="请输入单位" />
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

    <!-- 采购入库对话框 -->
    <el-dialog :title="procurementTitle" :visible.sync="openProcurement" width="500px" append-to-body>
      <el-form ref="procurementFormRef" :model="procurementForm" :rules="procurementRules" label-width="80px">
        <el-form-item label="运输单号" prop="inboundShippingQuery">
          <el-autocomplete
            v-model="procurementForm.inboundShippingQuery"
            placeholder="请选择运单号"
            :fetch-suggestions="fetchInboundShippingSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            prefix-icon="el-icon-tickets"
            @select="onInboundShippingSelect"
          />
        </el-form-item>
        <el-form-item label="采购单">
          <el-autocomplete
            v-model="poSearch"
            placeholder="输入采购计划名称或采购单号"
            :fetch-suggestions="fetchProcurementPlanSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            :disabled="true"
            @select="onProcurementSuggestionSelect"
          />
        </el-form-item>
        <el-form-item :label="inventoryNameLabel" prop="inventoryName">
          <el-input v-model="procurementForm.inventoryName" placeholder="自动带入" :disabled="lockedByPlan" />
        </el-form-item>
        <el-form-item label="价格" prop="inventoryPrice">
          <el-input v-model="procurementForm.inventoryPrice" placeholder="自动带入" disabled />
        </el-form-item>
        <el-form-item label="数量" prop="inventoryNum">
          <el-input v-model="procurementForm.inventoryNum" placeholder="自动带入" :disabled="lockedByPlan" />
        </el-form-item>
        <el-form-item label="单位" prop="inventoryUnit">
          <el-input v-model="procurementForm.inventoryUnit" placeholder="自动带入" :disabled="lockedByPlan" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="procurementForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="procurementSubmitting" @click="submitProcurementForm">确 定</el-button>
        <el-button @click="cancelProcurement">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 生产入库对话框 -->
    <el-dialog :title="productionTitle" :visible.sync="openProduction" width="500px" append-to-body>
      <el-form ref="productionFormRef" :model="productionForm" :rules="productionRules" label-width="80px">
        <el-form-item label="生产单">
          <el-autocomplete
            v-model="prodSearch"
            placeholder="输入生产计划名称或生产单号"
            :fetch-suggestions="fetchProductionPlanSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onProductionSuggestionSelect"
          />
        </el-form-item>
        <el-form-item :label="inventoryNameLabel" prop="inventoryName">
          <el-input v-model="productionForm.inventoryName" placeholder="自动带入" :disabled="lockedByProductionPlan" />
        </el-form-item>
        <el-form-item label="数量" prop="inventoryNum">
          <el-input-number v-model="productionForm.inventoryNum" :min="1" :step="1" controls-position="right" placeholder="自动带入" :disabled="lockedByProductionPlan" />
        </el-form-item>
        <el-form-item label="单位" prop="inventoryUnit">
          <el-input v-model="productionForm.inventoryUnit" placeholder="自动带入" :disabled="lockedByProductionPlan" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="productionForm.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="productionSubmitting" @click="submitProductionForm">确 定</el-button>
        <el-button @click="cancelProduction">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInventory, getInventory, delInventory, addInventory, updateInventory } from '@/api/supplierInventory/supplierInventory'
import { listWarehouseDelivery, addWarehouseDelivery } from '@/api/warehouseDelivery/warehouseDelivery'
import { listWarehouseWarrant, addWarehouseWarrant } from '@/api/warehouseWarrant/warehouseWarrant'
import { listProcurementPlan, arriveProcurementPlan } from '@/api/procurementPlan/procurementPlan'
import { listProductionPlan, getProductionPlan, updateProductionPlan } from '@/api/productionPlan/productionPlan'
import { getMaterials } from '@/api/materials/materials'
import { listMaterialsClassify } from '@/api/materialsClassify/materialsClassify'
import { listShipping } from '@/api/shipping/shipping'

export default {
  name: 'Inventory',
      data() {
        return {
      openPull: false,
      formPull: {
        inventoryId: 0,
        inventoryName: '',
        inventoryUnit: '',
        outType: 1,
        productionPlanId: null
      },
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 库存列表表格数据
      inventoryList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        inventoryName: null,
        inventoryNum: null,
        inventoryPrice: null,
        inventoryUnit: null,
        warehouseWarrantId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      rulesPull: {
        outType: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
        inventoryNum: [{ required: true, message: '请输入数量', trigger: 'blur' }]
      },
      // 采购计划入库
      openProcurement: false,
      procurementTitle: '',
      procurementPlanOptions: [],
      procurementPlanLoading: false,
      selectedProcurementPlanId: null,
      poSearch: '',
      lockedByPlan: true,
      procurementForm: {},
      procurementSubmitting: false,
      procurementRules: {
        inboundShippingQuery: [
          { required: true, message: '请选择运输单', trigger: 'change' },
          { validator: (rule, value, callback) => { if (!this.selectedInboundShippingTrackingNo) { callback(new Error('请选择运输单')) } else { callback() } }, trigger: 'change' }
        ]
      },
      inboundShippingQuery: '',
      selectedInboundShippingTrackingNo: '',
      selectedInboundShippingPO: '',
      lockPOByShipping: false,
      // 生产计划入库
      openProduction: false,
      productionTitle: '',
      productionPlanOptions: [],
      productionPlanLoading: false,
      selectedProductionPlanId: null,
      prodSearch: '',
      lockedByProductionPlan: true,
      productionForm: {},
      productionRules: {
        inventoryNum: [
          { required: true, message: '请输入数量', trigger: 'blur' },
          { validator: (rule, value, callback) => { const num = Number(value); if (!Number.isFinite(num) || num <= 0) { callback(new Error('数量必须为正整数')) } else { callback() } }, trigger: 'blur' }
        ]
      },
      productionSubmitting: false,
      pullProductionOptions: [],
      pullProductionLoading: false,
      lockPullByProductionPlan: false,
      materialsClassifyOptions: [],
      typeNameDict: {}
    }
  },
  created() {
    this.getList()
    this.fetchTypeDictionaries()
  },
  computed: {
    inventoryNameLabel() {
      const route = this.$route || {}
      const path = String(route.path || '')
      const queryModule = route.query && route.query.module
      const metaModule = route.meta && route.meta.module
      const mod = queryModule || metaModule || (/(production|supplier)/i.test(path) ? 'production' : (/(warehouse)/i.test(path) ? 'warehouse' : null))
      return mod === 'production' ? '供应商库存名称' : '库存名称'
    },
    inventoryPageTitle() {
      const label = this.inventoryNameLabel
      return label === '供应商库存名称' ? '供应商库存列表' : '库存列表'
    }
  },
  methods: {
    $_addWarehouseDelivery(payload) {
      if (!payload || !payload.warehouseDeliveryName || !payload.warehouseDeliveryNum) return
      addWarehouseDelivery(payload).catch(() => {})
    },
    // 申领提交数据
    submitFormPull() {
      const claimNum = Number(this.formPull.inventoryNum || 0)
      const currentNum = Number(this.formPull.currentNum || 0)
      if (!this.formPull.inventoryId) {
        this.$modal.msgError('缺少申领目标ID')
        return
      }
      if (this.formPull.outType === 1 && !this.formPull.productionPlanId) {
        this.$modal.msgError('请选择生产单')
        return
      }
      if (!Number.isFinite(claimNum) || claimNum <= 0) {
        this.$modal.msgError('请输入有效申领数量')
        return
      }
      if (claimNum > currentNum) {
        this.$modal.msgError('申领数量不能大于当前库存')
        return
      }
      const payload = {
        inventoryId: this.formPull.inventoryId,
        inventoryNum: currentNum - claimNum,
        remark: [`出库类型:${this.formPull.outType === 1 ? '生产出库' : '调拨出库'}`].join(' | ')
      }
      updateInventory(payload).then(() => {
        const outRemark = [`OUT`, `类型:${this.formPull.outType === 1 ? '生产出库' : '调拨出库'}`].join(' | ')
        const outPayload = { warehouseDeliveryName: this.formPull.inventoryName, warehouseDeliveryNum: claimNum, unit: this.formPull.inventoryUnit, remark: outRemark }
        try { if (this.$_addWarehouseDelivery) { this.$_addWarehouseDelivery(outPayload) } } catch (e) { /* ignore */ }
        this.$modal.msgSuccess('申请成功')
        this.openPull = false
        this.getList()
      })
    },
    // 申领窗口方法
    handlePull(row) {
      this.formPull.inventoryId = row.inventoryId
      this.formPull.inventoryName = row.inventoryName
      this.formPull.inventoryUnit = row.inventoryUnit
      this.formPull.currentNum = row.inventoryNum
      this.formPull.inventoryNum = null
      this.formPull.outType = 1
      this.formPull.productionPlanId = null
      this.pullProductionOptions = []
      this.lockPullByProductionPlan = false
      this.openPull = true
      this.title = '申领窗口'
    },

    remoteSearchPullProduction(query) {
      if (!query) { this.pullProductionOptions = []; return }
      this.pullProductionLoading = true
      listProductionPlan({ planName: query, workOrderNo: query, status: 1, pageNum: 1, pageSize: 10 }).then((res) => {
        const rows = res.rows || []
        this.pullProductionOptions = rows.filter((x) => x.status === 1)
      }).catch(() => {}).finally(() => { this.pullProductionLoading = false })
    },

    onPullProductionChange(id) {
      const plan = this.pullProductionOptions.find(x => x.planId === id)
      if (plan) {
        this.formPull.inventoryNum = plan.productionNum
        this.lockPullByProductionPlan = true
      } else {
        this.lockPullByProductionPlan = false
      }
    },

    /** 查询库存列表列表 */
    getList() {
      this.loading = true
      listInventory(this.queryParams).then((response) => {
        const rows = response.rows || []
        this.inventoryList = rows
        this.total = response.total
        this.resolveTypeNames(this.inventoryList)
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        inventoryId: null,
        inventoryName: null,
        inventoryNum: null,
        inventoryPrice: null,
        inventoryUnit: null,
        warehouseWarrantId: null,
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.inventoryId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加' + this.inventoryPageTitle
    },
    // 采购入库
    handleProcurementAdd() {
      this.resetProcurementForm()
      this.openProcurement = true
      this.procurementTitle = '采购入库'
      this.remoteSearchInboundPO('')
    },
    // 生产入库
    handleProductionAdd() {
      this.resetProductionForm()
      this.openProduction = true
      this.productionTitle = '生产入库'
      this.fetchProductionPlans()
    },
    // 采购入库弹窗：审批通过的采购单远程搜索
    remoteSearchInboundPO(query) {
      const keyword = (query || '').trim()
      this.procurementPlanLoading = true
      const params = keyword ? { auditStatus: 2, procurementPlanName: keyword, purchaseOrderNo: keyword, pageNum: 1, pageSize: 9999 } : { auditStatus: 2, pageNum: 1, pageSize: 9999 }
      listProcurementPlan(params).then((res) => {
        this.procurementPlanOptions = res.rows || []
      }).finally(() => { this.procurementPlanLoading = false })
    },
    onInboundPOVisibleChange(visible) {
      if (visible) this.remoteSearchInboundPO('')
    },
    // 采购计划选择联动
    onProcurementPlanChange(id) {
      const plan = this.procurementPlanOptions.find((x) => x.procurementPlanId === id)
      this.lockedByPlan = !!id
      if (!plan) {
        return
      }
      this.procurementForm.inventoryNum = plan.procurementPlanNum || this.procurementForm.inventoryNum
      this.procurementForm.inventoryPrice = plan.procurementPlanPrice || this.procurementForm.inventoryPrice
      // 使用 lpMaterialId 以匹配后端采购计划字段
      const mid = plan.lpMaterialId
      this.procurementForm.materialsId = mid || null
      if (mid) {
        getMaterials(mid).then((res) => {
          const d = res && res.data ? res.data : {}
          this.procurementForm.inventoryName = d.accessoryName || this.procurementForm.inventoryName
          this.procurementForm.inventoryUnit = plan.unit || d.unit || this.procurementForm.inventoryUnit
        })
      } else {
        this.procurementForm.inventoryUnit = plan.unit || this.procurementForm.inventoryUnit
      }
    },
    // 提交采购入库
    submitProcurementForm() {
      if (this.procurementSubmitting) return
      this.$refs['procurementFormRef'].validate((valid) => {
        if (!valid) return
        this.procurementSubmitting = true
        // 备注包含参考标签，便于审计，但累加逻辑按ID执行
        const refTag = this.procurementForm.materialsId ? `ITEM#${this.procurementForm.materialsId}` : null
        const baseRemark = this.procurementForm.remark
        const shipTag = this.selectedInboundShippingTrackingNo ? `SHIP#${this.selectedInboundShippingTrackingNo}` : null
        const poTag = this.selectedInboundShippingPO ? `PO#${this.selectedInboundShippingPO}` : null
        const finalRemark = [refTag, shipTag, poTag, baseRemark].filter(Boolean).join(' | ')
        const addPayload = {
          inventoryName: this.procurementForm.inventoryName,
          inventoryNum: this.procurementForm.inventoryNum,
          inventoryPrice: this.procurementForm.inventoryPrice,
          inventoryUnit: this.procurementForm.inventoryUnit,
          remark: finalRemark,
          warehouseWarrantId: this.selectedProcurementPlanId,
          itemId: this.procurementForm.materialsId || null
        }
        // 直接调用后端合并入库接口，按ID+类型进行累加或新增
        addInventory(addPayload).then(() => {
          const wwPayload = {
            warehouseWarrantName: this.procurementForm.inventoryName,
            warehouseWarrantNum: this.procurementForm.inventoryNum,
            warehouseWarrantPrice: this.procurementForm.inventoryPrice,
            unit: this.procurementForm.inventoryUnit,
            remark: finalRemark
          }
          addWarehouseWarrant(wwPayload).catch(() => {})
          this.resetQuery()
          const id = this.selectedProcurementPlanId
          if (id) {
            arriveProcurementPlan({ procurementPlanId: id }).then(() => {
              this.$modal.msgSuccess('新增成功，并已到货')
              this.openProcurement = false
              this.resetQuery()
            }).catch(() => {
              this.$modal.msgSuccess('新增成功')
              this.openProcurement = false
              this.resetQuery()
            })
          } else {
            this.$modal.msgSuccess('新增成功')
            this.openProcurement = false
            this.resetQuery()
          }
        }).catch(() => {}).finally(() => {
          this.procurementSubmitting = false
        })
      })
    },
    fetchInboundShippingSuggestions(queryString, cb) {
      const keyword = String(queryString || '').trim().toLowerCase()
      listShipping({ shippingType: 1, pageNum: 1, pageSize: 50 }).then(res => {
        const rows = res.rows || []
        const tasks = rows.map(r => {
          const no = r && r.purchaseOrderNo
          if (!no) return Promise.resolve({ row: r, status: null })
          return listProcurementPlan({ purchaseOrderNo: no, pageNum: 1, pageSize: 1 }).then(pr => {
            const plan = (pr.rows || [])[0]
            const status = plan ? plan.auditStatus : null
            return { row: r, status }
          }).catch(() => ({ row: r, status: null }))
        })
        Promise.all(tasks).then(list => {
          const inTransit = list.filter(x => x.row && (x.status === 3))
          const suggestions = inTransit
            .map(x => x.row)
            .filter(r => {
              if (!keyword) return true
              const t = String(r.trackingNo || '').toLowerCase()
              const po = String(r.purchaseOrderNo || '').toLowerCase()
              return t.includes(keyword) || po.includes(keyword)
            })
            .slice(0, 20)
            .map(r => ({ value: r.trackingNo || '', trackingNo: r.trackingNo || '', purchaseOrderNo: r.purchaseOrderNo || '' }))
          cb(suggestions)
        }).catch(() => cb([]))
      }).catch(() => cb([]))
    },
    onInboundShippingSelect(item) {
      this.procurementForm.inboundShippingQuery = item && item.value ? item.value : ''
      this.selectedInboundShippingTrackingNo = item && item.trackingNo ? item.trackingNo : ''
      this.selectedInboundShippingPO = item && item.purchaseOrderNo ? item.purchaseOrderNo : ''
      if (this.selectedInboundShippingPO) {
        this.setSelectedProcurementByPurchaseOrderNo(this.selectedInboundShippingPO)
      }
    },
    setSelectedProcurementByPurchaseOrderNo(no) {
      if (!no) { this.lockPOByShipping = false; return }
      listProcurementPlan({ purchaseOrderNo: no, pageNum: 1, pageSize: 1 }).then((res) => {
        const plan = (res.rows || [])[0]
        if (plan && plan.procurementPlanId) {
          this.procurementPlanOptions = [plan]
          this.selectedProcurementPlanId = plan.procurementPlanId
          this.poSearch = `${plan.procurementPlanName || '采购计划'}${plan.purchaseOrderNo ? ' - ' + plan.purchaseOrderNo : ''}`
          this.onProcurementPlanChange(plan.procurementPlanId)
          this.lockPOByShipping = true
        } else {
          this.lockPOByShipping = false
          this.$modal && this.$modal.msgWarning('未找到运输单关联的采购单')
        }
      }).catch(() => { this.lockPOByShipping = false })
    },
    cancelProcurement() {
      this.openProcurement = false
      this.resetProcurementForm()
    },
    resetProcurementForm() {
      this.procurementForm = {
        inboundShippingQuery: '',
        inventoryName: null,
        inventoryNum: null,
        inventoryPrice: null,
        inventoryUnit: null,
        remark: null
      }
      this.selectedProcurementPlanId = null
      this.lockedByPlan = true
      this.poSearch = ''
      this.resetForm('procurementFormRef')
    },
    // 加载生产计划（仅已完成）
    fetchProductionPlans() {
      this.productionPlanLoading = true
      listProductionPlan({ status: 2, pageNum: 1, pageSize: 1000 }).then((res) => {
        const rows = res.rows || []
        this.productionPlanOptions = rows
      }).finally(() => {
        this.productionPlanLoading = false
      })
    },
    fetchProductionPlanSuggestions(queryString, cb) {
      const keyword = (queryString || '').trim()
      this.productionPlanLoading = true
      const params = keyword ? { status: 2, planName: keyword, workOrderNo: keyword, pageNum: 1, pageSize: 20 } : { status: 2, pageNum: 1, pageSize: 20 }
      listProductionPlan(params)
        .then((res) => {
          const rows = res.rows || []
          const suggestions = rows.map((p) => ({
            value: `${p.workOrderNo ? p.workOrderNo : '工单号'}${p.planName ? ' - ' + p.planName : ''}`,
            planId: p.planId,
            workOrderNo: p.workOrderNo || ''
          }))
          cb(suggestions)
        })
        .finally(() => {
          this.productionPlanLoading = false
        })
    },

    handleHistory(row) {
      if (!row) return
      this.historyTitle = `库存历史 - ${row.inventoryName || ''}`
      this.openHistory = true
      this.historyLoading = true
      const inReq = listWarehouseWarrant({ warehouseWarrantName: row.inventoryName, pageNum: 1, pageSize: 100 })
      const outReq = listWarehouseDelivery({ warehouseDeliveryName: row.inventoryName, pageNum: 1, pageSize: 100 })
      Promise.all([inReq, outReq])
        .then(([inRes, outRes]) => {
          const ins = (inRes.rows || []).map(w => ({ type: '入库', name: w.warehouseWarrantName, num: w.warehouseWarrantNum, unit: w.unit, remark: w.remark, time: w.createTime }))
          const outs = (outRes.rows || []).map(d => ({ type: '出库', name: d.warehouseDeliveryName, num: d.warehouseDeliveryNum, unit: d.unit, remark: d.remark, time: d.createTime }))
          const all = ins.concat(outs)
          all.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
          this.historyEntries = all
        })
        .catch(() => { this.historyEntries = [] })
        .finally(() => { this.historyLoading = false })
    },
    onProductionSuggestionSelect(item) {
      const id = item && item.planId
      this.selectedProductionPlanId = id || null
      this.prodSearch = (item && item.value) || ''
      if (id) this.onProductionPlanChange(id)
    },
    // 生产计划选择联动
    onProductionPlanChange(id) {
      this.lockedByProductionPlan = !!id
      const plan = this.productionPlanOptions.find((x) => x.planId === id)
      const apply = (p) => {
        if (!p) return
        this.productionForm.inventoryNum = p.productionNum
        this.productionForm.inventoryName = p.planName || this.productionForm.inventoryName
      }
      if (plan) {
        apply(plan)
      } else if (id) {
        getProductionPlan(id).then((res) => apply(res.data || {}))
      }
    },
    // 提交生产入库
    submitProductionForm() {
      if (this.productionSubmitting) return
      this.$refs['productionFormRef'].validate((valid) => {
        if (!valid) return
        this.productionSubmitting = true
        // 备注包含参考标签，便于审计，但累加逻辑按ID执行
        const baseRemark = this.productionForm.remark
        const finalRemark = baseRemark || ''
        const addPayload = {
          inventoryName: this.productionForm.inventoryName,
          inventoryNum: this.productionForm.inventoryNum,
          inventoryUnit: this.productionForm.inventoryUnit,
          remark: finalRemark,
          finishedProductId: null
        }
        // 直接调用后端合并入库接口，按ID+类型进行累加或新增
        addInventory(addPayload).then(() => {
          const wwPayload = {
            warehouseWarrantName: this.productionForm.inventoryName,
            warehouseWarrantNum: this.productionForm.inventoryNum,
            warehouseWarrantPrice: null,
            unit: this.productionForm.inventoryUnit,
            remark: finalRemark
          }
          addWarehouseWarrant(wwPayload).catch(() => {})
          const id = this.selectedProductionPlanId
          if (id) {
            updateProductionPlan({ planId: id, status: 3 }).then(() => {
              this.$modal.msgSuccess('生产入库成功，生产单已完成')
              this.openProduction = false
              this.getList()
            }).catch(() => {
              this.$modal.msgSuccess('生产入库成功')
              this.openProduction = false
              this.getList()
            })
          } else {
            this.$modal.msgSuccess('生产入库成功')
            this.openProduction = false
            this.getList()
          }
        }).catch(() => {}).finally(() => {
          this.productionSubmitting = false
        })
      })
    },
    cancelProduction() {
      this.openProduction = false
      this.resetProductionForm()
    },
    resetProductionForm() {
      this.productionForm = {
        inventoryName: null,
        inventoryNum: null,
        inventoryUnit: null,
        remark: null
      }
      this.selectedProductionPlanId = null
      this.lockedByProductionPlan = true
      this.prodSearch = ''
      this.resetForm('productionFormRef')
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const inventoryId = row.inventoryId || this.ids
      getInventory(inventoryId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改' + this.inventoryPageTitle
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.inventoryId != null) {
            updateInventory(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addInventory(this.form).then((response) => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const inventoryIds = row.inventoryId || this.ids
      this.$modal
        .confirm('是否确认删除' + this.inventoryPageTitle + '编号为"' + inventoryIds + '"的数据项？')
        .then(function() {
          return delInventory(inventoryIds)
        })
        .then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        })
        .catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        'production/supplierInventory/export',
        {
          ...this.queryParams
        },
        `inventory_${new Date().getTime()}.xlsx`
      )
    },
    fetchTypeDictionaries() {
      listMaterialsClassify({ pageNum: 1, pageSize: 9999 }).then(res => { this.materialsClassifyOptions = res.rows || [] }).catch(() => {})
    },
    typeName(row) {
      if (!row) return '-'
      if (row.itemId) {
        return this.typeNameDict['mat:' + row.itemId] || '配件'
      }
      return '-'
    },
    resolveTypeNames(rows) {
      const matIds = Array.from(new Set((rows || []).map(r => r.itemId).filter(Boolean)))
      const matTasks = matIds.map(id => getMaterials(id).then(res => {
        const d = res && res.data ? res.data : {}
        const cid = d.accessoryClassifyId
        let name = '配件'
        if (cid) {
          const m = this.materialsClassifyOptions.find(x => x.accessoryClassifyId === cid)
          if (m) name = m.accessoryClassifyName
        }
        this.$set(this.typeNameDict, 'mat:' + id, name)
      }).catch(() => { this.$set(this.typeNameDict, 'mat:' + id, '配件') }))
      Promise.all(matTasks).catch(() => {})
    }
  }
}
</script>

<!-- 库存历史明细弹窗 -->
<el-dialog :title="historyTitle" :visible.sync="openHistory" width="720px" append-to-body>
  <el-table v-loading="historyLoading" :data="historyEntries">
    <el-table-column label="类型" align="center" prop="type" />
    <el-table-column label="名称" align="center" prop="name" />
    <el-table-column label="数量" align="center">
      <template slot-scope="scope">
        <span>{{ scope.row.type === '出库' ? '-' : '' }}{{ scope.row.num }}</span>
      </template>
    </el-table-column>
    <el-table-column label="单位" align="center" prop="unit" />
    <el-table-column label="备注" align="center" prop="remark" />
    <el-table-column label="时间" align="center">
      <template slot-scope="scope">
        <span>{{ parseTime(scope.row.time) }}</span>
      </template>
    </el-table-column>
  </el-table>
  <div slot="footer" class="dialog-footer">
    <el-button icon="el-icon-close" @click="openHistory=false">关 闭</el-button>
  </div>
</el-dialog>
    // 采购入库弹窗：输入框联想搜索采购计划/采购单号
    fetchProcurementPlanSuggestions(queryString, cb) {
      const keyword = (queryString || '').trim()
      this.procurementPlanLoading = true
      const params = keyword ? { auditStatus: 2, procurementPlanName: keyword, purchaseOrderNo: keyword, pageNum: 1, pageSize: 20 } : { auditStatus: 2, pageNum: 1, pageSize: 20 }
      listProcurementPlan(params).then((res) => {
        const rows = res.rows || []
        const suggestions = rows.map(p => ({
          value: `${p.procurementPlanName || '采购计划'}${p.purchaseOrderNo ? ' - ' + p.purchaseOrderNo : ''}`,
          procurementPlanId: p.procurementPlanId,
          purchaseOrderNo: p.purchaseOrderNo || ''
        }))
        cb(suggestions)
      }).finally(() => { this.procurementPlanLoading = false })
    },
    onProcurementSuggestionSelect(item) {
      const id = item && item.procurementPlanId
      this.selectedProcurementPlanId = id || null
      this.poSearch = item && item.value ? item.value : ''
      if (id) this.onProcurementPlanChange(id)
    },
