import { createRouter, createWebHistory } from 'vue-router';

// Layouts
import AdminLayout from '../layouts/AdminLayout.vue';
import UserLayout from '../layouts/UserLayout.vue';

// Auth
import Login from '../pages/auth/Login.vue';
import Register from '../pages/auth/Register.vue';

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard.vue';

import HeadOfFamilies from '../pages/admin/HeadOfFamilies.vue';
import HeadOfFamiliesAdd from '../pages/admin/AddHeadOfFamily.vue';
import HeadOfFamiliesEdit from '../pages/admin/EditHeadOfFamily.vue';
import HeadOfFamiliesDetail from '../pages/admin/HeadOfFamilyDetail.vue';

import SocialAidsList from '../pages/admin/socialAids/SocialAidsList.vue';
import SocialAidsAdd from '../pages/admin/socialAids/AddSocialAid.vue';
import SocialAidsEdit from '../pages/admin/socialAids/EditSocialAid.vue';
import SocialAidsDetail from '../pages/admin/socialAids/SocialAidsDetail.vue';
import RecipientsList from '../pages/admin/socialAids/RecipientsList.vue';

import Developments from '../pages/admin/Developments.vue';
import DevelopmentsAdd from '../pages/admin/AddDevelopments.vue';
import DevelopmentsEdit from '../pages/admin/EditDevelopment.vue';

import Events from '../pages/admin/Events.vue';
import EventsAdd from '../pages/admin/AddEvent.vue';
import EventsEdit from '../pages/admin/EditEvent.vue';

import VillageProfile from '../pages/admin/VillageProfile.vue';

// User pages
import UserDashboard from '../pages/user/Dashboard.vue';
import MyResidents from '../pages/user/MyResidents.vue';
import MyResidentsAdd from '../pages/user/AddMyResident.vue';
import MyResidentsEdit from '../pages/user/EditMyResident.vue';
import UserDevelopments from '../pages/user/Developments.vue';
import UserEvents from '../pages/user/Events.vue';
import UserSocialAidsList from '../pages/user/socialAids/SocialAidsList.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: 'head-of-families', component: HeadOfFamilies },
      { path: 'head-of-families/add', component: HeadOfFamiliesAdd },
      { path: 'head-of-families/edit/:id', component: HeadOfFamiliesEdit },
      { path: 'head-of-families/detail/:id', component: HeadOfFamiliesDetail },
      { path: 'developments', component: Developments },
      { path: 'developments/add', component: DevelopmentsAdd },
      { path: 'developments/edit/:id', component: DevelopmentsEdit },
      { path: 'events', component: Events },
      { path: 'events/add', component: EventsAdd },
      { path: 'events/edit/:id', component: EventsEdit },
      { path: 'village-profile', component: VillageProfile },

      {
        path: 'social-aids',
        children: [
          { path: 'list', component: SocialAidsList },
          { path: 'add', component: SocialAidsAdd },
          { path: ':id', component: SocialAidsDetail },
          { path: ':id/edit', component: SocialAidsEdit },
          { path: 'recipients', component: RecipientsList },
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
      { path: 'my-residents/add', component: MyResidentsAdd },
      { path: 'my-residents/edit/:id', component: MyResidentsEdit },
      { path: 'developments', component: UserDevelopments },
      { path: 'events', component: UserEvents },
      { path: 'village-profile', component: VillageProfile },

      {
        path: 'social-aids',
        children: [
          { path: 'list', component: UserSocialAidsList },
        ],
      },
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
