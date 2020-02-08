<template>
  <div>
    Hello World!
  </div>
</template>

<script>
export default {
  name: 'Admin',
  layout: 'admin'
}
</script>
<router>
  {
    meta: {
      menu: '后台管理',
      roles:['admin', 'interviewer', 'hr']
    }
  }
</router>
