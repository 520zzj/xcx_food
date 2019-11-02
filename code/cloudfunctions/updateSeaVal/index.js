//更新搜索值

// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
//需要传入_id和更新的搜索值sea_val
const db = cloud.database()
exports.main = async (event, context) => {
  try {
    return await db.collection('food').doc(event._id).update({
      // data 传入需要局部更新的数据
      data: {
       sea_val:event.sea_val
      }
    })
  } catch (e) {
    console.error(e)
  }
}