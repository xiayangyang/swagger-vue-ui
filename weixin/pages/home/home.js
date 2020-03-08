// pages/home/home.js
// 小程序没有过于复杂的相对路径，这样写没问题
import http from '../../utils/http.js'
import apis from '../../config/api.js'
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // banner数据
    bannerList: [],
    // banner下方的分类
    classifyList: [],
    // 商品类型
    goodsTypeData: [],
    // 页面数据查询参数
    pageQuery: {
      // 当前页面查询的数据类型
      type: 0,
      page: 1,
      size: 10
    },
    // 页面底部的下拉数据
    pageData: [],
    // 商品id数量map
    goodsNumMap: {},
    shop: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取商户列表
    this.getShopList()
    // 初始化分类数据
    this.getClassifyData()
    // 初始化获取分类
    this.getGoodsType()
    // 获取banner
    this.getBannerList()
    // 小程序没法用async函数，页面加载时，用promise保证请求完购物车数据再请求页面商品数据
    new Promise((resolve, reject) => {
      // 获取购物车数据
      this.getShopcarData()
      resolve()
    }).then(() => {
      // 获取页面商品数据——购物车数据获取完成后再获取页面数据，方便页面中已购物数量的渲染
      this.getPageData()
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  // 页面上拉触底事件的处理函数
  onReachBottom () {

  },
  // 用户输入完成点击搜索
  confirmSearch (e) {
    console.log('点击搜索触发的事件对象', e)
    console.log('用户输入:', e.detail.value)
  },
  // 点击banner
  tapBanner (e) {
    console.log('点击banner:', e.currentTarget.dataset)
  },
  // 点击分类
  tapClassify (e) {
    console.log('点击分类:', e.currentTarget.id)
  },
  // 点击商品分类
  tapGoodsType (e) {
    console.log('点击商品分类:', e.currentTarget.dataset.type)
    let type = e.currentTarget.dataset.type
    this.setData({
      'pageQuery.type': type
    })
    this.getPageData()
  },
  // 点击商品非购物车按钮——跳转至详情页
  goGoodsDetail (e) {
    console.log('去商品详情页', e)
  },
  // 点击减少
  reduceShopcar (e) {
    console.log('购物车减少', e.target.dataset)
    let {
      id,
      index
    } = e.target.dataset
  },
  // 点击增加
  addShopcar (e) {
    console.log('购物车增加', e.target.dataset)
    let {
      id,
      index,
      surplus
    } = e.target.dataset
  },
  // 点击购物车图标增加
  addShopcar2 (e) {
    console.log('购物车增加', e.currentTarget.dataset)
    let {
      id,
      index,
      surplus
    } = e.currentTarget.dataset
  },
  // 页面加载数据
  getPageData () {
    let pageQuery = this.data.pageQuery
    let {
      type,
      page,
      size
    } = pageQuery
    let goodsNumMap = this.data.goodsNumMap
    console.log('goodsNumMap:', goodsNumMap)
    let pageData = []
    for (let i = (page - 1) * size; i < page * size; i++ ) {
      pageData.push({
        id: i,
        type,
        goodsImg: '../../images/test/2.jpg',
        title: `货物${i}`,
        desc: `货物${i}描述文字`,
        num: goodsNumMap[i] || 0,
        solded: parseInt(Math.random() * 20),
        surplus: parseInt(Math.random() * 20),
        price: parseInt(Math.random() * 100),
        oldPrice: parseInt(Math.random() * 100)
      })
    }
    let _pageData = this.data.pageData
    _pageData = page === 1 ? pageData : _pageData.concat(pageData)
    this.setData({
      pageData: _pageData
    })
  },
  // 获取购物车数据
  getShopcarData () {
    let shopcarData = [
      {
        id: 1,
        num: 3
      },
      {
        id: 2,
        num: 10
      },
      {
        id: 3,
        num: 6
      }
    ]
    let goodsNumMap = {}
    shopcarData.map(item => {
      goodsNumMap[item.id] = item.num
    })
    // 不在页面中渲染的数据，可以直接修改data
    this.data.goodsNumMap = goodsNumMap
  },
  // 获取商户列表
  getShopList: function () {
    var that = this;
    console.log(that);
    http.get({
      url: apis.home.getShopList,
      data: {},
      success: res => {},
      fail: err => {}
    })
    // let url = app.globalData.url + '/app/shop/list';
    // let data = {};
    // app.wxRequest("get", url, data, (res) => {
    //   that.setData({
    //     shop: res.data.data
    //   });
    //   console.log(that.data.shop);
    // }, (err) => {
    //   console.log(err.errMsg)
    // })
  },
  // 初始化分类数据
  getClassifyData () {
    let classifyList = [
      {
        id: 1,
        icon: '../../images/test/1.jpg',
        txt: '分类1'
      },
      {
        id: 2,
        icon: '../../images/test/2.jpg',
        txt: '分类2'
      },
      {
        id: 3,
        icon: '../../images/test/3.jpg',
        txt: '分类3'
      },
      {
        id: 4,
        icon: '../../images/test/4.jpg',
        txt: '分类4'
      },
      {
        id: 5,
        icon: '../../images/test/5.jpg',
        txt: '分类5'
      },
      {
        id: 6,
        icon: '../../images/test/6.jpg',
        txt: '分类6'
      }
    ]
    this.setData({
      classifyList
    })
  },
  // 初始化获取分类
  getGoodsType () {
    let goodsTypeData = [
      {
        type: 0,
        txt: '全部'
      },
      {
        type: 1,
        txt: '类型1'
      },
      {
        type: 2,
        txt: '类型2'
      },
      {
        type: 3,
        txt: '类型3'
      },
      {
        type: 4,
        txt: '类型4'
      },
      {
        type: 5,
        txt: '类型5'
      },
      {
        type: 6,
        txt: '类型6'
      }
    ]
    this.setData({
      goodsTypeData
    })
  },
  // 获取banner
  getBannerList () {
    let bannerList = [
      {
        id: 1,
        src: '../../images/test/7.jpg'
      },
      {
        id: 2,
        src: '../../images/test/5.jpg'
      }
    ]
    this.setData({
      bannerList
    })
  }
})