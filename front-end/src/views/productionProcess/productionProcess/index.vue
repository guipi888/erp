<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true">
      <el-form-item label="流程名称" prop="processName">
        <el-input v-model="queryParams.processName" placeholder="请输入流程名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button v-hasPermi="['production:process:add']" type="primary" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['production:process:edit']" type="success" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <!-- 删除功能移除 -->
    </el-row>

    <el-table v-loading="loading" :data="processList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="流程名称" align="center" prop="processName" />
      <el-table-column label="流程步骤" align="center">
        <template slot-scope="scope">
          <span>{{ renderSteps(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-hasPermi="['production:process:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-if="scope.row.status !== 1" v-hasPermi="['production:process:edit']" size="mini" type="text" icon="el-icon-circle-check" @click="handleEnable(scope.row)">启用</el-button>
          <el-button v-if="scope.row.status === 1" v-hasPermi="['production:process:edit']" size="mini" type="text" icon="el-icon-close" @click="handleDisable(scope.row)">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="流程名称" prop="processName">
          <el-input v-model="form.processName" placeholder="请输入流程名称" />
        </el-form-item>
        <el-form-item label="流程步骤" prop="steps">
          <div>
            <el-input v-model="stepInput" placeholder="输入节点名称后回车或点击添加" style="width: 360px;" @keyup.enter.native="addStep" />
            <el-button type="primary" size="mini" style="margin-left:8px" @click="addStep">添加节点</el-button>
          </div>
          <!-- 拖拽排序，使用 vuedraggable 绑定 form.steps，实现所见即所得排序 -->
          <draggable v-model="form.steps" :options="{ animation: 150, ghostClass: 'drag-ghost' }" style="margin-top:10px">
            <div v-for="(s,i) in form.steps" :key="i" class="step-item">
              <i class="el-icon-rank drag-handle" title="拖拽排序" />
              <el-tag closable class="step-tag" @close="removeStep(i)">{{ s }}</el-tag>
            </div>
          </draggable>
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
import { listProductionProcess, addProductionProcess, updateProductionProcess } from '@/api/productionProcess/productionProcess'
import draggable from 'vuedraggable'

export default {
  name: 'ProductionProcess',
  components: { draggable },
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      processList: [],
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        processName: null
      },
      form: {},
      stepInput: '',
      rules: {
        processName: [{ required: true, message: '流程名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listProductionProcess(this.queryParams).then(res => {
        this.processList = res.rows
        this.total = res.total
        this.loading = false
      })
    },
    renderSteps(row) {
      if (!row || !row.processSteps) return ''
      try {
        const arr = JSON.parse(row.processSteps)
        if (Array.isArray(arr)) return arr.join(' - ')
      } catch (e) { void 0 }
      const txt = String(row.processSteps || '').trim()
      if (!txt) return ''
      return txt.split(/[\,\-\n]/).map(x => x.trim()).filter(Boolean).join(' - ')
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.processId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() { this.reset(); this.open = true; this.title = '新增生产流程' },
    handleUpdate(row) {
      this.reset()
      const copy = Object.assign({}, row || {})
      let arr = []
      if (copy.processSteps) {
        try { arr = JSON.parse(copy.processSteps) || [] } catch (e) { void 0 }
        if (!Array.isArray(arr) || !arr.length) {
          arr = String(copy.processSteps).split(/[,\-\n]/).map(x => x.trim()).filter(Boolean)
        }
      }
      copy.steps = arr
      this.form = copy
      this.open = true
      this.title = '修改生产流程'
    },
    handleEnable(row) { const id = row.processId; updateProductionProcess({ processId: id, status: 1 }).then(() => { this.$modal.msgSuccess('已启用'); this.getList() }) },
    handleDisable(row) { const id = row.processId; updateProductionProcess({ processId: id, status: 0 }).then(() => { this.$modal.msgSuccess('已禁用'); this.getList() }) },
    cancel() { this.open = false; this.reset() },
    reset() {
      this.form = { processId: null, processName: null, steps: [], remark: null }
      this.stepInput = ''
      this.resetForm('form')
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        const payload = Object.assign({ status: 1 }, this.form)
        if (Array.isArray(payload.steps)) {
          payload.processSteps = JSON.stringify(payload.steps)
        }
        delete payload.steps
        const api = this.form.processId ? updateProductionProcess : addProductionProcess
        api(payload).then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() })
      })
    },
    addStep() {
      const v = (this.stepInput || '').trim()
      if (!v) return
      if (!this.form.steps) this.form.steps = []
      this.form.steps.push(v)
      this.stepInput = ''
    },
    removeStep(i) {
      if (!Array.isArray(this.form.steps)) return
      this.form.steps.splice(i, 1)
    }
  }
}
</script>

<style scoped>
/* 拖拽排序样式与交互提示 */
.step-item { display: inline-flex; align-items: center; margin-right: 6px; margin-bottom: 6px; }
.drag-handle { cursor: move; color: #909399; margin-right: 4px; }
.step-tag { margin: 0; }
.drag-ghost { opacity: 0.6; }
</style>
