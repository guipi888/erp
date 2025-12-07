<template>
  <el-row>
    <el-col :span="8" style="padding-right: 10px">
      <el-card class="box-card">
        <div class="user">
          <img src="../assets/logo/HA-SRM.jpg" alt="">
          <div class="userinfo">
            <p class="name">Admin</p>
            <p class="access">超级管理员</p>
          </div>
        </div>
        <div class="login-info">
          <p>上次登录时间: <span>2023.5.26</span></p>
          <p>上次登录名: <span>财务</span></p>
        </div>
      </el-card>
      <el-card style="margin-top: 20px; height: 460px">
        <el-table :data="financeList" style="width: 100%">
          <el-table-column type="index" label="序号" width="50" />
          <el-table-column prop="financeName" label="财务数据名称" />
          <el-table-column prop="financeMoney" label="发生金额" />
          <el-table-column prop="financeBalance" label="余额" />
          <el-table-column prop="financeStatus" label="收入/支出" />
        </el-table>
      </el-card>
    </el-col>
    <el-col :span="16" style="padding-left: 10px">
      <div ref="mychart" class="num">
        <el-card :body-style="{ display: 'flex', padding: 0 }" />
      </div>
      <el-card style="height: 280px">
        <div class="main1" style="height: 280px" />
      </el-card>
      <div class="graph">
        <el-card style="height: 260px">
          <div class="main2" style="height: 260px" />
        </el-card>
        <el-card style="height: 260px">
          <div class="main3" style="height: 260px" />
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import * as echarts from 'echarts'
import {
  listClassify,
  getClassify,
  delClassify,
  addClassify,
  updateClassify
} from '../api/classify/classify'
import {
  listFinance,
  getFinance,
  delFinance,
  addFinance,
  updateFinance,
  auditFinance,
  approverFinance
} from '@/api/finance/finance'
import { listSupplier } from '@/api/supplier/supplier'
import { listClient } from '@/api/client/client'
export default {
  name: 'OrederName',
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
      rules: {},

      axisData: ['Mon', 'Tue', 'Wed', 'Very Loooong Thu', 'Fri', 'Sat', 'Sun'],

      countData: [
        {
          value: 1234,
          icon: 'success',
          color: '#2ec7c9'
        },
        {
          value: 210,
          icon: 'star-on',
          color: '#ffb980'
        },
        {
          value: 1234,
          icon: 's-goods',
          color: '#5ab1ef'
        },
        {
          value: 1234,
          icon: 'success',
          color: '#2ec7c9'
        },
        {
          value: 210,
          icon: 'star-on',
          color: '#ffb980'
        },
        {
          value: 1234,
          icon: 's-goods',
          color: '#5ab1ef'
        }
      ],

      option: {
        title: {
          text: '发生金额柱状图'
        },

        xAxis: {
          data: []
        },
        yAxis: [
          {
            type: 'value',
            axisLine: {
              lineStyle: {
                color: '#17b3a3'
              }
            }
          }
        ],
        color: ['#2ec7c9', '#b6a2de'],

        series: [
          {
            name: '商品价格',
            type: 'bar',
            axisLine: {
              lineStyle: {
                color: '#17b3a3'
              }
            },
            data: []
          }
        ]
      },

      option2: {
        title: {
          text: '发生余额折线图'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['商品余额', '商品状态']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: []
        },
        yAxis: {
          type: 'value'
        },

        series: [
          {
            name: '商品编号',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: '商品状态',
            type: 'line',
            stack: 'Total',
            data: []
          }
        ]
      },

      // 饼状图
      option3: {
        title: {
          text: '发生金额饼状图',
          subtext: 'Fake Data',
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
    }
  },
  mounted() {
    var myChart2 = this.$echarts.init(document.querySelector('.main1'))
    myChart2.setOption(this.option2)
    this.myChart2 = myChart2

    var myChart = this.$echarts.init(document.querySelector('.main2'))
    myChart.setOption(this.option)
    this.myChart = myChart

    var myChart3 = this.$echarts.init(document.querySelector('.main3'))
    this.myChart3 = myChart3
    myChart3.setOption(this.option3)

    const mycharts2 = this.$echarts.init(this.$refs.mychart)
    const option = {
      title: {
        text: 'Stacked Line'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Email',
          type: 'line',
          stack: 'Total',
          data: [120, 132, 101, 134, 90, 230, 210],
          areaStyle: {},

          // 高亮显示
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Union Ads',
          type: 'line',
          stack: 'Total',
          data: [220, 182, 191, 234, 290, 330, 310],
          areaStyle: {},
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Video Ads',
          type: 'line',
          stack: 'Total',
          data: [150, 232, 201, 154, 190, 330, 410],
          areaStyle: {},
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Direct',
          type: 'line',
          stack: 'Total',
          data: [320, 332, 301, 334, 390, 330, 320],
          areaStyle: {},
          emphasis: {
            focus: 'series'
          }
        },
        {
          name: 'Search Engine',
          type: 'line',
          stack: 'Total',
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          areaStyle: {},
          emphasis: {
            focus: 'series'
          }
        }
      ]
    }
    mycharts2.setOption(option)
  },
  created() {
    this.getList()
  },

  methods: {
    // getList() {
    //   this.loading = true;
    //   listClassify(this.queryParams).then((response) => {
    //     this.classifyList = response.rows;
    //     this.total = response.total;
    //     this.loading = false;
    //   });
    // },

    getList(page = 1) {
      this.loading = true
      listFinance(this.queryParams).then((response) => {
        this.financeList = response.rows
        this.total = response.total
        this.loading = false
        // Echarts 绘制动态图表
        for (var i = 0; i < this.financeList.length; i++) {
          this.option.xAxis.data.push(i)
          this.option.series[0].data.push(this.financeList[i].financeMoney)
          this.option2.xAxis.data.push(i)
          this.option2.series[0].data.push(this.financeList[i].financeMoney)
          this.option2.series[1].data.push(this.financeList[i].financeBalance)
          this.option3.series[0].data.push({
            value: this.financeList[i].financeBalance,
            name: this.financeList[i].financeMoney
          })
        }
        this.myChart.setOption(this.option)
        this.myChart2.setOption(this.option2)
        this.myChart3.setOption(this.option3)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  img {
    margin-right: 40px;
    width: 150px;
    height: 150px;
    border-radius: 50%;
  }
  .userinfo {
    .name {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .access {
      color: #999999;
    }
  }
}
.login-info {
  p {
    line-height: 28px;
    font-size: 14px;
    color: #999999;
    span {
      color: #666666;
      margin-left: 60px;
    }
  }
}

.num {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .icon {
    width: 80px;
    height: 80px;
    font-size: 30px;
    text-align: center;
    line-height: 80px;
    color: #fff;
  }
  .detail {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .el-card {
    width: 32%;
    margin-bottom: 20px;
  }
  .price {
    font-size: 30px;
    margin-bottom: 10px;
    line-height: 30px;
    height: 30px;
  }
  .desc {
    font-size: 14px;
    color: #999;
    text-align: center;
  }
}
.graph {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  .el-card {
    width: 48%;
  }
}
</style>
