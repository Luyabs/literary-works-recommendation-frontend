<template>
  <div style="margin: 30px">
    <el-empty v-if="collections.length <= 0"></el-empty>
    <el-row v-else :gutter="22" style="margin-top: 10px">
      <el-col v-for="(collection, index) in collections" :key="collection.collectionId" :span="6">
        <el-card shadow="hover" style="margin-bottom: 30px; height: auto" :body-style="{ padding: '0px' }">
          <div slot="header" style="height: 70px" class="clearfix">
            <el-row>
              <el-col :span="20">
                <el-tag v-if="collection.isDefaultCollection === true" type="warning" size="small" style="float: top; margin-right: 7px">默认</el-tag>
                <span>{{ collection.collectionName }}</span>
              </el-col>
              <el-col :span="4">
                <el-button style="float: right" type="primary" size="medium" icon="el-icon-edit" circle @click="openEditForm(collection)" />
                <el-button style="float: right; margin-top: 7px" type="danger" size="medium" icon="el-icon-delete" circle @click="deleteCollection(collection.collectionId)" />
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
                    :data="collectionTableData"
                    style="width: 100%"
                  >
                    <el-table-column prop="workName" label="作品名" width="210" />
                    <el-table-column prop="author" label="作者" width="90" />
                    <el-table-column prop="tags" label="标签" width="450">
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
                    <el-table-column label="操作" width="185px">
                      <template slot-scope="scope">
                        <el-button-group>
                          <!-- 跳转到具体页面 -->
                          <el-button type="info" size="medium" icon="el-icon-search" plain @click="jumpToDetail(scope.row.workId)" />
                          <!-- 移除收藏 -->
                          <el-button type="danger" size="medium" icon="el-icon-delete" @click="deleteRecord(nowVisitingCollectionId, scope.row.workId)" />
                          <!-- 更换收藏夹 -->
                          <el-popover
                            placement="right"
                            width="600px"
                            trigger="click"
                          >
                            <!-- 要更换的收藏夹目录 -->
                            <span>{{ scope.row.workName }}</span>
                            <el-button style="float: right" type="warning" size="medium" icon="el-icon-plus" @click="addRecordIntoDefault(scope.row.workId)">收藏到默认收藏夹中</el-button>
                            <el-table :data="myAllCollectionWithCheckingWorkTableData">
                              <el-table-column width="450px" property="collection.collectionName" label="收藏夹" />
                              <el-table-column width="150px" label="操作">
                                <template slot-scope="scope2">
                                  <!-- 添加收藏 -->
                                  <el-button v-if="scope2.row.collection.collectionId === nowVisitingCollectionId" type="info" size="medium" icon="el-icon-folder-opened" disabled>本收藏夹</el-button>
                                  <el-button v-else-if="scope2.row.isInCollection === false" type="success" size="medium" icon="el-icon-plus" @click="addRecord(scope2.row.collection.collectionId, scope.row.workId)">添加收藏</el-button>
                                  <!-- 移除收藏 -->
                                  <el-button v-else type="danger" size="medium" icon="el-icon-delete" @click="deleteRecord(scope2.row.collection.collectionId, scope.row.workId)">移除收藏</el-button>
                                </template>
                              </el-table-column>
                            </el-table>
                            <!-- 更换收藏夹 与上方popover对应 -->
                            <el-button slot="reference" type="warning" size="medium" icon="el-icon-rank" @click="fetchMyAllCollectionWithCheckingWork(scope.row.workId)" />
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
                      :total="total"
                      :current-page.sync="currentPage"
                      :page-size="pageSize"
                      background
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                    />
                  </div>

                  <!-- 打开收藏夹列表 button -->
                  <el-button slot="reference" type="success" plain @click="nowVisitingCollectionId = collection.collectionId; loadPageCollectionRecord()">收藏夹列表</el-button>

                </el-popover>
              </el-col>
            </el-row>

          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建新收藏夹 button -->
    <el-divider>
      <el-button type="success" @click="newCollectionDialogVisible = true">
        <i class="el-icon-plus" /> 创建新收藏夹
      </el-button>
    </el-divider>

    <!-- 创建新收藏夹 form -->
    <el-dialog title="新建收藏夹" :visible.sync="newCollectionDialogVisible" width="35%">
      <el-form ref="form" :model="newCollectionForm" label-width="120px">
        <el-form-item label="收藏夹名">
          <el-input v-model="newCollectionForm.collectionName" />
        </el-form-item>
        <el-form-item label="收藏夹简介">
          <el-input v-model="newCollectionForm.introduction" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="newCollectionForm.isPublic" />
        </el-form-item>
        <el-form-item label="设为默认收藏夹">
          <el-switch v-model="newCollectionForm.isDefaultCollection" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitNewCollection()">立即创建</el-button>
          <el-button @click="newCollectionDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 编辑收藏夹信息 form -->
    <el-dialog title="新建收藏夹" :visible.sync="editCollectionDialogVisible" width="35%">
      <el-form ref="form" :model="editCollectionForm" label-width="120px">
        <el-form-item label="序号">
          <el-input v-model="editCollectionForm.collectionId" disabled />
        </el-form-item>
        <el-form-item label="收藏夹名">
          <el-input v-model="editCollectionForm.collectionName" />
        </el-form-item>
        <el-form-item label="收藏夹简介">
          <el-input v-model="editCollectionForm.introduction" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="editCollectionForm.isPublic" />
        </el-form-item>
        <el-form-item label="设为默认收藏夹">
          <el-switch v-model="editCollectionForm.isDefaultCollection" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="editCollection()">更新信息</el-button>
          <el-button @click="editCollectionDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>

import { dropCollection, getMyAllCollection, postNewCollection, updateCollection } from '@/api/work/collection'
import {
  dropRecord,
  getMyAllCollectionWithCheckingWork,
  getPageCollectionRecord,
  postNewRecord, postNewRecordIntoDefault
} from '@/api/work/collectionRecord'
import router from '@/router'

export default {
  data() {
    return {
      newCollectionForm: {
        collectionName: '',
        introduction: '',
        isPublic: true,
        isDefaultCollection: false
      },
      editCollectionForm: {
        collectionId: 0,
        collectionName: '',
        introduction: '',
        isPublic: true,
        isDefaultCollection: false
      },
      collections: [], // 此表格不分页 用于展示全部收藏夹
      collectionTableData: [], // 仅此表格分页 用于展示收藏夹里有哪些收藏
      myAllCollectionWithCheckingWorkTableData: [], // 此表格不分页 用来展示作品已经被收藏/未被收藏到哪些收藏夹
      total: 0,
      currentPage: 1,
      pageSize: 10,
      nowVisitingCollectionId: 0, // 记忆正在打开的收藏夹id
      newCollectionDialogVisible: false,
      editCollectionDialogVisible: false
    }
  },
  created() {
    this.fetchMyAllCollection()
  },
  methods: {
    // 获取全部数据
    fetchMyAllCollection() {
      getMyAllCollection().then(response => {
        if (response.success === true) {
          this.collections = response.data.all
        } else { this.$message.error(response.message) }
      })
    },

    // 创建新收藏夹
    submitNewCollection() {
      postNewCollection(this.newCollectionForm).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.fetchMyAllCollection()
        } else { this.$message.error(response.message) }
      })
      this.newCollectionDialogVisible = false
    },

    // 删除收藏夹
    deleteCollection(collectionId) {
      this.$confirm('此操作将永久删除该收藏夹与收藏记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        dropCollection(collectionId).then(response => {
          if (response.success === true) {
            this.$message.success(response.message)
            this.fetchMyAllCollection()
          } else { this.$message.error(response.message) }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 编辑收藏夹 - 打开窗口并加载数据
    openEditForm(collection) {
      this.editCollectionForm = {
        collectionId: collection.collectionId,
        collectionName: collection.collectionName,
        introduction: collection.introduction,
        isPublic: collection.isPublic,
        isDefaultCollection: collection.isDefaultCollection
      }
      this.editCollectionDialogVisible = true
    },

    // 编辑收藏夹 - 提交数据
    editCollection() {
      updateCollection(this.editCollectionForm).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.fetchMyAllCollection()
        } else { this.$message.error(response.message) }
      })
      this.editCollectionDialogVisible = false
    },

    // 加载收藏夹内容
    loadPageCollectionRecord() {
      const params = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        collectionId: this.nowVisitingCollectionId
      }
      getPageCollectionRecord(params).then(response => {
        if (response.success === true) {
          this.collectionTableData = response.data.page.records
          this.total = response.data.page.total
        } else { this.$message.error(response.message) }
      })
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
        this.loadPageCollectionRecord(this.nowVisitingCollectionId)
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
        this.loadPageCollectionRecord(this.nowVisitingCollectionId)
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
        this.loadPageCollectionRecord(this.nowVisitingCollectionId)
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

    // 改变每页大小
    handleSizeChange(val) {
      this.pageSize = val
      this.loadPageCollectionRecord(this.nowVisitingCollectionId)
    },

    // 改变当前页号
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadPageCollectionRecord(this.nowVisitingCollectionId)
    }
  }
}
</script>
