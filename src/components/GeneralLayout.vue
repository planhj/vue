<template>
  <div class="dashboard">
    <header class="top-bar">
      <h1>课程平台</h1>
      <div class="user-info" v-if="user.avatar_url && user.name">
        <img :src="user.avatar_url" alt="头像" class="user-avatar">
        <span class="user-name">{{ user.name }}</span>
      </div>
    </header>

    <div class="main-content">
      <!-- 左侧栏 -->
      <aside class="sidebar">
        <ul class="menu">
          <li v-for="item in menuItems" :key="item.label"
              @click="selectTab(item.key)"
              :class="{ active: activeTab === item.key }">
            {{ item.label }}
          </li>
          <!-- 如果存在子菜单 -->
          <ul v-if="activeTab === 'notifications'" class="sub-menu">
            <li v-for="subItem in notificationsSubMenu" :key="subItem.key"
                @click="selectSubTab(subItem.key)"
                :class="{ active: activeSubTab === subItem.key }">
              {{ subItem.label }}
            </li>
          </ul>
          <li @click="logout" class="logout">安全退出</li>
        </ul>
      </aside>

      <!-- 中间内容区域 -->
      <main class="content">
        <slot name="content"></slot>
      </main>

      <!-- 右侧栏 -->
      <aside class="sidebar-right">
        <div class="announcement">
          <h3>公告</h3>
          <p>{{ announcement.date }} {{ announcement.content }}</p>
        </div>
        <div class="calendar">
          <h3>教学日历</h3>
          <CalendarComponent />
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import CalendarComponent from './Calendar.vue';
export default {
  components: {
    CalendarComponent
  },
  props: {
    user: Object,
    announcement: Object
  },
  data() {
    return {
      activeTab: 'courses',
      activeSubTab: '',  // 子菜单
      notificationsSubMenu: [
        { label: '通知未读', key: 'unreadNotifications' },
        { label: '作业提交', key: 'homeworkSubmission' }
      ]
    };
  },
  computed: {
    // 根据角色动态生成菜单项
    menuItems() {
      if (this.user.role === 'student') {
        return [
          { label: '个人中心', key: 'profile' },
          { label: '我的课程', key: 'courses' },
          { label: '我的课表', key: 'schedule' },
          { label: '通知提醒', key: 'notifications' },
        ];
      } else if (this.user.role === 'teacher') {
        return [
          { label: '个人中心', key: 'profile' },
          { label: '我的课程', key: 'courses' },
          { label: '我的课表', key: 'schedule' },
          { label: '发布通知', key: 'publishNotification' },
          { label: '发布作业', key: 'publishHomework' },
          { label: '作业批改', key: 'correctHomework' }
        ];
      }
      return [];
    }
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab;
      this.activeSubTab = ''; // 重置子菜单状态
      this.$emit('tab-changed', this.activeTab, this.activeSubTab); // 发送事件
    },
    selectSubTab(subTab) {
      this.activeSubTab = subTab;
      this.$emit('tab-changed', this.activeTab, this.activeSubTab); // 发送事件
    },
    logout() {
      sessionStorage.clear();
      this.$router.push('/');
    }
  }
};
</script>


<style scoped>
/* 顶部蓝色栏 */
.dashboard {
  width: 1690px; /* 固定宽度 */
  height: 920px; /* 固定高度 */
  margin: 0 auto; /* 页面居中 */
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

/* 顶部蓝色栏 */
.top-bar {
  background-color: #005BAC;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px; /* 固定顶部栏高度 */
}

.top-bar h1 {
  margin: 0;
  font-size: 24px;
}
.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  font-size: 16px;
  color: white;
  margin-right: 100px;
}

/* 设置主内容区域的布局和固定高度 */
.main-content {
  display: flex;
  height: calc(100% - 80px); /* 减去顶部栏的高度 */
}

/* 左侧栏 */
.sidebar {
  width: 20%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.menu {
  list-style-type: none;
  padding: 0;
}

.menu li {
  padding: 15px;
  cursor: pointer;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 10px;
  background-color: #f1f1f1;
  transition: background-color 0.3s;
}

.menu li:hover, .menu li.active {
  background-color: #005BAC;
  color: white;
}

.logout {
  background-color: #005BAC;
  color: white;
}

.sub-menu {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

.sub-menu li {
  padding: 10px;
  cursor: pointer;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 5px;
  background-color: #e1e1e1;
}

.sub-menu li.active {
  background-color: #005BAC;
  color: white;
}

/* 中间内容区域 */
.content {
  width: 60%;
  margin: 0 20px;
  overflow-y: auto; /* 设置垂直方向滚动 */
  padding-right: 10px; /* 预留滚动条空间 */
  max-height: 100%; /* 中间内容区域的最大高度为可用空间 */
}

.course-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.course-card {
  width: 45%;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.course-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

/* 右侧栏 */
.sidebar-right {
  width: 20%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 防止右侧栏出现滚动 */
}

.announcement, .calendar {
  margin-bottom: 300px;
}

h3 {
  color: #333;
}

p {
  color: #666;
}
</style>

