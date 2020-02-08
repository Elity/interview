<template>
  <div class="tztable">
    <div class="tztable__table">
      <el-table v-bind="attrs" :border="false" v-on="$listeners">
        <template v-for="column in columns">
          <el-table-column
            v-if="column.type === 'selection'"
            :key="column.key"
            :type="column.type"
            align="center"
          ></el-table-column>
          <el-table-column
            v-else
            :key="column.key"
            v-slot:default="{ row, $index: index }"
            :label="column.title"
            v-bind="omit(column, 'key', 'title', 'index')"
            align="center"
          >
            <template v-if="column.type !== 'index'">
              <slot
                v-if="column.slotName"
                :name="column.slotName"
                :row="row"
                :index="index"
              ></slot>
              <span v-else>
                {{ renderColumn(column.key, row[column.key], column.render) }}
              </span>
            </template>
            <template v-else>{{ column.index || getIndex(index) }}</template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <div class="tztable__paging">
      <el-pagination
        v-if="pagination.pageTotal"
        v-bind="paging"
        @size-change="handlePageChange('pageSize', $event)"
        @current-change="handlePageChange('pageIndex', $event)"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { omit, mapKeys } from '@/utils/data-helper'

export default {
  name: 'TzTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    pagination: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    attrs() {
      return {
        border: true,
        emptyText: '没有相关的数据',
        ...this.$attrs
      }
    },
    paging() {
      return {
        currentPage: 1,
        pageSize: 15,
        layout: 'total, prev, pager, next, sizes, jumper',
        pageSizes: [10, 15, 20, 50, 100],
        background: true,
        stripe: true,
        ...mapKeys(this.pagination, {
          pageIndex: 'currentPage',
          pageTotal: 'total'
        })
      }
    }
  },
  methods: {
    omit,
    getIndex(index) {
      const { pageIndex = 1, pageSize = 0 } = this.pagination
      return (pageIndex - 1) * pageSize + index + 1
    },
    renderColumn(k, v, render) {
      if (!render) return v
      if (typeof render === 'function') return render(v, k)
      if (typeof render === 'object') {
        return Object.prototype.hasOwnProperty.call(render, v)
          ? render[v]
          : render.default
      }
      return ''
    },
    handlePageChange(type, val) {
      this.$emit('update:pagination', {
        ...this.pagination,
        [type]: val
      })
    }
  }
}
</script>
<style scoped lang="scss">
.tztable {
  display: flex;
  flex-direction: column;
  height: 100%;
  &__table {
    flex: 1;
  }
  &__paging {
    text-align: right;
    padding: 10px;
  }
}
</style>
