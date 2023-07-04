import Vue from 'vue'
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';

const STORAGE_KEY = 'todos-vuejs';
let todoStorage = {
  fetch: function() {
    let lists = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
    )
    lists.forEach(function(list, index) {
      list.listId = index + 1;
    })
    todoStorage.lid = lists.length;
    return lists;
  },
  save: function(lists) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists))
  },
}

Vue.component('list-row',{
  props: ['list','currentListId'],
  template: `
    <li>
      <button class="p-lists__item c-btn"
              :class="{'p-lists__item--selected': currentListId === list.listId}"
              @click="$emit('is-show-list',list)"
      >{{list.listName}}</button>
    </li>
  `
})
Vue.component('task',{
  props:['list','task','currentListId','state'],
  data: function() {
    return {
      likeIcon: {
        star: '<i class="fa-regular fa-star"></i>',
        activeStar: '<i class="fa-solid fa-star"></i>',
      },
      doneFlg: this.task.isDone
    }
  },
  computed: {
    computedList() {
      if(!this.currentListId) {
        for(let listItem of this.list) {
          let taskItem = listItem.tasks.find(task => task === this.task);
          if(taskItem) return listItem;
        }
      } else {
        return this.list;
      }
    }
  },
  methods: {
    animating() {
      setTimeout(() => {
        this.task.isDone = !this.task.isDone
      },500)
    },
  },
  template:`
    <li class="p-task">
      <div :class="{'p-task__info--isDone':task.isDone}"
           class="p-task__info c-flexBetween">
        <div class='c-check'>
          <input type="checkbox" :id="task.id + state"
                 class="c-check__box"
                 v-model="doneFlg" @change="animating">
          <label :for="task.id + state"></label>
        </div>
        <div class="p-task__main c-flexBetween">
          <div class="p-task__text">
            <h3 class="c-ellipsis u-marginB-m" @click="$emit('edit-task',task,computedList.listId)">{{ task.title }}</h3>
            <p class="c-ellipsis" @click="$emit('edit-task',task,computedList.listId)">{{ task.detail }}</p>
          </div>
          <div class="p-task__icon">
            <button class="u-marginB-l" @click="task.isLike = !task.isLike;"
                    v-html="(task.isLike)? likeIcon.activeStar: likeIcon.star"
            ></button>
            <button @click="$emit('remove-task',computedList.listId,computedList.tasks.indexOf(task))">
              <i class="fa-sharp fa-solid fa-trash-can u-fontSize--m"></i>
            </button>
          </div>
        </div>
      </div>
      <p class="p-task__time" @click="$emit('edit-task',task,computedList.listId)">{{ task.expirationDate }}</p>
    </li>
  `
})

Vue.component('complete-task-receipts',{
  props:['completeTaskToggleShow','completeTaskNum'],
  methods:{
    icon() {
      return this.completeTaskToggleShow ?
          '<i class="fa-solid fa-angle-up"></i>':
          '<i class="fa-solid fa-angle-down"></i>'
    },
  },
  template:`
    <div>
      <span>Completed ( {{ this.completeTaskNum }} )</span>
      <button @click="$emit('toggle-show-task')"
              v-html="icon()"
      ></button>
    </div>
  `
})
Vue.component('complete-num',{
  props:['completeTaskToggleShow','completeTaskNum'],
  methods:{
    icon() {
      return this.completeTaskToggleShow ?
          '<i class="fa-solid fa-angle-up"></i>':
          '<i class="fa-solid fa-angle-down"></i>'
    },
  },
  template:`
    <div class="p-completeNum">
      <span>Completed ( {{ this.completeTaskNum }} )</span>
      <button @click="$emit('toggle-show-task')"
              v-html="icon()"
      ></button>
    </div>
  `
})
Vue.component('no-contents',{
  props: ['currentListId'],
  data: function() {
    return {
      incomplete: 'タスク',
      star: 'スター付きタスク',
      isShow: false,
    }
  },
  computed: {
    showStr: function() {
      return (this.currentListId === 0)? this.star: this.incomplete;
    },
    showImg: function() {
      return (this.currentListId === 0)? 'noStar': 'noIncomplete';
    }
  },
  methods: {
    load() {
      this.isShow = true
    }
  },
  template:`
    <div class="p-noContents">
      <div class="p-noContents__img">
        <img :src="'src/img/'+showImg+'.jpg'" alt="" @load="load">
      </div>
      <b class="p-noContents__text" v-if="isShow">{{showStr}}はまだありません</b>
    </div>
  `
})

Vue.component('modal',{
  props:['parentHeight','errors'],
  methods:{
    scrollTop: function (){
      return window.scrollY
    }
  },
  template:`
    <div class="p-modal">
      <div class="p-modal__container" :style="{top: scrollTop()+'px'}">
        <div class="p-modal__inputWrap">
          <slot name="name"></slot>
          <p v-if="this.errors.length" class="p-modal__emptyText">
            <span v-for="error in errors" >{{error}}</span>
          </p>
          <slot name="other"></slot>
        </div>
      </div>
      <div class="p-modal__mask" :style="{height: parentHeight+'px'}"
           @click="$emit('hide-modal')"></div>
    </div>
  `
})
Vue.component('vuejs-datepicker',Datepicker)

Vue.component('animation-height',{
  props:['fn','name'],
  methods: {
    enter(el) {
      el.style.overflow = 'hidden'
      el.style.height = '0'
      this.fn(()=> {el.style.height = `${el.scrollHeight}px`})
    },
    leave(el) {
      el.style.overflow = 'hidden'
      el.style.height = `${el.scrollHeight}px`
      this.fn(()=> {el.style.height = 0 })
    },
    afterEnter(el) {
      el.style.height = ''
      el.style.overflow = ''
    },
    afterLeave(el) {
      el.style.height = ''
      el.style.overflow = ''
    },
  },
  template:`
  <transition :name="name"
              @enter="enter"
              @after-enter="afterEnter"
              @leave="leave"
              @after-leave="afterLeave">
    <slot></slot>     
  </transition>
  `
})
new Vue({
  el: '#app',
  data: {
    errors: [],
    currentContent: 'Todos',
    currentListId: 1,
    addList: false,
    editList:false,
    listSetUp: false,
    newListName: '',
    addTask: false,
    editTask: false,
    completeTaskToggleShow: false,
    compHeight: null,
    newTaskTitle: '',
    newTaskDetail: '',
    newExpirationDate: '',
    newTaskId: 1,
    clickListId: null,
    clickTask: [],
    selectedList: {},
    selectedTasks: [],
    disabledDates: {
      customPredictor: function (date) {
        if(date < new Date().setDate(new Date().getDate()-1)){
          return true
        }
      },
    },
    lists: [],
    initLists: [
      {
        listId: 1,
        listName: 'MyTasks',
        tasks:[],
      }
    ],
  },
  created: function() {
    // インスタンス作成時に自動的に fetch() する
    let storageList = todoStorage.fetch();
    if(!storageList.length) todoStorage.save(this.initLists);
    this.lists = todoStorage.fetch();
    this.selectedList = this.lists.find(list => list.listId === 1);
    this.selectedTasks = this.selectedList.tasks;
    let taskIds = [].concat(...this.lists.map(list => list.tasks.map(task => task.id)));
    if(taskIds.length) {
      let maxTaskId = Math.max(...taskIds);
      this.newTaskId = maxTaskId + 1;
    }
  },
  computed:{
    incompleteTaskNum() {
      let num = 0;
      for(let list of this.lists){
        switch (this.currentListId){
          case 0:
            num += list.tasks.filter(task => !task.isDone && task.isLike).length;
            break;
          case list.listId:
            num = list.tasks.filter(task => !task.isDone).length;
            break;
        }
      }
      return num;
    },
    completeTaskNum() {
      let num = 0;
      for(let list of this.lists){
        switch (this.currentListId){
          case 0:
            num += list.tasks.filter(task => task.isDone && task.isLike).length;
            break;
          case list.listId:
            num = list.tasks.filter(task => task.isDone).length;
            break;
        }
      }
      if(num === 0) this.completeTaskToggleShow = false
      return num;
    },
    description() {
      if(this.currentListId === 1) return 'デフォルトのリストは削除できません'
    },
  },
  watch: {
    // オプションを使う場合はオブジェクト形式にする
    lists: {
      // 引数はウォッチしているプロパティの変更後の値
      handler: function(lists) {
        if(!this.currentListId) this.onShowList();
        todoStorage.save(lists)
      },
      // deep オプションでネストしているデータも監視できる
      deep: true
    }
  },
  methods: {
    filterTasks(tasks, state = null) {
      switch(state) {
        case 'incomplete':
          return tasks.filter(task => task.isDone === false);
        case 'complete':
          return tasks.filter(task => task.isDone === true);
        default :
          return tasks;
      }
    },
    inputInit(str) {
      switch (str){
        case 'list':
          this.newListName = '';
          break;
        case 'task':
          this.clickTask = [];
          this.clickListId = null;
          this.newTaskTitle = '';
          this.newTaskDetail = '';
          this.newExpirationDate = '';
          break;
      }
    },
    inputText(e,str){
      switch (str){
        case 'list':
          this.newListName = e.target.value
          break;
        case 'task':
          this.newTaskTitle = e.target.value;
          break;
      }
    },
    onChoiceContent(str) {
      this.currentContent = str;
    },
    onShowList(emitList = {}){
      this.currentListId = (Object.keys(emitList).length)? emitList.listId: 0;
      this.selectedList = (Object.keys(emitList).length)? emitList: this.lists;
      this.selectedTasks = (Object.keys(emitList).length)?
          emitList.tasks:
          [].concat(...this.lists.map(list => list.tasks)).filter(task => task.isLike === true);
      this.completeTaskToggleShow = false;
    },
    onCompleteTaskToggleShow() {
      this.completeTaskToggleShow = !this.completeTaskToggleShow;
    },
    showModal(str) {
      switch(str){
        case 'list':
          this.addList = !this.addList;
          break;
        case 'editList':
          this.editList = !this.editList;
          break;
        case 'task':
          this.addTask = !this.addTask;
          break;
        case 'editTask':
          this.editTask = !this.editTask;
          break;
      }
      this.$nextTick(() => this.inputFocus());
    },
    editListReserve() {
      for(let list of this.lists){
        if(list.listId === this.currentListId) this.newListName = list.listName
      }
      this.$nextTick(() => this.listSetUp = !this.listSetUp);
      this.showModal('editList');
    },
    onEditTaskReserve(task,listId) {
      this.clickTask = task;
      this.clickListId = listId;
      this.newTaskTitle = task.title;
      this.newTaskDetail = task.detail;
      this.newExpirationDate = task.expirationDate;
      this.showModal('editTask');
    },
    inputFocus() {
      if(this.$refs.focusInputList) this.$refs.focusInputList.focus();
      if(this.$refs.focusInputTask) this.$refs.focusInputTask.focus();
    },
    onHideModal() {
      let result = this.draft();
      this.addList = false;
      this.editList = false;
      this.addTask = false;
      this.editTask = false;
      this.errors= [];
      if(!result) return;
      this.inputInit(result);
    },
    draft() {
      let result;
      if(this.addList && this.newListName) {
        result = (window.confirm('新規リストの下書きを保存しますか？'))? '':'list';
      }else if(this.addTask && (this.newTaskTitle || this.newTaskDetail)){
        result = (window.confirm('新規タスクの下書きを保存しますか？'))? '':'task';
      }
      return result;
    },
    entryAddList() {
      if(this.validRequired()) return;
      this.lists.push({
        listId: ++todoStorage.lid,
        listName: this.newListName,
        tasks: [],
      });
      this.addList = false;
      this.inputInit('list');
    },
    entryEditList() {
      if(this.validRequired()) return;
      this.lists.map(list => (list.listId === this.currentListId)?
          Object.assign(list,{listName: this.newListName}): list
      )
      this.editList = false;
      this.inputInit('list');
    },
    removeList() {
      let result = window.confirm('リストを削除しますか？');
      if(result){
        this.lists.map(list => (this.currentListId === list.listId)?
            this.lists.splice(this.lists.indexOf(list),1):
            list);
        this.listSetUp = !this.listSetUp;
        this.onShowList();
      }
    },
    entryAddTask() {
      if(this.validRequired()) return;
      this.lists.map(list => (this.currentListId === list.listId)?
          list.tasks.push({
            id: this.newTaskId,
            title: this.newTaskTitle,
            detail: this.newTaskDetail,
            isDone: false,
            isLike: false,
            specifiedDate: this.momentFilter(new Date),
            expirationDate: (this.newExpirationDate)?this.momentFilter(this.newExpirationDate):'',
          }):list);
      this.addTask = false;
      this.inputInit('task');
      this.newTaskId = ++this.newTaskId;
    },
    entryEditTask() {
      if(this.validRequired()) return;
      for(let list of this.lists){
        if(list.listId === this.clickListId){
          list.tasks.map(task => {
            (task.id === this.clickTask.id)? Object.assign(task,{
              title: this.newTaskTitle,
              detail: this.newTaskDetail,
              expirationDate: (this.newExpirationDate)?this.momentFilter(this.newExpirationDate):'',
            }): task });
        }
      }
      this.editTask = false;
      this.inputInit('task');
    },
    onRemoveTask(listId, index) {
      let result = window.confirm('タスクを削除しますか？');
      if(result) {
        this.lists.map(list => (list.listId === listId) ?
            list.tasks.splice(index, 1) : list)
      }
    },
    removeCompleteTask() {
      let result = window.confirm('完了タスクを削除しますか？');
      if(result) {
        for (let list of this.lists) {
          switch (this.currentListId) {
            case 0:
              Object.assign(list, {
                tasks: list.tasks.filter(task =>
                    (task.isLike && !task.isDone) || (!task.isLike && !task.isDone) || (!task.isLike && task.isDone))
              })
              break;
            case list.listId:
              Object.assign(list, {
                tasks: list.tasks.filter(task => !task.isDone)
              })
          }
        }
      }
      this.listSetUp = !this.listSetUp;
    },
    momentFilter(value) {
      return moment(value).format('YYYY-MM-DD');
    },
    sortDate(str, upFlg = true) {
      this.selectedTasks.sort(function(a,b){
        if(upFlg) {
          if(a[str] > b[str]) return 1;
          if(a[str] < b[str]) return -1;
          return 0;
        }else {
          if(a[str] < b[str]) return 1;
          if(a[str] > b[str]) return -1;
          return 0;
        }
      })
      this.listSetUp = !this.listSetUp;
    },
    validRequired() {
      this.errorProcess();
      return !!(this.errors.length);
    },
    errorProcess() {
      this.errors = [];
      if((this.addList || this.editList) && !this.newListName.length){
        this.errors.push('入力必須です');
      }
      if((this.addTask || this.editTask) && !this.newTaskTitle.length){
        this.errors.push('入力必須です');
      }
    },
    nextFrame(fn) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(fn))
    }
  }
})