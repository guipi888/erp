<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="98px">

      <el-form-item label="保养名称" prop="upkeepName">
        <el-input
          v-model="queryParams.upkeepName"
          placeholder="请输入保养名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="保养周期" prop="upkeepPeriod">
        <el-input
          v-model="queryParams.upkeepPeriod"
          placeholder="请输入保养周期"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保养价格" prop="upkeepPrice">
        <el-input
          v-model="queryParams.upkeepPrice"
          placeholder="请输入保养价格"
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
          v-hasPermi="['upkeep:upkeep:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['upkeep:upkeep:edit']"
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
          v-hasPermi="['upkeep:upkeep:remove']"
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
          v-hasPermi="['upkeep:upkeep:export']"
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="upkeepList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="保养名称" align="center" prop="upkeepName">
        <template slot-scope="scope">
          <router-link :to="'/upkeep-data/upkeep/'+ scope.row.upkeepId" class="link-type">
            <span> {{ scope.row.upkeepName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <!--      <el-table-column label="设备ID" align="center" prop="equipmentId" />
      <el-table-column label="设备附件ID" align="center" prop="adjunctId" />-->
      <el-table-column label="保养周期" align="center" prop="upkeepPeriod" />
      <el-table-column label="保养价格" align="center" prop="upkeepPrice" />
      <el-table-column label="审核状态" align="center" prop="auditStatus">
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
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">

          <span v-if="scope.row.auditStatus === 1">
            <el-button
              v-hasPermi="['upkeep:upkeep:approver']"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="handleApprover(scope.row)"
            >审批</el-button>
          </span>
          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['upkeep:upkeep:edit']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            >修改</el-button>
            <el-button
              v-hasPermi="['upkeep:upkeep:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >删除</el-button>
            <el-button
              v-hasPermi="['upkeep:upkeep:audit']"
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
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
    <!-- 审批供应商对话框 -->
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

    <!-- 添加或修改设备保养对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="选择设备">
          <el-select v-model="form.equipmentId" placeholder="请选择设备">
            <el-option
              v-for="item in equipmentList"
              :key="item.equipmentName"
              :label="item.equipmentName"
              :value="item.equipmentId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="选择设备附件">
          <el-select v-model="form.adjunctId" placeholder="选择设备附件">
            <el-option
              v-for="item in adjunctList"
              :key="item.adjunctName"
              :label="item.adjunctName"
              :value="item.adjunctId"
            />
          </el-select>
        </el-form-item>

        <!--        <el-form-item label="设备附件ID" prop="adjunctId">
          <el-input v-model="form.adjunctId" placeholder="请输入设备附件ID" />
        </el-form-item>-->
        <el-form-item label="保养名称" prop="upkeepName">
          <el-input v-model="form.upkeepName" placeholder="请输入保养名称" />
        </el-form-item>
        <el-form-item label="保养描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入保养描述" />
        </el-form-item>
        <el-form-item label="保养周期" prop="upkeepPeriod">
          <el-input v-model="form.upkeepPeriod" placeholder="请输入保养周期" />
        </el-form-item>
        <el-form-item label="注意事项" prop="announcements">
          <el-input v-model="form.announcements" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="保养内容">
          <editor v-model="form.upkeepContent" :min-height="192" />
        </el-form-item>
        <el-form-item label="保养价格" prop="upkeepPrice">
          <el-input v-model="form.upkeepPrice" placeholder="请输入保养价格" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
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
import { listUpkeep, getUpkeep, delUpkeep, addUpkeep, updateUpkeep, auditUpkeep, approverUpkeep } from '@/api/upkeep/upkeep'
import { listEquipment } from '../../../api/equipment/equipment'
import { listAdjunct } from '../../../api/adjunct/adjunct'

export default {
  name: 'Upkeep',
  data() {
    return {
      openApprover: false,
      formApprover: {
        upkeepId: 0
      },
      openAudit: false,
      formAudit: {
        upkeepId: 0
      },
      adjunctList: [],
      equipmentList: [],
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
      // 设备保养表格数据
      upkeepList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        equipmentId: null,
        adjunctId: null,
        upkeepName: null,
        description: null,
        upkeepPeriod: null,
        announcements: null,
        upkeepContent: null,
        upkeepPrice: null,
        auditStatus: null,
        auditOpinion: null,
        auditTime: null,
        auditPerson: null,
        approverOpinion: null,
        approverTime: null,
        approverPerson: null,
        sort: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        equipmentId: [
          { required: true, message: '设备ID不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    submitFormApprover() {
      approverUpkeep(this.formApprover).then(response => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },

    // 审批操作窗口
    handleApprover(row) {
      this.formApprover.upkeepId = row.upkeepId
      this.openApprover = true
      this.title = '审批窗口'
    },
    // 审核提交数据
    submitFormAudit() {
      auditUpkeep(this.formAudit).then(response => {
        this.$modal.msgSuccess('审核操作成功')
        this.openAudit = false
        this.getList()
      })
    },
    // 审核窗口
    handleAudit(row) {
      this.formAudit.upkeepId = row.upkeepId
      this.openAudit = true
      this.title = '审核窗口'
    },

    adjunctLists() {
      listAdjunct(null).then(response => {
        this.adjunctList = response.rows
        // this.total = response.total;
      })
    },

    listSelectEquipment() {
      listEquipment(null).then(response => {
        this.equipmentList = response.rows
        // this.total = response.total;
      })
    },

    /** 查询设备保养列表 */
    getList() {
      this.loading = true
      listUpkeep(this.queryParams).then(response => {
        this.upkeepList = response.rows
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
        upkeepId: null,
        equipmentId: null,
        adjunctId: null,
        upkeepName: null,
        description: null,
        upkeepPeriod: null,
        announcements: null,
        upkeepContent: null,
        upkeepPrice: null,
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
      this.ids = selection.map(item => item.upkeepId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加设备保养'
      this.listSelectEquipment()
      this.adjunctLists()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const upkeepId = row.upkeepId || this.ids
      getUpkeep(upkeepId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改设备保养'
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.upkeepId != null) {
            updateUpkeep(this.form).then(response => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addUpkeep(this.form).then(response => {
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
      const upkeepIds = row.upkeepId || this.ids
      this.$modal.confirm('是否确认删除设备保养编号为"' + upkeepIds + '"的数据项？').then(function() {
        return delUpkeep(upkeepIds)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('upkeep/upkeep/export', {
        ...this.queryParams
      }, `upkeep_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>
