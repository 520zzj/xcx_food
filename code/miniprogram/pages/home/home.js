// miniprogram/pages/exam1/exam1.js
//初始化数据库，指定环境
const db = wx.cloud.database({
  env: "web-test-dev-e0cuo"
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    openid:"",//用户登录凭证
    list: [{ foodSeries: "本店推荐", food: [], loaded: false }, { foodSeries: "饭类", food: [], loaded: false }, { foodSeries: "姜撞奶", food: [], loaded: false }, { foodSeries: "酸奶系列", food: [], loaded: false }, { foodSeries: "招牌双皮奶系列", food: [], loaded: false }, { foodSeries: "烧仙草系列", food: [], loaded: false }, { foodSeries: "西米系列", food: [], loaded: false }, { foodSeries: "纯手工芋圆", food: [], loaded: false }, { foodSeries: "清甜糖水系列", food: [], loaded: false }, { foodSeries: "港式甜品", food: [], loaded: false }, { foodSeries: "汤圆系列", food: [], loaded: false }, { foodSeries: "桃胶雪燕系列", food: [], loaded: false }, { foodSeries: "满杯鲜奶系列", food: [], loaded: false }, { foodSeries: "茶饮系列", food: [], loaded: false }, { foodSeries: "果汁杯系列", food: [], loaded: false }, { foodSeries: "鲜咸小吃系列", food: [], loaded: false }, { foodSeries: "芝麻糊系列", food: [], loaded: false }, { foodSeries: "凉粉", food: [], loaded: false }, { foodSeries: "小吃", food: [], loaded: false }, { foodSeries: "加料区", food: [], loaded: false }],//接收后台数据
    listNew:[],//截取list下标1到最后的数组
    scrollNavId:"scrollNavId0",//导航栏的scrollId
    scrollListId:"scrollListId0",//菜单列表的scrollId 
    heightArr:[],//菜单列表的各个模块的高度累加和数组
    navActive:0,//点击导航栏的下标
    rightHeight:0,//右边scrollview容器的高度
    cut:true,//判断左右两边滚动事件执行顺序
    value:"",//搜索框当前输入的值
    show:false,//弹出框的显示和隐藏
    activeIndex:0,//当前食用方式的下标，默认为堂食
    eatType:["堂食","打包"],//食用方式
    foodId:0,//弹出层食物的id
    foodPrice:0,//弹出层食物总价格，单价*数量
    foodName:0,//弹出层食物的名称
    popNum:1,//弹出层的购买数量
    order:[],//订单
    unitPrice:"",//当前弹出层食物的单价
    allNum:0,//购物车图标显示的购买总数
    allPrice: 0,//购物车购买的总价格
    overlay:false,//遮罩层显示和隐藏
    orderList:false,//食物订单列表的显示和隐藏
    oneFoodOrder:[],//菜单列表减按钮显示的一种食物的订单列表
    oneFoodOrderShow: false//弹出层---一种食物的订单列表
  },
  //食物订单列表删除所有的订单
  delAll(){
    //调用删除所有订单的云函数来删除所有的订单
    wx.cloud.callFunction({
      name:'delAllOrder',
      data:{
        _openid:this.data.openid
      }
    }).then(res=>{
      console.log(res)
      //刷新食物订单列表
      this.getOrder().then(this.numOrderToList)
    }).catch(err=>{
      console.log(err)
    })
  },
  //点击食物，跳转到对应的食物详情页面
  toDetail(e){
    console.log(e.target.dataset.id) 
    var id=e.target.dataset.id
    wx.navigateTo({
      url: `../detail/detail?id=${id}`
    })
  },
  //聚焦时触发：跳转到搜索页面
  toSearchPage: function () {
    // 跳转到搜索页面
    wx.navigateTo({
      url: '../search/search'
    })
  },
    // 弹出层减按钮--- 一种食物的订单列表
  oneFoodDel(e){
    var id=e.target.dataset.id//获取当前订单项的id
    var num=0
    for(var i=0;i<this.data.oneFoodOrder.length;i++){//遍历onefoodorder
      if(id==this.data.oneFoodOrder[i]._id){
        num = this.data.oneFoodOrder[i].num//获取对应的id的购买数量
        num--
        this.setData({ [`oneFoodOrder[${i}].num`]:num})//设置新的数量
      }
    }
    if(num>0){//当购买数量为大于1时，执行更新操作
      db.collection('order').doc(id).update({
        data: {
          num: num
        }
      }).then(res=>{
        //更新订单列表和食物列表的num
        this.getOrder().then(this.numOrderToList)
      })
    }else{//当购买数量等于1时
      db.collection('order').doc(id).remove().then(res=>{
        //更新订单列表和食物列表的num
        this.getOrder().then(this.numOrderToList)
      })
    }
    

  },
  // 弹出层关闭--- 一种食物的订单列表
  oneFoodOrderClose(){
    this.setData({oneFoodOrderShow:false})
  },
  // 同步订单列表每条记录的购买数量和食物列表的数量
  numOrderToList(){
    return new Promise((resolve,reject)=>{
    //同步订单列表购买数量和菜单列表食物数量
    //遍历order和list
      for (var i = 0; i < this.data.list.length; i++) {
        for (var j = 0; j < this.data.list[i].food.length; j++) {
          var num = 0
          for (var v of this.data.order) {
            if (this.data.list[i].food[j].id == v.id) {
              num += v.num
            }
          }
          var item = `list[${i}].food[${j}].num`
          this.setData({ [item]: num }) 
        }
      }
      resolve()
    })
  },
  // 订单列表中的减按钮
  orderDelBtn(e){
     var orderId=e.target.dataset.orderid//每条记录的_id
     var orderNum=0
     for(var i=0;i< this.data.order.length;i++){
       if(orderId==this.data.order[i]._id){
         orderNum=this.data.order[i].num//获取对应_id 的购买数量
         orderNum--
          // this.setData({ [`order[${i}].num`]: orderNum })
       }
     }
    if (orderNum==0){//如果数量减到0，执行删除该记录的操作
        db.collection('order').doc(orderId).remove()
        .then(res=>{
          //刷新订单列表和同步菜单列表的数量
          this.getOrder().then(this.numOrderToList)
        }).catch(console.error)
     }else{
       db.collection('order').doc(orderId).update({
         data: {
           num: orderNum
         }
       }).then(res => {
        //刷新订单列表和同步菜单列表的数量
         this.getOrder().then(this.numOrderToList)
       }).catch(console.error)
     }
   
  },
  // 订单列表中加按钮
  orderAddBtn(e){
    var orderId = e.target.dataset.orderid//当前记录的_id
      var orderNum=0
      for(var v of this.data.order){
          if(orderId==v._id){
            orderNum=v.num
            //当前order对应_id的购买数量
            orderNum++
          }
      }
      db.collection('order').doc(orderId).update({
        data:{
          num:orderNum
        }
      }).then(res=>{
         //刷新订单列表和同步菜单列表的数量
        this.getOrder().then(this.numOrderToList)
      })
  },
  // 获取订单列表
  getOrder(){
    return new Promise((resolve,reject)=>{
      //根据用户登录的openid遍历各自的订单列表
      db.collection('order').where({
        _openid: this.data.openid
      }).get().then(res => {
        console.log(res)
        this.setData({ order: res.data })
        //遍历order,将总数量和总的价格显示在购物车上面
        var allNum = 0, //总数量
          allPrice = 0//总价格
        for (var v of this.data.order) {
          allNum += v.num
          allPrice = allPrice + v.num * v.unitPrice
        }
        this.setData({
          allNum: allNum,
          allPrice: allPrice
        })
        resolve() 
      })
      
    })
   
  },
  //获取openid
  getOpenid(){
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'login'
    }).then(res => {
      this.setData({openid:res.result.openid})
    }).catch(err => {
      console.log(err)
    })
  },
  //食物订单列表和遮罩层显示和隐藏
  orderListShowHide(){
      var overlay=this.data.overlay
      var orderList=this.data.orderList
      this.setData({
        overlay:!overlay,
        orderList:!orderList
      })
  },
  //关闭食物订单列表和遮罩层
  orderListHide(){
    this.setData({
      overlay:false,
      orderList:false
      })
  },
  //点击确定按钮
  //弹出层和食物列表中的已添加的数量进行合并,向数据库添加选择的订单信息,并在购物车显示总数量和总价格
  combineNum(){
    //弹出层购买数量
      var popNum=this.data.popNum
    //食物列表中已购买数量
      for(var i=0;i<this.data.list.length;i++){
          for(var j=0;j<this.data.list[i].food.length;j++){
              if(this.data.foodId==this.data.list[i].food[j].id){
                var num = this.data.list[i].food[j].num//食物列表中已购买数量
                //合并
                var foodNum=num+popNum
                //设置对应的id的list中num
                var item=`list[${i}].food[${j}].num`
                this.setData({ [item]:foodNum})
              }
          }
      }
      //获取食用方式
      var eatType=this.data.activeIndex==0?"堂食":"打包"
      //提交选择的食物信息到数据库集合order里面
    var id = this.data.foodId,
      name = this.data.foodName
      // foodPrice = this.data.foodPrice
      // console.log(id,name,foodPrice,eatType,popNum)
      //执行添加记录操作前，先执行查询记录，如果存在相同的id和eatType的记录，则更新num
      //否则就添加新记录
      db.collection('order').where({
        id: id, 
        eatType:eatType
      }).get().then(res => {
        console.log(res.data)
        if(res.data.length>0){//存在已购买记录
          db.collection('order').doc(res.data[0]._id).update({
            // data 传入需要局部更新的数据
            data: {
              num:res.data[0].num+popNum
            }
          })
            .then(result=>{
              //刷新订单列表
              this.getOrder()
            })
            .catch(console.error)
        }else{//不存在购买记录
           db.collection('order').add({
            data:{//data字段表示新增的json数据
              id: id,
              name: name,
              eatType: eatType,
              // foodPrice: foodPrice,
              unitPrice:this.data.unitPrice,
              num: popNum
            }
            }).then(res=>{
                //成功保存数据后，根据openid遍历order集合,将相关数据展示在购物车栏
                this.getOrder()
            }).catch(console.error)
        }
      })
      //关闭弹出层
      this.setData({show:false})

  },
  //食物列表中的数量减少功能 
  listDelCount(e){
    // console.log(e.target.dataset.foodid)
    //获取对应的id，遍历list根据id获取对应的num
    let foodId=e.target.dataset.foodid
    //根据foodid获取对应的order项， 保存在oneFoodOrder中，
    var oneFoodOrder=[]
    for(var v of this.data.order){
      if(foodId==v.id){
        oneFoodOrder.push(v)
      }
    }
    this.setData({
      oneFoodOrder:oneFoodOrder
      })
      console.log(oneFoodOrder)
    //如果oneFoodOrder的长度为2，显示两种规格的订单列表
    if(oneFoodOrder.length==2){
        this.setData({oneFoodOrderShow:true}) 
    }
    //如果oneFoodOrder的长度为1，直接执行减少操作
    else if(oneFoodOrder.length==1){
      if(this.data.oneFoodOrder[0].num>1){//如果购买数量大于1时，执行更新操作
        var num = this.data.oneFoodOrder[0].num
        num--
        console.log(num)
        db.collection('order').doc(this.data.oneFoodOrder[0]._id).update({
          data:{
            num: num
          }
        }).then(res=>{
          //刷新订单列表和食物列表中的购买数量
          this.getOrder().then(this.numOrderToList)
        }).catch(console.error)
      }else{//购买数量等于1时，执行删除记录操作
        db.collection('order').doc(this.data.oneFoodOrder[0]._id).remove().then(res=>{
          //刷新订单列表和食物列表中的购买数量
          this.getOrder().then(this.numOrderToList)
        }).catch(console.error)
      }
    }
     //获取对应的num
    // for (let i = 0; i < this.data.list.length; i++) {
    //   for (let j = 0; j < this.data.list[i].food.length; j++) {
    //     if (foodId == this.data.list[i].food[j].id) {
    //       let num = this.data.list[i].food[j].num//食物列表中已购买数量
    //       num--
    //       //设置对应的id的list中num
    //       let item = `list[${i}].food[${j}].num`
    //       this.setData({ [item]: num })
    //     }
    //   }
    // }
    //点击减号，在数据库order集合中删除一条记录
    // db.collection('todos').doc('todo-identifiant-aleatoire').remove()
    //   .then(console.log)
    //   .catch(console.error)
  },
  //弹出层中商品数量减功能
  delCount(){
    //获取popNum,点击一次减一
    var currentNum=this.data.popNum
    currentNum--
    //计算弹出框的foodPrice，即使弹出框的总价
    // var unitPrice = this.data.unitPrice
    // unitPrice *= currentNum
    this.setData({
      popNum: currentNum
      // foodPrice: unitPrice
    })
    //如果减到0则隐藏弹出层，并且重置popnum
    if(this.data.popNum<1){
      this.setData({show:false})
    }
  },
  // 弹出层中商品数量加功能
  addCount(){
    //获取popNum,点击一次加一
    var currentNum=this.data.popNum
    currentNum++
    //计算弹出框的foodPrice
    // var unitPrice = this.data.unitPrice
    // unitPrice*= currentNum
    this.setData({
      popNum:currentNum
      // foodPrice: unitPrice
    })
  },
  //食用方式选择 
  eatMethods(e){
    if(e.target.id==0){
      this.setData({activeIndex:0})
    }else{
      this.setData({activeIndex:1}) 
    }
  },
  //控制弹出层的显示----一种食物的规格选择
  showFoodDet(e) {  
    //获取当前食物的id，name，price
    //根据自定义属性获取当前食物的id，根据id遍历出食物的name和price
    var foodId=e.target.dataset.foodid
    for(var v of this.data.list){
        for(var value of v.food){
          if(value.id==foodId){
            var foodName=value.name
            var unitPrice=value.price
          }
        }
    }
    this.setData({ 
      show: true,  //控制弹出框的显示
      foodId:foodId,
      foodName:foodName,
      // foodPrice:foodPrice,
      unitPrice:unitPrice,
      popNum: 1,//弹出层商品数量重置为1
      activeIndex: 0  // 默认食用方式选择堂食
    });
    
    
  },
  // 控制弹出层的隐藏--一种食物的规格选择
  onClose() {
    this.setData({ show: false });
  },
  //保存heightArr
  setViewHeight:function(){
    var sum=0//求和器
    var heightArr=[]
    var navScrollTopBot=this.data.navScrollTopBot
    wx.createSelectorQuery().selectAll('.listItem').boundingClientRect(function (rects) {
      rects.forEach(function (rect) {
        sum+=rect.height  // 节点的高度的累加和
        heightArr.push(sum)//放到数组里面
      })
    }).exec()
    this.setData({//设置heightarr
      heightArr: heightArr
    })
   //设置右边容器的高度
    wx.createSelectorQuery().select('.right').boundingClientRect(rect => {
      // rect.bottom  // 节点的下边界坐标
      this.setData({
        rightHeight:rect.height
      })
    }).exec() 
  },
  //滑动菜单列表切换导航位置
  toNavside:function(event){
      // console.log(event)
      //利用scroll-view的bindscroll事件获取滚动距离（内容顶部超过容器顶部的距离）
      //获取scroll-view内各个滚动模块的高度，并累计和到数组中
      //判断滚动距离scrolltop在哪个区间，获取相应的下标
    var scrollTop = event.detail.scrollTop
    var heightArr = this.data.heightArr
    var index=0//当前的模块的下标
    if(scrollTop>=heightArr[heightArr.length-1]-this.data.rightHeight){
      return;
    }else{
      for (var i = 0; i < heightArr.length; i++) {
        if (scrollTop < heightArr[0] && scrollTop >= 0) {
          index = 0
        } else if (scrollTop >= heightArr[i - 1] && scrollTop < heightArr[i]) {
          index = i
        }
      } 
    }
   
    //将获取到的下标和侧边导航栏scroll-view里面的模块下标比较
    //如果相等，则背景变白
    this.setData({
      navActive:index
    })
    // this.getMenuList()
    //如果cut为false才执行左边scroll-view的滚动
    if(this.data.cut==false){
      this.setData({
        scrollNavId: `scrollNavId${index}`,
      })
    }
    this.data.cut = false

    
  },
  // 点击导航栏切换菜单列表位置
  toView:function(event){
    //获取点击导航栏的当前view的Id
    var id = event.target.id
    //处理本店推荐，把点在图片上获取的id设置为父元素上的id
    if (event.target.id == "scrollNavId0Image" || event.target.id == "scrollNavId0View") {
      id = "scrollNavId0"
    }
    var index=id.slice(11)
    //设置菜单列表的scroll-into-view的id
      this.setData({
        scrollListId: `scrollListId${index}`,
        navActive:index
      })
    this.data.cut = true
  },
  //获取食物列表信息
  getMenuList:function(){
    return new Promise((resolve,reject)=>{
      var num=0//计数器：计算异步函数执行情况
      for(let i=0;i<this.data.list.length;i++){
        db.collection('food').where({
          foodSeries: this.data.list[i].foodSeries
        }).get().then(res => {
          console.log(res.data)
          //把请求回来的食物信息保存到list里面
          this.setData({ [`list[${i}].food`]: res.data })
          this.setViewHeight()//设置食物列表各个模块的高度
          num++
          // console.log(num) 
          //当num==20时，所有的异步请求执行完在允许执行其他函数，抛出then
          if (num == this.data.list.length) {
            resolve()
          }
        })
      }
      
  })
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid()
    // this.getMenuList()
    //从云数据库请求回来页面数据
    Promise.all([this.getOrder(), this.getMenuList()]).then(result=>{
      this.numOrderToList()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var list = this.data.list
    this.setData({//设置除本店推荐外的左侧导航内容
      listNew: list.slice(1)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrder().then(this.numOrderToList)
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