<template>
  <el-container style="margin: 30px" direction="vertical">
    <el-container v-loading="descriptionsLoading">
      <el-aside width="25%">
        <el-image style="padding-left: 30px; width: 300px; height: 400px" referrerpolicy="no-referrer" :src="work.coverLink" />
      </el-aside>
      <el-main style="margin-left: 50px">
        <el-descriptions title="作品信息" column="2">
          <el-descriptions-item label="书名">{{ work.workName }}</el-descriptions-item>
          <el-descriptions-item label="编号">{{ work.workId }}</el-descriptions-item>
          <el-descriptions-item label="平均评分">
            <el-rate
              v-model="work.averageRating"
              disabled
              show-score
              text-color="#ff9900"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              score-template="{value}"
            />
          </el-descriptions-item>
          <el-descriptions-item label="总评价数">{{ work.sumRatingUserNumber }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ work.author }}</el-descriptions-item>
          <el-descriptions-item label="出版社">{{ work.publisher }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ work.updateTime }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ work.createTime }}</el-descriptions-item>
          <el-descriptions-item label="简介">{{ work.introduction }}</el-descriptions-item>
        </el-descriptions>

        <el-descriptions>
          <el-descriptions-item label="标签">
            <el-link
              v-for="(tag, index) in work.tags"
              :key="index"
              type="primary"
              style="margin-right: 10px"
              @click="jumpToQuery(tag)"
            >
              {{ tag }}
            </el-link>
          </el-descriptions-item>
        </el-descriptions>

        <el-descriptions>
          <el-descriptions-item>
            <template slot="label"> 操作 </template>
            <!-- 收藏 -->
            <el-popover
              placement="right"
              width="600px"
              trigger="click"
            >
              <span style="font-size: large"><b>收藏到: </b></span>
              <el-button style="float: right" type="warning" size="medium" icon="el-icon-plus" @click="addRecordIntoDefault(work.workId)">收藏到默认收藏夹中</el-button>
              <!-- 要收藏的收藏夹目录 table -->
              <el-table :data="myAllCollectionWithCheckingWorkTableData">
                <el-table-column width="450px" property="collection.collectionName" label="收藏夹" />
                <el-table-column width="150px" label="操作">
                  <template slot-scope="scope">
                    <!-- 添加收藏 -->
                    <el-button v-if="scope.row.isInCollection === false" type="success" size="medium" icon="el-icon-plus" @click="addRecord(scope.row.collection.collectionId, work.workId)">添加收藏</el-button>
                    <!-- 移除收藏 -->
                    <el-button v-else type="danger" size="medium" icon="el-icon-delete" @click="deleteRecord(scope.row.collection.collectionId, work.workId)">移除收藏</el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 创建新收藏夹 button -->
              <el-divider>
                <el-button type="primary" @click="jumpToUrl('/collection')">
                  <i class="el-icon-plus" /> 创建新收藏夹
                </el-button>
              </el-divider>

              <!-- 与上方popover对应 -->
              <el-button slot="reference" type="warning" icon="el-icon-star-off" circle @click="fetchMyAllCollectionWithCheckingWork(work.workId)" />
            </el-popover>

            <!-- 评论 -->
            <el-button style="margin-left: 7px" type="primary" icon="el-icon-s-comment" circle @click="reviewDialogVisible = true" />

            <!-- <管理员> 修改 -->
            <el-button v-if="roles[0] === 'admin'" style="margin-left: 7px" type="info" icon="el-icon-edit" circle @click="editWorkFormVisible = true" />

            <!-- 管理员作品信息修改dialog+form -->
            <el-dialog title="作品信息修改" :visible.sync="editWorkFormVisible" width="35%">
              <el-form ref="form" :model="work" label-width="80px">
                <el-form-item label="作品ID"> <el-input v-model="work.workId" disabled /> </el-form-item>
                <el-form-item label="作品名"> <el-input v-model="work.workName" /> </el-form-item>
                <el-form-item label="作品标签"> <el-input v-model="strTags" type="textarea" rows="2" /> </el-form-item>
                <el-form-item label="作者"> <el-input v-model="work.author" /> </el-form-item>
                <el-form-item label="出版社"> <el-input v-model="work.publisher" /> </el-form-item>
                <el-form-item label="封面链接"> <el-input v-model="work.coverLink" /> </el-form-item>
                <el-form-item label="简介">
                  <el-input
                    v-model="work.introduction"
                    type="textarea"
                    rows="4"
                    placeholder="请输入评价"
                  />
                </el-form-item>
                <el-form-item label="上次修改"> <el-input v-model="work.updateTime" disabled /> </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="editThisWork()">立即修改</el-button>
                  <el-button @click="editWorkFormVisible = false">取消</el-button>
                </el-form-item>
              </el-form>
            </el-dialog>

            <!-- <管理员> 删除 -->
            <el-button v-if="roles[0] === 'admin'" style="margin-left: 7px" type="danger" icon="el-icon-delete" circle @click="deleteThisWork()" />

          </el-descriptions-item>
        </el-descriptions>
      </el-main>
    </el-container>

    <!-- 推荐模块 -->
    <el-container direction="vertical">
      <el-divider>
        <i class="el-icon-magic-stick" /> 喜欢本作品的人也在看
<!--        <el-tag @click="fetchSimilarWork()">换一批</el-tag>-->
      </el-divider>
      <el-row v-loading="recommendLoading" :gutter="16" style="margin-top: 10px">
        <el-col v-for="(work, index) in recommendWork" :key="index" :span="3">
          <el-card :body-style="{ padding: '0px' }" style="height: 100%">
            <el-image
              fit="fill"
              :src="work.coverLink === null ?
                'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg' : work.coverLink"
              referrerpolicy="no-referrer"
              style="width: 100%; aspect-ratio: 3/3.5; padding: 0"
              @click="jumpToDetail(work.workId)"
            />
            <div style="padding-left: 14px; padding-right: 14px; padding-bottom: 14px">
              <el-link style="font-size: 15px; height: 70px; padding-top: 0" @click="jumpToDetail(work.workId)">
                {{ shortenStr(work.workName, 40) }}
              </el-link>
              <div style="font-size: 14px; margin-top: 5px; padding-bottom: 0">
                {{ work.ratingHat >= 0 ? "相似度: " + work.ratingHat.toFixed(4) : "作品评分: " + (-work.ratingHat).toFixed(2) }}
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-container>

    <!-- 评论模块 -->
    <el-container style="margin-top: 30px" direction="vertical">
      <el-divider><i class="el-icon-s-comment" /> 用户评论</el-divider>
      <!-- 评论条件框 -->
      <div style="margin-top: 20px; margin-left: 20px;">
        <el-row v-loading="reviewLoading" :gutter="20">
          <el-col :span="2"> <span> <b>评分区间: </b> </span> </el-col>
          <el-col :span="6" style="margin-right: 40px">
            <el-slider
              v-model="review.ratingBound"
              range
              show-stops
              :min="1"
              :max="5"
              @change="fetchReviewData()"
            />
          </el-col>
          <el-col :span="3"> <span> <b>忽略无内容的评论: </b> </span> </el-col>
          <el-col :span="8">
            <el-switch
              v-model="review.ignoreNoContent"
              active-color="#13ce66"
              inactive-color="#909399"
              @change="fetchReviewData()"
            />
          </el-col>
          <el-col :span="4">
            <el-button type="primary" icon="el-icon-edit" round @click="reviewDialogVisible = true">
              发表/修改评论
            </el-button>
          </el-col>
        </el-row>
      </div>

      <el-container v-loading="reviewLoading" style="margin-top: 30px">

        <!-- 用户评价dialog+form -->
        <el-dialog title="发表评论" :visible.sync="reviewDialogVisible" width="35%">
          <el-form ref="form" :model="myReview" label-width="80px">
            <el-form-item label="评分">
              <el-rate
                v-model="myReview.rating"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
            </el-form-item>
            <el-form-item label="评论内容">
              <el-input
                v-model="myReview.content"
                type="textarea"
                rows="4"
                placeholder="请输入评价"
              />
            </el-form-item>
            <el-form-item label="上次修改">
              <el-input v-model="myReview.updateTime" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="updateMyReview()">立即发表</el-button>
              <el-button @click="reviewDialogVisible = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>

        <!-- 用户评价表格 -->
        <div>
          <el-table
            :data="review.tableData"
            style="width: 100%"
          >
            <!-- <el-table-column type="index" width="30" align="center"> </el-table-column>-->
            <el-table-column prop="username" label="用户" width="150">
              <template slot-scope="scope">
                <el-link
                  type="primary"
                  style="margin-right: 10px"
                  @click="jumpToVisitOther(scope.row.userId)"
                >
                  {{ scope.row.username }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="rating" label="评分" width="180">
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
            <el-table-column prop="content" label="评论" width="700" />
            <el-table-column prop="createTime" label="评论时间" width="200" />
          </el-table>
        </div>
      </el-container>

      <!-- 分页组件 -->
      <el-container>
        <div style="margin-top: 15px; margin-left: 20px;">
          <el-pagination
            :page-sizes="[25, 50, 100, 200]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="review.total"
            :current-page.sync="review.currentPage"
            :page-size="review.pageSize"
            background
            @size-change="handleReviewSizeChange"
            @current-change="handleReviewCurrentChange"
          />
        </div>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { addHistory } from '@/api/work/history'
import { deleteWork, editWork, existWork, getById } from '@/api/work/work'
import { getMyReview, getReviewPage, updateMyReview } from '@/api/work/review'
import {
  dropRecord,
  getMyAllCollectionWithCheckingWork,
  postNewRecord,
  postNewRecordIntoDefault
} from '@/api/work/collectionRecord'
import router from '@/router'
import { getSimilarWork } from '@/api/recommend/recommend'

export default {
  data() {
    return {
      work: {
        averageRating: 0,
        author: '',
        coverLink: '',
        createTime: '',
        introduction: '',
        publisher: '',
        sumRating: 0,
        sumRatingUserNumber: 0,
        tags: [],
        updateTime: '',
        workId: 0,
        workName: ''
      },
      strTags: '',
      recommendWork: [],
      review: {
        tableData: [],
        total: 0,
        currentPage: 1,
        pageSize: 50,
        ratingBound: [1, 5],
        ignoreNoContent: false
      },
      myReview: {
        rating: 0,
        content: '',
        updateTime: ''
      },
      myAllCollectionWithCheckingWorkTableData: [], // 此表格不分页 用来展示作品已经被收藏/未被收藏到哪些收藏夹
      descriptionsLoading: true,
      recommendLoading: true,
      reviewLoading: true,
      reviewDialogVisible: false,
      editWorkFormVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  // 获取用户自身信息
  async created() {
    this.work.workId = this.$route.query.workId
    existWork(this.work.workId).then(response => {
      if (response.data.exist === false) {
        this.$message.error('该文学作品不存在或已被删除')
        this.$router.go(-1)
      } else {
        addHistory(this.work.workId).then(response => {
          if (response.success === false) {
            this.$message.error(response.message)
          }
        })
        this.fetchWorkInfo()
        this.fetchReviewData()
        this.fetchMyReview()
        this.fetchSimilarWork()
      }
    })
  },

  methods: {
    // 获取与作品有相似交互行为的其他作品
    fetchSimilarWork() {
      this.recommendLoading = true
      const data = {
        workId: this.work.workId,
        k: 8
      }
      getSimilarWork(data).then(response => {
        if (response.success === true) {
          this.recommendWork = response.data.works
        } else { this.$message.error(response.message) }
        this.recommendLoading = false
      })
    },

    // 刷新文学作品信息
    fetchWorkInfo() {
      this.descriptionsLoading = true
      getById(this.work.workId).then(response => {
        if (response.success === true) {
          this.work = response.data.one
          this.strTags = response.data.one.tags
          this.work.tags = this.strTags.split(' ')
          this.work.averageRating = parseFloat((this.work.sumRating / this.work.sumRatingUserNumber).toFixed(2))
        } else { this.$message.error(response.message) }
        this.descriptionsLoading = false
      })
    },

    // 改变每页大小
    handleReviewSizeChange(val) {
      this.review.pageSize = val
      this.fetchReviewData()
    },

    // 改变当前页号
    handleReviewCurrentChange(val) {
      this.review.currentPage = val
      this.fetchReviewData()
    },

    // 获取评论数据
    fetchReviewData() {
      this.reviewLoading = true
      const params = {
        currentPage: this.review.currentPage,
        pageSize: this.review.pageSize,
        workId: this.work.workId,
        ratingLowerBound: this.review.ratingBound[0],
        ratingUpperBound: this.review.ratingBound[1],
        ignoreNoContent: this.review.ignoreNoContent
      }
      getReviewPage(params).then(response => {
        if (response.success === true) {
          this.review.tableData = response.data.page.records
          this.review.total = response.data.page.total
        } else { this.$message.error(response.message) }
        this.reviewLoading = false
      })
    },

    // 获取我的评论
    fetchMyReview() {
      getMyReview(this.work.workId).then(response => {
        if (response.success === true) {
          if (response.data.one === null) {
            return
          }
          this.myReview = response.data.one
        } else { this.$message.error(response.message) }
      })
    },

    // 更新我的评论
    updateMyReview() {
      const params = {
        workId: this.work.workId,
        rating: this.myReview.rating,
        content: this.myReview.content
      }
      updateMyReview(params).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.fetchWorkInfo()
          this.fetchMyReview()
          this.fetchReviewData()
        } else { this.$message.error(response.message) }
      })
      this.reviewDialogVisible = false
    },

    // 移除收藏
    deleteRecord(collectionId, workId) {
      // this.$confirm('确认移除收藏?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      dropRecord(collectionId, workId).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
        } else { this.$message.error(response.message) }
        this.fetchMyAllCollectionWithCheckingWork(workId)
      })
      // }).catch(() => {
      //   this.$message.info('已取消删除')
      // })
    },

    // 添加收藏
    addRecord(collectionId, workId) {
      postNewRecord(collectionId, workId).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
        } else { this.$message.error(response.message) }
        this.fetchMyAllCollectionWithCheckingWork(workId)
      })
    },

    // 收藏作品到默认收藏夹 (传入collectionId只是为了刷新当前文件夹显示)
    addRecordIntoDefault(workId) {
      postNewRecordIntoDefault(workId).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
        } else { this.$message.error(response.message) }
        this.fetchMyAllCollectionWithCheckingWork(workId)
      })
    },

    // 某作品对应的是否出现在文件中，返回全部文件夹相关的信息
    fetchMyAllCollectionWithCheckingWork(workId) {
      getMyAllCollectionWithCheckingWork(workId).then(response => {
        if (response.success === true) {
          this.myAllCollectionWithCheckingWorkTableData = response.data.all
        } else { this.$message.error(response.message) }
      })
    },

    // <管理员> 修改作品
    editThisWork() {
      const data = {
        workId: this.work.workId,
        workName: this.work.workName,
        tags: this.strTags,
        author: this.work.author,
        publisher: this.work.publisher,
        coverLink: this.work.coverLink,
        introduction: this.work.introduction
      }
      editWork(data).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
        } else {
          this.$message.error(response.message)
        }
        this.fetchWorkInfo()
        this.editWorkFormVisible = false
      })
    },

    // <管理员> 逻辑删除作品
    deleteThisWork() {
      this.$confirm('确认永久删除本作品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteWork(this.work.workId).then(response => {
          if (response.success === true) {
            this.$message.success(response.message)
            this.$router.push('/work/query')
          } else {
            this.$message.error(response.message)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 跳转(新窗口) 不带参数
    jumpToUrl(url) {
      const routeUrl = router.resolve({
        path: url
      })
      window.open(routeUrl.href, '_blank')
    },

    // 跳转(新窗口)到文学作品查询页面
    jumpToQuery(tag) {
      const routeUrl = router.resolve({
        path: '/work/query',
        query: {
          tags: tag
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 跳转(新窗口)到用户查询页面
    jumpToVisitOther(userId) {
      const routeUrl = router.resolve({
        path: '/visit_other',
        query: {
          userId: userId
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 跳转到详情页面
    jumpToDetail(workId) {
      this.$router.push({
        path: '/work/detail',
        query: {
          workId: workId
        }
      })
      this.$router.go(0)
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

