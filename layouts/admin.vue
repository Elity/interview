<template>
  <div class="adminlayout">
    <el-menu
      :router="true"
      :default-active="activeMenu"
      class="adminlayout__menu"
      mode="horizontal"
    >
      <template v-for="(menu, index) in authMenus">
        <el-submenu
          :key="index"
          :index="index + ''"
          v-if="menu.children"
          v-bind="omit(menu, 'children', 'title')"
        >
          <template slot="title">{{ menu.title }}</template>
          <el-menu-item
            v-for="(child, innerIndex) in menu.children"
            :route="{ path: child.path, query: child.query }"
            :index="`${index}-${innerIndex}`"
            :key="innerIndex"
            v-bind="omit(child, 'path', 'query', 'title')"
            >{{ child.title }}</el-menu-item
          >
        </el-submenu>
        <el-menu-item
          v-else
          :route="{ path: menu.path, query: menu.query }"
          :index="index + ''"
          :key="index"
          v-bind="omit(menu, 'path', 'query', 'title')"
          >{{ menu.title }}</el-menu-item
        >
      </template>
    </el-menu>
    <div class="adminlayout__content">
      <span v-for="(a, b) in authMenus" :key="b"></span>
      <nuxt />
    </div>
  </div>
</template>
<script>
import { omit } from '@/utils/data-helper'
export default {
  name: 'AdminLayout',
  data() {
    return {
      menus: [
        { title: '首页', path: '/admin' },
        { title: '用户管理', path: '/user' },
        { title: '岗位管理', path: '/job' },
        { title: '面试管理', path: '/interview' }
        // {
        //   title: '二级菜单',
        //   children: [
        //     { title: '二级菜单1', path: '/a' },
        //     { title: '二级菜单2', path: '/b', disabled: true }
        //   ]
        // }
      ]
    }
  },
  computed: {
    activeMenu() {
      const { path } = this.$route
      for (let i = 0; i < this.authMenus.length; i++) {
        if (this.authMenus[i].path === path) return String(i)
        if (this.authMenus[i].children) {
          for (let j = 0; j < this.authMenus[i].children.length; j++) {
            if (this.authMenus[i].children[j].path === path) {
              return `${i}-${j}`
            }
          }
        }
      }
      return '0'
    },
    authMenus() {
      const routes = this.$router.options.routes
        .filter((route) => {
          // 未定义菜单项，不需要
          if (!route.meta || !route.meta.menu) return false
          // 未定义权限，任何人都可以显示
          if (!route.meta.roles) return true
          const roles = this.$store.getters['user/roles']
          return route.meta.roles.some((role) => roles.includes(role))
        })
        .map((route) => ({ ...route, title: route.meta.menu }))
      return routes
    }
  },
  methods: { omit }
}
</script>
<style scoped lang="scss">
.adminlayout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  &__content {
    flex: 1;
    padding: 20px;
  }
}
</style>
