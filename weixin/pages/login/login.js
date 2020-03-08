import http from '../../utils/http.js'
import apis from '../../config/api.js'
var app = getApp();
// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: null,
    hasUserInfo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  isAuth:function(){
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res.authSetting['scope.userInfo']);
        if (!res.authSetting['scope.userInfo']) {
          console.log("====未授权====")
          that.login();
        } else {
          console.log("====已授权进行页面跳转====")
          wx.switchTab({
            url: '/pages/home/home',
          })
        }

      }
    })
  },
  onLoad: function(options) {
    this.isAuth();
    
  },
  login : function(){
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      console.log("========open-type=getUserInfo");
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    
  },

  getUserInfo: function(e) {
    var that = this;
    wx.login({
      success: function (loginRes) {
        if (loginRes) {
          //获取用户信息
          wx.getUserInfo({
            success: function (res) {
              console.log('===开始request请求');
              console.log(res);
              let data = {
                code: loginRes.code,
                signature: res.signature,
                rawData: res.rawData,
                encryptedData: res.encryptedData,
                iv: res.iv,
              }
              http.post({
                url: apis.login.submitLogin,
                data,
                success: res => {
                  if (res.code == 0) {
                    console.log(res.message);
                    wx.hideLoading();
                    wx.setStorageSync('userInfo', res.data);
                    app.globalData.userInfo = res.data;
                    wx.switchTab({
                      url: '/pages/home/home',
                    })
                  }
                }
              })
              // app.wxRequest("post", app.globalData.url + "/app/user/auth", data, (res) => {
              //   console.log(res);
              //   if (res.data.code == 0) {
              //     console.log(res.data.message);
              //     wx.hideLoading();
              //     wx.setStorageSync('userInfo', res.data.data);
              //     app.globalData.userInfo = res.data.data;
              //     wx.switchTab({
              //       url: '/pages/home/home',
              //     })
              //   }
              // }, (error) => {
              //   console.log("服务器异常");
              // })
              that.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true,
              })
            }
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  bindGetUserInfo: function(res) {
    if (res.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      wx.redirectTo({
        url: 'index/index'
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    } 
  }
})