<template>
  <el-container style="height: 100vh;">
    <!-- 顶部导航 -->
    <el-header style="background-color: #409EFF; color: white;">
      <div class="header-content">
        <div class="title">{{ courseName }}</div>
        <div class="info">课程编号: {{ courseId }} | 班号: {{ user.class_name }}</div>
      </div>
    </el-header>

    <el-container>
      <!-- 左侧导航栏 -->
      <el-aside width="200px" style="background-color: #f2f2f2;">
        <el-menu default-active="1" class="el-menu-vertical-demo" @select="handleMenuSelect">
          <el-submenu index="1" menu-trigger="click">
            <template #title>课程信息</template>
            <el-menu-item index="1-1">课程介绍</el-menu-item>
            <el-menu-item index="1-2">课程通知</el-menu-item>
          </el-submenu>
          <el-submenu index="2" menu-trigger="click">
            <template #title>课程资源</template>
            <el-menu-item index="2-1">电子课件</el-menu-item>
            <el-menu-item index="2-2">试卷库</el-menu-item>
            <el-menu-item index="2-3">教案教辅</el-menu-item>
          </el-submenu>
          <el-submenu index="3" menu-trigger="click">
            <template #title>课程视频</template>
            <el-menu-item index="3-1">视频回放</el-menu-item>
          </el-submenu>
          <el-submenu index="4" menu-trigger="click">
            <template #title>课程考核</template>
            <el-menu-item index="4-1">作业</el-menu-item>
            <el-menu-item index="4-2">实验</el-menu-item>
          </el-submenu>
          <el-submenu index="5" menu-trigger="click">
            <template #title>答疑讨论</template>
            <el-menu-item index="5-1">答疑讨论</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-main style="background-color: white;">
        <el-card>
          <div v-if="currentPageContent">
            <!-- 渲染动态组件并传递 courseId 和 userId -->
            <component
                :is="currentPageComponent"
                :courseId="courseId"
                :userId="user.id"
                :user_role="user.role"
                :data="currentPageContent"
                :courseName="courseName"
                @navigate-to-peer-review="handlePeerReviewNavigation"
                @navigate-to-gradeAssignment="handleGradeNavigation"
                @navigate-to-gradeExperiments="handleExpGradeNavigation"
            ></component>
          </div>
          <div v-else class="empty-data">暂无数据</div>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import axios from 'axios';
import CourseIntroduction from '../components/CourseIntroduction.vue';
import CourseAnnouncements from '../components/CourseAnnouncements.vue';
import DigitalCourseware from '../components/DigitalCourseware.vue';
import TestBank from '../components/TestBank.vue';
import TeachingAids from '../components/TeachingAids.vue';
import VideoReplays from '../components/VideoReplays.vue';
import Assignments from '../components/Assignments.vue';
import QAndA from '../components/QAndA.vue';
import AssignmentExperiments from "../components/AssignmentExperiments.vue";
import PeerReview from "@/components/PeerReview.vue";
import GradeAssignment from "../components/GradeAssignment.vue";
import GradeExperiment from "@/components/GradeExperiment.vue";

export default {
  data() {
    return {
      user: {
        id: '',
        class_name: '',
        role:''
      },
      assignments:[],
      courseId: null,
      courseName: null,
      currentPageIndex: '1-1', // 默认显示的页面
      currentPageTitle: '课程介绍', // 默认标题
      currentPageContent: [], // 默认内容，可以是任何数据结构
      currentPageComponent: 'CourseIntroduction', // 默认组件
      menuComponentsMap: {
        '1-1': { title: '课程介绍', component: 'CourseIntroduction', data: [] },
        '1-2': { title: '课程通知', component: 'CourseAnnouncements', data: [] },
        '2-1': { title: '电子课件', component: 'DigitalCourseware', data: [] },
        '2-2': { title: '试卷库', component: 'TestBank', data: [] },
        '2-3': { title: '教案教辅', component: 'TeachingAids', data: [] },
        '3-1': { title: '视频回放', component: 'VideoReplays', data: [] },
        '4-1': { title: '作业', component: 'Assignments', data: [] },
        '4-2': { title: '实验', component: 'AssignmentExperiments', data: [] },
        '5-1': { title: '答疑讨论', component: 'QAndA', data: [] },
        PeerReview: { title: '互评作业', component: 'PeerReview', data: null },
        //GradeAssignment: { title: '教师评分', component: 'GradeAssignment', data: null },
      }
    };
  },
  created() {
    // 在组件创建时，从路由参数中获取 courseId 和 courseName
    this.courseId = this.$route.query.course_id;
    this.courseName = this.$route.query.course_name;
    this.user.id = sessionStorage.getItem('user_id');
    this.user.role = this.$route.query.role;
    this.fetchUserData();
  },
  methods: {
    async handleMenuSelect(index) {
      const menuItem = this.menuComponentsMap[index];
      if (menuItem) {
        this.currentPageIndex = index;
        this.currentPageTitle = menuItem.title;
        this.currentPageComponent = menuItem.component;
        this.currentPageContent = menuItem.data; // 或者从API获取数据并赋值
      }
    },
    fetchUserData() {
      this.$axios.get(`/auth/send_data/${this.user.id}`)
          .then(response => {
            this.user.class_name=response.data.class_name;
            console.log(this.user.class_name);
          })
          .catch(error => {
            console.error('获取数据失败:', error);
          });
    },
    handlePeerReviewNavigation({ course_id, asm_id, user_id }) {
      this.currentPageIndex = 'PeerReview';
      this.currentPageTitle = '互评作业';
      this.currentPageComponent = 'PeerReview';
      this.currentPageContent = { course_id, asm_id, user_id };
    },
    handleGradeNavigation({ course_id, asm_id}) {
      this.currentPageIndex = 'GradeAssignment';
      this.currentPageTitle = '批改作业';
      this.currentPageComponent = 'GradeAssignment';
      this.currentPageContent = {course_id,asm_id};
    },
    handleExpGradeNavigation({ course_id, exp_id }) {
      this.currentPageIndex = 'GradeExperiment';
      this.currentPageTitle = '批改实验';
      this.currentPageComponent = 'GradeExperiment';
      this.currentPageContent = {course_id,exp_id};
    }
  },
  components: {
    CourseIntroduction,
    CourseAnnouncements,
    DigitalCourseware,
    TestBank,
    TeachingAids,
    VideoReplays,
    Assignments,
    AssignmentExperiments,
    QAndA,
    PeerReview,
    GradeAssignment,
    GradeExperiment
  }
};
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.title {
  font-size: 24px;
  font-weight: bold;
}
.info {
  font-size: 14px;
}
.empty-data {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>
