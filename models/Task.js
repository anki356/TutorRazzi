import mongoose from "mongoose";
import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'

const TaskSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true

    },
    class_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Class',
        required:true
    },
   status:{
type:String,
enum:['Pending','Done'],
default:'Pending'
   },
    due_date:{
        type:String,
        required:true
    }
    , createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    }

}, {
versionKey: false })
TaskSchema.plugin(mongoosePaginate)
export default mongoose.model("Task",TaskSchema)