<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryForm" :model="queryParams" size="small" :inline="true" label-width="68px">
      <el-form-item label="出库名称" prop="warehouseDeliveryName">
        <el-input v-model="queryParams.warehouseDeliveryName" placeholder="请输入出库名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="出库数量" prop="warehouseDeliveryNum">
        <el-input v-model="queryParams.warehouseDeliveryNum" placeholder="请输入出库数量" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="单位" prop="unit">
        <el-input v-model="queryParams.unit" placeholder="请输入单位" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="2">
        <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:add']" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:edit']" type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:remove']" type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="2">
        <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:export']" type="warning" plain icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar :show-search.sync="showSearch" @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="warehouseDeliveryList" :default-sort="defaultSort" @sort-change="handleSortChange" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="出库名称" align="center" prop="warehouseDeliveryName" />
      <el-table-column label="出库数量" align="center" prop="warehouseDeliveryNum" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="创建时间" align="center" prop="createTime" sortable="custom">
        <template slot-scope="scope">
          <div>
            <div>{{ splitDateTime(scope.row.createTime).date }}</div>
            <div>{{ splitDateTime(scope.row.createTime).time }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:edit']" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['warehouseDelivery:warehouseDelivery:remove']" size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="960px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="选择库存" prop="inventoryId">
          <el-select v-model="form.inventoryId" placeholder="请选择库存" @change="handleInventoryChange" filterable style="width: 100%">
            <el-option
              v-for="item in inventoryList"
              :key="item.inventoryId"
              :label="item.inventoryName"
              :value="item.inventoryId"
            >
              <span style="float: left">{{ item.inventoryName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">余:{{ item.inventoryNum }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出库名称" prop="warehouseDeliveryName">
          <el-input v-model="form.warehouseDeliveryName" placeholder="请输入出库名称" readonly />
        </el-form-item>
        <el-form-item label="出库数量" prop="warehouseDeliveryNum">
          <el-input-number v-model="form.warehouseDeliveryNum" :min="1" :step="1" controls-position="right" placeholder="请输入出库数量" />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="form.unit" placeholder="请输入单位" />
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
import { listWarehouseDelivery, getWarehouseDelivery, addWarehouseDelivery, updateWarehouseDelivery, delWarehouseDelivery } from '@/api/warehouseDelivery/warehouseDelivery'
import { listInventory } from '@/api/inventory/inventory'
import { parseTime } from '@/utils/huaan'

export default {
  name: 'WarehouseDelivery',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      warehouseDeliveryList: [],
      inventoryList: [],
      defaultSort: { prop: 'createTime', order: 'descending' },
      title: '',
      open: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        warehouseDeliveryName: null,
        warehouseDeliveryNum: null,
        unit: null,
        orderByColumn: undefined,
        isAsc: undefined
      },
      form: {},
      rules: {}
    }
  },
  created() {
    this.queryParams.orderByColumn = 'createTime'
    this.queryParams.isAsc = 'descending'
    this.getList()
    this.getInventoryList()
  },
  methods: {
    getInventoryList() {
      listInventory({ pageNum: 1, pageSize: 1000 }).then(response => {
        this.inventoryList = response.rows
      })
    },
    handleInventoryChange(val) {
      const item = this.inventoryList.find(i => i.inventoryId === val)
      if (item) {
        this.form.warehouseDeliveryName = item.inventoryName
        this.form.unit = item.inventoryUnit
      }
    },
    splitDateTime(v) {
      const s = parseTime(v)
      if (!s) return { date: '-', time: '' }
      const parts = String(s).split(' ')
      return { date: parts[0] || s, time: parts[1] || '' }
    },
    handleSortChange(column) {
      this.queryParams.orderByColumn = column.prop
      this.queryParams.isAsc = column.order
      this.getList()
    },
    getList() {
      this.loading = true
      listWarehouseDelivery(this.queryParams).then((response) => {
        this.warehouseDeliveryList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    cancel() { this.open = false; this.reset() },
    reset() {
      this.form = { warehouseDeliveryId: null, warehouseDeliveryName: null, warehouseDeliveryNum: null, unit: null, remark: null }
      this.resetForm('form')
    },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    handleSelectionChange(selection) { this.ids = selection.map(i => i.warehouseDeliveryId); this.single = selection.length !== 1; this.multiple = !selection.length },
    handleAdd() { this.reset(); this.open = true; this.title = '新增供应商出库' },
    handleUpdate(row) { this.reset(); const id = row.warehouseDeliveryId || this.ids; getWarehouseDelivery(id).then(r => { this.form = r.data; this.open = true; this.title = '修改供应商出库' }) },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (!valid) return
        const api = this.form.warehouseDeliveryId != null ? updateWarehouseDelivery : addWarehouseDelivery
        api(this.form).then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() })
      })
    },
    handleDelete(row) {
      const ids = row.warehouseDeliveryId || this.ids
      this.$modal.confirm('是否确认删除编号为"' + ids + '"的数据项？').then(function() { return delWarehouseDelivery(ids) }).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {})
    },
    handleExport() { this.download('warehouseDelivery/warehouseDelivery/export', { ...this.queryParams }, `warehouseDelivery_${new Date().getTime()}.xlsx`) }
  }
}
</script>
