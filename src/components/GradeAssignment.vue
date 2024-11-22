<template>
  <div class="grade-assignment">
    <h2>批改作业</h2>
    <table>
      <thead>
      <tr>
        <th>学号</th>
        <th>姓名</th>
        <th>附件</th>
        <th>提交状态</th>
        <th>成绩</th>
        <th>提交成绩</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="submission in submissions" :key="submission.student_id">
        <td>{{ submission.student_id }}</td>
        <td>{{ submission.student_name }}</td>
        <td>
          <a :href="`http://127.0.0.1:5000/${submission.attachment_url}`" target="_blank" download>下载附件</a>
        </td>
        <td>{{ submission.status }}</td>
        <td>
          <input type="number" v-model="submission.grade" min="0" max="100" step="1" />
        </td>
        <td>
          <button @click="submitGrade(submission)">提交成绩</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "GradeAssignment",
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
      submissions: [] // 存储学生提交数据
    };
  },
  mounted() {
    this.fetchSubmissions();
  },
  methods: {
    async fetchSubmissions() {
      const { course_id, asm_id } = this;
      console.log(course_id);
      try {
        const response = await this.$axios.post('/teacher/check', { course_id, asm_id });
        this.submissions = response.data.submissions;
      } catch (error) {
        console.error("获取作业提交信息失败:", error);
      }
    },
    async submitGrade(submission) {
      try {
        const { course_id, asm_id } = this;
        await this.$axios.post('/teacher/grade', {
          course_id:course_id,
          asm_id:asm_id,
          student_id: submission.student_id,
          grade: submission.grade
        });
        alert(`成绩已提交：${submission.grade}`);
      } catch (error) {
        console.error("成绩提交失败:", error);
        alert("成绩提交失败，请稍后重试。");
      }
    }
  }
};
</script>

<style scoped>
.grade-assignment {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  border: 1px solid #ddd;
}

button {
  margin: 5px 0;
}
</style>
