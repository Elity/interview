<template>
  <div class="addjob">
    <div class="addjob__name">
      <el-input
        ref="job-name"
        v-model.trim="name"
        placeholder="请输入岗位名称"
        size="medium"
      >
        <template slot="prepend">岗位名称：</template>
      </el-input>
    </div>
    <el-table
      :data="tableDataComp"
      :span-method="cellMerge"
      class="addjob__table"
      border
    >
      <el-table-column label="考核项目">
        <template #default="{$index}">
          <el-input
            v-model.trim="tableData[$index].item"
            placeholder="请输入考核项目"
          />
        </template>
      </el-table-column>
      <el-table-column label="考核子项">
        <template #default="{$index}">
          <el-input
            v-model.trim="tableData[$index].subItem"
            placeholder="请输入考核子项"
          />
        </template>
      </el-table-column>
      <el-table-column label="评分标准">
        <template #default="{$index}">
          <el-input
            v-model="tableData[$index].content"
            type="textarea"
            placeholder="请输入评分标准"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{row,$index}">
          <div class="addjob__handler">
            <el-button @click="handleAddChild(row, $index)" type="text"
              >新增考核子项</el-button
            >
            <el-button @click="handleAddItem(row, $index)" type="text"
              >新增考核项</el-button
            >
            <el-button
              v-if="tableData.length > 1"
              @click="handleDelItem($index)"
              type="text"
              style="color:red"
              >删除</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="addjob__sumbit">
      <el-button @click="handleSubmit" :loading="loading" type="primary"
        >保存</el-button
      >
      <nuxt-link to="/job"><el-button>返回</el-button></nuxt-link>
    </div>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
import { showError } from '@/utils/index'
export default {
  name: 'AddJob',
  layout: 'admin',
  head: {
    title: '添加岗位'
  },
  data() {
    return {
      name: '',
      tableData: [
        {
          groupId: uuid(),
          item: '',
          subItem: '',
          content: ''
        }
      ],
      loading: false
    }
  },
  computed: {
    tableDataComp() {
      let rowspan = 1
      const backup = [...this.tableData].reverse()

      return backup
        .map(({ rowspan: num, ...item }, index) => {
          const nextItem = backup[index + 1]
          if (!nextItem || item.groupId !== nextItem.groupId) {
            item.rowspan = rowspan
            rowspan = 1
          } else {
            rowspan += 1
          }
          return item
        })
        .reverse()
    }
  },
  async created() {
    const jobId = this.$route.params.id
    if (jobId) {
      this.jobId = jobId
      await this.getJob()
    }
  },
  methods: {
    async getJob(id) {
      const query = new this.$AV.Query('Job')
      const job = await query.get(this.jobId)
      this.tableData = job.get('data')
      this.name = job.get('name')
    },
    async handleSubmit() {
      if (!this.name) {
        showError('请输入岗位名称')
        this.$refs['job-name'].focus()
        return
      }
      const data = this.tableData.filter(
        (item) => item.item && (item.subItem || item.content)
      )
      if (!data.length) {
        showError('请输入岗位信息')
      }
      this.loading = true
      try {
        if (this.jobId) {
          await this.updateJob()
        } else {
          await this.addJob()
        }
      } finally {
        this.loading = false
      }
      this.$router.push('/job')
      this.$message.success('操作成功')
    },
    async addJob() {
      const job = new this.$AV.Object('Job')
        .set('name', this.name)
        .set('data', this.tableData)
        .set('operator', this.$AV.User.current())
        .set('disable', 0)
      await job.save()
    },
    async updateJob() {
      const job = this.$AV.Object.createWithoutData('Job', this.jobId)
        .set('name', this.name)
        .set('data', this.tableData)
      await job.save()
    },
    handleAddChild(row, $index) {
      this.tableData.splice($index + 1, 0, {
        groupId: row.groupId,
        item: row.item,
        subItem: '',
        content: ''
      })
    },
    handleAddItem(row, $index) {
      let index = this.tableData.findIndex((item, index) => {
        if (index < $index) return
        if (index + 1 === this.tableData.length) return true
        if (item.groupId !== this.tableData[index + 1].groupId) return true
      })
      if (index === -1) index = this.tableData.length - 1
      this.tableData.splice(index + 1, 0, {
        groupId: uuid(),
        item: '',
        subItem: '',
        content: ''
      })
    },
    handleDelItem(index) {
      this.tableData.splice(index, 1)
    },
    cellMerge({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        if (row.rowspan) {
          return [row.rowspan, 1]
        } else {
          return [0, 0]
        }
      }
    }
  }
}
</script>
<style lang="scss">
.addjob {
  .el-input__inner,
  .el-textarea__inner {
    &:focus {
      border: 1px solid #409eff;
    }
  }
  &__name {
    .el-input-group__prepend {
      border-bottom-color: transparent;
      border-bottom-left-radius: 0;
    }
    .el-input__inner {
      border-bottom-color: transparent;
      border-bottom-right-radius: 0;
      padding: 30px 15px;
    }
  }
  &__table {
    .el-input__inner {
      border-color: transparent;
      padding: 30px 15px;
    }
    .el-textarea__inner {
      border-color: transparent;
      padding-top: 0px;
      padding-bottom: 0px;
      height: 62px;
      resize: none;
    }
    td {
      padding: 0;
      > .cell {
        padding: 0 !important;
      }
    }
  }
  &__handler {
    padding: 0 15px;
  }
  &__sumbit {
    text-align: right;
    padding: 30px 0;
  }
}
</style>
<router>
  {
    meta: {
      roles: ['admin']
    }
  }
</router>
