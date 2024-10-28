<template>
  <div class="container">
    <!-- 背景图片 -->
    <div class="bg-image"></div>
    <div class="login-container" v-if="view === 'login'">
      <h2 style="text-align: center;">登录</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="login-username">帐号:</label>
          <input type="text" v-model="loginId" id="login-username" required />
        </div>
        <div>
          <label for="login-password">密码:</label>
          <input type="password" v-model="loginPassword" id="login-password" required />
        </div>
        <button type="submit">登录</button>
      </form>
      <p style="text-align: center;">
        忘记密码？
        <a href="#" @click.prevent="toggleView('forget')">点击找回密码</a>
      </p>
    </div>

    <div class="forget" v-else-if="view === 'forget'">
      <h2 style="text-align: center;">找回密码</h2>
      <form @submit.prevent="handleForget">
        <div>
          <label for="register-email">账号:</label>
          <input type="text" v-model="Forget_id" id="forget-id" required readonly onfocus="this.removeAttribute('readonly');"/>
        </div>
        <div class="verification-code-container">
          <label for="verification-code">验证码:</label>
          <input type="text" v-model="forgetverificationCode" id="forget-verification-code" required/>
          <button type="button" id="button-text" @click="sendVerificationCode('forget')" :disabled="buttonDisabled">{{ buttonText }}</button>

        </div>
        <div>
          <label for="register-password">新密码:</label>
          <input type="password" v-model="forgetPassword" id="forget-password" required readonly onfocus="this.removeAttribute('readonly');"/>
        </div>
        <div>
          <label for="confirm-password">确认新密码:</label>
          <input type="password" v-model="confirmForgetPassword" id="confirm-forget-password" required readonly onfocus="this.removeAttribute('readonly');"/>
        </div>

        <div v-if="errorMessage" style="color: red; text-align: center;">{{ errorMessage }}</div>
        <button type="submit">找回</button>
      </form>
      <p style="text-align: center;">
        已找回？
        <a href="#" @click.prevent="toggleView('login')">点击登录</a>
      </p>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      view: 'login',
      loginId: '',
      loginPassword: '',
      role: '',
      Forget_id: '',
      forgetPassword: '',
      confirmForgetPassword: '',
      forgetverificationCode:'',
      errorMessage: '',
      buttonText:"获取验证码",
      buttonDisabled:false,
      currentSlide: 0
    };
  },
  methods: {
    async handleLogin() {
      const loginData = {
        user_id: this.loginId,
        password: this.loginPassword
      };

      try {
        const response = await this.$axios.post('/auth/login', loginData);
        const userId = response.data.user_id;
        sessionStorage.setItem('user_id', userId);
        console.log(response.data);
        if (response.data.role) {
          const role = response.data.role;
          if (role === 'teacher') {
            this.$router.push('/teacher');
          } else if (role === 'student') {
            this.$router.push('/student');
          }
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error('请求失败', error);
        this.errorMessage = '请求失败，请稍后再试';
      }
    },

    async handleForget() {
      this.errorMessage = '';

      if (!this.Forget_id) {
        this.errorMessage = '账号不能为空';
        return;
      }

      if (this.forgetPassword !== this.confirmForgetPassword) {
        this.errorMessage = '两次输入的密码不一致';
        return;
      }

      if (this.forgetPassword.length < 6 && this.confirmForgetPassword.length < 6) {
        this.errorMessage = '密码不能小于6位';
        return;
      }

      const registerData = {

        user_id: this.Forget_id,
        password: this.forgetPassword,
        confirmPassword: this.confirmForgetPassword,
        verificationCode: this.forgetverificationCode
      };

      try {
        const response = await this.$axios.post('/auth/reset_password', registerData);
        if (response.status === 200) {
          this.toggleView('login');
          this.errorMessage = '';
        } else {
          this.errorMessage = response.data.message;
        }
      } catch (error) {
        console.error('请求失败', error);
        this.errorMessage = '请求失败，请稍后再试';
      }
    },

    async sendVerificationCode(view) {
      let Forget_id = '';

      if (view === 'forget') {
        Forget_id = this.Forget_id;
      }

      if (!Forget_id) {
        this.errorMessage = '帐号不能为空';
        return;
      }

      try {
        const response = await this.$axios.get("/auth/send_captcha", {
          params: {
            user_id: Forget_id
          }
        });
        if (response.data.code===200) {
          this.buttonDisabled = true;
          let countdown = 60;
          this.buttonText = countdown;
          const timer = setInterval(() => {
            countdown--;
            this.buttonText = countdown;
            if (countdown <= 0) {
              this.buttonDisabled = false;
              clearInterval(timer);
              this.buttonText = '获取验证码';
            }
          }, 1000);
          alert("验证码发送成功");
        } else {
          this.errorMessage = response.message;
        }
      } catch (error) {
        console.error('请求失败', error);
        this.errorMessage = '请求失败，请稍后再试';
      }
    },
    toggleView(view) {
      this.errorMessage = '';
      this.view = view;
    },
  }
};
</script>

<style>
body {
  display: flex;
  justify-content: space-between; /* 左右分布布局 */
  align-items: flex-start; /* 对齐顶部 */
  height: 100vh;
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f0f0f0; /* 设置背景颜色，避免空白处 */
}

.bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('images/bg4.png');
  background-size: contain; /* 保持图片等比例缩放并覆盖整个窗口 */
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}


.login-container,
.forget{
  position: absolute; /* 使元素能够通过top属性进行定位 */
  top: 45vh; /* 距离窗口顶部1/3 */
  left: 63vw;
  width: 32vw; /* 总窗口宽度的1/3 */
  height: 34vh; /* 总窗口高度的1/3 */
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-right: 20px; /* 右边间距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

form > div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  width: 100%;
}

label {
  width: 100px;
  text-align: left;
  margin-right: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 12px;
  background-color: #1215cb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #333333; /* 悬停时的颜色 */
}

</style>
