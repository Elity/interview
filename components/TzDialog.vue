<template>
  <span>
    <span @click="visible = true">
      <slot />
    </span>
    <el-dialog :visible.sync="visible" :title="title" width="30%">
      <slot name="content" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button @click="handleOk" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </span>
</template>

<script>
export default {
  name: 'TzDialog',
  props: {
    title: {
      type: String,
      required: true
    },
    onOk: {
      type: Function,
      default() {
        return async function() {}
      }
    },
    data: {
      default: undefined,
      validator: () => true
    }
  },
  data() {
    return {
      visible: false,
      loading: false
    }
  },
  methods: {
    async handleOk() {
      this.loading = true
      try {
        await this.onOk(this.data)
        this.visible = false
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
