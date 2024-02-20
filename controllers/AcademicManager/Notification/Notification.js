import moment from "moment"
import Notification from "../../../models/Notification.js"
import { responseObj } from "../../../util/response.js"

const getNotifications=async(req,res)=>{
  let query={
    user_id:req.user._id,
    createdAt:{
      $gte:moment().subtract(1,'month').format("YYYY-MM-DDTHH:mm:ss"),
      $lte:moment().format("YYYY-MM-DDTHH:mm:ss")
    }
  }
  if(req.query.is_read){
    query.is_read=req.query.is_read
  }
    const notifications=await Notification.find(query).sort({
      createdAt:-1
    })
    return res.json(responseObj(true,notifications,"Notifications"))
}
const getNotificationDetails=async(req,res)=>{
  const notificatioDetails=await Notification.findOneAndUpdate({
    _id:req.query.id
  },{
    $set:{
      is_read:true
    }
  })
  return res.json(responseObj(true,notificatioDetails,"Notification Details"))
}
// const clearNotification=async (req,res)=>{
//   await  Notification.deleteOne({user_id:req.user._id,_id:req.body.notification_id})
//     return res.json(responseObj(true,[],"Notifications Cleared"))
// }
export {getNotifications,getNotificationDetails}
