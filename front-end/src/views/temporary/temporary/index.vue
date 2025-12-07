<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="102px">
      <el-form-item label="临采单号" prop="temporaryOrderNo">
        <el-input
          v-model="queryParams.temporaryOrderNo"
          placeholder="请输入临采单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="临时采购名称" prop="temporaryName">
        <el-input
          v-model="queryParams.temporaryName"
          placeholder="请输入临时采购名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="临时采购数量" prop="temporaryNum">
        <el-input
          v-model="queryParams.temporaryNum"
          placeholder="请输入临时采购数量"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="临时采购价格" prop="temporaryPrice">
        <el-input
          v-model="queryParams.temporaryPrice"
          placeholder="请输入临时采购价格"
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
          v-hasPermi="['temporary:temporary:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['temporary:temporary:edit']"
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
          v-hasPermi="['temporary:temporary:remove']"
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
          v-hasPermi="['temporary:temporary:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="temporaryList" @selection-change="handleSelectionChange">
      <el-table-column label="临采单号" align="center" prop="temporaryOrderNo" />
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="临时采购名称" align="center" prop="temporaryName" />
      <el-table-column label="临时采购数量" align="center" prop="temporaryNum" />
      <el-table-column label="临时采购价格" align="center" prop="temporaryPrice" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="采购状态" align="center" prop="auditStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus ===0">
            <el-tag type="danger">未审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus ===1">
            <el-tag type="primary">审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus ===2">
            <el-tag type="success">审批</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="审核意见" align="center" prop="auditOpinion" />
      <el-table-column label="审核时间" align="center" prop="auditTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.auditTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人员" align="center" prop="auditPerson" />
      <el-table-column label="审批意见" align="center" prop="approverOpinion" />
      <el-table-column label="审批时间" align="center" prop="approverTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.approverTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人员" align="center" prop="approverPerson" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 1">
            <el-button
              v-hasPermi="['temporary:temporary:approver']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleApprover(scope.row)"
            >审批</el-button>
          </span>
          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['temporary:temporary:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['temporary:temporary:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>

            <el-button
              v-hasPermi="['temporary:temporary:audit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleAudit(scope.row)"
            >审核</el-button>
          </span>

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

    <!--     审批供应商对话框 -->
    <el-dialog :title="title" :visible.sync="openApprover" width="960px" append-to-body>
      <el-form ref="form" :model="formApprover" :rules="rules" label-width="180px">
        <el-form-item label="审批状态" prop="auditStatus">
          <el-radio-group v-model="formApprover.auditStatus">
            <el-radio label="1">不通过</el-radio>
            <el-radio label="2">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见" prop="approverOpinion">
          <el-input v-model="formApprover.approverOpinion" type="textarea" placeholder="请输入意见内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormApprover">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--    //审核窗口-->
    <el-dialog :title="title" :visible.sync="openAudit" width="960px" append-to-body>
      <el-form ref="form" :model="formAudit" :rules="rules" label-width="180px">
        <el-form-item label="审核状态" prop="auditStatus">
          <el-radio-group v-model="formAudit.auditStatus">
            <el-radio label="0">不通过</el-radio>
            <el-radio label="1">通过</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditOpinion">
          <el-input v-model="formAudit.auditOpinion" type="textarea" placeholder="请输入意见内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormAudit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改临时采购对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="临时采购名称" prop="temporaryName">
          <el-input v-model="form.temporaryName" placeholder="请输入临时采购名称" />
        </el-form-item>
        <el-form-item label="临时采购数量" prop="temporaryNum">
          <el-input v-model="form.temporaryNum" placeholder="请输入临时采购数量" />
        </el-form-item>
        <el-form-item label="临时采购价格" prop="temporaryPrice">
          <el-input v-model="form.temporaryPrice" placeholder="请输入临时采购价格" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item label="配件分类" prop="accessoryClassifyId">
          <el-autocomplete
            v-model="classifySearch"
            placeholder="输入分类名称搜索"
            :fetch-suggestions="fetchAccessoryClassifySuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onAccessoryClassifySelect"
          />
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-autocomplete
            v-model="supplierSearch"
            placeholder="输入供应商名称搜索"
            :fetch-suggestions="fetchSupplierSuggestions"
            :debounce="300"
            :trigger-on-focus="true"
            @select="onSupplierSelect"
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
import { listTemporary, getTemporary, delTemporary, addTemporary, updateTemporary, auditTemporary, approverTemporary } from '@/api/temporary/temporary'
import { listSupplier } from '@/api/supplier/supplier'
import { listMaterialsClassify } from '@/api/materialsClassify/materialsClassify'

export default {
  name: 'Temporary',
  data() {
    return {
      openApprover: false,
      formApprover: {
        temporaryId: 0
      },
      openAudit: false,
      formAudit: {
        temporaryId: 0
      },

      materialsClassifyList: [],
      supplierList: [],
      supplierSearch: '',
      classifySearch: '',
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
      // 临时采购表格数据
      temporaryList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        temporaryOrderNo: null,
        temporaryName: null,
        temporaryNum: null,
        temporaryPrice: null,
        unit: null,
        supplierId: null,
        accessoryClassifyId: null,
        auditStatus: null,
        auditOpinion: null,
        auditTime: null,
        auditPerson: null,
        approverOpinion: null,
        approverTime: null,
        approverPerson: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        temporaryName: [
          { required: true, message: '临时采购名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    submitFormApprover() {
      approverTemporary(this.formApprover).then(response => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },

    handleApprover(row) {
      this.formApprover.temporaryId = row.temporaryId
      this.openApprover = true
      this.title = '审批操作窗口'
    },

    submitFormAudit() {
      auditTemporary(this.formAudit).then(response => {
        this.$modal.msgSuccess('审核操作成功')
        this.openAudit = false
        this.getList()
      })
    },

    handleAudit(row) {
      this.formAudit.temporaryId = row.temporaryId
      this.openAudit = true
      this.title = '审核窗口'
    },

    supplierLists() {
      listSupplier(null).then(response => {
        this.supplierList = response.rows
      })
    },
    materialsClassifyLists() {
      listMaterialsClassify(null).then(response => {
        this.materialsClassifyList = response.rows
      })
    },
    fetchSupplierSuggestions(query, cb) {
      const keyword = (query || '').trim()
      listSupplier({ supplierName: keyword, pageNum: 1, pageSize: 20 }).then(response => {
        const rows = response.rows || []
        const suggestions = rows.map(s => ({ value: s.supplierName, supplierId: s.supplierId }))
        cb(suggestions)
      }).catch(() => { cb([]) })
    },
    onSupplierSelect(item) {
      this.form.supplierId = item && item.supplierId ? item.supplierId : null
      this.supplierSearch = item && item.value ? item.value : ''
    },
    fetchAccessoryClassifySuggestions(query, cb) {
      const keyword = (query || '').trim()
      listMaterialsClassify({ accessoryClassifyName: keyword, pageNum: 1, pageSize: 20 }).then(response => {
        const rows = response.rows || []
        const suggestions = rows.map(s => ({ value: s.accessoryClassifyName, accessoryClassifyId: s.accessoryClassifyId }))
        cb(suggestions)
      }).catch(() => { cb([]) })
    },
    onAccessoryClassifySelect(item) {
      this.form.accessoryClassifyId = item && item.accessoryClassifyId ? item.accessoryClassifyId : null
      this.classifySearch = item && item.value ? item.value : ''
    },

    /** 查询临时采购列表 */
    getList() {
      this.loading = true
      listTemporary(this.queryParams).then(response => {
        this.temporaryList = response.rows
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

        temporaryId: null,
        temporaryName: null,
        temporaryNum: null,
        temporaryPrice: null,
        unit: null,
        supplierId: null,
        accessoryClassifyId: null,
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
      this.classifySearch = ''
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
      this.ids = selection.map(item => item
        .lpTemporaryId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加临时采购'
      this.supplierLists()
      this.materialsClassifyLists()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const temporaryId = row.temporaryId || this.ids
      getTemporary(
        temporaryId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改临时采购'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.temporaryId != null) {
            updateTemporary(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addTemporary(this.form).then(response => {
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
      const
        temporaryIds = row
          .temporaryId || this.ids
      this.$modal.confirm('是否确认删除临时采购编号为"' +
        temporaryIds + '"的数据项？').then(function() {
        return delTemporary(
          temporaryIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('temporary/temporary/export', {
        ...this.queryParams
      }, `temporary_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
