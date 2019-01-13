//index.js
import request from '../../core/request'
//更新个人信息
const reportUserInfo = data => request.post('wechat/updateUserInfo',{ data, header: { 'content-type': 'application/json' } })
//提交睡眠信息
const reportSleepMsg = data => request.post('wechat/addSleepRecorder',{ data, header: { 'content-type': 'application/json' } })
//获取梦境信息
const getListMsg = data => request.get('/wechat/getSleepZdList',{ data })
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    formCoverShow:false,
    value0:"",
    value1:"",
    value2:"",
    value3:"",
    value4:"",
    value5:"",
    value6:"",
    value7:"",
    subValue:[false,false,false,false,false,false,false,false,false,false,false,false],
    dreamId:'',
    deepId:'',
    modeId:"",
    nameList:['睡眠表情','睡眠时间','梦境','睡眠自评','睡眠感言','提交'],
    dreamArray:[],
    deepArray:[],
    modeArray:[]

  },
  //事件处理函数 ==测一测
  makeChoose: function(res) {
    this.setData({
      formCoverShow:true
    })
  },
  bindTimeChange(e){
    console.log(e)
    var subValue = this.data.subValue;
    subValue[e.currentTarget.dataset.id] = e.detail.value;
    this.setData({
      subValue:subValue
    })
  },

  doSubmit(openId){
    console.log("---",this.data.subValue)
    const subValue = this.data.subValue;
    var check = true;
    subValue.map((i)=>{
      console.log(i)
      if(!i) return check = false;
    })
    if(check){
      this.setData({
        formCoverShow:false
      })
      this.submitMsg(subValue,openId)
    }else{
      wx.showToast({
        title:"请完整填写",
        icon:"none",
        duration:2000
      })
    }
  },
  getuserInfo(e){
    console.log('++',e)
    if(e.detail.userInfo){
      app.global((err,{openId})=>{
        //已授权
        this.doSubmit(openId);
        var data = e.detail.userInfo;
        data.openId = openId;
        //个人信息同步更新
        reportUserInfo(data)
      })
      
    }else{
      //未授权
    }
  },
  onLoad: function () {
    app.global((err, {openId})=>{
      console.log(openId)
    })
    getListMsg().then((res)=>{
      console.log("?",res)

      this.setData({
        dreamArray:res.content.dreamArray,
        deepArray:res.content.deepArray,
        modeArray:res.content.modeArray
      })
    })
  },
  //提交睡眠信息
  submitMsg(msg,openId){
    var data = {}
    debugger
    data = {
      noonSleepRecorder:[],
      yxRecorder:[],
      sleepRecorder : {
        scTime : this.changetime(msg[0],msg[1]) ,//上床时间
        sleepTime :this.changetime(msg[2],msg[3]) ,//入睡时间
        getUpTime : this.changetime(msg[4],msg[5]),//醒来时间
        qcTime : this.changetime(msg[6],msg[7]),//起床时间
        dreamType :this.data.dreamArray[msg[8]].zdKey ,//梦境类型
        sleepDeepType : this.data.deepArray[msg[9]].zdKey ,//睡眠深浅类型
        expression : this.data.modeArray[msg[10]].zdKey  ,//心情
        evaluate : msg[11] ,//
        openId:openId
      }
    }
    console.log('===',data)
    reportSleepMsg(data).then((res)=>{
      console.log(msg)
      var that = this;
      if(res.state == 1){
        wx.navigateTo({
          url: `/pages/logs/logs?scTime=${msg[1]}&qcTime=${msg[7]}&sleepTime=${msg[3]}&getUpTime=${msg[5]}&dreamType=${1 * that.data.dreamArray[msg[8]].zdKey}&sleepDeepType=${1 * that.data.deepArray[msg[9]].zdKey}&expression=${1 * that.data.modeArray[msg[10]].zdKey}&fen=${res.content.fen}&advice=${res.content.advice}&adviceall=${res.content.adviceall}`
        })
      }else{
        wx.showModal({
          title:"提交失败",
          content:res.alertMessage,
          showCancel:false,
          complete:()=>{
            this.setData({
              formCoverShow:true
            })
          }
        })
      }
    })
   
    
  },
  //时间转毫秒
  changetime(date,time){
    var t = date + ' ' + time;
    var T = new Date(t);
    console.log('time',t,T)
    return T.getTime()
  },
  //关闭弹窗
  closeCover(){
    this.setData({
      formCoverShow:false
    })
  },
  //阻止关闭弹窗
  stopClose(){

  }
})
