// pages/detail/detail.js
// 指定云开发环境
const db=wx.cloud.database({
  env: "web-test-dev-e0cuo"
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    food:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.id)
    //获取穿过来的参数id
    var id=options.id
    // 发送请求到数据库，获取该条记录的信息，并显示在页面上
    db.collection('food').where({
      _id:id
    })
    .get()
    .then(res=>{
      this.setData({food:res.data})
      console.log(this.data.food)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})