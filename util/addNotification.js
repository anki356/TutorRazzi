import Notification from "../models/Notification.js"

export const addNotifications=async (data)=>{
    const response=await Notification.insertMany({
        user_id:data.user_id,
        title:data.title,
        description:data.description
    })
    return response
}