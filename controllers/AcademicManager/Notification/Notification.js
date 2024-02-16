import Notification from "../../../models/Notification.js"
import { responseObj } from "../../../util/response.js"

const getNotifications=async(req,res)=>{
    const notifications=await Notification.find({user_id:req.user._id})
    return res.json(responseObj(true,notifications,"Notifications"))
}
const clearNotification=async (req,res)=>{
  await  Notification.deleteMany({user_id:req.user._id})
    return res.json(responseObj(true,[],"Notifications Cleared"))
}
export {getNotifications,clearNotification}
