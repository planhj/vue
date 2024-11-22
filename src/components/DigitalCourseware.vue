<template>
  <div class="course-resources">
    <h2>{{ courseName }} 课程资源</h2>

    <!-- 资源列表 -->
    <div v-if="resources.length" class="resource-list">
      <ul>
        <li v-for="(resource, index) in resources" :key="index">
          <a :href="`http://127.0.0.1:5000/${resource.path}`" target="_blank">{{ resource.name }}</a>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>暂无课程资源。</p>
    </div>

    <!-- 教师端上传课程资源按钮 -->
    <div v-if="user_role === 'teacher'" class="upload-resource">
      <input type="file" multiple @change="handleFiles" />
      <button @click="uploadResources">上传课件</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "CourseResources",
  props: {
    courseId: {
      type: String,
      required: true
    },
    courseName: {
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
      resources: [],
      files: []
    };
  },
  mounted() {
    this.fetchResources();
  },
  methods: {
    async fetchResources() {
      try {
        const response = await this.$axios.get('/student/view_resources', {
          params: { course_id: this.courseId }
        });
        this.resources = response.data.resources || [];
      } catch (error) {
        console.error("获取课程资源失败:", error);
      }
    },
    handleFiles(event) {
      this.files = event.target.files;
    },
    async uploadResources() {
      if (this.files.length === 0) {
        alert("请选择要上传的文件");
        return;
      }

      const formData = new FormData();
      formData.append('course_id', this.courseId);
      Array.from(this.files).forEach(file => {
        formData.append('files', file);
      });

      try {
        const response = await this.$axios.post('/teacher/add_resources', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.status === 200) {
          alert("课件上传成功");
          await this.fetchResources(); // 重新获取资源列表
        }
      } catch (error) {
        console.error("课件上传失败:", error);
        alert("课件上传失败，请重试");
      }
    }
  }
};
</script>

<style scoped>
.course-resources {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  font-weight: bold;
  margin-bottom: 20px;
}

.resource-list ul {
  list-style-type: none;
  padding: 0;
}

.resource-list li {
  margin: 10px 0;
}

.upload-resource input {
  margin-top: 10px;
}

button {
  background-color: #1b1d9e;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #005BAC;
}
</style>
