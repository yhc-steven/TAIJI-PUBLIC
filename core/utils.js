/*
 * @Author: chip
 * @Date: 2018-02-26 16:22:55
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-31 14:17:39
 */

/**
 * object 排序
 * @param {*} obj 
 */
export function sortByKey(obj) {
  const newkey = Object.keys(obj).sort();
  const newObj = {};
  for (let i = 0; i < newkey.length; i++) {
    newObj[newkey[i]] = obj[newkey[i]];
  }
  return newObj;
}

/**
 * 分割数组
 * @param {数组} array 
 * @param {起始位置} start 
 * @param {结束位置} end 
 */
function slice(array, start, end) {
  let length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  start = start == null ? 0 : start
  end = end === undefined ? length : end

  if (start < 0) {
    start = -start > length ? 0 : (length + start)
  }
  end = end > length ? length : end
  if (end < 0) {
    end += length
  }
  length = start > end ? 0 : ((end - start) >>> 0)
  start >>>= 0

  let index = -1
  const result = new Array(length)
  while (++index < length) {
    result[index] = array[index + start]
  }
  return result
}

/**
 * 数组分页
 * @param {数组} array 
 * @param {尺寸} size 
 */
export function chunk(array, size) {
  size = Math.max(size, 0)
  const length = array == null ? 0 : array.length
  if (!length || size < 1) {
    return []
  }
  let index = 0
  let resIndex = 0
  const result = new Array(Math.ceil(length / size))

  while (index < length) {
    result[resIndex++] = slice(array, index, (index += size))
  }
  return result
}

/**
 * 判断 email 地址是否符合邮件格式
 * https://stackoverflow.com/questions/46155/how-to-validate-email-address-in-javascript
 */
export function isEmail(email) {
  var reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
}