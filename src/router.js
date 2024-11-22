import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import AssignmentDetail from "@/components/GradeAssignment.vue";

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
    {
        path: '/course-notifications', // 路由路径，使用参数传递课程ID
        name: 'CourseNotifications',
        component: () => import('/src/views/CourseNotifications.vue')
    },
    {
        path: '/assignment-detail',
        name: 'AssignmentDetail',
        component: AssignmentDetail,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
