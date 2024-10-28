import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';

const routes = [
    {
        path: '/',
        name: 'login',
        component: LoginView
    },
    {
        path: '/teacher',
        name: 'teacher',
        component: () => import('/src/views/TeacherFrame.vue')
    },
    {
        path: '/student',
        name: 'student',
        component: () => import('/src/views/StudentFrame.vue')
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
