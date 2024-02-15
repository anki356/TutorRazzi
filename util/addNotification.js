import Notification from "../models/Notification.js"

export const addNotifications=async (user_id,title,description)=>{
    const response=await Notification.insertMany({
        user_id:user_id,
        title:title,
        description:description
    })
    return response
}