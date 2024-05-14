import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
/**
 * 无需权限的路由
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    hidden: true
  },

  {
    path: '/register',
    component: () => import('@/views/register/register'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/homepage',
    children: [{
      path: 'homepage',
      name: 'homepage',
      component: () => import('@/views/work/homepage'),
      meta: { title: '首页', icon: 'el-icon-position', affix: true }
    }]
  },

  {
    path: '/work',
    name: 'work',
    redirect: '/work/recommend',
    component: Layout,
    meta: { title: '文学作品', icon: 'el-icon-notebook-2' },
    children: [{
      path: 'recommend',
      name: 'recommend',
      component: () => import('@/views/work/recommend'),
      meta: { title: '个性化推荐', icon: 'el-icon-present' }
    }, {
      path: 'query',
      name: 'query',
      component: () => import('@/views/work/query'),
      meta: { title: '检索', icon: 'el-icon-search' }
    }, {
      path: 'detail',
      name: 'detail',
      hidden: true,
      component: () => import('@/views/work/detail'),
      meta: { title: '详情信息', icon: 'el-icon-search' }
    }]
  },

  {
    path: '/my',
    name: 'my',
    redirect: '/my/info',
    component: Layout,
    meta: { title: '个人信息', icon: 'el-icon-user' },
    children: [{
      path: 'info',
      name: 'info',
      component: () => import('@/views/my/my_info'),
      meta: { title: '基础信息', icon: 'el-icon-postcard' }
    }, {
      path: 'review',
      name: 'review',
      component: () => import('@/views/my/my_review'),
      meta: { title: '我的评论', icon: 'el-icon-chat-dot-square' }
    }]
  },

  {
    path: '/collection',
    name: 'collection',
    component: Layout,
    children: [{
      path: '',
      name: '',
      component: () => import('@/views/collection/collection'),
      meta: { title: '收藏夹', icon: 'el-icon-star-off' }
    }]
  },

  {
    path: '/history',
    name: 'history',
    component: Layout,
    children: [{
      path: '',
      name: '',
      component: () => import('@/views/history/history'),
      meta: { title: '历史记录', icon: 'el-icon-time' }
    }]
  },

  {
    path: '/visit_other',
    name: 'visit_other',
    component: Layout,
    children: [{
      path: '',
      name: '',
      component: () => import('@/views/visit/visit_other'),
      meta: { title: '用户查询', icon: 'el-icon-connection' }
    }]
  }
]

/**
 * 权限路由
 */
export const asyncRoutes = [
  {
    path: '/manage_work',
    name: 'manage_work',
    component: Layout,
    children: [{
      path: '',
      name: '',
      component: () => import('@/views/admin/manage_work'),
      meta: { roles: ['admin'], title: '作品管理', icon: 'el-icon-folder-add' }
    }]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
