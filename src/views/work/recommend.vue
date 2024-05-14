<template>
  <div>
    <!-- 设置推荐参数 -->
    <el-row gutter="10" style="margin: 30px">
      <span style="font-size: 17px"><b>设置推荐参数: </b></span>
      <span style="font-size: 17px; margin-left: 30px">推荐数量</span>
      <el-input-number v-model="recommendQueryParam.k" :min="1" :max="750" style="margin-left: 15px" />
      <span style="font-size: 17px; margin-left: 30px">最低阈值</span>
      <el-input-number v-model="recommendQueryParam.threshold" :precision="2" :step="0.1" :min="0.00" :max="5.00" style="margin-left: 15px" />
      <span style="font-size: 17px; margin-left: 30px">模型权重</span>
      <el-input-number v-model="recommendQueryParam.mixWeight" :precision="4" :step="0.1" :min="0.00" :max="1.0" style="margin-left: 15px" />
      <el-button type="primary" style="margin-left: 30px" plain @click="getRecommend">更新推荐</el-button>
    </el-row>

    <!-- 注释 -->
    <el-divider content-position="left">
      <span style="font-size: 12px; color: #32a1ce">
        <i class="el-icon-s-grid" />
        推荐数量决定了召回层第一次筛选的作品数: min(2000, k * 50), 精排层第二次筛选的作品数: k * 5, 最后依概率返回的结果个数: k <br>
      </span>
    </el-divider>
    <el-divider>
      <span style="font-size: 12px; color: olivedrab">
        <i class="el-icon-s-marketing" />
        最低阈值决定了召回层第一次筛选的评分下限: 高阈值更迎合用户兴趣、低阈值适合用户探索新类别的文学作品 <br>
      </span>
    </el-divider>
    <el-divider content-position="right">
      <span style="font-size: 12px; color: coral">
        <i class="el-icon-s-operation" />
        模型权重决定了召回层和精排层进行加权评分的权重, 低权重增加精排层的影响, 高权重增加召回层的影响 <br>
      </span>
    </el-divider>

    <!-- 表格 -->
    <div class="table">
      <el-table
        v-loading="recommendLoading"
        :data="recommendWork"
        style="width: 100%; margin-left: 10px; margin-bottom: 30px"
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column prop="workId" label="作品序号" width="98" align="center" />
        <el-table-column prop="workName" label="作品名" width="220" />
        <el-table-column prop="author" label="作者" width="100" />

        <el-table-column label="作品评分" width="80">
          <template slot-scope="scope">
            <el-tag v-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 4.0" type="success">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 3.0" type="primary">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else-if="(scope.row.sumRating / scope.row.sumRatingUserNumber) >= 2.0" type="warning">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
            <el-tag v-else type="danger">{{ (scope.row.sumRating / scope.row.sumRatingUserNumber).toFixed(2) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="预计评分" width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.ratingHat >= 0" type="warning" plain>{{ (scope.row.ratingHat).toFixed(2) }}</el-tag>
            <el-tag v-else type="primary" plain>热门作品</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="tags" label="标签" width="320">
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

        <el-table-column prop="updateTime" label="作品更新时间" width="170" />

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="info" size="medium" plain @click="jumpToDetail(scope.row.workId)"> 详细信息 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-divider><i class="el-icon-top"></i>没有更多了</el-divider>

  </div>
</template>

<script>

import router from '@/router'
import { recall } from '@/api/recommend/recommend'

export default {
  data() {
    return {
      recommendWork: [],
      recommendQueryParam: {
        'k': 10,
        'mixWeight': 0.2,
        'threshold': 4.5
      },
      recommendLoading: true
    }
  },
  created() {
    this.getRecommend()
  },
  methods: {
    // 获取推荐列表
    getRecommend() {
      this.recommendLoading = true
      recall(this.recommendQueryParam).then(response => {
        if (response.success === true) {
          this.recommendWork = response.data.works
        } else { this.$message.error(response.message) }
        this.recommendLoading = false
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
    }
  }
}
</script>
