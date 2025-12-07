<template>
  <div class="app-container">
    <el-descriptions
      class="margin-top"
      title="设备保养详情"
      direction="vertical"
      :column="4"
      border
    >
      <el-descriptions-item label="保养名称">{{
        upkeep.upkeepName
      }}</el-descriptions-item>

      <el-descriptions-item label="设备描述">{{
        upkeep.description
      }}</el-descriptions-item>

      <el-descriptions-item label="设备周期">{{
        upkeep.upkeepPeriod
      }}</el-descriptions-item>

      <el-descriptions-item label="设备价格">{{
        upkeep.upkeepPrice
      }}</el-descriptions-item>

      <el-descriptions-item
        label="注意事项"
      ><el-tag size="small">注意</el-tag>
        {{ upkeep.announcements }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { upkeepLists } from '../../../api/upkeep/upkeep'

export default {
  name: 'Data',

  data() {
    return {
      upkeep: {}
    }
  },
  created() {
    const upkeepId = this.$route.params && this.$route.params.upkeepId
    this.upkeepList(upkeepId)
  },

  methods: {
    upkeepList(upkeepId) {
      upkeepLists(upkeepId).then((response) => {
        // console.log("游客数据",response)
        this.upkeep = response.data
      })
    },
    goTarget(href) {
      window.open(href, '_blank')
    },

    close() {
      this.show = false
      this.$emit('close')
    },
    error(e) {
      console.log(e)
      if (this.videoUrl == '') {
        this.isError = true
        this.errMsg = '该文章暂无视频！'
      } else {
        this.isError = true
        this.errMsg = '视频链接失效！无法播放！'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  mmm {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    line-height: 28px;
    //border:1px solid #000;
    b {
      font-weight: 700;
    }
  }
  #ssss {
    text-indent: 2em;
  }
  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>

