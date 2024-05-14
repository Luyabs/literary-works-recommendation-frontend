<template>
  <div class="dashboard-container">
    <div>
      <el-descriptions class="margin-top" title="个人基础信息" :column="2" :size="'medium'" border>
        <el-descriptions-item label="用户ID">{{ userId }} </el-descriptions-item>
        <el-descriptions-item label="用户名">{{ username }}</el-descriptions-item>
        <el-descriptions-item label="身份">
          <el-tag v-if="roles[0] === 'admin'" type="warning" size="small">管理员</el-tag>
          <el-tag v-if="roles[0] === 'normal_user'" type="success" size="small">普通用户</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="加入时间">{{ createTime }}</el-descriptions-item>
        <el-descriptions-item label="个人介绍">{{ introduction }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 审批信息drawer -->
    <el-drawer
      title="修改个人信息"
      :visible.sync="editDrawerVisible"
      direction="rtl"
      size="30%"
      :before-close="closeDrawer"
    >
      <div class="demo-drawer__content">
        <el-form size="medium" label-position="right" label-width="80px" style="margin-left: 3%; margin-right: 3%">
          <el-form-item label="用户ID"> <el-input v-model="userId" disabled /> </el-form-item>
          <el-form-item label="用户名"> <el-input v-model="username" /> </el-form-item>
          <el-form-item label="密码"> <el-input v-model="password" type="password" show-password /> </el-form-item>
          <el-form-item label="个人介绍"> <el-input v-model="introduction" type="textarea" :rows="1" autosize /> </el-form-item>
          <div class="demo-drawer__footer" style="margin-left: 3%">
            <el-button type="danger" @click="updateSelfInfo">
              <i class="el-icon-edit" />
              更新个人信息
            </el-button>
            <el-button @click="closeDrawer()">取消</el-button>
          </div>
        </el-form>
      </div>
    </el-drawer>

    <hr>
    <el-button type="success" @click="editDrawerVisible = true">
      <i class="el-icon-edit" />
      更新个人信息
    </el-button>
    <el-button type="warning" @click="privacyDialogVisible = true">
      <i class="el-icon-unlock" />
      调整个人隐私
    </el-button>

    <!-- 隐私信息调整form -->
    <el-dialog title="隐私信息" :visible.sync="privacyDialogVisible">
      <el-form ref="form" :inline="true" :model="formInline" label-width="200px">
        <el-form-item label="公开个人信息"> <el-switch v-model="privacyForm.isInfoPublic" /> </el-form-item>
        <el-form-item label="公开自己发表过的评论"> <el-switch v-model="privacyForm.isCommentPublic" /> </el-form-item>
        <el-form-item>
          <el-button type="primary" style="margin-left: 35%" @click="updatePrivacy" plain>更新隐私</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

<!--    <div style="margin-top: 10px"> <img :src="avatar" alt="gif加载失败"> </div>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { changeInformation, changePrivacy, getInfo } from '@/api/user/user'

export default {
  data() {
    return {
      userId: 0,
      username: '',
      password: '',
      introduction: '',
      createTime: '',
      editDrawerVisible: false,
      privacyDialogVisible: false,
      privacyForm: {
        isInfoPublic: false,
        isCommentPublic: false
      }
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'token',
      'roles'
    ])
  },
  // 获取用户自身信息
  created() {
    this.fetchData()
  },

  methods: {
    // 刷新信息
    fetchData() {
      getInfo(this.token).then(response => {
        if (response.success === true) {
          const user = response.data.user
          this.userId = user.userId
          this.username = user.username
          this.createTime = user.createTime
          this.introduction = user.introduction
          this.privacyForm.isInfoPublic = user.isInfoPublic
          this.privacyForm.isCommentPublic = user.isCommentPublic
        } else { this.$message.error(response.message) }
      })
    },

    // 关闭drawer
    closeDrawer() {
      this.$confirm('取消修改个人信息？')
        .then(_ => {
          this.editDrawerVisible = false
          this.fetchData()
        })
        .catch(_ => {
        })
    },

    // 更新个人信息
    updateSelfInfo() {
      const editDrawerForm = {
        'username': this.username,
        'password': this.password,
        'introduction': this.introduction
      }
      changeInformation(editDrawerForm).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.editDrawerVisible = false
        } else {
          this.$message.error(response.message)
        }
        this.fetchData()
      })
    },

    updatePrivacy() {
      changePrivacy(this.privacyForm).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.privacyDialogVisible = false
        } else {
          this.$message.error(response.message)
        }
        this.fetchData()
      })
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
