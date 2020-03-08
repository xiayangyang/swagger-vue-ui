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
    // banner分类
    classifyList: [],
    // 页面底部的下拉数据
    pageData: [],
    // 页面数据查询参数
    pageQuery: {
      type: 0,
      page: 1,
      size: 10
    },
    // 商品类型
    goodsType: [],
    shop: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getClassifyData()
    this.getGoodsType()
    this.getShopList();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=1035415831,1465727770&os=2036467054,2328224179&simid=4030878874,470441821&pn=0&rn=1&di=7370&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa3.att.hudong.com%2F68%2F61%2F300000839764127060614318218_950.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类1'
      },
      {
        id: 2,
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=1906469856,4113625838&os=1062705421,520912533&simid=3285371631,209838447&pn=1&rn=1&di=8250&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa2.att.hudong.com%2F36%2F48%2F19300001357258133412489354717.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类2'
      },
      {
        id: 3,
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=3173584241,3533290860&os=1133571898,402444249&simid=3493630544,246115770&pn=2&rn=1&di=180400&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa0.att.hudong.com%2F78%2F52%2F01200000123847134434529793168.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类3'
      },
      {
        id: 4,
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=2534506313,1688529724&os=1097436471,408122739&simid=3354786982,133358663&pn=3&rn=1&di=177760&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类4'
      },
      {
        id: 5,
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=1208538952,1443328523&os=979813124,369989102&simid=62453799,522850401&pn=4&rn=1&di=9240&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa4.att.hudong.com%2F21%2F09%2F01200000026352136359091694357.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类5'
      },
      {
        id: 6,
        icon: 'http://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=4018557288,1217151095&os=786175811,213722211&simid=3476599800,394564942&pn=5&rn=1&di=11770&ln=1698&fr=&fmq=1583645701133_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=0&hs=2&objurl=http%3A%2F%2Fa0.att.hudong.com%2F27%2F10%2F01300000324235124757108108752.jpg&rpstart=0&rpnum=0&adpicid=0&force=undefined',
        txt: '分类6'
      }
    ]
    this.setData({
      classifyList
    })
  },
  getGoodsType () {
    let goodsType = [
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
      }
    ]
    this.setData({
      goodsType
    })
  }
})