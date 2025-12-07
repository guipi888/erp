<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px">
      <el-form-item label="库存名称" prop="warehouseWarrantName">
        <el-input
          v-model="queryParams.warehouseWarrantName"
          placeholder="请输入库存名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="入库价格" prop="warehouseWarrantPrice">
        <el-input
          v-model="queryParams.warehouseWarrantPrice"
          placeholder="请输入入库价格"
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
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button
          v-hasPermi="['warehouseWarrant:warehouseWarrant:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['warehouseWarrant:warehouseWarrant:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="warehouseWarrantList" :default-sort="defaultSort" @sort-change="handleSortChange" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="批次号" align="center" prop="batchNo">
        <template slot-scope="scope">
          <span>{{ computeBatchNo(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存名称" align="center" prop="warehouseWarrantName" />
      <el-table-column label="入库数量" align="center" prop="warehouseWarrantNum" />
      <el-table-column label="入库价格" align="center" prop="warehouseWarrantPrice" />
      <el-table-column label="单位" align="center" prop="unit" />

      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="入库时间" align="center" prop="createTime" sortable="custom">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作人" align="center">
        <template slot-scope="scope">
          <span>{{ userNick(scope.row) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!--    审批窗口-->

    <!-- 添加或修改入库列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body destroy-on-close>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="库存名称" prop="warehouseWarrantName">
          <el-input v-model="form.warehouseWarrantName" placeholder="请输入库存名称" />
        </el-form-item>
        <el-form-item label="入库数量" prop="warehouseWarrantNum">
          <el-input v-model="form.warehouseWarrantNum" placeholder="请输入入库数量" />
        </el-form-item>
        <el-form-item label="入库价格" prop="warehouseWarrantPrice">
          <el-input v-model="form.warehouseWarrantPrice" placeholder="请输入入库价格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>

        <el-form-item label="运输单号">
          <el-autocomplete
            v-model="shippingQuery"
            placeholder="输入运输单号或采购单号搜索运输中订单"
            :fetch-suggestions="fetchShippingSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            prefix-icon="el-icon-tickets"
            @select="onShippingSelect"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listWarehouseWarrant, addWarehouseWarrant, updateWarehouseWarrant } from '@/api/warehouseWarrant/warehouseWarrant'
import { parseTime as fmtTime } from '@/utils/huaan'
import { listUser, getUser } from '@/api/system/user'
import { listShipping } from '@/api/shipping/shipping'
import { listProcurementPlan } from '@/api/procurementPlan/procurementPlan'

export default {
  name: 'WarehouseWarrant',
  data() {
    return {

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
      // 入库列表表格数据
      warehouseWarrantList: [],
      // 默认按入库时间倒序
      defaultSort: { prop: 'createTime', order: 'descending' },
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseWarrantName: null,
        warehouseWarrantNum: null,
        warehouseWarrantPrice: null,
        unit: null,
        orderByColumn: undefined,
        isAsc: undefined
      },
      form: {},
      rules: {},
      userNickDict: {},
      shippingQuery: '',
      selectedShippingTrackingNo: '',
      selectedShippingPO: ''
    }
  },
  created() {
    this.queryParams.orderByColumn = 'createTime'
    this.queryParams.isAsc = 'descending'
    this.getList()
  },
  methods: {
    parseTime(v) { return fmtTime(v) },
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },

    /** 查询入库列表列表 */
    getList() {
      this.loading = true
      listWarehouseWarrant(this.queryParams).then(response => {
        this.warehouseWarrantList = response.rows
        this.total = response.total
        this.resolveUserNicknames(this.warehouseWarrantList)
        this.fillMissingBatchNos(this.warehouseWarrantList)
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
        warehouseWarrantId: null,
        warehouseWarrantName: null,
        warehouseWarrantNum: null,
        warehouseWarrantPrice: null,
        unit: null,
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
      this.ids = selection.map(item => item.warehouseWarrantId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加供应商入库列表'
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const bn = this.nextBatchNoForDate(this.formatYYMMDD(new Date()))
          this.form.batchNo = bn
          if (this.selectedShippingTrackingNo) {
            const tag = `SHIP#${this.selectedShippingTrackingNo}`
            const po = this.selectedShippingPO ? `PO#${this.selectedShippingPO}` : ''
            const base = this.form.remark || ''
            const parts = [tag, po, base].filter(Boolean)
            this.form.remark = parts.join(' | ')
          }
          addWarehouseWarrant(this.form).then(response => {
            this.$modal.msgSuccess('新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    /** 导出按钮操作 */
    formatYYMMDD(d) {
      const dt = new Date(d)
      const yy = String(dt.getFullYear()).slice(-2)
      const mm = String(dt.getMonth() + 1).padStart(2, '0')
      const dd = String(dt.getDate()).padStart(2, '0')
      return yy + mm + dd
    },
    parseDateKey(v) {
      const dt = new Date(v)
      if (Number.isNaN(dt.getTime())) return null
      return this.formatYYMMDD(dt)
    },
    nextBatchNoForDate(dateKey) {
      const seq = (this._batchSeqMap && this._batchSeqMap[dateKey]) ? (this._batchSeqMap[dateKey] + 1) : 1
      if (!this._batchSeqMap) this._batchSeqMap = {}
      this._batchSeqMap[dateKey] = seq
      return 'B' + dateKey + '-' + String(seq).padStart(2, '0')
    },
    fetchShippingSuggestions(query, cb) {
      const keyword = String(query || '').trim().toLowerCase()
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
    onShippingSelect(item) {
      this.shippingQuery = item && item.value ? item.value : ''
      this.selectedShippingTrackingNo = item && item.trackingNo ? item.trackingNo : ''
      this.selectedShippingPO = item && item.purchaseOrderNo ? item.purchaseOrderNo : ''
    },
    computeBatchNo(row, idx) {
      const dk = this.parseDateKey(row && row.createTime)
      if (!dk) return '-'
      // if row has existing batchNo, return it
      if (row.batchNo) return row.batchNo
      // generate based on map
      const seq = (this._batchSeqMap && this._batchSeqMap[dk]) ? (this._batchSeqMap[dk] + 1) : 1
      if (!this._batchSeqMap) this._batchSeqMap = {}
      this._batchSeqMap[dk] = seq
      return 'B' + dk + '-' + String(seq).padStart(2, '0')
    },
    fillMissingBatchNos(rows) {
      if (!Array.isArray(rows)) return
      // initialize map with existing batch numbers per date
      this._batchSeqMap = {}
      const pairs = rows.map(r => ({ r, dk: this.parseDateKey(r.createTime) }))
      // seed existing max seq per dateKey
      pairs.forEach(({ r, dk }) => {
        if (!dk) return
        const bn = r.batchNo
        if (bn && typeof bn === 'string') {
          const m = bn.match(/^B(\d{6})-(\d{2,})$/)
          if (m && m[1] === dk) {
            const s = Number(m[2])
            const cur = this._batchSeqMap[dk] || 0
            if (Number.isFinite(s) && s > cur) this._batchSeqMap[dk] = s
          }
        }
      })
      // persist missing
      pairs
        .filter(({ r }) => !r.batchNo)
        .forEach(({ r, dk }) => {
          if (!dk) return
          const bn = this.nextBatchNoForDate(dk)
          updateWarehouseWarrant({ warehouseWarrantId: r.warehouseWarrantId, batchNo: bn }).catch(() => {})
          r.batchNo = bn
        })
    },
    handleExport() {
      this.download('warehouseWarrant/warehouseWarrant/export', {
        ...this.queryParams
      }, `warehouseWarrant_${new Date().getTime()}.xlsx`)
    },
    userNick(row) {
      const v = row && row.createBy
      if (!v) return '-'
      const k = String(v)
      return this.userNickDict[k] || k
    },
    resolveUserNicknames(rows) {
      const vals = Array.from(new Set((rows || []).map(r => r.createBy).filter(v => v !== null && v !== undefined)))
      const numIds = vals.filter(v => /^\d+$/.test(String(v))).map(v => Number(v))
      const names = vals.filter(v => !/^\d+$/.test(String(v))).map(v => String(v))
      const tasks = []
      numIds.forEach(id => {
        tasks.push(getUser(id).then(res => {
          const d = res && res.data ? res.data : {}
          const nk = d.nickName || String(id)
          this.$set(this.userNickDict, String(id), nk)
        }).catch(() => { this.$set(this.userNickDict, String(id), String(id)) }))
      })
      names.forEach(un => {
        tasks.push(listUser({ userName: un, pageNum: 1, pageSize: 1 }).then(res => {
          const row = (res.rows || [])[0]
          const nk = row && row.nickName ? row.nickName : un
          this.$set(this.userNickDict, un, nk)
        }).catch(() => { this.$set(this.userNickDict, un, un) }))
      })
      Promise.all(tasks).catch(() => {})
    }
  }
}
</script>
