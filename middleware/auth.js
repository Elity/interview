function checkAuth(routeMeta, userRoles = []) {
  const roleItem = routeMeta.find((item) => item.roles)
  // 无需鉴权页面
  if (!roleItem) return true
  for (const role of roleItem.roles) {
    // 用户拥有菜单需要的某个角色
    if (userRoles.includes(role)) return true
  }
}

function needLogin(routeMeta) {
  return routeMeta.some((item) => item.roles)
}

export default async function({ store, redirect, route, error }) {
  await store.dispatch('user/getUserInfo')
  const userInfo = store.getters['user/userInfo']
  // 需要登录，但用户未登录
  if (needLogin(route.meta) && !userInfo) {
    return redirect(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  }
  const userRoles = store.getters['user/roles']
  // 已登录，无页面权限
  if (!checkAuth(route.meta, userRoles)) {
    return error({
      statusCode: 403,
      message: '无权限'
    })
  }
}
