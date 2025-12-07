<template>
  <div class="app-container">
    <el-descriptions
      class="margin-top"
      title="供应商详情"
      direction="vertical"
      :column="4"
      border
    >
      <el-descriptions-item label="供应商编码">{{
        supplier.supplierCode
      }}</el-descriptions-item>
      <el-descriptions-item label="编码">{{
        supplier && supplier.classify && supplier.classify.classifyCode ? supplier.classify.classifyCode : ('SC' + String(supplier.classifyId || 0).padStart(2, '0'))
      }}</el-descriptions-item>
      <el-descriptions-item label="供应商名称">{{
        supplier.supplierName
      }}</el-descriptions-item>
      <el-descriptions-item label="供应商联系人">{{
        supplier.contact
      }}</el-descriptions-item>
      <el-descriptions-item label="供应商地址" :span="2">{{
        supplier.supplierAddress
      }}</el-descriptions-item>
      <el-descriptions-item label="备注">
        <el-tag size="small">学校</el-tag>
      </el-descriptions-item>
      <el-descriptions-item
        label="联系地址"
      >江苏省苏州市吴中区吴中大道 1188 号</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getSupplier } from '../../../api/supplier/supplier'
export default {
  name: 'Data',
  data() {
    return {
      supplier: {}
    }
  },
  created() {
    const supplierId = this.$route.params && this.$route.params.supplierId
    this.getData(supplierId)
  },
  methods: {
    getData(supplierId) {
      getSupplier(supplierId).then((response) => {
        // console.log("游客数据",response)
        this.supplier = response.data
      })
    }
  }
}
</script>

<style scoped>
</style>
