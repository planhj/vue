<template>
  <div class="course-introduction">
    <h2>{{ courseName }} 课程简介</h2>

    <div v-if="introductionContent">
      <div class="introduction-content" v-html="introductionContent"></div>
    </div>

    <!-- 条件渲染发布/修改简介按钮，仅教师可见 -->
    <div v-if="user_role === 'teacher'" class="edit-button">
      <el-button type="primary" @click="showEditDialog = true">发布/修改简介</el-button>
    </div>

    <!-- 弹窗，输入新的简介内容 -->
    <el-dialog
        title="发布/修改课程简介"
        v-model="showEditDialog"
        width="50%"
        @close="resetDialog"
    >
      <el-input
          type="textarea"
          v-model="newIntroductionContent"
          placeholder="请输入课程简介内容"
          rows="10"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="submitIntroduction">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CourseIntroduction",
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
      introductionContent: "", // 存储课程简介内容
      showEditDialog: false, // 控制弹窗显示状态
      newIntroductionContent: "" // 存储新的简介内容
    };
  },
  mounted() {
    this.fetchIntroduction(); // 在组件挂载后获取课程简介
  },
  methods: {
    // 获取课程简介内容
    async fetchIntroduction() {
      try {
        const response = await this.$axios.get("/student/view_introduction", {
          params: { course_id: this.courseId }
        });
        // 假设返回的文件内容为 HTML 格式，直接展示
        this.introductionContent = response.data.content;
      } catch (error) {
        console.error("获取课程简介失败:", error);
        this.introductionContent = "<p>课程简介加载失败，请稍后重试。</p>";
      }
    },
    // 提交新的课程简介
    async submitIntroduction() {
      try {
        const response = await this.$axios.post("/teacher/add_introduction", {
          course_id: this.courseId,
          introduction: this.newIntroductionContent
        });

        if (response.data.success) {
          this.introductionContent = this.newIntroductionContent; // 更新简介内容
          this.showEditDialog = false; // 关闭弹窗
          this.$message.success("课程简介更新成功！");
        } else {
          this.$message.error("课程简介更新失败！");
        }
      } catch (error) {
        console.error("提交课程简介失败:", error);
        this.$message.error("提交课程简介失败，请稍后重试。");
      }
    },
    // 重置弹窗内容
    resetDialog() {
      this.newIntroductionContent = this.introductionContent; // 默认填入当前简介内容
    }
  }
};
</script>

<style scoped>
.course-introduction {
  padding: 20px;
  max-width: 800px;
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

.introduction-content {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
  white-space: pre-wrap; /* 保留文件中的换行 */
}

p {
  text-align: center;
  font-size: 1rem;
  color: #777;
}

.edit-button {
  text-align: center;
  margin-top: 20px;
}
</style>
