import wx from './core/wx';
import request from './core/request';

// 获取openId
const decodeUserInfo = data => request.post('wechat/decodeUserInfo', { data });
// 刷新seesionKey
const getSessionKey = data => request.get('/version2/wechat/getSessionKey', { data });
const insertDateReport = data => request.post('/data/insertDateReport', { data });
const insertDateLaunch = data => request.get('/wechat/tencent/tencentCallback', { data });
// 获取手机号（解码）
const shouquanPhoneNo = data => request.post('wechat/shouquanPhoneNo', { data });


export default {

  /**
    * 静默登录 获取openId
    * @param {object} param0
    * 如果同时调用多次会请求多次接口，有待优化
    */
  global(cb) {
    if (this.data.openId) return cb(null, this.data);
    const openId = wx.getStorageSync('openId');
    const sessionKey = wx.getStorageSync('sessionKey');
    const phoneNumber = wx.getStorageSync('phoneNumber');
    if (openId) {
      this.data.openId = openId;
      this.data.sessionKey = sessionKey;
      this.data.phoneNumber = phoneNumber;
      return cb(null, this.data);
    }
    const { channelSite, relatedAppId } = this.data;
    if (this.data.logining) {
      return setTimeout(() => this.global(cb), 100);
    }
    this.data.logining = true;
    wx.login().then(({ code }) => {
      // const { state, message, content } = await decodeUserInfo({ channelSite, relatedAppId, code });
      decodeUserInfo({ code })
        .then(({ state, message, content }) => {
          if (state != 1) return cb(message);
          this.data.openId = content.openId;
          wx.setStorage({ key: 'openId', data: content.openId });
          wx.setStorage({ key: 'sessionKey', data: content.sessionKey });
          this.data.sessionKey = content.sessionKey;
          this.data.todayLoginTimes = content.todayLoginTimes;
          this.data.unionId = content.unionId || '';
          cb(null, this.data);
          this.data.logining = false;
        }).catch(err => {
          // insertDateReport({
          //   reportKey: 'login_fail',
          //   reportValue: err,
          //   ...this.data
          // });
          // wx.reportAnalytics('login_fail', {
          //   err,
          //   ...this.data
          // })
        })
    }).catch(err => cb(err));
  },

  /**
    * 上报统计数据
    * @param {string} key key值
    * @param {string} reportValue 上报次数
    */
  report(reportKey, reportValue = '1') {
    this.global((err, data) => {
      if (err) return false;
      return insertDateReport({
        clickId: data.clickId,
        reportKey,
        reportValue,
        userOpenid: data.openId,
        unionId: data.unionId,
        site: data.site,
        channelSite: data.channelSite,
        sourceType: data.sourceType,
        relatedAppId: data.relatedAppId,
        gzh: data.gzh,
        consultOpenid: data.counselorOpenId,
        scene: data.scene,
      });
    })
  },

  /**
    * 无需openId的上报统计数据
    */
  reportSync(reportKey, reportValue = '1') {
    const data = this.data;
    return insertDateReport({
      clickId: data.clickId,
      reportKey,
      reportValue,
      userOpenid: data.openId,
      unionId: data.unionId,
      site: data.site,
      channelSite: data.channelSite,
      sourceType: data.sourceType,
      relatedAppId: data.relatedAppId,
      gzh: data.gzh,
      consultOpenid: data.counselorOpenId,
      scene: data.scene,
    });
  },
  /**
   * 无需openId的ocpm
   */
  launchSync(clickName) {
    const pages = getCurrentPages();
    const { clickId, sourceFrom, channelSite, openId } = this.data;
    let advertiseUrl = '';
    if (typeof clickId == "undefined" || clickId == "" || typeof sourceFrom == "undefined" || sourceFrom == "") {
      return false;
    }
    if (pages.length > 0) {
      advertiseUrl = config.API + pages.pop().route;
    } else {
      advertiseUrl = config.API + 'pages/index/index';
    }
    const data = {
      clickId,
      clickName,  //（key）
      advertiseUrl,//（投放url）
      sourceFrom,
      channelSite
    };
    return insertDateLaunch(data);
  },

  launch(clickName) {
    // const { clickId, sourceFrom, channelSite, openId } = await this.global();
    return this.global((err, { clickId, sourceFrom, channelSite, openId }) => {
      var pages = getCurrentPages();
      let advertiseUrl = '';
      console.info(sourceFrom);
      if (typeof clickId == "undefined" || clickId == "" || typeof sourceFrom == "undefined" || sourceFrom == "") {
        return false;
      }
      if (pages.length > 0) {
        advertiseUrl = config.API + pages.pop().route;
      } else {
        advertiseUrl = config.API + 'pages/index/index';
      }
      const data = {
        clickId,
        clickName,  //（key）
        advertiseUrl,//（投放url）
        sourceFrom,
        channelSite,
        openId
      };
      return insertDateLaunch(data);
    });
  },
  /**
   * 获取手机号
   * promise =》 state 1 成功 phoneNumber 手机号， state 0 失败 message 错误信息
   */
  getPhoneNumber({ encryptedData, iv }) {
    return new Promise((resolve, reject) => {
      this.global((err, { openId, sessionKey, channelSite, relatedAppId }) => {
        // findUserPhoneNo({ openId })
        //   .then(res => {
        //     if (res.state != 1) return reject({ state: 0, message: '是否授权查询失败' });
        //     if (res.content.userAuth) return resolve({ state: 2, message: '手机已授权' });
        wx.checkSession()
          .then(res => {
            shouquanPhoneNo({ openId, encryptedData, iv, session_key: sessionKey, channelSite })
              .then(res => {
                if (res.state != 1) return reject({ state: 0, message: '解密失败' });
                const { purePhoneNumber } = JSON.parse(res.content.jiemi);
                wx.setStorage({ key: 'phoneNumber', data: purePhoneNumber });
                this.data.phoneNumber = purePhoneNumber;
                return resolve({ state: 1, phoneNumber: purePhoneNumber });
              })
              .catch(err => reject({ state: 0, message: '解密失败' }))
          })
          .catch(err => {
            wx.login()
              .then(({ code }) => {
                getSessionKey({ channelSite, relatedAppId, code })
                  .then(res => {
                    if (res.state != 1) return reject({ state: 0, message: '刷新sessionKey失败' });
                    const newSessionKey = res.content.sessionKey;
                    wx.setStorage({ key: 'sessionKey', data: newSessionKey });
                    this.data.sessionKey = newSessionKey;
                    shouquanPhoneNo({ openId, encryptedData, iv, session_key: newSessionKey, channelSite })
                      .then(res => {
                        if (res.state != 1) return reject({ state: 0, message: '解密失败' });
                        const { purePhoneNumber } = JSON.parse(res.content.jiemi);
                        wx.setStorage({ key: 'phoneNumber', data: purePhoneNumber });
                        this.data.phoneNumber = purePhoneNumber;
                        return resolve({ state: 1, phoneNumber: purePhoneNumber });
                      })
                      .catch(err => reject({ state: 0, message: '解密失败' }))
                  })
                  .catch(err => reject({ state: 0, message: '刷新sessionKey失败' }));
              })
              .catch(err => reject({ state: 0, message: '登录失败' }));
          })
        // })
        // .catch(err => reject({ state: 0, message: '是否授权查询失败' }))
      })
    })
  }
}
