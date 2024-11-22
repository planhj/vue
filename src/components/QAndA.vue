<template>
  <div class="qanda">
    <h2>课程问答 - {{ courseName }}</h2>

    <div class="question-form">
      <h3>发布问题</h3>
      <textarea v-model="newQuestionContent" placeholder="请输入你的问题"></textarea>
      <button @click="submitQuestion">提交问题</button>
    </div>

    <div class="questions">
      <h3>问题列表</h3>
      <div v-for="question in questions" :key="question.question_id" class="question-item">
        <div class="question-content">
          <p><strong>提问:</strong> {{ question.content }}</p>
          <p><small>时间: {{ formatDate(question.created_at) }}</small></p>
          <div class="answers">
            <h4>回答:</h4>
            <div v-for="answer in question.answers" :key="answer.answer_id" class="answer-item">
              <p>{{ answer.content }}</p>
              <p><small>时间: {{ formatDate(answer.created_at) }}</small></p>
            </div>
            <div class="answer-form">
              <textarea v-model="newAnswer[question.question_id]" placeholder="请输入你的回答"></textarea>
              <button @click="submitAnswer(question.question_id)">提交回答</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "QandA",
  props: {
    courseId: {
      type: Number,
      required: true
    },
    courseName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      questions: [],
      newQuestionContent: '',
      newAnswer: {}  // 用于存储每个问题的回答内容
    };
  },
  mounted() {
    this.fetchQuestions(); // 组件挂载后获取问题
  },
  methods: {
    async fetchQuestions() {
      try {
        const response = await axios.get(`/api/getQuestions/${this.courseId}`);
        this.questions = response.data;
      } catch (error) {
        console.error('获取问题失败:', error);
      }
    },

    async submitQuestion() {
      if (!this.newQuestionContent.trim()) {
        alert('问题内容不能为空！');
        return;
      }

      try {
        await axios.post('/api/submitQuestion', {
          courseId: this.courseId,
          content: this.newQuestionContent
        });
        this.newQuestionContent = ''; // 清空输入框
        this.fetchQuestions(); // 刷新问题列表
      } catch (error) {
        console.error('提交问题失败:', error);
      }
    },

    async submitAnswer(questionId) {
      const answerContent = this.newAnswer[questionId];
      if (!answerContent || !answerContent.trim()) {
        alert('回答内容不能为空！');
        return;
      }

      try {
        await axios.post('/api/submitAnswer', {
          questionId,
          content: answerContent
        });
        this.newAnswer[questionId] = ''; // 清空对应的回答输入框
        this.fetchQuestions(); // 刷新问题列表
      } catch (error) {
        console.error('提交回答失败:', error);
      }
    },

    formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(dateString).toLocaleString(undefined, options);
    }
  }
};
</script>

<style scoped>
.qanda {
  padding: 20px;
}

.question-form,
.answer-form {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
}

.question-item,
.answer-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
}
</style>
