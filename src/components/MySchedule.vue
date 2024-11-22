<template>
  <div class="schedule">
    <h2>我的课表</h2>
    <table>
      <thead>
      <tr>
        <th>节次</th>
        <th v-for="day in days" :key="day">{{ day }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(time, index) in timeSlots" :key="index">
        <td>{{ time.label }}</td>
        <td v-for="day in days" :key="day" class="cell">
          <div v-if="getCourse(day, index + 1)">
            <strong>{{ getCourse(day, index + 1).course_name }}</strong><br>
            {{ getCourse(day, index + 1).teacher_name }}<br>
            {{ getCourse(day, index + 1).address }}
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    courses: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      days: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      timeSlots: [
        {label: '第1节 [08:00-09:50]', value: 1},
        {label: '第2节 [10:10-12:00]', value: 2},
        {label: '第3节 [12:10-14:00]', value: 3},
        {label: '第4节 [14:10-16:00]', value: 4},
        {label: '第5节 [16:20-18:10]', value: 5},
        {label: '第6节 [19:00-20:50]', value: 6}
      ]
    };
  },
  methods: {
    getCourse(day, timeSlot) {
      const weekDayIndex = this.days.indexOf(day) + 1; // 1-7对应周一到周日
      return this.courses.find(course =>
          course.week_day === weekDayIndex && course.time_slot === timeSlot
      );
    },
  },
};
</script>

<style scoped>
.schedule {
  margin: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.cell {
  height: 60px;
}

td {
  vertical-align: top;
}
</style>