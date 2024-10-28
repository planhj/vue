<template>
  <DashboardLayout  :user="user" :announcement="announcement" @tab-changed="handleTabChange">
    <template #content>
      <UserProfile v-if="activeTab === 'profile'" :user="user" />
      <div v-if="activeTab === 'courses'">
        <h2>我的课程</h2>
        <!-- 课程列表内容 -->
      </div>
      <MySchedule v-if="activeTab === 'schedule'" :courses="courses" />
      <div v-if="activeTab === 'publishNotification'">
        <h2>发布通知</h2>
        <!-- 发布通知内容 -->
      </div>
      <div v-if="activeTab === 'publishHomework'">
        <h2>发布作业</h2>
        <!-- 发布作业内容 -->
      </div>
      <div v-if="activeTab === 'correctHomework'">
        <h2>作业批改</h2>
        <!-- 作业批改内容 -->
      </div>
    </template>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../components/GeneralLayout.vue';
import UserProfile from '../components/UserProfile.vue';
import MySchedule from '@/components/MySchedule.vue';
import axios from "axios";

export default {
  components: {
    DashboardLayout,
    UserProfile,
    MySchedule
  },
  data() {
    return {
      user: {
        id: '',
        name: '',
        class_name: '',
        email: '',
        tel: '',
        avatar_url: '',
        role: ''
      },
      courses: [],
      activeTab:'courses',
      activeSubTab: '',
      announcement: {/* 公告数据 */}
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      const userId = sessionStorage.getItem('user_id');
      // 请求用户、课程、公告等数据
      this.$axios.get(`/auth/send_data/${userId}`)
          .then(response => {
            this.user.name=response.data.user_name;
            this.user.email=response.data.email;
            this.user.class_name=response.data.class_name;
            this.user.tel=response.data.tel;
            this.user.id=response.data.user_id;
            this.user.role=response.data.role;
            this.user.avatar_url=`http://127.0.0.1:5000/${response.data.avatar_url}`
          })
          .catch(error => {
            console.error('获取数据失败:', error);
          });
      this.$axios.get(`/course/send_courses/${userId}`)
          .then(response => {
            this.courses = response.data;
            console.log(this.courses);
          })
          .catch(error => {
            console.error('获取课程信息失败:', error);
          });

      axios.get('/api/announcement')
          .then(response => {
            this.announcement = response.data;
          })
          .catch(error => {
            console.error('获取公告失败:', error);
          });

      // 示例: 请求未读通知和作业提交数据
      axios.get('/api/unreadNotifications')
          .then(response => {
            this.unreadNotifications = null;
          })
          .catch(error => {
            console.error('获取通知信息失败:', error);
          });

      axios.get('/api/homeworkSubmissions')
          .then(response => {
            this.homeworkSubmissions = null;
          })
          .catch(error => {
            console.error('获取作业提交信息失败:', error);
          });
    },
    handleTabChange(newActiveTab, newActiveSubTab) {
      this.activeTab = newActiveTab; // 更新activeTab
      this.activeSubTab = newActiveSubTab; // 更新activeSubTab
    },
  }
};
</script>
