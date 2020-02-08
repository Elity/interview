<template>
  <div class="jobs">
    <el-row>
      <el-col :span="6">
        <el-input
          v-model.trim="searchName"
          @keyup.native.enter="search"
          placeholder="搜索面试者姓名"
        >
          <el-button
            slot="append"
            @click="search"
            icon="el-icon-search"
          ></el-button>
        </el-input>
      </el-col>
      <el-col :span="8" :offset="10" style="text-align:right"
        ><nuxt-link to="/interview/add-interview"
          ><el-button type="primary">开始面试</el-button></nuxt-link
        ></el-col
      >
    </el-row>

    <tz-table
      :columns="columns"
      :pagination.sync="pagination"
      :data="tableData"
    >
      <template #handle="{index,row}">
        <nuxt-link :to="`/interview/add-interview/${row.objectId}`"
          ><el-button type="text">{{
            isMineInterview(row.interviewer) ? '编辑' : '查看'
          }}</el-button></nuxt-link
        >
        <tz-confirm
          :data="index"
          :onOk="delInterview"
          v-if="isMineInterview(row.interviewer)"
          msg="确定要删除该面试吗"
        >
          <el-button type="text" style="color:red">删除</el-button>
        </tz-confirm>
      </template>
    </tz-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TzTable from '@/components/TzTable'
import TzConfirm from '@/components/TzConfirm'

export default {
  name: 'Jobs',
  layout: 'admin',
  head: {
    title: '面试管理'
  },
  components: {
    TzTable,
    TzConfirm
  },
  data() {
    return {
      searchName: '',
      columns: [
        { title: '序号', type: 'index' },
        { title: '姓名', key: 'name' },
        { title: '岗位', key: 'job', render: (val) => val.name },
        {
          title: '是否有后续流程',
          key: 'haveNext',
          render: (val) => (val ? '有' : '无')
        },
        {
          title: '时间',
          key: 'createdAt',
          render: (val) => dayjs(val).format('YYYY-MM-DD HH:mm')
        },
        { title: '操作', slotName: 'handle' }
      ],
      tableData: [],
      pagination: {
        pageSize: 10,
        pageIndex: 1,
        pageTotal: 10
      }
    }
  },
  async created() {
    this.watchPaging()
    await this.getInterviews(this.pagination)
  },
  methods: {
    async getInterviews(pagination) {
      const {
        pageSize = this.pagination.pageSize,
        pageIndex = this.pagination.pageIndex
      } = pagination
      let query = new this.$AV.Query('Interview')
      if (this.searchName) {
        query = query.startsWith('name', this.searchName)
      }
      // 查询总数
      this.pagination.pageTotal = await query.count()
      const jobs = await query
        .select(['name', 'job', 'haveNext', 'interviewer'])
        .descending('createdAt')
        .limit(pageSize)
        .skip((pageIndex - 1) * pageSize)
        .find()
      this.tableData = jobs.map((item) => item.toJSON())
    },
    async delInterview(index) {
      const id = this.tableData[index].objectId
      const job = this.$AV.Object.createWithoutData('Interview', id)
      await job.destroy()
      this.tableData.splice(index, 1)
    },
    async search() {
      await this.getInterviews({ pageIndex: 1 })
    },
    isMineInterview(interviewer = {}) {
      return (
        this.$store.getters['user/userInfo'].objectId === interviewer.objectId
      )
    },
    watchPaging() {
      this.$watch(
        function() {
          return {
            pageSize: this.pagination.pageSize,
            pageIndex: this.pagination.pageIndex
          }
        },
        function(val) {
          this.getInterviews(val)
        }
      )
    }
  }
}
</script>
<router>
  {
    meta: {
      menu: '面试管理',
      roles: ['admin', 'interviewer', 'hr']
    }
  }
</router>
