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
      <el-form-item label="财务数据名称" prop="financeName">
        <el-input
          v-model="queryParams.financeName"
          placeholder="请输入财务数据名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发生金额" prop="financeMoney">
        <el-input
          v-model="queryParams.financeMoney"
          placeholder="请输入发生金额"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="余额" prop="financeBalance">
        <el-input
          v-model="queryParams.financeBalance"
          placeholder="请输入余额"
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
          v-hasPermi="['finance:finance:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['finance:finance:edit']"
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
          v-hasPermi="['finance:finance:remove']"
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
          v-hasPermi="['finance:finance:export']"
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
      :data="financeList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="财务数据名称" align="center" prop="financeName" />
      <el-table-column
        label="财务数据内容"
        align="center"
        prop="financeContent"
      />
      <el-table-column label="发生金额" align="center" prop="financeMoney" />
      <el-table-column label="余额" align="center" prop="financeBalance" />
      <el-table-column label="收入/支出" align="center" prop="financeStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.financeStatus === 0">
            <el-tag type="primary">支出</el-tag>
          </span>
          <span v-if="scope.row.financeStatus === 1">
            <el-tag type="success">收入</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="auditStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 0">
            <el-tag type="danger">未审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 1">
            <el-tag type="primary">审核</el-tag>
          </span>
          <span v-if="scope.row.auditStatus === 2">
            <el-tag type="success">审批</el-tag>
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
      <el-table-column label="审核人员" align="center" prop="auditPerson" />
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
      <el-table-column label="审批人员" align="center" prop="approverPerson" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建人" align="center" prop="createBy" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
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
              v-hasPermi="['finance:finance:approver']"
              size="mini"
              type="text"
              icon="el-icon-check"
              @click="handleApprover(scope.row)"
            >审批</el-button>
          </span>
          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['finance:finance:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['finance:finance:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-hasPermi="['finance:finance:audit']"
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

    <!-- 添加或修改财务数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="财务数据名称" prop="financeName">
          <el-input
            v-model="form.financeName"
            placeholder="请输入财务数据名称"
          />
        </el-form-item>
        <el-form-item label="财务数据内容">
          <editor v-model="form.financeContent" :min-height="192" />
        </el-form-item>
        <el-form-item label="发生金额" prop="financeMoney">
          <el-input v-model="form.financeMoney" placeholder="请输入发生金额" />
        </el-form-item>
        <el-form-item label="余额" prop="financeBalance">
          <el-input v-model="form.financeBalance" placeholder="请输入余额" />
        </el-form-item>

        <el-form-item label="选择客户" prop="clientId">
          <el-select v-model="form.clientId" placeholder="请选择客户">
            <el-option
              v-for="item in clientList"
              :key="item.clientName"
              :label="item.clientName"
              :value="item.clientId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择供应商" prop="supplierId">
          <el-select v-model="form.supplierId" placeholder="请选择供应商">
            <el-option
              v-for="item in supplierList"
              :key="item.supplierName"
              :label="item.supplierName"
              :value="item.supplierId"
            />
          </el-select>
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
  listFinance,
  getFinance,
  delFinance,
  addFinance,
  updateFinance,
  auditFinance,
  approverFinance
} from '../../../api/finance/finance'
import { listSupplier } from '../../../api/supplier/supplier'
import { listClient } from '../../../api/client/client'

export default {
  name: 'Finance',
  data() {
    return {
      clientList: [], // 客户
      supplierList: [], // 供应商
      openApprover: false,
      formApprover: {
        financeId: 0
      },
      openAudit: false,
      formAudit: {
        financeId: 0
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
      // 财务数据表格数据
      financeList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        financeName: null,
        financeContent: null,
        financeMoney: null,
        financeBalance: null,
        supplierId: null,
        clientId: null,
        financeStatus: null,
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
      rules: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 查询客户
    listClients() {
      this.loading = true
      listClient(null).then((response) => {
        this.clientList = response.rows
        // this.total = response.total;
        this.loading = false
      })
    },

    // 查询供应商商
    listSuppliers() {
      this.loading = true
      listSupplier(null).then((response) => {
        this.supplierList = response.rows
        // this.total = response.total;
        this.loading = false
      })
    },

    submitFormApprover() {
      approverFinance(this.formApprover).then((response) => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },

    // 审批窗口
    handleApprover(row) {
      this.formApprover.financeId = row.financeId
      this.openApprover = true
      this.title = '审批窗口'
    },

    // 审核提交数据
    submitFormAudit() {
      auditFinance(this.formAudit).then((response) => {
        this.$modal.msgSuccess('审核操作成功')
        this.openAudit = false
        this.getList()
      })
    },

    // 审核窗体
    handleAudit(row) {
      this.formAudit.financeId = row.financeId
      this.openAudit = true
      this.title = '审核窗口'
    },

    /** 查询财务数据列表 */
    getList() {
      this.loading = true
      listFinance(this.queryParams).then((response) => {
        this.financeList = response.rows
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
        financeId: null,
        financeName: null,
        financeContent: null,
        financeMoney: null,
        financeBalance: null,
        supplierId: null,
        financeStatus: 0,
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
      this.ids = selection.map((item) => item.financeId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加财务数据'
      this.listSuppliers()
      this.listClients()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const financeId = row.financeId || this.ids
      getFinance(financeId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改财务数据'
        this.listSuppliers()
        this.listClients()
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.financeId != null) {
            updateFinance(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addFinance(this.form).then((response) => {
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
      const financeIds = row.financeId || this.ids
      this.$modal
        .confirm('是否确认删除财务数据编号为"' + financeIds + '"的数据项？')
        .then(function() {
          return delFinance(financeIds)
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
        'finance/finance/export',
        {
          ...this.queryParams
        },
        `finance_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>
