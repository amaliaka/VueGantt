<template>
  <div id="app">
    <div class="wl-gantt-demo">
      <wlGantt
        ref="wl-gantt-demo"
        use-real-time
        end-date="2022-04-30"
        start-date="2021-08-01"
        date-type="yearAndWeek"
        :data="data"
        :columns="columns"
        :contextMenuOptions="contextMenuOptions"
        @selection-change="selectionChange"
        @expand-change="expandChange"
        @timeChange="timeChange"
        @taskRemove="taskRemove"
        @preChange="preChange"
        @taskAdd="taskAdd"
      >
        <!-- <template slot="prv">
          <el-table-column type="index" width="55" name="序号" label="序号"> </el-table-column>
        </template> -->
        <!-- <template #info-card="{ row }">
          <ul>
            <li>
              <label for="name">項目：</label><span id="name">{{ row.name }}</span>
            </li>
          </ul>
        </template> -->
      </wlGantt>
      
    </div>
  </div>
</template>

<script>
import WlGantt from "@/pages/wl-gantt";
import axios from 'axios';
import { Notification } from 'element-ui';


const transform = (projectList) => {
  let organizer = {};
  projectList.map(event => {
    const organizer_names = event.organizer.trim().split("、");
    organizer_names.forEach(element => {
      if (organizer[element]) {
        organizer[element] = [...organizer[element], event];
      } else {
        organizer[element] = [event];
      }
    });
  });
 
  let data = [];
  for (const [key, value] of Object.entries(organizer)) {
    if (!key) continue;
    const pid = data.length;
    let childId = 1;
    let startDt = 0;
    let endDt = 0;
    let temp = []
    value.forEach(element => {
      const elementStartDate = new Date(element.begin);
      const elementEndDate = new Date(element.end);
      startDt = (startDt === 0 || startDt > elementStartDate) ? elementStartDate : startDt;
      endDt = (endDt === 0 || endDt > elementEndDate) ? elementEndDate : endDt;
      temp.push({
        id: pid+1 + "-" +childId,
        name: element.title,
        link: element.links[0].src,
        pid: pid+1,
        startDate: elementStartDate.toISOString().substring(0, 10),
        endDate: elementEndDate.toISOString().substring(0, 10),
        realStartDate: null,
        realEndDate: null,
        description: element.description,
        formatName:'html',
      });
      childId = childId + 1;
    });
    data.push({
      id: pid+1,
      pid:0,
      name: key,
      link: '#',
      startDate: startDt.toISOString().substring(0, 10),
      endDate: endDt.toISOString().substring(0, 10),
      children: temp,
      description:'-',
      realStartDate: null,
      realEndDate: null,
      formatName:'string',
    })
    data = [...data];
  }
  return data;
}

export default {
  name: "app",
  data() {
    return {
      projectTime: {},
      data: [],
      selected: [], // 选中数据
      contextMenuOptions: [ 
        { label: "項目", prop: "name" },
        { label: "起始日期", prop: "startDate" },
        { label: "結束日期", prop: "endDate" },
        { label: "描述", prop: "description" },
      ],
      columns: [{ type: "name", minWidth: 400, colType: "expand" },
      ], 
    };
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData() { 
      axios.get('http://localhost:8010/proxy/open-api/zh-tw/Events/Activity?page=1', 
        {
          headers: {
            'accept': 'application/json',
          },
        },
          ).then(response => {
            this.data = transform(response.data.data);
          })
          .catch(error => {
            console.log("Error ========>", error);
          })
    },
    notify: function (name) {
                   Notification.success({title: "时间修改", message: name, type: "success"});
    },
    /**
     * 时间发生更改
     * row: Object 当前行数据c
     */
    timeChange(row) {
      console.log("时间修改:", row);
      this.notify(row.name);
    },
    //
    /**
     * 前置任务发生更改
     * row: Object 当前行数据
     * oldval: [String, Array] 前置修改前的旧数据
     * handle: Boolean 是否用户编辑产生的改变
     */
    preChange(row, oldval, handle) {
      console.log("前置修改:", row, oldval, handle);
    },
    // 数表展开行
    expandChange(row, expanded) {
      console.log("展开行:", row, expanded);
    },
    // 多选选择
    selectionChange(/* val */) {
      // console.log("多选：", val);
    },
    // 删除任务
    taskRemove(item) {
      console.log("删除任务：", item);
    },
    // 添加任务
    taskAdd(item) {
      console.log("添加任务：", item);
      this.$refs["wl-gantt-demo"].loadTreeAdd(item.id, [
        {
          pid: item.id,
          id: "###",
          name: "一轮新月",
          startDate: "2019-10-11",
          endDate: "2019-10-19",
        },
      ]);
    },
    // 懒加载
    lazyLoad(tree, treeNode, resolve) {
      setTimeout(() => {
        resolve([
          {
            id: "1-1-1",
            pid: tree.id,
            name: "日落云巅",
            startDate: "2019-09-10",
            endDate: "2019-09-13",
          },
        ]);
      }, 1000);
    },
  },
  components: {
    WlGantt,
  },
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 20px 25px 0;
}

.wl-gantt-demo {
  margin: 40px auto;
  // width: 800px auto;
}
</style>
