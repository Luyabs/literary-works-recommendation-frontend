<template>
  <div>
    <!-- 表格 -->
    <div style="margin-top: 10px;">
      <el-table
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column type="index" width="60" label="序号" align="center" />-->
        <!-- <el-table-column prop="reviewId" label="评论号" width="98" align="center" />-->
        <el-table-column prop="workName" label="作品名" width="200" />
        <el-table-column prop="rating" label="标签" width="300">
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
        <el-table-column prop="content" label="我的评论" width="300" />
        <el-table-column prop="rating" label="我的评分" width="160">
          <template slot-scope="scope">
            <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="评论时间" width="160" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click="editReviewDialogVisible=true;
                        editReview.workId = scope.row.workId;
                        editReview.content = scope.row.content;
                        editReview.rating = scope.row.rating;
                        editReview.updateTime = scope.row.updateTime;"
              />
              <el-button icon="el-icon-search" circle @click="jumpToDetail(scope.row.workId)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div style="margin-top: 15px; margin-left: 20px;">
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

    <el-container style="margin-top: 30px">
      <!-- 修改评价dialog+form -->
      <el-dialog title="发表评论" :visible.sync="editReviewDialogVisible" width="35%">
        <el-form ref="form" :model="editReview" label-width="80px">
          <el-form-item label="评分">
            <el-rate
              v-model="editReview.rating"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            />
          </el-form-item>
          <el-form-item label="评论内容">
            <el-input
              v-model="editReview.content"
              type="textarea"
              rows="4"
              placeholder="请输入评价"
            />
          </el-form-item>
          <el-form-item label="上次修改">
            <el-input v-model="editReview.updateTime" disabled />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateMyReview()">立即发表</el-button>
            <el-button @click="editReviewDialogVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>

import { getMyPageAllReview, updateMyReview } from '@/api/work/review'
import router from '@/router'

export default {
  data() {
    return {
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 10,

      editReviewDialogVisible: false,
      editReview: {
        wordId: 0,
        rating: 0,
        content: '',
        updateTime: ''
      }
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
      getMyPageAllReview(params).then(response => {
        if (response.success === true) {
          this.tableData = response.data.page.records
          this.total = response.data.page.total
        } else { this.$message.error(response.message) }
      })
    },

    // 更新我对某作品的评论
    updateMyReview() {
      const params = {
        workId: this.editReview.workId,
        rating: this.editReview.rating,
        content: this.editReview.content
      }
      updateMyReview(params).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.fetchData()
        } else { this.$message.error(response.message) }
      })
      this.editReviewDialogVisible = false
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
    }
  }
}
</script>
