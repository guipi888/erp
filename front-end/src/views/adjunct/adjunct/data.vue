<template>
  <div class="app-container">
    <el-descriptions
      class="margin-top"
      title="设备附件详情"
      direction="vertical"
      :column="4"
      border
    >
      <el-descriptions-item label=" 设备附件名称">{{
        adjunct.adjunctName
      }}</el-descriptions-item>
      <el-descriptions-item label="设备描述">{{
        adjunct.description
      }}</el-descriptions-item>
      <el-descriptions-item label="设备附件型号" :span="2">{{
        adjunct.modelType
      }}</el-descriptions-item>
      <el-descriptions-item label="附件设备价格" :span="2">{{
        adjunct.adjunctPrice
      }}</el-descriptions-item>
      <el-descriptions-item label="供应商ID" :span="2">{{
        adjunct.supplierId
      }}</el-descriptions-item>

      <el-descriptions-item label="设备ID">
        <el-tag size="small">设备ID</el-tag>
        {{ adjunct.equipmentId }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getAdjunct } from '../../../api/adjunct/adjunct'
export default {
  name: 'Data',
  data() {
    return {
      adjunct: {}
    }
  },
  created() {
    const adjunctId = this.$route.params && this.$route.params.adjunctId
    this.getData(adjunctId)
  },
  methods: {
    getData(adjunctId) {
      getAdjunct(adjunctId).then((response) => {
        // console.log("游客数据",response)
        this.adjunct = response.data
      })
    }
  }
}
</script>

<style scoped>
</style>
