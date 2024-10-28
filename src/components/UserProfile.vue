<template>
  <div class="profile-center">
    <h2>个人中心</h2>
    <div class="profile-avatar">
      <img :src="user.avatar_url" alt="用户头像" v-if="user.avatar_url">
    </div>
    <p></p>
    <input type="file" ref="fileInput" @change="handleAvatarUpload" style="display: none;" />

    <p v-if="user.role === 'student'">学号: {{ user.id }}</p>
    <p v-if="user.role === 'teacher'">工号: {{ user.id }}</p>
    <p>姓名: {{ user.name }}</p>
    <p v-if="user.role === 'student'">班级: {{ user.class_name }}</p>
    <p v-if="user.role === 'teacher'">办公室: {{ user.class_name }}</p>
    <p>邮箱: {{ user.email }}</p>
    <p>电话: <input type="tel" v-model="user.tel" :readonly="!isEditing" /></p>

    <div v-if="isEditing" class="profile-actions">
      <button @click="changeAvatar">上传头像</button>
      <button @click="promptChangePassword">修改密码</button>
      <button @click="saveProfile">保存</button>
      <button @click="back">返回</button>
    </div>

    <button v-else @click="editProfile" style="margin-top: 30px; background-color: #005BAC;
    color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
      编辑信息
    </button>
    <div v-if="showPasswordModal" class="password-modal">
      <div class="modal-content">
        <input type="password" v-model="oldPassword" placeholder="原密码" />
        <input type="password" v-model="newPassword" placeholder="新密码" />
        <input type="password" v-model="confirmPassword" placeholder="确认新密码" />
        <button @click="changePassword">确认修改</button>
        <button @click="showPasswordModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedFile: null,
      user_id: null,
      isEditing: false,
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  },
  created() {
    this.user_id = this.user.id;
  },
  methods: {
    editProfile() {
      this.isEditing = true;
    },
    back(){
      this.isEditing = false;
    },
    async changeAvatar() {
      this.$refs.fileInput.click();
    },
    handleAvatarUpload(event) {
      this.selectedFile = event.target.files[0];
      if (!this.selectedFile) {
        alert("请选择一个文件");
        return;
      }

      const formData = new FormData();
      formData.append('avatar', this.selectedFile);
      formData.append('user_id', this.user_id);

      this.$axios.post(`/auth/upload_avatar/${this.user_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
          .then(response => {
            if (response.data.message === '头像上传成功') {
              this.user.avatar_url = `http://127.0.0.1:5000/${response.data.avatar_url}`;
              alert("头像上传成功");
            } else {
              alert("头像上传失败");
            }
          })
          .catch(error => {
            console.error("上传头像时出错:", error);
            alert("上传头像时出错");
          });
    },
    promptChangePassword() {
      this.showPasswordModal = true;
    },
    changePassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert("新密码和确认密码不一致");
        return;
      }

      const requestData = {
        user_id: this.user_id,
        old_password: this.oldPassword,
        new_password: this.newPassword
      };

      this.$axios.post(`/auth/change_password`, requestData)
          .then(response => {
            if (response.data.message === '密码修改成功') {
              alert("密码修改成功");
            } else {
              alert("密码修改失败，请检查您的原密码是否正确");
            }
          })
          .catch(error => {
            console.error("修改密码时出错:", error);
            alert("修改密码时出错");
          })
          .finally(() => {
            this.showPasswordModal = false; //关闭密码修改弹窗
          });
    },
    saveProfile() {
      const requestData = {
        user_id: this.user.id,
        tel: this.user.tel
      };

      this.$axios.post(`/auth/save_profile`, requestData)
          .then(response => {
            if (response.data.message === '用户信息已保存') {
              alert("用户信息已保存");
            } else {
              alert("保存信息失败");
            }
          })
          .catch(error => {
            console.error("保存用户信息时出错:", error);
            alert("保存用户信息时出错");
          })
          .finally(() => {
            this.isEditing = false; // 退出编辑模式
          });
    },
  }
};
</script>

<style scoped>
.profile-center {
  width: 943px;
  height: 800px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: absolute;
  top: 80px;
  left: 355px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 调整对齐方式 */
}

.profile-avatar {
  width: 130px;
  height: 130px;
  margin: 0 auto;
  position: relative;
}

.profile-avatar img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}


.profile-actions button {
  background-color: #005BAC;
  color: white;
  padding: 10px 20px;
  margin-top: 30px;
  margin-left: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.profile-actions button:hover {
  background-color: #004B8D;
}

.profile-actions button:active {
  background-color: #003E73;
  transform: scale(0.98);
}

.profile-actions button:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(0, 91, 172, 0.5);
}
.password-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 40px; /* 调整内边距 */
  width: 400px; /* 设置宽度 */
  z-index: 1200;
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.modal-content h3 {
  margin-bottom: 15px;
}

.modal-content input {
  margin: 10px 0;
  padding: 10px;
  width: 100%;
}

.modal-content button {
  background-color: #005BAC;
  margin-top: 10px;
}
</style>
