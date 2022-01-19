/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: 
 * @Date: 2021-12-23 13:43:06
 * @LastEditTime: 2021-12-24 10:59:48
 */
import Vue from 'vue'
import utils from '~/plugins/utils.js'
import SysCfg from '~/plugins/SysCfg.js'
import SystemBaseApi from '~/plugins/SystemBaseApi.js'


export default ({app, route, redirect, store}, inject) => {
    Vue.prototype.$utils = utils
    Vue.prototype.$SysCfg = SysCfg
    Vue.prototype.$SystemBaseApi = SystemBaseApi
}
