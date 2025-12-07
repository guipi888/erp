<template>
  <div class="app-container">
    <el-descriptions
      class="margin-top"
      title="采购计划详情"
      direction="vertical"
      :column="4"
      border
    >
      <el-descriptions-item label="采购单号">{{
        /* 兜底显示：历史数据可能未生成采购订单号 */
        procurementPlan.purchaseOrderNo || '未生成'
      }}</el-descriptions-item>
      <el-descriptions-item label="采购计划名称">{{
        procurementPlan.procurementPlanName
      }}</el-descriptions-item>
      <el-descriptions-item label="采购物料">{{ accessoryName || '未选择物料' }}</el-descriptions-item>
      <el-descriptions-item label="采购计划数量">{{
        procurementPlan.procurementPlanNum
      }}</el-descriptions-item>
      <el-descriptions-item label="采购计划价格" :span="2">{{
        procurementPlan.procurementPlanPrice
      }}</el-descriptions-item>

      <el-descriptions-item label="单位">
        <el-tag size="small">单位</el-tag>
        {{ procurementPlan.unit }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getProcurementPlan } from '../../../api/procurementPlan/procurementPlan'
import { getMaterials } from '../../../api/materials/materials'
export default {
  name: 'Data',
  data() {
    return {
      procurementPlan: {},
      accessoryName: ''
    }
  },
  created() {
    const procurementPlanId =
      this.$route.params && this.$route.params.procurementPlanId
    this.getData(procurementPlanId)
  },
  methods: {
    getData(procurementPlanId) {
      getProcurementPlan(procurementPlanId).then((response) => {
        this.procurementPlan = response.data
        this.loadAccessoryName()
      })
    },
    loadAccessoryName() {
      // 使用 lpMaterialId 以匹配后端字段
      const id = this.procurementPlan && this.procurementPlan.lpMaterialId
      if (!id) {
        this.accessoryName = ''
        return
      }
      getMaterials(id).then((res) => {
        const data = res && res.data ? res.data : {}
        this.accessoryName = data.accessoryName || ''
      })
    }
  }
}
</script>

<style scoped>
</style>
