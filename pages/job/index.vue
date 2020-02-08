<template>
  <div class="jobs">
    <div class="jobs__header">
      <nuxt-link to="/job/add-job"
        ><el-button type="primary">新增岗位</el-button></nuxt-link
      >
    </div>
    <tz-table
      :columns="columns"
      :pagination.sync="pagination"
      :data="tableData"
    >
      <template #handle="{index,row}">
        <nuxt-link :to="`/job/add-job/${row.objectId}`"
          ><el-button type="text">编辑</el-button></nuxt-link
        >
        <tz-confirm :data="index" :onOk="delJob" msg="确定要删除该岗位吗">
          <el-button type="text" style="color:red">删除</el-button>
        </tz-confirm>
      </template>
    </tz-table>
  </div>
</template>

<script>
import TzTable from '@/components/TzTable'
import TzConfirm from '@/components/TzConfirm'

export default {
  name: 'Jobs',
  layout: 'admin',
  head: {
    title: '岗位管理'
  },
  components: {
    TzTable,
    TzConfirm
  },
  data() {
    return {
      columns: [
        { title: '序号', type: 'index' },
        { title: '岗位名称', key: 'name' },
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
    await this.getJobs()
  },
  methods: {
    async getJobs() {
      const query = new this.$AV.Query('Job').notEqualTo('disable', 1)
      // 查询总数
      this.pagination.pageTotal = await query.count()
      const jobs = await query
        .select(['name', 'data'])
        .descending('createdAt')
        .limit(this.pagination.pageSize)
        .skip((this.pagination.pageIndex - 1) * this.pagination.pageSize)
        .find()
      this.tableData = jobs.map((item) => item.toJSON())
    },
    async delJob(index) {
      const id = this.tableData[index].objectId
      const job = this.$AV.Object.createWithoutData('Job', id)
      await job.destroy()
      this.tableData.splice(index, 1)
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
          this.getJobs()
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.jobs {
  &__header {
    padding: 0 20px;
    text-align: right;
  }
}
</style>
<router>
  {
    meta: {
      menu:"岗位管理",
      roles: ['admin']
    }
  }
</router>
