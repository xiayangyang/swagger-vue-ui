// 导出所有请求的公共路径
export const API_URL = 'http://127.0.0.1:8887'
// 默认导出所有的接口路径：可以按照页面划分，叶可以按照模块划分
const apis = {
  // 首页
  home: {
    // 获取商户列表
    getShopList: `${API_URL}/app/shop/list`
  },
  // 商户
  merchant: {},
  // 个人中心
  user: {},
  // 登录相关
  login: {
    submitLogin: `${API_URL}/app/user/auth`
  }
}
export default apis