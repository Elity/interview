<template>
  <div class="addinterview">
    <el-form ref="form" :model="interview" :rules="rules" :inline="true">
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model.trim="interview.name"
          :disabled="disableInfoEdit"
          placeholder="填写面试者姓名"
        />
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input
          v-model.number="interview.age"
          :disabled="disableInfoEdit"
          placeholder="填写面试者年龄"
        />
      </el-form-item>
      <el-form-item label="从业时间" prop="year">
        <el-input
          v-model.number="interview.year"
          :disabled="disableInfoEdit"
          placeholder="填写面试者从业时间"
        />
      </el-form-item>
      <el-form-item label="岗位" prop="job">
        <el-select
          v-model="interview.job"
          :disabled="disableInfoEdit"
          value-key="id"
          placeholder="选择岗位"
          filterable
        >
          <el-option
            :value="{ id: job.objectId, name: job.name }"
            :label="job.name"
            v-for="job in jobs"
            :key="job.objectId"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="interview.createdAt" label="面试时间">
        {{ interview.createdAt }}
      </el-form-item>
      <el-table
        :data="tableDataComp"
        :span-method="cellMerge"
        class="addinterview__table"
        border
      >
        <el-table-column label="评分项" align="center">
          <el-table-column
            label="主项"
            prop="item"
            align="center"
            width="300"
          />
          <el-table-column
            label="子项"
            prop="subItem"
            align="center"
            width="300"
          />
        </el-table-column>
        <el-table-column label="评分标准" prop="content" align="center" />
        <el-table-column label="评分" align="center" width="300">
          <template #default="{$index}">
            <el-input
              :disabled="disableOtherEdit"
              v-model.number="tableData[$index].score"
              placeholder="填写该项评分"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-card class="box-card">
        <div class="addinterview__evaluate">
          <el-form-item label="面试者自评" prop="selfEvaluate">
            <el-input
              v-model="interview.selfEvaluate"
              :disabled="disableOtherEdit"
              rows="10"
              style="width:400px"
              placeholder="填写面试者自我评价"
              type="textarea"
            />
          </el-form-item>
          <el-form-item label="面试官评价" prop="evaluate">
            <el-input
              v-model="interview.evaluate"
              :disabled="disableOtherEdit"
              rows="10"
              style="width:400px"
              placeholder="填写您对面试者的评价"
              type="textarea"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox
              :disabled="disableOtherEdit"
              v-model="interview.haveNext"
              label="是否继续后续流程"
              border
            ></el-checkbox>
            <div class="addinterview__score">{{ score }}分</div>
          </el-form-item>
        </div>
        <div class="addinterview__sumbit">
          <el-button
            @click="handleSubmit"
            v-if="!disableOtherEdit"
            :loading="loading"
            type="primary"
            >保存</el-button
          >
          <nuxt-link to="/interview"><el-button>返回</el-button></nuxt-link>
        </div>
      </el-card>
    </el-form>
  </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'AddIntervi',
  layout: 'admin',
  head: {
    title: '面试信息填写'
  },
  data() {
    this.rules = {
      name: [{ required: true, message: '请填写应聘者姓名' }],
      job: [{ required: true, message: '请选择应聘岗位' }],
      evaluate: [{ required: true, message: '请填写对面试者的评价' }],
      age: [
        { required: true, message: '请填写应聘者年龄' },
        { type: 'number', message: '年龄必须为数字值' }
      ],
      year: [
        { required: true, message: '请填写应聘者从业时间' },
        { type: 'number', message: '从业时间必须为数字值' }
      ]
    }
    return {
      interviewId: null,
      interviewer: {},
      jobs: [],
      interview: { haveNext: false, interviewer: {} },
      tableData: [],
      loading: false
    }
  },
  computed: {
    disableInfoEdit() {
      return !!this.interviewId || this.disableOtherEdit
    },
    disableOtherEdit() {
      return (
        !!this.interviewId &&
        this.$store.getters['user/userInfo'].objectId !==
          this.interviewer.objectId
      )
    },
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
    },
    score() {
      return this.tableData.reduce((acc, cur) => {
        return (acc += cur.score || 0)
      }, 0)
    }
  },
  watch: {
    'interview.job'(val) {
      if (!this.interviewId)
        this.tableData = this.jobs.find((item) => item.objectId === val.id).data
    }
  },
  async created() {
    const interviewId = this.$route.params.id
    await this.getJobs()
    if (interviewId) {
      this.interviewId = interviewId
      await this.getInterview()
    }
  },
  methods: {
    async getJobs() {
      const query = new this.$AV.Query('Job')
      const jobs = await query.find()
      this.jobs = jobs.map((item) => item.toJSON())
    },
    async getInterview() {
      const query = new this.$AV.Query('Interview')
      const interview = await query.get(this.interviewId)
      const obj = interview.toJSON()
      const { data, createdAt, interviewer, ...other } = obj
      this.tableData = data
      this.interview = other
      this.interviewer = interviewer
      this.interview.createdAt = dayjs(createdAt).format('YYYY-MM-DD HH:mm')
    },
    async handleSubmit() {
      try {
        await this.$refs.form.validate()
      } catch (err) {
        throw new Error('请完整填写完应聘者信息')
      }
      this.loading = true
      try {
        if (this.interviewId) {
          await this.updateInterview()
        } else {
          await this.addInterview()
        }
      } finally {
        this.loading = false
      }
      this.$router.push('/interview')
      this.$message.success('操作成功')
    },
    async addInterview() {
      const interview = new this.$AV.Object('Interview')
        .set('name', this.interview.name)
        .set('age', this.interview.age)
        .set('year', this.interview.year)
        .set('job', this.interview.job)
        .set('evaluate', this.interview.evaluate)
        .set('selfEvaluate', this.interview.selfEvaluate)
        .set('haveNext', this.interview.haveNext)
        .set('score', this.score)
        .set('data', this.tableData)
        .set('interviewer', this.$AV.User.current())
      await interview.save()
    },
    async updateInterview() {
      const interview = this.$AV.Object.createWithoutData(
        'Interview',
        this.interviewId
      )
        .set('evaluate', this.interview.evaluate)
        .set('selfEvaluate', this.interview.selfEvaluate)
        .set('haveNext', this.interview.haveNext)
        .set('score', this.score)
        .set('data', this.tableData)
      await interview.save()
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
.addinterview {
  .el-card {
    border-top-color: transparent;
    box-shadow: none;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  &__name {
    padding: 20px 0;
  }
  &__handler {
    padding: 0 15px;
  }
  &__sumbit {
    text-align: center;
    padding: 30px 0;
    > .el-button {
      margin-right: 20px;
    }
  }
  &__score {
    color: red;
    font-size: 50px;
    margin-top: 70px;
    text-align: center;
  }
  &__evaluate {
    display: flex;
    .el-form-item {
      flex: 1;
    }
    textarea {
      resize: none;
    }
  }
}
</style>
<router>
  {
    meta: {
      roles: ['admin', 'interviewer', 'hr']
    }
  }
</router>
