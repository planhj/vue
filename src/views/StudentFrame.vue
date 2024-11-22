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
          <div v-else v-for="course in courses" :key="course.course_id" class="course-card" @click="goToCoursePage(course.course_id,course.course_name,user.role)">
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

      <!-- 悬浮窗 -->
      <div
          class="floating-window"
          :style="{ top: `${windowPosition.y}px`, left: `${windowPosition.x}px` }"
          @mousedown="startDrag"
      >
        <button @click="openDialog">💬</button>
      </div>

      <!-- 对话框 -->
      <div v-if="isDialogOpen" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog">
          <h3>与 AI 对话</h3>

          <!-- 消息显示区域 -->
          <div class="chat-container">
            <div v-for="message in chatMessages" :key="message.id" class="chat-message">
              <p :class="{'user-message': message.from === 'user', 'ai-message': message.from === 'ai'}">
                {{ message.text }}
              </p>
            </div>
          </div>

          <!-- 输入框和发送按钮 -->
          <div class="chat-input">
            <input v-model="userMessage" type="text" placeholder="输入你的消息..." @keyup.enter="sendMessage"/>
            <button @click="sendMessage">发送</button>
          </div>
          <br>
          <button @click="closeDialog">关闭</button>
        </div>
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
      isDragging: false,
      windowPosition: { x: 300, y: 15 },
      dragOffset: { x: 0, y: 0 },
      isDialogOpen: false,
      courses: [],
      assignments:[],
      message:'',
      courseId:1,
      activeTab: 'courses', // 添加activeTab
      activeSubTab: '', // 添加activeSubTab
      announcement: {/* 公告数据 */},
      //isDialogOpen: false,  // 是否显示对话框
      userMessage: "",  // 用户输入的消息
      chatMessages: [],  // 聊天消息数组
      nextMessageId: 1,  // 用于唯一标识消息的 ID
    };
  },
  mounted() {
    this.fetchData();
    console.log(this.windowPosition);
  },
  methods: {
    fetchData() {
      const userId = sessionStorage.getItem('user_id');
      // 请求用户、课程、公告等数据
      this.$axios.get(`/auth/send_data/${userId}`)
          .then(response => {
            this.user.name = response.data.user_name;
            this.user.email = response.data.email;
            this.user.class_name = response.data.class_name;
            this.user.tel = response.data.tel;
            this.user.id = response.data.user_id;
            this.user.role = response.data.role;
            this.user.avatar_url = `http://127.0.0.1:5000/${response.data.avatar_url}`
          })
          .catch(error => {
            console.error('获取数据失败:', error);
          });
      this.$axios.post('/course/send_courses', {userId: userId})
          .then(response => {
            if (response.data.error) {
              this.message = response.data.error;
            } else if (response.data.message) {
              this.message = response.data.message;
            } else {
              this.courses = response.data;
            }
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
    goToCoursePage(courseId, course_name, role) {
      // 使用query参数传course_id
      this.$router.push({
        path: '/course-notifications',
        query: {course_id: courseId, course_name: course_name, role: role},
      });
    },
    startDrag(event) {
      console.log('Dragging started'); // 确认事件是否触发
      this.isDragging = true;
      this.dragOffset.x = event.clientX - this.windowPosition.x;
      this.dragOffset.y = event.clientY - this.windowPosition.y;
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },

    onDrag(event) {
      if (!this.isDragging) return;
      this.windowPosition.x = event.clientX - this.dragOffset.x;
      this.windowPosition.y = event.clientY - this.dragOffset.y;
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    openDialog() {
      this.isDialogOpen = true;
    },

    closeDialog() {
      this.isDialogOpen = false;
    },

    sendMessage() {
      if (this.userMessage.trim() === "") return;  // 如果用户输入为空，不发送

      // 1. 添加用户的消息
      this.chatMessages.push({
        id: this.nextMessageId++,
        text: this.userMessage,
        from: "user",
      });

      // 2. 清空输入框
      this.userMessage = "";

      // 3. 模拟 AI 回复
      this.chatMessages.push({
        id: this.nextMessageId++,
        text: this.getAIResponse(this.userMessage),  // 模拟 AI 回复
        from: "ai",
      });
    },
    getAIResponse(userMessage) {
      // 模拟 AI 回复的逻辑
      const responses = [
        "您好！我可以帮您做什么？",
        "我在这里准备好回答您的问题。",
        "请告诉我您想要了解的内容。",
      ];
      return responses[Math.floor(Math.random() * responses.length)]; // 随机返回一个回复
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

.floating-window {
  border: 1px solid red;
  position: fixed;
  width: 50px;
  height: 50px;
  background-color: rgba(255, 0, 0, 0.3); /* 半透明背景 */
  color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.floating-window:active {
  cursor: grabbing;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.dialog {
  width:33%;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.chat-container {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.chat-message {
  margin: 10px 0;
}

.chat-message p {
  display: inline-block;
  padding: 10px;
  border-radius: 5px;
}

.user-message {
  background-color: #dcf8c6;
  text-align: right;
}

.ai-message {
  background-color: #f1f0f0;
  text-align: left;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input input {
  width: 80%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-input button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
