<template>
  <div class="app-container">
    <el-descriptions class="margin-top" title="生产计划详情" direction="vertical" :column="4" border>
      <el-descriptions-item label="生产单号">{{ plan.workOrderNo }}</el-descriptions-item>
      <el-descriptions-item label="计划名称">{{ plan.planName }}</el-descriptions-item>
      <el-descriptions-item label="成品名称">{{ finishedProductName || '未选择成品' }}</el-descriptions-item>
      <el-descriptions-item label="生产数量">{{ plan.productionNum }}</el-descriptions-item>
      <el-descriptions-item label="计划开始" :span="2">{{ parseTime(plan.plannedStartTime) }}</el-descriptions-item>
      <el-descriptions-item label="计划结束" :span="2">{{ parseTime(plan.plannedEndTime) }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag size="small">{{ statusLabel(plan.status) }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getProductionPlan } from '@/api/productionPlan/productionPlan'
export default {
  name: 'ProductionPlanData',
  data() {
    return {
      plan: {},
      finishedProductName: ''
    }
  },
  created() {
    const planId = this.$route.params && this.$route.params.planId
    this.load(planId)
  },
  methods: {
    parseTime(time) {
      if (!time) return ''
      try {
        const d = new Date(time)
        const pad = n => String(n).padStart(2, '0')
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      } catch (e) {
        return String(time)
      }
    },
    statusLabel(s) {
      if (s === 0) return '未开始'
      if (s === 1) return '生产中'
      if (s === 2) return '待入库'
      if (s === 3) return '已完成'
      return '未知'
    },
    load(id) {
      getProductionPlan(id).then(res => {
        this.plan = res.data || {}
        // Finished product logic removed
      })
    },
    loadFinished(id) {
       // Logic removed
    }
  }
}
</script>

<style scoped>
</style>
