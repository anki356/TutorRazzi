import mongoose from "mongoose";
import moment from "moment";
let ReminderSchema=new mongoose.Schema({
class_id:{
    type:String,required:true,
},
user_id:{
    type:mongoose.Types.ObjectId,
    ref:'User'
},
createdAt: {
    type: String,
    default: moment().format("YYYY-MM-DDTHH:mm"),
    required: false
}
},{
versionKey: false})
export default mongoose.model("Reminder",ReminderSchema)