<template>
  <div class="experiments">
    <h2>实验-{{ courseName }}</h2>

    <table v-if="experiments.length > 0">
      <thead>
      <tr>
        <th>实验编号</th>
        <th>截止日期</th>
        <th v-if="user_role === 'student'">成绩</th>
        <th v-if="user_role === 'student'">提交状态</th>
        <th v-if="user_role === 'student'">提交实验</th>
        <th v-if="user_role === 'teacher'">提交人数</th>
        <th v-if="user_role === 'teacher'">批改实验</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(experiment, index) in experiments" :key="experiment.exp_id">
        <td>
          <a @click.prevent="openModal(experiment)" class="assignment-link">
            实验编号: {{ index + 1 }}
          </a>
        </td>
        <td>{{ experiment.ddl }}</td>
        <td v-if="user_role === 'student'">{{ experiment.grade ?? '未评分' }}</td>
        <td v-if="user_role === 'student'">
            <span :class="{'submitted': experiment.status === '已提交'}">
              {{ experiment.status === '已提交' ? '已提交' : '未提交' }}
            </span>
        </td>

        <!-- 学生端提交作业 -->
        <td v-if="user_role === 'student'">
          <div v-if="!isPastDeadline(experiment.ddl) && experiment.status !== '已提交'">
            <input type="file" @change="handleFileUpload($event, experiment.exp_id)" />
            <button @click="submitExperiment(experiment.exp_id)">提交</button>
          </div>
          <p v-else>提交已截止或已提交。</p>
        </td>

        <!-- 教师端提交人数 -->
        <td v-if="user_role === 'teacher'">
          {{ experiment.submitted_count }}/{{ experiment.num }}
        </td>

        <!-- 教师端批改作业 -->
        <td v-if="user_role === 'teacher'">
          <button @click="gradeExperiments(experiment)">批改实验</button>
        </td>
      </tr>
      </tbody>
    </table>
    <br>
    <!-- 发布作业按钮，仅教师可见 -->
    <button v-if="user_role === 'teacher'" @click="openCreateExperimentModal">发布实验</button>

    <!-- 弹窗 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close-icon" @click="closeModal">×</span>
        <h3>实验详情</h3>
        <p>{{ currentExperiment.content }}</p>
        <a :href="`http://127.0.0.1:5000/${currentExperiment.attachment}`" target="_blank" download>
          <button style="margin-top: 20px; align-self: flex-start;">下载附件</button>
        </a>
      </div>
    </div>

    <div v-if="showCreateExperimentModal" class="modal">
      <div class="modal-content">
        <span class="close-icon" @click="closeCreateExperimentModal">×</span>
        <h3>发布实验</h3>
        <form @submit.prevent="createExperiment">
          <div class="form-group">
            <label for="content">实验内容：</label>
            <textarea id="content" v-model="newExperiment.content" required></textarea>
          </div>
          <div class="form-group">
            <label for="ddl">截止时间：</label>
            <input type="datetime-local" id="ddl" v-model="newExperiment.ddl" required />
          </div>
          <div class="form-group">
            <label for="attachment">上传附件：</label>
            <input type="file" id="attachment" @change="handleNewExperimentFileUpload" />
          </div>
          <button type="submit">确认发布</button>
        </form>
      </div>
    </div>

  </div>
</template>


<script>
import axios from 'axios';

export default {
  name: "Assignments",
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
      experiments: [],
      files: {},
      showModal: false, // 控制弹窗显示
      currentExperiment: {}, // 存储当前点击的作业
      showCreateExperimentModal: false, // 控制发布作业弹窗
      newExperiment: {
        content: '',
        ddl: '',
        file: null // 附件文件
      }
    };
  },
  mounted() {
    this.fetchExperiments();
  },
  methods: {
    fetchExperiments() {
      try {
        const apiEndpoint = this.user_role === 'student' ? '/student/getExperiments' : '/teacher/getExperiments';
        this.$axios.post(apiEndpoint, { course_id: this.courseId ,user_id: this.userId })
            .then(response => {
              this.experiments = response.data;
            })
            .catch(error => {
              console.error('获取实验信息失败:', error);
            });
      }catch (error) {
        console.error('获取实验信息失败:', error);
      }
    },

    handleFileUpload(event, exp_id) {
      this.files[exp_id] = event.target.files[0];
    },

    async submitExperiment(exp_id) {
      const experiment = this.experiments.find(a => a.exp_id === exp_id);
      if (!experiment) return;

      if (this.isPastDeadline(experiment.ddl)) {
        alert('该实验已过截止日期，无法提交。');
        return;
      }

      const file = this.files[exp_id];
      if (!file) {
        alert('请选择文件！');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', this.courseId);
      formData.append('exp_id', exp_id);
      formData.append('user_id', this.userId);

      try {
        await this.$axios.post('/student/exp_submit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        this.experiments = this.experiments.map((experiment) =>
            experiment.exp_id === exp_id ? { ...experiment, status: '已提交' } : experiment
        );
        alert('实验提交成功！');
      } catch (error) {
        console.error('实验提交失败:', error);
      }
    },

    openModal(experiment) {
      this.currentExperiment =experiment;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.currentExperiment = {};
    },

    isPastDeadline(ddl) {
      const now = new Date();
      const deadline = new Date(ddl);
      return now > deadline;
    },

    openCreateExperimentModal() {
      this.showCreateExperimentModal = true;
    },

    closeCreateExperimentModal() {
      this.showCreateExperimentModal = false;
      this.newExperiment = { content: '', ddl: '', file: null }; // 重置表单
    },

    handleNewExperimentFileUpload(event) {
      this.newExperiment.file = event.target.files[0];
    },

    gradeExperiments(experiment){
      this.$emit('navigate-to-gradeExperiments', {
        course_id: this.courseId,
        exp_id: experiment.exp_id,
      });
    },
    async createExperiment() {
      if (!this.newExperiment.content || !this.newExperiment.ddl) {
        alert('请填写完整的实验信息！');
        return;
      }

      const formData = new FormData();
      formData.append('content', this.newExperiment.content);
      formData.append('ddl', this.newExperiment.ddl);
      formData.append('course_id', this.courseId);
      if (this.newExperiment.file) {
        formData.append('attachment', this.newExperiment.file);
      }

      try {
        await this.$axios.post('/teacher/experiments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('实验发布成功！');
        this.closeCreateExperimentModal();
        this.fetchExperiments(); // 重新获取作业列表
      } catch (error) {
        console.error('发布实验失败:', error);
        alert('实验发布失败，请稍后重试。');
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
