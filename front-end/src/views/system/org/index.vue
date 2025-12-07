<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true">
      <el-form-item label="组织名称" prop="orgName">
        <el-input v-model="queryParams.orgName" placeholder="请输入组织名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="组织状态" clearable>
          <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button v-hasPermi="['system:org:add']" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="orgList" row-key="orgId">
      <el-table-column prop="orgName" label="组织名称" width="220" />
      <el-table-column prop="leader" label="负责人" width="160" />
      <el-table-column prop="phone" label="联系电话" width="160" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-hasPermi="['system:org:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-if="scope.row.parentId != 0" v-hasPermi="['system:org:remove']" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <!-- 平面化：移除上级组织选择，所有组织默认一级 -->
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="组织名称" prop="orgName">
              <el-input v-model="form.orgName" placeholder="请输入组织名称" />
            </el-form-item>
          </el-col>

        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组织状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listOrg, addOrg, updateOrg, delOrg } from '@/api/system/org'

export default {
  name: 'Org',
  dicts: ['sys_normal_disable'],
  components: { },
  data() {
    return {
      loading: true,
      showSearch: true,
      orgList: [],
      title: '',
      open: false,

      queryParams: { orgName: undefined, status: undefined },
      form: {},
      rules: {
        orgName: [{ required: true, message: '组织名称不能为空', trigger: 'blur' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
      }
    }
  },
  created() { this.getList() },
  methods: {
    getList() {
      this.loading = true
      listOrg()
        .then(res => {
          this.orgList = res.rows || res.data || []
        })
        .catch(err => {
          this.orgList = []
          const msg = (err && err.message) ? err.message : '组织数据加载失败'
          this.$modal && this.$modal.msgError && this.$modal.msgError(msg)
        })
        .finally(() => { this.loading = false })
    },
    cancel() { this.open = false; this.reset() },
    reset() {
      this.form = { orgId: undefined, parentId: undefined, orgName: undefined, orderNum: 0, leader: undefined, phone: undefined, email: undefined, status: '0' }
      this.resetForm('form')
    },
    handleQuery() { this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    handleAdd(row) {
      this.reset()
      this.form.parentId = 0
      this.open = true
      this.title = '添加组织'
    },
    handleUpdate(row) {
      this.reset()
      this.form = Object.assign({}, row)
      this.open = true
      this.title = '修改组织'
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.parentId === undefined || this.form.parentId === null) { this.form.parentId = 0 }
          const req = this.form.orgId ? updateOrg(this.form) : addOrg(this.form)
          req.then(() => { this.$modal.msgSuccess(this.form.orgId ? '修改成功' : '新增成功'); this.open = false; this.getList() })
        }
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除名称为"' + row.orgName + '"的数据项？').then(() => delOrg(row.orgId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {})
    }

  }
}
</script>
