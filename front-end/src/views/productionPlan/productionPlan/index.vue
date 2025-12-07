<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true">
      <el-form-item label="计划名称" prop="planName">
        <el-input v-model="queryParams.planName" placeholder="请输入计划名称" clearable />
      </el-form-item>
      <el-form-item label="流程" prop="processId">
        <el-select v-model="queryParams.processId" placeholder="选择流程" clearable>
          <el-option v-for="p in processListOptions" :key="p.processId" :label="p.processName" :value="p.processId" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button v-hasPermi="['production:plan:add']" type="primary" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['production:plan:edit']" type="success" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['production:plan:remove']" type="danger" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="2">
        <el-tooltip content="搜索" placement="top">
          <el-button class="item" icon="el-icon-search" size="mini" circle @click="handleQuery" />
        </el-tooltip>
      </el-col>
      <el-col :span="2">
        <el-tooltip content="刷新" placement="top">
          <el-button class="item" icon="el-icon-refresh" size="mini" circle @click="getList" />
        </el-tooltip>
      </el-col>
    </el-row>

    <el-table ref="planTable" v-loading="loading" :data="planList" :default-sort="defaultSort" @selection-change="handleSelectionChange" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="生产单号" align="center" prop="workOrderNo" />
      <el-table-column label="计划名称" align="center" prop="planName" />

      <el-table-column label="计划开始" align="center" prop="plannedStartTime">
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.plannedStartTime).date }}</div>
            <div>{{ splitDateTime(scope.row.plannedStartTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="计划结束" align="center" prop="plannedEndTime">
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.plannedEndTime).date }}</div>
            <div>{{ splitDateTime(scope.row.plannedEndTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="生产数量" align="center" prop="productionNum" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <span v-if="scope.row.status === 0"><el-tag type="info">未开始</el-tag></span>
          <span v-else-if="scope.row.status === 1"><el-tag type="warning">生产中</el-tag></span>
          <span v-else-if="scope.row.status === 2"><el-tag type="primary">待入库</el-tag></span>
          <span v-else><el-tag type="success">已完成</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.createTime).date }}</div>
            <div>{{ splitDateTime(scope.row.createTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="步骤进度" align="center">
        <template slot-scope="scope">
          <div class="step-cell">
            <el-steps class="vertical-steps" :active="stepsIndex(scope.row)" direction="vertical" finish-status="success" process-status="process">
              <el-step v-for="(s,i) in stepsArray(scope.row)" :key="i" :title="s" />
            </el-steps>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status !== 2 && scope.row.status !== 3" v-hasPermi="['production:plan:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-if="scope.row.status !== 2 && scope.row.status !== 3" v-hasPermi="['production:plan:remove']" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
          <el-button v-if="scope.row.status === 2" v-hasPermi="['production:plan:edit']" size="mini" type="text" icon="el-icon-download" @click="handleInbound(scope.row)">入库</el-button>
          <el-button v-if="scope.row.status === 0 || scope.row.status === 1" v-hasPermi="['production:plan:edit']" size="mini" type="text" :icon="actionIcon(scope.row)" @click="handleNext(scope.row)">{{ actionLabel(scope.row) }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="选择流程" prop="processId">
          <el-select v-model="form.processId" placeholder="请选择生产流程">
            <el-option v-for="p in processListOptions" :key="p.processId" :label="p.processName" :value="p.processId" />
          </el-select>
        </el-form-item>
        <el-form-item label="生产数量" prop="productionNum">
          <el-input-number v-model="form.productionNum" :min="1" :step="1" controls-position="right" placeholder="请输入生产数量" />
        </el-form-item>
        <el-form-item label="计划时间" prop="dateRange">
          <el-date-picker v-model="form.dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="yyyy-MM-dd HH:mm:ss" />
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

    <!-- 生产入库备注弹窗 -->
    <el-dialog :title="'生产入库'" :visible.sync="inboundDialogVisible" width="500px" append-to-body>
      <!-- 备注输入，要求与供应商库存列表的生产入库备注一致 -->
      <el-form label-width="100px">
        <el-form-item label="备注">
          <el-input
            v-model="inboundRemark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入生产入库备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" icon="el-icon-check" @click="confirmInbound">确 定</el-button>
        <el-button icon="el-icon-close" @click="cancelInbound">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProductionPlan, addProductionPlan, updateProductionPlan, delProductionPlan, nextProductionPlan } from '@/api/productionPlan/productionPlan'
import { listInventory, addInventory, updateInventory } from '@/api/inventory/inventory'
import { listProductionProcess } from '@/api/productionProcess/productionProcess'
import { parseTime } from '@/utils/huaan'

export default {
  name: 'ProductionPlan',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      planList: [],
      title: '',
      open: false,
      processListOptions: [],
      // finishedProductOptions removed
      // finishedProductLoading removed
      defaultSort: { prop: 'createTime', order: 'descending' },
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        planName: null,
        processId: null,
        orderByColumn: 'createTime',
        isAsc: 'descending'
      },
      form: {},
      // 入库弹窗状态与数据
      inboundDialogVisible: false, // 是否显示生产入库备注弹窗
      inboundRemark: '', // 生产入库备注内容
      inboundRow: null, // 当前入库的生产计划行数据
      rules: {
        planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        // finishedProductId removed
        processId: [{ required: true, message: '流程不能为空', trigger: 'change' }],
        productionNum: [
          { required: true, message: '生产数量不能为空', trigger: 'change' },
          { validator: (rule, value, callback) => { const n = Number(value); if (!Number.isFinite(n) || n <= 0) { callback(new Error('生产数量必须大于0')) } else { callback() } }, trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchOptions()
    this.getList()
  },
  methods: {
    splitDateTime(v) {
      const s = parseTime(v)
      if (!s) return { date: '-', time: '' }
      const parts = String(s).split(' ')
      return { date: parts[0] || s, time: parts[1] || '' }
    },
    // remoteSearchFinishedProduct removed
    fetchOptions() {
      listProductionProcess({ pageNum: 1, pageSize: 999 }).then(res => { this.processListOptions = res.rows || [] })
      // listFinishedproduct removed
    },
    getList() {
      this.loading = true
      listProductionPlan(this.queryParams).then(res => {
        this.planList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    handleSortChange(column) { this.queryParams.orderByColumn = column.prop; this.queryParams.isAsc = column.order; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.queryParams.pageNum = 1; if (this.$refs.planTable) { this.$refs.planTable.sort(this.defaultSort.prop, this.defaultSort.order) } else { this.handleQuery() } },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.planId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() { this.reset(); this.fetchOptions(); this.open = true; this.title = '新增生产计划' },
    handleUpdate(row) { this.reset(); const copy = Object.assign({}, row || {}); if (copy.plannedStartTime && copy.plannedEndTime) { copy.dateRange = [copy.plannedStartTime, copy.plannedEndTime] } this.form = copy; this.open = true; this.title = '修改生产计划' },
    handleDelete(row) { const planIds = row.planId ? [row.planId] : this.ids; this.$modal.confirm('是否确认删除选中的数据项？').then(() => delProductionPlan(planIds)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }) },
    handleNext(row) { nextProductionPlan(row.planId).then(() => { this.$modal.msgSuccess('已进入下一步'); this.getList() }) },
    // 点击“入库”时，先弹出备注输入框
    handleInbound(row) {
      if (!row || !row.planId) return
      const num = Number(row.productionNum || 0)
      if (!Number.isFinite(num) || num <= 0) { this.$modal.msgError('生产数量无效'); return }
      // 记录当前行并打开弹窗，备注输入后再执行入库
      this.inboundRow = Object.assign({}, row)
      this.inboundRemark = ''
      this.inboundDialogVisible = true
    },
    // 备注弹窗“确定”执行实际入库逻辑
    confirmInbound() {
      const row = this.inboundRow
      if (!row || !row.planId) { this.inboundDialogVisible = false; return }
      const num = Number(row.productionNum || 0)
      if (!Number.isFinite(num) || num <= 0) { this.$modal.msgError('生产数量无效'); return }
      const remarkText = this.inboundRemark && this.inboundRemark.trim() ? this.inboundRemark.trim() : '生产入库'
      const applyInbound = (name, unit) => {
        const invName = name || ('成品-' + (row.planName || row.workOrderNo || row.planId))
        const invUnit = unit || '件'
        const buildBase = (overrideUnit) => {
          const payload = { inventoryName: invName, inventoryUnit: overrideUnit != null ? overrideUnit : invUnit, remark: remarkText }
          // finishedProductId removed
          return payload
        }
        // findByFinishedId removed
        const findByName = () => {
          return listInventory({ inventoryName: invName, pageNum: 1, pageSize: 1 }).then(r => (r.rows || [])[0] || null)
        }
        
        findByName().then(exists => {
          const current = exists || null
          const basePayload = current ? buildBase(current.inventoryUnit) : buildBase(null)
          const op = current
            ? updateInventory(Object.assign({}, basePayload, { inventoryId: current.inventoryId, inventoryNum: (Number(current.inventoryNum || 0) + num) }))
            : addInventory(Object.assign({}, basePayload, { inventoryNum: num }))
          return op.then(() => {
            return updateProductionPlan({ planId: row.planId, status: 3 })
          }).then(() => {
            this.$modal.msgSuccess('入库成功，生产单已完成')
            this.inboundDialogVisible = false
            this.inboundRow = null
            this.inboundRemark = ''
            this.getList()
          })
        })
      }
      // getFinishedproduct logic removed
      applyInbound(row.planName, null)
    },
    // 备注弹窗“取消”
    cancelInbound() {
      this.inboundDialogVisible = false
      this.inboundRow = null
      this.inboundRemark = ''
    },
    // finishedName removed
    cancel() { this.open = false; this.reset() },
    reset() { this.form = { planId: null, planName: null, processId: null, productionNum: 0, dateRange: null, status: 0, remark: null }; this.resetForm('form') },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        const payload = Object.assign({}, this.form)
        if (Array.isArray(payload.dateRange) && payload.dateRange.length === 2) {
          payload.plannedStartTime = payload.dateRange[0]
          payload.plannedEndTime = payload.dateRange[1]
        }
        delete payload.dateRange
        if (payload.status == null) payload.status = 0
        const api = this.form.planId ? updateProductionPlan : addProductionPlan
        api(payload).then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() })
      })
    },
    computeFlow(row) {
      if (row && row.processFlowString) return row.processFlowString
      const opt = this.processListOptions.find(x => x.processId === row.processId)
      if (!opt || !opt.processSteps) return ''
      try {
        const arr = JSON.parse(opt.processSteps)
        if (Array.isArray(arr)) return arr.join('-')
      } catch (e) { void 0 }
      return ''
    },
    stepsArray(row) {
      if (!row) return []
      if (row.processFlowString) {
        return String(row.processFlowString).split('-').map(s => s.trim()).filter(Boolean)
      }
      const opt = this.processListOptions.find(x => x.processId === row.processId)
      if (opt && opt.processSteps) {
        try {
          const arr = JSON.parse(opt.processSteps)
          if (Array.isArray(arr)) return arr.filter(x => x)
        } catch (e) { void 0 }
      }
      return []
    },
    stepsIndex(row) {
      const steps = this.stepsArray(row)
      const total = steps.length
      if (!total) return 0
      if (row.status === 2 || row.status === 3) return Math.max(total - 1, 0)
      let idx = typeof row.currentStepIndex === 'number' ? row.currentStepIndex : 0
      if (idx < 0) idx = 0
      if (idx >= total) idx = Math.max(total - 1, 0)
      return idx
    },
    computeCurrentStep(row) {
      if (!row) return ''
      if (row.status === 0 || row.status === 2 || row.status === 3) return '-'
      let steps = []
      if (row.processFlowString) {
        steps = String(row.processFlowString).split('-').map(s => s.trim()).filter(Boolean)
      } else {
        const opt = this.processListOptions.find(x => x.processId === row.processId)
        if (opt && opt.processSteps) {
          try {
            const arr = JSON.parse(opt.processSteps)
            if (Array.isArray(arr)) steps = arr.filter(x => x)
          } catch (e) { void 0 }
        }
      }
      const total = steps.length
      if (!total) return ''
      let idx = typeof row.currentStepIndex === 'number' ? row.currentStepIndex : 0
      if (idx < 0) idx = 0
      if (idx >= total) return '-'
      const name = steps[idx] || ''
      return name ? `${name} (${idx + 1}/${total})` : `${idx + 1}/${total}`
    },
    stepsCount(row) {
      if (!row) return 0
      if (row.processFlowString) {
        return String(row.processFlowString).split('-').map(s => s.trim()).filter(Boolean).length
      }
      const opt = this.processListOptions.find(x => x.processId === row.processId)
      if (opt && opt.processSteps) {
        try {
          const arr = JSON.parse(opt.processSteps)
          if (Array.isArray(arr)) return arr.filter(x => x).length
        } catch (e) { void 0 }
      }
      return 0
    },
    actionLabel(row) {
      const total = this.stepsCount(row)
      if (row.status === 0) return total > 0 ? '开始生产' : '完成生产'
      if (row.status === 1) {
        const lastIdx = Math.max(total - 1, 0)
        return (row.currentStepIndex >= lastIdx) ? '完成生产' : '完成步骤'
      }
      return ''
    },
    actionIcon(row) {
      const label = this.actionLabel(row)
      if (label === '开始生产') return 'el-icon-video-play'
      return 'el-icon-check'
    }
  }
}
</script>

<style scoped>
.step-cell { min-width: 220px; max-width: 100%; margin: 0 auto; }
.vertical-steps { font-size: 14px; }
.vertical-steps .el-step__title { font-size: 14px; }
.vertical-steps .el-step__icon { width: 14px; height: 14px; }
.vertical-steps .el-step__head { padding-right: 4px; }
</style>
