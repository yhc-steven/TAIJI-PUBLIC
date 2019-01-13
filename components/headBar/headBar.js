
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  externalClasses: ['my-class'],
  properties: {
   stylePadding:{
     type:"String",
     value:"0"
   }
  },
  data: {
   
  },
  attached() {
    // const { windowHeight } = wx.getSystemInfoSync();

    // this.setData({ height: windowHeight / 10 });
  },
  methods: {
  },
  ready(){
    const data = wx.getSystemInfoSync();
    console.log("===",data)
    this.setData({
      stylePadding:data.statusBarHeight
    })
  }
})
