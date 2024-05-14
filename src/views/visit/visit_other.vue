<template>
  <!-- 搜索用户id/用户名框 -->
  <div class="dashboard-container">
    <el-input v-model="search.input" placeholder="请输入以查询用户公开信息" class="input-with-select" style="width: 480px">
      <el-select slot="prepend" v-model="search.select" placeholder="请选择" style="width: 120px">
        <el-option label="用户ID" value="byId" />
        <el-option label="用户名" value="byUsername" />
      </el-select>
      <el-button slot="append" icon="el-icon-search" @click="fetchInfo()" />
    </el-input>

    <!-- 个人信息框 -->
    <el-descriptions v-if="info.userId > 0" title="用户个人信息" :column="2" :size="'medium'" border style="margin-top: 30px">
      <el-descriptions-item label="用户ID">
        <el-tag v-if="name === info.username" size="small" type="primary" plain>你自己</el-tag>
        {{ info.userId }}
      </el-descriptions-item>
      <el-descriptions-item v-if="privacy.isInfoPublic" label="用户名">{{ info.username }}</el-descriptions-item>
      <el-descriptions-item v-if="privacy.isInfoPublic" label="身份">
        <el-tag v-if="info.roles[0] === 'admin'" type="warning" size="small">管理员</el-tag>
        <el-tag v-if="info.roles[0] === 'normal_user'" type="success" size="small">普通用户</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="用户状态">
        <el-switch
          v-if="roles[0] === 'admin'"
          v-model="info.isBanned"
          style="display: block"
          inactive-color="#67C23A"
          active-color="#F56C6C"
          inactive-text="正常"
          active-text="封禁"
          @change="changeBanStatus()"
        />
        <el-tag v-else-if="!info.isBanned" type="success" size="small">正常</el-tag>
        <el-tag v-else type="danger" size="small">被封禁</el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="privacy.isInfoPublic" label="加入时间">{{ info.createTime }}</el-descriptions-item>
      <el-descriptions-item v-if="privacy.isInfoPublic" label="信息更新时间">{{ info.updateTime }}</el-descriptions-item>
      <el-descriptions-item v-if="privacy.isInfoPublic" label="个人介绍">{{ info.introduction }}</el-descriptions-item>
    </el-descriptions>

    <el-row v-if="info.userId > 0" :gutter="30" style="margin-top: 10px">
      <el-col :span="privacy.isCommentPublic === true ? 12 : 24">
        <el-divider><i class="el-icon-star-on" /> 公开的收藏夹</el-divider>
        <el-empty v-if="coll.collections.length <= 0 " />
        <!-- 收藏夹 -->
        <el-row v-else :gutter="16" style="margin-top: 10px">
          <el-col
            v-for="(collection, index) in coll.collections"
            :key="collection.collectionId"
            :span="privacy.isCommentPublic === true ? 12 : 6"
          >
            <el-card shadow="hover" style="margin-bottom: 30px; height: auto" :body-style="{ padding: '0px' }">
              <div slot="header" style="height: 70px" class="clearfix">
                <el-row>
                  <el-col :span="20">
                    <el-tag v-if="collection.isDefaultCollection === true" type="warning" size="small" style="float: top; margin-right: 7px">默认</el-tag>
                    <span>{{ collection.collectionName }}</span>
                  </el-col>
                  <el-col :span="4">
                    <!-- 有需求再加按钮 -->
                  </el-col>
                </el-row>

              </div>
              <div style="font-size: 15px; margin: 10px">
                <el-row>
                  <!-- 收藏夹简介 button + popover -->
                  <el-col :span="12">
                    <el-popover
                      style="float: right; margin-right: 10px"
                      placement="top-start"
                      title="简介"
                      width="200"
                      trigger="hover"
                      :content="collection.introduction"
                    >
                      <el-button slot="reference" type="info" plain>收藏夹简介</el-button>
                    </el-popover>
                  </el-col>

                  <!-- 收藏夹列表 button + popover -->
                  <el-col :span="12">
                    <el-popover
                      style="float: left; margin-left: 10px"
                      placement="bottom"
                      :title="collection.collectionName"
                      width="auto"
                      trigger="click"
                    >
                      <!-- 收藏夹列表 table -->
                      <el-table
                        :data="coll.collectionTableData"
                        style="width: 100%"
                      >
                        <el-table-column prop="workName" label="作品名" width="200" />
                        <el-table-column prop="author" label="作者" width="80" />
                        <el-table-column prop="tags" label="标签" width="400">
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
                        <el-table-column label="操作" width="140px">
                          <template slot-scope="scope">
                            <el-button-group>
                              <!-- 跳转到具体页面 -->
                              <el-button type="info" size="medium" icon="el-icon-search" plain @click="jumpToDetail(scope.row.workId)" />
                              <!-- 更换收藏夹 -->
                              <el-popover
                                placement="right"
                                width="100%"
                                trigger="click"
                              >
                                <!-- 要更换的收藏夹目录 -->
                                <span>{{ scope.row.workName }}</span>
                                <el-button style="float: right" type="warning" size="medium" icon="el-icon-plus" @click="addRecordIntoDefault(scope.row.workId)">收藏到默认收藏夹中</el-button>
                                <el-table :data="coll.myAllCollectionWithCheckingWorkTableData">
                                  <el-table-column width="300px" property="collection.collectionName" label="我的收藏夹" />
                                  <el-table-column width="140px" label="操作">
                                    <template slot-scope="scope2">
                                      <!-- 添加收藏 -->
                                      <el-button v-if="scope2.row.collection.collectionId === coll.nowVisitingCollectionId" type="info" size="medium" icon="el-icon-folder-opened" disabled>本收藏夹</el-button>
                                      <el-button v-else-if="scope2.row.isInCollection === false" type="success" size="medium" icon="el-icon-plus" @click="addRecord(scope2.row.collection.collectionId, scope.row.workId)">添加收藏</el-button>
                                      <!-- 移除收藏 -->
                                      <el-button v-else type="danger" size="medium" icon="el-icon-delete" @click="deleteRecord(scope2.row.collection.collectionId, scope.row.workId)">移除收藏</el-button>
                                    </template>
                                  </el-table-column>
                                </el-table>
                                <!-- 更换收藏夹 与上方popover对应 -->
                                <el-button slot="reference" type="warning" size="medium" icon="el-icon-rank" @click="fetchMyAllCollectionWithCheckingWork(scope.row.workId)" />

                                <!-- 创建新收藏夹 button -->
                                <el-divider>
                                  <el-button type="primary" @click="jumpToUrl('/collection')">
                                    <i class="el-icon-plus" /> 创建新收藏夹
                                  </el-button>
                                </el-divider>
                              </el-popover>
                            </el-button-group>
                          </template>
                        </el-table-column>
                      </el-table>

                      <!-- 分页组件 -->
                      <div style="margin-top: 15px; margin-left: 20px;">
                        <el-pagination
                          :page-sizes="[5, 10, 20, 30]"
                          layout="total, sizes, prev, pager, next, jumper"
                          :total="coll.total"
                          :current-page.sync="coll.currentPage"
                          :page-size="coll.pageSize"
                          background
                          @size-change="handleCollTableSizeChange"
                          @current-change="handleCollTableCurrentChange"
                        />
                      </div>

                      <!-- 打开收藏夹列表 button -->
                      <el-button slot="reference" type="success" plain @click="coll.nowVisitingCollectionId = collection.collectionId; loadPageOthersCollectionRecord()">收藏夹列表</el-button>

                    </el-popover>
                  </el-col>
                </el-row>

              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>

      <!-- 如果用户允许查看他发表的评论 -->
      <el-col v-if="privacy.isCommentPublic === true" :span="12">
        <el-divider><i class="el-icon-s-comment" /> 发表过的评论</el-divider>
        <!-- 评论表格 -->
        <div style="margin-top: 10px;">
          <el-table
            :data="review.tableData"
            style="width: 100%"
          >
            <el-table-column prop="workName" label="作品名" width="175">
              <template slot-scope="scope">
                <el-link
                  type="primary"
                  @click="jumpToDetail(scope.row.workId)"
                >
                  {{ scope.row.workName }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="content" label="评论" width="280" />
            <el-table-column prop="rating" label="评分" width="150">
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
            <el-table-column prop="updateTime" label="评论时间" width="150" />
          </el-table>
        </div>

        <!-- 分页组件 -->
        <div style="margin-top: 15px; margin-left: 20px;">
          <el-pagination
            :page-sizes="[5, 10, 20, 30]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="review.total"
            :current-page.sync="review.currentPage"
            :page-size="review.pageSize"
            background
            @size-change="handleReviewTableSizeChange"
            @current-change="handleReviewTableCurrentChange"
          />
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import {
  getOtherCollectionRecord,
  getOtherCollections,
  getOtherInfo,
  getOtherPrivacySetting,
  getOtherReview,
  getUserIdByUsername
} from '@/api/visit/visit_others'
import router from '@/router'
import { getMyAllCollection } from '@/api/work/collection'
import { mapGetters } from 'vuex'
import {
  dropRecord,
  getMyAllCollectionWithCheckingWork,
  postNewRecord,
  postNewRecordIntoDefault
} from '@/api/work/collectionRecord'
import { reverseBannedStatus } from '@/api/user/user'

export default {
  data() {
    return {
      search: {
        select: 'byId',
        input: ''
      },
      privacy: {
        isInfoPublic: false,
        isCommentPublic: false
      },
      info: {
        userId: 0,
        username: '',
        introduction: '',
        roles: [],
        createTime: '',
        updateTime: '',
        avatar: '',
        isBanned: false
      },
      review: {
        tableData: [],
        total: 0,
        currentPage: 1,
        pageSize: 10
      },
      coll: {
        collections: [], // 此表格不分页 用于展示全部收藏夹
        collectionTableData: [], // 仅此表格分页 用于展示收藏夹里有哪些收藏
        myAllCollectionWithCheckingWorkTableData: [], // 此表格不分页 用来展示作品已经被收藏/未被收藏到哪些收藏夹
        total: 0,
        currentPage: 1,
        pageSize: 10,
        nowVisitingCollectionId: 0 // 记忆正在打开的收藏夹id
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  // 获取用户自身信息
  created() {
    if (this.$route.query.userId != null) {
      this.search.select = 'byId'
      this.search.input = this.$route.query.userId
      this.fetchInfo()
    }
  },

  methods: {
    // 改变评论每页大小
    handleReviewTableSizeChange(val) {
      this.review.pageSize = val
      this.fetchReviewData()
    },

    // 改变评论当前页号
    handleReviewTableCurrentChange(val) {
      this.review.currentPage = val
      this.fetchReviewData()
    },

    // 改变收藏夹内表格每页大小
    handleCollTableSizeChange(val) {
      this.coll.pageSize = val
      this.loadPageOthersCollectionRecord()
    },

    // 改变收藏夹内表格当前页号
    handleCollTableCurrentChange(val) {
      this.coll.currentPage = val
      this.loadPageOthersCollectionRecord()
    },

    // 刷新个人隐私及公开信息
    async fetchInfo() {
      this.info.username = ''

      let temp = this.search.input
      if (this.search.select === 'byUsername') { // 先将用户名转换为id
        await getUserIdByUsername(this.search.input).then(response => {
          if (response.success === true) {
            temp = response.data.userId
          } else {
            this.$message.error(response.message)
          }
        })
      }
      await getOtherPrivacySetting(temp).then(response => { // 根据用户id查询个人隐私设置
        if (response.success === true) {
          this.privacy = response.data.privacy
        } else {
          this.$message.error(response.message)
        }
      })
      if (this.privacy.isInfoPublic !== true) { // 如果未公开个人信息
        this.$message.warning('该用户未公开其他个人信息')
        this.info.userId = temp
      } else {
        await getOtherInfo(temp).then(response => { // 根据用户id查询个人信息
          if (response.success === true) {
            this.info = response.data.user
            this.$message.success('用户信息查询成功')
          } else {
            this.$message.error(response.message)
          }
        })
      }
      if (this.privacy.isCommentPublic === true) { // 刷新评论信息
        this.fetchReviewData()
      }
      this.fetchOtherAllCollection() // 刷新收藏信息
    },

    // 修改封禁状态
    changeBanStatus() {
      reverseBannedStatus(this.info.userId).then(response => {
        if (response.success === true) {
          if (response.data.isBanned) this.$message.success('成功封禁该用户')
          else this.$message.success('成功解除该用户封禁状态')
        } else { this.$message.error(response.message) }
      })
    },

    // 获取评论数据
    fetchReviewData() {
      const params = {
        pageSize: this.review.pageSize,
        currentPage: this.review.currentPage,
        userId: this.info.userId
      }
      getOtherReview(params).then(response => {
        if (response.success === true) {
          this.review.tableData = response.data.page.records
          this.review.total = response.data.page.total
        } else { this.$message.error(response.message) }
      })
    },

    // 获取他人的收藏夹数据
    fetchOtherAllCollection() {
      getOtherCollections(this.info.userId).then(response => {
        if (response.success === true) {
          this.coll.collections = response.data.all
        } else { this.$message.error(response.message) }
      })
    },

    // 加载收藏夹内容
    loadPageOthersCollectionRecord() {
      const params = {
        currentPage: this.coll.currentPage,
        pageSize: this.coll.pageSize,
        collectionId: this.coll.nowVisitingCollectionId
      }
      getOtherCollectionRecord(params).then(response => {
        if (response.success === true) {
          this.coll.collectionTableData = response.data.page.records
          this.coll.total = response.data.page.total
        } else { this.$message.error(response.message) }
      })
    },

    // 获取自己的收藏夹数据
    fetchMyAllCollection() {
      getMyAllCollection().then(response => {
        if (response.success === true) {
          this.collections = response.data.all
        } else { this.$message.error(response.message) }
      })
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
          this.coll.myAllCollectionWithCheckingWorkTableData = response.data.all
        } else { this.$message.error(response.message) }
      })
    },

    // 跳转(新窗口) 不带参数
    jumpToUrl(url) {
      const routeUrl = router.resolve({
        path: url
      })
      window.open(routeUrl.href, '_blank')
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
