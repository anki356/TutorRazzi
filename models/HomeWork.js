import mongoose from "mongoose";
import moment from "moment";
import mongoosePaginate from 'mongoose-paginate-v2'
const HomeWorkSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true

    },
   status:{
type:String,
enum:['Pending','Done','ReUpload'],
default:'Pending'
   },
    answer_document_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"Document",
       
    },
    due_date:{
        type:String,
        required:true
    }, createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    expires:{
        type:Boolean,
        default:false
    },
class_id:{
    type:mongoose.SchemaTypes.ObjectId,
    ref:'Class',
    required:true
}
}, {
versionKey: false })
HomeWorkSchema.plugin(mongoosePaginate)
export default mongoose.model("HomeWork",HomeWorkSchema)