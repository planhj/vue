<template>
  <DashboardLayout  :user="user" :announcement="announcement" @tab-changed="handleTabChange">
    <template #content>
      <UserProfile v-if="activeTab === 'profile'" :user="user"  />
      <div v-if="activeTab === 'courses'">
        <h2>我的课程</h2>
        <div class="course-list">
          <div v-if="courses.length === 0" class="no-courses">
            暂无课程信息
          </div>
          <div v-else v-for="course in courses" :key="course.course_id" class="course-card">
            <div class="course-info">
              <h3>{{ course.course_name }}</h3>
              <p>授课老师：{{ course.teacher_name }}</p>
            </div>
          </div>

        </div>
      </div>
      <MySchedule v-if="activeTab === 'schedule'" :courses="courses" />
      <div v-if="activeSubTab === 'unreadNotifications'">
        <h2>通知未读</h2>
        <!-- 未读通知内容 -->
      </div>
      <div v-if="activeSubTab === 'homeworkSubmission'">
        <h2>作业提交</h2>
        <!-- 作业提交内容 -->
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
      activeTab: 'courses', // 添加activeTab
      activeSubTab: '', // 添加activeSubTab
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

<style scoped>
.course-list {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 20px; /* 添加间距 */
  margin-top: 80px;
}

.course-card {
  width: 250px; /* 固定宽度 */
  height: 100px; /* 固定高度 */
  background-color: #fff;
  border-radius: 8px;
  padding: 15px; /* 内边距 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column; /* 垂直排列内容 */
  justify-content: center; /* 垂直居中对齐内容 */
  align-items: center; /* 水平居中对齐内容 */
  transition: transform 0.3s; /* 添加过渡效果 */
}

.course-card:hover {
  transform: scale(1.05); /* 鼠标悬停时放大 */
}

.course-info h3 {
  margin: 0; /* 去掉默认边距 */
  font-size: 18px; /* 调整标题大小 */
}

.course-info p {
  margin: 5px 0 0; /* 调整描述的边距 */
  color: #666; /* 设置颜色 */
}
</style>
