<template>
  <div class="app-container">
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="设备名称" prop="equipmentName">
        <el-input
          v-model="queryParams.equipmentName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备价格" prop="price">
        <el-input
          v-model="queryParams.price"
          placeholder="请输入设备价格"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="保养周期" prop="maintain">
        <el-input
          v-model="queryParams.maintain"
          placeholder="请输入保养周期"
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
          v-hasPermi="['equipment:equipment:add']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          v-hasPermi="['equipment:equipment:edit']"
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
          v-hasPermi="['equipment:equipment:remove']"
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
          v-hasPermi="['equipment:equipment:export']"
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
      :data="equipmentList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备名称" align="center" prop="equipmentName" />
      <el-table-column label="设备数量" align="center" prop="nums" />
      <el-table-column label="排序" align="center" prop="sort" />
      <!--      <el-table-column label="设备分类ID" align="center" prop="classificationId" />-->
      <el-table-column label="设备价格(元)" align="center" prop="price" />
      <!--      <el-table-column label="供应商ID" align="center" prop="supplierId" />-->
      <el-table-column label="注意事项" align="center" prop="matter" />
      <el-table-column label="保养周期" align="center" prop="maintain" />
      <el-table-column label="设备描述" align="center" prop="description" />
      <el-table-column label="设备状态" align="center" prop="equipmentStatus">
        <template slot-scope="scope">
          <span v-if="scope.row.equipmentStatus === 0">
            <el-tag type="success">正常</el-tag>
          </span>
          <span v-if="scope.row.equipmentStatus === 1">
            <el-tag type="primary">保养</el-tag>
          </span>
          <span v-if="scope.row.equipmentStatus === 2">
            <el-tag type="danger">维修</el-tag>
          </span>
          <span v-if="scope.row.equipmentStatus === 3">
            <el-tag type="danger">损坏</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus">
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
      <el-table-column
        label="设备分类名称"
        align="center"
        prop="classification.classificationName"
      />
      <el-table-column
        label="供应商"
        align="center"
        prop="supplier.supplierName"
      />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.auditStatus === 1">
            <el-button
              v-hasPermi="['equipment:equipment:approver']"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="approverEquipment(scope.row)"
            >审批</el-button>
          </span>
          <span v-if="scope.row.auditStatus === 0">
            <el-button
              v-hasPermi="['equipment:equipment:audit']"
              size="mini"
              type="text"
              icon="el-icon-circle-check"
              @click="auditEquipment(scope.row)"
            >审核</el-button>
          </span>

          <span v-if="scope.row.equipmentStatus === 1">
            <el-button
              v-hasPermi="['equipment:equipment:maintain']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="maintainEquipment(scope.row)"
            >正常</el-button>
            <el-button
              v-hasPermi="['equipment:equipment:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >维修</el-button>
            <el-button
              v-hasPermi="['equipment:equipment:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >损坏</el-button>
          </span>
          <span v-if="scope.row.equipmentStatus === 0">
            <el-button
              v-hasPermi="['equipment:equipment:maintain']"
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="maintainEquipment(scope.row)"
            >保养</el-button>
            <el-button
              v-hasPermi="['equipment:equipment:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >维修</el-button>
            <el-button
              v-hasPermi="['equipment:equipment:remove']"
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >损坏</el-button>
          </span>
          <el-button
            v-hasPermi="['equipment:equipment:edit']"
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            v-hasPermi="['equipment:equipment:remove']"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
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

    <!-- 添加或修改设备列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="设备名称" prop="equipmentName">
          <el-input v-model="form.equipmentName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备数量" prop="nums">
          <el-input v-model="form.nums" placeholder="请输入设备数量" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="设备分类" prop="classificationId">
          <el-select
            v-model="form.classificationId"
            placeholder="请选择设备分类"
          >
            <el-option
              v-for="item in classificationList"
              :key="item.classificationName"
              :label="item.classificationName"
              :value="item.classificationId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入设备价格" />
        </el-form-item>

        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="form.supplierId" placeholder="请选择供应商">
            <el-option
              v-for="item in supplierList"
              :key="item.supplierName"
              :label="item.supplierName"
              :value="item.supplierId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="注意事项" prop="matter">
          <el-input
            v-model="form.matter"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="保养周期" prop="maintain">
          <el-input v-model="form.maintain" placeholder="请输入保养周期" />
        </el-form-item>
        <el-form-item label="设备描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入设备描述" />
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
  listEquipment,
  getEquipment,
  delEquipment,
  addEquipment,
  updateEquipment,
  maintainEquipment,
  auditEquipment,
  approverEquipment
} from '../../../api/equipment/equipment'
import { approverList } from '../../..//api/supplier/supplier'
import { listClassification } from '../../../api/classification/classification'

export default {
  name: 'Equipment',
  data() {
    return {
      openApprover: false, // 审批窗口
      formApprover: {
        equipmentId: 0
      },
      openAudit: false, // 审核窗口
      formAudit: {
        equipmentId: 0
      },
      classificationList: [], // 设备分类

      supplierList: [], // 供应商

      maintains: {
        equipmentId: 0,
        equipmentStatus: 1
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
      // 设备列表表格数据
      equipmentList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        equipmentName: null,
        nums: null,
        sort: null,
        classificationId: null,
        price: null,
        supplierId: null,
        matter: null,
        maintain: null,
        description: null,
        equipmentStatus: null,
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
    submitFormApprover() {
      approverEquipment(this.formApprover).then((response) => {
        this.$modal.msgSuccess('审批操作成功')
        this.openApprover = false
        this.getList()
      })
    },

    // 审批窗口
    approverEquipment(row) {
      this.formApprover.equipmentId = row.equipmentId
      this.openApprover = true
      this.title = '审批窗口'
    },

    // 审核提交数据
    submitFormAudit() {
      auditEquipment(this.formAudit).then((response) => {
        this.$modal.msgSuccess('审核成功')
        this.openAudit = false
        this.getList()
      })
    },
    // 审核打开窗体
    auditEquipment(row) {
      this.formAudit.equipmentId = row.equipmentId
      this.openAudit = true
      this.title = '审核窗口'
    },

    // 查询设备分类
    classificationLists() {
      listClassification(null).then((response) => {
        this.classificationList = response.rows
      })
    },
    // 审批后供应商查询
    listSupplier() {
      approverList().then((response) => {
        this.supplierList = response.rows
      })
    },

    maintainEquipment(row) {
      this.maintains.equipmentId = row.equipmentId
      maintainEquipment(this.maintains).then((response) => {
        this.$modal.msgSuccess('保养操作成功！')
        this.getList()
      })
    },

    /** 查询设备列表列表 */
    getList() {
      this.loading = true
      listEquipment(this.queryParams).then((response) => {
        this.equipmentList = response.rows
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
        equipmentId: null,
        equipmentName: null,
        nums: null,
        sort: null,
        classificationId: null,
        price: null,
        supplierId: null,
        matter: null,
        maintain: null,
        description: null,
        equipmentStatus: 0,
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
      this.ids = selection.map((item) => item.equipmentId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加设备列表'
      this.classificationLists()
      this.listSupplier()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const equipmentId = row.equipmentId || this.ids
      getEquipment(equipmentId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改设备列表'
        this.classificationLists()
        this.listSupplier()
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.equipmentId != null) {
            updateEquipment(this.form).then((response) => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addEquipment(this.form).then((response) => {
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
      const equipmentIds = row.equipmentId || this.ids
      this.$modal
        .confirm('是否确认删除设备列表编号为"' + equipmentIds + '"的数据项？')
        .then(function() {
          return delEquipment(equipmentIds)
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
        'equipment/equipment/export',
        {
          ...this.queryParams
        },
        `equipment_${new Date().getTime()}.xlsx`
      )
    }
  }
}
</script>
