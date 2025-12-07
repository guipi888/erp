<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px">
      <el-form-item label="物料名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入物料名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input
          v-model="queryParams.price"
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
      <el-form-item label="物料分类" prop="classId">
        <el-cascader
          v-model="queryParams.classId"
          :options="materialsClassifyTree"
          :props="cascaderProps"
          clearable
          placeholder="请选择物料分类"
          @change="handleQuery"
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
          v-hasPermi="['materials:item:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['materials:item:edit']"
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <!-- 导出功能暂不支持 lp_item，移除导出按钮 -->
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="itemList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" fixed="left" />
      <el-table-column label="编码" align="center">
        <template slot-scope="scope">
          <div class="copy-text" @click="copy(scope.row.code)">{{ scope.row.code }}</div>
        </template>
      </el-table-column>
      <el-table-column label="物料名称" align="center" prop="name" />
      <el-table-column label="价格" align="center" prop="price" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="物料分类" align="center">
        <template slot-scope="scope">
          <span>{{ displayClassName(scope.row.classId) }}</span>
        </template>
      </el-table-column>
      <!-- 新增列：供应商（位置在物料分类后） -->
      <el-table-column label="供应商" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.supplierName || displaySupplierName(scope.row.supplierId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.status === 1 ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-hasPermi="['materials:item:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button v-if="scope.row.status !== 1" v-hasPermi="['materials:item:edit']" size="mini" type="text" icon="el-icon-circle-check" @click="handleEnable(scope.row)">启用</el-button>
          <el-button v-if="scope.row.status === 1" v-hasPermi="['materials:item:edit']" size="mini" type="text" icon="el-icon-close" @click="handleDisable(scope.row)">禁用</el-button>
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

    <!-- 添加或修改物料对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入物料名称" />
        </el-form-item>
        <el-form-item label="物料分类" prop="classId">
          <el-cascader
            v-model="form.classId"
            :options="materialsClassifyTree"
            :props="cascaderProps"
            clearable
            placeholder="请选择物料分类"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="form.supplierId" filterable placeholder="请选择供应商">
            <el-option v-for="s in supplierOptions" :key="s.supplierId" :label="s.supplierName" :value="s.supplierId" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
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
import { listItems, getItem, addItem, updateItem, changeItemStatus } from '@/api/items/items'
import { listSupplier } from '@/api/supplier/supplier'
import request from '@/utils/request'

export default {
  name: 'Materials',
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
      // 统一物料列表数据
      itemList: [],
      materialsClassifyList: [],
      materialsClassifyTree: [],
      cascaderProps: { value: 'categoryId', label: 'name', children: 'children', emitPath: false, checkStrictly: true },
      supplierOptions: [],
      // 批量落库执行状态标记，避免重复触发
      batchPersisting: false,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        price: null,
        unit: null,
        classId: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  created() {
    this.materialsClassifyLists()
    // 加载供应商，用于列表显示供应商名称
    this.supplierLists()
    this.getList()
  },
  methods: {
    materialsClassifyLists() {
      const params = {
        pageNum: 1,
        pageSize: 9999
      }
      request({ url: '/materials/category/list', method: 'get', params })
        .then(resp => {
          const rows = (resp.rows || []).map(x => ({ categoryId: x.categoryId, parentId: x.parentId, level: x.level, code: x.code, name: x.name }))
          this.materialsClassifyList = rows
          const level1 = rows.filter(r => Number(r.level) === 1)
          const level2 = rows.filter(r => Number(r.level) === 2)
          const tree = level1.map(l1 => ({ categoryId: l1.categoryId, name: l1.name, code: l1.code, children: level2.filter(l2 => l2.parentId === l1.categoryId).map(l2 => ({ categoryId: l2.categoryId, name: l2.name, code: l2.code })) }))
          this.materialsClassifyTree = tree
        })
        .catch(err => { this.$modal && this.$modal.msgError((err && err.message) || '分类加载失败') })
    },
    supplierLists() {
      listSupplier({ pageNum: 1, pageSize: 9999 })
        .then((response) => {
          const rows = response.rows || []
          this.supplierOptions = rows
        })
        .catch(err => { this.$modal && this.$modal.msgError((err && err.message) || '供应商列表加载失败') })
    },
    // classesproductLists removed
    currentClassifyList() { return this.materialsClassifyList },
    itemKey(item) { return item.categoryId },
    itemLabel(item) { return item.code ? `${item.name}（${item.code}）` : item.name },
    displayClassName(id) {
      const all = this.materialsClassifyList
      const cur = all.find(x => x.categoryId === id)
      if (!cur) return ''
      const l2 = cur
      const l1 = all.find(x => x.categoryId === l2.parentId)
      const segs = []
      if (l1 && l1.name) segs.push(l1.name)
      if (l2 && l2.name) segs.push(l2.name)
      return segs.join(' / ')
    },
    // 显示供应商名称
    displaySupplierName(id) {
      const s = this.supplierOptions.find(x => x.supplierId === id)
      return s ? s.supplierName : ''
    },
    // handleTypeChange removed

    getList() {
      this.loading = true
      const q = { pageNum: this.queryParams.pageNum, pageSize: this.queryParams.pageSize, name: this.queryParams.name, unit: this.queryParams.unit, categoryId: this.queryParams.classId }
      listItems(q)
        .then(response => {
          // 映射后端数据为前端行对象
          let rows = (response.rows || []).map(r =>
            ({ id: r.itemId, code: r.itemCode, name: r.itemName, price: r.price, unit: r.unit, classId: r.categoryId, supplierId: r.supplierId, supplierName: r.supplierName, remark: r.remark, status: r.status, createBy: r.createBy, createTime: r.createTime })
          )
          const priced = rows.filter(x => Number(x.price) > 0)
          const overallAvg = priced.length ? priced.reduce((sum, x) => sum + Number(x.price), 0) / priced.length : null
          const classSum = {}
          const classCount = {}
          priced.forEach(p => {
            const cid = p.classId
            classSum[cid] = (classSum[cid] || 0) + Number(p.price)
            classCount[cid] = (classCount[cid] || 0) + 1
          })
          const classAvg = {}
          Object.keys(classSum).forEach(cid => { classAvg[cid] = classSum[cid] / classCount[cid] })
          // 记录原始无效价格的物料ID集合，供自动落库使用
          const invalidIdSet = new Set()
          rows = rows.map(r => {
            const num = Number(r.price)
            if (!isFinite(num) || num <= 0) {
              const ca = classAvg[r.classId]
              const fallback = overallAvg != null ? overallAvg : 0
              const filled = (ca != null ? ca : fallback)
              // 标记该行需要执行批量落库（原价无效）
              invalidIdSet.add(r.id)
              return Object.assign({}, r, { price: Number(filled.toFixed(2)) })
            }
            return r
          })
          this.itemList = rows
          this.total = response.total || rows.length
          // 自动执行：对原价无效的物料，按“分类均价优先，其次全局均价”补齐并落库
          const toPersist = rows.filter(r => invalidIdSet.has(r.id)).map(r => ({
            id: r.id,
            name: r.name,
            unit: r.unit,
            price: r.price,
            classId: r.classId,
            remark: r.remark
          })).filter(r => isFinite(Number(r.price)) && Number(r.price) > 0)
          if (toPersist.length && !this.batchPersisting) {
            this.batchPersisting = true
            // 异步触发，避免阻塞列表渲染
            this.$nextTick(() => {
              this.autoPersistMissingPrices(toPersist)
            })
          }
        })
        .catch(err => { this.$modal && this.$modal.msgError((err && err.msg) || (err && err.message) || '物料列表加载失败') })
        .finally(() => { this.loading = false })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        name: null,
        price: null,
        unit: null,
        classId: null,
        supplierId: null,
        remark: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.materialsClassifyLists()
      this.supplierLists()
      this.open = true
      this.title = '添加物料'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      this.supplierLists()
      getItem(id).then(response => {
        const d = response.data || {}
        this.form = { id: d.itemId, name: d.itemName, price: d.price, unit: d.unit, classId: d.categoryId, supplierId: d.supplierId, remark: d.remark }
        this.open = true
        this.title = '修改物料'
      })
    },

    copy(text) {
      const s = String(text || '')
      if (!s) return
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s).then(() => { this.$message.success('已复制') }).catch(() => { this.$message.error('复制失败') })
      } else {
        const input = document.createElement('input')
        input.setAttribute('value', s)
        document.body.appendChild(input)
        input.select()
        try { document.execCommand('copy'); this.$message.success('已复制') } catch (e) { this.$message.error('复制失败') }
        document.body.removeChild(input)
      }
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        // 价格为空或无效（≤0），按你的需求：以空价格落库
        const n = Number(this.form.price)
        const invalid = !isFinite(n) || n <= 0
        if (invalid) {
          this.form.price = null
        }
        const payload = { itemId: this.form.id, itemName: this.form.name, unit: this.form.unit, price: this.form.price, categoryId: this.form.classId, supplierId: this.form.supplierId, remark: this.form.remark }
        if (payload.itemId) {
          updateItem(payload).then(() => { this.$modal.msgSuccess('修改成功'); this.open = false; this.getList() })
        } else {
          addItem(Object.assign({ status: 1 }, payload)).then(() => { this.$modal.msgSuccess('新增成功'); this.open = false; this.getList() })
        }
      })
    },
    // 自动批量落库：将无效价格的物料按均价规则补齐并写入后端
    async autoPersistMissingPrices(items) {
      // 顺序执行以降低并发压力
      for (const it of items) {
        const payload = { itemId: it.id, itemName: it.name, unit: it.unit, price: it.price, categoryId: it.classId, remark: it.remark }
        try {
          await updateItem(payload)
        } catch (e) {
          // 单条失败不影响其他条目
        }
      }
      this.batchPersisting = false
      // 执行完成后刷新一次，确保列表展示最新价格
      this.getList()
    },
    handleEnable(row) {
      const id = row.id
      changeItemStatus({ itemId: id, status: 1 }).then(() => { this.$modal.msgSuccess('已启用'); this.getList() })
    },
    handleDisable(row) {
      const id = row.id
      changeItemStatus({ itemId: id, status: 0 }).then(() => { this.$modal.msgSuccess('已禁用'); this.getList() })
    },

    /** 导出按钮操作 */
    handleExport() {
      // lp_item 暂无导出接口
      this.$modal.msgWarning('当前物料列表暂不支持导出')
    }
  }
}
</script>

<style scoped>
.copy-text {
  cursor: pointer;
}
.copy-text:hover {
  color: #409EFF;
}
</style>
