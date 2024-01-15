import mongoose from "mongoose";
import moment from "moment";
const AdditionalCommentSchema=new mongoose.Schema({
    student_id:{
type:mongoose.SchemaTypes.ObjectId,
ref:'User',
required:true
    },
    comments:{
        type:String,
        required:true
    },
     createdAt: {
        type: String,
        default:()=> moment().format("YYYY-MM-DDTHH:mm"),
        required: false
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    teacher_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'User',
        required:true
    }
},{
versionKey: false})
export default mongoose.model("AdditionalComment",AdditionalCommentSchema)