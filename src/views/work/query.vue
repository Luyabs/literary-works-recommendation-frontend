<template>
  <div>
    <!-- 搜索框 与 新增 -->
    <div style="margin-top: 20px; margin-left: 20px;">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input v-model="searchWorkName" placeholder="书名" size="large" prefix-icon="el-icon-search" clearable>
            <template slot="prepend">书名</template>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-input v-model="searchAuthor" placeholder="作者" size="large" prefix-icon="el-icon-search" clearable>
            <template slot="prepend">作者</template>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-input v-model="searchTags" placeholder="多标签请用空格隔开" size="large" prefix-icon="el-icon-search" clearable>
            <template slot="prepend">标签</template>
          </el-input>
        </el-col>
        <el-button type="primary" @click="fetchData()"> 立即查询 </el-button>
        <el-button type="warning" @click="detailedSearchFormVisible = true"> 其它查询条件 </el-button>
        <el-button type="danger" @click="resetSearchCondition()"> 重置查询条件 </el-button>
      </el-row>
    </div>

    <!-- 详细搜索条件 -->
    <div>
      <el-dialog title="全部查询条件" :visible.sync="detailedSearchFormVisible" width="40%">
        <el-form label-position="right" label-width="80px">
          <el-form-item label="书名"> <el-input v-model="searchWorkName" placeholder="无" /> </el-form-item>
          <el-form-item label="作者"> <el-input v-model="searchAuthor" placeholder="无" /> </el-form-item>
          <el-form-item label="标签"> <el-input v-model="searchTags" placeholder="多标签请用空格隔开" /> </el-form-item>
          <el-form-item label="出版社"> <el-input v-model="searchPublisher" placeholder="无" /> </el-form-item>
          <el-form-item label="简介"> <el-input v-model="searchIntroduction" placeholder="无" /> </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button type="danger" @click="resetSearchCondition()"> 重置查询条件 </el-button>
          <el-button type="primary" @click="fetchData()"> 立即查询 </el-button>
        </span>
      </el-dialog>
    </div>

    <!-- 表格 -->
    <div style="margin-top: 10px;">
      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="tableLoading"
      >
        <!-- <el-table-column type="index" width="30" align="center"> </el-table-column>-->
        <el-table-column prop="workId" label="编号" width="118" align="center" />
        <el-table-column prop="workName" label="作品名" width="280" />
        <el-table-column prop="author" label="作者" width="140" />
        <el-table-column label="评分" width="70">
          <template slot-scope="scope">
            <el-tag v-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 4.0" type="success">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 3.0" type="primary">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 2.0" type="warning">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else type="danger">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="520">
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
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="info" size="medium" plain @click="jumpToDetail(scope.row.workId)"> 详细信息 </el-button>
          </template>o
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
  </div>
</template>

<script>

import { getPage } from '@/api/work/work'
import router from '@/router'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      searchWorkName: '',
      searchTags: '',
      searchAuthor: '',
      searchPublisher: '',
      searchIntroduction: '',

      tableLoading: true,
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 5,


      detailedSearchFormData: {}, // 详细信息表单数据
      detailedSearchFormVisible: false // 详细信息表单可见度

    }
  },
  created() {
    this.searchTags = this.$route.query.tags
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
      this.tableLoading = true
      const params = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        workName: this.searchWorkName,
        author: this.searchAuthor,
        publisher: this.searchPublisher,
        tags: this.searchTags,
        introduction: this.searchIntroduction
      }
      getPage(params).then(response => {
        if (response.success === true) {
          this.tableData = response.data.page.records
          this.total = response.data.page.total
        } else { this.$message.error(response.message) }
        this.tableLoading = false
      })
    },

    resetSearchCondition() {
      this.searchTags = ''
      this.searchAuthor = ''
      this.searchPublisher = ''
      this.searchIntroduction = ''
      this.searchWorkName = ''
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
