import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// 创建 Axios 实例
const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:5000',
    timeout: 10000, // 请求超时时间
    headers: {
        'Authorization': 'Bearer your_token', // 例如添加身份验证令牌
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});


// 创建 Vue 应用实例
const app = createApp(App);

// 将 Axios 实例添加到全局原型
app.config.globalProperties.$axios = axiosInstance;

// 使用路由
app.use(router);

// 挂载 Vue 应用
app.mount('#app');
