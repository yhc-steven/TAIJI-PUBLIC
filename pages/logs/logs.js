//logs.js
const util = require('../../utils/util.js')
const app = getApp();
Page({
  data: {
    logs: [],
    userInfo: {},
    sleepTime:20,
    wakeTime: 6,
    ifClickMeng:true,//是否点击了评分语
    ops:{},
    fen:80,//评分
    ganyan:'就士大夫撒旦解放撒旦发家的萨哈',//感言
    zdKey:1,//心情需要传的zdkey
    dreamIdx:1,//梦境所选的index
    sleepDeepType:1,//睡眠等级
    advice:'天天天天天天天天天天。。。',//建议带省略
    adviceall:'',//建议全的
    nodes: [],//richtext
  },
  dreamImg:'',
  onLoad: function (ops) {
    let that = this;
    console.log(ops);
    wx.getUserInfo({
      success:function(res){
        console.log(res);
        if (ops.scTime){
          var time1 = ops.scTime.split(':')[0];
        }
        if (ops.qcTime){
          var time2 = ops.qcTime.split(':')[0];
        }
        that.setData({
          advice: ops.advice,
          nodes: [{//richtext
            name: 'div',
            attrs: {
              class: 'rich_class',
            },
            children: [{
              type: 'text',
              text: ops.adviceall
            }]
          }],
          adviceall: ops.adviceall,
          sleepTime: ops.sleepTime.split(':')[0],
          getUpTime: ops.getUpTime.split(':')[0],
          sleepDeepType: ops.sleepDeepType,
          dreamIdx:ops.dreamType,
          userInfo: res.userInfo,
          fen: ops.fen
        })

        Promise.all([that.downLoadFile(`https://xcx.sj-ys.cn/pic/img/dream_${that.data.dreamIdx}.png`)]).then((res)=>{
          that.dreamImg = res[0]
          that.beginCanvas(time1*1, time2*1);
          setTimeout(() => {
            that.buildShareImg();
          }, 1500);
        }).catch(err=>{
          console.error(err);
        })
      }
    })

  },
  onShow: function () {

  },
  clickMeng(){
    this.setData({
      ifClickMeng:false
    })
  },
  downLoadFile(url){
    return new Promise((reslove,reject)=>{
      console.log(url);
      wx.downloadFile({
        url: url, //仅为示例，并非真实的资源
        success(res) {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            reslove(res.tempFilePath);
          }
        },
        fail(err){
          reject(err);
        }
      })
    })
  },
  beginCanvas(sleep, wake) {
    this.drawTaiji(sleep, wake);
  },
  drawTaiji(sleep = 1, wake = 1) {
    // let sleep = 16; // 睡觉时间
    // let wake = 6; // 起床时间
    let that = this;
    let hu = 0;//圆弧的长度
    let xz = 0;//需要旋转的弧度
    let af = 0;//俩圆夹角
    let taijiX = 700, taijiY = 700;
    const R = 500; // 太极半径
    let r = 0;//小圆弧的半径
    let lx = 0;//左侧x
    let ly = 0;//左侧y
    let rx = 0;//右侧x
    let ry = 0;//右侧y
    let yinCors = ['rgb(0,0,0)', 'rgb(56,56,56)', 'rgb(96,96,96)', 'rgb(139,139,139)', 'rgb(190,190,190)']
    let yinCor = yinCors[this.data.sleepDeepType];
    if (wake-sleep>0){
      hu = (wake-sleep)*Math.PI*R/12;
    }else{
      hu = (wake + 24 - sleep) * Math.PI * R / 12;
    }
    af = hu/(2*R);
    r= R*Math.sin(af)/(1+Math.sin(af));
    console.log(r);
    
    lx = (r-R)*Math.sin(af);
    ly = (R-r)*Math.cos(af);
    rx = (R - r)*Math.sin(af);
    ry = (R - r)*Math.cos(af);

    // 太极图
    var ctx = wx.createCanvasContext('taiji');
    ctx.clearRect(0, 0, 1400, 1400);
    ctx.translate(taijiX, taijiY)
    if(hu<=Math.PI*R){
      ctx.beginPath();
      ctx.setFillStyle("#FFFFFF");
      ctx.arc(0, 0, R, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.setStrokeStyle(yinCor);
      ctx.setFillStyle(yinCor);
      ctx.arc(lx, ly, r, (Math.PI/2+af), 2*Math.PI);
      ctx.arc(rx,ry,r,Math.PI,(Math.PI/2-af),true);
      ctx.arc(0,0,R,(Math.PI/2-af),(Math.PI/2+af));
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.save();
      ctx.setStrokeStyle("#000000");
      ctx.arc(lx, ly, r / 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(that.dreamImg, (lx - r / 4), (ly - r / 4), r / 2, r / 2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setStrokeStyle("#000000");
      ctx.arc(rx, ry, r / 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(that.dreamImg, (rx - r / 4), (ry - r / 4), r / 2, r / 2);
      ctx.stroke();
      ctx.restore();
  
      ctx.beginPath();
      ctx.setStrokeStyle("#FFFFFF");
      let sleepTime = that.data.sleepTime >= sleep ? that.data.sleepTime : 24 + that.data.sleepTime;
      let duringTime = (sleepTime - sleep) * Math.PI / 12;
      ctx.arc(0, 0, (R + 10), (Math.PI / 2 - af), (Math.PI / 2 -af + duringTime));
      ctx.stroke();
  
      ctx.beginPath();
      ctx.setStrokeStyle("#FFFFFF");
      let sleepWake = wake >= that.data.getUpTime ? wake : 24 + wake;
      let duringTime2 = (sleepWake - that.data.getUpTime) * Math.PI / 12;
      ctx.arc(0, 0, (R + 10), (Math.PI / 2 + af - duringTime2), (Math.PI / 2 + af));
      ctx.stroke();


      function drawNumbers(ctx, radius) {
        ctx.beginPath();
        var ang;
        var num;
        ctx.font = radius * 0.15 + "px arial";
        ctx.fillStyle = "#DDDDDD";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.setLineWidth = '8';
        ctx.rotate(Math.PI-af);
        for (num = 1; num < 25; num++) {
          ang = num * Math.PI / 12;
          ctx.rotate(ang);
          ctx.translate(0, -radius * 1.1);
          ctx.fillText(((num + sleep) < 24 ? (num + sleep) : (num + sleep-24)).toString(), 0, 0);
          ctx.translate(0, radius * 1.1);
          ctx.rotate(-ang);
        }
        ctx.stroke();
      }
      drawNumbers(ctx,R);
    }else{
      let afr= Math.PI-af;
      ctx.beginPath();
      ctx.setFillStyle(yinCor);
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.setStrokeStyle('#FFFFFF');
      ctx.setFillStyle('#FFFFFF')
      ctx.arc(lx, -ly, r, (Math.PI / 2 + afr), 2 * Math.PI);
      ctx.arc(rx, -ry, r, Math.PI, (Math.PI / 2 - afr), true);
      ctx.arc(0, 0, R, (Math.PI / 2 - afr), (Math.PI / 2 + afr));
      ctx.closePath();
      ctx.stroke();
      ctx.fill();

      ctx.beginPath();
      ctx.save();
      ctx.setStrokeStyle("#000000");
      ctx.arc(lx, -ly, r / 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(that.dreamImg, (lx-r/4), (-ly-r/4),r/2,r/2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setStrokeStyle("#000000");
      ctx.arc(rx, -ry, r / 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(that.dreamImg, (rx-r/4), (-ry-r/4),r/2,r/2);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.setStrokeStyle("#FFFFFF");
      let sleepTime = that.data.sleepTime >= sleep ? that.data.sleepTime : 24 + that.data.sleepTime;
      let duringTime = (sleepTime - sleep) * Math.PI / 12;
      ctx.arc(0, 0, (R + 10), (Math.PI / 2 - afr - duringTime), (Math.PI / 2 - afr));
      ctx.stroke();

      ctx.beginPath();
      ctx.setStrokeStyle("#FFFFFF");
      let sleepWake = wake >= that.data.getUpTime ? wake : 24 + wake;
      let duringTime2 = (sleepWake - that.data.getUpTime) * Math.PI / 12;
      ctx.arc(0, 0, (R + 10), (Math.PI / 2 + afr), (Math.PI / 2 + afr + duringTime2));
      ctx.stroke();

      function drawNumbers(ctx, radius) {
        ctx.beginPath();
        var ang;
        var num;
        ctx.font = radius * 0.15 + "px arial";
        ctx.fillStyle = "#DDDDDD";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.setLineWidth = '8';
        ctx.rotate(Math.PI - afr);
        for (num = 1; num < 25; num++) {
          ang = num * Math.PI / 12;
          ctx.rotate(ang);
          ctx.translate(0, -radius * 1.1);
          ctx.fillText(((num + wake) < 24 ? (num + wake) : (num + wake - 24)).toString(), 0, 0);
          ctx.translate(0, radius * 1.1);
          ctx.rotate(-ang);
        }
        ctx.stroke();
      }
      drawNumbers(ctx, R);
    }
    ctx.draw();
    setTimeout(() => {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 1400,
        height: 1400,
        destWidth: 1400,
        destHeight: 1400,
        canvasId: 'taiji',
        success: function (res) {
          that.setData({
            imgUrl: res.tempFilePath
          })
        },
        fail: function (res) {
          console.error(res);
        }
      })
    }, 400)
  },
  buildShareImg(){
    let that = this;
    console.log(`https://xcx.sj-ys.cn/pic/mood/mood${this.data.zdKey}.png`);

    
    Promise.all([that.downLoadFile('https://xcx.sj-ys.cn/pic/img/bg.jpg'), that.downLoadFile(that.data.userInfo.avatarUrl), that.downLoadFile(that.data.userInfo.avatarUrl), that.downLoadFile('https://xcx.sj-ys.cn/pic/ewm/sjewm.png'), that.downLoadFile(`https://xcx.sj-ys.cn/pic/mood/mood${that.data.zdKey}.png`)]).then((res) => {
      //res[0]=>背景图，res[1]=>用户头像，res[2]=>太极图，res[3]=>分享的二维码图片，res[4]=>心情     
      let w = 750,h=1334;
      var ctx = wx.createCanvasContext('shareImg');
      ctx.clearRect(0, 0, 750, 1334);
      ctx.beginPath();
      ctx.drawImage(res[0], 0, 0, w, h);

      ctx.beginPath();
      ctx.save();
      ctx.setStrokeStyle("#FFFFFF");
      ctx.setLineWidth(4);
      ctx.arc(w/2, 80, 40, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(res[1], (w/2-40), 40, 80, 80);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('center');
      ctx.fillText(that.data.userInfo.nickName, w / 2, 148);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('right');
      ctx.fillText(that.data.advice, 430, 260);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(48)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('center');
      ctx.fillText(that.data.fen, 500, 215);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle("#6cb740");
      ctx.rect(468, 163, 63,65);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('center');
      ctx.fillText('综合评分', 500, 260);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.drawImage(that.data.imgUrl, 0, 296, 720, 720);
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('left');
      ctx.fillText(`感言 ${this.data.ganyan}`, 32, 1110);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle("#6cb740");
      ctx.rect(100, 1082, 460, 38);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('left');
      ctx.fillText('心情',585 , 1110);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.drawImage(res[4], 652, 1067, 50, 50);
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('left');
      ctx.fillText('关注睡觉  好好睡觉', 241, 1240);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.setFontSize(30)
      ctx.setFillStyle("#FFFFFF");
      ctx.setTextAlign('left');
      ctx.fillText('扫一扫  添加公众号', 241, 1195);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.save();
      ctx.drawImage(res[3], 559, 1147, 131, 131);
      ctx.restore();

      ctx.draw();
      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 750,
          height: 1334,
          destWidth: 375,
          destHeight: 667,
          canvasId: 'shareImg',
          success: function (res) {
            console.log(222);
            
            that.setData({
              compliedShareImg: res.tempFilePath
            })
          },
          fail: function (res) {
            console.error(res);
          }
        })
      }, 400)
    })
  },
  onShareAppMessage:function(params) {
    return {
      path:'/pages/index/index'
    }
  },
  saveImageToPhotosAlbum(){
    var that = this;
    wx.showLoading({
      title:'正在加载中。。。'
    })
    console.error(that.data.compliedShareImg)
    setTimeout(() => {
      wx.hideLoading();
      wx.saveImageToPhotosAlbum({
        filePath: that.data.compliedShareImg,
        success: function (res) {
          wx.showToast({
            title:'保存成功！'
          })
        },
        fail: function (res) {
          console.error(res)
          wx.showToast({
            title: '保存失败！'
          })
        }
      })
    }, 4000);
  }
})
