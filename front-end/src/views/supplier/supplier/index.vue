<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="118px"
    >
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input
          v-model="queryParams.supplierName"
          placeholder="请输入供应商名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="供应商联系人" prop="contact">
        <el-input
          v-model="queryParams.contact"
          placeholder="请输入供应商联系人"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="供应商联系电话" prop="supplierPhone">
        <el-input
          v-model="queryParams.supplierPhone"
          placeholder="请输入供应商联系电话"
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
          v-hasPermi="['supplier:supplier:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['supplier:supplier:edit']"
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
          v-hasPermi="['supplier:supplier:remove']"
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
          v-hasPermi="['supplier:supplier:export']"
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
      :data="supplierList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编码" align="center">
        <template slot-scope="scope">
          <span style="cursor: pointer" @click="copy(scope.row.supplierCode)">{{ scope.row.supplierCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="供应商名称" align="center" prop="supplierName">
        <template slot-scope="scope">
          <router-link
            :to="'/supplier-data/supplier/' + scope.row.supplierId"
            class="link-type"
          >
            <span> {{ scope.row.supplierName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="供应商联系人" align="center" prop="contact" />
      <el-table-column
        label="供应商地址"
        align="center"
        prop="supplierAddress"
      />
      <el-table-column
        label="供应商联系电话"
        align="center"
        prop="supplierPhone"
      />
      <el-table-column label="状态" align="center" prop="auditStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 0">
            <el-tag type="danger">未审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 1">
            <el-tag type="success">已审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 2">
            <el-tag type="primary">已审批</el-tag>
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
          <span>{{ parseTime(scope.row.auditTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="auditPerson" />
      <el-table-column label="审批意见" align="center" prop="approverOpinion" />
      <el-table-column
        label="审批时间"
        align="center"
        prop="approverTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.approverTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审批人" align="center" prop="approverPerson" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 1">
            <el-button
              v-hasPermi="['supplier:supplier:approver']"
              size="mini"
              type="text"
              icon="el-icon-check"
              @click="handleApprover(scope.row)"
            >审批</el-button>
          </span>

          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['supplier:supplier:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['supplier:supplier:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-hasPermi="['supplier:supplier:audit']"
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
    >
      <el-form
        ref="form"
        :model="formApprover"
        :rules="rules"
        label-width="180px"
      >
        <el-form-item label="审核状态" prop="auditStatus">
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

    <!-- 审核供应商对话框 -->
    <el-dialog
      :title="title"
      :visible.sync="openAudit"
      width="960px"
      append-to-body
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

    <!-- 添加或修改供应商对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="供应商分类" prop="classifyId">
          <el-select v-model="form.classifyId" placeholder="请选择分类类别">
            <el-option
              v-for="item in classifyList"
              :key="item.classifyName"
              :label="item.classifyName"
              :value="item.classifyId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="供应商名称" prop="supplierName">
          <el-input
            v-model="form.supplierName"
            placeholder="请输入供应商名称"
          />
        </el-form-item>
        <el-form-item label="供应商联系人" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入供应商联系人" />
        </el-form-item>
        <el-form-item label="供应商地址" prop="supplierAddress">
          <el-input
            v-model="form.supplierAddress"
            placeholder="请输入供应商地址"
          />
        </el-form-item>
        <el-form-item label="供应商联系电话" prop="supplierPhone">
          <el-input
            v-model="form.supplierPhone"
            placeholder="请输入供应商联系电话"
          />
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
  listSupplier,
  getSupplier,
  delSupplier,
  addSupplier,
  updateSupplier,
  auditSupplier,
  approverSupplier
} from '../../../api/supplier/supplier'
import { listClassify } from '../../../api/classify/classify'

export default {
  name: 'Supplier',
  data() {
    return {
      openApprover: false, // 审批
      formApprover: {
        supplierId: 0
      },

      formAudit: {
        supplierId: 0
      },
      openAudit: false, // 审核供应商窗体

      classifyList: [], // 定义供应商分类数组
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
      // 供应商表格数据
      supplierList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        supplierName: null,
        contact: null,
        classifyId: null,
        supplierAddress: null,
        supplierPhone: null,
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
        classifyId: [
          {
            required: true,
            message: '供应商分类不能为空！',
            trigger: 'change'
          }
        ],
        supplierName: [
          {
            required: true, // 必填项
            message: '供应商名称不能为空！', // 提示语
            trigger: 'blur'
          }
        ],

        contact: [
          {
            required: true, // 必填项
            message: '供应商联系人不能为空！', // 提示语
            trigger: 'blur'
          }
        ],
        supplierPhone: [
          {
            required: true, // 必填项
            message: '供应商电话不能为空！', // 提示语
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    submitFormApprover() {
      approverSupplier(this.formApprover).then((response) => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },
    handleApprover(row) {
      this.formApprover.supplierId = row.supplierId
      this.openApprover = true
      this.title = '审批窗口'
    },

    submitFormAudit() {
      auditSupplier(this.formAudit).then((response) => {
        this.$modal.msgSuccess('审核操作成功')
        this.openAudit = false
        this.getList()
      })
    },
    handleAudit(row) {
      this.formAudit.supplierId = row.supplierId
      this.openAudit = true
      this.title = '审核窗口'
    },

    // 处理供应商分类
    getClassifyList() {
      this.loading = true
      listClassify(null).then((response) => {
        this.classifyList = response.rows
        this.loading = false
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

    /** 查询供应商列表 */
    getList() {
      this.loading = true
      listSupplier(this.queryParams).then((response) => {
        this.supplierList = response.rows
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
        supplierId: null,
        supplierName: null,
        contact: null,
        classifyId: null,
        supplierAddress: null,
        supplierPhone: null,
        supplierSynopsis: null,
        auditStatus: 0,
        auditOpinion: null,
        auditTime: null,
        auditPerson: null,
        approverOpinion: null,
        approverTime: null,
        approverPerson: null,
        sort: null,
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
      this.ids = selection.map((item) => item.supplierId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加供应商'
      this.getClassifyList()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const supplierId = row.supplierId || this.ids
      this.getClassifyList()
      getSupplier(supplierId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改供应商'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.supplierId != null) {
            updateSupplier(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addSupplier(this.form).then((response) => {
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
      const supplierIds = row.supplierId || this.ids
      this.$modal
        .confirm('是否确认删除供应商编号为"' + supplierIds + '"的数据项？')
        .then(function() {
          return delSupplier(supplierIds)
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
        'supplier/supplier/export',
        {
          ...this.queryParams
        },
        `supplier_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>
