<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px">
      <el-form-item label="关键字">
        <el-input v-model="queryParams.keyword" placeholder="按名称筛选" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button
          v-hasPermi="['materials:category:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['materials:category:edit']"
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
          v-hasPermi="['materials:category:remove']"
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
          v-hasPermi="['materials:category:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="categoryTree" row-key="id" :tree-props="{ children: 'children' }" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编码" align="center" prop="code" />
      <el-table-column label="分类名称" align="center" prop="name" />
      <el-table-column label="层级" align="center" prop="level" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <template v-if="scope.row.level !== 1">
            <el-button
              v-hasPermi="['materials:category:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['materials:category:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
          </template>
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

    <!-- 添加或修改物料分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-cascader :options="cascaderOptions" v-model="form.parentPath" :props="{ value: 'id', label: 'name', checkStrictly: true }" placeholder="选择上级分类" />
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
import request from '@/utils/request'

export default {
  name: 'ItemCategory',
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
      // 物料分类树
      categoryTree: [],
      cascaderOptions: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: { keyword: '', pageNum: 1, pageSize: 9999 },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    normalizeCategories(rows) {
      const list = Array.isArray(rows) ? rows : []
      return list.map(x => ({ id: x.categoryId, name: x.name, level: x.level, remark: x.remark, parentId: x.parentId, code: x.code, sort: x.sort }))
    },
    buildTreeFromRows(rows) {
      const all = this.normalizeCategories(rows)
      const tops = all.filter(x => x.level === 1)
      const childrenMap = {}
      tops.forEach(t => { childrenMap[t.id] = [] })
      all.filter(x => x.level === 2).forEach(x => { if (childrenMap[x.parentId]) childrenMap[x.parentId].push(x) })
      return tops.map(t => ({ ...t, children: childrenMap[t.id] || [] }))
    },
    filterByKeyword(nodes, keyword) {
      const filterNode = n => !keyword || (n.name && n.name.includes(keyword))
      return nodes.map(t => ({ ...t, children: (t.children || []).filter(filterNode) }))
        .filter(t => filterNode(t) || (t.children && t.children.length))
    },
    async getList() {
      this.loading = true
      try {
        const resp = await request({ url: '/materials/category/list', method: 'get', params: this.queryParams })
        const tops = this.buildTreeFromRows(resp.rows)
        const keyword = (this.queryParams.keyword || '').trim()
        this.categoryTree = this.filterByKeyword(tops, keyword)
        this.cascaderOptions = tops
        this.total = Array.isArray(resp.rows) ? resp.rows.length : 0
      } catch (err) {
        this.$modal && this.$modal.msgError((err && err.message) || '分类加载失败')
      } finally {
        this.loading = false
      }
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = { id: null, name: null, parentId: null, parentPath: [], remark: null }
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
      const nonTop = selection.filter(item => item.level !== 1)
      this.ids = nonTop.map(item => item.id)
      this.single = nonTop.length !== 1
      this.multiple = !nonTop.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '新增物料分类'
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      if (row.level === 1) {
        this.$modal.msgWarning('顶级分类由系统维护')
        return
      }
      this.form = { id: row.id, name: row.name, remark: row.remark, parentId: row.parentId }
      this.open = true
      this.title = '修改物料分类'
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        const parentTop = Array.isArray(this.form.parentPath) && this.form.parentPath.length ? this.form.parentPath[0] : null
        if (!parentTop) { this.$modal.msgWarning('请选择上级分类'); return }
        const payload = { categoryId: this.form.id, parentId: parentTop, level: 2, name: this.form.name, remark: this.form.remark }
        const method = payload.categoryId ? 'put' : 'post'
        request({ url: '/materials/category', method, data: payload })
          .then(() => { this.$modal.msgSuccess(payload.categoryId ? '修改成功' : '新增成功'); this.open = false; this.getList() })
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      if (row.level === 1) { this.$modal.msgWarning('顶级分类不可删除'); return }
      const id = row.id || this.ids[0]
      const confirmText = '是否确认删除分类编号为"' + id + '"的数据项？'
      this.$modal.confirm(confirmText)
        .then(() => {
          return request({ url: '/materials/category/' + id, method: 'delete' })
        })
        .then(() => { this.getList(); this.$modal.msgSuccess('删除成功') })
        .catch(err => { if (err) this.$modal && this.$modal.msgError((err && err.message) || '删除失败') })
    },
    /** 导出按钮操作 */
    handleExport() {
      this.$modal.msgWarning('统一分类导出待后端统一接口提供')
    }
  }
}
</script>
