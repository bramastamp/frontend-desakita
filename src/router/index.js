import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '../layouts/AdminLayout.vue';
import UserLayout from '../layouts/UserLayout.vue';

// Auth
import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard.vue';
import HeadFamilies from '../pages/admin/HeadOfFamilies.vue';
import Residents from '../pages/admin/Residents.vue';
import SocialAidsList from '../pages/admin/socialAids/SocialAidsList.vue';
import SocialAidsApplications from '../pages/admin/socialAids/SocialAidsApplications.vue';
import Developments from '../pages/admin/Developments.vue';
import Events from '../pages/admin/Events.vue';
import VillageProfile from '../pages/admin/VillageProfile.vue'

// User pages
import UserDashboard from '../pages/user/Dashboard.vue';
import MyResidents from '../pages/user/MyResidents.vue';
import MyAids from '../pages/user/MyAids.vue';
import HeadOfFamiliesAdd from '../pages/admin/HeadOfFamiliesAdd.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'head-families', component: HeadFamilies },
      { path: 'head-families/add', component: HeadOfFamiliesAdd },
      { path: 'residents', component: Residents },
      { path: 'developments', component: Developments },
      { path: 'events', component: Events },
      { path: 'village-profile', component: VillageProfile },

      {
        path: 'social-aids',
        children: [
          { path: 'list', component: SocialAidsList },
          { path: 'applications', component: SocialAidsApplications },
          { path: '', redirect: '/admin/social-aids/list' }, // default route
        ],
      },
    ],
  },

  {
    path: '/user',
    component: UserLayout,
    children: [
      { path: 'dashboard', component: UserDashboard },
      { path: 'my-residents', component: MyResidents },
      { path: 'my-aids', component: MyAids },
      { path: 'village-profile', component: VillageProfile },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token && to.path !== '/login' && to.path !== '/register') {
    return next('/login');
  }

  if (to.path.startsWith('/admin') && role !== 'admin') {
    return next('/user/dashboard');
  }

  if (to.path.startsWith('/user') && role !== 'user') {
    return next('/admin/dashboard');
  }

  next();
});

export default router;
