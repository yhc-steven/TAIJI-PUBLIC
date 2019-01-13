/*
 * @Author: chip
 * @Date: 2018-02-27 15:08:58
 * @Last Modified by: chip
 * @Last Modified time: 2018-03-23 17:21:37
 */
import wx from './wx';
const methods = ['get', 'post', 'put', 'delete'];

const ENV = 'https://xcx.sj-ys.cn/'

// 格式化URL
const formateUrl = url => /^http/.test(url) ? url : `${ENV}${url}`;


const req = {};
methods.forEach(method => {
  req[method] = (url, obj) => {
    const { brand, model, language, version, system, platform } = wx.getSystemInfoSync();
    let data = {};
    let header = {};
    if (obj && obj.data) {
      data = obj.data;
    }
    header = {
      // 为了兼容老接口
      "content-type": method != 'get' ? "application/x-www-form-urlencoded" : "application/json",
      "_ts": new Date().getTime(),
      brand,
      model,
      language,
      version,
      system,
      platform
    }
    // if (url.indexOf('version2') > -1) {
    //   const apiKey = 'apikey=sunlandszlcx';
    //   header['content-type'] = "application/json";
    //   if (method == 'get') {
    //     header['sig'] = encryptMD5(data, apiKey);
    //   } else {
    //     header['sig'] = md5(`${JSON.stringify(data)}${apiKey}`);
    //   }
    // }
    if (obj && obj.header) {
      header = { ...header, ...obj.header };
    }
    // if (ENV.version) {
    //   header['XReleaseVersion'] = ENV.version;
    // }
    return new Promise((resolve, reject) => {
      wx.request({
        url: formateUrl(url),
        method,
        data,
        header,
      }).then(res => resolve(res.data)).catch(err => {
        wx.reportAnalytics('request_fail', {
          url: formateUrl(url),
          header
        })
        reject(err)
      });
    })
  }
})
export default req;

