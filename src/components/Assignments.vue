<template>
  <div class="assignments">
    <h2>作业管理 - {{ courseName }}</h2>
    <table v-if="assignments.length > 0">
      <thead>
      <tr>
        <th>作业编号</th>
        <th>截止日期</th>
        <th v-if="user_role === 'student'">成绩</th>
        <th v-if="user_role === 'student'">提交状态</th>
        <th v-if="user_role === 'student'">提交作业</th>
        <th v-if="user_role === 'student'">互评</th>
        <th v-if="user_role === 'teacher'">提交人数</th>
        <th v-if="user_role === 'teacher'">批改作业</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(assignment, index) in assignments" :key="assignment.asm_id">
        <td>
          <a @click.prevent="openModal(assignment)" class="assignment-link">
            作业编号: {{ index + 1 }}
          </a>
        </td>
        <td>{{ assignment.ddl }}</td>
        <td v-if="user_role === 'student'">{{ assignment.grade ?? '未评分' }}</td>
        <td v-if="user_role === 'student'">
            <span :class="{'submitted': assignment.status === '已提交'}">
              {{ assignment.status === '已提交' ? '已提交' : '未提交' }}
            </span>
        </td>

        <!-- 学生端提交作业 -->
        <td v-if="user_role === 'student'">
          <div v-if="!isPastDeadline(assignment.ddl) && assignment.status !== '已提交'">
            <input type="file" @change="handleFileUpload($event, assignment.asm_id)" />
            <button @click="submitAssignment(assignment.asm_id)">提交</button>
          </div>
          <p v-else>提交已截止或已提交。</p>
        </td>

        <!-- 学生端互评 -->
        <td v-if="user_role === 'student'">
          <button @click="navigateToPeerReview(assignment)">进入互评</button>
        </td>

        <!-- 教师端提交人数 -->
        <td v-if="user_role === 'teacher'">
          {{ assignment.submitted_count }}/{{ assignment.num }}
        </td>

        <!-- 教师端批改作业 -->
        <td v-if="user_role === 'teacher'">
          <button @click="navigateToGradeAssignment(assignment)">批改作业</button>
        </td>
      </tr>
      </tbody>
    </table>
    <br>
    <!-- 发布作业按钮，仅教师可见 -->
    <button v-if="user_role === 'teacher'" @click="openCreateAssignmentModal">发布作业</button>

    <!-- 弹窗 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close-icon" @click="closeModal">×</span>
        <h3>作业详情</h3>
        <p>{{ currentAssignment.content }}</p>
        <a :href="`http://127.0.0.1:5000/${currentAssignment.attachment}`" target="_blank" download>
          <button style="margin-top: 20px; align-self: flex-start;">下载附件</button>
        </a>
      </div>
    </div>

    <div v-if="showCreateAssignmentModal" class="modal">
      <div class="modal-content">
        <span class="close-icon" @click="closeCreateAssignmentModal">×</span>
        <h3>发布作业</h3>
        <form @submit.prevent="createAssignment">
          <div class="form-group">
            <label for="content">作业内容：</label>
            <textarea id="content" v-model="newAssignment.content" required></textarea>
          </div>
          <div class="form-group">
            <label for="ddl">截止时间：</label>
            <input type="datetime-local" id="ddl" v-model="newAssignment.ddl" required />
          </div>
          <div class="form-group">
            <label for="attachment">上传附件：</label>
            <input type="file" id="attachment" @change="handleNewAssignmentFileUpload" />
          </div>
          <button type="submit">确认发布</button>
        </form>
      </div>
    </div>

  </div>
</template>


<script>

export default {
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
      assignments: [],
      files: {},
      showModal: false, // 控制弹窗显示
      currentAssignment: {}, // 存储当前点击的作业
      showCreateAssignmentModal: false, // 控制发布作业弹窗
      newAssignment: {
        content: '',
        ddl: '',
        file: null // 附件文件
      }
    };
  },
  mounted() {
    this.fetchAssignments();
  },
  methods: {
    fetchAssignments() {
      try {
        const apiEndpoint = this.user_role === 'student' ? '/student/getAssignments' : '/teacher/getAssignments';
        this.$axios.post(apiEndpoint, { course_id: this.courseId ,user_id: this.userId })
            .then(response => {
              this.assignments = response.data;
            })
            .catch(error => {
                console.error('获取作业信息失败:', error);
              });
      }catch (error) {
          console.error('获取作业信息失败:', error);
        }
    },

    navigateToPeerReview(assignment) {
      this.$emit('navigate-to-peer-review', {
        course_id: this.courseId,
        asm_id: assignment.asm_id,
        user_id: this.userId,
      });
    },
    navigateToGradeAssignment(assignment){
      this.$emit('navigate-to-gradeAssignment', {
        course_id: this.courseId,
        asm_id: assignment.asm_id,
      });
    },

    handleFileUpload(event, asm_id) {
      this.files[asm_id] = event.target.files[0];
    },

    async submitAssignment(asm_id) {
      const assignment = this.assignments.find(a => a.asm_id === asm_id);
      if (!assignment) return;

      if (this.isPastDeadline(assignment.ddl)) {
        alert('该作业已过截止日期，无法提交。');
        return;
      }

      const file = this.files[asm_id];
      if (!file) {
        alert('请选择文件！');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', this.courseId);
      formData.append('asm_id', asm_id);
      formData.append('user_id', this.userId);

      try {
        await this.$axios.post('/student/submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.assignments = this.assignments.map((assignment) =>
            assignment.asm_id === asm_id ? { ...assignment, status: '已提交' } : assignment
        );
        alert('作业提交成功！');
      } catch (error) {
        console.error('作业提交失败:', error);
      }
    },

    openModal(assignment) {
      this.currentAssignment = assignment;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.currentAssignment = {};
    },

    isPastDeadline(ddl) {
      const now = new Date();
      const deadline = new Date(ddl);
      return now > deadline;
    },

    openCreateAssignmentModal() {
      this.showCreateAssignmentModal = true;
    },

    closeCreateAssignmentModal() {
      this.showCreateAssignmentModal = false;
      this.newAssignment = { content: '', ddl: '', file: null }; // 重置表单
    },

    handleNewAssignmentFileUpload(event) {
      this.newAssignment.file = event.target.files[0];
    },

    async createAssignment() {
      if (!this.newAssignment.content || !this.newAssignment.ddl) {
        alert('请填写完整的作业信息！');
        return;
      }

      const formData = new FormData();
      formData.append('content', this.newAssignment.content);
      formData.append('ddl', this.newAssignment.ddl);
      formData.append('course_id', this.courseId);
      if (this.newAssignment.file) {
        formData.append('attachment', this.newAssignment.file);
      }

      try {
        await this.$axios.post('/teacher/assignments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('作业发布成功！');
        this.closeCreateAssignmentModal();
        this.fetchAssignments(); // 重新获取作业列表
      } catch (error) {
        console.error('发布作业失败:', error);
        alert('作业发布失败，请稍后重试。');
      }
    },


  }
};
</script>

<style scoped>
.experiments {
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

.submitted {
  color: green;
}

button {
  margin: 5px 0;
}

/* 作业编号字体颜色 */
.assignment-link {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 5px;
  width: 33%; /* 屏幕1/3宽度 */
  height: 33%; /* 屏幕1/3高度 */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 右上角的关闭叉号 */
.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

</style>
