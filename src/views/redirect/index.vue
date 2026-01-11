<template>
  <div></div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import useUserStore from '@/store/modules/user'
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { params, query } = route
const { path } = params

onMounted(async () => {
  // 确保动态路由已加载完成
  if (userStore.roles.length === 0) {
    await userStore.getInfo()
    await permissionStore.generateRoutes()
  }
  // 跳转到原路径
  router.replace({ path: '/' + path, query })
})
</script>