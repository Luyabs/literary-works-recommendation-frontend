<template>
  <div>
    <el-carousel v-loading="recommendLoading" :interval="4000" type="card" trigger="click" height="280px" style="margin: 15px; padding-left: 50px" >
      <el-carousel-item v-for="(work, index) in recommendWork" :key="index">
        <el-card :body-style="{ padding: '0px' }" style="height: 340px; width: 500px" shadow="hover">
          <el-row gutter="0">
            <el-col span="12">
              <el-image
                fit="fill"
                :src="work.coverLink === null ?
                  'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' : work.coverLink"
                referrerpolicy="no-referrer"
                style="height: 280px; aspect-ratio: 3/3.5; padding: 5px"
                @click="jumpToDetail(work.workId)"
              />
            </el-col>
            <el-col span="12">
              <div style="height: 100%; padding-left: 14px; padding-right: 14px; padding-bottom: 14px">
                <el-link style="font-size: 15px; height: 70px; padding-top: 0" @click="jumpToDetail(work.workId)">
                  {{ shortenStr(work.workName, 40) }}
                </el-link>
                <div style="font-size: 14px; margin-top: 7px; padding-bottom: 0">
                  {{ '作者: ' + work.author }}
                </div>
                <div style="font-size: 14px; margin-top: 7px; padding-bottom: 0">
                  {{ '简介: ' + shortenStr(work.introduction, 100) }}
                </div>
                <div style="font-size: 14px; margin-top: 7px; padding-bottom: 0">
                  {{ '作品评分: ' + (work.sumRating / work.sumRatingUserNumber).toFixed(4) }}
                </div>
                <div v-if="work.ratingHat >= 0" style="font-size: 14px; margin-top: 5px; padding-bottom: 0">
                  {{ work.ratingHat >= 0 ? '预估评分: ' + work.ratingHat.toFixed(4) : '作品评分: ' + (-work.ratingHat).toFixed(2) }}
                </div>
                <el-button-group style="margin-top: 10px; padding-bottom: 0">
                  <el-button type="primary" icon="el-icon-refresh" size="medium" @click="getRecommend(); $message.success('刷新成功')"/>
                  <el-button type="danger" icon="el-icon-delete" size="medium" @click="voteDown(work.workId)" />
                </el-button-group>
              </div>
            </el-col>
          </el-row>

        </el-card>
      </el-carousel-item>
    </el-carousel>

    <el-row :gutter="20" style="margin: 30px">
      <el-col v-loading="highestReview.loading" :span="6">
        <h3> 评分最高的作品 (>=20个评分) </h3>
        <div style="height: 400px; overflow:auto">
          <ol
            v-infinite-scroll="loadHighestReview"
            infinite-scroll-disabled="disabledHighestReview"
          >
            <li v-for="(work, index) in highestReview.list" :key="index" style="height: 40px">
              <el-tag type="warning" plain @click="jumpToDetail(work.workId)">
                {{ work.avgRating.toFixed(2) }}
              </el-tag>
              <el-tag @click="jumpToDetail(work.workId)">
                {{ shortenStr(work.workName, 25) }}
              </el-tag>
            </li>
          </ol>
          <p v-if="noMoreHighestReview">没有更多了</p>
        </div>
      </el-col>

      <el-col v-loading="mostReview.loading" :span="6">
        <h3> 评价最多的作品 </h3>
        <div style="height: 400px; overflow:auto">
          <ol
            v-infinite-scroll="loadMostReview"
            infinite-scroll-disabled="disabledMostReview"
          >
            <li v-for="(work, index) in mostReview.list" :key="index" style="height: 40px">
              <el-tag type="warning" plain @click="jumpToDetail(work.workId)">
                {{ work.sumRatingUserNumber }}
              </el-tag>
              <el-tag @click="jumpToDetail(work.workId)">
                {{ shortenStr(work.workName, 25) }}
              </el-tag>
            </li>
          </ol>
          <p v-if="noMoreMostReview">没有更多了</p>
        </div>
      </el-col>

      <el-col v-loading="mostVisit.loading" :span="6">
        <h3> 被浏览最多次的作品 </h3>
        <div style="height: 400px; overflow:auto">
          <ol
            v-infinite-scroll="loadMostVisit"
            infinite-scroll-disabled="disabledMostVisit"
          >
            <li v-for="(work, index) in mostVisit.list" :key="index" style="height: 40px">
              <el-tag type="warning" plain @click="jumpToDetail(work.workId)">
                {{ work.visitCount }}
              </el-tag>
              <el-tag @click="jumpToDetail(work.workId)">
                {{ shortenStr(work.workName, 25) }}
              </el-tag>
            </li>
          </ol>
          <p v-if="noMoreMostVisit">没有更多了</p>
        </div>
      </el-col>

      <el-col v-loading="mostCollect.loading" :span="6">
        <h3> 被最多人收藏的作品 </h3>
        <div style="height: 400px; overflow:auto">
          <ol
            v-infinite-scroll="loadMostCollect"
            infinite-scroll-disabled="disabledMostCollect"
          >
            <li v-for="(work, index) in mostCollect.list" :key="index" style="height: 40px">
              <el-tag type="warning" plain @click="jumpToDetail(work.workId)">
                {{ work.collectUserCount }}
              </el-tag>
              <el-tag @click="jumpToDetail(work.workId)">
                {{ shortenStr(work.workName, 25) }}
              </el-tag>
            </li>
          </ol>
          <p v-if="noMoreMostCollect">没有更多了</p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getHighestRating, getMostCollect, getMostRating, getMostVisit } from '@/api/work/statistic'
import router from '@/router'
import { recall } from '@/api/recommend/recommend'
import { updateMyReview } from '@/api/work/review'

export default {
  data() {
    return {
      items: [0, 1, 2, 3, 4, 5, 6, 7],
      recommendWork: [],
      recommendLoading: true,
      highestReview: {
        loading: false,
        currentPage: 0,
        pageSize: 50,
        pages: 1,
        list: [] // 后端返回的数组
      },
      mostReview: {
        loading: false,
        currentPage: 0,
        pageSize: 50,
        pages: 1,
        list: [] // 后端返回的数组
      },
      mostVisit: {
        loading: false,
        currentPage: 0,
        pageSize: 50,
        pages: 1,
        list: [] // 后端返回的数组
      },
      mostCollect: {
        loading: false,
        currentPage: 0,
        pageSize: 50,
        pages: 1,
        list: [] // 后端返回的数组
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'token',
      'roles'
    ]),
    noMoreHighestReview() {
      return this.highestReview.currentPage >= this.highestReview.pages
    },
    disabledHighestReview() {
      return this.highestReview.loading || this.noMoreHighestReview
    },
    noMoreMostReview() {
      return this.mostReview.currentPage >= this.mostReview.pages
    },
    disabledMostReview() {
      return this.mostReview.loading || this.noMoreMostReview
    },
    noMoreMostVisit() {
      return this.mostVisit.currentPage >= this.mostVisit.pages
    },
    disabledMostVisit() {
      return this.mostVisit.loading || this.noMoreMostVisit
    },
    noMoreMostCollect() {
      return this.mostCollect.currentPage >= this.mostCollect.pages
    },
    disabledMostCollect() {
      return this.mostCollect.loading || this.noMoreMostCollect
    }
  },
  // 获取用户自身信息
  created() {
    this.getRecommend()
  },

  methods: {
    // 获取推荐列表
    getRecommend() {
      this.recommendLoading = true
      const data = {
        'k': 10,
        'mixWeight': 0.2,
        'threshold': 4.5
      }
      recall(data).then(response => {
        if (response.success === true) {
          this.recommendWork = response.data.works
        } else { this.$message.error(response.message) }
        this.recommendLoading = false
      })
    },

    // 打差评
    voteDown(workId) {
      const params = {
        workId: workId,
        rating: 1
      }
      updateMyReview(params).then(response => {
        this.$confirm('此操作将给该作品打1星差评, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          if (response.success === true) {
            this.$message.success('差评成功, 不再推荐该作品')
            this.getRecommend()
          } else { this.$message.error(response.message) }
        }).catch(() => {
          this.$message.info('已取消')
        })
      })
    },

    loadHighestReview() {
      // 滑到底部时进行加载
      this.highestReview.loading = true
      setTimeout(() => {
        this.highestReview.currentPage += 1 // 页数+1
        const params = {
          currentPage: this.highestReview.currentPage,
          pageSize: this.highestReview.pageSize
        }
        getHighestRating(params).then(response => {
          if (response.success === true) {
            this.highestReview.pages = response.data.page.pages
            this.highestReview.list = this.highestReview.list.concat(response.data.page.records)
          } else { this.$message.error(response.message) }
          this.highestReview.loading = false
        }) // 调用接口，此时页数+1，查询下一页数据
      }, 500)
    },

    loadMostReview() {
      // 滑到底部时进行加载
      this.mostReview.loading = true
      setTimeout(() => {
        this.mostReview.currentPage += 1 // 页数+1
        const params = {
          currentPage: this.mostReview.currentPage,
          pageSize: this.mostReview.pageSize
        }
        getMostRating(params).then(response => {
          if (response.success === true) {
            this.mostReview.pages = response.data.page.pages
            this.mostReview.list = this.mostReview.list.concat(response.data.page.records)
          } else { this.$message.error(response.message) }
          this.mostReview.loading = false
        }) // 调用接口，此时页数+1，查询下一页数据
      }, 500)
    },

    loadMostVisit() {
      // 滑到底部时进行加载
      this.mostVisit.loading = true
      setTimeout(() => {
        this.mostVisit.currentPage += 1 // 页数+1
        const params = {
          currentPage: this.mostVisit.currentPage,
          pageSize: this.mostVisit.pageSize
        }
        getMostVisit(params).then(response => {
          if (response.success === true) {
            this.mostVisit.pages = response.data.page.pages
            this.mostVisit.list = this.mostVisit.list.concat(response.data.page.records)
          } else { this.$message.error(response.message) }
          this.mostVisit.loading = false
        }) // 调用接口，此时页数+1，查询下一页数据
      }, 500)
    },

    loadMostCollect() {
      // 滑到底部时进行加载
      this.mostCollect.loading = true
      setTimeout(() => {
        this.mostCollect.currentPage += 1 // 页数+1
        const params = {
          currentPage: this.mostCollect.currentPage,
          pageSize: this.mostCollect.pageSize
        }
        getMostCollect(params).then(response => {
          if (response.success === true) {
            this.mostCollect.pages = response.data.page.pages
            this.mostCollect.list = this.mostCollect.list.concat(response.data.page.records)
          } else { this.$message.error(response.message) }
          this.mostCollect.loading = false
        }) // 调用接口，此时页数+1，查询下一页数据
      }, 500)
    },

    // 跳转(新窗口)到详情页面
    jumpToDetail(workId) {
      const routeUrl = router.resolve({
        path: '/work/detail',
        query: {
          workId: workId
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 截断字符串
    shortenStr(str, maxBytes) {
      let result = ''
      let byteCount = 0

      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i)
        const charBytes = charCode > 255 ? 2 : 1 // 双字节字符占用2个字节，单字节字符占用1个字节

        // 如果当前字节数加上这个字符的字节数超过最大字节数，则停止添加字符
        if (byteCount + charBytes >= maxBytes) {
          // 如果截取后的字节数大于最大字节数，需要截取前maxBytes - 3个字节
          return result.substring(0, maxBytes - 3) + '...' // 加上省略号
        }
        result += str.charAt(i) // 添加字符到结果字符串
        byteCount += charBytes // 更新字节计数
      }

      return result // 返回截取后的字符串或原始字符串
    }

  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    &-container {
      margin: 30px;
    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>
