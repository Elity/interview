<template>
  <div class="jobs">
    <tz-table
      :columns="columns"
      :pagination.sync="pagination"
      :data="tableData"
    >
      <template #handle="{index,row}">
        <!-- <nuxt-link :to="`/job/add-job/${row.objectId}`"
          ><el-button type="text">编辑</el-button></nuxt-link
        > -->
        <tz-dialog :onOk="handleOnOk" :data="row.user" title="编辑角色">
          <el-button @click="handleEditUserRole(row.user)" type="text"
            >编辑角色</el-button
          >
          <template #content>
            <el-checkbox-group v-model="selectedRoles">
              <el-checkbox
                v-for="role in roles"
                :label="role.get('objectId')"
                :key="role.get('objectId')"
                >{{ role.get('name') }}</el-checkbox
              >
            </el-checkbox-group>
          </template>
        </tz-dialog>
      </template>
    </tz-table>
  </div>
</template>

<script>
import TzTable from '@/components/TzTable'
import TzDialog from '@/components/TzDialog'

export default {
  name: 'Users',
  layout: 'admin',
  head: {
    title: '用户管理'
  },
  components: {
    TzTable,
    TzDialog
  },
  data() {
    return {
      columns: [
        { title: '序号', type: 'index' },
        { title: '用户名', key: 'username' },
        { title: '邮箱', key: 'email' },
        { title: '操作', slotName: 'handle' }
      ],
      tableData: [],
      pagination: {
        pageSize: 10,
        pageIndex: 1,
        pageTotal: 10
      },
      roles: [],
      selectedRoles: []
    }
  },
  async created() {
    this.watchPaging()
    await this.getUsers()
    this.getRoles()
  },
  methods: {
    async getUsers() {
      const query = new this.$AV.Query(this.$AV.User)
      // 查询总数
      this.pagination.pageTotal = await query.count()
      const users = await query
        .select(['username', 'email'])
        .descending('createdAt')
        .limit(this.pagination.pageSize)
        .skip((this.pagination.pageIndex - 1) * this.pagination.pageSize)
        .find()
      this.tableData = users.map((item) => ({ ...item.toJSON(), user: item }))
    },
    async getRoles() {
      const roleQuery = new this.$AV.Query(this.$AV.Role)
      this.roles = await roleQuery.find()
    },
    async handleEditUserRole(user) {
      const roles = await user.getRoles()
      this.selectedRoles = roles.map((item) => item.get('objectId'))
    },
    async handleOnOk(user) {
      for (const role of this.roles) {
        const id = role.get('objectId')
        if (this.selectedRoles.includes(id)) {
          role.getUsers().add(user)
          await role.save()
        }
      }
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
          this.getUsers()
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
      menu:"用户管理",
      roles: ['admin']
    }
  }
</router>
