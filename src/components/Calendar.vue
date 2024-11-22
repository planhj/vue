<template>
  <div class="calendar">
    <div class="calendar-header">
      <select v-model="currentYear" @change="updateDays">
        <option v-for="year in yearRange" :key="year" :value="year">{{ year }}年</option>
      </select>
      <select v-model="currentMonth" @change="updateDays">
        <option v-for="(month, index) in monthNames" :key="index" :value="index">{{ month }}</option>
      </select>
    </div>
    <div class="calendar-body">
      <div class="day-names">
        <span v-for="day in dayNames" :key="day">{{ day }}</span>
      </div>
      <div class="days">
        <span v-for="blank in firstDayOfMonth" :key="blank" class="blank"></span>
        <span v-for="day in daysInMonth" :key="day" @click="selectDay(day)"
              :class="{ 'selected': isSelectedDay(day) }">
          {{ day }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      selectedDay: null,
      dayNames: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    };
  },
  computed: {
    daysInMonth() {
      return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    },
    firstDayOfMonth() {
      return new Date(this.currentYear, this.currentMonth, 1).getDay();
    },
    yearRange() {
      const years = [];
      for (let i = 2020; i <= 2030; i++) {  // 可以根据需要调整年份范围
        years.push(i);
      }
      return years;
    }
  },
  methods: {
    updateDays() {
      // 选择年份或月份时，更新视图
      this.selectedDay = null; // 重置选中的日期
    },
    selectDay(day) {
      this.selectedDay = day;
    },
    isSelectedDay(day) {
      return this.selectedDay === day;
    }
  }
};
</script>

<style scoped>
.calendar {
  width: 300px;
  height: 250px; /* 设置日历高度 */
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.calendar-body {
  padding: 10px;
  height: 200px; /* 调整日历主体的高度 */
}

.day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  overflow-y: auto; /* 允许滚动以防止溢出 */
}

.days span {
  margin: 6px 0; /* 增加上下间隔 */
  display: inline-block; /* 确保 margin 生效 */
}

.blank {
  visibility: hidden;
}

.selected {
  background-color: #005BAC;
  color: white;
  border-radius: 50%;
}
</style>

