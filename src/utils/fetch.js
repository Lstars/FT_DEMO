import axios from 'axios';
import { Message, MessageBox } from 'element-ui';
import store from '../store';
import { getSessionId } from '@/utils/auth';


// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API
  /*   timeout: 5000 // 请求超时时间*/
});

// request拦截器
service.interceptors.request.use(config => {
  const defaultConfig = {
    timestamp: new Date().getTime(),
    appId: "0010C2379272774D6EC087B917CE2A71438DEF90",
    signature: "8F4C4A8E9D850EDD9692DE38723D0543",
  };
  if (config.method.toUpperCase() == 'POST') {
      config.data = Object.assign(config.data, defaultConfig);
      config.data.params = JSON.stringify(config.data.params)
  } else {
    if (store.getters.sessionId) {
      config.params['sessionId'] = getSessionId();
    }
    if (!config.noAssign) {
      config.params = Object.assign(config.params, defaultConfig);
    }
  }
  return config;
}, error => {
  console.log('【REQUEST】' + error);
  Promise.reject(error);
})

// respone拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code != 0) {
      if (res.code == 1011) {
        if (res.message == '无数据') {
          return response.data;
        } else if (res.message == '数据不存在') {
          store.dispatch('FedLogOut').then(() => {
            location.reload(); // 为了重新实例化vue-router对象 避免bug
          });
        }
      }
      Message({
        message: res.message || '未知错误，请联系管理员',
        type: 'error',
        duration: 5 * 1000
      });
      // sessionId 失效
      // if (res.code == 1016) {
      //   MessageBox.confirm(res.message + '，请重新登录', '提示', {
      //     confirmButtonText: '重新登录',
      //     cancelButtonText: '取消',
      //     type: 'warning'
      //   }).then(() => {
      //     store.dispatch('FedLogOut').then(() => {
      //       location.reload(); // 为了重新实例化vue-router对象 避免bug
      //     });
      //   })
      // }
      return Promise.reject("error")
    } else {
      return response.data;
    }
  },
  error => {
    console.log('【response】' + error);
    Message({
      message: error.message,
      type: 'error',
      duration: 5000
    });
    return Promise.reject(error);
  }
)

export default service;
