
//时间戳格式转换，time需要转换的时间，fmt为需要转换的时间格式,年：yyyy，月：MM，日：dd,时：hh,分：mm,秒：ss
const dateFormat = (time, fmt) => {
  const _this = new Date(time)
  const o = {
    'M+': _this.getMonth() + 1, // 月份
    'd+': _this.getDate(), // 日
    'h+': _this.getHours(), // 小时
    'm+': _this.getMinutes(), // 分
    's+': _this.getSeconds(), // 秒
    'q+': Math.floor((_this.getMonth() + 3) / 3), // 季度
    S: _this.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (_this.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}

// 解析报文
const parsingMessage = (megString) =>{
  var index = megString.indexOf("&");
  var status = megString.substr(0, index).split("=")[1];
  var message = megString.substr(index + 1, megString.length).split("=")[1];
  if (message) {
      return ({ "status": status, "message": message });
  } else {
      return ({ "status": status, "message": '' });
  }
}

// 解析报文参数为object
function parsingParam(param) {
  var obj = new Object();
  param = param.split("&");
  for (var i in param) {
      var index = param[i].indexOf("=");
      var key = param[i].substr(0, index);
      var value = param[i].substr(index + 1, param[i].length);
      obj[key] = value
  }
  return obj;
}
/**
 * 限制长度补零
 * @param {*} num 数值
 * @param {*} len 长度
 */
 function prefixInteger(num, len) {
  return (Array(len).join(0) + num).slice(-len);
}
/**
 * 字符串相乘
 * 例如：
 * 		str="123"
 * 		num=3
 * return "123123123"
 * 
 * @param {Object} str 需要相乘的字符串
 * @param {Object} num 需要相乘的数量
 */
 function strMul(str, num) {
  return num > 1 ? str += strMul(str, --num) : str;
}



module.exports = {
  dateFormat,
  parsingMessage,
  parsingParam,
  prefixInteger,
  strMul
}