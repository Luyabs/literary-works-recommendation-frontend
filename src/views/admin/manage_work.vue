<template>
  <div style="margin-top: 20px; margin-left: 110px">
    <el-row :gutter="20">
      <!-- 增加form -->
      <el-col :span="10">
        <h2 style="text-align: center">新增作品</h2>
        <el-form ref="form" :model="add" label-width="80px">
          <el-form-item label="作品名" required> <el-input v-model="add.workName" /> </el-form-item>
          <el-form-item label="作品标签"> <el-input v-model="add.tags" placeholder="以空格隔开标签" type="textarea" rows="2" /> </el-form-item>
          <el-form-item label="作者"> <el-input v-model="add.author" /> </el-form-item>
          <el-form-item label="出版社"> <el-input v-model="add.publisher" /> </el-form-item>
          <el-form-item label="封面链接"> <el-input v-model="add.coverLink" /> </el-form-item>
          <el-form-item label="简介">
            <el-input
              v-model="add.introduction"
              type="textarea"
              rows="4"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="addNewWork()">新增作品</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <!-- 修改form -->
      <el-col :span="10">
        <h2 style="text-align: center">修改/删除作品</h2>
        <el-form ref="form" :model="edit" label-width="80px">
          <el-form-item label="作品ID" required> <el-input v-model="edit.workId" placeholder="输入ID以获取文学作品详细信息" @change="fetchById()" /> </el-form-item>
          <div v-if="edit.workId !== ''">
            <el-form-item label="作品名"> <el-input v-model="edit.workName" /> </el-form-item>
            <el-form-item label="作品标签"> <el-input v-model="edit.tags" placeholder="以空格隔开标签" type="textarea" rows="2" /> </el-form-item>
            <el-form-item label="作者"> <el-input v-model="edit.author" /> </el-form-item>
            <el-form-item label="出版社"> <el-input v-model="edit.publisher" /> </el-form-item>
            <el-form-item label="封面链接"> <el-input v-model="edit.coverLink" /> </el-form-item>
            <el-form-item label="最后更新"> <el-input v-model="edit.updateTime" disabled /> </el-form-item>
            <el-form-item label="简介">
              <el-input
                v-model="add.introduction"
                type="textarea"
                rows="2"
              />
            </el-form-item>
          </div>
          <el-form-item>
            <el-button type="primary" @click="editThisWork()">修改作品</el-button>
            <el-button type="danger" @click="deleteThisWork()">删除作品</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>

import { addWork, deleteWork, editWork, getById } from '@/api/work/work'

export default {
  data() {
    return {
      add: {
        workName: '',
        tags: '',
        author: '',
        publisher: '',
        coverLink: ''
      },
      edit: {
        workId: '',
        workName: '',
        tags: '',
        author: '',
        publisher: '',
        coverLink: '',
        updateTime: ''
      }
    }
  },
  created() {
  },
  methods: {
    freshEditForm() {
      this.edit = {
        workId: this.edit.workId,
        workName: '',
        tags: '',
        author: '',
        publisher: '',
        coverLink: '',
        updateTime: ''
      }
    },

    // 获取全部数据
    fetchById() {
      if (this.edit.workId === '') return
      this.freshEditForm()
      getById(this.edit.workId).then(response => {
        if (response.success === true) {
          this.edit = response.data.one
        } else { this.$message.error(response.message) }
      })
    },

    addNewWork() {
      addWork(this.add).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
          this.add = {}
        } else { this.$message.error(response.message) }
      })
    },

    editThisWork() {
      const data = {
        workId: this.edit.workId,
        workName: this.edit.workName,
        tags: this.edit.tags,
        author: this.edit.author,
        publisher: this.edit.publisher,
        coverLink: this.edit.coverLink
      }
      editWork(data).then(response => {
        if (response.success === true) {
          this.$message.success(response.message)
        } else {
          this.$message.error(response.message)
        }
        this.fetchById()
      })
    },

    deleteThisWork() {
      this.$confirm('确认永久删除本作品?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteWork(this.edit.workId).then(response => {
          if (response.success === true) {
            this.$message.success(response.message)
          } else {
            this.$message.error(response.message)
          }
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      }).finally(() => {
        this.freshEditForm()
      })
    }

  }
}
</script>
