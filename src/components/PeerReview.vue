<template>
  <div v-if="assignment">
    <h2>互评作业</h2>
    <div v-if="assignment.attachment_url">
      <h3>作业文件</h3>
      <a :href="`http://127.0.0.1:5000/${assignment.attachment_url}`" target="_blank">点击查看作业附件</a>
    </div>
    <div v-if="assignment.student_id">
      <h3>学生信息</h3>
      <p>学生 ID: {{ assignment.student_id }}</p>
      <p>课程 ID: {{ assignment.course_id }}</p>
      <p>作业 ID: {{ assignment.asm_id }}</p>
    </div>
    <div>
      <label for="peer_grade">给该作业打分（0-100）:</label>
      <input
        id="peer_grade"
        type="number"
        v-model="peerGrade"
        min="0"
        max="10"
        step="0.1"
        required
      />
      <button @click="submitPeerGrade" :disabled="!peerGrade">提交评分</button>
    </div>
  </div>
  <div v-else>
    <p>正在获取待评分作业...</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      course_id: this.data.course_id,
      asm_id: this.data.asm_id,
      user_id: this.data.user_id,
      assignment: null, // 存储待评分作业
      peerGrade: null, // 存储用户输入的评分
    };
  },
  mounted(){
    this.fetchAssignment();
    console.log(this.user_id);
    console.log(this.asm_id)
  },
  methods: {
    // 获取待评分作业
    async fetchAssignment() {
      try {
        const response = await this.$axios.get("/student/get_review_assignment", {
          params: {
            student_id: this.user_id,
            course_id: this.course_id,
            asm_id: this.asm_id,
          },
        });
        this.assignment = response.data;
      } catch (error) {
        console.error("获取作业失败", error);
        //this.$message.error("获取待评分作业失败");
      }
    },

    // 提交评分
    async submitPeerGrade() {
      try {
        const response = await this.$axios.post(
            "/student/peer_grade",
            {
              student_id: this.assignment.student_id,
              course_id: this.assignment.course_id,
              asm_id: this.assignment.asm_id,
              peer_grade: this.peerGrade,
            }
        );
        this.$message.success(response.data.message);
        this.peerGrade = null; // 清空评分
        this.assignment = null; // 清空当前作业
        this.fetchAssignment(); // 加载新的待评分作业
      } catch (error) {
        console.error("提交评分失败", error);
        this.$message.error("提交评分失败");
      }
    },
  },
};
</script>

<style scoped>
/* 这里可以添加样式 */
</style>
