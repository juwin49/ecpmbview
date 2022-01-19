
const utils = {
    // 防抖
    debounce (fn, time = 500) {
      let oldTime = 0
      let timer = null
      return () => {
        const nowTime = new Date()
        if (nowTime - oldTime < time) {
          if (timer) {
            clearTimeout(timer)
          }
          timer = setTimeout(() => {
            oldTime = nowTime
            fn()
          }, time)
        } else {
          // 用户重复触发，到达事件节点 还是会去执行事件
          oldTime = nowTime
          fn()
        }
      }
    },
    // 节流
    throttle (fn, threshhold = 100) {
      let timeout = null
      let start = new Date()
      return function () {
        const curr = new Date() - 0
        clearTimeout(timeout)
        if (curr - start >= threshhold) {
          fn.apply(this, arguments)
          start = curr
        } else {
          timeout = setTimeout(() => {
            fn.apply(this, arguments)
          }, threshhold)
        }
      }
    },
    // 深拷贝,使用场景：出现数据改变，视图没改变的情况下
    deepClone (target) {
      let result
      if (typeof target === 'object') {
        if (Array.isArray(target)) {
          result = []
          for (const i in target) {
            // 递归克隆数组中的每一项
            result.push(this.deepClone(target[i]))
          }
        } else if (target === null) {
          result = null
          // 判断如果当前的值是一个RegExp对象的话，直接赋值
        } else if (target.constructor === RegExp) {
          result = target
        } else {
          // 否则是普通对象，直接for in循环，递归赋值对象的所有值
          result = {}
          for (const i in target) {
            result[i] = this.deepClone(target[i])
          }
        }
        // 如果不是对象的话，就是基本数据类型，那么直接赋值
      } else {
        result = target
      }
      return result
    }
  }
  export default utils