import Notification from "../../../models/Notification"

const getNotifications=async(req,res)=>{
    const notifications=await Notification.find({user_id:req.user._id})
    return res.json(responseObj(true,notifications,"Notifications"))
}
const clearNotification=(req,res)=>{
    Notification.deleteMany({user_id:req.user._id})
}
export {getNotifications,clearNotification}
