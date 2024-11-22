<template>
  <div class="course-announcements">
    <h2>{{ courseName }} 课程通知</h2>

    <table v-if="announcements.length" class="announcement-table">
      <thead>
      <tr>
        <th>编号</th>
        <th>通知内容</th>
        <th>发布时间</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="(announcement, index) in announcements"
          :key="announcement.announcement_id"
          :class="{ unread: !announcement.is_read }"
      >
        <td>{{ index + 1 }}</td>
        <td>
            <span @click="showContent(announcement.content)">
              {{ announcement.content.length > 20 ? announcement.content.slice(0, 20) + '...' : announcement.content }}
            </span>
        </td>
        <td>{{ formatDate(announcement.created_at) }}</td>
        <td>
          <div v-if="user_role === 'student'">
            <span v-if="announcement.is_read">已读</span>
            <button
                v-else
                @click="markAsRead(announcement.announcement_id)"
            >
              标记为已读
            </button>
          </div>

          <!-- 教师端的删除通知功能 -->
          <button
              v-if="user_role === 'teacher'"
              @click="deleteAnnouncement(announcement.announcement_id)"
          >
            删除
          </button>
        </td>
      </tr>
      </tbody>
    </table>
    <br>
    <div v-if="user_role === 'teacher'">
      <button @click="openAnnouncementModal">添加通知</button>
    </div>


    <!-- 查看通知的弹窗 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
        <p>{{ modalContent }}</p>
      </div>
    </div>

    <!-- 发布通知的输入弹窗 -->
    <div v-if="showAnnouncementModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showAnnouncementModal = false">&times;</span>
        <h3>发布新通知</h3>
        <textarea v-model="newAnnouncementContent" placeholder="请输入通知内容"></textarea>
        <button @click="publishAnnouncement" style="margin-top: 30px;">发布</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "CourseAnnouncements",
  props: {
    userId: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    courseId: {
      type: String,
      required: true
    },
    user_role: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      announcements: [],
      showModal: false,
      modalContent: "",
      showAnnouncementModal: false,
      newAnnouncementContent: ""
    };
  },
  mounted() {
    console.log(this.user_role);
    this.fetchAnnouncements();
  },
  methods: {
    async fetchAnnouncements() {
      try {
        const response = await this.$axios.post('/student/getCourseAnnouncements', {
          courseId: this.courseId,
          userId: this.userId
        });

        this.announcements = response.data.announcements;
      } catch (error) {
        console.error("获取课程通知失败:", error);
      }
    },
    async markAsRead(announcementId) {
      try {
        await this.$axios.post('/student/markAnnouncementRead', {
          userId: this.userId,
          announcementId: announcementId
        });

        this.announcements = this.announcements.map(a =>
            a.announcement_id === announcementId ? {...a, is_read: true} : a
        );
      } catch (error) {
        console.error("标记通知为已读失败:", error);
      }
    },
    async deleteAnnouncement(announcementId) {
      try {
        await this.$axios.post('/teacher/deleteAnnouncement', {
          announcementId: announcementId
        });

        this.announcements = this.announcements.filter(a => a.announcement_id !== announcementId);
      } catch (error) {
        console.error("删除通知失败:", error);
      }
    },
    openAnnouncementModal() {
      this.showAnnouncementModal = true;
    },
    async publishAnnouncement() {
      if (!this.newAnnouncementContent.trim()) {
        alert("通知内容不能为空！");
        return;
      }

      try {
        const response = await this.$axios.post('/teacher/announcement', {
          content: this.newAnnouncementContent,
          course_id: this.courseId
        });

        if (response.status === 200) {
          alert("发布通知成功");
          this.showModal = false; // 关闭弹窗
          this.newAnnouncementContent = ""; // 清空输入框
          this.fetchAnnouncements(); // 刷新通知列表
        }
      } catch (error) {
        console.error("发布通知失败:", error);
        alert("发布通知失败")
      }
    },
    showContent(content) {
      this.modalContent = content;
      this.showModal = true;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.course-announcements {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
}

.announcement-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.announcement-table th, .announcement-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
}

.unread {
  font-weight: bold;
  color: #005BAC;
}

button {
  background-color: #1b1d9e;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #005BAC;
}

/* 弹窗样式 */
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 30%;
  height: 25%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center; /* 让内容水平居中 */
}

textarea {
  width: 100%;
  height: 60px;
  margin-top: 10px;
  padding: 8px;
  resize: none;
}

.close {
  position: absolute;
  right: 10px;
  top: 5px;
  cursor: pointer;
  font-size: 20px;
}
</style>
