<template>
  <div>
    <!-- 表格 -->
    <div style="margin-top: 10px;">
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <!-- <el-table-column type="index" width="30" align="center"> </el-table-column>-->
        <el-table-column prop="workId" label="编号" width="98" align="center" />
        <el-table-column prop="workName" label="作品名" width="240" />
        <el-table-column prop="author" label="作者" width="110" />
        <el-table-column prop="tags" label="标签" width="460">
          <template slot-scope="scope">
            <el-link
              v-for="(tag, index) in scope.row.tags.split(' ')"
              :key="index"
              type="primary"
              style="margin-right: 10px"
              @click="jumpToQuery(tag)"
            >
              {{ tag }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="visitCount" label="访问数" width="76" />
        <el-table-column prop="updateTime" label="访问时间" width="170" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="info" size="medium" plain @click="jumpToDetail(scope.row.workId)"> 详细信息 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div style="margin-top: 15px; margin-left: 20px; margin-bottom: 15px">
      <el-pagination
        :page-sizes="[5, 10, 20, 30]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>

import { getHistory } from '@/api/work/history'
import router from '@/router'

export default {
  data() {
    return {
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 改变每页大小
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchData()
    },

    // 改变当前页号
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchData()
    },

    // 获取全部数据
    fetchData() {
      const params = {
        pageSize: this.pageSize,
        currentPage: this.currentPage
      }
      getHistory(params).then(response => {
        if (response.success === true) {
          this.tableData = response.data.page.records
          this.total = response.data.page.total
        } else { this.$message.error(response.message) }
      })
    },

    // 跳转到详情页面
    jumpToDetail(workId) {
      this.$router.push({
        path: '/work/detail',
        query: {
          workId: workId
        }
      })
    },

    // 跳转(新窗口)到查询页面
    jumpToQuery(tag) {
      const routeUrl = router.resolve({
        path: '/work/query',
        query: {
          tags: tag
        }
      })
      window.open(routeUrl.href, '_blank')
    },
  }
}
</script>
