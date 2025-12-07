<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="102px"
    >
      <el-form-item label="采购计划名称" prop="procurementPlanName">
        <el-input
          v-model="queryParams.procurementPlanName"
          placeholder="请输入采购计划名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="数量" prop="procurementPlanNum">
        <el-input
          v-model="queryParams.procurementPlanNum"
          placeholder="请输入数量"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="价格" prop="procurementPlanPrice">
        <el-input
          v-model="queryParams.procurementPlanPrice"
          placeholder="请输入价格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input
          v-model="queryParams.unit"
          placeholder="请输入单位"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收货供应商">
        <el-autocomplete
          v-model="receiveSupplierQuery"
          placeholder="输入收货供应商名称搜索"
          :fetch-suggestions="fetchSupplierSuggestions"
          :debounce="300"
          :trigger-on-focus="true"
          @select="onReceiveSupplierQuerySelect"
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
      <!-- 修复：Element UI 栅格 span 需为整数，1.5 会触发校验警告 -->
      <el-col :span="2">
        <el-button
          v-hasPermi="['procurementPlan:procurementPlan:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['procurementPlan:procurementPlan:edit']"
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
          v-hasPermi="['procurementPlan:procurementPlan:remove']"
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
          v-hasPermi="['procurementPlan:procurementPlan:export']"
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
      :data="procurementPlanList"
      :default-sort="defaultSort"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="采购单号" align="center">
        <template slot-scope="scope">
          <!-- 兜底显示：后端历史数据可能未生成采购订单号 -->
          <router-link
            :to="'/procurementPlan-data/procurementPlan/' + scope.row.procurementPlanId"
            class="link-type"
          >
            <span>{{ scope.row.purchaseOrderNo || '未生成' }}</span>
          </router-link>
        </template>
      </el-table-column>

      <!-- <el-table-column label="采购计划名称" align="center" prop="procurementPlanName" /> -->

      <el-table-column
        label="采购计划名称"
        align="center"
        prop="procurementPlanName"
      >
        <template slot-scope="scope">
          <router-link
            :to="
              '/procurementPlan-data/procurementPlan/' +
                scope.row.procurementPlanId
            "
            class="link-type"
          >
            <span> {{ scope.row.procurementPlanName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="物料分类" align="center">
        <template slot-scope="scope">
          <!-- 兜底显示：配件ID无效或主数据缺失时提示 -->
          <span>{{ classifyNameByMaterials(scope.row.lpMaterialId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="采购物料" align="center">
        <template slot-scope="scope">
          <!-- 兜底显示：配件ID无效或主数据缺失时提示 -->
          <span>{{ materialName(scope.row.lpMaterialId) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="数量" align="center" prop="procurementPlanNum" />
      <el-table-column
        label="价格"
        align="center"
        prop="procurementPlanPrice"
      />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="采购总价(元)" align="center">
        <template slot-scope="scope">
          <span>{{ calcTotalPrice(scope.row) || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="物料供应商" align="center">
        <template slot-scope="scope">
          <span>{{ supplierName(scope.row.supplierId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货供应商" align="center">
        <template slot-scope="scope">
          <span>{{ supplierName(scope.row.receiveSupplierId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" align="center" prop="receiveAddress" />
      <el-table-column label="采购状态" align="center" prop="auditStatus">
        <template slot-scope="scope">
          <!-- 显示采购状态：未审核 / 审核 / 审批 / 发货 / 到货 -->
          <span v-if="scope.row.auditStatus === 0">
            <el-tag type="danger">未审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 1">
            <el-tag type="primary">审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 2">
            <el-tag type="success">审批</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 3">
            <el-tag type="warning">发货</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 4">
            <el-tag type="success">已完成</el-tag>
          </span>
        </template>
      </el-table-column>

      <el-table-column label="审核意见" align="center" prop="auditOpinion" />
      <el-table-column
        label="审核时间"
        align="center"
        prop="auditTime"
        width="180"
      >
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.auditTime).date }}</div>
            <div>{{ splitDateTime(scope.row.auditTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="审核人员" align="center" prop="auditPerson" />
      <el-table-column label="审批意见" align="center" prop="approverOpinion" />
      <el-table-column
        label="审批时间"
        align="center"
        prop="approverTime"
        width="180"
      >
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.approverTime).date }}</div>
            <div>{{ splitDateTime(scope.row.approverTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="审批人员" align="center" prop="approverPerson" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom">
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.createTime).date }}</div>
            <div>{{ splitDateTime(scope.row.createTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 1">
            <el-button
              v-hasPermi="['procurementPlan:procurementPlan:approver']"
              size="mini"
              type="text"
              icon="el-icon-check"
              @click="handleApprover(scope.row)"
            >审批</el-button>
          </span>
          
          <span v-if="scope.row.auditStatus === 3">
            <el-button
              v-hasPermi="['procurementPlan:procurementPlan:arrive']"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="handleArrive(scope.row)"
            >已完成</el-button>
          </span>
          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['procurementPlan:procurementPlan:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['procurementPlan:procurementPlan:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-hasPermi="['procurementPlan:procurementPlan:audit']"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="handleAudit(scope.row)"
            >审核</el-button>
          </span>
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

    <!-- 审批供应商对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="openApprover"
      width="960px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="form"
        :model="formApprover"
        :rules="rules"
        label-width="180px"
      >
        <el-form-item label="审批状态" prop="auditStatus">
          <el-radio-group v-model="formApprover.auditStatus">
            <el-radio label="1">不通过</el-radio>
            <el-radio label="2">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="approverOpinion">
          <el-input
            v-model="formApprover.approverOpinion"
            type="textarea"
            placeholder="请输入意见内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormApprover">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--    //审核窗口-->
    <el-dialog
      :title="title"
      :visible.sync="openAudit"
      width="960px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="form" :model="formAudit" :rules="rules" label-width="180px">
        <el-form-item label="审核状态" prop="auditStatus">
          <el-radio-group v-model="formAudit.auditStatus">
            <el-radio label="0">不通过</el-radio>
            <el-radio label="1">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion">
          <el-input
            v-model="formAudit.auditOpinion"
            type="textarea"
            placeholder="请输入意见内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormAudit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="openShip" width="600px" append-to-body destroy-on-close>
      <el-form ref="formShip" :model="formShip" :rules="shipRules" label-width="120px">
        <el-form-item label="物流商" prop="logisticsMerchant">
          <el-input v-model="formShip.logisticsMerchant" placeholder="请输入物流商" />
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsCode">
          <el-input v-model="formShip.logisticsCode" placeholder="请输入物流单号" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitShip">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改采购计划对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body destroy-on-close>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="采购计划名称" prop="procurementPlanName">
          <el-input
            v-model="form.procurementPlanName"
            placeholder="请输入采购计划名称"
          />
        </el-form-item>

        <!-- 合并字段：物料名称（物料名称-供应商），支持远程搜索 -->
        <el-form-item label="物料名称" prop="combinedKey" required>
          <el-select
            v-model="form.combinedKey"
            placeholder="请选择物料名称"
            filterable
            remote
            reserve-keyword
            :remote-method="remoteSearchCombined"
            :loading="combinedLoading"
            clearable
            @change="onCombinedChange"
          >
            <el-option
              v-for="item in combinedOptions"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            >
              <!-- 图标：配件与供应商，增强可读性 -->
              <i class="el-icon-goods" style="margin-right:6px;color:#409EFF" />
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物料供应商">
          <el-input :value="supplierName(form.supplierId)" placeholder="自动带入" disabled />
        </el-form-item>
        <el-form-item label="数量" prop="procurementPlanNum">
          <el-input
            v-model="form.procurementPlanNum"
            placeholder="请输入数量"
          />
        </el-form-item>
        <el-form-item label="价格" prop="procurementPlanPrice">
          <el-input
            v-model="form.procurementPlanPrice"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="采购总价(元)">
          <el-input :value="calcTotalPrice(form)" placeholder="数量×价格自动计算" disabled />
        </el-form-item>
        <el-form-item label="收货供应商" prop="receiveSupplierId">
          <el-autocomplete
            v-model="receiveSupplierSearch"
            placeholder="输入收货供应商名称搜索"
            :fetch-suggestions="fetchSupplierSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onReceiveSupplierSuggestionSelect"
          />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiveAddress">
          <el-input v-model="form.receiveAddress" placeholder="请选择供应商自动带入，亦可手动编辑" />
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
import {
  listProcurementPlan,
  getProcurementPlan,
  delProcurementPlan,
  addProcurementPlan,
  updateProcurementPlan,
  auditProcurementPlan,
  approverProcurementPlan
} from '../../../api/procurementPlan/procurementPlan'
import { listMaterials, getMaterials } from '../../../api/materials/materials'
import { listSupplier } from '../../../api/supplier/supplier'
import request from '@/utils/request'
import { shipProcurementPlan, arriveProcurementPlan } from '../../../api/procurementPlan/procurementPlan'
import { parseTime } from '@/utils/huaan'

export default {
  name: 'ProcurementPlan',
  data() {
    return {
      openApprover: false,
      formApprover: {
        procurementPlanId: 0
      },
      openAudit: false,
      openShip: false,
      formAudit: {
        procurementPlanId: 0
      },
      supplierList: [],
      approvedSupplierList: [],
      materialsClassifyList: [],

      materialsOptions: [],
      materialsLoading: false,
      materialsDict: {},
      materialsClassifyIdByMaterial: {},
      // 新增：配件主数据字典（按ID存储完整对象），用于带出价格/单位等
      materialsById: {},
      // 新增：合并后的下拉选项与加载状态（物料名称-供应商）
      combinedOptions: [],
      combinedLoading: false,
      supplierSearch: '',
      receiveSupplierSearch: '',
      receiveSupplierQuery: '',
      formShip: {
        procurementPlanId: 0,
        logisticsMerchant: '',
        logisticsCode: ''
      },
      shipRules: {
        logisticsMerchant: [{ required: true, message: '物流商不能为空', trigger: 'blur' }],
        logisticsCode: [{ required: true, message: '物流单号不能为空', trigger: 'blur' }]
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
      // 采购计划表格数据
      procurementPlanList: [],
      // 默认按创建时间倒序排序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        procurementPlanName: null,
        procurementPlanNum: null,
        procurementPlanPrice: null,
        unit: null,
        accessoryClassifyId: null,
        supplierId: null,
        receiveSupplierId: null,
        auditStatus: null,
        auditOpinion: null,
        auditTime: null,
        auditPerson: null,
        approverOpinion: null,
        approverTime: null,
        approverPerson: null,
        orderByColumn: undefined,
        isAsc: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        procurementPlanName: [
          { required: true, message: '采购计划名称不能为空', trigger: 'blur' }
        ],
        combinedKey: [
          { required: true, message: '物料名称-供应商不能为空', trigger: 'change' }
        ],
        procurementPlanNum: [
          { required: true, message: '数量不能为空', trigger: 'blur' }
        ],
        procurementPlanPrice: [
          { required: true, message: '价格不能为空', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '单位不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.materialsClassifyLists()
    this.supplierLists()
    this.supplierListsApproved()
    this.loadAllMaterials()
    this.queryParams.orderByColumn = 'createTime'
    this.queryParams.isAsc = 'descending'
    this.getList()
  },
  methods: {
    splitDateTime(v) {
      const s = parseTime(v)
      if (!s) return { date: '-', time: '' }
      const parts = String(s).split(' ')
      return { date: parts[0] || s, time: parts[1] || '' }
    },
    calcTotalPrice(f) {
      const qty = Number(f && f.procurementPlanNum)
      const price = Number(f && f.procurementPlanPrice)
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return ''
      const total = qty * price
      if (!Number.isFinite(total)) return ''
      return total.toFixed(2)
    },
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },
    submitFormApprover() {
      const status = (this.formApprover.auditStatus || '').toString().trim()
      if (!status) {
        this.$modal.msgError('请选择审批状态')
        return
      }
      approverProcurementPlan(this.formApprover).then((response) => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },

    handleApprover(row) {
      this.formApprover.procurementPlanId = row.procurementPlanId
      this.openApprover = true
      this.title = '审批操作'
    },
    handleShip(row) {
      this.formShip.procurementPlanId = row.procurementPlanId
      this.openShip = true
      this.title = '发货操作'
    },

    submitFormAudit() {
      const status = (this.formAudit.auditStatus || '').toString().trim()
      if (!status) {
        this.$modal.msgError('请选择审核状态')
        return
      }
      auditProcurementPlan(this.formAudit).then((response) => {
        this.$modal.msgSuccess('审核操作成功')
        this.openAudit = false
        this.getList()
      })
    },
    submitShip() {
      this.$refs['formShip'].validate((valid) => {
        if (!valid) return
        shipProcurementPlan(this.formShip).then(() => {
          this.$modal.msgSuccess('发货操作成功')
          this.openShip = false
          this.getList()
        })
      })
    },
    handleArrive(row) {
      const id = row.procurementPlanId
      this.$modal
        .confirm('确认该采购计划已完成？')
        .then(() => arriveProcurementPlan({ procurementPlanId: id }))
        .then(() => { this.$modal.msgSuccess('已完成确认成功'); this.getList() })
        .catch(() => {})
    },
    handleAudit(row) {
      this.formAudit.procurementPlanId = row.procurementPlanId
      this.openAudit = true
      this.title = '审核窗口'
    },
    supplierLists() {
      listSupplier({ pageNum: 1, pageSize: 9999 }).then((response) => {
        this.supplierList = (response && response.rows) ? response.rows : []
      })
    },
    supplierListsApproved() {
      // 返回 Promise，便于外部在加载完成后执行初始化逻辑
      return listSupplier({ auditStatus: 2, pageNum: 1, pageSize: 9999 }).then((response) => {
        this.approvedSupplierList = (response && response.rows) ? response.rows : []
        return this.approvedSupplierList
      })
    },
    fetchSupplierSuggestions(query, cb) {
      const keyword = (query || '').trim()
      listSupplier({ supplierName: keyword, pageNum: 1, pageSize: 20 }).then((response) => {
        const rows = (response && response.rows) ? response.rows : []
        const suggestions = rows.map(s => ({ value: s.supplierName, supplierId: s.supplierId, supplierAddress: s.supplierAddress }))
        cb(suggestions)
      }).catch(() => { cb([]) })
    },
    onReceiveSupplierQuerySelect(item) {
      this.queryParams.receiveSupplierId = item && item.supplierId ? item.supplierId : null
      this.receiveSupplierQuery = item && item.value ? item.value : ''
    },
    onSupplierSuggestionSelect(item) {
      this.form.supplierId = item && item.supplierId ? item.supplierId : null
      this.supplierSearch = item && item.value ? item.value : ''
      if (this.form.supplierId != null) this.onSupplierChange(this.form.supplierId)
    },
    materialsClassifyLists() {
      request({
        url: '/materials/category/list',
        method: 'get',
        params: { pageNum: 1, pageSize: 9999 }
      })
        .then((resp) => { this.materialsClassifyList = (resp.rows || []).map(x => ({ categoryId: x.categoryId, code: x.code, name: x.name })) })
        .catch((err) => {
          this.$modal && this.$modal.msgError((err && err.message) || '配件分类加载失败')
          this.materialsClassifyList = []
        })
    },
    supplierName(id) {
      const s = this.supplierList.find((x) => x.supplierId === id)
      return s ? s.supplierName : ''
    },
    classifyName(id) {
      const f = this.materialsClassifyList.find((x) => x.categoryId === id)
      return f ? (f.code ? `${f.name}（${f.code}）` : f.name) : '分类未知'
    },
    classifyNameByMaterials(materialId) {
      // 若未选择配件或无效ID，兜底提示
      if (!materialId) return '未选择配件'
      const cid = this.materialsClassifyIdByMaterial[materialId]
      return cid ? this.classifyName(cid) : '分类未知'
    },
    materialName(id) {
      // 若未选择配件或映射不到主数据，兜底提示
      if (!id) return '未选择配件'
      return this.materialsDict[id] || '配件不存在'
    },
    loadAllMaterials() {
      // 加载所有“已启用”的配件主数据，失败时提示并兜底空字典
      this.materialsLoading = true
      listMaterials({ pageNum: 1, pageSize: 9999, status: 1 })
        .then((response) => {
          const rows = response.rows || []
          const dict = {}
          const mid2cid = {}
          const byId = {}
          rows.forEach((m) => {
            if (m && (m.itemId != null)) {
              const mid = m.itemId
              dict[mid] = m.accessoryName
              mid2cid[mid] = m.accessoryClassifyId
              byId[mid] = m
            }
          })
          this.materialsDict = dict
          this.materialsClassifyIdByMaterial = mid2cid
          this.materialsById = byId
        })
        .catch((err) => {
          this.$modal && this.$modal.msgError((err && err.message) || '配件列表加载失败')
          this.materialsDict = {}
          this.materialsClassifyIdByMaterial = {}
          this.materialsById = {}
        })
        .finally(() => { this.materialsLoading = false })
    },
    remoteSearchAccessories(query) {
      const keyword = (query || '').trim()
      this.materialsLoading = true
      listMaterials({
        pageNum: 1,
        pageSize: 9999,
        status: 1,
        accessoryName: keyword || undefined
      })
        .then((response) => {
          this.materialsOptions = response.rows || []
        })
        .catch((err) => {
          this.$modal && this.$modal.msgError((err && err.message) || '配件列表加载失败')
        })
        .finally(() => {
          this.materialsLoading = false
        })
    },

    // 新增：合并“物料名称-供应商”远程搜索（支持以“-”分隔的双关键字）
    remoteSearchCombined(query) {
      const kw = (query || '').trim()
      this.combinedLoading = true
      const suppliers = this.approvedSupplierList || []
      const supplierMap = {}
      suppliers.forEach(s => { supplierMap[s.supplierId] = s })

      const toLower = (s) => String(s || '').toLowerCase()
      const LIMIT = 200

      const params = kw
        ? { pageNum: 1, pageSize: LIMIT, status: 1, accessoryName: kw }
        : { pageNum: 1, pageSize: LIMIT, status: 1 }

      listMaterials(params)
        .then(res => {
          const materials = res.rows || []
          const options = []
          for (let i = 0; i < materials.length; i++) {
            const m = materials[i]
            const s = supplierMap[m.supplierId]
            const supplierName = s ? s.supplierName : '无供应商'
            const label = `${m.accessoryName}-${supplierName}`
            if (kw && !toLower(label).includes(toLower(kw))) continue
            options.push({ key: `${m.itemId}:${m.supplierId || ''}`, label, itemId: m.itemId, supplierId: m.supplierId })
          }
          this.combinedOptions = options
        })
        .catch(() => { this.combinedOptions = [] })
        .finally(() => { this.combinedLoading = false })
    },

    onAccessoryChange(itemId) {
      const selected = this.materialsById[itemId] || this.materialsOptions.find((item) => (item.itemId === itemId))
      if (selected) {
        this.form.procurementPlanPrice = selected.accessoryPrice
        this.form.unit = selected.unit
        this.form.accessoryClassifyId = selected.accessoryClassifyId
        return
      }
      getMaterials(itemId).then(resp => {
        const d = resp && resp.data ? resp.data : {}
        this.form.procurementPlanPrice = d.accessoryPrice || this.form.procurementPlanPrice
        this.form.unit = d.unit || this.form.unit
        this.form.accessoryClassifyId = d.accessoryClassifyId || this.form.accessoryClassifyId
      }).catch(() => {})
    },
    // 新增：合并选择框变更时，同步配件ID与供应商ID，并带出价格/单位与收货地址
    onCombinedChange(combinedKey) {
      if (!combinedKey) {
        this.form.lpMaterialId = null
        this.form.supplierId = null
        return
      }
      const [midStr, sidStr] = String(combinedKey).split(':')
      const mid = midStr ? Number(midStr) : null
      const sid = (sidStr !== undefined && sidStr !== '') ? Number(sidStr) : null
      this.form.lpMaterialId = mid
      this.form.supplierId = sid
      if (mid != null) this.onAccessoryChange(mid)
    },
    onReceiveSupplierSuggestionSelect(item) {
      this.form.receiveSupplierId = item && item.supplierId ? item.supplierId : null
      this.receiveSupplierSearch = item && item.value ? item.value : ''
      if (this.form.receiveSupplierId != null) this.onReceiveSupplierChange(this.form.receiveSupplierId)
    },
    onReceiveSupplierChange(supplierId) {
      const s = this.supplierList.find((x) => x.supplierId === supplierId)
      this.form.receiveAddress = s ? s.supplierAddress : ''
    },
    onSupplierChange(supplierId) {
      const s = this.supplierList.find((x) => x.supplierId === supplierId)
      this.form.receiveAddress = s ? s.supplierAddress : ''
    },

    /** 查询采购计划列表 */
    getList() {
      this.loading = true
      listProcurementPlan(this.queryParams).then((response) => {
        const rows = response.rows || []
        this.procurementPlanList = rows.map(r => ({ ...r, lpMaterialId: r.lpMaterialId }))
        this.total = response.total
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
        procurementPlanId: null,
        procurementPlanName: null,
        procurementPlanNum: null,
        procurementPlanPrice: null,
        unit: null,
        lpMaterialId: null,
        accessoryClassifyId: null,
        supplierId: null,
        receiveSupplierId: null,
        // 新增：合并选择值（格式：配件ID:供应商ID）
        combinedKey: null,
        receiveAddress: null,
        purchaseOrderNo: null,
        auditStatus: 0,
        auditOpinion: null,
        auditTime: null,
        auditPerson: null,
        approverOpinion: null,
        approverTime: null,
        approverPerson: null,
        remark: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      }
      this.supplierSearch = ''
      this.receiveSupplierSearch = ''
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
      this.queryParams.receiveSupplierId = null
      this.receiveSupplierQuery = ''
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.procurementPlanId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加采购计划'
      // 先加载已审核供应商，再初始化合并选择列表
      this.supplierListsApproved().then(() => {
        this.remoteSearchCombined('')
      })
      this.supplierLists()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const procurementPlanId = row.procurementPlanId || this.ids
      this.supplierListsApproved()
      getProcurementPlan(procurementPlanId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改采购计划'
        this.supplierLists()
        this.materialsClassifyLists()
        if (this.form.receiveSupplierId != null) this.onReceiveSupplierChange(this.form.receiveSupplierId)
        // 初始化合并选择列表，并填充当前合并值（等待已审核供应商加载完成）
        this.supplierListsApproved().then(() => {
          this.remoteSearchCombined('')
          if (this.form.lpMaterialId != null) {
            const sid = (this.form.supplierId !== undefined && this.form.supplierId !== null) ? this.form.supplierId : ''
            this.form.combinedKey = `${this.form.lpMaterialId}:${sid}`
          }
        })
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (!valid) return
        const f = this.form || {}
        if (!f.lpMaterialId) {
          this.$modal.msgError('请选择采购配件')
          return
        }
        if (!f.supplierId) {
          this.$modal.msgError('请选择采购配件-供应商')
          return
        }
        const proceed = () => {
          const payload = { ...this.form }
          if (payload.procurementPlanId != null) {
            updateProcurementPlan(payload).then(() => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addProcurementPlan(payload).then(() => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
        proceed()
      })
    },
    generatePurchaseOrderNo() {
      const now = new Date()
      const pad = n => String(n).padStart(2, '0')
      const y = now.getFullYear()
      const m = pad(now.getMonth() + 1)
      const d = pad(now.getDate())
      const h = pad(now.getHours())
      const min = pad(now.getMinutes())
      const s = pad(now.getSeconds())
      const ms = String(now.getMilliseconds()).padStart(3, '0')
      return `PO-${y}${m}${d}-${h}${min}${s}${ms}`
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const procurementPlanIds = row.procurementPlanId || this.ids
      this.$modal
        .confirm(
          '是否确认删除采购计划编号为"' + procurementPlanIds + '"的数据项？'
        )
        .then(function() {
          return delProcurementPlan(procurementPlanIds)
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
        'procurementPlan/procurementPlan/export',
        {
          ...this.queryParams
        },
        `procurementPlan_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>
