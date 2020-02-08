<template>
  <el-popover v-model="show" :disabled="disabled" placement="top" width="180">
    <p style="padding:10px">{{ msg }}</p>
    <div style="text-align: right; margin: 10px 0">
      <el-button @click="show = false" size="mini" type="text">取消</el-button>
      <el-button :loading="loading" @click="handleOk" type="primary" size="mini"
        >确定</el-button
      >
    </div>
    <span slot="reference">
      <slot></slot>
    </span>
  </el-popover>
</template>

<script>
/**
 * 轻量级确认框
 */
export default {
  name: 'TzConfirm',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    onOk: {
      type: Function,
      required: true
    },
    data: {
      default: undefined,
      validator: () => true
    },
    msg: {
      type: String,
      default: '确定要执行该操作吗？'
    }
  },
  data() {
    return {
      show: false,
      loading: false
    }
  },
  methods: {
    async handleOk() {
      this.loading = true
      try {
        await this.onOk(this.data)
      } finally {
        this.show = false
        this.loading = false
      }
    }
  }
}
</script>
